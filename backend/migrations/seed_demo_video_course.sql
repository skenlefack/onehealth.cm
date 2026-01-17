-- ============================================
-- COURS DEMO : Introduction à One Health avec vidéos
-- Script de seed pour tester le VideoPlayer
-- ============================================

-- Vérifier/créer la catégorie "Santé Publique"
INSERT INTO elearning_categories (name_fr, name_en, slug, description_fr, icon, color, is_active)
SELECT 'Santé Publique', 'Public Health', 'sante-publique', 'Cours sur la santé publique et One Health', 'Heart', '#10B981', TRUE
WHERE NOT EXISTS (SELECT 1 FROM elearning_categories WHERE slug = 'sante-publique');

-- Récupérer l'ID de la catégorie
SET @category_id = (SELECT id FROM elearning_categories WHERE slug = 'sante-publique' LIMIT 1);

-- ============================================
-- COURS PRINCIPAL
-- ============================================
INSERT INTO courses (
    title_fr, title_en, slug,
    description_fr, description_en,
    short_description_fr, short_description_en,
    thumbnail, level, duration_hours,
    category_id, status, is_featured, is_active,
    learning_objectives, prerequisites
) VALUES (
    'One Health : Comprendre l''approche intégrée',
    'One Health: Understanding the Integrated Approach',
    'one-health-approche-integree',
    '<p>Ce cours complet vous initie à l''approche <strong>One Health</strong>, une stratégie collaborative et transdisciplinaire qui reconnaît les interconnexions entre la santé humaine, animale et environnementale.</p>
    <p>À travers des vidéos éducatives et des contenus interactifs, vous découvrirez :</p>
    <ul>
        <li>Les principes fondamentaux de One Health</li>
        <li>Les zoonoses et leur impact sur la santé mondiale</li>
        <li>La surveillance intégrée des maladies</li>
        <li>Les enjeux environnementaux liés à la santé</li>
    </ul>',
    '<p>This comprehensive course introduces you to the <strong>One Health</strong> approach, a collaborative and transdisciplinary strategy that recognizes the interconnections between human, animal, and environmental health.</p>
    <p>Through educational videos and interactive content, you will discover:</p>
    <ul>
        <li>The fundamental principles of One Health</li>
        <li>Zoonoses and their impact on global health</li>
        <li>Integrated disease surveillance</li>
        <li>Environmental health issues</li>
    </ul>',
    'Découvrez l''approche One Health à travers des vidéos éducatives et comprenez les liens entre santé humaine, animale et environnementale.',
    'Discover the One Health approach through educational videos and understand the links between human, animal and environmental health.',
    '/uploads/courses/one-health-course.jpg',
    'beginner',
    2,
    @category_id,
    'published',
    TRUE,
    TRUE,
    '["Comprendre le concept One Health", "Identifier les principales zoonoses", "Expliquer la surveillance intégrée", "Reconnaître les facteurs environnementaux"]',
    '["Aucun prérequis - Cours ouvert à tous"]'
);

SET @course_id = LAST_INSERT_ID();

-- ============================================
-- MODULE 1 : Introduction à One Health
-- ============================================
INSERT INTO course_modules (
    course_id, title_fr, title_en,
    description_fr, description_en,
    duration_minutes, sort_order, status, is_active
) VALUES (
    @course_id,
    'Introduction à One Health',
    'Introduction to One Health',
    'Découvrez les principes fondamentaux de l''approche One Health et son importance dans la santé mondiale.',
    'Discover the fundamental principles of the One Health approach and its importance in global health.',
    30,
    1,
    'published',
    TRUE
);

SET @module1_id = LAST_INSERT_ID();

