/**
 * COHRM Web Scanner Service
 * Scans web sources for disease surveillance keywords
 */

const db = require('../config/db');

let cheerio, fetch;
try { cheerio = require('cheerio'); } catch (e) { console.warn('cheerio not installed'); }
try { fetch = require('node-fetch'); } catch (e) { console.warn('node-fetch not installed'); }

/**
 * Scan a single source URL
 */
const scanSource = async (source, keywords) => {
  if (!fetch || !cheerio) throw new Error('Dependencies not installed (cheerio, node-fetch)');

  const results = [];

  try {
    const response = await fetch(source.url, {
      headers: { 'User-Agent': 'COHRM-Scanner/1.0 (OneHealth CMS)' },
      timeout: 15000,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract articles from common selectors
    const articleSelectors = ['article', '.article', '.post', '.news-item', '.entry', '[role="article"]', '.story'];
    const articles = [];

    for (const selector of articleSelectors) {
      $(selector).each((i, el) => {
        const title = $(el).find('h1, h2, h3, .title, .headline').first().text().trim();
        const content = $(el).find('p, .content, .summary, .excerpt, .description').text().trim();
        const link = $(el).find('a').first().attr('href') || '';
        const date = $(el).find('time, .date, .published').first().attr('datetime') || $(el).find('time, .date').first().text().trim();

        if (title && title.length > 10) {
          articles.push({
            title: title.substring(0, 500),
            content: content.substring(0, 2000),
            url: link.startsWith('http') ? link : (link.startsWith('/') ? new URL(link, source.url).href : ''),
            published_at: parseDate(date),
          });
        }
      });
    }

    // Fallback: extract from headings if no articles found
    if (articles.length === 0) {
      $('h2 a, h3 a').each((i, el) => {
        const title = $(el).text().trim();
        const link = $(el).attr('href') || '';
        if (title.length > 10) {
          articles.push({
            title: title.substring(0, 500),
            content: $(el).parent().next('p').text().trim().substring(0, 2000),
            url: link.startsWith('http') ? link : (link.startsWith('/') ? new URL(link, source.url).href : ''),
            published_at: null,
          });
        }
      });
    }

    // Score and filter articles
    for (const article of articles.slice(0, 50)) {
      const { score, matched } = scoreRelevance(article, keywords);
      if (score > 0) {
        results.push({
          ...article,
          relevance_score: Math.min(score, 100),
          keywords_matched: matched,
          source_id: source.id,
        });
      }
    }
  } catch (err) {
    console.error(`[Scanner] Error scanning ${source.name}:`, err.message);
  }

  return results;
};

/**
 * Score article relevance based on keyword matches
 */
const scoreRelevance = (article, keywords) => {
  const text = `${article.title} ${article.content}`.toLowerCase();
  let score = 0;
  const matched = [];

  for (const kw of keywords) {
    if (!kw.is_active) continue;
    const keyword = kw.keyword.toLowerCase();
    if (text.includes(keyword)) {
      // Title matches are worth more
      const inTitle = article.title.toLowerCase().includes(keyword);
      const weight = kw.weight * (inTitle ? 3 : 1);
      score += weight;
      matched.push({ keyword: kw.keyword, category: kw.category, weight, inTitle });
    }
  }

  return { score, matched };
};

/**
 * Parse date string to ISO format
 */
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d.toISOString();
  } catch {
    return null;
  }
};

/**
 * Run scan on all active sources (or a specific one)
 */
const runScan = async (sourceId = null) => {
  // Get sources
  let query = 'SELECT * FROM cohrm_scan_sources WHERE is_active = 1';
  const params = [];
  if (sourceId) { query += ' AND id = ?'; params.push(sourceId); }
  const [sources] = await db.query(query, params);

  if (sources.length === 0) return { scanned: 0, results: 0 };

  // Get keywords
  const [keywords] = await db.query('SELECT * FROM cohrm_scan_keywords WHERE is_active = 1');

  let totalResults = 0;

  for (const source of sources) {
    try {
      const results = await scanSource(source, keywords);

      // Deduplicate by URL
      for (const result of results) {
        if (result.url) {
          const [[existing]] = await db.query(
            'SELECT id FROM cohrm_scan_results WHERE url = ? LIMIT 1', [result.url]
          );
          if (existing) continue;
        }

        await db.query(
          `INSERT INTO cohrm_scan_results (source_id, title, content, url, published_at, relevance_score, keywords_matched, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'new')`,
          [source.id, result.title, result.content, result.url, result.published_at, result.relevance_score, JSON.stringify(result.keywords_matched)]
        );
        totalResults++;
      }

      // Update last scan time
      await db.query('UPDATE cohrm_scan_sources SET last_scanned_at = NOW() WHERE id = ?', [source.id]);
    } catch (err) {
      console.error(`[Scanner] Source ${source.name} failed:`, err.message);
    }
  }

  return { scanned: sources.length, results: totalResults };
};

module.exports = { runScan, scanSource, scoreRelevance };
