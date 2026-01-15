const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');

// Helper function to build tree structure
const buildTree = (items, parentId = null) => {
  return items
    .filter(item => item.parent_id === parentId)
    .map(item => ({
      ...item,
      children: buildTree(items, item.id)
    }));
};

// Helper to get all descendant IDs
const getDescendantIds = (items, parentId) => {
  const children = items.filter(item => item.parent_id === parentId);
  let ids = children.map(c => c.id);
  children.forEach(child => {
    ids = [...ids, ...getDescendantIds(items, child.id)];
  });
  return ids;
};

// @route   GET /api/categories
// @desc    Get all categories (flat list with post count)
router.get('/', async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM posts WHERE category_id = c.id) as post_count,
        (SELECT name FROM categories WHERE id = c.parent_id) as parent_name
      FROM categories c
      ORDER BY c.sort_order ASC, c.name ASC
    `);
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/categories/tree
// @desc    Get categories as tree structure
router.get('/tree', async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM posts WHERE category_id = c.id) as post_count
      FROM categories c
      WHERE c.status = 'active'
      ORDER BY c.sort_order ASC, c.name ASC
    `);
    
    const tree = buildTree(categories);
    res.json({ success: true, data: tree });
  } catch (error) {
    console.error('Get categories tree error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/categories/:id
// @desc    Get single category with children
router.get('/:id', async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM posts WHERE category_id = c.id) as post_count,
        (SELECT name FROM categories WHERE id = c.parent_id) as parent_name
      FROM categories c
      WHERE c.id = ?
    `, [req.params.id]);
    
    if (categories.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Get children
    const [children] = await db.query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM posts WHERE category_id = c.id) as post_count
      FROM categories c
      WHERE c.parent_id = ?
      ORDER BY c.sort_order ASC
    `, [req.params.id]);

    res.json({ 
      success: true, 
      data: { ...categories[0], children } 
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/categories/slug/:slug
// @desc    Get category by slug (public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM posts WHERE category_id = c.id) as post_count
      FROM categories c
      WHERE c.slug = ? AND c.status = 'active'
    `, [req.params.slug]);
    
    if (categories.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Get children
    const [children] = await db.query(`
      SELECT * FROM categories WHERE parent_id = ? AND status = 'active'
      ORDER BY sort_order ASC
    `, [categories[0].id]);

    // Get posts in this category
    const [posts] = await db.query(`
      SELECT p.*, u.username as author_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.category_id = ? AND p.status = 'published'
      ORDER BY p.publish_at DESC, p.created_at DESC
      LIMIT 20
    `, [categories[0].id]);

    res.json({ 
      success: true, 
      data: { ...categories[0], children, posts } 
    });
  } catch (error) {
    console.error('Get category by slug error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/categories
// @desc    Create category
router.post('/', auth, async (req, res) => {
  try {
    const {
      name, name_fr, name_en, slug, description, description_fr, description_en,
      parent_id, icon, color, image, meta_title, meta_description, sort_order, status
    } = req.body;

    // Use multilingual fields with fallback to legacy fields
    const finalNameFr = name_fr || name || '';
    const finalNameEn = name_en || name || '';
    const finalDescFr = description_fr || description || '';
    const finalDescEn = description_en || description || '';
    const finalName = name || name_fr || ''; // Legacy field for backward compatibility

    // Generate slug if not provided
    const finalSlug = slug || finalNameFr.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check slug uniqueness
    const [existing] = await db.query('SELECT id FROM categories WHERE slug = ?', [finalSlug]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Slug already exists' });
    }

    // Check for circular reference
    if (parent_id) {
      const [allCats] = await db.query('SELECT id, parent_id FROM categories');
      // Don't allow parent to be a descendant
    }

    const [result] = await db.query(`
      INSERT INTO categories (
        name, name_fr, name_en, slug, description, description_fr, description_en,
        parent_id, icon, color, image, meta_title, meta_description, sort_order, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      finalName, finalNameFr, finalNameEn, finalSlug, finalDescFr, finalDescFr, finalDescEn,
      parent_id || null, icon, color || '#007A33', image, meta_title, meta_description,
      sort_order || 0, status || 'active'
    ]);

    const [newCategory] = await db.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Category created', data: newCategory[0] });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      name, name_fr, name_en, slug, description, description_fr, description_en,
      parent_id, icon, color, image, meta_title, meta_description, sort_order, status
    } = req.body;

    // Use multilingual fields with fallback to legacy fields
    const finalNameFr = name_fr || name || '';
    const finalNameEn = name_en || name || '';
    const finalDescFr = description_fr || description || '';
    const finalDescEn = description_en || description || '';
    const finalName = name || name_fr || ''; // Legacy field for backward compatibility

    // Check slug uniqueness (exclude current)
    const [existing] = await db.query(
      'SELECT id FROM categories WHERE slug = ? AND id != ?',
      [slug, req.params.id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Slug already exists' });
    }

    // Prevent circular reference
    if (parent_id) {
      const [allCats] = await db.query('SELECT id, parent_id FROM categories');
      const descendantIds = getDescendantIds(allCats, parseInt(req.params.id));

      if (descendantIds.includes(parseInt(parent_id)) || parseInt(parent_id) === parseInt(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Circular reference detected' });
      }
    }

    await db.query(`
      UPDATE categories SET
        name = ?, name_fr = ?, name_en = ?, slug = ?, description = ?, description_fr = ?, description_en = ?,
        parent_id = ?, icon = ?, color = ?, image = ?, meta_title = ?, meta_description = ?, sort_order = ?, status = ?
      WHERE id = ?
    `, [
      finalName, finalNameFr, finalNameEn, slug, finalDescFr, finalDescFr, finalDescEn,
      parent_id || null, icon, color, image, meta_title, meta_description, sort_order, status, req.params.id
    ]);

    const [updated] = await db.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Category updated', data: updated[0] });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category (and handle children)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { reassign } = req.query; // ?reassign=5 to move children to category 5

    if (reassign) {
      // Move children to new parent
      await db.query('UPDATE categories SET parent_id = ? WHERE parent_id = ?', [reassign, req.params.id]);
      // Move posts to new category
      await db.query('UPDATE posts SET category_id = ? WHERE category_id = ?', [reassign, req.params.id]);
    } else {
      // Set children as root categories
      await db.query('UPDATE categories SET parent_id = NULL WHERE parent_id = ?', [req.params.id]);
      // Set posts as uncategorized
      await db.query('UPDATE posts SET category_id = NULL WHERE category_id = ?', [req.params.id]);
    }

    await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/categories/reorder
// @desc    Reorder categories
router.put('/reorder', auth, async (req, res) => {
  try {
    const { categories } = req.body; // Array of { id, sort_order, parent_id }

    for (const cat of categories) {
      await db.query(
        'UPDATE categories SET sort_order = ?, parent_id = ? WHERE id = ?',
        [cat.sort_order, cat.parent_id || null, cat.id]
      );
    }

    res.json({ success: true, message: 'Categories reordered' });
  } catch (error) {
    console.error('Reorder categories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/categories/:id/breadcrumb
// @desc    Get breadcrumb path for category
router.get('/:id/breadcrumb', async (req, res) => {
  try {
    const breadcrumb = [];
    let currentId = parseInt(req.params.id);

    while (currentId) {
      const [cat] = await db.query(
        'SELECT id, name, slug, parent_id FROM categories WHERE id = ?',
        [currentId]
      );
      
      if (cat.length === 0) break;
      
      breadcrumb.unshift(cat[0]);
      currentId = cat[0].parent_id;
    }

    res.json({ success: true, data: breadcrumb });
  } catch (error) {
    console.error('Get breadcrumb error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/categories/:id/posts
// @desc    Get posts in category (including subcategories)
router.get('/:id/posts', async (req, res) => {
  try {
    const { include_children } = req.query;
    let categoryIds = [parseInt(req.params.id)];

    if (include_children === 'true') {
      const [allCats] = await db.query('SELECT id, parent_id FROM categories');
      const descendantIds = getDescendantIds(allCats, parseInt(req.params.id));
      categoryIds = [...categoryIds, ...descendantIds];
    }

    const [posts] = await db.query(`
      SELECT p.*, c.name as category_name, u.username as author_name
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.category_id IN (?) AND p.status = 'published'
      ORDER BY p.publish_at DESC, p.created_at DESC
    `, [categoryIds]);

    res.json({ success: true, data: posts });
  } catch (error) {
    console.error('Get category posts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
