/**
 * Integration tests for COHRM Express routes
 * Tests the actual Express app routing with mocked database
 */

// Mock the database before requiring any modules
jest.mock('../../config/db', () => {
  const mockQuery = jest.fn();
  const mockGetConnection = jest.fn().mockResolvedValue({
    release: jest.fn(),
  });
  return {
    query: mockQuery,
    getConnection: mockGetConnection,
  };
});

// Mock socket service to prevent initialization errors
jest.mock('../../services/cohrmSocketService', () => ({
  initialize: jest.fn(),
  emitRumorUpdate: jest.fn(),
  emitNotification: jest.fn(),
}));

// Mock notification service
jest.mock('../../services/cohrmNotificationService', () => ({
  notifyNewRumor: jest.fn().mockResolvedValue([]),
  notifyEscalation: jest.fn().mockResolvedValue([]),
  notifyValidation: jest.fn().mockResolvedValue([]),
  notifyRejection: jest.fn().mockResolvedValue([]),
  notifyRiskAssessment: jest.fn().mockResolvedValue([]),
  sendPendingReminders: jest.fn().mockResolvedValue([]),
  sendFeedbackEmail: jest.fn().mockResolvedValue({ success: true }),
  getAssigneesToNotify: jest.fn().mockResolvedValue([]),
  logNotification: jest.fn().mockResolvedValue(1),
  updateNotificationStatus: jest.fn().mockResolvedValue(),
  emailTemplates: {},
}));

// Mock migration runner
jest.mock('../../lib/migrationRunner', () => ({
  runMigrations: jest.fn().mockResolvedValue({ applied: 0, total: 0, warnings: [] }),
}));

// Mock scanner service if it exists
jest.mock('../../services/cohrmScannerService', () => ({
  runScan: jest.fn().mockResolvedValue({ results: [] }),
}), { virtual: true });

// Mock SMS service
jest.mock('../../services/smsService', () => ({
  sendSMS: jest.fn().mockResolvedValue({ success: true }),
  smsTemplates: {},
}));

// Mock push notification service
jest.mock('../../services/pushService', () => ({
  registerDeviceToken: jest.fn().mockResolvedValue(),
  unregisterDeviceToken: jest.fn().mockResolvedValue(),
}));

const supertest = require('supertest');
const db = require('../../config/db');

// We need to require the express app setup manually since server.js starts listening
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

function createTestApp() {
  const app = express();
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Mount COHRM routes
  app.use('/api/cohrm', require('../../routes/cohrm'));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.0.0' });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  return app;
}

let app;
let request;

