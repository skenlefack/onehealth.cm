-- =====================================================
-- Migration: Table d'assignation des validateurs COHRM
-- Permet d'assigner des utilisateurs aux niveaux de validation
-- =====================================================

-- Table des assignations de validation
CREATE TABLE IF NOT EXISTS cohrm_validation_assignees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT 'Utilisateur assigné',

  -- Niveau de validation (1-5)
  validation_level INT NOT NULL COMMENT '1=Collecte, 2=Vérification, 3=Évaluation, 4=Coordination, 5=Supervision',

  -- Zone géographique (optionnel - pour filtrer par région/département)
  region VARCHAR(100) COMMENT 'Région assignée (null = toutes les régions)',
  department VARCHAR(100) COMMENT 'Département assigné (null = tout le département)',

  -- Rôle et permissions
  can_validate TINYINT(1) DEFAULT 1 COMMENT 'Peut valider les rumeurs',
  can_reject TINYINT(1) DEFAULT 1 COMMENT 'Peut rejeter les rumeurs',
  can_escalate TINYINT(1) DEFAULT 1 COMMENT 'Peut escalader les rumeurs',
  can_assess_risk TINYINT(1) DEFAULT 1 COMMENT 'Peut évaluer les risques',
  can_send_feedback TINYINT(1) DEFAULT 1 COMMENT 'Peut envoyer des rétro-informations',

  -- Notifications
  notify_email TINYINT(1) DEFAULT 1 COMMENT 'Recevoir les notifications par email',
  notify_sms TINYINT(1) DEFAULT 0 COMMENT 'Recevoir les notifications par SMS',

  -- Métadonnées
  notes TEXT COMMENT 'Notes sur cette assignation',
  is_active TINYINT(1) DEFAULT 1,
  assigned_by INT COMMENT 'Utilisateur qui a fait l\'assignation',
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Contraintes
  INDEX idx_user (user_id),
  INDEX idx_level (validation_level),
  INDEX idx_region (region),
  INDEX idx_active (is_active),
  UNIQUE KEY unique_user_level_region (user_id, validation_level, region, department),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Index supplémentaire pour les requêtes fréquentes
-- =====================================================

-- Index composé pour rechercher les assignés par niveau et région
ALTER TABLE cohrm_validation_assignees
  ADD INDEX idx_level_region (validation_level, region, is_active);

-- =====================================================
-- Vue pour faciliter les requêtes d'assignation
-- =====================================================

CREATE OR REPLACE VIEW cohrm_validation_assignees_view AS
SELECT
  va.id,
  va.validation_level,
  va.region,
  va.department,
  va.can_validate,
  va.can_reject,
  va.can_escalate,
  va.can_assess_risk,
  va.can_send_feedback,
  va.notify_email,
  va.notify_sms,
  va.is_active,
  va.assigned_at,
  u.id as user_id,
  u.username,
  u.email,
  u.first_name,
  u.last_name,
  CONCAT(u.first_name, ' ', u.last_name) as full_name,
  u.avatar,
  u.role as user_role,
  ab.username as assigned_by_username,
  CONCAT(ab.first_name, ' ', ab.last_name) as assigned_by_name
FROM cohrm_validation_assignees va
JOIN users u ON va.user_id = u.id
LEFT JOIN users ab ON va.assigned_by = ab.id
WHERE va.is_active = 1;
