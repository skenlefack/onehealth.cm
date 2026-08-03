-- =====================================================
-- Migration: DUSS-C Tables
-- Défi Une Seule Santé Cameroun
-- Dispositif de micro-apprentissage interactif et de
-- mesure des connaissances en santé intégrée
-- =====================================================

-- ─────────────────────────────────────────────────────
-- Table 1 : Modules thématiques
-- Les 12 modules + le module Alerte activable
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dussc_modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE COMMENT 'Code du module (M00, M01, ..., M12)',
  name_fr VARCHAR(200) NOT NULL COMMENT 'Nom du module en français',
  name_en VARCHAR(200) NOT NULL COMMENT 'Nom du module en anglais',
  description_fr TEXT COMMENT 'Description en français',
  description_en TEXT COMMENT 'Description en anglais',
  objective_fr TEXT COMMENT 'Objectif d apprentissage FR',
  objective_en TEXT COMMENT 'Objectif d apprentissage EN',
  critical_messages_fr JSON COMMENT 'Messages critiques FR (tableau de 3 max)',
  critical_messages_en JSON COMMENT 'Messages critiques EN',
  misconceptions_fr JSON COMMENT 'Idées fausses à corriger FR',
  misconceptions_en JSON COMMENT 'Idées fausses à corriger EN',
  priority ENUM('1', '2', '3', 'activable') DEFAULT '2' COMMENT 'Priorité pour le pilote',
  icon VARCHAR(100) COMMENT 'Nom de l icône associée',
  color VARCHAR(7) COMMENT 'Couleur hex du module',
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  is_alert_module TINYINT(1) DEFAULT 0 COMMENT 'Module Alerte activable (M12)',
  alert_activated_at DATETIME COMMENT 'Date d activation si module alerte',
  alert_deactivated_at DATETIME COMMENT 'Date de désactivation',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_code (code),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────
-- Table 2 : Personas (profils des publics cibles)
-- 4 familles, 12 personas (A1-D3)
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dussc_personas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(5) NOT NULL UNIQUE COMMENT 'Code persona (A1, A2, ..., D3)',
  family ENUM('A', 'B', 'C', 'D') NOT NULL COMMENT 'Famille : A=Grand public, B=Professionnels exposés, C=Jeunes/éducatif, D=Professionnels/relais',
  name_fr VARCHAR(200) NOT NULL,
  name_en VARCHAR(200) NOT NULL,
  description_fr TEXT,
  description_en TEXT,
  priority_risks_fr TEXT COMMENT 'Risques prioritaires FR',
  priority_risks_en TEXT COMMENT 'Risques prioritaires EN',
  preferred_format_fr VARCHAR(300) COMMENT 'Format le plus adapté FR',
  preferred_format_en VARCHAR(300) COMMENT 'Format le plus adapté EN',
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_code (code),
  INDEX idx_family (family)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────
-- Table 3 : Matrice modules × personas
-- Définit la priorité de chaque module pour chaque persona
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dussc_module_personas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module_id INT NOT NULL,
  persona_id INT NOT NULL,
  relevance ENUM('priority', 'secondary', 'not_prescribed') DEFAULT 'secondary' COMMENT '● prioritaire, ○ secondaire, · non prescrit',

  UNIQUE KEY uk_module_persona (module_id, persona_id),
  FOREIGN KEY (module_id) REFERENCES dussc_modules(id) ON DELETE CASCADE,
  FOREIGN KEY (persona_id) REFERENCES dussc_personas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────
