-- Fix human_resources table: Add all missing columns for expert registration
-- Run this on production if expert registration fails

-- Add columns from add_expert_enhancements.sql
ALTER TABLE human_resources
  ADD COLUMN IF NOT EXISTS years_experience INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cv_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS orcid_id VARCHAR(50),
  ADD COLUMN IF NOT EXISTS google_scholar_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS researchgate_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS website VARCHAR(255),
  ADD COLUMN IF NOT EXISTS languages JSON,
  ADD COLUMN IF NOT EXISTS education JSON,
  ADD COLUMN IF NOT EXISTS certifications JSON,
  ADD COLUMN IF NOT EXISTS publications_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS projects_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS awards TEXT,
  ADD COLUMN IF NOT EXISTS research_interests TEXT,
  ADD COLUMN IF NOT EXISTS available_for_collaboration BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS consultation_rate VARCHAR(100),
  ADD COLUMN IF NOT EXISTS expertise_summary TEXT;

-- Add columns from 008_resource_submissions.sql
ALTER TABLE human_resources
  ADD COLUMN IF NOT EXISTS submitted_by INT NULL,
  ADD COLUMN IF NOT EXISTS submission_status ENUM('draft', 'pending', 'approved', 'rejected') DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS submitted_at DATETIME NULL,
  ADD COLUMN IF NOT EXISTS validated_by INT NULL,
  ADD COLUMN IF NOT EXISTS validated_at DATETIME NULL,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL;

-- Create expertise_domains table if not exists
CREATE TABLE IF NOT EXISTS expertise_domains (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  slug VARCHAR(255) NOT NULL UNIQUE,
  category ENUM('human_health', 'animal_health', 'environmental_health', 'food_safety', 'epidemiology', 'laboratory', 'policy', 'communication', 'other') DEFAULT 'other',
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(20),
  parent_id INT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create expert_expertise junction table if not exists
CREATE TABLE IF NOT EXISTS expert_expertise (
  id INT PRIMARY KEY AUTO_INCREMENT,
  expert_id INT NOT NULL,
  expertise_domain_id INT NOT NULL,
  level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
  years_in_domain INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_expert_expertise (expert_id, expertise_domain_id)
);

-- Create admin_notifications table if not exists
CREATE TABLE IF NOT EXISTS admin_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  type ENUM('resource_submission', 'expert_registration', 'user_registration', 'system') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  resource_type VARCHAR(50) NULL,
  resource_id INT NULL,
  user_id INT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_by INT NULL,
  read_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed expertise domains if empty
INSERT IGNORE INTO expertise_domains (name, name_en, slug, category, description, color, display_order) VALUES
('Epidemiologie humaine', 'Human Epidemiology', 'epidemiologie-humaine', 'human_health', 'Etude de la distribution et des determinants des maladies humaines', '#E74C3C', 1),
('Maladies infectieuses', 'Infectious Diseases', 'maladies-infectieuses', 'human_health', 'Diagnostic et traitement des maladies infectieuses', '#C0392B', 2),
('Sante publique', 'Public Health', 'sante-publique', 'human_health', 'Prevention et promotion de la sante des populations', '#E91E63', 3),
('Epidemiologie veterinaire', 'Veterinary Epidemiology', 'epidemiologie-veterinaire', 'animal_health', 'Etude des maladies animales et leur transmission', '#3498DB', 10),
('Zoonoses', 'Zoonoses', 'zoonoses', 'animal_health', 'Maladies transmissibles entre animaux et humains', '#2196F3', 11),
('Ecologie de la sante', 'Health Ecology', 'ecologie-sante', 'environmental_health', 'Interactions entre ecosystemes et sante', '#27AE60', 20),
('Securite sanitaire des aliments', 'Food Safety', 'securite-sanitaire-aliments', 'food_safety', 'Prevention des risques alimentaires', '#F39C12', 30),
('Diagnostic moleculaire', 'Molecular Diagnostics', 'diagnostic-moleculaire', 'laboratory', 'Techniques PCR et sequencage', '#9B59B6', 40),
('Surveillance epidemiologique', 'Epidemiological Surveillance', 'surveillance-epidemiologique', 'epidemiology', 'Systemes de surveillance des maladies', '#3F51B5', 50),
('Politique sanitaire', 'Health Policy', 'politique-sanitaire', 'policy', 'Elaboration de politiques de sante', '#607D8B', 60);

SELECT 'Migration completed successfully' as status;
