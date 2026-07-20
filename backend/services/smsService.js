/**
 * Service SMS COHRM - Provider-agnostic SMS sending
 * Supports Africa's Talking (primary for Cameroon) and Twilio (fallback)
 */

const db = require('../config/db');

const isDevelopment = process.env.NODE_ENV === 'development';

// ============================================
// SMS LOG TABLE CREATION (auto-create if missing)
// ============================================

async function ensureSmsLogsTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS cohrm_sms_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        provider VARCHAR(50) NOT NULL COMMENT 'Provider used (africastalking, twilio, development)',
        phone_number VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
        provider_message_id VARCHAR(255) COMMENT 'Message ID from provider',
        error_message TEXT,
        retry_count INT DEFAULT 0,
        cost DECIMAL(10, 4) COMMENT 'Cost of SMS if available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sent_at TIMESTAMP NULL,
        INDEX idx_phone (phone_number),
        INDEX idx_status (status),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (error) {
    console.error('Error creating cohrm_sms_logs table:', error.message);
  }
}

// Ensure table exists on module load
ensureSmsLogsTable();

// ============================================
// PHONE NUMBER FORMATTING
// ============================================

/**
 * Format phone number for Cameroon (+237)
 * Handles: 6XXXXXXXX, 237XXXXXXXX, +237XXXXXXXX, 00237XXXXXXXX
 */
function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return null;

  // Remove all non-digit characters except leading +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');

  // Remove leading + for processing
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Remove leading 00
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }

  // If starts with 237 and has 12 digits total, it's already formatted
  if (cleaned.startsWith('237') && cleaned.length === 12) {
    return '+' + cleaned;
  }

  // If 9 digits starting with 6, 2, or 3 — it's a Cameroon local number
  if (cleaned.length === 9 && /^[623]/.test(cleaned)) {
    return '+237' + cleaned;
  }

  // If it already has a country code (not 237), return as-is with +
  if (cleaned.length >= 10) {
    return '+' + cleaned;
  }

  // Fallback: assume Cameroon
  return '+237' + cleaned;
}

// ============================================
// PROVIDER: AFRICA'S TALKING
// ============================================

let atClient = null;

function getAfricasTalkingClient() {
  if (atClient) return atClient;

  if (!process.env.AT_API_KEY || !process.env.AT_USERNAME) {
    return null;
  }

  try {
    const AfricasTalking = require('africastalking');
    atClient = AfricasTalking({
      apiKey: process.env.AT_API_KEY,
      username: process.env.AT_USERNAME
    });
    return atClient;
  } catch (error) {
    console.error('Failed to initialize Africa\'s Talking:', error.message);
    return null;
  }
}

async function sendViaAfricasTalking(phoneNumber, message) {
  const client = getAfricasTalkingClient();
  if (!client) throw new Error('Africa\'s Talking client not initialized');

  const sms = client.SMS;
  const options = {
    to: [phoneNumber],
    message: message,
  };

  // Add sender ID if configured
  if (process.env.AT_SENDER_ID) {
    options.from = process.env.AT_SENDER_ID;
  }

  const result = await sms.send(options);

  // Africa's Talking returns { SMSMessageData: { Recipients: [...] } }
  const recipient = result.SMSMessageData?.Recipients?.[0];
  if (!recipient) {
    throw new Error('No recipient data in Africa\'s Talking response');
  }

  if (recipient.status === 'Success' || recipient.statusCode === 101) {
    return {
      success: true,
      messageId: recipient.messageId,
      cost: recipient.cost,
      provider: 'africastalking'
    };
  } else {
    throw new Error(`Africa's Talking error: ${recipient.status} (code: ${recipient.statusCode})`);
  }
}

// ============================================
// PROVIDER: TWILIO
// ============================================

let twilioClient = null;

function getTwilioClient() {
  if (twilioClient) return twilioClient;

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return null;
  }

  try {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    return twilioClient;
  } catch (error) {
    console.error('Failed to initialize Twilio:', error.message);
    return null;
  }
}

async function sendViaTwilio(phoneNumber, message) {
  const client = getTwilioClient();
  if (!client) throw new Error('Twilio client not initialized');

  const result = await client.messages.create({
    body: message,
    to: phoneNumber,
    from: process.env.TWILIO_PHONE_NUMBER
  });

  if (result.sid) {
    return {
      success: true,
      messageId: result.sid,
      cost: null,
      provider: 'twilio'
    };
  } else {
    throw new Error('Twilio: no SID in response');
  }
}

// ============================================
// DEVELOPMENT MODE
// ============================================

async function sendViaDevelopment(phoneNumber, message) {
  console.log('=== COHRM SMS (Development Mode) ===');
  console.log('To:', phoneNumber);
  console.log('Message:', message.substring(0, 100) + (message.length > 100 ? '...' : ''));
  console.log('====================================');

  return {
    success: true,
    messageId: 'dev-' + Date.now(),
    cost: null,
    provider: 'development'
  };
}

