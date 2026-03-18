/**
 * Extract articles and images from newsletter/magazine PDFs and publish as posts.
 *
 * - Reads each newsletter PDF with mupdf
 * - Extracts text content per page and images
 * - Creates posts in the `posts` table under "Actualités" category
 * - Sets the 10 most recent as featured (for "À la Une")
 * - Saves extracted images as post featured images
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

// Directories
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const POSTS_IMAGES_DIR = path.join(UPLOADS_DIR, 'posts');
const DOCUMENTS_DIR = path.join(UPLOADS_DIR, 'documents', 'files');

// Ensure directories exist
[POSTS_IMAGES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/**
 * Extract structured text from a PDF page using mupdf
 */
async function extractPageText(page) {
  try {
    const json = page.toStructuredText('preserve-whitespace').asJSON();
    const data = JSON.parse(json);

    const lines = [];
    for (const block of data.blocks || []) {
      for (const line of block.lines || []) {
        let lineText = '';
        let maxFontSize = 0;
        let isBold = false;

        for (const span of line.spans || []) {
          lineText += span.text || '';
          const fontSize = span.font?.size || span.size || 12;
          if (fontSize > maxFontSize) maxFontSize = fontSize;
          if (span.font?.name && (span.font.name.includes('Bold') || span.font.name.includes('bold'))) {
            isBold = true;
          }
        }

        lineText = lineText.trim();
        if (lineText) {
          lines.push({ text: lineText, fontSize: maxFontSize, isBold });
        }
      }
    }
    return lines;
  } catch (e) {
    // Fallback: basic text extraction
    try {
      const text = page.toStructuredText('preserve-whitespace').asText();
      return text.split('\n').filter(l => l.trim()).map(l => ({
        text: l.trim(),
        fontSize: 12,
        isBold: false
      }));
    } catch (e2) {
      return [];
    }
  }
}

/**
 * Extract the first significant image from a PDF page and save as WebP
 */
async function extractPageImage(page, mupdf, docTitle, pageIndex) {
  try {
    const images = page.getImages();
    if (!images || images.length === 0) return null;

    // Try to get the largest image from the page
    let bestImage = null;
    let bestArea = 0;

    for (const img of images) {
      try {
        const bbox = img.bbox || img.getBounds?.() || null;
        if (bbox) {
          const w = Math.abs(bbox[2] - bbox[0]);
          const h = Math.abs(bbox[3] - bbox[1]);
          const area = w * h;
          if (area > bestArea) {
            bestArea = area;
            bestImage = img;
          }
        }
      } catch (e) {
        continue;
      }
    }

    return null; // Image extraction from mupdf structured content is limited
  } catch (e) {
    return null;
  }
}

/**
 * Render a full PDF page as a featured image using mupdf + sharp
 */
async function renderPageAsImage(page, mupdf, pageIndex, docId) {
  try {
    const bounds = page.getBounds();
    const pageWidth = bounds[2] - bounds[0];
    const scale = Math.max(800 / pageWidth, 1.5);
    const matrix = mupdf.Matrix.scale(scale, scale);
    const pixmap = page.toPixmap(matrix, mupdf.ColorSpace.DeviceRGB, false, true);

    const pixelWidth = pixmap.getWidth();
    const pixelHeight = pixmap.getHeight();
    const pixels = pixmap.getPixels();

    const filename = `newsletter-${docId}-p${pageIndex + 1}-${uuidv4().slice(0, 8)}.webp`;
    const filepath = path.join(POSTS_IMAGES_DIR, filename);

    await sharp(Buffer.from(pixels), {
      raw: { width: pixelWidth, height: pixelHeight, channels: 3 }
    })
      .resize(800, 600, { fit: 'cover', position: 'top' })
      .webp({ quality: 85 })
      .toFile(filepath);

    return `/uploads/posts/${filename}`;
  } catch (e) {
    console.error(`  Image render error page ${pageIndex + 1}:`, e.message);
    return null;
  }
}

/**
 * Parse extracted text lines into article segments.
 * Heuristic: large/bold text = heading = new article boundary
 */
