/**
 * NEWSLETTER MODULE API ROUTES
 * One Health CMS
 *
 * Routes pour la gestion de newsletter:
 * - Abonnements publics (inscription, confirmation, desabonnement)
 * - Tracking (ouvertures, clics)
 * - Administration (listes, abonnes, templates, campagnes)
 * - Statistiques
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, authorize, optionalAuth } = require('../middleware/auth');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// ============================================
// HELPERS
// ============================================

const generateToken = () => crypto.randomBytes(32).toString('hex');
const generateCode = () => crypto.randomBytes(6).toString('hex').toUpperCase();

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .substring(0, 100);
};

// Get newsletter settings
const getNewsletterSettings = async () => {
  const [rows] = await db.query('SELECT `key`, value FROM newsletter_settings');
  const settings = {};
  rows.forEach(row => {
    try {
      settings[row.key] = JSON.parse(row.value);
    } catch {
      settings[row.key] = row.value;
    }
  });
  return settings;
};

// Update subscriber count for a list
const updateListSubscriberCount = async (listId) => {
  await db.query(`
    UPDATE newsletter_lists
    SET subscriber_count = (
      SELECT COUNT(DISTINCT sl.subscriber_id)
      FROM newsletter_subscriber_lists sl
      JOIN newsletter_subscribers s ON sl.subscriber_id = s.id
      WHERE sl.list_id = ? AND sl.is_active = 1 AND s.status = 'active'
    )
    WHERE id = ?
  `, [listId, listId]);
};

// Parse user agent for device type
const getDeviceType = (userAgent) => {
  if (!userAgent) return 'unknown';
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
    if (/tablet|ipad/i.test(ua)) return 'tablet';
    return 'mobile';
  }
  return 'desktop';
};

// ============================================
// PUBLIC ROUTES - No auth required
// ============================================

// POST /api/newsletter/subscribe - Public subscription
router.post('/subscribe', async (req, res) => {
  try {
    const { email, first_name, last_name, language = 'fr', list_slug } = req.body;

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({
        success: false,
        message: language === 'fr' ? 'Email invalide' : 'Invalid email'
      });
    }

    const settings = await getNewsletterSettings();
    const doubleOptin = settings.double_optin_enabled !== false;

    // Check if subscriber exists
    const [existing] = await db.query(
      'SELECT id, status, confirmation_token FROM newsletter_subscribers WHERE email = ?',
      [email.toLowerCase()]
    );

    let subscriberId;
    let isNew = false;
    let needsConfirmation = doubleOptin;

    if (existing.length > 0) {
      const subscriber = existing[0];
      subscriberId = subscriber.id;

      if (subscriber.status === 'active') {
        return res.json({
          success: true,
          message: language === 'fr'
            ? 'Vous etes deja inscrit a notre newsletter'
            : 'You are already subscribed to our newsletter',
          already_subscribed: true
        });
      }

      if (subscriber.status === 'unsubscribed') {
        // Reactivate
        const confirmationToken = generateToken();
        await db.query(`
          UPDATE newsletter_subscribers
          SET status = ?, confirmation_token = ?, first_name = COALESCE(?, first_name),
              last_name = COALESCE(?, last_name), language = ?, updated_at = NOW()
          WHERE id = ?
        `, [doubleOptin ? 'pending' : 'active', confirmationToken, first_name, last_name, language, subscriberId]);

        if (!doubleOptin) {
          await db.query('UPDATE newsletter_subscribers SET confirmed_at = NOW() WHERE id = ?', [subscriberId]);
        }
      } else if (subscriber.status === 'pending') {
        // Resend confirmation
        needsConfirmation = true;
      }
    } else {
      // New subscriber
      isNew = true;
      const confirmationToken = generateToken();
      const unsubscribeToken = generateToken();

      const [result] = await db.query(`
        INSERT INTO newsletter_subscribers
        (email, first_name, last_name, language, source, confirmation_token, unsubscribe_token, status, ip_address, user_agent)
        VALUES (?, ?, ?, ?, 'form', ?, ?, ?, ?, ?)
      `, [
        email.toLowerCase(),
        first_name || null,
        last_name || null,
        language,
        confirmationToken,
        unsubscribeToken,
        doubleOptin ? 'pending' : 'active',
        req.ip,
        req.headers['user-agent']
      ]);

      subscriberId = result.insertId;

      if (!doubleOptin) {
        await db.query('UPDATE newsletter_subscribers SET confirmed_at = NOW() WHERE id = ?', [subscriberId]);
      }
    }

    // Add to list
    let listId;
    if (list_slug) {
      const [lists] = await db.query('SELECT id FROM newsletter_lists WHERE slug = ?', [list_slug]);
      if (lists.length > 0) listId = lists[0].id;
    }
    if (!listId) {
      const [defaultList] = await db.query('SELECT id FROM newsletter_lists WHERE is_default = 1 LIMIT 1');
      if (defaultList.length > 0) listId = defaultList[0].id;
    }

    if (listId) {
      await db.query(`
        INSERT INTO newsletter_subscriber_lists (subscriber_id, list_id, is_active)
        VALUES (?, ?, 1)
        ON DUPLICATE KEY UPDATE is_active = 1, subscribed_at = NOW()
      `, [subscriberId, listId]);

      await updateListSubscriberCount(listId);
    }

    // Log activity
    await db.query(`
      INSERT INTO newsletter_activity_log (subscriber_id, action, details, ip_address)
      VALUES (?, 'subscribe', ?, ?)
    `, [subscriberId, JSON.stringify({ list_id: listId, is_new: isNew }), req.ip]);

    // TODO: Send confirmation email if double opt-in enabled
    // This would be handled by newsletterEmailService

    res.status(201).json({
      success: true,
      message: needsConfirmation
        ? (language === 'fr'
            ? 'Veuillez verifier votre email pour confirmer votre inscription'
            : 'Please check your email to confirm your subscription')
        : (language === 'fr'
            ? 'Inscription reussie!'
            : 'Successfully subscribed!'),
      needs_confirmation: needsConfirmation
    });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/newsletter/confirm/:token - Confirm subscription
router.get('/confirm/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const [subscribers] = await db.query(
      'SELECT id, email, language FROM newsletter_subscribers WHERE confirmation_token = ? AND status = "pending"',
      [token]
    );

    if (subscribers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lien invalide ou expir\u00e9'
      });
    }

    const subscriber = subscribers[0];

    await db.query(`
      UPDATE newsletter_subscribers
      SET status = 'active', confirmed_at = NOW(), confirmation_token = NULL
      WHERE id = ?
    `, [subscriber.id]);

    // Update list counts
    const [lists] = await db.query(
      'SELECT list_id FROM newsletter_subscriber_lists WHERE subscriber_id = ?',
      [subscriber.id]
    );
    for (const list of lists) {
      await updateListSubscriberCount(list.list_id);
    }

    // Log activity
    await db.query(`
      INSERT INTO newsletter_activity_log (subscriber_id, action, ip_address)
      VALUES (?, 'confirm', ?)
    `, [subscriber.id, req.ip]);

    res.json({
      success: true,
      message: subscriber.language === 'fr'
        ? 'Votre inscription est confirmee!'
        : 'Your subscription is confirmed!',
      email: subscriber.email
    });
  } catch (error) {
    console.error('Newsletter confirm error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/newsletter/unsubscribe - Unsubscribe
router.post('/unsubscribe', async (req, res) => {
  try {
    const { token, email, reason } = req.body;

    let subscriber;
    if (token) {
      const [rows] = await db.query(
        'SELECT id, email, language FROM newsletter_subscribers WHERE unsubscribe_token = ?',
        [token]
      );
      if (rows.length > 0) subscriber = rows[0];
    } else if (email) {
      const [rows] = await db.query(
        'SELECT id, email, language FROM newsletter_subscribers WHERE email = ?',
        [email.toLowerCase()]
      );
      if (rows.length > 0) subscriber = rows[0];
    }

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Abonne non trouve'
      });
    }

    await db.query(`
      UPDATE newsletter_subscribers
      SET status = 'unsubscribed', updated_at = NOW()
      WHERE id = ?
    `, [subscriber.id]);

    // Deactivate from all lists
    const [lists] = await db.query(
      'SELECT list_id FROM newsletter_subscriber_lists WHERE subscriber_id = ?',
      [subscriber.id]
    );

    await db.query(
      'UPDATE newsletter_subscriber_lists SET is_active = 0 WHERE subscriber_id = ?',
      [subscriber.id]
    );

    for (const list of lists) {
      await updateListSubscriberCount(list.list_id);
    }

    // Log activity
    await db.query(`
      INSERT INTO newsletter_activity_log (subscriber_id, action, details, ip_address)
      VALUES (?, 'unsubscribe', ?, ?)
    `, [subscriber.id, JSON.stringify({ reason }), req.ip]);

    res.json({
      success: true,
      message: subscriber.language === 'fr'
        ? 'Vous avez ete desabonne avec succes'
        : 'You have been successfully unsubscribed'
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/newsletter/track/open/:newsletterId/:subscriberId - Track email open
router.get('/track/open/:newsletterId/:subscriberId', async (req, res) => {
  try {
    const { newsletterId, subscriberId } = req.params;

    // Record tracking
    await db.query(`
      INSERT INTO newsletter_tracking (newsletter_id, subscriber_id, tracking_type, ip_address, user_agent, device_type)
      VALUES (?, ?, 'open', ?, ?, ?)
    `, [newsletterId, subscriberId, req.ip, req.headers['user-agent'], getDeviceType(req.headers['user-agent'])]);

    // Update stats
    await db.query('UPDATE newsletters SET open_count = open_count + 1 WHERE id = ?', [newsletterId]);
    await db.query('UPDATE newsletter_subscribers SET emails_opened = emails_opened + 1, last_open_at = NOW() WHERE id = ?', [subscriberId]);

    // Check for unique open
    const [existingOpens] = await db.query(
      'SELECT id FROM newsletter_tracking WHERE newsletter_id = ? AND subscriber_id = ? AND tracking_type = "open" LIMIT 2',
      [newsletterId, subscriberId]
    );
    if (existingOpens.length === 1) {
      await db.query('UPDATE newsletters SET unique_open_count = unique_open_count + 1 WHERE id = ?', [newsletterId]);
    }

    // Return 1x1 transparent pixel
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.send(pixel);
  } catch (error) {
    console.error('Track open error:', error);
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.setHeader('Content-Type', 'image/gif');
    res.send(pixel);
  }
});

// GET /api/newsletter/track/click/:code - Track link click
router.get('/track/click/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { s: subscriberId, n: newsletterId } = req.query;

    // Get original URL
    const [links] = await db.query(
      'SELECT id, original_url FROM newsletter_links WHERE tracking_code = ?',
      [code]
    );

    if (links.length === 0) {
      return res.redirect(process.env.FRONTEND_URL || '/');
    }

    const link = links[0];

    // Record tracking if subscriber info provided
    if (subscriberId && newsletterId) {
      await db.query(`
        INSERT INTO newsletter_tracking (newsletter_id, subscriber_id, tracking_type, link_url, link_code, ip_address, user_agent, device_type)
        VALUES (?, ?, 'click', ?, ?, ?, ?, ?)
      `, [newsletterId, subscriberId, link.original_url, code, req.ip, req.headers['user-agent'], getDeviceType(req.headers['user-agent'])]);

      // Update stats
      await db.query('UPDATE newsletters SET click_count = click_count + 1 WHERE id = ?', [newsletterId]);
      await db.query('UPDATE newsletter_links SET click_count = click_count + 1 WHERE id = ?', [link.id]);
      await db.query('UPDATE newsletter_subscribers SET emails_clicked = emails_clicked + 1, last_click_at = NOW() WHERE id = ?', [subscriberId]);

      // Check for unique click
      const [existingClicks] = await db.query(
        'SELECT id FROM newsletter_tracking WHERE newsletter_id = ? AND subscriber_id = ? AND tracking_type = "click" AND link_code = ? LIMIT 2',
        [newsletterId, subscriberId, code]
      );
      if (existingClicks.length === 1) {
        await db.query('UPDATE newsletters SET unique_click_count = unique_click_count + 1 WHERE id = ?', [newsletterId]);
        await db.query('UPDATE newsletter_links SET unique_click_count = unique_click_count + 1 WHERE id = ?', [link.id]);
      }
    }

    res.redirect(link.original_url);
  } catch (error) {
    console.error('Track click error:', error);
    res.redirect(process.env.FRONTEND_URL || '/');
  }
});

// ============================================
// ADMIN ROUTES - Auth required
// ============================================

// ------------------------------------
// STATISTICS
// ------------------------------------

// GET /api/newsletter/stats - Dashboard statistics
router.get('/stats', auth, async (req, res) => {
  try {
    // Total subscribers by status
    const [[subscriberStats]] = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(status = 'active') as active,
        SUM(status = 'pending') as pending,
        SUM(status = 'unsubscribed') as unsubscribed
      FROM newsletter_subscribers
    `);

    // Total campaigns
    const [[campaignStats]] = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(status = 'sent') as sent,
        SUM(status = 'draft') as draft,
        SUM(status = 'scheduled') as scheduled
      FROM newsletters
    `);

    // Last 30 days growth
    const [growthData] = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM newsletter_subscribers
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Average open/click rates
    const [[avgRates]] = await db.query(`
      SELECT
        AVG(CASE WHEN total_recipients > 0 THEN (unique_open_count / total_recipients) * 100 ELSE 0 END) as avg_open_rate,
        AVG(CASE WHEN total_recipients > 0 THEN (unique_click_count / total_recipients) * 100 ELSE 0 END) as avg_click_rate
      FROM newsletters
      WHERE status = 'sent' AND total_recipients > 0
    `);

    // Top campaigns
    const [topCampaigns] = await db.query(`
      SELECT id, name, subject_fr, sent_at, total_recipients, unique_open_count, unique_click_count
      FROM newsletters
      WHERE status = 'sent'
      ORDER BY unique_open_count DESC
      LIMIT 5
    `);

    // Recent activity
    const [recentActivity] = await db.query(`
      SELECT al.*, s.email, n.name as newsletter_name
      FROM newsletter_activity_log al
      LEFT JOIN newsletter_subscribers s ON al.subscriber_id = s.id
      LEFT JOIN newsletters n ON al.newsletter_id = n.id
      ORDER BY al.created_at DESC
      LIMIT 20
    `);

    // Subscribers by language
    const [byLanguage] = await db.query(`
      SELECT language, COUNT(*) as count
      FROM newsletter_subscribers
      WHERE status = 'active'
      GROUP BY language
    `);

    res.json({
      success: true,
      data: {
        subscribers: subscriberStats,
        campaigns: campaignStats,
        growth: growthData,
        avgOpenRate: avgRates.avg_open_rate || 0,
        avgClickRate: avgRates.avg_click_rate || 0,
        topCampaigns,
        recentActivity,
        byLanguage
      }
    });
  } catch (error) {
    console.error('Get newsletter stats error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ------------------------------------
// LISTS MANAGEMENT
// ------------------------------------

// GET /api/newsletter/lists - Get all lists
router.get('/lists', auth, async (req, res) => {
  try {
    const [lists] = await db.query(`
      SELECT l.*,
        (SELECT COUNT(*) FROM newsletter_subscriber_lists sl
         JOIN newsletter_subscribers s ON sl.subscriber_id = s.id
         WHERE sl.list_id = l.id AND sl.is_active = 1 AND s.status = 'active') as active_subscribers
      FROM newsletter_lists l
      ORDER BY l.is_default DESC, l.name ASC
    `);

    res.json({ success: true, data: lists });
  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/newsletter/lists - Create list
router.post('/lists', auth, async (req, res) => {
  try {
    const { name, description, color, is_public, double_optin, welcome_email_enabled } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Nom requis' });
    }

    const slug = slugify(name) + '-' + Date.now().toString(36);

    const [result] = await db.query(`
      INSERT INTO newsletter_lists (name, slug, description, color, is_public, double_optin, welcome_email_enabled)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [name, slug, description, color || '#27AE60', is_public !== false, double_optin !== false, welcome_email_enabled !== false]);

    res.status(201).json({
      success: true,
      message: 'Liste creee',
      data: { id: result.insertId, slug }
    });
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/newsletter/lists/:id - Update list
router.put('/lists/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, is_public, is_default, double_optin, welcome_email_enabled } = req.body;

    // If setting as default, unset other defaults
    if (is_default) {
      await db.query('UPDATE newsletter_lists SET is_default = 0');
    }

    await db.query(`
      UPDATE newsletter_lists SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        color = COALESCE(?, color),
        is_public = COALESCE(?, is_public),
        is_default = COALESCE(?, is_default),
        double_optin = COALESCE(?, double_optin),
        welcome_email_enabled = COALESCE(?, welcome_email_enabled)
      WHERE id = ?
    `, [name, description, color, is_public, is_default, double_optin, welcome_email_enabled, id]);

    res.json({ success: true, message: 'Liste mise a jour' });
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/newsletter/lists/:id - Delete list
router.delete('/lists/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if default
    const [list] = await db.query('SELECT is_default FROM newsletter_lists WHERE id = ?', [id]);
    if (list.length > 0 && list[0].is_default) {
      return res.status(400).json({ success: false, message: 'Impossible de supprimer la liste par defaut' });
    }

    await db.query('DELETE FROM newsletter_subscriber_lists WHERE list_id = ?', [id]);
    await db.query('DELETE FROM newsletter_lists WHERE id = ?', [id]);

    res.json({ success: true, message: 'Liste supprimee' });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ------------------------------------
// SUBSCRIBERS MANAGEMENT
// ------------------------------------

// GET /api/newsletter/subscribers - Get subscribers
router.get('/subscribers', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, list_id, language, search, sort = 'created_at', order = 'DESC' } = req.query;

    let query = `
      SELECT DISTINCT s.*,
        GROUP_CONCAT(DISTINCT l.name) as list_names
      FROM newsletter_subscribers s
      LEFT JOIN newsletter_subscriber_lists sl ON s.id = sl.subscriber_id AND sl.is_active = 1
      LEFT JOIN newsletter_lists l ON sl.list_id = l.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }

    if (list_id) {
      query += ' AND sl.list_id = ?';
      params.push(list_id);
    }

    if (language) {
      query += ' AND s.language = ?';
      params.push(language);
    }

    if (search) {
      query += ' AND (s.email LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' GROUP BY s.id';

    // Count total
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
    const [[{ total }]] = await db.query(countQuery, params);

    // Sorting & pagination
    const validSorts = ['created_at', 'email', 'first_name', 'emails_opened', 'emails_clicked'];
    const sortField = validSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY s.${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [subscribers] = await db.query(query, params);

    res.json({
      success: true,
      data: subscribers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/newsletter/subscribers - Add subscriber manually
router.post('/subscribers', auth, async (req, res) => {
  try {
    const { email, first_name, last_name, language, list_ids, status = 'active' } = req.body;

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ success: false, message: 'Email invalide' });
    }

    // Check if exists
    const [existing] = await db.query('SELECT id FROM newsletter_subscribers WHERE email = ?', [email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Cet email est deja inscrit' });
    }

    const unsubscribeToken = generateToken();

    const [result] = await db.query(`
      INSERT INTO newsletter_subscribers (email, first_name, last_name, language, source, unsubscribe_token, status, confirmed_at)
      VALUES (?, ?, ?, ?, 'admin', ?, ?, ?)
    `, [email.toLowerCase(), first_name, last_name, language || 'fr', unsubscribeToken, status, status === 'active' ? new Date() : null]);

    const subscriberId = result.insertId;

    // Add to lists
    if (list_ids && list_ids.length > 0) {
      for (const listId of list_ids) {
        await db.query(
          'INSERT INTO newsletter_subscriber_lists (subscriber_id, list_id) VALUES (?, ?)',
          [subscriberId, listId]
        );
        await updateListSubscriberCount(listId);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Abonne ajoute',
      data: { id: subscriberId }
    });
  } catch (error) {
    console.error('Add subscriber error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/newsletter/subscribers/:id - Update subscriber
router.put('/subscribers/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, language, status, list_ids } = req.body;

    await db.query(`
      UPDATE newsletter_subscribers SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        language = COALESCE(?, language),
        status = COALESCE(?, status)
      WHERE id = ?
    `, [first_name, last_name, language, status, id]);

    // Update lists if provided
    if (list_ids !== undefined) {
      // Get current lists
      const [currentLists] = await db.query(
        'SELECT list_id FROM newsletter_subscriber_lists WHERE subscriber_id = ?',
        [id]
      );
      const currentListIds = currentLists.map(l => l.list_id);

      // Remove from lists not in new list
      for (const listId of currentListIds) {
        if (!list_ids.includes(listId)) {
          await db.query(
            'DELETE FROM newsletter_subscriber_lists WHERE subscriber_id = ? AND list_id = ?',
            [id, listId]
          );
          await updateListSubscriberCount(listId);
        }
      }

      // Add to new lists
      for (const listId of list_ids) {
        if (!currentListIds.includes(listId)) {
          await db.query(
            'INSERT INTO newsletter_subscriber_lists (subscriber_id, list_id) VALUES (?, ?)',
            [id, listId]
          );
          await updateListSubscriberCount(listId);
        }
      }
    }

    res.json({ success: true, message: 'Abonne mis a jour' });
  } catch (error) {
    console.error('Update subscriber error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/newsletter/subscribers/:id - Delete subscriber
router.delete('/subscribers/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Get lists to update counts
    const [lists] = await db.query(
      'SELECT list_id FROM newsletter_subscriber_lists WHERE subscriber_id = ?',
      [id]
    );

    await db.query('DELETE FROM newsletter_tracking WHERE subscriber_id = ?', [id]);
    await db.query('DELETE FROM newsletter_queue WHERE subscriber_id = ?', [id]);
    await db.query('DELETE FROM newsletter_subscriber_lists WHERE subscriber_id = ?', [id]);
    await db.query('DELETE FROM newsletter_activity_log WHERE subscriber_id = ?', [id]);
    await db.query('DELETE FROM newsletter_subscribers WHERE id = ?', [id]);

    // Update list counts
    for (const list of lists) {
      await updateListSubscriberCount(list.list_id);
    }

    res.json({ success: true, message: 'Abonne supprime' });
  } catch (error) {
    console.error('Delete subscriber error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/newsletter/subscribers/import - Import CSV
router.post('/subscribers/import', auth, async (req, res) => {
  try {
    const { subscribers, list_id, skip_duplicates = true } = req.body;

    if (!subscribers || !Array.isArray(subscribers) || subscribers.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucun abonne a importer' });
    }

    let imported = 0;
    let skipped = 0;
    let errors = [];

    for (const sub of subscribers) {
      try {
        if (!sub.email || !sub.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          errors.push({ email: sub.email, error: 'Email invalide' });
          continue;
        }

        const [existing] = await db.query('SELECT id FROM newsletter_subscribers WHERE email = ?', [sub.email.toLowerCase()]);

        if (existing.length > 0) {
          if (skip_duplicates) {
            skipped++;
            continue;
          } else {
            // Update existing
            await db.query(`
              UPDATE newsletter_subscribers SET
                first_name = COALESCE(?, first_name),
                last_name = COALESCE(?, last_name),
                language = COALESCE(?, language)
              WHERE id = ?
            `, [sub.first_name, sub.last_name, sub.language, existing[0].id]);

            if (list_id) {
              await db.query(`
                INSERT INTO newsletter_subscriber_lists (subscriber_id, list_id)
                VALUES (?, ?) ON DUPLICATE KEY UPDATE is_active = 1
              `, [existing[0].id, list_id]);
            }
            imported++;
          }
        } else {
          const unsubscribeToken = generateToken();
          const [result] = await db.query(`
            INSERT INTO newsletter_subscribers (email, first_name, last_name, language, source, unsubscribe_token, status, confirmed_at)
            VALUES (?, ?, ?, ?, 'import', ?, 'active', NOW())
          `, [sub.email.toLowerCase(), sub.first_name, sub.last_name, sub.language || 'fr', unsubscribeToken]);

          if (list_id) {
            await db.query(
              'INSERT INTO newsletter_subscriber_lists (subscriber_id, list_id) VALUES (?, ?)',
              [result.insertId, list_id]
            );
          }
          imported++;
        }
      } catch (err) {
        errors.push({ email: sub.email, error: err.message });
      }
    }

    if (list_id) {
      await updateListSubscriberCount(list_id);
    }

    res.json({
      success: true,
      message: `Import termine: ${imported} importes, ${skipped} ignores`,
      data: { imported, skipped, errors: errors.slice(0, 10) }
    });
  } catch (error) {
    console.error('Import subscribers error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/newsletter/subscribers/export - Export CSV
router.get('/subscribers/export', auth, async (req, res) => {
  try {
    const { list_id, status } = req.query;

    let query = `
      SELECT s.email, s.first_name, s.last_name, s.language, s.status, s.created_at, s.emails_received, s.emails_opened
      FROM newsletter_subscribers s
    `;
    const params = [];

    if (list_id) {
      query += ' JOIN newsletter_subscriber_lists sl ON s.id = sl.subscriber_id WHERE sl.list_id = ? AND sl.is_active = 1';
      params.push(list_id);
      if (status) {
        query += ' AND s.status = ?';
        params.push(status);
      }
    } else if (status) {
      query += ' WHERE s.status = ?';
      params.push(status);
    }

    query += ' ORDER BY s.created_at DESC';

    const [subscribers] = await db.query(query, params);

    // Generate CSV
    const headers = ['email', 'first_name', 'last_name', 'language', 'status', 'created_at', 'emails_received', 'emails_opened'];
    const csvRows = [headers.join(',')];

    for (const sub of subscribers) {
      const row = headers.map(h => {
        const val = sub[h];
        if (val === null || val === undefined) return '';
        if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });
      csvRows.push(row.join(','));
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=newsletter-subscribers-${Date.now()}.csv`);
    res.send('\uFEFF' + csvRows.join('\n')); // BOM for Excel
  } catch (error) {
    console.error('Export subscribers error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/newsletter/subscribers/bulk - Bulk actions
router.post('/subscribers/bulk', auth, async (req, res) => {
  try {
    const { subscriber_ids, action, list_id } = req.body;

    if (!subscriber_ids || !Array.isArray(subscriber_ids) || subscriber_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucun abonne selectionne' });
    }

    let affected = 0;

    switch (action) {
      case 'add_to_list':
        if (!list_id) return res.status(400).json({ success: false, message: 'Liste requise' });
        for (const id of subscriber_ids) {
          await db.query(`
            INSERT INTO newsletter_subscriber_lists (subscriber_id, list_id)
            VALUES (?, ?) ON DUPLICATE KEY UPDATE is_active = 1
          `, [id, list_id]);
          affected++;
        }
        await updateListSubscriberCount(list_id);
        break;

      case 'remove_from_list':
        if (!list_id) return res.status(400).json({ success: false, message: 'Liste requise' });
        const [result] = await db.query(
          'UPDATE newsletter_subscriber_lists SET is_active = 0 WHERE subscriber_id IN (?) AND list_id = ?',
          [subscriber_ids, list_id]
        );
        affected = result.affectedRows;
        await updateListSubscriberCount(list_id);
        break;

      case 'activate':
        const [activateResult] = await db.query(
          'UPDATE newsletter_subscribers SET status = "active", confirmed_at = COALESCE(confirmed_at, NOW()) WHERE id IN (?)',
          [subscriber_ids]
        );
        affected = activateResult.affectedRows;
        break;

      case 'deactivate':
        const [deactivateResult] = await db.query(
          'UPDATE newsletter_subscribers SET status = "unsubscribed" WHERE id IN (?)',
          [subscriber_ids]
        );
        affected = deactivateResult.affectedRows;
        break;

      case 'delete':
        for (const id of subscriber_ids) {
          await db.query('DELETE FROM newsletter_tracking WHERE subscriber_id = ?', [id]);
          await db.query('DELETE FROM newsletter_queue WHERE subscriber_id = ?', [id]);
          await db.query('DELETE FROM newsletter_subscriber_lists WHERE subscriber_id = ?', [id]);
          await db.query('DELETE FROM newsletter_activity_log WHERE subscriber_id = ?', [id]);
          await db.query('DELETE FROM newsletter_subscribers WHERE id = ?', [id]);
          affected++;
        }
        break;

      default:
        return res.status(400).json({ success: false, message: 'Action non reconnue' });
    }

    res.json({ success: true, message: `${affected} abonne(s) modifie(s)` });
  } catch (error) {
    console.error('Bulk action error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ------------------------------------
// TEMPLATES MANAGEMENT
// ------------------------------------

// GET /api/newsletter/templates - Get templates
router.get('/templates', auth, async (req, res) => {
  try {
    const { category } = req.query;

    let query = 'SELECT * FROM newsletter_templates WHERE is_active = 1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY is_default DESC, name ASC';

    const [templates] = await db.query(query, params);

    res.json({ success: true, data: templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/newsletter/templates - Create template
router.post('/templates', auth, async (req, res) => {
  try {
    const {
      name, category, subject_fr, subject_en, preview_text_fr, preview_text_en,
      content_html_fr, content_html_en, content_text_fr, content_text_en, variables
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Nom requis' });
    }

    const slug = slugify(name) + '-' + Date.now().toString(36);

    const [result] = await db.query(`
      INSERT INTO newsletter_templates
      (name, slug, category, subject_fr, subject_en, preview_text_fr, preview_text_en,
       content_html_fr, content_html_en, content_text_fr, content_text_en, variables, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, slug, category || 'newsletter', subject_fr, subject_en, preview_text_fr, preview_text_en,
        content_html_fr, content_html_en, content_text_fr, content_text_en,
        JSON.stringify(variables || []), req.user.id]);

    res.status(201).json({
      success: true,
      message: 'Template cree',
      data: { id: result.insertId, slug }
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/newsletter/templates/:id - Update template
router.put('/templates/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, category, subject_fr, subject_en, preview_text_fr, preview_text_en,
      content_html_fr, content_html_en, content_text_fr, content_text_en, is_default, variables
    } = req.body;

    if (is_default) {
      await db.query('UPDATE newsletter_templates SET is_default = 0 WHERE category = (SELECT category FROM newsletter_templates WHERE id = ?)', [id]);
    }

    await db.query(`
      UPDATE newsletter_templates SET
        name = COALESCE(?, name),
        category = COALESCE(?, category),
        subject_fr = COALESCE(?, subject_fr),
        subject_en = COALESCE(?, subject_en),
        preview_text_fr = COALESCE(?, preview_text_fr),
        preview_text_en = COALESCE(?, preview_text_en),
        content_html_fr = COALESCE(?, content_html_fr),
        content_html_en = COALESCE(?, content_html_en),
        content_text_fr = COALESCE(?, content_text_fr),
        content_text_en = COALESCE(?, content_text_en),
        is_default = COALESCE(?, is_default),
        variables = COALESCE(?, variables)
      WHERE id = ?
    `, [name, category, subject_fr, subject_en, preview_text_fr, preview_text_en,
        content_html_fr, content_html_en, content_text_fr, content_text_en, is_default,
        variables ? JSON.stringify(variables) : null, id]);

    res.json({ success: true, message: 'Template mis a jour' });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/newsletter/templates/:id/duplicate - Duplicate template
router.post('/templates/:id/duplicate', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [templates] = await db.query('SELECT * FROM newsletter_templates WHERE id = ?', [id]);
    if (templates.length === 0) {
      return res.status(404).json({ success: false, message: 'Template non trouve' });
    }

    const template = templates[0];
    const newName = `${template.name} (copie)`;
    const newSlug = slugify(newName) + '-' + Date.now().toString(36);

    const [result] = await db.query(`
      INSERT INTO newsletter_templates
      (name, slug, category, subject_fr, subject_en, preview_text_fr, preview_text_en,
       content_html_fr, content_html_en, content_text_fr, content_text_en, variables, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [newName, newSlug, template.category, template.subject_fr, template.subject_en,
        template.preview_text_fr, template.preview_text_en, template.content_html_fr,
        template.content_html_en, template.content_text_fr, template.content_text_en,
        template.variables, req.user.id]);

    res.status(201).json({
      success: true,
      message: 'Template duplique',
      data: { id: result.insertId, slug: newSlug }
    });
  } catch (error) {
    console.error('Duplicate template error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/newsletter/templates/:id - Delete template
router.delete('/templates/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete
    await db.query('UPDATE newsletter_templates SET is_active = 0 WHERE id = ?', [id]);

    res.json({ success: true, message: 'Template supprime' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ------------------------------------
// CAMPAIGNS MANAGEMENT
// ------------------------------------

// GET /api/newsletter/campaigns - Get campaigns
router.get('/campaigns', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    let query = 'SELECT * FROM newsletters WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    // Count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [[{ total }]] = await db.query(countQuery, params);

    // Pagination
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [campaigns] = await db.query(query, params);

    res.json({
      success: true,
      data: campaigns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/newsletter/campaigns/:id - Get campaign details
router.get('/campaigns/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [campaigns] = await db.query('SELECT * FROM newsletters WHERE id = ?', [id]);
    if (campaigns.length === 0) {
      return res.status(404).json({ success: false, message: 'Campagne non trouvee' });
    }

    // Get link stats
    const [links] = await db.query(
      'SELECT * FROM newsletter_links WHERE newsletter_id = ? ORDER BY click_count DESC',
      [id]
    );

    // Get tracking timeline
    const [timeline] = await db.query(`
      SELECT DATE(created_at) as date, tracking_type, COUNT(*) as count
      FROM newsletter_tracking
      WHERE newsletter_id = ?
      GROUP BY DATE(created_at), tracking_type
      ORDER BY date ASC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...campaigns[0],
        links,
        timeline
      }
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/newsletter/campaigns - Create campaign
router.post('/campaigns', auth, async (req, res) => {
  try {
    const {
      name, subject_fr, subject_en, preview_text_fr, preview_text_en,
      content_html_fr, content_html_en, template_id, target_lists, target_language
    } = req.body;

    if (!name || !subject_fr || !content_html_fr || !target_lists) {
      return res.status(400).json({ success: false, message: 'Champs requis manquants' });
    }

    const slug = slugify(name) + '-' + Date.now().toString(36);

    const [result] = await db.query(`
      INSERT INTO newsletters
      (name, slug, subject_fr, subject_en, preview_text_fr, preview_text_en,
       content_html_fr, content_html_en, template_id, target_lists, target_language, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, slug, subject_fr, subject_en, preview_text_fr, preview_text_en,
        content_html_fr, content_html_en, template_id, JSON.stringify(target_lists),
        target_language || 'all', req.user.id]);

    res.status(201).json({
      success: true,
      message: 'Campagne creee',
      data: { id: result.insertId, slug }
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/newsletter/campaigns/:id - Update campaign
router.put('/campaigns/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, subject_fr, subject_en, preview_text_fr, preview_text_en,
      content_html_fr, content_html_en, target_lists, target_language
    } = req.body;

    // Check if campaign can be edited
    const [campaigns] = await db.query('SELECT status FROM newsletters WHERE id = ?', [id]);
    if (campaigns.length === 0) {
      return res.status(404).json({ success: false, message: 'Campagne non trouvee' });
    }
    if (['sending', 'sent'].includes(campaigns[0].status)) {
      return res.status(400).json({ success: false, message: 'Impossible de modifier une campagne en cours ou envoyee' });
    }

    await db.query(`
      UPDATE newsletters SET
        name = COALESCE(?, name),
        subject_fr = COALESCE(?, subject_fr),
        subject_en = COALESCE(?, subject_en),
        preview_text_fr = COALESCE(?, preview_text_fr),
        preview_text_en = COALESCE(?, preview_text_en),
        content_html_fr = COALESCE(?, content_html_fr),
        content_html_en = COALESCE(?, content_html_en),
        target_lists = COALESCE(?, target_lists),
        target_language = COALESCE(?, target_language)
      WHERE id = ?
    `, [name, subject_fr, subject_en, preview_text_fr, preview_text_en,
        content_html_fr, content_html_en,
        target_lists ? JSON.stringify(target_lists) : null,
        target_language, id]);

    res.json({ success: true, message: 'Campagne mise a jour' });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/newsletter/campaigns/:id/schedule - Schedule campaign
router.post('/campaigns/:id/schedule', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduled_at } = req.body;

    if (!scheduled_at) {
      return res.status(400).json({ success: false, message: 'Date de programmation requise' });
    }

    const scheduledDate = new Date(scheduled_at);
    if (scheduledDate <= new Date()) {
      return res.status(400).json({ success: false, message: 'La date doit etre dans le futur' });
    }

    await db.query(
      'UPDATE newsletters SET status = "scheduled", scheduled_at = ? WHERE id = ? AND status = "draft"',
      [scheduledDate, id]
    );

    res.json({ success: true, message: 'Campagne programmee' });
  } catch (error) {
    console.error('Schedule campaign error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/newsletter/campaigns/:id/send - Send campaign immediately
router.post('/campaigns/:id/send', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Get campaign
    const [campaigns] = await db.query('SELECT * FROM newsletters WHERE id = ?', [id]);
    if (campaigns.length === 0) {
      return res.status(404).json({ success: false, message: 'Campagne non trouvee' });
    }

    const campaign = campaigns[0];
    if (!['draft', 'scheduled'].includes(campaign.status)) {
      return res.status(400).json({ success: false, message: 'Cette campagne ne peut pas etre envoyee' });
    }

    // Get target subscribers
    const targetLists = JSON.parse(campaign.target_lists || '[]');
    if (targetLists.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucune liste cible selectionnee' });
    }

    let subscriberQuery = `
      SELECT DISTINCT s.id, s.email, s.first_name, s.last_name, s.language, s.unsubscribe_token
      FROM newsletter_subscribers s
      JOIN newsletter_subscriber_lists sl ON s.id = sl.subscriber_id
      WHERE sl.list_id IN (?) AND sl.is_active = 1 AND s.status = 'active'
    `;
    const params = [targetLists];

    if (campaign.target_language && campaign.target_language !== 'all') {
      subscriberQuery += ' AND s.language = ?';
      params.push(campaign.target_language);
    }

    const [subscribers] = await db.query(subscriberQuery, params);

    if (subscribers.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucun abonne eligible' });
    }

    // Update campaign status
    await db.query(`
      UPDATE newsletters SET
        status = 'sending',
        started_at = NOW(),
        total_recipients = ?
      WHERE id = ?
    `, [subscribers.length, id]);

    // Create queue entries
    for (const sub of subscribers) {
      await db.query(`
        INSERT INTO newsletter_queue (newsletter_id, subscriber_id, email, language)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status = 'pending'
      `, [id, sub.id, sub.email, sub.language]);
    }

    // Process links for tracking
    const linkRegex = /href=["']([^"']+)["']/g;
    let match;
    const content = campaign.content_html_fr;

    while ((match = linkRegex.exec(content)) !== null) {
      const url = match[1];
      if (!url.startsWith('#') && !url.includes('unsubscribe')) {
        const trackingCode = generateCode();
        await db.query(`
          INSERT INTO newsletter_links (newsletter_id, original_url, tracking_code)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE tracking_code = tracking_code
        `, [id, url, trackingCode]);
      }
    }

    // Start the actual email sending process
    const emailService = require('../services/newsletterEmailService');
    emailService.startCampaign(id).catch(err => {
      console.error('Error starting campaign:', err);
    });

    res.json({
      success: true,
      message: `Envoi lance pour ${subscribers.length} abonne(s)`,
      data: { total_recipients: subscribers.length }
    });
  } catch (error) {
    console.error('Send campaign error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/newsletter/campaigns/:id/progress - Get sending progress
router.get('/campaigns/:id/progress', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Get campaign info
    const [campaigns] = await db.query(`
      SELECT id, name, status, total_recipients, sent_count, failed_count,
             started_at, sent_at, scheduled_at
      FROM newsletters WHERE id = ?
    `, [id]);

    if (campaigns.length === 0) {
      return res.status(404).json({ success: false, message: 'Campagne non trouvee' });
    }

    const campaign = campaigns[0];

    // Get queue stats
    const [queueStats] = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(status = 'pending') as pending,
        SUM(status = 'sending') as sending,
        SUM(status = 'sent') as sent,
        SUM(status = 'failed') as failed
      FROM newsletter_queue
      WHERE newsletter_id = ?
    `, [id]);

    const stats = queueStats[0];
    const total = campaign.total_recipients || stats.total || 0;
    const sent = stats.sent || 0;
    const failed = stats.failed || 0;
    const pending = stats.pending || 0;
    const progress = total > 0 ? Math.round((sent / total) * 100) : 0;

    res.json({
      success: true,
      data: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        total_recipients: total,
        sent_count: sent,
        failed_count: failed,
        pending_count: pending,
        progress: progress,
        started_at: campaign.started_at,
        sent_at: campaign.sent_at,
        scheduled_at: campaign.scheduled_at
      }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/newsletter/campaigns/:id/cancel - Cancel sending
router.post('/campaigns/:id/cancel', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [campaigns] = await db.query('SELECT status FROM newsletters WHERE id = ?', [id]);
    if (campaigns.length === 0) {
      return res.status(404).json({ success: false, message: 'Campagne non trouvee' });
    }

    if (!['sending', 'scheduled'].includes(campaigns[0].status)) {
      return res.status(400).json({ success: false, message: 'Cette campagne ne peut pas etre annulee' });
    }

    // Update campaign status
    await db.query(`
      UPDATE newsletters SET status = 'draft', scheduled_at = NULL
      WHERE id = ?
    `, [id]);

    // Remove pending queue entries
    await db.query(`
      DELETE FROM newsletter_queue
      WHERE newsletter_id = ? AND status = 'pending'
    `, [id]);

    res.json({ success: true, message: 'Envoi annule' });
  } catch (error) {
    console.error('Cancel campaign error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/newsletter/campaigns/:id/test - Send test email
router.post('/campaigns/:id/test', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { test_email } = req.body;

    if (!test_email) {
      return res.status(400).json({ success: false, message: 'Email de test requis' });
    }

    const [campaigns] = await db.query('SELECT * FROM newsletters WHERE id = ?', [id]);
    if (campaigns.length === 0) {
      return res.status(404).json({ success: false, message: 'Campagne non trouvee' });
    }

    // Send test email using the email service
    const emailService = require('../services/newsletterEmailService');
    await emailService.sendTestEmail(id, test_email);

    res.json({
      success: true,
      message: `Email de test envoye a ${test_email}`
    });
  } catch (error) {
    console.error('Send test error:', error);
    res.status(500).json({ success: false, message: error.message || 'Erreur serveur' });
  }
});

// POST /api/newsletter/campaigns/from-article - Create campaign from article
router.post('/campaigns/from-article', auth, async (req, res) => {
  try {
    const { article_id, target_lists } = req.body;

    if (!article_id) {
      return res.status(400).json({ success: false, message: 'Article requis' });
    }

    // Get article
    const [articles] = await db.query('SELECT * FROM posts WHERE id = ?', [article_id]);
    if (articles.length === 0) {
      return res.status(404).json({ success: false, message: 'Article non trouve' });
    }

    const article = articles[0];
    const name = `Newsletter: ${article.title_fr || article.title}`;
    const slug = slugify(name) + '-' + Date.now().toString(36);

    // Generate HTML from article
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
    const articleUrl = `${frontendUrl}/fr/news/${article.slug}`;

    const contentHtml = `
      <h2 style="color: #263238; margin-bottom: 16px;">${article.title_fr || article.title}</h2>
      ${article.featured_image ? `<img src="${article.featured_image}" alt="" style="max-width: 100%; border-radius: 8px; margin-bottom: 16px;">` : ''}
      <p style="color: #607D8B; line-height: 1.6;">${article.excerpt_fr || article.excerpt || ''}</p>
      <div style="margin-top: 24px;">
        <a href="${articleUrl}" style="display: inline-block; background: linear-gradient(135deg, #27AE60 0%, #00BCD4 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
          Lire l'article complet
        </a>
      </div>
    `;

    const [result] = await db.query(`
      INSERT INTO newsletters
      (name, slug, subject_fr, content_html_fr, source_type, source_article_id, target_lists, created_by)
      VALUES (?, ?, ?, ?, 'article', ?, ?, ?)
    `, [name, slug, article.title_fr || article.title, contentHtml, article_id,
        JSON.stringify(target_lists || []), req.user.id]);

    res.status(201).json({
      success: true,
      message: 'Campagne creee depuis l\'article',
      data: { id: result.insertId, slug }
    });
  } catch (error) {
    console.error('Create from article error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/newsletter/campaigns/:id - Delete campaign
router.delete('/campaigns/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if can be deleted
    const [campaigns] = await db.query('SELECT status FROM newsletters WHERE id = ?', [id]);
    if (campaigns.length > 0 && campaigns[0].status === 'sending') {
      return res.status(400).json({ success: false, message: 'Impossible de supprimer une campagne en cours d\'envoi' });
    }

    await db.query('DELETE FROM newsletter_tracking WHERE newsletter_id = ?', [id]);
    await db.query('DELETE FROM newsletter_queue WHERE newsletter_id = ?', [id]);
    await db.query('DELETE FROM newsletter_links WHERE newsletter_id = ?', [id]);
    await db.query('DELETE FROM newsletter_activity_log WHERE newsletter_id = ?', [id]);
    await db.query('DELETE FROM newsletters WHERE id = ?', [id]);

    res.json({ success: true, message: 'Campagne supprimee' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ------------------------------------
// SETTINGS
// ------------------------------------

// GET /api/newsletter/settings - Get settings
router.get('/settings', auth, async (req, res) => {
  try {
    const settings = await getNewsletterSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/newsletter/settings - Update settings
router.put('/settings', auth, async (req, res) => {
  try {
    const settings = req.body;

    for (const [key, value] of Object.entries(settings)) {
      const valueStr = typeof value === 'object' ? JSON.stringify(value) : JSON.stringify(value);
      await db.query(`
        INSERT INTO newsletter_settings (\`key\`, value)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE value = ?
      `, [key, valueStr, valueStr]);
    }

    res.json({ success: true, message: 'Parametres mis a jour' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
