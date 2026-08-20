-- Add progression settings to courses
ALTER TABLE courses ADD COLUMN require_quiz_pass TINYINT(1) DEFAULT 0 AFTER sequential_modules;
ALTER TABLE courses ADD COLUMN free_navigation TINYINT(1) DEFAULT 0 AFTER require_quiz_pass;
