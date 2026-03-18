require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../config/db');
const path = require('path');
const fs = require('fs');

async function main() {
  const mupdf = await import('mupdf');
  // Focus on PDFs with actual text
  const [docs] = await db.query(
    "SELECT id, title, file_path FROM document_resources WHERE type IN ('newsletter','magazine') AND file_path LIKE '%.pdf' ORDER BY publication_date DESC"
  );

  for (const doc of docs) {
    const pdfPath = path.join(__dirname, '..', doc.file_path);
    if (!fs.existsSync(pdfPath)) continue;

    const buf = fs.readFileSync(pdfPath);
    const pdfDoc = mupdf.Document.openDocument(buf, 'application/pdf');
    const pc = pdfDoc.countPages();

    // Check if it has text
    let totalChars = 0;
    for (let i = 0; i < Math.min(pc, 5); i++) {
      totalChars += pdfDoc.loadPage(i).toStructuredText('preserve-whitespace').asText().length;
    }
    if (totalChars < 500) continue;

    console.log(`\n${'='.repeat(80)}`);
    console.log(`${doc.title} (${pc} pages)`);
    console.log('='.repeat(80));

    // Dump raw text for pages 2-12 (skip cover)
    for (let pi = 1; pi < Math.min(pc, 12); pi++) {
      const page = pdfDoc.loadPage(pi);
      const text = page.toStructuredText('preserve-whitespace').asText();
      if (text.trim().length < 20) continue;
      console.log(`\n>>> PAGE ${pi + 1} (${text.length} chars) <<<`);
      console.log(text.slice(0, 800));
      console.log('...');
    }
  }
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