// ============================================
// SMS LOGGING
// ============================================

async function logSms(phoneNumber, message, provider, status, messageId = null, errorMessage = null, cost = null) {
  try {
    const [result] = await db.query(`
      INSERT INTO cohrm_sms_logs (provider, phone_number, message, status, provider_message_id, error_message, cost, sent_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ${status === 'sent' ? 'NOW()' : 'NULL'})
    `, [provider, phoneNumber, message, status, messageId, errorMessage, cost]);
    return result.insertId;
  } catch (error) {
    console.error('Error logging SMS:', error.message);
    return null;
  }
}

// ============================================
// PROVIDER DETECTION
// ============================================

function detectProvider() {
  if (isDevelopment && !process.env.SMS_FORCE_SEND) {
    return 'development';
  }

  if (process.env.AT_API_KEY && process.env.AT_USERNAME) {
    return 'africastalking';
  }

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    return 'twilio';
  }

  return 'development';
}

// ============================================
// MAIN SEND FUNCTION
// ============================================

/**
 * Send an SMS message
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} message - SMS message content
 * @returns {Object} { success, messageId, provider, error }
 */
async function sendSMS(phoneNumber, message) {
  const formattedNumber = formatPhoneNumber(phoneNumber);
  if (!formattedNumber) {
    console.error('SMS: Invalid phone number:', phoneNumber);
    return { success: false, error: 'Invalid phone number', provider: 'none' };
  }

  const provider = detectProvider();
  let lastError = null;

  // Try up to 2 times (initial + 1 retry)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      let result;

      switch (provider) {
        case 'africastalking':
          result = await sendViaAfricasTalking(formattedNumber, message);
          break;
        case 'twilio':
          result = await sendViaTwilio(formattedNumber, message);
          break;
        case 'development':
        default:
          result = await sendViaDevelopment(formattedNumber, message);
          break;
      }

      // Log successful send
      await logSms(formattedNumber, message, result.provider, 'sent', result.messageId, null, result.cost);

      return {
        success: true,
        messageId: result.messageId,
        provider: result.provider
      };
    } catch (error) {
      lastError = error;
      console.error(`SMS send attempt ${attempt + 1} failed (${provider}):`, error.message);

      // If Africa's Talking fails on first attempt, try Twilio as fallback
      if (attempt === 0 && provider === 'africastalking' && getTwilioClient()) {
        console.log('Falling back to Twilio...');
        try {
          const result = await sendViaTwilio(formattedNumber, message);
          await logSms(formattedNumber, message, 'twilio', 'sent', result.messageId, null, result.cost);
          return {
            success: true,
            messageId: result.messageId,
            provider: 'twilio'
          };
        } catch (fallbackError) {
          console.error('Twilio fallback also failed:', fallbackError.message);
          lastError = fallbackError;
        }
      }

      // Brief pause before retry
      if (attempt === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // All attempts failed
  const errorMsg = lastError?.message || 'Unknown error';
  await logSms(formattedNumber, message, provider, 'failed', null, errorMsg);

  return {
    success: false,
    error: errorMsg,
    provider
  };
}

// ============================================
// SMS TEMPLATES (short messages for SMS)
// ============================================

const smsTemplates = {
  newRumorAssigned: (data) =>
    `[COHRM] Nouvelle rumeur ${data.rumorCode} a traiter (niveau ${data.level}). ${data.title ? data.title.substring(0, 50) : ''} - Connectez-vous pour traiter.`,

  rumorEscalated: (data) =>
    `[COHRM] Rumeur ${data.rumorCode} escaladee du niveau ${data.fromLevel} au niveau ${data.toLevel}. Action requise.`,

  rumorValidated: (data) =>
    `[COHRM] Rumeur ${data.rumorCode} validee au niveau ${data.level}. Passage au niveau ${(data.currentLevel || data.level) + 1}.`,

  riskAssessmentHigh: (data) =>
    `[COHRM] ALERTE: Rumeur ${data.rumorCode} - Risque ${data.riskLevel === 'very_high' ? 'TRES ELEVE' : 'ELEVE'}. Action immediate requise.`,

  pendingReminder: (data) =>
    `[COHRM] Rappel: ${data.pendingCount} rumeur(s) en attente de validation (niveau ${data.level}). Connectez-vous pour traiter.`,

  feedbackSent: (data) =>
    `[COHRM] Retro-information sur rumeur ${data.rumorCode}: ${data.message ? data.message.substring(0, 80) : 'Voir details en ligne.'}`
};

module.exports = {
  sendSMS,
  formatPhoneNumber,
  smsTemplates,
  detectProvider
};
