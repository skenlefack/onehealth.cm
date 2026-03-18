/**
 * Extract articles from newsletter PDFs with REAL extractable text.
 *
 * Strategy:
 * - ONLY process newsletters with extractable text (skip graphical PDFs & magazines)
 * - Parse sections by section markers (EDITORIAL, EN BREF, DOSSIER, COORDINATION, etc.)
 * - Extract real article titles from text following section markers
 * - One article per section occurrence, with rendered PDF page as featured image
 * - Published under "Actualités" category
 * - 10 most recent marked as featured for homepage "À la Une"
 *
 * Usage: node backend/scripts/extract-newsletter-articles.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const slugify = require('slugify');
const { v4: uuidv4 } = require('uuid');

const POSTS_IMAGES_DIR = path.join(__dirname, '..', 'uploads', 'posts');
if (!fs.existsSync(POSTS_IMAGES_DIR)) fs.mkdirSync(POSTS_IMAGES_DIR, { recursive: true });

// ─── Section marker patterns ───────────────────────────────

const SECTION_MARKERS = [
  { regex: /^E\s*D\s*I\s*T\s*O\s*R\s*I\s*A\s*L$/i, name: 'Éditorial' },
  { regex: /^Edito$/i, name: 'Éditorial' },
  { regex: /^Editorial$/i, name: 'Éditorial' },
  { regex: /^E\s*N\s+B\s*R\s*E\s*F$/i, name: 'En bref' },
  { regex: /^En bref$/i, name: 'En bref' },
  { regex: /^D\s*O\s*S\s*S\s*I\s*E\s*R$/i, name: 'Dossier' },
  { regex: /^DOSSIER$/i, name: 'Dossier' },
  { regex: /^C\s*O\s*O\s*R\s*D\s*I\s*N\s*A\s*T\s*I\s*O\s*N$/i, name: 'Coordination' },
  { regex: /^Coordination$/i, name: 'Coordination' },
  { regex: /^F\s*O\s*R\s*M\s*A\s*T\s*I\s*O\s*N$/i, name: 'Formation' },
  { regex: /^P\s*R\s*[EÉ]\s*P\s*A\s*R\s*A\s*T\s*I\s*O\s*N$/i, name: 'Préparation' },
  { regex: /^VARIOLE DU SINGE$/i, name: 'Variole du singe' },
  { regex: /^Focus YOHF$/i, name: 'Focus YOHF' },
  { regex: /^Diplomatie$/i, name: 'Diplomatie' },
  // Table of contents — skip
  { regex: /^S\s*O\s*M\s*M\s*A\s*I\s*R\s*E$/i, name: '_SKIP_' },
  { regex: /^Sommaire$/i, name: '_SKIP_' },
];

const PAGE_HEADER_PATTERNS = [
  /^Page\s+\d+\s*\/.*$/i,
  /^Une Seule Santé du Cameroun\s+(No|N°)\s*\d+.*$/i,
  /^WWW\.ONEHEALTH\.CM$/i,
  /^CAMEROON One Health Magazine.*$/i,
  /^\d{1,2}$/, // standalone page numbers
];

const SKIP_LINE_PATTERNS = [
  /^(Directeur de publication|Coordonnateurs?\s+(éditoriaux|de la)|Ont collaboré|Maquette|Crédit photo|Edition|Impression)/i,
  /^\(?(MINCOM|MINSANTE|MINEPIA|PNPLZER|MINADER|ONACC|MINEPDED|MINFOF|GIZ|FAO|OMS|USAID)\)?$/i,
  /^(Traducteur|Infograph)/i,
  /\.{5,}/, // dotted lines (table of contents entries)
  /^(•|·)\s/, // bullet points from table of contents
];

// ─── Helpers ────────────────────────────────────────────────

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function generateUniqueSlug(title) {
  let slug = slugify(title, { lower: true, strict: true, locale: 'fr' });
  if (!slug || slug.length < 3) slug = `article-${Date.now()}`;
  slug = slug.slice(0, 100);
  const [existing] = await db.query('SELECT id FROM posts WHERE slug = ?', [slug]);
  if (existing.length > 0) slug = `${slug}-${Date.now()}`;
  return slug;
}

function createExcerpt(text, maxLen = 200) {
  const clean = text.replace(/<[^>]+>/g, '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen).replace(/\s+\S*$/, '') + '...';
}

function isPageHeader(line) {
  return PAGE_HEADER_PATTERNS.some(p => p.test(line.trim()));
}

function isSkipLine(line) {
  return SKIP_LINE_PATTERNS.some(p => p.test(line.trim()));
}

function detectSectionMarker(line) {
  const trimmed = line.trim();
  for (const marker of SECTION_MARKERS) {
    if (marker.regex.test(trimmed)) return marker.name;
  }
  return null;
}

function isDropCap(line) {
  // Single uppercase letter on its own line (PDF drop-cap rendering)
  return /^[A-ZÀ-Ú]$/.test(line.trim());
}

function isAuthorLine(line) {
  const t = line.trim();
  return /^(Chef|Coordonnat|Secrétaire|Membre|Ministre|Directeur|Président)/i.test(t)
    || /^(Dr\.|M\.|Mme|Mr\.|Mrs\.)\s/i.test(t)
    || /^[A-Z]{2,}\s+[A-Z]{2,}/.test(t) // ALL CAPS name like "DJENY NGANDO Damaris"
    || /\b(MINCOM|MINSANTE|MINEPIA|PNPLZER|MINADER|ONACC)\b/.test(t);
}

function isTitleCandidate(line) {
  const t = line.trim();
  if (t.length < 12 || t.length > 200) return false;
  if (isPageHeader(t)) return false;
  if (isSkipLine(t)) return false;
  if (isDropCap(t)) return false;
  if (isAuthorLine(t)) return false;
  if (/^\d{1,2}$/.test(t)) return false;
  if (detectSectionMarker(t)) return false;
  return true;
}

async function renderPageAsImage(page, mupdf, pageIndex, docId) {
  try {
    const bounds = page.getBounds();
    const pageWidth = bounds[2] - bounds[0];
    const scale = Math.max(800 / pageWidth, 1.5);
    const matrix = mupdf.Matrix.scale(scale, scale);
    const pixmap = page.toPixmap(matrix, mupdf.ColorSpace.DeviceRGB, false, true);

    const w = pixmap.getWidth();
    const h = pixmap.getHeight();
    const pixels = pixmap.getPixels();

    const filename = `nl-${docId}-p${pageIndex + 1}-${uuidv4().slice(0, 8)}.webp`;
    const filepath = path.join(POSTS_IMAGES_DIR, filename);

    await sharp(Buffer.from(pixels), { raw: { width: w, height: h, channels: 3 } })
      .resize(800, 600, { fit: 'cover', position: 'top' })
      .webp({ quality: 85 })
      .toFile(filepath);

    return `/uploads/posts/${filename}`;
  } catch (e) {
    console.error(`  Image render error p${pageIndex + 1}:`, e.message);
    return null;
  }
}

function getPageText(page) {
  try {
    return page.toStructuredText('preserve-whitespace').asText().trim();
  } catch { return ''; }
}

function hasExtractableText(pdfDoc) {
  const pc = pdfDoc.countPages();
  let totalChars = 0;
  for (let i = 0; i < Math.min(pc, 5); i++) {
    totalChars += getPageText(pdfDoc.loadPage(i)).length;
  }
  return totalChars > 500;
}

// ─── Newsletter Parser ──────────────────────────────────────

/**
 * Clean page text: strip headers, fix drop-caps, normalize whitespace
 */
