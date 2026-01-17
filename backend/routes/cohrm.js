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
        u.name as assigned_user_name,
        reporter.name as reporter_name
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
    const countQuery = query.replace('SELECT r.*, u.name as assigned_user_name, reporter.name as reporter_name', 'SELECT COUNT(*) as total');
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
        u.name as assigned_user_name,
        reporter.name as reporter_name
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
      SELECT h.*, u.name as user_name
      FROM cohrm_rumor_history h
      LEFT JOIN users u ON h.user_id = u.id
      WHERE h.rumor_id = ?
      ORDER BY h.created_at DESC
    `, [req.params.id]);

    // Notes
    const [notes] = await db.query(`
      SELECT n.*, u.name as user_name
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

module.exports = router;
