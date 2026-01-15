-- Migration: Add multilingual support to categories
-- Date: 2026-01-07
-- Description: Adds name_fr, name_en, description_fr, description_en, icon, color columns

-- Add French name column
ALTER TABLE categories ADD COLUMN name_fr VARCHAR(100) AFTER name;

-- Add English name column
ALTER TABLE categories ADD COLUMN name_en VARCHAR(100) AFTER name_fr;

-- Add French description column
ALTER TABLE categories ADD COLUMN description_fr TEXT AFTER description;

-- Add English description column
ALTER TABLE categories ADD COLUMN description_en TEXT AFTER description_fr;

-- Add icon column for category icons
ALTER TABLE categories ADD COLUMN icon VARCHAR(50) DEFAULT NULL AFTER meta_description;

-- Add color column for category theming
ALTER TABLE categories ADD COLUMN color VARCHAR(20) DEFAULT '#007A33' AFTER icon;

-- Migrate existing data: copy name to name_fr and name_en
UPDATE categories SET name_fr = name, name_en = name WHERE name_fr IS NULL;

-- Migrate existing data: copy description to description_fr and description_en
UPDATE categories SET description_fr = description, description_en = description WHERE description_fr IS NULL;
