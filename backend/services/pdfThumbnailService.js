const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const THUMBNAILS_DIR = path.join(__dirname, '..', 'uploads', 'thumbnails');
const THUMB_WIDTH = 300;
const THUMB_HEIGHT = 400;

// Ensure thumbnails directory exists
if (!fs.existsSync(THUMBNAILS_DIR)) {
  fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
}

/**
 * Generate a WebP thumbnail from the first page of a PDF file.
 * @param {string} pdfFilePath - Absolute path to the PDF file on disk
 * @returns {Promise<string|null>} URL path like /uploads/thumbnails/{uuid}.webp, or null on failure
 */
async function generatePdfThumbnail(pdfFilePath) {
  try {
    if (!fs.existsSync(pdfFilePath)) {
      console.error('PDF thumbnail: file not found:', pdfFilePath);
      return null;
    }

    // Dynamic import for mupdf (ESM module)
    const mupdf = await import('mupdf');

    // Read PDF buffer and open document
    const pdfBuffer = fs.readFileSync(pdfFilePath);
    const doc = mupdf.Document.openDocument(pdfBuffer, 'application/pdf');

    if (doc.countPages() === 0) {
      console.error('PDF thumbnail: document has no pages:', pdfFilePath);
      return null;
    }

    // Render the first page
    const page = doc.loadPage(0);
    const bounds = page.getBounds();
    const pageWidth = bounds[2] - bounds[0];
    const pageHeight = bounds[3] - bounds[1];

    // Calculate scale to get a decent resolution for the thumbnail
    // Target ~600px wide render, then downscale with sharp for quality
    const scale = Math.max(600 / pageWidth, 1);
    const matrix = mupdf.Matrix.scale(scale, scale);
    const pixmap = page.toPixmap(matrix, mupdf.ColorSpace.DeviceRGB, false, true);

    const pixelWidth = pixmap.getWidth();
    const pixelHeight = pixmap.getHeight();
    const pixels = pixmap.getPixels();

    // Convert RGB pixel data to WebP thumbnail via sharp
    const thumbFilename = `${uuidv4()}.webp`;
    const thumbPath = path.join(THUMBNAILS_DIR, thumbFilename);

    await sharp(Buffer.from(pixels), {
      raw: {
        width: pixelWidth,
        height: pixelHeight,
        channels: 3
      }
    })
      .resize(THUMB_WIDTH, THUMB_HEIGHT, { fit: 'cover', position: 'top' })
      .webp({ quality: 85 })
      .toFile(thumbPath);

    const thumbUrl = `/uploads/thumbnails/${thumbFilename}`;
    console.log('PDF thumbnail generated:', thumbUrl);
    return thumbUrl;
  } catch (error) {
    console.error('PDF thumbnail generation error:', error.message);
    return null;
  }
}

/**
 * Given a URL path to a PDF (e.g. /uploads/documents/file.pdf), resolve
 * the absolute file path and generate a thumbnail.
 * @param {string} fileUrlPath - URL path like /uploads/documents/xxx.pdf
 * @returns {Promise<string|null>} Thumbnail URL path or null
 */
async function generateThumbnailFromUrlPath(fileUrlPath) {
  if (!fileUrlPath) return null;

  const absolutePath = path.join(__dirname, '..', fileUrlPath);
  return generatePdfThumbnail(absolutePath);
}

module.exports = {
  generatePdfThumbnail,
  generateThumbnailFromUrlPath
};