function cleanPageText(rawText) {
  let lines = rawText.split('\n');

  // Strip page headers
  lines = lines.filter(l => !isPageHeader(l.trim()));

  // Fix drop-caps: merge single uppercase letter with next line
  const merged = [];
  for (let i = 0; i < lines.length; i++) {
    if (isDropCap(lines[i]) && i + 1 < lines.length) {
      merged.push(lines[i].trim() + lines[i + 1]);
      i++; // skip next line
    } else {
      merged.push(lines[i]);
    }
  }

  return merged;
}

/**
 * Find article title from a list of lines starting at a given index.
 * Returns { title, nextIndex } or null.
 * May concatenate multiple short lines into one title.
 */
function findTitle(lines, startIdx) {
  let title = '';
  let linesUsed = 0;

  for (let i = startIdx; i < lines.length && linesUsed < 4; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (title) break; // empty line after title = end of title
      continue; // empty line before title = skip
    }

    if (isSkipLine(line)) continue;
    if (isAuthorLine(line)) continue;
    if (detectSectionMarker(line)) break; // another section marker
    if (isDropCap(line)) break; // drop-cap = body text starting

    if (!isTitleCandidate(line) && !title) continue;

    if (!title) {
      // First title line
      title = line;
      linesUsed = 1;
    } else if (line.length < 80 && (title.length + line.length) < 200) {
      // Title continuation (short line, total still reasonable)
      title += ' ' + line;
      linesUsed++;
    } else {
      break; // line too long = body text
    }
  }

  return title.length >= 12 ? title : null;
}

