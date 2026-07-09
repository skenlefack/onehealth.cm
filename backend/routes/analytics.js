const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../config/db');
const { auth, authorize } = require('../middleware/auth');
const UAParser = require('ua-parser-js');

// GeoIP - graceful fallback if not available
let geoip;
try {
  geoip = require('geoip-lite');
} catch (e) {
  console.warn('geoip-lite not available, country detection disabled');
  geoip = { lookup: () => null };
}

// =====================================================
// HELPERS
// =====================================================

function generateHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex').substring(0, 16);
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || '0.0.0.0';
}

function generateVisitorId(ip, ua) {
  return generateHash(`${ip}:${ua}`);
}

function generateSessionId(ip, ua) {
  const date = new Date().toISOString().split('T')[0];
  return generateHash(`${ip}:${ua}:${date}`);
}

function parseUA(uaString) {
  const parser = new UAParser(uaString || '');
  const result = parser.getResult();
  const browser = result.browser.name || 'Unknown';
  const browserVersion = result.browser.version ? result.browser.version.split('.')[0] : '';
  const os = result.os.name || 'Unknown';
  let device = 'desktop';
  if (result.device.type === 'mobile') device = 'mobile';
  else if (result.device.type === 'tablet') device = 'tablet';
  return { browser, browserVersion, os, device };
}

function lookupGeo(ip) {
  const geo = geoip.lookup(ip);
  if (geo) {
    return { country: geo.country || null, city: geo.city || null };
  }
  return { country: null, city: null };
}

// Simple in-memory rate limiter
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 60;

function rateLimit(req, res, next) {
  const ip = getClientIp(req);
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return next();
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  next();
}

// Cleanup rate limit map every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now - entry.start > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(ip);
    }
  }
}, 300000);

// Parse date range from query params
function getDateRange(query) {
  const { period = '7d', start, end } = query;

  if (period === 'custom' && start && end) {
    return {
      startDate: start,
      endDate: end + ' 23:59:59',
      prevStartDate: null,
      prevEndDate: null,
      granularity: 'day'
    };
  }

  const now = new Date();
  let startDate, prevStartDate, granularity;

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - 1);
      granularity = 'hour';
      break;
    case '7d':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - 7);
      granularity = 'day';
      break;
    case '30d':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - 30);
      granularity = 'day';
      break;
    case '90d':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 90);
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - 90);
      granularity = 'week';
      break;
    default:
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - 7);
      granularity = 'day';
  }

  const format = (d) => d.toISOString().slice(0, 19).replace('T', ' ');

  return {
    startDate: format(startDate),
    endDate: format(now),
    prevStartDate: format(prevStartDate),
    prevEndDate: format(startDate),
    granularity
  };
}

// =====================================================
// PUBLIC ENDPOINTS (no auth, rate-limited)
// =====================================================

