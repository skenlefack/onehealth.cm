-- Create settings table if not exists
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(255) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_group VARCHAR(100) DEFAULT 'general',
  autoload TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings
INSERT IGNORE INTO settings (setting_key, setting_value, setting_group, autoload) VALUES
('site_name', 'One Health Cameroon', 'general', 1),
('site_description', 'Plateforme Nationale Une Seule Sante', 'general', 1),
('theme', 'light', 'appearance', 1),
('primary_color', '#2563eb', 'appearance', 1),
('secondary_color', '#f97316', 'appearance', 1);
