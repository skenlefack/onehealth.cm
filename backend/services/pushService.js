/**
 * Service de notifications Push (Firebase Cloud Messaging) pour COHRM
 * Gère l'envoi de notifications push via Firebase Admin SDK
 */

const db = require('../config/db');

const isDevelopment = process.env.NODE_ENV === 'development';

let firebaseAdmin = null;
let messagingService = null;

// ============================================
// FIREBASE INITIALIZATION
// ============================================

function initializeFirebase() {
  if (firebaseAdmin) return firebaseAdmin;

  try {
    const admin = require('firebase-admin');

    let credential;

    // Option 1: JSON string in env var
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        credential = admin.credential.cert(serviceAccount);
      } catch (parseError) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', parseError.message);
        return null;
      }
    }
    // Option 2: File path
    else if (process.env.FIREBASE_CREDENTIALS_PATH) {
      try {
        const serviceAccount = require(process.env.FIREBASE_CREDENTIALS_PATH);
        credential = admin.credential.cert(serviceAccount);
      } catch (fileError) {
        console.error('Failed to load Firebase credentials file:', fileError.message);
        return null;
      }
    }
    // No credentials configured
    else {
      if (!isDevelopment) {
        console.warn('Firebase: No credentials configured. Push notifications disabled.');
      }
      return null;
    }

    // Initialize only if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({ credential });
    }

    firebaseAdmin = admin;
    messagingService = admin.messaging();
    console.log('Firebase Admin SDK initialized successfully');
    return firebaseAdmin;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message);
    return null;
  }
}

// Try to initialize on module load
initializeFirebase();

// ============================================
// DEVICE TOKEN MANAGEMENT
// ============================================

/**
 * Register a device token for a user
 */
async function registerDeviceToken(userId, token, platform, deviceInfo = null) {
  try {
    // Upsert: update if token exists, insert if not
    await db.query(`
      INSERT INTO cohrm_device_tokens (user_id, token, platform, device_info, is_active, updated_at)
      VALUES (?, ?, ?, ?, TRUE, NOW())
      ON DUPLICATE KEY UPDATE
        user_id = VALUES(user_id),
        platform = VALUES(platform),
        device_info = VALUES(device_info),
        is_active = TRUE,
        updated_at = NOW()
    `, [userId, token, platform, deviceInfo]);

    return { success: true };
  } catch (error) {
    console.error('Error registering device token:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Unregister a device token
 */
async function unregisterDeviceToken(token) {
  try {
    await db.query(`
      UPDATE cohrm_device_tokens SET is_active = FALSE, updated_at = NOW()
      WHERE token = ?
    `, [token]);
    return { success: true };
  } catch (error) {
    console.error('Error unregistering device token:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Get active device tokens for a user
 */
async function getUserDeviceTokens(userId) {
  try {
    const [tokens] = await db.query(`
      SELECT token, platform FROM cohrm_device_tokens
      WHERE user_id = ? AND is_active = TRUE
      ORDER BY updated_at DESC
    `, [userId]);
    return tokens;
  } catch (error) {
    console.error('Error getting user device tokens:', error.message);
    return [];
  }
}

// ============================================
// PUSH NOTIFICATION SENDING
// ============================================

/**
 * Send push notification to a single device token
 * @param {string} deviceToken - FCM device token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data payload
 * @returns {Object} { success, messageId, error }
 */
async function sendPushNotification(deviceToken, title, body, data = {}) {
  // Development mode: just log
  if (isDevelopment && !process.env.PUSH_FORCE_SEND) {
    console.log('=== COHRM PUSH (Development Mode) ===');
    console.log('Token:', deviceToken.substring(0, 20) + '...');
    console.log('Title:', title);
    console.log('Body:', body);
    console.log('Data:', JSON.stringify(data));
    console.log('======================================');
    return { success: true, messageId: 'dev-push-' + Date.now() };
  }

  if (!messagingService) {
    initializeFirebase();
    if (!messagingService) {
      console.warn('Push: Firebase not initialized. Skipping notification.');
      return { success: false, error: 'Firebase not initialized' };
    }
  }

  const message = {
    token: deviceToken,
    notification: {
      title,
      body
    },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)])
    ),
    android: {
      priority: 'high',
      notification: {
        channelId: 'cohrm_alerts',
        icon: 'ic_notification',
        color: '#FF5722'
      }
    },
    apns: {
      payload: {
        aps: {
          alert: { title, body },
          sound: 'default',
          badge: 1
        }
      }
    }
  };

  try {
    const response = await messagingService.send(message);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Push notification error:', error.message);

    // If token is invalid/expired, deactivate it
    if (
      error.code === 'messaging/invalid-registration-token' ||
      error.code === 'messaging/registration-token-not-registered'
    ) {
      await unregisterDeviceToken(deviceToken);
      console.log('Deactivated invalid token:', deviceToken.substring(0, 20) + '...');
    }

    return { success: false, error: error.message };
  }
}

/**
 * Send push notification to all devices of a user
 * @param {number} userId - User ID
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data payload
 * @returns {Object} { success, results }
 */
async function sendPushToUser(userId, title, body, data = {}) {
  const tokens = await getUserDeviceTokens(userId);

  if (tokens.length === 0) {
    return { success: true, results: [], message: 'No device tokens registered' };
  }

  const results = [];
  for (const { token } of tokens) {
    const result = await sendPushNotification(token, title, body, data);
    results.push({ token: token.substring(0, 20) + '...', ...result });
  }

  const anySuccess = results.some(r => r.success);
  return { success: anySuccess, results };
}

/**
 * Send push notification to a topic (broadcast)
 * @param {string} topic - FCM topic name
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data payload
 * @returns {Object} { success, messageId, error }
 */
async function sendPushToTopic(topic, title, body, data = {}) {
  // Development mode
  if (isDevelopment && !process.env.PUSH_FORCE_SEND) {
    console.log('=== COHRM PUSH TOPIC (Development Mode) ===');
    console.log('Topic:', topic);
    console.log('Title:', title);
    console.log('Body:', body);
    console.log('=============================================');
    return { success: true, messageId: 'dev-topic-' + Date.now() };
  }

  if (!messagingService) {
    initializeFirebase();
    if (!messagingService) {
      return { success: false, error: 'Firebase not initialized' };
    }
  }

  const message = {
    topic,
    notification: { title, body },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)])
    ),
    android: {
      priority: 'high',
      notification: {
        channelId: 'cohrm_alerts',
        icon: 'ic_notification',
        color: '#FF5722'
      }
    },
    apns: {
      payload: {
        aps: {
          alert: { title, body },
          sound: 'default'
        }
      }
    }
  };

  try {
    const response = await messagingService.send(message);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Push topic notification error:', error.message);
    return { success: false, error: error.message };
  }
}

