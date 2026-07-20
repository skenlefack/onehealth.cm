const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

const SAFE_ERRORS = [
  'ER_TABLE_EXISTS_ERROR',
  'ER_DUP_ENTRY',
  'ER_DUP_FIELDNAME',
  'ER_DUP_KEYNAME',
  'ER_CANT_DROP_FIELD_OR_KEY',
  'ER_MULTIPLE_PRI_KEY',
];

async function ensureSchemaTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      checksum VARCHAR(32) NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

function getChecksum(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  return fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/^(\d+)/)?.[1] || '999', 10);
      const numB = parseInt(b.match(/^(\d+)/)?.[1] || '999', 10);
      if (numA !== numB) return numA - numB;
      return a.localeCompare(b);
    });
}

function splitStatements(sql) {
  // Remove full-line comments and split on semicolons followed by newline
  const lines = sql.split('\n');
  let current = '';
  const statements = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('--') || trimmed === '') {
      continue;
    }
    current += line + '\n';
    if (trimmed.endsWith(';')) {
      const stmt = current.trim().replace(/;$/, '').trim();
      if (stmt.length > 0) {
        statements.push(stmt);
      }
      current = '';
    }
  }

  // Handle any remaining content
  const remaining = current.trim().replace(/;$/, '').trim();
  if (remaining.length > 0) {
    statements.push(remaining);
  }

  return statements;
}

async function getAppliedMigrations(pool) {
  const [rows] = await pool.query('SELECT filename, checksum FROM schema_migrations ORDER BY id');
  const map = new Map();
  for (const row of rows) {
    map.set(row.filename, row.checksum);
  }
  return map;
}

async function runMigrations(pool, { verbose = true } = {}) {
  await ensureSchemaTable(pool);

  const files = getMigrationFiles();
  const applied = await getAppliedMigrations(pool);
  const pending = [];
  const warnings = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    const checksum = getChecksum(content);

    if (applied.has(file)) {
      if (applied.get(file) !== checksum) {
        warnings.push(`[WARN] ${file} has been modified since it was applied (checksum mismatch)`);
      }
      continue;
    }
    pending.push({ file, content, checksum });
  }

  if (warnings.length > 0 && verbose) {
    warnings.forEach(w => console.log(w));
  }

  if (pending.length === 0) {
    if (verbose) console.log('  No pending migrations.');
    return { applied: 0, total: files.length, warnings };
  }

  if (verbose) console.log(`  ${pending.length} pending migration(s) to apply...`);

  let appliedCount = 0;

  for (const { file, content, checksum } of pending) {
    if (verbose) console.log(`  Applying: ${file}`);
    const statements = splitStatements(content);

    try {
      for (const stmt of statements) {
        try {
          await pool.query(stmt);
        } catch (err) {
          if (SAFE_ERRORS.includes(err.code)) {
            if (verbose) console.log(`    Skipped (${err.code}): ${stmt.substring(0, 60)}...`);
          } else {
            throw err;
          }
        }
      }

      await pool.query(
        'INSERT INTO schema_migrations (filename, checksum) VALUES (?, ?)',
        [file, checksum]
      );
      appliedCount++;
      if (verbose) console.log(`  Applied: ${file}`);
    } catch (err) {
      console.error(`  FAILED: ${file} - ${err.message}`);
      console.error(`  Stopping migration runner. Fix the issue and retry.`);
      return { applied: appliedCount, total: files.length, failed: file, error: err.message, warnings };
    }
  }

  if (verbose) console.log(`  ${appliedCount} migration(s) applied successfully.`);
  return { applied: appliedCount, total: files.length, warnings };
}

async function getMigrationStatus(pool) {
  await ensureSchemaTable(pool);

  const files = getMigrationFiles();
  const applied = await getAppliedMigrations(pool);
  const status = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    const checksum = getChecksum(content);
    const isApplied = applied.has(file);
    const modified = isApplied && applied.get(file) !== checksum;

    status.push({ file, applied: isApplied, modified });
  }

  return status;
}

async function forceRunMigration(pool, filename) {
  const filePath = path.join(MIGRATIONS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Migration file not found: ${filename}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const checksum = getChecksum(content);
  const statements = splitStatements(content);

  console.log(`  Force-running: ${filename} (${statements.length} statements)`);

  for (const stmt of statements) {
    try {
      await pool.query(stmt);
    } catch (err) {
      if (SAFE_ERRORS.includes(err.code)) {
        console.log(`    Skipped (${err.code})`);
      } else {
        throw err;
      }
    }
  }

  // Upsert into schema_migrations
  await pool.query(
    `INSERT INTO schema_migrations (filename, checksum) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE checksum = VALUES(checksum), applied_at = CURRENT_TIMESTAMP`,
    [filename, checksum]
  );

  console.log(`  Force-applied: ${filename}`);
}

module.exports = { runMigrations, getMigrationStatus, forceRunMigration };
