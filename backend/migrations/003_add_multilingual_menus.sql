-- Migration: Add multilingual support for menu items
-- Date: 2026-01-14

-- Add bilingual label fields to menu_items
ALTER TABLE menu_items
ADD COLUMN label_fr VARCHAR(255) AFTER label,
ADD COLUMN label_en VARCHAR(255) AFTER label_fr;

-- Copy existing label values to label_fr
UPDATE menu_items SET label_fr = label WHERE label_fr IS NULL;

-- Set label_en to same as label_fr initially (can be updated in admin)
UPDATE menu_items SET label_en = label_fr WHERE label_en IS NULL;
