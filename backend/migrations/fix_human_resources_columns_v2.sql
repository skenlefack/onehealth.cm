-- Fix human_resources table for MySQL 8.0 (no IF NOT EXISTS for columns)
-- This uses stored procedure to safely add columns

DELIMITER //

DROP PROCEDURE IF EXISTS add_column_if_not_exists//

CREATE PROCEDURE add_column_if_not_exists(
    IN table_name_param VARCHAR(100),
    IN column_name_param VARCHAR(100),
    IN column_definition VARCHAR(500)
)
BEGIN
    DECLARE column_exists INT DEFAULT 0;

    SELECT COUNT(*) INTO column_exists
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = table_name_param
      AND column_name = column_name_param;

    IF column_exists = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', table_name_param, ' ADD COLUMN ', column_name_param, ' ', column_definition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END//

DELIMITER ;

-- Add columns to human_resources
CALL add_column_if_not_exists('human_resources', 'years_experience', 'INT DEFAULT 0');
CALL add_column_if_not_exists('human_resources', 'cv_url', 'VARCHAR(500)');
CALL add_column_if_not_exists('human_resources', 'linkedin_url', 'VARCHAR(255)');
CALL add_column_if_not_exists('human_resources', 'twitter_url', 'VARCHAR(255)');
CALL add_column_if_not_exists('human_resources', 'orcid_id', 'VARCHAR(50)');
CALL add_column_if_not_exists('human_resources', 'google_scholar_url', 'VARCHAR(255)');
CALL add_column_if_not_exists('human_resources', 'researchgate_url', 'VARCHAR(255)');
CALL add_column_if_not_exists('human_resources', 'website', 'VARCHAR(255)');
CALL add_column_if_not_exists('human_resources', 'languages', 'JSON');
CALL add_column_if_not_exists('human_resources', 'education', 'JSON');
CALL add_column_if_not_exists('human_resources', 'certifications', 'JSON');
CALL add_column_if_not_exists('human_resources', 'publications_count', 'INT DEFAULT 0');
CALL add_column_if_not_exists('human_resources', 'projects_count', 'INT DEFAULT 0');
CALL add_column_if_not_exists('human_resources', 'awards', 'TEXT');
CALL add_column_if_not_exists('human_resources', 'research_interests', 'TEXT');
CALL add_column_if_not_exists('human_resources', 'available_for_collaboration', 'BOOLEAN DEFAULT TRUE');
CALL add_column_if_not_exists('human_resources', 'consultation_rate', 'VARCHAR(100)');
CALL add_column_if_not_exists('human_resources', 'expertise_summary', 'TEXT');
CALL add_column_if_not_exists('human_resources', 'submitted_by', 'INT NULL');
CALL add_column_if_not_exists('human_resources', 'submission_status', "ENUM('draft', 'pending', 'approved', 'rejected') DEFAULT 'approved'");
CALL add_column_if_not_exists('human_resources', 'submitted_at', 'DATETIME NULL');
CALL add_column_if_not_exists('human_resources', 'validated_by', 'INT NULL');
CALL add_column_if_not_exists('human_resources', 'validated_at', 'DATETIME NULL');
CALL add_column_if_not_exists('human_resources', 'rejection_reason', 'TEXT NULL');

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

-- Clean up procedure
DROP PROCEDURE IF EXISTS add_column_if_not_exists;

SELECT 'Migration completed successfully!' as status;
