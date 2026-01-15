const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, authorize } = require('../middleware/auth');

// GET dashboard stats
router.get('/stats', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    // Posts stats
    const [postsStats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts,
        SUM(view_count) as total_views
      FROM posts
    `);

    // Users stats
    const [usersStats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role = 'editor' THEN 1 ELSE 0 END) as editors,
        SUM(CASE WHEN role = 'author' THEN 1 ELSE 0 END) as authors,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
      FROM users
    `);

    // Comments stats
    const [commentsStats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved
      FROM comments
    `);

    // Media stats
    const [mediaStats] = await db.query('SELECT COUNT(*) as total, SUM(size) as total_size FROM media');

    // Categories count
    const [categoriesCount] = await db.query('SELECT COUNT(*) as total FROM categories');

    res.json({
      success: true,
      data: {
        posts: postsStats[0],
        users: usersStats[0],
        comments: commentsStats[0],
        media: { ...mediaStats[0], total_size_mb: Math.round((mediaStats[0].total_size || 0) / 1024 / 1024 * 100) / 100 },
        categories: categoriesCount[0].total
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET recent posts
router.get('/recent-posts', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const [posts] = await db.query(`
      SELECT p.id, p.title, p.slug, p.status, p.view_count, p.created_at,
             u.username as author
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 10
    `);
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET recent activity
router.get('/activity', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const [activity] = await db.query(`
      SELECT a.*, u.username, u.avatar
      FROM activity_log a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 20
    `);
    res.json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET popular posts
router.get('/popular-posts', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const [posts] = await db.query(`
      SELECT id, title, slug, view_count, created_at
      FROM posts
      WHERE status = 'published'
      ORDER BY view_count DESC
      LIMIT 10
    `);
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET posts by date (chart data)
router.get('/posts-chart', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const [data] = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM posts
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [parseInt(days)]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
