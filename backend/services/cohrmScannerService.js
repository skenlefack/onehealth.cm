/**
 * COHRM Web Scanner Service - Système de veille automatisée
 *
 * Fonctionnalités :
 * - Scraping web réel (cheerio + node-fetch)
 * - Support RSS/Atom feeds (rss-parser)
 * - Scoring de pertinence par thèmes/mots-clés pondérés
 * - Auto-création de rumeurs au-delà d'un seuil configurable
 * - Notifications temps réel aux responsables
 * - Scheduler cron pour scans automatiques périodiques
 * - Déduplication par URL et titre similaire
 */

const db = require('../config/db');
const cron = require('node-cron');

let cheerio, fetch, RssParser;
try { cheerio = require('cheerio'); } catch (e) { console.warn('[Scanner] cheerio not installed'); }
try { fetch = require('node-fetch'); } catch (e) { console.warn('[Scanner] node-fetch not installed'); }
try { RssParser = require('rss-parser'); } catch (e) { console.warn('[Scanner] rss-parser not installed'); }

// Référence au socket service (injectée depuis server.js)
let socketService = null;
let notificationService = null;

// Scheduler cron actif
let schedulerJob = null;

// ============================================
// CONFIGURATION
// ============================================

const DEFAULT_CONFIG = {
  auto_create_threshold: 15,      // Score minimum pour auto-créer une rumeur
  high_priority_threshold: 25,    // Score pour priorité haute
  critical_threshold: 40,         // Score pour priorité critique
  max_articles_per_source: 50,    // Limite d'articles par source
  scan_timeout_ms: 20000,         // Timeout par source
  dedup_days: 30,                 // Jours de déduplication
  notify_on_new_results: true,    // Notifier quand résultats trouvés
  notify_on_auto_rumor: true,     // Notifier quand rumeur auto-créée
  scanner_enabled: false,         // Activé/désactivé
  scan_interval_minutes: 60,      // Intervalle par défaut entre scans
};

/**
 * Charge la config scanner depuis cohrm_settings
 */
const getConfig = async () => {
  const config = { ...DEFAULT_CONFIG };
  try {
    const [settings] = await db.query(
      "SELECT `key`, value FROM cohrm_settings WHERE `key` LIKE 'scanner_%' OR `key` LIKE 'web_scanner_%'"
    );
    for (const s of settings) {
      const key = s.key.replace('scanner_', '').replace('web_scanner_', '');
      if (key in config) {
        config[key] = s.value === 'true' ? true : s.value === 'false' ? false : (isNaN(s.value) ? s.value : Number(s.value));
      }
    }
  } catch (e) {
    console.warn('[Scanner] Could not load config:', e.message);
  }
  return config;
};

// ============================================
// SCRAPING WEB
// ============================================

/**
 * Scrape une source web (HTML classique)
 */
const scrapeWebSource = async (source, keywords) => {
  if (!fetch || !cheerio) throw new Error('cheerio/node-fetch non installés');

  const response = await fetch(source.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; COHRM-Scanner/2.0; OneHealth Cameroon)',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': source.language === 'en' ? 'en-US,en' : 'fr-FR,fr',
    },
    timeout: DEFAULT_CONFIG.scan_timeout_ms,
  });

  if (!response.ok) throw new Error(`HTTP ${response.status} - ${source.url}`);
  const html = await response.text();
  const $ = cheerio.load(html);

  const articles = [];

  // Sélecteurs d'articles courants (presse, blogs, sites de santé)
  const selectors = [
    'article', '.article', '.post', '.news-item', '.entry',
    '[role="article"]', '.story', '.card', '.item',
    '.blog-post', '.press-release', '.actualite', '.actu-item',
  ];

  for (const selector of selectors) {
    $(selector).each((i, el) => {
      if (articles.length >= DEFAULT_CONFIG.max_articles_per_source) return false;

      const title = $(el).find('h1, h2, h3, h4, .title, .headline, .entry-title').first().text().trim();
      const content = $(el).find('p, .content, .summary, .excerpt, .description, .entry-content, .chapo').text().trim();
      const linkEl = $(el).find('a[href]').first();
      let link = linkEl.attr('href') || '';
      const dateStr = $(el).find('time, .date, .published, .post-date, .meta-date').first().attr('datetime')
        || $(el).find('time, .date').first().text().trim();

      // Résoudre les URLs relatives
      if (link && !link.startsWith('http')) {
        try { link = new URL(link, source.url).href; } catch { link = ''; }
      }

      if (title && title.length > 15 && content.length > 30) {
        articles.push({
          title: title.substring(0, 500),
          content: content.substring(0, 3000),
          url: link,
          published_at: parseDate(dateStr),
        });
      }
    });
  }

  // Fallback : extraire depuis les titres avec liens
  if (articles.length === 0) {
    $('h2 a, h3 a, .title a').each((i, el) => {
      if (articles.length >= 20) return false;
      const title = $(el).text().trim();
      let link = $(el).attr('href') || '';
      if (link && !link.startsWith('http')) {
        try { link = new URL(link, source.url).href; } catch { link = ''; }
      }
      const parentText = $(el).closest('div, li, article').find('p').first().text().trim();
      if (title.length > 15) {
        articles.push({
          title: title.substring(0, 500),
          content: parentText.substring(0, 3000),
          url: link,
          published_at: null,
        });
      }
    });
  }

  return articles;
};

