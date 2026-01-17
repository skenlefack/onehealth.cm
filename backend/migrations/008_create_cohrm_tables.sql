-- =====================================================
-- Migration: COHRM-SYSTEM Tables
-- Cameroon One Health Rumor Management System
-- Tables pour la gestion des rumeurs sanitaires
-- =====================================================

-- Table principale des rumeurs
CREATE TABLE IF NOT EXISTS cohrm_rumors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL COMMENT 'Code unique de la rumeur (RUM-YYYYMM-XXXX)',
  title VARCHAR(500) NOT NULL COMMENT 'Titre/Résumé de la rumeur',
  description TEXT COMMENT 'Description détaillée',

  -- Source
  source ENUM('sms', 'web', 'mobile', 'direct', 'hotline', 'media', 'social') DEFAULT 'direct' COMMENT 'Source du signalement',
  source_details TEXT COMMENT 'Détails sur la source (URL, numéro, etc.)',

  -- Localisation
  region VARCHAR(100) COMMENT 'Région du Cameroun',
  department VARCHAR(100) COMMENT 'Département',
  district VARCHAR(100) COMMENT 'District de santé',
  location VARCHAR(500) COMMENT 'Localité précise',
  latitude DECIMAL(10, 8) COMMENT 'Latitude GPS',
  longitude DECIMAL(11, 8) COMMENT 'Longitude GPS',

  -- Informations sanitaires
  species VARCHAR(100) COMMENT 'Espèce concernée (humain, bovin, etc.)',
  symptoms TEXT COMMENT 'Symptômes observés',
  affected_count INT COMMENT 'Nombre de cas/animaux affectés',
  dead_count INT COMMENT 'Nombre de décès/morts',

  -- Classification
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium' COMMENT 'Niveau de priorité',
  status ENUM('pending', 'investigating', 'confirmed', 'false_alarm', 'closed') DEFAULT 'pending' COMMENT 'Statut de la rumeur',

  -- Suivi
  assigned_to INT COMMENT 'Utilisateur assigné',
  verification_notes TEXT COMMENT 'Notes de vérification',
  response_actions TEXT COMMENT 'Actions de réponse entreprises',

  -- Reporter
  reporter_name VARCHAR(200) COMMENT 'Nom du déclarant',
  reporter_phone VARCHAR(50) COMMENT 'Téléphone du déclarant',
  reporter_type ENUM('community', 'health_worker', 'vet', 'official', 'agent', 'anonymous') DEFAULT 'anonymous' COMMENT 'Type de déclarant',
  reported_by INT COMMENT 'Utilisateur qui a enregistré',
  device_id VARCHAR(100) COMMENT 'ID de l appareil mobile',

  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  closed_at DATETIME COMMENT 'Date de clôture',

  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_region (region),
  INDEX idx_source (source),
  INDEX idx_created (created_at),
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Historique des actions sur les rumeurs
CREATE TABLE IF NOT EXISTS cohrm_rumor_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rumor_id INT NOT NULL,
  user_id INT,
  action VARCHAR(100) NOT NULL COMMENT 'Type d action (created, status_change, assigned, etc.)',
  details TEXT COMMENT 'Détails de l action',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_rumor (rumor_id),
  FOREIGN KEY (rumor_id) REFERENCES cohrm_rumors(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notes sur les rumeurs
CREATE TABLE IF NOT EXISTS cohrm_rumor_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rumor_id INT NOT NULL,
  user_id INT,
  content TEXT NOT NULL,
  is_private TINYINT(1) DEFAULT 0 COMMENT 'Note privée (visible uniquement par l auteur)',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_rumor (rumor_id),
  FOREIGN KEY (rumor_id) REFERENCES cohrm_rumors(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Photos des rumeurs
CREATE TABLE IF NOT EXISTS cohrm_rumor_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rumor_id INT NOT NULL,
  url VARCHAR(500) NOT NULL,
  caption VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_rumor (rumor_id),
  FOREIGN KEY (rumor_id) REFERENCES cohrm_rumors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Codes SMS pour les agents communautaires
CREATE TABLE IF NOT EXISTS cohrm_sms_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  label_fr VARCHAR(200) NOT NULL,
  label_en VARCHAR(200),
  category ENUM('event', 'symptom', 'species', 'location') NOT NULL,
  description TEXT,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_category (category),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Logs des SMS reçus
CREATE TABLE IF NOT EXISTS cohrm_sms_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender VARCHAR(50) COMMENT 'Numéro de téléphone',
  message TEXT NOT NULL,
  rumor_id INT COMMENT 'Rumeur créée si applicable',
  status ENUM('received', 'processed', 'invalid_format', 'error') DEFAULT 'received',
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_sender (sender),
  INDEX idx_status (status),
  FOREIGN KEY (rumor_id) REFERENCES cohrm_rumors(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Paramètres COHRM
CREATE TABLE IF NOT EXISTS cohrm_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  value TEXT,
  description VARCHAR(500),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Données initiales: Codes SMS
-- =====================================================

-- Codes d'événements
INSERT IGNORE INTO cohrm_sms_codes (code, label_fr, label_en, category, description) VALUES
('MAL', 'Maladie suspecte', 'Suspected disease', 'event', 'Signalement d une maladie suspecte'),
('MOR', 'Mortalité anormale', 'Abnormal mortality', 'event', 'Mortalité inhabituelle observée'),
('EPI', 'Épidémie suspectée', 'Suspected epidemic', 'event', 'Suspicion d épidémie ou de foyer'),
('ZOO', 'Zoonose suspectée', 'Suspected zoonosis', 'event', 'Maladie transmise entre animal et humain'),
('INT', 'Intoxication', 'Intoxication', 'event', 'Intoxication alimentaire ou autre'),
('ENV', 'Événement environnemental', 'Environmental event', 'event', 'Événement lié à l environnement');

-- Codes de symptômes
INSERT IGNORE INTO cohrm_sms_codes (code, label_fr, label_en, category, description) VALUES
('FI', 'Fièvre', 'Fever', 'symptom', 'Température corporelle élevée'),
('VO', 'Vomissements', 'Vomiting', 'symptom', 'Vomissements répétés'),
('DI', 'Diarrhée', 'Diarrhea', 'symptom', 'Diarrhée aiguë ou chronique'),
('TO', 'Toux', 'Cough', 'symptom', 'Toux persistante'),
('ER', 'Éruption cutanée', 'Skin rash', 'symptom', 'Éruptions, lésions cutanées'),
('HE', 'Hémorragie', 'Hemorrhage', 'symptom', 'Saignements anormaux'),
('PA', 'Paralysie', 'Paralysis', 'symptom', 'Paralysie, faiblesse musculaire'),
('MO', 'Mortalité', 'Mortality', 'symptom', 'Décès observés'),
('AB', 'Avortement', 'Abortion', 'symptom', 'Avortements chez les animaux'),
('RE', 'Problèmes respiratoires', 'Respiratory issues', 'symptom', 'Difficultés à respirer'),
('NE', 'Symptômes neurologiques', 'Neurological symptoms', 'symptom', 'Convulsions, comportement anormal'),
('OE', 'Oedèmes', 'Edema', 'symptom', 'Gonflements, oedèmes');

-- Codes d'espèces
INSERT IGNORE INTO cohrm_sms_codes (code, label_fr, label_en, category, description) VALUES
('HUM', 'Humain', 'Human', 'species', 'Cas humain'),
('BOV', 'Bovin', 'Bovine', 'species', 'Vache, boeuf, zébu'),
('OVI', 'Ovin/Caprin', 'Ovine/Caprine', 'species', 'Mouton, chèvre'),
('VOL', 'Volaille', 'Poultry', 'species', 'Poulet, canard, pintade'),
('POR', 'Porcin', 'Swine', 'species', 'Porc'),
('SAU', 'Faune sauvage', 'Wildlife', 'species', 'Animaux sauvages'),
('CHI', 'Chien/Chat', 'Dog/Cat', 'species', 'Animaux domestiques'),
('AUT', 'Autre', 'Other', 'species', 'Autre espèce');

-- =====================================================
-- Paramètres par défaut
-- =====================================================

INSERT IGNORE INTO cohrm_settings (`key`, value, description) VALUES
('sms_gateway_enabled', 'false', 'Activer la réception SMS'),
('sms_gateway_url', '', 'URL du gateway SMS'),
('sms_gateway_key', '', 'Clé API du gateway SMS'),
('web_scanner_enabled', 'false', 'Activer le scanner web'),
('web_scanner_keywords', '["épidémie","maladie","mort","grippe aviaire","choléra"]', 'Mots-clés pour le scanner'),
('notification_email', '', 'Email pour les alertes critiques'),
('notification_sms', '', 'Numéro pour les alertes SMS'),
('auto_assign_enabled', 'false', 'Attribution automatique des rumeurs'),
('default_priority', 'medium', 'Priorité par défaut des nouvelles rumeurs');
