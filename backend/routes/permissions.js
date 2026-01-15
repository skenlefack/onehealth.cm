const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, authorize } = require('../middleware/auth');

// GET all permissions (grouped by module)
router.get('/', auth, async (req, res) => {
  try {
    const [permissions] = await db.query('SELECT * FROM permissions ORDER BY module, name');

    // Group by module
    const grouped = permissions.reduce((acc, perm) => {
      if (!acc[perm.module]) {
        acc[perm.module] = [];
      }
      acc[perm.module].push(perm);
      return acc;
    }, {});

    res.json({ success: true, data: permissions, grouped });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET user permissions (all permissions from all user's groups)
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const [permissions] = await db.query(`
      SELECT DISTINCT p.* FROM permissions p
      INNER JOIN group_permissions gp ON p.id = gp.permission_id
      INNER JOIN user_groups ug ON gp.group_id = ug.group_id
      WHERE ug.user_id = ?
    `, [req.params.userId]);

    res.json({ success: true, data: permissions });
  } catch (error) {
    console.error('Get user permissions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET current user permissions
router.get('/me', auth, async (req, res) => {
  try {
    const [permissions] = await db.query(`
      SELECT DISTINCT p.slug FROM permissions p
      INNER JOIN group_permissions gp ON p.id = gp.permission_id
      INNER JOIN user_groups ug ON gp.group_id = ug.group_id
      WHERE ug.user_id = ?
    `, [req.user.id]);

    const permissionSlugs = permissions.map(p => p.slug);
    res.json({ success: true, data: permissionSlugs });
  } catch (error) {
    console.error('Get my permissions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST create permission (admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, slug, description, module } = req.body;

    const [existing] = await db.query('SELECT id FROM permissions WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Permission already exists' });
    }

    const [result] = await db.query(
      'INSERT INTO permissions (name, slug, description, module) VALUES (?, ?, ?, ?)',
      [name, slug, description, module || 'general']
    );

    const [newPerm] = await db.query('SELECT * FROM permissions WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newPerm[0] });
  } catch (error) {
    console.error('Create permission error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE permission (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM permissions WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Permission deleted' });
  } catch (error) {
    console.error('Delete permission error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Check if user has specific permission
router.get('/check/:slug', auth, async (req, res) => {
  try {
    const [result] = await db.query(`
      SELECT COUNT(*) as has_permission FROM permissions p
      INNER JOIN group_permissions gp ON p.id = gp.permission_id
      INNER JOIN user_groups ug ON gp.group_id = ug.group_id
      WHERE ug.user_id = ? AND p.slug = ?
    `, [req.user.id, req.params.slug]);

    res.json({ success: true, hasPermission: result[0].has_permission > 0 });
  } catch (error) {
    console.error('Check permission error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
