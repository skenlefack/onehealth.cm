-- Add Word and Excel URL columns to lessons
ALTER TABLE lessons ADD COLUMN docx_url VARCHAR(500) AFTER pptx_url;
ALTER TABLE lessons ADD COLUMN xlsx_url VARCHAR(500) AFTER docx_url;

-- Extend content_type ENUM (add new values)
ALTER TABLE lessons MODIFY COLUMN content_type ENUM('video','text','pdf','mixed','quiz','assignment','powerpoint','word','excel','interactive') DEFAULT 'text';

-- Ensure question_type has ordering and multiple_select
ALTER TABLE questions MODIFY COLUMN question_type ENUM('mcq','mcq_multiple','multiple_select','true_false','short_answer','matching','fill_blank','ordering','essay') DEFAULT 'mcq';
