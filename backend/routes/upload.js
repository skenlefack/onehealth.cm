const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { auth } = require('../middleware/auth');
const { generatePdfThumbnail } = require('../services/pdfThumbnailService');

// Ensure upload directories exist
const uploadDirs = [
  'uploads/experts',
  'uploads/organizations',
  'uploads/materials',
  'uploads/documents',
  'uploads/thumbnails',
  'uploads/elearning/videos',
  'uploads/elearning/thumbnails',
  'uploads/elearning/pdfs',
  'uploads/elearning/attachments',
  'uploads/elearning/presentations'
];

uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers images (JPEG, PNG, GIF, WebP) sont autorisés'), false);
  }
};

// File filter for documents
const documentFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'), false);
  }
};

// Allowed image upload types
const ALLOWED_IMAGE_TYPES = ['experts', 'organizations', 'materials', 'general', 'avatars', 'media', 'cohrm'];

// Storage configuration for images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const rawType = req.params.type || 'general';
    // Sanitize: only allow whitelisted types to prevent path traversal
    const type = ALLOWED_IMAGE_TYPES.includes(rawType) ? rawType : 'general';
    const uploadPath = path.join(__dirname, '..', 'uploads', type);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${ext}`);
  }
});

// Storage configuration for documents
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'documents');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    // Keep original name for reference but make it safe
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueId}-${safeName}`);
  }
});

// Multer instances
const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max for images
});

const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max for documents
});

// ============================================
// E-LEARNING SPECIFIC UPLOADS
// ============================================

// File filter for videos only
const videoFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers vidéo (MP4, WebM, MOV, AVI, MKV) sont autorisés'), false);
  }
};

// File filter for PDFs only
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF sont autorisés'), false);
  }
};

// Storage configuration for e-learning videos
const elearningVideoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'elearning', 'videos');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${ext}`);
  }
});

// Storage configuration for e-learning PDFs
const elearningPdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'elearning', 'pdfs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueId}-${safeName}`);
  }
});

// Multer instances for e-learning
const uploadElearningVideo = multer({
  storage: elearningVideoStorage,
  fileFilter: videoFilter,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB max for videos
});

const uploadElearningPdf = multer({
  storage: elearningPdfStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max for PDFs
});

// File filter for PowerPoint files only
const powerpointFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PowerPoint (PPT, PPTX) sont autorisés'), false);
  }
};

// Storage configuration for e-learning PowerPoint presentations
const elearningPptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'elearning', 'presentations');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueId}-${safeName}`);
  }
});

const uploadElearningPpt = multer({
  storage: elearningPptStorage,
  fileFilter: powerpointFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max for PowerPoint
});

// Upload image (photo, logo)
router.post('/image/:type', auth, uploadImage.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier uploadé' });
    }

    const { type } = req.params;
    const originalPath = req.file.path;
    const filename = req.file.filename;

    // Process image with sharp for optimization
    let processedFilename = filename;
    const ext = path.extname(filename).toLowerCase();

    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      const optimizedFilename = filename.replace(ext, '.webp');
      const optimizedPath = path.join(path.dirname(originalPath), optimizedFilename);

      try {
        await sharp(originalPath)
          .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(optimizedPath);

        // Delete original if different format
        if (ext !== '.webp') {
          fs.unlinkSync(originalPath);
        }
        processedFilename = optimizedFilename;
      } catch (sharpError) {
        console.error('Sharp processing error:', sharpError);
        // Keep original if processing fails
        processedFilename = filename;
      }
    }

    // Create thumbnail for photos
    if (type === 'experts' || type === 'organizations') {
      const thumbPath = path.join(__dirname, '..', 'uploads', 'thumbnails', processedFilename);
      try {
        await sharp(path.join(path.dirname(originalPath), processedFilename))
          .resize(150, 150, { fit: 'cover' })
          .webp({ quality: 80 })
          .toFile(thumbPath);
      } catch (thumbError) {
        console.error('Thumbnail creation error:', thumbError);
      }
    }

    const fileUrl = `/uploads/${type}/${processedFilename}`;
    const thumbUrl = `/uploads/thumbnails/${processedFilename}`;

    res.json({
      success: true,
      data: {
        url: fileUrl,
        thumbnail: thumbUrl,
        filename: processedFilename,
        originalName: req.file.originalname,
        size: req.file.size,
        type: 'image'
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'upload' });
  }
});

// Upload document (PDF, Word, Excel, Video)
router.post('/document', auth, uploadDocument.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier uploadé' });
    }

    const fileUrl = `/uploads/documents/${req.file.filename}`;
    const fileType = req.file.mimetype.includes('video') ? 'video' :
                     req.file.mimetype.includes('pdf') ? 'pdf' :
                     req.file.mimetype.includes('word') ? 'word' :
                     req.file.mimetype.includes('excel') || req.file.mimetype.includes('spreadsheet') ? 'excel' :
                     req.file.mimetype.includes('powerpoint') || req.file.mimetype.includes('presentation') ? 'powerpoint' : 'other';

    // Generate PDF thumbnail if applicable
    let thumbnail = null;
    if (fileType === 'pdf') {
      thumbnail = await generatePdfThumbnail(req.file.path);
    }

    res.json({
      success: true,
      data: {
        url: fileUrl,
        thumbnail,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        type: fileType
      }
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'upload' });
  }
});

// ============================================
// E-LEARNING UPLOAD ROUTES
// ============================================

// Upload e-learning video
router.post('/elearning/video', auth, uploadElearningVideo.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier uploadé' });
    }

    const fileUrl = `/uploads/elearning/videos/${req.file.filename}`;

    // Get video duration using file stats (approximate)
    const stats = fs.statSync(req.file.path);

    res.json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        type: 'video'
      }
    });
  } catch (error) {
    console.error('E-learning video upload error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'upload de la vidéo' });
  }
});

// Upload e-learning PDF
router.post('/elearning/pdf', auth, uploadElearningPdf.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier uploadé' });
    }

    const fileUrl = `/uploads/elearning/pdfs/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        type: 'pdf'
      }
    });
  } catch (error) {
    console.error('E-learning PDF upload error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'upload du PDF' });
  }
});