beforeAll(() => {
  app = createTestApp();
  request = supertest(app);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ============================================
// HEALTH CHECK
// ============================================

describe('GET /api/health', () => {
  test('returns 200 with status ok', async () => {
    const res = await request.get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBe('2.0.0');
    expect(res.body.timestamp).toBeDefined();
  });
});

// ============================================
// PUBLIC ROUTES (no auth required)
// ============================================

describe('GET /api/cohrm/public/regions', () => {
  test('returns 200 with array of regions', async () => {
    const res = await request.get('/api/cohrm/public/regions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(10);
  });

  test('each region has code and name', async () => {
    const res = await request.get('/api/cohrm/public/regions');
    for (const region of res.body.data) {
      expect(region.code).toBeDefined();
      expect(region.name).toBeDefined();
      expect(typeof region.code).toBe('string');
      expect(typeof region.name).toBe('string');
    }
  });

  test('includes expected regions', async () => {
    const res = await request.get('/api/cohrm/public/regions');
    const codes = res.body.data.map(r => r.code);
    expect(codes).toContain('CE');
    expect(codes).toContain('LT');
    expect(codes).toContain('AD');
  });
});

describe('GET /api/cohrm/public/track/:code', () => {
  test('returns rumor data for valid code', async () => {
    db.query.mockResolvedValueOnce([[{
      code: 'RUM-202607-A1B2',
      status: 'pending',
      priority: 'medium',
      created_at: '2026-07-15T10:00:00Z',
      updated_at: '2026-07-15T10:00:00Z',
    }]]);

    const res = await request.get('/api/cohrm/public/track/RUM-202607-A1B2');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toBe('RUM-202607-A1B2');
    expect(res.body.data.status).toBe('pending');
  });

  test('returns 404 for non-existent code', async () => {
    db.query.mockResolvedValueOnce([[]]); // No results

    const res = await request.get('/api/cohrm/public/track/INVALID-CODE');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('returns 500 on database error', async () => {
    db.query.mockRejectedValueOnce(new Error('DB connection lost'));

    const res = await request.get('/api/cohrm/public/track/RUM-202607-A1B2');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ============================================
// MOBILE REPORT (no auth required)
// ============================================

describe('POST /api/cohrm/mobile/report', () => {
  test('validates required fields (title and region)', async () => {
    const res = await request
      .post('/api/cohrm/mobile/report')
      .send({ description: 'No title or region' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Titre et région');
  });

  test('rejects missing title', async () => {
    const res = await request
      .post('/api/cohrm/mobile/report')
      .send({ region: 'CE' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('rejects missing region', async () => {
    const res = await request
      .post('/api/cohrm/mobile/report')
      .send({ title: 'Test rumor' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('creates report with valid data', async () => {
    db.query
      .mockResolvedValueOnce([{ insertId: 42 }]) // INSERT rumor
      .mockResolvedValueOnce([{ insertId: 1 }]); // INSERT history (notification may also query)

    const res = await request
      .post('/api/cohrm/mobile/report')
      .send({
        title: 'Cas suspects de cholera',
        region: 'CE',
        description: 'Cas groupes au marche central',
        reporter_name: 'Agent Terrain',
        reporter_phone: '+237612345678',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(42);
    expect(res.body.data.code).toBeDefined();
  });
});

// ============================================
// AUTH-PROTECTED ROUTES
// ============================================

describe('Auth-protected routes return 401 without token', () => {
  test('GET /api/cohrm/rumors returns 401', async () => {
    const res = await request.get('/api/cohrm/rumors');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/cohrm/rumors returns 401', async () => {
    const res = await request
      .post('/api/cohrm/rumors')
      .send({ title: 'Test', region: 'CE' });
    expect(res.status).toBe(401);
  });

  test('GET /api/cohrm/stats returns 401', async () => {
    const res = await request.get('/api/cohrm/stats');
    expect(res.status).toBe(401);
  });

  test('POST /api/cohrm/rumors/1/validate returns 401', async () => {
    const res = await request
      .post('/api/cohrm/rumors/1/validate')
      .send({ action_type: 'validate', status: 'validated' });
    expect(res.status).toBe(401);
  });

  test('POST /api/cohrm/rumors/1/risk-assessment returns 401', async () => {
    const res = await request
      .post('/api/cohrm/rumors/1/risk-assessment')
      .send({ risk_level: 'high' });
    expect(res.status).toBe(401);
  });

  test('POST /api/cohrm/rumors/1/notes returns 401', async () => {
    const res = await request
      .post('/api/cohrm/rumors/1/notes')
      .send({ content: 'Note test' });
    expect(res.status).toBe(401);
  });

  test('POST /api/cohrm/rumors/1/feedback returns 401', async () => {
    const res = await request
      .post('/api/cohrm/rumors/1/feedback')
      .send({ type: 'info', message: 'Test' });
    expect(res.status).toBe(401);
  });

  test('GET /api/cohrm/dashboard returns 401', async () => {
    const res = await request.get('/api/cohrm/dashboard');
    expect(res.status).toBe(401);
  });

  test('GET /api/cohrm/settings returns 401', async () => {
    const res = await request.get('/api/cohrm/settings');
    expect(res.status).toBe(401);
  });

  test('GET /api/cohrm/export returns 401', async () => {
    const res = await request.get('/api/cohrm/export');
    expect(res.status).toBe(401);
  });
});

// ============================================
// 404 FOR UNKNOWN ROUTES
// ============================================

describe('Unknown routes', () => {
  test('returns 404 for non-existent API route', async () => {
    const res = await request.get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
