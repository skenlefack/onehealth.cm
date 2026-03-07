-- =====================================================
-- Migration: Table des notifications COHRM
-- Permet de suivre les notifications envoyées
-- =====================================================

-- Table des notifications
CREATE TABLE IF NOT EXISTS cohrm_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Références
  rumor_id INT COMMENT 'Rumeur concernée (optionnel)',
  user_id INT COMMENT 'Utilisateur destinataire (optionnel)',

  -- Type de notification
  notification_type ENUM(
    'new_rumor',           -- Nouvelle rumeur à traiter
    'escalation',          -- Rumeur escaladée
    'validation',          -- Rumeur validée
    'rejection',           -- Rumeur rejetée
    'risk_assessment',     -- Évaluation des risques
    'reminder',            -- Rappel de validation en attente
    'feedback',            -- Rétro-information
    'system'               -- Notification système
  ) NOT NULL,

  -- Canal de communication
  channel ENUM('email', 'sms', 'system', 'push') DEFAULT 'email',

  -- Destinataire
  recipient_email VARCHAR(200) COMMENT 'Email du destinataire',
  recipient_phone VARCHAR(50) COMMENT 'Téléphone du destinataire (pour SMS)',

  -- Contenu
  subject VARCHAR(255) COMMENT 'Sujet de la notification',
  message TEXT COMMENT 'Message de la notification',

  -- Statut d'envoi
  status ENUM('pending', 'sent', 'delivered', 'failed', 'cancelled') DEFAULT 'pending',

  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  sent_at DATETIME COMMENT 'Date d\'envoi',
  delivered_at DATETIME COMMENT 'Date de livraison (si tracking disponible)',

  -- Erreurs
  error_message TEXT COMMENT 'Message d\'erreur en cas d\'échec',
  retry_count INT DEFAULT 0 COMMENT 'Nombre de tentatives d\'envoi',

  -- Métadonnées
  metadata JSON COMMENT 'Données supplémentaires (template, variables, etc.)',

  -- Index pour les recherches fréquentes
  INDEX idx_rumor (rumor_id),
  INDEX idx_user (user_id),
  INDEX idx_type (notification_type),
  INDEX idx_status (status),
  INDEX idx_created (created_at),
  INDEX idx_channel_status (channel, status),

  -- Clés étrangères
  FOREIGN KEY (rumor_id) REFERENCES cohrm_rumors(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table des préférences de notification par utilisateur
-- =====================================================

CREATE TABLE IF NOT EXISTS cohrm_notification_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,

  -- Préférences par type de notification
  notify_new_rumor TINYINT(1) DEFAULT 1,
  notify_escalation TINYINT(1) DEFAULT 1,
  notify_validation TINYINT(1) DEFAULT 1,
  notify_rejection TINYINT(1) DEFAULT 1,
  notify_risk_assessment TINYINT(1) DEFAULT 1,
  notify_reminder TINYINT(1) DEFAULT 1,
  notify_feedback TINYINT(1) DEFAULT 1,

  -- Canaux préférés
  prefer_email TINYINT(1) DEFAULT 1,
  prefer_sms TINYINT(1) DEFAULT 0,
  prefer_push TINYINT(1) DEFAULT 0,

  -- Fréquence des rappels
  reminder_frequency ENUM('none', 'daily', 'twice_daily', 'weekly') DEFAULT 'daily',

  -- Heures de réception (pour éviter les notifications nocturnes)
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '07:00:00',
  respect_quiet_hours TINYINT(1) DEFAULT 1,

  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY unique_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Vue pour les statistiques de notifications
-- =====================================================

CREATE OR REPLACE VIEW cohrm_notifications_stats AS
SELECT
  DATE(created_at) as date,
  notification_type,
  channel,
  status,
  COUNT(*) as count
FROM cohrm_notifications
GROUP BY DATE(created_at), notification_type, channel, status;

-- =====================================================
-- Paramètres de notification par défaut
-- =====================================================

INSERT IGNORE INTO cohrm_settings (`key`, value, description) VALUES
('notifications_enabled', 'true', 'Activer les notifications COHRM'),
('notification_email_from', 'cohrm@onehealth.cm', 'Adresse email d\'envoi des notifications'),
('notification_reminder_time', '09:00', 'Heure d\'envoi des rappels quotidiens'),
('notification_escalation_delay', '24', 'Délai en heures avant notification d\'escalade automatique'),
('notification_high_risk_immediate', 'true', 'Notification immédiate pour les risques élevés');
