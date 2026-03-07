/**
 * Script de création du cours dans la base Docker
 * Usage: node backend/scripts/create-formation-docker.js
 */

const mysql = require('mysql2/promise');

const dbConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'onehealth',
  password: 'devpassword',
  database: 'onehealth_cms'
};

// Données du cours
const courseData = {
  title_fr: 'Formation Site Web OneHealth.cm',
  title_en: 'OneHealth.cm Website Training',
  slug: 'formation-site-web-onehealth-cm',
  description_fr: 'Cette formation complète vous permettra de maîtriser l\'ensemble des outils et fonctionnalités de l\'écosystème OneHealth.cm.',
  description_en: 'This comprehensive training will help you master all the tools and features of the OneHealth.cm ecosystem.',
  short_description_fr: 'Formation complète pour maîtriser l\'écosystème OneHealth.cm',
  short_description_en: 'Complete training to master the OneHealth.cm ecosystem',
  level: 'beginner',
  duration_hours: 21,
  estimated_weeks: 3,
  min_passing_score: 50,
  max_attempts: 3,
  sequential_modules: true,
  is_free: true,
  status: 'published',
  is_featured: true
};

const modules = [
  {
    title_fr: 'Module 1: Fondamentaux',
    title_en: 'Module 1: Fundamentals',
    description_fr: 'Configuration email, traitement d\'images et rédaction web',
    lessons: [
      { title_fr: 'Leçon 1: Configuration Email/SMTP', title_en: 'Lesson 1: Email/SMTP Configuration', content: '# Configuration Email/SMTP\n\nLa configuration correcte des emails est essentielle.', duration: 45 },
      { title_fr: 'Leçon 2: Traitement d\'Images Photoshop', title_en: 'Lesson 2: Photoshop Image Processing', content: '# Traitement d\'Images avec Photoshop\n\nApprenez à optimiser vos images.', duration: 60 },
      { title_fr: 'Leçon 3: Optimisation Web des Médias', title_en: 'Lesson 3: Web Media Optimization', content: '# Optimisation Web des Médias\n\nUne image mal optimisée ralentit la page.', duration: 45 },
      { title_fr: 'Leçon 4: Rédaction Web et SEO', title_en: 'Lesson 4: Web Writing and SEO', content: '# Rédaction Web et SEO\n\nSur le web, l\'essentiel doit venir en premier.', duration: 60 }
    ]
  },
  {
    title_fr: 'Module 2: Site Web OneHealth',
    title_en: 'Module 2: OneHealth Website',
    description_fr: 'Architecture technique et administration du site',
    lessons: [
      { title_fr: 'Leçon 5: Architecture de la Plateforme', title_en: 'Lesson 5: Platform Architecture', content: '# Architecture de la Plateforme OneHealth\n\nL\'écosystème comprend 4 plateformes.', duration: 45 },
      { title_fr: 'Leçon 6: Navigation dans l\'Admin', title_en: 'Lesson 6: Admin Navigation', content: '# Navigation dans l\'Admin Panel\n\nAccédez à admin.onehealth.cm.', duration: 30 },
      { title_fr: 'Leçon 7: Gestion des Articles', title_en: 'Lesson 7: Article Management', content: '# Gestion des Articles\n\nCréez et publiez des articles.', duration: 60 },
      { title_fr: 'Leçon 8: Gestion des Médias', title_en: 'Lesson 8: Media Management', content: '# Gestion des Médias\n\nLa médiathèque centralise vos fichiers.', duration: 45 }
    ]
  },
  {
    title_fr: 'Module 3: OHWR-Mapping',
    title_en: 'Module 3: OHWR-Mapping',
    description_fr: 'Rapports hebdomadaires et cartographie épidémiologique',
    lessons: [
      { title_fr: 'Leçon 9: Introduction à OHWR', title_en: 'Lesson 9: Introduction to OHWR', content: '# Introduction à OHWR\n\nOHWR est le système de suivi épidémiologique.', duration: 45 },
      { title_fr: 'Leçon 10: Saisie des Rapports', title_en: 'Lesson 10: Report Entry', content: '# Saisie des Rapports OHWR\n\nSaisissez les données par semaine épidémiologique.', duration: 60 },
      { title_fr: 'Leçon 11: Utilisation de la Carte', title_en: 'Lesson 11: Using the Map', content: '# Utilisation de la Carte OHWR\n\nNaviguez sur la carte interactive.', duration: 45 },
      { title_fr: 'Leçon 12: Analyse et Rapports', title_en: 'Lesson 12: Analysis and Reports', content: '# Analyse et Rapports OHWR\n\nGénérez des rapports et analysez.', duration: 60 }
    ]
  },
  {
    title_fr: 'Module 4: COHRM - Gestion des Rumeurs',
    title_en: 'Module 4: COHRM - Rumor Management',
    description_fr: 'Collecte, vérification et réponse aux rumeurs sanitaires',
    lessons: [
      { title_fr: 'Leçon 13: Concept et Objectifs COHRM', title_en: 'Lesson 13: COHRM Concept', content: '# Concept et Objectifs COHRM\n\nCOHRM gère les rumeurs sanitaires.', duration: 45 },
      { title_fr: 'Leçon 14: Collecte des Rumeurs', title_en: 'Lesson 14: Rumor Collection', content: '# Collecte des Rumeurs\n\nCollectez via formulaire ou agents terrain.', duration: 60 },
      { title_fr: 'Leçon 15: Processus de Vérification', title_en: 'Lesson 15: Verification Process', content: '# Processus de Vérification\n\nRéception → Analyse → Investigation → Conclusion.', duration: 60 },
      { title_fr: 'Leçon 16: Communication et Réponse', title_en: 'Lesson 16: Communication', content: '# Communication et Réponse\n\nRépondez avec transparence et empathie.', duration: 45 }
    ]
  },
  {
    title_fr: 'Module 5: E-Learning & Newsletter',
    title_en: 'Module 5: E-Learning & Newsletter',
    description_fr: 'Création de cours en ligne et campagnes newsletter',
    lessons: [
      { title_fr: 'Leçon 17: Plateforme E-Learning', title_en: 'Lesson 17: E-Learning Platform', content: '# Plateforme E-Learning OneHealth\n\nCréez des cours avec quiz et certificats.', duration: 45 },
      { title_fr: 'Leçon 18: Création de Cours', title_en: 'Lesson 18: Course Creation', content: '# Création de Cours\n\nStructurez en modules et leçons.', duration: 75 },
      { title_fr: 'Leçon 19: Gestion Newsletter', title_en: 'Lesson 19: Newsletter Management', content: '# Gestion Newsletter\n\nGérez vos listes et templates.', duration: 60 },
      { title_fr: 'Leçon 20: Campagnes Email', title_en: 'Lesson 20: Email Campaigns', content: '# Campagnes Email Newsletter\n\nCréez et envoyez des campagnes.', duration: 60 }
    ]
  }
];

