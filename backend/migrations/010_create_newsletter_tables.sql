-- ============================================
-- NEWSLETTER MODULE - DATABASE SCHEMA
-- One Health CMS
-- ============================================

-- Listes de diffusion
CREATE TABLE IF NOT EXISTS newsletter_lists (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#27AE60',
  is_public BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  double_optin BOOLEAN DEFAULT TRUE,
  welcome_email_enabled BOOLEAN DEFAULT TRUE,
  welcome_email_subject_fr VARCHAR(255) DEFAULT 'Bienvenue dans notre newsletter',
  welcome_email_subject_en VARCHAR(255) DEFAULT 'Welcome to our newsletter',
  welcome_email_content_fr TEXT,
  welcome_email_content_en TEXT,
  subscriber_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Abonnés
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  language ENUM('fr', 'en') DEFAULT 'fr',
  user_id INT NULL,
  source ENUM('form', 'import', 'admin', 'api') DEFAULT 'form',
  source_details VARCHAR(255),
  confirmation_token VARCHAR(64),
  confirmed_at TIMESTAMP NULL,
  unsubscribe_token VARCHAR(64) NOT NULL,
  status ENUM('pending', 'active', 'unsubscribed', 'bounced') DEFAULT 'pending',
  emails_received INT DEFAULT 0,
  emails_opened INT DEFAULT 0,
  emails_clicked INT DEFAULT 0,
  last_email_at TIMESTAMP NULL,
  last_open_at TIMESTAMP NULL,
  last_click_at TIMESTAMP NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  custom_fields JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_confirmed (confirmed_at),
  INDEX idx_language (language)
);

-- Relation abonné-liste (N:N)
CREATE TABLE IF NOT EXISTS newsletter_subscriber_lists (
  id INT PRIMARY KEY AUTO_INCREMENT,
  subscriber_id INT NOT NULL,
  list_id INT NOT NULL,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE KEY unique_subscriber_list (subscriber_id, list_id),
  FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  FOREIGN KEY (list_id) REFERENCES newsletter_lists(id) ON DELETE CASCADE,
  INDEX idx_list (list_id),
  INDEX idx_subscriber (subscriber_id)
);

-- Templates d'email
CREATE TABLE IF NOT EXISTS newsletter_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  category ENUM('newsletter', 'welcome', 'notification', 'custom') DEFAULT 'newsletter',
  subject_fr VARCHAR(255),
  subject_en VARCHAR(255),
  preview_text_fr VARCHAR(255),
  preview_text_en VARCHAR(255),
  content_html_fr LONGTEXT,
  content_html_en LONGTEXT,
  content_text_fr TEXT,
  content_text_en TEXT,
  thumbnail_url VARCHAR(500),
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  variables JSON,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Campagnes (newsletters envoyées)
CREATE TABLE IF NOT EXISTS newsletters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  subject_fr VARCHAR(255) NOT NULL,
  subject_en VARCHAR(255),
  preview_text_fr VARCHAR(255),
  preview_text_en VARCHAR(255),
  content_html_fr LONGTEXT NOT NULL,
  content_html_en LONGTEXT,
  content_text_fr TEXT,
  content_text_en TEXT,
  template_id INT,
  source_type ENUM('custom', 'article', 'articles_digest') DEFAULT 'custom',
  source_article_id INT,
  source_article_ids JSON,
  target_lists JSON NOT NULL,
  target_language ENUM('all', 'fr', 'en') DEFAULT 'all',
  status ENUM('draft', 'scheduled', 'sending', 'paused', 'sent', 'cancelled') DEFAULT 'draft',
  scheduled_at TIMESTAMP NULL,
  started_at TIMESTAMP NULL,
  sent_at TIMESTAMP NULL,
  total_recipients INT DEFAULT 0,
  sent_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  open_count INT DEFAULT 0,
  unique_open_count INT DEFAULT 0,
  click_count INT DEFAULT 0,
  unique_click_count INT DEFAULT 0,
  unsubscribe_count INT DEFAULT 0,
  bounce_count INT DEFAULT 0,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES newsletter_templates(id) ON DELETE SET NULL,
  FOREIGN KEY (source_article_id) REFERENCES posts(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_scheduled (scheduled_at),
  INDEX idx_sent (sent_at)
);

-- File d'envoi
CREATE TABLE IF NOT EXISTS newsletter_queue (
  id INT PRIMARY KEY AUTO_INCREMENT,
  newsletter_id INT NOT NULL,
  subscriber_id INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  language ENUM('fr', 'en') DEFAULT 'fr',
  status ENUM('pending', 'sending', 'sent', 'failed', 'bounced') DEFAULT 'pending',
  error_message TEXT,
  attempts INT DEFAULT 0,
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_newsletter_subscriber (newsletter_id, subscriber_id),
  FOREIGN KEY (newsletter_id) REFERENCES newsletters(id) ON DELETE CASCADE,
  FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  INDEX idx_newsletter (newsletter_id),
  INDEX idx_status (status),
  INDEX idx_pending (newsletter_id, status)
);

