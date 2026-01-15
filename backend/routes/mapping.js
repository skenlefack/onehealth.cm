const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, authorize, requirePermission } = require('../middleware/auth');

// =====================================================
// OHWR-MAPPING API ROUTES
// =====================================================

// ==================== STATS & DASHBOARD ====================

// GET mapping statistics
router.get('/stats', async (req, res) => {
  try {
    const [[humanStats]] = await db.query('SELECT COUNT(*) as total FROM human_resources WHERE is_active = 1');
    const [[materialStats]] = await db.query('SELECT COUNT(*) as total FROM material_resources WHERE is_active = 1');
    const [[orgStats]] = await db.query('SELECT COUNT(*) as total FROM organizations WHERE is_active = 1');
    const [[docStats]] = await db.query('SELECT COUNT(*) as total FROM document_resources WHERE is_active = 1');

    // Stats by category/type
    const [humanByCategory] = await db.query('SELECT category, COUNT(*) as count FROM human_resources WHERE is_active = 1 GROUP BY category');
    const [materialByType] = await db.query('SELECT type, COUNT(*) as count FROM material_resources WHERE is_active = 1 GROUP BY type');
    const [orgByType] = await db.query('SELECT type, COUNT(*) as count FROM organizations WHERE is_active = 1 GROUP BY type');
    const [docByType] = await db.query('SELECT type, COUNT(*) as count FROM document_resources WHERE is_active = 1 GROUP BY type');

    // Stats by region
    const [humanByRegion] = await db.query('SELECT region, COUNT(*) as count FROM human_resources WHERE is_active = 1 AND region IS NOT NULL GROUP BY region');
    const [materialByRegion] = await db.query('SELECT region, COUNT(*) as count FROM material_resources WHERE is_active = 1 AND region IS NOT NULL GROUP BY region');

    res.json({
      success: true,
      data: {
        human_resources: {
          total: humanStats.total,
          by_category: humanByCategory.reduce((acc, r) => ({ ...acc, [r.category]: r.count }), {}),
          by_region: humanByRegion.reduce((acc, r) => ({ ...acc, [r.region]: r.count }), {})
        },
        material_resources: {
          total: materialStats.total,
          by_type: materialByType.reduce((acc, r) => ({ ...acc, [r.type]: r.count }), {}),
          by_region: materialByRegion.reduce((acc, r) => ({ ...acc, [r.region]: r.count }), {})
        },
        organizations: {
          total: orgStats.total,
          by_type: orgByType.reduce((acc, r) => ({ ...acc, [r.type]: r.count }), {})
        },
        documents: {
          total: docStats.total,
          by_type: docByType.reduce((acc, r) => ({ ...acc, [r.type]: r.count }), {})
        }
      }
    });
  } catch (error) {
    console.error('Get mapping stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET all map markers (for interactive map)
router.get('/markers', async (req, res) => {
  try {
    const { types } = req.query; // human,material,organization
    const typeArray = types ? types.split(',') : ['human', 'material', 'organization'];

    let markers = [];

    if (typeArray.includes('human')) {
      const [humans] = await db.query(`
        SELECT id, first_name, last_name, title, category, latitude, longitude, region, city, photo
        FROM human_resources WHERE is_active = 1 AND latitude IS NOT NULL AND longitude IS NOT NULL
      `);
      markers = markers.concat(humans.map(h => ({
        id: h.id,
        type: 'human',
        name: `${h.first_name} ${h.last_name}`,
        title: h.title,
        category: h.category,
        lat: parseFloat(h.latitude),
        lng: parseFloat(h.longitude),
        region: h.region,
        city: h.city,
        photo: h.photo
      })));
    }

    if (typeArray.includes('material')) {
      const [materials] = await db.query(`
        SELECT id, name, type, status, latitude, longitude, region, city
        FROM material_resources WHERE is_active = 1 AND latitude IS NOT NULL AND longitude IS NOT NULL
      `);
      markers = markers.concat(materials.map(m => ({
        id: m.id,
        type: 'material',
        name: m.name,
        category: m.type,
        status: m.status,
        lat: parseFloat(m.latitude),
        lng: parseFloat(m.longitude),
        region: m.region,
        city: m.city
      })));
    }

    if (typeArray.includes('organization')) {
      const [orgs] = await db.query(`
        SELECT id, name, acronym, type, latitude, longitude, region, city, logo
        FROM organizations WHERE is_active = 1 AND latitude IS NOT NULL AND longitude IS NOT NULL
      `);
      markers = markers.concat(orgs.map(o => ({
        id: o.id,
        type: 'organization',
        name: o.name,
        acronym: o.acronym,
        category: o.type,
        lat: parseFloat(o.latitude),
        lng: parseFloat(o.longitude),
        region: o.region,
        city: o.city,
        logo: o.logo
      })));
    }

    res.json({ success: true, data: markers });
  } catch (error) {
    console.error('Get markers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== REGIONS ====================

router.get('/regions', async (req, res) => {
  try {
    const [regions] = await db.query('SELECT * FROM regions ORDER BY name');
    res.json({ success: true, data: regions });
  } catch (error) {
    console.error('Get regions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== EXPERTISE DOMAINS ====================

router.get('/expertise-domains', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM expertise_domains WHERE is_active = 1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR name_en LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY category, name';
    const [domains] = await db.query(query, params);

    // Group by category
    const grouped = domains.reduce((acc, d) => {
      if (!acc[d.category]) acc[d.category] = [];
      acc[d.category].push(d);
      return acc;
    }, {});

    // Category labels for frontend
    const categoryLabels = {
      health: 'Santé Humaine',
      animal: 'Santé Animale',
      environment: 'Santé Environnementale',
      food_safety: 'Sécurité Alimentaire',
      laboratory: 'Laboratoire',
      management: 'Gestion & Coordination',
      policy: 'Politique Sanitaire',
      communication: 'Communication',
      other: 'Autres'
    };

    res.json({ success: true, data: domains, grouped, categoryLabels });
  } catch (error) {
    console.error('Get expertise domains error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CREATE expertise domain
router.post('/expertise-domains', auth, async (req, res) => {
  try {
    const { name, category, description, icon, is_active } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const slug = name.toLowerCase()
      .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o').replace(/[ùúûü]/g, 'u').replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const [result] = await db.query(
      `INSERT INTO expertise_domains (name, slug, category, description, icon, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), slug, category || 'other', description || '', icon || 'award', is_active !== false ? 1 : 0]
    );

    const [newDomain] = await db.query('SELECT * FROM expertise_domains WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newDomain[0] });
  } catch (error) {
    console.error('Create expertise domain error:', error.message, error.sql || '');
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// UPDATE expertise domain
router.put('/expertise-domains/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, icon, is_active } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    await db.query(
      `UPDATE expertise_domains SET name = ?, category = ?, description = ?, icon = ?, is_active = ? WHERE id = ?`,
      [name.trim(), category || 'other', description || '', icon || 'award', is_active !== false ? 1 : 0, id]
    );

    const [updated] = await db.query('SELECT * FROM expertise_domains WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Update expertise domain error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// DELETE expertise domain
router.delete('/expertise-domains/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM expertise_domains WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Domain deleted' });
  } catch (error) {
    console.error('Delete expertise domain error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Get expert's expertise domains
router.get('/experts/:id/expertise', async (req, res) => {
  try {
    const [expertises] = await db.query(`
      SELECT ed.*, ee.level, ee.years_in_domain
      FROM expertise_domains ed
      INNER JOIN expert_expertise ee ON ed.id = ee.expertise_domain_id
      WHERE ee.expert_id = ? AND ed.is_active = 1
      ORDER BY ed.category, ed.name
    `, [req.params.id]);

    res.json({ success: true, data: expertises });
  } catch (error) {
    console.error('Get expert expertise error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update expert's expertise domains
router.put('/experts/:id/expertise', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { expertise_ids } = req.body; // Array of { domain_id, level, years_in_domain }

    // Delete existing
    await db.query('DELETE FROM expert_expertise WHERE expert_id = ?', [id]);

    // Insert new
    if (expertise_ids && expertise_ids.length > 0) {
      const values = expertise_ids.map(e => [id, e.domain_id, e.level || 'intermediate', e.years_in_domain || null]);
      await db.query(
        'INSERT INTO expert_expertise (expert_id, expertise_domain_id, level, years_in_domain) VALUES ?',
        [values]
      );
    }

    // Get updated list
    const [expertises] = await db.query(`
      SELECT ed.*, ee.level, ee.years_in_domain
      FROM expertise_domains ed
      INNER JOIN expert_expertise ee ON ed.id = ee.expertise_domain_id
      WHERE ee.expert_id = ? AND ed.is_active = 1
    `, [id]);

    res.json({ success: true, data: expertises });
  } catch (error) {
    console.error('Update expert expertise error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== DOCUMENT THEMES ====================

router.get('/document-themes', async (req, res) => {
  try {
    const [themes] = await db.query('SELECT * FROM document_themes WHERE is_active = 1 ORDER BY display_order, name');
    res.json({ success: true, data: themes });
  } catch (error) {
    console.error('Get document themes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/document-themes', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, description, icon, color, parent_theme_id, display_order } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const [result] = await db.query(
      'INSERT INTO document_themes (name, slug, description, icon, color, parent_theme_id, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, slug, description, icon, color, parent_theme_id, display_order || 0]
    );

    const [newTheme] = await db.query('SELECT * FROM document_themes WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newTheme[0] });
  } catch (error) {
    console.error('Create document theme error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== HUMAN RESOURCES (PILIER 1) ====================

// GET all experts
router.get('/experts', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, region, organization_id, search, is_verified } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT h.*, o.name as organization_name, o.acronym as organization_acronym
      FROM human_resources h
      LEFT JOIN organizations o ON h.organization_id = o.id
      WHERE h.is_active = 1
    `;
    const params = [];

    if (category) {
      query += ' AND h.category = ?';
      params.push(category);
    }
    if (region) {
      query += ' AND h.region = ?';
      params.push(region);
    }
    if (organization_id) {
      query += ' AND h.organization_id = ?';
      params.push(organization_id);
    }
    if (is_verified !== undefined) {
      query += ' AND h.is_verified = ?';
      params.push(is_verified === 'true' ? 1 : 0);
    }
    if (search) {
      query += ' AND (h.first_name LIKE ? OR h.last_name LIKE ? OR h.title LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Count total
    const countQuery = query.replace('SELECT h.*, o.name as organization_name, o.acronym as organization_acronym', 'SELECT COUNT(*) as total');
    const [[{ total }]] = await db.query(countQuery, params);

    // Get paginated results
    query += ' ORDER BY h.last_name, h.first_name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [experts] = await db.query(query, params);

    res.json({
      success: true,
      data: experts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get experts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET single expert
router.get('/experts/:id', async (req, res) => {
  try {
    const [experts] = await db.query(`
      SELECT h.*, o.name as organization_name, o.acronym as organization_acronym
      FROM human_resources h
      LEFT JOIN organizations o ON h.organization_id = o.id
      WHERE h.id = ?
    `, [req.params.id]);

    if (experts.length === 0) {
      return res.status(404).json({ success: false, message: 'Expert not found' });
    }

    // Get expertise domains
    const [expertises] = await db.query(`
      SELECT ed.*, ee.level
      FROM expertise_domains ed
      INNER JOIN expert_expertise ee ON ed.id = ee.expertise_domain_id
      WHERE ee.expert_id = ?
    `, [req.params.id]);

    // Get organizations
    const [organizations] = await db.query(`
      SELECT o.*, eo.role, eo.is_primary
      FROM organizations o
      INNER JOIN expert_organization eo ON o.id = eo.organization_id
      WHERE eo.expert_id = ?
    `, [req.params.id]);

    res.json({
      success: true,
      data: {
        ...experts[0],
        expertises,
        organizations
      }
    });
  } catch (error) {
    console.error('Get expert error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CREATE expert
router.post('/experts', auth, async (req, res) => {
  try {
    const {
      first_name, last_name, title, category, organization_id,
      email, phone, photo, biography, expertise_domains, qualifications,
      latitude, longitude, region, city, address,
      // New fields
      years_experience, cv_url, linkedin_url, twitter_url, orcid_id,
      google_scholar_url, researchgate_url, website, languages, education,
      certifications, publications_count, projects_count, awards,
      research_interests, available_for_collaboration, consultation_rate, expertise_summary,
      selected_expertise_ids
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO human_resources
      (first_name, last_name, title, category, organization_id, email, phone, photo, biography,
       expertise_domains, qualifications, latitude, longitude, region, city, address,
       years_experience, cv_url, linkedin_url, twitter_url, orcid_id, google_scholar_url,
       researchgate_url, website, languages, education, certifications, publications_count,
       projects_count, awards, research_interests, available_for_collaboration, consultation_rate, expertise_summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      first_name, last_name, title, category, organization_id,
      email, phone, photo, biography,
      JSON.stringify(expertise_domains || []),
      JSON.stringify(qualifications || []),
      latitude, longitude, region, city, address,
      years_experience || 0, cv_url, linkedin_url, twitter_url, orcid_id,
      google_scholar_url, researchgate_url, website,
      JSON.stringify(languages || []),
      JSON.stringify(education || []),
      JSON.stringify(certifications || []),
      publications_count || 0, projects_count || 0, awards, research_interests,
      available_for_collaboration !== false, consultation_rate, expertise_summary
    ]);

    const expertId = result.insertId;

    // Save expertise domains relationship
    if (selected_expertise_ids && selected_expertise_ids.length > 0) {
      const expertiseValues = selected_expertise_ids.map(e => [
        expertId,
        typeof e === 'object' ? e.domain_id : e,
        typeof e === 'object' ? e.level || 'intermediate' : 'intermediate',
        typeof e === 'object' ? e.years_in_domain : null
      ]);
      await db.query(
        'INSERT INTO expert_expertise (expert_id, expertise_domain_id, level, years_in_domain) VALUES ?',
        [expertiseValues]
      );
    }

    const [newExpert] = await db.query('SELECT * FROM human_resources WHERE id = ?', [expertId]);
    res.status(201).json({ success: true, data: newExpert[0] });
  } catch (error) {
    console.error('Create expert error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// UPDATE expert
router.put('/experts/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    // Build dynamic update query
    const allowedFields = [
      'first_name', 'last_name', 'title', 'category', 'organization_id',
      'email', 'phone', 'photo', 'biography', 'expertise_domains', 'qualifications',
      'latitude', 'longitude', 'region', 'city', 'address', 'is_active', 'is_verified',
      // New fields
      'years_experience', 'cv_url', 'linkedin_url', 'twitter_url', 'orcid_id',
      'google_scholar_url', 'researchgate_url', 'website', 'languages', 'education',
      'certifications', 'publications_count', 'projects_count', 'awards',
      'research_interests', 'available_for_collaboration', 'consultation_rate', 'expertise_summary'
    ];

    const jsonFields = ['expertise_domains', 'qualifications', 'languages', 'education', 'certifications'];

    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(fields)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        params.push(jsonFields.includes(key) ? JSON.stringify(value) : value);
      }
    }

    if (updates.length > 0) {
      params.push(id);
      await db.query(`UPDATE human_resources SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    // Update expertise domains relationship if provided
    if (fields.selected_expertise_ids !== undefined) {
      await db.query('DELETE FROM expert_expertise WHERE expert_id = ?', [id]);

      if (fields.selected_expertise_ids && fields.selected_expertise_ids.length > 0) {
        const expertiseValues = fields.selected_expertise_ids.map(e => [
          id,
          typeof e === 'object' ? e.domain_id : e,
          typeof e === 'object' ? e.level || 'intermediate' : 'intermediate',
          typeof e === 'object' ? e.years_in_domain : null
        ]);
        await db.query(
          'INSERT INTO expert_expertise (expert_id, expertise_domain_id, level, years_in_domain) VALUES ?',
          [expertiseValues]
        );
      }
    }

    const [updated] = await db.query('SELECT * FROM human_resources WHERE id = ?', [id]);

    // Get expertises
    const [expertises] = await db.query(`
      SELECT ed.id, ed.name, ed.category, ee.level
      FROM expertise_domains ed
      INNER JOIN expert_expertise ee ON ed.id = ee.expertise_domain_id
      WHERE ee.expert_id = ?
    `, [id]);

    res.json({ success: true, data: { ...updated[0], expertises } });
  } catch (error) {
    console.error('Update expert error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE expert
router.delete('/experts/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await db.query('UPDATE human_resources SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Expert deleted' });
  } catch (error) {
    console.error('Delete expert error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== ORGANIZATIONS (PILIER 3) ====================

// GET all organizations
router.get('/organizations', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, region, search, parent_id } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM organizations WHERE is_active = 1';
    const params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (region) {
      query += ' AND region = ?';
      params.push(region);
    }
    if (parent_id) {
      query += ' AND parent_organization_id = ?';
      params.push(parent_id);
    }
    if (search) {
      query += ' AND (name LIKE ? OR acronym LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Count total
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [[{ total }]] = await db.query(countQuery, params);

    // Get paginated results
    query += ' ORDER BY name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [organizations] = await db.query(query, params);

    res.json({
      success: true,
      data: organizations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET single organization
router.get('/organizations/:id', async (req, res) => {
  try {
    const [orgs] = await db.query('SELECT * FROM organizations WHERE id = ?', [req.params.id]);

    if (orgs.length === 0) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    // Get parent organization
    let parent = null;
    if (orgs[0].parent_organization_id) {
      const [parents] = await db.query('SELECT id, name, acronym FROM organizations WHERE id = ?', [orgs[0].parent_organization_id]);
      parent = parents[0] || null;
    }

    // Get child organizations
    const [children] = await db.query('SELECT id, name, acronym, type FROM organizations WHERE parent_organization_id = ? AND is_active = 1', [req.params.id]);

    // Get experts count
    const [[{ expertCount }]] = await db.query('SELECT COUNT(*) as expertCount FROM human_resources WHERE organization_id = ? AND is_active = 1', [req.params.id]);

    res.json({
      success: true,
      data: {
        ...orgs[0],
        parent,
        children,
        expert_count: expertCount
      }
    });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CREATE organization
router.post('/organizations', auth, async (req, res) => {
  try {
    const {
      name, acronym, type, description, mission, logo, website,
      parent_organization_id, latitude, longitude, region, city, address,
      contact_email, contact_phone, social_links, domains
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO organizations
      (name, acronym, type, description, mission, logo, website, parent_organization_id,
       latitude, longitude, region, city, address, contact_email, contact_phone, social_links, domains)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, acronym, type, description, mission, logo, website,
      parent_organization_id, latitude, longitude, region, city, address,
      contact_email, contact_phone,
      JSON.stringify(social_links || {}),
      JSON.stringify(domains || [])
    ]);

    const [newOrg] = await db.query('SELECT * FROM organizations WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newOrg[0] });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// UPDATE organization
router.put('/organizations/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    const allowedFields = [
      'name', 'acronym', 'type', 'description', 'mission', 'logo', 'website',
      'parent_organization_id', 'latitude', 'longitude', 'region', 'city', 'address',
      'contact_email', 'contact_phone', 'social_links', 'domains', 'is_active'
    ];

    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(fields)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        params.push(key === 'social_links' || key === 'domains' ? JSON.stringify(value) : value);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    params.push(id);
    await db.query(`UPDATE organizations SET ${updates.join(', ')} WHERE id = ?`, params);

    const [updated] = await db.query('SELECT * FROM organizations WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE organization
router.delete('/organizations/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await db.query('UPDATE organizations SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Organization deleted' });
  } catch (error) {
    console.error('Delete organization error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== MATERIAL RESOURCES (PILIER 2) ====================

// GET all materials
router.get('/materials', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, region, organization_id, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT m.*, o.name as organization_name, o.acronym as organization_acronym,
             h.first_name as manager_first_name, h.last_name as manager_last_name
      FROM material_resources m
      LEFT JOIN organizations o ON m.organization_id = o.id
      LEFT JOIN human_resources h ON m.manager_id = h.id
      WHERE m.is_active = 1
    `;
    const params = [];

    if (type) {
      query += ' AND m.type = ?';
      params.push(type);
    }
    if (status) {
      query += ' AND m.status = ?';
      params.push(status);
    }
    if (region) {
      query += ' AND m.region = ?';
      params.push(region);
    }
    if (organization_id) {
      query += ' AND m.organization_id = ?';
      params.push(organization_id);
    }
    if (search) {
      query += ' AND m.name LIKE ?';
      params.push(`%${search}%`);
    }

    // Count total
    const countQuery = query.replace(/SELECT[\s\S]*?FROM material_resources/, 'SELECT COUNT(*) as total FROM material_resources');
    const [[{ total }]] = await db.query(countQuery, params);

    // Get paginated results
    query += ' ORDER BY m.name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [materials] = await db.query(query, params);

    res.json({
      success: true,
      data: materials,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET single material
router.get('/materials/:id', async (req, res) => {
  try {
    const [materials] = await db.query(`
      SELECT m.*, o.name as organization_name, o.acronym as organization_acronym,
             h.first_name as manager_first_name, h.last_name as manager_last_name, h.email as manager_email
      FROM material_resources m
      LEFT JOIN organizations o ON m.organization_id = o.id
      LEFT JOIN human_resources h ON m.manager_id = h.id
      WHERE m.id = ?
    `, [req.params.id]);

    if (materials.length === 0) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    res.json({ success: true, data: materials[0] });
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CREATE material
router.post('/materials', auth, async (req, res) => {
  try {
    const {
      name, type, description, specifications, capacity, organization_id, manager_id,
      latitude, longitude, region, city, address, status, certifications, photos,
      contact_email, contact_phone
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO material_resources
      (name, type, description, specifications, capacity, organization_id, manager_id,
       latitude, longitude, region, city, address, status, certifications, photos,
       contact_email, contact_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, type, description,
      JSON.stringify(specifications || {}),
      capacity, organization_id, manager_id,
      latitude, longitude, region, city, address,
      status || 'available',
      JSON.stringify(certifications || []),
      JSON.stringify(photos || []),
      contact_email, contact_phone
    ]);

    const [newMaterial] = await db.query('SELECT * FROM material_resources WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newMaterial[0] });
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// UPDATE material
router.put('/materials/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    const allowedFields = [
      'name', 'type', 'description', 'specifications', 'capacity', 'organization_id', 'manager_id',
      'latitude', 'longitude', 'region', 'city', 'address', 'status', 'certifications', 'photos',
      'contact_email', 'contact_phone', 'is_active'
    ];

    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(fields)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        params.push(['specifications', 'certifications', 'photos'].includes(key) ? JSON.stringify(value) : value);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    params.push(id);
    await db.query(`UPDATE material_resources SET ${updates.join(', ')} WHERE id = ?`, params);

    const [updated] = await db.query('SELECT * FROM material_resources WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE material
router.delete('/materials/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await db.query('UPDATE material_resources SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Material deleted' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== DOCUMENT RESOURCES (PILIER 4) ====================

// GET all documents
router.get('/documents', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, theme, language, year, organization_id, access_level, search, is_featured } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT d.*, o.name as organization_name, o.acronym as organization_acronym
      FROM document_resources d
      LEFT JOIN organizations o ON d.organization_id = o.id
      WHERE d.is_active = 1
    `;
    const params = [];

    if (type) {
      query += ' AND d.type = ?';
      params.push(type);
    }
    if (language) {
      query += ' AND d.language = ?';
      params.push(language);
    }
    if (year) {
      query += ' AND YEAR(d.publication_date) = ?';
      params.push(year);
    }
    if (organization_id) {
      query += ' AND d.organization_id = ?';
      params.push(organization_id);
    }
    if (access_level) {
      query += ' AND d.access_level = ?';
      params.push(access_level);
    }
    if (is_featured !== undefined) {
      query += ' AND d.is_featured = ?';
      params.push(is_featured === 'true' ? 1 : 0);
    }
    if (search) {
      query += ' AND (d.title LIKE ? OR d.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Count total
    const countQuery = query.replace('SELECT d.*, o.name as organization_name, o.acronym as organization_acronym', 'SELECT COUNT(*) as total');
    const [[{ total }]] = await db.query(countQuery, params);

    // Get paginated results
    query += ' ORDER BY d.publication_date DESC, d.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [documents] = await db.query(query, params);

    res.json({
      success: true,
      data: documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET featured documents
router.get('/documents/featured', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const [documents] = await db.query(`
      SELECT d.*, o.name as organization_name
      FROM document_resources d
      LEFT JOIN organizations o ON d.organization_id = o.id
      WHERE d.is_active = 1 AND d.is_featured = 1
      ORDER BY d.publication_date DESC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json({ success: true, data: documents });
  } catch (error) {
    console.error('Get featured documents error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET recent documents
router.get('/documents/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const [documents] = await db.query(`
      SELECT d.*, o.name as organization_name
      FROM document_resources d
      LEFT JOIN organizations o ON d.organization_id = o.id
      WHERE d.is_active = 1
      ORDER BY d.created_at DESC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json({ success: true, data: documents });
  } catch (error) {
    console.error('Get recent documents error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET single document (by id or slug)
router.get('/documents/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isNumeric = /^\d+$/.test(idOrSlug);

    const [documents] = await db.query(`
      SELECT d.*, o.name as organization_name, o.acronym as organization_acronym
      FROM document_resources d
      LEFT JOIN organizations o ON d.organization_id = o.id
      WHERE ${isNumeric ? 'd.id = ?' : 'd.slug = ?'}
    `, [idOrSlug]);

    if (documents.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Increment view count
    await db.query('UPDATE document_resources SET view_count = view_count + 1 WHERE id = ?', [documents[0].id]);

    // Get authors
    const [authors] = await db.query(`
      SELECT da.*, h.first_name, h.last_name, h.title as expert_title, h.photo
      FROM document_author da
      LEFT JOIN human_resources h ON da.expert_id = h.id
      WHERE da.document_id = ?
      ORDER BY da.author_order
    `, [documents[0].id]);

    res.json({
      success: true,
      data: {
        ...documents[0],
        view_count: documents[0].view_count + 1,
        authors
      }
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CREATE document
router.post('/documents', auth, async (req, res) => {
  try {
    const {
      title, type, description, content, file_path, file_type, file_size, thumbnail,
      authors, organization_id, publication_date, language, themes, doi, isbn,
      pages_count, video_url, video_duration, access_level, is_featured
    } = req.body;

    // Generate slug
    const slug = title.toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 200);

    // Check slug uniqueness
    const [existing] = await db.query('SELECT id FROM document_resources WHERE slug = ?', [slug]);
    const finalSlug = existing.length > 0 ? `${slug}-${Date.now()}` : slug;

    const [result] = await db.query(`
      INSERT INTO document_resources
      (title, slug, type, description, content, file_path, file_type, file_size, thumbnail,
       authors, organization_id, publication_date, language, themes, doi, isbn,
       pages_count, video_url, video_duration, access_level, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, finalSlug, type, description, content, file_path, file_type, file_size, thumbnail,
      JSON.stringify(authors || []),
      organization_id, publication_date, language || 'fr',
      JSON.stringify(themes || []),
      doi, isbn, pages_count, video_url, video_duration,
      access_level || 'public', is_featured || false
    ]);

    const [newDoc] = await db.query('SELECT * FROM document_resources WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newDoc[0] });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// UPDATE document
router.put('/documents/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    const allowedFields = [
      'title', 'type', 'description', 'content', 'file_path', 'file_type', 'file_size', 'thumbnail',
      'authors', 'organization_id', 'publication_date', 'language', 'themes', 'doi', 'isbn',
      'pages_count', 'video_url', 'video_duration', 'access_level', 'is_featured', 'is_active', 'version'
    ];

    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(fields)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        params.push(['authors', 'themes'].includes(key) ? JSON.stringify(value) : value);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    params.push(id);
    await db.query(`UPDATE document_resources SET ${updates.join(', ')} WHERE id = ?`, params);

    const [updated] = await db.query('SELECT * FROM document_resources WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE document
router.delete('/documents/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await db.query('UPDATE document_resources SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Increment download count
router.post('/documents/:id/download', async (req, res) => {
  try {
    await db.query('UPDATE document_resources SET download_count = download_count + 1 WHERE id = ?', [req.params.id]);
    const [doc] = await db.query('SELECT file_path, download_count FROM document_resources WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: doc[0] });
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
