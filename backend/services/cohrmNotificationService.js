/**
 * Service de notifications COHRM
 * Gère l'envoi des notifications email et SMS pour le système de gestion des rumeurs
 */

const nodemailer = require('nodemailer');
const db = require('../config/db');

// Configuration du transporteur email
const createTransporter = () => {
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
    return {
      sendMail: async (options) => {
        console.log('=== COHRM EMAIL (Development Mode) ===');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('================================');
        return { messageId: 'dev-' + Date.now() };
      }
    };
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const transporter = createTransporter();

// Noms des niveaux de validation
const VALIDATION_LEVELS = {
  1: { name: 'Collecte', nameFr: 'Collecte communautaire' },
  2: { name: 'Vérification', nameFr: 'Vérification' },
  3: { name: 'Évaluation', nameFr: 'Évaluation des risques' },
  4: { name: 'Coordination', nameFr: 'Coordination régionale' },
  5: { name: 'Supervision', nameFr: 'Supervision centrale' }
};

// Noms des catégories
const CATEGORIES = {
  'human_health': 'Santé humaine',
  'animal_health': 'Santé animale',
  'environmental': 'Environnement',
  'safety': 'Sécurité',
  'disaster': 'Catastrophe',
  'other': 'Autre'
};

// Niveaux de risque
const RISK_LEVELS = {
  'unknown': 'Non évalué',
  'low': 'Faible',
  'moderate': 'Modéré',
  'high': 'Élevé',
  'very_high': 'Très élevé'
};

// Templates email
const emailTemplates = {
  // Nouvelle rumeur à valider
  newRumorAssigned: (data) => ({
    subject: `[COHRM] Nouvelle rumeur à traiter - ${data.rumorCode}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #FF5722 0%, #FF9800 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🔔 COHRM - Alerte Rumeur</h1>
          </div>
          <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #263238; margin-top: 0;">Bonjour ${data.userName},</h2>
            <p style="color: #607D8B; line-height: 1.6;">
              Une nouvelle rumeur nécessite votre attention au niveau <strong>${VALIDATION_LEVELS[data.level]?.nameFr || 'N/A'}</strong>.
            </p>

            <div style="background: #FFF3E0; border-left: 4px solid #FF9800; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px 0;"><strong>Code:</strong> ${data.rumorCode}</p>
              <p style="margin: 0 0 10px 0;"><strong>Titre:</strong> ${data.title}</p>
              <p style="margin: 0 0 10px 0;"><strong>Catégorie:</strong> ${CATEGORIES[data.category] || data.category}</p>
              <p style="margin: 0 0 10px 0;"><strong>Localisation:</strong> ${data.location}</p>
              <p style="margin: 0;"><strong>Date de détection:</strong> ${data.dateDetection || 'Non spécifiée'}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.adminUrl}/cohrm?tab=pending&id=${data.rumorId}" style="display: inline-block; background: linear-gradient(135deg, #FF5722 0%, #FF9800 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Traiter la rumeur
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 30px 0;">
            <p style="color: #9E9E9E; font-size: 12px; text-align: center;">
              Vous recevez cet email car vous êtes assigné comme validateur niveau ${data.level} dans le système COHRM.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Rumeur escaladée
  rumorEscalated: (data) => ({
    subject: `[COHRM] Rumeur escaladée - ${data.rumorCode}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #E91E63 0%, #9C27B0 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">⬆️ COHRM - Escalade</h1>
          </div>
          <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #263238; margin-top: 0;">Bonjour ${data.userName},</h2>
            <p style="color: #607D8B; line-height: 1.6;">
              Une rumeur a été escaladée du niveau ${data.fromLevel} vers le niveau <strong>${data.toLevel} (${VALIDATION_LEVELS[data.toLevel]?.nameFr})</strong>.
            </p>

            <div style="background: #FCE4EC; border-left: 4px solid #E91E63; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px 0;"><strong>Code:</strong> ${data.rumorCode}</p>
              <p style="margin: 0 0 10px 0;"><strong>Titre:</strong> ${data.title}</p>
              <p style="margin: 0 0 10px 0;"><strong>Raison de l'escalade:</strong> ${data.escalationReason || 'Non spécifiée'}</p>
              <p style="margin: 0;"><strong>Escaladé par:</strong> ${data.escalatedBy}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.adminUrl}/cohrm?tab=pending&id=${data.rumorId}" style="display: inline-block; background: linear-gradient(135deg, #E91E63 0%, #9C27B0 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Examiner la rumeur
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 30px 0;">
            <p style="color: #9E9E9E; font-size: 12px; text-align: center;">
              Cette notification est automatique. Merci de traiter cette rumeur dans les meilleurs délais.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Rumeur validée
  rumorValidated: (data) => ({
    subject: `[COHRM] Rumeur validée - ${data.rumorCode}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">✅ COHRM - Validation</h1>
          </div>
          <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #263238; margin-top: 0;">Bonjour ${data.userName},</h2>
            <p style="color: #607D8B; line-height: 1.6;">
              La rumeur <strong>${data.rumorCode}</strong> a été validée au niveau ${data.level}.
            </p>

            <div style="background: #E8F5E9; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px 0;"><strong>Titre:</strong> ${data.title}</p>
              <p style="margin: 0 0 10px 0;"><strong>Validé par:</strong> ${data.validatedBy}</p>
              <p style="margin: 0 0 10px 0;"><strong>Niveau actuel:</strong> ${data.currentLevel} / 5</p>
              ${data.notes ? `<p style="margin: 0;"><strong>Notes:</strong> ${data.notes}</p>` : ''}
            </div>

            ${data.currentLevel < 5 ? `
            <p style="color: #607D8B; line-height: 1.6;">
              La rumeur passera maintenant au niveau ${data.currentLevel + 1} (${VALIDATION_LEVELS[data.currentLevel + 1]?.nameFr}).
            </p>
            ` : `
            <p style="color: #4CAF50; line-height: 1.6; font-weight: bold;">
              ✅ La rumeur a complété tous les niveaux de validation.
            </p>
            `}

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.adminUrl}/cohrm?tab=rumors&id=${data.rumorId}" style="display: inline-block; background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Voir les détails
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Rumeur rejetée
  rumorRejected: (data) => ({
    subject: `[COHRM] Rumeur rejetée - ${data.rumorCode}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #f44336 0%, #E91E63 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">❌ COHRM - Rejet</h1>
          </div>
          <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #263238; margin-top: 0;">Bonjour ${data.userName},</h2>
            <p style="color: #607D8B; line-height: 1.6;">
              La rumeur <strong>${data.rumorCode}</strong> a été rejetée au niveau ${data.level}.
            </p>

            <div style="background: #FFEBEE; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px 0;"><strong>Titre:</strong> ${data.title}</p>
              <p style="margin: 0 0 10px 0;"><strong>Rejeté par:</strong> ${data.rejectedBy}</p>
              <p style="margin: 0;"><strong>Raison du rejet:</strong> ${data.rejectionReason || 'Non spécifiée'}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.adminUrl}/cohrm?tab=rumors&id=${data.rumorId}" style="display: inline-block; background: linear-gradient(135deg, #f44336 0%, #E91E63 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Voir les détails
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Évaluation des risques complétée
  riskAssessmentCompleted: (data) => ({
    subject: `[COHRM] Évaluation des risques - ${data.rumorCode} - Niveau ${data.riskLevel}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, ${data.riskLevel === 'very_high' || data.riskLevel === 'high' ? '#f44336, #FF5722' : '#FF9800, #FFC107'}); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ COHRM - Évaluation des Risques</h1>
          </div>
          <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #263238; margin-top: 0;">Bonjour ${data.userName},</h2>
            <p style="color: #607D8B; line-height: 1.6;">
              Une évaluation des risques a été complétée pour la rumeur <strong>${data.rumorCode}</strong>.
            </p>

            <div style="background: ${data.riskLevel === 'very_high' || data.riskLevel === 'high' ? '#FFEBEE' : '#FFF8E1'}; border-left: 4px solid ${data.riskLevel === 'very_high' || data.riskLevel === 'high' ? '#f44336' : '#FFC107'}; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px 0;"><strong>Niveau de risque:</strong> <span style="color: ${data.riskLevel === 'very_high' || data.riskLevel === 'high' ? '#f44336' : '#FF9800'}; font-weight: bold;">${RISK_LEVELS[data.riskLevel] || data.riskLevel}</span></p>
              <p style="margin: 0 0 10px 0;"><strong>Titre:</strong> ${data.title}</p>
              <p style="margin: 0 0 10px 0;"><strong>Évalué par:</strong> ${data.assessedBy}</p>
              ${data.riskDescription ? `<p style="margin: 0;"><strong>Description:</strong> ${data.riskDescription}</p>` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.adminUrl}/cohrm?tab=rumors&id=${data.rumorId}" style="display: inline-block; background: linear-gradient(135deg, #FF9800 0%, #FFC107 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Voir l'évaluation complète
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Rappel de validation en attente
  pendingValidationReminder: (data) => ({
    subject: `[COHRM] Rappel: ${data.pendingCount} rumeur(s) en attente de validation`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #2196F3 0%, #03A9F4 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📋 COHRM - Rappel</h1>
          </div>
          <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #263238; margin-top: 0;">Bonjour ${data.userName},</h2>
            <p style="color: #607D8B; line-height: 1.6;">
              Vous avez <strong>${data.pendingCount} rumeur(s)</strong> en attente de traitement au niveau <strong>${VALIDATION_LEVELS[data.level]?.nameFr || data.level}</strong>.
            </p>

            ${data.oldestRumor ? `
            <div style="background: #E3F2FD; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0 0 5px 0; font-weight: bold;">Rumeur la plus ancienne:</p>
              <p style="margin: 0 0 10px 0;"><strong>Code:</strong> ${data.oldestRumor.code}</p>
              <p style="margin: 0;"><strong>En attente depuis:</strong> ${data.oldestRumor.waitingTime}</p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.adminUrl}/cohrm?tab=pending" style="display: inline-block; background: linear-gradient(135deg, #2196F3 0%, #03A9F4 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Voir les rumeurs en attente
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 30px 0;">
            <p style="color: #9E9E9E; font-size: 12px; text-align: center;">
              Ceci est un rappel automatique. Vous pouvez configurer vos préférences de notification dans les paramètres.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Feedback/Rétro-information envoyée
  feedbackSent: (data) => ({
    subject: `[COHRM] Rétro-information - ${data.rumorCode}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #009688 0%, #4CAF50 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">💬 COHRM - Rétro-information</h1>
          </div>
          <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #263238; margin-top: 0;">Bonjour,</h2>
            <p style="color: #607D8B; line-height: 1.6;">
              Vous recevez une rétro-information concernant la rumeur <strong>${data.rumorCode}</strong>.
            </p>

            <div style="background: #E0F2F1; border-left: 4px solid #009688; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px 0;"><strong>Type:</strong> ${data.feedbackType}</p>
              <p style="margin: 0;"><strong>Message:</strong></p>
              <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${data.message}</p>
            </div>

            <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 30px 0;">
            <p style="color: #9E9E9E; font-size: 12px; text-align: center;">
              One Health Cameroun - Système COHRM
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

/**
 * Récupère les utilisateurs à notifier pour un niveau de validation donné
 */
async function getAssigneesToNotify(validationLevel, region = null, notificationType = 'email') {
  try {
    let query = `
      SELECT DISTINCT
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) as full_name,
        va.validation_level,
        va.region,
        va.department,
        va.notify_email,
        va.notify_sms
      FROM cohrm_validation_assignees va
      JOIN users u ON va.user_id = u.id
      WHERE va.is_active = 1
        AND va.validation_level = ?
        AND u.is_active = 1
        AND u.status = 'active'
    `;

    const params = [validationLevel];

    // Filtrer par région si spécifiée
    if (region) {
      query += ` AND (va.region IS NULL OR va.region = ?)`;
      params.push(region);
    }

    // Filtrer par type de notification
    if (notificationType === 'email') {
      query += ` AND va.notify_email = 1 AND u.email IS NOT NULL AND u.email != ''`;
    } else if (notificationType === 'sms') {
      query += ` AND va.notify_sms = 1`;
    }

    const [assignees] = await db.query(query, params);
    return assignees;
  } catch (error) {
    console.error('Error getting assignees to notify:', error);
    return [];
  }
}

/**
 * Enregistre une notification dans la base de données
 */
async function logNotification(data) {
  try {
    const [result] = await db.query(`
      INSERT INTO cohrm_notifications
      (rumor_id, user_id, notification_type, channel, recipient_email, recipient_phone, subject, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      data.rumorId || null,
      data.userId || null,
      data.notificationType,
      data.channel,
      data.recipientEmail || null,
      data.recipientPhone || null,
      data.subject,
      data.message || null,
      data.status || 'pending'
    ]);
    return result.insertId;
  } catch (error) {
    // Si la table n'existe pas encore, on log simplement
    console.error('Error logging notification:', error.message);
    return null;
  }
}

/**
 * Met à jour le statut d'une notification
 */
async function updateNotificationStatus(notificationId, status, errorMessage = null) {
  try {
    await db.query(`
      UPDATE cohrm_notifications
      SET status = ?,
          sent_at = ${status === 'sent' ? 'NOW()' : 'sent_at'},
          error_message = ?
      WHERE id = ?
    `, [status, errorMessage, notificationId]);
  } catch (error) {
    console.error('Error updating notification status:', error.message);
  }
}

/**
 * Envoie un email de notification
 */
async function sendEmail(to, template, data) {
  const adminUrl = process.env.ADMIN_URL || 'http://localhost:3001';
  const emailContent = template({ ...data, adminUrl });

  try {
    const result = await transporter.sendMail({
      from: `"COHRM - One Health Cameroun" <${process.env.SMTP_FROM || 'noreply@onehealth.cm'}>`,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    });

    console.log(`Email sent to ${to}: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Notifie les validateurs d'une nouvelle rumeur
 */
async function notifyNewRumor(rumor) {
  const assignees = await getAssigneesToNotify(rumor.validation_level || 1, rumor.region);
  const results = [];

  for (const assignee of assignees) {
    const notificationId = await logNotification({
      rumorId: rumor.id,
      userId: assignee.user_id,
      notificationType: 'new_rumor',
      channel: 'email',
      recipientEmail: assignee.email,
      subject: `Nouvelle rumeur à traiter - ${rumor.code}`
    });

    const result = await sendEmail(assignee.email, emailTemplates.newRumorAssigned, {
      userName: assignee.full_name || assignee.first_name,
      rumorId: rumor.id,
      rumorCode: rumor.code,
      title: rumor.title,
      category: rumor.category,
      location: [rumor.region, rumor.department, rumor.district].filter(Boolean).join(', ') || 'Non spécifiée',
      dateDetection: rumor.date_detection ? new Date(rumor.date_detection).toLocaleDateString('fr-FR') : null,
      level: rumor.validation_level || 1
    });

    if (notificationId) {
      await updateNotificationStatus(notificationId, result.success ? 'sent' : 'failed', result.error);
    }

    results.push({ assignee: assignee.email, ...result });
  }

  return results;
}

/**
 * Notifie les validateurs d'une escalade
 */
async function notifyEscalation(rumor, fromLevel, toLevel, escalatedBy, reason) {
  const assignees = await getAssigneesToNotify(toLevel, rumor.region);
  const results = [];

  for (const assignee of assignees) {
    const notificationId = await logNotification({
      rumorId: rumor.id,
      userId: assignee.user_id,
      notificationType: 'escalation',
      channel: 'email',
      recipientEmail: assignee.email,
      subject: `Rumeur escaladée - ${rumor.code}`
    });

    const result = await sendEmail(assignee.email, emailTemplates.rumorEscalated, {
      userName: assignee.full_name || assignee.first_name,
      rumorId: rumor.id,
      rumorCode: rumor.code,
      title: rumor.title,
      fromLevel,
      toLevel,
      escalatedBy,
      escalationReason: reason
    });

    if (notificationId) {
      await updateNotificationStatus(notificationId, result.success ? 'sent' : 'failed', result.error);
    }

    results.push({ assignee: assignee.email, ...result });
  }

  return results;
}

/**
 * Notifie d'une validation
 */
async function notifyValidation(rumor, validatedBy, notes) {
  // Notifier les validateurs du niveau suivant
  const nextLevel = (rumor.validation_level || 1) + 1;
  if (nextLevel > 5) return [];

  const assignees = await getAssigneesToNotify(nextLevel, rumor.region);
  const results = [];

  for (const assignee of assignees) {
    const notificationId = await logNotification({
      rumorId: rumor.id,
      userId: assignee.user_id,
      notificationType: 'validation',
      channel: 'email',
      recipientEmail: assignee.email,
      subject: `Rumeur validée - ${rumor.code}`
    });

    const result = await sendEmail(assignee.email, emailTemplates.rumorValidated, {
      userName: assignee.full_name || assignee.first_name,
      rumorId: rumor.id,
      rumorCode: rumor.code,
      title: rumor.title,
      level: rumor.validation_level,
      currentLevel: nextLevel,
      validatedBy,
      notes
    });

    if (notificationId) {
      await updateNotificationStatus(notificationId, result.success ? 'sent' : 'failed', result.error);
    }

    results.push({ assignee: assignee.email, ...result });
  }

  return results;
}

/**
 * Notifie d'un rejet
 */
async function notifyRejection(rumor, rejectedBy, reason) {
  // Notifier tous les validateurs des niveaux inférieurs
  const results = [];

  for (let level = 1; level < rumor.validation_level; level++) {
    const assignees = await getAssigneesToNotify(level, rumor.region);

    for (const assignee of assignees) {
      const notificationId = await logNotification({
        rumorId: rumor.id,
        userId: assignee.user_id,
        notificationType: 'rejection',
        channel: 'email',
        recipientEmail: assignee.email,
        subject: `Rumeur rejetée - ${rumor.code}`
      });

      const result = await sendEmail(assignee.email, emailTemplates.rumorRejected, {
        userName: assignee.full_name || assignee.first_name,
        rumorId: rumor.id,
        rumorCode: rumor.code,
        title: rumor.title,
        level: rumor.validation_level,
        rejectedBy,
        rejectionReason: reason
      });

      if (notificationId) {
        await updateNotificationStatus(notificationId, result.success ? 'sent' : 'failed', result.error);
      }

      results.push({ assignee: assignee.email, ...result });
    }
  }

  return results;
}

/**
 * Notifie d'une évaluation des risques
 */
async function notifyRiskAssessment(rumor, assessedBy, riskLevel, riskDescription) {
  // Notifier les validateurs de niveau 4 et 5 pour les risques élevés
  const levelsToNotify = riskLevel === 'very_high' || riskLevel === 'high' ? [4, 5] : [4];
  const results = [];

  for (const level of levelsToNotify) {
    const assignees = await getAssigneesToNotify(level, rumor.region);

    for (const assignee of assignees) {
      const notificationId = await logNotification({
        rumorId: rumor.id,
        userId: assignee.user_id,
        notificationType: 'risk_assessment',
        channel: 'email',
        recipientEmail: assignee.email,
        subject: `Évaluation des risques - ${rumor.code}`
      });

      const result = await sendEmail(assignee.email, emailTemplates.riskAssessmentCompleted, {
        userName: assignee.full_name || assignee.first_name,
        rumorId: rumor.id,
        rumorCode: rumor.code,
        title: rumor.title,
        riskLevel,
        riskDescription,
        assessedBy
      });

      if (notificationId) {
        await updateNotificationStatus(notificationId, result.success ? 'sent' : 'failed', result.error);
      }

      results.push({ assignee: assignee.email, ...result });
    }
  }

  return results;
}

/**
 * Envoie les rappels de validations en attente
 */
async function sendPendingReminders() {
  try {
    // Récupérer les rumeurs en attente par niveau
    const [pendingByLevel] = await db.query(`
      SELECT
        validation_level,
        region,
        COUNT(*) as pending_count,
        MIN(created_at) as oldest_date
      FROM cohrm_rumors
      WHERE status IN ('pending', 'in_verification')
      GROUP BY validation_level, region
    `);

    const results = [];

    for (const pending of pendingByLevel) {
      const assignees = await getAssigneesToNotify(pending.validation_level, pending.region);

      // Récupérer la rumeur la plus ancienne
      const [oldestRumors] = await db.query(`
        SELECT code, created_at
        FROM cohrm_rumors
        WHERE validation_level = ? AND (region = ? OR ? IS NULL)
          AND status IN ('pending', 'in_verification')
        ORDER BY created_at ASC
        LIMIT 1
      `, [pending.validation_level, pending.region, pending.region]);

      const oldestRumor = oldestRumors[0];
      const waitingDays = oldestRumor ? Math.floor((Date.now() - new Date(oldestRumor.created_at)) / (1000 * 60 * 60 * 24)) : 0;

      for (const assignee of assignees) {
        const result = await sendEmail(assignee.email, emailTemplates.pendingValidationReminder, {
          userName: assignee.full_name || assignee.first_name,
          level: pending.validation_level,
          pendingCount: pending.pending_count,
          oldestRumor: oldestRumor ? {
            code: oldestRumor.code,
            waitingTime: waitingDays > 0 ? `${waitingDays} jour(s)` : 'Moins d\'un jour'
          } : null
        });

        results.push({ assignee: assignee.email, ...result });
      }
    }

    return results;
  } catch (error) {
    console.error('Error sending pending reminders:', error);
    return [];
  }
}

/**
 * Envoie une rétro-information par email
 */
async function sendFeedbackEmail(recipientEmail, rumorCode, feedbackType, message) {
  const feedbackTypes = {
    'acknowledgment': 'Accusé de réception',
    'status_update': 'Mise à jour du statut',
    'clarification': 'Demande de clarification',
    'response_action': 'Action de réponse',
    'alert': 'Alerte',
    'correction': 'Correction d\'information'
  };

  const result = await sendEmail(recipientEmail, emailTemplates.feedbackSent, {
    rumorCode,
    feedbackType: feedbackTypes[feedbackType] || feedbackType,
    message
  });

  return result;
}

module.exports = {
  notifyNewRumor,
  notifyEscalation,
  notifyValidation,
  notifyRejection,
  notifyRiskAssessment,
  sendPendingReminders,
  sendFeedbackEmail,
  getAssigneesToNotify,
  logNotification,
  updateNotificationStatus,
  emailTemplates
};
