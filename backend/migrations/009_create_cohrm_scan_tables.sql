-- =====================================================
-- Migration: COHRM Web Scan Tables
-- Tables pour l'historique des scans web et réseaux sociaux
-- =====================================================

-- Table des scans web
CREATE TABLE IF NOT EXISTS cohrm_web_scans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source VARCHAR(50) NOT NULL DEFAULT 'all' COMMENT 'Source du scan: twitter, facebook, news, forums, all',
  status ENUM('running', 'completed', 'failed', 'partial') DEFAULT 'running' COMMENT 'Statut du scan',
  keywords JSON COMMENT 'Mots-clés utilisés pour le scan',
  items_scanned INT DEFAULT 0 COMMENT 'Nombre d elements analysés',
  rumors_found INT DEFAULT 0 COMMENT 'Nombre de rumeurs potentielles détectées',
  rumors_created INT DEFAULT 0 COMMENT 'Nombre de rumeurs créées automatiquement',
  duration INT COMMENT 'Durée du scan en secondes',
  error_message TEXT COMMENT 'Message d erreur si échec',
  started_at DATETIME COMMENT 'Heure de début',
  completed_at DATETIME COMMENT 'Heure de fin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_status (status),
  INDEX idx_source (source),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des résultats de scan (articles/posts détectés)
CREATE TABLE IF NOT EXISTS cohrm_scan_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  scan_id INT NOT NULL COMMENT 'ID du scan parent',
  title VARCHAR(500) COMMENT 'Titre de l article/post',
  content TEXT COMMENT 'Extrait du contenu',
  url VARCHAR(1000) COMMENT 'URL de la source',
  source VARCHAR(50) COMMENT 'Plateforme source: twitter, facebook, news, etc.',
  author VARCHAR(200) COMMENT 'Auteur du post/article',
  published_at DATETIME COMMENT 'Date de publication originale',
  matched_keywords JSON COMMENT 'Mots-clés correspondants',
  relevance_score DECIMAL(5,2) COMMENT 'Score de pertinence (0-1)',
  is_rumor TINYINT(1) DEFAULT 0 COMMENT 'Marqué comme rumeur confirmée',
  rumor_id INT COMMENT 'ID de la rumeur créée si applicable',
  status ENUM('new', 'reviewed', 'ignored', 'converted') DEFAULT 'new' COMMENT 'Statut du traitement',
  reviewed_by INT COMMENT 'Utilisateur qui a traité',
  reviewed_at DATETIME COMMENT 'Date de traitement',
  notes TEXT COMMENT 'Notes de l utilisateur',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_scan (scan_id),
  INDEX idx_source (source),
  INDEX idx_status (status),
  INDEX idx_relevance (relevance_score),
  FOREIGN KEY (scan_id) REFERENCES cohrm_web_scans(id) ON DELETE CASCADE,
  FOREIGN KEY (rumor_id) REFERENCES cohrm_rumors(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table de configuration des sources de scan
CREATE TABLE IF NOT EXISTS cohrm_scan_sources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT 'Nom de la source',
  type ENUM('twitter', 'facebook', 'news', 'forum', 'rss', 'api') NOT NULL COMMENT 'Type de source',
  url VARCHAR(500) COMMENT 'URL ou endpoint',
  api_key VARCHAR(500) COMMENT 'Clé API si nécessaire',
  config JSON COMMENT 'Configuration spécifique (credentials, params)',
  is_active TINYINT(1) DEFAULT 1,
  last_scan_at DATETIME COMMENT 'Dernier scan réussi',
  scan_frequency INT DEFAULT 60 COMMENT 'Fréquence de scan en minutes',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_type (type),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Données initiales: Sources de scan par défaut
-- =====================================================

INSERT IGNORE INTO cohrm_scan_sources (name, type, url, config, is_active, scan_frequency) VALUES
('Twitter/X Cameroun', 'twitter', 'https://api.twitter.com/2', '{"search_terms": ["cameroun santé", "épidémie cameroun", "maladie yaoundé"]}', 0, 30),
('Facebook Public Health Pages', 'facebook', 'https://graph.facebook.com/v18.0', '{"pages": ["MinSanteCameroun", "OMS_Afrique"]}', 0, 60),
('Cameroon Tribune', 'news', 'https://www.cameroon-tribune.cm', '{"section": "santé"}', 0, 120),
('Actualité Cameroun', 'news', 'https://actucameroun.com', '{"category": "sante"}', 0, 120),
('Journal du Cameroun', 'news', 'https://www.journalducameroun.com', '{"section": "sante"}', 0, 120),
('WHO AFRO RSS', 'rss', 'https://www.afro.who.int/rss.xml', '{"keywords": ["cameroun", "cameroon"]}', 0, 180),
('ProMED-mail', 'rss', 'https://promedmail.org/feed/', '{"regions": ["africa", "cameroon"]}', 0, 180);