function parseArticles(allPages) {
  const articles = [];
  let currentArticle = null;

  for (const { lines, pageIndex } of allPages) {
    // Compute median font size for this page
    const fontSizes = lines.map(l => l.fontSize).filter(f => f > 0);
    const medianFontSize = fontSizes.length > 0
      ? fontSizes.sort((a, b) => a - b)[Math.floor(fontSizes.length / 2)]
      : 12;

    const headingThreshold = medianFontSize * 1.3;

    for (const line of lines) {
      const isHeading = (line.fontSize >= headingThreshold || line.isBold)
        && line.text.length > 5
        && line.text.length < 200
        && !line.text.match(/^[\d\s\.\-\/]+$/) // Not just numbers/dates
        && !line.text.match(/^page\s*\d+$/i); // Not page numbers

      if (isHeading) {
        // Save previous article if it has content
        if (currentArticle && currentArticle.body.length > 50) {
          articles.push(currentArticle);
        }
        currentArticle = {
          title: line.text,
          body: '',
          startPage: pageIndex,
        };
      } else if (currentArticle) {
        currentArticle.body += line.text + '\n';
      }
    }
  }

  // Push last article
  if (currentArticle && currentArticle.body.length > 50) {
    articles.push(currentArticle);
  }

  return articles;
}

/**
 * Clean and format article body text into HTML
 */
