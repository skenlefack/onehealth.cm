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
    const offset = (page - 1) * limit;
    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

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
      photos
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
        device_id, created_at
      ) VALUES (?, ?, ?, 'mobile', ?, ?, ?, ?, ?, ?, ?, ?, 'medium', 'pending', ?, ?, 'agent', ?, NOW())
    `, [
      code, title, description, device_id,
      region, location, latitude, longitude,
      species, symptoms, affected_count,
      reporter_name, reporter_phone, device_id
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

    // Récupérer les résultats du scan
    const [results] = await db.query(`
      SELECT * FROM cohrm_scan_results
      WHERE scan_id = ?
      ORDER BY created_at DESC
    `, [req.params.id]);

    res.json({
      success: true,
      data: {
        ...scans[0],
        results
      }
    });
  } catch (error) {
    console.error('Get scan details error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/cohrm/scan/run - Lancer un scan manuel
router.post('/scan/run', auth, async (req, res) => {
  try {
    const { source = 'all', keywords } = req.body;

    // Récupérer les paramètres de scan depuis les settings
    const [settings] = await db.query(
      "SELECT value FROM cohrm_settings WHERE `key` = 'web_scanner_keywords'"
    );

    const scanKeywords = keywords || (settings.length > 0 ? JSON.parse(settings[0].value) : [
      'épidémie', 'maladie', 'mort', 'grippe aviaire', 'choléra', 'fièvre', 'zoonose'
    ]);

    // Créer l'entrée du scan
    const [result] = await db.query(`
      INSERT INTO cohrm_web_scans (
        source, status, keywords, started_at, created_at
      ) VALUES (?, 'running', ?, NOW(), NOW())
    `, [source, JSON.stringify(scanKeywords)]);

    const scanId = result.insertId;

    // Simuler un scan (dans une vraie implémentation, cela serait un job asynchrone)
    // Pour l'instant, on simule juste des résultats
    setTimeout(async () => {
      try {
        // Simuler des résultats de scan
        const itemsScanned = Math.floor(Math.random() * 100) + 50;
        const rumorsFound = Math.floor(Math.random() * 5);
        const rumorsCreated = Math.floor(rumorsFound * 0.6);
        const duration = Math.floor(Math.random() * 30) + 10;

        // Mettre à jour le scan avec les résultats
        await db.query(`
          UPDATE cohrm_web_scans
          SET status = 'completed',
              items_scanned = ?,
              rumors_found = ?,
              rumors_created = ?,
              duration = ?,
              completed_at = NOW()
          WHERE id = ?
        `, [itemsScanned, rumorsFound, rumorsCreated, duration, scanId]);

        // Si des rumeurs ont été trouvées, créer des entrées de résultat
        for (let i = 0; i < rumorsFound; i++) {
          await db.query(`
            INSERT INTO cohrm_scan_results (
              scan_id, title, url, source, matched_keywords, relevance_score, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW())
          `, [
            scanId,
            `Alerte sanitaire détectée #${i + 1}`,
            `https://example.com/article/${Date.now()}`,
            source === 'all' ? ['twitter', 'facebook', 'news'][Math.floor(Math.random() * 3)] : source,
            JSON.stringify(scanKeywords.slice(0, 2)),
            (Math.random() * 0.5 + 0.5).toFixed(2)
          ]);
        }
      } catch (err) {
        console.error('Scan completion error:', err);
        await db.query(`
          UPDATE cohrm_web_scans
          SET status = 'failed', error_message = ?
          WHERE id = ?
        `, [err.message, scanId]);
      }
    }, 5000); // Simule un scan de 5 secondes

    res.json({
      success: true,
      message: 'Scan lancé avec succès',
      data: { scan_id: scanId }
    });
  } catch (error) {
    console.error('Run scan error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
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

    // Si le canal est SMS ou email, simuler l'envoi
    // TODO: Intégrer avec un vrai service SMS/email
    if (channel === 'sms' || channel === 'email') {
      // Simuler l'envoi
      await db.query(`
        UPDATE cohrm_feedback
        SET status = 'sent', sent_at = NOW()
        WHERE id = ?
      `, [result.insertId]);
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

module.exports = router;
