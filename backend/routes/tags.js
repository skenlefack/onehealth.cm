const express = require('express');
const router = express.Router();
const slugify = require('slugify');
const db = require('../config/db');
const { auth, authorize } = require('../middleware/auth');

// GET all tags
router.get('/', async (req, res) => {
  try {
    const [tags] = await db.query(`
      SELECT t.*, COUNT(pt.post_id) as post_count
      FROM tags t
      LEFT JOIN post_tags pt ON t.id = pt.tag_id
      GROUP BY t.id
      ORDER BY t.name
    `);
    res.json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET tag by slug
router.get('/:slug', async (req, res) => {
  try {
    const [tags] = await db.query('SELECT * FROM tags WHERE slug = ? OR id = ?', [req.params.slug, req.params.slug]);
    if (tags.length === 0) {
      return res.status(404).json({ success: false, message: 'Tag not found' });
    }
    res.json({ success: true, data: tags[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST create tag
router.post('/', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { name, description } = req.body;
    let slug = slugify(name, { lower: true, strict: true });
    
    const [existing] = await db.query('SELECT id FROM tags WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const [result] = await db.query('INSERT INTO tags (name, slug, description) VALUES (?, ?, ?)', [name, slug, description]);
    const [newTag] = await db.query('SELECT * FROM tags WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, data: newTag[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT update tag
router.put('/:id', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const { id } = req.params;

    const [tags] = await db.query('SELECT * FROM tags WHERE id = ?', [id]);
    if (tags.length === 0) {
      return res.status(404).json({ success: false, message: 'Tag not found' });
    }

    let slug = tags[0].slug;
    if (name && name !== tags[0].name) {
      slug = slugify(name, { lower: true, strict: true });
    }

    await db.query('UPDATE tags SET name = ?, slug = ?, description = ? WHERE id = ?', [name, slug, description, id]);
    const [updated] = await db.query('SELECT * FROM tags WHERE id = ?', [id]);

    res.json({ success: true, data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE tag
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM tags WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Tag deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