/**
 * Parse a newsletter PDF into article sections.
 */
function parseNewsletter(pdfDoc, docTitle) {
  const pc = pdfDoc.countPages();
  const articles = [];
  let current = null;

  // Start from page index 2 (page 3 in 1-indexed) to skip cover + credits
  for (let pi = 2; pi < pc; pi++) {
    const page = pdfDoc.loadPage(pi);
    const rawText = getPageText(page);
    if (rawText.length < 20) continue;

    const lines = cleanPageText(rawText);
    let lineIdx = 0;

    while (lineIdx < lines.length) {
      const line = lines[lineIdx].trim();

      if (!line) { lineIdx++; continue; }

      // Check for section marker
      const sectionName = detectSectionMarker(line);

      if (sectionName) {
        if (sectionName === '_SKIP_') {
          // Table of contents — skip this entire page
          current = null;
          break;
        }

        // Save previous article if it has substance
        if (current && current.bodyLines.length > 0) {
          const bodyText = current.bodyLines.join('\n').trim();
          if (bodyText.length > 80) {
            current.body = bodyText;
            articles.push(current);
          }
        }

        // Start new article section
        current = {
          sectionName,
          title: null,
          body: '',
          bodyLines: [],
          startPage: pi,
        };

        // Find title in the lines following the section marker
        lineIdx++;
        const foundTitle = findTitle(lines, lineIdx);
        if (foundTitle) {
          current.title = foundTitle;
          // Skip past the title lines
          const titleWords = foundTitle.split(' ');
          while (lineIdx < lines.length) {
            const l = lines[lineIdx].trim();
            if (l && foundTitle.includes(l.slice(0, 30))) {
              lineIdx++;
            } else {
              break;
            }
          }
        }
        continue;
      }

      // If no current article yet (text before any section marker on first pages),
      // start a default "Éditorial" section
      if (!current) {
        if (line.length > 20 && !isSkipLine(line) && !isAuthorLine(line)) {
          current = {
            sectionName: 'Éditorial',
            title: null,
            body: '',
            bodyLines: [],
            startPage: pi,
          };
          // Try to use this first substantive line as title
          if (isTitleCandidate(line)) {
            const foundTitle = findTitle(lines, lineIdx);
            if (foundTitle) {
              current.title = foundTitle;
              const titleWords = foundTitle.split(' ');
              while (lineIdx < lines.length) {
                const l = lines[lineIdx].trim();
                if (l && foundTitle.includes(l.slice(0, 30))) {
                  lineIdx++;
                } else {
                  break;
                }
              }
              continue;
            }
          }
        }
      }

      // Accumulate body text
      if (current && line.length > 1 && !isSkipLine(line)) {
        current.bodyLines.push(line);
      }

      lineIdx++;
    }
  }

  // Save last article
  if (current && current.bodyLines.length > 0) {
    const bodyText = current.bodyLines.join('\n').trim();
    if (bodyText.length > 80) {
      current.body = bodyText;
      articles.push(current);
    }
  }

  // Post-process: merge tiny initial sections into the next section
  const merged = [];
  for (let i = 0; i < articles.length; i++) {
    const art = articles[i];

    // If this article has almost no body but has a title, and the next article
    // has the same section name and no title, transfer the title
    if (art.body.length < 80 && art.title && i + 1 < articles.length) {
      const next = articles[i + 1];
      if (!next.title || next.sectionName === art.sectionName) {
        next.title = next.title || art.title;
        next.startPage = Math.min(next.startPage, art.startPage);
        continue; // skip this tiny article
      }
    }

    merged.push(art);
  }

  // Final: set default titles for articles without titles
  for (const art of merged) {
    if (!art.title) {
      art.title = `${docTitle} - ${art.sectionName}`;
    }
  }

  return merged;
}

// ─── MAIN ───────────────────────────────────────────────────

