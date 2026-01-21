-- Migration: Add quiz weighting system for grade calculation
-- Date: 2026-01-21
-- Description: Adds columns for quiz weight/coefficient configuration and grade calculation

-- ============================================
-- 1. QUIZZES TABLE - Add grade contribution settings
-- ============================================
-- Check and add contributes_to_grade column
SET @dbname = DATABASE();
SET @tablename = 'quizzes';
SET @columnname = 'contributes_to_grade';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE quizzes ADD COLUMN contributes_to_grade BOOLEAN DEFAULT TRUE'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add grade_weight column
SET @columnname = 'grade_weight';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE quizzes ADD COLUMN grade_weight DECIMAL(5,2) DEFAULT 1.00'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================
-- 2. LESSONS TABLE - Add quiz weight
-- ============================================
SET @tablename = 'lessons';
SET @columnname = 'quiz_weight';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE lessons ADD COLUMN quiz_weight DECIMAL(5,2) DEFAULT 1.00'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================
-- 3. COURSE_MODULES TABLE - Add quiz weight
-- ============================================
SET @tablename = 'course_modules';
SET @columnname = 'quiz_weight';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE course_modules ADD COLUMN quiz_weight DECIMAL(5,2) DEFAULT 1.00'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================
-- 4. ELEARNING_COURSES (courses) TABLE - Add final quiz settings
-- ============================================
SET @tablename = 'courses';
SET @columnname = 'final_quiz_id';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE courses ADD COLUMN final_quiz_id INT NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'final_quiz_weight';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE courses ADD COLUMN final_quiz_weight DECIMAL(5,2) DEFAULT 1.00'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'module_quizzes_weight';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE courses ADD COLUMN module_quizzes_weight DECIMAL(5,2) DEFAULT 1.00'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================
-- 5. LEARNING_PATHS TABLE - Add weight settings
-- ============================================
SET @tablename = 'learning_paths';
SET @columnname = 'final_quiz_weight';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE learning_paths ADD COLUMN final_quiz_weight DECIMAL(5,2) DEFAULT 1.00'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'courses_quizzes_weight';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE learning_paths ADD COLUMN courses_quizzes_weight DECIMAL(5,2) DEFAULT 1.00'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================
-- 6. LEARNING_PATH_COURSES TABLE - Add course weight
-- ============================================
SET @tablename = 'learning_path_courses';
SET @columnname = 'course_weight';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE learning_path_courses ADD COLUMN course_weight DECIMAL(5,2) DEFAULT 1.00'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================
-- 7. ENROLLMENTS TABLE - Add calculated scores
-- ============================================
SET @tablename = 'enrollments';
SET @columnname = 'quiz_average';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE enrollments ADD COLUMN quiz_average DECIMAL(5,2) NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'weighted_score';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE enrollments ADD COLUMN weighted_score DECIMAL(5,2) NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================
-- 8. Update existing records with default values
-- ============================================
UPDATE quizzes SET contributes_to_grade = TRUE WHERE contributes_to_grade IS NULL;
UPDATE quizzes SET grade_weight = 1.00 WHERE grade_weight IS NULL;
UPDATE lessons SET quiz_weight = 1.00 WHERE quiz_weight IS NULL;
UPDATE course_modules SET quiz_weight = 1.00 WHERE quiz_weight IS NULL;
UPDATE courses SET final_quiz_weight = 1.00 WHERE final_quiz_weight IS NULL;
UPDATE courses SET module_quizzes_weight = 1.00 WHERE module_quizzes_weight IS NULL;
UPDATE learning_paths SET final_quiz_weight = 1.00 WHERE final_quiz_weight IS NULL;
UPDATE learning_paths SET courses_quizzes_weight = 1.00 WHERE courses_quizzes_weight IS NULL;
UPDATE learning_path_courses SET course_weight = 1.00 WHERE course_weight IS NULL;

-- ============================================
-- Migration complete
-- ============================================
SELECT 'Migration 012_add_quiz_weights completed successfully' AS status;
