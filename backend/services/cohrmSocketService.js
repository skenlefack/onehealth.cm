/**
 * COHRM Socket.IO Service
 * Gère les connexions WebSocket pour les notifications en temps réel
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

let io = null;

/**
 * Initialise Socket.IO sur le serveur HTTP
 * @param {http.Server} server - Instance du serveur HTTP
 */
const initialize = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
        'https://onehealth.cm',
        'https://www.onehealth.cm',
        'https://admin.onehealth.cm',
        ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : []),
      ],
      credentials: true,
    },
    path: '/socket.io',
  });

  // Namespace COHRM
  const cohrmNs = io.of('/cohrm');

  // Middleware d'authentification JWT
  cohrmNs.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'onehealth-secret-key');
      const [users] = await db.query('SELECT id, username, first_name, last_name, role FROM users WHERE id = ?', [decoded.id]);
      if (users.length === 0) {
        return next(new Error('User not found'));
      }
      socket.user = users[0];

      // Récupérer le niveau acteur COHRM
      const [actors] = await db.query(
        'SELECT actor_level, region, department FROM cohrm_actors WHERE user_id = ? AND is_active = 1',
        [decoded.id]
      );
      socket.actor = actors[0] || null;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  // Gestion des connexions
  cohrmNs.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`[COHRM Socket] User ${socket.user.username} connected (id: ${userId})`);

    // Rejoindre les rooms personnelles
    socket.join(`user:${userId}`);
    socket.join(`role:${socket.user.role}`);

    if (socket.actor) {
      socket.join(`level:${socket.actor.actor_level}`);
      if (socket.actor.region) {
        socket.join(`region:${socket.actor.region}`);
      }
    }

    // Admin rejoint toutes les rooms d'admin
    if (socket.user.role === 'admin') {
      socket.join('admins');
      socket.join('supervisors');
    }

    // Envoyer le nombre de notifications non lues à la connexion
    getUnreadCount(userId).then(count => {
      socket.emit('notifications:unread-count', { count });
    });

    // Marquer une notification comme lue
    socket.on('notification:read', async (data) => {
      try {
        await db.query(
          'UPDATE cohrm_notifications SET status = ? WHERE id = ? AND user_id = ?',
          ['delivered', data.id, userId]
        );
        const count = await getUnreadCount(userId);
        socket.emit('notifications:unread-count', { count });
      } catch (err) {
        console.error('[COHRM Socket] Error marking notification read:', err);
      }
    });

    // Marquer toutes comme lues
    socket.on('notifications:read-all', async () => {
      try {
        await db.query(
          "UPDATE cohrm_notifications SET status = 'delivered' WHERE user_id = ? AND status IN ('pending', 'sent')",
          [userId]
        );
        socket.emit('notifications:unread-count', { count: 0 });
      } catch (err) {
        console.error('[COHRM Socket] Error marking all read:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[COHRM Socket] User ${socket.user.username} disconnected`);
    });
  });

  console.log('[COHRM Socket] Socket.IO initialized');
  return io;
};

/**
 * Compte les notifications non lues d'un utilisateur
 */
const getUnreadCount = async (userId) => {
  const [rows] = await db.query(
    "SELECT COUNT(*) as count FROM cohrm_notifications WHERE user_id = ? AND status IN ('pending', 'sent')",
    [userId]
  );
  return rows[0]?.count || 0;
};

/**
 * Émet un événement à des destinataires spécifiques
 */
const emit = (event, data, targets = {}) => {
  if (!io) return;
  const cohrmNs = io.of('/cohrm');

  if (targets.userId) {
    cohrmNs.to(`user:${targets.userId}`).emit(event, data);
  }
  if (targets.level) {
    cohrmNs.to(`level:${targets.level}`).emit(event, data);
  }
  if (targets.region) {
    cohrmNs.to(`region:${targets.region}`).emit(event, data);
  }
  if (targets.role) {
    cohrmNs.to(`role:${targets.role}`).emit(event, data);
  }
  if (targets.broadcast) {
    cohrmNs.emit(event, data);
  }
};

