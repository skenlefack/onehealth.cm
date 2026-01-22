-- =====================================================
-- Migration: Extension du schema COHRM
-- Alignement avec les documents officiels:
-- - Fiche de collecte des rumeurs
-- - Rapport COHRM Ebolowa 2021
-- =====================================================

-- =====================================================
-- 1. Extension de la table cohrm_rumors
-- =====================================================

-- Ajouter les champs de la Fiche de collecte des rumeurs
ALTER TABLE cohrm_rumors
  -- Dates de la rumeur
  ADD COLUMN date_detection DATE COMMENT 'Date de detection de la rumeur' AFTER code,
  ADD COLUMN date_circulation_start DATE COMMENT 'Date de debut de circulation' AFTER date_detection,

  -- Localisation etendue (Section 1 du formulaire)
  ADD COLUMN arrondissement VARCHAR(100) COMMENT 'Arrondissement' AFTER department,
  ADD COLUMN commune VARCHAR(100) COMMENT 'Commune' AFTER arrondissement,
  ADD COLUMN aire_sante VARCHAR(100) COMMENT 'Aire de sante' AFTER district,

  -- Message (Section 3)
  ADD COLUMN message_received TEXT COMMENT 'Message original recu' AFTER description,

  -- Categorie (Section 4) - Categorie principale
  ADD COLUMN category ENUM(
    'human_health',      -- Sante humaine
    'safety',            -- Securite
    'animal_health',     -- Sante Animale
    'disaster',          -- Catastrophe
    'environmental',     -- Sante Environnement
    'other'              -- Autre
  ) DEFAULT 'human_health' COMMENT 'Categorie principale de la rumeur' AFTER source_details,

  -- Themes (Section 5) - Selection multiple stockee en JSON
  ADD COLUMN themes JSON COMMENT 'Themes multiples selectionnes' AFTER category,

  -- Commentaire sur la gravite
  ADD COLUMN gravity_comment TEXT COMMENT 'Commentaire sur la gravite de la rumeur' AFTER themes,

  -- Niveau de validation actuel
  ADD COLUMN validation_level INT DEFAULT 1 COMMENT 'Niveau de validation actuel (1-5)' AFTER status,

  -- Evaluation des risques
  ADD COLUMN risk_level ENUM('unknown', 'low', 'moderate', 'high', 'very_high') DEFAULT 'unknown' COMMENT 'Niveau de risque evalue' AFTER validation_level,
  ADD COLUMN risk_description TEXT COMMENT 'Description du danger identifie' AFTER risk_level,
  ADD COLUMN risk_context TEXT COMMENT 'Description du contexte' AFTER risk_description,
  ADD COLUMN risk_exposure TEXT COMMENT 'Description de lexposition' AFTER risk_context;

-- Index sur les nouveaux champs
ALTER TABLE cohrm_rumors
  ADD INDEX idx_category (category),
  ADD INDEX idx_validation_level (validation_level),
  ADD INDEX idx_risk_level (risk_level),
  ADD INDEX idx_date_detection (date_detection);

-- =====================================================
-- 2. Table des acteurs COHRM (5 niveaux hierarchiques)
-- =====================================================

CREATE TABLE IF NOT EXISTS cohrm_actors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT COMMENT 'Lien vers la table users',

  -- Type et niveau d acteur
  actor_level INT NOT NULL COMMENT '1=Communautaire, 2=Verificateur, 3=Evaluateur, 4=Coordonnateur, 5=Superviseur',
  actor_type VARCHAR(100) NOT NULL COMMENT 'Type specifique d acteur',

  -- Zone d intervention
  region VARCHAR(100) COMMENT 'Region d intervention',
  department VARCHAR(100) COMMENT 'Departement d intervention',
  district VARCHAR(100) COMMENT 'District de sante',

  -- Organisation
  organization VARCHAR(200) COMMENT 'Organisation/Structure',
  role_in_org VARCHAR(200) COMMENT 'Role dans l organisation',

  -- Contact
  phone VARCHAR(50),
  email VARCHAR(200),

  -- Canal de transmission
  transmission_channel ENUM('paper', 'mobile_app', 'sms', 'email', 'phone', 'system') DEFAULT 'system',

  -- Statut
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_level (actor_level),
  INDEX idx_region (region),
  INDEX idx_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. Table des validations multi-niveaux
-- =====================================================

