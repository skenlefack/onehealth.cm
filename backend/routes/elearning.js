/**
 * ONE HEALTH E-LEARNING API ROUTES
 *
 * Routes pour la gestion du module e-learning:
 * - Catégories
 * - Cours
 * - Modules
 * - Leçons
 * - Quiz & Questions
 * - Inscriptions & Progression
 * - Certificats
 * - Parcours diplômants
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, authorize, optionalAuth } = require('../middleware/auth');
const slugify = require('slugify');
const { v4: uuidv4 } = require('uuid');
const { generateCertificatePDF } = require('../services/certificateService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration multer pour les images de certificats
const certificateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/certificates');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadCertificateImage = multer({
  storage: certificateStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'), false);
    }
  }
});

// ============================================
// HELPERS
// ============================================

const generateSlug = async (title, table) => {
  let slug = slugify(title, { lower: true, strict: true, locale: 'fr' });
  const [existing] = await db.query(`SELECT id FROM ${table} WHERE slug = ?`, [slug]);
  if (existing.length > 0) {
    slug = `${slug}-${Date.now()}`;
  }
  return slug;
};

const generateCertificateNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CERT-OH-${year}-${random}`;
};

const generateVerificationCode = () => {
  return uuidv4().replace(/-/g, '').substring(0, 20).toUpperCase();
};

// Calculer la progression d'un cours pour un utilisateur
const calculateCourseProgress = async (userId, courseId, enrollmentId) => {
  // Compter le total des leçons du cours
  const [[{ totalLessons }]] = await db.query(`
    SELECT COUNT(l.id) as totalLessons
    FROM lessons l
    JOIN course_modules m ON l.module_id = m.id
    WHERE m.course_id = ? AND l.status = 'published' AND l.is_active = 1
  `, [courseId]);

  if (totalLessons === 0) return 0;

  // Compter les leçons complétées
  const [[{ completedLessons }]] = await db.query(`
    SELECT COUNT(lp.id) as completedLessons
    FROM lesson_progress lp
    JOIN lessons l ON lp.lesson_id = l.id
    JOIN course_modules m ON l.module_id = m.id
    WHERE lp.user_id = ? AND m.course_id = ? AND lp.status = 'completed'
  `, [userId, courseId]);

  return Math.round((completedLessons / totalLessons) * 100);
};

// ============================================
// CATÉGORIES E-LEARNING
// ============================================

// GET /api/elearning/categories - Liste des catégories
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM courses WHERE category_id = c.id AND status = 'published') as course_count
      FROM elearning_categories c
      WHERE c.is_active = 1
      ORDER BY c.sort_order ASC, c.name_fr ASC
    `);

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/elearning/categories - Créer une catégorie
router.post('/categories', auth, authorize('admin'), async (req, res) => {
  try {
    const { name_fr, name_en, description_fr, description_en, icon, color, parent_id, sort_order } = req.body;

    if (!name_fr) {
      return res.status(400).json({ success: false, message: 'Le nom en français est requis' });
    }

    const slug = await generateSlug(name_fr, 'elearning_categories');

    const [result] = await db.query(`
      INSERT INTO elearning_categories (name_fr, name_en, slug, description_fr, description_en, icon, color, parent_id, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name_fr, name_en, slug, description_fr, description_en, icon, color || '#2196F3', parent_id, sort_order || 0]);

    const [newCategory] = await db.query('SELECT * FROM elearning_categories WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, data: newCategory[0], message: 'Catégorie créée' });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/elearning/categories/:id - Modifier une catégorie
router.put('/categories/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name_fr, name_en, description_fr, description_en, icon, color, parent_id, sort_order, is_active } = req.body;

    const [existing] = await db.query('SELECT * FROM elearning_categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }

    await db.query(`
      UPDATE elearning_categories SET
        name_fr = COALESCE(?, name_fr),
        name_en = COALESCE(?, name_en),
        description_fr = COALESCE(?, description_fr),
        description_en = COALESCE(?, description_en),
        icon = COALESCE(?, icon),
        color = COALESCE(?, color),
        parent_id = ?,
        sort_order = COALESCE(?, sort_order),
        is_active = COALESCE(?, is_active)
      WHERE id = ?
    `, [name_fr, name_en, description_fr, description_en, icon, color, parent_id, sort_order, is_active, id]);

    const [updated] = await db.query('SELECT * FROM elearning_categories WHERE id = ?', [id]);

    res.json({ success: true, data: updated[0], message: 'Catégorie mise à jour' });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/elearning/categories/:id - Supprimer une catégorie
router.delete('/categories/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM elearning_categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }

    // Soft delete
    await db.query('UPDATE elearning_categories SET is_active = 0 WHERE id = ?', [id]);

    res.json({ success: true, message: 'Catégorie supprimée' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// COURS
// ============================================

// GET /api/elearning/courses - Liste des cours
router.get('/courses', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      status,
      category,
      level,
      search,
      featured,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['c.is_active = 1'];
    let params = [];

    // Filtrer par statut selon les permissions
    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      whereConditions.push("c.status = 'published'");
    } else if (status) {
      whereConditions.push('c.status = ?');
      params.push(status);
    }

    // Filtres
    if (category) {
      whereConditions.push('(cat.slug = ? OR cat.id = ?)');
      params.push(category, category);
    }

    if (level) {
      whereConditions.push('c.level = ?');
      params.push(level);
    }

    if (featured === 'true') {
      whereConditions.push('c.is_featured = 1');
    }

    if (search) {
      whereConditions.push('(c.title_fr LIKE ? OR c.title_en LIKE ? OR c.description_fr LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Total count
    const [[{ total }]] = await db.query(`
      SELECT COUNT(DISTINCT c.id) as total
      FROM courses c
      LEFT JOIN elearning_categories cat ON c.category_id = cat.id
      ${whereClause}
    `, params);

    // Validation du tri
    const allowedSorts = ['created_at', 'published_at', 'title_fr', 'enrolled_count', 'average_rating', 'duration_hours'];
    const sortField = allowedSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Requête principale
    const [courses] = await db.query(`
      SELECT c.*,
        cat.name_fr as category_name_fr,
        cat.name_en as category_name_en,
        cat.slug as category_slug,
        cat.color as category_color,
        i.id as instructor_id,
        u.first_name as instructor_first_name,
        u.last_name as instructor_last_name,
        u.avatar as instructor_avatar,
        i.title_fr as instructor_title_fr,
        (SELECT COUNT(*) FROM course_modules WHERE course_id = c.id AND status = 'published') as module_count,
        (SELECT COUNT(*) FROM lessons l JOIN course_modules m ON l.module_id = m.id WHERE m.course_id = c.id AND l.status = 'published') as lesson_count
      FROM courses c
      LEFT JOIN elearning_categories cat ON c.category_id = cat.id
      LEFT JOIN instructors i ON c.instructor_id = i.id
      LEFT JOIN users u ON i.user_id = u.id
      ${whereClause}
      ORDER BY c.${sortField} ${sortOrder}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      data: courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/elearning/courses/featured - Cours en vedette
router.get('/courses/featured', async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const [courses] = await db.query(`
      SELECT c.*,
        cat.name_fr as category_name_fr,
        cat.slug as category_slug,
        cat.color as category_color,
        u.first_name as instructor_first_name,
        u.last_name as instructor_last_name,
        (SELECT COUNT(*) FROM course_modules WHERE course_id = c.id AND status = 'published') as module_count,
        (SELECT COUNT(*) FROM lessons l JOIN course_modules m ON l.module_id = m.id WHERE m.course_id = c.id AND l.status = 'published') as lesson_count
      FROM courses c
      LEFT JOIN elearning_categories cat ON c.category_id = cat.id
      LEFT JOIN instructors i ON c.instructor_id = i.id
      LEFT JOIN users u ON i.user_id = u.id
      WHERE c.status = 'published' AND c.is_active = 1 AND c.is_featured = 1
      ORDER BY c.enrolled_count DESC, c.average_rating DESC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Get featured courses error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/elearning/courses/:slug - Détail d'un cours
router.get('/courses/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    let query = `
      SELECT c.*,
        cat.name_fr as category_name_fr,
        cat.name_en as category_name_en,
        cat.slug as category_slug,
        cat.color as category_color,
        i.id as instructor_id,
        i.bio_fr as instructor_bio_fr,
        i.bio_en as instructor_bio_en,
        i.expertise as instructor_expertise,
        i.course_count as instructor_course_count,
        i.student_count as instructor_student_count,
        i.average_rating as instructor_rating,
        u.first_name as instructor_first_name,
        u.last_name as instructor_last_name,
        u.avatar as instructor_avatar
      FROM courses c
      LEFT JOIN elearning_categories cat ON c.category_id = cat.id
      LEFT JOIN instructors i ON c.instructor_id = i.id
      LEFT JOIN users u ON i.user_id = u.id
      WHERE c.slug = ? AND c.is_active = 1
    `;

    const params = [slug];

    // Vérifier les permissions
    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      query += " AND c.status = 'published'";
    }

    const [courses] = await db.query(query, params);

    if (courses.length === 0) {
      return res.status(404).json({ success: false, message: 'Cours non trouvé' });
    }

    const course = courses[0];

    // Incrémenter le compteur de vues
    await db.query('UPDATE courses SET view_count = view_count + 1 WHERE id = ?', [course.id]);

    // Récupérer les modules avec leurs leçons
    const [modules] = await db.query(`
      SELECT m.*,
        (SELECT COUNT(*) FROM lessons WHERE module_id = m.id AND status = 'published') as lesson_count
      FROM course_modules m
      WHERE m.course_id = ? AND m.status = 'published' AND m.is_active = 1
      ORDER BY m.sort_order ASC
    `, [course.id]);

    for (let module of modules) {
      const [lessons] = await db.query(`
        SELECT id, title_fr, title_en, content_type, duration_minutes, is_preview, sort_order
        FROM lessons
        WHERE module_id = ? AND status = 'published' AND is_active = 1
        ORDER BY sort_order ASC
      `, [module.id]);
      module.lessons = lessons;
    }

    course.modules = modules;

    // Si l'utilisateur est connecté, vérifier son inscription
    if (req.user) {
      const [enrollment] = await db.query(`
        SELECT * FROM enrollments
        WHERE user_id = ? AND enrollable_type = 'course' AND enrollable_id = ?
      `, [req.user.id, course.id]);

      course.enrollment = enrollment.length > 0 ? enrollment[0] : null;
    }

    res.json({ success: true, data: course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/elearning/courses/:id/curriculum - Programme complet
router.get('/courses/:id/curriculum', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const [course] = await db.query('SELECT id, title_fr, sequential_modules FROM courses WHERE id = ?', [id]);
    if (course.length === 0) {
      return res.status(404).json({ success: false, message: 'Cours non trouvé' });
    }

    const sequentialModules = course[0].sequential_modules;

    const [modules] = await db.query(`
      SELECT * FROM course_modules
      WHERE course_id = ? AND is_active = 1
      ORDER BY sort_order ASC
    `, [id]);

    // Track completion status for sequential unlock logic
    let previousLessonCompleted = true;
    let previousModuleCompleted = true;

    for (let moduleIdx = 0; moduleIdx < modules.length; moduleIdx++) {
      const module = modules[moduleIdx];
      const [lessons] = await db.query(`
        SELECT * FROM lessons
        WHERE module_id = ? AND is_active = 1
        ORDER BY sort_order ASC
      `, [module.id]);

      // Get progress for each lesson if user is authenticated
      if (userId) {
        for (let lessonIdx = 0; lessonIdx < lessons.length; lessonIdx++) {
          const lesson = lessons[lessonIdx];
          const [progress] = await db.query(`
            SELECT status, progress_percent FROM lesson_progress
            WHERE user_id = ? AND lesson_id = ?
          `, [userId, lesson.id]);

          lesson.is_completed = progress.length > 0 && progress[0].status === 'completed';
          lesson.progress_percent = progress.length > 0 ? progress[0].progress_percent : 0;

          // Determine if lesson is locked (sequential unlock logic)
          if (sequentialModules) {
            // First lesson of first module is never locked
            if (moduleIdx === 0 && lessonIdx === 0) {
              lesson.is_locked = false;
            } else if (lessonIdx === 0) {
              // First lesson of a module: locked if previous module not completed
              lesson.is_locked = !previousModuleCompleted;
            } else {
              // Other lessons: locked if previous lesson not completed
              lesson.is_locked = !previousLessonCompleted;
            }
          } else {
            lesson.is_locked = false;
          }

          previousLessonCompleted = lesson.is_completed;
        }

        // Check if this module is completed (all lessons completed)
        previousModuleCompleted = lessons.every(l => l.is_completed);
      } else {
        // No user - mark all as not completed, not locked
        lessons.forEach(lesson => {
          lesson.is_completed = false;
          lesson.is_locked = false;
          lesson.progress_percent = 0;
        });
      }

      module.lessons = lessons;
    }

    res.json({ success: true, data: { course: course[0], modules } });
  } catch (error) {
    console.error('Get curriculum error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/elearning/courses - Créer un cours
router.post('/courses', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const {
      title_fr, title_en,
      description_fr, description_en,
      short_description_fr, short_description_en,
      thumbnail, cover_image, intro_video_url,
      level, duration_hours, estimated_weeks,
      min_passing_score, max_attempts, sequential_modules,
      is_free, price,
      instructor_id, category_id,
      learning_objectives, prerequisites, target_audience, what_you_will_learn, requirements,
      tags, status, is_featured,
      final_quiz_id, final_quiz_weight, module_quizzes_weight
    } = req.body;

    if (!title_fr) {
      return res.status(400).json({ success: false, message: 'Le titre en français est requis' });
    }

    const slug = await generateSlug(title_fr, 'courses');

    const [result] = await db.query(`
      INSERT INTO courses (
        title_fr, title_en, slug,
        description_fr, description_en,
        short_description_fr, short_description_en,
        thumbnail, cover_image, intro_video_url,
        level, duration_hours, estimated_weeks,
        min_passing_score, max_attempts, sequential_modules,
        is_free, price,
        instructor_id, category_id,
        learning_objectives, prerequisites, target_audience, what_you_will_learn, requirements,
        tags, status, is_featured,
        published_at,
        final_quiz_id, final_quiz_weight, module_quizzes_weight
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title_fr, title_en, slug,
      description_fr, description_en,
      short_description_fr, short_description_en,
      thumbnail, cover_image, intro_video_url,
      level || 'beginner', duration_hours || 0, estimated_weeks || 0,
      min_passing_score || 70, max_attempts || 3, sequential_modules !== false,
      is_free !== false, price || 0,
      instructor_id, category_id,
      JSON.stringify(learning_objectives || []),
      JSON.stringify(prerequisites || []),
      JSON.stringify(target_audience || []),
      JSON.stringify(what_you_will_learn || []),
      JSON.stringify(requirements || []),
      JSON.stringify(tags || []),
      status || 'draft',
      is_featured || false,
      status === 'published' ? new Date() : null,
      final_quiz_id || null,
      final_quiz_weight || 1.00,
      module_quizzes_weight || 1.00
    ]);

    const [newCourse] = await db.query('SELECT * FROM courses WHERE id = ?', [result.insertId]);

    // Log d'activité
    await db.query(`
      INSERT INTO elearning_activity_log (user_id, action, entity_type, entity_id, details)
      VALUES (?, 'create', 'course', ?, ?)
    `, [req.user.id, result.insertId, JSON.stringify({ title: title_fr })]);

    res.status(201).json({ success: true, data: newCourse[0], message: 'Cours créé avec succès' });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/elearning/courses/:id - Modifier un cours
router.put('/courses/:id', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [existing] = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Cours non trouvé' });
    }

    // Construire la requête de mise à jour dynamiquement
    const allowedFields = [
      'title_fr', 'title_en', 'description_fr', 'description_en',
      'short_description_fr', 'short_description_en',
      'thumbnail', 'cover_image', 'intro_video_url',
      'level', 'duration_hours', 'estimated_weeks',
      'min_passing_score', 'max_attempts', 'sequential_modules',
      'is_free', 'price', 'instructor_id', 'category_id',
      'status', 'is_featured', 'sort_order',
      'final_quiz_id', 'final_quiz_weight', 'module_quizzes_weight'
    ];

    const jsonFields = ['learning_objectives', 'prerequisites', 'target_audience', 'what_you_will_learn', 'requirements', 'tags'];

    const setClauses = [];
    const params = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = ?`);
        params.push(value);
      } else if (jsonFields.includes(key)) {
        setClauses.push(`${key} = ?`);
        params.push(JSON.stringify(value));
      }
    }

    // Gérer le changement de statut vers published
    if (updates.status === 'published' && existing[0].status !== 'published') {
      setClauses.push('published_at = NOW()');
    }

    if (setClauses.length > 0) {
      params.push(id);
      await db.query(`UPDATE courses SET ${setClauses.join(', ')} WHERE id = ?`, params);
    }

    const [updated] = await db.query('SELECT * FROM courses WHERE id = ?', [id]);

    res.json({ success: true, data: updated[0], message: 'Cours mis à jour' });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/elearning/courses/:id - Supprimer un cours
router.delete('/courses/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Cours non trouvé' });
    }

    // Soft delete
    await db.query("UPDATE courses SET status = 'archived', is_active = 0 WHERE id = ?", [id]);

    res.json({ success: true, message: 'Cours supprimé' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// MODULES
// ============================================

// GET /api/elearning/courses/:courseId/modules - Modules d'un cours
router.get('/courses/:courseId/modules', optionalAuth, async (req, res) => {
  try {
    const { courseId } = req.params;

    const [modules] = await db.query(`
      SELECT m.*,
        (SELECT COUNT(*) FROM lessons WHERE module_id = m.id AND is_active = 1) as lesson_count,
        (SELECT SUM(duration_minutes) FROM lessons WHERE module_id = m.id AND is_active = 1) as total_duration
      FROM course_modules m
      WHERE m.course_id = ? AND m.is_active = 1
      ORDER BY m.sort_order ASC
    `, [courseId]);

    res.json({ success: true, data: modules });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/elearning/modules - Créer un module
router.post('/modules', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const {
      course_id, title_fr, title_en,
      description_fr, description_en,
      thumbnail, duration_minutes, sort_order,
      sequential_lessons, has_quiz, quiz_id, min_quiz_score,
      status, quiz_weight
    } = req.body;

    if (!course_id || !title_fr) {
      return res.status(400).json({ success: false, message: 'Le cours et le titre sont requis' });
    }

    // Vérifier que le cours existe
    const [course] = await db.query('SELECT id FROM courses WHERE id = ?', [course_id]);
    if (course.length === 0) {
      return res.status(404).json({ success: false, message: 'Cours non trouvé' });
    }

    // Obtenir le prochain sort_order si non fourni
    let order = sort_order;
    if (order === undefined) {
      const [[{ maxOrder }]] = await db.query(
        'SELECT COALESCE(MAX(sort_order), 0) as maxOrder FROM course_modules WHERE course_id = ?',
        [course_id]
      );
      order = maxOrder + 1;
    }

    const [result] = await db.query(`
      INSERT INTO course_modules (
        course_id, title_fr, title_en,
        description_fr, description_en,
        thumbnail, duration_minutes, sort_order,
        sequential_lessons, has_quiz, quiz_id, min_quiz_score,
        status, quiz_weight
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      course_id, title_fr, title_en,
      description_fr, description_en,
      thumbnail, duration_minutes || 0, order,
      sequential_lessons !== false, has_quiz || false, quiz_id, min_quiz_score || 70,
      status || 'draft', quiz_weight || 1.00
    ]);

    const [newModule] = await db.query('SELECT * FROM course_modules WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, data: newModule[0], message: 'Module créé' });
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/elearning/modules/:id - Modifier un module
router.put('/modules/:id', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title_fr, title_en, description_fr, description_en,
      thumbnail, duration_minutes, sort_order,
      sequential_lessons, has_quiz, quiz_id, min_quiz_score,
      status, is_active, quiz_weight
    } = req.body;

    const [existing] = await db.query('SELECT * FROM course_modules WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Module non trouvé' });
    }

    await db.query(`
      UPDATE course_modules SET
        title_fr = COALESCE(?, title_fr),
        title_en = COALESCE(?, title_en),
        description_fr = COALESCE(?, description_fr),
        description_en = COALESCE(?, description_en),
        thumbnail = COALESCE(?, thumbnail),
        duration_minutes = COALESCE(?, duration_minutes),
        sort_order = COALESCE(?, sort_order),
        sequential_lessons = COALESCE(?, sequential_lessons),
        has_quiz = COALESCE(?, has_quiz),
        quiz_id = ?,
        min_quiz_score = COALESCE(?, min_quiz_score),
        status = COALESCE(?, status),
        is_active = COALESCE(?, is_active),
        quiz_weight = COALESCE(?, quiz_weight)
      WHERE id = ?
    `, [
      title_fr, title_en, description_fr, description_en,
      thumbnail, duration_minutes, sort_order,
      sequential_lessons, has_quiz, quiz_id, min_quiz_score,
      status, is_active, quiz_weight, id
    ]);

    const [updated] = await db.query('SELECT * FROM course_modules WHERE id = ?', [id]);

    res.json({ success: true, data: updated[0], message: 'Module mis à jour' });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/elearning/modules/:id - Supprimer un module
router.delete('/modules/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM course_modules WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Module non trouvé' });
    }

    // Soft delete
    await db.query('UPDATE course_modules SET is_active = 0 WHERE id = ?', [id]);

    res.json({ success: true, message: 'Module supprimé' });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/elearning/modules/reorder - Réordonner les modules
router.put('/modules/reorder', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { modules } = req.body; // [{ id: 1, sort_order: 0 }, ...]

    if (!Array.isArray(modules)) {
      return res.status(400).json({ success: false, message: 'Format invalide' });
    }

    for (const module of modules) {
      await db.query('UPDATE course_modules SET sort_order = ? WHERE id = ?', [module.sort_order, module.id]);
    }

    res.json({ success: true, message: 'Modules réordonnés' });
  } catch (error) {
    console.error('Reorder modules error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// LEÇONS
// ============================================

// GET /api/elearning/modules/:moduleId/lessons - Leçons d'un module
router.get('/modules/:moduleId/lessons', optionalAuth, async (req, res) => {
  try {
    const { moduleId } = req.params;

    const [lessons] = await db.query(`
      SELECT * FROM lessons
      WHERE module_id = ? AND is_active = 1
      ORDER BY sort_order ASC
    `, [moduleId]);

    res.json({ success: true, data: lessons });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/elearning/lessons/:id - Détail d'une leçon
router.get('/lessons/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [lessons] = await db.query(`
      SELECT l.*, m.course_id, m.title_fr as module_title_fr
      FROM lessons l
      JOIN course_modules m ON l.module_id = m.id
      WHERE l.id = ? AND l.is_active = 1
    `, [id]);

    if (lessons.length === 0) {
      return res.status(404).json({ success: false, message: 'Leçon non trouvée' });
    }

    const lesson = lessons[0];

    // Vérifier que l'utilisateur est inscrit au cours (sauf si preview)
    if (!lesson.is_preview) {
      const [enrollment] = await db.query(`
        SELECT * FROM enrollments
        WHERE user_id = ? AND enrollable_type = 'course' AND enrollable_id = ?
      `, [req.user.id, lesson.course_id]);

      if (enrollment.length === 0 && !['admin', 'editor'].includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Vous devez être inscrit à ce cours' });
      }
    }

    // Récupérer la progression de l'utilisateur
    const [progress] = await db.query(`
      SELECT * FROM lesson_progress
      WHERE user_id = ? AND lesson_id = ?
    `, [req.user.id, id]);

    lesson.progress = progress.length > 0 ? progress[0] : null;

    // Leçons précédente et suivante
    const [prevNext] = await db.query(`
      SELECT id, title_fr, sort_order,
        CASE WHEN sort_order < ? THEN 'prev' ELSE 'next' END as position
      FROM lessons
      WHERE module_id = ? AND is_active = 1 AND id != ?
      ORDER BY ABS(sort_order - ?)
      LIMIT 2
    `, [lesson.sort_order, lesson.module_id, id, lesson.sort_order]);

    lesson.prev_lesson = prevNext.find(l => l.position === 'prev' && l.sort_order < lesson.sort_order) || null;
    lesson.next_lesson = prevNext.find(l => l.position === 'next' && l.sort_order > lesson.sort_order) || null;

    res.json({ success: true, data: lesson });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/elearning/lessons - Créer une leçon
router.post('/lessons', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const {
      module_id, title_fr, title_en,
      content_fr, content_en, summary_fr, summary_en,
      content_type, video_url, video_duration_seconds, video_provider, video_thumbnail,
      pdf_url, attachments, resources,
      duration_minutes, sort_order, is_preview, is_required, is_downloadable,
      has_quiz, quiz_id, quiz_position, quiz_weight,
      completion_type, min_video_watch_percent, min_time_spent_seconds,
      status
    } = req.body;

    if (!module_id || !title_fr) {
      return res.status(400).json({ success: false, message: 'Le module et le titre sont requis' });
    }

    // Vérifier que le module existe
    const [module] = await db.query('SELECT id FROM course_modules WHERE id = ?', [module_id]);
    if (module.length === 0) {
      return res.status(404).json({ success: false, message: 'Module non trouvé' });
    }

    // Obtenir le prochain sort_order si non fourni
    let order = sort_order;
    if (order === undefined) {
      const [[{ maxOrder }]] = await db.query(
        'SELECT COALESCE(MAX(sort_order), 0) as maxOrder FROM lessons WHERE module_id = ?',
        [module_id]
      );
      order = maxOrder + 1;
    }

    const [result] = await db.query(`
      INSERT INTO lessons (
        module_id, title_fr, title_en,
        content_fr, content_en, summary_fr, summary_en,
        content_type, video_url, video_duration_seconds, video_provider, video_thumbnail,
        pdf_url, attachments, resources,
        duration_minutes, sort_order, is_preview, is_required, is_downloadable,
        has_quiz, quiz_id, quiz_position, quiz_weight,
        completion_type, min_video_watch_percent, min_time_spent_seconds,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      module_id, title_fr, title_en,
      content_fr, content_en, summary_fr, summary_en,
      content_type || 'text', video_url, video_duration_seconds || 0, video_provider || 'upload', video_thumbnail,
      pdf_url, JSON.stringify(attachments || []), JSON.stringify(resources || []),
      duration_minutes || 0, order, is_preview || false, is_required !== false, is_downloadable || false,
      has_quiz || false, quiz_id, quiz_position || 'end', quiz_weight || 1.00,
      completion_type || 'view', min_video_watch_percent || 80, min_time_spent_seconds || 0,
      status || 'draft'
    ]);

    // Mettre à jour le compteur de leçons du module
    await db.query(`
      UPDATE course_modules SET lesson_count = (
        SELECT COUNT(*) FROM lessons WHERE module_id = ? AND is_active = 1
      ) WHERE id = ?
    `, [module_id, module_id]);

    const [newLesson] = await db.query('SELECT * FROM lessons WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, data: newLesson[0], message: 'Leçon créée' });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/elearning/lessons/:id - Modifier une leçon
router.put('/lessons/:id', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [existing] = await db.query('SELECT * FROM lessons WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Leçon non trouvée' });
    }

    const allowedFields = [
      'title_fr', 'title_en', 'content_fr', 'content_en', 'summary_fr', 'summary_en',
      'content_type', 'video_url', 'video_duration_seconds', 'video_provider', 'video_thumbnail',
      'pdf_url', 'duration_minutes', 'sort_order', 'is_preview', 'is_required', 'is_downloadable',
      'has_quiz', 'quiz_id', 'quiz_position', 'quiz_weight',
      'completion_type', 'min_video_watch_percent', 'min_time_spent_seconds',
      'status', 'is_active'
    ];

    const jsonFields = ['attachments', 'resources'];

    const setClauses = [];
    const params = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = ?`);
        params.push(value);
      } else if (jsonFields.includes(key)) {
        setClauses.push(`${key} = ?`);
        params.push(JSON.stringify(value));
      }
    }

    if (setClauses.length > 0) {
      params.push(id);
      await db.query(`UPDATE lessons SET ${setClauses.join(', ')} WHERE id = ?`, params);
    }

    const [updated] = await db.query('SELECT * FROM lessons WHERE id = ?', [id]);

    res.json({ success: true, data: updated[0], message: 'Leçon mise à jour' });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/elearning/lessons/:id - Supprimer une leçon
router.delete('/lessons/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT module_id FROM lessons WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Leçon non trouvée' });
    }

    // Soft delete
    await db.query('UPDATE lessons SET is_active = 0 WHERE id = ?', [id]);

    // Mettre à jour le compteur de leçons du module
    await db.query(`
      UPDATE course_modules SET lesson_count = (
        SELECT COUNT(*) FROM lessons WHERE module_id = ? AND is_active = 1
      ) WHERE id = ?
    `, [existing[0].module_id, existing[0].module_id]);

    res.json({ success: true, message: 'Leçon supprimée' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// INSCRIPTIONS
// ============================================

// GET /api/elearning/enrollments - Mes inscriptions
router.get('/enrollments', auth, async (req, res) => {
  try {
    const { status, type } = req.query;

    let whereConditions = ['e.user_id = ?'];
    let params = [req.user.id];

    if (status) {
      whereConditions.push('e.status = ?');
      params.push(status);
    }

    if (type) {
      whereConditions.push('e.enrollable_type = ?');
      params.push(type);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const [enrollments] = await db.query(`
      SELECT e.*,
        CASE
          WHEN e.enrollable_type = 'course' THEN c.title_fr
          WHEN e.enrollable_type = 'learning_path' THEN lp.title_fr
        END as title_fr,
        CASE
          WHEN e.enrollable_type = 'course' THEN c.title_en
          WHEN e.enrollable_type = 'learning_path' THEN lp.title_en
        END as title_en,
        CASE
          WHEN e.enrollable_type = 'course' THEN c.thumbnail
          WHEN e.enrollable_type = 'learning_path' THEN lp.thumbnail
        END as thumbnail,
        CASE
          WHEN e.enrollable_type = 'course' THEN c.level
          WHEN e.enrollable_type = 'learning_path' THEN lp.level
        END as level,
        CASE
          WHEN e.enrollable_type = 'course' THEN c.slug
          WHEN e.enrollable_type = 'learning_path' THEN lp.slug
        END as slug
      FROM enrollments e
      LEFT JOIN courses c ON e.enrollable_type = 'course' AND e.enrollable_id = c.id
      LEFT JOIN learning_paths lp ON e.enrollable_type = 'learning_path' AND e.enrollable_id = lp.id
      ${whereClause}
      ORDER BY e.last_accessed_at DESC, e.enrolled_at DESC
    `, params);

    res.json({ success: true, data: enrollments });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/elearning/enroll - S'inscrire à un cours ou parcours
router.post('/enroll', auth, async (req, res) => {
  try {
    const { enrollable_type, enrollable_id } = req.body;

    if (!['course', 'learning_path'].includes(enrollable_type)) {
      return res.status(400).json({ success: false, message: 'Type invalide' });
    }

    // Vérifier que l'entité existe
    const table = enrollable_type === 'course' ? 'courses' : 'learning_paths';
    const [entity] = await db.query(`SELECT id, title_fr FROM ${table} WHERE id = ? AND status = 'published'`, [enrollable_id]);

    if (entity.length === 0) {
      return res.status(404).json({ success: false, message: 'Élément non trouvé' });
    }

    // Vérifier si déjà inscrit
    const [existing] = await db.query(`
      SELECT * FROM enrollments
      WHERE user_id = ? AND enrollable_type = ? AND enrollable_id = ?
    `, [req.user.id, enrollable_type, enrollable_id]);

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Vous êtes déjà inscrit' });
    }

    // Créer l'inscription
    const [result] = await db.query(`
      INSERT INTO enrollments (user_id, enrollable_type, enrollable_id, status, enrolled_at)
      VALUES (?, ?, ?, 'enrolled', NOW())
    `, [req.user.id, enrollable_type, enrollable_id]);

    // Mettre à jour le compteur d'inscriptions
    await db.query(`UPDATE ${table} SET enrolled_count = enrolled_count + 1 WHERE id = ?`, [enrollable_id]);

    const [enrollment] = await db.query('SELECT * FROM enrollments WHERE id = ?', [result.insertId]);

    // Log d'activité
    await db.query(`
      INSERT INTO elearning_activity_log (user_id, action, entity_type, entity_id, details)
      VALUES (?, 'enroll', ?, ?, ?)
    `, [req.user.id, enrollable_type, enrollable_id, JSON.stringify({ title: entity[0].title_fr })]);

    res.status(201).json({ success: true, data: enrollment[0], message: 'Inscription réussie' });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/elearning/enrollments/:id - Se désinscrire
router.delete('/enrollments/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [enrollment] = await db.query(`
      SELECT * FROM enrollments WHERE id = ? AND user_id = ?
    `, [id, req.user.id]);

    if (enrollment.length === 0) {
      return res.status(404).json({ success: false, message: 'Inscription non trouvée' });
    }

    // Mettre à jour le statut
    await db.query("UPDATE enrollments SET status = 'cancelled' WHERE id = ?", [id]);

    // Mettre à jour le compteur
    const table = enrollment[0].enrollable_type === 'course' ? 'courses' : 'learning_paths';
    await db.query(`UPDATE ${table} SET enrolled_count = enrolled_count - 1 WHERE id = ? AND enrolled_count > 0`, [enrollment[0].enrollable_id]);

    res.json({ success: true, message: 'Désinscription effectuée' });
  } catch (error) {
    console.error('Unenroll error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/elearning/enrollments/:id/progress - Progression détaillée
router.get('/enrollments/:id/progress', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [enrollment] = await db.query(`
      SELECT * FROM enrollments WHERE id = ? AND user_id = ?
    `, [id, req.user.id]);

    if (enrollment.length === 0) {
      return res.status(404).json({ success: false, message: 'Inscription non trouvée' });
    }

    const enroll = enrollment[0];

    if (enroll.enrollable_type === 'course') {
      // Récupérer la progression par module
      const [modules] = await db.query(`
        SELECT m.id, m.title_fr, m.sort_order,
          mp.status as module_status,
          mp.progress_percent as module_progress,
          (SELECT COUNT(*) FROM lessons WHERE module_id = m.id AND is_active = 1) as total_lessons,
          (SELECT COUNT(*) FROM lesson_progress lp
           JOIN lessons l ON lp.lesson_id = l.id
           WHERE l.module_id = m.id AND lp.user_id = ? AND lp.status = 'completed') as completed_lessons
        FROM course_modules m
        LEFT JOIN module_progress mp ON mp.module_id = m.id AND mp.user_id = ?
        WHERE m.course_id = ? AND m.is_active = 1
        ORDER BY m.sort_order ASC
      `, [req.user.id, req.user.id, enroll.enrollable_id]);

      // Récupérer la progression par leçon
      const [lessons] = await db.query(`
        SELECT l.id, l.title_fr, l.module_id, l.content_type, l.duration_minutes, l.sort_order,
          lp.status, lp.progress_percent, lp.completed_at, lp.time_spent_seconds
        FROM lessons l
        JOIN course_modules m ON l.module_id = m.id
        LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = ?
        WHERE m.course_id = ? AND l.is_active = 1
        ORDER BY m.sort_order ASC, l.sort_order ASC
      `, [req.user.id, enroll.enrollable_id]);

      res.json({
        success: true,
        data: {
          enrollment: enroll,
          modules,
          lessons
        }
      });
    } else {
      // Progression pour un parcours
      const [courses] = await db.query(`
        SELECT c.id, c.title_fr, c.slug, c.thumbnail, lpc.sort_order,
          e.status as enrollment_status,
          e.progress_percent,
          e.completed_at
        FROM learning_path_courses lpc
        JOIN courses c ON lpc.course_id = c.id
        LEFT JOIN enrollments e ON e.enrollable_type = 'course' AND e.enrollable_id = c.id AND e.user_id = ?
        WHERE lpc.learning_path_id = ?
        ORDER BY lpc.sort_order ASC
      `, [req.user.id, enroll.enrollable_id]);

      res.json({
        success: true,
        data: {
          enrollment: enroll,
          courses
        }
      });
    }
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/elearning/lessons/:id/progress - Mettre à jour la progression
router.post('/lessons/:id/progress', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      progress_percent,
      video_watch_time_seconds,
      video_last_position_seconds,
      time_spent_seconds
    } = req.body;

    // Récupérer la leçon et vérifier l'inscription
    const [lesson] = await db.query(`
      SELECT l.*, m.course_id FROM lessons l
      JOIN course_modules m ON l.module_id = m.id
      WHERE l.id = ?
    `, [id]);

    if (lesson.length === 0) {
      return res.status(404).json({ success: false, message: 'Leçon non trouvée' });
    }

    // Vérifier l'inscription
    const [enrollment] = await db.query(`
      SELECT * FROM enrollments
      WHERE user_id = ? AND enrollable_type = 'course' AND enrollable_id = ?
    `, [req.user.id, lesson[0].course_id]);

    if (enrollment.length === 0) {
      return res.status(403).json({ success: false, message: 'Non inscrit à ce cours' });
    }

    // Mettre à jour ou créer la progression
    const [existing] = await db.query(`
      SELECT * FROM lesson_progress WHERE user_id = ? AND lesson_id = ?
    `, [req.user.id, id]);

    if (existing.length === 0) {
      await db.query(`
        INSERT INTO lesson_progress (
          user_id, lesson_id, enrollment_id, status,
          progress_percent, video_watch_time_seconds, video_last_position_seconds,
          time_spent_seconds, first_accessed_at, last_accessed_at
        ) VALUES (?, ?, ?, 'in_progress', ?, ?, ?, ?, NOW(), NOW())
      `, [
        req.user.id, id, enrollment[0].id,
        progress_percent || 0, video_watch_time_seconds || 0, video_last_position_seconds || 0,
        time_spent_seconds || 0
      ]);
    } else {
      await db.query(`
        UPDATE lesson_progress SET
          progress_percent = GREATEST(progress_percent, ?),
          video_watch_time_seconds = GREATEST(video_watch_time_seconds, ?),
          video_last_position_seconds = ?,
          time_spent_seconds = time_spent_seconds + ?,
          last_accessed_at = NOW(),
          access_count = access_count + 1,
          status = CASE WHEN status = 'not_started' THEN 'in_progress' ELSE status END
        WHERE user_id = ? AND lesson_id = ?
      `, [
        progress_percent || 0, video_watch_time_seconds || 0,
        video_last_position_seconds || 0, time_spent_seconds || 0,
        req.user.id, id
      ]);
    }

    // Mettre à jour l'inscription
    await db.query('UPDATE enrollments SET last_accessed_at = NOW() WHERE id = ?', [enrollment[0].id]);

    const [progress] = await db.query('SELECT * FROM lesson_progress WHERE user_id = ? AND lesson_id = ?', [req.user.id, id]);

    res.json({ success: true, data: progress[0] });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/elearning/lessons/:id/complete - Marquer une leçon comme complétée
router.post('/lessons/:id/complete', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer la leçon
    const [lesson] = await db.query(`
      SELECT l.*, m.course_id FROM lessons l
      JOIN course_modules m ON l.module_id = m.id
      WHERE l.id = ?
    `, [id]);

    if (lesson.length === 0) {
      return res.status(404).json({ success: false, message: 'Leçon non trouvée' });
    }

    // Vérifier l'inscription
    const [enrollment] = await db.query(`
      SELECT * FROM enrollments
      WHERE user_id = ? AND enrollable_type = 'course' AND enrollable_id = ?
    `, [req.user.id, lesson[0].course_id]);

    if (enrollment.length === 0) {
      return res.status(403).json({ success: false, message: 'Non inscrit à ce cours' });
    }

    // Mettre à jour la progression
    await db.query(`
      INSERT INTO lesson_progress (user_id, lesson_id, enrollment_id, status, progress_percent, completed_at, first_accessed_at, last_accessed_at)
      VALUES (?, ?, ?, 'completed', 100, NOW(), NOW(), NOW())
      ON DUPLICATE KEY UPDATE status = 'completed', progress_percent = 100, completed_at = NOW(), last_accessed_at = NOW()
    `, [req.user.id, id, enrollment[0].id]);

    // Recalculer la progression du cours
    const courseProgress = await calculateCourseProgress(req.user.id, lesson[0].course_id, enrollment[0].id);

    // Mettre à jour l'inscription
    const status = courseProgress >= 100 ? 'completed' : 'in_progress';
    await db.query(`
      UPDATE enrollments SET
        progress_percent = ?,
        status = ?,
        lessons_completed = lessons_completed + 1,
        completed_at = CASE WHEN ? >= 100 THEN NOW() ELSE completed_at END,
        started_at = COALESCE(started_at, NOW())
      WHERE id = ?
    `, [courseProgress, status, courseProgress, enrollment[0].id]);

    // Log d'activité
    await db.query(`
      INSERT INTO elearning_activity_log (user_id, action, entity_type, entity_id, details)
      VALUES (?, 'complete_lesson', 'lesson', ?, ?)
    `, [req.user.id, id, JSON.stringify({ title: lesson[0].title_fr, course_progress: courseProgress })]);

    res.json({
      success: true,
      message: 'Leçon complétée',
      data: {
        lesson_completed: true,
        course_progress: courseProgress,
        course_completed: courseProgress >= 100
      }
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// STATISTIQUES
// ============================================

// GET /api/elearning/stats - Statistiques plateforme (admin)
router.get('/stats', auth, authorize('admin'), async (req, res) => {
  try {
    // Totaux
    const [[{ totalCourses }]] = await db.query("SELECT COUNT(*) as totalCourses FROM courses WHERE is_active = 1");
    const [[{ publishedCourses }]] = await db.query("SELECT COUNT(*) as publishedCourses FROM courses WHERE status = 'published' AND is_active = 1");
    const [[{ totalPaths }]] = await db.query("SELECT COUNT(*) as totalPaths FROM learning_paths WHERE is_active = 1");
    const [[{ totalEnrollments }]] = await db.query("SELECT COUNT(*) as totalEnrollments FROM enrollments");
    const [[{ activeEnrollments }]] = await db.query("SELECT COUNT(*) as activeEnrollments FROM enrollments WHERE status IN ('enrolled', 'in_progress')");
    const [[{ completedEnrollments }]] = await db.query("SELECT COUNT(*) as completedEnrollments FROM enrollments WHERE status = 'completed'");
    const [[{ totalCertificates }]] = await db.query("SELECT COUNT(*) as totalCertificates FROM certificates WHERE status = 'active'");
    const [[{ totalLessons }]] = await db.query("SELECT COUNT(*) as totalLessons FROM lessons WHERE is_active = 1");
    const [[{ totalQuestions }]] = await db.query("SELECT COUNT(*) as totalQuestions FROM questions WHERE is_active = 1");

    // Inscriptions récentes
    const [recentEnrollments] = await db.query(`
      SELECT e.*, u.first_name, u.last_name, u.email,
        CASE
          WHEN e.enrollable_type = 'course' THEN c.title_fr
          WHEN e.enrollable_type = 'learning_path' THEN lp.title_fr
        END as item_title
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN courses c ON e.enrollable_type = 'course' AND e.enrollable_id = c.id
      LEFT JOIN learning_paths lp ON e.enrollable_type = 'learning_path' AND e.enrollable_id = lp.id
      ORDER BY e.enrolled_at DESC
      LIMIT 10
    `);

    // Cours populaires
    const [popularCourses] = await db.query(`
      SELECT id, title_fr, slug, thumbnail, enrolled_count, average_rating
      FROM courses
      WHERE status = 'published' AND is_active = 1
      ORDER BY enrolled_count DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        totals: {
          courses: totalCourses,
          publishedCourses,
          paths: totalPaths,
          enrollments: totalEnrollments,
          activeEnrollments,
          completedEnrollments,
          certificates: totalCertificates,
          lessons: totalLessons,
          questions: totalQuestions
        },
        recentEnrollments,
        popularCourses
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/elearning/stats/user - Statistiques utilisateur
router.get('/stats/user', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [[{ enrolledCourses }]] = await db.query(
      "SELECT COUNT(*) as enrolledCourses FROM enrollments WHERE user_id = ? AND enrollable_type = 'course'",
      [userId]
    );

    const [[{ completedCourses }]] = await db.query(
      "SELECT COUNT(*) as completedCourses FROM enrollments WHERE user_id = ? AND enrollable_type = 'course' AND status = 'completed'",
      [userId]
    );

    const [[{ inProgressCourses }]] = await db.query(
      "SELECT COUNT(*) as inProgressCourses FROM enrollments WHERE user_id = ? AND enrollable_type = 'course' AND status = 'in_progress'",
      [userId]
    );

    const [[{ certificates }]] = await db.query(
      "SELECT COUNT(*) as certificates FROM certificates WHERE user_id = ? AND status = 'active'",
      [userId]
    );

    const [[{ totalTimeSpent }]] = await db.query(
      "SELECT COALESCE(SUM(total_time_spent_minutes), 0) as totalTimeSpent FROM enrollments WHERE user_id = ?",
      [userId]
    );

    const [[{ lessonsCompleted }]] = await db.query(
      "SELECT COUNT(*) as lessonsCompleted FROM lesson_progress WHERE user_id = ? AND status = 'completed'",
      [userId]
    );

    res.json({
      success: true,
      data: {
        enrolledCourses,
        completedCourses,
        inProgressCourses,
        certificates,
        totalTimeSpent: totalTimeSpent || 0,
        lessonsCompleted
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// PARCOURS DIPLÔMANTS
// ============================================

// GET /api/elearning/paths - Liste des parcours
router.get('/paths', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12, status, level, featured, search } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['lp.is_active = 1'];
    let params = [];

    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      whereConditions.push("lp.status = 'published'");
    } else if (status) {
      whereConditions.push('lp.status = ?');
      params.push(status);
    }

    if (level) {
      whereConditions.push('lp.level = ?');
      params.push(level);
    }

    if (featured === 'true') {
      whereConditions.push('lp.is_featured = 1');
    }

    if (search) {
      whereConditions.push('(lp.title_fr LIKE ? OR lp.title_en LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM learning_paths lp ${whereClause}`, params);

    const [paths] = await db.query(`
      SELECT lp.*,
        cat.name_fr as category_name_fr,
        u.first_name as instructor_first_name,
        u.last_name as instructor_last_name,
        (SELECT COUNT(*) FROM learning_path_courses WHERE learning_path_id = lp.id) as course_count
      FROM learning_paths lp
      LEFT JOIN elearning_categories cat ON lp.category_id = cat.id
      LEFT JOIN instructors i ON lp.instructor_id = i.id
      LEFT JOIN users u ON i.user_id = u.id
      ${whereClause}
      ORDER BY lp.sort_order ASC, lp.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      data: paths,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get paths error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/elearning/paths/:slug - Détail d'un parcours
router.get('/paths/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    let query = `
      SELECT lp.*,
        cat.name_fr as category_name_fr,
        i.bio_fr as instructor_bio_fr,
        u.first_name as instructor_first_name,
        u.last_name as instructor_last_name,
        u.avatar as instructor_avatar
      FROM learning_paths lp
      LEFT JOIN elearning_categories cat ON lp.category_id = cat.id
      LEFT JOIN instructors i ON lp.instructor_id = i.id
      LEFT JOIN users u ON i.user_id = u.id
      WHERE lp.slug = ? AND lp.is_active = 1
    `;

    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      query += " AND lp.status = 'published'";
    }

    const [paths] = await db.query(query, [slug]);

    if (paths.length === 0) {
      return res.status(404).json({ success: false, message: 'Parcours non trouvé' });
    }

    const path = paths[0];

    // Récupérer les cours du parcours
    const [courses] = await db.query(`
      SELECT c.*, lpc.sort_order, lpc.is_required,
        (SELECT COUNT(*) FROM course_modules WHERE course_id = c.id AND status = 'published') as module_count
      FROM learning_path_courses lpc
      JOIN courses c ON lpc.course_id = c.id
      WHERE lpc.learning_path_id = ? AND c.is_active = 1
      ORDER BY lpc.sort_order ASC
    `, [path.id]);

    path.courses = courses;

    // Vérifier l'inscription de l'utilisateur
    if (req.user) {
      const [enrollment] = await db.query(`
        SELECT * FROM enrollments
        WHERE user_id = ? AND enrollable_type = 'learning_path' AND enrollable_id = ?
      `, [req.user.id, path.id]);
      path.enrollment = enrollment.length > 0 ? enrollment[0] : null;
    }

    res.json({ success: true, data: path });
  } catch (error) {
    console.error('Get path error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/elearning/paths - Créer un parcours
router.post('/paths', auth, authorize('admin'), async (req, res) => {
  try {
    const {
      title_fr, title_en,
      description_fr, description_en,
      short_description_fr, short_description_en,
      thumbnail, cover_image,
      level, duration_hours,
      min_passing_score, require_all_courses, require_final_exam,
      certificate_enabled, certificate_template, certificate_validity_months,
      instructor_id, category_id,
      tags, learning_outcomes, target_audience,
      status, is_featured,
      final_quiz_weight, courses_quizzes_weight
    } = req.body;

    if (!title_fr) {
      return res.status(400).json({ success: false, message: 'Le titre en français est requis' });
    }

    const slug = await generateSlug(title_fr, 'learning_paths');

    const [result] = await db.query(`
      INSERT INTO learning_paths (
        title_fr, title_en, slug,
        description_fr, description_en,
        short_description_fr, short_description_en,
        thumbnail, cover_image,
        level, duration_hours,
        min_passing_score, require_all_courses, require_final_exam,
        certificate_enabled, certificate_template, certificate_validity_months,
        instructor_id, category_id,
        tags, learning_outcomes, target_audience,
        status, is_featured,
        published_at,
        final_quiz_weight, courses_quizzes_weight
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title_fr, title_en, slug,
      description_fr, description_en,
      short_description_fr, short_description_en,
      thumbnail, cover_image,
      level || 'beginner', duration_hours || 0,
      min_passing_score || 70, require_all_courses !== false, require_final_exam || false,
      certificate_enabled !== false, certificate_template || 'default', certificate_validity_months,
      instructor_id, category_id,
      JSON.stringify(tags || []),
      JSON.stringify(learning_outcomes || []),
      JSON.stringify(target_audience || []),
      status || 'draft', is_featured || false,
      status === 'published' ? new Date() : null,
      final_quiz_weight || 1.00,
      courses_quizzes_weight || 1.00
    ]);

    const [newPath] = await db.query('SELECT * FROM learning_paths WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, data: newPath[0], message: 'Parcours créé' });
  } catch (error) {
    console.error('Create path error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/elearning/paths/:id - Modifier un parcours
router.put('/paths/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [existing] = await db.query('SELECT * FROM learning_paths WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Parcours non trouvé' });
    }

    const allowedFields = [
      'title_fr', 'title_en', 'description_fr', 'description_en',
      'short_description_fr', 'short_description_en',
      'thumbnail', 'cover_image', 'level', 'duration_hours',
      'min_passing_score', 'require_all_courses', 'require_final_exam', 'final_exam_id',
      'certificate_enabled', 'certificate_template', 'certificate_validity_months',
      'instructor_id', 'category_id', 'status', 'is_featured', 'sort_order',
      'final_quiz_weight', 'courses_quizzes_weight'
    ];

    const jsonFields = ['tags', 'learning_outcomes', 'target_audience'];

    const setClauses = [];
    const params = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = ?`);
        params.push(value);
      } else if (jsonFields.includes(key)) {
        setClauses.push(`${key} = ?`);
        params.push(JSON.stringify(value));
      }
    }

    if (updates.status === 'published' && existing[0].status !== 'published') {
      setClauses.push('published_at = NOW()');
    }

    if (setClauses.length > 0) {
      params.push(id);
      await db.query(`UPDATE learning_paths SET ${setClauses.join(', ')} WHERE id = ?`, params);
    }

    const [updated] = await db.query('SELECT * FROM learning_paths WHERE id = ?', [id]);

    res.json({ success: true, data: updated[0], message: 'Parcours mis à jour' });
  } catch (error) {
    console.error('Update path error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/elearning/paths/:id - Supprimer un parcours
router.delete('/paths/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("UPDATE learning_paths SET status = 'archived', is_active = 0 WHERE id = ?", [id]);

    res.json({ success: true, message: 'Parcours supprimé' });
  } catch (error) {
    console.error('Delete path error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/elearning/paths/:id/courses - Ajouter un cours au parcours
router.post('/paths/:id/courses', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { course_id, sort_order, is_required, course_weight } = req.body;

    // Vérifier que le parcours existe
    const [path] = await db.query('SELECT id FROM learning_paths WHERE id = ?', [id]);
    if (path.length === 0) {
      return res.status(404).json({ success: false, message: 'Parcours non trouvé' });
    }

    // Vérifier que le cours existe
    const [course] = await db.query('SELECT id FROM courses WHERE id = ?', [course_id]);
    if (course.length === 0) {
      return res.status(404).json({ success: false, message: 'Cours non trouvé' });
    }

    // Obtenir le prochain sort_order si non fourni
    let order = sort_order;
    if (order === undefined) {
      const [[{ maxOrder }]] = await db.query(
        'SELECT COALESCE(MAX(sort_order), 0) as maxOrder FROM learning_path_courses WHERE learning_path_id = ?',
        [id]
      );
      order = maxOrder + 1;
    }

    await db.query(`
      INSERT INTO learning_path_courses (learning_path_id, course_id, sort_order, is_required, course_weight)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE sort_order = ?, is_required = ?, course_weight = ?
    `, [id, course_id, order, is_required !== false, course_weight || 1.00, order, is_required !== false, course_weight || 1.00]);

    res.json({ success: true, message: 'Cours ajouté au parcours' });
  } catch (error) {
    console.error('Add course to path error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/elearning/paths/:id/courses/:courseId - Retirer un cours du parcours
router.delete('/paths/:id/courses/:courseId', auth, authorize('admin'), async (req, res) => {
  try {
    const { id, courseId } = req.params;

    await db.query('DELETE FROM learning_path_courses WHERE learning_path_id = ? AND course_id = ?', [id, courseId]);

    res.json({ success: true, message: 'Cours retiré du parcours' });
  } catch (error) {
    console.error('Remove course from path error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// BANQUE DE QUESTIONS
// ============================================

// GET /api/elearning/questions - Liste des questions
router.get('/questions', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      question_type,
      difficulty,
      category_id,
      tag
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['q.is_active = 1'];
    let params = [];

    if (search) {
      whereConditions.push('(q.question_text_fr LIKE ? OR q.question_text_en LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (question_type) {
      whereConditions.push('q.question_type = ?');
      params.push(question_type);
    }

    if (difficulty) {
      whereConditions.push('q.difficulty = ?');
      params.push(difficulty);
    }

    if (category_id) {
      whereConditions.push('q.category_id = ?');
      params.push(category_id);
    }

    if (tag) {
      whereConditions.push('JSON_CONTAINS(q.tags, ?)');
      params.push(JSON.stringify(tag));
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM questions q ${whereClause}`, params);

    const [questions] = await db.query(`
      SELECT q.*,
        cat.name_fr as category_name_fr,
        u.first_name as created_by_first_name,
        u.last_name as created_by_last_name,
        (SELECT COUNT(*) FROM quiz_questions WHERE question_id = q.id) as quiz_count
      FROM questions q
      LEFT JOIN elearning_categories cat ON q.category_id = cat.id
      LEFT JOIN users u ON q.created_by = u.id
      ${whereClause}
      ORDER BY q.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      data: questions,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/elearning/questions/:id - Détail d'une question
router.get('/questions/:id', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { id } = req.params;

    const [questions] = await db.query(`
      SELECT q.*,
        cat.name_fr as category_name_fr
      FROM questions q
      LEFT JOIN elearning_categories cat ON q.category_id = cat.id
      WHERE q.id = ? AND q.is_active = 1
    `, [id]);

    if (questions.length === 0) {
      return res.status(404).json({ success: false, message: 'Question non trouvée' });
    }

    res.json({ success: true, data: questions[0] });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/elearning/questions - Créer une question
router.post('/questions', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const {
      question_text_fr, question_text_en,
      question_type, // 'mcq', 'true_false', 'short_answer', 'matching', 'fill_blank', 'multiple_select'
      explanation_fr, explanation_en,
      image_url, audio_url, video_url,
      options, // JSON array for MCQ: [{id, text_fr, text_en, is_correct}, ...]
      correct_answer, // JSON - depends on type
      points,
      difficulty, // 'easy', 'medium', 'hard'
      category_id,
      tags,
      time_limit_seconds,
      hint_fr, hint_en,
      feedback_correct_fr, feedback_correct_en,
      feedback_incorrect_fr, feedback_incorrect_en
    } = req.body;

    if (!question_text_fr) {
      return res.status(400).json({ success: false, message: 'Le texte de la question est requis' });
    }

    if (!question_type) {
      return res.status(400).json({ success: false, message: 'Le type de question est requis' });
    }

    // Valider les options pour MCQ
    if (['mcq', 'multiple_select'].includes(question_type) && (!options || options.length < 2)) {
      return res.status(400).json({ success: false, message: 'Au moins 2 options sont requises' });
    }

    const [result] = await db.query(`
      INSERT INTO questions (
        question_text_fr, question_text_en,
        question_type,
        explanation_fr, explanation_en,
        hint_fr, hint_en,
        image_url, audio_url, video_url,
        options, correct_answer, answer_feedback,
        points, difficulty,
        category_id, tags,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      question_text_fr, question_text_en,
      question_type,
      explanation_fr, explanation_en,
      hint_fr, hint_en,
      image_url, audio_url, video_url,
      JSON.stringify(options || []),
      JSON.stringify(correct_answer !== undefined ? correct_answer : null),
      JSON.stringify({
        correct_fr: feedback_correct_fr || null,
        correct_en: feedback_correct_en || null,
        incorrect_fr: feedback_incorrect_fr || null,
        incorrect_en: feedback_incorrect_en || null
      }),
      points || 1,
      difficulty || 'medium',
      category_id || null,
      JSON.stringify(tags || []),
      req.user.id
    ]);

    const [newQuestion] = await db.query('SELECT * FROM questions WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, data: newQuestion[0], message: 'Question créée' });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/elearning/questions/:id - Modifier une question
router.put('/questions/:id', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [existing] = await db.query('SELECT * FROM questions WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Question non trouvée' });
    }

    const allowedFields = [
      'question_text_fr', 'question_text_en',
      'question_type',
      'explanation_fr', 'explanation_en',
      'image_url', 'audio_url', 'video_url',
      'points', 'difficulty',
      'category_id',
      'time_limit_seconds',
      'hint_fr', 'hint_en',
      'feedback_correct_fr', 'feedback_correct_en',
      'feedback_incorrect_fr', 'feedback_incorrect_en',
      'is_active'
    ];

    const jsonFields = ['options', 'correct_answer', 'tags'];

    const setClauses = [];
    const params = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = ?`);
        params.push(value);
      } else if (jsonFields.includes(key)) {
        setClauses.push(`${key} = ?`);
        params.push(JSON.stringify(value));
      }
    }

    if (setClauses.length > 0) {
      params.push(id);
      await db.query(`UPDATE questions SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = ?`, params);
    }

    const [updated] = await db.query('SELECT * FROM questions WHERE id = ?', [id]);

    res.json({ success: true, data: updated[0], message: 'Question mise à jour' });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/elearning/questions/:id - Supprimer une question
router.delete('/questions/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete
    await db.query('UPDATE questions SET is_active = 0 WHERE id = ?', [id]);

    res.json({ success: true, message: 'Question supprimée' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/elearning/questions/import - Importer des questions (CSV/JSON)
router.post('/questions/import', auth, authorize('admin'), async (req, res) => {
  try {
    const { questions, format } = req.body; // format: 'json' | 'csv_parsed'

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucune question à importer' });
    }

    let imported = 0;
    let errors = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      try {
        if (!q.question_text_fr || !q.question_type) {
          errors.push({ index: i, error: 'Texte ou type manquant' });
          continue;
        }

        await db.query(`
          INSERT INTO questions (
            question_text_fr, question_text_en,
            question_type, explanation_fr,
            options, correct_answer,
            points, difficulty,
            category_id, tags,
            created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          q.question_text_fr,
          q.question_text_en || null,
          q.question_type,
          q.explanation_fr || null,
          JSON.stringify(q.options || []),
          JSON.stringify(q.correct_answer || null),
          q.points || 1,
          q.difficulty || 'medium',
          q.category_id || null,
          JSON.stringify(q.tags || []),
          req.user.id
        ]);
        imported++;
      } catch (err) {
        errors.push({ index: i, error: err.message });
      }
    }

    res.json({
      success: true,
      message: `${imported} questions importées`,
      data: { imported, errors: errors.length, errorDetails: errors }
    });
  } catch (error) {
    console.error('Import questions error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// QUIZ
// ============================================

// GET /api/elearning/quizzes - Liste des quiz
router.get('/quizzes', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, quiz_type, search } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['q.is_active = 1'];
    let params = [];

    if (status) {
      whereConditions.push('q.status = ?');
      params.push(status);
    }

    if (quiz_type) {
      whereConditions.push('q.quiz_type = ?');
      params.push(quiz_type);
    }

    if (search) {
      whereConditions.push('(q.title_fr LIKE ? OR q.title_en LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM quizzes q ${whereClause}`, params);

    const [quizzes] = await db.query(`
      SELECT q.*,
        u.first_name as created_by_first_name,
        u.last_name as created_by_last_name,
        (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as total_questions,
        (SELECT SUM(points) FROM quiz_questions qq JOIN questions qs ON qq.question_id = qs.id WHERE qq.quiz_id = q.id) as total_points
      FROM quizzes q
      LEFT JOIN users u ON q.created_by = u.id
      ${whereClause}
      ORDER BY q.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      data: quizzes,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/elearning/quizzes/:id - Détail d'un quiz (admin)
router.get('/quizzes/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [quizzes] = await db.query(`
      SELECT q.*,
        (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as total_questions
      FROM quizzes q
      WHERE q.id = ? AND q.is_active = 1
    `, [id]);

    if (quizzes.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz non trouvé' });
    }

    const quiz = quizzes[0];

    // Récupérer les questions du quiz (seulement pour admin/editor)
    if (['admin', 'editor'].includes(req.user.role)) {
      const [questions] = await db.query(`
        SELECT qq.*, q.*,
          qq.sort_order as quiz_sort_order,
          qq.points_override
        FROM quiz_questions qq
        JOIN questions q ON qq.question_id = q.id
        WHERE qq.quiz_id = ? AND q.is_active = 1
        ORDER BY qq.sort_order ASC
      `, [id]);
      quiz.questions = questions;
    }

    res.json({ success: true, data: quiz });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/elearning/quizzes - Créer un quiz
router.post('/quizzes', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const {
      title_fr, title_en,
      description_fr, description_en,
      instructions_fr, instructions_en,
      quiz_type, // 'practice', 'graded', 'final_exam', 'survey'
      time_limit_minutes,
      passing_score,
      max_attempts,
      shuffle_questions,
      shuffle_options,
      show_correct_answers,
      show_explanation,
      show_score_immediately,
      allow_review,
      allow_retake,
      require_passing_to_proceed,
      negative_marking,
      negative_marking_percent,
      status,
      contributes_to_grade,
      grade_weight,
      question_count,      // Nombre de questions à afficher (banque de questions)
      random_selection     // Activer la sélection aléatoire
    } = req.body;

    if (!title_fr) {
      return res.status(400).json({ success: false, message: 'Le titre est requis' });
    }

    const [result] = await db.query(`
      INSERT INTO quizzes (
        title_fr, title_en,
        description_fr, description_en,
        instructions_fr, instructions_en,
        quiz_type,
        time_limit_minutes,
        passing_score,
        max_attempts,
        shuffle_questions,
        shuffle_options,
        show_correct_answers,
        show_explanation,
        show_score_immediately,
        allow_review,
        allow_retake,
        status,
        created_by,
        contributes_to_grade,
        grade_weight,
        question_count,
        random_selection
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title_fr, title_en,
      description_fr, description_en,
      instructions_fr, instructions_en,
      quiz_type || 'graded',
      time_limit_minutes || null,
      passing_score || 70,
      max_attempts || 3,
      shuffle_questions !== false,
      shuffle_options !== false,
      show_correct_answers !== false,
      show_explanation !== false,
      show_score_immediately !== false,
      allow_review !== false,
      allow_retake !== false,
      status || 'draft',
      req.user.id,
      contributes_to_grade !== false,
      grade_weight || 1.00,
      question_count || null,
      random_selection || false
    ]);

    const [newQuiz] = await db.query('SELECT * FROM quizzes WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, data: newQuiz[0], message: 'Quiz créé' });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/elearning/quizzes/:id - Modifier un quiz
router.put('/quizzes/:id', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [existing] = await db.query('SELECT * FROM quizzes WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz non trouvé' });
    }

    const allowedFields = [
      'title_fr', 'title_en',
      'description_fr', 'description_en',
      'instructions_fr', 'instructions_en',
      'quiz_type',
      'time_limit_minutes',
      'passing_score',
      'max_attempts',
      'shuffle_questions',
      'shuffle_options',
      'show_correct_answers',
      'show_explanation',
      'show_score_immediately',
      'allow_review',
      'allow_retake',
      'require_passing_to_proceed',
      'negative_marking',
      'negative_marking_percent',
      'status',
      'is_active',
      'contributes_to_grade',
      'grade_weight',
      'question_count',      // Nombre de questions à afficher (banque de questions)
      'random_selection'     // Activer la sélection aléatoire
    ];

    const setClauses = [];
    const params = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (setClauses.length > 0) {
      params.push(id);
      await db.query(`UPDATE quizzes SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = ?`, params);
    }

    const [updated] = await db.query('SELECT * FROM quizzes WHERE id = ?', [id]);

    res.json({ success: true, data: updated[0], message: 'Quiz mis à jour' });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/elearning/quizzes/:id - Supprimer un quiz
router.delete('/quizzes/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('UPDATE quizzes SET is_active = 0 WHERE id = ?', [id]);

    res.json({ success: true, message: 'Quiz supprimé' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/elearning/quizzes/:id/questions - Ajouter des questions au quiz
router.post('/quizzes/:id/questions', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { id } = req.params;
    const { question_ids, questions } = req.body; // question_ids: [1,2,3] ou questions: [{question_id, sort_order, points_override}]

    const [quiz] = await db.query('SELECT id FROM quizzes WHERE id = ?', [id]);
    if (quiz.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz non trouvé' });
    }

    // Si question_ids fourni (simple)
    if (question_ids && Array.isArray(question_ids)) {
      const [[{ maxOrder }]] = await db.query(
        'SELECT COALESCE(MAX(sort_order), 0) as maxOrder FROM quiz_questions WHERE quiz_id = ?',
        [id]
      );

      let order = maxOrder;
      for (const qId of question_ids) {
        order++;
        await db.query(`
          INSERT INTO quiz_questions (quiz_id, question_id, sort_order)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE sort_order = sort_order
        `, [id, qId, order]);
      }
    }

    // Si questions fourni (avec détails)
    if (questions && Array.isArray(questions)) {
      for (const q of questions) {
        await db.query(`
          INSERT INTO quiz_questions (quiz_id, question_id, sort_order, points_override)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE sort_order = ?, points_override = ?
        `, [id, q.question_id, q.sort_order || 0, q.points_override || null, q.sort_order || 0, q.points_override || null]);
      }
    }

    // Calculer le total de points
    const [[{ totalPoints }]] = await db.query(`
      SELECT COALESCE(SUM(COALESCE(qq.points_override, q.points)), 0) as totalPoints
      FROM quiz_questions qq
      JOIN questions q ON qq.question_id = q.id
      WHERE qq.quiz_id = ?
    `, [id]);

    res.json({ success: true, message: 'Questions ajoutées au quiz', data: { totalPoints } });
  } catch (error) {
    console.error('Add questions to quiz error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/elearning/quizzes/:id/questions/:questionId - Retirer une question du quiz
router.delete('/quizzes/:id/questions/:questionId', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { id, questionId } = req.params;

    await db.query('DELETE FROM quiz_questions WHERE quiz_id = ? AND question_id = ?', [id, questionId]);

    res.json({ success: true, message: 'Question retirée du quiz' });
  } catch (error) {
    console.error('Remove question from quiz error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/elearning/quizzes/:id/questions/reorder - Réordonner les questions
router.put('/quizzes/:id/questions/reorder', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { id } = req.params;
    const { questions } = req.body; // [{question_id, sort_order}, ...]

    for (const q of questions) {
      await db.query(
        'UPDATE quiz_questions SET sort_order = ? WHERE quiz_id = ? AND question_id = ?',
        [q.sort_order, id, q.question_id]
      );
    }

    res.json({ success: true, message: 'Questions réordonnées' });
  } catch (error) {
    console.error('Reorder quiz questions error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// TENTATIVES DE QUIZ
// ============================================

// POST /api/elearning/quizzes/:id/start - Démarrer un quiz
router.post('/quizzes/:id/start', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { enrollment_id } = req.body;

    // Récupérer le quiz avec le total des points
    const [quizzes] = await db.query(`
      SELECT q.*,
        (SELECT COALESCE(SUM(COALESCE(qq.points_override, qs.points)), 0)
         FROM quiz_questions qq
         JOIN questions qs ON qq.question_id = qs.id
         WHERE qq.quiz_id = q.id) as total_points
      FROM quizzes q
      WHERE q.id = ? AND q.status = 'published' AND q.is_active = 1
    `, [id]);

    if (quizzes.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz non trouvé' });
    }

    const quiz = quizzes[0];

    // Vérifier le nombre de tentatives
    const [[{ attemptCount }]] = await db.query(`
      SELECT COUNT(*) as attemptCount FROM quiz_attempts
      WHERE user_id = ? AND quiz_id = ? AND status != 'abandoned'
    `, [req.user.id, id]);

    if (quiz.max_attempts && attemptCount >= quiz.max_attempts) {
      return res.status(400).json({ success: false, message: 'Nombre maximum de tentatives atteint' });
    }

    // Vérifier si une tentative est déjà en cours
    const [inProgress] = await db.query(`
      SELECT * FROM quiz_attempts
      WHERE user_id = ? AND quiz_id = ? AND status = 'in_progress'
    `, [req.user.id, id]);

    if (inProgress.length > 0) {
      // Retourner la tentative en cours
      const attempt = inProgress[0];

      // Récupérer les questions
      let questions = await getQuizQuestionsForAttempt(id, quiz.shuffle_questions, JSON.parse(attempt.question_order || '[]'));

      return res.json({
        success: true,
        data: {
          attempt,
          quiz: {
            id: quiz.id,
            title_fr: quiz.title_fr,
            title_en: quiz.title_en,
            instructions_fr: quiz.instructions_fr,
            instructions_en: quiz.instructions_en,
            time_limit_minutes: quiz.time_limit_minutes,
            shuffle_options: quiz.shuffle_options
          },
          questions: questions.map(q => sanitizeQuestionForStudent(q, quiz.shuffle_options))
        },
        message: 'Tentative en cours récupérée'
      });
    }

    // Créer une nouvelle tentative
    // Déterminer le nombre de questions à afficher (banque de questions)
    const questionLimit = quiz.random_selection && quiz.question_count ? quiz.question_count : null;

    // Si random_selection est activé OU shuffle_questions est activé, on mélange
    // Si random_selection est activé avec question_count, on limite le nombre de questions
    const questionOrder = (quiz.shuffle_questions || quiz.random_selection)
      ? await getShuffledQuestionIds(id, questionLimit)
      : await getQuestionIds(id);

    const [result] = await db.query(`
      INSERT INTO quiz_attempts (
        user_id, quiz_id, enrollment_id,
        attempt_number, status,
        started_at, question_order,
        max_score, ip_address
      ) VALUES (?, ?, ?, ?, 'in_progress', NOW(), ?, ?, ?)
    `, [
      req.user.id, id, enrollment_id || null,
      attemptCount + 1,
      JSON.stringify(questionOrder),
      quiz.total_points || 0,
      req.ip
    ]);

    const [newAttempt] = await db.query('SELECT * FROM quiz_attempts WHERE id = ?', [result.insertId]);

    // Récupérer les questions
    let questions = await getQuizQuestionsForAttempt(id, false, questionOrder);

    res.status(201).json({
      success: true,
      data: {
        attempt: newAttempt[0],
        quiz: {
          id: quiz.id,
          title_fr: quiz.title_fr,
          title_en: quiz.title_en,
          instructions_fr: quiz.instructions_fr,
          instructions_en: quiz.instructions_en,
          time_limit_minutes: quiz.time_limit_minutes,
          shuffle_options: quiz.shuffle_options
        },
        questions: questions.map(q => sanitizeQuestionForStudent(q, quiz.shuffle_options))
      },
      message: 'Quiz démarré'
    });
  } catch (error) {
    console.error('Start quiz error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Helper functions for quiz
async function getQuestionIds(quizId) {
  const [questions] = await db.query(
    'SELECT question_id FROM quiz_questions WHERE quiz_id = ? ORDER BY sort_order ASC',
    [quizId]
  );
  return questions.map(q => q.question_id);
}

async function getShuffledQuestionIds(quizId, limit = null) {
  const ids = await getQuestionIds(quizId);
  // Fisher-Yates shuffle
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  // Si une limite est définie et est inférieure au nombre total, ne retourner que ce nombre
  if (limit && limit > 0 && limit < ids.length) {
    return ids.slice(0, limit);
  }
  return ids;
}

async function getQuizQuestionsForAttempt(quizId, shuffle, orderIds) {
  const [questions] = await db.query(`
    SELECT q.*, qq.points_override
    FROM quiz_questions qq
    JOIN questions q ON qq.question_id = q.id
    WHERE qq.quiz_id = ? AND q.is_active = 1
  `, [quizId]);

  // Réordonner selon orderIds si fourni
  if (orderIds && orderIds.length > 0) {
    const questionMap = new Map(questions.map(q => [q.id, q]));
    return orderIds.map(id => questionMap.get(id)).filter(Boolean);
  }

  return questions;
}

function sanitizeQuestionForStudent(question, shuffleOptions) {
  const sanitized = {
    id: question.id,
    question_text_fr: question.question_text_fr,
    question_text_en: question.question_text_en,
    question_type: question.question_type,
    image_url: question.image_url,
    audio_url: question.audio_url,
    video_url: question.video_url,
    points: question.points_override || question.points,
    time_limit_seconds: question.time_limit_seconds,
    hint_fr: question.hint_fr,
    hint_en: question.hint_en
  };

  // Pour les QCM, inclure les options sans is_correct
  if (['mcq', 'multiple_select'].includes(question.question_type)) {
    let options = JSON.parse(question.options || '[]');

    // Mélanger les options si demandé
    if (shuffleOptions) {
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
    }

    sanitized.options = options.map(opt => ({
      id: opt.id,
      text_fr: opt.text_fr,
      text_en: opt.text_en,
      image_url: opt.image_url
    }));
  }

  return sanitized;
}

// GET /api/elearning/attempts/:id - Détail d'une tentative
router.get('/attempts/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [attempts] = await db.query(`
      SELECT a.*, q.title_fr as quiz_title_fr, q.show_correct_answers, q.show_explanation
      FROM quiz_attempts a
      JOIN quizzes q ON a.quiz_id = q.id
      WHERE a.id = ? AND a.user_id = ?
    `, [id, req.user.id]);

    if (attempts.length === 0) {
      return res.status(404).json({ success: false, message: 'Tentative non trouvée' });
    }

    const attempt = attempts[0];

    // Si terminé, récupérer les réponses avec détails
    if (attempt.status === 'completed' || attempt.status === 'timed_out') {
      const [responses] = await db.query(`
        SELECT qr.*, q.question_text_fr, q.question_type, q.options, q.correct_answer,
          q.explanation_fr, q.feedback_correct_fr, q.feedback_incorrect_fr
        FROM quiz_responses qr
        JOIN questions q ON qr.question_id = q.id
        WHERE qr.attempt_id = ?
        ORDER BY qr.id ASC
      `, [id]);

      attempt.responses = responses.map(r => ({
        ...r,
        options: JSON.parse(r.options || '[]'),
        correct_answer: attempt.show_correct_answers ? JSON.parse(r.correct_answer || 'null') : null,
        explanation_fr: attempt.show_explanation ? r.explanation_fr : null
      }));
    }

    res.json({ success: true, data: attempt });
  } catch (error) {
    console.error('Get attempt error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/elearning/attempts/:id/submit - Soumettre les réponses
router.post('/attempts/:id/submit', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { responses } = req.body; // [{question_id, answer}, ...]

    // Récupérer la tentative
    const [attempts] = await db.query(`
      SELECT a.*, q.*
      FROM quiz_attempts a
      JOIN quizzes q ON a.quiz_id = q.id
      WHERE a.id = ? AND a.user_id = ?
    `, [id, req.user.id]);

    if (attempts.length === 0) {
      return res.status(404).json({ success: false, message: 'Tentative non trouvée' });
    }

    const attempt = attempts[0];

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Cette tentative est déjà terminée' });
    }

    // Vérifier le temps si limite définie
    if (attempt.time_limit_minutes) {
      const startTime = new Date(attempt.started_at);
      const now = new Date();
      const elapsedMinutes = (now - startTime) / 60000;

      if (elapsedMinutes > attempt.time_limit_minutes + 1) { // +1 min de tolérance
        await db.query("UPDATE quiz_attempts SET status = 'timed_out', completed_at = NOW() WHERE id = ?", [id]);
        return res.status(400).json({ success: false, message: 'Temps écoulé' });
      }
    }

    // Récupérer les questions avec les bonnes réponses
    const [questions] = await db.query(`
      SELECT q.*, qq.points_override
      FROM quiz_questions qq
      JOIN questions q ON qq.question_id = q.id
      WHERE qq.quiz_id = ?
    `, [attempt.quiz_id]);

    const questionMap = new Map(questions.map(q => [q.id, q]));

    // Évaluer chaque réponse
    let totalScore = 0;
    let correctCount = 0;
    let maxScore = 0;

    for (const response of responses) {
      const question = questionMap.get(response.question_id);
      if (!question) continue;

      const points = question.points_override || question.points || 1;
      maxScore += points;

      const correctAnswer = JSON.parse(question.correct_answer || 'null');
      const userAnswer = response.answer;
      let isCorrect = false;
      let earnedPoints = 0;

      // Évaluer selon le type de question
      switch (question.question_type) {
        case 'mcq':
          isCorrect = correctAnswer === userAnswer;
          break;

        case 'multiple_select':
          // Vérifier que toutes les bonnes réponses sont sélectionnées
          const correctSet = new Set(correctAnswer || []);
          const userSet = new Set(userAnswer || []);
          isCorrect = correctSet.size === userSet.size &&
            [...correctSet].every(x => userSet.has(x));
          break;

        case 'true_false':
          isCorrect = correctAnswer === userAnswer;
          break;

        case 'short_answer':
          // Comparaison insensible à la casse et aux espaces
          const normalized = (str) => (str || '').toLowerCase().trim();
          if (Array.isArray(correctAnswer)) {
            isCorrect = correctAnswer.some(ans => normalized(ans) === normalized(userAnswer));
          } else {
            isCorrect = normalized(correctAnswer) === normalized(userAnswer);
          }
          break;

        case 'fill_blank':
          // Support pour plusieurs trous - correctAnswer et userAnswer sont des arrays
          if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
            if (correctAnswer.length !== userAnswer.length) {
              isCorrect = false;
            } else {
              isCorrect = correctAnswer.every((correct, idx) =>
                (correct || '').toLowerCase().trim() === (userAnswer[idx] || '').toLowerCase().trim()
              );
            }
          } else {
            // Fallback pour un seul trou
            isCorrect = (correctAnswer || '').toLowerCase().trim() === (userAnswer || '').toLowerCase().trim();
          }
          break;

        case 'matching':
          // userAnswer et correctAnswer sont des objets {left_id: right_id}
          isCorrect = JSON.stringify(correctAnswer) === JSON.stringify(userAnswer);
          break;
      }

      if (isCorrect) {
        earnedPoints = points;
        correctCount++;
      } else if (attempt.negative_marking) {
        earnedPoints = -(points * (attempt.negative_marking_percent / 100));
      }

      totalScore += earnedPoints;

      // Enregistrer la réponse
      await db.query(`
        INSERT INTO quiz_responses (
          attempt_id, question_id, user_answer, is_correct, points_earned, answered_at
        ) VALUES (?, ?, ?, ?, ?, NOW())
      `, [id, response.question_id, JSON.stringify(userAnswer), isCorrect, earnedPoints]);
    }

    // Calculer le score en pourcentage
    const scorePercent = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const passed = scorePercent >= (attempt.passing_score || 70);

    // Calculer le temps passé
    const startTime = new Date(attempt.started_at);
    const timeSpentSeconds = Math.floor((new Date() - startTime) / 1000);

    // Mettre à jour la tentative
    await db.query(`
      UPDATE quiz_attempts SET
        status = 'completed',
        completed_at = NOW(),
        time_spent_seconds = ?,
        score = ?,
        score_percent = ?,
        max_score = ?,
        correct_count = ?,
        total_questions = ?,
        passed = ?
      WHERE id = ?
    `, [timeSpentSeconds, totalScore, scorePercent, maxScore, correctCount, responses.length, passed, id]);

    // Mettre à jour l'enrollment si lié
    if (attempt.enrollment_id) {
      // On pourrait mettre à jour la progression ici si nécessaire
    }

    // Log d'activité
    await db.query(`
      INSERT INTO elearning_activity_log (user_id, action, entity_type, entity_id, details)
      VALUES (?, 'complete_quiz', 'quiz', ?, ?)
    `, [req.user.id, attempt.quiz_id, JSON.stringify({
      attempt_id: id,
      score: totalScore,
      score_percent: scorePercent,
      passed
    })]);

    res.json({
      success: true,
      data: {
        score: totalScore,
        score_percent: scorePercent,
        max_score: maxScore,
        correct_count: correctCount,
        total_questions: responses.length,
        passed,
        time_spent_seconds: timeSpentSeconds,
        show_correct_answers: attempt.show_correct_answers,
        show_explanation: attempt.show_explanation
      },
      message: passed ? 'Félicitations, vous avez réussi !' : 'Quiz terminé'
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/elearning/attempts/:id/results - Résultats détaillés
router.get('/attempts/:id/results', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [attempts] = await db.query(`
      SELECT a.*, q.title_fr as quiz_title_fr, q.title_en as quiz_title_en,
        q.show_correct_answers, q.show_explanation, q.allow_review
      FROM quiz_attempts a
      JOIN quizzes q ON a.quiz_id = q.id
      WHERE a.id = ? AND a.user_id = ?
    `, [id, req.user.id]);

    if (attempts.length === 0) {
      return res.status(404).json({ success: false, message: 'Tentative non trouvée' });
    }

    const attempt = attempts[0];

    if (attempt.status === 'in_progress') {
      return res.status(400).json({ success: false, message: 'Quiz non terminé' });
    }

    // Récupérer les réponses avec les questions
    const [responses] = await db.query(`
      SELECT qr.*,
        q.question_text_fr, q.question_text_en,
        q.question_type, q.options, q.correct_answer,
        q.explanation_fr, q.explanation_en,
        q.feedback_correct_fr, q.feedback_correct_en,
        q.feedback_incorrect_fr, q.feedback_incorrect_en,
        q.image_url, q.points
      FROM quiz_responses qr
      JOIN questions q ON qr.question_id = q.id
      WHERE qr.attempt_id = ?
      ORDER BY qr.id ASC
    `, [id]);

    const results = responses.map(r => {
      const result = {
        question_id: r.question_id,
        question_text_fr: r.question_text_fr,
        question_text_en: r.question_text_en,
        question_type: r.question_type,
        image_url: r.image_url,
        user_answer: JSON.parse(r.user_answer || 'null'),
        is_correct: r.is_correct,
        points_earned: r.points_earned,
        points_possible: r.points
      };

      // Ajouter les options pour MCQ
      if (['mcq', 'multiple_select'].includes(r.question_type)) {
        result.options = JSON.parse(r.options || '[]').map(opt => ({
          id: opt.id,
          text_fr: opt.text_fr,
          text_en: opt.text_en
        }));
      }

      // Ajouter les bonnes réponses si autorisé
      if (attempt.show_correct_answers || attempt.allow_review) {
        result.correct_answer = JSON.parse(r.correct_answer || 'null');
      }

      // Ajouter l'explication si autorisé
      if (attempt.show_explanation) {
        result.explanation_fr = r.explanation_fr;
        result.explanation_en = r.explanation_en;
        result.feedback_fr = r.is_correct ? r.feedback_correct_fr : r.feedback_incorrect_fr;
        result.feedback_en = r.is_correct ? r.feedback_correct_en : r.feedback_incorrect_en;
      }

      return result;
    });

    res.json({
      success: true,
      data: {
        attempt: {
          id: attempt.id,
          quiz_id: attempt.quiz_id,
          quiz_title_fr: attempt.quiz_title_fr,
          quiz_title_en: attempt.quiz_title_en,
          status: attempt.status,
          score: attempt.score,
          score_percent: attempt.score_percent,
          max_score: attempt.max_score,
          correct_count: attempt.correct_count,
          total_questions: attempt.total_questions,
          passed: attempt.passed,
          time_spent_seconds: attempt.time_spent_seconds,
          started_at: attempt.started_at,
          completed_at: attempt.completed_at
        },
        results,
        summary: {
          total_questions: responses.length,
          correct: responses.filter(r => r.is_correct).length,
          incorrect: responses.filter(r => !r.is_correct).length,
          score_percent: attempt.score_percent,
          passed: attempt.passed
        }
      }
    });
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/elearning/attempts/:id/abandon - Abandonner une tentative
router.post('/attempts/:id/abandon', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [attempts] = await db.query(`
      SELECT * FROM quiz_attempts WHERE id = ? AND user_id = ? AND status = 'in_progress'
    `, [id, req.user.id]);

    if (attempts.length === 0) {
      return res.status(404).json({ success: false, message: 'Tentative non trouvée ou déjà terminée' });
    }

    await db.query("UPDATE quiz_attempts SET status = 'abandoned', completed_at = NOW() WHERE id = ?", [id]);

    res.json({ success: true, message: 'Tentative abandonnée' });
  } catch (error) {
    console.error('Abandon attempt error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/elearning/quizzes/:id/attempts - Historique des tentatives pour un quiz
router.get('/quizzes/:id/attempts', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [attempts] = await db.query(`
      SELECT id, attempt_number, status, score, score_percent, max_score,
        correct_count, total_questions, passed, time_spent_seconds,
        started_at, completed_at
      FROM quiz_attempts
      WHERE quiz_id = ? AND user_id = ?
      ORDER BY started_at DESC
    `, [id, req.user.id]);

    res.json({ success: true, data: attempts });
  } catch (error) {
    console.error('Get quiz attempts error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// CERTIFICATS
// ============================================

// GET /api/elearning/certificates - Liste des certificats de l'utilisateur
router.get('/certificates', auth, async (req, res) => {
  try {
    const [certificates] = await db.query(`
      SELECT c.*,
        CASE WHEN c.enrollable_type = 'course' THEN co.title_fr ELSE lp.title_fr END as course_title_fr,
        CASE WHEN c.enrollable_type = 'course' THEN co.title_en ELSE lp.title_en END as course_title_en,
        CASE WHEN c.enrollable_type = 'course' THEN co.thumbnail ELSE lp.thumbnail END as thumbnail
      FROM certificates c
      LEFT JOIN courses co ON c.enrollable_type = 'course' AND c.enrollable_id = co.id
      LEFT JOIN learning_paths lp ON c.enrollable_type = 'learning_path' AND c.enrollable_id = lp.id
      WHERE c.user_id = ?
      ORDER BY c.issue_date DESC
    `, [req.user.id]);

    res.json({ success: true, data: certificates });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/elearning/certificates/all - Liste de tous les certificats (admin)
router.get('/certificates/all', auth, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, enrollable_type } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      whereClause += ' AND c.status = ?';
      params.push(status);
    }

    if (enrollable_type) {
      whereClause += ' AND c.enrollable_type = ?';
      params.push(enrollable_type);
    }

    if (search) {
      whereClause += ' AND (c.certificate_number LIKE ? OR c.recipient_name LIKE ? OR u.username LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [[{ total }]] = await db.query(`
      SELECT COUNT(*) as total FROM certificates c
      LEFT JOIN users u ON c.user_id = u.id
      ${whereClause}
    `, params);

    const [certificates] = await db.query(`
      SELECT c.*,
        u.username, u.email as user_email,
        CASE WHEN c.enrollable_type = 'course' THEN co.title_fr ELSE lp.title_fr END as course_title_fr,
        CASE WHEN c.enrollable_type = 'course' THEN co.title_en ELSE lp.title_en END as course_title_en
      FROM certificates c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN courses co ON c.enrollable_type = 'course' AND c.enrollable_id = co.id
      LEFT JOIN learning_paths lp ON c.enrollable_type = 'learning_path' AND c.enrollable_id = lp.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    res.json({
      success: true,
      data: certificates,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all certificates error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/elearning/certificates/:id - Détail d'un certificat
router.get('/certificates/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [certificates] = await db.query(`
      SELECT c.*,
        u.username, u.email as user_email,
        CASE WHEN c.enrollable_type = 'course' THEN co.title_fr ELSE lp.title_fr END as course_title_fr,
        CASE WHEN c.enrollable_type = 'course' THEN co.title_en ELSE lp.title_en END as course_title_en,
        CASE WHEN c.enrollable_type = 'course' THEN co.thumbnail ELSE lp.thumbnail END as thumbnail
      FROM certificates c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN courses co ON c.enrollable_type = 'course' AND c.enrollable_id = co.id
      LEFT JOIN learning_paths lp ON c.enrollable_type = 'learning_path' AND c.enrollable_id = lp.id
      WHERE c.id = ?
    `, [id]);

    if (certificates.length === 0) {
      return res.status(404).json({ success: false, message: 'Certificat non trouvé' });
    }

    // Vérifier si l'utilisateur a le droit de voir ce certificat
    const cert = certificates[0];
    if (cert.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }

    res.json({ success: true, data: cert });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/elearning/certificates/verify/:code - Vérification publique d'un certificat
router.get('/certificates/verify/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const [certificates] = await db.query(`
      SELECT c.id, c.certificate_number, c.recipient_name, c.title_fr, c.title_en,
        c.final_score, c.total_hours, c.issue_date, c.expiry_date, c.status,
        c.signatory_name, c.signatory_title, c.enrollable_type,
        CASE WHEN c.enrollable_type = 'course' THEN co.title_fr ELSE lp.title_fr END as course_title_fr,
        CASE WHEN c.enrollable_type = 'course' THEN co.title_en ELSE lp.title_en END as course_title_en
      FROM certificates c
      LEFT JOIN courses co ON c.enrollable_type = 'course' AND c.enrollable_id = co.id
      LEFT JOIN learning_paths lp ON c.enrollable_type = 'learning_path' AND c.enrollable_id = lp.id
      WHERE c.verification_code = ? OR c.certificate_number = ?
    `, [code, code]);

    if (certificates.length === 0) {
      return res.json({ success: false, valid: false, message: 'Certificat non trouvé' });
    }

    const cert = certificates[0];

    // Incrémenter le compteur de vérifications
    await db.query(`
      UPDATE certificates SET verified_count = verified_count + 1, last_verified_at = NOW() WHERE id = ?
    `, [cert.id]);

    // Vérifier si le certificat est expiré
    let isValid = cert.status === 'active';
    if (cert.expiry_date && new Date(cert.expiry_date) < new Date()) {
      isValid = false;
      await db.query("UPDATE certificates SET status = 'expired' WHERE id = ?", [cert.id]);
      cert.status = 'expired';
    }

    res.json({
      success: true,
      valid: isValid,
      data: {
        certificate_number: cert.certificate_number,
        recipient_name: cert.recipient_name,
        title_fr: cert.title_fr,
        title_en: cert.title_en,
        course_title_fr: cert.course_title_fr,
        course_title_en: cert.course_title_en,
        final_score: cert.final_score,
        total_hours: cert.total_hours,
        issue_date: cert.issue_date,
        expiry_date: cert.expiry_date,
        status: cert.status,
        signatory_name: cert.signatory_name,
        signatory_title: cert.signatory_title,
        enrollable_type: cert.enrollable_type
      }
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/elearning/certificates/generate - Générer un certificat
router.post('/certificates/generate', auth, async (req, res) => {
  try {
    const { enrollment_id } = req.body;

    // Vérifier l'inscription
    const [enrollments] = await db.query(`
      SELECT e.*,
        CASE WHEN e.enrollable_type = 'course' THEN c.title_fr ELSE lp.title_fr END as title_fr,
        CASE WHEN e.enrollable_type = 'course' THEN c.title_en ELSE lp.title_en END as title_en,
        CASE WHEN e.enrollable_type = 'course' THEN c.certificate_enabled ELSE lp.certificate_enabled END as cert_enabled,
        CASE WHEN e.enrollable_type = 'course' THEN c.certificate_validity_months ELSE lp.certificate_validity_months END as validity_months,
        CASE WHEN e.enrollable_type = 'course' THEN c.duration_hours ELSE lp.duration_hours END as total_hours,
        u.username, u.email, u.first_name, u.last_name
      FROM enrollments e
      LEFT JOIN courses c ON e.enrollable_type = 'course' AND e.enrollable_id = c.id
      LEFT JOIN learning_paths lp ON e.enrollable_type = 'learning_path' AND e.enrollable_id = lp.id
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.id = ? AND e.user_id = ?
    `, [enrollment_id, req.user.id]);

    if (enrollments.length === 0) {
      return res.status(404).json({ success: false, message: 'Inscription non trouvée' });
    }

    const enrollment = enrollments[0];

    // Vérifier si l'inscription est complétée
    if (enrollment.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Cours non terminé' });
    }

    // Vérifier si les certificats sont activés
    if (!enrollment.cert_enabled) {
      return res.status(400).json({ success: false, message: 'Certificats non disponibles pour ce cours' });
    }

    // Vérifier si un certificat existe déjà
    const [existing] = await db.query(`
      SELECT id FROM certificates WHERE enrollment_id = ? AND status = 'active'
    `, [enrollment_id]);

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Un certificat existe déjà' });
    }

    // Générer le certificat
    const certificateNumber = generateCertificateNumber();
    const verificationCode = `${certificateNumber}-${Date.now().toString(36)}`.toUpperCase();
    const recipientName = enrollment.first_name && enrollment.last_name
      ? `${enrollment.first_name} ${enrollment.last_name}`
      : enrollment.username;
    const issueDate = new Date();
    let expiryDate = null;
    if (enrollment.validity_months) {
      expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + enrollment.validity_months);
    }

    const [result] = await db.query(`
      INSERT INTO certificates (
        certificate_number, user_id, enrollable_type, enrollable_id, enrollment_id,
        title_fr, title_en, recipient_name, recipient_email, final_score, total_hours,
        issue_date, expiry_date, verification_code, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [
      certificateNumber, req.user.id, enrollment.enrollable_type, enrollment.enrollable_id,
      enrollment_id, enrollment.title_fr, enrollment.title_en, recipientName, enrollment.email,
      enrollment.final_score, enrollment.total_hours, issueDate, expiryDate, verificationCode
    ]);

    // Mettre à jour l'inscription avec l'ID du certificat
    await db.query('UPDATE enrollments SET certificate_id = ? WHERE id = ?', [result.insertId, enrollment_id]);

    const [newCert] = await db.query('SELECT * FROM certificates WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, data: newCert[0], message: 'Certificat généré' });
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/elearning/certificates/:id/revoke - Révoquer un certificat (admin)
router.put('/certificates/:id/revoke', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const [existing] = await db.query('SELECT * FROM certificates WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Certificat non trouvé' });
    }

    await db.query(`
      UPDATE certificates SET status = 'revoked', revoked_at = NOW(), revoked_by = ?, revoked_reason = ?
      WHERE id = ?
    `, [req.user.id, reason || 'Révoqué par administrateur', id]);

    res.json({ success: true, message: 'Certificat révoqué' });
  } catch (error) {
    console.error('Revoke certificate error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/elearning/certificates/:id/reinstate - Réactiver un certificat (admin)
router.put('/certificates/:id/reinstate', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM certificates WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Certificat non trouvé' });
    }

    await db.query(`
      UPDATE certificates SET status = 'active', revoked_at = NULL, revoked_by = NULL, revoked_reason = NULL
      WHERE id = ?
    `, [id]);

    res.json({ success: true, message: 'Certificat réactivé' });
  } catch (error) {
    console.error('Reinstate certificate error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/elearning/certificates/:id/download - Télécharger le PDF du certificat
router.get('/certificates/:id/download', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [certificates] = await db.query(`
      SELECT c.*,
        CASE WHEN c.enrollable_type = 'course' THEN co.title_fr ELSE lp.title_fr END as course_title_fr,
        CASE WHEN c.enrollable_type = 'course' THEN co.title_en ELSE lp.title_en END as course_title_en,
        CASE WHEN c.enrollable_type = 'course' THEN co.thumbnail ELSE lp.thumbnail END as thumbnail
      FROM certificates c
      LEFT JOIN courses co ON c.enrollable_type = 'course' AND c.enrollable_id = co.id
      LEFT JOIN learning_paths lp ON c.enrollable_type = 'learning_path' AND c.enrollable_id = lp.id
      WHERE c.id = ?
    `, [id]);

    if (certificates.length === 0) {
      return res.status(404).json({ success: false, message: 'Certificat non trouvé' });
    }

    const cert = certificates[0];

    // Vérifier les droits
    if (cert.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }

    // Déterminer la langue depuis le query param ou header
    const lang = req.query.lang || req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'fr';

    // Générer le PDF à la volée
    try {
      const pdfBuffer = await generateCertificatePDF(cert, lang === 'en' ? 'en' : 'fr');

      // Définir les headers pour le téléchargement
      const filename = `certificat_${cert.certificate_number}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // Envoyer le PDF
      res.send(pdfBuffer);
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
      res.status(500).json({ success: false, message: 'Erreur lors de la génération du PDF' });
    }
  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// CERTIFICATE TEMPLATES
// ============================================

// Get all certificate templates
router.get('/certificate-templates', auth, async (req, res) => {
  try {
    const [templates] = await db.query(`
      SELECT * FROM certificate_templates
      WHERE is_active = TRUE
      ORDER BY is_default DESC, name ASC
    `);
    res.json({ success: true, data: templates });
  } catch (error) {
    console.error('Error fetching certificate templates:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Get single template
router.get('/certificate-templates/:id', auth, async (req, res) => {
  try {
    const [templates] = await db.query('SELECT * FROM certificate_templates WHERE id = ?', [req.params.id]);
    if (templates.length === 0) {
      return res.status(404).json({ success: false, message: 'Template non trouvé' });
    }
    res.json({ success: true, data: templates[0] });
  } catch (error) {
    console.error('Error fetching certificate template:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Create certificate template (admin only)
router.post('/certificate-templates', auth, async (req, res) => {
  try {
    const {
      name, slug, description,
      background_image, background_color,
      logo_url, logo_position, logo_width,
      title_text, title_font, title_size, title_color,
      body_font, body_color,
      border_style, border_color, border_width,
      signatory_name, signatory_title, signatory_signature, show_signature,
      show_qr_code, qr_position,
      show_score, show_date, show_hours,
      is_default, custom_css
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Le nom est requis' });
    }

    const templateSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Si ce template devient le défaut, enlever le défaut des autres
    if (is_default) {
      await db.query('UPDATE certificate_templates SET is_default = FALSE');
    }

    const [result] = await db.query(`
      INSERT INTO certificate_templates (
        name, slug, description,
        background_image, background_color,
        logo_url, logo_position, logo_width,
        title_text, title_font, title_size, title_color,
        body_font, body_color,
        border_style, border_color, border_width,
        signatory_name, signatory_title, signatory_signature, show_signature,
        show_qr_code, qr_position,
        show_score, show_date, show_hours,
        is_default, custom_css, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, templateSlug, description,
      background_image, background_color || '#ffffff',
      logo_url, logo_position || 'top-center', logo_width || 150,
      title_text || 'CERTIFICAT DE RÉUSSITE', title_font || 'serif', title_size || 36, title_color || '#1a365d',
      body_font || 'sans-serif', body_color || '#2d3748',
      border_style || 'ornate', border_color || '#c5a572', border_width || 10,
      signatory_name, signatory_title, signatory_signature, show_signature !== false,
      show_qr_code !== false, qr_position || 'bottom-right',
      show_score !== false, show_date !== false, show_hours !== false,
      is_default || false, custom_css, req.user.id
    ]);

    res.json({ success: true, message: 'Template créé', data: { id: result.insertId } });
  } catch (error) {
    console.error('Error creating certificate template:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Update certificate template
router.put('/certificate-templates/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Si ce template devient le défaut, enlever le défaut des autres
    if (updates.is_default) {
      await db.query('UPDATE certificate_templates SET is_default = FALSE WHERE id != ?', [id]);
    }

    const allowedFields = [
      'name', 'description',
      'background_image', 'background_color',
      'logo_url', 'logo_position', 'logo_width',
      'title_text', 'title_font', 'title_size', 'title_color',
      'body_font', 'body_color',
      'border_style', 'border_color', 'border_width',
      'signatory_name', 'signatory_title', 'signatory_signature', 'show_signature',
      'show_qr_code', 'qr_position',
      'show_score', 'show_date', 'show_hours',
      'is_default', 'is_active', 'custom_css'
    ];

    const setClauses = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucun champ à mettre à jour' });
    }

    values.push(id);
    await db.query(`UPDATE certificate_templates SET ${setClauses.join(', ')} WHERE id = ?`, values);

    res.json({ success: true, message: 'Template mis à jour' });
  } catch (error) {
    console.error('Error updating certificate template:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Delete certificate template
router.delete('/certificate-templates/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que ce n'est pas le template par défaut
    const [template] = await db.query('SELECT is_default FROM certificate_templates WHERE id = ?', [id]);
    if (template.length > 0 && template[0].is_default) {
      return res.status(400).json({ success: false, message: 'Impossible de supprimer le template par défaut' });
    }

    await db.query('DELETE FROM certificate_templates WHERE id = ?', [id]);
    res.json({ success: true, message: 'Template supprimé' });
  } catch (error) {
    console.error('Error deleting certificate template:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Upload template background image
router.post('/certificate-templates/upload-background', auth, uploadCertificateImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucune image fournie' });
    }

    const imageUrl = `/uploads/certificates/${req.file.filename}`;
    res.json({ success: true, data: { url: imageUrl } });
  } catch (error) {
    console.error('Error uploading background:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/elearning/certificate-templates/:templateId/preview - Générer un certificat de test
router.get('/certificate-templates/:templateId/preview', auth, async (req, res) => {
  try {
    const { templateId } = req.params;
    const lang = req.query.lang || 'fr';

    // Créer un certificat fictif pour le test
    const testCertificate = {
      id: 0,
      certificate_number: 'TEST-' + Date.now().toString(36).toUpperCase(),
      recipient_name: 'Jean-Paul Exemple',
      recipient_email: 'test@example.com',
      title_fr: 'Formation One Health - Approche Intégrée',
      title_en: 'One Health Training - Integrated Approach',
      course_title_fr: 'Formation One Health - Approche Intégrée',
      course_title_en: 'One Health Training - Integrated Approach',
      enrollable_type: 'course',
      final_score: 92,
      total_hours: 24,
      issue_date: new Date().toISOString(),
      expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      verification_code: 'VERIF-TEST-' + Date.now().toString(36).toUpperCase(),
      status: 'active',
      template_id: templateId
    };

    // Générer le PDF avec le template spécifié
    const pdfBuffer = await generateCertificatePDF(testCertificate, lang === 'en' ? 'en' : 'fr');

    // Définir les headers pour le téléchargement
    const filename = `certificat_test_${templateId}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Envoyer le PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Preview certificate error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la génération du PDF: ' + error.message });
  }
});

// ============================================
// CALCUL DES NOTES PONDEREES
// ============================================

// GET /api/elearning/courses/:id/calculate-grade/:userId - Calculer la note pondérée d'un cours
router.get('/courses/:id/calculate-grade/:userId', auth, async (req, res) => {
  try {
    const { id: courseId, userId } = req.params;

    // Vérifier les permissions (admin ou l'utilisateur lui-même)
    if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }

    // Récupérer les infos du cours
    const [courses] = await db.query(`
      SELECT id, title_fr, min_passing_score, final_quiz_id, final_quiz_weight, module_quizzes_weight
      FROM courses WHERE id = ?
    `, [courseId]);

    if (courses.length === 0) {
      return res.status(404).json({ success: false, message: 'Cours non trouvé' });
    }

    const course = courses[0];

    // Récupérer tous les quiz des modules avec leurs poids
    const [moduleQuizzes] = await db.query(`
      SELECT
        cm.id as module_id,
        cm.title_fr as module_title,
        cm.quiz_id,
        cm.quiz_weight,
        q.contributes_to_grade,
        q.grade_weight as quiz_grade_weight,
        qa.score,
        qa.passed
      FROM course_modules cm
      LEFT JOIN quizzes q ON cm.quiz_id = q.id
      LEFT JOIN quiz_attempts qa ON (
        qa.quiz_id = cm.quiz_id
        AND qa.user_id = ?
        AND qa.status = 'completed'
        AND qa.score = (
          SELECT MAX(score) FROM quiz_attempts
          WHERE quiz_id = cm.quiz_id AND user_id = ? AND status = 'completed'
        )
      )
      WHERE cm.course_id = ? AND cm.has_quiz = 1 AND cm.is_active = 1
      ORDER BY cm.sort_order
    `, [userId, userId, courseId]);

    // Récupérer les quiz des leçons avec leurs poids
    const [lessonQuizzes] = await db.query(`
      SELECT
        l.id as lesson_id,
        l.title_fr as lesson_title,
        l.quiz_id,
        l.quiz_weight,
        cm.id as module_id,
        q.contributes_to_grade,
        q.grade_weight as quiz_grade_weight,
        qa.score,
        qa.passed
      FROM lessons l
      INNER JOIN course_modules cm ON l.module_id = cm.id
      LEFT JOIN quizzes q ON l.quiz_id = q.id
      LEFT JOIN quiz_attempts qa ON (
        qa.quiz_id = l.quiz_id
        AND qa.user_id = ?
        AND qa.status = 'completed'
        AND qa.score = (
          SELECT MAX(score) FROM quiz_attempts
          WHERE quiz_id = l.quiz_id AND user_id = ? AND status = 'completed'
        )
      )
      WHERE cm.course_id = ? AND l.has_quiz = 1 AND l.is_active = 1
      ORDER BY cm.sort_order, l.sort_order
    `, [userId, userId, courseId]);

    // Récupérer le score du quiz final du cours (si existant)
    let finalQuizScore = null;
    if (course.final_quiz_id) {
      const [finalQuizAttempts] = await db.query(`
        SELECT score, passed FROM quiz_attempts
        WHERE quiz_id = ? AND user_id = ? AND status = 'completed'
        ORDER BY score DESC LIMIT 1
      `, [course.final_quiz_id, userId]);

      if (finalQuizAttempts.length > 0) {
        finalQuizScore = finalQuizAttempts[0].score;
      }
    }

    // Calculer la moyenne pondérée des quiz de modules et leçons
    let totalWeightedScore = 0;
    let totalWeight = 0;
    const quizDetails = [];

    // Quiz des modules
    for (const mq of moduleQuizzes) {
      if (mq.quiz_id && mq.contributes_to_grade !== false) {
        const effectiveWeight = (mq.quiz_weight || 1) * (mq.quiz_grade_weight || 1);
        if (mq.score !== null) {
          totalWeightedScore += mq.score * effectiveWeight;
          totalWeight += effectiveWeight;
        }
        quizDetails.push({
          type: 'module',
          module_id: mq.module_id,
          module_title: mq.module_title,
          score: mq.score,
          weight: effectiveWeight,
          contributes: mq.contributes_to_grade !== false
        });
      }
    }

    // Quiz des leçons
    for (const lq of lessonQuizzes) {
      if (lq.quiz_id && lq.contributes_to_grade !== false) {
        const effectiveWeight = (lq.quiz_weight || 1) * (lq.quiz_grade_weight || 1);
        if (lq.score !== null) {
          totalWeightedScore += lq.score * effectiveWeight;
          totalWeight += effectiveWeight;
        }
        quizDetails.push({
          type: 'lesson',
          lesson_id: lq.lesson_id,
          lesson_title: lq.lesson_title,
          module_id: lq.module_id,
          score: lq.score,
          weight: effectiveWeight,
          contributes: lq.contributes_to_grade !== false
        });
      }
    }

    // Calculer la moyenne des quiz de modules/leçons
    const moduleQuizzesAverage = totalWeight > 0 ? totalWeightedScore / totalWeight : null;

    // Calculer la note finale du cours
    let weightedScore = null;
    const finalQuizWeight = course.final_quiz_weight || 1;
    const moduleQuizzesWeight = course.module_quizzes_weight || 1;

    if (course.final_quiz_id && finalQuizScore !== null && moduleQuizzesAverage !== null) {
      // Moyenne pondérée entre quiz final et moyenne des modules
      weightedScore = (finalQuizScore * finalQuizWeight + moduleQuizzesAverage * moduleQuizzesWeight)
                      / (finalQuizWeight + moduleQuizzesWeight);
    } else if (course.final_quiz_id && finalQuizScore !== null) {
      // Seulement le quiz final
      weightedScore = finalQuizScore;
    } else if (moduleQuizzesAverage !== null) {
      // Seulement les quiz de modules
      weightedScore = moduleQuizzesAverage;
    }

    // Arrondir à 2 décimales
    if (weightedScore !== null) {
      weightedScore = Math.round(weightedScore * 100) / 100;
    }

    // Déterminer l'éligibilité au certificat
    const certificateEligible = weightedScore !== null && weightedScore >= (course.min_passing_score || 70);

    // Mettre à jour l'enrollment avec le score calculé
    await db.query(`
      UPDATE enrollments
      SET weighted_score = ?,
          quiz_average = ?,
          certificate_eligible = ?
      WHERE user_id = ? AND course_id = ?
    `, [weightedScore, moduleQuizzesAverage, certificateEligible, userId, courseId]);

    res.json({
      success: true,
      data: {
        course_id: courseId,
        user_id: userId,
        module_quizzes_average: moduleQuizzesAverage,
        final_quiz_score: finalQuizScore,
        weighted_score: weightedScore,
        min_passing_score: course.min_passing_score || 70,
        certificate_eligible: certificateEligible,
        weights: {
          final_quiz_weight: finalQuizWeight,
          module_quizzes_weight: moduleQuizzesWeight
        },
        quiz_details: quizDetails
      }
    });
  } catch (error) {
    console.error('Calculate course grade error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/elearning/paths/:id/calculate-grade/:userId - Calculer la note pondérée d'un parcours
router.get('/paths/:id/calculate-grade/:userId', auth, async (req, res) => {
  try {
    const { id: pathId, userId } = req.params;

    // Vérifier les permissions
    if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ success: false, message: 'Accès non autorisé' });
    }

    // Récupérer les infos du parcours
    const [paths] = await db.query(`
      SELECT id, title_fr, min_passing_score, final_exam_id, final_quiz_weight, courses_quizzes_weight
      FROM learning_paths WHERE id = ?
    `, [pathId]);

    if (paths.length === 0) {
      return res.status(404).json({ success: false, message: 'Parcours non trouvé' });
    }

    const path = paths[0];

    // Récupérer tous les cours du parcours avec leurs poids et scores
    const [pathCourses] = await db.query(`
      SELECT
        lpc.course_id,
        lpc.course_weight,
        lpc.is_required,
        c.title_fr as course_title,
        c.min_passing_score as course_passing_score,
        e.weighted_score as course_score,
        e.certificate_eligible as course_passed
      FROM learning_path_courses lpc
      INNER JOIN courses c ON lpc.course_id = c.id
      LEFT JOIN enrollments e ON (e.course_id = lpc.course_id AND e.user_id = ?)
      WHERE lpc.learning_path_id = ?
      ORDER BY lpc.sort_order
    `, [userId, pathId]);

    // Récupérer le score du quiz final du parcours (si existant)
    let finalExamScore = null;
    if (path.final_exam_id) {
      const [finalExamAttempts] = await db.query(`
        SELECT score, passed FROM quiz_attempts
        WHERE quiz_id = ? AND user_id = ? AND status = 'completed'
        ORDER BY score DESC LIMIT 1
      `, [path.final_exam_id, userId]);

      if (finalExamAttempts.length > 0) {
        finalExamScore = finalExamAttempts[0].score;
      }
    }

    // Calculer la moyenne pondérée des cours
    let totalWeightedScore = 0;
    let totalWeight = 0;
    const courseDetails = [];

    for (const pc of pathCourses) {
      const weight = pc.course_weight || 1;
      if (pc.course_score !== null) {
        totalWeightedScore += pc.course_score * weight;
        totalWeight += weight;
      }
      courseDetails.push({
        course_id: pc.course_id,
        course_title: pc.course_title,
        score: pc.course_score,
        weight: weight,
        is_required: pc.is_required,
        passed: pc.course_passed
      });
    }

    const coursesAverage = totalWeight > 0 ? totalWeightedScore / totalWeight : null;

    // Calculer la note finale du parcours
    let weightedScore = null;
    const finalQuizWeight = path.final_quiz_weight || 1;
    const coursesQuizzesWeight = path.courses_quizzes_weight || 1;

    if (path.final_exam_id && finalExamScore !== null && coursesAverage !== null) {
      // Moyenne pondérée entre quiz final et moyenne des cours
      weightedScore = (finalExamScore * finalQuizWeight + coursesAverage * coursesQuizzesWeight)
                      / (finalQuizWeight + coursesQuizzesWeight);
    } else if (path.final_exam_id && finalExamScore !== null) {
      // Seulement le quiz final
      weightedScore = finalExamScore;
    } else if (coursesAverage !== null) {
      // Seulement les cours
      weightedScore = coursesAverage;
    }

    // Arrondir à 2 décimales
    if (weightedScore !== null) {
      weightedScore = Math.round(weightedScore * 100) / 100;
    }

    // Déterminer l'éligibilité au certificat
    const certificateEligible = weightedScore !== null && weightedScore >= (path.min_passing_score || 70);

    // Mettre à jour l'enrollment du parcours avec le score calculé
    await db.query(`
      UPDATE enrollments
      SET weighted_score = ?,
          quiz_average = ?,
          certificate_eligible = ?
      WHERE user_id = ? AND learning_path_id = ?
    `, [weightedScore, coursesAverage, certificateEligible, userId, pathId]);

    res.json({
      success: true,
      data: {
        path_id: pathId,
        user_id: userId,
        courses_average: coursesAverage,
        final_exam_score: finalExamScore,
        weighted_score: weightedScore,
        min_passing_score: path.min_passing_score || 70,
        certificate_eligible: certificateEligible,
        weights: {
          final_quiz_weight: finalQuizWeight,
          courses_quizzes_weight: coursesQuizzesWeight
        },
        course_details: courseDetails
      }
    });
  } catch (error) {
    console.error('Calculate path grade error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/elearning/quizzes/:id/submit - Hook pour recalculer les notes après soumission de quiz
// Cette route est appelée après la soumission d'un quiz pour mettre à jour les notes
router.post('/quizzes/:id/recalculate-grades', auth, async (req, res) => {
  try {
    const { id: quizId } = req.params;
    const userId = req.user.id;

    // Trouver à quel cours/module/leçon ce quiz est attaché
    const [moduleWithQuiz] = await db.query(`
      SELECT cm.course_id FROM course_modules cm WHERE cm.quiz_id = ?
    `, [quizId]);

    const [lessonWithQuiz] = await db.query(`
      SELECT cm.course_id FROM lessons l
      INNER JOIN course_modules cm ON l.module_id = cm.id
      WHERE l.quiz_id = ?
    `, [quizId]);

    const [courseWithQuiz] = await db.query(`
      SELECT id as course_id FROM courses WHERE final_quiz_id = ?
    `, [quizId]);

    const [pathWithQuiz] = await db.query(`
      SELECT id as path_id FROM learning_paths WHERE final_exam_id = ?
    `, [quizId]);

    // Recalculer les notes pour les cours concernés
    const courseIds = new Set();

    if (moduleWithQuiz.length > 0) courseIds.add(moduleWithQuiz[0].course_id);
    if (lessonWithQuiz.length > 0) courseIds.add(lessonWithQuiz[0].course_id);
    if (courseWithQuiz.length > 0) courseIds.add(courseWithQuiz[0].course_id);

    // Recalculer pour chaque cours
    for (const courseId of courseIds) {
      // Appeler la logique de calcul (même code que calculate-grade)
      await recalculateCourseGrade(courseId, userId, db);
    }

    // Si c'est un quiz final de parcours, recalculer le parcours
    if (pathWithQuiz.length > 0) {
      await recalculatePathGrade(pathWithQuiz[0].path_id, userId, db);
    }

    res.json({ success: true, message: 'Notes recalculées' });
  } catch (error) {
    console.error('Recalculate grades error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Fonction utilitaire pour recalculer la note d'un cours
async function recalculateCourseGrade(courseId, userId, db) {
  const [courses] = await db.query(`
    SELECT id, min_passing_score, final_quiz_id, final_quiz_weight, module_quizzes_weight
    FROM courses WHERE id = ?
  `, [courseId]);

  if (courses.length === 0) return;

  const course = courses[0];

  // Quiz des modules
  const [moduleQuizzes] = await db.query(`
    SELECT cm.quiz_id, cm.quiz_weight, q.contributes_to_grade, q.grade_weight,
           (SELECT MAX(score) FROM quiz_attempts WHERE quiz_id = cm.quiz_id AND user_id = ? AND status = 'completed') as score
    FROM course_modules cm
    LEFT JOIN quizzes q ON cm.quiz_id = q.id
    WHERE cm.course_id = ? AND cm.has_quiz = 1 AND cm.is_active = 1
  `, [userId, courseId]);

  // Quiz des leçons
  const [lessonQuizzes] = await db.query(`
    SELECT l.quiz_id, l.quiz_weight, q.contributes_to_grade, q.grade_weight,
           (SELECT MAX(score) FROM quiz_attempts WHERE quiz_id = l.quiz_id AND user_id = ? AND status = 'completed') as score
    FROM lessons l
    INNER JOIN course_modules cm ON l.module_id = cm.id
    LEFT JOIN quizzes q ON l.quiz_id = q.id
    WHERE cm.course_id = ? AND l.has_quiz = 1 AND l.is_active = 1
  `, [userId, courseId]);

  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const mq of moduleQuizzes) {
    if (mq.quiz_id && mq.contributes_to_grade !== false && mq.score !== null) {
      const effectiveWeight = (mq.quiz_weight || 1) * (mq.grade_weight || 1);
      totalWeightedScore += mq.score * effectiveWeight;
      totalWeight += effectiveWeight;
    }
  }

  for (const lq of lessonQuizzes) {
    if (lq.quiz_id && lq.contributes_to_grade !== false && lq.score !== null) {
      const effectiveWeight = (lq.quiz_weight || 1) * (lq.grade_weight || 1);
      totalWeightedScore += lq.score * effectiveWeight;
      totalWeight += effectiveWeight;
    }
  }

  const moduleQuizzesAverage = totalWeight > 0 ? totalWeightedScore / totalWeight : null;

  // Quiz final
  let finalQuizScore = null;
  if (course.final_quiz_id) {
    const [finalAttempts] = await db.query(`
      SELECT MAX(score) as score FROM quiz_attempts
      WHERE quiz_id = ? AND user_id = ? AND status = 'completed'
    `, [course.final_quiz_id, userId]);
    if (finalAttempts.length > 0) finalQuizScore = finalAttempts[0].score;
  }

  // Calculer note finale
  let weightedScore = null;
  const finalQuizWeight = course.final_quiz_weight || 1;
  const moduleQuizzesWeight = course.module_quizzes_weight || 1;

  if (course.final_quiz_id && finalQuizScore !== null && moduleQuizzesAverage !== null) {
    weightedScore = (finalQuizScore * finalQuizWeight + moduleQuizzesAverage * moduleQuizzesWeight)
                    / (finalQuizWeight + moduleQuizzesWeight);
  } else if (course.final_quiz_id && finalQuizScore !== null) {
    weightedScore = finalQuizScore;
  } else if (moduleQuizzesAverage !== null) {
    weightedScore = moduleQuizzesAverage;
  }

  if (weightedScore !== null) {
    weightedScore = Math.round(weightedScore * 100) / 100;
  }

  const certificateEligible = weightedScore !== null && weightedScore >= (course.min_passing_score || 70);

  await db.query(`
    UPDATE enrollments
    SET weighted_score = ?, quiz_average = ?, certificate_eligible = ?
    WHERE user_id = ? AND course_id = ?
  `, [weightedScore, moduleQuizzesAverage, certificateEligible, userId, courseId]);
}

// Fonction utilitaire pour recalculer la note d'un parcours
async function recalculatePathGrade(pathId, userId, db) {
  const [paths] = await db.query(`
    SELECT id, min_passing_score, final_exam_id, final_quiz_weight, courses_quizzes_weight
    FROM learning_paths WHERE id = ?
  `, [pathId]);

  if (paths.length === 0) return;

  const path = paths[0];

  // Cours du parcours
  const [pathCourses] = await db.query(`
    SELECT lpc.course_id, lpc.course_weight, e.weighted_score
    FROM learning_path_courses lpc
    LEFT JOIN enrollments e ON (e.course_id = lpc.course_id AND e.user_id = ?)
    WHERE lpc.learning_path_id = ?
  `, [userId, pathId]);

  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const pc of pathCourses) {
    const weight = pc.course_weight || 1;
    if (pc.weighted_score !== null) {
      totalWeightedScore += pc.weighted_score * weight;
      totalWeight += weight;
    }
  }

  const coursesAverage = totalWeight > 0 ? totalWeightedScore / totalWeight : null;

  // Quiz final du parcours
  let finalExamScore = null;
  if (path.final_exam_id) {
    const [finalAttempts] = await db.query(`
      SELECT MAX(score) as score FROM quiz_attempts
      WHERE quiz_id = ? AND user_id = ? AND status = 'completed'
    `, [path.final_exam_id, userId]);
    if (finalAttempts.length > 0) finalExamScore = finalAttempts[0].score;
  }

  // Calculer note finale
  let weightedScore = null;
  const finalQuizWeight = path.final_quiz_weight || 1;
  const coursesQuizzesWeight = path.courses_quizzes_weight || 1;

  if (path.final_exam_id && finalExamScore !== null && coursesAverage !== null) {
    weightedScore = (finalExamScore * finalQuizWeight + coursesAverage * coursesQuizzesWeight)
                    / (finalQuizWeight + coursesQuizzesWeight);
  } else if (path.final_exam_id && finalExamScore !== null) {
    weightedScore = finalExamScore;
  } else if (coursesAverage !== null) {
    weightedScore = coursesAverage;
  }

  if (weightedScore !== null) {
    weightedScore = Math.round(weightedScore * 100) / 100;
  }

  const certificateEligible = weightedScore !== null && weightedScore >= (path.min_passing_score || 70);

  await db.query(`
    UPDATE enrollments
    SET weighted_score = ?, quiz_average = ?, certificate_eligible = ?
    WHERE user_id = ? AND learning_path_id = ?
  `, [weightedScore, coursesAverage, certificateEligible, userId, pathId]);
}

module.exports = router;
