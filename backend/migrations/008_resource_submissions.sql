-- Migration: Add resource submission and validation system
-- Date: 2024-01-16

-- Add submission fields to material_resources
ALTER TABLE material_resources
ADD COLUMN IF NOT EXISTS submitted_by INT NULL,
ADD COLUMN IF NOT EXISTS submission_status ENUM('draft', 'pending', 'approved', 'rejected') DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS submitted_at DATETIME NULL,
ADD COLUMN IF NOT EXISTS validated_by INT NULL,
ADD COLUMN IF NOT EXISTS validated_at DATETIME NULL,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL,
ADD CONSTRAINT fk_material_submitted_by FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_material_validated_by FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add submission fields to organizations
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS submitted_by INT NULL,
ADD COLUMN IF NOT EXISTS submission_status ENUM('draft', 'pending', 'approved', 'rejected') DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS submitted_at DATETIME NULL,
ADD COLUMN IF NOT EXISTS validated_by INT NULL,
ADD COLUMN IF NOT EXISTS validated_at DATETIME NULL,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL,
ADD CONSTRAINT fk_org_submitted_by FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_org_validated_by FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add submission fields to document_resources
ALTER TABLE document_resources
ADD COLUMN IF NOT EXISTS submitted_by INT NULL,
ADD COLUMN IF NOT EXISTS submission_status ENUM('draft', 'pending', 'approved', 'rejected') DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS submitted_at DATETIME NULL,
ADD COLUMN IF NOT EXISTS validated_by INT NULL,
ADD COLUMN IF NOT EXISTS validated_at DATETIME NULL,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL,
ADD CONSTRAINT fk_doc_submitted_by FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_doc_validated_by FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add submission fields to human_resources (experts)
ALTER TABLE human_resources
ADD COLUMN IF NOT EXISTS submitted_by INT NULL,
ADD COLUMN IF NOT EXISTS submission_status ENUM('draft', 'pending', 'approved', 'rejected') DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS submitted_at DATETIME NULL,
ADD COLUMN IF NOT EXISTS validated_by INT NULL,
ADD COLUMN IF NOT EXISTS validated_at DATETIME NULL,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL,
ADD CONSTRAINT fk_expert_submitted_by FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_expert_validated_by FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Create admin notifications table
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (read_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_notifications_type (type),
  INDEX idx_notifications_read (is_read),
  INDEX idx_notifications_created (created_at)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_material_submission ON material_resources(submission_status, submitted_by);
CREATE INDEX IF NOT EXISTS idx_org_submission ON organizations(submission_status, submitted_by);
CREATE INDEX IF NOT EXISTS idx_doc_submission ON document_resources(submission_status, submitted_by);
CREATE INDEX IF NOT EXISTS idx_expert_submission ON human_resources(submission_status, submitted_by);