/**
 * Crée et émet une notification en temps réel
 */
const notify = async (type, data, targets = {}) => {
  if (!io) return;

  // Déterminer les destinataires
  let userIds = [];

  if (targets.userId) {
    userIds = [targets.userId];
  } else if (targets.level) {
    const [actors] = await db.query(
      'SELECT user_id FROM cohrm_actors WHERE actor_level >= ? AND is_active = 1' +
      (targets.region ? ' AND region = ?' : ''),
      targets.region ? [targets.level, targets.region] : [targets.level]
    );
    userIds = actors.map(a => a.user_id);
  } else if (targets.role === 'admin') {
    const [admins] = await db.query("SELECT id FROM users WHERE role = 'admin'");
    userIds = admins.map(a => a.id);
  }

  // Stocker et émettre pour chaque destinataire
  for (const userId of userIds) {
    try {
      const [result] = await db.query(
        `INSERT INTO cohrm_notifications (rumor_id, user_id, notification_type, channel, subject, message, status, metadata)
         VALUES (?, ?, ?, 'system', ?, ?, 'sent', ?)`,
        [
          data.rumorId || null,
          userId,
          type,
          data.title || type,
          data.message || '',
          JSON.stringify(data.metadata || {}),
        ]
      );

      const notification = {
        id: result.insertId,
        type,
        title: data.title,
        message: data.message,
        rumor_id: data.rumorId,
        metadata: data.metadata,
        created_at: new Date().toISOString(),
      };

      emit('notification:new', notification, { userId });
    } catch (err) {
      console.error(`[COHRM Socket] Error creating notification for user ${userId}:`, err);
    }
  }
};

/**
 * Événements de notification prédéfinis
 */
const events = {
  rumorCreated: (rumor) => notify('new_rumor', {
    title: `Nouvelle rumeur: ${rumor.code}`,
    message: `${rumor.title || rumor.description?.substring(0, 100)}`,
    rumorId: rumor.id,
    metadata: { code: rumor.code, region: rumor.region, priority: rumor.priority },
  }, { level: 1, region: rumor.region }),

  rumorUpdated: (rumor, userId) => notify('system', {
    title: `Rumeur mise à jour: ${rumor.code}`,
    message: `Statut: ${rumor.status}`,
    rumorId: rumor.id,
    metadata: { code: rumor.code, status: rumor.status },
  }, { userId }),

  rumorAssigned: (rumor, userId) => notify('new_rumor', {
    title: `Rumeur assignée: ${rumor.code}`,
    message: `Vous avez été assigné à la rumeur ${rumor.code}`,
    rumorId: rumor.id,
    metadata: { code: rumor.code },
  }, { userId }),

  validationRequired: (rumor, level) => notify('escalation', {
    title: `Validation requise: ${rumor.code}`,
    message: `La rumeur ${rumor.code} attend une validation de niveau ${level}`,
    rumorId: rumor.id,
    metadata: { code: rumor.code, level },
  }, { level, region: rumor.region }),

  validationCompleted: (rumor, action, userId) => notify('validation', {
    title: `Validation ${action}: ${rumor.code}`,
    message: `La rumeur ${rumor.code} a été ${action}`,
    rumorId: rumor.id,
    metadata: { code: rumor.code, action },
  }, { userId }),

  riskAlert: (rumor) => notify('risk_assessment', {
    title: `Alerte risque élevé: ${rumor.code}`,
    message: `Risque ${rumor.risk_level} détecté pour ${rumor.code}`,
    rumorId: rumor.id,
    metadata: { code: rumor.code, risk_level: rumor.risk_level },
  }, { level: 4 }),

  feedbackReceived: (rumor, userId) => notify('feedback', {
    title: `Feedback reçu: ${rumor.code}`,
    message: `Nouveau feedback sur la rumeur ${rumor.code}`,
    rumorId: rumor.id,
    metadata: { code: rumor.code },
  }, { userId }),
};

module.exports = {
  initialize,
  emit,
  notify,
  events,
  getIO: () => io,
};
