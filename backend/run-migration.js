const db = require('./config/db');
const fs = require('fs');
const path = require('path');

async function runMigration(filename) {
  try {
    const migrationPath = path.join(__dirname, 'migrations', filename);
    console.log(`Running migration: ${filename}`);

    let sql = fs.readFileSync(migrationPath, 'utf8');

    // Remove comment lines but preserve the rest
    sql = sql.split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    const statements = sql.split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Found ${statements.length} statements to execute\n`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt.trim()) {
        try {
          await db.query(stmt);
          console.log(`[${i + 1}/${statements.length}] OK`);
        } catch (e) {
          if (e.code === 'ER_DUP_ENTRY' || e.code === 'ER_TABLE_EXISTS_ERROR' || e.code === 'ER_DUP_FIELDNAME' || e.message.includes('Duplicate')) {
            console.log(`[${i + 1}/${statements.length}] SKIP (already exists)`);
          } else {
            console.error(`[${i + 1}/${statements.length}] ERR:`, e.message);
          }
        }
      }
    }
    console.log('\nMigration completed!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

const migrationFile = process.argv[2] || '006_create_ohwr_config_tables.sql';
runMigration(migrationFile);