// ============================================
// PUSH NOTIFICATION TEMPLATES
// ============================================

const pushTemplates = {
  newRumorAssigned: (data) => ({
    title: 'Nouvelle rumeur a traiter',
    body: `Rumeur ${data.rumorCode} - ${data.title ? data.title.substring(0, 60) : 'Niveau ' + data.level}`,
    data: {
      type: 'new_rumor',
      rumor_id: data.rumorId,
      rumor_code: data.rumorCode,
      screen: 'rumor_detail'
    }
  }),

  rumorEscalated: (data) => ({
    title: 'Rumeur escaladee',
    body: `${data.rumorCode} escaladee vers niveau ${data.toLevel}. Action requise.`,
    data: {
      type: 'escalation',
      rumor_id: data.rumorId,
      rumor_code: data.rumorCode,
      screen: 'rumor_detail'
    }
  }),

  rumorValidated: (data) => ({
    title: 'Rumeur validee',
    body: `${data.rumorCode} validee au niveau ${data.level}.`,
    data: {
      type: 'validation',
      rumor_id: data.rumorId,
      rumor_code: data.rumorCode,
      screen: 'rumor_detail'
    }
  }),

  riskLevelChanged: (data) => ({
    title: `Alerte risque ${data.riskLevel === 'very_high' ? 'TRES ELEVE' : 'ELEVE'}`,
    body: `Rumeur ${data.rumorCode} - Niveau de risque: ${data.riskLevel === 'very_high' ? 'Tres eleve' : 'Eleve'}`,
    data: {
      type: 'risk_alert',
      rumor_id: data.rumorId,
      rumor_code: data.rumorCode,
      risk_level: data.riskLevel,
      screen: 'rumor_detail'
    }
  }),

  validationCompleted: (data) => ({
    title: 'Validation terminee',
    body: `Rumeur ${data.rumorCode} a complete tous les niveaux de validation.`,
    data: {
      type: 'validation_completed',
      rumor_id: data.rumorId,
      rumor_code: data.rumorCode,
      screen: 'rumor_detail'
    }
  }),

  feedbackSent: (data) => ({
    title: 'Retro-information recue',
    body: `Rumeur ${data.rumorCode}: ${data.feedbackType || 'Mise a jour'}`,
    data: {
      type: 'feedback',
      rumor_id: data.rumorId,
      rumor_code: data.rumorCode,
      screen: 'rumor_detail'
    }
  })
};

module.exports = {
  sendPushNotification,
  sendPushToUser,
  sendPushToTopic,
  registerDeviceToken,
  unregisterDeviceToken,
  getUserDeviceTokens,
  pushTemplates,
  initializeFirebase
};
