/**
 * COHRM-SYSTEM API ROUTES
 * Cameroon One Health Rumor Management System
 *
 * Routes pour la gestion des rumeurs sanitaires:
 * - Rumeurs (CRUD, filtres, statistiques)
 * - Codes SMS pour agents communautaires
 * - Paramètres système
 * - API Mobile pour l'application terrain
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, authorize, optionalAuth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Service de notifications COHRM
const cohrmNotificationService = require('../services/cohrmNotificationService');
const { sendSMS, smsTemplates } = require('../services/smsService');
const { registerDeviceToken, unregisterDeviceToken } = require('../services/pushService');

// Multer pour upload de photos
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads', 'cohrm');
const thumbDir = path.join(uploadDir, 'thumbnails');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });

const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `rumor-${req.params.id}-${Date.now()}${ext}`);
  },
});

const photoUpload = multer({
  storage: photoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Type de fichier non autorisé. Utilisez JPG, PNG ou WebP.'));
  },
});

// ============================================
// HELPERS
// ============================================

const generateRumorCode = () => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RUM-${year}${month}-${random}`;
};

const parseSmsCode = (smsText) => {
  // Format SMS: CODE*LOCALITE*SYMPTOMES*ESPECE*NOMBRE*DETAILS
  // Exemple: MAL*YAOUNDE*FI,VO,DI*HUM*5*Cas groupes marche central
  const parts = smsText.split('*');
  if (parts.length < 4) return null;

  const symptomCodes = {
    'FI': 'Fièvre',
    'VO': 'Vomissements',
    'DI': 'Diarrhée',
    'TO': 'Toux',
    'ER': 'Éruption cutanée',
    'HE': 'Hémorragie',
    'PA': 'Paralysie',
    'MO': 'Mortalité',
    'AB': 'Avortement',
    'RE': 'Problèmes respiratoires',
    'NE': 'Symptômes neurologiques',
    'OE': 'Oedèmes'
  };

  const specieCodes = {
    'HUM': 'Humain',
    'BOV': 'Bovin',
    'OVI': 'Ovin/Caprin',
    'VOL': 'Volaille',
    'POR': 'Porcin',
    'SAU': 'Faune sauvage',
    'CHI': 'Chien/Chat',
    'AUT': 'Autre'
  };

  const eventCodes = {
    'MAL': 'Maladie suspecte',
    'MOR': 'Mortalité anormale',
    'EPI': 'Épidémie suspectée',
    'ZOO': 'Zoonose suspectée',
    'INT': 'Intoxication',
    'ENV': 'Événement environnemental'
  };

  const eventCode = parts[0].toUpperCase();
  const location = parts[1];
  const symptoms = parts[2].split(',').map(s => symptomCodes[s.toUpperCase()] || s).join(', ');
  const species = specieCodes[parts[3].toUpperCase()] || parts[3];
  const count = parts[4] ? parseInt(parts[4]) : null;
  const details = parts[5] || '';

  return {
    event_type: eventCodes[eventCode] || eventCode,
    location,
    symptoms,
    species,
    affected_count: count,
    details,
    original_sms: smsText
  };
};

// ============================================
// STATISTIQUES DASHBOARD
// ============================================

// GET /api/cohrm/stats - Statistiques générales
router.get('/stats', auth, async (req, res) => {
  try {
    // Total rumeurs
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM cohrm_rumors');

    // Rumeurs en cours de vérification
    const [[{ pending }]] = await db.query(
      "SELECT COUNT(*) as pending FROM cohrm_rumors WHERE status = 'pending'"
    );

    // Rumeurs confirmées ce mois
    const [[{ confirmed }]] = await db.query(`
      SELECT COUNT(*) as confirmed FROM cohrm_rumors
      WHERE status = 'confirmed'
      AND MONTH(created_at) = MONTH(CURRENT_DATE())
      AND YEAR(created_at) = YEAR(CURRENT_DATE())
    `);

    // Alertes actives
    const [[{ alerts }]] = await db.query(
      "SELECT COUNT(*) as alerts FROM cohrm_rumors WHERE priority IN ('high', 'critical') AND status != 'closed'"
    );

    // Rumeurs par source
    const [bySource] = await db.query(`
      SELECT source, COUNT(*) as count
      FROM cohrm_rumors
      GROUP BY source
    `);

    // Rumeurs par région
    const [byRegion] = await db.query(`
      SELECT region, COUNT(*) as count
      FROM cohrm_rumors
      GROUP BY region
      ORDER BY count DESC
      LIMIT 10
    `);

    // Évolution des 7 derniers jours
    const [trend] = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM cohrm_rumors
      WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    res.json({
      success: true,
      data: {
        total,
        pending,
        confirmed,
        alerts,
        bySource,
        byRegion,
        trend
      }
    });
  } catch (error) {
    console.error('Get COHRM stats error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// GESTION DES RUMEURS
// ============================================

// GET /api/cohrm/rumors - Liste des rumeurs
router.get('/rumors', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      source,
      region,
      species,
      risk_level,
      search,
      date_from,
      date_to
    } = req.query;

    let query = `
      SELECT r.*,
        CONCAT(u.first_name, ' ', u.last_name) as assigned_user_name,
        CONCAT(reporter.first_name, ' ', reporter.last_name) as reported_by_name
      FROM cohrm_rumors r
      LEFT JOIN users u ON r.assigned_to = u.id
      LEFT JOIN users reporter ON r.reported_by = reporter.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }

    if (priority) {
      query += ' AND r.priority = ?';
      params.push(priority);
    }

    if (source) {
      query += ' AND r.source = ?';
      params.push(source);
    }

    if (region) {
      query += ' AND r.region = ?';
      params.push(region);
    }

    if (species) {
      query += ' AND r.species = ?';
      params.push(species);
    }

    if (risk_level) {
      query += ' AND r.risk_level = ?';
      params.push(risk_level);
    }

    if (search) {
      query += ' AND (r.title LIKE ? OR r.description LIKE ? OR r.location LIKE ? OR r.code LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (date_from) {
      query += ' AND DATE(r.created_at) >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND DATE(r.created_at) <= ?';
      params.push(date_to);
    }

    // Count total
    const countQuery = query.replace("SELECT r.*,\n        CONCAT(u.first_name, ' ', u.last_name) as assigned_user_name,\n        CONCAT(reporter.first_name, ' ', reporter.last_name) as reported_by_name", 'SELECT COUNT(*) as total');
    const [[{ total }]] = await db.query(countQuery, params);

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;
    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const [rumors] = await db.query(query, params);

    res.json({
      success: true,
      data: rumors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get rumors error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/cohrm/rumors/:id - Détail d'une rumeur
router.get('/rumors/:id', auth, async (req, res) => {
  try {
    const [rumors] = await db.query(`
      SELECT r.*,
        CONCAT(u.first_name, ' ', u.last_name) as assigned_user_name,
        CONCAT(reporter.first_name, ' ', reporter.last_name) as reported_by_name
      FROM cohrm_rumors r
      LEFT JOIN users u ON r.assigned_to = u.id
      LEFT JOIN users reporter ON r.reported_by = reporter.id
      WHERE r.id = ?
    `, [req.params.id]);

    if (rumors.length === 0) {
      return res.status(404).json({ success: false, message: 'Rumeur non trouvée' });
    }

    // Historique des actions
    const [history] = await db.query(`
      SELECT h.*, CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM cohrm_rumor_history h
      LEFT JOIN users u ON h.user_id = u.id
      WHERE h.rumor_id = ?
      ORDER BY h.created_at DESC
    `, [req.params.id]);

    // Notes
    const [notes] = await db.query(`
      SELECT n.*, CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM cohrm_rumor_notes n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE n.rumor_id = ?
      ORDER BY n.created_at DESC
    `, [req.params.id]);

    res.json({
      success: true,
      data: {
        ...rumors[0],
        history,
        notes
      }
    });
  } catch (error) {
    console.error('Get rumor error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/cohrm/rumors - Créer une rumeur
router.post('/rumors', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      source,
      source_details,
      region,
      department,
      district,
      location,
      latitude,
      longitude,
      species,
      symptoms,
      affected_count,
      dead_count,
      priority,
      reporter_name,
      reporter_phone,
      reporter_type
    } = req.body;

    if (!title || !region) {
      return res.status(400).json({
        success: false,
        message: 'Titre et région sont requis'
      });
    }

    const code = generateRumorCode();

    const [result] = await db.query(`
      INSERT INTO cohrm_rumors (
        code, title, description, source, source_details,
        region, department, district, location,
        latitude, longitude, species, symptoms,
        affected_count, dead_count, priority, status,
        reporter_name, reporter_phone, reporter_type,
        reported_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, NOW())
    `, [
      code, title, description, source || 'direct', source_details,
      region, department, district, location,
      latitude, longitude, species, symptoms,
      affected_count, dead_count, priority || 'medium',
      reporter_name, reporter_phone, reporter_type,
      req.user.id
    ]);

    // Ajouter historique
    await db.query(`
      INSERT INTO cohrm_rumor_history (rumor_id, user_id, action, details, created_at)
      VALUES (?, ?, 'created', 'Rumeur créée', NOW())
    `, [result.insertId, req.user.id]);

    // Envoyer les notifications aux validateurs de niveau 1
    try {
      await cohrmNotificationService.notifyNewRumor({
        id: result.insertId,
        code,
        title,
        category: 'other',
        region,
        department,
        district,
        validation_level: 1
      });
    } catch (notifError) {
      console.error('Error sending new rumor notifications:', notifError);
      // Ne pas bloquer la création de rumeur si la notification échoue
    }

    res.status(201).json({
      success: true,
      message: 'Rumeur créée avec succès',
      data: { id: result.insertId, code }
    });
  } catch (error) {
    console.error('Create rumor error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/cohrm/rumors/:id - Mettre à jour une rumeur
router.put('/rumors/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      source,
      source_details,
      region,
      department,
      district,
      location,
      latitude,
      longitude,
      species,
      symptoms,
      affected_count,
      dead_count,
      priority,
      status,
      assigned_to,
      verification_notes,
      response_actions
    } = req.body;

    // Vérifier que la rumeur existe
    const [existing] = await db.query('SELECT * FROM cohrm_rumors WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Rumeur non trouvée' });
    }

    const oldStatus = existing[0].status;

    await db.query(`
      UPDATE cohrm_rumors SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        source = COALESCE(?, source),
        source_details = COALESCE(?, source_details),
        region = COALESCE(?, region),
        department = COALESCE(?, department),
        district = COALESCE(?, district),
        location = COALESCE(?, location),
        latitude = COALESCE(?, latitude),
        longitude = COALESCE(?, longitude),
        species = COALESCE(?, species),
        symptoms = COALESCE(?, symptoms),
        affected_count = COALESCE(?, affected_count),
        dead_count = COALESCE(?, dead_count),
        priority = COALESCE(?, priority),
        status = COALESCE(?, status),
        assigned_to = ?,
        verification_notes = COALESCE(?, verification_notes),
        response_actions = COALESCE(?, response_actions),
        updated_at = NOW()
      WHERE id = ?
    `, [
      title, description, source, source_details,
      region, department, district, location,
      latitude, longitude, species, symptoms,
      affected_count, dead_count, priority, status, assigned_to,
      verification_notes, response_actions, id
    ]);

    // Ajouter historique si statut changé
    if (status && status !== oldStatus) {
      await db.query(`
        INSERT INTO cohrm_rumor_history (rumor_id, user_id, action, details, created_at)
        VALUES (?, ?, 'status_change', ?, NOW())
      `, [id, req.user.id, `Statut modifié: ${oldStatus} → ${status}`]);
    }

    res.json({ success: true, message: 'Rumeur mise à jour' });
  } catch (error) {
    console.error('Update rumor error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/cohrm/rumors/:id - Supprimer une rumeur
router.delete('/rumors/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Supprimer les données liées
    await db.query('DELETE FROM cohrm_rumor_notes WHERE rumor_id = ?', [id]);
    await db.query('DELETE FROM cohrm_rumor_history WHERE rumor_id = ?', [id]);
    await db.query('DELETE FROM cohrm_rumors WHERE id = ?', [id]);

    res.json({ success: true, message: 'Rumeur supprimée' });
  } catch (error) {
    console.error('Delete rumor error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/cohrm/rumors/:id/notes - Ajouter une note
router.post('/rumors/:id/notes', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, is_private } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Contenu requis' });
    }

    await db.query(`
      INSERT INTO cohrm_rumor_notes (rumor_id, user_id, content, is_private, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [id, req.user.id, content, is_private ? 1 : 0]);

    res.status(201).json({ success: true, message: 'Note ajoutée' });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// CODES SMS
// ============================================

// GET /api/cohrm/sms-codes - Liste des codes SMS
router.get('/sms-codes', auth, async (req, res) => {
  try {
    const [codes] = await db.query(`
      SELECT * FROM cohrm_sms_codes
      WHERE is_active = 1
      ORDER BY category, code
    `);

    // Grouper par catégorie
    const grouped = codes.reduce((acc, code) => {
      if (!acc[code.category]) acc[code.category] = [];
      acc[code.category].push(code);
      return acc;
    }, {});

    res.json({ success: true, data: grouped });
  } catch (error) {
    console.error('Get SMS codes error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/cohrm/sms-codes - Créer un code SMS
router.post('/sms-codes', auth, authorize('admin'), async (req, res) => {
  try {
    const { code, label_fr, label_en, category, description } = req.body;

    if (!code || !label_fr || !category) {
      return res.status(400).json({
        success: false,
        message: 'Code, label français et catégorie sont requis'
      });
    }

    await db.query(`
      INSERT INTO cohrm_sms_codes (code, label_fr, label_en, category, description, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, 1, NOW())
    `, [code.toUpperCase(), label_fr, label_en, category, description]);

    res.status(201).json({ success: true, message: 'Code SMS créé' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Ce code existe déjà' });
    }
    console.error('Create SMS code error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/cohrm/sms-codes/:id - Supprimer un code SMS
router.delete('/sms-codes/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await db.query('UPDATE cohrm_sms_codes SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Code SMS désactivé' });
  } catch (error) {
    console.error('Delete SMS code error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/cohrm/sms-logs - Journal des SMS reçus
router.get('/sms-logs', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, sender, date_from, date_to } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = '1=1';
    const params = [];

    if (status) {
      where += ' AND l.status = ?';
      params.push(status);
    }
    if (sender) {
      where += ' AND l.sender LIKE ?';
      params.push(`%${sender}%`);
    }
    if (date_from) {
      where += ' AND l.created_at >= ?';
      params.push(date_from);
    }
    if (date_to) {
      where += ' AND l.created_at <= ?';
      params.push(date_to + ' 23:59:59');
    }

    // Count total
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM cohrm_sms_logs l WHERE ${where}`, params
    );

    // Get logs with rumor info
    const [logs] = await db.query(`
      SELECT l.*, r.code as rumor_code, r.title as rumor_title
      FROM cohrm_sms_logs l
      LEFT JOIN cohrm_rumors r ON l.rumor_id = r.id
      WHERE ${where}
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    // Stats
    const [stats] = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'processed' THEN 1 ELSE 0 END) as success_count,
        SUM(CASE WHEN status = 'invalid_format' THEN 1 ELSE 0 END) as error_count
      FROM cohrm_sms_logs
    `);

    // Daily volume (last 14 days)
    const [dailyVolume] = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM cohrm_sms_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    const total = countResult[0].total;

    res.json({
      success: true,
      data: logs,
      stats: stats[0],
      dailyVolume,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get SMS logs error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/cohrm/decode-sms - Décoder un SMS
router.post('/decode-sms', auth, async (req, res) => {
  try {
    const { sms_text, sender_phone } = req.body;

    if (!sms_text) {
      return res.status(400).json({ success: false, message: 'Texte SMS requis' });
    }

    const decoded = parseSmsCode(sms_text);

    if (!decoded) {
      return res.status(400).json({
        success: false,
        message: 'Format SMS invalide. Format attendu: CODE*LOCALITE*SYMPTOMES*ESPECE*NOMBRE*DETAILS'
      });
    }

    res.json({
      success: true,
      data: {
        ...decoded,
        sender_phone
      }
    });
  } catch (error) {
    console.error('Decode SMS error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// PARAMÈTRES
// ============================================

// GET /api/cohrm/settings - Récupérer les paramètres
router.get('/settings', auth, async (req, res) => {
  try {
    const [settings] = await db.query('SELECT * FROM cohrm_settings');

    // Convertir en objet clé-valeur
    const settingsObj = settings.reduce((acc, s) => {
      try {
        acc[s.key] = JSON.parse(s.value);
      } catch {
        acc[s.key] = s.value;
      }
      return acc;
    }, {});

    res.json({ success: true, data: settingsObj });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/cohrm/settings - Mettre à jour les paramètres
router.put('/settings', auth, authorize('admin'), async (req, res) => {
  try {
    const settings = req.body;

    for (const [key, value] of Object.entries(settings)) {
      const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);

      await db.query(`
        INSERT INTO cohrm_settings (\`key\`, value, updated_at)
        VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE value = ?, updated_at = NOW()
      `, [key, valueStr, valueStr]);
    }

    res.json({ success: true, message: 'Paramètres mis à jour' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// API MOBILE
// ============================================

// POST /api/cohrm/mobile/login - Connexion mobile (auth via users + infos acteur COHRM)
router.post('/mobile/login', async (req, res) => {
  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
    }

    // 1. Find user by email or username
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, email]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }

    const user = users[0];

    // 2. Check account active
    if (user.status !== 'active') {
      return res.status(401).json({ success: false, message: 'Compte désactivé' });
    }

    // 3. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }

    // 4. Get user permissions
    const [permissions] = await db.query(`
      SELECT DISTINCT p.slug FROM permissions p
      INNER JOIN group_permissions gp ON p.id = gp.permission_id
      INNER JOIN user_groups ug ON gp.group_id = ug.group_id
      WHERE ug.user_id = ?
    `, [user.id]);
    const permSlugs = permissions.map(p => p.slug);

    // 5. Check if user has COHRM access (admin role or cohrm-related permission)
    const isAdmin = user.role === 'admin';
    const hasCohrmAccess = isAdmin || permSlugs.some(p => p.includes('cohrm'));

    // 6. Get COHRM actor info if exists
    let actor = null;
    const [actors] = await db.query(
      'SELECT * FROM cohrm_actors WHERE user_id = ? AND is_active = 1',
      [user.id]
    );
    if (actors.length > 0) {
      actor = actors[0];
    }

    // 7. User must be admin or have a COHRM actor profile
    if (!isAdmin && !actor && !hasCohrmAccess) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé. Vous devez être administrateur COHRM ou agent communautaire One Health.'
      });
    }

    // 8. Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    // 9. Update last login
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // 10. Determine actor level and type
    const actorLevel = actor ? actor.actor_level : (isAdmin ? 5 : 0);
    const actorLevelLabels = {
      1: 'Agent communautaire',
      2: 'Vérificateur',
      3: 'Évaluateur',
      4: 'Coordonnateur régional',
      5: 'Superviseur / Administrateur',
    };

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user.id,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
          email: user.email,
          username: user.username,
          role: user.role,
          avatar: user.avatar,
          permissions: permSlugs,
        },
        actor: actor ? {
          id: actor.id,
          level: actor.actor_level,
          level_label: actorLevelLabels[actor.actor_level] || 'Inconnu',
          type: actor.actor_type,
          region: actor.region || '',
          department: actor.department || '',
          district: actor.district || '',
          organization: actor.organization || '',
          phone: actor.phone || '',
        } : isAdmin ? {
          id: null,
          level: 5,
          level_label: actorLevelLabels[5],
          type: 'admin',
          region: '',
          department: '',
          district: '',
          organization: 'Administration centrale',
          phone: '',
        } : null,
        token,
      }
    });
  } catch (error) {
    console.error('Mobile login error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/cohrm/mobile/report - Signaler une rumeur depuis l'app mobile
router.post('/mobile/report', async (req, res) => {
  try {
    const {
      title,
      description,
      source,
      region,
      location,
      latitude,
      longitude,
      species,
      symptoms,
      affected_count,
      reporter_name,
      reporter_phone,
      device_id,
      photos,
      date_detection,
      message_received,
      category,
      themes,
      gravity_comment,
      source_type,
      arrondissement,
      commune,
      aire_sante
    } = req.body;

    if (!title || !region) {
      return res.status(400).json({
        success: false,
        message: 'Titre et région sont requis'
      });
    }

    const code = generateRumorCode();

    const [result] = await db.query(`
      INSERT INTO cohrm_rumors (
        code, title, description, source, source_details,
        region, location, latitude, longitude,
        species, symptoms, affected_count, priority, status,
        reporter_name, reporter_phone, reporter_type,
        device_id, date_detection, message_received,
        category, themes, gravity_comment, source_type,
        arrondissement, commune, aire_sante, created_at
      ) VALUES (?, ?, ?, 'mobile', ?, ?, ?, ?, ?, ?, ?, ?, 'medium', 'pending', ?, ?, 'agent', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      code, title, description, device_id,
      region, location, latitude, longitude,
      species, symptoms, affected_count,
      reporter_name, reporter_phone, device_id,
      date_detection || null, message_received || null,
      category || 'human_health', themes ? JSON.stringify(themes) : null,
      gravity_comment || null, source_type || 'mobile_app',
      arrondissement || null, commune || null, aire_sante || null
    ]);

    // Sauvegarder les photos si fournies
    if (photos && photos.length > 0) {
      for (const photo of photos) {
        await db.query(`
          INSERT INTO cohrm_rumor_photos (rumor_id, url, created_at)
          VALUES (?, ?, NOW())
        `, [result.insertId, photo]);
      }
    }

    // Notify about the new rumor
    try {
      await cohrmNotificationService.notifyNewRumor({
        id: result.insertId, code, title, region,
        category: category || 'human_health',
        priority: 'medium', status: 'pending'
      });
    } catch (e) {}

    res.status(201).json({
      success: true,
      message: 'Signalement reçu',
      data: { id: result.insertId, code }
    });
  } catch (error) {
    console.error('Mobile report error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/cohrm/mobile/sms - Recevoir un SMS (webhook pour gateway SMS)
router.post('/mobile/sms', async (req, res) => {
  try {
    const { from, text, timestamp } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Texte SMS requis' });
    }

    // Décoder le SMS
    const decoded = parseSmsCode(text);

    if (!decoded) {
      // Log le SMS non reconnu
      await db.query(`
        INSERT INTO cohrm_sms_logs (sender, message, status, created_at)
        VALUES (?, ?, 'invalid_format', NOW())
      `, [from, text]);

      return res.status(400).json({
        success: false,
        message: 'Format SMS non reconnu'
      });
    }

    // Créer automatiquement une rumeur
    const code = generateRumorCode();

    const [result] = await db.query(`
      INSERT INTO cohrm_rumors (
        code, title, description, source, source_details,
        location, species, symptoms, affected_count, priority, status,
        reporter_phone, reporter_type, created_at
      ) VALUES (?, ?, ?, 'sms', ?, ?, ?, ?, ?, 'medium', 'pending', ?, 'community', NOW())
    `, [
      code,
      decoded.event_type,
      decoded.details || `Signalement SMS: ${decoded.event_type}`,
      decoded.original_sms,
      decoded.location,
      decoded.species,
      decoded.symptoms,
      decoded.affected_count,
      from
    ]);

    // Log le SMS traité
    await db.query(`
      INSERT INTO cohrm_sms_logs (sender, message, rumor_id, status, created_at)
      VALUES (?, ?, ?, 'processed', NOW())
    `, [from, text, result.insertId]);

    res.status(201).json({
      success: true,
      message: 'SMS traité',
      data: { rumor_id: result.insertId, code }
    });
  } catch (error) {
    console.error('SMS webhook error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/cohrm/mobile/dashboard - Dashboard data for mobile app
router.get('/mobile/dashboard', auth, async (req, res) => {
  try {
    const { region, period } = req.query;

    let regionFilter = '';
    const regionParams = [];
    if (region) {
      regionFilter = ' AND region = ?';
      regionParams.push(region);
    }

    // Stats
    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM cohrm_rumors WHERE 1=1${regionFilter}`, regionParams);
    const [[{ pending }]] = await db.query(`SELECT COUNT(*) as pending FROM cohrm_rumors WHERE status = 'pending'${regionFilter}`, regionParams);
    const [[{ investigating }]] = await db.query(`SELECT COUNT(*) as investigating FROM cohrm_rumors WHERE status = 'investigating'${regionFilter}`, regionParams);
    const [[{ confirmed }]] = await db.query(`SELECT COUNT(*) as confirmed FROM cohrm_rumors WHERE status = 'confirmed'${regionFilter}`, regionParams);
    const [[{ false_alarm }]] = await db.query(`SELECT COUNT(*) as false_alarm FROM cohrm_rumors WHERE status = 'false_alarm'${regionFilter}`, regionParams);
    const [[{ closed }]] = await db.query(`SELECT COUNT(*) as closed FROM cohrm_rumors WHERE status = 'closed'${regionFilter}`, regionParams);
    const [[{ high_priority }]] = await db.query(`SELECT COUNT(*) as \`high_priority\` FROM cohrm_rumors WHERE priority = 'high' AND status != 'closed'${regionFilter}`, regionParams);
    const [[{ critical }]] = await db.query(`SELECT COUNT(*) as critical FROM cohrm_rumors WHERE priority = 'critical' AND status != 'closed'${regionFilter}`, regionParams);
    const [[{ today_count }]] = await db.query(`SELECT COUNT(*) as today_count FROM cohrm_rumors WHERE DATE(created_at) = CURDATE()${regionFilter}`, regionParams);
    const [[{ week_count }]] = await db.query(`SELECT COUNT(*) as week_count FROM cohrm_rumors WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)${regionFilter}`, regionParams);
    const [[{ month_count }]] = await db.query(`SELECT COUNT(*) as month_count FROM cohrm_rumors WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())${regionFilter}`, regionParams);

    // By region
    const [byRegion] = await db.query(`SELECT region as \`key\`, region as label, COUNT(*) as value FROM cohrm_rumors WHERE region IS NOT NULL AND region != '' GROUP BY region ORDER BY value DESC`);

    // By category
    const [byCategory] = await db.query(`SELECT category as \`key\`, category as label, COUNT(*) as value FROM cohrm_rumors WHERE category IS NOT NULL${regionFilter} GROUP BY category ORDER BY value DESC`, regionParams);

    // By status
    const [byStatus] = await db.query(`SELECT status as \`key\`, status as label, COUNT(*) as value FROM cohrm_rumors WHERE 1=1${regionFilter} GROUP BY status ORDER BY value DESC`, regionParams);

    // By source
    const [bySource] = await db.query(`SELECT source as \`key\`, source as label, COUNT(*) as value FROM cohrm_rumors WHERE source IS NOT NULL${regionFilter} GROUP BY source ORDER BY value DESC`, regionParams);

    // By priority
    const [byPriority] = await db.query(`SELECT priority as \`key\`, priority as label, COUNT(*) as value FROM cohrm_rumors WHERE priority IS NOT NULL${regionFilter} GROUP BY priority ORDER BY value DESC`, regionParams);

    // By risk level
    const [byRisk] = await db.query(`SELECT risk_level as \`key\`, risk_level as label, COUNT(*) as value FROM cohrm_rumors WHERE risk_level IS NOT NULL${regionFilter} GROUP BY risk_level ORDER BY value DESC`, regionParams);

    // Trends (last 30 days)
    const [trends] = await db.query(`SELECT DATE(created_at) as date, COUNT(*) as count FROM cohrm_rumors WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)${regionFilter} GROUP BY DATE(created_at) ORDER BY date ASC`, regionParams);

    // Recent rumors
    const [recentRumors] = await db.query(`
      SELECT r.id, r.code, r.title, r.category, r.status, r.priority, r.risk_level as riskLevel, r.source, r.region, r.department,
        CONCAT(reporter.first_name, ' ', reporter.last_name) as reporter_name,
        r.created_at
      FROM cohrm_rumors r
      LEFT JOIN users reporter ON r.reported_by = reporter.id
      WHERE 1=1${regionFilter ? regionFilter.replace(/region/g, 'r.region') : ''}
      ORDER BY r.created_at DESC
      LIMIT 20
    `, regionParams);

    res.json({
      success: true,
      data: {
        stats: { total, pending, investigating, confirmed, false_alarm, closed, high_priority, critical, today_count, week_count, month_count },
        by_region: byRegion,
        by_category: byCategory,
        by_status: byStatus,
        by_source: bySource,
        by_priority: byPriority,
        by_risk: byRisk,
        trends: trends.map(t => ({ date: t.date, count: t.count })),
        recent_rumors: recentRumors.map(r => ({
          id: r.id, code: r.code, title: r.title, category: r.category,
          status: r.status, priority: r.priority, risk: r.riskLevel || 'unknown',
          source: r.source, region: r.region, department: r.department,
          created_at: r.created_at, reporter_name: r.reporter_name
        }))
      }
    });
  } catch (error) {
    console.error('Mobile dashboard error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/cohrm/mobile/sync - Synchronisation pour l'app mobile
router.get('/mobile/sync', async (req, res) => {
  try {
    const { device_id, last_sync } = req.query;

    // Récupérer les codes SMS
    const [smsCodes] = await db.query(`
      SELECT code, label_fr, label_en, category
      FROM cohrm_sms_codes
      WHERE is_active = 1
    `);

    // Récupérer les régions du Cameroun
    const regions = [
      { code: 'AD', name: 'Adamaoua' },
      { code: 'CE', name: 'Centre' },
      { code: 'ES', name: 'Est' },
      { code: 'EN', name: 'Extrême-Nord' },
      { code: 'LT', name: 'Littoral' },
      { code: 'NO', name: 'Nord' },
      { code: 'NW', name: 'Nord-Ouest' },
      { code: 'OU', name: 'Ouest' },
      { code: 'SU', name: 'Sud' },
      { code: 'SW', name: 'Sud-Ouest' }
    ];

    res.json({
      success: true,
      data: {
        sms_codes: smsCodes,
        regions,
        sync_timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Mobile sync error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// EXPORT
// ============================================

// GET /api/cohrm/export - Exporter les rumeurs
router.get('/export', auth, async (req, res) => {
  try {
    const { format = 'json', status, date_from, date_to } = req.query;

    let query = 'SELECT * FROM cohrm_rumors WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (date_from) {
      query += ' AND DATE(created_at) >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND DATE(created_at) <= ?';
      params.push(date_to);
    }

    query += ' ORDER BY created_at DESC';

    const [rumors] = await db.query(query, params);

    if (format === 'csv') {
      // Générer CSV
      const headers = Object.keys(rumors[0] || {}).join(',');
      const rows = rumors.map(r => Object.values(r).map(v => `"${v || ''}"`).join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=cohrm-rumors.csv');
      res.send(`${headers}\n${rows}`);
    } else {
      res.json({ success: true, data: rumors });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// HISTORIQUE DES SCANS
// ============================================

// GET /api/cohrm/scan-history - Liste des scans effectués
router.get('/scan-history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, source, status } = req.query;

    let query = 'SELECT * FROM cohrm_web_scans WHERE 1=1';
    const params = [];

    if (source) {
      query += ' AND source = ?';
      params.push(source);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    // Count total
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [[{ total }]] = await db.query(countQuery, params);

    // Pagination
    const offset = (page - 1) * limit;
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [scans] = await db.query(query, params);

    res.json({
      success: true,
      data: scans,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get scan history error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/cohrm/scan-history/:id - Détails d'un scan
router.get('/scan-history/:id', auth, async (req, res) => {
  try {
    const [scans] = await db.query('SELECT * FROM cohrm_web_scans WHERE id = ?', [req.params.id]);

    if (scans.length === 0) {
      return res.status(404).json({ success: false, message: 'Scan non trouvé' });
    }

    // Récupérer les résultats du scan avec info utilisateur
    const [results] = await db.query(`
      SELECT sr.*,
        CONCAT(u.first_name, ' ', u.last_name) as reviewed_by_name
      FROM cohrm_scan_results sr
      LEFT JOIN users u ON sr.reviewed_by = u.id
      WHERE sr.scan_id = ?
      ORDER BY sr.relevance_score DESC, sr.created_at DESC
    `, [req.params.id]);

    // Récupérer les rumeurs créées à partir de ce scan
    const [rumorsCreated] = await db.query(`
      SELECT r.id, r.code, r.title, r.status, r.priority, r.region, r.created_at,
        sr.id as scan_result_id, sr.title as original_title
      FROM cohrm_rumors r
      JOIN cohrm_scan_results sr ON sr.rumor_id = r.id
      WHERE sr.scan_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.id]);

    // Statistiques par statut
    const statusCounts = {
      new: results.filter(r => r.status === 'new').length,
      reviewed: results.filter(r => r.status === 'reviewed').length,
      converted: results.filter(r => r.status === 'converted').length,
      ignored: results.filter(r => r.status === 'ignored').length
    };

    res.json({
      success: true,
      data: {
        ...scans[0],
        results,
        rumorsCreated,
        statusCounts
      }
    });
  } catch (error) {
    console.error('Get scan details error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/cohrm/scan-results/:id - Mettre à jour un résultat de scan
router.put('/scan-results/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rumor_id, is_rumor, notes } = req.body;

    // Vérifier si le résultat existe
    const [existing] = await db.query('SELECT id FROM cohrm_scan_results WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Résultat non trouvé' });
    }

    await db.query(`
      UPDATE cohrm_scan_results SET
        status = COALESCE(?, status),
        rumor_id = COALESCE(?, rumor_id),
        is_rumor = COALESCE(?, is_rumor),
        notes = COALESCE(?, notes),
        reviewed_by = ?,
        reviewed_at = NOW()
      WHERE id = ?
    `, [status, rumor_id, is_rumor, notes, req.user.id, id]);

    res.json({ success: true, message: 'Résultat mis à jour' });
  } catch (error) {
    console.error('Update scan result error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/cohrm/scan-results/:scanId/rumors - Récupérer les rumeurs créées à partir d'un scan
router.get('/scan-results/:scanId/rumors', auth, async (req, res) => {
  try {
    const { scanId } = req.params;

    const [rumors] = await db.query(`
      SELECT r.*, sr.id as scan_result_id
      FROM cohrm_rumors r
      JOIN cohrm_scan_results sr ON sr.rumor_id = r.id
      WHERE sr.scan_id = ?
      ORDER BY r.created_at DESC
    `, [scanId]);

    res.json({ success: true, data: rumors });
  } catch (error) {
    console.error('Get scan rumors error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/cohrm/scan/run - Lancer un scan (réel, via cohrmScannerService)
router.post('/scan/run', auth, async (req, res) => {
  try {
    const { source_id } = req.body;
    const scannerService = require('../services/cohrmScannerService');

    // Répondre immédiatement, le scan tourne en arrière-plan
    res.json({ success: true, message: 'Scan lancé avec succès' });

    // Lancer le scan réel en arrière-plan
    scannerService.runScan(source_id || null, false).catch(err => {
      console.error('Background scan error:', err.message);
    });
  } catch (error) {
    console.error('Run scan error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/cohrm/scanner/config - Config du scanner
router.get('/scanner/config', auth, async (req, res) => {
  try {
    const scannerService = require('../services/cohrmScannerService');
    const config = await scannerService.getConfig();
    // Mask sensitive tokens in response (show only if configured)
    const safeConfig = { ...config };
    safeConfig.twitter_bearer_token = config.twitter_bearer_token ? '••••••••' + config.twitter_bearer_token.slice(-4) : '';
    safeConfig.facebook_access_token = config.facebook_access_token ? '••••••••' + config.facebook_access_token.slice(-4) : '';
    safeConfig.twitter_configured = !!config.twitter_bearer_token;
    safeConfig.facebook_configured = !!config.facebook_access_token;
    res.json({ success: true, data: safeConfig });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/cohrm/scanner/config - Mettre à jour la config du scanner
router.put('/scanner/config', auth, async (req, res) => {
  try {
    const settings = req.body;
    // Sensitive keys that should be stored in DB but not logged
    const sensitiveKeys = ['twitter_bearer_token', 'facebook_access_token'];

    for (const [key, value] of Object.entries(settings)) {
      // Skip masked token values (user didn't change them)
      if (sensitiveKeys.includes(key) && typeof value === 'string' && value.startsWith('••••')) {
        continue;
      }
      // Ne pas doubler le préfixe si la clé commence déjà par scanner_
      const dbKey = key.startsWith('scanner_') ? key : `scanner_${key}`;
      const description = sensitiveKeys.includes(key)
        ? `Scanner config: ${key} (sensitive)`
        : `Scanner config: ${key}`;
      await db.query(
        "INSERT INTO cohrm_settings (`key`, value, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = ?",
        [dbKey, String(value), description, String(value)]
      );
    }

    // Redémarrer le scheduler si la config a changé
    const scannerService = require('../services/cohrmScannerService');
    await scannerService.restartScheduler();

    res.json({ success: true, message: 'Configuration mise à jour. Scheduler redémarré.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/cohrm/scanner/toggle - Activer/désactiver le scanner
router.post('/scanner/toggle', auth, async (req, res) => {
  try {
    const { enabled } = req.body;
    await db.query(
      "INSERT INTO cohrm_settings (`key`, value, description) VALUES ('scanner_enabled', ?, 'Scanner automatique activé') ON DUPLICATE KEY UPDATE value = ?",
      [String(!!enabled), String(!!enabled)]
    );

    const scannerService = require('../services/cohrmScannerService');
    if (enabled) {
      await scannerService.startScheduler();
    } else {
      scannerService.stopScheduler();
    }

    res.json({ success: true, message: enabled ? 'Scanner activé' : 'Scanner désactivé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// THEMES (Catégories de rumeurs)
// ============================================

// GET /api/cohrm/themes - Liste des thèmes
router.get('/themes', auth, async (req, res) => {
  try {
    const [themes] = await db.query(`
      SELECT * FROM cohrm_themes
      WHERE is_active = 1
      ORDER BY display_order, label_fr
    `);

    // Grouper par catégorie
    const grouped = themes.reduce((acc, theme) => {
      if (!acc[theme.category]) acc[theme.category] = [];
      acc[theme.category].push(theme);
      return acc;
    }, {});

    res.json({ success: true, data: { themes, grouped } });
  } catch (error) {
    console.error('Get themes error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/cohrm/themes - Créer un thème
router.post('/themes', auth, authorize('admin'), async (req, res) => {
  try {
    const { label_fr, label_en, category, description, color, icon, display_order } = req.body;

    if (!label_fr || !category) {
      return res.status(400).json({ success: false, message: 'Label FR et catégorie sont requis' });
    }

    const [maxOrder] = await db.query(
      'SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM cohrm_themes WHERE category = ?',
      [category]
    );

    const [result] = await db.query(`
      INSERT INTO cohrm_themes (label_fr, label_en, category, description, color, icon, display_order, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())
    `, [label_fr, label_en || '', category, description || '', color || '#3498DB', icon || '', display_order ?? maxOrder[0].next_order]);

    const [[theme]] = await db.query('SELECT * FROM cohrm_themes WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: theme });
  } catch (error) {
    console.error('Create theme error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/cohrm/themes/:id - Modifier un thème
router.put('/themes/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { label_fr, label_en, category, description, color, icon, display_order, is_active } = req.body;

    const [[existing]] = await db.query('SELECT * FROM cohrm_themes WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Thème non trouvé' });
    }

    await db.query(`
      UPDATE cohrm_themes SET
        label_fr = COALESCE(?, label_fr),
        label_en = COALESCE(?, label_en),
        category = COALESCE(?, category),
        description = COALESCE(?, description),
        color = COALESCE(?, color),
        icon = COALESCE(?, icon),
        display_order = COALESCE(?, display_order),
        is_active = COALESCE(?, is_active),
        updated_at = NOW()
      WHERE id = ?
    `, [label_fr, label_en, category, description, color, icon, display_order, is_active, req.params.id]);

    const [[theme]] = await db.query('SELECT * FROM cohrm_themes WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: theme });
  } catch (error) {
    console.error('Update theme error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/cohrm/themes/:id - Supprimer (désactiver) un thème
router.delete('/themes/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const [[existing]] = await db.query('SELECT * FROM cohrm_themes WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Thème non trouvé' });
    }

    await db.query('UPDATE cohrm_themes SET is_active = 0, updated_at = NOW() WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Thème supprimé' });
  } catch (error) {
    console.error('Delete theme error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/cohrm/themes/reorder - Réordonner les thèmes
router.put('/themes/reorder', auth, authorize('admin'), async (req, res) => {
  try {
    const { order } = req.body; // Array of { id, display_order }
    if (!Array.isArray(order)) {
      return res.status(400).json({ success: false, message: 'Format invalide' });
    }

    for (const item of order) {
      await db.query('UPDATE cohrm_themes SET display_order = ?, updated_at = NOW() WHERE id = ?', [item.display_order, item.id]);
    }

    res.json({ success: true, message: 'Ordre mis à jour' });
  } catch (error) {
    console.error('Reorder themes error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// ACTEURS COHRM (5 niveaux hiérarchiques)
// ============================================

// GET /api/cohrm/actors - Liste des acteurs
router.get('/actors', auth, async (req, res) => {
  try {
    const { level, region, is_active } = req.query;

    let query = `
      SELECT a.*, CONCAT(u.first_name, ' ', u.last_name) as user_name, u.email as user_email
      FROM cohrm_actors a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (level) {
      query += ' AND a.actor_level = ?';
      params.push(level);
    }

    if (region) {
      query += ' AND a.region = ?';
      params.push(region);
    }

    if (is_active !== undefined) {
      query += ' AND a.is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }

    query += ' ORDER BY a.actor_level, a.region, a.organization';

    const [actors] = await db.query(query, params);

    res.json({ success: true, data: actors });
  } catch (error) {
    console.error('Get actors error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/cohrm/actors/:id - Détail d'un acteur
router.get('/actors/:id', auth, async (req, res) => {
  try {
    const [actors] = await db.query(`
      SELECT a.*, CONCAT(u.first_name, ' ', u.last_name) as user_name, u.email as user_email
      FROM cohrm_actors a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `, [req.params.id]);

    if (actors.length === 0) {
      return res.status(404).json({ success: false, message: 'Acteur non trouvé' });
    }

    // Récupérer les validations effectuées par cet acteur
    const [validations] = await db.query(`
      SELECT v.*, r.code as rumor_code, r.title as rumor_title
      FROM cohrm_validations v
      JOIN cohrm_rumors r ON v.rumor_id = r.id
      WHERE v.actor_id = ?
      ORDER BY v.created_at DESC
      LIMIT 20
    `, [req.params.id]);

    res.json({
      success: true,
      data: {
        ...actors[0],
        recent_validations: validations
      }
    });
  } catch (error) {
    console.error('Get actor error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/cohrm/actors - Créer un acteur
router.post('/actors', auth, authorize('admin'), async (req, res) => {
  try {
    const {
      user_id,
      actor_level,
      actor_type,
      region,
      department,
      district,
      organization,
      role_in_org,
      phone,
      email,
      transmission_channel
    } = req.body;

    if (!actor_level || !actor_type) {
      return res.status(400).json({
        success: false,
        message: 'Niveau et type d\'acteur sont requis'
      });
    }

    const [result] = await db.query(`
      INSERT INTO cohrm_actors (
        user_id, actor_level, actor_type, region, department, district,
        organization, role_in_org, phone, email, transmission_channel,
        is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())
    `, [
      user_id, actor_level, actor_type, region, department, district,
      organization, role_in_org, phone, email, transmission_channel || 'system'
    ]);

    res.status(201).json({
      success: true,
      message: 'Acteur créé avec succès',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create actor error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/cohrm/actors/:id - Mettre à jour un acteur
router.put('/actors/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      user_id,
      actor_level,
      actor_type,
      region,
      department,
      district,
      organization,
      role_in_org,
      phone,
      email,
      transmission_channel,
      is_active
    } = req.body;

    await db.query(`
      UPDATE cohrm_actors SET
        user_id = COALESCE(?, user_id),
        actor_level = COALESCE(?, actor_level),
        actor_type = COALESCE(?, actor_type),
        region = COALESCE(?, region),
        department = COALESCE(?, department),
        district = COALESCE(?, district),
        organization = COALESCE(?, organization),
        role_in_org = COALESCE(?, role_in_org),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        transmission_channel = COALESCE(?, transmission_channel),
        is_active = COALESCE(?, is_active),
        updated_at = NOW()
      WHERE id = ?
    `, [
      user_id, actor_level, actor_type, region, department, district,
      organization, role_in_org, phone, email, transmission_channel,
      is_active !== undefined ? (is_active ? 1 : 0) : null, id
    ]);

    res.json({ success: true, message: 'Acteur mis à jour' });
  } catch (error) {
    console.error('Update actor error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/cohrm/actors/:id - Désactiver un acteur
router.delete('/actors/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await db.query('UPDATE cohrm_actors SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Acteur désactivé' });
  } catch (error) {
    console.error('Delete actor error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/cohrm/actor-types - Types d'acteurs par niveau
router.get('/actor-types', auth, async (req, res) => {
  try {
    const [settings] = await db.query(
      "SELECT value FROM cohrm_settings WHERE `key` = 'actor_types'"
    );

    if (settings.length === 0) {
      return res.json({ success: true, data: {} });
    }

    const actorTypes = JSON.parse(settings[0].value);
    res.json({ success: true, data: actorTypes });
  } catch (error) {
    console.error('Get actor types error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// WORKFLOW DE VALIDATION MULTI-NIVEAUX
// ============================================

// GET /api/cohrm/rumors/:id/validations - Historique des validations d'une rumeur
router.get('/rumors/:id/validations', auth, async (req, res) => {
  try {
    const [validations] = await db.query(`
      SELECT v.*,
        a.actor_type, a.organization,
        CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM cohrm_validations v
      LEFT JOIN cohrm_actors a ON v.actor_id = a.id
      LEFT JOIN users u ON v.user_id = u.id
      WHERE v.rumor_id = ?
      ORDER BY v.level ASC, v.created_at DESC
    `, [req.params.id]);

    res.json({ success: true, data: validations });
  } catch (error) {
    console.error('Get validations error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/cohrm/rumors/:id/validate - Valider/Escalader une rumeur
router.post('/rumors/:id/validate', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      action_type,
      status,
      notes,
      rejection_reason,
      actor_id
    } = req.body;

    // Récupérer la rumeur actuelle
    const [rumors] = await db.query('SELECT * FROM cohrm_rumors WHERE id = ?', [id]);
    if (rumors.length === 0) {
      return res.status(404).json({ success: false, message: 'Rumeur non trouvée' });
    }

    const rumor = rumors[0];
    const currentLevel = rumor.validation_level || 1;

    // Déterminer le nouveau niveau
    let newLevel = currentLevel;
    if (status === 'validated' && currentLevel < 5) {
      newLevel = currentLevel + 1;
    } else if (status === 'escalated') {
      newLevel = Math.min(currentLevel + 1, 5);
    }

    // Créer l'entrée de validation
    await db.query(`
      INSERT INTO cohrm_validations (
        rumor_id, actor_id, user_id, level, action_type,
        status, notes, rejection_reason, validated_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      id, actor_id, req.user.id, currentLevel, action_type,
      status, notes, rejection_reason
    ]);

    // Mettre à jour le niveau de validation de la rumeur
    if (status === 'validated' || status === 'escalated') {
      await db.query(`
        UPDATE cohrm_rumors
        SET validation_level = ?, updated_at = NOW()
        WHERE id = ?
      `, [newLevel, id]);
    }

    // Ajouter à l'historique
    await db.query(`
      INSERT INTO cohrm_rumor_history (rumor_id, user_id, action, details, created_at)
      VALUES (?, ?, 'validation', ?, NOW())
    `, [id, req.user.id, `${action_type}: ${status} (niveau ${currentLevel} → ${newLevel})`]);

    // Envoyer les notifications selon l'action
    try {
      const userName = `${req.user.first_name} ${req.user.last_name}`.trim() || req.user.username;

      if (status === 'escalated') {
        // Notifier les validateurs du niveau supérieur
        await cohrmNotificationService.notifyEscalation(
          { ...rumor, id },
          currentLevel,
          newLevel,
          userName,
          notes || rejection_reason
        );
      } else if (status === 'validated' && newLevel <= 5) {
        // Notifier les validateurs du niveau suivant
        await cohrmNotificationService.notifyValidation(
          { ...rumor, id, validation_level: currentLevel },
          userName,
          notes
        );
      } else if (status === 'rejected') {
        // Notifier les validateurs des niveaux inférieurs
        await cohrmNotificationService.notifyRejection(
          { ...rumor, id, validation_level: currentLevel },
          userName,
          rejection_reason
        );
      }
    } catch (notifError) {
      console.error('Error sending validation notifications:', notifError);
      // Ne pas bloquer la validation si la notification échoue
    }

    res.json({
      success: true,
      message: 'Validation enregistrée',
      data: { new_level: newLevel }
    });
  } catch (error) {
    console.error('Validate rumor error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/cohrm/rumors/:id/risk-assessment - Évaluation des risques
router.post('/rumors/:id/risk-assessment', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      risk_level,
      risk_description,
      risk_context,
      risk_exposure
    } = req.body;

    await db.query(`
      UPDATE cohrm_rumors SET
        risk_level = ?,
        risk_description = ?,
        risk_context = ?,
        risk_exposure = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [risk_level, risk_description, risk_context, risk_exposure, id]);

    // Ajouter à l'historique
    await db.query(`
      INSERT INTO cohrm_rumor_history (rumor_id, user_id, action, details, created_at)
      VALUES (?, ?, 'risk_assessment', ?, NOW())
    `, [id, req.user.id, `Niveau de risque évalué: ${risk_level}`]);

    // Notifier les superviseurs pour les risques élevés
    try {
      if (risk_level === 'high' || risk_level === 'very_high') {
        const [rumors] = await db.query('SELECT * FROM cohrm_rumors WHERE id = ?', [id]);
        if (rumors.length > 0) {
          const userName = `${req.user.first_name} ${req.user.last_name}`.trim() || req.user.username;
          await cohrmNotificationService.notifyRiskAssessment(
            rumors[0],
            userName,
            risk_level,
            risk_description
          );
        }
      }
    } catch (notifError) {
      console.error('Error sending risk assessment notifications:', notifError);
    }

    res.json({ success: true, message: 'Évaluation des risques enregistrée' });
  } catch (error) {
    console.error('Risk assessment error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// RETRO-INFORMATION (Feedback)
// ============================================

// GET /api/cohrm/rumors/:id/feedback - Feedback d'une rumeur
router.get('/rumors/:id/feedback', auth, async (req, res) => {
  try {
    const [feedback] = await db.query(`
      SELECT f.*,
        CONCAT(u.first_name, ' ', u.last_name) as sender_name,
        a.actor_type as sender_actor_type
      FROM cohrm_feedback f
      LEFT JOIN users u ON f.sender_id = u.id
      LEFT JOIN cohrm_actors a ON f.sender_actor_id = a.id
      WHERE f.rumor_id = ?
      ORDER BY f.created_at DESC
    `, [req.params.id]);

    res.json({ success: true, data: feedback });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/cohrm/rumors/:id/feedback - Envoyer un feedback
router.post('/rumors/:id/feedback', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      recipient_type,
      recipient_phone,
      recipient_email,
      feedback_type,
      message,
      channel,
      actor_id
    } = req.body;

    if (!recipient_type || !feedback_type || !message) {
      return res.status(400).json({
        success: false,
        message: 'Type de destinataire, type de feedback et message sont requis'
      });
    }

    // Créer l'entrée de feedback
    const [result] = await db.query(`
      INSERT INTO cohrm_feedback (
        rumor_id, sender_id, sender_actor_id, recipient_type,
        recipient_phone, recipient_email, feedback_type,
        message, channel, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [
      id, req.user.id, actor_id, recipient_type,
      recipient_phone, recipient_email, feedback_type,
      message, channel || 'system'
    ]);

    // Envoyer la rétro-information par email
    if (channel === 'email' && recipient_email) {
      try {
        // Récupérer le code de la rumeur
        const [rumors] = await db.query('SELECT code FROM cohrm_rumors WHERE id = ?', [id]);
        const rumorCode = rumors[0]?.code || `#${id}`;

        const emailResult = await cohrmNotificationService.sendFeedbackEmail(
          recipient_email,
          rumorCode,
          feedback_type,
          message
        );

        // Mettre à jour le statut d'envoi
        await db.query(`
          UPDATE cohrm_feedback
          SET status = ?, sent_at = ${emailResult.success ? 'NOW()' : 'NULL'},
              error_message = ?
          WHERE id = ?
        `, [emailResult.success ? 'sent' : 'failed', emailResult.error || null, result.insertId]);
      } catch (emailError) {
        console.error('Error sending feedback email:', emailError);
        await db.query(`
          UPDATE cohrm_feedback
          SET status = 'failed', error_message = ?
          WHERE id = ?
        `, [emailError.message, result.insertId]);
      }
    } else if (channel === 'sms') {
      try {
        const smsMessage = smsTemplates.feedbackSent({
          rumorCode,
          message: message ? message.substring(0, 100) : feedback_type
        });
        const smsResult = await sendSMS(recipient_phone, smsMessage);

        await db.query(`
          UPDATE cohrm_feedback
          SET status = ?, sent_at = ${smsResult.success ? 'NOW()' : 'NULL'},
              error_message = ?
          WHERE id = ?
        `, [smsResult.success ? 'sent' : 'failed', smsResult.error || null, result.insertId]);
      } catch (smsError) {
        console.error('Error sending feedback SMS:', smsError);
        await db.query(`
          UPDATE cohrm_feedback
          SET status = 'failed', error_message = ?
          WHERE id = ?
        `, [smsError.message, result.insertId]);
      }
    }

    // Ajouter à l'historique de la rumeur
    await db.query(`
      INSERT INTO cohrm_rumor_history (rumor_id, user_id, action, details, created_at)
      VALUES (?, ?, 'feedback_sent', ?, NOW())
    `, [id, req.user.id, `Rétro-information envoyée: ${feedback_type} à ${recipient_type}`]);

    res.status(201).json({
      success: true,
      message: 'Rétro-information enregistrée',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Send feedback error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// STATISTIQUES AVANCÉES
// ============================================

// GET /api/cohrm/stats/validation - Stats de validation par niveau
router.get('/stats/validation', auth, async (req, res) => {
  try {
    // Rumeurs par niveau de validation
    const [byLevel] = await db.query(`
      SELECT validation_level, COUNT(*) as count
      FROM cohrm_rumors
      WHERE validation_level IS NOT NULL
      GROUP BY validation_level
      ORDER BY validation_level
    `);

    // Temps moyen de validation par niveau
    const [avgTime] = await db.query(`
      SELECT
        level,
        AVG(TIMESTAMPDIFF(HOUR, created_at, validated_at)) as avg_hours
      FROM cohrm_validations
      WHERE validated_at IS NOT NULL
      GROUP BY level
    `);

    // Validations par acteur (top 10)
    const [topActors] = await db.query(`
      SELECT
        a.actor_type, a.organization, a.region,
        COUNT(v.id) as validation_count
      FROM cohrm_actors a
      JOIN cohrm_validations v ON a.id = v.actor_id
      GROUP BY a.id
      ORDER BY validation_count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        byLevel,
        avgTime,
        topActors
      }
    });
  } catch (error) {
    console.error('Get validation stats error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/cohrm/stats/risk - Stats par niveau de risque
router.get('/stats/risk', auth, async (req, res) => {
  try {
    const [byRisk] = await db.query(`
      SELECT risk_level, COUNT(*) as count
      FROM cohrm_rumors
      WHERE risk_level IS NOT NULL AND risk_level != 'unknown'
      GROUP BY risk_level
    `);

    const [byCategory] = await db.query(`
      SELECT category, COUNT(*) as count
      FROM cohrm_rumors
      WHERE category IS NOT NULL
      GROUP BY category
    `);

    const [highRiskByRegion] = await db.query(`
      SELECT region, COUNT(*) as count
      FROM cohrm_rumors
      WHERE risk_level IN ('high', 'very_high')
      AND region IS NOT NULL
      GROUP BY region
      ORDER BY count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        byRisk,
        byCategory,
        highRiskByRegion
      }
    });
  } catch (error) {
    console.error('Get risk stats error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// MISE À JOUR RUMEURS (avec nouveaux champs)
// ============================================

// POST /api/cohrm/rumors/extended - Créer une rumeur avec tous les champs
router.post('/rumors/extended', auth, async (req, res) => {
  try {
    const {
      // Champs existants
      title,
      description,
      source,
      source_details,
      region,
      department,
      district,
      location,
      latitude,
      longitude,
      species,
      symptoms,
      affected_count,
      dead_count,
      priority,
      reporter_name,
      reporter_phone,
      reporter_type,
      // Nouveaux champs
      date_detection,
      date_circulation_start,
      arrondissement,
      commune,
      aire_sante,
      message_received,
      category,
      themes,
      gravity_comment,
      source_type,
      // Champs "autre" personnalisés
      category_other,
      source_type_other,
      reporter_type_other,
      // Champs géométrie
      geometry_type,
      geometry_data
    } = req.body;

    if (!title || !region) {
      return res.status(400).json({
        success: false,
        message: 'Titre et région sont requis'
      });
    }

    const code = generateRumorCode();

    const [result] = await db.query(`
      INSERT INTO cohrm_rumors (
        code, date_detection, date_circulation_start,
        title, description, message_received,
        source, source_type, source_type_other, source_details,
        category, category_other, themes, gravity_comment,
        region, department, arrondissement, commune,
        district, aire_sante, location,
        latitude, longitude, geometry_type, geometry_data,
        species, symptoms,
        affected_count, dead_count, priority, status,
        validation_level, risk_level,
        reporter_name, reporter_phone, reporter_type, reporter_type_other,
        reported_by, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 1, 'unknown',
        ?, ?, ?, ?, ?, NOW()
      )
    `, [
      code, date_detection, date_circulation_start,
      title, description, message_received,
      source || 'direct', source_type || 'direct', source_type_other, source_details,
      category || 'human_health', category_other, themes ? JSON.stringify(themes) : null, gravity_comment,
      region, department, arrondissement, commune,
      district, aire_sante, location,
      latitude, longitude, geometry_type || 'point', geometry_data ? JSON.stringify(geometry_data) : null,
      species, symptoms,
      affected_count, dead_count, priority || 'medium',
      reporter_name, reporter_phone, reporter_type || 'anonymous', reporter_type_other,
      req.user.id
    ]);

    // Ajouter la validation initiale (niveau 1 - collecte)
    await db.query(`
      INSERT INTO cohrm_validations (
        rumor_id, user_id, level, action_type,
        status, notes, validated_at, created_at
      ) VALUES (?, ?, 1, 'collect', 'validated', 'Collecte initiale', NOW(), NOW())
    `, [result.insertId, req.user.id]);

    // Ajouter historique
    await db.query(`
      INSERT INTO cohrm_rumor_history (rumor_id, user_id, action, details, created_at)
      VALUES (?, ?, 'created', 'Rumeur créée avec formulaire étendu', NOW())
    `, [result.insertId, req.user.id]);

    // Envoyer les notifications aux validateurs de niveau 1
    try {
      await cohrmNotificationService.notifyNewRumor({
        id: result.insertId,
        code,
        title,
        category: category || 'human_health',
        region,
        department,
        district,
        date_detection,
        validation_level: 1
      });
    } catch (notifError) {
      console.error('Error sending new rumor notifications:', notifError);
    }

    res.status(201).json({
      success: true,
      message: 'Rumeur créée avec succès',
      data: { id: result.insertId, code }
    });
  } catch (error) {
    console.error('Create extended rumor error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/cohrm/rumors/:id/extended - Mettre à jour avec tous les champs
router.put('/rumors/:id/extended', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      message_received,
      source,
      source_type,
      source_details,
      category,
      themes,
      gravity_comment,
      date_detection,
      date_circulation_start,
      region,
      department,
      arrondissement,
      commune,
      district,
      aire_sante,
      location,
      latitude,
      longitude,
      species,
      symptoms,
      affected_count,
      dead_count,
      priority,
      status,
      assigned_to,
      verification_notes,
      response_actions
    } = req.body;

    // Vérifier que la rumeur existe
    const [existing] = await db.query('SELECT * FROM cohrm_rumors WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Rumeur non trouvée' });
    }

    const oldStatus = existing[0].status;

    await db.query(`
      UPDATE cohrm_rumors SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        message_received = COALESCE(?, message_received),
        source = COALESCE(?, source),
        source_type = COALESCE(?, source_type),
        source_details = COALESCE(?, source_details),
        category = COALESCE(?, category),
        themes = COALESCE(?, themes),
        gravity_comment = COALESCE(?, gravity_comment),
        date_detection = COALESCE(?, date_detection),
        date_circulation_start = COALESCE(?, date_circulation_start),
        region = COALESCE(?, region),
        department = COALESCE(?, department),
        arrondissement = COALESCE(?, arrondissement),
        commune = COALESCE(?, commune),
        district = COALESCE(?, district),
        aire_sante = COALESCE(?, aire_sante),
        location = COALESCE(?, location),
        latitude = COALESCE(?, latitude),
        longitude = COALESCE(?, longitude),
        species = COALESCE(?, species),
        symptoms = COALESCE(?, symptoms),
        affected_count = COALESCE(?, affected_count),
        dead_count = COALESCE(?, dead_count),
        priority = COALESCE(?, priority),
        status = COALESCE(?, status),
        assigned_to = ?,
        verification_notes = COALESCE(?, verification_notes),
        response_actions = COALESCE(?, response_actions),
        updated_at = NOW()
      WHERE id = ?
    `, [
      title, description, message_received,
      source, source_type, source_details,
      category, themes ? JSON.stringify(themes) : null, gravity_comment,
      date_detection, date_circulation_start,
      region, department, arrondissement, commune,
      district, aire_sante, location,
      latitude, longitude, species, symptoms,
      affected_count, dead_count, priority, status, assigned_to,
      verification_notes, response_actions, id
    ]);

    // Ajouter historique si statut changé
    if (status && status !== oldStatus) {
      await db.query(`
        INSERT INTO cohrm_rumor_history (rumor_id, user_id, action, details, created_at)
        VALUES (?, ?, 'status_change', ?, NOW())
      `, [id, req.user.id, `Statut modifié: ${oldStatus} → ${status}`]);
    }

    res.json({ success: true, message: 'Rumeur mise à jour' });
  } catch (error) {
    console.error('Update extended rumor error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/cohrm/regions - Liste des régions avec départements
router.get('/regions', async (req, res) => {
  try {
    const regions = [
      {
        code: 'AD',
        name: 'Adamaoua',
        departments: ['Djérem', 'Faro-et-Déo', 'Mayo-Banyo', 'Mbéré', 'Vina']
      },
      {
        code: 'CE',
        name: 'Centre',
        departments: ['Haute-Sanaga', 'Lekié', 'Mbam-et-Inoubou', 'Mbam-et-Kim', 'Méfou-et-Afamba', 'Méfou-et-Akono', 'Mfoundi', 'Nyong-et-Kellé', 'Nyong-et-Mfoumou', 'Nyong-et-So\'o']
      },
      {
        code: 'ES',
        name: 'Est',
        departments: ['Boumba-et-Ngoko', 'Haut-Nyong', 'Kadey', 'Lom-et-Djérem']
      },
      {
        code: 'EN',
        name: 'Extrême-Nord',
        departments: ['Diamaré', 'Logone-et-Chari', 'Mayo-Danay', 'Mayo-Kani', 'Mayo-Sava', 'Mayo-Tsanaga']
      },
      {
        code: 'LT',
        name: 'Littoral',
        departments: ['Moungo', 'Nkam', 'Sanaga-Maritime', 'Wouri']
      },
      {
        code: 'NO',
        name: 'Nord',
        departments: ['Bénoué', 'Faro', 'Mayo-Louti', 'Mayo-Rey']
      },
      {
        code: 'NW',
        name: 'Nord-Ouest',
        departments: ['Boyo', 'Bui', 'Donga-Mantung', 'Menchum', 'Mezam', 'Momo', 'Ngo-Ketunjia']
      },
      {
        code: 'OU',
        name: 'Ouest',
        departments: ['Bamboutos', 'Haut-Nkam', 'Hauts-Plateaux', 'Koung-Khi', 'Menoua', 'Mifi', 'Ndé', 'Noun']
      },
      {
        code: 'SU',
        name: 'Sud',
        departments: ['Dja-et-Lobo', 'Mvila', 'Océan', 'Vallée-du-Ntem']
      },
      {
        code: 'SW',
        name: 'Sud-Ouest',
        departments: ['Fako', 'Koupé-Manengouba', 'Lebialem', 'Manyu', 'Meme', 'Ndian']
      }
    ];

    res.json({ success: true, data: regions });
  } catch (error) {
    console.error('Get regions error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/cohrm/dashboard - Dashboard complet
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Stats générales
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM cohrm_rumors');
    const [[{ pending }]] = await db.query("SELECT COUNT(*) as pending FROM cohrm_rumors WHERE status = 'pending'");
    const [[{ investigating }]] = await db.query("SELECT COUNT(*) as investigating FROM cohrm_rumors WHERE status = 'investigating'");
    const [[{ confirmed }]] = await db.query("SELECT COUNT(*) as confirmed FROM cohrm_rumors WHERE status = 'confirmed'");
    const [[{ alerts }]] = await db.query("SELECT COUNT(*) as alerts FROM cohrm_rumors WHERE priority IN ('high', 'critical') AND status != 'closed'");
    const [[{ highRisk }]] = await db.query("SELECT COUNT(*) as highRisk FROM cohrm_rumors WHERE risk_level IN ('high', 'very_high')");

    // Rumeurs par niveau de validation
    const [byValidationLevel] = await db.query(`
      SELECT validation_level, COUNT(*) as count
      FROM cohrm_rumors
      GROUP BY validation_level
    `);

    // Rumeurs par catégorie
    const [byCategory] = await db.query(`
      SELECT category, COUNT(*) as count
      FROM cohrm_rumors
      WHERE category IS NOT NULL
      GROUP BY category
    `);

    // Rumeurs récentes
    const [recentRumors] = await db.query(`
      SELECT id, code, title, region, priority, status, validation_level, risk_level, created_at
      FROM cohrm_rumors
      ORDER BY created_at DESC
      LIMIT 10
    `);

    // Rumeurs nécessitant une action (en attente de validation)
    const [pendingValidation] = await db.query(`
      SELECT id, code, title, region, priority, validation_level, created_at
      FROM cohrm_rumors
      WHERE status IN ('pending', 'investigating')
      AND validation_level < 5
      ORDER BY priority DESC, created_at ASC
      LIMIT 10
    `);

    // Acteurs actifs
    const [[{ activeActors }]] = await db.query('SELECT COUNT(*) as activeActors FROM cohrm_actors WHERE is_active = 1');

    res.json({
      success: true,
      data: {
        stats: {
          total,
          pending,
          investigating,
          confirmed,
          alerts,
          highRisk,
          activeActors
        },
        byValidationLevel,
        byCategory,
        recentRumors,
        pendingValidation
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// GESTION DES ASSIGNATIONS DE VALIDATION
// ============================================

// GET /api/cohrm/validation-assignees - Liste toutes les assignations
router.get('/validation-assignees', auth, async (req, res) => {
  try {
    const { level, region, active_only = 'true' } = req.query;

    let whereConditions = [];
    let params = [];

    if (active_only === 'true') {
      whereConditions.push('va.is_active = 1');
    }
    if (level) {
      whereConditions.push('va.validation_level = ?');
      params.push(parseInt(level));
    }
    if (region) {
      whereConditions.push('(va.region = ? OR va.region IS NULL)');
      params.push(region);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const [assignees] = await db.query(`
      SELECT
        va.id,
        va.user_id,
        va.validation_level,
        va.region,
        va.department,
        va.can_validate,
        va.can_reject,
        va.can_escalate,
        va.can_assess_risk,
        va.can_send_feedback,
        va.notify_email,
        va.notify_sms,
        va.notes,
        va.is_active,
        va.assigned_at,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) as full_name,
        u.avatar,
        u.role as user_role,
        ab.username as assigned_by_username,
        CONCAT(ab.first_name, ' ', ab.last_name) as assigned_by_name
      FROM cohrm_validation_assignees va
      JOIN users u ON va.user_id = u.id
      LEFT JOIN users ab ON va.assigned_by = ab.id
      ${whereClause}
      ORDER BY va.validation_level ASC, u.last_name ASC
    `, params);

    // Grouper par niveau
    const byLevel = {};
    for (let i = 1; i <= 5; i++) {
      byLevel[i] = assignees.filter(a => a.validation_level === i);
    }

    res.json({
      success: true,
      data: assignees,
      byLevel
    });
  } catch (error) {
    console.error('Get validation assignees error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/cohrm/validation-assignees/level/:level - Assignés pour un niveau spécifique
router.get('/validation-assignees/level/:level', auth, async (req, res) => {
  try {
    const { level } = req.params;
    const { region } = req.query;

    let whereConditions = ['va.validation_level = ?', 'va.is_active = 1'];
    let params = [parseInt(level)];

    if (region) {
      whereConditions.push('(va.region = ? OR va.region IS NULL)');
      params.push(region);
    }

    const [assignees] = await db.query(`
      SELECT
        va.id,
        va.user_id,
        va.validation_level,
        va.region,
        va.department,
        va.can_validate,
        va.can_reject,
        va.can_escalate,
        va.can_assess_risk,
        va.can_send_feedback,
        va.notify_email,
        va.notify_sms,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) as full_name,
        u.avatar
      FROM cohrm_validation_assignees va
      JOIN users u ON va.user_id = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY u.last_name ASC
    `, params);

    res.json({ success: true, data: assignees });
  } catch (error) {
    console.error('Get level assignees error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/cohrm/validation-assignees/available-users - Utilisateurs disponibles pour assignation
router.get('/validation-assignees/available-users', auth, async (req, res) => {
  try {
    const { search, level } = req.query;

    // Exclure les abonnés (subscribers) - seuls les admins, editors, etc. peuvent être validateurs
    let whereConditions = ['u.is_active = 1', 'u.status = "active"', 'u.role != "subscriber"', 'u.role != "abonne"'];
    let params = [];

    if (search) {
      whereConditions.push('(u.username LIKE ? OR u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [users] = await db.query(`
      SELECT
        u.id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) as full_name,
        u.avatar,
        u.role
      FROM users u
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY u.last_name ASC
      LIMIT 100
    `, params);

    // Si un niveau est spécifié, marquer les utilisateurs déjà assignés
    if (level) {
      const [assigned] = await db.query(
        'SELECT user_id FROM cohrm_validation_assignees WHERE validation_level = ? AND is_active = 1',
        [parseInt(level)]
      );
      const assignedIds = assigned.map(a => a.user_id);
      users.forEach(u => {
        u.already_assigned = assignedIds.includes(u.id);
      });
    }

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get available users error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/cohrm/validation-assignees/my-levels - Niveaux assignés à l'utilisateur connecté
router.get('/validation-assignees/my-levels', auth, async (req, res) => {
  try {
    const [assignments] = await db.query(`
      SELECT
        va.id,
        va.validation_level,
        va.region,
        va.department,
        va.can_validate,
        va.can_reject,
        va.can_escalate,
        va.can_assess_risk,
        va.can_send_feedback
      FROM cohrm_validation_assignees va
      WHERE va.user_id = ? AND va.is_active = 1
      ORDER BY va.validation_level ASC
    `, [req.user.id]);

    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error('Get my levels error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/cohrm/validation-assignees - Assigner un utilisateur à un niveau
router.post('/validation-assignees', auth, authorize('admin'), async (req, res) => {
  try {
    const {
      user_id,
      validation_level,
      region,
      department,
      can_validate = true,
      can_reject = true,
      can_escalate = true,
      can_assess_risk = true,
      can_send_feedback = true,
      notify_email = true,
      notify_sms = false,
      notes
    } = req.body;

    if (!user_id || !validation_level) {
      return res.status(400).json({
        success: false,
        message: 'user_id et validation_level sont requis'
      });
    }

    if (validation_level < 1 || validation_level > 5) {
      return res.status(400).json({
        success: false,
        message: 'validation_level doit être entre 1 et 5'
      });
    }

    // Vérifier si l'utilisateur existe
    const [users] = await db.query('SELECT id FROM users WHERE id = ?', [user_id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'assignation existe déjà
    const [existing] = await db.query(`
      SELECT id, is_active FROM cohrm_validation_assignees
      WHERE user_id = ? AND validation_level = ?
      AND (region = ? OR (region IS NULL AND ? IS NULL))
      AND (department = ? OR (department IS NULL AND ? IS NULL))
    `, [user_id, validation_level, region, region, department, department]);

    if (existing.length > 0) {
      if (existing[0].is_active) {
        return res.status(400).json({
          success: false,
          message: 'Cet utilisateur est déjà assigné à ce niveau'
        });
      } else {
        // Réactiver l'assignation existante
        await db.query(`
          UPDATE cohrm_validation_assignees
          SET is_active = 1, assigned_by = ?, assigned_at = NOW(),
              can_validate = ?, can_reject = ?, can_escalate = ?,
              can_assess_risk = ?, can_send_feedback = ?,
              notify_email = ?, notify_sms = ?, notes = ?
          WHERE id = ?
        `, [
          req.user.id, can_validate, can_reject, can_escalate,
          can_assess_risk, can_send_feedback, notify_email, notify_sms,
          notes, existing[0].id
        ]);

        return res.json({
          success: true,
          message: 'Assignation réactivée',
          data: { id: existing[0].id }
        });
      }
    }

    // Créer la nouvelle assignation
    const [result] = await db.query(`
      INSERT INTO cohrm_validation_assignees (
        user_id, validation_level, region, department,
        can_validate, can_reject, can_escalate, can_assess_risk, can_send_feedback,
        notify_email, notify_sms, notes, assigned_by, assigned_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      user_id, validation_level, region || null, department || null,
      can_validate, can_reject, can_escalate, can_assess_risk, can_send_feedback,
      notify_email, notify_sms, notes || null, req.user.id
    ]);

    res.status(201).json({
      success: true,
      message: 'Utilisateur assigné avec succès',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create validation assignee error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/cohrm/validation-assignees/:id - Modifier une assignation
router.put('/validation-assignees/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      region,
      department,
      can_validate,
      can_reject,
      can_escalate,
      can_assess_risk,
      can_send_feedback,
      notify_email,
      notify_sms,
      notes
    } = req.body;

    // Vérifier si l'assignation existe
    const [existing] = await db.query(
      'SELECT id FROM cohrm_validation_assignees WHERE id = ?',
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignation non trouvée' });
    }

    await db.query(`
      UPDATE cohrm_validation_assignees SET
        region = ?,
        department = ?,
        can_validate = ?,
        can_reject = ?,
        can_escalate = ?,
        can_assess_risk = ?,
        can_send_feedback = ?,
        notify_email = ?,
        notify_sms = ?,
        notes = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [
      region || null, department || null,
      can_validate, can_reject, can_escalate, can_assess_risk, can_send_feedback,
      notify_email, notify_sms, notes || null, id
    ]);

    res.json({ success: true, message: 'Assignation mise à jour' });
  } catch (error) {
    console.error('Update validation assignee error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/cohrm/validation-assignees/:id - Supprimer (désactiver) une assignation
router.delete('/validation-assignees/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query(
      'SELECT id FROM cohrm_validation_assignees WHERE id = ?',
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignation non trouvée' });
    }

    // Désactiver plutôt que supprimer pour garder l'historique
    await db.query(
      'UPDATE cohrm_validation_assignees SET is_active = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );

    res.json({ success: true, message: 'Assignation supprimée' });
  } catch (error) {
    console.error('Delete validation assignee error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/cohrm/validation-assignees/stats - Statistiques des assignations
router.get('/validation-assignees/stats', auth, async (req, res) => {
  try {
    // Nombre d'assignés par niveau
    const [byLevel] = await db.query(`
      SELECT validation_level, COUNT(*) as count
      FROM cohrm_validation_assignees
      WHERE is_active = 1
      GROUP BY validation_level
      ORDER BY validation_level
    `);

    // Nombre d'assignés par région
    const [byRegion] = await db.query(`
      SELECT COALESCE(region, 'Toutes régions') as region, COUNT(*) as count
      FROM cohrm_validation_assignees
      WHERE is_active = 1
      GROUP BY region
      ORDER BY region
    `);

    // Total des assignés actifs
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) as total FROM cohrm_validation_assignees WHERE is_active = 1'
    );

    // Utilisateurs avec plusieurs niveaux
    const [multiLevel] = await db.query(`
      SELECT user_id, COUNT(*) as level_count
      FROM cohrm_validation_assignees
      WHERE is_active = 1
      GROUP BY user_id
      HAVING level_count > 1
    `);

    res.json({
      success: true,
      data: {
        total,
        byLevel,
        byRegion,
        multiLevelUsers: multiLevel.length
      }
    });
  } catch (error) {
    console.error('Get assignees stats error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/cohrm/my-pending-validations - Validations en attente pour l'utilisateur connecté
router.get('/my-pending-validations', auth, async (req, res) => {
  try {
    // Récupérer les niveaux assignés à l'utilisateur
    const [myAssignments] = await db.query(`
      SELECT validation_level, region, department
      FROM cohrm_validation_assignees
      WHERE user_id = ? AND is_active = 1
    `, [req.user.id]);

    if (myAssignments.length === 0) {
      // Si l'utilisateur n'a pas d'assignation, vérifier s'il est admin
      if (req.user.role === 'admin') {
        // Les admins voient toutes les validations en attente
        const [rumors] = await db.query(`
          SELECT id, code, title, region, department, priority, status, validation_level, risk_level, created_at
          FROM cohrm_rumors
          WHERE status IN ('pending', 'investigating')
          AND validation_level < 5
          ORDER BY priority DESC, created_at ASC
          LIMIT 50
        `);
        return res.json({ success: true, data: rumors, isAdmin: true });
      }
      return res.json({ success: true, data: [], message: 'Aucune assignation' });
    }

    // Construire la requête pour les rumeurs correspondant aux assignations
    let conditions = [];
    let params = [];

    myAssignments.forEach(assignment => {
      let condition = 'validation_level = ?';
      params.push(assignment.validation_level);

      if (assignment.region) {
        condition += ' AND region = ?';
        params.push(assignment.region);
      }
      if (assignment.department) {
        condition += ' AND department = ?';
        params.push(assignment.department);
      }

      conditions.push(`(${condition})`);
    });

    const [rumors] = await db.query(`
      SELECT id, code, title, region, department, priority, status, validation_level, risk_level, created_at
      FROM cohrm_rumors
      WHERE status IN ('pending', 'investigating')
      AND (${conditions.join(' OR ')})
      ORDER BY priority DESC, created_at ASC
      LIMIT 50
    `, params);

    res.json({
      success: true,
      data: rumors,
      myLevels: myAssignments.map(a => a.validation_level)
    });
  } catch (error) {
    console.error('Get my pending validations error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ============================================
// NOTIFICATIONS COHRM
// ============================================

// POST /api/cohrm/notifications/register-device - Register FCM device token
router.post('/notifications/register-device', auth, async (req, res) => {
  try {
    const { token, platform, device_info } = req.body;

    if (!token || !platform) {
      return res.status(400).json({
        success: false,
        message: 'Token et platform sont requis'
      });
    }

    if (!['android', 'ios', 'web'].includes(platform)) {
      return res.status(400).json({
        success: false,
        message: 'Platform doit être android, ios ou web'
      });
    }

    const result = await registerDeviceToken(req.user.id, token, platform, device_info || null);

    if (result.success) {
      res.json({ success: true, message: 'Token enregistré avec succès' });
    } else {
      res.status(500).json({ success: false, message: result.error });
    }
  } catch (error) {
    console.error('Register device token error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/cohrm/notifications/unregister-device - Unregister FCM device token
router.delete('/notifications/unregister-device', auth, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token est requis' });
    }

    const result = await unregisterDeviceToken(token);
    res.json({ success: true, message: 'Token supprimé' });
  } catch (error) {
    console.error('Unregister device token error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/cohrm/notifications - Historique des notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      status,
      rumor_id,
      user_id,
      startDate,
      endDate
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereConditions = ['1=1'];
    let params = [];

    if (type) {
      whereConditions.push('n.notification_type = ?');
      params.push(type);
    }
    if (status) {
      whereConditions.push('n.status = ?');
      params.push(status);
    }
    if (rumor_id) {
      whereConditions.push('n.rumor_id = ?');
      params.push(rumor_id);
    }
    if (user_id) {
      whereConditions.push('n.user_id = ?');
      params.push(user_id);
    }
    if (startDate) {
      whereConditions.push('DATE(n.created_at) >= ?');
      params.push(startDate);
    }
    if (endDate) {
      whereConditions.push('DATE(n.created_at) <= ?');
      params.push(endDate);
    }

    const whereClause = whereConditions.join(' AND ');

    // Récupérer les notifications
    const [notifications] = await db.query(`
      SELECT n.*,
        r.code as rumor_code,
        r.title as rumor_title,
        CONCAT(u.first_name, ' ', u.last_name) as recipient_name
      FROM cohrm_notifications n
      LEFT JOIN cohrm_rumors r ON n.rumor_id = r.id
      LEFT JOIN users u ON n.user_id = u.id
      WHERE ${whereClause}
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    // Compter le total
    const [[{ total }]] = await db.query(`
      SELECT COUNT(*) as total
      FROM cohrm_notifications n
      WHERE ${whereClause}
    `, params);

    // Statistiques
    const [stats] = await db.query(`
      SELECT
        status,
        COUNT(*) as count
      FROM cohrm_notifications
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY status
    `);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      stats: stats.reduce((acc, s) => ({ ...acc, [s.status]: s.count }), {})
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/cohrm/notifications/my - Mes notifications
router.get('/notifications/my', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [notifications] = await db.query(`
      SELECT n.*,
        r.code as rumor_code,
        r.title as rumor_title
      FROM cohrm_notifications n
      LEFT JOIN cohrm_rumors r ON n.rumor_id = r.id
      WHERE n.user_id = ? OR n.recipient_email = ?
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, req.user.email, parseInt(limit), offset]);

    const [[{ total }]] = await db.query(`
      SELECT COUNT(*) as total
      FROM cohrm_notifications
      WHERE user_id = ? OR recipient_email = ?
    `, [req.user.id, req.user.email]);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get my notifications error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/cohrm/notifications/stats - Statistiques des notifications
router.get('/notifications/stats', auth, async (req, res) => {
  try {
    // Par type
    const [byType] = await db.query(`
      SELECT notification_type, COUNT(*) as count
      FROM cohrm_notifications
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY notification_type
    `);

    // Par statut
    const [byStatus] = await db.query(`
      SELECT status, COUNT(*) as count
      FROM cohrm_notifications
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY status
    `);

    // Par jour (7 derniers jours)
    const [byDay] = await db.query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as total,
        SUM(status = 'sent') as sent,
        SUM(status = 'failed') as failed
      FROM cohrm_notifications
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Taux de succès
    const [[successRate]] = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(status = 'sent') as sent,
        SUM(status = 'failed') as failed,
        ROUND(SUM(status = 'sent') / COUNT(*) * 100, 2) as success_rate
      FROM cohrm_notifications
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    res.json({
      success: true,
      data: {
        byType,
        byStatus,
        byDay,
        successRate
      }
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/cohrm/notifications/retry/:id - Relancer une notification échouée
router.post('/notifications/retry/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer la notification
    const [notifications] = await db.query(`
      SELECT n.*, r.code as rumor_code, r.title as rumor_title, r.*
      FROM cohrm_notifications n
      LEFT JOIN cohrm_rumors r ON n.rumor_id = r.id
      WHERE n.id = ? AND n.status = 'failed'
    `, [id]);

    if (notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée ou non éligible pour relance'
      });
    }

    const notification = notifications[0];

    // Déterminer le template à utiliser
    const templates = {
      'new_rumor': 'newRumorAssigned',
      'escalation': 'rumorEscalated',
      'validation': 'rumorValidated',
      'rejection': 'rumorRejected',
      'risk_assessment': 'riskAssessmentCompleted',
      'reminder': 'pendingValidationReminder'
    };

    const templateName = templates[notification.notification_type];
    if (!templateName || !cohrmNotificationService.emailTemplates[templateName]) {
      return res.status(400).json({
        success: false,
        message: 'Type de notification non supporté pour relance'
      });
    }

    // Tenter de renvoyer l'email
    const adminUrl = process.env.ADMIN_URL || 'http://localhost:3001';
    const emailContent = cohrmNotificationService.emailTemplates[templateName]({
      userName: 'Validateur',
      rumorId: notification.rumor_id,
      rumorCode: notification.rumor_code || `#${notification.rumor_id}`,
      title: notification.rumor_title,
      adminUrl
    });

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: `"COHRM - One Health Cameroun" <${process.env.SMTP_FROM || 'noreply@onehealth.cm'}>`,
      to: notification.recipient_email,
      subject: emailContent.subject,
      html: emailContent.html
    });

    // Mettre à jour le statut
    await db.query(`
      UPDATE cohrm_notifications
      SET status = 'sent', sent_at = NOW(), retry_count = retry_count + 1
      WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Notification renvoyée avec succès'
    });
  } catch (error) {
    console.error('Retry notification error:', error);

    // Mettre à jour le compteur de tentatives
    await db.query(`
      UPDATE cohrm_notifications
      SET retry_count = retry_count + 1, error_message = ?
      WHERE id = ?
    `, [error.message, req.params.id]);

    res.status(500).json({ success: false, message: 'Erreur lors de la relance' });
  }
});

// POST /api/cohrm/notifications/send-reminders - Envoyer les rappels (pour cron job)
router.post('/notifications/send-reminders', auth, async (req, res) => {
  try {
    const results = await cohrmNotificationService.sendPendingReminders();
    res.json({
      success: true,
      message: `${results.length} rappel(s) envoyé(s)`,
      data: results
    });
  } catch (error) {
    console.error('Send reminders error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/cohrm/notification-preferences - Préférences de l'utilisateur
router.get('/notification-preferences', auth, async (req, res) => {
  try {
    const [prefs] = await db.query(`
      SELECT * FROM cohrm_notification_preferences
      WHERE user_id = ?
    `, [req.user.id]);

    if (prefs.length === 0) {
      // Retourner les valeurs par défaut
      res.json({
        success: true,
        data: {
          user_id: req.user.id,
          notify_new_rumor: true,
          notify_escalation: true,
          notify_validation: true,
          notify_rejection: true,
          notify_risk_assessment: true,
          notify_reminder: true,
          notify_feedback: true,
          prefer_email: true,
          prefer_sms: false,
          prefer_push: false,
          reminder_frequency: 'daily',
          quiet_hours_start: '22:00:00',
          quiet_hours_end: '07:00:00',
          respect_quiet_hours: true
        }
      });
    } else {
      res.json({ success: true, data: prefs[0] });
    }
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/cohrm/notification-preferences - Mettre à jour les préférences
router.put('/notification-preferences', auth, async (req, res) => {
  try {
    const {
      notify_new_rumor,
      notify_escalation,
      notify_validation,
      notify_rejection,
      notify_risk_assessment,
      notify_reminder,
      notify_feedback,
      prefer_email,
      prefer_sms,
      prefer_push,
      reminder_frequency,
      quiet_hours_start,
      quiet_hours_end,
      respect_quiet_hours
    } = req.body;

    // Upsert les préférences
    await db.query(`
      INSERT INTO cohrm_notification_preferences (
        user_id, notify_new_rumor, notify_escalation, notify_validation,
        notify_rejection, notify_risk_assessment, notify_reminder, notify_feedback,
        prefer_email, prefer_sms, prefer_push,
        reminder_frequency, quiet_hours_start, quiet_hours_end, respect_quiet_hours,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        notify_new_rumor = VALUES(notify_new_rumor),
        notify_escalation = VALUES(notify_escalation),
        notify_validation = VALUES(notify_validation),
        notify_rejection = VALUES(notify_rejection),
        notify_risk_assessment = VALUES(notify_risk_assessment),
        notify_reminder = VALUES(notify_reminder),
        notify_feedback = VALUES(notify_feedback),
        prefer_email = VALUES(prefer_email),
        prefer_sms = VALUES(prefer_sms),
        prefer_push = VALUES(prefer_push),
        reminder_frequency = VALUES(reminder_frequency),
        quiet_hours_start = VALUES(quiet_hours_start),
        quiet_hours_end = VALUES(quiet_hours_end),
        respect_quiet_hours = VALUES(respect_quiet_hours),
        updated_at = NOW()
    `, [
      req.user.id,
      notify_new_rumor ?? true,
      notify_escalation ?? true,
      notify_validation ?? true,
      notify_rejection ?? true,
      notify_risk_assessment ?? true,
      notify_reminder ?? true,
      notify_feedback ?? true,
      prefer_email ?? true,
      prefer_sms ?? false,
      prefer_push ?? false,
      reminder_frequency || 'daily',
      quiet_hours_start || '22:00:00',
      quiet_hours_end || '07:00:00',
      respect_quiet_hours ?? true
    ]);

    res.json({
      success: true,
      message: 'Préférences mises à jour avec succès'
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/cohrm/notifications/test - Envoyer une notification de test
router.post('/notifications/test', auth, async (req, res) => {
  try {
    const { type = 'new_rumor' } = req.body;

    // Créer une notification de test
    const testData = {
      userName: `${req.user.first_name} ${req.user.last_name}`.trim() || req.user.username,
      rumorId: 0,
      rumorCode: 'TEST-0000',
      title: 'Notification de test COHRM',
      category: 'human_health',
      location: 'Test Location',
      level: 1,
      fromLevel: 1,
      toLevel: 2,
      escalatedBy: 'Système',
      validatedBy: 'Système',
      rejectedBy: 'Système',
      riskLevel: 'high',
      assessedBy: 'Système',
      pendingCount: 5
    };

    const templates = {
      'new_rumor': cohrmNotificationService.emailTemplates.newRumorAssigned,
      'escalation': cohrmNotificationService.emailTemplates.rumorEscalated,
      'validation': cohrmNotificationService.emailTemplates.rumorValidated,
      'rejection': cohrmNotificationService.emailTemplates.rumorRejected,
      'risk_assessment': cohrmNotificationService.emailTemplates.riskAssessmentCompleted,
      'reminder': cohrmNotificationService.emailTemplates.pendingValidationReminder
    };

    const template = templates[type];
    if (!template) {
      return res.status(400).json({
        success: false,
        message: 'Type de notification non supporté'
      });
    }

    const adminUrl = process.env.ADMIN_URL || 'http://localhost:3001';
    const emailContent = template({ ...testData, adminUrl });

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: `"COHRM - One Health Cameroun" <${process.env.SMTP_FROM || 'noreply@onehealth.cm'}>`,
      to: req.user.email,
      subject: `[TEST] ${emailContent.subject}`,
      html: emailContent.html
    });

    // Enregistrer la notification de test
    await db.query(`
      INSERT INTO cohrm_notifications
      (user_id, notification_type, channel, recipient_email, subject, status, sent_at, created_at)
      VALUES (?, 'system', 'email', ?, ?, 'sent', NOW(), NOW())
    `, [req.user.id, req.user.email, `[TEST] ${emailContent.subject}`]);

    res.json({
      success: true,
      message: `Notification de test envoyée à ${req.user.email}`
    });
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de la notification de test',
      error: error.message
    });
  }
});

// ============================================
// PHOTOS / MÉDIAS
// ============================================

// GET /api/cohrm/rumors/:id/photos
router.get('/rumors/:id/photos', auth, async (req, res) => {
  try {
    const [photos] = await db.query(
      'SELECT * FROM cohrm_rumor_photos WHERE rumor_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json({ success: true, data: photos });
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/cohrm/rumors/:id/photos - Upload photos
router.post('/rumors/:id/photos', auth, photoUpload.array('photos', 5), async (req, res) => {
  try {
    const rumorId = req.params.id;
    const captions = req.body.captions ? JSON.parse(req.body.captions) : [];

    // Vérifier que la rumeur existe
    const [[rumor]] = await db.query('SELECT id FROM cohrm_rumors WHERE id = ?', [rumorId]);
    if (!rumor) {
      return res.status(404).json({ success: false, message: 'Rumeur non trouvée' });
    }

    // Vérifier le nombre total de photos (max 10)
    const [[{ count }]] = await db.query(
      'SELECT COUNT(*) as count FROM cohrm_rumor_photos WHERE rumor_id = ?', [rumorId]
    );
    if (count + req.files.length > 10) {
      return res.status(400).json({ success: false, message: 'Maximum 10 photos par rumeur' });
    }

    const photos = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const caption = captions[i] || '';
      const url = `/uploads/cohrm/${file.filename}`;

      // Générer thumbnail
      let thumbnailUrl = url;
      try {
        const sharp = require('sharp');
        const thumbFilename = `thumb-${file.filename}`;
        await sharp(file.path)
          .resize(200, 200, { fit: 'cover' })
          .toFile(path.join(thumbDir, thumbFilename));
        thumbnailUrl = `/uploads/cohrm/thumbnails/${thumbFilename}`;
      } catch (thumbErr) {
        console.warn('Thumbnail generation failed:', thumbErr.message);
      }

      const [result] = await db.query(
        'INSERT INTO cohrm_rumor_photos (rumor_id, url, caption) VALUES (?, ?, ?)',
        [rumorId, url, caption]
      );

      photos.push({ id: result.insertId, rumor_id: rumorId, url, thumbnail_url: thumbnailUrl, caption });
    }

    // Historique
    await db.query(
      'INSERT INTO cohrm_rumor_history (rumor_id, user_id, action, details) VALUES (?, ?, ?, ?)',
      [rumorId, req.user.id, 'photo_added', JSON.stringify({ count: req.files.length })]
    );

    res.json({ success: true, data: photos, message: `${photos.length} photo(s) ajoutée(s)` });
  } catch (error) {
    console.error('Upload photos error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/cohrm/rumors/:id/photos/:photoId
router.delete('/rumors/:id/photos/:photoId', auth, async (req, res) => {
  try {
    const { id: rumorId, photoId } = req.params;

    const [[photo]] = await db.query(
      'SELECT * FROM cohrm_rumor_photos WHERE id = ? AND rumor_id = ?',
      [photoId, rumorId]
    );
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo non trouvée' });
    }

    // Supprimer les fichiers
    const filePath = path.join(__dirname, '..', photo.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    const thumbPath = filePath.replace('cohrm/', 'cohrm/thumbnails/thumb-');
    if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);

    await db.query('DELETE FROM cohrm_rumor_photos WHERE id = ?', [photoId]);

    await db.query(
      'INSERT INTO cohrm_rumor_history (rumor_id, user_id, action, details) VALUES (?, ?, ?, ?)',
      [rumorId, req.user.id, 'photo_removed', JSON.stringify({ photoId })]
    );

    res.json({ success: true, message: 'Photo supprimée' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// FORMULAIRE PUBLIC (sans authentification)
// ============================================

const rateLimit = require('express-rate-limit');
const publicLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: { success: false, message: 'Trop de soumissions. Réessayez dans 1 heure.' } });

// POST /api/cohrm/public/report - Signalement public
router.post('/public/report', publicLimiter, async (req, res) => {
  try {
    const {
      reporter_name, reporter_phone, reporter_type,
      region, department, district, location,
      description, category, species, symptoms,
      affected_count, dead_count, latitude, longitude,
    } = req.body;

    // Validation
    if (!reporter_phone) {
      return res.status(400).json({ success: false, message: 'Le numéro de téléphone est requis' });
    }
    if (!description || description.length < 20) {
      return res.status(400).json({ success: false, message: 'La description doit contenir au moins 20 caractères' });
    }

    // Sanitize
    const sanitize = (str) => str ? String(str).replace(/<[^>]*>/g, '').trim().substring(0, 1000) : '';

    const code = generateRumorCode();

    const [result] = await db.query(
      `INSERT INTO cohrm_rumors (code, title, description, source, source_type,
        reporter_name, reporter_phone, reporter_type,
        region, department, district, location,
        category, species, symptoms, affected_count, dead_count,
        latitude, longitude, status, priority)
       VALUES (?, ?, ?, 'web', 'public_form', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'medium')`,
      [
        code,
        sanitize(description).substring(0, 100),
        sanitize(description),
        sanitize(reporter_name),
        sanitize(reporter_phone),
        sanitize(reporter_type) || 'citizen',
        sanitize(region), sanitize(department), sanitize(district), sanitize(location),
        sanitize(category) || 'other',
        sanitize(species),
        symptoms ? JSON.stringify(symptoms) : null,
        parseInt(affected_count) || 0,
        parseInt(dead_count) || 0,
        parseFloat(latitude) || null,
        parseFloat(longitude) || null,
      ]
    );

    // Historique
    await db.query(
      'INSERT INTO cohrm_rumor_history (rumor_id, user_id, action, details) VALUES (?, NULL, ?, ?)',
      [result.insertId, 'public_submission', JSON.stringify({ source: 'web', phone: reporter_phone })]
    );

    res.json({ success: true, code, message: 'Signalement enregistré avec succès' });
  } catch (error) {
    console.error('Public report error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'enregistrement' });
  }
});

// GET /api/cohrm/public/track/:code - Suivi de rumeur par code
router.get('/public/track/:code', async (req, res) => {
  try {
    const [[rumor]] = await db.query(
      'SELECT code, status, priority, created_at, updated_at FROM cohrm_rumors WHERE code = ?',
      [req.params.code]
    );
    if (!rumor) {
      return res.status(404).json({ success: false, message: 'Code de suivi non trouvé' });
    }
    res.json({ success: true, data: rumor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/cohrm/public/regions - Liste des régions (sans auth)
router.get('/public/regions', async (req, res) => {
  res.json({
    success: true,
    data: [
      { code: 'AD', name: 'Adamaoua' },
      { code: 'CE', name: 'Centre' },
      { code: 'ES', name: 'Est' },
      { code: 'EN', name: 'Extrême-Nord' },
      { code: 'LT', name: 'Littoral' },
      { code: 'NO', name: 'Nord' },
      { code: 'NW', name: 'Nord-Ouest' },
      { code: 'OU', name: 'Ouest' },
      { code: 'SU', name: 'Sud' },
      { code: 'SW', name: 'Sud-Ouest' },
    ],
  });
});

// ============================================
// RAPPORTS AVANCÉS
// ============================================

// GET /api/cohrm/reports/summary
router.get('/reports/summary', auth, async (req, res) => {
  try {
    const { date_from, date_to, region, group_by = 'day' } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (date_from) { whereClause += ' AND DATE(created_at) >= ?'; params.push(date_from); }
    if (date_to) { whereClause += ' AND DATE(created_at) <= ?'; params.push(date_to); }
    if (region) { whereClause += ' AND region = ?'; params.push(region); }

    const [[totals]] = await db.query(
      `SELECT COUNT(*) as total,
        SUM(status = 'pending') as pending,
        SUM(status = 'investigating') as investigating,
        SUM(status = 'confirmed') as confirmed,
        SUM(status = 'false_alarm') as false_alarm,
        SUM(status = 'closed') as closed,
        SUM(priority = 'critical') as critical,
        SUM(priority = 'high') as high,
        SUM(risk_level = 'high' OR risk_level = 'very_high') as high_risk
      FROM cohrm_rumors ${whereClause}`, params
    );

    // Par statut
    const [byStatus] = await db.query(
      `SELECT status, COUNT(*) as count FROM cohrm_rumors ${whereClause} GROUP BY status`, params
    );

    // Par priorité
    const [byPriority] = await db.query(
      `SELECT priority, COUNT(*) as count FROM cohrm_rumors ${whereClause} GROUP BY priority`, params
    );

    // Par source
    const [bySource] = await db.query(
      `SELECT source, COUNT(*) as count FROM cohrm_rumors ${whereClause} GROUP BY source`, params
    );

    // Par catégorie
    const [byCategory] = await db.query(
      `SELECT category, COUNT(*) as count FROM cohrm_rumors ${whereClause} GROUP BY category`, params
    );

    // Par région
    const [byRegion] = await db.query(
      `SELECT region, COUNT(*) as count FROM cohrm_rumors ${whereClause} GROUP BY region ORDER BY count DESC`, params
    );

    // Par risque
    const [byRisk] = await db.query(
      `SELECT risk_level, COUNT(*) as count FROM cohrm_rumors ${whereClause} GROUP BY risk_level`, params
    );

    // Temps moyen de résolution
    const [[avgTime]] = await db.query(
      `SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, closed_at)) as avg_hours
       FROM cohrm_rumors ${whereClause} AND closed_at IS NOT NULL`, params
    );

    res.json({
      success: true,
      data: {
        totals, byStatus, byPriority, bySource, byCategory, byRegion, byRisk,
        avgResolutionHours: Math.round(avgTime?.avg_hours || 0),
      },
    });
  } catch (error) {
    console.error('Report summary error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/cohrm/reports/trends
router.get('/reports/trends', auth, async (req, res) => {
  try {
    const { date_from, date_to, region, group_by = 'day' } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];
    if (date_from) { whereClause += ' AND DATE(created_at) >= ?'; params.push(date_from); }
    if (date_to) { whereClause += ' AND DATE(created_at) <= ?'; params.push(date_to); }
    if (region) { whereClause += ' AND region = ?'; params.push(region); }

    const dateFormat = group_by === 'month' ? '%Y-%m' : group_by === 'week' ? '%Y-%u' : '%Y-%m-%d';

    const [created] = await db.query(
      `SELECT DATE_FORMAT(created_at, '${dateFormat}') as period, COUNT(*) as count
       FROM cohrm_rumors ${whereClause} GROUP BY period ORDER BY period`, params
    );

    const [resolved] = await db.query(
      `SELECT DATE_FORMAT(closed_at, '${dateFormat}') as period, COUNT(*) as count
       FROM cohrm_rumors ${whereClause} AND closed_at IS NOT NULL
       GROUP BY period ORDER BY period`, params
    );

    res.json({ success: true, data: { created, resolved } });
  } catch (error) {
    console.error('Report trends error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/cohrm/reports/geographic
router.get('/reports/geographic', auth, async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    let whereClause = 'WHERE 1=1';
    const params = [];
    if (date_from) { whereClause += ' AND DATE(created_at) >= ?'; params.push(date_from); }
    if (date_to) { whereClause += ' AND DATE(created_at) <= ?'; params.push(date_to); }

    const [byRegion] = await db.query(
      `SELECT region, COUNT(*) as count,
        SUM(status = 'confirmed') as confirmed,
        SUM(priority = 'critical' OR priority = 'high') as high_priority,
        SUM(risk_level = 'high' OR risk_level = 'very_high') as high_risk
       FROM cohrm_rumors ${whereClause} AND region IS NOT NULL AND region != ''
       GROUP BY region ORDER BY count DESC`, params
    );

    const [byDistrict] = await db.query(
      `SELECT region, district, COUNT(*) as count
       FROM cohrm_rumors ${whereClause} AND district IS NOT NULL AND district != ''
       GROUP BY region, district ORDER BY count DESC LIMIT 20`, params
    );

    res.json({ success: true, data: { byRegion, byDistrict } });
  } catch (error) {
    console.error('Report geographic error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/cohrm/reports/performance
router.get('/reports/performance', auth, async (req, res) => {
  try {
    const { date_from, date_to, region } = req.query;
    let whereClause = 'WHERE 1=1';
    const params = [];
    if (date_from) { whereClause += ' AND DATE(r.created_at) >= ?'; params.push(date_from); }
    if (date_to) { whereClause += ' AND DATE(r.created_at) <= ?'; params.push(date_to); }
    if (region) { whereClause += ' AND r.region = ?'; params.push(region); }

    // Temps moyen première validation
    const [[firstValidation]] = await db.query(
      `SELECT AVG(TIMESTAMPDIFF(HOUR, r.created_at, v.validated_at)) as avg_hours
       FROM cohrm_rumors r
       INNER JOIN cohrm_validations v ON v.rumor_id = r.id AND v.level = 1 AND v.status = 'validated'
       ${whereClause}`, params
    );

    // Temps moyen de clôture
    const [[closeTime]] = await db.query(
      `SELECT AVG(TIMESTAMPDIFF(HOUR, r.created_at, r.closed_at)) as avg_hours
       FROM cohrm_rumors r ${whereClause} AND r.closed_at IS NOT NULL`, params
    );

    // Charge par acteur
    const [actorWorkload] = await db.query(
      `SELECT a.id, CONCAT(u.first_name, ' ', u.last_name) as name, a.actor_level,
        COUNT(v.id) as validations_count
       FROM cohrm_actors a
       LEFT JOIN users u ON a.user_id = u.id
       LEFT JOIN cohrm_validations v ON v.actor_id = a.id
       WHERE a.is_active = 1
       GROUP BY a.id ORDER BY validations_count DESC LIMIT 15`
    );

    res.json({
      success: true,
      data: {
        avgFirstValidationHours: Math.round(firstValidation?.avg_hours || 0),
        avgCloseTimeHours: Math.round(closeTime?.avg_hours || 0),
        actorWorkload,
      },
    });
  } catch (error) {
    console.error('Report performance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/cohrm/reports/epidemiological
router.get('/reports/epidemiological', auth, async (req, res) => {
  try {
    const { date_from, date_to, category, region, department, district, granularity } = req.query;
    let whereClause = 'WHERE 1=1';
    const params = [];
    if (date_from) { whereClause += ' AND DATE(created_at) >= ?'; params.push(date_from); }
    if (date_to) { whereClause += ' AND DATE(created_at) <= ?'; params.push(date_to); }
    if (category) { whereClause += ' AND category = ?'; params.push(category); }
    if (region) { whereClause += ' AND region = ?'; params.push(region); }
    if (department) { whereClause += ' AND department = ?'; params.push(department); }
    if (district) { whereClause += ' AND district = ?'; params.push(district); }

    // Date grouping expression based on granularity
    let dateExpr = 'DATE(created_at)';
    if (granularity === 'week') dateExpr = "DATE_FORMAT(created_at, '%x-W%v')";
    else if (granularity === 'month') dateExpr = "DATE_FORMAT(created_at, '%Y-%m')";

    const [bySpecies] = await db.query(
      `SELECT species, COUNT(*) as count, SUM(affected_count) as total_affected, SUM(dead_count) as total_dead
       FROM cohrm_rumors ${whereClause} AND species IS NOT NULL AND species != ''
       GROUP BY species ORDER BY count DESC`, params
    );

    const [byCategory] = await db.query(
      `SELECT category, COUNT(*) as count FROM cohrm_rumors ${whereClause} GROUP BY category`, params
    );

    // Courbe épidémique (grouped by date + category for stacked view)
    const [epiCurve] = await db.query(
      `SELECT ${dateExpr} as date, COUNT(*) as count, category
       FROM cohrm_rumors ${whereClause}
       GROUP BY ${dateExpr}, category ORDER BY date`, params
    );

    // Distribution par priorité
    const [byPriority] = await db.query(
      `SELECT COALESCE(priority, 'unknown') as priority, COUNT(*) as count
       FROM cohrm_rumors ${whereClause} GROUP BY priority`, params
    );

    // Distribution par source
    const [bySource] = await db.query(
      `SELECT COALESCE(source, 'unknown') as source, COUNT(*) as count
       FROM cohrm_rumors ${whereClause} GROUP BY source`, params
    );

    // Distribution par statut
    const [byStatus] = await db.query(
      `SELECT COALESCE(status, 'unknown') as status, COUNT(*) as count
       FROM cohrm_rumors ${whereClause} GROUP BY status`, params
    );

    // Départements et districts disponibles (pour filtres dynamiques)
    const [departments] = await db.query(
      `SELECT DISTINCT department FROM cohrm_rumors WHERE department IS NOT NULL AND department != '' ORDER BY department`
    );
    const [districts] = await db.query(
      `SELECT DISTINCT district FROM cohrm_rumors WHERE district IS NOT NULL AND district != '' ORDER BY district`
    );

    res.json({
      success: true,
      data: {
        bySpecies, byCategory, epiCurve, byPriority, bySource, byStatus,
        departments: departments.map(d => d.department),
        districts: districts.map(d => d.district),
      },
    });
  } catch (error) {
    console.error('Epi report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// SCANNER WEB AVANCÉ
// ============================================

// GET /api/cohrm/scanner/sources
router.get('/scanner/sources', auth, async (req, res) => {
  try {
    const [sources] = await db.query(
      'SELECT * FROM cohrm_scan_sources WHERE 1=1 ORDER BY created_at DESC'
    );
    res.json({ success: true, data: sources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/cohrm/scanner/sources
router.post('/scanner/sources', auth, async (req, res) => {
  try {
    const { name, url, type = 'news', language = 'fr', scan_frequency_hours = 24 } = req.body;
    if (!name || !url) return res.status(400).json({ success: false, message: 'Nom et URL requis' });

    const [result] = await db.query(
      'INSERT INTO cohrm_scan_sources (name, url, type, language, scan_frequency_hours) VALUES (?, ?, ?, ?, ?)',
      [name, url, type, language, scan_frequency_hours]
    );
    res.json({ success: true, data: { id: result.insertId }, message: 'Source ajoutée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/cohrm/scanner/sources/:id
router.put('/scanner/sources/:id', auth, async (req, res) => {
  try {
    const { name, url, type, language, scan_frequency_hours, is_active } = req.body;
    await db.query(
      `UPDATE cohrm_scan_sources SET name = COALESCE(?, name), url = COALESCE(?, url),
       type = COALESCE(?, type), language = COALESCE(?, language),
       scan_frequency_hours = COALESCE(?, scan_frequency_hours), is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [name, url, type, language, scan_frequency_hours, is_active, req.params.id]
    );
    res.json({ success: true, message: 'Source mise à jour' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/cohrm/scanner/sources/:id
router.delete('/scanner/sources/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM cohrm_scan_sources WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Source supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/cohrm/scanner/keywords
router.get('/scanner/keywords', auth, async (req, res) => {
  try {
    const [keywords] = await db.query('SELECT * FROM cohrm_scan_keywords ORDER BY category, keyword');
    res.json({ success: true, data: keywords });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/cohrm/scanner/keywords
router.post('/scanner/keywords', auth, async (req, res) => {
  try {
    const { keyword, category, weight = 1, language = 'fr' } = req.body;
    if (!keyword || !category) return res.status(400).json({ success: false, message: 'Mot-clé et catégorie requis' });

    const [result] = await db.query(
      'INSERT INTO cohrm_scan_keywords (keyword, category, weight, language) VALUES (?, ?, ?, ?)',
      [keyword, category, weight, language]
    );
    res.json({ success: true, data: { id: result.insertId }, message: 'Mot-clé ajouté' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/cohrm/scanner/keywords/:id
router.delete('/scanner/keywords/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM cohrm_scan_keywords WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Mot-clé supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/cohrm/scanner/results
router.get('/scanner/results', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, source_id, min_relevance } = req.query;
    let query = 'SELECT sr.*, ss.name as source_name FROM cohrm_scan_results sr LEFT JOIN cohrm_scan_sources ss ON sr.source_id = ss.id WHERE 1=1';
    const params = [];

    if (status) { query += ' AND sr.status = ?'; params.push(status); }
    if (source_id) { query += ' AND sr.source_id = ?'; params.push(source_id); }
    if (min_relevance) { query += ' AND sr.relevance_score >= ?'; params.push(parseInt(min_relevance)); }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    query += ' ORDER BY sr.relevance_score DESC, sr.created_at DESC LIMIT ? OFFSET ?';
    params.push(limitNum, (pageNum - 1) * limitNum);

    const [results] = await db.query(query, params);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/cohrm/scanner/results/:id/review
router.put('/scanner/results/:id/review', auth, async (req, res) => {
  try {
    const { status } = req.body;
    await db.query(
      'UPDATE cohrm_scan_results SET status = ?, reviewed_by = ? WHERE id = ?',
      [status, req.user.id, req.params.id]
    );
    res.json({ success: true, message: 'Résultat mis à jour' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/cohrm/scanner/results/:id/convert - Convertir en rumeur
router.post('/scanner/results/:id/convert', auth, async (req, res) => {
  try {
    const [[scanResult]] = await db.query('SELECT * FROM cohrm_scan_results WHERE id = ?', [req.params.id]);
    if (!scanResult) return res.status(404).json({ success: false, message: 'Résultat non trouvé' });

    const code = generateRumorCode();
    const title = req.body.title || scanResult.title;
    const description = req.body.description || scanResult.content;

    const [result] = await db.query(
      `INSERT INTO cohrm_rumors (code, title, description, source, source_details, status, priority, reported_by)
       VALUES (?, ?, ?, 'scanner', ?, 'pending', 'medium', ?)`,
      [code, title, description, scanResult.url, req.user.id]
    );

    await db.query(
      'UPDATE cohrm_scan_results SET status = ?, rumor_id = ? WHERE id = ?',
      ['converted', result.insertId, req.params.id]
    );

    res.json({ success: true, data: { rumorId: result.insertId, code }, message: 'Converti en rumeur' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
