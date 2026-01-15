const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { auth, authorize } = require('../middleware/auth');

// GET all users
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];

    if (role) {
      whereConditions.push('role = ?');
      params.push(role);
    }
    if (status) {
      whereConditions.push('status = ?');
      params.push(status);
    }
    if (search) {
      whereConditions.push('(username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM users ${whereClause}`, params);
    const [users] = await db.query(
      `SELECT id, username, email, first_name, last_name, avatar, role, status, last_login, created_at 
       FROM users ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total, pages: Math.ceil(countResult[0].total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET single user
router.get('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, email, first_name, last_name, avatar, role, status, bio, last_login, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST create user
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, role, status } = req.body;

    const [existing] = await db.query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      'INSERT INTO users (username, email, password, first_name, last_name, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, first_name, last_name, role || 'subscriber', status || 'active']
    );

    const [newUser] = await db.query(
      'SELECT id, username, email, first_name, last_name, role, status FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ success: true, data: newUser[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT update user
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, role, status, bio, avatar } = req.body;
    const { id } = req.params;

    let updateFields = [];
    let params = [];

    if (username) { updateFields.push('username = ?'); params.push(username); }
    if (email) { updateFields.push('email = ?'); params.push(email); }
    if (first_name !== undefined) { updateFields.push('first_name = ?'); params.push(first_name); }
    if (last_name !== undefined) { updateFields.push('last_name = ?'); params.push(last_name); }
    if (role) { updateFields.push('role = ?'); params.push(role); }
    if (status) { updateFields.push('status = ?'); params.push(status); }
    if (bio !== undefined) { updateFields.push('bio = ?'); params.push(bio); }
    if (avatar !== undefined) { updateFields.push('avatar = ?'); params.push(avatar); }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.push('password = ?');
      params.push(hashedPassword);
    }

    params.push(id);
    await db.query(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, params);

    const [updated] = await db.query(
      'SELECT id, username, email, first_name, last_name, role, status, avatar, bio FROM users WHERE id = ?',
      [id]
    );

    res.json({ success: true, data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE user
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    }
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