async function main() {
  console.log('=== Newsletter Article Extractor (Text-Only) ===\n');

  const mupdf = await import('mupdf');

  // 1. Get Actualités category
  const [categories] = await db.query("SELECT id, slug FROM categories WHERE slug = 'actualites'");
  if (categories.length === 0) {
    console.error('"Actualités" category not found!');
    process.exit(1);
  }
  const categoryId = categories[0].id;
  console.log(`Category: Actualités #${categoryId}`);

  // 2. Admin author
  const [admins] = await db.query("SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1");
  const authorId = admins.length > 0 ? admins[0].id : 1;
  console.log(`Author: #${authorId}\n`);

  // 3. Fetch newsletter PDFs (NOT magazines — they're mostly graphical)
  const [docs] = await db.query(`
    SELECT id, title, type, file_path, publication_date
    FROM document_resources
    WHERE is_active = 1 AND type = 'newsletter'
      AND file_path IS NOT NULL
      AND (file_type = 'pdf' OR file_type = 'application/pdf' OR file_path LIKE '%.pdf')
    ORDER BY publication_date DESC
  `);

  console.log(`Found ${docs.length} newsletter PDFs.\n`);

  const allPosts = [];

  for (const doc of docs) {
    const docTitle = doc.title || `Newsletter #${doc.id}`;
    const pdfPath = path.join(__dirname, '..', doc.file_path);
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`${docTitle}`);

    if (!fs.existsSync(pdfPath)) {
      console.log('  SKIP: file not found');
      continue;
    }

    try {
      const pdfBuffer = fs.readFileSync(pdfPath);
      const pdfDoc = mupdf.Document.openDocument(pdfBuffer, 'application/pdf');
      const pc = pdfDoc.countPages();
      console.log(`  ${pc} pages`);

      if (!hasExtractableText(pdfDoc)) {
        console.log('  SKIP: no extractable text (graphical PDF)');
        continue;
      }

      const pubDate = doc.publication_date
        ? new Date(doc.publication_date).toISOString().slice(0, 19).replace('T', ' ')
        : new Date().toISOString().slice(0, 19).replace('T', ' ');

      // Parse into sections/articles
      const articles = parseNewsletter(pdfDoc, docTitle);
      console.log(`  Articles found: ${articles.length}`);

      if (articles.length === 0) {
        console.log('  SKIP: no articles extracted');
        continue;
      }

      for (const article of articles) {
        const title = article.title.replace(/\s+/g, ' ').trim().slice(0, 250);

        // Build HTML content from body
        const paragraphs = article.body
          .split(/\n{2,}/)
          .map(p => p.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim())
          .filter(p => p.length > 15);

        if (paragraphs.length === 0) {
          console.log(`  SKIP [${article.sectionName}]: empty body after formatting`);
          continue;
        }

        let htmlContent = paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('\n');

        // Add source attribution and link to full PDF
        htmlContent += `\n<hr/>\n<p><em>Source : ${escapeHtml(docTitle)}</em></p>`;
        htmlContent += `\n<p><strong><a href="${escapeHtml(doc.file_path)}" target="_blank">📄 Lire la newsletter complète (PDF)</a></strong></p>`;

        const excerpt = createExcerpt(article.body);
        const slug = await generateUniqueSlug(title);

        // Render the article's starting page as featured image
        let featuredImage = null;
        try {
          const page = pdfDoc.loadPage(article.startPage);
          featuredImage = await renderPageAsImage(page, mupdf, article.startPage, doc.id);
        } catch (e) {
          console.error(`  Image error: ${e.message}`);
        }

        const [result] = await db.query(
          `INSERT INTO posts (title, title_fr, title_en, slug, content, content_fr, content_en,
           excerpt, excerpt_fr, excerpt_en, featured_image, author_id, category_id,
           type, status, visibility, featured, allow_comments,
           meta_description, meta_description_fr, meta_description_en,
           published_at, created_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'post','published','public',0,1,?,?,?,?,NOW())`,
          [title, title, title, slug, htmlContent, htmlContent, htmlContent,
           excerpt, excerpt, excerpt, featuredImage, authorId, categoryId,
           excerpt, excerpt, excerpt, pubDate]
        );

        allPosts.push({ id: result.insertId, title, pubDate, source: docTitle });
        console.log(`  ✓ [${article.sectionName}] "${title.slice(0, 65)}..." (#${result.insertId})`);
      }

    } catch (error) {
      console.error(`  ERROR: ${error.message}`);
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`Total articles created: ${allPosts.length}`);
  console.log('═'.repeat(60));

  // 4. Mark top 10 as featured for homepage "À la Une"
  if (allPosts.length > 0) {
    // Sort by publication date (newest first)
    allPosts.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    const allIds = allPosts.map(p => p.id);
    const top10 = allPosts.slice(0, 10).map(p => p.id);

    // Reset all new posts to not featured, then set top 10
    await db.query(`UPDATE posts SET featured = 0 WHERE id IN (${allIds.map(() => '?').join(',')})`, allIds);
    await db.query(`UPDATE posts SET featured = 1 WHERE id IN (${top10.map(() => '?').join(',')})`, top10);

    console.log('\nFeatured (top 10):');
    allPosts.slice(0, 10).forEach(p =>
      console.log(`  ⭐ #${p.id}: ${p.title.slice(0, 65)}`)
    );
  }

  console.log('\nDone!');
  process.exit(0);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