function formatBodyAsHtml(text) {
  // Split into paragraphs (double newline or significant gaps)
  const paragraphs = text
    .split(/\n{2,}/)
    .map(p => p.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(p => p.length > 20); // Skip very short fragments

  if (paragraphs.length === 0) return '';

  return paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('\n');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Generate a unique slug
 */
async function generateUniqueSlug(title) {
  let slug = slugify(title, { lower: true, strict: true, locale: 'fr' });
  if (!slug || slug.length < 3) slug = `article-${Date.now()}`;
  slug = slug.slice(0, 100); // Limit length

  const [existing] = await db.query('SELECT id FROM posts WHERE slug = ?', [slug]);
  if (existing.length > 0) {
    slug = `${slug}-${Date.now()}`;
  }
  return slug;
}

/**
 * Create an excerpt from body text
 */
function createExcerpt(body, maxLen = 200) {
  const clean = body.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen).replace(/\s+\S*$/, '') + '...';
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('=== Newsletter Article Extractor ===\n');

  const mupdf = await import('mupdf');

  // 1. Get category IDs
  const [categories] = await db.query("SELECT id, slug, name FROM categories WHERE slug IN ('actualites', 'activites', 'evenements')");

  let actualitesId = null;
  let activitesId = null;

  for (const cat of categories) {
    if (cat.slug === 'actualites') actualitesId = cat.id;
    if (cat.slug === 'activites') activitesId = cat.id;
  }

  // Create "Activités" category if it doesn't exist
  if (!activitesId) {
    const [result] = await db.query(
      "INSERT INTO categories (name, name_fr, name_en, slug, description, description_fr, description_en, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'active')",
      ['Activités', 'Activités', 'Activities', 'activites', 'Activités One Health', 'Activités One Health', 'One Health Activities']
    );
    activitesId = result.insertId;
    console.log(`Created "Activités" category (id: ${activitesId})`);
  }

  if (!actualitesId) {
    console.error('Category "Actualités" not found! Check the categories table.');
    process.exit(1);
  }

  console.log(`Categories: Actualités=#${actualitesId}, Activités=#${activitesId}\n`);

  // 2. Get admin user ID (for author_id)
  const [admins] = await db.query("SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1");
  const authorId = admins.length > 0 ? admins[0].id : 1;
  console.log(`Author ID: ${authorId}\n`);

  // 3. Fetch all newsletter/magazine PDFs
  const [docs] = await db.query(`
    SELECT id, title, title_fr, title_en, type, file_path, publication_date, description, thumbnail
    FROM document_resources
    WHERE is_active = 1
      AND type IN ('newsletter', 'magazine')
      AND file_path IS NOT NULL
      AND (file_type = 'pdf' OR file_type = 'application/pdf' OR file_path LIKE '%.pdf')
    ORDER BY publication_date DESC, created_at DESC
  `);

  console.log(`Found ${docs.length} newsletter/magazine PDFs.\n`);

  if (docs.length === 0) {
    console.log('Nothing to do.');
    process.exit(0);
  }

  const allCreatedPosts = [];

  for (const doc of docs) {
    const docTitle = doc.title_fr || doc.title || doc.title_en || `Newsletter ${doc.id}`;
    console.log(`\n--- Processing: ${docTitle} (${doc.type}) ---`);

    const pdfPath = path.join(__dirname, '..', doc.file_path);

    if (!fs.existsSync(pdfPath)) {
      console.log(`  SKIP: file not found at ${pdfPath}`);
      continue;
    }

    try {
      // Open PDF with mupdf
      const pdfBuffer = fs.readFileSync(pdfPath);
      const pdfDoc = mupdf.Document.openDocument(pdfBuffer, 'application/pdf');
      const pageCount = pdfDoc.countPages();
      console.log(`  Pages: ${pageCount}`);

      // Extract text from all pages
      const allPages = [];
      for (let i = 0; i < pageCount; i++) {
        const page = pdfDoc.loadPage(i);
        const lines = await extractPageText(page);
        allPages.push({ lines, pageIndex: i, page });
      }

      // Parse articles from text
      let articles = parseArticles(allPages);
      console.log(`  Articles parsed: ${articles.length}`);

      // If no articles found via headings, create one article per 2-3 pages
      if (articles.length === 0) {
        console.log('  No article boundaries found, grouping by pages...');
        const pagesPerArticle = pageCount <= 4 ? pageCount : 2;

        for (let i = 0; i < pageCount; i += pagesPerArticle) {
          const endPage = Math.min(i + pagesPerArticle, pageCount);
          let body = '';
          for (let p = i; p < endPage; p++) {
            body += allPages[p].lines.map(l => l.text).join('\n') + '\n\n';
          }
          if (body.trim().length > 100) {
            articles.push({
              title: `${docTitle} - ${i === 0 ? 'Éditorial' : `Pages ${i + 1}-${endPage}`}`,
              body: body.trim(),
              startPage: i
            });
          }
        }
      }

      // Filter articles with meaningful content
      articles = articles.filter(a => {
        const bodyLen = a.body.replace(/\s+/g, ' ').trim().length;
        return bodyLen > 80 && a.title.length > 3;
      });

      // Limit to max 8 articles per newsletter to avoid noise
      if (articles.length > 8) {
        articles = articles.slice(0, 8);
      }

      console.log(`  Articles to create: ${articles.length}`);

      // Decide category: newsletters → Actualités, magazines → Activités (or mix)
      const categoryId = doc.type === 'magazine' ? activitesId : actualitesId;

      for (let ai = 0; ai < articles.length; ai++) {
        const article = articles[ai];

        // Clean up title
        let title = article.title
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 250);

        // Skip if title looks like garbage
        if (title.length < 5 || /^[\d\s\.\-\/,]+$/.test(title)) continue;

        const htmlBody = formatBodyAsHtml(article.body);
        if (!htmlBody) continue;

        const excerpt = createExcerpt(article.body);
        const slug = await generateUniqueSlug(title);

        // Render the article's start page as featured image
        let featuredImage = null;
        try {
          const page = pdfDoc.loadPage(article.startPage);
          featuredImage = await renderPageAsImage(page, mupdf, article.startPage, doc.id);
        } catch (e) {
          // Use newsletter thumbnail as fallback
          if (doc.thumbnail) featuredImage = doc.thumbnail;
        }

        // Use the newsletter's publication date
        const pubDate = doc.publication_date
          ? new Date(doc.publication_date).toISOString().slice(0, 19).replace('T', ' ')
          : new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Insert post
        const [result] = await db.query(
          `INSERT INTO posts (
            title, title_fr, title_en, slug, content, content_fr, content_en,
            excerpt, excerpt_fr, excerpt_en, featured_image, author_id, category_id,
            type, status, visibility, featured, allow_comments,
            meta_description, meta_description_fr, meta_description_en,
            published_at, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'post', 'published', 'public', 0, 1, ?, ?, ?, ?, NOW())`,
          [
            title, title, title, slug,
            htmlBody, htmlBody, htmlBody,
            excerpt, excerpt, excerpt,
            featuredImage,
            authorId,
            categoryId,
            excerpt, excerpt, excerpt,
            pubDate, pubDate
          ]
        );

        allCreatedPosts.push({
          id: result.insertId,
          title,
          pubDate,
          source: docTitle
        });

        console.log(`  ✓ Article #${ai + 1}: "${title.slice(0, 60)}..." (post #${result.insertId})`);
      }

    } catch (error) {
      console.error(`  ERROR processing ${docTitle}:`, error.message);
    }
  }

  console.log(`\n=== Total articles created: ${allCreatedPosts.length} ===\n`);

  // 4. Set the 10 most recent articles as featured
  if (allCreatedPosts.length > 0) {
    // Sort by publication date descending
    allCreatedPosts.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    const featuredIds = allCreatedPosts.slice(0, 10).map(p => p.id);

    // First, unfeatured all newsletter-created posts
    const allIds = allCreatedPosts.map(p => p.id);
    await db.query(`UPDATE posts SET featured = 0 WHERE id IN (${allIds.map(() => '?').join(',')})`, allIds);

    // Then feature the top 10
    await db.query(`UPDATE posts SET featured = 1 WHERE id IN (${featuredIds.map(() => '?').join(',')})`, featuredIds);

    console.log(`Featured posts (top 10):`);
    for (const p of allCreatedPosts.slice(0, 10)) {
      console.log(`  ⭐ #${p.id}: ${p.title.slice(0, 60)}...`);
    }
  }

  console.log('\n=== Done! ===');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