-- Tracking des ouvertures et clics
CREATE TABLE IF NOT EXISTS newsletter_tracking (
  id INT PRIMARY KEY AUTO_INCREMENT,
  newsletter_id INT NOT NULL,
  subscriber_id INT NOT NULL,
  tracking_type ENUM('open', 'click') NOT NULL,
  link_url TEXT,
  link_code VARCHAR(32),
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_type ENUM('desktop', 'mobile', 'tablet', 'unknown') DEFAULT 'unknown',
  country VARCHAR(2),
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (newsletter_id) REFERENCES newsletters(id) ON DELETE CASCADE,
  FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  INDEX idx_newsletter (newsletter_id),
  INDEX idx_subscriber (subscriber_id),
  INDEX idx_type (tracking_type),
  INDEX idx_created (created_at)
);

-- Liens trackés dans les emails
CREATE TABLE IF NOT EXISTS newsletter_links (
  id INT PRIMARY KEY AUTO_INCREMENT,
  newsletter_id INT NOT NULL,
  original_url TEXT NOT NULL,
  tracking_code VARCHAR(32) NOT NULL UNIQUE,
  click_count INT DEFAULT 0,
  unique_click_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (newsletter_id) REFERENCES newsletters(id) ON DELETE CASCADE,
  INDEX idx_newsletter (newsletter_id),
  INDEX idx_code (tracking_code)
);

-- Paramètres du module newsletter
CREATE TABLE IF NOT EXISTS newsletter_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Historique des actions
CREATE TABLE IF NOT EXISTS newsletter_activity_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  subscriber_id INT,
  newsletter_id INT,
  action VARCHAR(50) NOT NULL,
  details JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE SET NULL,
  FOREIGN KEY (newsletter_id) REFERENCES newsletters(id) ON DELETE SET NULL,
  INDEX idx_subscriber (subscriber_id),
  INDEX idx_newsletter (newsletter_id),
  INDEX idx_action (action),
  INDEX idx_created (created_at)
);

-- ============================================
-- DONNÉES INITIALES
-- ============================================

-- Liste par défaut
INSERT INTO newsletter_lists (name, slug, description, color, is_public, is_default, double_optin, welcome_email_enabled)
VALUES ('Newsletter Générale', 'newsletter-generale', 'Liste principale pour les actualités One Health', '#27AE60', TRUE, TRUE, TRUE, TRUE)
ON DUPLICATE KEY UPDATE name = name;

-- Template par défaut
INSERT INTO newsletter_templates (
  name, slug, category, is_default, is_active,
  subject_fr, subject_en,
  content_html_fr, content_html_en,
  variables
)
VALUES (
  'Template Standard', 'template-standard', 'newsletter', TRUE, TRUE,
  'Newsletter One Health - {{date}}', 'One Health Newsletter - {{date}}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
</head>
<body style="font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #27AE60 0%, #00BCD4 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">One Health Cameroun</h1>
    </div>
    <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #263238; margin-top: 0;">Bonjour {{first_name}},</h2>
      {{content}}
      <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 30px 0;">
      <p style="color: #9E9E9E; font-size: 12px; text-align: center;">
        Vous recevez cet email car vous êtes abonné à notre newsletter.<br>
        <a href="{{unsubscribe_url}}" style="color: #2196F3;">Se désabonner</a>
      </p>
    </div>
  </div>
</body>
</html>',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
</head>
<body style="font-family: ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #27AE60 0%, #00BCD4 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">One Health Cameroon</h1>
    </div>
    <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #263238; margin-top: 0;">Hello {{first_name}},</h2>
      {{content}}
      <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 30px 0;">
      <p style="color: #9E9E9E; font-size: 12px; text-align: center;">
        You are receiving this email because you subscribed to our newsletter.<br>
        <a href="{{unsubscribe_url}}" style="color: #2196F3;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>',
  '["first_name", "last_name", "email", "subject", "content", "date", "unsubscribe_url"]'
)
ON DUPLICATE KEY UPDATE name = name;

-- Paramètres par défaut
INSERT INTO newsletter_settings (`key`, value) VALUES
('sender_name', '"One Health Cameroun"'),
('sender_email', '"newsletter@onehealth.cm"'),
('reply_to', '"contact@onehealth.cm"'),
('batch_size', '50'),
('batch_delay_ms', '1000'),
('tracking_enabled', 'true'),
('double_optin_enabled', 'true'),
('welcome_email_enabled', 'true'),
('unsubscribe_page_url', '"/newsletter/unsubscribe"'),
('confirm_page_url', '"/newsletter/confirm"')
ON DUPLICATE KEY UPDATE `key` = `key`;
