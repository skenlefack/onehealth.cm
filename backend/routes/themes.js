const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');

// @route   GET /api/themes
// @desc    Get all themes
router.get('/', async (req, res) => {
  try {
    const [themes] = await db.query('SELECT * FROM themes ORDER BY is_active DESC, name ASC');
    
    const parsedThemes = themes.map(t => ({
      ...t,
      settings: t.settings ? JSON.parse(t.settings) : {},
      colors: t.colors ? JSON.parse(t.colors) : {},
      fonts: t.fonts ? JSON.parse(t.fonts) : {}
    }));
    
    res.json({ success: true, data: parsedThemes });
  } catch (error) {
    console.error('Get themes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/themes/active
// @desc    Get active theme (public)
router.get('/active', async (req, res) => {
  try {
    const [themes] = await db.query('SELECT * FROM themes WHERE is_active = TRUE LIMIT 1');
    
    if (themes.length === 0) {
      // Return default theme if none active
      const [defaultTheme] = await db.query('SELECT * FROM themes WHERE is_default = TRUE LIMIT 1');
      if (defaultTheme.length > 0) {
        const theme = {
          ...defaultTheme[0],
          settings: defaultTheme[0].settings ? JSON.parse(defaultTheme[0].settings) : {},
          colors: defaultTheme[0].colors ? JSON.parse(defaultTheme[0].colors) : {},
          fonts: defaultTheme[0].fonts ? JSON.parse(defaultTheme[0].fonts) : {}
        };
        return res.json({ success: true, data: theme });
      }
      return res.json({ success: true, data: null });
    }

    // Get customizations
    const [customizations] = await db.query(
      'SELECT * FROM theme_customizations WHERE theme_id = ?',
      [themes[0].id]
    );

    const theme = {
      ...themes[0],
      settings: themes[0].settings ? JSON.parse(themes[0].settings) : {},
      colors: themes[0].colors ? JSON.parse(themes[0].colors) : {},
      fonts: themes[0].fonts ? JSON.parse(themes[0].fonts) : {},
      customizations: customizations.reduce((acc, c) => {
        if (!acc[c.section]) acc[c.section] = {};
        acc[c.section][c.setting_key] = c.setting_value;
        return acc;
      }, {})
    };

    res.json({ success: true, data: theme });
  } catch (error) {
    console.error('Get active theme error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/themes/:id
// @desc    Get single theme
router.get('/:id', async (req, res) => {
  try {
    const [themes] = await db.query('SELECT * FROM themes WHERE id = ?', [req.params.id]);
    
    if (themes.length === 0) {
      return res.status(404).json({ success: false, message: 'Theme not found' });
    }

    const [customizations] = await db.query(
      'SELECT * FROM theme_customizations WHERE theme_id = ?',
      [req.params.id]
    );

    const theme = {
      ...themes[0],
      settings: themes[0].settings ? JSON.parse(themes[0].settings) : {},
      colors: themes[0].colors ? JSON.parse(themes[0].colors) : {},
      fonts: themes[0].fonts ? JSON.parse(themes[0].fonts) : {},
      customizations: customizations.reduce((acc, c) => {
        if (!acc[c.section]) acc[c.section] = {};
        acc[c.section][c.setting_key] = c.setting_value;
        return acc;
      }, {})
    };

    res.json({ success: true, data: theme });
  } catch (error) {
    console.error('Get theme error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/themes
// @desc    Create theme
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, preview_image, version, author, settings, colors, fonts } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const [result] = await db.query(`
      INSERT INTO themes (name, slug, description, preview_image, version, author, settings, colors, fonts)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, slug, description, preview_image, version || '1.0.0', author,
      JSON.stringify(settings || {}), JSON.stringify(colors || {}), JSON.stringify(fonts || {})
    ]);

    const [newTheme] = await db.query('SELECT * FROM themes WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Theme created', data: newTheme[0] });
  } catch (error) {
    console.error('Create theme error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/themes/:id
// @desc    Update theme
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, preview_image, version, author, settings, colors, fonts } = req.body;

    await db.query(`
      UPDATE themes SET
        name = ?, description = ?, preview_image = ?, version = ?,
        author = ?, settings = ?, colors = ?, fonts = ?
      WHERE id = ?
    `, [
      name, description, preview_image, version, author,
      JSON.stringify(settings), JSON.stringify(colors), JSON.stringify(fonts),
      req.params.id
    ]);

    const [updated] = await db.query('SELECT * FROM themes WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Theme updated', data: updated[0] });
  } catch (error) {
    console.error('Update theme error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/themes/:id/activate
// @desc    Activate theme
router.put('/:id/activate', auth, async (req, res) => {
  try {
    // Deactivate all themes
    await db.query('UPDATE themes SET is_active = FALSE');
    
    // Activate selected theme
    await db.query('UPDATE themes SET is_active = TRUE WHERE id = ?', [req.params.id]);

    // Update settings
    await db.query(`
      INSERT INTO settings (setting_key, setting_value) 
      VALUES ('active_theme', ?)
      ON DUPLICATE KEY UPDATE setting_value = ?
    `, [req.params.id, req.params.id]);

    const [updated] = await db.query('SELECT * FROM themes WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Theme activated', data: updated[0] });
  } catch (error) {
    console.error('Activate theme error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/themes/:id
// @desc    Delete theme
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if theme is default
    const [themes] = await db.query('SELECT is_default, is_active FROM themes WHERE id = ?', [req.params.id]);
    
    if (themes.length > 0 && themes[0].is_default) {
      return res.status(400).json({ success: false, message: 'Cannot delete default theme' });
    }

    if (themes.length > 0 && themes[0].is_active) {
      return res.status(400).json({ success: false, message: 'Cannot delete active theme' });
    }

    await db.query('DELETE FROM themes WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Theme deleted' });
  } catch (error) {
    console.error('Delete theme error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================================================
// THEME CUSTOMIZATIONS
// =====================================================

// @route   GET /api/themes/:id/customizations
// @desc    Get theme customizations
router.get('/:id/customizations', async (req, res) => {
  try {
    const [customizations] = await db.query(
      'SELECT * FROM theme_customizations WHERE theme_id = ?',
      [req.params.id]
    );

    const grouped = customizations.reduce((acc, c) => {
      if (!acc[c.section]) acc[c.section] = {};
      acc[c.section][c.setting_key] = c.setting_value;
      return acc;
    }, {});

    res.json({ success: true, data: grouped });
  } catch (error) {
    console.error('Get customizations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/themes/:id/customizations
// @desc    Update theme customizations
router.put('/:id/customizations', auth, async (req, res) => {
  try {
    const { customizations } = req.body; // { section: { key: value, ... }, ... }

    for (const [section, settings] of Object.entries(customizations)) {
      for (const [key, value] of Object.entries(settings)) {
        await db.query(`
          INSERT INTO theme_customizations (theme_id, section, setting_key, setting_value)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE setting_value = ?
        `, [req.params.id, section, key, value, value]);
      }
    }

    res.json({ success: true, message: 'Customizations saved' });
  } catch (error) {
    console.error('Save customizations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/themes/:id/customizations
// @desc    Reset theme customizations
router.delete('/:id/customizations', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM theme_customizations WHERE theme_id = ?', [req.params.id]);
    res.json({ success: true, message: 'Customizations reset' });
  } catch (error) {
    console.error('Reset customizations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/themes/:id/duplicate
// @desc    Duplicate theme
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const [themes] = await db.query('SELECT * FROM themes WHERE id = ?', [req.params.id]);
    
    if (themes.length === 0) {
      return res.status(404).json({ success: false, message: 'Theme not found' });
    }

    const t = themes[0];
    const newSlug = `${t.slug}-copy-${Date.now()}`;
    
    const [result] = await db.query(`
      INSERT INTO themes (name, slug, description, preview_image, version, author, settings, colors, fonts)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      `${t.name} (copie)`, newSlug, t.description, t.preview_image,
      t.version, t.author, t.settings, t.colors, t.fonts
    ]);

    // Copy customizations
    const [customizations] = await db.query(
      'SELECT * FROM theme_customizations WHERE theme_id = ?',
      [req.params.id]
    );

    for (const c of customizations) {
      await db.query(`
        INSERT INTO theme_customizations (theme_id, section, setting_key, setting_value)
        VALUES (?, ?, ?, ?)
      `, [result.insertId, c.section, c.setting_key, c.setting_value]);
    }

    const [newTheme] = await db.query('SELECT * FROM themes WHERE id = ?', [result.insertId]);
    res.json({ success: true, message: 'Theme duplicated', data: newTheme[0] });
  } catch (error) {
    console.error('Duplicate theme error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/themes/import
// @desc    Import theme from JSON
router.post('/import', auth, async (req, res) => {
  try {
    const { themeData } = req.body;
    
    const slug = `${themeData.slug || themeData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    
    const [result] = await db.query(`
      INSERT INTO themes (name, slug, description, preview_image, version, author, settings, colors, fonts)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      themeData.name, slug, themeData.description, themeData.preview_image,
      themeData.version || '1.0.0', themeData.author,
      JSON.stringify(themeData.settings || {}),
      JSON.stringify(themeData.colors || {}),
      JSON.stringify(themeData.fonts || {})
    ]);

    const [newTheme] = await db.query('SELECT * FROM themes WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Theme imported', data: newTheme[0] });
  } catch (error) {
    console.error('Import theme error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/themes/:id/export
// @desc    Export theme as JSON
router.get('/:id/export', auth, async (req, res) => {
  try {
    const [themes] = await db.query('SELECT * FROM themes WHERE id = ?', [req.params.id]);
    
    if (themes.length === 0) {
      return res.status(404).json({ success: false, message: 'Theme not found' });
    }

    const [customizations] = await db.query(
      'SELECT section, setting_key, setting_value FROM theme_customizations WHERE theme_id = ?',
      [req.params.id]
    );

    const themeExport = {
      name: themes[0].name,
      slug: themes[0].slug,
      description: themes[0].description,
      version: themes[0].version,
      author: themes[0].author,
      settings: themes[0].settings ? JSON.parse(themes[0].settings) : {},
      colors: themes[0].colors ? JSON.parse(themes[0].colors) : {},
      fonts: themes[0].fonts ? JSON.parse(themes[0].fonts) : {},
      customizations
    };

    res.json({ success: true, data: themeExport });
  } catch (error) {
    console.error('Export theme error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