-- Table 4 : Banque de questions (actif principal)
-- 144 questions bilingues avec 39 champs de métadonnées
-- Versionnée : modifier ≠ altérer les réponses existantes
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dussc_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_question VARCHAR(20) NOT NULL COMMENT 'ID permanent (DUSSC-M02-014)',
  id_version VARCHAR(30) NOT NULL UNIQUE COMMENT 'ID versionné (DUSSC-M02-014-v1)',
  version INT NOT NULL DEFAULT 1,
  is_current_version TINYINT(1) DEFAULT 1 COMMENT 'Seule la version courante est diffusée',

  -- Classification
  module_id INT NOT NULL,
  theme_fr VARCHAR(200) COMMENT 'Sous-thème FR',
  theme_en VARCHAR(200) COMMENT 'Sous-thème EN',
  type_item ENUM('situation', 'connaissance', 'attitude', 'orientation') NOT NULL COMMENT 'Type de question',
  niveau ENUM('grand_public', 'intermediaire', 'professionnel') NOT NULL DEFAULT 'grand_public',
  role_test ENUM('ancre_pre', 'ancre_post', 'courante') NOT NULL DEFAULT 'courante' COMMENT 'Rôle dans le dispositif pré/post-test',

  -- Contenu FR
  enonce_fr TEXT NOT NULL COMMENT 'Énoncé de la question en français',
  options_fr JSON NOT NULL COMMENT 'Options de réponse FR (tableau JSON de 3-4 éléments)',
  explication_fr TEXT NOT NULL COMMENT 'Explication pédagogique FR (25-45 mots)',
  action_fr TEXT NOT NULL COMMENT 'Instruction actionnable FR',

  -- Contenu EN
  enonce_en TEXT NOT NULL COMMENT 'Énoncé de la question en anglais',
  options_en JSON NOT NULL COMMENT 'Options de réponse EN (tableau JSON)',
  explication_en TEXT NOT NULL COMMENT 'Explication pédagogique EN',
  action_en TEXT NOT NULL COMMENT 'Instruction actionnable EN',

  -- Réponse
  reponse_correcte CHAR(1) NOT NULL COMMENT 'Lettre de la bonne réponse (A, B, C ou D)',
  idee_fausse_ciblee_fr TEXT COMMENT 'Idée fausse ciblée FR',
  idee_fausse_ciblee_en TEXT COMMENT 'Idée fausse ciblée EN',

  -- Ciblage
  public_cible JSON COMMENT 'Codes personas concernés ["A1","A2","C1"]',

  -- Validation
  source_documentaire VARCHAR(500) COMMENT 'Référence au document source validé',
  id_inventaire VARCHAR(50) COMMENT 'Référence dans l inventaire documentaire',
  secteur_validateur JSON COMMENT 'Secteurs validateurs ["MINSANTE","MINEPIA"]',
  date_validation DATE COMMENT 'Date de validation technique',
  date_revision_prevue DATE COMMENT 'Date de révision programmée (max validation + 24 mois)',
  visa_validation VARCHAR(200) COMMENT 'Visa de validation',

  -- Statut et cycle de vie
  statut ENUM('brouillon', 'revue_editoriale', 'en_validation', 'traduction', 'contre_validation', 'test_utilisateur', 'valide', 'publie', 'suspendu', 'retire') NOT NULL DEFAULT 'brouillon',
  sensibilite ENUM('standard', 'sensible') DEFAULT 'standard' COMMENT 'Sensible = stigmatisation, sécurité, politique',
  motif_suspension TEXT COMMENT 'Raison de la suspension',
  statut_traduction ENUM('a_traduire', 'en_cours', 'traduit', 'contre_valide') DEFAULT 'a_traduire',

  -- Psychométrie (calculé après collecte)
  indice_difficulte DECIMAL(5,4) COMMENT 'Proportion de bonnes réponses (0.00-1.00)',
  indice_discrimination DECIMAL(5,4) COMMENT 'Corrélation item-score total',
  distracteur_dominant CHAR(1) COMMENT 'Distracteur le plus choisi',
  n_observations INT DEFAULT 0 COMMENT 'Nombre d observations pour les calculs psy',
  date_calcul_psy DATETIME COMMENT 'Date du dernier calcul psychométrique',

  -- Média
  media_associe VARCHAR(500) COMMENT 'Référence image/pictogramme',
  audio_ref_fr VARCHAR(500) COMMENT 'Fichier audio FR',
  audio_ref_en VARCHAR(500) COMMENT 'Fichier audio EN',

  -- Historique
  historique TEXT COMMENT 'Journal des modifications',
  schema_version VARCHAR(10) DEFAULT '1.0',

  -- Dates
  date_creation DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT COMMENT 'Utilisateur ayant créé la question',
  updated_by INT COMMENT 'Dernier utilisateur ayant modifié',

  INDEX idx_id_question (id_question),
  INDEX idx_module (module_id),
  INDEX idx_statut (statut),
  INDEX idx_niveau (niveau),
  INDEX idx_role_test (role_test),
  INDEX idx_current (is_current_version),
  INDEX idx_revision (date_revision_prevue),
  FOREIGN KEY (module_id) REFERENCES dussc_modules(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────
-- Table 5 : Sessions de quiz (participation anonyme)
-- UUID côté client, aucune donnée identifiante
-- 7 champs démographiques max (minimisation stricte)
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dussc_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid_session CHAR(36) NOT NULL UNIQUE COMMENT 'UUID généré côté client, sans lien appareil',

  -- Données démographiques minimales (7 champs max - loi 2024/017)
  region ENUM(
    'adamaoua', 'centre', 'est', 'extreme_nord',
    'littoral', 'nord', 'nord_ouest', 'ouest',
    'sud', 'sud_ouest'
  ) COMMENT 'Région du Cameroun',
  milieu ENUM('urbain', 'rural') COMMENT 'Milieu urbain ou rural',
  tranche_age ENUM(
    '10-14', '15-19', '20-24', '25-34',
    '35-44', '45-54', '55+'
  ) COMMENT 'Tranche d âge par classes',
  sexe ENUM('homme', 'femme', 'non_precise') DEFAULT 'non_precise' COMMENT 'Facultatif',
  langue ENUM('fr', 'en') NOT NULL DEFAULT 'fr' COMMENT 'Langue de passation',
  profil VARCHAR(5) COMMENT 'Persona déclaré (A1-D3)',
  canal ENUM('web', 'mobile', 'assiste', 'sms', 'ussd', 'whatsapp', 'radio', 'papier') NOT NULL DEFAULT 'web' COMMENT 'Canal de participation',

  -- Parcours
  module_id INT COMMENT 'Module principal du quiz',
  id_equipe_facilitateur VARCHAR(50) COMMENT 'Identifie les participations assistées vs autonomes',
  consent_given TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Consentement explicite donné',
  consent_given_at DATETIME COMMENT 'Horodatage du consentement',

  -- Scores
  score_pre INT COMMENT 'Score pré-test (nombre de bonnes réponses)',
  score_post INT COMMENT 'Score post-test',
  score_total INT COMMENT 'Score total sur les questions courantes',
  gain INT COMMENT 'score_post - score_pre',
  pct_pre DECIMAL(5,2) COMMENT 'Pourcentage pré-test',
  pct_post DECIMAL(5,2) COMMENT 'Pourcentage post-test',
  total_questions INT DEFAULT 0 COMMENT 'Nombre total de questions présentées',
  total_correct INT DEFAULT 0 COMMENT 'Nombre total de bonnes réponses',

  -- Achèvement et qualité
  statut_achevement ENUM('en_cours', 'complet', 'abandonne') DEFAULT 'en_cours',
  is_suspicious TINYINT(1) DEFAULT 0 COMMENT 'Marqué suspect (durée < 45s ou réponses identiques)',
  suspicious_reason VARCHAR(200) COMMENT 'Raison du marquage suspect',
  duration_seconds INT COMMENT 'Durée totale de la session en secondes',
  screen_abandon INT COMMENT 'Numéro de l écran d abandon le cas échéant',

  -- Horodatage
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME COMMENT 'Fin du parcours',
  synced_at DATETIME COMMENT 'Date de synchronisation (mode hors ligne)',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_uuid (uuid_session),
  INDEX idx_region (region),
  INDEX idx_profil (profil),
  INDEX idx_canal (canal),
  INDEX idx_statut (statut_achevement),
  INDEX idx_suspicious (is_suspicious),
  INDEX idx_started (started_at),
  INDEX idx_module (module_id),
  INDEX idx_langue (langue),
  FOREIGN KEY (module_id) REFERENCES dussc_modules(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────
-- Table 6 : Réponses individuelles
-- Une ligne par question répondue par session
-- Rattachée à la version exacte de la question
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dussc_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  question_id INT NOT NULL COMMENT 'Référence la version exacte de la question',
  question_order INT NOT NULL COMMENT 'Ordre de présentation dans le parcours',

  -- Réponse
  answer_given CHAR(1) COMMENT 'Lettre choisie (A, B, C, D)',
  is_correct TINYINT(1) COMMENT 'Réponse correcte ou non',
  options_order JSON COMMENT 'Ordre randomisé des options présentées',

  -- Contexte
  bloc ENUM('pre_test', 'tronc_commun', 'profil', 'post_test') NOT NULL COMMENT 'Bloc du parcours',
  duration_ms INT COMMENT 'Temps de réponse en millisecondes',

  -- Horodatage
  answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_session (session_id),
  INDEX idx_question (question_id),
  INDEX idx_bloc (bloc),
  INDEX idx_correct (is_correct),
  FOREIGN KEY (session_id) REFERENCES dussc_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES dussc_questions(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────
-- Table 7 : Événements du parcours
-- Abandons, reprises, durée par écran
-- La courbe d abandon est une donnée précieuse
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dussc_journey_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  event_type ENUM('screen_view', 'answer', 'abandon', 'resume', 'consent', 'complete', 'share', 'certificate') NOT NULL,
  screen_number INT COMMENT 'Numéro d écran (1-based)',
  screen_name VARCHAR(100) COMMENT 'Nom logique de l écran',
  duration_ms INT COMMENT 'Temps passé sur cet écran en ms',
  metadata JSON COMMENT 'Données additionnelles selon le type',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_session (session_id),
  INDEX idx_type (event_type),
  INDEX idx_screen (screen_number),
  FOREIGN KEY (session_id) REFERENCES dussc_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────
-- Table 8 : Parcours de quiz (templates)
-- Définit la structure d un parcours : quels blocs,
-- quelles questions, dans quel ordre
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dussc_quiz_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Code du template (ex: PILOT-2026-V1)',
  name_fr VARCHAR(200) NOT NULL,
  name_en VARCHAR(200) NOT NULL,
  description_fr TEXT,
  description_en TEXT,

  -- Structure
  pre_test_count INT NOT NULL DEFAULT 3 COMMENT 'Nombre de questions pré-test',
  common_count INT NOT NULL DEFAULT 4 COMMENT 'Nombre de questions tronc commun',
  profile_count INT NOT NULL DEFAULT 5 COMMENT 'Nombre de questions profilées',
  post_test_count INT NOT NULL DEFAULT 3 COMMENT 'Nombre de questions post-test',

  -- Options
  randomize_options TINYINT(1) DEFAULT 1 COMMENT 'Randomiser l ordre des options',
  show_feedback TINYINT(1) DEFAULT 1 COMMENT 'Afficher le retour pédagogique',
  show_feedback_pretest TINYINT(1) DEFAULT 0 COMMENT 'Pas de retour sur pré-test',
  show_progress_bar TINYINT(1) DEFAULT 1,
  require_consent TINYINT(1) DEFAULT 1,

  -- Publication
  is_active TINYINT(1) DEFAULT 0,
  published_at DATETIME,
  expires_at DATETIME COMMENT 'Date d expiration',

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,

  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────
-- Table 9 : Questions assignées à un template
-- Permet de composer les parcours
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dussc_quiz_template_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  template_id INT NOT NULL,
  question_id INT NOT NULL,
  bloc ENUM('pre_test', 'tronc_commun', 'profil', 'post_test') NOT NULL,
  persona_filter JSON COMMENT 'Personas pour lesquels cette question est incluse (null = tous)',
  sort_order INT DEFAULT 0,
  is_required TINYINT(1) DEFAULT 1,

  UNIQUE KEY uk_template_question (template_id, question_id),
  INDEX idx_template (template_id),
  INDEX idx_bloc (bloc),
  FOREIGN KEY (template_id) REFERENCES dussc_quiz_templates(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES dussc_questions(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────
-- Table 10 : Alertes (module M12 activable)
-- Scénarios pré-armés (mpox, choléra, influenza aviaire)
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dussc_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Code de l alerte (ALERT-MPOX-2026)',
  name_fr VARCHAR(200) NOT NULL,
  name_en VARCHAR(200) NOT NULL,
  scenario ENUM('mpox', 'cholera', 'influenza_aviaire', 'autre') NOT NULL,
  description_fr TEXT,
  description_en TEXT,

  -- Activation
  status ENUM('pre_arme', 'actif', 'desactive', 'archive') DEFAULT 'pre_arme',
  activated_at DATETIME,
  activated_by INT,
  deactivated_at DATETIME,
  target_regions JSON COMMENT 'Régions ciblées ["littoral","centre"]',
  target_deadline DATE COMMENT 'Objectif de déploiement en jours',

  -- Contenu
  template_id INT COMMENT 'Template de quiz associé',
  question_count INT DEFAULT 0,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (activated_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (template_id) REFERENCES dussc_quiz_templates(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────
-- Table 11 : Statistiques agrégées hebdomadaires
-- Pré-calculées chaque dimanche, conservées sans limite
-- Évite de recalculer à chaque consultation du dashboard
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dussc_weekly_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  week_start DATE NOT NULL COMMENT 'Lundi de la semaine',
  week_end DATE NOT NULL COMMENT 'Dimanche de la semaine',

  -- Participation
  total_sessions INT DEFAULT 0,
  completed_sessions INT DEFAULT 0,
  abandoned_sessions INT DEFAULT 0,
  suspicious_sessions INT DEFAULT 0,
  assisted_sessions INT DEFAULT 0 COMMENT 'Participations en mode assisté',
  completion_rate DECIMAL(5,2) COMMENT 'Taux d achèvement en %',

  -- Par canal
  stats_by_canal JSON COMMENT '{"web":120,"assiste":45,...}',
  -- Par région
  stats_by_region JSON COMMENT '{"littoral":80,"adamaoua":30,...}',
  -- Par profil
  stats_by_profil JSON COMMENT '{"A1":40,"B2":25,...}',
  -- Par langue
  stats_by_langue JSON COMMENT '{"fr":150,"en":30}',
  -- Par sexe
  stats_by_sexe JSON COMMENT '{"homme":80,"femme":90,"non_precise":10}',

  -- Apprentissage
  avg_score_pre DECIMAL(5,2),
  avg_score_post DECIMAL(5,2),
  avg_gain DECIMAL(5,2),
  avg_pct_post DECIMAL(5,2),
  median_duration_seconds INT,

  -- Qualité
  top_failed_questions JSON COMMENT 'Top 10 questions les plus échouées [{"id":..,"rate":..}]',
  top_misconceptions JSON COMMENT 'Top 10 distracteurs les plus choisis',
  abandon_curve JSON COMMENT 'Taux d abandon par écran [{"screen":1,"rate":0.05}]',

  computed_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uk_week (week_start),
  INDEX idx_week_range (week_start, week_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────
-- Table 12 : Statistiques par question (psychométrie)
-- Recalculées périodiquement
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dussc_question_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Volumes
  n_presentations INT DEFAULT 0 COMMENT 'Nombre de fois présentée',
  n_answered INT DEFAULT 0 COMMENT 'Nombre de réponses',
  n_correct INT DEFAULT 0 COMMENT 'Nombre de bonnes réponses',
  n_skipped INT DEFAULT 0,

  -- Indices
  difficulty_index DECIMAL(5,4) COMMENT 'Proportion bonnes réponses (0.30-0.85 zone utile)',
  discrimination_index DECIMAL(5,4) COMMENT 'Corrélation item-score',

  -- Distribution des réponses
  dist_a INT DEFAULT 0,
  dist_b INT DEFAULT 0,
  dist_c INT DEFAULT 0,
  dist_d INT DEFAULT 0,
  dominant_distractor CHAR(1) COMMENT 'Distracteur le plus choisi',

  -- Temps
  avg_duration_ms INT COMMENT 'Temps moyen de réponse',
  median_duration_ms INT,

  computed_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uk_question_period (question_id, period_start),
  INDEX idx_question (question_id),
  INDEX idx_difficulty (difficulty_index),
  FOREIGN KEY (question_id) REFERENCES dussc_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────
-- Table 13 : Historique des modifications de questions
-- Traçabilité complète du cycle de vie
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dussc_question_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  user_id INT,
  action ENUM(
    'created', 'edited', 'status_changed', 'translated',
    'validated', 'published', 'suspended', 'retired',
    'version_created', 'psychometrics_updated'
  ) NOT NULL,
  old_value TEXT COMMENT 'Valeur avant modification (JSON)',
  new_value TEXT COMMENT 'Valeur après modification (JSON)',
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_question (question_id),
  INDEX idx_action (action),
  FOREIGN KEY (question_id) REFERENCES dussc_questions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────
-- Table 14 : Paramètres DUSS-C
-- Configuration du module
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dussc_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  description VARCHAR(500),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT,

  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────
-- Données initiales : les 13 modules
-- ─────────────────────────────────────────────────────
INSERT INTO dussc_modules (code, name_fr, name_en, priority, sort_order, is_alert_module) VALUES
('M00', 'Comprendre l''approche Une Seule Santé', 'Understanding the One Health Approach', '3', 0, 0),
('M01', 'Eau, hygiène, assainissement et choléra', 'Water, Hygiene, Sanitation and Cholera', '1', 1, 0),
('M02', 'Rage et morsures animales', 'Rabies and Animal Bites', '1', 2, 0),
('M03', 'Charbon bactéridien (anthrax)', 'Anthrax', '2', 3, 0),
('M04', 'Influenza aviaire et biosécurité', 'Avian Influenza and Biosecurity', '2', 4, 0),
('M05', 'Mpox, faune sauvage et interfaces à risque', 'Mpox, Wildlife and Risk Interfaces', '1', 5, 0),
('M06', 'Fièvres hémorragiques virales et rongeurs', 'Viral Hemorrhagic Fevers and Rodents', '3', 6, 0),
('M07', 'Sécurité sanitaire des aliments', 'Food Safety', '2', 7, 0),
('M08', 'Résistance aux antimicrobiens', 'Antimicrobial Resistance', '2', 8, 0),
('M09', 'Rumeurs, infodémie et alerte précoce', 'Rumors, Misinformation and Early Warning', '2', 9, 0),
('M10', 'Environnement, climat et biodiversité', 'Environment, Climate and Biodiversity', '3', 10, 0),
('M11', 'Surveillance et notification', 'Surveillance and Reporting', '3', 11, 0),
('M12', 'Module Alerte (activable)', 'Alert Module (activatable)', 'activable', 12, 1);

-- ─────────────────────────────────────────────────────
-- Données initiales : les 12 personas
-- ─────────────────────────────────────────────────────
INSERT INTO dussc_personas (code, family, name_fr, name_en, sort_order) VALUES
('A1', 'A', 'Ménagère urbaine', 'Urban Housewife', 1),
('A2', 'A', 'Chef de famille rural', 'Rural Family Head', 2),
('A3', 'A', 'Jeune actif connecté', 'Young Connected Professional', 3),
('B1', 'B', 'Éleveur / berger transhumant', 'Herder / Transhumant Shepherd', 4),
('B2', 'B', 'Aviculteur', 'Poultry Farmer', 5),
('B3', 'B', 'Boucher / personnel d''abattoir', 'Butcher / Slaughterhouse Staff', 6),
('B4', 'B', 'Commerçant de produits animaux', 'Animal Product Trader', 7),
('B5', 'B', 'Chasseur / filière viande de brousse', 'Hunter / Bushmeat Actor', 8),
('C1', 'C', 'Élève du secondaire', 'Secondary School Student', 9),
('C2', 'C', 'Étudiant', 'University Student', 10),
('D1', 'D', 'Agent de santé de district', 'District Health Agent', 11),
('D2', 'D', 'Agent vétérinaire / écogarde', 'Veterinary Agent / Eco-ranger', 12),
('D3', 'D', 'Journaliste, communicateur, autorité locale', 'Journalist, Communicator, Local Authority', 13);

-- ─────────────────────────────────────────────────────
-- Données initiales : paramètres par défaut
-- ─────────────────────────────────────────────────────
INSERT INTO dussc_settings (setting_key, setting_value, description) VALUES
('quiz_duration_target_minutes', '7', 'Durée cible du parcours en minutes'),
('suspicious_min_duration_seconds', '45', 'Durée minimale en secondes, en dessous = suspect'),
('pre_test_question_count', '3', 'Nombre de questions pré-test'),
('post_test_question_count', '3', 'Nombre de questions post-test'),
('common_question_count', '4', 'Nombre de questions tronc commun'),
('profile_question_count', '5', 'Nombre de questions profilées'),
('min_observations_psychometrics', '100', 'Minimum d observations pour calcul psychométrique'),
('auto_suspend_expired_revision', '1', 'Suspendre automatiquement les questions dont la date de révision est dépassée'),
('revision_period_months', '24', 'Durée de validité d une question en mois'),
('consent_text_fr', 'Ce quiz anonyme mesure vos connaissances en santé. Aucune donnée personnelle identifiante n''est collectée. Vos réponses seront utilisées uniquement pour améliorer les actions de sensibilisation.', 'Texte de consentement FR'),
('consent_text_en', 'This anonymous quiz measures your health knowledge. No personally identifiable data is collected. Your answers will only be used to improve awareness activities.', 'Texte de consentement EN'),
('weekly_stats_day', '0', 'Jour de calcul des stats hebdo (0=dimanche)'),
('data_retention_months', '24', 'Durée de conservation des données brutes en mois'),
('min_aggregation_threshold', '30', 'Seuil minimum d observations pour publication désagrégée');
