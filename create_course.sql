-- Create course
INSERT INTO courses (title_fr, title_en, slug, description_fr, description_en, short_description_fr, short_description_en,
  level, duration_hours, estimated_weeks, min_passing_score, max_attempts, sequential_modules, is_free, status, is_featured, created_at, updated_at)
VALUES (
  'Formation Site Web OneHealth.cm',
  'OneHealth.cm Website Training',
  'formation-site-web-onehealth-cm',
  'Cette formation complete vous permettra de maitriser les outils de OneHealth.cm.',
  'This training will help you master OneHealth.cm tools.',
  'Formation complete OneHealth.cm',
  'Complete OneHealth.cm training',
  'beginner', 21, 3, 50, 3, 1, 1, 'published', 1, NOW(), NOW()
);
SET @cid = LAST_INSERT_ID();

-- Module 1
INSERT INTO course_modules (course_id, title_fr, title_en, description_fr, sort_order, sequential_lessons, status, created_at, updated_at)
VALUES (@cid, 'Module 1: Fondamentaux', 'Module 1: Fundamentals', 'Configuration email et images', 1, 1, 'published', NOW(), NOW());
SET @m1 = LAST_INSERT_ID();

-- Module 2
INSERT INTO course_modules (course_id, title_fr, title_en, description_fr, sort_order, sequential_lessons, status, created_at, updated_at)
VALUES (@cid, 'Module 2: Site Web OneHealth', 'Module 2: OneHealth Website', 'Architecture et administration', 2, 1, 'published', NOW(), NOW());
SET @m2 = LAST_INSERT_ID();

-- Module 3
INSERT INTO course_modules (course_id, title_fr, title_en, description_fr, sort_order, sequential_lessons, status, created_at, updated_at)
VALUES (@cid, 'Module 3: OHWR-Mapping', 'Module 3: OHWR-Mapping', 'Rapports et cartographie', 3, 1, 'published', NOW(), NOW());
SET @m3 = LAST_INSERT_ID();

-- Module 4
INSERT INTO course_modules (course_id, title_fr, title_en, description_fr, sort_order, sequential_lessons, status, created_at, updated_at)
VALUES (@cid, 'Module 4: COHRM', 'Module 4: COHRM', 'Gestion des rumeurs', 4, 1, 'published', NOW(), NOW());
SET @m4 = LAST_INSERT_ID();

-- Module 5
INSERT INTO course_modules (course_id, title_fr, title_en, description_fr, sort_order, sequential_lessons, status, created_at, updated_at)
VALUES (@cid, 'Module 5: E-Learning Newsletter', 'Module 5: E-Learning Newsletter', 'Cours et emails', 5, 1, 'published', NOW(), NOW());
SET @m5 = LAST_INSERT_ID();

-- Lessons Module 1
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, is_required, completion_type, status, created_at, updated_at) VALUES
(@m1, 'Lecon 1: Configuration Email', 'Lesson 1: Email Config', '# Configuration Email - Apprenez a configurer SMTP.', 'text', 45, 1, 1, 'view', 'published', NOW(), NOW()),
(@m1, 'Lecon 2: Traitement Images', 'Lesson 2: Image Processing', '# Traitement Images - Optimisez vos images.', 'text', 60, 2, 1, 'view', 'published', NOW(), NOW()),
(@m1, 'Lecon 3: Optimisation Web', 'Lesson 3: Web Optimization', '# Optimisation Web - Reduisez la taille des fichiers.', 'text', 45, 3, 1, 'view', 'published', NOW(), NOW()),
(@m1, 'Lecon 4: Redaction Web SEO', 'Lesson 4: Web Writing SEO', '# Redaction Web - Ecrivez pour le web.', 'text', 60, 4, 1, 'view', 'published', NOW(), NOW());

