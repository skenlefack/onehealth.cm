/**
 * DOCUMENT CONVERSION SERVICE
 * One Health CMS
 *
 * Converts Word (.docx) and PDF files to HTML for newsletter content
 * - Word: Uses mammoth with image extraction
 * - PDF: Uses pdf-parse for text extraction
 */

const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Directory for extracted images
const IMAGES_DIR = path.join(__dirname, '../uploads/newsletter-images');

/**
 * Convert Word document to HTML
 * @param {string} filePath - Path to the .docx file
 * @returns {Promise<{html: string, warnings: string[], images: string[]}>}
 */
async function convertWordToHtml(filePath) {
  const warnings = [];
  const extractedImages = [];

  try {
    // Ensure images directory exists
    await fs.mkdir(IMAGES_DIR, { recursive: true });

    // Configure mammoth options with image handling
    const options = {
      convertImage: mammoth.images.imgElement(async function(image) {
        try {
          // Get image buffer and content type
          const imageBuffer = await image.read();
          const contentType = image.contentType;

          // Determine file extension
          let ext = 'png';
          if (contentType === 'image/jpeg' || contentType === 'image/jpg') {
            ext = 'jpg';
          } else if (contentType === 'image/gif') {
            ext = 'gif';
          } else if (contentType === 'image/webp') {
            ext = 'webp';
          }

          // Generate unique filename
          const filename = `${uuidv4()}.${ext}`;
          const imagePath = path.join(IMAGES_DIR, filename);

          // Save image
          await fs.writeFile(imagePath, imageBuffer);
          extractedImages.push(filename);

          // Return URL for HTML
          return {
            src: `/uploads/newsletter-images/${filename}`
          };
        } catch (imageError) {
          warnings.push(`Erreur lors de l'extraction d'une image: ${imageError.message}`);
          return { src: '' };
        }
      }),
      styleMap: [
        "p[style-name='Title'] => h1:fresh",
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Heading 4'] => h4:fresh",
        "b => strong",
        "i => em",
        "u => u",
        "strike => s"
      ]
    };

    // Convert document
    const result = await mammoth.convertToHtml({ path: filePath }, options);

    // Add mammoth warnings
    if (result.messages && result.messages.length > 0) {
      result.messages.forEach(msg => {
        if (msg.type === 'warning') {
          warnings.push(msg.message);
        }
      });
    }

    // Apply email-compatible inline styles
    const styledHtml = applyEmailStyles(result.value);

    return {
      html: styledHtml,
      warnings,
      images: extractedImages
    };
  } catch (error) {
    throw new Error(`Erreur de conversion Word: ${error.message}`);
  }
}

/**
 * Convert PDF to HTML
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<{html: string, warnings: string[]}>}
 */
async function convertPdfToHtml(filePath) {
  const warnings = [
    'Les fichiers PDF sont convertis en texte uniquement. Le formatage et les images ne sont pas preserves.'
  ];

  try {
    // Read PDF file
    const dataBuffer = await fs.readFile(filePath);

    // Parse PDF
    const data = await pdfParse(dataBuffer);

    if (!data.text || data.text.trim().length === 0) {
      throw new Error('Le document PDF ne contient pas de texte extractible');
    }

    // Convert text to HTML with basic formatting
    let html = convertTextToHtml(data.text);

    // Apply email-compatible inline styles
    html = applyEmailStyles(html);

    return {
      html,
      warnings,
      images: []
    };
  } catch (error) {
    throw new Error(`Erreur de conversion PDF: ${error.message}`);
  }
}

/**
 * Convert plain text to HTML with basic structure
 * @param {string} text - Plain text content
 * @returns {string} - HTML content
 */
function convertTextToHtml(text) {
  // Split into paragraphs (double newlines)
  const paragraphs = text.split(/\n\s*\n/);

  let html = '';

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    // Check if it looks like a heading (short line, possibly all caps or starts with number)
    const lines = trimmed.split('\n');

    if (lines.length === 1 && trimmed.length < 100) {
      // Could be a heading
      if (trimmed === trimmed.toUpperCase() && trimmed.length < 60) {
        // All caps - likely a main heading
        html += `<h2>${escapeHtml(trimmed)}</h2>\n`;
      } else if (/^[0-9]+[\.\)]\s/.test(trimmed) || /^[IVX]+[\.\)]\s/i.test(trimmed)) {
        // Numbered item - could be section heading
        html += `<h3>${escapeHtml(trimmed)}</h3>\n`;
      } else {
        html += `<p>${escapeHtml(trimmed)}</p>\n`;
      }
    } else {
      // Regular paragraph - preserve single line breaks
      const content = lines.map(line => escapeHtml(line.trim())).join('<br>\n');
      html += `<p>${content}</p>\n`;
    }
  }

  return html;
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Apply email-compatible inline styles to HTML
 * @param {string} html - HTML content
 * @returns {string} - HTML with inline styles
 */
