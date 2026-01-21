const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { auth, authorize } = require('../middleware/auth');

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || 'general';
    const uploadPath = path.join(__dirname, '../uploads', folder);
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// GET all media
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, folder, type, search } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];

    if (folder) {
      whereConditions.push('folder = ?');
      params.push(folder);
    }

    if (type) {
      whereConditions.push('mime_type LIKE ?');
      params.push(`${type}%`);
    }

    if (search) {
      whereConditions.push('(original_name LIKE ? OR alt_text LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM media ${whereClause}`, params);
    const [media] = await db.query(
      `SELECT m.*, u.username as uploaded_by_name 
       FROM media m 
       LEFT JOIN users u ON m.uploaded_by = u.id
       ${whereClause} 
       ORDER BY m.created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: media,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET single media
router.get('/:id', auth, async (req, res) => {
  try {
    const [media] = await db.query('SELECT * FROM media WHERE id = ?', [req.params.id]);
    if (media.length === 0) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }
    res.json({ success: true, data: media[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST upload media
router.post('/upload', auth, authorize('admin', 'editor', 'author'), upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const folder = req.body.folder || 'general';
    const uploadedMedia = [];

    for (const file of req.files) {
      const url = `/uploads/${folder}/${file.filename}`;
      
      const [result] = await db.query(
        `INSERT INTO media (filename, original_name, mime_type, size, path, file_path, url, folder, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [file.filename, file.originalname, file.mimetype, file.size, file.path, file.path, url, folder, req.user.id]
      );

      const [newMedia] = await db.query('SELECT * FROM media WHERE id = ?', [result.insertId]);
      uploadedMedia.push(newMedia[0]);
    }

    res.status(201).json({ success: true, message: 'Files uploaded', data: uploadedMedia });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// PUT update media metadata
router.put('/:id', auth, authorize('admin', 'editor', 'author'), async (req, res) => {
  try {
    const { alt_text, caption } = req.body;
    
    await db.query('UPDATE media SET alt_text = ?, caption = ? WHERE id = ?', 
      [alt_text, caption, req.params.id]);

    const [updated] = await db.query('SELECT * FROM media WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE media
router.delete('/:id', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const [media] = await db.query('SELECT * FROM media WHERE id = ?', [req.params.id]);
    if (media.length === 0) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }

    // Delete file from disk
    if (fs.existsSync(media[0].path)) {
      fs.unlinkSync(media[0].path);
    }

    await db.query('DELETE FROM media WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Media deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET folders
router.get('/folders/list', auth, async (req, res) => {
  try {
    const [folders] = await db.query('SELECT DISTINCT folder FROM media ORDER BY folder');
    res.json({ success: true, data: folders.map(f => f.folder) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