-- Lessons Module 2
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, is_required, completion_type, status, created_at, updated_at) VALUES
(@m2, 'Lecon 5: Architecture Plateforme', 'Lesson 5: Platform Architecture', '# Architecture - 4 plateformes interconnectees.', 'text', 45, 1, 1, 'view', 'published', NOW(), NOW()),
(@m2, 'Lecon 6: Navigation Admin', 'Lesson 6: Admin Navigation', '# Navigation Admin - Decouvrez le panel admin.', 'text', 30, 2, 1, 'view', 'published', NOW(), NOW()),
(@m2, 'Lecon 7: Gestion Articles', 'Lesson 7: Article Management', '# Gestion Articles - Creez et publiez.', 'text', 60, 3, 1, 'view', 'published', NOW(), NOW()),
(@m2, 'Lecon 8: Gestion Medias', 'Lesson 8: Media Management', '# Gestion Medias - Gerez vos fichiers.', 'text', 45, 4, 1, 'view', 'published', NOW(), NOW());

-- Lessons Module 3
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, is_required, completion_type, status, created_at, updated_at) VALUES
(@m3, 'Lecon 9: Introduction OHWR', 'Lesson 9: OHWR Intro', '# Introduction OHWR - Systeme de suivi epidemiologique.', 'text', 45, 1, 1, 'view', 'published', NOW(), NOW()),
(@m3, 'Lecon 10: Saisie Rapports', 'Lesson 10: Report Entry', '# Saisie Rapports - Entrez les donnees hebdomadaires.', 'text', 60, 2, 1, 'view', 'published', NOW(), NOW()),
(@m3, 'Lecon 11: Utilisation Carte', 'Lesson 11: Using Map', '# Utilisation Carte - Naviguez sur la carte.', 'text', 45, 3, 1, 'view', 'published', NOW(), NOW()),
(@m3, 'Lecon 12: Analyse Rapports', 'Lesson 12: Analysis', '# Analyse - Generez des rapports.', 'text', 60, 4, 1, 'view', 'published', NOW(), NOW());

-- Lessons Module 4
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, is_required, completion_type, status, created_at, updated_at) VALUES
(@m4, 'Lecon 13: Concept COHRM', 'Lesson 13: COHRM Concept', '# Concept COHRM - Gestion des rumeurs sanitaires.', 'text', 45, 1, 1, 'view', 'published', NOW(), NOW()),
(@m4, 'Lecon 14: Collecte Rumeurs', 'Lesson 14: Rumor Collection', '# Collecte Rumeurs - Collectez les signalements.', 'text', 60, 2, 1, 'view', 'published', NOW(), NOW()),
(@m4, 'Lecon 15: Verification', 'Lesson 15: Verification', '# Verification - Investiguez les rumeurs.', 'text', 60, 3, 1, 'view', 'published', NOW(), NOW()),
(@m4, 'Lecon 16: Communication', 'Lesson 16: Communication', '# Communication - Repondez efficacement.', 'text', 45, 4, 1, 'view', 'published', NOW(), NOW());

-- Lessons Module 5
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, is_required, completion_type, status, created_at, updated_at) VALUES
(@m5, 'Lecon 17: Plateforme E-Learning', 'Lesson 17: E-Learning', '# E-Learning - Creez des cours en ligne.', 'text', 45, 1, 1, 'view', 'published', NOW(), NOW()),
(@m5, 'Lecon 18: Creation Cours', 'Lesson 18: Course Creation', '# Creation Cours - Structurez vos formations.', 'text', 75, 2, 1, 'view', 'published', NOW(), NOW()),
(@m5, 'Lecon 19: Gestion Newsletter', 'Lesson 19: Newsletter', '# Newsletter - Gerez vos abonnes.', 'text', 60, 3, 1, 'view', 'published', NOW(), NOW()),
(@m5, 'Lecon 20: Campagnes Email', 'Lesson 20: Email Campaigns', '# Campagnes Email - Envoyez des newsletters.', 'text', 60, 4, 1, 'view', 'published', NOW(), NOW());

-- Create Quiz
INSERT INTO quizzes (title_fr, title_en, description_fr, quiz_type, time_limit_minutes, passing_score, max_attempts,
  shuffle_questions, shuffle_options, show_correct_answers, show_score_immediately, course_id, status, created_at, updated_at)
VALUES ('Evaluation Finale - Formation OneHealth', 'Final Evaluation', 'Quiz de validation', 'final_exam', 60, 50, 3, 1, 1, 1, 1, @cid, 'published', NOW(), NOW());
SET @qid = LAST_INSERT_ID();

SELECT 'DONE' as result, @cid as course_id, @qid as quiz_id;
