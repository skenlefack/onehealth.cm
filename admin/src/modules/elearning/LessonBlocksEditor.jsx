/**
 * Constructeur de leçon par blocs (leçons "multi-contenus").
 *
 * Une leçon = une liste ordonnée de blocs (texte, vidéo, PDF, PowerPoint, Word, Excel,
 * image, audio, intégration externe, fichiers, encadré, accordéon, question de contrôle,
 * séparateur). Le formateur ajoute, insère, duplique et réordonne les blocs
 * (glisser-déposer ou flèches) selon le déroulement pédagogique.
 */
import React, { useState, useRef } from 'react';
import {
  Type, Video, FileText, Presentation, FileSpreadsheet, Image as ImageIcon, Music, Code2,
  Paperclip, Info, List, HelpCircle, Minus, GripVertical, ChevronUp, ChevronDown, Copy,
  Trash2, Plus, Upload, Link, X, Loader, Maximize2, Minimize2, Lightbulb, AlertTriangle,
  Check, Clock, Layers
} from 'lucide-react';

// Même base d'API que le reste de l'admin (absolue en dev, '/api' derrière nginx en prod)
const API_BASE = process.env.REACT_APP_API_URL || '/api';
const FILES_ORIGIN = /^https?:\/\//.test(API_BASE) ? API_BASE.replace(/\/api\/?$/, '') : '';
const fileUrl = (url) => (url && url.startsWith('/uploads') ? `${FILES_ORIGIN}${url}` : url);

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const BLOCK_CATALOG = [
  { type: 'text', label: 'Texte', desc: 'Paragraphes, listes, tableaux', icon: Type, color: '#6366f1', data: () => ({ html: '' }) },
  { type: 'video', label: 'Vidéo', desc: 'Upload, YouTube ou Vimeo', icon: Video, color: '#ef4444', data: () => ({ url: '', provider: 'upload', source: 'upload' }) },
  { type: 'powerpoint', label: 'PowerPoint', desc: 'Présentation .ppt / .pptx', icon: Presentation, color: '#ea580c', data: () => ({ url: '', name: '', source: 'upload' }) },
  { type: 'pdf', label: 'PDF', desc: 'Document PDF consultable', icon: FileText, color: '#dc2626', data: () => ({ url: '', name: '', source: 'upload' }) },
  { type: 'word', label: 'Word', desc: 'Document .doc / .docx', icon: FileText, color: '#2563eb', data: () => ({ url: '', name: '', source: 'upload' }) },
  { type: 'excel', label: 'Excel', desc: 'Tableur .xls / .xlsx', icon: FileSpreadsheet, color: '#16a34a', data: () => ({ url: '', name: '', source: 'upload' }) },
  { type: 'image', label: 'Image', desc: 'Illustration, schéma, infographie', icon: ImageIcon, color: '#0891b2', data: () => ({ url: '', alt: '', caption: '' }) },
  { type: 'audio', label: 'Audio', desc: 'Podcast, témoignage + transcription', icon: Music, color: '#9333ea', data: () => ({ url: '', source: 'upload', transcript: '' }) },
  { type: 'embed', label: 'Intégration', desc: 'Genially, H5P, Google Slides, Canva…', icon: Code2, color: '#0d9488', data: () => ({ url: '', height: 480 }) },
  { type: 'files', label: 'Fichiers à télécharger', desc: 'Fiches, modèles, annexes', icon: Paperclip, color: '#64748b', data: () => ({ files: [] }) },
  { type: 'callout', label: 'Encadré', desc: 'À retenir, astuce, attention', icon: Info, color: '#f59e0b', data: () => ({ variant: 'info', html: '' }) },
  { type: 'accordion', label: 'Accordéon', desc: 'Sections dépliables (FAQ, détails)', icon: List, color: '#8b5cf6', data: () => ({ items: [{ title: '', html: '' }] }) },
  { type: 'knowledge_check', label: 'Question de contrôle', desc: 'Vérification rapide (non notée)', icon: HelpCircle, color: '#10b981', data: () => ({ question: '', options: [{ text: '', is_correct: true }, { text: '', is_correct: false }], explanation: '' }) },
  { type: 'divider', label: 'Séparateur', desc: 'Pause visuelle entre deux parties', icon: Minus, color: '#94a3b8', data: () => ({}) }
];

const catalogOf = (type) => BLOCK_CATALOG.find(b => b.type === type) || BLOCK_CATALOG[0];