// Upload e-learning PowerPoint
router.post('/elearning/powerpoint', auth, uploadElearningPpt.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier uploadé' });
    }

    const fileUrl = `/uploads/elearning/presentations/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        type: 'powerpoint'
      }
    });
  } catch (error) {
    console.error('E-learning PowerPoint upload error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'upload du PowerPoint' });
  }
});

// Word Document Upload
const wordFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only Word documents (.doc, .docx) are allowed'), false);
  }
};

const wordStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/elearning/documents');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    cb(null, uniqueName);
  }
});

const uploadWord = multer({ storage: wordStorage, fileFilter: wordFilter, limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/elearning/word', auth, uploadWord.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const url = `/uploads/elearning/documents/${req.file.filename}`;
    res.json({ success: true, data: { url, filename: req.file.originalname, size: req.file.size } });
  } catch (error) {
    console.error('Word upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// Excel Upload
const excelFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files (.xls, .xlsx) are allowed'), false);
  }
};

const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/elearning/documents');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    cb(null, uniqueName);
  }
});

const uploadExcel = multer({ storage: excelStorage, fileFilter: excelFilter, limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/elearning/excel', auth, uploadExcel.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const url = `/uploads/elearning/documents/${req.file.filename}`;
    res.json({ success: true, data: { url, filename: req.file.originalname, size: req.file.size } });
  } catch (error) {
    console.error('Excel upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// Upload e-learning course thumbnail
router.post('/elearning/thumbnail', auth, uploadImage.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier uploadé' });
    }

    const originalPath = req.file.path;
    const filename = req.file.filename;
    const ext = path.extname(filename).toLowerCase();

    // Move to elearning thumbnails folder
    const destPath = path.join(__dirname, '..', 'uploads', 'elearning', 'thumbnails');
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }

    let processedFilename = filename;

    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      const optimizedFilename = filename.replace(ext, '.webp');
      const optimizedPath = path.join(destPath, optimizedFilename);

      try {
        await sharp(originalPath)
          .resize(640, 360, { fit: 'cover' }) // 16:9 aspect ratio for course thumbnails
          .webp({ quality: 85 })
          .toFile(optimizedPath);

        // Delete original
        fs.unlinkSync(originalPath);
        processedFilename = optimizedFilename;
      } catch (sharpError) {
        console.error('Sharp processing error:', sharpError);
        // Move original if processing fails
        const newPath = path.join(destPath, filename);
        fs.renameSync(originalPath, newPath);
      }
    } else {
      const newPath = path.join(destPath, filename);
      fs.renameSync(originalPath, newPath);
    }

    const fileUrl = `/uploads/elearning/thumbnails/${processedFilename}`;

    res.json({
      success: true,
      data: {
        url: fileUrl,
        filename: processedFilename,
        originalName: req.file.originalname,
        size: req.file.size,
        type: 'image'
      }
    });
  } catch (error) {
    console.error('E-learning thumbnail upload error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'upload' });
  }
});

// Allowed upload subdirectories (whitelist)
const ALLOWED_UPLOAD_TYPES = [
  'experts', 'organizations', 'materials', 'documents', 'thumbnails', 'general',
  'elearning', 'cohrm', 'media', 'images', 'avatars'
];

// Delete file (with path traversal protection)
router.delete('/:type/:filename', auth, async (req, res) => {
  try {
    const { type, filename } = req.params;

    // Sanitize: use only basename to prevent path traversal (../../etc/passwd)
    const safeType = path.basename(type);
    const safeFilename = path.basename(filename);

    // Validate type against whitelist
    if (!ALLOWED_UPLOAD_TYPES.includes(safeType)) {
      return res.status(400).json({ success: false, message: 'Type de fichier invalide' });
    }

    // Validate filename doesn't contain suspicious characters
    if (/[^a-zA-Z0-9._-]/.test(safeFilename)) {
      return res.status(400).json({ success: false, message: 'Nom de fichier invalide' });
    }

    const uploadsRoot = path.resolve(__dirname, '..', 'uploads');
    const filePath = path.resolve(uploadsRoot, safeType, safeFilename);
    const thumbPath = path.resolve(uploadsRoot, 'thumbnails', safeFilename);

    // Extra safety: ensure resolved path is still within uploads directory
    if (!filePath.startsWith(uploadsRoot) || !thumbPath.startsWith(uploadsRoot)) {
      return res.status(400).json({ success: false, message: 'Chemin invalide' });
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    if (fs.existsSync(thumbPath)) {
      fs.unlinkSync(thumbPath);
    }

    res.json({ success: true, message: 'Fichier supprimé' });
  } catch (error) {
    console.error('Delete file error:', error.message);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'Fichier trop volumineux' });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
  next();
});

module.exports = router;
