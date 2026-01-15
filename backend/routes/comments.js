const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, authorize, optionalAuth } = require('../middleware/auth');

// GET comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const [comments] = await db.query(`
      SELECT c.*, u.username, u.avatar
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ? AND c.status = 'approved' AND c.parent_id IS NULL
      ORDER BY c.created_at DESC
    `, [req.params.postId]);

    // Get replies for each comment
    for (let comment of comments) {
      const [replies] = await db.query(`
        SELECT c.*, u.username, u.avatar
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.parent_id = ? AND c.status = 'approved'
        ORDER BY c.created_at ASC
      `, [comment.id]);
      comment.replies = replies;
    }

    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET all comments (admin)
router.get('/', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = status ? 'WHERE c.status = ?' : '';
    let params = status ? [status] : [];

    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM comments c ${whereClause}`, params);
    const [comments] = await db.query(`
      SELECT c.*, p.title as post_title, u.username
      FROM comments c
      LEFT JOIN posts p ON c.post_id = p.id
      LEFT JOIN users u ON c.user_id = u.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      data: comments,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST create comment
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { post_id, content, author_name, author_email, parent_id } = req.body;

    const [result] = await db.query(
      `INSERT INTO comments (post_id, user_id, content, author_name, author_email, parent_id, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [post_id, req.user?.id || null, content, req.user ? null : author_name, req.user ? null : author_email, parent_id || null, req.ip]
    );

    const [newComment] = await db.query('SELECT * FROM comments WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newComment[0], message: 'Comment submitted for moderation' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT update comment status
router.put('/:id/status', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE comments SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: 'Comment status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE comment
router.delete('/:id', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    await db.query('DELETE FROM comments WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
