const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // For development, use ethereal email or configure your SMTP
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
    // Development fallback - log to console
    return {
      sendMail: async (options) => {
        console.log('=== EMAIL (Development Mode) ===');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('HTML:', options.html);
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

// Email templates
const templates = {
  verifyEmail: {
    fr: (verificationUrl, userName) => ({
      subject: 'Vérifiez votre adresse email - One Health Cameroun',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #2196F3 0%, #00BCD4 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">One Health Cameroun</h1>
            </div>
            <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #263238; margin-top: 0;">Bienvenue ${userName} !</h2>
              <p style="color: #607D8B; line-height: 1.6;">
                Merci de vous être inscrit sur One Health Cameroun. Pour activer votre compte et accéder à toutes nos ressources, veuillez vérifier votre adresse email.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #2196F3 0%, #00BCD4 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Vérifier mon email
                </a>
              </div>
              <p style="color: #607D8B; line-height: 1.6; font-size: 14px;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
              </p>
              <p style="color: #2196F3; word-break: break-all; font-size: 14px;">
                ${verificationUrl}
              </p>
              <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 30px 0;">
              <p style="color: #9E9E9E; font-size: 12px; text-align: center;">
                Ce lien expirera dans 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    en: (verificationUrl, userName) => ({
      subject: 'Verify your email address - One Health Cameroon',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #2196F3 0%, #00BCD4 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">One Health Cameroon</h1>
            </div>
            <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #263238; margin-top: 0;">Welcome ${userName}!</h2>
              <p style="color: #607D8B; line-height: 1.6;">
                Thank you for registering on One Health Cameroon. To activate your account and access all our resources, please verify your email address.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #2196F3 0%, #00BCD4 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Verify my email
                </a>
              </div>
              <p style="color: #607D8B; line-height: 1.6; font-size: 14px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="color: #2196F3; word-break: break-all; font-size: 14px;">
                ${verificationUrl}
              </p>
              <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 30px 0;">
              <p style="color: #9E9E9E; font-size: 12px; text-align: center;">
                This link will expire in 24 hours. If you didn't create an account, please ignore this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    })
  },
  accountActivated: {
    fr: (userName) => ({
      subject: 'Votre compte a été activé - One Health Cameroun',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #4CAF50 0%, #00BCD4 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">One Health Cameroun</h1>
            </div>
            <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #263238; margin-top: 0;">Compte activé avec succès !</h2>
              <p style="color: #607D8B; line-height: 1.6;">
                Bonjour ${userName},<br><br>
                Votre compte a été vérifié et activé avec succès. Vous pouvez maintenant vous connecter et accéder à toutes les ressources de la plateforme One Health Cameroun.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3002'}/fr/auth/login" style="display: inline-block; background: linear-gradient(135deg, #4CAF50 0%, #00BCD4 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Se connecter
                </a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    en: (userName) => ({
      subject: 'Your account has been activated - One Health Cameroon',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #4CAF50 0%, #00BCD4 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">One Health Cameroon</h1>
            </div>
            <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #263238; margin-top: 0;">Account successfully activated!</h2>
              <p style="color: #607D8B; line-height: 1.6;">
                Hello ${userName},<br><br>
                Your account has been verified and activated successfully. You can now log in and access all the resources on the One Health Cameroon platform.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3002'}/en/auth/login" style="display: inline-block; background: linear-gradient(135deg, #4CAF50 0%, #00BCD4 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Log in
                </a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    })
  }
};

// Generate verification token
const generateVerificationToken = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
const sendVerificationEmail = async (email, userName, token, lang = 'fr') => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
  const verificationUrl = `${frontendUrl}/${lang}/auth/verify-email?token=${token}`;

  const template = templates.verifyEmail[lang] || templates.verifyEmail.fr;
  const { subject, html } = template(verificationUrl, userName);

  try {
    await transporter.sendMail({
      from: `"One Health Cameroun" <${process.env.SMTP_FROM || 'noreply@onehealth.cm'}>`,
      to: email,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Send account activated email
const sendAccountActivatedEmail = async (email, userName, lang = 'fr') => {
  const template = templates.accountActivated[lang] || templates.accountActivated.fr;
  const { subject, html } = template(userName);

  try {
    await transporter.sendMail({
      from: `"One Health Cameroun" <${process.env.SMTP_FROM || 'noreply@onehealth.cm'}>`,
      to: email,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Error sending account activated email:', error);
    throw error;
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  sendAccountActivatedEmail
};