function applyEmailStyles(html) {
  // Base styles for email compatibility
  const styles = {
    h1: 'font-size: 24px; font-weight: 700; color: #1e293b; margin: 0 0 16px 0; line-height: 1.3;',
    h2: 'font-size: 20px; font-weight: 600; color: #1e293b; margin: 24px 0 12px 0; line-height: 1.3;',
    h3: 'font-size: 18px; font-weight: 600; color: #334155; margin: 20px 0 10px 0; line-height: 1.3;',
    h4: 'font-size: 16px; font-weight: 600; color: #334155; margin: 16px 0 8px 0; line-height: 1.3;',
    p: 'font-size: 14px; color: #475569; margin: 0 0 12px 0; line-height: 1.6;',
    ul: 'font-size: 14px; color: #475569; margin: 0 0 16px 0; padding-left: 24px; line-height: 1.6;',
    ol: 'font-size: 14px; color: #475569; margin: 0 0 16px 0; padding-left: 24px; line-height: 1.6;',
    li: 'margin-bottom: 6px;',
    img: 'max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;',
    a: 'color: #27AE60; text-decoration: underline;',
    strong: 'font-weight: 600;',
    em: 'font-style: italic;',
    blockquote: 'border-left: 4px solid #27AE60; padding-left: 16px; margin: 16px 0; color: #64748b; font-style: italic;',
    table: 'width: 100%; border-collapse: collapse; margin: 16px 0;',
    th: 'background: #f1f5f9; padding: 12px; text-align: left; border: 1px solid #e2e8f0; font-weight: 600;',
    td: 'padding: 12px; border: 1px solid #e2e8f0;'
  };

  let styledHtml = html;

  // Apply styles to each element type
  Object.entries(styles).forEach(([tag, style]) => {
    // Match opening tags (with or without existing attributes)
    const regex = new RegExp(`<${tag}(\\s[^>]*)?>`, 'gi');
    styledHtml = styledHtml.replace(regex, (match, attrs) => {
      // Check if style already exists
      if (attrs && attrs.includes('style=')) {
        // Append to existing style
        return match.replace(/style="([^"]*)"/, `style="$1 ${style}"`);
      }
      // Add new style attribute
      return `<${tag} style="${style}"${attrs || ''}>`;
    });
  });

  return styledHtml;
}

/**
 * Clean up temporary file
 * @param {string} filePath - Path to file to delete
 */
async function cleanupFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error cleaning up file:', error.message);
  }
}

/**
 * Get file type from path
 * @param {string} filePath - Path to file
 * @returns {string} - 'word', 'pdf', or 'unknown'
 */
function getFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.docx') return 'word';
  if (ext === '.doc') return 'word-legacy';
  if (ext === '.pdf') return 'pdf';
  return 'unknown';
}

/**
 * Convert document to HTML based on file type
 * @param {string} filePath - Path to the document
 * @returns {Promise<{html: string, warnings: string[], images: string[], fileType: string}>}
 */
async function convertDocument(filePath) {
  const fileType = getFileType(filePath);

  switch (fileType) {
    case 'word':
      const wordResult = await convertWordToHtml(filePath);
      return { ...wordResult, fileType: 'word' };

    case 'word-legacy':
      throw new Error('Les fichiers .doc (ancien format Word) ne sont pas supportes. Veuillez utiliser le format .docx');

    case 'pdf':
      const pdfResult = await convertPdfToHtml(filePath);
      return { ...pdfResult, fileType: 'pdf' };

    default:
      throw new Error('Format de fichier non supporte. Utilisez .docx ou .pdf');
  }
}

module.exports = {
  convertDocument,
  convertWordToHtml,
  convertPdfToHtml,
  cleanupFile,
  getFileType
};
