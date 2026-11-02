/**
 * Blocs de contenu des leçons e-learning.
 *
 * Une leçon "mixed" contient un tableau ordonné de blocs :
 *   { id, type, title, data: {...}, settings: { downloadable, collapsed } }
 * L'ordre du tableau = l'ordre pédagogique affiché à l'apprenant.
 */

const BLOCK_TYPES = [
  'text', 'video', 'pdf', 'powerpoint', 'word', 'excel',
  'image', 'audio', 'embed', 'files', 'callout', 'accordion',
  'knowledge_check', 'divider'
];

const MAX_BLOCKS = 100;

const parseJson = (value, fallback) => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch (e) {
    return fallback;
  }
};

const isSafeUrl = (url) =>
  typeof url === 'string' && (url.startsWith('/uploads/') || /^https?:\/\//i.test(url));

const makeId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// Garde uniquement les types connus, assure un id unique et des URL sûres.
const normalizeBlocks = (input) => {
  const blocks = parseJson(input, []);
  if (!Array.isArray(blocks)) return [];

  const seen = new Set();
  return blocks
    .filter(b => b && BLOCK_TYPES.includes(b.type))
    .slice(0, MAX_BLOCKS)
    .map(b => {
      let id = typeof b.id === 'string' && b.id ? b.id.slice(0, 40) : makeId();
      if (seen.has(id)) id = makeId();
      seen.add(id);

      const data = b.data && typeof b.data === 'object' ? { ...b.data } : {};
      if (data.url !== undefined && data.url !== '' && !isSafeUrl(data.url)) data.url = '';
      if (Array.isArray(data.files)) {
        data.files = data.files.filter(f => f && isSafeUrl(f.url));
      }

      return {
        id,
        type: b.type,
        title: typeof b.title === 'string' ? b.title.slice(0, 255) : '',
        data,
        settings: b.settings && typeof b.settings === 'object' ? b.settings : {}
      };
    });
};

const escapeHtml = (s) => String(s || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const TYPE_LABELS = {
  video: 'Vidéo', pdf: 'Document PDF', powerpoint: 'Présentation PowerPoint',
  word: 'Document Word', excel: 'Fichier Excel', audio: 'Audio', embed: 'Contenu intégré'
};

// Version HTML simple, stockée dans content_fr, pour les clients qui ne lisent pas
// encore les blocs (applications mobiles, anciens écrans).
const blocksToFallbackHtml = (blocks) => {
  const parts = [];
  for (const b of blocks) {
    const d = b.data || {};
    const heading = b.title ? `<h3>${escapeHtml(b.title)}</h3>` : '';
    switch (b.type) {
      case 'text':
        parts.push(heading + (d.html || ''));
        break;
      case 'callout':
        parts.push(`<blockquote>${heading}${d.html || ''}</blockquote>`);
        break;
      case 'accordion':
        parts.push(heading + (d.items || []).map(i =>
          `<h4>${escapeHtml(i.title)}</h4>${i.html || ''}`).join(''));
        break;
      case 'image':
        if (d.url) parts.push(`${heading}<p><img src="${escapeHtml(d.url)}" alt="${escapeHtml(d.alt || d.caption || '')}" /></p>${d.caption ? `<p><em>${escapeHtml(d.caption)}</em></p>` : ''}`);
        break;
      case 'files':
        if ((d.files || []).length) {
          parts.push(heading + '<ul>' + d.files.map(f =>
            `<li><a href="${escapeHtml(f.url)}">${escapeHtml(f.name || f.url)}</a></li>`).join('') + '</ul>');
        }
        break;
      case 'knowledge_check':
        if (d.question) parts.push(`${heading}<p><strong>${escapeHtml(d.question)}</strong></p>`);
        break;
      case 'divider':
        parts.push('<hr />');
        break;
      default:
        if (d.url) {
          parts.push(`${heading}<p><a href="${escapeHtml(d.url)}">${escapeHtml(d.name || TYPE_LABELS[b.type] || d.url)}</a></p>`);
        }
    }
  }
  return parts.join('\n');
};

module.exports = { BLOCK_TYPES, parseJson, normalizeBlocks, blocksToFallbackHtml };
