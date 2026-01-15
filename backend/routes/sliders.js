const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');

// @route   GET /api/sliders
// @desc    Get all sliders
router.get('/', async (req, res) => {
  try {
    const [sliders] = await db.query(`
      SELECT s.*, 
        (SELECT COUNT(*) FROM slides WHERE slider_id = s.id) as slides_count
      FROM sliders s
      ORDER BY s.created_at DESC
    `);
    
    const parsedSliders = sliders.map(s => ({
      ...s,
      settings: s.settings ? JSON.parse(s.settings) : {}
    }));
    
    res.json({ success: true, data: parsedSliders });
  } catch (error) {
    console.error('Get sliders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/sliders/:id
// @desc    Get single slider with slides
router.get('/:id', async (req, res) => {
  try {
    const [sliders] = await db.query('SELECT * FROM sliders WHERE id = ?', [req.params.id]);
    
    if (sliders.length === 0) {
      return res.status(404).json({ success: false, message: 'Slider not found' });
    }

    const [slides] = await db.query(`
      SELECT * FROM slides WHERE slider_id = ? ORDER BY sort_order ASC
    `, [req.params.id]);

    const slider = {
      ...sliders[0],
      settings: sliders[0].settings ? JSON.parse(sliders[0].settings) : {},
      slides
    };

    res.json({ success: true, data: slider });
  } catch (error) {
    console.error('Get slider error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/sliders/location/:location
// @desc    Get slider by location (public)
router.get('/location/:location', async (req, res) => {
  try {
    const [sliders] = await db.query(`
      SELECT * FROM sliders WHERE location = ? AND status = 'active' LIMIT 1
    `, [req.params.location]);
    
    if (sliders.length === 0) {
      return res.json({ success: true, data: null });
    }

    const [slides] = await db.query(`
      SELECT * FROM slides 
      WHERE slider_id = ? AND status = 'active'
      ORDER BY sort_order ASC
    `, [sliders[0].id]);

    const slider = {
      ...sliders[0],
      settings: sliders[0].settings ? JSON.parse(sliders[0].settings) : {},
      slides
    };

    res.json({ success: true, data: slider });
  } catch (error) {
    console.error('Get slider by location error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/sliders
// @desc    Create slider
router.post('/', auth, async (req, res) => {
  try {
    const { name, location, settings, status } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const [result] = await db.query(`
      INSERT INTO sliders (name, slug, location, settings, status)
      VALUES (?, ?, ?, ?, ?)
    `, [name, slug, location || 'home_hero', settings || '{}', status || 'active']);

    const [newSlider] = await db.query('SELECT * FROM sliders WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Slider created', data: newSlider[0] });
  } catch (error) {
    console.error('Create slider error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/sliders/:id
// @desc    Update slider
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, location, settings, status } = req.body;

    await db.query(`
      UPDATE sliders SET name = ?, location = ?, settings = ?, status = ?
      WHERE id = ?
    `, [name, location, JSON.stringify(settings), status, req.params.id]);

    const [updated] = await db.query('SELECT * FROM sliders WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Slider updated', data: updated[0] });
  } catch (error) {
    console.error('Update slider error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/sliders/:id
// @desc    Delete slider
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM sliders WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Slider deleted' });
  } catch (error) {
    console.error('Delete slider error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================================================
// SLIDES
// =====================================================

// @route   GET /api/sliders/:sliderId/slides
// @desc    Get slides for a slider
router.get('/:sliderId/slides', async (req, res) => {
  try {
    const [slides] = await db.query(`
      SELECT * FROM slides WHERE slider_id = ? ORDER BY sort_order ASC
    `, [req.params.sliderId]);
    
    res.json({ success: true, data: slides });
  } catch (error) {
    console.error('Get slides error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/sliders/:sliderId/slides
// @desc    Create slide
router.post('/:sliderId/slides', auth, async (req, res) => {
  try {
    const {
      title, subtitle, content, image, video_url,
      button_text, button_url, button_target,
      overlay_color, overlay_opacity, text_position,
      animation, sort_order, status
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO slides (
        slider_id, title, subtitle, content, image, video_url,
        button_text, button_url, button_target, overlay_color,
        overlay_opacity, text_position, animation, sort_order, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.params.sliderId, title, subtitle, content, image, video_url,
      button_text, button_url, button_target || '_self',
      overlay_color, overlay_opacity || 0.5, text_position || 'center',
      animation || 'fade', sort_order || 0, status || 'active'
    ]);

    const [newSlide] = await db.query('SELECT * FROM slides WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Slide created', data: newSlide[0] });
  } catch (error) {
    console.error('Create slide error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/sliders/slides/:id
// @desc    Update slide
router.put('/slides/:id', auth, async (req, res) => {
  try {
    const {
      title, subtitle, content, image, video_url,
      button_text, button_url, button_target,
      overlay_color, overlay_opacity, text_position,
      animation, sort_order, status
    } = req.body;

    await db.query(`
      UPDATE slides SET
        title = ?, subtitle = ?, content = ?, image = ?, video_url = ?,
        button_text = ?, button_url = ?, button_target = ?,
        overlay_color = ?, overlay_opacity = ?, text_position = ?,
        animation = ?, sort_order = ?, status = ?
      WHERE id = ?
    `, [
      title, subtitle, content, image, video_url,
      button_text, button_url, button_target,
      overlay_color, overlay_opacity, text_position,
      animation, sort_order, status, req.params.id
    ]);

    const [updated] = await db.query('SELECT * FROM slides WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Slide updated', data: updated[0] });
  } catch (error) {
    console.error('Update slide error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/sliders/slides/:id
// @desc    Delete slide
router.delete('/slides/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM slides WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Slide deleted' });
  } catch (error) {
    console.error('Delete slide error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/sliders/:sliderId/reorder
// @desc    Reorder slides
router.put('/:sliderId/reorder', auth, async (req, res) => {
  try {
    const { slides } = req.body; // Array of { id, sort_order }

    for (const slide of slides) {
      await db.query(`
        UPDATE slides SET sort_order = ?
        WHERE id = ? AND slider_id = ?
      `, [slide.sort_order, slide.id, req.params.sliderId]);
    }

    res.json({ success: true, message: 'Slides reordered' });
  } catch (error) {
    console.error('Reorder slides error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/sliders/slides/:id/duplicate
// @desc    Duplicate slide
router.post('/slides/:id/duplicate', auth, async (req, res) => {
  try {
    const [slides] = await db.query('SELECT * FROM slides WHERE id = ?', [req.params.id]);
    
    if (slides.length === 0) {
      return res.status(404).json({ success: false, message: 'Slide not found' });
    }

    const s = slides[0];
    
    const [result] = await db.query(`
      INSERT INTO slides (
        slider_id, title, subtitle, content, image, video_url,
        button_text, button_url, button_target, overlay_color,
        overlay_opacity, text_position, animation, sort_order, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'inactive')
    `, [
      s.slider_id, `${s.title} (copie)`, s.subtitle, s.content, s.image, s.video_url,
      s.button_text, s.button_url, s.button_target, s.overlay_color,
      s.overlay_opacity, s.text_position, s.animation, s.sort_order + 1
    ]);

    const [newSlide] = await db.query('SELECT * FROM slides WHERE id = ?', [result.insertId]);
    res.json({ success: true, message: 'Slide duplicated', data: newSlide[0] });
  } catch (error) {
    console.error('Duplicate slide error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
