/**
 * WebScanner - Page de scanning web pour la détection de rumeurs sanitaires
 *
 * 3 sections principales :
 * 1. Formulaire de lancement de scan (mots-clés, sources, langue, période)
 * 2. Résultats du scan en cours (cartes avec actions)
 * 3. Historique des scans précédents (tableau paginé)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, X, Plus, Play, Radio, Globe, Facebook, Twitter,
  ExternalLink, CheckCircle, XCircle, Eye, ArrowUpDown,
  Filter, Clock, BarChart3, Radar, AlertTriangle, Info,
  ChevronDown, ChevronLeft, ChevronRight, RefreshCw, Loader,
  Newspaper, Hash, Zap, TrendingUp, Activity,
} from 'lucide-react';
import { COHRM_COLORS } from '../utils/constants';
import { formatDate, formatRelativeDate } from '../utils/formatters';
import { runScan, getScanHistory, getScanDetail, updateScanResult } from '../services/cohrmApi';
import useCohrmStore from '../stores/cohrmStore';

// ============================================
// CONSTANTES SCANNER
// ============================================

const SUGGESTED_KEYWORDS = [
  'épidémie', 'maladie', 'mortalité', 'grippe aviaire', 'choléra',
  'fièvre', 'zoonose', 'contamination', 'infection', 'pandémie',
  'rougeole', 'méningite', 'paludisme', 'ebola', 'mpox',
  'rage', 'anthrax', 'peste', 'tuberculose', 'COVID',
];

const SOURCE_OPTIONS = [
  { id: 'news', label: 'Actualités', icon: Newspaper, color: '#3498DB' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877F2' },
  { id: 'twitter', label: 'Twitter / X', icon: Twitter, color: '#1DA1F2' },
];

const LANGUAGE_OPTIONS = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'Anglais' },
  { value: 'all', label: 'Toutes les langues' },
];

const PERIOD_OPTIONS = [
  { value: '24h', label: 'Dernières 24h' },
  { value: '7d', label: '7 derniers jours' },
  { value: '30d', label: '30 derniers jours' },
];

const SCAN_PROGRESS_STEPS = [
  { text: 'Initialisation du scan...', icon: Radar, duration: 800 },
  { text: 'Analyse des sources web...', icon: Globe, duration: 1200 },
  { text: 'Exploration des réseaux sociaux...', icon: Activity, duration: 1000 },
  { text: 'Extraction des données...', icon: Zap, duration: 1200 },
  { text: 'Scoring des résultats...', icon: TrendingUp, duration: 800 },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Pertinence' },
  { value: 'date', label: 'Date' },
  { value: 'source', label: 'Source' },
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const WebScanner = ({ isDark, user }) => {
  const { setActivePage } = useCohrmStore();

  // --- État du formulaire ---
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [selectedSources, setSelectedSources] = useState(['news', 'facebook', 'twitter']);
  const [language, setLanguage] = useState('fr');
  const [period, setPeriod] = useState('7d');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // --- État du scan ---
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState(0);
  const [scanId, setScanId] = useState(null);

  // --- Résultats ---
  const [results, setResults] = useState([]);
  const [visibleResults, setVisibleResults] = useState([]);
  const [fadingOut, setFadingOut] = useState({});
  const [sortBy, setSortBy] = useState('relevance');
  const [filterSource, setFilterSource] = useState('all');
  const [minScore, setMinScore] = useState(0);
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'history'

  // --- Historique ---
  const [history, setHistory] = useState([]);
  const [historyPagination, setHistoryPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);
  const [selectedScanLoading, setSelectedScanLoading] = useState(false);

  // --- Refs ---
  const keywordInputRef = useRef(null);
  const resultsRef = useRef(null);

  // ============================================
  // CHARGEMENT HISTORIQUE
  // ============================================

  const loadHistory = useCallback(async (page = 1) => {
    setHistoryLoading(true);
    try {
      const res = await getScanHistory({ page, limit: 10 });
      if (res.success) {
        setHistory(res.data || []);
        setHistoryPagination(res.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      }
    } catch (err) {
      console.error('Erreur chargement historique:', err);
    }
    setHistoryLoading(false);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ============================================
  // GESTION MOTS-CLÉS
  // ============================================

  const addKeyword = (kw) => {
    const trimmed = kw.trim().toLowerCase();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords(prev => [...prev, trimmed]);
    }
    setKeywordInput('');
    setShowSuggestions(false);
    keywordInputRef.current?.focus();
  };

  const removeKeyword = (kw) => {
    setKeywords(prev => prev.filter(k => k !== kw));
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      addKeyword(keywordInput);
    }
    if (e.key === 'Backspace' && !keywordInput && keywords.length > 0) {
      setKeywords(prev => prev.slice(0, -1));
    }
  };

  const filteredSuggestions = SUGGESTED_KEYWORDS.filter(
    s => !keywords.includes(s) && s.includes(keywordInput.toLowerCase())
  );

  // ============================================
  // GESTION SOURCES
  // ============================================

  const toggleSource = (id) => {
    setSelectedSources(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // ============================================
  // LANCEMENT DU SCAN
  // ============================================

  const handleRunScan = async () => {
    if (scanning) return;

    setScanning(true);
    setScanProgress(0);
    setScanStep(0);
    setResults([]);
    setVisibleResults([]);

    // Animation de progression
    let step = 0;
    const totalDuration = SCAN_PROGRESS_STEPS.reduce((a, s) => a + s.duration, 0);
    let elapsed = 0;

    const progressInterval = setInterval(() => {
      elapsed += 100;
      const progress = Math.min((elapsed / totalDuration) * 85, 85);
      setScanProgress(progress);

      // Calcul de l'étape courante
      let accumulated = 0;
      for (let i = 0; i < SCAN_PROGRESS_STEPS.length; i++) {
        accumulated += SCAN_PROGRESS_STEPS[i].duration;
        if (elapsed < accumulated) { step = i; break; }
        if (i === SCAN_PROGRESS_STEPS.length - 1) step = i;
      }
      setScanStep(step);
    }, 100);

    try {
      const sourceParam = selectedSources.length === 3 ? 'all' :
        selectedSources.length === 1 ? selectedSources[0] : 'all';

      const res = await runScan({
        source: sourceParam,
        keywords: keywords.length > 0 ? keywords : undefined,
      });

      clearInterval(progressInterval);

      if (res.success && res.data?.scan_id) {
        setScanId(res.data.scan_id);
        setScanProgress(90);
        setScanStep(SCAN_PROGRESS_STEPS.length - 1);

        // Attendre un peu puis récupérer les résultats (le backend simule en 5s)
        await new Promise(resolve => setTimeout(resolve, 6000));

        const detail = await getScanDetail(res.data.scan_id);
        if (detail.success && detail.data?.results) {
          setScanProgress(100);
          setResults(detail.data.results);

          // Affichage progressif des résultats
          const allResults = detail.data.results;
          for (let i = 0; i < allResults.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 400));
            setVisibleResults(prev => [...prev, allResults[i]]);
          }
        }
      }
    } catch (err) {
      console.error('Erreur scan:', err);
    }

    setScanning(false);
    loadHistory();
  };

  // ============================================
  // ACTIONS RÉSULTATS
  // ============================================

  const handleIgnore = async (resultId) => {
    setFadingOut(prev => ({ ...prev, [resultId]: true }));
    try {
      await updateScanResult(resultId, { status: 'ignored' });
      setTimeout(() => {
        setResults(prev => prev.map(r => r.id === resultId ? { ...r, status: 'ignored' } : r));
        setVisibleResults(prev => prev.filter(r => r.id !== resultId));
        setFadingOut(prev => { const n = { ...prev }; delete n[resultId]; return n; });
      }, 500);
    } catch (err) {
      setFadingOut(prev => { const n = { ...prev }; delete n[resultId]; return n; });
      console.error('Erreur ignorer résultat:', err);
    }
  };

  const handleConvert = (result) => {
    // Navigate to rumor creation with pre-filled data from scan result
    setActivePage('rumor-create', {
      prefill: {
        title: result.title,
        description: result.content,
        source: 'scanner',
        source_url: result.url,
        scan_result_id: result.id,
      },
    });
  };

  // ============================================
  // DÉTAIL SCAN HISTORIQUE
  // ============================================

  const handleViewScan = async (scan) => {
    setSelectedScanLoading(true);
    setSelectedScan(null);
    try {
      const res = await getScanDetail(scan.id);
      if (res.success) {
        setSelectedScan(res.data);
      }
    } catch (err) {
      console.error('Erreur chargement scan:', err);
    }
    setSelectedScanLoading(false);
  };

  // ============================================
  // TRI ET FILTRAGE DES RÉSULTATS
  // ============================================

  const filteredResults = visibleResults
    .filter(r => {
      if (filterSource !== 'all' && r.source !== filterSource) return false;
      if ((r.relevance_score || 0) * 100 < minScore) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'relevance') return (b.relevance_score || 0) - (a.relevance_score || 0);
      if (sortBy === 'date') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'source') return (a.source || '').localeCompare(b.source || '');
      return 0;
    });

  // ============================================
  // HELPER: Score color
  // ============================================

  const getScoreColor = (score) => {
    const pct = score * 100;
    if (pct >= 60) return '#27AE60';
    if (pct >= 30) return '#F39C12';
    return '#E74C3C';
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'facebook': return <Facebook size={14} />;
      case 'twitter': return <Twitter size={14} />;
      default: return <Newspaper size={14} />;
    }
  };

  const getSourceLabel = (source) => {
    switch (source) {
      case 'facebook': return 'Facebook';
      case 'twitter': return 'Twitter / X';
      default: return 'Actualités';
    }
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'facebook': return '#1877F2';
      case 'twitter': return '#1DA1F2';
      default: return '#3498DB';
    }
  };

  const highlightKeywords = (text, matchedKeywords) => {
    if (!text || !matchedKeywords) return text;
    let kws;
    try {
      kws = typeof matchedKeywords === 'string' ? JSON.parse(matchedKeywords) : matchedKeywords;
    } catch { kws = []; }
    if (!Array.isArray(kws) || kws.length === 0) return text;

    const pattern = kws.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${pattern})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part)
        ? <mark key={i} style={{ backgroundColor: '#FBBF24', color: '#1F2937', borderRadius: 2, padding: '0 2px' }}>{part}</mark>
        : part
    );
  };

  const truncate = (text, max = 200) => {
    if (!text || text.length <= max) return text;
    return text.substring(0, max) + '...';
  };

  const getScanStatusBadge = (status) => {
    const map = {
      running: { label: 'En cours', color: '#F39C12', bg: '#FEF9E7' },
      completed: { label: 'Terminé', color: '#27AE60', bg: '#EAFAF1' },
      failed: { label: 'Erreur', color: '#E74C3C', bg: '#FDEDEC' },
    };
    const cfg = map[status] || map.completed;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
        color: cfg.color, backgroundColor: isDark ? 'transparent' : cfg.bg,
        border: `1px solid ${cfg.color}40`,
      }}>
        {status === 'running' && <Loader size={12} style={{ animation: 'cohrmSpin 1s linear infinite' }} />}
        {cfg.label}
      </span>
    );
  };

  const parseKeywords = (kwStr) => {
    try { return typeof kwStr === 'string' ? JSON.parse(kwStr) : (kwStr || []); }
    catch { return []; }
  };

  // ============================================
  // STYLES
  // ============================================

  const s = {
    container: {
      padding: '0 0 40px 0',
      minHeight: '100vh',
    },
    // -- Simulation banner --
    simBanner: {
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 16px', marginBottom: 24, borderRadius: 10,
      backgroundColor: isDark ? '#1e3a5f' : '#EBF5FB',
      border: `1px solid ${isDark ? '#2980B930' : '#3498DB30'}`,
      fontSize: 13, color: isDark ? '#7EC8E3' : '#1B4F72',
    },
    // -- Tab navigation --
    tabs: {
      display: 'flex', gap: 0, marginBottom: 24,
      borderRadius: 12, overflow: 'hidden',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
    },
    tab: (active) => ({
      flex: 1, padding: '12px 24px', textAlign: 'center',
      fontSize: 14, fontWeight: 600, cursor: 'pointer',
      backgroundColor: active ? (isDark ? COHRM_COLORS.darkCard : '#fff') : 'transparent',
      color: active ? COHRM_COLORS.primaryLight : (isDark ? '#94a3b8' : '#6B7280'),
      borderBottom: active ? `3px solid ${COHRM_COLORS.primaryLight}` : '3px solid transparent',
      transition: 'all 0.2s',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }),
    // -- Card container --
    card: {
      borderRadius: 14,
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
      padding: 24,
      marginBottom: 20,
    },
    cardTitle: {
      fontSize: 16, fontWeight: 700, marginBottom: 20,
      color: isDark ? '#e2e8f0' : '#1F2937',
      display: 'flex', alignItems: 'center', gap: 10,
    },
    // -- Input styles --
    keywordsWrapper: {
      display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
      padding: '10px 14px', borderRadius: 10, minHeight: 48,
      backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #D1D5DB',
      cursor: 'text', position: 'relative',
    },
    keywordTag: {
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 20, fontSize: 13, fontWeight: 500,
      backgroundColor: isDark ? '#1B4F7230' : '#EBF5FB',
      color: COHRM_COLORS.primaryLight,
      border: `1px solid ${COHRM_COLORS.primaryLight}30`,
    },
    keywordRemove: {
      cursor: 'pointer', display: 'flex', padding: 2, borderRadius: '50%',
      backgroundColor: 'transparent',
      transition: 'background-color 0.15s',
    },
    keywordInput: {
      flex: 1, minWidth: 120, border: 'none', outline: 'none',
      backgroundColor: 'transparent', fontSize: 14,
      color: isDark ? '#e2e8f0' : '#1F2937',
    },
    suggestions: {
      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
      marginTop: 4, borderRadius: 10, maxHeight: 200, overflowY: 'auto',
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    },
    suggestionItem: {
      padding: '8px 14px', fontSize: 13, cursor: 'pointer',
      color: isDark ? '#e2e8f0' : '#374151',
      transition: 'background-color 0.1s',
    },
    // -- Source checkboxes --
    sourceGrid: {
      display: 'flex', flexWrap: 'wrap', gap: 12,
    },
    sourceItem: (selected, color) => ({
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 18px', borderRadius: 10, cursor: 'pointer',
      backgroundColor: selected
        ? (isDark ? `${color}20` : `${color}10`)
        : (isDark ? '#0f172a' : '#F9FAFB'),
      border: selected
        ? `2px solid ${color}`
        : (isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #D1D5DB'),
      transition: 'all 0.2s', flex: '1 1 140px',
      minWidth: 140,
    }),
    // -- Selects --
    selectRow: {
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
    },
    select: {
      width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
      backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #D1D5DB',
      color: isDark ? '#e2e8f0' : '#1F2937',
      outline: 'none', cursor: 'pointer',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${isDark ? '%2394a3b8' : '%236B7280'}' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      paddingRight: 36,
    },
    label: {
      fontSize: 13, fontWeight: 600, marginBottom: 8, display: 'block',
      color: isDark ? '#94a3b8' : '#6B7280',
      textTransform: 'uppercase', letterSpacing: '0.5px',
    },
    // -- Scan button --
    scanBtn: {
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      width: '100%', padding: '14px 24px', borderRadius: 12,
      fontSize: 15, fontWeight: 700, cursor: scanning ? 'not-allowed' : 'pointer',
      border: 'none', color: '#fff',
      background: scanning
        ? (isDark ? '#334155' : '#9CA3AF')
        : `linear-gradient(135deg, ${COHRM_COLORS.primaryLight}, ${COHRM_COLORS.primary})`,
      boxShadow: scanning ? 'none' : '0 4px 14px rgba(41, 128, 185, 0.4)',
      transition: 'all 0.3s',
      opacity: scanning ? 0.7 : 1,
    },
    // -- Progress bar --
    progressContainer: {
      marginTop: 16,
    },
    progressBar: {
      width: '100%', height: 6, borderRadius: 3,
      backgroundColor: isDark ? '#0f172a' : '#E5E7EB',
      overflow: 'hidden',
    },
    progressFill: (pct) => ({
      width: `${pct}%`, height: '100%', borderRadius: 3,
      background: `linear-gradient(90deg, ${COHRM_COLORS.primaryLight}, #27AE60)`,
      transition: 'width 0.3s ease',
    }),
    progressText: {
      display: 'flex', alignItems: 'center', gap: 8,
      marginTop: 10, fontSize: 13, fontWeight: 500,
      color: isDark ? '#94a3b8' : '#6B7280',
    },
    // -- Results filter bar --
    filterBar: {
      display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center',
      marginBottom: 16, padding: '12px 16px', borderRadius: 10,
      backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
    },
    filterSelect: {
      padding: '6px 12px', borderRadius: 8, fontSize: 13,
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #D1D5DB',
      color: isDark ? '#e2e8f0' : '#1F2937',
      outline: 'none', cursor: 'pointer',
    },
    // -- Result card --
    resultCard: (fading) => ({
      borderRadius: 12, padding: 20, marginBottom: 14,
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
      transition: 'all 0.5s ease',
      opacity: fading ? 0 : 1,
      transform: fading ? 'translateX(100px)' : 'translateX(0)',
      animation: fading ? 'none' : 'scanSlideIn 0.4s ease-out',
    }),
    resultTitle: {
      fontSize: 15, fontWeight: 600, marginBottom: 8,
      color: COHRM_COLORS.primaryLight,
      cursor: 'pointer', textDecoration: 'none',
      display: 'block',
    },
    resultContent: {
      fontSize: 13, lineHeight: 1.6, marginBottom: 12,
      color: isDark ? '#94a3b8' : '#6B7280',
    },
    resultMeta: {
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16,
      marginBottom: 14, fontSize: 12,
      color: isDark ? '#64748b' : '#9CA3AF',
    },
    scoreBar: {
      flex: '0 0 120px', height: 8, borderRadius: 4,
      backgroundColor: isDark ? '#0f172a' : '#E5E7EB',
      overflow: 'hidden',
    },
    scoreFill: (score, color) => ({
      width: `${score * 100}%`, height: '100%', borderRadius: 4,
      backgroundColor: color,
      transition: 'width 0.6s ease',
    }),
    actionBtn: (color, bgColor) => ({
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
      cursor: 'pointer', border: 'none',
      color: color, backgroundColor: isDark ? `${color}20` : bgColor,
      transition: 'all 0.2s',
    }),
    // -- History --
    historyTable: {
      width: '100%', borderCollapse: 'collapse', fontSize: 13,
    },
    th: {
      padding: '12px 14px', textAlign: 'left', fontWeight: 600,
      fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px',
      color: isDark ? '#94a3b8' : '#6B7280',
      backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    td: {
      padding: '12px 14px',
      borderBottom: isDark ? '1px solid #1e293b50' : '1px solid #F3F4F6',
      color: isDark ? '#e2e8f0' : '#374151',
      verticalAlign: 'middle',
    },
    chip: {
      display: 'inline-block', padding: '2px 8px', borderRadius: 12,
      fontSize: 11, fontWeight: 500, marginRight: 4, marginBottom: 2,
      backgroundColor: isDark ? '#1B4F7230' : '#EBF5FB',
      color: COHRM_COLORS.primaryLight,
    },
    // -- Stats card --
    statsGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: 14, marginBottom: 20,
    },
    statCard: {
      padding: 16, borderRadius: 12, textAlign: 'center',
      backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
    },
    statValue: {
      fontSize: 28, fontWeight: 800,
      color: COHRM_COLORS.primaryLight,
    },
    statLabel: {
      fontSize: 12, marginTop: 4, fontWeight: 500,
      color: isDark ? '#64748b' : '#9CA3AF',
    },
    // -- Pagination --
    paginationWrap: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 0', fontSize: 13,
      color: isDark ? '#94a3b8' : '#6B7280',
    },
    pageBtn: (disabled) => ({
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: 32, height: 32, borderRadius: 6,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: 'transparent', cursor: disabled ? 'not-allowed' : 'pointer',
      color: isDark ? '#e2e8f0' : '#374151', opacity: disabled ? 0.4 : 1,
    }),
  };

  // ============================================
  // RENDER - SCAN FORM
  // ============================================

  const renderScanForm = () => (
    <div style={s.card}>
      <div style={s.cardTitle}>
        <Radar size={20} color={COHRM_COLORS.primaryLight} />
        Lancer un scan
      </div>

      {/* Mots-clés */}
      <div style={{ marginBottom: 20 }}>
        <label style={s.label}>Mots-clés de recherche</label>
        <div
          style={s.keywordsWrapper}
          onClick={() => keywordInputRef.current?.focus()}
        >
          {keywords.map(kw => (
            <span key={kw} style={s.keywordTag}>
              <Hash size={12} />
              {kw}
              <span
                style={s.keywordRemove}
                onClick={(e) => { e.stopPropagation(); removeKeyword(kw); }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? '#ffffff20' : '#00000010'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={12} />
              </span>
            </span>
          ))}
          <input
            ref={keywordInputRef}
            style={s.keywordInput}
            value={keywordInput}
            onChange={(e) => { setKeywordInput(e.target.value); setShowSuggestions(true); }}
            onKeyDown={handleKeywordKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={keywords.length === 0 ? 'Tapez un mot-clé et appuyez Entrée...' : 'Ajouter...'}
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div style={s.suggestions}>
              {filteredSuggestions.slice(0, 8).map(sg => (
                <div
                  key={sg}
                  style={s.suggestionItem}
                  onMouseDown={(e) => { e.preventDefault(); addKeyword(sg); }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#F3F4F6'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Plus size={12} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  {sg}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sources */}
      <div style={{ marginBottom: 20 }}>
        <label style={s.label}>Sources à scanner</label>
        <div style={s.sourceGrid}>
          {SOURCE_OPTIONS.map(src => {
            const Icon = src.icon;
            const selected = selectedSources.includes(src.id);
            return (
              <div
                key={src.id}
                style={s.sourceItem(selected, src.color)}
                onClick={() => toggleSource(src.id)}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: 4,
                  border: selected ? `2px solid ${src.color}` : (isDark ? '2px solid #475569' : '2px solid #D1D5DB'),
                  backgroundColor: selected ? src.color : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s', flexShrink: 0,
                }}>
                  {selected && <CheckCircle size={14} color="#fff" />}
                </div>
                <Icon size={18} color={selected ? src.color : (isDark ? '#64748b' : '#9CA3AF')} />
                <span style={{
                  fontSize: 14, fontWeight: selected ? 600 : 400,
                  color: selected ? (isDark ? '#e2e8f0' : '#1F2937') : (isDark ? '#94a3b8' : '#6B7280'),
                }}>
                  {src.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Langue + Période */}
      <div style={s.selectRow}>
        <div>
          <label style={s.label}>Langue</label>
          <select style={s.select} value={language} onChange={e => setLanguage(e.target.value)}>
            {LANGUAGE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={s.label}>Période</label>
          <select style={s.select} value={period} onChange={e => setPeriod(e.target.value)}>
            {PERIOD_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bouton scan */}
      <div style={{ marginTop: 24 }}>
        <button
          style={s.scanBtn}
          onClick={handleRunScan}
          disabled={scanning}
          onMouseEnter={e => { if (!scanning) e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {scanning ? (
            <>
              <Loader size={18} style={{ animation: 'cohrmSpin 1s linear infinite' }} />
              Scan en cours...
            </>
          ) : (
            <>
              <Play size={18} />
              Lancer le scan
            </>
          )}
        </button>
      </div>

      {/* Barre de progression */}
      {scanning && (
        <div style={s.progressContainer}>
          <div style={s.progressBar}>
            <div style={s.progressFill(scanProgress)} />
          </div>
          <div style={s.progressText}>
            {React.createElement(SCAN_PROGRESS_STEPS[scanStep]?.icon || Radar, {
              size: 16,
              style: { animation: 'cohrmPulse 1.5s ease-in-out infinite' },
            })}
            {SCAN_PROGRESS_STEPS[scanStep]?.text}
            <span style={{ marginLeft: 'auto', fontWeight: 600, color: COHRM_COLORS.primaryLight }}>
              {Math.round(scanProgress)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );

  // ============================================
  // RENDER - RESULTS
  // ============================================

  const renderResults = () => {
    if (visibleResults.length === 0 && !scanning) return null;

    return (
      <div ref={resultsRef}>
        <div style={s.card}>
          <div style={s.cardTitle}>
            <BarChart3 size={20} color={COHRM_COLORS.primaryLight} />
            Résultats du scan
            {results.length > 0 && (
              <span style={{
                marginLeft: 'auto', fontSize: 13, fontWeight: 500,
                color: isDark ? '#94a3b8' : '#6B7280',
              }}>
                {filteredResults.length} résultat{filteredResults.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Filter bar */}
          {visibleResults.length > 0 && (
            <div style={s.filterBar}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ArrowUpDown size={14} color={isDark ? '#64748b' : '#9CA3AF'} />
                <select
                  style={s.filterSelect}
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>Tri: {o.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Filter size={14} color={isDark ? '#64748b' : '#9CA3AF'} />
                <select
                  style={s.filterSelect}
                  value={filterSource}
                  onChange={e => setFilterSource(e.target.value)}
                >
                  <option value="all">Toutes sources</option>
                  <option value="news">Actualités</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={14} color={isDark ? '#64748b' : '#9CA3AF'} />
                <select
                  style={s.filterSelect}
                  value={minScore}
                  onChange={e => setMinScore(Number(e.target.value))}
                >
                  <option value={0}>Score min: 0</option>
                  <option value={30}>Score min: 30</option>
                  <option value={50}>Score min: 50</option>
                  <option value={70}>Score min: 70</option>
                </select>
              </div>
            </div>
          )}

          {/* Result cards */}
          {filteredResults.map(result => (
            <div key={result.id} style={s.resultCard(fadingOut[result.id])}>
              {/* Title */}
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                style={s.resultTitle}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                {result.title}
              </a>

              {/* Content */}
              <div style={s.resultContent}>
                {highlightKeywords(truncate(result.content), result.matched_keywords)}
              </div>

              {/* Meta row */}
              <div style={s.resultMeta}>
                {/* Source */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 10px', borderRadius: 20,
                  backgroundColor: isDark ? `${getSourceColor(result.source)}20` : `${getSourceColor(result.source)}10`,
                  color: getSourceColor(result.source), fontSize: 12, fontWeight: 500,
                }}>
                  {getSourceIcon(result.source)}
                  {getSourceLabel(result.source)}
                </span>

                {/* Score */}
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, color: getScoreColor(result.relevance_score) }}>
                    {Math.round((result.relevance_score || 0) * 100)}%
                  </span>
                  <div style={s.scoreBar}>
                    <div style={s.scoreFill(result.relevance_score || 0, getScoreColor(result.relevance_score))} />
                  </div>
                </span>

                {/* Author */}
                {result.author && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    par {result.author}
                  </span>
                )}

                {/* Date */}
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} />
                  {formatDate(result.created_at)}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  style={s.actionBtn('#27AE60', '#EAFAF1')}
                  onClick={() => handleConvert(result)}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(39,174,96,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <CheckCircle size={14} />
                  Convertir en rumeur
                </button>
                <button
                  style={s.actionBtn('#95A5A6', '#F2F3F4')}
                  onClick={() => handleIgnore(result.id)}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <XCircle size={14} />
                  Ignorer
                </button>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...s.actionBtn(COHRM_COLORS.primaryLight, '#EBF5FB'), textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <ExternalLink size={14} />
                  Voir la source
                </a>
              </div>
            </div>
          ))}

          {scanning && visibleResults.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: isDark ? '#64748b' : '#9CA3AF' }}>
              <Radar size={40} style={{ animation: 'cohrmPulse 1.5s ease-in-out infinite', marginBottom: 12 }} />
              <div style={{ fontSize: 14, fontWeight: 500 }}>Recherche en cours...</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER - HISTORY
  // ============================================

  const renderHistory = () => {
    // Stats globales
    const totalScans = historyPagination.total || 0;
    const totalResults = history.reduce((acc, h) => acc + (h.rumors_found || 0), 0);
    const totalConverted = history.reduce((acc, h) => acc + (h.rumors_created || 0), 0);
    const conversionRate = totalResults > 0 ? ((totalConverted / totalResults) * 100).toFixed(1) : 0;

    return (
      <div>
        {/* Stats globales */}
        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <div style={s.statValue}>{totalScans}</div>
            <div style={s.statLabel}>Total scans</div>
          </div>
          <div style={s.statCard}>
            <div style={{ ...s.statValue, color: '#F39C12' }}>{totalResults}</div>
            <div style={s.statLabel}>Résultats trouvés</div>
          </div>
          <div style={s.statCard}>
            <div style={{ ...s.statValue, color: '#27AE60' }}>{totalConverted}</div>
            <div style={s.statLabel}>Rumeurs créées</div>
          </div>
          <div style={s.statCard}>
            <div style={{ ...s.statValue, color: '#9B59B6' }}>{conversionRate}%</div>
            <div style={s.statLabel}>Taux de conversion</div>
          </div>
        </div>

        {/* Selected scan detail */}
        {selectedScan && (
          <div style={{ ...s.card, border: `2px solid ${COHRM_COLORS.primaryLight}40` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={s.cardTitle}>
                <Eye size={20} color={COHRM_COLORS.primaryLight} />
                Détail du scan #{selectedScan.id}
              </div>
              <button
                onClick={() => setSelectedScan(null)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
                  border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
                  backgroundColor: 'transparent',
                  color: isDark ? '#94a3b8' : '#6B7280',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Status counts */}
            {selectedScan.statusCounts && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                {Object.entries(selectedScan.statusCounts).map(([status, count]) => (
                  <span key={status} style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
                    border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
                    color: isDark ? '#e2e8f0' : '#374151',
                  }}>
                    {status === 'new' ? 'Nouveau' : status === 'reviewed' ? 'Revu' : status === 'converted' ? 'Converti' : 'Ignoré'}: {count}
                  </span>
                ))}
              </div>
            )}

            {/* Scan detail results */}
            {selectedScan.results?.map(result => (
              <div key={result.id} style={{
                padding: '14px 16px', marginBottom: 10, borderRadius: 10,
                backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
                border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #F3F4F6',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 14, fontWeight: 600, color: COHRM_COLORS.primaryLight, textDecoration: 'none' }}
                    >
                      {result.title}
                    </a>
                    <div style={{ fontSize: 12, color: isDark ? '#64748b' : '#9CA3AF', marginTop: 4 }}>
                      {truncate(result.content, 150)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      color: getSourceColor(result.source),
                      backgroundColor: isDark ? `${getSourceColor(result.source)}20` : `${getSourceColor(result.source)}10`,
                    }}>
                      {getSourceIcon(result.source)}
                      {getSourceLabel(result.source)}
                    </span>
                    <span style={{
                      fontWeight: 700, fontSize: 13,
                      color: getScoreColor(result.relevance_score),
                    }}>
                      {Math.round((result.relevance_score || 0) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Rumeurs créées */}
            {selectedScan.rumorsCreated?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#27AE60', marginBottom: 8 }}>
                  Rumeurs créées depuis ce scan:
                </div>
                {selectedScan.rumorsCreated.map(rum => (
                  <div key={rum.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px', borderRadius: 8, marginBottom: 4,
                    backgroundColor: isDark ? '#27AE6010' : '#EAFAF1',
                    fontSize: 13, color: isDark ? '#e2e8f0' : '#374151',
                  }}>
                    <CheckCircle size={14} color="#27AE60" />
                    <span style={{ fontWeight: 600, color: '#27AE60' }}>{rum.code}</span>
                    {rum.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedScanLoading && (
          <div style={{ ...s.card, textAlign: 'center', padding: 40 }}>
            <Loader
              size={28}
              style={{ animation: 'cohrmSpin 1s linear infinite', color: COHRM_COLORS.primaryLight }}
            />
            <div style={{ marginTop: 12, fontSize: 13, color: isDark ? '#94a3b8' : '#6B7280' }}>
              Chargement des détails...
            </div>
          </div>
        )}

        {/* History table */}
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={s.cardTitle}>
              <Clock size={20} color={COHRM_COLORS.primaryLight} />
              Historique des scans
            </div>
            <button
              onClick={() => loadHistory(historyPagination.page)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', border: 'none',
                color: COHRM_COLORS.primaryLight,
                backgroundColor: isDark ? `${COHRM_COLORS.primaryLight}20` : '#EBF5FB',
              }}
            >
              <RefreshCw size={14} />
              Actualiser
            </button>
          </div>

          {historyLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Loader
                size={28}
                style={{ animation: 'cohrmSpin 1s linear infinite', color: COHRM_COLORS.primaryLight }}
              />
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: isDark ? '#64748b' : '#9CA3AF' }}>
              <Radar size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
              <div style={{ fontSize: 14 }}>Aucun scan dans l'historique</div>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={s.historyTable}>
                  <thead>
                    <tr>
                      <th style={s.th}>Date</th>
                      <th style={s.th}>Mots-clés</th>
                      <th style={s.th}>Sources</th>
                      <th style={s.th}>Résultats</th>
                      <th style={s.th}>Rumeurs</th>
                      <th style={s.th}>Statut</th>
                      <th style={s.th}>Durée</th>
                      <th style={s.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(scan => (
                      <tr
                        key={scan.id}
                        style={{ cursor: 'pointer', transition: 'background-color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#F9FAFB'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={s.td}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>
                            {formatDate(scan.started_at || scan.created_at)}
                          </div>
                          <div style={{ fontSize: 11, color: isDark ? '#64748b' : '#9CA3AF' }}>
                            {formatRelativeDate(scan.started_at || scan.created_at)}
                          </div>
                        </td>
                        <td style={s.td}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {parseKeywords(scan.keywords).slice(0, 3).map((kw, i) => (
                              <span key={i} style={s.chip}>{kw}</span>
                            ))}
                            {parseKeywords(scan.keywords).length > 3 && (
                              <span style={{ ...s.chip, opacity: 0.7 }}>
                                +{parseKeywords(scan.keywords).length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={s.td}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '3px 8px', borderRadius: 20, fontSize: 11,
                            color: getSourceColor(scan.source),
                            backgroundColor: isDark ? `${getSourceColor(scan.source)}15` : `${getSourceColor(scan.source)}10`,
                          }}>
                            {getSourceIcon(scan.source)}
                            {scan.source === 'all' ? 'Toutes' : getSourceLabel(scan.source)}
                          </span>
                        </td>
                        <td style={s.td}>
                          <span style={{ fontWeight: 700, color: COHRM_COLORS.primaryLight }}>
                            {scan.rumors_found || 0}
                          </span>
                          <span style={{ fontSize: 11, color: isDark ? '#64748b' : '#9CA3AF' }}>
                            {' '}/ {scan.items_scanned || 0} scannés
                          </span>
                        </td>
                        <td style={s.td}>
                          <span style={{ fontWeight: 700, color: '#27AE60' }}>
                            {scan.rumors_created || 0}
                          </span>
                        </td>
                        <td style={s.td}>{getScanStatusBadge(scan.status)}</td>
                        <td style={{ ...s.td, fontSize: 12, color: isDark ? '#64748b' : '#9CA3AF' }}>
                          {scan.duration ? `${scan.duration}s` : '—'}
                        </td>
                        <td style={s.td}>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleViewScan(scan); }}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                              cursor: 'pointer', border: 'none',
                              color: COHRM_COLORS.primaryLight,
                              backgroundColor: isDark ? `${COHRM_COLORS.primaryLight}20` : '#EBF5FB',
                            }}
                          >
                            <Eye size={13} />
                            Détail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {historyPagination.pages > 1 && (
                <div style={s.paginationWrap}>
                  <span>
                    Page {historyPagination.page} sur {historyPagination.pages}
                    {' '}({historyPagination.total} scans)
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      style={s.pageBtn(historyPagination.page <= 1)}
                      disabled={historyPagination.page <= 1}
                      onClick={() => loadHistory(historyPagination.page - 1)}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      style={s.pageBtn(historyPagination.page >= historyPagination.pages)}
                      disabled={historyPagination.page >= historyPagination.pages}
                      onClick={() => loadHistory(historyPagination.page + 1)}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER PRINCIPAL
  // ============================================

  return (
    <div style={s.container}>
      {/* CSS Animations */}
      <style>{`
        @keyframes cohrmSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes cohrmPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes scanSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes radarSweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Simulation banner */}
      <div style={s.simBanner}>
        <Info size={16} />
        <span><strong>Mode simulation</strong> — Les résultats affichés sont pré-générés pour démonstration. Le scan réel sera connecté aux sources web ultérieurement.</span>
      </div>

      {/* Tab navigation */}
      <div style={s.tabs}>
        <div
          style={s.tab(activeTab === 'scan')}
          onClick={() => setActiveTab('scan')}
        >
          <Radar size={16} />
          Scanner
        </div>
        <div
          style={s.tab(activeTab === 'history')}
          onClick={() => setActiveTab('history')}
        >
          <Clock size={16} />
          Historique
        </div>
      </div>

      {/* Content */}
      {activeTab === 'scan' ? (
        <>
          {renderScanForm()}
          {renderResults()}
        </>
      ) : (
        renderHistory()
      )}
    </div>
  );
};

export default WebScanner;
