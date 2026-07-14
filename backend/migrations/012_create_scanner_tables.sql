-- =====================================================
-- Migration: COHRM Scanner Web Tables
-- =====================================================

CREATE TABLE IF NOT EXISTS cohrm_scan_sources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  type ENUM('news','health_org','social','government','blog') DEFAULT 'news',
  language VARCHAR(10) DEFAULT 'fr',
  is_active BOOLEAN DEFAULT TRUE,
  scan_frequency_hours INT DEFAULT 24,
  last_scanned_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cohrm_scan_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  scan_id INT,
  source_id INT,
  title VARCHAR(500),
  content TEXT,
  url VARCHAR(500),
  published_at TIMESTAMP NULL,
  relevance_score INT DEFAULT 0,
  keywords_matched JSON,
  status ENUM('new','reviewed','converted','dismissed') DEFAULT 'new',
  rumor_id INT NULL,
  reviewed_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_relevance (relevance_score),
  INDEX idx_source (source_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cohrm_scan_keywords (
  id INT AUTO_INCREMENT PRIMARY KEY,
  keyword VARCHAR(100) NOT NULL,
  category ENUM('disease','symptom','species','location','alert') NOT NULL,
  theme_id INT NULL COMMENT 'Lien vers le thème de surveillance',
  weight INT DEFAULT 1,
  language VARCHAR(10) DEFAULT 'fr',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_active (is_active),
  INDEX idx_theme (theme_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed keywords for Cameroon disease surveillance
INSERT IGNORE INTO cohrm_scan_keywords (keyword, category, weight, language) VALUES
-- Maladies (FR)
('choléra', 'disease', 3, 'fr'),
('paludisme', 'disease', 2, 'fr'),
('rougeole', 'disease', 3, 'fr'),
('méningite', 'disease', 3, 'fr'),
('fièvre jaune', 'disease', 3, 'fr'),
('ebola', 'disease', 5, 'fr'),
('mpox', 'disease', 4, 'fr'),
('grippe aviaire', 'disease', 4, 'fr'),
('rage', 'disease', 3, 'fr'),
('tuberculose', 'disease', 2, 'fr'),
('peste', 'disease', 5, 'fr'),
('anthrax', 'disease', 4, 'fr'),
('dengue', 'disease', 3, 'fr'),
-- Diseases (EN)
('cholera', 'disease', 3, 'en'),
('malaria', 'disease', 2, 'en'),
('measles', 'disease', 3, 'en'),
('meningitis', 'disease', 3, 'en'),
('yellow fever', 'disease', 3, 'en'),
('ebola', 'disease', 5, 'en'),
('bird flu', 'disease', 4, 'en'),
-- Symptômes
('fièvre', 'symptom', 2, 'fr'),
('diarrhée', 'symptom', 2, 'fr'),
('vomissement', 'symptom', 2, 'fr'),
('hémorragie', 'symptom', 3, 'fr'),
('éruption cutanée', 'symptom', 2, 'fr'),
('mortalité', 'symptom', 3, 'fr'),
-- Espèces
('volaille', 'species', 2, 'fr'),
('bétail', 'species', 2, 'fr'),
('bovin', 'species', 2, 'fr'),
('porcin', 'species', 2, 'fr'),
('ovin', 'species', 2, 'fr'),
-- Localisation Cameroun
('Cameroun', 'location', 2, 'fr'),
('Cameroon', 'location', 2, 'en'),
('Douala', 'location', 1, 'fr'),
('Yaoundé', 'location', 1, 'fr'),
('Maroua', 'location', 1, 'fr'),
('Garoua', 'location', 1, 'fr'),
('Bamenda', 'location', 1, 'fr'),
('Bafoussam', 'location', 1, 'fr'),
-- Alertes
('épidémie', 'alert', 4, 'fr'),
('épizootie', 'alert', 4, 'fr'),
('pandémie', 'alert', 5, 'fr'),
('urgence sanitaire', 'alert', 5, 'fr'),
('outbreak', 'alert', 4, 'en'),
('epidemic', 'alert', 4, 'en'),
('health emergency', 'alert', 5, 'en');

-- =====================================================
-- Sources de veille par défaut (Cameroun)
-- =====================================================

INSERT IGNORE INTO cohrm_scan_sources (name, url, type, language, is_active, scan_frequency_hours) VALUES
-- Sites officiels
('OMS Afrique - Cameroun', 'https://www.afro.who.int/fr/countries/cameroon/news', 'health_org', 'fr', 1, 12),
('MinSanté Cameroun', 'https://www.minsante.cm', 'government', 'fr', 1, 6),
-- Presse camerounaise
('Cameroon Tribune', 'https://www.cameroon-tribune.cm/categorie/sante/', 'news', 'fr', 1, 4),
('Journal du Cameroun', 'https://www.journalducameroun.com/category/sante/', 'news', 'fr', 1, 4),
('Actu Cameroun', 'https://actucameroun.com/category/sante/', 'news', 'fr', 1, 6),
-- Organisations internationales
('ProMED', 'https://promedmail.org/promed-posts/', 'health_org', 'en', 1, 12),
('ReliefWeb Cameroon', 'https://reliefweb.int/country/cmr', 'health_org', 'en', 1, 24),
-- Flux RSS santé
('Google News Santé Cameroun', 'https://news.google.com/rss/search?q=sant%C3%A9+cameroun+%C3%A9pid%C3%A9mie&hl=fr&gl=FR&ceid=FR:fr', 'news', 'fr', 1, 2);

-- =====================================================
-- Configuration scanner par défaut
-- =====================================================

INSERT IGNORE INTO cohrm_settings (`key`, value, description) VALUES
('scanner_enabled', 'false', 'Activer le scanner automatique de veille'),
('scanner_scan_interval_minutes', '60', 'Intervalle entre les scans automatiques (minutes)'),
('scanner_auto_create_threshold', '15', 'Score minimum pour créer automatiquement une rumeur'),
('scanner_high_priority_threshold', '25', 'Score pour priorité haute'),
('scanner_critical_threshold', '40', 'Score pour priorité critique'),
('scanner_notify_on_new_results', 'true', 'Notifier les responsables lors de nouveaux résultats'),
('scanner_notify_on_auto_rumor', 'true', 'Notifier lors de création automatique de rumeur'),
('scanner_dedup_days', '30', 'Jours de rétention pour la déduplication');
