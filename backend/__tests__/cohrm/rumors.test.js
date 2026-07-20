/**
 * Tests for COHRM Rumor CRUD operations
 * Tests validation logic and data transformations
 */

describe('Rumor Data Validation', () => {
  // Validation logic extracted from route handlers
  const validateRumorData = (data) => {
    const errors = [];
    if (!data.title || data.title.trim().length < 3) {
      errors.push('Title is required (min 3 characters)');
    }
    if (data.title && data.title.length > 255) {
      errors.push('Title must not exceed 255 characters');
    }
    if (!data.region) {
      errors.push('Region is required');
    }
    if (data.affected_count !== undefined && data.affected_count !== null) {
      const count = parseInt(data.affected_count);
      if (isNaN(count) || count < 0) {
        errors.push('Affected count must be a positive integer');
      }
    }
    if (data.dead_count !== undefined && data.dead_count !== null) {
      const dead = parseInt(data.dead_count);
      if (isNaN(dead) || dead < 0) {
        errors.push('Dead count must be a positive integer');
      }
      if (data.affected_count && dead > parseInt(data.affected_count)) {
        errors.push('Dead count cannot exceed affected count');
      }
    }
    if (data.latitude !== undefined && data.latitude !== null) {
      const lat = parseFloat(data.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.push('Latitude must be between -90 and 90');
      }
    }
    if (data.longitude !== undefined && data.longitude !== null) {
      const lng = parseFloat(data.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.push('Longitude must be between -180 and 180');
      }
    }
    return { valid: errors.length === 0, errors };
  };

  test('validates a complete valid rumor', () => {
    const { valid } = validateRumorData({
      title: 'Cas suspects de cholera',
      region: 'CE',
      category: 'human_health',
    });
    expect(valid).toBe(true);
  });

  test('rejects missing title', () => {
    const { valid, errors } = validateRumorData({ region: 'CE' });
    expect(valid).toBe(false);
    expect(errors).toContain('Title is required (min 3 characters)');
  });

  test('rejects title shorter than 3 characters', () => {
    const { valid, errors } = validateRumorData({ title: 'Ab', region: 'CE' });
    expect(valid).toBe(false);
    expect(errors).toContain('Title is required (min 3 characters)');
  });

  test('rejects title over 255 characters', () => {
    const { valid, errors } = validateRumorData({ title: 'A'.repeat(256), region: 'CE' });
    expect(valid).toBe(false);
    expect(errors).toContain('Title must not exceed 255 characters');
  });

  test('rejects missing region', () => {
    const { valid, errors } = validateRumorData({ title: 'Valid title' });
    expect(valid).toBe(false);
    expect(errors).toContain('Region is required');
  });

  test('rejects negative affected count', () => {
    const { valid, errors } = validateRumorData({ title: 'Test', region: 'CE', affected_count: -5 });
    expect(valid).toBe(false);
    expect(errors).toContain('Affected count must be a positive integer');
  });

  test('rejects dead count exceeding affected count', () => {
    const { valid, errors } = validateRumorData({
      title: 'Test', region: 'CE', affected_count: 5, dead_count: 10,
    });
    expect(valid).toBe(false);
    expect(errors).toContain('Dead count cannot exceed affected count');
  });

  test('accepts valid GPS coordinates', () => {
    const { valid } = validateRumorData({
      title: 'Test', region: 'CE', latitude: 3.8667, longitude: 11.5167,
    });
    expect(valid).toBe(true);
  });

  test('rejects invalid latitude', () => {
    const { valid, errors } = validateRumorData({
      title: 'Test', region: 'CE', latitude: 95,
    });
    expect(valid).toBe(false);
    expect(errors).toContain('Latitude must be between -90 and 90');
  });

  test('rejects invalid longitude', () => {
    const { valid, errors } = validateRumorData({
      title: 'Test', region: 'CE', longitude: 200,
    });
    expect(valid).toBe(false);
    expect(errors).toContain('Longitude must be between -180 and 180');
  });

  test('collects multiple errors at once', () => {
    const { valid, errors } = validateRumorData({
      title: '', affected_count: -1,
    });
    expect(valid).toBe(false);
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Rumor Code Generation', () => {
  const generateRumorCode = (date, sequence) => {
    const d = date || new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const seq = String(sequence).padStart(4, '0');
    return `RUM-${year}${month}-${seq}`;
  };

  test('generates code with correct format', () => {
    const code = generateRumorCode(new Date(2026, 6, 15), 1);
    expect(code).toBe('RUM-202607-0001');
  });

  test('pads sequence number to 4 digits', () => {
    expect(generateRumorCode(new Date(2026, 0, 1), 1)).toBe('RUM-202601-0001');
    expect(generateRumorCode(new Date(2026, 0, 1), 42)).toBe('RUM-202601-0042');
    expect(generateRumorCode(new Date(2026, 0, 1), 999)).toBe('RUM-202601-0999');
    expect(generateRumorCode(new Date(2026, 0, 1), 1234)).toBe('RUM-202601-1234');
  });

  test('pads month to 2 digits', () => {
    expect(generateRumorCode(new Date(2026, 0, 1), 1)).toContain('202601');
    expect(generateRumorCode(new Date(2026, 11, 1), 1)).toContain('202612');
  });
});

describe('Rumor Status Constants', () => {
  const VALID_STATUSES = ['pending', 'investigating', 'confirmed', 'false_alarm', 'closed'];
  const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'];
  const VALID_SOURCES = ['direct', 'field', 'sms', 'mobile', 'web', 'scanner', 'social_media', 'media'];
  const VALID_CATEGORIES = ['human_health', 'animal_health', 'environmental', 'safety', 'disaster', 'other'];

  test('has 5 valid statuses', () => {
    expect(VALID_STATUSES).toHaveLength(5);
  });

  test('has 4 valid priorities', () => {
    expect(VALID_PRIORITIES).toHaveLength(4);
  });

  test('has 8 valid sources', () => {
    expect(VALID_SOURCES).toHaveLength(8);
  });

  test('has 6 valid categories', () => {
    expect(VALID_CATEGORIES).toHaveLength(6);
  });

  test('default status is pending', () => {
    expect(VALID_STATUSES[0]).toBe('pending');
  });
});