-- Leçon 1.1 : Qu'est-ce que One Health ? (Vidéo YouTube)
INSERT INTO lessons (
    module_id, title_fr, title_en,
    content_fr, content_en,
    content_type, video_url, video_provider, video_duration_seconds,
    duration_minutes, sort_order, is_preview, status, is_active,
    completion_type, min_video_watch_percent
) VALUES (
    @module1_id,
    'Qu''est-ce que One Health ?',
    'What is One Health?',
    '<h3>À propos de cette leçon</h3>
    <p>Dans cette vidéo introductive, vous découvrirez le concept One Health présenté par l''Organisation Mondiale de la Santé (OMS).</p>
    <h4>Points clés :</h4>
    <ul>
        <li>Définition de One Health</li>
        <li>Les quatre piliers : humain, animal, environnement, végétal</li>
        <li>Pourquoi cette approche est essentielle aujourd''hui</li>
    </ul>',
    '<h3>About this lesson</h3>
    <p>In this introductory video, you will discover the One Health concept presented by the World Health Organization (WHO).</p>
    <h4>Key points:</h4>
    <ul>
        <li>Definition of One Health</li>
        <li>The four pillars: human, animal, environment, plant</li>
        <li>Why this approach is essential today</li>
    </ul>',
    'video',
    'https://www.youtube.com/watch?v=kFG0PoTLrhU',
    'youtube',
    180,
    5,
    1,
    TRUE,
    'published',
    TRUE,
    'video_complete',
    80
);

-- Leçon 1.2 : L'histoire de One Health (Vidéo YouTube)
INSERT INTO lessons (
    module_id, title_fr, title_en,
    content_fr, content_en,
    content_type, video_url, video_provider, video_duration_seconds,
    duration_minutes, sort_order, status, is_active,
    completion_type, min_video_watch_percent
) VALUES (
    @module1_id,
    'L''histoire et l''évolution de One Health',
    'The History and Evolution of One Health',
    '<h3>Contexte historique</h3>
    <p>Découvrez comment le concept One Health a émergé et évolué au fil du temps, des premières observations sur les zoonoses jusqu''à la reconnaissance internationale actuelle.</p>
    <h4>Thèmes abordés :</h4>
    <ul>
        <li>Les origines du concept</li>
        <li>Les épidémies qui ont façonné l''approche</li>
        <li>La reconnaissance par les organisations internationales</li>
    </ul>',
    '<h3>Historical Context</h3>
    <p>Discover how the One Health concept emerged and evolved over time, from early observations on zoonoses to current international recognition.</p>
    <h4>Topics covered:</h4>
    <ul>
        <li>The origins of the concept</li>
        <li>Epidemics that shaped the approach</li>
        <li>Recognition by international organizations</li>
    </ul>',
    'video',
    'https://www.youtube.com/watch?v=Uiqp6Pw_kPg',
    'youtube',
    300,
    8,
    2,
    'published',
    TRUE,
    'video_complete',
    80
);

-- ============================================
-- MODULE 2 : Les Zoonoses
-- ============================================
INSERT INTO course_modules (
    course_id, title_fr, title_en,
    description_fr, description_en,
    duration_minutes, sort_order, status, is_active
) VALUES (
    @course_id,
    'Comprendre les Zoonoses',
    'Understanding Zoonoses',
    'Les maladies transmises entre animaux et humains constituent un enjeu majeur de santé publique.',
    'Diseases transmitted between animals and humans are a major public health concern.',
    45,
    2,
    'published',
    TRUE
);

SET @module2_id = LAST_INSERT_ID();

-- Leçon 2.1 : Introduction aux zoonoses (Vidéo YouTube)
INSERT INTO lessons (
    module_id, title_fr, title_en,
    content_fr, content_en,
    content_type, video_url, video_provider, video_duration_seconds,
    duration_minutes, sort_order, status, is_active,
    completion_type, min_video_watch_percent
) VALUES (
    @module2_id,
    'Introduction aux zoonoses',
    'Introduction to Zoonoses',
    '<h3>Qu''est-ce qu''une zoonose ?</h3>
    <p>Les zoonoses sont des maladies infectieuses qui peuvent se transmettre des animaux aux humains et vice versa. Cette vidéo explique les mécanismes de transmission et l''importance de la surveillance.</p>
    <h4>Exemples de zoonoses :</h4>
    <ul>
        <li>La rage</li>
        <li>L''influenza aviaire</li>
        <li>La maladie à virus Ebola</li>
        <li>Le COVID-19</li>
    </ul>',
    '<h3>What is a zoonosis?</h3>
    <p>Zoonoses are infectious diseases that can be transmitted from animals to humans and vice versa. This video explains transmission mechanisms and the importance of surveillance.</p>
    <h4>Examples of zoonoses:</h4>
    <ul>
        <li>Rabies</li>
        <li>Avian influenza</li>
        <li>Ebola virus disease</li>
        <li>COVID-19</li>
    </ul>',
    'video',
    'https://www.youtube.com/watch?v=PoKDYA8w5MM',
    'youtube',
    420,
    10,
    1,
    'published',
    TRUE,
    'video_complete',
    80
);

