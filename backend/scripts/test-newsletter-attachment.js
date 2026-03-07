/**
 * Test script for newsletter email with attachment
 * Run with: node scripts/test-newsletter-attachment.js
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const newsletterEmailService = require('../services/newsletterEmailService');

const TEST_EMAIL = 'serge.kenlefack@gmail.com'; // From .env SMTP_USER

async function testNewsletterWithAttachment() {
  console.log('=== Test Newsletter avec Piece Jointe ===\n');

  try {
    // 1. Create a test attachment file
    console.log('1. Creation du fichier de test...');
    const testContent = `
# Document de Test One Health

Ce document est un test pour verifier l'envoi de pieces jointes dans les newsletters.

## Contenu
- Test de la fonctionnalite d'import Word/PDF
- Verification de l'envoi par email
- Validation des pieces jointes

Date: ${new Date().toLocaleDateString('fr-FR')}
    `.trim();

    const attachmentDir = path.join(__dirname, '../uploads/newsletter-attachments');
    if (!fs.existsSync(attachmentDir)) {
      fs.mkdirSync(attachmentDir, { recursive: true });
    }

    const testFileName = 'test-document.txt';
    const testFilePath = path.join(attachmentDir, testFileName);
    fs.writeFileSync(testFilePath, testContent);
    console.log('   Fichier cree:', testFilePath);

    // 2. Create test newsletter data
    console.log('\n2. Preparation de la newsletter de test...');
    const testNewsletter = {
      id: 999999, // Fake ID for test
      name: 'Test Newsletter avec PJ',
      subject_fr: 'Test Newsletter One Health - Piece Jointe',
      subject_en: 'Test Newsletter One Health - Attachment',
      content_html_fr: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #27AE60;">Test Newsletter One Health</h1>
          <p>Bonjour {{first_name}},</p>
          <p>Ceci est un <strong>email de test</strong> pour verifier la fonctionnalite d'envoi de pieces jointes.</p>
          <p>Vous devriez voir un fichier en piece jointe a cet email.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Date d'envoi: ${new Date().toLocaleString('fr-FR')}<br>
            <a href="{{unsubscribe_url}}">Se desabonner</a>
          </p>
        </body>
        </html>
      `,
      content_html_en: null,
      attachments: JSON.stringify([{
        filename: 'Document-Test-OneHealth.txt',
        path: '/uploads/newsletter-attachments/' + testFileName,
        mimetype: 'text/plain',
        size: Buffer.byteLength(testContent)
      }])
    };

    // 3. Create test subscriber
    console.log('\n3. Configuration du destinataire...');
    const testSubscriber = {
      id: 0,
      email: TEST_EMAIL,
      first_name: 'Admin',
      last_name: 'Test',
      language: 'fr',
      unsubscribe_token: 'test-token-' + Date.now()
    };
    console.log('   Email destinataire:', TEST_EMAIL);

    // 4. Send test email
    console.log('\n4. Envoi de l\'email de test...');
    console.log('   SMTP Host:', process.env.SMTP_HOST);
    console.log('   SMTP User:', process.env.SMTP_USER);

    await newsletterEmailService.sendNewsletter(testNewsletter, testSubscriber);

    console.log('\n=== SUCCES ===');
    console.log('Email envoye avec succes a:', TEST_EMAIL);
    console.log('Verifiez votre boite de reception pour l\'email avec piece jointe.');

    // Cleanup
    fs.unlinkSync(testFilePath);
    console.log('\nFichier de test supprime.');

  } catch (error) {
    console.error('\n=== ERREUR ===');
    console.error('Erreur lors du test:', error.message);
    console.error(error.stack);
  } finally {
    // Close database connection
    await db.end();
    process.exit(0);
  }
}

// Run the test
testNewsletterWithAttachment();
