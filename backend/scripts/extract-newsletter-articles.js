/**
 * Extract articles from newsletter/magazine PDFs and publish as posts.
 *
 * Strategy:
 * - PDFs WITH extractable text: parse articles by headings, use text as content
 * - PDFs WITHOUT text (graphical): create articles per group of pages with rendered images
 * - All articles get a rendered page as featured image
 * - Published under "Actualités" (newsletters) or "Activités" (magazines)
 * - The 10 most recent are marked as featured for the homepage "À la Une"
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

/**
 * Render a PDF page as a WebP image
 */
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

/**
 * Extract plain text from a page (returns empty string for graphical PDFs)
 */
function getPageText(page) {
  try {
    return page.toStructuredText('preserve-whitespace').asText().trim();
  } catch { return ''; }
}

/**
 * Extract structured lines with font info from a page
 */
function getStructuredLines(page) {
  try {
    const json = page.toStructuredText('preserve-whitespace').asJSON();
    const data = JSON.parse(json);
    const lines = [];
    for (const block of data.blocks || []) {
      for (const line of block.lines || []) {
        let text = '';
        let maxSize = 0;
        let bold = false;
        for (const span of line.spans || []) {
          text += span.text || '';
          const sz = span.font?.size || span.size || 12;
          if (sz > maxSize) maxSize = sz;
          if (span.font?.name?.match(/bold/i)) bold = true;
        }
        text = text.trim();
        if (text) lines.push({ text, fontSize: maxSize, bold });
      }
    }
    return lines;
  } catch { return []; }
}

/**
 * Check if a PDF has extractable text (sample a few pages)
 */
function hasExtractableText(pdfDoc, mupdf) {
  const pc = pdfDoc.countPages();
  const pagesToCheck = [0, 2, 5, Math.floor(pc / 2)].filter(i => i < pc);
  let totalChars = 0;
  for (const pi of pagesToCheck) {
    const page = pdfDoc.loadPage(pi);
    totalChars += getPageText(page).length;
  }
  return totalChars > 200; // At least 200 chars across sampled pages
}

// ─── Text-based article extraction ──────────────────────────

function extractTextArticles(pdfDoc, mupdf) {
  const pc = pdfDoc.countPages();
  const articles = [];
  let current = null;

  for (let pi = 0; pi < pc; pi++) {
    const page = pdfDoc.loadPage(pi);
    const lines = getStructuredLines(page);
    if (lines.length === 0) continue;

    // Compute median font size for heading detection
    const sizes = lines.map(l => l.fontSize).filter(s => s > 0);
    const median = sizes.length > 0 ? sizes.sort((a, b) => a - b)[Math.floor(sizes.length / 2)] : 12;
    const threshold = median * 1.2;

    for (const line of lines) {
      const isHeading = (line.fontSize >= threshold || line.bold)
        && line.text.length > 8
        && line.text.length < 180
        && !/^\d+$/.test(line.text)
        && !/^page\s*\d+$/i.test(line.text)
        && !/^une seule sant/i.test(line.text)
        && !/^no\s*\d+/i.test(line.text);

      if (isHeading) {
        if (current && current.body.length > 100) articles.push(current);
        current = { title: line.text, body: '', startPage: pi };
      } else if (current) {
        current.body += line.text + '\n';
      }
    }
  }
  if (current && current.body.length > 100) articles.push(current);

  return articles;
}

// ─── Visual/page-based article creation ─────────────────────

function createVisualArticles(pdfDoc, docTitle, docDescription) {
  const pc = pdfDoc.countPages();
  const articles = [];

  // Skip page 1 (cover) and last page (back cover), group content pages
  const startPage = Math.min(1, pc - 1); // skip cover
  const endPage = Math.max(startPage + 1, pc - 1); // skip back cover
  const contentPages = endPage - startPage;

  // Group into ~3-4 page sections
  const groupSize = contentPages <= 8 ? 3 : 4;

  for (let i = startPage; i < endPage; i += groupSize) {
    const end = Math.min(i + groupSize, endPage);
    const pageNum = i + 1;

    let sectionTitle;
    if (i === startPage) {
      sectionTitle = `${docTitle} - Éditorial`;
    } else {
      sectionTitle = `${docTitle} - Section ${Math.floor((i - startPage) / groupSize) + 1}`;
    }

    articles.push({
      title: sectionTitle,
      startPage: i,
      endPage: end,
      isVisual: true
    });
  }

  return articles;
}

// ─── MAIN ───────────────────────────────────────────────────

