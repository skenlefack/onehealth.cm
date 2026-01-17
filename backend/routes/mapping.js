const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, authorize, requirePermission } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// =====================================================
// MULTER CONFIGURATION FOR FILE UPLOADS
// =====================================================

// Ensure upload directories exist
const uploadDirs = [
  'uploads/experts',
  'uploads/organizations',
  'uploads/materials',
  'uploads/documents',
  'uploads/documents/files',
  'uploads/thumbnails'
];

uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
  }
};

// File filter for documents (PDF, video, office files)
const documentFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

// Storage for expert photos
const expertPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'experts'));
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${ext}`);
  }
});

// Storage for expert CVs
const expertCvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'documents'));
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `cv-${uniqueId}-${safeName}`);
  }
});

// Storage for material images
const materialImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'materials'));
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${ext}`);
  }
});

// Storage for organization logos
const organizationLogoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'organizations'));
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${ext}`);
  }
});

// Storage for document files
const documentFileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'documents', 'files'));
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueId}-${safeName}`);
  }
});

// Storage for document thumbnails
const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'thumbnails'));
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${ext}`);
  }
});

// Multer instances
const uploadExpertFiles = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'photo') {
        cb(null, path.join(__dirname, '..', 'uploads', 'experts'));
      } else if (file.fieldname === 'cv') {
        cb(null, path.join(__dirname, '..', 'uploads', 'documents'));
      } else {
        cb(null, path.join(__dirname, '..', 'uploads'));
      }
    },
    filename: (req, file, cb) => {
      const uniqueId = uuidv4();
      const ext = path.extname(file.originalname).toLowerCase();
      if (file.fieldname === 'cv') {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `cv-${uniqueId}-${safeName}`);
      } else {
        cb(null, `${uniqueId}${ext}`);
      }
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'photo') {
      imageFilter(req, file, cb);
    } else if (file.fieldname === 'cv') {
      documentFilter(req, file, cb);
    } else {
      cb(null, true);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
}).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'cv', maxCount: 1 }
]);

const uploadMaterialImage = multer({
  storage: materialImageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
}).single('image');

const uploadOrganizationLogo = multer({
  storage: organizationLogoStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
}).single('logo');

const uploadDocumentFiles = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'file') {
        cb(null, path.join(__dirname, '..', 'uploads', 'documents', 'files'));
      } else if (file.fieldname === 'thumbnail') {
        cb(null, path.join(__dirname, '..', 'uploads', 'thumbnails'));
      } else {
        cb(null, path.join(__dirname, '..', 'uploads'));
      }
    },
    filename: (req, file, cb) => {
      const uniqueId = uuidv4();
      const ext = path.extname(file.originalname).toLowerCase();
      if (file.fieldname === 'file') {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${uniqueId}-${safeName}`);
      } else {
        cb(null, `${uniqueId}${ext}`);
      }
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
      imageFilter(req, file, cb);
    } else if (file.fieldname === 'file') {
      documentFilter(req, file, cb);
    } else {
      cb(null, true);
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max for documents/videos
}).fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

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
      contact_email, contact_phone, social_links, domains, geolocation
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO organizations
      (name, acronym, type, description, mission, logo, website, parent_organization_id,
       latitude, longitude, region, city, address, contact_email, contact_phone, social_links, domains, geolocation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, acronym, type, description, mission, logo, website,
      parent_organization_id, latitude, longitude, region, city, address,
      contact_email, contact_phone,
      JSON.stringify(social_links || {}),
      JSON.stringify(domains || []),
      geolocation ? JSON.stringify(geolocation) : null
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
      'contact_email', 'contact_phone', 'social_links', 'domains', 'is_active', 'geolocation'
    ];

    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(fields)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        params.push(['social_links', 'domains', 'geolocation'].includes(key) ? JSON.stringify(value) : value);
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
      contact_email, contact_phone, geolocation, image
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO material_resources
      (name, type, description, specifications, capacity, organization_id, manager_id,
       latitude, longitude, region, city, address, status, certifications, photos,
       contact_email, contact_phone, geolocation, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, type, description,
      JSON.stringify(specifications || {}),
      capacity, organization_id, manager_id,
      latitude, longitude, region, city, address,
      status || 'available',
      JSON.stringify(certifications || []),
      JSON.stringify(photos || []),
      contact_email, contact_phone,
      geolocation ? JSON.stringify(geolocation) : null,
      image || null
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
      'contact_email', 'contact_phone', 'is_active', 'geolocation', 'image'
    ];

    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(fields)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        params.push(['specifications', 'certifications', 'photos', 'geolocation'].includes(key) ? JSON.stringify(value) : value);
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

