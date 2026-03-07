-- Add attachments column to newsletters table
-- This stores JSON array of attachment objects: [{filename, path, mimetype, size}]

ALTER TABLE newsletters
ADD COLUMN attachments JSON DEFAULT NULL
AFTER content_text_en;

-- Create directory for newsletter attachments (run manually or in code)
-- mkdir -p uploads/newsletter-attachments
