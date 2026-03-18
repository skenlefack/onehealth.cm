-- Migration: Add Newsletter and One Health Magazine document types
-- Date: 2026-03-18

-- Extend the document_resources type ENUM to include newsletter and magazine
ALTER TABLE document_resources
MODIFY COLUMN type ENUM('guide','protocol','article','thesis','awareness','training','report','other','newsletter','magazine') NOT NULL;

-- Add Newsletter document type to config
INSERT INTO ohwr_document_types (name, name_en, slug, description, icon, color, display_order, is_active) VALUES
('Newsletter', 'Newsletter', 'newsletter', 'Bulletins d''information One Health', 'newspaper', '#2196F3', 9, true)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Add One Health Magazine document type to config
INSERT INTO ohwr_document_types (name, name_en, slug, description, icon, color, display_order, is_active) VALUES
('One Health Magazine', 'One Health Magazine', 'magazine', 'Magazine annuel One Health Cameroun', 'book-open-check', '#E91E63', 10, true)
ON DUPLICATE KEY UPDATE name = VALUES(name);
