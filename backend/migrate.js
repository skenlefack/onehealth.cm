#!/usr/bin/env node
const pool = require('./config/db');
const { runMigrations, getMigrationStatus, forceRunMigration } = require('./lib/migrationRunner');

const args = process.argv.slice(2);

async function main() {
  try {
    if (args.includes('--status')) {
      const status = await getMigrationStatus(pool);
      const applied = status.filter(s => s.applied).length;
      const pending = status.filter(s => !s.applied).length;

      console.log(`\nMigration Status: ${applied} applied, ${pending} pending\n`);
      console.log('  Status     | Modified | File');
      console.log('  -----------|----------|' + '-'.repeat(50));

      for (const s of status) {
        const icon = s.applied ? 'APPLIED' : 'PENDING';
        const mod = s.modified ? '  YES   ' : '   -    ';
        console.log(`  ${icon.padEnd(10)} | ${mod} | ${s.file}`);
      }
      console.log('');

    } else if (args.includes('--force')) {
      const idx = args.indexOf('--force');
      const filename = args[idx + 1];
      if (!filename) {
        console.error('Usage: node migrate.js --force <filename>');
        process.exit(1);
      }
      await forceRunMigration(pool, filename);

    } else {
      console.log('\nRunning pending migrations...');
      const result = await runMigrations(pool);
      if (result.failed) {
        console.error(`\nMigration failed at: ${result.failed}`);
        process.exit(1);
      }
    }
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
