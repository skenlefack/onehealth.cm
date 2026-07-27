// Script pour créer un utilisateur administrateur
// Exécuter avec: node create-admin.js

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'onehealth_cms'
};

// Generate a secure random password
const crypto = require('crypto');
const generatedPassword = crypto.randomBytes(16).toString('base64url');

const adminUser = {
  username: process.env.ADMIN_USERNAME || 'admin',
  email: process.env.ADMIN_EMAIL || 'admin@onehealth.cm',
  password: process.env.ADMIN_PASSWORD || generatedPassword,
  first_name: 'Admin',
  last_name: 'OneHealth',
  role: 'admin',
  status: 'active'
};

async function createAdmin() {
  let connection;
  
  try {
    console.log('🔌 Connexion à la base de données...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connecté à MySQL');

    // Hasher le mot de passe
    console.log('🔐 Hashage du mot de passe...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);

    // Vérifier si l'utilisateur existe déjà
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [adminUser.email, adminUser.username]
    );

    if (existing.length > 0) {
      console.log('⚠️  L\'utilisateur existe déjà, mise à jour...');
      await connection.query(
        'UPDATE users SET password = ?, status = ?, role = ? WHERE email = ?',
        [hashedPassword, adminUser.status, adminUser.role, adminUser.email]
      );
      console.log('✅ Utilisateur mis à jour');
    } else {
      console.log('📝 Création de l\'utilisateur admin...');
      await connection.query(
        `INSERT INTO users (username, email, password, first_name, last_name, role, status, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          adminUser.username,
          adminUser.email,
          hashedPassword,
          adminUser.first_name,
          adminUser.last_name,
          adminUser.role,
          adminUser.status
        ]
      );
      console.log('✅ Utilisateur admin créé');
    }

    // Afficher les informations de connexion
    console.log('\n========================================');
    console.log('🎉 UTILISATEUR ADMIN CRÉÉ AVEC SUCCÈS !');
    console.log('========================================');
    console.log(`📧 Email:    ${adminUser.email}`);
    console.log(`🔑 Password: ${adminUser.password}`);
    console.log('⚠️  IMPORTANT: Save this password now and change it after first login!');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('\n⚠️  La table "users" n\'existe pas.');
      console.log('Veuillez d\'abord exécuter le script database.sql');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  Impossible de se connecter à MySQL.');
      console.log('Vérifiez que MySQL est bien lancé.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n⚠️  Accès refusé à MySQL.');
      console.log('Vérifiez vos identifiants dans le fichier .env');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connexion fermée');
    }
  }
}

createAdmin();