// ==================== CONFIGURATION / SETTINGS ====================

// Helper function for CRUD operations on config tables
const createConfigRoutes = (tableName, entityName) => {
  // GET all
  router.get(`/config/${entityName}`, async (req, res) => {
    try {
      const { include_inactive } = req.query;
      let query = `SELECT * FROM ${tableName}`;
      if (!include_inactive) {
        query += ' WHERE is_active = 1';
      }
      query += ' ORDER BY display_order, name';
      const [rows] = await db.query(query);
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error(`Get ${entityName} error:`, error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // GET single
  router.get(`/config/${entityName}/:id`, async (req, res) => {
    try {
      const [rows] = await db.query(`SELECT * FROM ${tableName} WHERE id = ?`, [req.params.id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Not found' });
      }
      res.json({ success: true, data: rows[0] });
    } catch (error) {
      console.error(`Get ${entityName} error:`, error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // CREATE
  router.post(`/config/${entityName}`, auth, async (req, res) => {
    try {
      const { name, name_en, description, icon, color, display_order, is_active } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Name is required' });
      }

      const slug = name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const [result] = await db.query(
        `INSERT INTO ${tableName} (name, name_en, slug, description, icon, color, display_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, name_en || null, slug, description || null, icon || 'box', color || '#64748b', display_order || 0, is_active !== false]
      );

      const [created] = await db.query(`SELECT * FROM ${tableName} WHERE id = ?`, [result.insertId]);
      res.status(201).json({ success: true, data: created[0] });
    } catch (error) {
      console.error(`Create ${entityName} error:`, error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, message: 'Un élément avec ce nom existe déjà' });
      }
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // UPDATE
  router.put(`/config/${entityName}/:id`, auth, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, name_en, description, icon, color, display_order, is_active } = req.body;

      const updates = [];
      const params = [];

      if (name !== undefined) {
        updates.push('name = ?');
        params.push(name);
        // Update slug too
        const slug = name.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        updates.push('slug = ?');
        params.push(slug);
      }
      if (name_en !== undefined) { updates.push('name_en = ?'); params.push(name_en); }
      if (description !== undefined) { updates.push('description = ?'); params.push(description); }
      if (icon !== undefined) { updates.push('icon = ?'); params.push(icon); }
      if (color !== undefined) { updates.push('color = ?'); params.push(color); }
      if (display_order !== undefined) { updates.push('display_order = ?'); params.push(display_order); }
      if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active); }

      if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'No fields to update' });
      }

      params.push(id);
      await db.query(`UPDATE ${tableName} SET ${updates.join(', ')} WHERE id = ?`, params);

      const [updated] = await db.query(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
      res.json({ success: true, data: updated[0] });
    } catch (error) {
      console.error(`Update ${entityName} error:`, error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, message: 'Un élément avec ce nom existe déjà' });
      }
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // DELETE (soft delete)
  router.delete(`/config/${entityName}/:id`, auth, authorize('admin'), async (req, res) => {
    try {
      await db.query(`UPDATE ${tableName} SET is_active = 0 WHERE id = ?`, [req.params.id]);
      res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
      console.error(`Delete ${entityName} error:`, error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // REORDER
  router.put(`/config/${entityName}/reorder`, auth, async (req, res) => {
    try {
      const { items } = req.body; // Array of { id, display_order }
      if (!Array.isArray(items)) {
        return res.status(400).json({ success: false, message: 'Items array required' });
      }

      for (const item of items) {
        await db.query(`UPDATE ${tableName} SET display_order = ? WHERE id = ?`, [item.display_order, item.id]);
      }

      res.json({ success: true, message: 'Reordered successfully' });
    } catch (error) {
      console.error(`Reorder ${entityName} error:`, error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
};

// Create routes for each config type
createConfigRoutes('ohwr_material_types', 'material-types');
createConfigRoutes('ohwr_organization_types', 'organization-types');
createConfigRoutes('ohwr_document_types', 'document-types');
createConfigRoutes('ohwr_expert_categories', 'expert-categories');

// GET all config types at once (for forms)
router.get('/config/all', async (req, res) => {
  try {
    const [materialTypes] = await db.query('SELECT * FROM ohwr_material_types WHERE is_active = 1 ORDER BY display_order, name');
    const [organizationTypes] = await db.query('SELECT * FROM ohwr_organization_types WHERE is_active = 1 ORDER BY display_order, name');
    const [documentTypes] = await db.query('SELECT * FROM ohwr_document_types WHERE is_active = 1 ORDER BY display_order, name');
    const [expertCategories] = await db.query('SELECT * FROM ohwr_expert_categories WHERE is_active = 1 ORDER BY display_order, name');

    res.json({
      success: true,
      data: {
        materialTypes,
        organizationTypes,
        documentTypes,
        expertCategories
      }
    });
  } catch (error) {
    console.error('Get all config error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== USER RESOURCE SUBMISSIONS ====================

// Helper function to create notification
const createNotification = async (type, title, message, resourceType, resourceId, userId) => {
  try {
    await db.query(
      `INSERT INTO admin_notifications (type, title, message, resource_type, resource_id, user_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [type, title, message, resourceType, resourceId, userId]
    );
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

// GET user's submissions (all types)
router.get('/my-submissions', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, type } = req.query;

    let results = { materials: [], organizations: [], documents: [], experts: [] };

    // Build status filter
    const statusFilter = status ? 'AND submission_status = ?' : '';
    const statusParams = status ? [status] : [];

    if (!type || type === 'material') {
      const [materials] = await db.query(
        `SELECT *, 'material' as resource_type FROM material_resources
         WHERE submitted_by = ? ${statusFilter} ORDER BY submitted_at DESC`,
        [userId, ...statusParams]
      );
      results.materials = materials;
    }

    if (!type || type === 'organization') {
      const [organizations] = await db.query(
        `SELECT *, 'organization' as resource_type FROM organizations
         WHERE submitted_by = ? ${statusFilter} ORDER BY submitted_at DESC`,
        [userId, ...statusParams]
      );
      results.organizations = organizations;
    }

    if (!type || type === 'document') {
      const [documents] = await db.query(
        `SELECT *, 'document' as resource_type FROM document_resources
         WHERE submitted_by = ? ${statusFilter} ORDER BY submitted_at DESC`,
        [userId, ...statusParams]
      );
      results.documents = documents;
    }

    if (!type || type === 'expert') {
      const [experts] = await db.query(
        `SELECT *, 'expert' as resource_type FROM human_resources
         WHERE submitted_by = ? ${statusFilter} ORDER BY submitted_at DESC`,
        [userId, ...statusParams]
      );
      results.experts = experts;
    }

    // Calculate counts
    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0
    };

    ['materials', 'organizations', 'documents', 'experts'].forEach(key => {
      results[key].forEach(item => {
        counts.total++;
        if (item.submission_status === 'pending') counts.pending++;
        else if (item.submission_status === 'approved') counts.approved++;
        else if (item.submission_status === 'rejected') counts.rejected++;
      });
    });

    res.json({ success: true, data: results, counts });
  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// SUBMIT material (user) - with image upload
router.post('/submit/material', auth, (req, res) => {
  uploadMaterialImage(req, res, async (err) => {
    if (err) {
      console.error('Material image upload error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const userId = req.user.id;
      const {
        name, type, description, specifications, capacity, organization_id, status,
        latitude, longitude, region, city, address, contact_email, contact_phone
      } = req.body;

      if (!name || !type) {
        return res.status(400).json({ success: false, message: 'Name and type are required' });
      }

      // Handle uploaded image
      let imagePath = null;
      if (req.file) {
        imagePath = `/uploads/materials/${req.file.filename}`;
      }

      const [result] = await db.query(`
        INSERT INTO material_resources
        (name, type, description, specifications, capacity, organization_id, status,
         latitude, longitude, region, city, address, contact_email, contact_phone, image,
         submitted_by, submission_status, submitted_at, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), 0)
      `, [
        name, type, description,
        JSON.stringify(specifications || {}),
        capacity, organization_id || null, status || 'operational',
        latitude || null, longitude || null, region || null, city || null, address || null,
        contact_email || null, contact_phone || null, imagePath,
        userId
      ]);

      // Create notification for admin
      await createNotification(
        'resource_submission',
        'Nouvelle soumission de matériel',
        `${req.user.email} a soumis un nouveau matériel: ${name}`,
        'material',
        result.insertId,
        userId
      );

      const [newMaterial] = await db.query('SELECT * FROM material_resources WHERE id = ?', [result.insertId]);
      res.status(201).json({ success: true, data: newMaterial[0], message: 'Material submitted for validation' });
    } catch (error) {
      console.error('Submit material error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
});

// SUBMIT organization (user) - with logo upload
router.post('/submit/organization', auth, (req, res) => {
  uploadOrganizationLogo(req, res, async (err) => {
    if (err) {
      console.error('Organization logo upload error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const userId = req.user.id;
      const {
        name, acronym, type, description, mission, website,
        latitude, longitude, region, city, address, contact_email, contact_phone
      } = req.body;

      if (!name || !type) {
        return res.status(400).json({ success: false, message: 'Name and type are required' });
      }

      // Handle uploaded logo
      let logoPath = null;
      if (req.file) {
        logoPath = `/uploads/organizations/${req.file.filename}`;
      }

      const [result] = await db.query(`
        INSERT INTO organizations
        (name, acronym, type, description, mission, logo, website,
         latitude, longitude, region, city, address, contact_email, contact_phone,
         submitted_by, submission_status, submitted_at, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), 0)
      `, [
        name, acronym || null, type, description || null, mission || null, logoPath, website || null,
        latitude || null, longitude || null, region || null, city || null, address || null,
        contact_email || null, contact_phone || null,
        userId
      ]);

      await createNotification(
        'resource_submission',
        'Nouvelle soumission d\'organisme',
        `${req.user.email} a soumis un nouvel organisme: ${name}`,
        'organization',
        result.insertId,
        userId
      );

      const [newOrg] = await db.query('SELECT * FROM organizations WHERE id = ?', [result.insertId]);
      res.status(201).json({ success: true, data: newOrg[0], message: 'Organization submitted for validation' });
    } catch (error) {
      console.error('Submit organization error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
});

// SUBMIT document (user) - with file and thumbnail uploads
router.post('/submit/document', auth, (req, res) => {
  uploadDocumentFiles(req, res, async (err) => {
    if (err) {
      console.error('Document upload error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const userId = req.user.id;
      const {
        title, type, description, external_url,
        publication_date, language, themes, organization_id, access_level
      } = req.body;

      if (!title || !type) {
        return res.status(400).json({ success: false, message: 'Title and type are required' });
      }

      // Handle uploaded files
      let filePath = null;
      let fileType = null;
      let fileSize = null;
      let thumbnailPath = null;

      if (req.files) {
        if (req.files['file'] && req.files['file'][0]) {
          const uploadedFile = req.files['file'][0];
          filePath = `/uploads/documents/files/${uploadedFile.filename}`;
          fileType = uploadedFile.mimetype;
          fileSize = uploadedFile.size;
        }
        if (req.files['thumbnail'] && req.files['thumbnail'][0]) {
          thumbnailPath = `/uploads/thumbnails/${req.files['thumbnail'][0].filename}`;
        }
      }

      // If no file uploaded, use external URL if provided
      if (!filePath && external_url) {
        filePath = external_url;
      }

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
        .substring(0, 200) + '-' + Date.now();

      const [result] = await db.query(`
        INSERT INTO document_resources
        (title, slug, type, description, file_path, file_type, file_size, thumbnail,
         publication_date, language, themes, organization_id,
         submitted_by, submission_status, submitted_at, is_active, access_level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), 0, ?)
      `, [
        title, slug, type, description || null, filePath, fileType, fileSize, thumbnailPath,
        publication_date || null, language || 'fr', JSON.stringify(themes || []), organization_id || null,
        userId, access_level || 'public'
      ]);

      await createNotification(
        'resource_submission',
        'Nouvelle soumission de document',
        `${req.user.email} a soumis un nouveau document: ${title}`,
        'document',
        result.insertId,
        userId
      );

      const [newDoc] = await db.query('SELECT * FROM document_resources WHERE id = ?', [result.insertId]);
      res.status(201).json({ success: true, data: newDoc[0], message: 'Document submitted for validation' });
    } catch (error) {
      console.error('Submit document error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
});

// SUBMIT expert registration (user registers themselves) - with photo and CV uploads
router.post('/submit/expert', auth, (req, res) => {
  uploadExpertFiles(req, res, async (err) => {
    if (err) {
      console.error('Expert file upload error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const userId = req.user.id;
      const {
        first_name, last_name, title, category, organization_id,
        email, phone, biography, expertise_domains, qualifications, expertise_summary,
        latitude, longitude, region, city, address,
        years_experience, linkedin_url, twitter_url, orcid_id, google_scholar_url, researchgate_url, website,
        publications_count, projects_count, consultation_rate, awards, research_interests,
        available_for_collaboration
      } = req.body;

      // Parse selected_expertise_ids if it's a string (from FormData)
      let selected_expertise_ids = req.body.selected_expertise_ids;
      if (typeof selected_expertise_ids === 'string') {
        try {
          selected_expertise_ids = JSON.parse(selected_expertise_ids);
        } catch (e) {
          selected_expertise_ids = [];
        }
      }

      if (!first_name || !last_name || !category) {
        return res.status(400).json({ success: false, message: 'First name, last name and category are required' });
      }

      // Handle uploaded files
      let photoPath = null;
      let cvPath = null;

      if (req.files) {
        if (req.files['photo'] && req.files['photo'][0]) {
          photoPath = `/uploads/experts/${req.files['photo'][0].filename}`;
        }
        if (req.files['cv'] && req.files['cv'][0]) {
          cvPath = `/uploads/documents/${req.files['cv'][0].filename}`;
        }
      }

      const [result] = await db.query(`
        INSERT INTO human_resources
        (first_name, last_name, title, category, organization_id, email, phone, photo, cv_url, biography,
         expertise_domains, qualifications, expertise_summary, latitude, longitude, region, city, address,
         years_experience, linkedin_url, twitter_url, orcid_id, google_scholar_url, researchgate_url, website,
         publications_count, projects_count, consultation_rate, awards, research_interests,
         available_for_collaboration, submitted_by, submission_status, submitted_at, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), 0)
      `, [
        first_name, last_name, title || null, category, organization_id || null,
        email || req.user.email, phone || null, photoPath, cvPath, biography || null,
        JSON.stringify(expertise_domains || []),
        JSON.stringify(qualifications || []),
        expertise_summary || null,
        latitude || null, longitude || null, region || null, city || null, address || null,
        years_experience || 0, linkedin_url || null, twitter_url || null, orcid_id || null, google_scholar_url || null,
        researchgate_url || null, website || null,
        publications_count || 0, projects_count || 0, consultation_rate || null, awards || null, research_interests || null,
        available_for_collaboration === 'true' || available_for_collaboration === true ? 1 : 0,
        userId
      ]);

      const expertId = result.insertId;

      // Save expertise domains relationship
      if (selected_expertise_ids && Array.isArray(selected_expertise_ids) && selected_expertise_ids.length > 0) {
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

      await createNotification(
        'expert_registration',
        'Nouvelle inscription expert',
        `${req.user.email} s'est inscrit comme expert: ${first_name} ${last_name}`,
        'expert',
        expertId,
        userId
      );

      const [newExpert] = await db.query('SELECT * FROM human_resources WHERE id = ?', [expertId]);
      res.status(201).json({ success: true, data: newExpert[0], message: 'Expert registration submitted for validation' });
    } catch (error) {
      console.error('Submit expert error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
});

// ==================== ADMIN VALIDATION ====================

// GET pending submissions (admin)
router.get('/admin/pending-submissions', auth, authorize('admin'), async (req, res) => {
  try {
    const { type } = req.query;

    let results = { materials: [], organizations: [], documents: [], experts: [] };

    if (!type || type === 'material') {
      const [materials] = await db.query(`
        SELECT m.*, u.username as submitter_username, u.email as submitter_email
        FROM material_resources m
        LEFT JOIN users u ON m.submitted_by = u.id
        WHERE m.submission_status = 'pending'
        ORDER BY m.submitted_at ASC
      `);
      results.materials = materials;
    }

    if (!type || type === 'organization') {
      const [organizations] = await db.query(`
        SELECT o.*, u.username as submitter_username, u.email as submitter_email
        FROM organizations o
        LEFT JOIN users u ON o.submitted_by = u.id
        WHERE o.submission_status = 'pending'
        ORDER BY o.submitted_at ASC
      `);
      results.organizations = organizations;
    }

    if (!type || type === 'document') {
      const [documents] = await db.query(`
        SELECT d.*, u.username as submitter_username, u.email as submitter_email
        FROM document_resources d
        LEFT JOIN users u ON d.submitted_by = u.id
        WHERE d.submission_status = 'pending'
        ORDER BY d.submitted_at ASC
      `);
      results.documents = documents;
    }

    if (!type || type === 'expert') {
      const [experts] = await db.query(`
        SELECT h.*, u.username as submitter_username, u.email as submitter_email
        FROM human_resources h
        LEFT JOIN users u ON h.submitted_by = u.id
        WHERE h.submission_status = 'pending'
        ORDER BY h.submitted_at ASC
      `);
      results.experts = experts;
    }

    const totalPending = results.materials.length + results.organizations.length +
                         results.documents.length + results.experts.length;

    res.json({ success: true, data: results, totalPending });
  } catch (error) {
    console.error('Get pending submissions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// APPROVE submission (admin)
router.put('/admin/approve/:resourceType/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { resourceType, id } = req.params;
    const adminId = req.user.id;

    const tableMap = {
      material: 'material_resources',
      organization: 'organizations',
      document: 'document_resources',
      expert: 'human_resources'
    };

    const table = tableMap[resourceType];
    if (!table) {
      return res.status(400).json({ success: false, message: 'Invalid resource type' });
    }

    await db.query(
      `UPDATE ${table} SET submission_status = 'approved', validated_by = ?, validated_at = NOW(), is_active = 1 WHERE id = ?`,
      [adminId, id]
    );

    // Mark related notification as read
    await db.query(
      `UPDATE admin_notifications SET is_read = 1, read_by = ?, read_at = NOW()
       WHERE resource_type = ? AND resource_id = ? AND is_read = 0`,
      [adminId, resourceType, id]
    );

    res.json({ success: true, message: 'Submission approved' });
  } catch (error) {
    console.error('Approve submission error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// REJECT submission (admin)
router.put('/admin/reject/:resourceType/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { resourceType, id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const tableMap = {
      material: 'material_resources',
      organization: 'organizations',
      document: 'document_resources',
      expert: 'human_resources'
    };

    const table = tableMap[resourceType];
    if (!table) {
      return res.status(400).json({ success: false, message: 'Invalid resource type' });
    }

    await db.query(
      `UPDATE ${table} SET submission_status = 'rejected', validated_by = ?, validated_at = NOW(), rejection_reason = ? WHERE id = ?`,
      [adminId, reason || null, id]
    );

    // Mark related notification as read
    await db.query(
      `UPDATE admin_notifications SET is_read = 1, read_by = ?, read_at = NOW()
       WHERE resource_type = ? AND resource_id = ? AND is_read = 0`,
      [adminId, resourceType, id]
    );

    res.json({ success: true, message: 'Submission rejected' });
  } catch (error) {
    console.error('Reject submission error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== ADMIN NOTIFICATIONS ====================

// GET notifications (admin)
router.get('/admin/notifications', auth, authorize('admin'), async (req, res) => {
  try {
    const { limit = 20, unread_only } = req.query;

    let query = 'SELECT * FROM admin_notifications';
    const params = [];

    if (unread_only === 'true') {
      query += ' WHERE is_read = 0';
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const [notifications] = await db.query(query, params);

    // Get unread count
    const [[{ unreadCount }]] = await db.query('SELECT COUNT(*) as unreadCount FROM admin_notifications WHERE is_read = 0');

    res.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET notification count (for badge)
router.get('/admin/notifications/count', auth, async (req, res) => {
  try {
    const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM admin_notifications WHERE is_read = 0');
    res.json({ success: true, count });
  } catch (error) {
    console.error('Get notification count error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark notification as read
router.put('/admin/notifications/:id/read', auth, authorize('admin'), async (req, res) => {
  try {
    await db.query(
      'UPDATE admin_notifications SET is_read = 1, read_by = ?, read_at = NOW() WHERE id = ?',
      [req.user.id, req.params.id]
    );
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/admin/notifications/read-all', auth, authorize('admin'), async (req, res) => {
  try {
    await db.query(
      'UPDATE admin_notifications SET is_read = 1, read_by = ?, read_at = NOW() WHERE is_read = 0',
      [req.user.id]
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
