const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');

// @route   GET /api/homepage
// @desc    Get all homepage sections (public)
router.get('/', async (req, res) => {
  try {
    const lang = req.query.lang || 'fr';
    const [sections] = await db.query(`
      SELECT id, section_key, section_name,
        ${lang === 'en' ? 'content_en' : 'content_fr'} as content,
        is_active, sort_order
      FROM homepage_sections
      WHERE is_active = TRUE
      ORDER BY sort_order ASC
    `);

    // Parse JSON content
    const parsedSections = sections.map(s => ({
      ...s,
      content: typeof s.content === 'string' ? JSON.parse(s.content) : s.content
    }));

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json({ success: true, data: parsedSections });
  } catch (error) {
    console.error('Get homepage sections error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/homepage/all
// @desc    Get all sections with both languages (admin)
router.get('/all', auth, async (req, res) => {
  try {
    const [sections] = await db.query(`
      SELECT * FROM homepage_sections
      ORDER BY sort_order ASC
    `);

    // Parse JSON content
    const parsedSections = sections.map(s => ({
      ...s,
      content_fr: typeof s.content_fr === 'string' ? JSON.parse(s.content_fr) : s.content_fr,
      content_en: typeof s.content_en === 'string' ? JSON.parse(s.content_en) : s.content_en
    }));

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json({ success: true, data: parsedSections });
  } catch (error) {
    console.error('Get all homepage sections error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/homepage/:key
// @desc    Get single section by key (public)
router.get('/:key', async (req, res) => {
  try {
    const lang = req.query.lang || 'fr';
    const [sections] = await db.query(`
      SELECT id, section_key, section_name,
        ${lang === 'en' ? 'content_en' : 'content_fr'} as content,
        is_active, sort_order
      FROM homepage_sections
      WHERE section_key = ?
    `, [req.params.key]);

    if (sections.length === 0) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const section = sections[0];
    section.content = typeof section.content === 'string' ? JSON.parse(section.content) : section.content;

    res.json({ success: true, data: section });
  } catch (error) {
    console.error('Get homepage section error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/homepage/section/:id
// @desc    Get single section by ID with both languages (admin)
router.get('/section/:id', auth, async (req, res) => {
  try {
    const [sections] = await db.query(`
      SELECT * FROM homepage_sections WHERE id = ?
    `, [req.params.id]);

    if (sections.length === 0) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const section = sections[0];
    section.content_fr = typeof section.content_fr === 'string' ? JSON.parse(section.content_fr) : section.content_fr;
    section.content_en = typeof section.content_en === 'string' ? JSON.parse(section.content_en) : section.content_en;

    res.json({ success: true, data: section });
  } catch (error) {
    console.error('Get homepage section by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/homepage/:id
// @desc    Update homepage section
router.put('/:id', auth, async (req, res) => {
  try {
    const { section_name, content_fr, content_en, is_active, sort_order } = req.body;

    await db.query(`
      UPDATE homepage_sections SET
        section_name = ?,
        content_fr = ?,
        content_en = ?,
        is_active = ?,
        sort_order = ?
      WHERE id = ?
    `, [
      section_name,
      JSON.stringify(content_fr),
      JSON.stringify(content_en),
      is_active,
      sort_order,
      req.params.id
    ]);

    const [updated] = await db.query('SELECT * FROM homepage_sections WHERE id = ?', [req.params.id]);
    const section = updated[0];
    section.content_fr = typeof section.content_fr === 'string' ? JSON.parse(section.content_fr) : section.content_fr;
    section.content_en = typeof section.content_en === 'string' ? JSON.parse(section.content_en) : section.content_en;

    res.json({ success: true, message: 'Section updated', data: section });
  } catch (error) {
    console.error('Update homepage section error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/homepage
// @desc    Create new homepage section
router.post('/', auth, async (req, res) => {
  try {
    const { section_key, section_name, content_fr, content_en, is_active, sort_order } = req.body;

    // Check key uniqueness
    const [existing] = await db.query('SELECT id FROM homepage_sections WHERE section_key = ?', [section_key]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Section key already exists' });
    }

    const [result] = await db.query(`
      INSERT INTO homepage_sections (section_key, section_name, content_fr, content_en, is_active, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      section_key,
      section_name,
      JSON.stringify(content_fr),
      JSON.stringify(content_en),
      is_active !== false,
      sort_order || 0
    ]);

    const [newSection] = await db.query('SELECT * FROM homepage_sections WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Section created', data: newSection[0] });
  } catch (error) {
    console.error('Create homepage section error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/homepage/:id
// @desc    Delete homepage section
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM homepage_sections WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Section deleted' });
  } catch (error) {
    console.error('Delete homepage section error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/homepage/reorder
// @desc    Reorder homepage sections
router.put('/reorder/sections', auth, async (req, res) => {
  try {
    const { sections } = req.body; // Array of { id, sort_order }

    for (const section of sections) {
      await db.query('UPDATE homepage_sections SET sort_order = ? WHERE id = ?', [section.sort_order, section.id]);
    }

    res.json({ success: true, message: 'Sections reordered' });
  } catch (error) {
    console.error('Reorder sections error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/homepage/:id/toggle
// @desc    Toggle section active status
router.put('/:id/toggle', auth, async (req, res) => {
  try {
    await db.query('UPDATE homepage_sections SET is_active = NOT is_active WHERE id = ?', [req.params.id]);

    const [updated] = await db.query('SELECT * FROM homepage_sections WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Section toggled', data: updated[0] });
  } catch (error) {
    console.error('Toggle section error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
