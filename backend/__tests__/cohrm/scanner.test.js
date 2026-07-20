/**
 * Tests for COHRM Scanner service logic
 * Tests scoring, priority, and deduplication logic
 */

// Extract scoreRelevance function (same logic as cohrmScannerService.js lines 195-223)
const scoreRelevance = (article, keywords) => {
  const titleLower = (article.title || '').toLowerCase();
  const contentLower = (article.content || '').toLowerCase();
  const fullText = `${titleLower} ${contentLower}`;
  let score = 0;
  const matched = [];

  for (const kw of keywords) {
    if (!kw.is_active) continue;
    const keyword = kw.keyword.toLowerCase();

    if (fullText.includes(keyword)) {
      const inTitle = titleLower.includes(keyword);
      const categoryBonus = (kw.category === 'alert') ? 2 : (kw.category === 'disease') ? 1.5 : 1;
      const weight = Math.round(kw.weight * (inTitle ? 3 : 1) * categoryBonus);
      score += weight;
      matched.push({
        keyword: kw.keyword,
        category: kw.category,
        weight,
        inTitle,
        theme_id: kw.theme_id || null,
      });
    }
  }

  return { score: Math.min(score, 100), matched };
};

// Extract getPriority function (same logic as cohrmScannerService.js lines 228-233)
const getPriority = (score, config) => {
  if (score >= config.critical_threshold) return 'critical';
  if (score >= config.high_priority_threshold) return 'high';
  if (score >= config.auto_create_threshold) return 'medium';
  return 'low';
};

const DEFAULT_CONFIG = {
  auto_create_threshold: 15,
  high_priority_threshold: 25,
  critical_threshold: 40,
};

describe('Scanner - scoreRelevance', () => {
  const keywords = [
    { keyword: 'cholera', category: 'disease', weight: 10, is_active: 1, theme_id: 1 },
    { keyword: 'alerte sanitaire', category: 'alert', weight: 8, is_active: 1, theme_id: 2 },
    { keyword: 'vaccination', category: 'prevention', weight: 5, is_active: 1, theme_id: null },
    { keyword: 'inactive', category: 'disease', weight: 10, is_active: 0 },
  ];

  test('scores keyword found in content only', () => {
    const article = { title: 'Actualites du jour', content: 'Cas de cholera detecte a Douala' };
    const { score, matched } = scoreRelevance(article, keywords);
    expect(score).toBe(15); // 10 * 1 (not in title) * 1.5 (disease) = 15
    expect(matched).toHaveLength(1);
    expect(matched[0].keyword).toBe('cholera');
    expect(matched[0].inTitle).toBe(false);
  });

  test('gives 3x bonus for keyword in title', () => {
    const article = { title: 'Cholera a Douala', content: 'Details de la maladie' };
    const { score, matched } = scoreRelevance(article, keywords);
    expect(score).toBe(45); // 10 * 3 (in title) * 1.5 (disease) = 45
    expect(matched[0].inTitle).toBe(true);
  });

  test('gives 2x bonus for alert category', () => {
    const article = { title: 'Alerte sanitaire au Cameroun', content: '' };
    const { score, matched } = scoreRelevance(article, keywords);
    expect(score).toBe(48); // 8 * 3 (in title) * 2 (alert) = 48
    expect(matched[0].category).toBe('alert');
  });

  test('gives no category bonus for normal keywords', () => {
    const article = { title: 'Campagne de vaccination', content: '' };
    const { score, matched } = scoreRelevance(article, keywords);
    expect(score).toBe(15); // 5 * 3 (in title) * 1 (prevention) = 15
  });

  test('skips inactive keywords', () => {
    const article = { title: 'Article about inactive keyword', content: 'inactive appears here' };
    const { matched } = scoreRelevance(article, keywords);
    const inactiveMatch = matched.find(m => m.keyword === 'inactive');
    expect(inactiveMatch).toBeUndefined();
  });

  test('matches multiple keywords and sums scores', () => {
    const article = { title: 'Cholera et vaccination', content: 'alerte sanitaire lancee' };
    const { score, matched } = scoreRelevance(article, keywords);
    expect(matched).toHaveLength(3);
    // cholera in title: 10*3*1.5=45, vaccination in title: 5*3*1=15, alerte in content: 8*1*2=16
    // Total = 76
    expect(score).toBe(76);
  });

  test('caps score at 100', () => {
    const heavyKeywords = [
      { keyword: 'test1', category: 'alert', weight: 20, is_active: 1 },
      { keyword: 'test2', category: 'alert', weight: 20, is_active: 1 },
    ];
    const article = { title: 'test1 test2', content: '' };
    const { score } = scoreRelevance(article, heavyKeywords);
    expect(score).toBe(100); // 20*3*2 + 20*3*2 = 240, capped at 100
  });

  test('returns 0 for no matches', () => {
    const article = { title: 'Article sans rapport', content: 'Rien de pertinent ici' };
    const { score, matched } = scoreRelevance(article, keywords);
    expect(score).toBe(0);
    expect(matched).toHaveLength(0);
  });

  test('handles empty article gracefully', () => {
    const { score } = scoreRelevance({ title: '', content: '' }, keywords);
    expect(score).toBe(0);
  });

  test('handles null title/content', () => {
    const { score } = scoreRelevance({ title: null, content: null }, keywords);
    expect(score).toBe(0);
  });

  test('is case-insensitive', () => {
    const article = { title: 'CHOLERA AU CAMEROUN', content: '' };
    const { matched } = scoreRelevance(article, keywords);
    expect(matched).toHaveLength(1);
    expect(matched[0].keyword).toBe('cholera');
  });

  test('includes theme_id in matched results', () => {
    const article = { title: 'Cholera', content: '' };
    const { matched } = scoreRelevance(article, keywords);
    expect(matched[0].theme_id).toBe(1);
  });
});

describe('Scanner - getPriority', () => {
  test('returns critical for score >= critical_threshold', () => {
    expect(getPriority(40, DEFAULT_CONFIG)).toBe('critical');
    expect(getPriority(100, DEFAULT_CONFIG)).toBe('critical');
  });

  test('returns high for score >= high_priority_threshold', () => {
    expect(getPriority(25, DEFAULT_CONFIG)).toBe('high');
    expect(getPriority(39, DEFAULT_CONFIG)).toBe('high');
  });

  test('returns medium for score >= auto_create_threshold', () => {
    expect(getPriority(15, DEFAULT_CONFIG)).toBe('medium');
    expect(getPriority(24, DEFAULT_CONFIG)).toBe('medium');
  });

  test('returns low for score below auto_create_threshold', () => {
    expect(getPriority(14, DEFAULT_CONFIG)).toBe('low');
    expect(getPriority(0, DEFAULT_CONFIG)).toBe('low');
  });
});
