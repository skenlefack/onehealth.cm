// =====================================================
// SCRIPT DE DIAGNOSTIC - TEST AUTHENTIFICATION
// =====================================================
// Exécuter avec: node test-auth.js

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'onehealth_cms'
};

async function testAuth() {
  let connection;
  
  console.log('=====================================================');
  console.log('       DIAGNOSTIC AUTHENTIFICATION ONE HEALTH');
  console.log('=====================================================\n');
  
  try {
    // 1. Test connexion DB
    console.log('1️⃣  TEST CONNEXION BASE DE DONNÉES');
    console.log('─────────────────────────────────────');
    console.log(`   Host:     ${dbConfig.host}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   User:     ${dbConfig.user}`);
    
    connection = await mysql.createConnection(dbConfig);
    console.log('   ✅ Connexion réussie!\n');

    // 2. Vérifier la table users
    console.log('2️⃣  VÉRIFICATION TABLE USERS');
    console.log('─────────────────────────────────────');
    
    const [tables] = await connection.query("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      console.log('   ❌ Table "users" non trouvée!');
      console.log('   → Exécutez database-complete.sql d\'abord\n');
      return;
    }
    console.log('   ✅ Table users existe\n');

    // 3. Lister tous les utilisateurs
    console.log('3️⃣  LISTE DES UTILISATEURS');
    console.log('─────────────────────────────────────');
    
    const [users] = await connection.query(
      'SELECT id, username, email, role, status, LEFT(password, 30) as password_preview FROM users'
    );
    
    if (users.length === 0) {
      console.log('   ❌ Aucun utilisateur trouvé!');
      console.log('   → Exécutez reset-admin.sql ou reset-admin.js\n');
      return;
    }
    
    users.forEach(u => {
      console.log(`   ID: ${u.id}`);
      console.log(`   Username: ${u.username}`);
      console.log(`   Email: ${u.email}`);
      console.log(`   Role: ${u.role}`);
      console.log(`   Status: ${u.status}`);
      console.log(`   Password: ${u.password_preview}...`);
      console.log('');
    });

    // 4. Test de l'utilisateur admin
    console.log('4️⃣  TEST UTILISATEUR ADMIN');
    console.log('─────────────────────────────────────');
    
    const [admins] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      ['admin@onehealth.cm']
    );
    
    if (admins.length === 0) {
      console.log('   ❌ Utilisateur admin@onehealth.cm non trouvé!');
      
      // Créer l'admin
      console.log('\n   🔧 Création de l\'utilisateur admin...');
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('admin123', salt);
      
      await connection.query(`
        INSERT INTO users (username, email, password, first_name, last_name, role, status, created_at)
        VALUES ('admin', 'admin@onehealth.cm', ?, 'Admin', 'OneHealth', 'admin', 'active', NOW())
      `, [hash]);
      
      console.log('   ✅ Admin créé avec succès!\n');
    } else {
      const admin = admins[0];
      console.log(`   Email: ${admin.email}`);
      console.log(`   Status: ${admin.status}`);
      console.log(`   Role: ${admin.role}`);
      
      if (admin.status !== 'active') {
        console.log('   ⚠️  Le compte n\'est pas actif!');
        console.log('   🔧 Activation du compte...');
        await connection.query('UPDATE users SET status = ? WHERE email = ?', ['active', 'admin@onehealth.cm']);
        console.log('   ✅ Compte activé!\n');
      }
      
      // 5. Test du mot de passe
      console.log('\n5️⃣  TEST MOT DE PASSE');
      console.log('─────────────────────────────────────');
      
      const testPassword = 'admin123';
      console.log(`   Test avec: "${testPassword}"`);
      console.log(`   Hash DB: ${admin.password.substring(0, 40)}...`);
      
      const isMatch = await bcrypt.compare(testPassword, admin.password);
      
      if (isMatch) {
        console.log('   ✅ Mot de passe CORRECT!\n');
      } else {
        console.log('   ❌ Mot de passe INCORRECT!');
        console.log('\n   🔧 Réinitialisation du mot de passe...');
        
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash('admin123', salt);
        
        await connection.query(
          'UPDATE users SET password = ? WHERE email = ?',
          [newHash, 'admin@onehealth.cm']
        );
        
        console.log('   ✅ Mot de passe réinitialisé!\n');
        
        // Vérification
        const [verify] = await connection.query(
          'SELECT password FROM users WHERE email = ?',
          ['admin@onehealth.cm']
        );
        
        const verifyMatch = await bcrypt.compare('admin123', verify[0].password);
        console.log(`   Vérification: ${verifyMatch ? '✅ OK' : '❌ ÉCHEC'}\n`);
      }
    }

    // 6. Résultat final
    console.log('=====================================================');
    console.log('                    RÉSULTAT');
    console.log('=====================================================');
    console.log('');
    console.log('   📧 Email:    admin@onehealth.cm');
    console.log('   🔑 Password: admin123');
    console.log('');
    console.log('   🌐 URL Admin: http://localhost:3001');
    console.log('   🔌 API:       http://localhost:5000');
    console.log('');
    console.log('=====================================================');

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 MySQL n\'est pas lancé!');
      console.log('   → Démarrez XAMPP/WAMP et lancez MySQL');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Accès MySQL refusé!');
      console.log('   → Vérifiez DB_USER et DB_PASSWORD dans .env');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Base de données non trouvée!');
      console.log('   → Créez la base: CREATE DATABASE onehealth_cms;');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testAuth();