async function main() {
  console.log('=== Newsletter Article Extractor ===\n');

  const mupdf = await import('mupdf');

  // 1. Categories
  const [categories] = await db.query("SELECT id, slug FROM categories WHERE slug IN ('actualites', 'activites')");
  let actualitesId = null, activitesId = null;
  for (const c of categories) {
    if (c.slug === 'actualites') actualitesId = c.id;
    if (c.slug === 'activites') activitesId = c.id;
  }
  if (!activitesId) {
    const [r] = await db.query(
      "INSERT INTO categories (name, name_fr, name_en, slug, description, description_fr, description_en, status) VALUES (?,?,?,?,?,?,?,'active')",
      ['Activités', 'Activités', 'Activities', 'activites', 'Activités One Health', 'Activités One Health', 'One Health Activities']
    );
    activitesId = r.insertId;
    console.log(`Created "Activités" category (#${activitesId})`);
  }
  if (!actualitesId) { console.error('"Actualités" category not found!'); process.exit(1); }
  console.log(`Categories: Actualités=#${actualitesId}, Activités=#${activitesId}`);

  // 2. Admin author
  const [admins] = await db.query("SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1");
  const authorId = admins.length > 0 ? admins[0].id : 1;
  console.log(`Author: #${authorId}\n`);

  // 3. Fetch newsletter/magazine PDFs
  const [docs] = await db.query(`
    SELECT id, title, type, file_path, publication_date, description, thumbnail
    FROM document_resources
    WHERE is_active = 1 AND type IN ('newsletter', 'magazine')
      AND file_path IS NOT NULL
      AND (file_type = 'pdf' OR file_type = 'application/pdf' OR file_path LIKE '%.pdf')
    ORDER BY publication_date DESC, created_at DESC
  `);

  console.log(`Found ${docs.length} PDFs.\n`);
  if (docs.length === 0) { process.exit(0); }

  const allPosts = [];
  const API_BASE = process.env.API_URL || process.env.BACKEND_URL || '';

  for (const doc of docs) {
    const docTitle = doc.title || `Newsletter #${doc.id}`;
    const pdfPath = path.join(__dirname, '..', doc.file_path);
    console.log(`\n--- ${docTitle} (${doc.type}) ---`);

    if (!fs.existsSync(pdfPath)) { console.log('  SKIP: not found'); continue; }

    try {
      const pdfBuffer = fs.readFileSync(pdfPath);
      const pdfDoc = mupdf.Document.openDocument(pdfBuffer, 'application/pdf');
      const pc = pdfDoc.countPages();
      console.log(`  ${pc} pages`);

      const hasText = hasExtractableText(pdfDoc, mupdf);
      console.log(`  Text extractable: ${hasText}`);

      const categoryId = doc.type === 'magazine' ? activitesId : actualitesId;
      const pubDate = doc.publication_date
        ? new Date(doc.publication_date).toISOString().slice(0, 19).replace('T', ' ')
        : new Date().toISOString().slice(0, 19).replace('T', ' ');

      let articles;

      if (hasText) {
        // ── Text-based extraction ──
        articles = extractTextArticles(pdfDoc, mupdf);
        console.log(`  Text articles found: ${articles.length}`);

        // If heading-based parsing failed, group by pages with text
        if (articles.length === 0) {
          for (let pi = 1; pi < pc - 1; pi += 3) {
            const endPi = Math.min(pi + 3, pc - 1);
            let body = '';
            for (let p = pi; p < endPi; p++) {
              body += getPageText(pdfDoc.loadPage(p)) + '\n\n';
            }
            if (body.trim().length > 150) {
              // Use first meaningful line as title
              const firstLine = body.trim().split('\n').find(l => l.trim().length > 10 && l.trim().length < 150);
              articles.push({
                title: firstLine || `${docTitle} - Pages ${pi + 1}-${endPi}`,
                body: body.trim(),
                startPage: pi
              });
            }
          }
        }

        // Limit and filter
        articles = articles.filter(a => a.body && a.body.replace(/\s/g, '').length > 80);
        if (articles.length > 8) articles = articles.slice(0, 8);

        for (const art of articles) {
          const title = art.title.replace(/\s+/g, ' ').trim().slice(0, 250);
          if (title.length < 5) continue;

          // Format body as HTML paragraphs
          const paragraphs = art.body.split(/\n{2,}/)
            .map(p => p.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim())
            .filter(p => p.length > 30);
          if (paragraphs.length === 0) continue;

          const htmlContent = paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('\n');

          // Add link to full PDF at the end
          const pdfLink = `<p><strong><a href="${escapeHtml(doc.file_path)}" target="_blank">📄 Lire la newsletter complète (PDF)</a></strong></p>`;
          const fullHtml = htmlContent + '\n' + pdfLink;

          const excerpt = createExcerpt(art.body);
          const slug = await generateUniqueSlug(title);

          // Render featured image
          let featuredImage = null;
          try {
            const page = pdfDoc.loadPage(art.startPage);
            featuredImage = await renderPageAsImage(page, mupdf, art.startPage, doc.id);
          } catch (e) { featuredImage = doc.thumbnail || null; }

          const [result] = await db.query(
            `INSERT INTO posts (title, title_fr, title_en, slug, content, content_fr, content_en,
             excerpt, excerpt_fr, excerpt_en, featured_image, author_id, category_id,
             type, status, visibility, featured, allow_comments,
             meta_description, meta_description_fr, meta_description_en,
             published_at, created_at)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'post','published','public',0,1,?,?,?,?,NOW())`,
            [title, title, title, slug, fullHtml, fullHtml, fullHtml,
             excerpt, excerpt, excerpt, featuredImage, authorId, categoryId,
             excerpt, excerpt, excerpt, pubDate, pubDate]
          );

          allPosts.push({ id: result.insertId, title, pubDate, source: docTitle });
          console.log(`  ✓ "${title.slice(0, 55)}..." (post #${result.insertId})`);
        }

      } else {
        // ── Visual/graphical PDF → create articles from page renders ──
        const visualArticles = createVisualArticles(pdfDoc, docTitle, doc.description);
        console.log(`  Visual sections: ${visualArticles.length}`);

        for (const vart of visualArticles) {
          const title = vart.title.slice(0, 250);
          const slug = await generateUniqueSlug(title);

          // Render all pages in this section as images
          const imageUrls = [];
          for (let pi = vart.startPage; pi < vart.endPage; pi++) {
            const page = pdfDoc.loadPage(pi);
            const imgUrl = await renderPageAsImage(page, mupdf, pi, doc.id);
            if (imgUrl) imageUrls.push(imgUrl);
          }

          if (imageUrls.length === 0) continue;

          // Build HTML content with rendered page images
          let htmlContent = `<p><em>Extrait de : ${escapeHtml(docTitle)}</em></p>\n`;
          if (doc.description) {
            htmlContent += `<p>${escapeHtml(doc.description)}</p>\n`;
          }
          for (const imgUrl of imageUrls) {
            htmlContent += `<figure><img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(title)}" style="width:100%;max-width:800px;border-radius:8px;margin:10px 0" /></figure>\n`;
          }
          // Link to full PDF
          htmlContent += `<p><strong><a href="${escapeHtml(doc.file_path)}" target="_blank">📄 Lire la publication complète (PDF)</a></strong></p>`;

          const excerpt = doc.description
            ? createExcerpt(doc.description)
            : `Découvrez cette section de ${docTitle}. Cliquez pour consulter le contenu complet.`;

          const featuredImage = imageUrls[0];

          const [result] = await db.query(
            `INSERT INTO posts (title, title_fr, title_en, slug, content, content_fr, content_en,
             excerpt, excerpt_fr, excerpt_en, featured_image, author_id, category_id,
             type, status, visibility, featured, allow_comments,
             meta_description, meta_description_fr, meta_description_en,
             published_at, created_at)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'post','published','public',0,1,?,?,?,?,NOW())`,
            [title, title, title, slug, htmlContent, htmlContent, htmlContent,
             excerpt, excerpt, excerpt, featuredImage, authorId, categoryId,
             excerpt, excerpt, excerpt, pubDate, pubDate]
          );

          allPosts.push({ id: result.insertId, title, pubDate, source: docTitle });
          console.log(`  ✓ "${title.slice(0, 55)}..." (post #${result.insertId})`);
        }
      }

    } catch (error) {
      console.error(`  ERROR: ${error.message}`);
    }
  }

  console.log(`\n=== Total articles created: ${allPosts.length} ===\n`);

  // 4. Mark top 10 as featured
  if (allPosts.length > 0) {
    allPosts.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    const allIds = allPosts.map(p => p.id);
    const top10 = allPosts.slice(0, 10).map(p => p.id);

    await db.query(`UPDATE posts SET featured = 0 WHERE id IN (${allIds.map(() => '?').join(',')})`, allIds);
    await db.query(`UPDATE posts SET featured = 1 WHERE id IN (${top10.map(() => '?').join(',')})`, top10);

    console.log('Featured (top 10):');
    allPosts.slice(0, 10).forEach(p => console.log(`  ⭐ #${p.id}: ${p.title.slice(0, 60)}`));
  }

  console.log('\n=== Done! ===');
  process.exit(0);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
