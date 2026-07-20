/**
 * Tests for COHRM utility functions
 * Tests formatters.js and validators.js
 */

// We test the pure logic - these functions don't depend on DOM or React
import {
  formatDate, formatDateTime, formatRelativeDate,
  formatStatus, formatPriority, formatRiskLevel, formatSource, formatCategory,
  formatRegion, formatLocation, formatValidationLevel,
  truncateText, formatNumber, formatPercent, formatDuration,
} from '../utils/formatters';

describe('Date Formatters', () => {
  test('formatDate returns formatted date for valid ISO string', () => {
    const result = formatDate('2026-07-15T10:30:00Z');
    expect(result).not.toBe('—');
    expect(typeof result).toBe('string');
  });

  test('formatDate returns dash for null/undefined', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate('')).toBe('—');
  });

  test('formatDate returns dash for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('—');
  });

  test('formatDateTime includes hours', () => {
    const result = formatDateTime('2026-07-15T10:30:00Z');
    expect(result).not.toBe('—');
  });

  test('formatRelativeDate returns relative time', () => {
    const now = new Date();
    const fiveMinAgo = new Date(now - 5 * 60 * 1000).toISOString();
    const result = formatRelativeDate(fiveMinAgo);
    expect(result).toContain('min');
  });

  test('formatRelativeDate returns instant for very recent', () => {
    const result = formatRelativeDate(new Date().toISOString());
    expect(result).toBe("A l'instant");
  });

  test('formatRelativeDate returns dash for null', () => {
    expect(formatRelativeDate(null)).toBe('—');
  });
});

describe('Status/Priority/Risk Formatters', () => {
  test('formatStatus returns correct label for known status', () => {
    expect(formatStatus('pending').label).toBe('En attente');
    expect(formatStatus('confirmed').label).toBe('Confirmee');
  });

  test('formatStatus returns fallback for unknown status', () => {
    expect(formatStatus('unknown_status').label).toBe('unknown_status');
  });

  test('formatStatus returns Inconnu for null', () => {
    expect(formatStatus(null).label).toBe('Inconnu');
  });

  test('formatPriority returns correct colors', () => {
    const low = formatPriority('low');
    expect(low.color).toBe('#27AE60');
    const critical = formatPriority('critical');
    expect(critical.color).toBe('#E74C3C');
  });

  test('formatRiskLevel handles all risk levels', () => {
    const levels = ['unknown', 'low', 'moderate', 'high', 'very_high'];
    for (const level of levels) {
      const result = formatRiskLevel(level);
      expect(result.label).toBeDefined();
      expect(result.color).toBeDefined();
    }
  });

  test('formatSource returns label for known sources', () => {
    expect(formatSource('sms').label).toBe('SMS');
    expect(formatSource('mobile').label).toBe('Application mobile');
  });

  test('formatCategory returns label and color', () => {
    const result = formatCategory('human_health');
    expect(result.label).toBe('Sante humaine');
    expect(result.color).toBe('#E74C3C');
  });
});

describe('Region Formatters', () => {
  test('formatRegion returns region info for valid code', () => {
    const result = formatRegion('CE');
    expect(result.name).toBe('Centre');
  });

  test('formatRegion returns region info for valid name', () => {
    const result = formatRegion('Centre');
    expect(result.name).toBe('Centre');
  });

  test('formatRegion returns code as name for unknown region', () => {
    const result = formatRegion('XX');
    expect(result.name).toBe('XX');
  });

  test('formatRegion returns Non definie for null', () => {
    expect(formatRegion(null).name).toBe('Non definie');
  });

  test('formatLocation joins parts with separator', () => {
    const result = formatLocation({ region: 'Centre', department: 'Mfoundi', district: 'Yaounde' });
    expect(result).toContain('Centre');
    expect(result).toContain('Mfoundi');
    expect(result).toContain('Yaounde');
  });

  test('formatLocation handles missing parts', () => {
    const result = formatLocation({ region: 'Centre' });
    expect(result).toBe('Centre');
  });

  test('formatLocation returns Non definie for empty', () => {
    expect(formatLocation({})).toBe('Non definie');
  });
});

describe('Text Formatters', () => {
  test('truncateText truncates long text', () => {
    const long = 'A'.repeat(150);
    const result = truncateText(long, 100);
    expect(result.length).toBeLessThanOrEqual(101); // 100 + ellipsis char
    expect(result).toContain('…');
  });

  test('truncateText returns short text unchanged', () => {
    expect(truncateText('Hello', 100)).toBe('Hello');
  });

  test('truncateText returns empty string for null', () => {
    expect(truncateText(null)).toBe('');
    expect(truncateText('')).toBe('');
  });

  test('formatNumber formats with French locale', () => {
    const result = formatNumber(1234567);
    expect(result).toBeDefined();
    expect(result).not.toBe('—');
  });

  test('formatNumber returns dash for null', () => {
    expect(formatNumber(null)).toBe('—');
  });

  test('formatPercent formats correctly', () => {
    expect(formatPercent(75.5, 1)).toBe('75.5%');
    expect(formatPercent(100, 0)).toBe('100%');
  });

  test('formatPercent returns dash for null', () => {
    expect(formatPercent(null)).toBe('—');
  });

  test('formatDuration formats minutes', () => {
    expect(formatDuration(30)).toBe('30 min');
    expect(formatDuration(90)).toBe('1h 30min');
    expect(formatDuration(60)).toBe('1h');
  });

  test('formatDuration returns dash for null', () => {
    expect(formatDuration(null)).toBe('—');
  });
});
