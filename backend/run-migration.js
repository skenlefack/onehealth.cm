const db = require('./config/db');
const fs = require('fs');

async function runMigration() {
  try {
    const sql = fs.readFileSync('./migrations/add_expert_enhancements.sql', 'utf8');
    const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));

    for (const stmt of statements) {
      if (stmt.trim()) {
        try {
          await db.query(stmt);
          console.log('OK:', stmt.substring(0, 60) + '...');
        } catch (e) {
          if (e.code === 'ER_DUP_ENTRY' || e.code === 'ER_TABLE_EXISTS_ERROR' || e.code === 'ER_DUP_FIELDNAME' || e.message.includes('Duplicate')) {
            console.log('SKIP (already exists):', stmt.substring(0, 60) + '...');
          } else {
            console.error('ERR:', e.message);
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

runMigration();