CREATE TABLE IF NOT EXISTS cohrm_validations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rumor_id INT NOT NULL,
  actor_id INT COMMENT 'Acteur qui effectue la validation',
  user_id INT COMMENT 'Utilisateur qui effectue la validation',

  -- Niveau et type de validation
  level INT NOT NULL COMMENT 'Niveau de validation (1-5)',
  action_type ENUM(
    'collect',           -- Collecte initiale
    'triage',            -- Tri et categorisation
    'verify',            -- Verification
    'risk_assess',       -- Evaluation des risques
    'coordinate',        -- Coordination regionale
    'supervise',         -- Supervision centrale
    'escalate',          -- Escalade au niveau superieur
    'close'              -- Cloture
  ) NOT NULL,

  -- Statut de la validation
  status ENUM('pending', 'validated', 'rejected', 'escalated', 'needs_info') DEFAULT 'pending',

  -- Details
  notes TEXT COMMENT 'Notes de validation',
  rejection_reason TEXT COMMENT 'Raison du rejet si applicable',

  -- Timestamps
  validated_at DATETIME COMMENT 'Date de validation',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_rumor (rumor_id),
  INDEX idx_level (level),
  INDEX idx_status (status),
  FOREIGN KEY (rumor_id) REFERENCES cohrm_rumors(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_id) REFERENCES cohrm_actors(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. Table de retro-information (feedback)
-- =====================================================

CREATE TABLE IF NOT EXISTS cohrm_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rumor_id INT NOT NULL,

  -- Expediteur
  sender_id INT COMMENT 'Utilisateur qui envoie le feedback',
  sender_actor_id INT COMMENT 'Acteur qui envoie le feedback',

  -- Destinataire
  recipient_type ENUM(
    'reporter',          -- Le declarant original
    'community',         -- La communaute (sensibilisation)
    'media',             -- Les medias
    'authorities',       -- Les autorites
    'health_workers',    -- Les agents de sante
    'all_actors'         -- Tous les acteurs impliques
  ) NOT NULL,
  recipient_phone VARCHAR(50) COMMENT 'Numero du destinataire si SMS',
  recipient_email VARCHAR(200) COMMENT 'Email du destinataire',

  -- Contenu du feedback
  feedback_type ENUM(
    'acknowledgment',    -- Accuse de reception
    'status_update',     -- Mise a jour du statut
    'clarification',     -- Demande de clarification
    'response_action',   -- Actions de reponse
    'alert',             -- Alerte publique
    'correction'         -- Correction d information
  ) NOT NULL,
  message TEXT NOT NULL COMMENT 'Message de retro-information',

  -- Canal de transmission
  channel ENUM('sms', 'email', 'phone', 'system', 'public') DEFAULT 'system',

  -- Statut d envoi
  status ENUM('draft', 'pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
  sent_at DATETIME,
  delivered_at DATETIME,
  error_message TEXT,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_rumor (rumor_id),
  INDEX idx_status (status),
  INDEX idx_type (feedback_type),
  FOREIGN KEY (rumor_id) REFERENCES cohrm_rumors(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (sender_actor_id) REFERENCES cohrm_actors(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. Table des themes de rumeurs (reference)
-- =====================================================

CREATE TABLE IF NOT EXISTS cohrm_themes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  label_fr VARCHAR(200) NOT NULL,
  label_en VARCHAR(200),
  category ENUM('human_health', 'animal_health', 'environmental', 'social', 'other') DEFAULT 'other',
  description TEXT,
  is_active TINYINT(1) DEFAULT 1,
  display_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. Donnees initiales: Themes (Section 5 du formulaire)
-- =====================================================

INSERT IGNORE INTO cohrm_themes (code, label_fr, label_en, category, display_order) VALUES
-- Themes de sante humaine
('suspect_case_human', 'Cas suspect / Personne malade', 'Suspect case / Sick person', 'human_health', 1),
('human_death', 'Deces humain', 'Human death', 'human_health', 2),
('quarantine', 'Confinement ou quarantaine', 'Confinement or quarantine', 'human_health', 3),
('disease_denial', 'Deni de la maladie/virus', 'Disease/virus denial', 'human_health', 4),
('case_estimates', 'Estimation de chiffres (cas surestimes ou caches)', 'Case estimates (overestimated or hidden)', 'human_health', 5),
('prevention_reluctance', 'Reticence aux mesures de prevention et controle', 'Reluctance to prevention measures', 'human_health', 6),
('vaccine_reluctance', 'Reticence aux vaccins', 'Vaccine reluctance', 'human_health', 7),
('perceived_severity', 'Peur/gravite percue de la maladie', 'Fear/perceived severity of disease', 'human_health', 8),
('transmission_mode', 'Mode de transmission', 'Transmission mode', 'human_health', 9),
('risky_beliefs', 'Croyances et pratiques a risque', 'Risky beliefs and practices', 'human_health', 10),

-- Themes de sante animale
('suspect_case_animal', 'Cas suspect / Animal malade', 'Suspect case / Sick animal', 'animal_health', 11),
('animal_death', 'Mort d animal', 'Animal death', 'animal_health', 12),
('sick_animal_consumption', 'Consommation d animaux malades ou morts', 'Consumption of sick or dead animals', 'animal_health', 13),
('sick_animal_handling', 'Manipulation d animaux malades', 'Handling sick animals', 'animal_health', 14),
('animal_bites', 'Morsures d animaux', 'Animal bites', 'animal_health', 15),

-- Themes sociaux et environnementaux
('stigmatization', 'Stigmatisation', 'Stigmatization', 'social', 16),
('conspiracy_theory', 'Theorie du complot', 'Conspiracy theory', 'social', 17),
('natural_disasters', 'Catastrophes naturelles', 'Natural disasters', 'environmental', 18),
('traffic_accidents', 'Accident de la voie publique', 'Traffic accident', 'other', 19),
('violence_conflict', 'Violence et conflit', 'Violence and conflict', 'social', 20);

-- =====================================================
-- 7. Donnees initiales: Types d acteurs par niveau
-- =====================================================

INSERT IGNORE INTO cohrm_settings (`key`, value, description) VALUES
('actor_types', '{
  "1": [
    {"code": "asc", "label": "Agent de sante communautaire"},
    {"code": "czv", "label": "Chef de Centre Zootechnique Veterinaire"},
    {"code": "clinician", "label": "Clinicien prive"},
    {"code": "farmer", "label": "Eleveur"},
    {"code": "ecogarde", "label": "Ecogarde"},
    {"code": "hunter", "label": "Chasseur"},
    {"code": "seller", "label": "Vendeur"},
    {"code": "leader", "label": "Leader communautaire"},
    {"code": "municipal_agent", "label": "Agent communal"},
    {"code": "media", "label": "Media/Blogueur"},
    {"code": "crc_volunteer", "label": "Volontaire CRC"}
  ],
  "2": [
    {"code": "health_area_chief", "label": "Chef de l aire de sante"},
    {"code": "daepia", "label": "Delegue d arrondissement EPIA"},
    {"code": "fauna_agent", "label": "Agent de la faune"},
    {"code": "subprefect", "label": "Sous-prefet"},
    {"code": "mayor", "label": "Maire"},
    {"code": "crc_team_lead", "label": "Chef d equipe CRC"}
  ],
  "3": [
    {"code": "district_chief", "label": "Chef de District de sante"},
    {"code": "dd_epia", "label": "Delegue departemental EPIA"},
    {"code": "fauna_unit", "label": "Unite de faune"},
    {"code": "prefect", "label": "Prefet / Point focal ONR"},
    {"code": "dd_com", "label": "Delegue departemental Communication"},
    {"code": "crc_supervisor", "label": "Superviseur CRC"}
  ],
  "4": [
    {"code": "dr_sante", "label": "Delegue regional de sante publique"},
    {"code": "dr_epia", "label": "Delegue regional EPIA"},
    {"code": "governor", "label": "Gouverneur"},
    {"code": "dr_com", "label": "Delegue regional Communication"},
    {"code": "crc_regional", "label": "Coordonnateur regional CRC"}
  ],
  "5": [
    {"code": "rescam", "label": "Coordonnateur RESCAM"},
    {"code": "pnplzer", "label": "PNPLZER"},
    {"code": "sg_minat", "label": "SG MINAT / Coordonnateur central ONR"},
    {"code": "observatoire", "label": "Observatoire des Medias"},
    {"code": "crc_national", "label": "Unite de Gestion CP3 / CRC"},
    {"code": "mincom", "label": "MINCOM"}
  ]
}', 'Types d acteurs par niveau hierarchique');

-- =====================================================
-- 8. Mise a jour des sources (selon le formulaire)
-- =====================================================

-- Modifier l ENUM source pour correspondre au formulaire
-- Note: MySQL ne permet pas de modifier directement un ENUM, on cree une nouvelle colonne
ALTER TABLE cohrm_rumors
  ADD COLUMN source_type ENUM(
    'community',         -- Dans la communaute
    'social_network',    -- Reseaux sociaux (Facebook, WhatsApp, Twitter, Instagram, TikTok, Snapchat)
    'hotline',           -- Appelant ligne verte
    'call_center',       -- Centre d appel
    'media',             -- Media (television, radio, presse ecrite, presse en ligne)
    'sms',               -- SMS structure
    'mobile_app',        -- Application mobile
    'web_scan',          -- Scanner web
    'direct',            -- Declaration directe
    'other'              -- Autre
  ) DEFAULT 'direct' COMMENT 'Type de source selon le formulaire officiel' AFTER source;

-- Copier les anciennes valeurs
UPDATE cohrm_rumors SET source_type =
  CASE source
    WHEN 'sms' THEN 'sms'
    WHEN 'web' THEN 'web_scan'
    WHEN 'mobile' THEN 'mobile_app'
    WHEN 'direct' THEN 'direct'
    WHEN 'hotline' THEN 'hotline'
    WHEN 'media' THEN 'media'
    WHEN 'social' THEN 'social_network'
    ELSE 'other'
  END;

-- =====================================================
-- 9. Index supplementaires pour les performances
-- =====================================================

ALTER TABLE cohrm_rumors
  ADD INDEX idx_source_type (source_type);

-- =====================================================
-- 10. Nouveaux parametres par defaut
-- =====================================================

INSERT IGNORE INTO cohrm_settings (`key`, value, description) VALUES
('validation_workflow_enabled', 'true', 'Activer le workflow de validation multi-niveaux'),
('auto_escalation_hours', '24', 'Heures avant escalade automatique'),
('feedback_sms_enabled', 'false', 'Activer l envoi de retro-information par SMS'),
('feedback_email_enabled', 'true', 'Activer l envoi de retro-information par email'),
('risk_assessment_required', 'true', 'Evaluation des risques obligatoire avant cloture');
