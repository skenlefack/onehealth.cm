-- Migration: Add email verification and account activation fields
-- Date: 2024-01-16

-- Add email verification fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS email_verification_expires DATETIME NULL,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Update existing users to have email_verified = true (they registered before this feature)
UPDATE users SET email_verified = TRUE WHERE email_verified IS NULL OR email_verified = FALSE;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);