// POST /collect - Track a pageview
router.post('/collect', rateLimit, async (req, res) => {
  try {
    const { url, referrer, title, screen, language, utm_source, utm_medium, utm_campaign } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'url is required' });
    }

    const ip = getClientIp(req);
    const ua = req.headers['user-agent'] || '';
    const visitorId = generateVisitorId(ip, ua);
    const sessionId = generateSessionId(ip, ua);
    const { browser, browserVersion, os, device } = parseUA(ua);
    const { country, city } = lookupGeo(ip);

    // Clean referrer: remove own domain
    let cleanReferrer = referrer || null;
    if (cleanReferrer) {
      try {
        const refUrl = new URL(cleanReferrer);
        const pageUrl = new URL(url, 'https://onehealth.cm');
        if (refUrl.hostname === pageUrl.hostname) {
          cleanReferrer = null;
        }
      } catch (e) {
        // keep as-is
      }
    }

    // Insert pageview
    await db.query(
      `INSERT INTO analytics_pageviews
       (session_id, visitor_id, url, referrer, title, country, city, browser, browser_version, os, device, screen, language, utm_source, utm_medium, utm_campaign)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sessionId, visitorId, url, cleanReferrer, title || null, country, city, browser, browserVersion, os, device, screen || null, language || null, utm_source || null, utm_medium || null, utm_campaign || null]
    );

    // Upsert session
    await db.query(
      `INSERT INTO analytics_sessions
       (session_id, visitor_id, entry_page, exit_page, pageviews, country, city, browser, os, device, utm_source, utm_medium, utm_campaign)
       VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         exit_page = VALUES(exit_page),
         pageviews = pageviews + 1,
         is_bounce = 0,
         ended_at = NOW()`,
      [sessionId, visitorId, url, url, country, city, browser, os, device, utm_source || null, utm_medium || null, utm_campaign || null]
    );

    res.status(204).end();
  } catch (error) {
    console.error('Analytics collect error:', error.message);
    res.status(204).end(); // Never fail visibly for tracking
  }
});

// POST /heartbeat - Keep session alive for duration tracking
router.post('/heartbeat', rateLimit, async (req, res) => {
  try {
    const ip = getClientIp(req);
    const ua = req.headers['user-agent'] || '';
    const sessionId = generateSessionId(ip, ua);

    // Update session duration
    await db.query(
      `UPDATE analytics_sessions
       SET ended_at = NOW(), duration = TIMESTAMPDIFF(SECOND, started_at, NOW())
       WHERE session_id = ?`,
      [sessionId]
    );

    // Update last pageview duration
    await db.query(
      `UPDATE analytics_pageviews
       SET duration = duration + 15
       WHERE session_id = ?
       ORDER BY created_at DESC LIMIT 1`,
      [sessionId]
    );

    res.status(204).end();
  } catch (error) {
    console.error('Analytics heartbeat error:', error.message);
    res.status(204).end();
  }
});

// =====================================================
// ADMIN ENDPOINTS (auth required)
// =====================================================

// GET /dashboard - Main KPIs + trend data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const { startDate, endDate, prevStartDate, prevEndDate, granularity } = getDateRange(req.query);

    // Current period KPIs
    const [[currentKpis]] = await db.query(
      `SELECT
         COUNT(DISTINCT visitor_id) as visitors,
         COUNT(*) as pageviews,
         COUNT(DISTINCT session_id) as sessions
       FROM analytics_pageviews
       WHERE created_at BETWEEN ? AND ?`,
      [startDate, endDate]
    );

    const [[sessionKpis]] = await db.query(
      `SELECT
         AVG(duration) as avg_duration,
         SUM(is_bounce) / COUNT(*) * 100 as bounce_rate
       FROM analytics_sessions
       WHERE started_at BETWEEN ? AND ?`,
      [startDate, endDate]
    );

    // Previous period KPIs for comparison
    let prevKpis = { visitors: 0, pageviews: 0, sessions: 0 };
    let prevSessionKpis = { avg_duration: 0, bounce_rate: 0 };
    if (prevStartDate && prevEndDate) {
      const [[prev]] = await db.query(
        `SELECT
           COUNT(DISTINCT visitor_id) as visitors,
           COUNT(*) as pageviews,
           COUNT(DISTINCT session_id) as sessions
         FROM analytics_pageviews
         WHERE created_at BETWEEN ? AND ?`,
        [prevStartDate, prevEndDate]
      );
      prevKpis = prev;

      const [[prevSess]] = await db.query(
        `SELECT
           AVG(duration) as avg_duration,
           SUM(is_bounce) / NULLIF(COUNT(*), 0) * 100 as bounce_rate
         FROM analytics_sessions
         WHERE started_at BETWEEN ? AND ?`,
        [prevStartDate, prevEndDate]
      );
      prevSessionKpis = prevSess || { avg_duration: 0, bounce_rate: 0 };
    }

    // Trend data
    let groupBy, dateFormat;
    switch (granularity) {
      case 'hour':
        groupBy = "DATE_FORMAT(created_at, '%Y-%m-%d %H:00')";
        dateFormat = '%H:00';
        break;
      case 'week':
        groupBy = "DATE_FORMAT(created_at, '%Y-%u')";
        dateFormat = '%Y-W%u';
        break;
      default:
        groupBy = "DATE(created_at)";
        dateFormat = '%Y-%m-%d';
    }

    const [trend] = await db.query(
      `SELECT
         ${groupBy} as date_key,
         DATE_FORMAT(created_at, '${dateFormat}') as label,
         COUNT(DISTINCT visitor_id) as visitors,
         COUNT(*) as pageviews
       FROM analytics_pageviews
       WHERE created_at BETWEEN ? AND ?
       GROUP BY date_key
       ORDER BY date_key`,
      [startDate, endDate]
    );

    const calcChange = (curr, prev) => {
      if (!prev || prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    res.json({
      success: true,
      data: {
        kpis: {
          visitors: currentKpis.visitors || 0,
          pageviews: currentKpis.pageviews || 0,
          sessions: currentKpis.sessions || 0,
          avgDuration: Math.round(sessionKpis.avg_duration || 0),
          bounceRate: Math.round((sessionKpis.bounce_rate || 0) * 10) / 10,
        },
        changes: {
          visitors: calcChange(currentKpis.visitors, prevKpis.visitors),
          pageviews: calcChange(currentKpis.pageviews, prevKpis.pageviews),
          sessions: calcChange(currentKpis.sessions, prevKpis.sessions),
          avgDuration: calcChange(sessionKpis.avg_duration || 0, prevSessionKpis.avg_duration || 0),
          bounceRate: calcChange(sessionKpis.bounce_rate || 0, prevSessionKpis.bounce_rate || 0),
        },
        trend
      }
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /pages - Top pages
router.get('/pages', auth, async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const [pages] = await db.query(
      `SELECT
         url,
         COUNT(*) as views,
         COUNT(DISTINCT visitor_id) as visitors,
         ROUND(AVG(duration)) as avg_duration
       FROM analytics_pageviews
       WHERE created_at BETWEEN ? AND ?
       GROUP BY url
       ORDER BY views DESC
       LIMIT 50`,
      [startDate, endDate]
    );
    res.json({ success: true, data: pages });
  } catch (error) {
    console.error('Analytics pages error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /referrers - Referrer breakdown
router.get('/referrers', auth, async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const [referrers] = await db.query(
      `SELECT
         COALESCE(referrer, 'Direct') as referrer,
         COUNT(*) as views,
         COUNT(DISTINCT visitor_id) as visitors
       FROM analytics_pageviews
       WHERE created_at BETWEEN ? AND ?
       GROUP BY referrer
       ORDER BY views DESC
       LIMIT 30`,
      [startDate, endDate]
    );
    res.json({ success: true, data: referrers });
  } catch (error) {
    console.error('Analytics referrers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /browsers - Browser stats
router.get('/browsers', auth, async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const [browsers] = await db.query(
      `SELECT
         browser,
         COUNT(DISTINCT visitor_id) as visitors
       FROM analytics_pageviews
       WHERE created_at BETWEEN ? AND ?
       GROUP BY browser
       ORDER BY visitors DESC
       LIMIT 15`,
      [startDate, endDate]
    );
    res.json({ success: true, data: browsers });
  } catch (error) {
    console.error('Analytics browsers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /os - Operating system stats
router.get('/os', auth, async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const [osData] = await db.query(
      `SELECT
         os,
         COUNT(DISTINCT visitor_id) as visitors
       FROM analytics_pageviews
       WHERE created_at BETWEEN ? AND ?
       GROUP BY os
       ORDER BY visitors DESC
       LIMIT 15`,
      [startDate, endDate]
    );
    res.json({ success: true, data: osData });
  } catch (error) {
    console.error('Analytics os error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /devices - Device type stats
router.get('/devices', auth, async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const [devices] = await db.query(
      `SELECT
         device,
         COUNT(DISTINCT visitor_id) as visitors
       FROM analytics_pageviews
       WHERE created_at BETWEEN ? AND ?
       GROUP BY device
       ORDER BY visitors DESC`,
      [startDate, endDate]
    );
    res.json({ success: true, data: devices });
  } catch (error) {
    console.error('Analytics devices error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /countries - Country stats
router.get('/countries', auth, async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const [countries] = await db.query(
      `SELECT
         COALESCE(country, 'Unknown') as country,
         COUNT(DISTINCT visitor_id) as visitors
       FROM analytics_pageviews
       WHERE created_at BETWEEN ? AND ?
       GROUP BY country
       ORDER BY visitors DESC
       LIMIT 20`,
      [startDate, endDate]
    );
    res.json({ success: true, data: countries });
  } catch (error) {
    console.error('Analytics countries error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /realtime - Active visitors in last 5 minutes
router.get('/realtime', auth, async (req, res) => {
  try {
    const [[{ active_visitors }]] = await db.query(
      `SELECT COUNT(DISTINCT visitor_id) as active_visitors
       FROM analytics_pageviews
       WHERE created_at >= NOW() - INTERVAL 5 MINUTE`
    );

    const [recentPages] = await db.query(
      `SELECT url, country, device, created_at
       FROM analytics_pageviews
       WHERE created_at >= NOW() - INTERVAL 5 MINUTE
       ORDER BY created_at DESC
       LIMIT 10`
    );

    res.json({
      success: true,
      data: {
        active_visitors: active_visitors || 0,
        recent: recentPages
      }
    });
  } catch (error) {
    console.error('Analytics realtime error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /events - Custom events
router.get('/events', auth, async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const [events] = await db.query(
      `SELECT
         name,
         COUNT(*) as count,
         COUNT(DISTINCT session_id) as sessions
       FROM analytics_events
       WHERE created_at BETWEEN ? AND ?
       GROUP BY name
       ORDER BY count DESC
       LIMIT 30`,
      [startDate, endDate]
    );
    res.json({ success: true, data: events });
  } catch (error) {
    console.error('Analytics events error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /utm - UTM campaign stats
router.get('/utm', auth, async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const [utm] = await db.query(
      `SELECT
         utm_source as source,
         utm_medium as medium,
         utm_campaign as campaign,
         COUNT(DISTINCT session_id) as sessions,
         COUNT(*) as pageviews
       FROM analytics_sessions
       WHERE started_at BETWEEN ? AND ?
         AND utm_source IS NOT NULL
       GROUP BY utm_source, utm_medium, utm_campaign
       ORDER BY sessions DESC
       LIMIT 30`,
      [startDate, endDate]
    );
    res.json({ success: true, data: utm });
  } catch (error) {
    console.error('Analytics utm error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /event - Track a custom event
router.post('/event', rateLimit, async (req, res) => {
  try {
    const { name, data: eventData, url } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const ip = getClientIp(req);
    const ua = req.headers['user-agent'] || '';
    const visitorId = generateVisitorId(ip, ua);
    const sessionId = generateSessionId(ip, ua);

    await db.query(
      `INSERT INTO analytics_events (session_id, visitor_id, name, data, url)
       VALUES (?, ?, ?, ?, ?)`,
      [sessionId, visitorId, name, eventData ? JSON.stringify(eventData) : null, url || null]
    );

    res.status(204).end();
  } catch (error) {
    console.error('Analytics event error:', error.message);
    res.status(204).end();
  }
});

module.exports = router;