/**
 * Scrape un flux RSS/Atom
 */
const scrapeRssSource = async (source) => {
  if (!RssParser) throw new Error('rss-parser non installé');

  const parser = new RssParser({
    timeout: DEFAULT_CONFIG.scan_timeout_ms,
    headers: { 'User-Agent': 'COHRM-Scanner/2.0 (OneHealth Cameroon)' },
  });

  const feed = await parser.parseURL(source.url);
  const articles = [];

  for (const item of (feed.items || []).slice(0, DEFAULT_CONFIG.max_articles_per_source)) {
    // Nettoyer le HTML du contenu
    let content = item.contentSnippet || item.content || item.summary || '';
    if (cheerio && content.includes('<')) {
      content = cheerio.load(content).text();
    }

    articles.push({
      title: (item.title || '').substring(0, 500),
      content: content.substring(0, 3000),
      url: item.link || item.guid || '',
      published_at: parseDate(item.isoDate || item.pubDate),
    });
  }

  return articles;
};

// ============================================
// SCORING & ANALYSE
// ============================================

/**
 * Score de pertinence d'un article par rapport aux mots-clés
 * Retourne un score pondéré et la liste des matches
 */
const scoreRelevance = (article, keywords) => {
  const titleLower = (article.title || '').toLowerCase();
  const contentLower = (article.content || '').toLowerCase();
  const fullText = `${titleLower} ${contentLower}`;
  let score = 0;
  const matched = [];

  for (const kw of keywords) {
    if (!kw.is_active) continue;
    const keyword = kw.keyword.toLowerCase();

    if (fullText.includes(keyword)) {
      const inTitle = titleLower.includes(keyword);
      // Titre = x3, catégorie alert/disease = bonus
      const categoryBonus = (kw.category === 'alert') ? 2 : (kw.category === 'disease') ? 1.5 : 1;
      const weight = Math.round(kw.weight * (inTitle ? 3 : 1) * categoryBonus);
      score += weight;
      matched.push({
        keyword: kw.keyword,
        category: kw.category,
        weight,
        inTitle,
        theme_id: kw.theme_id || null,
      });
    }
  }

  return { score: Math.min(score, 100), matched };
};

/**
 * Détermine la priorité en fonction du score
 */
const getPriority = (score, config) => {
  if (score >= config.critical_threshold) return 'critical';
  if (score >= config.high_priority_threshold) return 'high';
  if (score >= config.auto_create_threshold) return 'medium';
  return 'low';
};

// ============================================
// DÉDUPLICATION
// ============================================

/**
 * Vérifie si un article est un doublon (par URL ou titre similaire)
 */
const isDuplicate = async (article, dedupDays = 30) => {
  // Vérif par URL exacte
  if (article.url) {
    const [[byUrl]] = await db.query(
      'SELECT id FROM cohrm_scan_results WHERE url = ? LIMIT 1',
      [article.url]
    );
    if (byUrl) return true;
  }

  // Vérif par titre similaire (dans les N derniers jours)
  if (article.title) {
    const [[byTitle]] = await db.query(
      `SELECT id FROM cohrm_scan_results
       WHERE title = ? AND created_at > DATE_SUB(NOW(), INTERVAL ? DAY) LIMIT 1`,
      [article.title, dedupDays]
    );
    if (byTitle) return true;

    // Vérif aussi dans les rumeurs existantes
    const [[byRumor]] = await db.query(
      `SELECT id FROM cohrm_rumors
       WHERE (title = ? OR source_details = ?) AND created_at > DATE_SUB(NOW(), INTERVAL ? DAY) LIMIT 1`,
      [article.title, article.url || '', dedupDays]
    );
    if (byRumor) return true;
  }

  return false;
};

