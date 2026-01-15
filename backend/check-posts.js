const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'onehealth_cms'
  });

  const [posts] = await conn.query('SELECT id, title, status FROM posts ORDER BY id');
  console.log('=== Tous les articles en BDD ===');
  console.log('Total:', posts.length);
  posts.forEach(p => console.log('  ID', p.id, '-', p.title.substring(0,30), '(' + p.status + ')'));

  await conn.end();
}
check();
