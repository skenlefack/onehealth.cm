/**
 * Script to publish Newsletter and One Health Magazine PDFs
 * from the newsletter-magazine folder into document_resources
 *
 * Usage: node backend/scripts/publish-newsletters.js
 */

const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../config/db');

const SOURCE_DIR = path.join(__dirname, '..', '..', 'newsletter-magazine');
const DEST_DIR = path.join(__dirname, '..', 'uploads', 'documents', 'files');

// Ensure destination directory exists
if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

// Newsletters in chronological order
const newsletters = [
  {
    file: 'Newsletter num 001 One Health Cameroon.pdf',
    title: 'Newsletter One Health Cameroon N°001',
    title_en: 'One Health Cameroon Newsletter #001',
    description: 'Premier numéro de la Newsletter One Health Cameroon',
    publication_date: '2021-03-01',
    language: 'fr',
    order: 1
  },
  {
    file: 'Bulletin Une Seule Santé 2ème trimestre.pdf',
    title: 'Bulletin Une Seule Santé - 2ème Trimestre 2022',
    title_en: 'One Health Bulletin - 2nd Quarter 2022',
    description: 'Bulletin d\'information Une Seule Santé du 2ème trimestre 2022',
    publication_date: '2022-06-01',
    language: 'fr',
    order: 2
  },
  {
    file: 'Newsletter 003 PNPLZER.pdf',
    title: 'Newsletter One Health N°003 - PNPLZER',
    title_en: 'One Health Newsletter #003 - PNPLZER',
    description: 'Newsletter One Health numéro 003',
    publication_date: '2022-09-01',
    language: 'fr',
    order: 3
  },
  {
    file: 'Bulletin Une Seule Santé 4e trimestre 2022.pdf',
    title: 'Bulletin Une Seule Santé - 4ème Trimestre 2022',
    title_en: 'One Health Bulletin - 4th Quarter 2022',
    description: 'Bulletin d\'information Une Seule Santé du 4ème trimestre 2022',
    publication_date: '2022-12-01',
    language: 'fr',
    order: 4
  },
  {
    file: 'Newsletter 005.pdf',
    title: 'Newsletter One Health N°005',
    title_en: 'One Health Newsletter #005',
    description: 'Newsletter One Health numéro 005',
    publication_date: '2023-03-01',
    language: 'fr',
    order: 5
  },
  {
    file: 'Newsletter 006 FINAL.pdf',
    title: 'Newsletter One Health N°006',
    title_en: 'One Health Newsletter #006',
    description: 'Newsletter One Health numéro 006',
    publication_date: '2023-06-01',
    language: 'fr',
    order: 6
  },
  {
    file: 'Newsletter 007 Final.pdf',
    title: 'Newsletter One Health N°007',
    title_en: 'One Health Newsletter #007',
    description: 'Newsletter One Health numéro 007',
    publication_date: '2023-09-01',
    language: 'fr',
    order: 7
  },
  {
    file: 'Newsletter N008 (final).pdf',
    title: 'Newsletter One Health N°008',
    title_en: 'One Health Newsletter #008',
    description: 'Newsletter One Health numéro 008',
    publication_date: '2023-12-01',
    language: 'fr',
    order: 8
  },
  {
    file: 'Newsletter 009 (final).pdf',
    title: 'Newsletter One Health N°009',
    title_en: 'One Health Newsletter #009',
    description: 'Newsletter One Health numéro 009',
    publication_date: '2024-03-01',
    language: 'fr',
    order: 9
  },
  {
    file: 'Newsletter 010 French.pdf',
    title: 'Newsletter One Health N°010 (Français)',
    title_en: 'One Health Newsletter #010 (French)',
    description: 'Newsletter One Health numéro 010 - Version française',
    publication_date: '2024-06-01',
    language: 'fr',
    order: 10
  },
  {
    file: 'Newsletter 010 English.pdf',
    title: 'Newsletter One Health N°010 (English)',
    title_en: 'One Health Newsletter #010 (English)',
    description: 'One Health Newsletter issue 010 - English version',
    publication_date: '2024-06-01',
    language: 'en',
    order: 11
  }
];

// Magazines in chronological order
const magazines = [
  {
    file: 'One Health Magazine 2021.pdf',
    title: 'One Health Magazine 2021',
    title_en: 'One Health Magazine 2021',
    description: 'Magazine annuel One Health Cameroun - Édition 2021',
    publication_date: '2021-12-01',
    language: 'fr',
    order: 1
  },
  {
    file: 'One Health Magazine 2022.pdf',
    title: 'One Health Magazine 2022',
    title_en: 'One Health Magazine 2022',
    description: 'Magazine annuel One Health Cameroun - Édition 2022',
    publication_date: '2022-12-01',
    language: 'fr',
    order: 2
  },
  {
    file: 'One Health Magazine 2023.pdf',
    title: 'One Health Magazine 2023',
    title_en: 'One Health Magazine 2023',
    description: 'Magazine annuel One Health Cameroun - Édition 2023',
    publication_date: '2023-12-01',
    language: 'fr',
    order: 3
  },
  {
    file: 'One Health Magazine 2024 FINAL.pdf',
    title: 'One Health Magazine 2024',
    title_en: 'One Health Magazine 2024',
    description: 'Magazine annuel One Health Cameroun - Édition 2024',
    publication_date: '2024-12-01',
    language: 'fr',
    order: 4
  }
];

