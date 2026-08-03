/**
 * DUSS-C Import/Export Service
 * Import de la banque de questions CSV et export des données
 */

const fs = require('fs');
const path = require('path');
const db = require('../config/db');

/**
 * Parse une ligne CSV en tenant compte des guillemets et JSON embarqué
 */
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === '"' && !inQuotes) {
      inQuotes = true;
      i++;
      continue;
    }
    if (char === '"' && inQuotes) {
      if (i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i += 2;
        continue;
      }
      inQuotes = false;
      i++;
      continue;
    }
    if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
      i++;
      continue;
    }
    current += char;
    i++;
  }
  fields.push(current.trim());
  return fields;
}

/**
 * Mappe le statut CSV vers l'enum DB
 */
function mapStatus(csvStatus) {
  const map = {
    'Brouillon': 'brouillon',
    'En revue éditoriale': 'revue_editoriale',
    'En validation': 'en_validation',
    'Traduction': 'traduction',
    'Contre-validation': 'contre_validation',
    'Test utilisateur': 'test_utilisateur',
    'Validé': 'valide',
    'Publié': 'publie',
    'Suspendu': 'suspendu',
    'Retiré': 'retire',
  };
  return map[csvStatus] || 'revue_editoriale';
}

/**
 * Mappe le rôle test CSV vers l'enum DB
 */
function mapRoleTest(csvRole) {
  const map = {
    'Ancre pré-test': 'ancre_pre',
    'Ancre post-test': 'ancre_post',
    'Question courante': 'courante',
  };
  return map[csvRole] || 'courante';
}

/**
 * Mappe le niveau CSV vers l'enum DB
 */
function mapNiveau(csvNiveau) {
  const map = {
    'Grand public': 'grand_public',
    'Intermédiaire': 'intermediaire',
    'Professionnel': 'professionnel',
  };
  return map[csvNiveau] || 'grand_public';
}

/**
 * Mappe le type d'item CSV vers l'enum DB
 */
function mapTypeItem(csvType) {
  const map = {
    'Situation': 'situation',
    'Connaissance': 'connaissance',
    'Attitude': 'attitude',
    'Orientation': 'orientation',
  };
  return map[csvType] || 'connaissance';
}

/**
 * Importe un fichier CSV de la banque de questions DUSS-C
 * @param {string} filePath - Chemin du fichier CSV
 * @returns {Object} Rapport d'import { imported, errors, skipped }
 */
