-- Migration: Add multilingual support to posts
-- Date: 2026-01-07
-- Description: Adds title_fr, title_en, content_fr, content_en, excerpt_fr, excerpt_en,
--              meta_title_fr, meta_title_en, meta_description_fr, meta_description_en columns

-- Add French title column
ALTER TABLE posts ADD COLUMN title_fr VARCHAR(500) AFTER title;

-- Add English title column
ALTER TABLE posts ADD COLUMN title_en VARCHAR(500) AFTER title_fr;

-- Add French content column
ALTER TABLE posts ADD COLUMN content_fr LONGTEXT AFTER content;

-- Add English content column
ALTER TABLE posts ADD COLUMN content_en LONGTEXT AFTER content_fr;

-- Add French excerpt column
ALTER TABLE posts ADD COLUMN excerpt_fr TEXT AFTER excerpt;

-- Add English excerpt column
ALTER TABLE posts ADD COLUMN excerpt_en TEXT AFTER excerpt_fr;

-- Add French meta title column
ALTER TABLE posts ADD COLUMN meta_title_fr VARCHAR(255) AFTER meta_title;

-- Add English meta title column
ALTER TABLE posts ADD COLUMN meta_title_en VARCHAR(255) AFTER meta_title_fr;

-- Add French meta description column
ALTER TABLE posts ADD COLUMN meta_description_fr TEXT AFTER meta_description;

-- Add English meta description column
ALTER TABLE posts ADD COLUMN meta_description_en TEXT AFTER meta_description_fr;

-- Migrate existing data: copy title to title_fr and title_en
UPDATE posts SET title_fr = title WHERE title_fr IS NULL AND title IS NOT NULL;
UPDATE posts SET title_en = title WHERE title_en IS NULL AND title IS NOT NULL;

-- Migrate existing data: copy content to content_fr and content_en
UPDATE posts SET content_fr = content WHERE content_fr IS NULL AND content IS NOT NULL;
UPDATE posts SET content_en = content WHERE content_en IS NULL AND content IS NOT NULL;

-- Migrate existing data: copy excerpt to excerpt_fr and excerpt_en
UPDATE posts SET excerpt_fr = excerpt WHERE excerpt_fr IS NULL AND excerpt IS NOT NULL;
UPDATE posts SET excerpt_en = excerpt WHERE excerpt_en IS NULL AND excerpt IS NOT NULL;

-- Migrate existing data: copy meta fields
UPDATE posts SET meta_title_fr = meta_title WHERE meta_title_fr IS NULL AND meta_title IS NOT NULL;
UPDATE posts SET meta_title_en = meta_title WHERE meta_title_en IS NULL AND meta_title IS NOT NULL;
UPDATE posts SET meta_description_fr = meta_description WHERE meta_description_fr IS NULL AND meta_description IS NOT NULL;
UPDATE posts SET meta_description_en = meta_description WHERE meta_description_en IS NULL AND meta_description IS NOT NULL;
