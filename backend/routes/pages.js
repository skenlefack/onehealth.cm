const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, adminOnly } = require('../middleware/auth');

// @route   GET /api/pages
// @desc    Get all pages
router.get('/', async (req, res) => {
  try {
    const [pages] = await db.query(`
      SELECT p.*, u.username as author_name,
        (SELECT title FROM pages WHERE id = p.parent_id) as parent_title
      FROM pages p
      LEFT JOIN users u ON p.author_id = u.id
      ORDER BY p.sort_order ASC, p.created_at DESC
    `);
    res.json({ success: true, data: pages });
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/pages/:id
// @desc    Get single page
router.get('/:id', async (req, res) => {
  try {
    const [pages] = await db.query(`
      SELECT p.*, u.username as author_name
      FROM pages p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (pages.length === 0) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    
    res.json({ success: true, data: pages[0] });
  } catch (error) {
    console.error('Get page error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/pages/slug/:slug
// @desc    Get page by slug (public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const [pages] = await db.query(`
      SELECT p.*, u.username as author_name
      FROM pages p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.slug = ? AND p.status = 'published'
    `, [req.params.slug]);
    
    if (pages.length === 0) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    
    res.json({ success: true, data: pages[0] });
  } catch (error) {
    console.error('Get page by slug error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/pages
// @desc    Create page
router.post('/', auth, async (req, res) => {
  try {
    const {
      title, slug, content, sections, template, parent_id,
      status, featured_image, meta_title, meta_description,
      meta_keywords, css_custom, js_custom, sort_order,
      show_title, show_breadcrumb
    } = req.body;

    // Check slug uniqueness
    const [existing] = await db.query('SELECT id FROM pages WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Slug already exists' });
    }

    const [result] = await db.query(`
      INSERT INTO pages (
        title, slug, content, sections, template, parent_id, author_id,
        status, featured_image, meta_title, meta_description,
        meta_keywords, css_custom, js_custom, sort_order,
        show_title, show_breadcrumb
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, slug, content, sections, template || 'default', parent_id || null,
      req.user.id, status || 'draft', featured_image, meta_title, meta_description,
      meta_keywords, css_custom, js_custom, sort_order || 0,
      show_title !== false, show_breadcrumb !== false
    ]);

    const [newPage] = await db.query('SELECT * FROM pages WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Page created', data: newPage[0] });
  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/pages/:id
// @desc    Update page
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      title, slug, content, sections, template, parent_id,
      status, featured_image, meta_title, meta_description,
      meta_keywords, css_custom, js_custom, sort_order,
      show_title, show_breadcrumb
    } = req.body;

    // Check slug uniqueness (exclude current page)
    const [existing] = await db.query('SELECT id FROM pages WHERE slug = ? AND id != ?', [slug, req.params.id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Slug already exists' });
    }

    await db.query(`
      UPDATE pages SET
        title = ?, slug = ?, content = ?, sections = ?, template = ?,
        parent_id = ?, status = ?, featured_image = ?, meta_title = ?,
        meta_description = ?, meta_keywords = ?, css_custom = ?, js_custom = ?,
        sort_order = ?, show_title = ?, show_breadcrumb = ?
      WHERE id = ?
    `, [
      title, slug, content, sections, template, parent_id || null,
      status, featured_image, meta_title, meta_description,
      meta_keywords, css_custom, js_custom, sort_order,
      show_title, show_breadcrumb, req.params.id
    ]);

    const [updated] = await db.query('SELECT * FROM pages WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Page updated', data: updated[0] });
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/pages/:id
// @desc    Delete page
router.delete('/:id', auth, async (req, res) => {
  try {
    // Update children to have no parent
    await db.query('UPDATE pages SET parent_id = NULL WHERE parent_id = ?', [req.params.id]);
    
    await db.query('DELETE FROM pages WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Page deleted' });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/pages/:id/duplicate
// @desc    Duplicate page
router.put('/:id/duplicate', auth, async (req, res) => {
  try {
    const [pages] = await db.query('SELECT * FROM pages WHERE id = ?', [req.params.id]);
    if (pages.length === 0) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    const page = pages[0];
    const newSlug = `${page.slug}-copy-${Date.now()}`;
    
    const [result] = await db.query(`
      INSERT INTO pages (
        title, slug, content, sections, template, parent_id, author_id,
        status, featured_image, meta_title, meta_description,
        meta_keywords, css_custom, js_custom, sort_order,
        show_title, show_breadcrumb
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      `${page.title} (copie)`, newSlug, page.content, page.sections,
      page.template, page.parent_id, req.user.id, 'draft', page.featured_image,
      page.meta_title, page.meta_description, page.meta_keywords,
      page.css_custom, page.js_custom, page.sort_order,
      page.show_title, page.show_breadcrumb
    ]);

    const [newPage] = await db.query('SELECT * FROM pages WHERE id = ?', [result.insertId]);
    res.json({ success: true, message: 'Page duplicated', data: newPage[0] });
  } catch (error) {
    console.error('Duplicate page error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