// ============================================
// SCAN PRINCIPAL
// ============================================

/**
 * Exécute un scan sur toutes les sources actives (ou une spécifique)
 * @param {number|null} sourceId - ID source spécifique ou null pour toutes
 * @param {boolean} isAutomatic - true si lancé par le scheduler
 * @returns {object} Résumé du scan
 */
const runScan = async (sourceId = null, isAutomatic = false) => {
  const config = await getConfig();
  const startTime = Date.now();

  console.log(`[Scanner] ${isAutomatic ? '⏰ Scan automatique' : '▶ Scan manuel'} démarré...`);

  // Récupérer les sources
  let sourceQuery = 'SELECT * FROM cohrm_scan_sources WHERE is_active = 1';
  const sourceParams = [];
  if (sourceId) { sourceQuery += ' AND id = ?'; sourceParams.push(sourceId); }
  const [sources] = await db.query(sourceQuery, sourceParams);

  if (sources.length === 0) {
    console.log('[Scanner] Aucune source active');
    return { scanned: 0, results: 0, rumors_created: 0, errors: 0 };
  }

  // Récupérer les mots-clés actifs (avec thèmes si disponibles)
  const [keywords] = await db.query(`
    SELECT k.*, t.label_fr as theme_name
    FROM cohrm_scan_keywords k
    LEFT JOIN cohrm_themes t ON k.theme_id = t.id
    WHERE k.is_active = 1
  `);

  // Créer l'entrée de scan dans l'historique
  const [scanEntry] = await db.query(
    `INSERT INTO cohrm_web_scans (source, status, keywords, started_at, created_at)
     VALUES (?, 'running', ?, NOW(), NOW())`,
    [sourceId ? `source_${sourceId}` : 'all', JSON.stringify(keywords.map(k => k.keyword))]
  );
  const scanId = scanEntry.insertId;

  let totalResults = 0;
  let rumorsCreated = 0;
  let errorsCount = 0;
  const highRelevanceResults = [];

  // Scanner chaque source
  for (const source of sources) {
    // Vérifier si la source doit être scannée (respect de la fréquence)
    if (isAutomatic && source.last_scanned_at) {
      const hoursSinceLastScan = (Date.now() - new Date(source.last_scanned_at).getTime()) / 3600000;
      if (hoursSinceLastScan < source.scan_frequency_hours) {
        continue; // Pas encore le moment de re-scanner cette source
      }
    }

    try {
      console.log(`[Scanner] Scanning: ${source.name} (${source.type})...`);

      // Choisir la méthode de scraping selon le type
      let articles = [];
      if (source.type === 'rss' || source.url.includes('/rss') || source.url.includes('/feed') || source.url.endsWith('.xml')) {
        articles = await scrapeRssSource(source);
      } else {
        articles = await scrapeWebSource(source, keywords);
      }

      console.log(`[Scanner]   → ${articles.length} articles extraits de ${source.name}`);

      // Scorer et filtrer les articles
      for (const article of articles) {
        const { score, matched } = scoreRelevance(article, keywords);
        if (score <= 0 || matched.length === 0) continue;

        // Vérifier la déduplication
        if (await isDuplicate(article, config.dedup_days)) continue;

        // Sauvegarder le résultat
        const [resultEntry] = await db.query(
          `INSERT INTO cohrm_scan_results
           (scan_id, source_id, title, content, url, published_at, relevance_score, keywords_matched, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
          [scanId, source.id, article.title, article.content, article.url,
           article.published_at, score, JSON.stringify(matched)]
        );
        totalResults++;

        // Auto-création de rumeur si score >= seuil
        if (score >= config.auto_create_threshold) {
          const rumorId = await autoCreateRumor(article, score, matched, source, config, resultEntry.insertId);
          if (rumorId) {
            rumorsCreated++;
            highRelevanceResults.push({
              resultId: resultEntry.insertId,
              rumorId,
              title: article.title,
              score,
              source: source.name,
              priority: getPriority(score, config),
            });
          }
        }
      }

      // Mettre à jour le timestamp du dernier scan
      await db.query('UPDATE cohrm_scan_sources SET last_scanned_at = NOW() WHERE id = ?', [source.id]);

    } catch (err) {
      errorsCount++;
      console.error(`[Scanner] Erreur source ${source.name}:`, err.message);
    }
  }

  // Mettre à jour l'entrée de scan
  const duration = Math.round((Date.now() - startTime) / 1000);
  await db.query(
    `UPDATE cohrm_web_scans SET
      status = 'completed', items_scanned = ?, rumors_found = ?, rumors_created = ?,
      duration = ?, completed_at = NOW()
     WHERE id = ?`,
    [totalResults, totalResults, rumorsCreated, duration, scanId]
  );

  console.log(`[Scanner] ✅ Scan terminé en ${duration}s — ${totalResults} résultats, ${rumorsCreated} rumeurs créées, ${errorsCount} erreurs`);

  // Envoyer les notifications
  if (totalResults > 0 || rumorsCreated > 0) {
    await sendScanNotifications(totalResults, rumorsCreated, highRelevanceResults, config);
  }

  return { scanId, scanned: sources.length, results: totalResults, rumors_created: rumorsCreated, errors: errorsCount, duration };
};

// ============================================
// AUTO-CRÉATION DE RUMEURS
// ============================================

/**
 * Crée automatiquement une rumeur à partir d'un résultat de scan
 */
const autoCreateRumor = async (article, score, matched, source, config, scanResultId) => {
  try {
    // Générer le code rumeur
    const now = new Date();
    const prefix = `RUM-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [[{ maxCode }]] = await db.query(
      "SELECT MAX(CAST(SUBSTRING(code, 11) AS UNSIGNED)) as maxCode FROM cohrm_rumors WHERE code LIKE ?",
      [`${prefix}%`]
    );
    const nextNum = (maxCode || 0) + 1;
    const code = `${prefix}-${String(nextNum).padStart(4, '0')}`;

    const priority = getPriority(score, config);

    // Détecter la catégorie depuis les keywords matchés
    const categories = matched.map(m => m.category);
    let category = 'other';
    if (categories.includes('disease')) category = 'human_health';
    if (matched.some(m => m.keyword.toLowerCase().includes('aviaire') || m.keyword.toLowerCase().includes('bovin'))) category = 'animal_health';
    if (categories.includes('alert') && score >= config.critical_threshold) category = 'disaster';

    // Détecter la région depuis les keywords de localisation
    let region = null;
    const locationMatch = matched.find(m => m.category === 'location');
    if (locationMatch) {
      const locationMap = {
        'yaoundé': 'CE', 'douala': 'LT', 'maroua': 'EN', 'garoua': 'NO',
        'bamenda': 'NW', 'bafoussam': 'OU', 'bertoua': 'ES', 'ebolowa': 'SU',
        'ngaoundéré': 'AD', 'buea': 'SW', 'limbe': 'SW',
      };
      region = locationMap[locationMatch.keyword.toLowerCase()] || null;
    }

    // Thèmes détectés
    const themes = [...new Set(matched.filter(m => m.theme_id).map(m => m.theme_id))];

    const [result] = await db.query(
      `INSERT INTO cohrm_rumors
       (code, title, description, source, source_type, source_details,
        category, region, priority, status, risk_level, themes)
       VALUES (?, ?, ?, 'scanner', 'web_scan', ?, ?, ?, ?, 'pending', ?, ?)`,
      [
        code,
        article.title.substring(0, 255),
        article.content.substring(0, 5000),
        article.url,
        category,
        region,
        priority,
        priority === 'critical' ? 'high' : priority === 'high' ? 'moderate' : 'unknown',
        themes.length > 0 ? JSON.stringify(themes) : null,
      ]
    );

    const rumorId = result.insertId;

    // Lier le résultat de scan à la rumeur
    await db.query(
      'UPDATE cohrm_scan_results SET status = ?, rumor_id = ? WHERE id = ?',
      ['converted', rumorId, scanResultId]
    );

    // Historique
    await db.query(
      `INSERT INTO cohrm_rumor_history (rumor_id, user_id, action, details) VALUES (?, NULL, ?, ?)`,
      [rumorId, 'auto_scanner_creation', JSON.stringify({
        source: source.name,
        score,
        keywords: matched.map(m => m.keyword),
        url: article.url,
      })]
    );

    console.log(`[Scanner] 🆕 Rumeur auto-créée: ${code} (score: ${score}, priorité: ${priority})`);
    return rumorId;
  } catch (err) {
    console.error('[Scanner] Erreur auto-création rumeur:', err.message);
    return null;
  }
};

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * Envoie les notifications suite à un scan
 */
const sendScanNotifications = async (totalResults, rumorsCreated, highRelevanceResults, config) => {
  try {
    // Notification Socket.IO temps réel
    if (socketService) {
      // Notifier tous les coordinateurs/superviseurs (niveau 3+)
      const notifData = {
        title: `Scanner: ${totalResults} résultat(s) trouvé(s)`,
        message: rumorsCreated > 0
          ? `${rumorsCreated} rumeur(s) auto-créée(s) dont ${highRelevanceResults.filter(r => r.priority === 'critical').length} critique(s)`
          : `${totalResults} article(s) pertinent(s) détecté(s) - à examiner`,
        metadata: { totalResults, rumorsCreated, highRelevance: highRelevanceResults.length },
      };

      // Notifier les niveaux 3+ via le socket service
      socketService.notify('system', notifData, { level: 3 });

      // Pour les rumeurs critiques, notifier aussi les superviseurs (niveau 5)
      for (const hr of highRelevanceResults.filter(r => r.priority === 'critical')) {
        socketService.notify('risk_assessment', {
          title: `⚠️ Alerte critique: ${hr.title.substring(0, 80)}`,
          message: `Rumeur auto-créée avec score ${hr.score} depuis ${hr.source}`,
          rumorId: hr.rumorId,
          metadata: { score: hr.score, source: hr.source },
        }, { level: 4 });
      }
    }

    // Notification email pour les résultats critiques
    if (notificationService && rumorsCreated > 0) {
      // Récupérer les coordinateurs et superviseurs
      const [supervisors] = await db.query(`
        SELECT u.email, u.first_name, u.last_name, a.actor_level
        FROM cohrm_actors a
        JOIN users u ON a.user_id = u.id
        WHERE a.actor_level >= 4 AND a.is_active = 1 AND u.email IS NOT NULL
      `);

      for (const sup of supervisors) {
        try {
          await notificationService.sendEmail({
            to: sup.email,
            subject: `[COHRM Scanner] ${rumorsCreated} nouvelle(s) rumeur(s) détectée(s)`,
            html: buildScanEmailHtml(sup, totalResults, rumorsCreated, highRelevanceResults),
          });
        } catch (emailErr) {
          console.warn(`[Scanner] Email failed for ${sup.email}:`, emailErr.message);
        }
      }
    }
  } catch (err) {
    console.error('[Scanner] Notification error:', err.message);
  }
};

/**
 * Génère le HTML de l'email de notification scanner
 */
const buildScanEmailHtml = (user, totalResults, rumorsCreated, highRelevanceResults) => {
  const resultRows = highRelevanceResults.slice(0, 10).map(r => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px;">${r.title.substring(0, 60)}...</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">
        <span style="background:${r.priority === 'critical' ? '#EF4444' : r.priority === 'high' ? '#F59E0B' : '#3B82F6'};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;">${r.score}</span>
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:12px;color:#666;">${r.source}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;">
        <span style="background:${r.priority === 'critical' ? '#FEE2E2' : r.priority === 'high' ? '#FEF3C7' : '#DBEAFE'};color:${r.priority === 'critical' ? '#991B1B' : r.priority === 'high' ? '#92400E' : '#1E40AF'};padding:2px 8px;border-radius:4px;font-size:11px;">${r.priority}</span>
      </td>
    </tr>
  `).join('');

  return `
    <div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',sans-serif;">
      <div style="background:linear-gradient(135deg,#FF5722,#FF9800);padding:24px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:20px;">🔍 COHRM - Résultats du Scanner</h1>
      </div>
      <div style="background:#fff;padding:30px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        <p>Bonjour ${user.first_name},</p>
        <p>Le scanner de veille automatique a détecté <strong>${totalResults} résultat(s)</strong> pertinent(s) et créé <strong>${rumorsCreated} rumeur(s)</strong> automatiquement.</p>

        ${highRelevanceResults.length > 0 ? `
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <thead>
            <tr style="background:#F8FAFC;">
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748B;">Titre</th>
              <th style="padding:10px 12px;text-align:center;font-size:12px;color:#64748B;">Score</th>
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748B;">Source</th>
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748B;">Priorité</th>
            </tr>
          </thead>
          <tbody>${resultRows}</tbody>
        </table>` : ''}

        <div style="text-align:center;margin:24px 0;">
          <a href="${process.env.ADMIN_URL || 'https://admin.onehealth.cm'}"
             style="display:inline-block;background:linear-gradient(135deg,#FF5722,#FF9800);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">
            Voir dans COHRM
          </a>
        </div>
      </div>
    </div>
  `;
};

// ============================================
// GESTION DES THÈMES
// ============================================

/**
 * Récupère les thèmes avec leurs mots-clés associés
 */
const getThemesWithKeywords = async () => {
  const [themes] = await db.query('SELECT * FROM cohrm_themes WHERE is_active = 1 ORDER BY display_order');
  const [keywords] = await db.query('SELECT * FROM cohrm_scan_keywords WHERE is_active = 1');

  return themes.map(theme => ({
    ...theme,
    keywords: keywords.filter(k => k.theme_id === theme.id),
    keywordCount: keywords.filter(k => k.theme_id === theme.id).length,
  }));
};

// ============================================
// SCHEDULER CRON
// ============================================

/**
 * Démarre le scheduler de scans automatiques
 */
const startScheduler = async () => {
  if (schedulerJob) {
    schedulerJob.stop();
    schedulerJob = null;
  }

  const config = await getConfig();

  if (!config.scanner_enabled) {
    console.log('[Scanner] Scheduler désactivé (scanner_enabled = false)');
    return;
  }

  const intervalMinutes = config.scan_interval_minutes || 60;

  // Cron expression: toutes les N minutes
  // Pour 60 min → "0 * * * *" (chaque heure)
  // Pour 30 min → "*/30 * * * *"
  // Pour 120 min → "0 */2 * * *"
  let cronExpr;
  if (intervalMinutes <= 59) {
    cronExpr = `*/${intervalMinutes} * * * *`;
  } else {
    const hours = Math.round(intervalMinutes / 60);
    cronExpr = `0 */${hours} * * *`;
  }

  schedulerJob = cron.schedule(cronExpr, async () => {
    console.log(`[Scanner] ⏰ Scan automatique programmé lancé (intervalle: ${intervalMinutes}min)`);
    try {
      await runScan(null, true);
    } catch (err) {
      console.error('[Scanner] Erreur scan automatique:', err.message);
    }
  }, {
    timezone: 'Africa/Douala',
  });

  console.log(`[Scanner] ✅ Scheduler démarré — scan toutes les ${intervalMinutes} minutes (cron: ${cronExpr})`);
};

/**
 * Arrête le scheduler
 */
const stopScheduler = () => {
  if (schedulerJob) {
    schedulerJob.stop();
    schedulerJob = null;
    console.log('[Scanner] Scheduler arrêté');
  }
};

/**
 * Redémarre le scheduler (après changement de config)
 */
const restartScheduler = async () => {
  stopScheduler();
  await startScheduler();
};

// ============================================
// INITIALISATION
// ============================================

/**
 * Initialise le service scanner
 * @param {object} options - { socketService, notificationService }
 */
const initialize = (options = {}) => {
  socketService = options.socketService || null;
  notificationService = options.notificationService || null;

  // Démarrer le scheduler
  startScheduler().catch(err => {
    console.error('[Scanner] Erreur démarrage scheduler:', err.message);
  });
};

// ============================================
// UTILITAIRES
// ============================================

const parseDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d.toISOString();
  } catch { return null; }
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  initialize,
  runScan,
  scanSource: scrapeWebSource,
  scrapeRssSource,
  scoreRelevance,
  isDuplicate,
  autoCreateRumor,
  getConfig,
  getThemesWithKeywords,
  startScheduler,
  stopScheduler,
  restartScheduler,
  getPriority,
};
