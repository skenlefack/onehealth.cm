/**
 * Certificate PDF Generation Service
 * Generates PDF certificates with QR codes for verification
 */

const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Certificate dimensions (A4 landscape)
const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;

// Colors
const COLORS = {
  primary: '#1e40af',      // Blue
  secondary: '#047857',    // Green (One Health)
  accent: '#7c3aed',       // Purple
  gold: '#d97706',         // Gold for border
  text: '#1f2937',         // Dark gray
  lightText: '#6b7280',    // Light gray
  background: '#f8fafc'    // Light background
};

/**
 * Generate a QR code as a data URL
 * @param {string} url - URL to encode
 * @returns {Promise<string>} - Base64 data URL
 */
async function generateQRCode(url) {
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 120,
      margin: 1,
      color: {
        dark: COLORS.primary,
        light: '#ffffff'
      }
    });
    return qrDataUrl;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
}

/**
 * Format a date for display
 * @param {string|Date} date
 * @param {string} lang - 'fr' or 'en'
 * @returns {string}
 */
function formatDate(date, lang = 'fr') {
  const d = new Date(date);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', options);
}

/**
 * Generate a certificate PDF
 * @param {Object} certificateData - Certificate data from database
 * @param {string} lang - Language ('fr' or 'en')
 * @returns {Promise<Buffer>} - PDF buffer
 */