// Quiz questions (10 questions sample)
const quizQuestions = [
  { q: "Quel protocole est recommandé pour la configuration d'un serveur SMTP professionnel ?", options: [{ t: "HTTP", c: false }, { t: "FTP", c: false }, { t: "TLS/SSL", c: true }, { t: "UDP", c: false }] },
  { q: "Quelle est la résolution recommandée pour les images de bannière ?", options: [{ t: "800x400 pixels", c: false }, { t: "1200x400 pixels", c: true }, { t: "500x500 pixels", c: false }, { t: "1920x1080 pixels", c: false }] },
  { q: "Quel format d'image offre le meilleur compromis qualité/taille pour le web ?", options: [{ t: "BMP", c: false }, { t: "TIFF", c: false }, { t: "WebP", c: true }, { t: "RAW", c: false }] },
  { q: "Combien de plateformes composent l'écosystème OneHealth ?", options: [{ t: "2", c: false }, { t: "3", c: false }, { t: "4", c: true }, { t: "5", c: false }] },
  { q: "Quel framework est utilisé pour le frontend public ?", options: [{ t: "React", c: false }, { t: "Vue.js", c: false }, { t: "Next.js", c: true }, { t: "Angular", c: false }] },
  { q: "Que signifie OHWR ?", options: [{ t: "One Health World Report", c: false }, { t: "One Health Weekly Report", c: true }, { t: "One Health Web Registry", c: false }, { t: "One Health Wildlife Research", c: false }] },
  { q: "Combien de secteurs couvre l'approche One Health dans OHWR ?", options: [{ t: "2", c: false }, { t: "3", c: true }, { t: "4", c: false }, { t: "5", c: false }] },
  { q: "Que signifie COHRM ?", options: [{ t: "Community One Health Report", c: false }, { t: "Cameroon One Health Rumor Management", c: true }, { t: "Central Office Health Risk", c: false }, { t: "Collective One Health Resource", c: false }] },
  { q: "Comment est structuré un cours dans E-Learning ?", options: [{ t: "Cours uniquement", c: false }, { t: "Cours → Leçons", c: false }, { t: "Cours → Modules → Leçons", c: true }, { t: "Catégories uniquement", c: false }] },
  { q: "Qu'est-ce que le double opt-in pour une newsletter ?", options: [{ t: "S'inscrire deux fois", c: false }, { t: "Confirmation par email après inscription", c: true }, { t: "Payer deux fois", c: false }, { t: "Avoir deux comptes", c: false }] }
];

