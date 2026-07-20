-- =====================================================
-- Migration: Table des tokens de devices pour push notifications
-- Stocke les tokens FCM (Firebase Cloud Messaging) par utilisateur
-- =====================================================

CREATE TABLE IF NOT EXISTS cohrm_device_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  platform ENUM('android', 'ios', 'web') NOT NULL,
  device_info VARCHAR(255) COMMENT 'Info appareil (modele, OS version, etc.)',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_token (token),
  INDEX idx_user_active (user_id, is_active),
  INDEX idx_platform (platform),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table des logs SMS
-- =====================================================

CREATE TABLE IF NOT EXISTS cohrm_sms_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider VARCHAR(50) NOT NULL COMMENT 'Provider used (africastalking, twilio, development)',
  phone_number VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
  provider_message_id VARCHAR(255) COMMENT 'Message ID from provider',
  error_message TEXT,
  retry_count INT DEFAULT 0,
  cost DECIMAL(10, 4) COMMENT 'Cost of SMS if available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP NULL,
  INDEX idx_phone (phone_number),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
