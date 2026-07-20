-- Fix human_resources table for MySQL 8.0
-- Simplified version without DELIMITER (for migration runner compatibility)
-- All ADD COLUMN will be safely skipped if columns already exist (ER_DUP_FIELDNAME)

ALTER TABLE human_resources ADD COLUMN years_experience INT DEFAULT 0;
ALTER TABLE human_resources ADD COLUMN cv_url VARCHAR(500);
ALTER TABLE human_resources ADD COLUMN linkedin_url VARCHAR(255);
ALTER TABLE human_resources ADD COLUMN twitter_url VARCHAR(255);
ALTER TABLE human_resources ADD COLUMN orcid_id VARCHAR(50);
ALTER TABLE human_resources ADD COLUMN google_scholar_url VARCHAR(255);
ALTER TABLE human_resources ADD COLUMN researchgate_url VARCHAR(255);
ALTER TABLE human_resources ADD COLUMN website VARCHAR(255);
ALTER TABLE human_resources ADD COLUMN languages JSON;
ALTER TABLE human_resources ADD COLUMN education JSON;
ALTER TABLE human_resources ADD COLUMN certifications JSON;
ALTER TABLE human_resources ADD COLUMN publications_count INT DEFAULT 0;
ALTER TABLE human_resources ADD COLUMN projects_count INT DEFAULT 0;
ALTER TABLE human_resources ADD COLUMN awards TEXT;
ALTER TABLE human_resources ADD COLUMN research_interests TEXT;
ALTER TABLE human_resources ADD COLUMN available_for_collaboration BOOLEAN DEFAULT TRUE;
ALTER TABLE human_resources ADD COLUMN consultation_rate VARCHAR(100);
ALTER TABLE human_resources ADD COLUMN expertise_summary TEXT;
ALTER TABLE human_resources ADD COLUMN submitted_by INT NULL;
ALTER TABLE human_resources ADD COLUMN submission_status ENUM('draft', 'pending', 'approved', 'rejected') DEFAULT 'approved';
ALTER TABLE human_resources ADD COLUMN submitted_at DATETIME NULL;
ALTER TABLE human_resources ADD COLUMN validated_by INT NULL;
ALTER TABLE human_resources ADD COLUMN validated_at DATETIME NULL;
ALTER TABLE human_resources ADD COLUMN rejection_reason TEXT NULL;

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