async function main() {
  let connection;

  try {
    console.log('Connexion à la base Docker...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connecté!');

    // Check if course exists
    const [existing] = await connection.query('SELECT id FROM courses WHERE slug = ?', [courseData.slug]);
    if (existing.length > 0) {
      console.log('Le cours existe déjà avec ID:', existing[0].id);
      return;
    }

    // 1. Create course
    console.log('\n1. Création du cours...');
    const [courseResult] = await connection.query(`
      INSERT INTO courses (title_fr, title_en, slug, description_fr, description_en, short_description_fr, short_description_en,
        level, duration_hours, estimated_weeks, min_passing_score, max_attempts, sequential_modules, is_free, status, is_featured, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [courseData.title_fr, courseData.title_en, courseData.slug, courseData.description_fr, courseData.description_en,
        courseData.short_description_fr, courseData.short_description_en, courseData.level, courseData.duration_hours,
        courseData.estimated_weeks, courseData.min_passing_score, courseData.max_attempts, courseData.sequential_modules,
        courseData.is_free, courseData.status, courseData.is_featured]);

    const courseId = courseResult.insertId;
    console.log('   Cours créé ID:', courseId);

    // 2. Create quiz
    console.log('\n2. Création du quiz...');
    const [quizResult] = await connection.query(`
      INSERT INTO quizzes (title_fr, title_en, description_fr, quiz_type, time_limit_minutes, passing_score, max_attempts,
        shuffle_questions, shuffle_options, show_correct_answers, show_score_immediately, course_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, ['Évaluation Finale - Formation OneHealth', 'Final Evaluation - OneHealth Training',
        'Quiz de validation de la formation', 'final_exam', 60, 50, 3, true, true, true, true, courseId, 'published']);

    const quizId = quizResult.insertId;
    console.log('   Quiz créé ID:', quizId);

    // 3. Create questions
    console.log('\n3. Création des questions...');
    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i];
      const options = q.options.map((o, idx) => ({ id: idx + 1, text_fr: o.t, text_en: o.t, is_correct: o.c }));

      const [qResult] = await connection.query(`
        INSERT INTO questions (question_text_fr, question_text_en, question_type, options, points, difficulty, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [q.q, q.q, 'mcq', JSON.stringify(options), 1, 'medium']);

      await connection.query('INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (?, ?, ?)',
        [quizId, qResult.insertId, i + 1]);
    }
    console.log('   10 questions créées');

    // 4. Create modules and lessons
    console.log('\n4. Création des modules et leçons...');
    let lessonCount = 0;

    for (let m = 0; m < modules.length; m++) {
      const mod = modules[m];
      const [modResult] = await connection.query(`
        INSERT INTO course_modules (course_id, title_fr, title_en, description_fr, sort_order, sequential_lessons, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [courseId, mod.title_fr, mod.title_en, mod.description_fr, m + 1, true, 'published']);

      const moduleId = modResult.insertId;
      console.log('   Module', m + 1, ':', mod.title_fr);

      for (let l = 0; l < mod.lessons.length; l++) {
        const lesson = mod.lessons[l];
        await connection.query(`
          INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_en, content_type, duration_minutes, sort_order, is_required, completion_type, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [moduleId, lesson.title_fr, lesson.title_en, lesson.content, lesson.content, 'text', lesson.duration, l + 1, true, 'view', 'published']);
        lessonCount++;
      }
    }
    console.log('   ', lessonCount, 'leçons créées');

    console.log('\n========================================');
    console.log('COURS CRÉÉ AVEC SUCCÈS !');
    console.log('========================================');
    console.log('ID:', courseId);
    console.log('Slug:', courseData.slug);
    console.log('5 modules, 20 leçons, 10 questions');
    console.log('========================================');

  } catch (error) {
    console.error('Erreur:', error.message);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

main().catch(console.error);
