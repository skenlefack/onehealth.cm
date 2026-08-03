/**
 * DUSS-C API ROUTES
 * Défi Une Seule Santé Cameroun
 *
 * Routes pour :
 * - Banque de questions (CRUD, versioning, import/export)
 * - Modules et personas
 * - Templates de quiz
 * - Alertes (module M12)
 * - Analytics (4 vues du tableau de bord)
 * - Quiz public (sans authentification)
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, optionalAuth } = require('../middleware/auth');
const { body, query, param, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Services
const quizEngine = require('../services/dusscQuizEngine');
const analytics = require('../services/dusscAnalyticsService');
const importService = require('../services/dusscImportService');

// Upload pour import CSV
const csvUpload = multer({
  dest: path.join(__dirname, '..', 'uploads', 'dussc-imports'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.csv', '.txt'].includes(ext)) cb(null, true);
    else cb(new Error('Seuls les fichiers CSV sont acceptés'));
  },
});

// Rate limiters pour routes publiques
const quizLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, message: { success: false, message: 'Trop de requêtes' } });
const sessionLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { success: false, message: 'Trop de requêtes' } });
const syncLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, message: { success: false, message: 'Trop de requêtes' } });

// Helper validation
const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return false;
  }
  return true;
};

// ============================================
// MODULES
// ============================================

// GET /api/dussc/modules — Liste des modules
router.get('/modules', auth, async (req, res) => {
  try {
    const [modules] = await db.query(
      'SELECT * FROM dussc_modules ORDER BY sort_order'
    );
    res.json({ success: true, data: modules });
  } catch (err) {
    console.error('[DUSSC] modules error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/dussc/modules/:id — Modifier un module
router.put('/modules/:id', auth, async (req, res) => {
  try {
    const { name_fr, name_en, description_fr, description_en, priority, is_active, color, icon } = req.body;
    await db.query(
      `UPDATE dussc_modules SET
        name_fr = COALESCE(?, name_fr),
        name_en = COALESCE(?, name_en),
        description_fr = COALESCE(?, description_fr),
        description_en = COALESCE(?, description_en),
        priority = COALESCE(?, priority),
        is_active = COALESCE(?, is_active),
        color = COALESCE(?, color),
        icon = COALESCE(?, icon)
      WHERE id = ?`,
      [name_fr, name_en, description_fr, description_en, priority, is_active, color, icon, req.params.id]
    );
    res.json({ success: true, message: 'Module mis à jour' });
  } catch (err) {
    console.error('[DUSSC] update module error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/dussc/modules/:id/questions — Questions d'un module
router.get('/modules/:id/questions', auth, async (req, res) => {
  try {
    const [questions] = await db.query(
      `SELECT q.*, m.code as module_code
       FROM dussc_questions q
       JOIN dussc_modules m ON q.module_id = m.id
       WHERE q.module_id = ? AND q.is_current_version = 1
       ORDER BY q.id_question`,
      [req.params.id]
    );
    res.json({ success: true, data: questions });
  } catch (err) {
    console.error('[DUSSC] module questions error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// PERSONAS
// ============================================

// GET /api/dussc/personas — Liste des personas
router.get('/personas', auth, async (req, res) => {
  try {
    const [personas] = await db.query(
      'SELECT * FROM dussc_personas ORDER BY sort_order'
    );
    res.json({ success: true, data: personas });
  } catch (err) {
    console.error('[DUSSC] personas error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/dussc/personas/matrix — Matrice modules×personas
router.get('/personas/matrix', auth, async (req, res) => {
  try {
    const [matrix] = await db.query(`
      SELECT mp.*, m.code as module_code, m.name_fr as module_name,
             p.code as persona_code, p.name_fr as persona_name
      FROM dussc_module_personas mp
      JOIN dussc_modules m ON mp.module_id = m.id
      JOIN dussc_personas p ON mp.persona_id = p.id
      ORDER BY m.sort_order, p.sort_order
    `);
    res.json({ success: true, data: matrix });
  } catch (err) {
    console.error('[DUSSC] matrix error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// QUESTIONS — CRUD
// ============================================

// GET /api/dussc/questions — Liste paginée et filtrable
router.get('/questions', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;

    let where = 'WHERE q.is_current_version = 1';
    const params = [];

    if (req.query.module) {
      where += ' AND m.code = ?';
      params.push(req.query.module);
    }
    if (req.query.statut) {
      where += ' AND q.statut = ?';
      params.push(req.query.statut);
    }
    if (req.query.niveau) {
      where += ' AND q.niveau = ?';
      params.push(req.query.niveau);
    }
    if (req.query.role_test) {
      where += ' AND q.role_test = ?';
      params.push(req.query.role_test);
    }
    if (req.query.search) {
      where += ' AND (q.enonce_fr LIKE ? OR q.enonce_en LIKE ? OR q.id_question LIKE ?)';
      const s = `%${req.query.search}%`;
      params.push(s, s, s);
    }

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM dussc_questions q
       JOIN dussc_modules m ON q.module_id = m.id ${where}`,
      params
    );

    const [questions] = await db.query(
      `SELECT q.*, m.code as module_code, m.name_fr as module_name_fr, m.name_en as module_name_en
       FROM dussc_questions q
       JOIN dussc_modules m ON q.module_id = m.id
       ${where}
       ORDER BY q.id_question
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: questions,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (err) {
    console.error('[DUSSC] list questions error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/dussc/questions/:id — Détail d'une question
router.get('/questions/:id', auth, async (req, res) => {
  try {
    const [questions] = await db.query(
      `SELECT q.*, m.code as module_code, m.name_fr as module_name_fr
       FROM dussc_questions q
       JOIN dussc_modules m ON q.module_id = m.id
       WHERE q.id = ?`,
      [req.params.id]
    );
    if (questions.length === 0) {
      return res.status(404).json({ success: false, message: 'Question non trouvée' });
    }

    // Historique
    const [history] = await db.query(
      `SELECT h.*, u.name as user_name
       FROM dussc_question_history h
       LEFT JOIN users u ON h.user_id = u.id
       WHERE h.question_id = ?
       ORDER BY h.created_at DESC LIMIT 20`,
      [req.params.id]
    );

    res.json({ success: true, data: { ...questions[0], history } });
  } catch (err) {
    console.error('[DUSSC] get question error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/dussc/questions — Créer une question
router.post('/questions', auth, [
  body('module_id').isInt(),
  body('enonce_fr').notEmpty(),
  body('options_fr').isArray({ min: 3, max: 4 }),
  body('reponse_correcte').isIn(['A', 'B', 'C', 'D']),
  body('explication_fr').notEmpty(),
  body('action_fr').notEmpty(),
], async (req, res) => {
  if (!validate(req, res)) return;

  try {
    const b = req.body;

    // Générer l'ID automatiquement
    const [module] = await db.query('SELECT code FROM dussc_modules WHERE id = ?', [b.module_id]);
    if (module.length === 0) {
      return res.status(400).json({ success: false, message: 'Module invalide' });
    }

    // Trouver le prochain numéro
    const [last] = await db.query(
      `SELECT id_question FROM dussc_questions
       WHERE module_id = ? ORDER BY id_question DESC LIMIT 1`,
      [b.module_id]
    );

    let nextNum = 1;
    if (last.length > 0) {
      const match = last[0].id_question.match(/(\d+)$/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }

    const idQuestion = `DUSSC-${module[0].code}-${String(nextNum).padStart(3, '0')}`;
    const idVersion = `${idQuestion}-v1`;

    const [result] = await db.query(
      `INSERT INTO dussc_questions (
        id_question, id_version, version, module_id,
        theme_fr, theme_en, type_item, niveau, role_test, public_cible,
        enonce_fr, options_fr, reponse_correcte, explication_fr, action_fr,
        idee_fausse_ciblee_fr,
        enonce_en, options_en, explication_en, action_en,
        idee_fausse_ciblee_en,
        secteur_validateur, sensibilite, statut,
        date_creation, is_current_version, created_by
      ) VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'brouillon', CURDATE(), 1, ?)`,
      [
        idQuestion, idVersion, b.module_id,
        b.theme_fr || null, b.theme_en || null,
        b.type_item || 'connaissance', b.niveau || 'grand_public',
        b.role_test || 'courante',
        JSON.stringify(b.public_cible || []),
        b.enonce_fr, JSON.stringify(b.options_fr),
        b.reponse_correcte, b.explication_fr, b.action_fr,
        b.idee_fausse_ciblee_fr || null,
        b.enonce_en || null,
        b.options_en ? JSON.stringify(b.options_en) : null,
        b.explication_en || null, b.action_en || null,
        b.idee_fausse_ciblee_en || null,
        b.secteur_validateur ? JSON.stringify(b.secteur_validateur) : null,
        b.sensibilite || 'standard',
        req.user?.id || null,
      ]
    );

    // Historique
    await db.query(
      `INSERT INTO dussc_question_history (question_id, user_id, action, comment)
       VALUES (?, ?, 'created', 'Création de la question')`,
      [result.insertId, req.user?.id]
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId, id_question: idQuestion, id_version: idVersion },
    });
  } catch (err) {
    console.error('[DUSSC] create question error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/dussc/questions/:id — Modifier (crée nouvelle version)
router.put('/questions/:id', auth, async (req, res) => {
  try {
    const [existing] = await db.query('SELECT * FROM dussc_questions WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Question non trouvée' });
    }

    const old = existing[0];
    const b = req.body;

    // Créer une nouvelle version si le contenu change
    const contentChanged = b.enonce_fr !== undefined || b.options_fr !== undefined || b.reponse_correcte !== undefined;

    if (contentChanged && old.statut === 'publie') {
      // Désactiver l'ancienne version
      await db.query('UPDATE dussc_questions SET is_current_version = 0 WHERE id = ?', [old.id]);

      // Créer la nouvelle version
      const newVersion = old.version + 1;
      const newIdVersion = `${old.id_question}-v${newVersion}`;

      const [result] = await db.query(
        `INSERT INTO dussc_questions (
          id_question, id_version, version, module_id,
          theme_fr, theme_en, type_item, niveau, role_test, public_cible,
          enonce_fr, options_fr, reponse_correcte, explication_fr, action_fr,
          idee_fausse_ciblee_fr, enonce_en, options_en, explication_en, action_en,
          idee_fausse_ciblee_en, secteur_validateur, sensibilite, statut,
          source_documentaire, id_inventaire,
          date_creation, is_current_version, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'brouillon', ?, ?, CURDATE(), 1, ?)`,
        [
          old.id_question, newIdVersion, newVersion, b.module_id || old.module_id,
          b.theme_fr ?? old.theme_fr, b.theme_en ?? old.theme_en,
          b.type_item || old.type_item, b.niveau || old.niveau,
          b.role_test || old.role_test,
          b.public_cible ? JSON.stringify(b.public_cible) : old.public_cible,
          b.enonce_fr ?? old.enonce_fr,
          b.options_fr ? JSON.stringify(b.options_fr) : old.options_fr,
          b.reponse_correcte || old.reponse_correcte,
          b.explication_fr ?? old.explication_fr, b.action_fr ?? old.action_fr,
          b.idee_fausse_ciblee_fr ?? old.idee_fausse_ciblee_fr,
          b.enonce_en ?? old.enonce_en,
          b.options_en ? JSON.stringify(b.options_en) : old.options_en,
          b.explication_en ?? old.explication_en, b.action_en ?? old.action_en,
          b.idee_fausse_ciblee_en ?? old.idee_fausse_ciblee_en,
          b.secteur_validateur ? JSON.stringify(b.secteur_validateur) : old.secteur_validateur,
          b.sensibilite || old.sensibilite,
          old.source_documentaire, old.id_inventaire,
          req.user?.id || null,
        ]
      );

      await db.query(
        `INSERT INTO dussc_question_history (question_id, user_id, action, comment)
         VALUES (?, ?, 'version_created', ?)`,
        [result.insertId, req.user?.id, `Nouvelle version v${newVersion}`]
      );

      return res.json({ success: true, data: { id: result.insertId, id_version: newIdVersion, version: newVersion } });
    }

    // Mise à jour simple (pas encore publiée)
    const fields = [];
    const values = [];

    const updatable = [
      'theme_fr', 'theme_en', 'type_item', 'niveau', 'role_test',
      'enonce_fr', 'explication_fr', 'action_fr',
      'idee_fausse_ciblee_fr', 'enonce_en', 'explication_en', 'action_en',
      'idee_fausse_ciblee_en', 'sensibilite', 'source_documentaire',
    ];

    for (const field of updatable) {
      if (b[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(b[field]);
      }
    }

    // Champs JSON
    if (b.options_fr) { fields.push('options_fr = ?'); values.push(JSON.stringify(b.options_fr)); }
    if (b.options_en) { fields.push('options_en = ?'); values.push(JSON.stringify(b.options_en)); }
    if (b.public_cible) { fields.push('public_cible = ?'); values.push(JSON.stringify(b.public_cible)); }
    if (b.secteur_validateur) { fields.push('secteur_validateur = ?'); values.push(JSON.stringify(b.secteur_validateur)); }
    if (b.reponse_correcte) { fields.push('reponse_correcte = ?'); values.push(b.reponse_correcte); }
    if (b.module_id) { fields.push('module_id = ?'); values.push(b.module_id); }

    if (fields.length > 0) {
      fields.push('updated_by = ?');
      values.push(req.user?.id || null);
      values.push(req.params.id);

      await db.query(`UPDATE dussc_questions SET ${fields.join(', ')} WHERE id = ?`, values);

      await db.query(
        `INSERT INTO dussc_question_history (question_id, user_id, action, comment)
         VALUES (?, ?, 'edited', 'Modification')`,
        [req.params.id, req.user?.id]
      );
    }

    res.json({ success: true, message: 'Question mise à jour' });
  } catch (err) {
    console.error('[DUSSC] update question error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PATCH /api/dussc/questions/:id/status — Changer le statut (lifecycle)
router.patch('/questions/:id/status', auth, [
  body('statut').isIn([
    'brouillon', 'revue_editoriale', 'en_validation', 'traduction',
    'contre_validation', 'test_utilisateur', 'valide', 'publie', 'suspendu', 'retire'
  ]),
], async (req, res) => {
  if (!validate(req, res)) return;

  try {
    const { statut, motif_suspension, date_revision_prevue } = req.body;

    const updates = ['statut = ?'];
    const values = [statut];

    if (statut === 'suspendu' && motif_suspension) {
      updates.push('motif_suspension = ?');
      values.push(motif_suspension);
    }
    if (statut === 'publie') {
      // Définir la date de révision si pas déjà définie
      if (date_revision_prevue) {
        updates.push('date_revision_prevue = ?');
        values.push(date_revision_prevue);
      } else {
        updates.push('date_revision_prevue = DATE_ADD(CURDATE(), INTERVAL 24 MONTH)');
      }
    }

    values.push(req.params.id);
    await db.query(`UPDATE dussc_questions SET ${updates.join(', ')} WHERE id = ?`, values);

    await db.query(
      `INSERT INTO dussc_question_history (question_id, user_id, action, new_value, comment)
       VALUES (?, ?, 'status_changed', ?, ?)`,
      [req.params.id, req.user?.id, statut, motif_suspension || `Changement vers ${statut}`]
    );

    res.json({ success: true, message: `Statut changé vers ${statut}` });
  } catch (err) {
    console.error('[DUSSC] status change error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/dussc/questions/import — Import CSV
router.post('/questions/import', auth, csvUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Fichier CSV requis' });
    }

    const report = await importService.importCSV(req.file.path);

    // Nettoyage du fichier temporaire
    const fs = require('fs');
    fs.unlinkSync(req.file.path);

    res.json({ success: true, data: report });
  } catch (err) {
    console.error('[DUSSC] import error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/dussc/questions/export — Export CSV
router.get('/questions/export', auth, async (req, res) => {
  try {
    const csv = await importService.exportCSV({
      module: req.query.module,
      statut: req.query.statut,
      niveau: req.query.niveau,
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=dussc-questions-export.csv');
    res.send('\uFEFF' + csv); // BOM pour Excel
  } catch (err) {
    console.error('[DUSSC] export error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// TEMPLATES DE QUIZ
// ============================================

// GET /api/dussc/templates
router.get('/templates', auth, async (req, res) => {
  try {
    const [templates] = await db.query('SELECT * FROM dussc_quiz_templates ORDER BY created_at DESC');
    res.json({ success: true, data: templates });
  } catch (err) {
    console.error('[DUSSC] templates error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/dussc/templates
router.post('/templates', auth, [
  body('code').notEmpty(),
  body('name_fr').notEmpty(),
  body('name_en').notEmpty(),
], async (req, res) => {
  if (!validate(req, res)) return;

  try {
    const b = req.body;
    const [result] = await db.query(
      `INSERT INTO dussc_quiz_templates (
        code, name_fr, name_en, description_fr, description_en,
        pre_test_count, common_count, profile_count, post_test_count,
        randomize_options, show_feedback, show_feedback_pretest,
        show_progress_bar, require_consent, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b.code, b.name_fr, b.name_en, b.description_fr || null, b.description_en || null,
        b.pre_test_count || 3, b.common_count || 4, b.profile_count || 5, b.post_test_count || 3,
        b.randomize_options !== false ? 1 : 0,
        b.show_feedback !== false ? 1 : 0,
        b.show_feedback_pretest ? 1 : 0,
        b.show_progress_bar !== false ? 1 : 0,
        b.require_consent !== false ? 1 : 0,
        req.user?.id || null,
      ]
    );

    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (err) {
    console.error('[DUSSC] create template error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/dussc/templates/:id/publish — Activer un template
router.post('/templates/:id/publish', auth, async (req, res) => {
  try {
    // Désactiver tous les autres
    await db.query('UPDATE dussc_quiz_templates SET is_active = 0');
    // Activer celui-ci
    await db.query(
      'UPDATE dussc_quiz_templates SET is_active = 1, published_at = NOW() WHERE id = ?',
      [req.params.id]
    );
    res.json({ success: true, message: 'Template activé' });
  } catch (err) {
    console.error('[DUSSC] publish template error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/dussc/templates/:id/questions — Assigner des questions
router.post('/templates/:id/questions', auth, [
  body('questions').isArray(),
], async (req, res) => {
  if (!validate(req, res)) return;

  try {
    const templateId = req.params.id;
    const questions = req.body.questions; // [{question_id, bloc, sort_order, persona_filter}]

    // Supprimer les anciennes assignations
    await db.query('DELETE FROM dussc_quiz_template_questions WHERE template_id = ?', [templateId]);

    // Insérer les nouvelles
    for (const q of questions) {
      await db.query(
        `INSERT INTO dussc_quiz_template_questions
         (template_id, question_id, bloc, sort_order, persona_filter)
         VALUES (?, ?, ?, ?, ?)`,
        [
          templateId, q.question_id, q.bloc, q.sort_order || 0,
          q.persona_filter ? JSON.stringify(q.persona_filter) : null,
        ]
      );
    }

    res.json({ success: true, message: `${questions.length} questions assignées` });
  } catch (err) {
    console.error('[DUSSC] assign questions error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// ALERTES (Module M12)
// ============================================

// GET /api/dussc/alerts
router.get('/alerts', auth, async (req, res) => {
  try {
    const [alerts] = await db.query('SELECT * FROM dussc_alerts ORDER BY created_at DESC');
    res.json({ success: true, data: alerts });
  } catch (err) {
    console.error('[DUSSC] alerts error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/dussc/alerts
router.post('/alerts', auth, [
  body('code').notEmpty(),
  body('name_fr').notEmpty(),
  body('scenario').isIn(['mpox', 'cholera', 'influenza_aviaire', 'autre']),
], async (req, res) => {
  if (!validate(req, res)) return;

  try {
    const b = req.body;
    const [result] = await db.query(
      `INSERT INTO dussc_alerts (code, name_fr, name_en, scenario, description_fr, description_en, target_regions)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [b.code, b.name_fr, b.name_en || null, b.scenario, b.description_fr || null, b.description_en || null,
       b.target_regions ? JSON.stringify(b.target_regions) : null]
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (err) {
    console.error('[DUSSC] create alert error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PATCH /api/dussc/alerts/:id/activate
router.patch('/alerts/:id/activate', auth, async (req, res) => {
  try {
    await db.query(
      'UPDATE dussc_alerts SET status = ?, activated_at = NOW(), activated_by = ? WHERE id = ?',
      ['actif', req.user?.id, req.params.id]
    );
    res.json({ success: true, message: 'Alerte activée' });
  } catch (err) {
    console.error('[DUSSC] activate alert error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PATCH /api/dussc/alerts/:id/deactivate
router.patch('/alerts/:id/deactivate', auth, async (req, res) => {
  try {
    await db.query(
      'UPDATE dussc_alerts SET status = ?, deactivated_at = NOW() WHERE id = ?',
      ['desactive', req.params.id]
    );
    res.json({ success: true, message: 'Alerte désactivée' });
  } catch (err) {
    console.error('[DUSSC] deactivate alert error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// ANALYTICS (admin)
// ============================================

// GET /api/dussc/analytics/overview — Vue 1 Pilotage
router.get('/analytics/overview', auth, async (req, res) => {
  try {
    const data = await analytics.getOverviewDashboard(req.query);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[DUSSC] overview error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/dussc/analytics/learning — Vue 2 Apprentissage
router.get('/analytics/learning', auth, async (req, res) => {
  try {
    const data = await analytics.getLearningDashboard(req.query);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[DUSSC] learning error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/dussc/analytics/map — Vue 3 Cartographie
router.get('/analytics/map', auth, async (req, res) => {
  try {
    const data = await analytics.getMapDashboard(req.query);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[DUSSC] map error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/dussc/analytics/advocacy — Vue 4 Plaidoyer
router.get('/analytics/advocacy', auth, async (req, res) => {
  try {
    const data = await analytics.getAdvocacyDashboard();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[DUSSC] advocacy error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/dussc/analytics/psychometrics — Indices par question
router.get('/analytics/psychometrics', auth, async (req, res) => {
  try {
    const [questions] = await db.query(`
      SELECT q.id, q.id_question, q.enonce_fr, m.code as module_code,
        q.indice_difficulte, q.indice_discrimination, q.distracteur_dominant,
        q.n_observations, q.date_calcul_psy
      FROM dussc_questions q
      JOIN dussc_modules m ON q.module_id = m.id
      WHERE q.is_current_version = 1 AND q.statut = 'publie'
      ORDER BY q.id_question
    `);
    res.json({ success: true, data: questions });
  } catch (err) {
    console.error('[DUSSC] psychometrics error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/dussc/analytics/compute — Déclencher calcul hebdo
router.post('/analytics/compute', auth, async (req, res) => {
  try {
    const [weeklyResult] = await Promise.all([
      analytics.computeWeeklyStats(req.body.week_start),
      analytics.computeAllPsychometrics(),
      analytics.autoSuspendExpiredQuestions(),
    ]);
    res.json({ success: true, data: weeklyResult });
  } catch (err) {
    console.error('[DUSSC] compute error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/dussc/analytics/weekly — Stats hebdomadaires historiques
router.get('/analytics/weekly', auth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 16, 52);
    const [weeks] = await db.query(
      'SELECT * FROM dussc_weekly_stats ORDER BY week_start DESC LIMIT ?',
      [limit]
    );
    res.json({ success: true, data: weeks });
  } catch (err) {
    console.error('[DUSSC] weekly stats error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// SETTINGS
// ============================================

// GET /api/dussc/settings
router.get('/settings', auth, async (req, res) => {
  try {
    const [settings] = await db.query('SELECT * FROM dussc_settings ORDER BY setting_key');
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/dussc/settings/:key
router.put('/settings/:key', auth, async (req, res) => {
  try {
    await db.query(
      'UPDATE dussc_settings SET setting_value = ?, updated_by = ? WHERE setting_key = ?',
      [req.body.value, req.user?.id, req.params.key]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// ROUTES PUBLIQUES (sans authentification)
// ============================================

// GET /api/dussc/public/quiz — Quiz actif
router.get('/public/quiz', quizLimiter, async (req, res) => {
  try {
    const lang = req.query.lang || 'fr';
    const profil = req.query.profil || null;
    const quiz = await quizEngine.buildQuiz(lang, profil);
    res.json({ success: true, data: quiz });
  } catch (err) {
    console.error('[DUSSC] public quiz error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/dussc/public/sessions — Créer une session
router.post('/public/sessions', sessionLimiter, [
  body('uuid').isUUID(),
  body('langue').isIn(['fr', 'en']),
  body('consent').equals('true'),
], async (req, res) => {
  if (!validate(req, res)) return;

  try {
    const b = req.body;
    const [result] = await db.query(
      `INSERT INTO dussc_sessions (
        uuid_session, langue, profil, canal,
        consent_given, consent_given_at, started_at
      ) VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
      [b.uuid, b.langue, b.profil || null, b.canal || 'web']
    );

    res.status(201).json({
      success: true,
      data: { session_id: result.insertId, uuid: b.uuid },
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      // Session existe déjà, retourner l'existante
      const [existing] = await db.query(
        'SELECT id FROM dussc_sessions WHERE uuid_session = ?',
        [req.body.uuid]
      );
      return res.json({
        success: true,
        data: { session_id: existing[0]?.id, uuid: req.body.uuid },
      });
    }
    console.error('[DUSSC] create session error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/dussc/public/sessions/:uuid/responses — Soumettre une réponse
router.post('/public/sessions/:uuid/responses', quizLimiter, [
  body('question_id').isInt(),
  body('answer').isIn(['A', 'B', 'C', 'D']),
  body('bloc').isIn(['pre_test', 'tronc_commun', 'profil', 'post_test']),
], async (req, res) => {
  if (!validate(req, res)) return;

  try {
    // Trouver la session
    const [sessions] = await db.query(
      'SELECT id FROM dussc_sessions WHERE uuid_session = ?',
      [req.params.uuid]
    );
    if (sessions.length === 0) {
      return res.status(404).json({ success: false, message: 'Session non trouvée' });
    }

    const sessionId = sessions[0].id;
    const b = req.body;

    // Évaluer la réponse
    const evaluation = await quizEngine.evaluateResponse(
      b.question_id, b.answer, b.lang || 'fr', b.bloc
    );

    // Enregistrer la réponse
    await db.query(
      `INSERT INTO dussc_responses (
        session_id, question_id, question_order, answer_given,
        is_correct, bloc, duration_ms, options_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionId, b.question_id, b.question_order || 0,
        b.answer, evaluation.is_correct ? 1 : 0,
        b.bloc, b.duration_ms || null,
        b.options_order ? JSON.stringify(b.options_order) : null,
      ]
    );

    res.json({ success: true, data: evaluation });
  } catch (err) {
    console.error('[DUSSC] submit response error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/dussc/public/sessions/:uuid/complete — Terminer le parcours
router.post('/public/sessions/:uuid/complete', sessionLimiter, async (req, res) => {
  try {
    const [sessions] = await db.query(
      'SELECT id FROM dussc_sessions WHERE uuid_session = ?',
      [req.params.uuid]
    );
    if (sessions.length === 0) {
      return res.status(404).json({ success: false, message: 'Session non trouvée' });
    }

    const sessionId = sessions[0].id;
    const b = req.body;

    // Mettre à jour les données démographiques
    if (b.region || b.milieu || b.tranche_age || b.sexe) {
      await db.query(
        `UPDATE dussc_sessions SET
          region = COALESCE(?, region),
          milieu = COALESCE(?, milieu),
          tranche_age = COALESCE(?, tranche_age),
          sexe = COALESCE(?, sexe),
          id_equipe_facilitateur = COALESCE(?, id_equipe_facilitateur)
        WHERE id = ?`,
        [b.region, b.milieu, b.tranche_age, b.sexe, b.id_equipe_facilitateur, sessionId]
      );
    }

    // Calculer les scores
    const scores = await quizEngine.computeSessionScore(sessionId);

    // Marquer comme complet
    await db.query(
      `UPDATE dussc_sessions SET
        statut_achevement = 'complet',
        completed_at = NOW(),
        duration_seconds = ?
      WHERE id = ?`,
      [b.duration_seconds || null, sessionId]
    );

    // Vérifier les sessions suspectes
    await quizEngine.detectSuspicious(sessionId);

    res.json({ success: true, data: scores });
  } catch (err) {
    console.error('[DUSSC] complete session error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/dussc/public/sessions/:uuid/result — Résultat
router.get('/public/sessions/:uuid/result', quizLimiter, async (req, res) => {
  try {
    const [sessions] = await db.query(
      `SELECT s.*, m.name_fr as module_name_fr, m.name_en as module_name_en
       FROM dussc_sessions s
       LEFT JOIN dussc_modules m ON s.module_id = m.id
       WHERE s.uuid_session = ?`,
      [req.params.uuid]
    );
    if (sessions.length === 0) {
      return res.status(404).json({ success: false, message: 'Session non trouvée' });
    }

    const session = sessions[0];

    // Charger les réponses détaillées
    const [responses] = await db.query(
      `SELECT r.*, q.id_question, q.enonce_fr, q.enonce_en,
         q.explication_fr, q.explication_en, q.action_fr, q.action_en,
         q.reponse_correcte, q.options_fr, q.options_en,
         m.code as module_code
       FROM dussc_responses r
       JOIN dussc_questions q ON r.question_id = q.id
       JOIN dussc_modules m ON q.module_id = m.id
       WHERE r.session_id = ?
       ORDER BY r.question_order`,
      [session.id]
    );

    res.json({
      success: true,
      data: {
        session: {
          uuid: session.uuid_session,
          score_pre: session.score_pre,
          score_post: session.score_post,
          gain: session.gain,
          pct_pre: session.pct_pre,
          pct_post: session.pct_post,
          total_questions: session.total_questions,
          total_correct: session.total_correct,
          duration_seconds: session.duration_seconds,
          completed_at: session.completed_at,
        },
        responses,
      },
    });
  } catch (err) {
    console.error('[DUSSC] result error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/dussc/public/sessions/:uuid/events — Événements de parcours
router.post('/public/sessions/:uuid/events', quizLimiter, async (req, res) => {
  try {
    const [sessions] = await db.query(
      'SELECT id FROM dussc_sessions WHERE uuid_session = ?',
      [req.params.uuid]
    );
    if (sessions.length === 0) {
      return res.status(404).json({ success: false, message: 'Session non trouvée' });
    }

    const b = req.body;
    await db.query(
      `INSERT INTO dussc_journey_events (
        session_id, event_type, screen_number, screen_name,
        duration_ms, metadata
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        sessions[0].id, b.event_type, b.screen_number || null,
        b.screen_name || null, b.duration_ms || null,
        b.metadata ? JSON.stringify(b.metadata) : null,
      ]
    );

    // Si abandon, mettre à jour la session
    if (b.event_type === 'abandon') {
      await db.query(
        `UPDATE dussc_sessions SET
          statut_achevement = 'abandonne', screen_abandon = ?,
          duration_seconds = ?
        WHERE id = ?`,
        [b.screen_number, b.duration_seconds || null, sessions[0].id]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[DUSSC] event error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/dussc/public/sessions/sync — Synchronisation offline (batch)
router.post('/public/sessions/sync', syncLimiter, async (req, res) => {
  try {
    const { session, responses, events } = req.body;

    if (!session || !session.uuid) {
      return res.status(400).json({ success: false, message: 'Session requise avec uuid' });
    }

    // Créer ou retrouver la session
    let sessionId;
    const [existing] = await db.query(
      'SELECT id FROM dussc_sessions WHERE uuid_session = ?',
      [session.uuid]
    );

    if (existing.length > 0) {
      sessionId = existing[0].id;
    } else {
      const [result] = await db.query(
        `INSERT INTO dussc_sessions (
          uuid_session, langue, profil, canal, region, milieu, tranche_age, sexe,
          consent_given, consent_given_at, started_at, completed_at,
          statut_achevement, duration_seconds, id_equipe_facilitateur,
          synced_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          session.uuid, session.langue || 'fr', session.profil, session.canal || 'mobile',
          session.region, session.milieu, session.tranche_age, session.sexe,
          session.consent_given_at || new Date(), session.started_at || new Date(),
          session.completed_at, session.statut_achevement || 'complet',
          session.duration_seconds, session.id_equipe_facilitateur,
        ]
      );
      sessionId = result.insertId;
    }

    // Insérer les réponses
    let insertedResponses = 0;
    if (responses && Array.isArray(responses)) {
      for (const r of responses) {
        try {
          await db.query(
            `INSERT INTO dussc_responses (
              session_id, question_id, question_order, answer_given,
              is_correct, bloc, duration_ms, options_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              sessionId, r.question_id, r.question_order || 0,
              r.answer, r.is_correct ? 1 : 0, r.bloc,
              r.duration_ms, r.options_order ? JSON.stringify(r.options_order) : null,
            ]
          );
          insertedResponses++;
        } catch (e) {
          // Ignorer les doublons
        }
      }
    }

    // Insérer les événements
    if (events && Array.isArray(events)) {
      for (const e of events) {
        try {
          await db.query(
            `INSERT INTO dussc_journey_events (
              session_id, event_type, screen_number, screen_name,
              duration_ms, metadata
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
              sessionId, e.event_type, e.screen_number,
              e.screen_name, e.duration_ms,
              e.metadata ? JSON.stringify(e.metadata) : null,
            ]
          );
        } catch (e2) {
          // Ignorer
        }
      }
    }

    // Calculer les scores
    const scores = await quizEngine.computeSessionScore(sessionId);
    await quizEngine.detectSuspicious(sessionId);

    res.json({
      success: true,
      data: { session_id: sessionId, responses_synced: insertedResponses, scores },
    });
  } catch (err) {
    console.error('[DUSSC] sync error:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/dussc/public/modules — Modules actifs (info publique)
router.get('/public/modules', quizLimiter, async (req, res) => {
  try {
    const lang = req.query.lang || 'fr';
    const nameField = lang === 'fr' ? 'name_fr' : 'name_en';
    const descField = lang === 'fr' ? 'description_fr' : 'description_en';

    const [modules] = await db.query(
      `SELECT code, ${nameField} as name, ${descField} as description, icon, color
       FROM dussc_modules WHERE is_active = 1 ORDER BY sort_order`
    );
    res.json({ success: true, data: modules });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/dussc/public/consent — Texte de consentement
router.get('/public/consent', quizLimiter, async (req, res) => {
  try {
    const lang = req.query.lang || 'fr';
    const key = lang === 'fr' ? 'consent_text_fr' : 'consent_text_en';
    const [settings] = await db.query(
      'SELECT setting_value FROM dussc_settings WHERE setting_key = ?',
      [key]
    );
    res.json({ success: true, data: { text: settings[0]?.setting_value || '' } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/dussc/public/personas — Personas disponibles
router.get('/public/personas', quizLimiter, async (req, res) => {
  try {
    const lang = req.query.lang || 'fr';
    const nameField = lang === 'fr' ? 'name_fr' : 'name_en';
    const descField = lang === 'fr' ? 'description_fr' : 'description_en';

    const [personas] = await db.query(
      `SELECT code, family, ${nameField} as name, ${descField} as description
       FROM dussc_personas WHERE is_active = 1 ORDER BY sort_order`
    );
    res.json({ success: true, data: personas });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
