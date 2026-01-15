const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');

// @route   GET /api/modules
// @desc    Get all modules
router.get('/', async (req, res) => {
  try {
    const [modules] = await db.query(`
      SELECT * FROM modules ORDER BY position, sort_order ASC
    `);
    
    // Parse JSON fields
    const parsedModules = modules.map(m => ({
      ...m,
      settings: m.settings ? JSON.parse(m.settings) : {},
      pages: m.pages ? JSON.parse(m.pages) : []
    }));
    
    res.json({ success: true, data: parsedModules });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/modules/position/:position
// @desc    Get modules by position (public)
router.get('/position/:position', async (req, res) => {
  try {
    const [modules] = await db.query(`
      SELECT * FROM modules 
      WHERE position = ? AND status = 'active'
      ORDER BY sort_order ASC
    `, [req.params.position]);
    
    const parsedModules = modules.map(m => ({
      ...m,
      settings: m.settings ? JSON.parse(m.settings) : {},
      pages: m.pages ? JSON.parse(m.pages) : []
    }));
    
    res.json({ success: true, data: parsedModules });
  } catch (error) {
    console.error('Get modules by position error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/modules/:id
// @desc    Get single module
router.get('/:id', async (req, res) => {
  try {
    const [modules] = await db.query('SELECT * FROM modules WHERE id = ?', [req.params.id]);
    
    if (modules.length === 0) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }
    
    const module = {
      ...modules[0],
      settings: modules[0].settings ? JSON.parse(modules[0].settings) : {},
      pages: modules[0].pages ? JSON.parse(modules[0].pages) : []
    };
    
    res.json({ success: true, data: module });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/modules
// @desc    Create module
router.post('/', auth, async (req, res) => {
  try {
    const { title, type, position, content, settings, pages, show_title, css_class, sort_order, status } = req.body;

    const [result] = await db.query(`
      INSERT INTO modules (title, type, position, content, settings, pages, show_title, css_class, sort_order, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, type || 'html', position || 'sidebar_right', content,
      JSON.stringify(settings || {}), JSON.stringify(pages || []),
      show_title !== false, css_class, sort_order || 0, status || 'active'
    ]);

    const [newModule] = await db.query('SELECT * FROM modules WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Module created', data: newModule[0] });
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/modules/:id
// @desc    Update module
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, type, position, content, settings, pages, show_title, css_class, sort_order, status } = req.body;

    await db.query(`
      UPDATE modules SET
        title = ?, type = ?, position = ?, content = ?, settings = ?,
        pages = ?, show_title = ?, css_class = ?, sort_order = ?, status = ?
      WHERE id = ?
    `, [
      title, type, position, content,
      JSON.stringify(settings || {}), JSON.stringify(pages || []),
      show_title, css_class, sort_order, status, req.params.id
    ]);

    const [updated] = await db.query('SELECT * FROM modules WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Module updated', data: updated[0] });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/modules/:id
// @desc    Delete module
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM modules WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Module deleted' });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/modules/:id/toggle
// @desc    Toggle module status
router.put('/:id/toggle', auth, async (req, res) => {
  try {
    await db.query(`
      UPDATE modules SET status = IF(status = 'active', 'inactive', 'active')
      WHERE id = ?
    `, [req.params.id]);
    
    const [updated] = await db.query('SELECT * FROM modules WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Module status toggled', data: updated[0] });
  } catch (error) {
    console.error('Toggle module error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/modules/reorder
// @desc    Reorder modules
router.put('/reorder', auth, async (req, res) => {
  try {
    const { modules } = req.body; // Array of { id, sort_order }

    for (const module of modules) {
      await db.query('UPDATE modules SET sort_order = ? WHERE id = ?', [module.sort_order, module.id]);
    }

    res.json({ success: true, message: 'Modules reordered' });
  } catch (error) {
    console.error('Reorder modules error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/modules/:id/duplicate
// @desc    Duplicate module
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const [modules] = await db.query('SELECT * FROM modules WHERE id = ?', [req.params.id]);
    
    if (modules.length === 0) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    const m = modules[0];
    
    const [result] = await db.query(`
      INSERT INTO modules (title, type, position, content, settings, pages, show_title, css_class, sort_order, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'inactive')
    `, [
      `${m.title} (copie)`, m.type, m.position, m.content,
      m.settings, m.pages, m.show_title, m.css_class, m.sort_order + 1
    ]);

    const [newModule] = await db.query('SELECT * FROM modules WHERE id = ?', [result.insertId]);
    res.json({ success: true, message: 'Module duplicated', data: newModule[0] });
  } catch (error) {
    console.error('Duplicate module error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
