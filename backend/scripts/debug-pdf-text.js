require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../config/db');
const path = require('path');
const fs = require('fs');

async function main() {
  const mupdf = await import('mupdf');
  const [docs] = await db.query(
    "SELECT id, title, file_path FROM document_resources WHERE type IN ('newsletter','magazine') ORDER BY id LIMIT 3"
  );

  for (const doc of docs) {
    const pdfPath = path.join(__dirname, '..', doc.file_path);
    if (!fs.existsSync(pdfPath)) { console.log('SKIP:', doc.title); continue; }

    const buf = fs.readFileSync(pdfPath);
    const pdfDoc = mupdf.Document.openDocument(buf, 'application/pdf');
    const pc = pdfDoc.countPages();
    console.log(`\n=== ${doc.title} (${pc} pages) ===`);

    for (const pi of [0, 2, 5, 10]) {
      if (pi >= pc) continue;
      try {
        const page = pdfDoc.loadPage(pi);
        const text = page.toStructuredText('preserve-whitespace').asText();
        console.log(`  Page ${pi + 1}: ${text.length} chars => ${JSON.stringify(text.slice(0, 200))}`);
      } catch (e) {
        console.log(`  Page ${pi + 1}: error ${e.message}`);
      }
    }
  }
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