export const createBlock = (type) => ({ id: newId(), type, title: '', data: catalogOf(type).data(), settings: {} });

const UPLOAD_ENDPOINTS = {
  video: { url: '/upload/elearning/video', accept: 'video/*', hint: 'MP4, WebM, MOV — max 500 Mo' },
  pdf: { url: '/upload/elearning/pdf', accept: 'application/pdf', hint: 'PDF — max 50 Mo' },
  powerpoint: { url: '/upload/elearning/powerpoint', accept: '.ppt,.pptx', hint: '.ppt, .pptx — max 100 Mo' },
  word: { url: '/upload/elearning/word', accept: '.doc,.docx', hint: '.doc, .docx — max 50 Mo' },
  excel: { url: '/upload/elearning/excel', accept: '.xls,.xlsx', hint: '.xls, .xlsx — max 50 Mo' },
  image: { url: '/upload/elearning/image', accept: 'image/*', hint: 'JPEG, PNG, GIF, WebP — max 10 Mo' },
  audio: { url: '/upload/elearning/audio', accept: 'audio/*', hint: 'MP3, WAV, OGG, M4A — max 100 Mo' },
  files: { url: '/upload/elearning/resource', accept: '', hint: 'PDF, Office, ZIP, images, audio — max 100 Mo' }
};

export const detectVideoProvider = (url) => {
  if (!url) return 'upload';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('vimeo.com')) return 'vimeo';
  if (url.startsWith('/uploads')) return 'upload';
  return 'other';
};

/** Convertit une ancienne leçon (champs video_url, pdf_url…) en blocs ordonnés. */
export const legacyLessonToBlocks = (lesson) => {
  if (!lesson) return [];
  const blocks = [];
  const add = (type, data, title = '') => blocks.push({ id: newId(), type, title, data: { ...catalogOf(type).data(), ...data }, settings: {} });
  if (lesson.video_url) add('video', { url: lesson.video_url, provider: lesson.video_provider || detectVideoProvider(lesson.video_url), source: lesson.video_url.startsWith('/uploads') ? 'upload' : 'url' });
  if (lesson.pptx_url) add('powerpoint', { url: lesson.pptx_url, source: lesson.pptx_url.startsWith('http') ? 'url' : 'upload' });
  if (lesson.pdf_url) add('pdf', { url: lesson.pdf_url });
  if (lesson.docx_url) add('word', { url: lesson.docx_url });
  if (lesson.xlsx_url) add('excel', { url: lesson.xlsx_url });
  if (lesson.content_fr && lesson.content_type !== 'interactive') add('text', { html: lesson.content_fr });
  return blocks;
};

