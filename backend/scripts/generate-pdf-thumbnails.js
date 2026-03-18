/**
 * Batch script to generate PDF thumbnails for existing documents.
 * Finds all document_resources with PDF files that have no thumbnail,
 * generates a thumbnail for each, and updates the database.
 *
 * Usage: node backend/scripts/generate-pdf-thumbnails.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../config/db');
const { generateThumbnailFromUrlPath } = require('../services/pdfThumbnailService');

async function main() {
  console.log('=== PDF Thumbnail Batch Generator ===\n');

  try {
    // Find all PDF documents without thumbnails
    const [docs] = await db.query(`
      SELECT id, title, file_path, file_type
      FROM document_resources
      WHERE is_active = 1
        AND (thumbnail IS NULL OR thumbnail = '')
        AND file_path IS NOT NULL
        AND (
          file_type = 'pdf'
          OR file_type = 'application/pdf'
          OR file_path LIKE '%.pdf'
        )
      ORDER BY id
    `);

    console.log(`Found ${docs.length} PDF document(s) without thumbnails.\n`);

    if (docs.length === 0) {
      console.log('Nothing to do.');
      process.exit(0);
    }

    let success = 0;
    let failed = 0;

    for (const doc of docs) {
      process.stdout.write(`[${doc.id}] ${doc.title}... `);

      const thumbnail = await generateThumbnailFromUrlPath(doc.file_path);

      if (thumbnail) {
        await db.query('UPDATE document_resources SET thumbnail = ? WHERE id = ?', [thumbnail, doc.id]);
        console.log(`OK -> ${thumbnail}`);
        success++;
      } else {
        console.log('FAILED');
        failed++;
      }
    }

    console.log(`\n=== Done: ${success} generated, ${failed} failed ===`);
  } catch (error) {
    console.error('Fatal error:', error);
  }

  process.exit(0);
}

main();
