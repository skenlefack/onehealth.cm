-- ============================================
-- ONE HEALTH E-LEARNING MODULE
-- Migration: 005_create_elearning_tables.sql
-- Description: Tables pour le module e-learning avec parcours diplômants
-- ============================================

-- Désactiver les vérifications de clés étrangères temporairement
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- CATÉGORIES E-LEARNING
-- ============================================
CREATE TABLE IF NOT EXISTS elearning_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_fr VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    description_fr TEXT,
    description_en TEXT,
    icon VARCHAR(50),
    color VARCHAR(20) DEFAULT '#2196F3',
    parent_id INT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES elearning_categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_parent (parent_id),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSTRUCTEURS
-- ============================================
CREATE TABLE IF NOT EXISTS instructors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    title_fr VARCHAR(255),
    title_en VARCHAR(255),
    bio_fr TEXT,
    bio_en TEXT,
    expertise JSON,
    qualifications JSON,
    social_links JSON,
    course_count INT DEFAULT 0,
    student_count INT DEFAULT 0,
    average_rating DECIMAL(2,1) DEFAULT 0.0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PARCOURS DIPLÔMANTS (Learning Paths)
-- ============================================
CREATE TABLE IF NOT EXISTS learning_paths (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title_fr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    description_fr TEXT,
    description_en TEXT,
    short_description_fr VARCHAR(500),
    short_description_en VARCHAR(500),
    thumbnail VARCHAR(500),
    cover_image VARCHAR(500),
    level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    duration_hours INT DEFAULT 0,
    -- Exigences de certification
    min_passing_score INT DEFAULT 70,
    require_all_courses BOOLEAN DEFAULT TRUE,
    require_final_exam BOOLEAN DEFAULT FALSE,
    final_exam_id INT NULL,
    -- Paramètres du certificat
    certificate_enabled BOOLEAN DEFAULT TRUE,
    certificate_template VARCHAR(255) DEFAULT 'default',
    certificate_validity_months INT NULL,
    -- Métadonnées
    instructor_id INT,
    category_id INT,
    tags JSON,
    learning_outcomes JSON,
    target_audience JSON,
    -- Statistiques
    enrolled_count INT DEFAULT 0,
    completion_count INT DEFAULT 0,
    average_rating DECIMAL(2,1) DEFAULT 0.0,
    rating_count INT DEFAULT 0,
    -- Statut
    sort_order INT DEFAULT 0,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES elearning_categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_level (level),
    INDEX idx_featured (is_featured),
    INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- COURS
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title_fr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    description_fr TEXT,
    description_en TEXT,
    short_description_fr VARCHAR(500),
    short_description_en VARCHAR(500),
    thumbnail VARCHAR(500),
    cover_image VARCHAR(500),
    intro_video_url VARCHAR(500),
    level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    duration_hours INT DEFAULT 0,
    estimated_weeks INT DEFAULT 0,
    -- Paramètres du cours
    min_passing_score INT DEFAULT 70,
    allow_retake BOOLEAN DEFAULT TRUE,
    max_attempts INT DEFAULT 3,
    sequential_modules BOOLEAN DEFAULT TRUE,
    -- Tarification (pour le futur)
    is_free BOOLEAN DEFAULT TRUE,
    price DECIMAL(10,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'XAF',
    -- Métadonnées
    instructor_id INT,
    category_id INT,
    language VARCHAR(10) DEFAULT 'fr',
    tags JSON,
    prerequisites JSON,
    learning_objectives JSON,
    target_audience JSON,
    what_you_will_learn JSON,
    requirements JSON,
    -- Statistiques
    enrolled_count INT DEFAULT 0,
    completion_count INT DEFAULT 0,
    average_rating DECIMAL(2,1) DEFAULT 0.0,
    rating_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    -- Statut
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES elearning_categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_level (level),
    INDEX idx_category (category_id),
    INDEX idx_featured (is_featured),
    INDEX idx_instructor (instructor_id),
    FULLTEXT INDEX ft_courses (title_fr, title_en, description_fr, description_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- LIAISON PARCOURS-COURS
-- ============================================
CREATE TABLE IF NOT EXISTS learning_path_courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    learning_path_id INT NOT NULL,
    course_id INT NOT NULL,
    sort_order INT DEFAULT 0,
    is_required BOOLEAN DEFAULT TRUE,
    unlock_after_course_id INT NULL,
    min_score_to_unlock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (learning_path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (unlock_after_course_id) REFERENCES courses(id) ON DELETE SET NULL,
    UNIQUE KEY unique_path_course (learning_path_id, course_id),
    INDEX idx_path (learning_path_id),
    INDEX idx_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MODULES (Chapitres)
-- ============================================
CREATE TABLE IF NOT EXISTS course_modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title_fr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    description_fr TEXT,
    description_en TEXT,
    thumbnail VARCHAR(500),
    duration_minutes INT DEFAULT 0,
    sort_order INT DEFAULT 0,
    -- Paramètres du module
    sequential_lessons BOOLEAN DEFAULT TRUE,
    unlock_after_module_id INT NULL,
    -- Quiz de module
    has_quiz BOOLEAN DEFAULT FALSE,
    quiz_id INT NULL,
    min_quiz_score INT DEFAULT 70,
    -- Statistiques
    lesson_count INT DEFAULT 0,
    -- Statut
    status ENUM('draft', 'published') DEFAULT 'draft',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (unlock_after_module_id) REFERENCES course_modules(id) ON DELETE SET NULL,
    INDEX idx_course (course_id),
    INDEX idx_status (status),
    INDEX idx_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- LEÇONS
-- ============================================
CREATE TABLE IF NOT EXISTS lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id INT NOT NULL,
    title_fr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    content_fr LONGTEXT,
    content_en LONGTEXT,
    summary_fr TEXT,
    summary_en TEXT,
    -- Types de contenu
    content_type ENUM('video', 'text', 'pdf', 'mixed', 'quiz', 'assignment') DEFAULT 'text',
    video_url VARCHAR(500),
    video_duration_seconds INT DEFAULT 0,
    video_provider ENUM('youtube', 'vimeo', 'upload', 'other') DEFAULT 'upload',
    video_thumbnail VARCHAR(500),
    pdf_url VARCHAR(500),
    attachments JSON,
    resources JSON,
    -- Paramètres de leçon
    duration_minutes INT DEFAULT 0,
    sort_order INT DEFAULT 0,
    is_preview BOOLEAN DEFAULT FALSE,
    is_required BOOLEAN DEFAULT TRUE,
    is_downloadable BOOLEAN DEFAULT FALSE,
    -- Quiz intégré
    has_quiz BOOLEAN DEFAULT FALSE,
    quiz_id INT NULL,
    quiz_position ENUM('start', 'middle', 'end') DEFAULT 'end',
    -- Critères de complétion
    completion_type ENUM('view', 'video_complete', 'quiz_pass', 'manual') DEFAULT 'view',
    min_video_watch_percent INT DEFAULT 80,
    min_time_spent_seconds INT DEFAULT 0,
    -- Statut
    status ENUM('draft', 'published') DEFAULT 'draft',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE,
    INDEX idx_module (module_id),
    INDEX idx_content_type (content_type),
    INDEX idx_status (status),
    INDEX idx_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BANQUE DE QUESTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_text_fr TEXT NOT NULL,
    question_text_en TEXT,
    question_type ENUM('mcq', 'mcq_multiple', 'true_false', 'short_answer', 'matching', 'fill_blank', 'ordering', 'essay') DEFAULT 'mcq',
    -- Contenu de la question
    explanation_fr TEXT,
    explanation_en TEXT,
    hint_fr TEXT,
    hint_en TEXT,
    image_url VARCHAR(500),
    audio_url VARCHAR(500),
    video_url VARCHAR(500),
    -- Options et réponses (JSON pour flexibilité)
    options JSON,
    correct_answer JSON,
    answer_feedback JSON,
    -- Notation
    points INT DEFAULT 1,
    partial_credit BOOLEAN DEFAULT FALSE,
    negative_marking BOOLEAN DEFAULT FALSE,
    negative_points DECIMAL(3,1) DEFAULT 0,
    -- Métadonnées
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    category_id INT NULL,
    tags JSON,
    course_id INT NULL,
    -- Statistiques d'utilisation
    usage_count INT DEFAULT 0,
    correct_rate DECIMAL(5,2) DEFAULT 0.00,
    average_time_seconds INT DEFAULT 0,
    -- Statut
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES elearning_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_type (question_type),
    INDEX idx_difficulty (difficulty),
    INDEX idx_category (category_id),
    INDEX idx_course (course_id),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- QUIZ
-- ============================================
CREATE TABLE IF NOT EXISTS quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title_fr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    description_fr TEXT,
    description_en TEXT,
    instructions_fr TEXT,
    instructions_en TEXT,
    quiz_type ENUM('practice', 'graded', 'final_exam', 'survey', 'diagnostic') DEFAULT 'graded',
    -- Paramètres
    time_limit_minutes INT NULL,
    passing_score INT DEFAULT 70,
    max_attempts INT DEFAULT 3,
    shuffle_questions BOOLEAN DEFAULT TRUE,
    shuffle_options BOOLEAN DEFAULT TRUE,
    show_correct_answers BOOLEAN DEFAULT TRUE,
    show_explanation BOOLEAN DEFAULT TRUE,
    show_score_immediately BOOLEAN DEFAULT TRUE,
    show_progress BOOLEAN DEFAULT TRUE,
    allow_review BOOLEAN DEFAULT TRUE,
    -- Sélection des questions
    question_count INT NULL,
    random_selection BOOLEAN DEFAULT FALSE,
    questions_per_page INT DEFAULT 1,
    -- Paramètres de reprise
    allow_retake BOOLEAN DEFAULT TRUE,
    retake_delay_hours INT DEFAULT 0,
    best_score_policy BOOLEAN DEFAULT TRUE,
    -- Association
    course_id INT NULL,
    module_id INT NULL,
    lesson_id INT NULL,
    -- Statut
    status ENUM('draft', 'published') DEFAULT 'draft',
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE SET NULL,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_type (quiz_type),
    INDEX idx_status (status),
    INDEX idx_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- LIAISON QUIZ-QUESTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    question_id INT NOT NULL,
    sort_order INT DEFAULT 0,
    points_override INT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_quiz_question (quiz_id, question_id),
    INDEX idx_quiz (quiz_id),
    INDEX idx_question (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSCRIPTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    enrollable_type ENUM('course', 'learning_path') NOT NULL,
    enrollable_id INT NOT NULL,
    -- Statut
    status ENUM('enrolled', 'in_progress', 'completed', 'expired', 'cancelled', 'suspended') DEFAULT 'enrolled',
    progress_percent DECIMAL(5,2) DEFAULT 0.00,
    -- Dates
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    last_accessed_at TIMESTAMP NULL,
    -- Données de complétion
    final_score DECIMAL(5,2) NULL,
    total_time_spent_minutes INT DEFAULT 0,
    lessons_completed INT DEFAULT 0,
    quizzes_completed INT DEFAULT 0,
    -- Certificat
    certificate_id INT NULL,
    certificate_eligible BOOLEAN DEFAULT FALSE,
    -- Suivi source
    enrollment_source VARCHAR(50),
    referral_code VARCHAR(50),
    -- Métadonnées
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (user_id, enrollable_type, enrollable_id),
    INDEX idx_user (user_id),
    INDEX idx_enrollable (enrollable_type, enrollable_id),
    INDEX idx_status (status),
    INDEX idx_enrolled_at (enrolled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PROGRESSION DES LEÇONS
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    lesson_id INT NOT NULL,
    enrollment_id INT NOT NULL,
    -- Suivi de progression
    status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    progress_percent DECIMAL(5,2) DEFAULT 0.00,
    video_watch_time_seconds INT DEFAULT 0,
    video_last_position_seconds INT DEFAULT 0,
    video_completed BOOLEAN DEFAULT FALSE,
    -- Complétion
    completed_at TIMESTAMP NULL,
    time_spent_seconds INT DEFAULT 0,
    -- Progression quiz (si la leçon a un quiz)
    quiz_completed BOOLEAN DEFAULT FALSE,
    quiz_score DECIMAL(5,2) NULL,
    quiz_attempts INT DEFAULT 0,
    -- Suivi d'accès
    first_accessed_at TIMESTAMP NULL,
    last_accessed_at TIMESTAMP NULL,
    access_count INT DEFAULT 0,
    -- Notes personnelles
    notes TEXT,
    bookmarked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_lesson (user_id, lesson_id),
    INDEX idx_enrollment (enrollment_id),
    INDEX idx_status (status),
    INDEX idx_lesson (lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PROGRESSION DES MODULES
-- ============================================
CREATE TABLE IF NOT EXISTS module_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    module_id INT NOT NULL,
    enrollment_id INT NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    progress_percent DECIMAL(5,2) DEFAULT 0.00,
    lessons_completed INT DEFAULT 0,
    quiz_completed BOOLEAN DEFAULT FALSE,
    quiz_score DECIMAL(5,2) NULL,
    completed_at TIMESTAMP NULL,
    time_spent_seconds INT DEFAULT 0,
    first_accessed_at TIMESTAMP NULL,
    last_accessed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_module (user_id, module_id),
    INDEX idx_enrollment (enrollment_id),
    INDEX idx_module (module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TENTATIVES DE QUIZ
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    enrollment_id INT NULL,
    -- Suivi de tentative
    attempt_number INT DEFAULT 1,
    status ENUM('in_progress', 'completed', 'abandoned', 'timed_out') DEFAULT 'in_progress',
    -- Timing
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    time_spent_seconds INT DEFAULT 0,
    time_remaining_seconds INT NULL,
    -- Notation
    score DECIMAL(5,2) NULL,
    score_percent DECIMAL(5,2) NULL,
    max_score INT DEFAULT 0,
    correct_count INT DEFAULT 0,
    incorrect_count INT DEFAULT 0,
    unanswered_count INT DEFAULT 0,
    partial_count INT DEFAULT 0,
    passed BOOLEAN DEFAULT FALSE,
    -- Réponses stockées en JSON
    responses JSON,
    question_order JSON,
    -- Suivi IP
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    INDEX idx_user_quiz (user_id, quiz_id),
    INDEX idx_enrollment (enrollment_id),
    INDEX idx_status (status),
    INDEX idx_started (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- RÉPONSES AUX QUIZ (Détails individuels)
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    user_answer JSON,
    is_correct BOOLEAN NULL,
    is_partial BOOLEAN DEFAULT FALSE,
    points_earned DECIMAL(5,2) DEFAULT 0,
    max_points INT DEFAULT 1,
    time_spent_seconds INT DEFAULT 0,
    answered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_attempt (attempt_id),
    INDEX idx_question (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CERTIFICATS
-- ============================================
CREATE TABLE IF NOT EXISTS certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    enrollable_type ENUM('course', 'learning_path') NOT NULL,
    enrollable_id INT NOT NULL,
    enrollment_id INT NOT NULL,
    -- Détails du certificat
    title_fr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    recipient_name VARCHAR(255) NOT NULL,
    recipient_email VARCHAR(255),
    description_fr TEXT,
    description_en TEXT,
    -- Scores et dates
    final_score DECIMAL(5,2),
    total_hours INT DEFAULT 0,
    issue_date DATE NOT NULL,
    expiry_date DATE NULL,
    -- Fichiers
    pdf_url VARCHAR(500),
    pdf_generated_at TIMESTAMP NULL,
    qr_code_url VARCHAR(500),
    verification_url VARCHAR(500),
    -- Signataires
    signatory_name VARCHAR(255),
    signatory_title VARCHAR(255),
    signatory_signature VARCHAR(500),
    -- Statut
    status ENUM('active', 'expired', 'revoked', 'pending') DEFAULT 'active',
    revoked_at TIMESTAMP NULL,
    revoked_by INT NULL,
    revoked_reason TEXT,
    -- Vérification
    verification_code VARCHAR(100) UNIQUE NOT NULL,
    verified_count INT DEFAULT 0,
    last_verified_at TIMESTAMP NULL,
    -- Métadonnées
    template_used VARCHAR(100) DEFAULT 'default',
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (revoked_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_verification (verification_code),
    INDEX idx_certificate_number (certificate_number),
    INDEX idx_status (status),
    INDEX idx_enrollable (enrollable_type, enrollable_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- AVIS SUR LES COURS
-- ============================================
CREATE TABLE IF NOT EXISTS course_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    user_id INT NOT NULL,
    enrollment_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    review_text TEXT,
    pros TEXT,
    cons TEXT,
    -- Modération
    status ENUM('pending', 'approved', 'rejected', 'flagged') DEFAULT 'pending',
    moderated_by INT NULL,
    moderated_at TIMESTAMP NULL,
    rejection_reason TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    -- Suivi des votes utiles
    helpful_count INT DEFAULT 0,
    not_helpful_count INT DEFAULT 0,
    -- Réponse de l'instructeur
    instructor_response TEXT,
    instructor_response_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (moderated_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_course_review (user_id, course_id),
    INDEX idx_course (course_id),
    INDEX idx_status (status),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DISCUSSIONS DE COURS
-- ============================================
CREATE TABLE IF NOT EXISTS course_discussions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    lesson_id INT NULL,
    user_id INT NOT NULL,
    parent_id INT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    -- Suivi
    reply_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    is_answered BOOLEAN DEFAULT FALSE,
    best_answer_id INT NULL,
    -- Statut
    status ENUM('active', 'closed', 'hidden', 'flagged') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES course_discussions(id) ON DELETE CASCADE,
    INDEX idx_course (course_id),
    INDEX idx_lesson (lesson_id),
    INDEX idx_user (user_id),
    INDEX idx_parent (parent_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- JOURNAL D'ACTIVITÉ E-LEARNING
-- ============================================
CREATE TABLE IF NOT EXISTS elearning_activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MISE À JOUR DES RÉFÉRENCES DE CLÉS ÉTRANGÈRES
-- ============================================

-- Ajouter la référence quiz_id dans course_modules
ALTER TABLE course_modules
ADD CONSTRAINT fk_module_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE SET NULL;

-- Ajouter la référence quiz_id dans lessons
ALTER TABLE lessons
ADD CONSTRAINT fk_lesson_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE SET NULL;

-- Ajouter la référence final_exam_id dans learning_paths
ALTER TABLE learning_paths
ADD CONSTRAINT fk_path_final_exam FOREIGN KEY (final_exam_id) REFERENCES quizzes(id) ON DELETE SET NULL;

-- Ajouter la référence certificate_id dans enrollments
ALTER TABLE enrollments
ADD CONSTRAINT fk_enrollment_certificate FOREIGN KEY (certificate_id) REFERENCES certificates(id) ON DELETE SET NULL;

-- Réactiver les vérifications de clés étrangères
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- DONNÉES INITIALES
-- ============================================

-- Catégories par défaut
INSERT INTO elearning_categories (name_fr, name_en, slug, description_fr, icon, color, sort_order) VALUES
('Santé Humaine', 'Human Health', 'sante-humaine', 'Cours liés à la santé humaine et la médecine', 'heart', '#EF4444', 1),
('Santé Animale', 'Animal Health', 'sante-animale', 'Cours liés à la santé animale et la médecine vétérinaire', 'paw-print', '#22C55E', 2),
('Environnement', 'Environment', 'environnement', 'Cours liés à la santé environnementale et écologie', 'leaf', '#3B82F6', 3),
('One Health', 'One Health', 'one-health', 'Cours sur l''approche Une Seule Santé', 'globe', '#8B5CF6', 4),
('Épidémiologie', 'Epidemiology', 'epidemiologie', 'Cours sur l''épidémiologie et la surveillance', 'activity', '#F59E0B', 5),
('Leadership', 'Leadership', 'leadership', 'Cours sur le leadership et la gestion en santé', 'users', '#EC4899', 6),
('Zoonoses', 'Zoonoses', 'zoonoses', 'Cours sur les maladies zoonotiques', 'bug', '#14B8A6', 7),
('Communication', 'Communication', 'communication', 'Cours sur la communication en santé publique', 'message-circle', '#6366F1', 8);

-- ============================================
-- FIN DE LA MIGRATION
-- ============================================