async function generateCertificatePDF(certificateData, lang = 'fr') {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        certificate_number,
        recipient_name,
        title_fr,
        title_en,
        course_title_fr,
        course_title_en,
        final_score,
        total_hours,
        issue_date,
        expiry_date,
        verification_code,
        signatory_name,
        signatory_title,
        enrollable_type
      } = certificateData;

      // Determine display values based on language
      const title = lang === 'en' && title_en ? title_en : title_fr;
      const courseTitle = lang === 'en' && course_title_en ? course_title_en : course_title_fr;

      // Build verification URL
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
      const verificationUrl = `${baseUrl}/${lang}/oh-elearning/certificate/verify/${verification_code}`;

      // Generate QR code
      const qrCodeDataUrl = await generateQRCode(verificationUrl);

      // Create PDF document (A4 landscape)
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 40, bottom: 40, left: 40, right: 40 }
      });

      // Collect PDF data
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ===== BACKGROUND =====
      doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill('#ffffff');

      // ===== DECORATIVE BORDER =====
      // Outer border
      doc.lineWidth(3)
         .strokeColor(COLORS.gold)
         .rect(15, 15, PAGE_WIDTH - 30, PAGE_HEIGHT - 30)
         .stroke();

      // Inner border
      doc.lineWidth(1)
         .strokeColor(COLORS.primary)
         .rect(25, 25, PAGE_WIDTH - 50, PAGE_HEIGHT - 50)
         .stroke();

      // Corner decorations
      const cornerSize = 30;
      const corners = [
        { x: 25, y: 25 },
        { x: PAGE_WIDTH - 25 - cornerSize, y: 25 },
        { x: 25, y: PAGE_HEIGHT - 25 - cornerSize },
        { x: PAGE_WIDTH - 25 - cornerSize, y: PAGE_HEIGHT - 25 - cornerSize }
      ];

      corners.forEach(corner => {
        doc.lineWidth(2)
           .strokeColor(COLORS.secondary)
           .moveTo(corner.x, corner.y + cornerSize)
           .lineTo(corner.x, corner.y)
           .lineTo(corner.x + cornerSize, corner.y)
           .stroke();
      });

      // ===== HEADER =====
      // One Health logo/text
      doc.fontSize(14)
         .fillColor(COLORS.secondary)
         .font('Helvetica-Bold')
         .text('ONE HEALTH CAMEROON', 0, 50, { align: 'center', width: PAGE_WIDTH });

      // Certificate title
      doc.fontSize(36)
         .fillColor(COLORS.primary)
         .font('Helvetica-Bold')
         .text(lang === 'fr' ? 'CERTIFICAT' : 'CERTIFICATE', 0, 80, { align: 'center', width: PAGE_WIDTH });

      // Subtitle
      const subtitleText = enrollable_type === 'learning_path'
        ? (lang === 'fr' ? 'de Parcours Diplômant' : 'of Learning Path Completion')
        : (lang === 'fr' ? 'de Formation' : 'of Completion');

      doc.fontSize(18)
         .fillColor(COLORS.lightText)
         .font('Helvetica')
         .text(subtitleText, 0, 125, { align: 'center', width: PAGE_WIDTH });

      // ===== DECORATIVE LINE =====
      doc.lineWidth(2)
         .strokeColor(COLORS.gold)
         .moveTo(PAGE_WIDTH / 2 - 100, 155)
         .lineTo(PAGE_WIDTH / 2 + 100, 155)
         .stroke();

      // ===== BODY =====
      // "This certifies that"
      doc.fontSize(14)
         .fillColor(COLORS.text)
         .font('Helvetica')
         .text(lang === 'fr' ? 'Ce certificat atteste que' : 'This certifies that', 0, 175, { align: 'center', width: PAGE_WIDTH });

      // Recipient name
      doc.fontSize(32)
         .fillColor(COLORS.primary)
         .font('Helvetica-Bold')
         .text(recipient_name, 0, 200, { align: 'center', width: PAGE_WIDTH });

      // "has successfully completed"
      doc.fontSize(14)
         .fillColor(COLORS.text)
         .font('Helvetica')
         .text(
           lang === 'fr' ? 'a complété avec succès' : 'has successfully completed',
           0, 245, { align: 'center', width: PAGE_WIDTH }
         );

      // Course/Path title
      doc.fontSize(22)
         .fillColor(COLORS.secondary)
         .font('Helvetica-Bold')
         .text(title || courseTitle, 60, 275, { align: 'center', width: PAGE_WIDTH - 120 });

      // ===== DETAILS ROW =====
      const detailsY = 330;
      const detailBoxWidth = 150;
      const detailsStartX = (PAGE_WIDTH - (detailBoxWidth * 3 + 40)) / 2;

      // Score box
      if (final_score !== null && final_score !== undefined) {
        doc.fontSize(12)
           .fillColor(COLORS.lightText)
           .font('Helvetica')
           .text(lang === 'fr' ? 'Score Final' : 'Final Score', detailsStartX, detailsY, { width: detailBoxWidth, align: 'center' });

        doc.fontSize(20)
           .fillColor(COLORS.primary)
           .font('Helvetica-Bold')
           .text(`${Math.round(final_score)}%`, detailsStartX, detailsY + 18, { width: detailBoxWidth, align: 'center' });
      }

      // Date box
      doc.fontSize(12)
         .fillColor(COLORS.lightText)
         .font('Helvetica')
         .text(lang === 'fr' ? 'Date de Délivrance' : 'Issue Date', detailsStartX + detailBoxWidth + 20, detailsY, { width: detailBoxWidth, align: 'center' });

      doc.fontSize(16)
         .fillColor(COLORS.text)
         .font('Helvetica-Bold')
         .text(formatDate(issue_date, lang), detailsStartX + detailBoxWidth + 20, detailsY + 18, { width: detailBoxWidth, align: 'center' });

      // Hours box (if available)
      if (total_hours) {
        doc.fontSize(12)
           .fillColor(COLORS.lightText)
           .font('Helvetica')
           .text(lang === 'fr' ? 'Durée' : 'Duration', detailsStartX + (detailBoxWidth + 20) * 2, detailsY, { width: detailBoxWidth, align: 'center' });

        doc.fontSize(16)
           .fillColor(COLORS.text)
           .font('Helvetica-Bold')
           .text(`${total_hours}h`, detailsStartX + (detailBoxWidth + 20) * 2, detailsY + 18, { width: detailBoxWidth, align: 'center' });
      }

      // ===== EXPIRY WARNING =====
      if (expiry_date) {
        doc.fontSize(10)
           .fillColor(COLORS.lightText)
           .font('Helvetica-Oblique')
           .text(
             lang === 'fr'
               ? `Valide jusqu'au ${formatDate(expiry_date, lang)}`
               : `Valid until ${formatDate(expiry_date, lang)}`,
             0, 380, { align: 'center', width: PAGE_WIDTH }
           );
      }

      // ===== FOOTER SECTION =====
      // Signatory
      const signatoryY = 420;

      // Signature line
      doc.lineWidth(1)
         .strokeColor(COLORS.lightText)
         .moveTo(100, signatoryY + 40)
         .lineTo(280, signatoryY + 40)
         .stroke();

      doc.fontSize(14)
         .fillColor(COLORS.text)
         .font('Helvetica-Bold')
         .text(signatory_name || 'Dr. [Nom du Signataire]', 100, signatoryY + 48, { width: 180, align: 'center' });

      doc.fontSize(10)
         .fillColor(COLORS.lightText)
         .font('Helvetica')
         .text(signatory_title || (lang === 'fr' ? 'Directeur de Formation' : 'Director of Training'), 100, signatoryY + 65, { width: 180, align: 'center' });

      // ===== QR CODE =====
      const qrX = PAGE_WIDTH - 180;
      const qrY = signatoryY - 20;

      // Add QR code from data URL
      const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
      doc.image(qrBuffer, qrX, qrY, { width: 80, height: 80 });

      doc.fontSize(8)
         .fillColor(COLORS.lightText)
         .font('Helvetica')
         .text(lang === 'fr' ? 'Scanner pour vérifier' : 'Scan to verify', qrX - 10, qrY + 85, { width: 100, align: 'center' });

      // ===== CERTIFICATE NUMBER =====
      doc.fontSize(9)
         .fillColor(COLORS.lightText)
         .font('Helvetica')
         .text(`${lang === 'fr' ? 'N°' : 'No.'} ${certificate_number}`, 0, PAGE_HEIGHT - 55, { align: 'center', width: PAGE_WIDTH });

      // Verification code
      doc.fontSize(8)
         .text(
           `${lang === 'fr' ? 'Code de vérification' : 'Verification code'}: ${verification_code}`,
           0, PAGE_HEIGHT - 42, { align: 'center', width: PAGE_WIDTH }
         );

      // ===== FINALIZE =====
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Save certificate PDF to disk
 * @param {Object} certificateData
 * @param {string} lang
 * @param {string} outputDir - Directory to save the PDF
 * @returns {Promise<string>} - Path to saved file
 */
async function saveCertificatePDF(certificateData, lang = 'fr', outputDir = 'uploads/certificates') {
  const pdfBuffer = await generateCertificatePDF(certificateData, lang);

  // Ensure directory exists
  const fullPath = path.join(__dirname, '..', outputDir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  // Generate filename
  const filename = `${certificateData.certificate_number}_${lang}.pdf`;
  const filepath = path.join(fullPath, filename);

  // Write file
  fs.writeFileSync(filepath, pdfBuffer);

  return `/${outputDir}/${filename}`;
}

module.exports = {
  generateCertificatePDF,
  saveCertificatePDF,
  generateQRCode
};
