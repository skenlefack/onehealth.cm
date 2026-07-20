/**
 * Tests for COHRM Notification Service
 * Tests email template generation, assignee logic, and notification types
 */

// Mock nodemailer before importing the service
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-msg-123' }),
  }),
}));

// Mock the database
jest.mock('../../config/db', () => {
  const mockQuery = jest.fn();
  return { query: mockQuery };
});

const db = require('../../config/db');

// Import the notification service (after mocks are set up)
const notificationService = require('../../services/cohrmNotificationService');

afterEach(() => {
  jest.clearAllMocks();
});

// ============================================
// EMAIL TEMPLATE GENERATION
// ============================================

describe('Email Templates', () => {
  const { emailTemplates } = notificationService;

  describe('newRumorAssigned', () => {
    test('generates subject with rumor code', () => {
      const result = emailTemplates.newRumorAssigned({
        userName: 'Jean Dupont',
        rumorCode: 'RUM-202607-0001',
        title: 'Cas suspects',
        category: 'human_health',
        location: 'Centre, Mfoundi',
        level: 1,
        rumorId: 1,
        adminUrl: 'http://localhost:3001',
      });
      expect(result.subject).toContain('RUM-202607-0001');
      expect(result.subject).toContain('[COHRM]');
    });

    test('includes user name in HTML body', () => {
      const result = emailTemplates.newRumorAssigned({
        userName: 'Jean Dupont',
        rumorCode: 'RUM-202607-0001',
        title: 'Test',
        category: 'human_health',
        location: 'Centre',
        level: 1,
        rumorId: 1,
        adminUrl: 'http://localhost:3001',
      });
      expect(result.html).toContain('Jean Dupont');
    });

    test('includes rumor details in HTML body', () => {
      const result = emailTemplates.newRumorAssigned({
        userName: 'Agent',
        rumorCode: 'RUM-202607-0042',
        title: 'Cholera au marche',
        category: 'human_health',
        location: 'Centre, Yaounde',
        level: 2,
        rumorId: 5,
        adminUrl: 'http://localhost:3001',
      });
      expect(result.html).toContain('RUM-202607-0042');
      expect(result.html).toContain('Cholera au marche');
      expect(result.html).toContain('Centre, Yaounde');
    });

    test('translates category to French', () => {
      const result = emailTemplates.newRumorAssigned({
        userName: 'Agent',
        rumorCode: 'RUM-1',
        title: 'Test',
        category: 'human_health',
        location: 'Test',
        level: 1,
        rumorId: 1,
        adminUrl: 'http://localhost:3001',
      });
      expect(result.html).toContain('Sant');
    });

    test('includes action link with admin URL', () => {
      const result = emailTemplates.newRumorAssigned({
        userName: 'Agent',
        rumorCode: 'RUM-1',
        title: 'Test',
        category: 'other',
        location: 'Test',
        level: 1,
        rumorId: 99,
        adminUrl: 'https://admin.onehealth.cm',
      });
      expect(result.html).toContain('https://admin.onehealth.cm/cohrm?tab=pending&id=99');
    });
  });

  describe('rumorEscalated', () => {
    test('generates escalation subject', () => {
      const result = emailTemplates.rumorEscalated({
        userName: 'Supervisor',
        rumorCode: 'RUM-202607-0005',
        title: 'Critical rumor',
        fromLevel: 1,
        toLevel: 2,
        escalatedBy: 'Agent X',
        escalationReason: 'High priority',
        rumorId: 5,
        adminUrl: 'http://localhost:3001',
      });
      expect(result.subject).toContain('escalad');
      expect(result.subject).toContain('RUM-202607-0005');
    });

    test('includes from and to levels', () => {
      const result = emailTemplates.rumorEscalated({
        userName: 'Supervisor',
        rumorCode: 'RUM-1',
        title: 'Test',
        fromLevel: 2,
        toLevel: 3,
        escalatedBy: 'Agent',
        escalationReason: 'Needs review',
        rumorId: 1,
        adminUrl: 'http://localhost:3001',
      });
      expect(result.html).toContain('2');
      expect(result.html).toContain('3');
    });
  });

  describe('rumorValidated', () => {
    test('generates validation subject', () => {
      const result = emailTemplates.rumorValidated({
        userName: 'Validator',
        rumorCode: 'RUM-202607-0010',
        title: 'Validated rumor',
        level: 2,
        currentLevel: 3,
        validatedBy: 'Admin',
        rumorId: 10,
        adminUrl: 'http://localhost:3001',
      });
      expect(result.subject).toContain('valid');
      expect(result.subject).toContain('RUM-202607-0010');
    });

    test('shows next level info when not at max', () => {
      const result = emailTemplates.rumorValidated({
        userName: 'Validator',
        rumorCode: 'RUM-1',
        title: 'Test',
        level: 2,
        currentLevel: 3,
        validatedBy: 'Admin',
        rumorId: 1,
        adminUrl: 'http://localhost:3001',
      });
      expect(result.html).toContain('niveau 4');
    });

    test('shows completion message at level 5', () => {
      const result = emailTemplates.rumorValidated({
        userName: 'Validator',
        rumorCode: 'RUM-1',
        title: 'Test',
        level: 4,
        currentLevel: 5,
        validatedBy: 'Admin',
        rumorId: 1,
        adminUrl: 'http://localhost:3001',
      });
      expect(result.html).toContain('tous les niveaux');
    });
  });

  describe('rumorRejected', () => {
    test('generates rejection subject', () => {
      const result = emailTemplates.rumorRejected({
        userName: 'Agent',
        rumorCode: 'RUM-202607-0003',
        title: 'False alarm',
        level: 2,
        rejectedBy: 'Supervisor',
        rejectionReason: 'No evidence',
        rumorId: 3,
        adminUrl: 'http://localhost:3001',
      });
      expect(result.subject).toContain('rejet');
      expect(result.html).toContain('No evidence');
    });
  });

  describe('riskAssessmentCompleted', () => {
    test('generates risk assessment subject with level', () => {
      const result = emailTemplates.riskAssessmentCompleted({
        userName: 'Manager',
        rumorCode: 'RUM-202607-0007',
        title: 'High risk rumor',
        riskLevel: 'high',
        riskDescription: 'Spreading fast',
        assessedBy: 'Expert',
        rumorId: 7,
        adminUrl: 'http://localhost:3001',
      });
      expect(result.subject).toContain('RUM-202607-0007');
      expect(result.subject).toContain('risque');
      expect(result.html).toContain('Spreading fast');
    });
  });

  describe('feedbackSent', () => {
    test('generates feedback template', () => {
      const result = emailTemplates.feedbackSent({
        rumorCode: 'RUM-202607-0001',
        feedbackType: 'Accusé de réception',
        message: 'Your report has been received.',
      });
      expect(result.subject).toContain('RUM-202607-0001');
      expect(result.html).toContain('Your report has been received.');
      expect(result.html).toContain('tro-information');
    });
  });
});

