const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const app = express();

// Liste des origines autorisées
const allowedOrigins = [
  // Development
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  // Production - add from environment variable
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : []),
  // Default production domains
  'https://onehealth.cm',
  'https://www.onehealth.cm',
  'https://admin.onehealth.cm'
];

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Configuration CORS dynamique
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.options('*', cors());

// Logging
app.use(morgan('dev'));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =====================================================
// ROUTES
// =====================================================

// Auth & Users
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/permissions', require('./routes/permissions'));

// Content
app.use('/api/posts', require('./routes/posts'));
app.use('/api/pages', require('./routes/pages'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/tags', require('./routes/tags'));
app.use('/api/media', require('./routes/media'));
app.use('/api/comments', require('./routes/comments'));

// Structure
app.use('/api/menus', require('./routes/menus'));
app.use('/api/modules', require('./routes/modules'));
app.use('/api/sliders', require('./routes/sliders'));
app.use('/api/homepage', require('./routes/homepage'));

// Appearance
app.use('/api/themes', require('./routes/themes'));
app.use('/api/settings', require('./routes/settings'));

// Dashboard
app.use('/api/dashboard', require('./routes/dashboard'));

// OHWR-Mapping
app.use('/api/mapping', require('./routes/mapping'));

// E-Learning
app.use('/api/elearning', require('./routes/elearning'));

// Upload
app.use('/api/upload', require('./routes/upload'));

// COHRM - Cameroon One Health Rumor Management
app.use('/api/cohrm', require('./routes/cohrm'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.0.0' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 One Health CMS Server running on port ${PORT}`);
  console.log(`📚 API: http://localhost:${PORT}/api`);
  console.log(`💾 Health: http://localhost:${PORT}/api/health`);
});

module.exports = app;
// force reload Thu, Jan  8, 2026 12:56:20 AM

// trigger restart
