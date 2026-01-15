const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, authorize } = require('../middleware/auth');

// GET all groups
router.get('/', auth, async (req, res) => {
  try {
    const [groups] = await db.query(`
      SELECT g.*,
        (SELECT COUNT(*) FROM user_groups ug WHERE ug.group_id = g.id) as user_count,
        (SELECT COUNT(*) FROM group_permissions gp WHERE gp.group_id = g.id) as permission_count
      FROM \`groups\` g
      ORDER BY g.is_system DESC, g.name ASC
    `);
    res.json({ success: true, data: groups });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET single group with permissions
router.get('/:id', auth, async (req, res) => {
  try {
    const [groups] = await db.query('SELECT * FROM `groups` WHERE id = ?', [req.params.id]);
    if (groups.length === 0) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Get permissions for this group
    const [permissions] = await db.query(`
      SELECT p.* FROM permissions p
      INNER JOIN group_permissions gp ON p.id = gp.permission_id
      WHERE gp.group_id = ?
    `, [req.params.id]);

    // Get users in this group
    const [users] = await db.query(`
      SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.avatar
      FROM users u
      INNER JOIN user_groups ug ON u.id = ug.user_id
      WHERE ug.group_id = ?
    `, [req.params.id]);

    res.json({
      success: true,
      data: { ...groups[0], permissions, users }
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST create group
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, description, color, permissions } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const [existing] = await db.query('SELECT id FROM `groups` WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Group already exists' });
    }

    const [result] = await db.query(
      'INSERT INTO `groups` (name, slug, description, color) VALUES (?, ?, ?, ?)',
      [name, slug, description, color || '#6366f1']
    );

    // Add permissions if provided
    if (permissions && permissions.length > 0) {
      const values = permissions.map(permId => [result.insertId, permId]);
      await db.query('INSERT INTO group_permissions (group_id, permission_id) VALUES ?', [values]);
    }

    const [newGroup] = await db.query('SELECT * FROM `groups` WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newGroup[0] });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT update group
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, description, color, permissions } = req.body;
    const { id } = req.params;

    // Check if system group
    const [group] = await db.query('SELECT is_system FROM `groups` WHERE id = ?', [id]);
    if (group.length === 0) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Update group info (can't change name of system groups)
    if (group[0].is_system) {
      await db.query(
        'UPDATE `groups` SET description = ?, color = ? WHERE id = ?',
        [description, color, id]
      );
    } else {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await db.query(
        'UPDATE `groups` SET name = ?, slug = ?, description = ?, color = ? WHERE id = ?',
        [name, slug, description, color, id]
      );
    }

    // Update permissions
    if (permissions !== undefined) {
      await db.query('DELETE FROM group_permissions WHERE group_id = ?', [id]);
      if (permissions.length > 0) {
        const values = permissions.map(permId => [id, permId]);
        await db.query('INSERT INTO group_permissions (group_id, permission_id) VALUES ?', [values]);
      }
    }

    const [updated] = await db.query('SELECT * FROM `groups` WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE group
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const [group] = await db.query('SELECT is_system FROM `groups` WHERE id = ?', [req.params.id]);
    if (group.length === 0) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    if (group[0].is_system) {
      return res.status(400).json({ success: false, message: 'Cannot delete system group' });
    }

    await db.query('DELETE FROM `groups` WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Group deleted' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST add user to group
router.post('/:id/users', auth, authorize('admin'), async (req, res) => {
  try {
    const { user_id } = req.body;
    const { id } = req.params;

    await db.query(
      'INSERT IGNORE INTO user_groups (user_id, group_id) VALUES (?, ?)',
      [user_id, id]
    );

    res.json({ success: true, message: 'User added to group' });
  } catch (error) {
    console.error('Add user to group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE remove user from group
router.delete('/:id/users/:userId', auth, authorize('admin'), async (req, res) => {
  try {
    await db.query(
      'DELETE FROM user_groups WHERE user_id = ? AND group_id = ?',
      [req.params.userId, req.params.id]
    );
    res.json({ success: true, message: 'User removed from group' });
  } catch (error) {
    console.error('Remove user from group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT update user groups (bulk)
router.put('/user/:userId/groups', auth, authorize('admin'), async (req, res) => {
  try {
    const { groups } = req.body;
    const { userId } = req.params;

    // Remove all existing groups
    await db.query('DELETE FROM user_groups WHERE user_id = ?', [userId]);

    // Add new groups
    if (groups && groups.length > 0) {
      const values = groups.map(groupId => [userId, groupId]);
      await db.query('INSERT INTO user_groups (user_id, group_id) VALUES ?', [values]);
    }

    res.json({ success: true, message: 'User groups updated' });
  } catch (error) {
    console.error('Update user groups error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET user groups
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const [groups] = await db.query(`
      SELECT g.* FROM \`groups\` g
      INNER JOIN user_groups ug ON g.id = ug.group_id
      WHERE ug.user_id = ?
    `, [req.params.userId]);

    res.json({ success: true, data: groups });
  } catch (error) {
    console.error('Get user groups error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
