/**
 * SMSManager - Page de gestion SMS du module COHRM
 *
 * 3 onglets :
 *   1. Decodeur SMS interactif (terminal-style)
 *   2. Gestion des codes SMS (CRUD par categorie)
 *   3. Journal des SMS recus (logs, filtres, stats)
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  MessageCircle, Terminal, Hash, FileText,
  Play, RotateCcw, Plus, Trash2, Edit3, Check, X,
  Search, Filter, ChevronDown, ChevronRight, ExternalLink,
  AlertTriangle, CheckCircle, XCircle, Info, Copy,
  Zap, Send, ArrowRight, Clock, Phone, TrendingUp,
  HelpCircle, BookOpen, RefreshCw, Download
} from 'lucide-react';
import { toast } from 'react-toastify';
import { decodeSMS, getSMSCodes, createSMSCode, deleteSMSCode, getSMSLogs } from '../services/cohrmApi';
import { usePermissions } from '../hooks/usePermissions';
import useCohrmStore from '../stores/cohrmStore';
import {
  COHRM_COLORS,
  SYMPTOM_CODES,
  SPECIES_CODES,
  EVENT_CODES,
} from '../utils/constants';

// ============================================
// CONSTANTES LOCALES
// ============================================

const SEGMENT_COLORS = {
  event:    { bg: '#1e3a5f', text: '#60a5fa', border: '#3b82f6', label: 'CODE' },
  location: { bg: '#14532d', text: '#4ade80', border: '#22c55e', label: 'LOCALITE' },
  symptoms: { bg: '#7c2d12', text: '#fb923c', border: '#f97316', label: 'SYMPTOMES' },
  species:  { bg: '#4a1d96', text: '#c084fc', border: '#a855f7', label: 'ESPECE' },
  count:    { bg: '#7f1d1d', text: '#f87171', border: '#ef4444', label: 'NOMBRE' },
  details:  { bg: '#374151', text: '#9ca3af', border: '#6b7280', label: 'DETAILS' },
};

const SMS_EXAMPLES = [
  { sms: 'MAL*DOUALA*FI,VO,DI*HUM*15*Cas groupes quartier Akwa', desc: 'Maladie suspecte - cas humains a Douala' },
  { sms: 'MOR*GAROUA*MO*BOV*23*Mortalite bovine village Tchollire', desc: 'Mortalite anormale bovine a Garoua' },
  { sms: 'EPI*YAOUNDE*FI,TO,RE*HUM*120*Epidemie grippe marche Mokolo', desc: 'Epidemie suspectee a Yaounde' },
  { sms: 'ZOO*MAROUA*FI,HE*SAU*8*Chauves-souris trouvees mortes', desc: 'Zoonose suspectee avec faune sauvage' },
  { sms: 'INT*BERTOUA*VO,DI*HUM*6*Intoxication alimentaire restaurant', desc: 'Intoxication alimentaire a Bertoua' },
];

const TYPING_SPEED = 25;

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const SMSManager = ({ isDark, user }) => {
  const [activeTab, setActiveTab] = useState('decoder');
  const { canEdit, isAdmin } = usePermissions(user);

  const tabs = [
    { id: 'decoder',  label: 'Decodeur SMS',    icon: Terminal,      desc: 'Decoder et tester les SMS' },
    { id: 'codes',    label: 'Codes SMS',        icon: Hash,          desc: 'Gerer les codes' },
    { id: 'logs',     label: 'Journal SMS',      icon: FileText,      desc: 'Historique des SMS' },
  ];

  // ============================================
  // STYLES
  // ============================================

  const s = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    headerIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      background: `linear-gradient(135deg, ${COHRM_COLORS.primaryLight}, ${COHRM_COLORS.primary})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 800,
      color: isDark ? '#e2e8f0' : '#1f2937',
      letterSpacing: '-0.02em',
    },
    headerSub: {
      fontSize: 13,
      color: isDark ? COHRM_COLORS.darkMuted : '#6B7280',
      marginTop: 2,
    },
    tabBar: {
      display: 'flex',
      gap: 4,
      padding: 4,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(15,23,42,0.6)' : '#f3f4f6',
      marginBottom: 24,
    },
    tab: (active) => ({
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: '10px 16px',
      borderRadius: 10,
      border: 'none',
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: active ? 700 : 500,
      color: active
        ? '#fff'
        : isDark ? COHRM_COLORS.darkMuted : '#6B7280',
      backgroundColor: active
        ? COHRM_COLORS.primaryLight
        : 'transparent',
      transition: 'all 0.2s ease',
    }),
    card: {
      padding: 24,
      borderRadius: 16,
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
    },
  };

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.headerIcon}>
            <MessageCircle size={22} color="#fff" />
          </div>
          <div>
            <div style={s.headerTitle}>Gestionnaire SMS</div>
            <div style={s.headerSub}>Decoder, gerer les codes et consulter le journal SMS</div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={s.tabBar}>
        {tabs.map(t => (
          <button
            key={t.id}
            style={s.tab(activeTab === t.id)}
            onClick={() => setActiveTab(t.id)}
            onMouseEnter={e => { if (activeTab !== t.id) e.currentTarget.style.backgroundColor = isDark ? 'rgba(41,128,185,0.15)' : 'rgba(41,128,185,0.08)'; }}
            onMouseLeave={e => { if (activeTab !== t.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'decoder' && <DecoderTab isDark={isDark} user={user} />}
      {activeTab === 'codes'   && <CodesTab isDark={isDark} user={user} canEdit={canEdit('sms')} isAdmin={isAdmin} />}
      {activeTab === 'logs'    && <LogsTab isDark={isDark} user={user} />}
    </div>
  );
};

// ============================================
// ONGLET 1 - DECODEUR SMS INTERACTIF
// ============================================

const DecoderTab = ({ isDark, user }) => {
  const [smsText, setSmsText] = useState('');
  const [decoding, setDecoding] = useState(false);
  const [decoded, setDecoded] = useState(null);
  const [error, setError] = useState(null);
  const [typingText, setTypingText] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const textareaRef = useRef(null);
  const { setActivePage } = useCohrmStore();

  // Typing animation when filling an example
  const typeExample = useCallback((text) => {
    setSmsText('');
    setDecoded(null);
    setError(null);
    let i = 0;
    const interval = setInterval(() => {
      setSmsText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, TYPING_SPEED);
  }, []);

  // Client-side decode for real-time preview
  const localDecode = useMemo(() => {
    if (!smsText.trim()) return null;
    const parts = smsText.split('*');
    if (parts.length < 4) return null;

    const eventCode = parts[0]?.toUpperCase().trim();
    const location  = parts[1]?.trim();
    const sympStr   = parts[2]?.trim();
    const specCode  = parts[3]?.toUpperCase().trim();
    const count     = parts[4]?.trim();
    const details   = parts[5]?.trim() || '';

    const symptoms = sympStr ? sympStr.split(',').map(c => c.toUpperCase().trim()) : [];

    return {
      segments: [
        { key: 'event',    raw: eventCode, decoded: EVENT_CODES[eventCode]?.label || null, valid: !!EVENT_CODES[eventCode] },
        { key: 'location', raw: location,  decoded: location, valid: !!location },
        { key: 'symptoms', raw: sympStr,   decoded: symptoms.map(c => SYMPTOM_CODES[c]?.label || c).join(', '), valid: symptoms.some(c => SYMPTOM_CODES[c]) },
        { key: 'species',  raw: specCode,  decoded: SPECIES_CODES[specCode]?.label || null, valid: !!SPECIES_CODES[specCode] },
        { key: 'count',    raw: count,     decoded: count ? `${count} cas` : null, valid: count && !isNaN(parseInt(count)) },
        { key: 'details',  raw: details,   decoded: details || '(aucun detail)', valid: true },
      ],
      allValid: !!EVENT_CODES[eventCode] && !!location && symptoms.some(c => SYMPTOM_CODES[c]) && !!SPECIES_CODES[specCode],
    };
  }, [smsText]);

  // Server-side decode
  const handleDecode = useCallback(async () => {
    if (!smsText.trim()) return;
    setDecoding(true);
    setDecoded(null);
    setError(null);

    // Fake delay for typing effect
    await new Promise(r => setTimeout(r, 600));

    try {
      const result = await decodeSMS(smsText.trim());
      setDecoded(result.data);
      toast.success('SMS decode avec succes');
    } catch (err) {
      setError(err.message || 'Erreur de decodage');
      toast.error('Echec du decodage');
    } finally {
      setDecoding(false);
    }
  }, [smsText]);

  const handleCreateRumor = useCallback(() => {
    setActivePage('rumor-create', { smsData: decoded, fromSms: true });
  }, [decoded, setActivePage]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(smsText);
    toast.info('SMS copie');
  }, [smsText]);

  // Styles
  const s = {
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 24,
    },
    leftCol: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    },
    rightCol: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    },
    terminalCard: {
      borderRadius: 16,
      overflow: 'hidden',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #d1d5db',
      backgroundColor: isDark ? '#0c1222' : '#1a1a2e',
    },
    terminalHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 16px',
      backgroundColor: isDark ? '#0a0f1a' : '#16162a',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    terminalDots: {
      display: 'flex',
      gap: 6,
    },
    dot: (c) => ({
      width: 10,
      height: 10,
      borderRadius: '50%',
      backgroundColor: c,
    }),
    terminalTitle: {
      fontSize: 12,
      color: '#94a3b8',
      fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
    },
    textarea: {
      width: '100%',
      minHeight: 120,
      padding: '16px 20px',
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none',
      color: '#22d3ee',
      fontSize: 16,
      fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace',
      letterSpacing: '0.5px',
      lineHeight: 1.6,
      resize: 'vertical',
      caretColor: '#22d3ee',
    },
    terminalFooter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 16px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    },
    charCount: {
      fontSize: 11,
      color: '#64748b',
      fontFamily: 'monospace',
    },
    btnRow: {
      display: 'flex',
      gap: 8,
    },
    btnDecode: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 24px',
      borderRadius: 10,
      border: 'none',
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 700,
      color: '#fff',
      background: `linear-gradient(135deg, #22d3ee, ${COHRM_COLORS.primaryLight})`,
      transition: 'all 0.2s ease',
      opacity: decoding ? 0.7 : 1,
    },
    btnSecondary: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '10px 16px',
      borderRadius: 10,
      border: isDark ? '1px solid #334155' : '1px solid #d1d5db',
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 600,
      color: isDark ? '#94a3b8' : '#6b7280',
      backgroundColor: 'transparent',
      transition: 'all 0.2s ease',
    },
    btnSuccess: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 20px',
      borderRadius: 10,
      border: 'none',
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 700,
      color: '#fff',
      background: `linear-gradient(135deg, #22c55e, #16a34a)`,
      transition: 'all 0.2s ease',
    },
    // Decode results
    resultCard: {
      borderRadius: 16,
      padding: 20,
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #e5e7eb',
    },
    resultTitle: {
      fontSize: 14,
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#1f2937',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    segmentRow: {
      display: 'flex',
      alignItems: 'stretch',
      gap: 8,
      marginBottom: 10,
    },
    segmentBadge: (color) => ({
      minWidth: 90,
      padding: '6px 10px',
      borderRadius: 8,
      backgroundColor: color.bg,
      border: `1px solid ${color.border}30`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    segmentLabel: (color) => ({
      fontSize: 9,
      fontWeight: 700,
      color: color.text,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      marginBottom: 2,
    }),
    segmentCode: (color) => ({
      fontSize: 15,
      fontWeight: 800,
      color: color.text,
      fontFamily: 'monospace',
    }),
    segmentMeaning: {
      flex: 1,
      padding: '6px 12px',
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(15,23,42,0.5)' : '#f9fafb',
      border: isDark ? '1px solid #1e293b' : '1px solid #f3f4f6',
      display: 'flex',
      alignItems: 'center',
      fontSize: 13,
      color: isDark ? '#cbd5e1' : '#374151',
    },
    segmentError: {
      flex: 1,
      padding: '6px 12px',
      borderRadius: 8,
      backgroundColor: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 12,
      color: '#ef4444',
    },
    // Examples
    examplesCard: {
      borderRadius: 16,
      padding: 20,
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #e5e7eb',
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#1f2937',
      marginBottom: 12,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    exampleItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 14px',
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(15,23,42,0.4)' : '#f9fafb',
      border: isDark ? '1px solid #1e293b' : '1px solid #f3f4f6',
      marginBottom: 6,
      cursor: 'pointer',
      transition: 'all 0.15s ease',
    },
    exampleSms: {
      fontSize: 12,
      fontFamily: 'monospace',
      color: '#22d3ee',
      fontWeight: 600,
      wordBreak: 'break-all',
    },
    exampleDesc: {
      fontSize: 11,
      color: isDark ? '#94a3b8' : '#9ca3af',
      marginTop: 2,
    },
    // Error display
    errorBox: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.2)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
    },
    errorText: {
      fontSize: 13,
      color: '#ef4444',
      fontWeight: 500,
    },
    // Help table
    helpTable: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 12,
    },
    helpTh: {
      padding: '8px 12px',
      textAlign: 'left',
      fontSize: 11,
      fontWeight: 700,
      color: isDark ? '#94a3b8' : '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #e5e7eb',
    },
    helpTd: {
      padding: '8px 12px',
      color: isDark ? '#cbd5e1' : '#374151',
      borderBottom: isDark ? '1px solid #1e293b' : '1px solid #f3f4f6',
    },
    helpCode: {
      fontFamily: 'monospace',
      fontWeight: 700,
      color: '#22d3ee',
    },
  };

  return (
    <div style={s.grid}>
      {/* ===== LEFT COLUMN: Terminal + Actions ===== */}
      <div style={s.leftCol}>
        {/* Terminal Card */}
        <div style={s.terminalCard}>
          <div style={s.terminalHeader}>
            <div style={s.terminalDots}>
              <div style={s.dot('#ef4444')} />
              <div style={s.dot('#eab308')} />
              <div style={s.dot('#22c55e')} />
            </div>
            <div style={s.terminalTitle}>sms-decoder v1.0</div>
            <button onClick={handleCopy} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} title="Copier">
              <Copy size={14} color="#64748b" />
            </button>
          </div>
          <textarea
            ref={textareaRef}
            value={smsText}
            onChange={e => { setSmsText(e.target.value); setDecoded(null); setError(null); }}
            placeholder="Saisir le SMS ici... ex: MAL*DOUALA*FI,VO*HUM*10*Details"
            style={s.textarea}
            spellCheck={false}
          />
          <div style={s.terminalFooter}>
            <div style={s.charCount}>{smsText.length} chars | {smsText.split('*').length} segments</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                style={s.btnSecondary}
                onClick={() => { setSmsText(''); setDecoded(null); setError(null); }}
              >
                <RotateCcw size={14} /> Effacer
              </button>
              <button
                style={s.btnDecode}
                onClick={handleDecode}
                disabled={decoding || !smsText.trim()}
              >
                {decoding ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={14} />}
                {decoding ? 'Decodage...' : 'Decoder'}
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Preview */}
        {localDecode && !decoded && !error && (
          <div style={s.resultCard}>
            <div style={s.resultTitle}>
              <Search size={16} color={COHRM_COLORS.primaryLight} />
              Apercu en temps reel
            </div>
            {localDecode.segments.map(seg => {
              const color = SEGMENT_COLORS[seg.key];
              return (
                <div key={seg.key} style={s.segmentRow}>
                  <div style={s.segmentBadge(color)}>
                    <div style={s.segmentLabel(color)}>{color.label}</div>
                    <div style={s.segmentCode(color)}>{seg.raw || '?'}</div>
                  </div>
                  {seg.valid ? (
                    <div style={s.segmentMeaning}>
                      <CheckCircle size={14} color="#22c55e" style={{ marginRight: 8, flexShrink: 0 }} />
                      {seg.decoded}
                    </div>
                  ) : (
                    <div style={s.segmentError}>
                      <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                      Code non reconnu : "{seg.raw}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Server decode result */}
        {decoded && (
          <div style={s.resultCard}>
            <div style={s.resultTitle}>
              <CheckCircle size={16} color="#22c55e" />
              Decodage reussi
            </div>
            {[
              { key: 'event',    raw: smsText.split('*')[0], decoded: decoded.event_type },
              { key: 'location', raw: smsText.split('*')[1], decoded: decoded.location },
              { key: 'symptoms', raw: smsText.split('*')[2], decoded: decoded.symptoms },
              { key: 'species',  raw: smsText.split('*')[3], decoded: decoded.species },
              { key: 'count',    raw: smsText.split('*')[4], decoded: decoded.affected_count ? `${decoded.affected_count} cas` : '-' },
              { key: 'details',  raw: smsText.split('*')[5], decoded: decoded.details || '(aucun)' },
            ].map(seg => {
              const color = SEGMENT_COLORS[seg.key];
              return (
                <div key={seg.key} style={s.segmentRow}>
                  <div style={s.segmentBadge(color)}>
                    <div style={s.segmentLabel(color)}>{color.label}</div>
                    <div style={s.segmentCode(color)}>{seg.raw || '-'}</div>
                  </div>
                  <div style={s.segmentMeaning}>
                    <CheckCircle size={14} color="#22c55e" style={{ marginRight: 8, flexShrink: 0 }} />
                    {seg.decoded}
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: 16 }}>
              <button
                style={s.btnSuccess}
                onClick={handleCreateRumor}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(34,197,94,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <Send size={14} />
                Creer la rumeur a partir de ce SMS
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div style={s.errorBox}>
            <XCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={s.errorText}>{error}</div>
              <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#9ca3af', marginTop: 4 }}>
                Format attendu : <span style={{ fontFamily: 'monospace', color: '#22d3ee' }}>CODE*LOCALITE*SYMPTOMES*ESPECE*NOMBRE*DETAILS</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== RIGHT COLUMN: Examples + Help ===== */}
      <div style={s.rightCol}>
        {/* Examples */}
        <div style={s.examplesCard}>
          <div style={s.sectionTitle}>
            <BookOpen size={16} color={COHRM_COLORS.primaryLight} />
            Exemples de SMS
          </div>
          {SMS_EXAMPLES.map((ex, i) => (
            <div
              key={i}
              style={s.exampleItem}
              onClick={() => typeExample(ex.sms)}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(34,211,238,0.06)' : 'rgba(34,211,238,0.04)'; e.currentTarget.style.borderColor = '#22d3ee30'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(15,23,42,0.4)' : '#f9fafb'; e.currentTarget.style.borderColor = isDark ? '#1e293b' : '#f3f4f6'; }}
            >
              <Play size={14} color="#22d3ee" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={s.exampleSms}>{ex.sms}</div>
                <div style={s.exampleDesc}>{ex.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Help table */}
        <div style={s.examplesCard}>
          <div
            style={{ ...s.sectionTitle, cursor: 'pointer', userSelect: 'none' }}
            onClick={() => setShowHelp(!showHelp)}
          >
            <HelpCircle size={16} color={COHRM_COLORS.primaryLight} />
            Aide au format SMS
            {showHelp ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>

          {showHelp && (
            <>
              {/* Format */}
              <div style={{
                padding: '10px 14px',
                borderRadius: 10,
                backgroundColor: isDark ? 'rgba(34,211,238,0.06)' : 'rgba(34,211,238,0.04)',
                border: '1px solid rgba(34,211,238,0.15)',
                marginBottom: 16,
                fontFamily: 'monospace',
                fontSize: 13,
                color: '#22d3ee',
                textAlign: 'center',
                letterSpacing: '0.5px',
              }}>
                CODE * LOCALITE * SYMPTOMES * ESPECE * NOMBRE * DETAILS
              </div>

              <table style={s.helpTable}>
                <thead>
                  <tr>
                    <th style={s.helpTh}>Segment</th>
                    <th style={s.helpTh}>Description</th>
                    <th style={s.helpTh}>Exemple</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['CODE', 'Type d\'evenement (3 lettres)', 'MAL, MOR, EPI...'],
                    ['LOCALITE', 'Lieu du signalement', 'DOUALA, YAOUNDE...'],
                    ['SYMPTOMES', 'Codes symptomes separes par ","', 'FI,VO,DI'],
                    ['ESPECE', 'Code espece (3 lettres)', 'HUM, BOV, VOL...'],
                    ['NOMBRE', 'Nombre de cas affectes', '15'],
                    ['DETAILS', 'Description libre (optionnel)', 'Cas groupes...'],
                  ].map(([seg, desc, ex], i) => (
                    <tr key={i}>
                      <td style={{ ...s.helpTd, ...s.helpCode }}>{seg}</td>
                      <td style={s.helpTd}>{desc}</td>
                      <td style={{ ...s.helpTd, fontFamily: 'monospace', fontSize: 11, color: isDark ? '#94a3b8' : '#6b7280' }}>{ex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Quick reference: codes */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#94a3b8' : '#6b7280', marginBottom: 8 }}>
                  Codes Evenements
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {Object.entries(EVENT_CODES).map(([code, info]) => (
                    <span key={code} style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      backgroundColor: SEGMENT_COLORS.event.bg,
                      color: SEGMENT_COLORS.event.text,
                      fontSize: 11,
                      fontFamily: 'monospace',
                      fontWeight: 600,
                    }}>
                      {code} = {info.label}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#94a3b8' : '#6b7280', marginBottom: 8 }}>
                  Codes Symptomes
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {Object.entries(SYMPTOM_CODES).map(([code, info]) => (
                    <span key={code} style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      backgroundColor: SEGMENT_COLORS.symptoms.bg,
                      color: SEGMENT_COLORS.symptoms.text,
                      fontSize: 11,
                      fontFamily: 'monospace',
                      fontWeight: 600,
                    }}>
                      {code} = {info.label}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#94a3b8' : '#6b7280', marginBottom: 8 }}>
                  Codes Especes
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {Object.entries(SPECIES_CODES).map(([code, info]) => (
                    <span key={code} style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      backgroundColor: SEGMENT_COLORS.species.bg,
                      color: SEGMENT_COLORS.species.text,
                      fontSize: 11,
                      fontFamily: 'monospace',
                      fontWeight: 600,
                    }}>
                      {code} = {info.label}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Keyframes for spin animation */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// ============================================
// ONGLET 2 - GESTION DES CODES SMS
// ============================================

const CodesTab = ({ isDark, user, canEdit, isAdmin }) => {
  const [codes, setCodes] = useState({ event: [], symptom: [], species: [] });
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState('symptom');
  const [showModal, setShowModal] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({ code: '', label_fr: '', label_en: '', category: 'symptom', description: '' });

  const loadCodes = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSMSCodes();
      setCodes(result.data || { event: [], symptom: [], species: [] });
    } catch (err) {
      toast.error('Erreur chargement des codes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCodes(); }, [loadCodes]);

  const handleCreate = useCallback(async () => {
    if (!formData.code || !formData.label_fr) {
      toast.warn('Code et libelle francais requis');
      return;
    }
    try {
      await createSMSCode({
        ...formData,
        code: formData.code.toUpperCase(),
      });
      toast.success('Code SMS cree');
      setShowModal(false);
      setFormData({ code: '', label_fr: '', label_en: '', category: 'symptom', description: '' });
      loadCodes();
    } catch (err) {
      toast.error(err.message || 'Erreur creation');
    }
  }, [formData, loadCodes]);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteSMSCode(id);
      toast.success('Code SMS desactive');
      setDeleteConfirm(null);
      loadCodes();
    } catch (err) {
      toast.error(err.message || 'Erreur suppression');
    }
  }, [loadCodes]);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    { key: 'symptom', label: 'Symptomes',   icon: '🩺', color: SEGMENT_COLORS.symptoms },
    { key: 'species', label: 'Especes',      icon: '🐾', color: SEGMENT_COLORS.species },
    { key: 'event',   label: 'Evenements',   icon: '⚡', color: SEGMENT_COLORS.event },
  ];

  const s = {
    topBar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    title: {
      fontSize: 16,
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#1f2937',
    },
    btnAdd: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 16px',
      borderRadius: 10,
      border: 'none',
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 600,
      color: '#fff',
      backgroundColor: COHRM_COLORS.primaryLight,
      transition: 'all 0.2s ease',
    },
    accordion: {
      borderRadius: 12,
      overflow: 'hidden',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #e5e7eb',
      marginBottom: 12,
    },
    accordionHeader: (color) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      cursor: 'pointer',
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      borderBottom: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #e5e7eb',
      transition: 'background-color 0.15s',
    }),
    accordionTitle: (color) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontSize: 14,
      fontWeight: 700,
      color: isDark ? color.text : '#1f2937',
    }),
    badge: (color) => ({
      padding: '2px 8px',
      borderRadius: 10,
      backgroundColor: color.bg,
      color: color.text,
      fontSize: 11,
      fontWeight: 700,
    }),
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      padding: '10px 14px',
      textAlign: 'left',
      fontSize: 11,
      fontWeight: 700,
      color: isDark ? '#94a3b8' : '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      backgroundColor: isDark ? 'rgba(15,23,42,0.4)' : '#f9fafb',
    },
    td: {
      padding: '10px 14px',
      fontSize: 13,
      color: isDark ? '#cbd5e1' : '#374151',
      borderBottom: isDark ? '1px solid #1e293b' : '1px solid #f3f4f6',
    },
    codeCell: {
      fontFamily: 'monospace',
      fontWeight: 700,
      fontSize: 14,
      color: '#22d3ee',
    },
    actionBtn: {
      padding: '4px 8px',
      borderRadius: 6,
      border: 'none',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      transition: 'background-color 0.15s',
    },
    // Modal
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modal: {
      width: 440,
      borderRadius: 16,
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #e5e7eb',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      overflow: 'hidden',
    },
    modalHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      borderBottom: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #e5e7eb',
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#1f2937',
    },
    modalBody: {
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: 600,
      color: isDark ? '#94a3b8' : '#6b7280',
    },
    input: {
      padding: '8px 12px',
      borderRadius: 8,
      border: isDark ? '1px solid #334155' : '1px solid #d1d5db',
      backgroundColor: isDark ? '#0f172a' : '#fff',
      color: isDark ? '#e2e8f0' : '#1f2937',
      fontSize: 13,
      outline: 'none',
    },
    select: {
      padding: '8px 12px',
      borderRadius: 8,
      border: isDark ? '1px solid #334155' : '1px solid #d1d5db',
      backgroundColor: isDark ? '#0f172a' : '#fff',
      color: isDark ? '#e2e8f0' : '#1f2937',
      fontSize: 13,
      outline: 'none',
    },
    modalFooter: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 8,
      padding: '12px 20px',
      borderTop: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #e5e7eb',
    },
  };

  return (
    <div>
      {/* Top Bar */}
      <div style={s.topBar}>
        <div style={s.title}>Codes SMS actifs</div>
        {isAdmin && (
          <button
            style={s.btnAdd}
            onClick={() => setShowModal(true)}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
          >
            <Plus size={14} /> Ajouter un code
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 40, color: isDark ? '#94a3b8' : '#6b7280' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
          <div>Chargement des codes...</div>
        </div>
      )}

      {/* Accordions */}
      {!loading && sections.map(section => {
        const items = codes[section.key] || [];
        const isOpen = expandedSection === section.key;

        return (
          <div key={section.key} style={s.accordion}>
            <div
              style={s.accordionHeader(section.color)}
              onClick={() => toggleSection(section.key)}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(41,128,185,0.08)' : '#f9fafb'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = isDark ? COHRM_COLORS.darkCard : '#fff'; }}
            >
              <div style={s.accordionTitle(section.color)}>
                <span>{section.icon}</span>
                {section.label}
                <span style={s.badge(section.color)}>{items.length}</span>
              </div>
              {isOpen ? <ChevronDown size={18} color={isDark ? '#94a3b8' : '#6b7280'} /> : <ChevronRight size={18} color={isDark ? '#94a3b8' : '#6b7280'} />}
            </div>

            {isOpen && (
              <div style={{ backgroundColor: isDark ? 'rgba(15,23,42,0.3)' : '#fafafa' }}>
                {items.length === 0 ? (
                  <div style={{ padding: 20, textAlign: 'center', color: isDark ? '#64748b' : '#9ca3af', fontSize: 13 }}>
                    Aucun code dans cette categorie
                  </div>
                ) : (
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>Code</th>
                        <th style={s.th}>Libelle FR</th>
                        <th style={s.th}>Libelle EN</th>
                        <th style={{ ...s.th, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id}>
                          <td style={{ ...s.td, ...s.codeCell }}>{item.code}</td>
                          <td style={s.td}>{item.label_fr}</td>
                          <td style={{ ...s.td, color: isDark ? '#94a3b8' : '#9ca3af' }}>{item.label_en || '-'}</td>
                          <td style={{ ...s.td, textAlign: 'right' }}>
                            {isAdmin && (
                              <>
                                {deleteConfirm === item.id ? (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ fontSize: 11, color: '#ef4444' }}>Confirmer ?</span>
                                    <button
                                      style={{ ...s.actionBtn, color: '#ef4444' }}
                                      onClick={() => handleDelete(item.id)}
                                      title="Confirmer"
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button
                                      style={{ ...s.actionBtn, color: isDark ? '#94a3b8' : '#6b7280' }}
                                      onClick={() => setDeleteConfirm(null)}
                                      title="Annuler"
                                    >
                                      <X size={14} />
                                    </button>
                                  </span>
                                ) : (
                                  <button
                                    style={{ ...s.actionBtn, color: '#ef4444' }}
                                    onClick={() => setDeleteConfirm(item.id)}
                                    title="Desactiver"
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Add Code Modal */}
      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>Ajouter un code SMS</div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                onClick={() => setShowModal(false)}
              >
                <X size={18} color={isDark ? '#94a3b8' : '#6b7280'} />
              </button>
            </div>
            <div style={s.modalBody}>
              <div style={s.inputGroup}>
                <label style={s.inputLabel}>Categorie *</label>
                <select
                  style={s.select}
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="symptom">Symptome</option>
                  <option value="species">Espece</option>
                  <option value="event">Evenement</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ ...s.inputGroup, flex: 1 }}>
                  <label style={s.inputLabel}>Code * (2-3 car.)</label>
                  <input
                    style={{ ...s.input, fontFamily: 'monospace', textTransform: 'uppercase', fontWeight: 700 }}
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase().slice(0, 3) })}
                    placeholder="ex: FI"
                    maxLength={3}
                  />
                </div>
              </div>
              <div style={s.inputGroup}>
                <label style={s.inputLabel}>Libelle Francais *</label>
                <input
                  style={s.input}
                  value={formData.label_fr}
                  onChange={e => setFormData({ ...formData, label_fr: e.target.value })}
                  placeholder="ex: Fievre"
                />
              </div>
              <div style={s.inputGroup}>
                <label style={s.inputLabel}>Libelle Anglais</label>
                <input
                  style={s.input}
                  value={formData.label_en}
                  onChange={e => setFormData({ ...formData, label_en: e.target.value })}
                  placeholder="ex: Fever"
                />
              </div>
              <div style={s.inputGroup}>
                <label style={s.inputLabel}>Description</label>
                <input
                  style={s.input}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description optionnelle"
                />
              </div>
            </div>
            <div style={s.modalFooter}>
              <button
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: isDark ? '1px solid #334155' : '1px solid #d1d5db',
                  backgroundColor: 'transparent',
                  color: isDark ? '#94a3b8' : '#6b7280',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                }}
                onClick={() => setShowModal(false)}
              >
                Annuler
              </button>
              <button
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: COHRM_COLORS.primaryLight,
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                }}
                onClick={handleCreate}
              >
                Creer
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ============================================
// ONGLET 3 - JOURNAL SMS
// ============================================

const LogsTab = ({ isDark, user }) => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, success_count: 0, error_count: 0 });
  const [dailyVolume, setDailyVolume] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', sender: '', date_from: '', date_to: '' });
  const [showFilters, setShowFilters] = useState(false);
  const { setActivePage } = useCohrmStore();

  const loadLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const result = await getSMSLogs({ ...filters, page, limit: 20 });
      setLogs(result.data || []);
      setStats(result.stats || { total: 0, success_count: 0, error_count: 0 });
      setDailyVolume(result.dailyVolume || []);
      setPagination(result.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
    } catch (err) {
      toast.error('Erreur chargement du journal');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const successRate = stats.total > 0 ? Math.round((stats.success_count / stats.total) * 100) : 0;

  // Sparkline component
  const Sparkline = ({ data, width = 120, height = 30 }) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data.map(d => d.count), 1);
    const points = data.map((d, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * width;
      const y = height - (d.count / max) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} style={{ display: 'block' }}>
        <polyline
          points={points}
          fill="none"
          stroke="#22d3ee"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const s = {
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 12,
      marginBottom: 20,
    },
    statCard: (accent) => ({
      padding: '16px 18px',
      borderRadius: 12,
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #e5e7eb',
      borderLeft: `3px solid ${accent}`,
    }),
    statValue: {
      fontSize: 24,
      fontWeight: 800,
      color: isDark ? '#e2e8f0' : '#1f2937',
    },
    statLabel: {
      fontSize: 12,
      color: isDark ? '#94a3b8' : '#6b7280',
      marginTop: 2,
    },
    filterBar: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
      flexWrap: 'wrap',
    },
    filterInput: {
      padding: '7px 12px',
      borderRadius: 8,
      border: isDark ? '1px solid #334155' : '1px solid #d1d5db',
      backgroundColor: isDark ? '#0f172a' : '#fff',
      color: isDark ? '#e2e8f0' : '#1f2937',
      fontSize: 12,
      outline: 'none',
    },
    filterSelect: {
      padding: '7px 12px',
      borderRadius: 8,
      border: isDark ? '1px solid #334155' : '1px solid #d1d5db',
      backgroundColor: isDark ? '#0f172a' : '#fff',
      color: isDark ? '#e2e8f0' : '#1f2937',
      fontSize: 12,
      outline: 'none',
    },
    tableWrap: {
      borderRadius: 12,
      overflow: 'hidden',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #e5e7eb',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      padding: '10px 14px',
      textAlign: 'left',
      fontSize: 11,
      fontWeight: 700,
      color: isDark ? '#94a3b8' : '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      backgroundColor: isDark ? 'rgba(15,23,42,0.6)' : '#f9fafb',
      borderBottom: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #e5e7eb',
    },
    td: {
      padding: '10px 14px',
      fontSize: 13,
      color: isDark ? '#cbd5e1' : '#374151',
      borderBottom: isDark ? '1px solid #1e293b' : '1px solid #f3f4f6',
      verticalAlign: 'middle',
    },
    statusBadge: (status) => {
      const isSuccess = status === 'processed';
      return {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 700,
        color: isSuccess ? '#22c55e' : '#ef4444',
        backgroundColor: isSuccess ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
        border: `1px solid ${isSuccess ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
      };
    },
    smsCell: {
      fontFamily: 'monospace',
      fontSize: 12,
      color: '#22d3ee',
      maxWidth: 260,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    pagination: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
      marginTop: 12,
    },
    pageBtn: (active) => ({
      padding: '6px 12px',
      borderRadius: 6,
      border: active ? 'none' : (isDark ? '1px solid #334155' : '1px solid #d1d5db'),
      backgroundColor: active ? COHRM_COLORS.primaryLight : 'transparent',
      color: active ? '#fff' : (isDark ? '#94a3b8' : '#6b7280'),
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: active ? 700 : 500,
    }),
    actionBtn: {
      padding: '4px 8px',
      borderRadius: 6,
      border: 'none',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 11,
      color: isDark ? '#94a3b8' : '#6b7280',
      transition: 'background-color 0.15s',
    },
  };

  return (
    <div>
      {/* Stats Cards */}
      <div style={s.statsGrid}>
        <div style={s.statCard('#3b82f6')}>
          <div style={s.statValue}>{stats.total}</div>
          <div style={s.statLabel}>Total SMS recus</div>
        </div>
        <div style={s.statCard('#22c55e')}>
          <div style={{ ...s.statValue, color: '#22c55e' }}>{stats.success_count}</div>
          <div style={s.statLabel}>Decodes avec succes</div>
        </div>
        <div style={s.statCard('#ef4444')}>
          <div style={{ ...s.statValue, color: '#ef4444' }}>{stats.error_count}</div>
          <div style={s.statLabel}>Echecs de decodage</div>
        </div>
        <div style={s.statCard('#22d3ee')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={s.statValue}>{successRate}%</div>
            <Sparkline data={dailyVolume} />
          </div>
          <div style={s.statLabel}>Taux de succes | Volume 14j</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={s.filterBar}>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 8,
            border: isDark ? '1px solid #334155' : '1px solid #d1d5db',
            backgroundColor: showFilters ? (isDark ? 'rgba(41,128,185,0.15)' : 'rgba(41,128,185,0.08)') : 'transparent',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            color: isDark ? '#94a3b8' : '#6b7280',
          }}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={14} />
          Filtres
          {(filters.status || filters.sender || filters.date_from) && (
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              backgroundColor: COHRM_COLORS.primaryLight,
            }} />
          )}
        </button>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '7px 12px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontSize: 12,
            color: isDark ? '#94a3b8' : '#6b7280',
          }}
          onClick={() => loadLogs()}
        >
          <RefreshCw size={14} />
          Actualiser
        </button>
      </div>

      {showFilters && (
        <div style={{
          display: 'flex',
          gap: 10,
          marginBottom: 16,
          padding: 14,
          borderRadius: 10,
          backgroundColor: isDark ? 'rgba(15,23,42,0.4)' : '#f9fafb',
          border: isDark ? '1px solid #1e293b' : '1px solid #f3f4f6',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: isDark ? '#94a3b8' : '#6b7280' }}>Statut</label>
            <select
              style={s.filterSelect}
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Tous</option>
              <option value="processed">Decode</option>
              <option value="invalid_format">Echec</option>
              <option value="error">Erreur</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: isDark ? '#94a3b8' : '#6b7280' }}>Expediteur</label>
            <input
              style={s.filterInput}
              placeholder="Numero..."
              value={filters.sender}
              onChange={e => setFilters({ ...filters, sender: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: isDark ? '#94a3b8' : '#6b7280' }}>Du</label>
            <input
              type="date"
              style={s.filterInput}
              value={filters.date_from}
              onChange={e => setFilters({ ...filters, date_from: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: isDark ? '#94a3b8' : '#6b7280' }}>Au</label>
            <input
              type="date"
              style={s.filterInput}
              value={filters.date_to}
              onChange={e => setFilters({ ...filters, date_to: e.target.value })}
            />
          </div>
          <button
            style={{
              padding: '7px 12px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: COHRM_COLORS.primaryLight,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
            onClick={() => loadLogs(1)}
          >
            Appliquer
          </button>
          <button
            style={{
              padding: '7px 12px',
              borderRadius: 8,
              border: isDark ? '1px solid #334155' : '1px solid #d1d5db',
              backgroundColor: 'transparent',
              color: isDark ? '#94a3b8' : '#6b7280',
              cursor: 'pointer',
              fontSize: 12,
            }}
            onClick={() => { setFilters({ status: '', sender: '', date_from: '', date_to: '' }); }}
          >
            Reinitialiser
          </button>
        </div>
      )}

      {/* Table */}
      <div style={s.tableWrap}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: isDark ? '#94a3b8' : '#6b7280' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
            <div>Chargement...</div>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <MessageCircle size={32} color={isDark ? '#334155' : '#d1d5db'} style={{ marginBottom: 8 }} />
            <div style={{ color: isDark ? '#64748b' : '#9ca3af', fontSize: 14 }}>Aucun SMS dans le journal</div>
          </div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Date / Heure</th>
                <th style={s.th}>Expediteur</th>
                <th style={s.th}>Message</th>
                <th style={s.th}>Statut</th>
                <th style={s.th}>Rumeur</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={13} color={isDark ? '#64748b' : '#9ca3af'} />
                      <span style={{ fontSize: 12 }}>{formatDate(log.created_at)}</span>
                    </div>
                  </td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Phone size={13} color={isDark ? '#64748b' : '#9ca3af'} />
                      <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{log.sender || '-'}</span>
                    </div>
                  </td>
                  <td style={s.td}>
                    <div style={s.smsCell} title={log.message}>{log.message}</div>
                  </td>
                  <td style={s.td}>
                    <span style={s.statusBadge(log.status)}>
                      {log.status === 'processed' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {log.status === 'processed' ? 'Decode' : log.status === 'invalid_format' ? 'Echec' : 'Erreur'}
                    </span>
                  </td>
                  <td style={s.td}>
                    {log.rumor_id ? (
                      <button
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '3px 8px',
                          borderRadius: 6,
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 11,
                          fontWeight: 600,
                          color: COHRM_COLORS.primaryLight,
                          backgroundColor: 'rgba(41,128,185,0.1)',
                        }}
                        onClick={() => setActivePage('rumor-detail', { rumorId: log.rumor_id })}
                      >
                        <ExternalLink size={11} />
                        {log.rumor_code || `#${log.rumor_id}`}
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: isDark ? '#64748b' : '#9ca3af' }}>-</span>
                    )}
                  </td>
                  <td style={{ ...s.td, textAlign: 'right' }}>
                    <button
                      style={s.actionBtn}
                      title="Voir le detail"
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <Search size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={s.pagination}>
          <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#6b7280' }}>
            {pagination.total} SMS au total - Page {pagination.page}/{pagination.pages}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {pagination.page > 1 && (
              <button style={s.pageBtn(false)} onClick={() => loadLogs(pagination.page - 1)}>Precedent</button>
            )}
            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
              const start = Math.max(1, Math.min(pagination.page - 2, pagination.pages - 4));
              const pageNum = start + i;
              if (pageNum > pagination.pages) return null;
              return (
                <button
                  key={pageNum}
                  style={s.pageBtn(pageNum === pagination.page)}
                  onClick={() => loadLogs(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            {pagination.page < pagination.pages && (
              <button style={s.pageBtn(false)} onClick={() => loadLogs(pagination.page + 1)}>Suivant</button>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default SMSManager;
