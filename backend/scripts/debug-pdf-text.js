require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../config/db');
const path = require('path');
const fs = require('fs');

async function main() {
  const mupdf = await import('mupdf');
  const [docs] = await db.query(
    "SELECT id, title, file_path FROM document_resources WHERE type IN ('newsletter','magazine') AND file_path LIKE '%.pdf' ORDER BY publication_date DESC"
  );

  for (const doc of docs) {
    const pdfPath = path.join(__dirname, '..', doc.file_path);
    if (!fs.existsSync(pdfPath)) continue;

    const buf = fs.readFileSync(pdfPath);
    const pdfDoc = mupdf.Document.openDocument(buf, 'application/pdf');
    const pc = pdfDoc.countPages();

    // Check total text
    let totalChars = 0;
    for (let i = 0; i < Math.min(pc, 5); i++) {
      totalChars += pdfDoc.loadPage(i).toStructuredText('preserve-whitespace').asText().length;
    }
    if (totalChars < 200) {
      console.log(`\n=== SKIP ${doc.title} (no text) ===`);
      continue;
    }

    console.log(`\n========== ${doc.title} (${pc} pages, ~${totalChars} chars in first 5p) ==========`);

    // Dump structured text with font info for pages 2-6
    for (let pi = 1; pi < Math.min(pc, 7); pi++) {
      const page = pdfDoc.loadPage(pi);
      console.log(`\n--- Page ${pi + 1} ---`);
      try {
        const json = page.toStructuredText('preserve-whitespace').asJSON();
        const data = JSON.parse(json);
        for (const block of data.blocks || []) {
          for (const line of block.lines || []) {
            let text = '';
            let sizes = [];
            let fonts = [];
            for (const span of line.spans || []) {
              text += span.text || '';
              if (span.font) {
                sizes.push(Math.round((span.font.size || 0) * 10) / 10);
                fonts.push(span.font.name || '?');
              }
            }
            text = text.trim();
            if (!text) continue;
            const sz = sizes.length > 0 ? Math.max(...sizes) : 0;
            const font = [...new Set(fonts)].join(',');
            const tag = sz > 14 ? ' <<LARGE>>' : sz > 11 ? ' <<MED>>' : '';
            console.log(`  [${sz}|${font.slice(0,20)}]${tag} ${text.slice(0, 120)}`);
          }
        }
      } catch (e) {
        console.log('  Error:', e.message);
      }
    }
  }
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
