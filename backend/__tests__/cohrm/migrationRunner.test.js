/**
 * Tests for the migration runner logic
 * Tests splitStatements, preprocessSql, expandAlterStatements, and checksum generation
 */

const crypto = require('crypto');

// Extract the pure functions from migrationRunner.js for testing
// These are the same functions as in lib/migrationRunner.js

function preprocessSql(sql) {
  sql = sql.replace(/ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS/gi, 'ADD COLUMN');
  sql = sql.replace(/ADD\s+INDEX\s+IF\s+NOT\s+EXISTS/gi, 'ADD INDEX');
  sql = sql.replace(/ADD\s+CONSTRAINT\s+IF\s+NOT\s+EXISTS/gi, 'ADD CONSTRAINT');
  sql = sql.replace(/CREATE\s+INDEX\s+IF\s+NOT\s+EXISTS/gi, 'CREATE INDEX');
  return sql;
}

function expandAlterStatements(statements) {
  const result = [];
  for (const stmt of statements) {
    const alterMatch = stmt.match(/^(ALTER\s+TABLE\s+\S+)\s+(ADD\s+.+)/is);
    if (alterMatch) {
      const prefix = alterMatch[1];
      const body = alterMatch[2];
      const parts = [];
      let depth = 0;
      let current = '';
      for (let i = 0; i < body.length; i++) {
        const ch = body[i];
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        else if (ch === ',' && depth === 0) {
          const rest = body.substring(i + 1).trimStart();
          if (/^ADD\s/i.test(rest)) {
            parts.push(current.trim());
            current = '';
            continue;
          }
        }
        current += ch;
      }
      if (current.trim()) parts.push(current.trim());

      if (parts.length > 1) {
        for (const part of parts) {
          result.push(`${prefix} ${part}`);
        }
        continue;
      }
    }
    result.push(stmt);
  }
  return result;
}

function splitStatements(sql) {
  sql = preprocessSql(sql);
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

  const remaining = current.trim().replace(/;$/, '').trim();
  if (remaining.length > 0) {
    statements.push(remaining);
  }

  return expandAlterStatements(statements);
}