// ============================================
// getAssigneesToNotify LOGIC
// ============================================

describe('getAssigneesToNotify', () => {
  test('queries database with validation level', async () => {
    db.query.mockResolvedValueOnce([[
      { user_id: 1, email: 'agent@test.cm', first_name: 'Jean', last_name: 'Dupont', full_name: 'Jean Dupont' },
    ]]);

    const result = await notificationService.getAssigneesToNotify(1);
    expect(result).toHaveLength(1);
    expect(result[0].email).toBe('agent@test.cm');
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  test('filters by region when provided', async () => {
    db.query.mockResolvedValueOnce([[
      { user_id: 2, email: 'local@test.cm', first_name: 'Marie', last_name: 'Doe', full_name: 'Marie Doe' },
    ]]);

    const result = await notificationService.getAssigneesToNotify(2, 'CE');
    expect(result).toHaveLength(1);
    // Verify region parameter was passed
    const queryCall = db.query.mock.calls[0];
    expect(queryCall[1]).toContain('CE');
  });

  test('returns empty array on database error', async () => {
    db.query.mockRejectedValueOnce(new Error('Connection refused'));

    const result = await notificationService.getAssigneesToNotify(1);
    expect(result).toEqual([]);
  });

  test('passes notification type filter for email', async () => {
    db.query.mockResolvedValueOnce([[]]);

    await notificationService.getAssigneesToNotify(1, null, 'email');
    const query = db.query.mock.calls[0][0];
    expect(query).toContain('notify_email');
  });

  test('passes notification type filter for sms', async () => {
    db.query.mockResolvedValueOnce([[]]);

    await notificationService.getAssigneesToNotify(1, null, 'sms');
    const query = db.query.mock.calls[0][0];
    expect(query).toContain('notify_sms');
  });
});

// ============================================
// NOTIFICATION TYPE MAPPING
// ============================================

describe('Notification Types', () => {
  const NOTIFICATION_TYPES = [
    'new_rumor',
    'escalation',
    'validation',
    'rejection',
    'risk_assessment',
  ];

  const NOTIFICATION_FUNCTIONS = {
    new_rumor: 'notifyNewRumor',
    escalation: 'notifyEscalation',
    validation: 'notifyValidation',
    rejection: 'notifyRejection',
    risk_assessment: 'notifyRiskAssessment',
  };

  test('all notification types have corresponding functions', () => {
    for (const type of NOTIFICATION_TYPES) {
      const fnName = NOTIFICATION_FUNCTIONS[type];
      expect(typeof notificationService[fnName]).toBe('function');
    }
  });

  test('sendPendingReminders is exported', () => {
    expect(typeof notificationService.sendPendingReminders).toBe('function');
  });

  test('sendFeedbackEmail is exported', () => {
    expect(typeof notificationService.sendFeedbackEmail).toBe('function');
  });

  test('logNotification is exported', () => {
    expect(typeof notificationService.logNotification).toBe('function');
  });

  test('updateNotificationStatus is exported', () => {
    expect(typeof notificationService.updateNotificationStatus).toBe('function');
  });
});

// ============================================
// logNotification
// ============================================

describe('logNotification', () => {
  test('inserts notification record into database', async () => {
    db.query.mockResolvedValueOnce([{ insertId: 42 }]);

    const id = await notificationService.logNotification({
      rumorId: 1,
      userId: 5,
      notificationType: 'new_rumor',
      channel: 'email',
      recipientEmail: 'test@example.com',
      subject: 'Test notification',
    });

    expect(id).toBe(42);
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  test('returns null on database error', async () => {
    db.query.mockRejectedValueOnce(new Error('Table not found'));

    const id = await notificationService.logNotification({
      notificationType: 'test',
      channel: 'email',
      subject: 'Test',
    });

    expect(id).toBeNull();
  });
});
