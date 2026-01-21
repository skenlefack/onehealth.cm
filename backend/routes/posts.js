const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const slugify = require('slugify');
const db = require('../config/db');
const { auth, authorize, optionalAuth } = require('../middleware/auth');

// Helper function to convert ISO 8601 date to MySQL datetime format
const toMySQLDateTime = (isoDate) => {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

// @route   GET /api/posts
// @desc    Get all posts with filters
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type = 'post',
      category,
      tag,
      author,
      search,
      featured,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['p.type = ?'];
    let params = [type];

    // Only show published posts to non-authenticated users
    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      whereConditions.push("p.status = 'published'");
      whereConditions.push('(p.published_at IS NULL OR p.published_at <= NOW())');
    } else if (status) {
      // Admin/editor can filter by any status including trash
      whereConditions.push('p.status = ?');
      params.push(status);
    } else {
      // By default, exclude trashed posts for admin/editor
      whereConditions.push("p.status != 'trash'");
    }

    if (category) {
      whereConditions.push('(c.slug = ? OR c.id = ?)');
      params.push(category, category);
    }

    if (author) {
      whereConditions.push('(u.username = ? OR u.id = ?)');
      params.push(author, author);
    }

    if (featured === 'true') {
      whereConditions.push('p.featured = 1');
    }

    if (search) {
      whereConditions.push('(p.title LIKE ? OR p.content LIKE ? OR p.excerpt LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(DISTINCT p.id) as total FROM posts p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.author_id = u.id
       ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    // Get posts
    const allowedSorts = ['created_at', 'published_at', 'title', 'view_count'];
    const sortField = allowedSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [posts] = await db.query(
      `SELECT p.*, 
              c.name as category_name, c.slug as category_slug,
              u.username as author_username, u.first_name as author_first_name, 
              u.last_name as author_last_name, u.avatar as author_avatar
       FROM posts p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.author_id = u.id
       ${whereClause}
       ORDER BY p.${sortField} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    // Get tags for each post
    for (let post of posts) {
      const [tags] = await db.query(
        `SELECT t.* FROM tags t
         JOIN post_tags pt ON t.id = pt.tag_id
         WHERE pt.post_id = ?`,
        [post.id]
      );
      post.tags = tags;
    }

    res.json({
      success: true,
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/posts/:slug
// @desc    Get single post by slug
// @access  Public
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    let query = `
      SELECT p.*, 
             c.name as category_name, c.slug as category_slug,
             u.username as author_username, u.first_name as author_first_name, 
             u.last_name as author_last_name, u.avatar as author_avatar, u.bio as author_bio
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.slug = ?
    `;

    // Only show published posts to non-authenticated users
    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      query += " AND p.status = 'published'";
    }

    const [posts] = await db.query(query, [slug]);

    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const post = posts[0];

    // Get tags
    const [tags] = await db.query(
      `SELECT t.* FROM tags t
       JOIN post_tags pt ON t.id = pt.tag_id
       WHERE pt.post_id = ?`,
      [post.id]
    );
    post.tags = tags;

    // Increment view count
    await db.query('UPDATE posts SET view_count = view_count + 1 WHERE id = ?', [post.id]);

    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/posts
// @desc    Create new post
// @access  Private (admin, editor, author)
router.post('/', auth, authorize('admin', 'editor', 'author'), async (req, res) => {
  try {
    const {
      title, title_fr, title_en, content, content_fr, content_en,
      excerpt, excerpt_fr, excerpt_en, featured_image, category_id, type = 'post',
      status = 'draft', visibility = 'public', password, featured = false,
      allow_comments = true, meta_title, meta_title_fr, meta_title_en,
      meta_description, meta_description_fr, meta_description_en, meta_keywords,
      published_at, scheduled_at, tags = []
    } = req.body;

    // Validation: au moins un titre requis (FR ou EN ou legacy)
    if (!title && !title_fr && !title_en) {
      return res.status(400).json({
        success: false,
        message: 'Le titre est requis (français ou anglais)',
        errors: [{ field: 'title_fr', message: 'Veuillez saisir un titre en français ou en anglais' }]
      });
    }

    // Use multilingual fields with fallback to legacy fields
    const finalTitleFr = title_fr || title || '';
    const finalTitleEn = title_en || title || '';
    const finalContentFr = content_fr || content || '';
    const finalContentEn = content_en || content || '';
    const finalExcerptFr = excerpt_fr || excerpt || '';
    const finalExcerptEn = excerpt_en || excerpt || '';
    const finalMetaTitleFr = meta_title_fr || meta_title || '';
    const finalMetaTitleEn = meta_title_en || meta_title || '';
    const finalMetaDescFr = meta_description_fr || meta_description || '';
    const finalMetaDescEn = meta_description_en || meta_description || '';
    const finalTitle = title || title_fr || ''; // Legacy field for backward compatibility

    // Generate unique slug from French title
    let slug = slugify(finalTitleFr || finalTitle, { lower: true, strict: true });
    const [existing] = await db.query('SELECT id FROM posts WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    // Convert empty category_id to null for foreign key
    const finalCategoryId = category_id && category_id !== '' ? category_id : null;

    const [result] = await db.query(
      `INSERT INTO posts (title, title_fr, title_en, slug, content, content_fr, content_en,
       excerpt, excerpt_fr, excerpt_en, featured_image, author_id, category_id,
       type, status, visibility, password, featured, allow_comments,
       meta_title, meta_title_fr, meta_title_en, meta_description, meta_description_fr, meta_description_en,
       meta_keywords, published_at, scheduled_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [finalTitle, finalTitleFr, finalTitleEn, slug, finalContentFr, finalContentFr, finalContentEn,
       finalExcerptFr, finalExcerptFr, finalExcerptEn, featured_image, req.user.id, finalCategoryId,
       type, status, visibility, password, featured, allow_comments,
       finalMetaTitleFr, finalMetaTitleFr, finalMetaTitleEn, finalMetaDescFr, finalMetaDescFr, finalMetaDescEn,
       meta_keywords,
       status === 'published' ? toMySQLDateTime(published_at || new Date()) : null,
       status === 'scheduled' ? toMySQLDateTime(scheduled_at) : null]
    );

    // Add tags
    if (tags.length > 0) {
      for (const tagId of tags) {
        await db.query('INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)', [result.insertId, tagId]);
      }
    }

    const [newPost] = await db.query('SELECT * FROM posts WHERE id = ?', [result.insertId]);

    // Log activity
    await db.query(
      'INSERT INTO activity_log (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'create', 'post', result.insertId, JSON.stringify({ title })]
    );

    res.status(201).json({ success: true, message: 'Post created', data: newPost[0] });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private (admin, editor, author-own)
router.put('/:id', auth, authorize('admin', 'editor', 'author'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if post exists and user has permission
    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const post = posts[0];
    if (req.user.role === 'author' && post.author_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const {
      title, title_fr, title_en, content, content_fr, content_en,
      excerpt, excerpt_fr, excerpt_en, featured_image, category_id, type,
      status, visibility, password, featured, allow_comments,
      meta_title, meta_title_fr, meta_title_en,
      meta_description, meta_description_fr, meta_description_en,
      meta_keywords, published_at, scheduled_at, tags, author_id
    } = req.body;

    // Use multilingual fields with fallback
    const finalTitleFr = title_fr || title;
    const finalTitleEn = title_en || title;
    const finalContentFr = content_fr || content;
    const finalContentEn = content_en || content;
    const finalExcerptFr = excerpt_fr || excerpt;
    const finalExcerptEn = excerpt_en || excerpt;
    const finalMetaTitleFr = meta_title_fr || meta_title;
    const finalMetaTitleEn = meta_title_en || meta_title;
    const finalMetaDescFr = meta_description_fr || meta_description;
    const finalMetaDescEn = meta_description_en || meta_description;
    const finalTitle = title || title_fr;

    // Generate new slug if French title changed
    let slug = post.slug;
    const newTitle = finalTitleFr || finalTitle;
    if (newTitle && newTitle !== post.title_fr && newTitle !== post.title) {
      slug = slugify(newTitle, { lower: true, strict: true });
      const [existing] = await db.query('SELECT id FROM posts WHERE slug = ? AND id != ?', [slug, id]);
      if (existing.length > 0) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Convert empty category_id and author_id to null for foreign key
    const finalCategoryId = category_id === '' ? null : category_id;
    const finalAuthorId = author_id === '' ? null : author_id;

    await db.query(
      `UPDATE posts SET
       title = COALESCE(?, title),
       title_fr = COALESCE(?, title_fr),
       title_en = COALESCE(?, title_en),
       slug = ?,
       content = COALESCE(?, content),
       content_fr = COALESCE(?, content_fr),
       content_en = COALESCE(?, content_en),
       excerpt = COALESCE(?, excerpt),
       excerpt_fr = COALESCE(?, excerpt_fr),
       excerpt_en = COALESCE(?, excerpt_en),
       featured_image = COALESCE(?, featured_image),
       category_id = COALESCE(?, category_id),
       author_id = COALESCE(?, author_id),
       type = COALESCE(?, type),
       status = COALESCE(?, status),
       visibility = COALESCE(?, visibility),
       password = COALESCE(?, password),
       featured = COALESCE(?, featured),
       allow_comments = COALESCE(?, allow_comments),
       meta_title = COALESCE(?, meta_title),
       meta_title_fr = COALESCE(?, meta_title_fr),
       meta_title_en = COALESCE(?, meta_title_en),
       meta_description = COALESCE(?, meta_description),
       meta_description_fr = COALESCE(?, meta_description_fr),
       meta_description_en = COALESCE(?, meta_description_en),
       meta_keywords = COALESCE(?, meta_keywords),
       published_at = CASE WHEN ? = 'published' AND published_at IS NULL THEN NOW() ELSE COALESCE(?, published_at) END,
       scheduled_at = COALESCE(?, scheduled_at)
       WHERE id = ?`,
      [finalTitle, finalTitleFr, finalTitleEn, slug,
       finalContentFr, finalContentFr, finalContentEn,
       finalExcerptFr, finalExcerptFr, finalExcerptEn,
       featured_image, finalCategoryId, finalAuthorId, type, status, visibility, password, featured, allow_comments,
       finalMetaTitleFr, finalMetaTitleFr, finalMetaTitleEn,
       finalMetaDescFr, finalMetaDescFr, finalMetaDescEn,
       meta_keywords, status, toMySQLDateTime(published_at), toMySQLDateTime(scheduled_at), id]
    );

    // Update tags
    if (tags !== undefined) {
      await db.query('DELETE FROM post_tags WHERE post_id = ?', [id]);
      for (const tagId of tags) {
        await db.query('INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)', [id, tagId]);
      }
    }

    const [updated] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);

    // Log activity
    await db.query(
      'INSERT INTO activity_log (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'update', 'post', id, JSON.stringify({ title: updated[0].title })]
    );

    res.json({ success: true, message: 'Post updated', data: updated[0] });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Move post to trash (soft delete)
// @access  Private (admin, editor)
router.delete('/:id', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { id } = req.params;

    const [posts] = await db.query('SELECT title, status FROM posts WHERE id = ?', [id]);
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Move to trash (soft delete)
    await db.query('UPDATE posts SET status = ?, deleted_at = NOW() WHERE id = ?', ['trash', id]);

    // Log activity
    await db.query(
      'INSERT INTO activity_log (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'trash', 'post', id, JSON.stringify({ title: posts[0].title })]
    );

    res.json({ success: true, message: 'Article déplacé dans la corbeille' });
  } catch (error) {
    console.error('Trash post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/posts/:id/restore
// @desc    Restore post from trash
// @access  Private (admin, editor)
router.post('/:id/restore', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { id } = req.params;

    const [posts] = await db.query('SELECT title, status FROM posts WHERE id = ?', [id]);
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (posts[0].status !== 'trash') {
      return res.status(400).json({ success: false, message: 'Cet article n\'est pas dans la corbeille' });
    }

    // Restore to draft
    await db.query('UPDATE posts SET status = ?, deleted_at = NULL WHERE id = ?', ['draft', id]);

    // Log activity
    await db.query(
      'INSERT INTO activity_log (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'restore', 'post', id, JSON.stringify({ title: posts[0].title })]
    );

    res.json({ success: true, message: 'Article restauré' });
  } catch (error) {
    console.error('Restore post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/posts/:id/permanent
// @desc    Permanently delete post
// @access  Private (admin)
router.delete('/:id/permanent', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const [posts] = await db.query('SELECT title, status FROM posts WHERE id = ?', [id]);
    if (posts.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Delete post tags first
    await db.query('DELETE FROM post_tags WHERE post_id = ?', [id]);

    // Permanently delete post
    await db.query('DELETE FROM posts WHERE id = ?', [id]);

    // Log activity
    await db.query(
      'INSERT INTO activity_log (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'permanent_delete', 'post', id, JSON.stringify({ title: posts[0].title })]
    );

    res.json({ success: true, message: 'Article supprimé définitivement' });
  } catch (error) {
    console.error('Permanent delete post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/posts/trash/empty
// @desc    Empty trash (permanently delete all trashed posts)
// @access  Private (admin)
router.delete('/trash/empty', auth, authorize('admin'), async (req, res) => {
  try {
    // Get all trashed posts for logging
    const [trashedPosts] = await db.query('SELECT id, title FROM posts WHERE status = ?', ['trash']);

    if (trashedPosts.length === 0) {
      return res.json({ success: true, message: 'La corbeille est déjà vide' });
    }

    // Delete post tags for trashed posts
    const trashedIds = trashedPosts.map(p => p.id);
    await db.query('DELETE FROM post_tags WHERE post_id IN (?)', [trashedIds]);

    // Permanently delete all trashed posts
    await db.query('DELETE FROM posts WHERE status = ?', ['trash']);

    // Log activity
    await db.query(
      'INSERT INTO activity_log (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'empty_trash', 'post', null, JSON.stringify({ count: trashedPosts.length })]
    );

    res.json({ success: true, message: `${trashedPosts.length} article(s) supprimé(s) définitivement` });
  } catch (error) {
    console.error('Empty trash error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