function getChecksum(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

// ============================================
// TESTS
// ============================================

describe('splitStatements', () => {
  test('splits simple SQL on semicolons', () => {
    const sql = `
CREATE TABLE test (id INT);
INSERT INTO test VALUES (1);
    `;
    const stmts = splitStatements(sql);
    expect(stmts).toHaveLength(2);
    expect(stmts[0]).toBe('CREATE TABLE test (id INT)');
    expect(stmts[1]).toBe('INSERT INTO test VALUES (1)');
  });

  test('handles full-line comments', () => {
    const sql = `
-- This is a comment
CREATE TABLE test (id INT);
-- Another comment
INSERT INTO test VALUES (1);
    `;
    const stmts = splitStatements(sql);
    expect(stmts).toHaveLength(2);
    // Comments should not appear in statements
    expect(stmts[0]).not.toContain('--');
    expect(stmts[1]).not.toContain('--');
  });

  test('skips empty lines', () => {
    const sql = `
CREATE TABLE a (id INT);

CREATE TABLE b (id INT);
    `;
    const stmts = splitStatements(sql);
    expect(stmts).toHaveLength(2);
  });

  test('handles multi-line statements', () => {
    const sql = `
CREATE TABLE test (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    `;
    const stmts = splitStatements(sql);
    expect(stmts).toHaveLength(1);
    expect(stmts[0]).toContain('id INT AUTO_INCREMENT PRIMARY KEY');
    expect(stmts[0]).toContain('created_at TIMESTAMP');
  });

  test('handles remaining content without trailing semicolon', () => {
    const sql = `CREATE TABLE test (id INT)`;
    const stmts = splitStatements(sql);
    expect(stmts).toHaveLength(1);
    expect(stmts[0]).toBe('CREATE TABLE test (id INT)');
  });

  test('returns empty array for empty/comment-only SQL', () => {
    expect(splitStatements('')).toHaveLength(0);
    expect(splitStatements('-- just a comment')).toHaveLength(0);
    expect(splitStatements('-- comment1\n-- comment2')).toHaveLength(0);
  });
});

describe('preprocessSql (via splitStatements)', () => {
  test('removes IF NOT EXISTS from ADD COLUMN', () => {
    const sql = 'ALTER TABLE t ADD COLUMN IF NOT EXISTS col1 INT;';
    const stmts = splitStatements(sql);
    expect(stmts[0]).toContain('ADD COLUMN col1 INT');
    expect(stmts[0]).not.toContain('IF NOT EXISTS');
  });

  test('removes IF NOT EXISTS from ADD INDEX', () => {
    const sql = 'ALTER TABLE t ADD INDEX IF NOT EXISTS idx_name (col1);';
    const stmts = splitStatements(sql);
    expect(stmts[0]).toContain('ADD INDEX idx_name');
    expect(stmts[0]).not.toContain('IF NOT EXISTS');
  });

  test('removes IF NOT EXISTS from ADD CONSTRAINT', () => {
    const sql = 'ALTER TABLE t ADD CONSTRAINT IF NOT EXISTS fk_name FOREIGN KEY (col) REFERENCES other(id);';
    const stmts = splitStatements(sql);
    expect(stmts[0]).toContain('ADD CONSTRAINT fk_name');
    expect(stmts[0]).not.toContain('IF NOT EXISTS');
  });

  test('removes IF NOT EXISTS from CREATE INDEX', () => {
    const sql = 'CREATE INDEX IF NOT EXISTS idx_test ON table1 (col1);';
    const stmts = splitStatements(sql);
    expect(stmts[0]).toContain('CREATE INDEX idx_test');
    expect(stmts[0]).not.toContain('IF NOT EXISTS');
  });

  test('is case-insensitive', () => {
    const sql = 'ALTER TABLE t add column if not exists col1 INT;';
    const stmts = splitStatements(sql);
    expect(stmts[0]).not.toMatch(/if\s+not\s+exists/i);
  });
});

describe('expandAlterStatements (via splitStatements)', () => {
  test('splits multi-ADD-COLUMN ALTER into individual statements', () => {
    const sql = 'ALTER TABLE test ADD COLUMN col1 INT, ADD COLUMN col2 VARCHAR(255);';
    const stmts = splitStatements(sql);
    expect(stmts).toHaveLength(2);
    expect(stmts[0]).toContain('ALTER TABLE test');
    expect(stmts[0]).toContain('ADD COLUMN col1 INT');
    expect(stmts[1]).toContain('ALTER TABLE test');
    expect(stmts[1]).toContain('ADD COLUMN col2 VARCHAR(255)');
  });

  test('does not split commas inside ENUM definitions', () => {
    const sql = "ALTER TABLE test ADD COLUMN status ENUM('a','b','c') DEFAULT 'a';";
    const stmts = splitStatements(sql);
    expect(stmts).toHaveLength(1);
    expect(stmts[0]).toContain("ENUM('a','b','c')");
  });

  test('handles mixed ENUM and multi-ADD', () => {
    const sql = "ALTER TABLE t ADD COLUMN status ENUM('a','b') DEFAULT 'a', ADD COLUMN name VARCHAR(100);";
    const stmts = splitStatements(sql);
    expect(stmts).toHaveLength(2);
    expect(stmts[0]).toContain("ENUM('a','b')");
    expect(stmts[1]).toContain('ADD COLUMN name VARCHAR(100)');
  });

  test('leaves single ADD COLUMN unchanged', () => {
    const sql = 'ALTER TABLE test ADD COLUMN col1 INT;';
    const stmts = splitStatements(sql);
    expect(stmts).toHaveLength(1);
    expect(stmts[0]).toContain('ADD COLUMN col1 INT');
  });
});

describe('getChecksum', () => {
  test('generates consistent MD5 checksum', () => {
    const content = 'CREATE TABLE test (id INT);';
    const checksum1 = getChecksum(content);
    const checksum2 = getChecksum(content);
    expect(checksum1).toBe(checksum2);
  });

  test('produces different checksums for different content', () => {
    const cs1 = getChecksum('CREATE TABLE a (id INT);');
    const cs2 = getChecksum('CREATE TABLE b (id INT);');
    expect(cs1).not.toBe(cs2);
  });

  test('returns 32-character hex string', () => {
    const checksum = getChecksum('test');
    expect(checksum).toHaveLength(32);
    expect(checksum).toMatch(/^[0-9a-f]{32}$/);
  });

  test('matches known MD5 value', () => {
    // MD5 of empty string
    const emptyMd5 = getChecksum('');
    expect(emptyMd5).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });
});