/** Durée estimée : lecture ~200 mots/min, ~1 min par question / image. */
export const estimateBlocksMinutes = (blocks) => {
  const words = (html) => (html || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  let minutes = 0;
  for (const b of blocks) {
    const d = b.data || {};
    if (b.type === 'text' || b.type === 'callout') minutes += words(d.html) / 200;
    if (b.type === 'accordion') minutes += (d.items || []).reduce((n, i) => n + words(i.html), 0) / 200;
    if (b.type === 'knowledge_check' || b.type === 'image') minutes += 1;
    if (['pdf', 'powerpoint', 'word', 'excel', 'embed'].includes(b.type)) minutes += 5;
  }
  return Math.max(1, Math.round(minutes));
};

const fileNameFromUrl = (url) => decodeURIComponent((url || '').split('/').pop() || '').replace(/^[0-9a-f-]{36}-/i, '');

export default function LessonBlocksEditor({ blocks, onChange, token, isDark, colors, styles, RichTextEditor }) {
  const [collapsed, setCollapsed] = useState({});
  const [paletteAt, setPaletteAt] = useState(null); // index d'insertion, ou null
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const [handleArmed, setHandleArmed] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [outline, setOutline] = useState(false);
  // Incrémenté à chaque déplacement : force la ré-initialisation des éditeurs TinyMCE,
  // dont l'iframe se vide quand le DOM est déplacé.
  const [rev, setRev] = useState(0);

  const border = isDark ? '#334155' : '#e2e8f0';
  const muted = isDark ? '#94a3b8' : '#64748b';
  const panel = isDark ? '#0f172a' : '#f8fafc';

  // Toujours partir des blocs les plus récents (les uploads se terminent de façon asynchrone)
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;
  const update = (next) => { blocksRef.current = next; onChange(next); };
  const patchBlock = (idx, patch) => update(blocksRef.current.map((b, i) => (i === idx ? { ...b, ...patch } : b)));
  const patchData = (idx, patch) => update(blocksRef.current.map((b, i) => (i === idx ? { ...b, data: { ...b.data, ...patch } } : b)));
  const patchSettings = (idx, patch) => update(blocksRef.current.map((b, i) => (i === idx ? { ...b, settings: { ...(b.settings || {}), ...patch } } : b)));

  const insertBlock = (type, at) => {
    const block = createBlock(type);
    const next = [...blocks];
    next.splice(at, 0, block);
    update(next);
    setPaletteAt(null);
    setRev(r => r + 1);
  };
  const moveBlock = (from, to) => {
    if (to < 0 || to >= blocks.length || from === to) return;
    const next = [...blocks];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    update(next);
    setRev(r => r + 1);
  };
  const duplicateBlock = (idx) => {
    const copy = JSON.parse(JSON.stringify(blocks[idx]));
    copy.id = newId();
    copy.title = copy.title ? `${copy.title} (copie)` : '';
    const next = [...blocks];
    next.splice(idx + 1, 0, copy);
    update(next);
    setRev(r => r + 1);
  };
  const removeBlock = (idx) => {
    update(blocks.filter((_, i) => i !== idx));
    setPendingDelete(null);
    setRev(r => r + 1);
  };
  const setAllCollapsed = (value) => {
    const next = {};
    blocks.forEach(b => { next[b.id] = value; });
    setCollapsed(next);
  };

  // ---------- UI helpers ----------
  const miniBtn = {
    background: isDark ? '#1e293b' : '#fff', color: muted, border: `1px solid ${border}`,
    width: '30px', height: '30px', borderRadius: '8px', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0
  };
  const toggleBtn = (active) => ({
    ...styles.btnSecondary, flex: 1, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    background: active ? colors.primary : (isDark ? '#334155' : '#e2e8f0'),
    color: active ? '#fff' : muted, padding: '8px 12px', fontSize: '13px'
  });
  const smallInput = { ...styles.input, padding: '8px 12px', fontSize: '13px' };

  const InsertBar = ({ at }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0', opacity: paletteAt === at ? 1 : 0.55 }}>
      <div style={{ flex: 1, height: '1px', background: border }} />
      <button type="button" onClick={() => setPaletteAt(paletteAt === at ? null : at)}
        style={{ ...miniBtn, width: 'auto', padding: '0 10px', gap: '4px', fontSize: '12px', color: colors.primary, borderColor: colors.primary }}>
        <Plus size={14} /> Insérer ici
      </button>
      <div style={{ flex: 1, height: '1px', background: border }} />
    </div>
  );

  const Palette = ({ at }) => (
    <div style={{
      border: `2px dashed ${colors.primary}`, borderRadius: '12px', padding: '14px', margin: '8px 0',
      background: isDark ? '#0b1220' : '#f0f7ff'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <strong style={{ fontSize: '13px' }}>Choisir un type de contenu</strong>
        {blocks.length > 0 && (
          <button type="button" onClick={() => setPaletteAt(null)} style={miniBtn}><X size={14} /></button>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '8px' }}>
        {BLOCK_CATALOG.map(item => {
          const Icon = item.icon;
          return (
            <button key={item.type} type="button" onClick={() => insertBlock(item.type, at)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px', textAlign: 'left', padding: '10px',
                borderRadius: '10px', border: `1px solid ${border}`, background: isDark ? '#1e293b' : '#fff',
                cursor: 'pointer', color: 'inherit', fontFamily: 'inherit'
              }}>
              <span style={{
                width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                background: `${item.color}1f`, color: item.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}><Icon size={16} /></span>
              <span>
                <span style={{ display: 'block', fontSize: '13px', fontWeight: 600 }}>{item.label}</span>
                <span style={{ display: 'block', fontSize: '11px', color: muted, marginTop: '2px' }}>{item.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ---------- Block editors ----------
  const renderBody = (block, idx) => {
    const d = block.data || {};
    const s = block.settings || {};
    const editorKey = `${block.id}-${rev}`;

    switch (block.type) {
      case 'text':
        return <RichTextEditor key={editorKey} value={d.html} onChange={v => patchData(idx, { html: v })} placeholder="Rédigez le contenu de cette partie…" height={260} isDark={isDark} />;

      case 'video':
        return (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <button type="button" onClick={() => patchData(idx, { source: 'upload', url: '', provider: 'upload' })} style={toggleBtn(d.source !== 'url')}><Upload size={14} /> Fichier vidéo</button>
              <button type="button" onClick={() => patchData(idx, { source: 'url', url: '', provider: 'other' })} style={toggleBtn(d.source === 'url')}><Link size={14} /> YouTube / Vimeo / URL</button>
            </div>
            {d.source === 'url' ? (
              <>
                <input type="url" style={smallInput} value={d.url} placeholder="https://www.youtube.com/watch?v=…"
                  onChange={e => patchData(idx, { url: e.target.value, provider: detectVideoProvider(e.target.value) })} />
                {d.url && <p style={{ margin: '6px 0 0', fontSize: '12px', color: muted }}>
                  {d.provider === 'youtube' ? 'YouTube détecté' : d.provider === 'vimeo' ? 'Vimeo détecté' : 'Lien vidéo direct'}
                </p>}
              </>
            ) : (
              <FileSlot type="video" url={d.url} token={token} colors={colors} isDark={isDark}
                onUploaded={(f) => patchData(idx, { url: f.url, provider: 'upload', name: f.name })}
                onClear={() => patchData(idx, { url: '' })} />
            )}
          </div>
        );

      case 'pdf':
      case 'powerpoint':
      case 'word':
      case 'excel': {
        const allowUrl = block.type === 'powerpoint' || block.type === 'pdf';
        return (
          <div>
            {allowUrl && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <button type="button" onClick={() => patchData(idx, { source: 'upload', url: '' })} style={toggleBtn(d.source !== 'url')}><Upload size={14} /> Uploader</button>
                <button type="button" onClick={() => patchData(idx, { source: 'url', url: '' })} style={toggleBtn(d.source === 'url')}><Link size={14} /> URL externe</button>
              </div>
            )}
            {d.source === 'url' && allowUrl ? (
              <input type="url" style={smallInput} value={d.url} placeholder="https://exemple.org/document"
                onChange={e => patchData(idx, { url: e.target.value })} />
            ) : (
              <FileSlot type={block.type} url={d.url} name={d.name} token={token} colors={colors} isDark={isDark}
                onUploaded={(f) => patchData(idx, { url: f.url, name: f.name })}
                onClear={() => patchData(idx, { url: '', name: '' })} />
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" checked={s.downloadable !== false} onChange={e => patchSettings(idx, { downloadable: e.target.checked })} />
              Autoriser le téléchargement par l'apprenant
            </label>
          </div>
        );
      }

      case 'image':
        return (
          <div>
            <FileSlot type="image" url={d.url} token={token} colors={colors} isDark={isDark} preview
              onUploaded={(f) => patchData(idx, { url: f.url })}
              onClear={() => patchData(idx, { url: '' })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
              <input style={smallInput} value={d.caption} placeholder="Légende (optionnel)" onChange={e => patchData(idx, { caption: e.target.value })} />
              <input style={smallInput} value={d.alt} placeholder="Texte alternatif (accessibilité)" onChange={e => patchData(idx, { alt: e.target.value })} />
            </div>
          </div>
        );

      case 'audio':
        return (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <button type="button" onClick={() => patchData(idx, { source: 'upload', url: '' })} style={toggleBtn(d.source !== 'url')}><Upload size={14} /> Fichier audio</button>
              <button type="button" onClick={() => patchData(idx, { source: 'url', url: '' })} style={toggleBtn(d.source === 'url')}><Link size={14} /> URL</button>
            </div>
            {d.source === 'url' ? (
              <input type="url" style={smallInput} value={d.url} placeholder="https://…/podcast.mp3" onChange={e => patchData(idx, { url: e.target.value })} />
            ) : (
              <FileSlot type="audio" url={d.url} name={d.name} token={token} colors={colors} isDark={isDark}
                onUploaded={(f) => patchData(idx, { url: f.url, name: f.name })}
                onClear={() => patchData(idx, { url: '' })} />
            )}
            <textarea style={{ ...smallInput, minHeight: '70px', marginTop: '10px', resize: 'vertical' }} value={d.transcript}
              placeholder="Transcription (recommandée pour l'accessibilité et les connexions lentes)"
              onChange={e => patchData(idx, { transcript: e.target.value })} />
          </div>
        );

      case 'embed':
        return (
          <div>
            <input type="url" style={smallInput} value={d.url}
              placeholder="Lien d'intégration : Genially, H5P, Google Slides (Publier sur le web), Canva, Padlet, Sketchfab…"
              onChange={e => patchData(idx, { url: e.target.value })} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <label style={{ fontSize: '13px', color: muted }}>Hauteur (px)</label>
              <input type="number" min="200" max="1200" step="20" style={{ ...smallInput, width: '110px' }} value={d.height || 480}
                onChange={e => patchData(idx, { height: parseInt(e.target.value) || 480 })} />
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '11px', color: muted }}>
              Seuls les liens https sont acceptés. Utilisez le lien « intégrer / embed » fourni par l'outil.
            </p>
          </div>
        );

      case 'files':
        return (
          <div>
            {(d.files || []).map((f, fi) => (
              <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Paperclip size={14} color={muted} />
                <input style={{ ...smallInput, flex: 1 }} value={f.name}
                  onChange={e => patchData(idx, { files: d.files.map((x, i) => (i === fi ? { ...x, name: e.target.value } : x)) })} />
                <button type="button" style={miniBtn} title="Retirer" onClick={() => patchData(idx, { files: d.files.filter((_, i) => i !== fi) })}><X size={14} /></button>
              </div>
            ))}
            <FileSlot type="files" token={token} colors={colors} isDark={isDark} multiple
              onUploaded={(f) => update(prevAppendFile(blocksRef.current, idx, f))} />
          </div>
        );

      case 'callout':
        return (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              {[
                { v: 'info', label: 'À retenir', icon: Info, c: '#2563eb' },
                { v: 'tip', label: 'Astuce', icon: Lightbulb, c: '#16a34a' },
                { v: 'warning', label: 'Attention', icon: AlertTriangle, c: '#d97706' },
                { v: 'important', label: 'Important', icon: AlertTriangle, c: '#dc2626' }
              ].map(opt => {
                const Icon = opt.icon;
                const active = (d.variant || 'info') === opt.v;
                return (
                  <button key={opt.v} type="button" onClick={() => patchData(idx, { variant: opt.v })}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px',
                      border: `1px solid ${active ? opt.c : border}`, background: active ? `${opt.c}1f` : 'transparent',
                      color: active ? opt.c : muted, cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit'
                    }}><Icon size={13} /> {opt.label}</button>
                );
              })}
            </div>
            <RichTextEditor key={editorKey} value={d.html} onChange={v => patchData(idx, { html: v })} placeholder="Message de l'encadré…" height={160} isDark={isDark} />
          </div>
        );

      case 'accordion':
        return (
          <div>
            {(d.items || []).map((item, ii) => (
              <div key={ii} style={{ border: `1px solid ${border}`, borderRadius: '10px', padding: '10px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input style={{ ...smallInput, flex: 1 }} value={item.title} placeholder={`Titre de la section ${ii + 1}`}
                    onChange={e => patchData(idx, { items: d.items.map((x, i) => (i === ii ? { ...x, title: e.target.value } : x)) })} />
                  <button type="button" style={miniBtn} disabled={ii === 0} title="Monter"
                    onClick={() => { const it = [...d.items];[it[ii - 1], it[ii]] = [it[ii], it[ii - 1]]; patchData(idx, { items: it }); setRev(r => r + 1); }}><ChevronUp size={14} /></button>
                  <button type="button" style={miniBtn} disabled={ii === d.items.length - 1} title="Descendre"
                    onClick={() => { const it = [...d.items];[it[ii + 1], it[ii]] = [it[ii], it[ii + 1]]; patchData(idx, { items: it }); setRev(r => r + 1); }}><ChevronDown size={14} /></button>
                  {d.items.length > 1 && (
                    <button type="button" style={miniBtn} title="Retirer" onClick={() => { patchData(idx, { items: d.items.filter((_, i) => i !== ii) }); setRev(r => r + 1); }}><X size={14} /></button>
                  )}
                </div>
                <RichTextEditor key={`${editorKey}-${ii}`} value={item.html} height={140} isDark={isDark} placeholder="Contenu de la section…"
                  onChange={v => update(prevPatchAccordion(blocksRef.current, idx, ii, v))} />
              </div>
            ))}
            <button type="button" onClick={() => patchData(idx, { items: [...(d.items || []), { title: '', html: '' }] })}
              style={{ ...styles.btnSecondary, fontSize: '12px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} /> Ajouter une section
            </button>
          </div>
        );

      case 'knowledge_check':
        return (
          <div>
            <textarea style={{ ...smallInput, minHeight: '60px', resize: 'vertical', marginBottom: '10px' }} value={d.question}
              placeholder="Question posée à l'apprenant…" onChange={e => patchData(idx, { question: e.target.value })} />
            <p style={{ margin: '0 0 6px', fontSize: '12px', color: muted }}>Cochez la ou les bonnes réponses :</p>
            {(d.options || []).map((opt, oi) => (
              <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <input type="checkbox" checked={!!opt.is_correct}
                  onChange={e => patchData(idx, { options: d.options.map((x, i) => (i === oi ? { ...x, is_correct: e.target.checked } : x)) })} />
                <input style={{ ...smallInput, flex: 1 }} value={opt.text} placeholder={`Réponse ${oi + 1}`}
                  onChange={e => patchData(idx, { options: d.options.map((x, i) => (i === oi ? { ...x, text: e.target.value } : x)) })} />
                {d.options.length > 2 && (
                  <button type="button" style={miniBtn} onClick={() => patchData(idx, { options: d.options.filter((_, i) => i !== oi) })}><X size={14} /></button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => patchData(idx, { options: [...(d.options || []), { text: '', is_correct: false }] })}
              style={{ ...styles.btnSecondary, fontSize: '12px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Plus size={14} /> Ajouter une réponse
            </button>
            <textarea style={{ ...smallInput, minHeight: '50px', resize: 'vertical' }} value={d.explanation}
              placeholder="Explication affichée après la réponse (optionnel)" onChange={e => patchData(idx, { explanation: e.target.value })} />
          </div>
        );

      case 'divider':
        return <p style={{ margin: 0, fontSize: '12px', color: muted }}>Une ligne de séparation sera affichée. Le titre (optionnel) sert d'intertitre de partie.</p>;

      default:
        return null;
    }
  };

  const summaryOf = (block) => {
    const d = block.data || {};
    if (d.url) return d.name || fileNameFromUrl(d.url);
    if (block.type === 'text' || block.type === 'callout') return (d.html || '').replace(/<[^>]+>/g, ' ').trim().slice(0, 80) || 'Vide';
    if (block.type === 'files') return `${(d.files || []).length} fichier(s)`;
    if (block.type === 'accordion') return `${(d.items || []).length} section(s)`;
    if (block.type === 'knowledge_check') return d.question || 'Question à rédiger';
    if (block.type === 'divider') return '';
    return 'Contenu à ajouter';
  };

  const isEmpty = (block) => {
    const d = block.data || {};
    if (['video', 'pdf', 'powerpoint', 'word', 'excel', 'image', 'audio', 'embed'].includes(block.type)) return !d.url;
    if (block.type === 'text' || block.type === 'callout') return !(d.html || '').replace(/<[^>]+>/g, '').trim();
    if (block.type === 'files') return !(d.files || []).length;
    if (block.type === 'knowledge_check') return !d.question;
    return false;
  };

  // ---------- Render ----------
  return (
    <div>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '12px',
        padding: '10px 12px', borderRadius: '10px', background: panel, border: `1px solid ${border}`
      }}>
        <Layers size={16} color={colors.primary} />
        <span style={{ fontSize: '13px', fontWeight: 600 }}>
          {blocks.length} bloc{blocks.length > 1 ? 's' : ''}
        </span>
        {blocks.length > 0 && (
          <span style={{ fontSize: '12px', color: muted, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> ~{estimateBlocksMinutes(blocks)} min estimées
          </span>
        )}
        <div style={{ flex: 1 }} />
        {blocks.length > 1 && (
          <>
            <button type="button" onClick={() => setOutline(o => !o)}
              style={{ ...styles.btnSecondary, fontSize: '12px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: outline ? colors.primary : undefined, color: outline ? '#fff' : undefined }}>
              <List size={14} /> {outline ? 'Quitter le mode plan' : 'Mode plan (réorganiser)'}
            </button>
            {!outline && (
              <>
                <button type="button" onClick={() => setAllCollapsed(true)} style={{ ...styles.btnSecondary, fontSize: '12px', padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Minimize2 size={13} /> Tout replier
                </button>
                <button type="button" onClick={() => setAllCollapsed(false)} style={{ ...styles.btnSecondary, fontSize: '12px', padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Maximize2 size={13} /> Tout déplier
                </button>
              </>
            )}
          </>
        )}
      </div>

      {blocks.length === 0 && <Palette at={0} />}

      {blocks.map((block, idx) => {
        const info = catalogOf(block.type);
        const Icon = info.icon;
        const isCollapsed = outline || !!collapsed[block.id];
        const isOver = overIndex === idx && dragIndex !== null && dragIndex !== idx;
        const empty = isEmpty(block);

        return (
          <React.Fragment key={block.id}>
            {!outline && idx > 0 && <InsertBar at={idx} />}
            {!outline && paletteAt === idx && idx > 0 && <Palette at={idx} />}
            <div
              draggable={handleArmed === block.id}
              onDragStart={(e) => { setDragIndex(idx); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', block.id); }}
              onDragOver={(e) => { if (dragIndex === null) return; e.preventDefault(); if (overIndex !== idx) setOverIndex(idx); }}
              onDrop={(e) => { e.preventDefault(); if (dragIndex !== null) moveBlock(dragIndex, idx); setDragIndex(null); setOverIndex(null); setHandleArmed(null); }}
              onDragEnd={() => { setDragIndex(null); setOverIndex(null); setHandleArmed(null); }}
              style={{
                border: `2px solid ${isOver ? colors.primary : border}`,
                borderLeft: `4px solid ${info.color}`,
                borderRadius: '12px', background: isDark ? '#111827' : '#fff',
                marginBottom: outline ? '6px' : 0,
                opacity: dragIndex === idx ? 0.45 : 1,
                boxShadow: isOver ? `0 0 0 3px ${colors.primary}33` : 'none',
                transition: 'box-shadow .15s, border-color .15s'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderBottom: isCollapsed ? 'none' : `1px solid ${border}` }}>
                <span
                  title="Glisser pour déplacer"
                  onMouseDown={() => setHandleArmed(block.id)}
                  onMouseUp={() => setHandleArmed(null)}
                  style={{ cursor: 'grab', color: muted, display: 'flex', padding: '4px' }}
                ><GripVertical size={18} /></span>
                <span style={{
                  minWidth: '24px', height: '24px', borderRadius: '6px', background: `${info.color}1f`, color: info.color,
                  fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{idx + 1}</span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '14px',
                  background: `${info.color}1f`, color: info.color, fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap'
                }}><Icon size={12} /> {info.label}</span>
                {outline ? (
                  <span style={{ flex: 1, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <strong>{block.title || ''}</strong>
                    <span style={{ color: muted, marginLeft: block.title ? '8px' : 0 }}>{summaryOf(block)}</span>
                  </span>
                ) : (
                  <input style={{ ...smallInput, flex: 1, minWidth: '120px' }} value={block.title}
                    placeholder="Titre de la partie (affiché dans le plan de la leçon)"
                    onChange={e => patchBlock(idx, { title: e.target.value })} />
                )}
                {empty && !outline && <span title="Bloc incomplet" style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors.warning, flexShrink: 0 }} />}
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  <button type="button" style={miniBtn} title="Monter" disabled={idx === 0} onClick={() => moveBlock(idx, idx - 1)}><ChevronUp size={14} /></button>
                  <button type="button" style={miniBtn} title="Descendre" disabled={idx === blocks.length - 1} onClick={() => moveBlock(idx, idx + 1)}><ChevronDown size={14} /></button>
                  {!outline && (
                    <>
                      <button type="button" style={miniBtn} title="Dupliquer" onClick={() => duplicateBlock(idx)}><Copy size={14} /></button>
                      <button type="button" style={miniBtn} title={isCollapsed ? 'Déplier' : 'Replier'}
                        onClick={() => setCollapsed(c => ({ ...c, [block.id]: !c[block.id] }))}>
                        {isCollapsed ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
                      </button>
                      {pendingDelete === block.id ? (
                        <button type="button" onClick={() => removeBlock(idx)}
                          style={{ ...miniBtn, width: 'auto', padding: '0 10px', background: colors.error, color: '#fff', borderColor: colors.error, fontSize: '12px', gap: '4px' }}>
                          <Check size={13} /> Confirmer
                        </button>
                      ) : (
                        <button type="button" style={{ ...miniBtn, color: colors.error }} title="Supprimer"
                          onClick={() => { setPendingDelete(block.id); setTimeout(() => setPendingDelete(p => (p === block.id ? null : p)), 4000); }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Body */}
              {!isCollapsed && <div style={{ padding: '12px' }}>{renderBody(block, idx)}</div>}
              {isCollapsed && !outline && (
                <div style={{ padding: '0 12px 10px 52px', fontSize: '12px', color: muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {summaryOf(block)}
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}

      {blocks.length > 0 && !outline && (
        paletteAt === blocks.length ? <Palette at={blocks.length} /> : (
          <button type="button" onClick={() => setPaletteAt(blocks.length)}
            style={{
              width: '100%', marginTop: '12px', padding: '14px', borderRadius: '12px',
              border: `2px dashed ${colors.primary}`, background: 'transparent', color: colors.primary,
              cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
            <Plus size={16} /> Ajouter un bloc à la fin
          </button>
        )
      )}

      {outline && (
        <p style={{ fontSize: '12px', color: muted, marginTop: '8px' }}>
          Glissez les blocs par la poignée <GripVertical size={12} style={{ verticalAlign: 'middle' }} /> ou utilisez les flèches pour définir l'ordre de progression.
        </p>
      )}
    </div>
  );
}

const prevAppendFile = (blocks, idx, f) => blocks.map((b, i) => (i === idx
  ? { ...b, data: { ...b.data, files: [...(b.data.files || []), { name: f.name, url: f.url, size: f.size }] } }
  : b));

const prevPatchAccordion = (blocks, idx, itemIdx, html) => blocks.map((b, i) => (i === idx
  ? { ...b, data: { ...b.data, items: b.data.items.map((it, j) => (j === itemIdx ? { ...it, html } : it)) } }
  : b));

/** Zone d'upload avec barre de progression (XHR) et aperçu du fichier courant. */
function FileSlot({ type, url, name, token, colors, isDark, onUploaded, onClear, preview, multiple }) {
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const cfg = UPLOAD_ENDPOINTS[type];
  const border = isDark ? '#334155' : '#e2e8f0';
  const muted = isDark ? '#94a3b8' : '#64748b';

  const uploadOne = (file) => new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append('file', file);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => {
      let res = null;
      try { res = JSON.parse(xhr.responseText); } catch (e) { /* ignore */ }
      if (xhr.status >= 200 && xhr.status < 300 && res?.success) {
        onUploaded({ url: res.data.url, name: res.data.originalName || file.name, size: res.data.size || file.size });
      } else {
        setError(res?.message || 'Échec de l\'upload');
      }
      resolve();
    };
    xhr.onerror = () => { setError('Erreur réseau pendant l\'upload'); resolve(); };
    xhr.open('POST', `${API_BASE}${cfg.url}`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(fd);
  });

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setError('');
    for (const file of files) {
      setProgress(0);
      // eslint-disable-next-line no-await-in-loop
      await uploadOne(file);
    }
    setProgress(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  if (url && !multiple) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: isDark ? '#0f172a' : '#f0fdf4', borderRadius: '10px', border: `1px solid ${border}` }}>
        {preview ? (
          <img src={fileUrl(url)} alt="" style={{ width: '80px', height: '56px', objectFit: 'cover', borderRadius: '6px' }} />
        ) : (
          <Check size={18} color={colors.success} />
        )}
        <span style={{ flex: 1, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name || fileNameFromUrl(url)}</span>
        <button type="button" onClick={onClear} title="Remplacer"
          style={{ background: 'transparent', border: `1px solid ${border}`, borderRadius: '8px', width: '28px', height: '28px', cursor: 'pointer', color: muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => progress === null && inputRef.current?.click()}
        onDragOver={(e) => { if (e.dataTransfer?.types?.includes('Files')) e.preventDefault(); }}
        onDrop={(e) => { if (e.dataTransfer?.files?.length) { e.preventDefault(); e.stopPropagation(); handleFiles(multiple ? e.dataTransfer.files : [e.dataTransfer.files[0]]); } }}
        style={{
          padding: '18px', borderRadius: '10px', textAlign: 'center',
          border: `2px ${progress !== null ? 'solid' : 'dashed'} ${progress !== null ? colors.primary : border}`,
          cursor: progress !== null ? 'wait' : 'pointer'
        }}>
        {progress !== null ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px' }}>
              <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Upload en cours… {progress}%
            </div>
            <div style={{ height: '6px', background: border, borderRadius: '3px', marginTop: '10px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: colors.primary, transition: 'width .2s' }} />
            </div>
          </>
        ) : (
          <>
            <Upload size={22} color={muted} />
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: muted }}>
              {multiple ? 'Cliquer ou déposer un ou plusieurs fichiers' : 'Cliquer ou déposer un fichier'}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: muted }}>{cfg.hint}</p>
          </>
        )}
      </div>
      {error && <p style={{ margin: '6px 0 0', fontSize: '12px', color: colors.error }}>{error}</p>}
      <input ref={inputRef} type="file" accept={cfg.accept || undefined} multiple={!!multiple} style={{ display: 'none' }}
        onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}
