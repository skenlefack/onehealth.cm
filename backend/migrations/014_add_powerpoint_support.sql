-- Migration: Add PowerPoint support for e-learning lessons
-- Date: 2026-02-02

-- Ajouter 'powerpoint' au ENUM content_type
ALTER TABLE lessons
MODIFY COLUMN content_type ENUM('video', 'text', 'pdf', 'mixed', 'quiz', 'assignment', 'powerpoint') DEFAULT 'text';

-- Ajouter colonne pour URL PowerPoint
ALTER TABLE lessons
ADD COLUMN pptx_url VARCHAR(500) AFTER pdf_url;