async function importCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());

  if (lines.length < 2) {
    throw new Error('Le fichier CSV est vide ou ne contient que l\'en-tête');
  }

  const headers = parseCSVLine(lines[0]);
  const report = { imported: 0, errors: [], skipped: 0, total: lines.length - 1 };

  // Charger la map des modules (code → id)
  const [modules] = await db.query('SELECT id, code FROM dussc_modules');
  const moduleMap = {};
  for (const m of modules) {
    moduleMap[m.code] = m.id;
  }

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    if (fields.length < 20) {
      report.errors.push({ line: i + 1, error: 'Nombre de champs insuffisant' });
      continue;
    }

    try {
      // Mapper les champs CSV aux colonnes
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = fields[idx] || '';
      });

      const moduleCode = row.module || '';
      const moduleId = moduleMap[moduleCode];
      if (!moduleId) {
        report.errors.push({ line: i + 1, error: `Module inconnu: ${moduleCode}` });
        continue;
      }

      // Vérifier si la question existe déjà
      const [existing] = await db.query(
        'SELECT id FROM dussc_questions WHERE id_version = ?',
        [row.id_version]
      );
      if (existing.length > 0) {
        report.skipped++;
        continue;
      }

      // Parser les champs JSON
      let optionsFr, optionsEn, publicCible, secteurValidateur;
      try {
        optionsFr = row.options_fr ? JSON.parse(row.options_fr.replace(/^\[/, '[').replace(/\]$/, ']')) : [];
        optionsEn = row.options_en ? JSON.parse(row.options_en.replace(/^\[/, '[').replace(/\]$/, ']')) : [];
      } catch {
        optionsFr = [row.options_fr];
        optionsEn = [row.options_en];
      }

      publicCible = row.public_cible ? row.public_cible.split(';').map(s => s.trim()).filter(Boolean) : [];
      secteurValidateur = row.secteur_validateur ? row.secteur_validateur.split(';').map(s => s.trim()).filter(Boolean) : [];

      await db.query(
        `INSERT INTO dussc_questions (
          id_question, id_version, version, module_id,
          theme_fr, type_item, niveau, public_cible, role_test,
          enonce_fr, options_fr, reponse_correcte, explication_fr, action_fr,
          idee_fausse_ciblee_fr,
          enonce_en, options_en, explication_en, action_en,
          statut_traduction, source_documentaire, id_inventaire,
          secteur_validateur, statut, sensibilite,
          historique, schema_version, date_creation,
          is_current_version
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          row.id_question,
          row.id_version,
          parseInt(row.version) || 1,
          moduleId,
          row.theme || null,
          mapTypeItem(row.type_item),
          mapNiveau(row.niveau),
          JSON.stringify(publicCible),
          mapRoleTest(row.role_test),
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
          row.statut_traduction === 'Traduit' ? 'traduit' : 'a_traduire',
          row.source_documentaire || null,
          row.id_inventaire || null,
          JSON.stringify(secteurValidateur),
          mapStatus(row.statut),
          row.sensibilite === 'Sensible' ? 'sensible' : 'standard',
          row.historique || null,
          row.schema_version || '1.0',
          row.date_creation || new Date().toISOString().split('T')[0],
        ]
      );

      report.imported++;
    } catch (err) {
      report.errors.push({ line: i + 1, error: err.message });
    }
  }

  return report;
}

/**
 * Exporte les questions en format CSV
 */
async function exportCSV(filters = {}) {
  let query = `
    SELECT q.*, m.code as module_code
    FROM dussc_questions q
    JOIN dussc_modules m ON q.module_id = m.id
    WHERE q.is_current_version = 1
  `;
  const params = [];

  if (filters.module) {
    query += ' AND m.code = ?';
    params.push(filters.module);
  }
  if (filters.statut) {
    query += ' AND q.statut = ?';
    params.push(filters.statut);
  }
  if (filters.niveau) {
    query += ' AND q.niveau = ?';
    params.push(filters.niveau);
  }

  query += ' ORDER BY q.id_question';

  const [rows] = await db.query(query, params);

  // En-tête CSV
  const headers = [
    'id_question', 'id_version', 'version', 'date_creation', 'module',
    'theme', 'type_item', 'niveau', 'public_cible', 'role_test',
    'enonce_fr', 'options_fr', 'reponse_correcte', 'explication_fr', 'action_fr',
    'idee_fausse_ciblee', 'enonce_en', 'options_en', 'explication_en', 'action_en',
    'statut_traduction', 'source_documentaire', 'id_inventaire',
    'secteur_validateur', 'statut', 'sensibilite'
  ];

  let csv = headers.map(h => `"${h}"`).join(',') + '\n';

  for (const row of rows) {
    const publicCible = JSON.parse(row.public_cible || '[]').join(';');
    const secteur = JSON.parse(row.secteur_validateur || '[]').join(';');

    const values = [
      row.id_question, row.id_version, row.version, row.date_creation,
      row.module_code, row.theme_fr, row.type_item, row.niveau,
      publicCible, row.role_test, row.enonce_fr,
      row.options_fr, row.reponse_correcte, row.explication_fr,
      row.action_fr, row.idee_fausse_ciblee_fr, row.enonce_en,
      row.options_en, row.explication_en, row.action_en,
      row.statut_traduction, row.source_documentaire, row.id_inventaire,
      secteur, row.statut, row.sensibilite
    ];

    csv += values.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',') + '\n';
  }

  return csv;
}

module.exports = { importCSV, exportCSV };