function generateSlug(title) {
  return title.toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[°]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 200);
}

async function copyFileAndGetPath(filename) {
  const sourcePath = path.join(SOURCE_DIR, filename);

  if (!fs.existsSync(sourcePath)) {
    console.error(`  File not found: ${sourcePath}`);
    return null;
  }

  const uniqueId = uuidv4();
  const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const destFilename = `${uniqueId}-${safeName}`;
  const destPath = path.join(DEST_DIR, destFilename);

  fs.copyFileSync(sourcePath, destPath);

  const stats = fs.statSync(destPath);

  return {
    path: `/uploads/documents/files/${destFilename}`,
    size: stats.size,
    type: 'application/pdf'
  };
}

async function publishDocuments(items, documentType) {
  console.log(`\nPublishing ${items.length} ${documentType} documents...`);

  for (const item of items) {
    console.log(`  Processing: ${item.file}`);

    // Check if already exists
    const [existing] = await db.query(
      'SELECT id FROM document_resources WHERE title = ? AND type = ?',
      [item.title, documentType]
    );

    if (existing.length > 0) {
      console.log(`    Already exists (id: ${existing[0].id}), skipping.`);
      continue;
    }

    // Copy file
    const fileInfo = await copyFileAndGetPath(item.file);
    if (!fileInfo) {
      console.error(`    Failed to copy file, skipping.`);
      continue;
    }

    // Generate slug
    const slug = generateSlug(item.title);

    // Check slug uniqueness
    const [slugCheck] = await db.query('SELECT id FROM document_resources WHERE slug = ?', [slug]);
    const finalSlug = slugCheck.length > 0 ? `${slug}-${Date.now()}` : slug;

    // Insert document record
    const [result] = await db.query(`
      INSERT INTO document_resources
      (title, slug, type, description, file_path, file_type, file_size,
       publication_date, language, themes, access_level, is_featured, is_active,
       submission_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'public', 0, 1, 'approved')
    `, [
      item.title,
      finalSlug,
      documentType,
      item.description,
      fileInfo.path,
      fileInfo.type,
      fileInfo.size,
      item.publication_date,
      item.language,
      JSON.stringify([])
    ]);

    console.log(`    Created document (id: ${result.insertId})`);
  }
}

async function main() {
  try {
    console.log('=== Publishing Newsletters & Magazines ===\n');

    // Step 0: Alter ENUM to include newsletter and magazine
    console.log('Step 0: Extending document_resources type ENUM...');
    await db.query(`
      ALTER TABLE document_resources
      MODIFY COLUMN type ENUM('guide','protocol','article','thesis','awareness','training','report','other','newsletter','magazine') NOT NULL
    `);
    console.log('  ENUM extended successfully');

    // Step 1: Create document types if they don't exist
    console.log('\nStep 1: Creating document types...');

    await db.query(`
      INSERT INTO ohwr_document_types (name, name_en, slug, description, icon, color, display_order, is_active)
      VALUES ('Newsletter', 'Newsletter', 'newsletter', 'Bulletins d''information One Health', 'newspaper', '#2196F3', 9, true)
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `);
    console.log('  Newsletter type created/verified');

    await db.query(`
      INSERT INTO ohwr_document_types (name, name_en, slug, description, icon, color, display_order, is_active)
      VALUES ('One Health Magazine', 'One Health Magazine', 'magazine', 'Magazine annuel One Health Cameroun', 'book-open-check', '#E91E63', 10, true)
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `);
    console.log('  Magazine type created/verified');

    // Step 2: Publish newsletters
    console.log('\nStep 2: Publishing newsletters...');
    await publishDocuments(newsletters, 'newsletter');

    // Step 3: Publish magazines
    console.log('\nStep 3: Publishing magazines...');
    await publishDocuments(magazines, 'magazine');

    // Summary
    const [[{ newsletterCount }]] = await db.query(
      "SELECT COUNT(*) as newsletterCount FROM document_resources WHERE type = 'newsletter' AND is_active = 1"
    );
    const [[{ magazineCount }]] = await db.query(
      "SELECT COUNT(*) as magazineCount FROM document_resources WHERE type = 'magazine' AND is_active = 1"
    );

    console.log('\n=== Summary ===');
    console.log(`  Newsletters published: ${newsletterCount}`);
    console.log(`  Magazines published: ${magazineCount}`);
    console.log(`  Total: ${newsletterCount + magazineCount}`);
    console.log('\nDone!');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
