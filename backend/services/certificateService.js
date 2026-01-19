/**
 * Certificate PDF Generation Service
 * Generates PDF certificates with QR codes, modern effects, multiple logos and signatories
 */

const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

// Certificate dimensions (A4 landscape)
const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;

// Default Colors
const DEFAULT_COLORS = {
  primary: '#1e40af',
  secondary: '#047857',
  accent: '#c9a227',
  text: '#1f2937',
  lightText: '#6b7280',
  background: '#ffffff'
};

/**
 * Parse hex color to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Parse rgba color string
 */
function parseRgba(rgbaStr) {
  const match = rgbaStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
      a: match[4] ? parseFloat(match[4]) : 1
    };
  }
  // Try hex
  if (rgbaStr.startsWith('#')) {
    const rgb = hexToRgb(rgbaStr);
    return { ...rgb, a: 1 };
  }
  return { r: 200, g: 200, b: 200, a: 0.05 };
}

/**
 * Get template from database
 */
async function getTemplate(templateIdOrSlug) {
  try {
    const [templates] = await db.query(
      `SELECT * FROM certificate_templates WHERE (id = ? OR slug = ?) AND is_active = TRUE`,
      [templateIdOrSlug, templateIdOrSlug]
    );

    if (templates.length > 0) {
      const template = templates[0];
      // Parse JSON fields
      if (template.custom_css) {
        try { template.customSettings = JSON.parse(template.custom_css); } catch (e) { template.customSettings = {}; }
      } else { template.customSettings = {}; }
      if (template.logos) {
        try { template.logosArray = JSON.parse(template.logos); } catch (e) { template.logosArray = []; }
      } else { template.logosArray = []; }
      if (template.signatories) {
        try { template.signatoriesArray = JSON.parse(template.signatories); } catch (e) { template.signatoriesArray = []; }
      } else { template.signatoriesArray = []; }
      return template;
    }

    // Return default template
    const [defaultTemplates] = await db.query(
      `SELECT * FROM certificate_templates WHERE is_default = TRUE AND is_active = TRUE LIMIT 1`
    );

    if (defaultTemplates.length > 0) {
      const template = defaultTemplates[0];
      if (template.custom_css) {
        try { template.customSettings = JSON.parse(template.custom_css); } catch (e) { template.customSettings = {}; }
      } else { template.customSettings = {}; }
      if (template.logos) {
        try { template.logosArray = JSON.parse(template.logos); } catch (e) { template.logosArray = []; }
      } else { template.logosArray = []; }
      if (template.signatories) {
        try { template.signatoriesArray = JSON.parse(template.signatories); } catch (e) { template.signatoriesArray = []; }
      } else { template.signatoriesArray = []; }
      return template;
    }

    return null;
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
}

/**
 * Generate QR code
 */
async function generateQRCode(url, color = '#1e40af') {
  try {
    return await QRCode.toDataURL(url, {
      width: 120,
      margin: 1,
      color: { dark: color, light: '#ffffff' }
    });
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
}

/**
 * Format date
 */
function formatDate(date, lang = 'fr') {
  const d = new Date(date);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', options);
}

/**
 * Draw modern background with bubbles, gradients, and curved lines
 */
function drawModernBackground(doc, template) {
  const bgColor = template?.background_color || '#ffffff';
  const customSettings = template?.customSettings || {};
  const bgEffects = customSettings.background_effects || {};

  // Base background
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(bgColor);

  // Parchment effect for academic style
  if (bgEffects.parchment) {
    const parchmentColor = bgEffects.parchment_color || '#f5f0e6';
    doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(parchmentColor);

    // Add subtle aged edges
    doc.save();
    doc.opacity(0.05);
    const edgeColor = '#8B7355';
    // Top edge
    for (let i = 0; i < 20; i++) {
      doc.rect(0, i, PAGE_WIDTH, 1).fill(edgeColor);
    }
    // Bottom edge
    for (let i = 0; i < 20; i++) {
      doc.rect(0, PAGE_HEIGHT - i, PAGE_WIDTH, 1).fill(edgeColor);
    }
    // Left edge
    for (let i = 0; i < 15; i++) {
      doc.rect(i, 0, 1, PAGE_HEIGHT).fill(edgeColor);
    }
    // Right edge
    for (let i = 0; i < 15; i++) {
      doc.rect(PAGE_WIDTH - i, 0, 1, PAGE_HEIGHT).fill(edgeColor);
    }
    doc.restore();
  }

  // Draw soft bubbles/circles
  if (bgEffects.bubbles && Array.isArray(bgEffects.bubbles)) {
    bgEffects.bubbles.forEach(bubble => {
      const x = (bubble.x / 100) * PAGE_WIDTH;
      const y = (bubble.y / 100) * PAGE_HEIGHT;
      const radius = bubble.radius || 80;
      const rgba = parseRgba(bubble.color || 'rgba(200, 200, 200, 0.05)');

      doc.save();
      doc.opacity(rgba.a);

      if (bubble.blur) {
        // Create gradient-like blur effect with multiple circles
        for (let i = 5; i >= 0; i--) {
          const r = radius + (i * 15);
          const alpha = rgba.a * (1 - i * 0.15);
          doc.opacity(alpha);
          doc.circle(x, y, r).fill(`rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`);
        }
      } else {
        doc.circle(x, y, radius).fill(`rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`);
      }
      doc.restore();
    });
  }

  // Draw curved decorative lines
  if (bgEffects.curved_lines && Array.isArray(bgEffects.curved_lines)) {
    bgEffects.curved_lines.forEach(line => {
      const startX = (line.start[0] / 100) * PAGE_WIDTH;
      const startY = (line.start[1] / 100) * PAGE_HEIGHT;
      const ctrlX = (line.control[0] / 100) * PAGE_WIDTH;
      const ctrlY = (line.control[1] / 100) * PAGE_HEIGHT;
      const endX = (line.end[0] / 100) * PAGE_WIDTH;
      const endY = (line.end[1] / 100) * PAGE_HEIGHT;

      const rgba = parseRgba(line.color || 'rgba(200, 162, 39, 0.1)');
      doc.save();
      doc.opacity(rgba.a);
      doc.lineWidth(line.width || 2)
         .strokeColor(`rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`)
         .moveTo(startX, startY)
         .quadraticCurveTo(ctrlX, ctrlY, endX, endY)
         .stroke();
      doc.restore();
    });
  }

  // Top accent bar
  if (bgEffects.top_accent) {
    const accent = bgEffects.top_accent;
    const height = accent.height || 6;
    const color = template?.border_color || '#0f766e';
    doc.rect(0, 0, PAGE_WIDTH, height).fill(color);
  }

  // Geometric lines (header/footer bands)
  if (bgEffects.geometric_lines && Array.isArray(bgEffects.geometric_lines)) {
    bgEffects.geometric_lines.forEach(line => {
      const y = (line.y / 100) * PAGE_HEIGHT;
      doc.rect(0, y, PAGE_WIDTH, line.width || 4).fill(line.color || '#1e3a5f');
    });
  }

  // Side accent bars
  if (bgEffects.side_accents && Array.isArray(bgEffects.side_accents)) {
    bgEffects.side_accents.forEach(accent => {
      const width = accent.width || 4;
      const color = template?.border_color || '#1e3a5f';
      if (accent.side === 'left') {
        doc.rect(0, 0, width, PAGE_HEIGHT).fill(color);
      } else if (accent.side === 'right') {
        doc.rect(PAGE_WIDTH - width, 0, width, PAGE_HEIGHT).fill(color);
      }
    });
  }

  // Watermark
  if (customSettings.watermark) {
    doc.save();
    doc.opacity(0.025);
    doc.fontSize(80)
       .fillColor('#000000')
       .rotate(-35, { origin: [PAGE_WIDTH / 2, PAGE_HEIGHT / 2] })
       .text(customSettings.watermark, 0, PAGE_HEIGHT / 2 - 40, {
         align: 'center',
         width: PAGE_WIDTH
       });
    doc.restore();
  }
}

/**
 * Draw modern border with various styles
 */
function drawModernBorder(doc, template) {
  const customSettings = template?.customSettings || {};
  const borderEffects = customSettings.border_effects || {};
  const style = borderEffects.style || template?.border_style || 'simple';
  const margin = 18;

  switch (style) {
    case 'ornate_gold':
      // Elegant gold multi-layer border
      const outerColor = borderEffects.outer_color || '#c9a227';
      const innerColor = borderEffects.inner_color || '#e8d5a3';
      const cornerRadius = borderEffects.corner_radius || 15;

      // Outer shadow effect
      doc.save();
      doc.opacity(0.1);
      doc.roundedRect(margin + 3, margin + 3, PAGE_WIDTH - margin * 2, PAGE_HEIGHT - margin * 2, cornerRadius)
         .fill('#000000');
      doc.restore();

      // Main outer border
      doc.lineWidth(10)
         .strokeColor(outerColor)
         .roundedRect(margin, margin, PAGE_WIDTH - margin * 2, PAGE_HEIGHT - margin * 2, cornerRadius)
         .stroke();

      // Middle accent line
      doc.lineWidth(2)
         .strokeColor(innerColor)
         .roundedRect(margin + 8, margin + 8, PAGE_WIDTH - (margin + 8) * 2, PAGE_HEIGHT - (margin + 8) * 2, cornerRadius - 3)
         .stroke();

      // Inner fine line
      doc.lineWidth(1)
         .strokeColor(outerColor)
         .roundedRect(margin + 14, margin + 14, PAGE_WIDTH - (margin + 14) * 2, PAGE_HEIGHT - (margin + 14) * 2, cornerRadius - 5)
         .stroke();

      // Corner flourishes
      if (borderEffects.corner_flourish) {
        drawCornerFlourishes(doc, outerColor, margin, cornerRadius);
      }
      break;

    case 'modern_minimal':
      // Clean modern border with shadow
      const modernColor = borderEffects.color || '#0f766e';
      const modernRadius = borderEffects.corner_radius || 20;

      if (borderEffects.shadow) {
        doc.save();
        doc.opacity(0.08);
        doc.roundedRect(margin + 4, margin + 4, PAGE_WIDTH - margin * 2, PAGE_HEIGHT - margin * 2, modernRadius)
           .fill('#000000');
        doc.restore();
      }

      doc.lineWidth(borderEffects.width || 3)
         .strokeColor(modernColor)
         .roundedRect(margin, margin, PAGE_WIDTH - margin * 2, PAGE_HEIGHT - margin * 2, modernRadius)
         .stroke();
      break;

    case 'corporate_double':
      // Professional double border
      const corpOuterColor = borderEffects.outer_color || '#1e3a5f';
      const corpInnerColor = borderEffects.inner_color || '#2563eb';
      const corpRadius = borderEffects.corner_radius || 12;

      doc.lineWidth(borderEffects.outer_width || 6)
         .strokeColor(corpOuterColor)
         .roundedRect(margin, margin, PAGE_WIDTH - margin * 2, PAGE_HEIGHT - margin * 2, corpRadius)
         .stroke();

      const gap = borderEffects.gap || 4;
      doc.lineWidth(borderEffects.inner_width || 2)
         .strokeColor(corpInnerColor)
         .roundedRect(margin + gap + 4, margin + gap + 4,
                      PAGE_WIDTH - (margin + gap + 4) * 2,
                      PAGE_HEIGHT - (margin + gap + 4) * 2, corpRadius - 2)
         .stroke();
      break;

    case 'academic_ornate':
      // Traditional academic border with flourishes
      const acadColor = borderEffects.color || '#7c2d12';
      const acadInnerColor = borderEffects.inner_color || '#b45309';

      // Outer border (no radius for traditional look)
      doc.lineWidth(borderEffects.width || 10)
         .strokeColor(acadColor)
         .rect(margin, margin, PAGE_WIDTH - margin * 2, PAGE_HEIGHT - margin * 2)
         .stroke();

      // Inner border
      if (borderEffects.inner_border) {
        doc.lineWidth(2)
           .strokeColor(acadInnerColor)
           .rect(margin + 12, margin + 12, PAGE_WIDTH - (margin + 12) * 2, PAGE_HEIGHT - (margin + 12) * 2)
           .stroke();
      }

      // Elaborate corner flourishes
      if (borderEffects.corner_flourishes === 'elaborate') {
        drawElaborateCorners(doc, acadColor, margin);
      }
      break;

    default:
      // Simple rounded border
      doc.lineWidth(template?.border_width || 4)
         .strokeColor(template?.border_color || '#1e40af')
         .roundedRect(margin, margin, PAGE_WIDTH - margin * 2, PAGE_HEIGHT - margin * 2, 10)
         .stroke();
  }
}

/**
 * Draw corner flourishes for ornate borders
 */
function drawCornerFlourishes(doc, color, margin, radius) {
  const size = 35;
  const positions = [
    { x: margin + radius, y: margin + radius, angle: 0 },
    { x: PAGE_WIDTH - margin - radius, y: margin + radius, angle: 90 },
    { x: PAGE_WIDTH - margin - radius, y: PAGE_HEIGHT - margin - radius, angle: 180 },
    { x: margin + radius, y: PAGE_HEIGHT - margin - radius, angle: 270 }
  ];

  positions.forEach(pos => {
    doc.save();
    doc.translate(pos.x, pos.y);
    doc.rotate(pos.angle);

    // Draw flourish
    doc.lineWidth(2)
       .strokeColor(color)
       .moveTo(-size, 0)
       .quadraticCurveTo(-size/2, -size/3, 0, -size)
       .stroke();

    doc.lineWidth(1.5)
       .moveTo(-size + 5, 5)
       .quadraticCurveTo(-size/2 + 3, -size/3 + 5, 5, -size + 5)
       .stroke();

    // Small decorative dot
    doc.circle(-size/2, -size/4, 2).fill(color);

    doc.restore();
  });
}

/**
 * Draw elaborate corners for academic style
 */
function drawElaborateCorners(doc, color, margin) {
  const cornerSize = 50;
  const corners = [
    { x: margin, y: margin },
    { x: PAGE_WIDTH - margin - cornerSize, y: margin },
    { x: margin, y: PAGE_HEIGHT - margin - cornerSize },
    { x: PAGE_WIDTH - margin - cornerSize, y: PAGE_HEIGHT - margin - cornerSize }
  ];

  corners.forEach((corner, index) => {
    doc.save();
    doc.translate(corner.x + (index % 2 === 1 ? cornerSize : 0),
                  corner.y + (index >= 2 ? cornerSize : 0));

    const flipX = index % 2 === 1 ? -1 : 1;
    const flipY = index >= 2 ? -1 : 1;

    // L-shape with curves
    doc.lineWidth(3)
       .strokeColor(color)
       .moveTo(0, cornerSize * flipY)
       .lineTo(0, 15 * flipY)
       .quadraticCurveTo(0, 0, 15 * flipX, 0)
       .lineTo(cornerSize * flipX, 0)
       .stroke();

    // Inner decorative curve
    doc.lineWidth(1.5)
       .moveTo(5 * flipX, cornerSize * flipY * 0.8)
       .quadraticCurveTo(5 * flipX, 5 * flipY, cornerSize * flipX * 0.8, 5 * flipY)
       .stroke();

    // Corner diamond
    doc.save();
    doc.translate(12 * flipX, 12 * flipY);
    doc.rotate(45);
    doc.rect(-4, -4, 8, 8).fill(color);
    doc.restore();

    doc.restore();
  });
}

/**
 * Draw multiple logos
 */
function drawLogos(doc, template) {
  const logos = template?.logosArray || [];
  const legacyLogo = template?.logo_url;

  // If no logos array but has legacy logo
  if (logos.length === 0 && legacyLogo) {
    logos.push({
      url: legacyLogo,
      position: template?.logo_position || 'top-center',
      width: template?.logo_width || 100
    });
  }

  let maxLogoHeight = 0;

  logos.forEach(logo => {
    try {
      // Try multiple paths to find the logo
      let logoPath;
      const possiblePaths = [
        // If URL starts with /uploads, look in backend/uploads
        logo.url.startsWith('/uploads')
          ? path.join(__dirname, '..', logo.url)
          : null,
        // Direct path in backend
        path.join(__dirname, '..', logo.url),
        // Legacy path in frontend-next
        path.join(__dirname, '..', '..', 'frontend-next', 'public', logo.url),
        // Absolute path in uploads folder
        path.join(__dirname, '..', 'uploads', logo.url.replace(/^\/uploads\//, '')),
      ].filter(Boolean);

      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          logoPath = p;
          break;
        }
      }

      if (!logoPath) {
        console.log(`Logo not found in any path: ${logo.url}`);
        return;
      }

      const width = logo.width || 100;
      let x, y = 35;

      switch (logo.position) {
        case 'top-left':
          x = 50;
          break;
        case 'top-right':
          x = PAGE_WIDTH - width - 50;
          break;
        case 'top-center':
        default:
          x = (PAGE_WIDTH - width) / 2;
          break;
      }

      doc.image(logoPath, x, y, { width: width });
      const estimatedHeight = width * 0.7; // Approximate aspect ratio
      maxLogoHeight = Math.max(maxLogoHeight, estimatedHeight);
    } catch (err) {
      console.log('Error loading logo:', err.message);
    }
  });

  return maxLogoHeight > 0 ? 35 + maxLogoHeight + 10 : 45;
}

/**
 * Draw multiple signatories
 */
function drawSignatories(doc, template, signatoryY, colors, lang) {
  const signatories = template?.signatoriesArray || [];

  // Fallback to legacy signatory
  if (signatories.length === 0) {
    const legacyName = template?.signatory_name;
    const legacyTitle = template?.signatory_title;
    if (legacyName) {
      signatories.push({
        name: legacyName,
        title: legacyTitle || (lang === 'fr' ? 'Coordonnateur' : 'Coordinator'),
        position: 'center'
      });
    }
  }

  const count = signatories.length;
  if (count === 0) return;

  const positions = {
    1: [{ x: PAGE_WIDTH / 2, width: 200 }], // Center
    2: [{ x: 150, width: 180 }, { x: PAGE_WIDTH - 150, width: 180 }], // Left, Right
    3: [{ x: 130, width: 160 }, { x: PAGE_WIDTH / 2, width: 160 }, { x: PAGE_WIDTH - 130, width: 160 }] // Left, Center, Right
  };

  const posConfig = positions[Math.min(count, 3)] || positions[1];

  signatories.slice(0, 3).forEach((sig, index) => {
    const pos = posConfig[index];
    const x = pos.x - pos.width / 2;

    // Signature line
    doc.lineWidth(1)
       .strokeColor('#9ca3af')
       .moveTo(x, signatoryY + 25)
       .lineTo(x + pos.width, signatoryY + 25)
       .stroke();

    // Name
    doc.fontSize(12)
       .fillColor(colors.text)
       .font('Helvetica-Bold')
       .text(sig.name || 'Signataire', x, signatoryY + 32, { width: pos.width, align: 'center' });

    // Title
    doc.fontSize(9)
       .fillColor('#6b7280')
       .font('Helvetica')
       .text(sig.title || '', x, signatoryY + 47, { width: pos.width, align: 'center' });
  });
}

/**
 * Draw academic seal
 */
function drawSeal(doc, template, y) {
  const customSettings = template?.customSettings || {};
  const seal = customSettings.seal;

  if (!seal || !seal.show) return;

  const size = seal.size || 60;
  const color = seal.color || '#7c2d12';
  let x;

  switch (seal.position) {
    case 'bottom-left':
      x = 100;
      break;
    case 'bottom-right':
      x = PAGE_WIDTH - 100;
      break;
    case 'bottom-center':
    default:
      x = PAGE_WIDTH / 2;
      break;
  }

  // Outer ring
  doc.lineWidth(3)
     .strokeColor(color)
     .circle(x, y, size / 2)
     .stroke();

  // Inner ring
  doc.lineWidth(1.5)
     .circle(x, y, size / 2 - 6)
     .stroke();

  // Center dot pattern
  doc.circle(x, y, 8).fill(color);
  doc.circle(x, y, 4).fill('#ffffff');

  // Text around seal
  doc.fontSize(6)
     .fillColor(color)
     .text('ONE HEALTH CAMEROUN', x - 25, y - size / 2 - 12, { width: 50, align: 'center' });
}

/**
 * Generate certificate PDF with all modern features
 */
async function generateCertificatePDF(certificateData, lang = 'fr', templateIdOrSlug = null) {
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
        enrollable_type,
        template_id
      } = certificateData;

      // Get template
      const template = await getTemplate(templateIdOrSlug || template_id || 'classic');
      const customSettings = template?.customSettings || {};

      // Colors
      const colors = {
        primary: template?.title_color || DEFAULT_COLORS.primary,
        secondary: template?.border_color || DEFAULT_COLORS.secondary,
        text: template?.body_color || DEFAULT_COLORS.text,
        accent: customSettings.accent_color || DEFAULT_COLORS.accent
      };

      // Display values
      const displayTitle = lang === 'en' && title_en ? title_en : title_fr;
      const courseTitle = lang === 'en' && course_title_en ? course_title_en : course_title_fr;

      // Verification URL & QR
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
      const verificationUrl = `${baseUrl}/${lang}/oh-elearning/certificate/verify/${verification_code}`;
      const qrCodeDataUrl = await generateQRCode(verificationUrl, colors.primary);

      // Create PDF
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 40, bottom: 40, left: 40, right: 40 }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ===== BACKGROUND =====
      drawModernBackground(doc, template);

      // ===== BORDER =====
      drawModernBorder(doc, template);

      // ===== LOGOS =====
      const logoEndY = drawLogos(doc, template);

      // ===== HEADER =====
      let currentY = logoEndY + 5;

      // Organization
      doc.fontSize(11)
         .fillColor(colors.primary)
         .font('Helvetica-Bold')
         .text('ONE HEALTH CAMEROUN', 0, currentY, { align: 'center', width: PAGE_WIDTH });

      doc.fontSize(9)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text('Programme National de Prevention des Zoonoses', 0, currentY + 14, { align: 'center', width: PAGE_WIDTH });

      currentY += 35;

      // Certificate Title
      const titleText = template?.title_text || (lang === 'fr' ? 'CERTIFICAT DE REUSSITE' : 'CERTIFICATE OF COMPLETION');
      doc.fontSize(template?.title_size || 34)
         .fillColor(colors.primary)
         .font('Helvetica-Bold')
         .text(titleText, 0, currentY, { align: 'center', width: PAGE_WIDTH });

      currentY += 45;

      // Subtitle
      const subtitleText = enrollable_type === 'learning_path'
        ? (lang === 'fr' ? 'Parcours Diplomant' : 'Learning Path')
        : (lang === 'fr' ? 'Formation Professionnelle' : 'Professional Training');

      doc.fontSize(13)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text(subtitleText, 0, currentY, { align: 'center', width: PAGE_WIDTH });

      currentY += 25;

      // Decorative line with dots
      doc.lineWidth(2)
         .strokeColor(colors.accent)
         .moveTo(PAGE_WIDTH / 2 - 100, currentY)
         .lineTo(PAGE_WIDTH / 2 + 100, currentY)
         .stroke();

      doc.circle(PAGE_WIDTH / 2 - 110, currentY, 3).fill(colors.accent);
      doc.circle(PAGE_WIDTH / 2 + 110, currentY, 3).fill(colors.accent);

      currentY += 20;

      // ===== BODY =====
      doc.fontSize(12)
         .fillColor(colors.text)
         .font('Helvetica')
         .text(lang === 'fr' ? 'Ce certificat atteste que' : 'This certifies that', 0, currentY, { align: 'center', width: PAGE_WIDTH });

      currentY += 22;

      // Recipient name
      doc.fontSize(26)
         .fillColor(colors.primary)
         .font('Helvetica-Bold')
         .text(recipient_name, 0, currentY, { align: 'center', width: PAGE_WIDTH });

      // Underline
      const nameWidth = doc.widthOfString(recipient_name);
      currentY += 32;
      doc.lineWidth(1)
         .strokeColor(colors.accent)
         .moveTo((PAGE_WIDTH - nameWidth) / 2 - 15, currentY)
         .lineTo((PAGE_WIDTH + nameWidth) / 2 + 15, currentY)
         .stroke();

      currentY += 15;

      doc.fontSize(12)
         .fillColor(colors.text)
         .font('Helvetica')
         .text(lang === 'fr' ? 'a complete avec succes la formation' : 'has successfully completed', 0, currentY, { align: 'center', width: PAGE_WIDTH });

      currentY += 22;

      // Course title
      doc.fontSize(18)
         .fillColor(colors.accent)
         .font('Helvetica-Bold')
         .text(displayTitle || courseTitle, 50, currentY, { align: 'center', width: PAGE_WIDTH - 100 });

      currentY += 35;

      // ===== DETAILS =====
      const detailBoxWidth = 130;
      let detailCount = 0;
      if (template?.show_score !== false && final_score !== null) detailCount++;
      if (template?.show_date !== false) detailCount++;
      if (template?.show_hours !== false && total_hours) detailCount++;

      if (detailCount > 0) {
        const detailsStartX = (PAGE_WIDTH - (detailBoxWidth * detailCount + 25 * (detailCount - 1))) / 2;
        let currentDetailX = detailsStartX;

        // Score
        if (template?.show_score !== false && final_score !== null) {
          doc.roundedRect(currentDetailX - 8, currentY - 3, detailBoxWidth + 16, 45, 8)
             .fillOpacity(0.06).fill(colors.primary).fillOpacity(1);

          doc.fontSize(10).fillColor('#6b7280').font('Helvetica')
             .text(lang === 'fr' ? 'Score Final' : 'Final Score', currentDetailX, currentY, { width: detailBoxWidth, align: 'center' });

          doc.fontSize(20).fillColor(colors.primary).font('Helvetica-Bold')
             .text(`${Math.round(final_score)}%`, currentDetailX, currentY + 15, { width: detailBoxWidth, align: 'center' });

          currentDetailX += detailBoxWidth + 25;
        }

        // Date
        if (template?.show_date !== false) {
          doc.roundedRect(currentDetailX - 8, currentY - 3, detailBoxWidth + 16, 45, 8)
             .fillOpacity(0.06).fill(colors.primary).fillOpacity(1);

          doc.fontSize(10).fillColor('#6b7280').font('Helvetica')
             .text(lang === 'fr' ? 'Delivre le' : 'Issued on', currentDetailX, currentY, { width: detailBoxWidth, align: 'center' });

          doc.fontSize(12).fillColor(colors.text).font('Helvetica-Bold')
             .text(formatDate(issue_date, lang), currentDetailX, currentY + 16, { width: detailBoxWidth, align: 'center' });

          currentDetailX += detailBoxWidth + 25;
        }

        // Hours
        if (template?.show_hours !== false && total_hours) {
          doc.roundedRect(currentDetailX - 8, currentY - 3, detailBoxWidth + 16, 45, 8)
             .fillOpacity(0.06).fill(colors.primary).fillOpacity(1);

          doc.fontSize(10).fillColor('#6b7280').font('Helvetica')
             .text(lang === 'fr' ? 'Duree' : 'Duration', currentDetailX, currentY, { width: detailBoxWidth, align: 'center' });

          doc.fontSize(14).fillColor(colors.text).font('Helvetica-Bold')
             .text(`${total_hours}h`, currentDetailX, currentY + 15, { width: detailBoxWidth, align: 'center' });
        }
      }

      // Expiry
      if (expiry_date) {
        doc.fontSize(9).fillColor('#6b7280').font('Helvetica-Oblique')
           .text(lang === 'fr' ? `Valide jusqu'au ${formatDate(expiry_date, lang)}` : `Valid until ${formatDate(expiry_date, lang)}`,
                 0, currentY + 50, { align: 'center', width: PAGE_WIDTH });
      }

      // ===== FOOTER =====
      const signatoryY = PAGE_HEIGHT - 120;

      // Signatories
      if (template?.show_signature !== false) {
        drawSignatories(doc, template, signatoryY, colors, lang);
      }

      // Academic seal
      drawSeal(doc, template, signatoryY + 20);

      // QR Code
      if (template?.show_qr_code !== false) {
        const qrX = template?.qr_position === 'bottom-left' ? 60 : PAGE_WIDTH - 140;
        const qrY = signatoryY - 25;

        doc.roundedRect(qrX - 8, qrY - 8, 96, 105, 8)
           .fillOpacity(0.04).fill(colors.primary).fillOpacity(1);

        const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
        doc.image(qrBuffer, qrX, qrY, { width: 80, height: 80 });

        doc.fontSize(7).fillColor('#6b7280').font('Helvetica')
           .text(lang === 'fr' ? 'Scanner pour verifier' : 'Scan to verify', qrX - 10, qrY + 82, { width: 100, align: 'center' });
      }

      // Certificate number
      doc.fontSize(8).fillColor('#9ca3af').font('Helvetica')
         .text(`${lang === 'fr' ? 'N' : 'No.'} ${certificate_number}`, 0, PAGE_HEIGHT - 45, { align: 'center', width: PAGE_WIDTH });

      doc.fontSize(7)
         .text(`${lang === 'fr' ? 'Code de verification' : 'Verification code'}: ${verification_code}`,
               0, PAGE_HEIGHT - 34, { align: 'center', width: PAGE_WIDTH });

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Save certificate PDF to disk
 */
async function saveCertificatePDF(certificateData, lang = 'fr', outputDir = 'uploads/certificates', templateIdOrSlug = null) {
  const pdfBuffer = await generateCertificatePDF(certificateData, lang, templateIdOrSlug);

  const fullPath = path.join(__dirname, '..', outputDir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  const filename = `${certificateData.certificate_number}_${lang}.pdf`;
  const filepath = path.join(fullPath, filename);
  fs.writeFileSync(filepath, pdfBuffer);

  return `/${outputDir}/${filename}`;
}

module.exports = {
  generateCertificatePDF,
  saveCertificatePDF,
  generateQRCode,
  getTemplate
};