-- Leçon 2.2 : La rage - Un exemple de zoonose (Vidéo YouTube)
INSERT INTO lessons (
    module_id, title_fr, title_en,
    content_fr, content_en,
    content_type, video_url, video_provider, video_duration_seconds,
    duration_minutes, sort_order, status, is_active,
    completion_type, min_video_watch_percent
) VALUES (
    @module2_id,
    'La rage : prévention et contrôle',
    'Rabies: Prevention and Control',
    '<h3>Focus sur la rage</h3>
    <p>La rage est l''une des zoonoses les plus mortelles mais aussi l''une des plus évitables. Découvrez les stratégies de prévention et de contrôle appliquées dans le monde.</p>
    <h4>Contenus :</h4>
    <ul>
        <li>Épidémiologie de la rage</li>
        <li>Vaccination animale</li>
        <li>Prophylaxie post-exposition</li>
        <li>Objectif « Zéro décès humain dû à la rage d''ici 2030 »</li>
    </ul>',
    '<h3>Focus on Rabies</h3>
    <p>Rabies is one of the deadliest but also one of the most preventable zoonoses. Discover prevention and control strategies applied worldwide.</p>
    <h4>Contents:</h4>
    <ul>
        <li>Rabies epidemiology</li>
        <li>Animal vaccination</li>
        <li>Post-exposure prophylaxis</li>
        <li>Goal "Zero human deaths from rabies by 2030"</li>
    </ul>',
    'video',
    'https://www.youtube.com/watch?v=4u5I8GYB79Y',
    'youtube',
    360,
    8,
    2,
    'published',
    TRUE,
    'video_complete',
    80
);

-- ============================================
-- MODULE 3 : Surveillance et Réponse
-- ============================================
INSERT INTO course_modules (
    course_id, title_fr, title_en,
    description_fr, description_en,
    duration_minutes, sort_order, status, is_active
) VALUES (
    @course_id,
    'Surveillance intégrée et réponse',
    'Integrated Surveillance and Response',
    'Apprenez comment fonctionne la surveillance sanitaire intégrée pour détecter et répondre aux menaces.',
    'Learn how integrated health surveillance works to detect and respond to threats.',
    35,
    3,
    'published',
    TRUE
);

SET @module3_id = LAST_INSERT_ID();

-- Leçon 3.1 : Surveillance One Health (Vidéo YouTube)
INSERT INTO lessons (
    module_id, title_fr, title_en,
    content_fr, content_en,
    content_type, video_url, video_provider, video_duration_seconds,
    duration_minutes, sort_order, status, is_active,
    completion_type, min_video_watch_percent
) VALUES (
    @module3_id,
    'La surveillance One Health en pratique',
    'One Health Surveillance in Practice',
    '<h3>Surveillance intégrée</h3>
    <p>La surveillance One Health combine les données de santé humaine, animale et environnementale pour une détection précoce des menaces sanitaires.</p>
    <h4>Éléments clés :</h4>
    <ul>
        <li>Systèmes de surveillance intégrés</li>
        <li>Partage de données entre secteurs</li>
        <li>Alerte précoce et réponse rapide</li>
        <li>Collaboration intersectorielle</li>
    </ul>',
    '<h3>Integrated Surveillance</h3>
    <p>One Health surveillance combines human, animal, and environmental health data for early detection of health threats.</p>
    <h4>Key elements:</h4>
    <ul>
        <li>Integrated surveillance systems</li>
        <li>Cross-sector data sharing</li>
        <li>Early warning and rapid response</li>
        <li>Cross-sectoral collaboration</li>
    </ul>',
    'video',
    'https://www.youtube.com/watch?v=DDotlZR7nBQ',
    'youtube',
    480,
    12,
    1,
    'published',
    TRUE,
    'video_complete',
    80
);

