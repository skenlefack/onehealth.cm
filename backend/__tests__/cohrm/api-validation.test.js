/**
 * Tests for API endpoint request validation
 * Verifies that endpoints correctly validate incoming request bodies
 */

// Mock the database
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

jest.mock('../../services/cohrmSocketService', () => ({
  initialize: jest.fn(),
  emitRumorUpdate: jest.fn(),
  emitNotification: jest.fn(),
}));

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

jest.mock('../../lib/migrationRunner', () => ({
  runMigrations: jest.fn().mockResolvedValue({ applied: 0, total: 0, warnings: [] }),
}));

jest.mock('../../services/smsService', () => ({
  sendSMS: jest.fn().mockResolvedValue({ success: true }),
  smsTemplates: {},
}));

jest.mock('../../services/pushService', () => ({
  registerDeviceToken: jest.fn().mockResolvedValue(),
  unregisterDeviceToken: jest.fn().mockResolvedValue(),
}));

const supertest = require('supertest');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');
const express = require('express');
const cors = require('cors');
const compression = require('compression');

const JWT_SECRET = 'test-secret-key';

function createTestApp() {
  const app = express();
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use('/api/cohrm', require('../../routes/cohrm'));
  app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });
  return app;
}

let app;
let request;
let authToken;

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET;
  app = createTestApp();
  request = supertest(app);
  authToken = jwt.sign({ id: 1 }, JWT_SECRET, { expiresIn: '1h' });
});

afterEach(() => {
  jest.clearAllMocks();
});

// Helper: mock auth middleware DB queries
function mockAuthUser(overrides = {}) {
  const user = {
    id: 1,
    username: 'testuser',
    email: 'test@test.cm',
    role: 'admin',
    status: 'active',
    first_name: 'Test',
    last_name: 'User',
    ...overrides,
  };

  // First call: user lookup
  db.query.mockResolvedValueOnce([[user]]);
  // Second call: permissions lookup
  db.query.mockResolvedValueOnce([[{ slug: 'cohrm_manage' }]]);
}

// ============================================
// POST /rumors - Validation
// ============================================

describe('POST /api/cohrm/rumors - Validation', () => {
  test('requires title field', async () => {
    mockAuthUser();

    const res = await request
      .post('/api/cohrm/rumors')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ region: 'CE' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Titre');
  });

  test('requires region field', async () => {
    mockAuthUser();

    const res = await request
      .post('/api/cohrm/rumors')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Test rumor title' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('gion');
  });

  test('accepts valid rumor with title and region', async () => {
    mockAuthUser();
    // INSERT rumor
    db.query.mockResolvedValueOnce([{ insertId: 1 }]);
    // INSERT history
    db.query.mockResolvedValueOnce([{ insertId: 1 }]);

    const res = await request
      .post('/api/cohrm/rumors')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Cas suspects de cholera', region: 'CE' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toBeDefined();
  });
});

// ============================================
// POST /rumors/:id/notes - Validation
// ============================================

describe('POST /api/cohrm/rumors/:id/notes - Validation', () => {
  test('requires content field', async () => {
    mockAuthUser();

    const res = await request
      .post('/api/cohrm/rumors/1/notes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('requis');
  });

  test('accepts valid note with content', async () => {
    mockAuthUser();
    db.query.mockResolvedValueOnce([{ insertId: 1 }]);

    const res = await request
      .post('/api/cohrm/rumors/1/notes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: 'This is a note about the rumor.' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

// ============================================
// POST /rumors/:id/feedback - Validation
// ============================================

describe('POST /api/cohrm/rumors/:id/feedback - Validation', () => {
  test('requires recipient_type, feedback_type, and message', async () => {
    mockAuthUser();

    const res = await request
      .post('/api/cohrm/rumors/1/feedback')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('rejects when missing feedback_type', async () => {
    mockAuthUser();

    const res = await request
      .post('/api/cohrm/rumors/1/feedback')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ recipient_type: 'reporter', message: 'Info received' });

    expect(res.status).toBe(400);
  });

  test('rejects when missing message', async () => {
    mockAuthUser();

    const res = await request
      .post('/api/cohrm/rumors/1/feedback')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ recipient_type: 'reporter', feedback_type: 'acknowledgment' });

    expect(res.status).toBe(400);
  });

  test('accepts valid feedback', async () => {
    mockAuthUser();
    // INSERT feedback
    db.query.mockResolvedValueOnce([{ insertId: 1 }]);

    const res = await request
      .post('/api/cohrm/rumors/1/feedback')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        recipient_type: 'reporter',
        feedback_type: 'acknowledgment',
        message: 'Votre signalement a ete recu.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

// ============================================
// POST /mobile/report - Validation (no auth)
// ============================================

describe('POST /api/cohrm/mobile/report - Validation', () => {
  test('rejects empty body', async () => {
    const res = await request
      .post('/api/cohrm/mobile/report')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('rejects when only title provided (no region)', async () => {
    const res = await request
      .post('/api/cohrm/mobile/report')
      .send({ title: 'Test Report' });

    expect(res.status).toBe(400);
  });

  test('rejects when only region provided (no title)', async () => {
    const res = await request
      .post('/api/cohrm/mobile/report')
      .send({ region: 'CE' });

    expect(res.status).toBe(400);
  });
});

// ============================================
// POST /mobile/sms - Validation (no auth)
// ============================================

describe('POST /api/cohrm/mobile/sms - Validation', () => {
  test('rejects missing text field', async () => {
    const res = await request
      .post('/api/cohrm/mobile/sms')
      .send({ from: '+237612345678' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ============================================
// QUERY PARAMETER PARSING for GET /rumors
// ============================================

describe('GET /api/cohrm/rumors - Query parameters', () => {
  test('returns 401 without auth token', async () => {
    const res = await request.get('/api/cohrm/rumors?status=pending&page=1&limit=10');
    expect(res.status).toBe(401);
  });

  test('accepts filter parameters with auth', async () => {
    mockAuthUser();
    // Count query
    db.query.mockResolvedValueOnce([[{ total: 0 }]]);
    // Data query
    db.query.mockResolvedValueOnce([[]]);

    const res = await request
      .get('/api/cohrm/rumors?status=pending&region=CE&priority=high&page=1&limit=10')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ============================================
// POST /decode-sms - Validation
// ============================================

describe('POST /api/cohrm/decode-sms - Validation', () => {
  test('returns 401 without auth', async () => {
    const res = await request
      .post('/api/cohrm/decode-sms')
      .send({ text: 'MAL*YAOUNDE*FI*HUM' });

    expect(res.status).toBe(401);
  });
});
