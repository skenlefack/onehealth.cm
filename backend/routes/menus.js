const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');

// @route   GET /api/menus
// @desc    Get all menus
router.get('/', async (req, res) => {
  try {
    const [menus] = await db.query(`
      SELECT m.*, 
        (SELECT COUNT(*) FROM menu_items WHERE menu_id = m.id) as items_count
      FROM menus m
      ORDER BY m.name ASC
    `);
    res.json({ success: true, data: menus });
  } catch (error) {
    console.error('Get menus error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/menus/:id
// @desc    Get single menu with items
router.get('/:id', async (req, res) => {
  try {
    const [menus] = await db.query('SELECT * FROM menus WHERE id = ?', [req.params.id]);
    if (menus.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }

    const [items] = await db.query(`
      SELECT * FROM menu_items 
      WHERE menu_id = ? 
      ORDER BY sort_order ASC
    `, [req.params.id]);

    res.json({ success: true, data: { ...menus[0], items } });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/menus/location/:location
// @desc    Get menu by location (public)
router.get('/location/:location', async (req, res) => {
  try {
    const [menus] = await db.query(`
      SELECT * FROM menus WHERE location = ? AND status = 'active' LIMIT 1
    `, [req.params.location]);
    
    if (menus.length === 0) {
      return res.json({ success: true, data: null });
    }

    const [items] = await db.query(`
      SELECT * FROM menu_items
      WHERE menu_id = ? AND (status = 'active' OR status IS NULL)
      ORDER BY COALESCE(sort_order, 999) ASC, id ASC
    `, [menus[0].id]);

    // Build tree structure
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parent_id === parentId)
        .map(item => ({
          ...item,
          children: buildTree(items, item.id)
        }));
    };

    res.json({ 
      success: true, 
      data: { ...menus[0], items: buildTree(items) } 
    });
  } catch (error) {
    console.error('Get menu by location error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/menus
// @desc    Create menu
router.post('/', auth, async (req, res) => {
  try {
    const { name, location, description, status } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const [result] = await db.query(`
      INSERT INTO menus (name, slug, location, description, status)
      VALUES (?, ?, ?, ?, ?)
    `, [name, slug, location || 'header', description, status || 'active']);

    const [newMenu] = await db.query('SELECT * FROM menus WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Menu created', data: newMenu[0] });
  } catch (error) {
    console.error('Create menu error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/menus/:id
// @desc    Update menu
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, location, description, status } = req.body;

    await db.query(`
      UPDATE menus SET name = ?, location = ?, description = ?, status = ?
      WHERE id = ?
    `, [name, location, description, status, req.params.id]);

    const [updated] = await db.query('SELECT * FROM menus WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Menu updated', data: updated[0] });
  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/menus/:id
// @desc    Delete menu
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM menus WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Menu deleted' });
  } catch (error) {
    console.error('Delete menu error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================================================
// MENU ITEMS
// =====================================================

// @route   GET /api/menus/:menuId/items
// @desc    Get menu items
router.get('/:menuId/items', async (req, res) => {
  try {
    const [items] = await db.query(`
      SELECT * FROM menu_items
      WHERE menu_id = ?
      ORDER BY COALESCE(parent_id, 0) ASC, COALESCE(sort_order, 999) ASC, id ASC
    `, [req.params.menuId]);

    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/menus/:menuId/items
// @desc    Create menu item
router.post('/:menuId/items', auth, async (req, res) => {
  try {
    const { parent_id, type, label, label_fr, label_en, url, page_id, post_id, category_id, target, icon, css_class, sort_order, status } = req.body;

    // Use label_fr if provided, fallback to label for backwards compatibility
    const finalLabelFr = label_fr || label;
    const finalLabelEn = label_en || finalLabelFr;
    const finalLabel = finalLabelFr; // Keep label in sync with label_fr

    const [result] = await db.query(`
      INSERT INTO menu_items (menu_id, parent_id, type, label, label_fr, label_en, url, page_id, post_id, category_id, target, icon, css_class, sort_order, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.params.menuId, parent_id || null, type || 'custom', finalLabel, finalLabelFr, finalLabelEn, url,
      page_id || null, post_id || null, category_id || null,
      target || '_self', icon, css_class, sort_order || 0, status || 'active'
    ]);

    const [newItem] = await db.query('SELECT * FROM menu_items WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Menu item created', data: newItem[0] });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/menus/items/:id
// @desc    Update menu item
router.put('/items/:id', auth, async (req, res) => {
  try {
    const { parent_id, type, label, label_fr, label_en, url, page_id, post_id, category_id, target, icon, css_class, sort_order, status } = req.body;

    // Use label_fr if provided, fallback to label for backwards compatibility
    const finalLabelFr = label_fr || label;
    const finalLabelEn = label_en || finalLabelFr;
    const finalLabel = finalLabelFr; // Keep label in sync with label_fr

    // Only update sort_order if explicitly provided (not undefined)
    if (sort_order !== undefined) {
      await db.query(`
        UPDATE menu_items SET
          parent_id = ?, type = ?, label = ?, label_fr = ?, label_en = ?, url = ?,
          page_id = ?, post_id = ?, category_id = ?, target = ?,
          icon = ?, css_class = ?, sort_order = ?, status = ?
        WHERE id = ?
      `, [parent_id || null, type, finalLabel, finalLabelFr, finalLabelEn, url,
          page_id || null, post_id || null, category_id || null, target,
          icon, css_class, sort_order, status, req.params.id]);
    } else {
      // Preserve existing sort_order
      await db.query(`
        UPDATE menu_items SET
          parent_id = ?, type = ?, label = ?, label_fr = ?, label_en = ?, url = ?,
          page_id = ?, post_id = ?, category_id = ?, target = ?,
          icon = ?, css_class = ?, status = ?
        WHERE id = ?
      `, [parent_id || null, type, finalLabel, finalLabelFr, finalLabelEn, url,
          page_id || null, post_id || null, category_id || null, target,
          icon, css_class, status, req.params.id]);
    }

    const [updated] = await db.query('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Menu item updated', data: updated[0] });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/menus/items/:id
// @desc    Delete menu item
router.delete('/items/:id', auth, async (req, res) => {
  try {
    // Update children to have no parent
    await db.query('UPDATE menu_items SET parent_id = NULL WHERE parent_id = ?', [req.params.id]);
    await db.query('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/menus/:menuId/reorder
// @desc    Reorder menu items
router.put('/:menuId/reorder', auth, async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, sort_order, parent_id }

    for (const item of items) {
      await db.query(`
        UPDATE menu_items SET sort_order = ?, parent_id = ?
        WHERE id = ? AND menu_id = ?
      `, [item.sort_order, item.parent_id || null, item.id, req.params.menuId]);
    }

    res.json({ success: true, message: 'Menu items reordered' });
  } catch (error) {
    console.error('Reorder menu items error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
