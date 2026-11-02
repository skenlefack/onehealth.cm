// Applique la migration 023 (blocs de contenu des leçons). Idempotent.
// Usage : node run_migration_023.js
require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'onehealth_cms',
  });

  const addColumn = async (table, column, definition) => {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS n FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column]
    );
    if (rows[0].n > 0) {
      console.log(`SKIP: ${table}.${column} existe déjà`);
      return;
    }
    await db.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`OK: ${table}.${column} ajoutée`);
  };

  try {
    await addColumn('lessons', 'content_blocks', 'JSON NULL AFTER content_en');
    await addColumn('lesson_progress', 'completed_blocks', 'JSON NULL AFTER progress_percent');
    console.log('Migration 023 terminée');
  } catch (err) {
    console.error('Migration 023 échouée :', err.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
})();
