#!/usr/bin/env node
/**
 * Seed DUSS-C Questions
 * Charge les 144 questions depuis le CSV embarqué (inline)
 * dans la base de données.
 *
 * Usage: node scripts/seed-dussc-questions.js
 */

require('dotenv').config();
const db = require('../config/db');

// ── Mappers ──

const STATUS_MAP = {
  'Brouillon': 'brouillon',
  'En revue éditoriale': 'revue_editoriale',
  'En validation': 'en_validation',
  'Validé': 'valide',
  'Publié': 'publie',
  'Suspendu': 'suspendu',
};

const ROLE_MAP = {
  'Ancre pré-test': 'ancre_pre',
  'Ancre post-test': 'ancre_post',
  'Question courante': 'courante',
};

const NIVEAU_MAP = {
  'Grand public': 'grand_public',
  'Intermédiaire': 'intermediaire',
  'Professionnel': 'professionnel',
};

const TYPE_MAP = {
  'Situation': 'situation',
  'Connaissance': 'connaissance',
  'Attitude': 'attitude',
  'Orientation': 'orientation',
};

// ── CSV Parser (handles embedded JSON arrays with escaped quotes) ──

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && !inQuotes) { inQuotes = true; continue; }
    if (ch === '"' && inQuotes) {
      if (i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++; continue; }
      inQuotes = false; continue;
    }
    if (ch === ',' && !inQuotes) { fields.push(current); current = ''; continue; }
    current += ch;
  }
  fields.push(current);
  return fields;
}

// ── Main ──

async function seed() {
  console.log('🌱 DUSS-C Question Seeder');
  console.log('========================\n');

  // Check if questions already exist
  const [existing] = await db.query('SELECT COUNT(*) as c FROM dussc_questions');
  if (existing[0].c > 0) {
    console.log(`⚠️  ${existing[0].c} questions déjà en base.`);
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise(r => rl.question('Vider et re-importer ? (y/N) ', r));
    rl.close();
    if (answer.toLowerCase() !== 'y') {
      console.log('Annulé.');
      process.exit(0);
    }
    await db.query('DELETE FROM dussc_question_history');
    await db.query('DELETE FROM dussc_responses');
    await db.query('DELETE FROM dussc_questions');
    console.log('🗑️  Tables vidées.\n');
  }

  // Load module map
  const [modules] = await db.query('SELECT id, code FROM dussc_modules');
  const moduleMap = {};
  modules.forEach(m => { moduleMap[m.code] = m.id; });

  // Read CSV
  const fs = require('fs');
  const path = require('path');

  // Try multiple possible paths
  const csvPaths = [
    path.join(__dirname, '..', '..', 'defi', 'DUSS-C-dossier-complet(1)', 'DUSS-C', '02-Contenus', 'Banque-questions-DUSS-C-v2-bilingue.csv'),
    path.join(__dirname, '..', 'data', 'dussc-questions.csv'),
    '/app/data/dussc-questions.csv',
  ];

  let csvContent = null;
  let csvPath = null;
  for (const p of csvPaths) {
    if (fs.existsSync(p)) {
      csvContent = fs.readFileSync(p, 'utf-8');
      csvPath = p;
      break;
    }
  }

  if (!csvContent) {
    console.error('❌ Fichier CSV non trouvé. Chemins testés:');
    csvPaths.forEach(p => console.error('   ' + p));
    console.error('\nCopiez le CSV dans backend/data/dussc-questions.csv');
    process.exit(1);
  }

  console.log(`📄 CSV: ${csvPath}`);

  const lines = csvContent.split('\n').filter(l => l.trim());
  const headers = parseCSVLine(lines[0]);
  console.log(`📊 ${lines.length - 1} lignes à traiter\n`);

  // Prepare batch insert
  const insertSQL = `INSERT INTO dussc_questions (
    id_question, id_version, version, module_id,
    theme_fr, type_item, niveau, public_cible, role_test,
    enonce_fr, options_fr, reponse_correcte, explication_fr, action_fr,
    idee_fausse_ciblee_fr,
    enonce_en, options_en, explication_en, action_en,
    idee_fausse_ciblee_en,
    statut_traduction, source_documentaire, id_inventaire,
    secteur_validateur, statut, sensibilite,
    historique, schema_version, date_creation,
    is_current_version
  ) VALUES ?`;

  const batch = [];
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    try {
      const fields = parseCSVLine(lines[i]);
      const row = {};
      headers.forEach((h, idx) => { row[h.trim()] = (fields[idx] || '').trim(); });

      const moduleCode = row.module;
      const moduleId = moduleMap[moduleCode];
      if (!moduleId) {
        errors.push({ line: i + 1, error: `Module inconnu: ${moduleCode}` });
        continue;
      }

      // Parse JSON arrays
      let optionsFr, optionsEn;
      try { optionsFr = JSON.parse(row.options_fr); } catch { optionsFr = [row.options_fr]; }
      try { optionsEn = JSON.parse(row.options_en || '[]'); } catch { optionsEn = []; }

      const publicCible = row.public_cible ? row.public_cible.split(';').map(s => s.trim()).filter(Boolean) : [];
      const secteur = row.secteur_validateur ? row.secteur_validateur.split(';').map(s => s.trim()).filter(Boolean) : [];

      batch.push([
        row.id_question,
        row.id_version,
        parseInt(row.version) || 1,
        moduleId,
        row.theme || null,
        TYPE_MAP[row.type_item] || 'connaissance',
        NIVEAU_MAP[row.niveau] || 'grand_public',
        JSON.stringify(publicCible),
        ROLE_MAP[row.role_test] || 'courante',
        row.enonce_fr,
        JSON.stringify(optionsFr),
        (row.reponse_correcte || 'A').toUpperCase(),
        row.explication_fr,
        row.action_fr,
        row.idee_fausse_ciblee || null,
        row.enonce_en || null,
        JSON.stringify(optionsEn),
        row.explication_en || null,
        row.action_en || null,
        null, // idee_fausse_ciblee_en
        row.statut_traduction === 'Traduit' ? 'traduit' : 'a_traduire',
        row.source_documentaire || null,
        row.id_inventaire || null,
        JSON.stringify(secteur),
        STATUS_MAP[row.statut] || 'revue_editoriale',
        row.sensibilite === 'Sensible' ? 'sensible' : 'standard',
        row.historique || null,
        row.schema_version || '1.0',
        row.date_creation || '2026-08-02',
        1, // is_current_version
      ]);
    } catch (err) {
      errors.push({ line: i + 1, error: err.message });
    }
  }

  // Batch insert
  if (batch.length > 0) {
    await db.query(insertSQL, [batch]);
    console.log(`✅ ${batch.length} questions importées`);
  }

  if (errors.length > 0) {
    console.log(`\n⚠️  ${errors.length} erreurs:`);
    errors.forEach(e => console.log(`   Ligne ${e.line}: ${e.error}`));
  }

  // Stats par module
  const [stats] = await db.query(`
    SELECT m.code, m.name_fr, COUNT(q.id) as count
    FROM dussc_modules m
    LEFT JOIN dussc_questions q ON q.module_id = m.id AND q.is_current_version = 1
    GROUP BY m.id ORDER BY m.sort_order
  `);
  console.log('\n📊 Questions par module:');
  stats.forEach(s => {
    if (s.count > 0) console.log(`   ${s.code} ${s.name_fr}: ${s.count}`);
  });

  const [total] = await db.query('SELECT COUNT(*) as c FROM dussc_questions');
  console.log(`\n🎯 Total: ${total[0].c} questions en base`);

  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Erreur:', err.message);
  process.exit(1);
});