-- Leçon 3.2 : Contenu texte avec ressources
INSERT INTO lessons (
    module_id, title_fr, title_en,
    content_fr, content_en,
    content_type,
    duration_minutes, sort_order, status, is_active,
    completion_type
) VALUES (
    @module3_id,
    'Ressources et outils One Health',
    'One Health Resources and Tools',
    '<h2>Ressources essentielles One Health</h2>

    <h3>Organisations clés</h3>
    <ul>
        <li><strong>OMS</strong> - Organisation Mondiale de la Santé</li>
        <li><strong>FAO</strong> - Organisation des Nations Unies pour l''alimentation et l''agriculture</li>
        <li><strong>WOAH</strong> - Organisation Mondiale de la Santé Animale</li>
        <li><strong>PNUE</strong> - Programme des Nations Unies pour l''environnement</li>
    </ul>

    <h3>Cadres et initiatives</h3>
    <p>Le <strong>Quadripartite One Health</strong> (OMS, FAO, WOAH, PNUE) coordonne les efforts mondiaux pour une approche intégrée de la santé.</p>

    <h3>En Afrique</h3>
    <p>L''<strong>Africa CDC</strong> et les plateformes nationales One Health travaillent à renforcer les capacités de surveillance et de réponse sur le continent.</p>

    <h3>Conclusion du cours</h3>
    <p>Félicitations ! Vous avez terminé ce cours d''introduction à One Health. Vous comprenez maintenant les principes fondamentaux de cette approche et son importance pour la santé mondiale.</p>',

    '<h2>Essential One Health Resources</h2>

    <h3>Key Organizations</h3>
    <ul>
        <li><strong>WHO</strong> - World Health Organization</li>
        <li><strong>FAO</strong> - Food and Agriculture Organization</li>
        <li><strong>WOAH</strong> - World Organisation for Animal Health</li>
        <li><strong>UNEP</strong> - United Nations Environment Programme</li>
    </ul>

    <h3>Frameworks and Initiatives</h3>
    <p>The <strong>Quadripartite One Health</strong> (WHO, FAO, WOAH, UNEP) coordinates global efforts for an integrated approach to health.</p>

    <h3>In Africa</h3>
    <p><strong>Africa CDC</strong> and national One Health platforms work to strengthen surveillance and response capacities on the continent.</p>

    <h3>Course Conclusion</h3>
    <p>Congratulations! You have completed this introduction to One Health course. You now understand the fundamental principles of this approach and its importance for global health.</p>',
    'text',
    10,
    2,
    'published',
    TRUE,
    'view'
);

-- Mettre à jour les compteurs de leçons et durée
UPDATE course_modules SET lesson_count = (SELECT COUNT(*) FROM lessons WHERE module_id = @module1_id) WHERE id = @module1_id;
UPDATE course_modules SET lesson_count = (SELECT COUNT(*) FROM lessons WHERE module_id = @module2_id) WHERE id = @module2_id;
UPDATE course_modules SET lesson_count = (SELECT COUNT(*) FROM lessons WHERE module_id = @module3_id) WHERE id = @module3_id;

-- Afficher un résumé
SELECT 'Cours créé avec succès!' AS message;
SELECT
    c.id,
    c.title_fr,
    c.slug,
    c.status,
    (SELECT COUNT(*) FROM course_modules WHERE course_id = c.id) AS modules,
    (SELECT COUNT(*) FROM lessons l JOIN course_modules m ON l.module_id = m.id WHERE m.course_id = c.id) AS lessons
FROM courses c
WHERE c.slug = 'one-health-approche-integree';
