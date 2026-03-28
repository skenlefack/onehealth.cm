/**
 * ActorsList - Page de gestion des acteurs COHRM
 *
 * Fonctionnalités :
 * - Vue tableau et vue grille (cards)
 * - Filtres : recherche texte, niveau, région, actif/inactif
 * - Export CSV
 * - Navigation vers création/détail/édition
 * - Toggle actif/inactif inline
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search, Plus, Download, List, LayoutGrid, Filter, X, RotateCcw, RefreshCw,
  Phone, Mail, Edit2, Eye, UserX, UserCheck, ChevronDown, ChevronLeft,
  ChevronRight, Users, MapPin, Building2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import useCohrmStore from '../stores/cohrmStore';
import { getActors, deactivateActor, updateActor } from '../services/cohrmApi';
import { COHRM_COLORS, REGIONS_CAMEROON, ACTOR_TYPES, VALIDATION_LEVELS } from '../utils/constants';
import { formatDate, formatValidationLevel } from '../utils/formatters';
import { LoadingSpinner, EmptyState, ConfirmModal } from '../components/shared';

// Couleurs par niveau d'acteur
const LEVEL_COLORS = {
  1: { bg: '#EBF5FB', color: '#2980B9', label: 'Niveau 1' },
  2: { bg: '#EAFAF1', color: '#27AE60', label: 'Niveau 2' },
  3: { bg: '#FEF9E7', color: '#F39C12', label: 'Niveau 3' },
  4: { bg: '#FDF2E9', color: '#E67E22', label: 'Niveau 4' },
  5: { bg: '#FDEDEC', color: '#E74C3C', label: 'Niveau 5' },
};

// Couleurs d'avatar basées sur les initiales
const AVATAR_COLORS = [
  '#1B4F72', '#2980B9', '#27AE60', '#F39C12', '#E74C3C',
  '#9B59B6', '#E67E22', '#16A085', '#2C3E50', '#8E44AD',
];

const getAvatarColor = (name) => {
  if (!name) return AVATAR_COLORS[0];
  const charCode = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
  return AVATAR_COLORS[charCode % AVATAR_COLORS.length];
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
};

const getActorTypeLabel = (type, level) => {
  const levelTypes = ACTOR_TYPES[level] || [];
  const found = levelTypes.find(t => t.value === type);
  if (found) return found.label;
  // Chercher dans tous les niveaux
  for (const types of Object.values(ACTOR_TYPES)) {
    const f = types.find(t => t.value === type);
    if (f) return f.label;
  }
  return type || '—';
};

/**
 * @param {object} props
 * @param {boolean} props.isDark - Mode sombre
 * @param {object} props.user - Utilisateur connecté
 */
const ActorsList = ({ isDark, user }) => {
  const { setActivePage } = useCohrmStore();

  // State local
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [searchText, setSearchText] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterActive, setFilterActive] = useState('true');
  const [showFilters, setShowFilters] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, actor: null, action: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Charger les acteurs
  const loadActors = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterLevel) params.level = filterLevel;
      if (filterRegion) params.region = filterRegion;
      if (filterActive) params.is_active = filterActive;
      const response = await getActors(params);
      if (response.success) {
        setActors(response.data || []);
      }
    } catch (err) {
      toast.error('Erreur lors du chargement des acteurs');
    } finally {
      setLoading(false);
    }
  }, [filterLevel, filterRegion, filterActive]);

  useEffect(() => {
    loadActors();
  }, [loadActors]);

  // Filtrage local par recherche texte
  const filteredActors = useMemo(() => {
    if (!searchText.trim()) return actors;
    const q = searchText.toLowerCase();
    return actors.filter(a =>
      (a.user_name || '').toLowerCase().includes(q) ||
      (a.organization || '').toLowerCase().includes(q) ||
      (a.role_in_org || '').toLowerCase().includes(q) ||
      (a.email || '').toLowerCase().includes(q) ||
      (a.phone || '').includes(q) ||
      (a.region || '').toLowerCase().includes(q)
    );
  }, [actors, searchText]);

  // Pagination
  const totalPages = Math.ceil(filteredActors.length / pageSize);
  const paginatedActors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredActors.slice(start, start + pageSize);
  }, [filteredActors, currentPage]);

  // Reset page quand filtres changent
  useEffect(() => { setCurrentPage(1); }, [searchText, filterLevel, filterRegion, filterActive]);

  // Compteur de filtres actifs
  const activeFilterCount = [filterLevel, filterRegion, filterActive !== 'true' ? filterActive : ''].filter(Boolean).length;

  // Toggle actif/inactif
  const handleToggleActive = async (actor) => {
    setConfirmModal({
      open: true,
      actor,
      action: actor.is_active ? 'deactivate' : 'reactivate',
    });
  };

  const confirmToggle = async () => {
    const { actor, action } = confirmModal;
    setActionLoading(true);
    try {
      if (action === 'deactivate') {
        await deactivateActor(actor.id);
        toast.success(`${actor.user_name || 'Acteur'} désactivé`);
      } else {
        await updateActor(actor.id, { is_active: true });
        toast.success(`${actor.user_name || 'Acteur'} réactivé`);
      }
      loadActors();
    } catch (err) {
      toast.error('Erreur lors de la modification');
    } finally {
      setActionLoading(false);
      setConfirmModal({ open: false, actor: null, action: '' });
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredActors.length === 0) {
      toast.warn('Aucun acteur à exporter');
      return;
    }
    const headers = ['Nom', 'Niveau', 'Type', 'Organisation', 'Rôle', 'Région', 'Département', 'District', 'Téléphone', 'Email', 'Statut', 'Date création'];
    const rows = filteredActors.map(a => [
      a.user_name || '',
      a.actor_level || '',
      getActorTypeLabel(a.actor_type, a.actor_level),
      a.organization || '',
      a.role_in_org || '',
      a.region || '',
      a.department || '',
      a.district || '',
      a.phone || '',
      a.email || '',
      a.is_active ? 'Actif' : 'Inactif',
      a.created_at ? new Date(a.created_at).toLocaleDateString('fr-FR') : '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `acteurs_cohrm_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${filteredActors.length} acteurs exportés`);
  };

  // Reset filtres
  const resetFilters = () => {
    setSearchText('');
    setFilterLevel('');
    setFilterRegion('');
    setFilterActive('true');
  };

  // Styles
  const s = {
    container: {
      padding: 0,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
      flexWrap: 'wrap',
      gap: 16,
    },
    titleSection: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    titleIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: isDark ? `${COHRM_COLORS.primary}30` : '#EBF5FB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 22,
      fontWeight: 700,
      color: isDark ? COHRM_COLORS.darkText : '#1f2937',
    },
    subtitle: {
      fontSize: 13,
      color: isDark ? COHRM_COLORS.darkMuted : '#6B7280',
      marginTop: 2,
    },
    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    btn: (variant = 'secondary') => ({
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 18px',
      borderRadius: 10,
      border: variant === 'primary' ? 'none' : (isDark ? '1px solid #334155' : '1px solid #D1D5DB'),
      backgroundColor: variant === 'primary' ? COHRM_COLORS.primary : 'transparent',
      color: variant === 'primary' ? '#fff' : (isDark ? COHRM_COLORS.darkText : '#374151'),
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
    viewToggle: (active) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 38,
      height: 38,
      borderRadius: 8,
      border: 'none',
      backgroundColor: active ? COHRM_COLORS.primary : (isDark ? '#334155' : '#F3F4F6'),
      color: active ? '#fff' : (isDark ? COHRM_COLORS.darkMuted : '#6B7280'),
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
    // Filtres
    filterBar: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
      flexWrap: 'wrap',
    },
    searchWrapper: {
      display: 'flex',
      alignItems: 'center',
      flex: '1 1 300px',
      minWidth: 220,
      position: 'relative',
    },
    searchInput: {
      width: '100%',
      padding: '10px 14px 10px 40px',
      borderRadius: 10,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: isDark ? '#0f172a' : '#fff',
      color: isDark ? COHRM_COLORS.darkText : '#374151',
      fontSize: 14,
      outline: 'none',
    },
    searchIcon: {
      position: 'absolute',
      left: 12,
      color: isDark ? '#64748b' : '#9CA3AF',
      pointerEvents: 'none',
    },
    select: {
      padding: '10px 14px',
      borderRadius: 10,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: isDark ? '#0f172a' : '#fff',
      color: isDark ? COHRM_COLORS.darkText : '#374151',
      fontSize: 14,
      outline: 'none',
      cursor: 'pointer',
      minWidth: 140,
    },
    activeToggle: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '10px 16px',
      borderRadius: 10,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: isActive
        ? (isDark ? '#27AE6020' : '#EAFAF1')
        : (isDark ? '#E74C3C20' : '#FDEDEC'),
      color: isActive ? '#27AE60' : '#E74C3C',
      fontSize: 14,
      fontWeight: 500,
      cursor: 'pointer',
    }),
    filterToggleBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '10px 16px',
      borderRadius: 10,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: activeFilterCount > 0 ? (isDark ? '#1B4F7220' : '#EBF5FB') : 'transparent',
      color: isDark ? COHRM_COLORS.darkText : '#374151',
      fontSize: 14,
      fontWeight: 500,
      cursor: 'pointer',
    },
    filterBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 20,
      height: 20,
      borderRadius: '50%',
      backgroundColor: COHRM_COLORS.primary,
      color: '#fff',
      fontSize: 11,
      fontWeight: 700,
    },
    filtersPanel: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12,
      padding: 16,
      marginBottom: 16,
      borderRadius: 12,
      backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      flex: '1 1 180px',
    },
    filterLabel: {
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: isDark ? '#94a3b8' : '#6B7280',
    },
    // Tableau
    tableWrapper: {
      borderRadius: 12,
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      overflow: 'hidden',
      backgroundColor: isDark ? '#1e293b' : '#fff',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 14,
    },
    th: {
      padding: '12px 16px',
      textAlign: 'left',
      fontWeight: 600,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: isDark ? '#94a3b8' : '#6B7280',
      backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      whiteSpace: 'nowrap',
    },
    td: {
      padding: '12px 16px',
      borderBottom: isDark ? '1px solid #1e293b' : '1px solid #F3F4F6',
      color: isDark ? COHRM_COLORS.darkText : '#374151',
      verticalAlign: 'middle',
    },
    tr: (isHovered) => ({
      backgroundColor: isHovered ? (isDark ? '#334155' : '#F9FAFB') : 'transparent',
      transition: 'background-color 0.15s',
    }),
    // Badges
    levelBadge: (level) => {
      const c = LEVEL_COLORS[level] || LEVEL_COLORS[1];
      return {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 10px',
        borderRadius: 20,
        backgroundColor: isDark ? `${c.color}20` : c.bg,
        color: c.color,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      };
    },
    statusSwitch: (isActive) => ({
      position: 'relative',
      width: 40,
      height: 22,
      borderRadius: 11,
      backgroundColor: isActive ? '#27AE60' : (isDark ? '#475569' : '#D1D5DB'),
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      border: 'none',
      padding: 0,
    }),
    switchKnob: (isActive) => ({
      position: 'absolute',
      top: 2,
      left: isActive ? 20 : 2,
      width: 18,
      height: 18,
      borderRadius: '50%',
      backgroundColor: '#fff',
      transition: 'left 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    }),
    // Avatar
    avatar: (color) => ({
      width: 36,
      height: 36,
      borderRadius: '50%',
      backgroundColor: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: 13,
      fontWeight: 700,
      flexShrink: 0,
    }),
    nameCell: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    },
    nameText: {
      fontWeight: 600,
      color: isDark ? COHRM_COLORS.darkText : '#1f2937',
    },
    nameRole: {
      fontSize: 12,
      color: isDark ? COHRM_COLORS.darkMuted : '#6B7280',
    },
    // Actions
    actionBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
      borderRadius: 8,
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      color: isDark ? COHRM_COLORS.darkMuted : '#6B7280',
      transition: 'all 0.2s',
    },
    phoneLink: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      color: COHRM_COLORS.primaryLight,
      textDecoration: 'none',
      fontSize: 13,
    },
    // Grid
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: 16,
    },
    card: (isHovered) => ({
      padding: 20,
      borderRadius: 14,
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      border: isDark ? `1px solid ${isHovered ? '#475569' : COHRM_COLORS.darkBorder}` : `1px solid ${isHovered ? '#D1D5DB' : '#E5E7EB'}`,
      transition: 'all 0.2s',
      transform: isHovered ? 'translateY(-2px)' : 'none',
      boxShadow: isHovered ? '0 4px 16px rgba(0,0,0,0.08)' : 'none',
      cursor: 'pointer',
    }),
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      marginBottom: 16,
    },
    cardAvatar: (color) => ({
      width: 52,
      height: 52,
      borderRadius: 14,
      backgroundColor: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: 18,
      fontWeight: 700,
      flexShrink: 0,
    }),
    cardName: {
      fontSize: 16,
      fontWeight: 700,
      color: isDark ? COHRM_COLORS.darkText : '#1f2937',
    },
    cardRole: {
      fontSize: 13,
      color: isDark ? COHRM_COLORS.darkMuted : '#6B7280',
      marginTop: 2,
    },
    cardInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 13,
      color: isDark ? COHRM_COLORS.darkMuted : '#6B7280',
      marginBottom: 6,
    },
    cardActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 16,
      paddingTop: 14,
      borderTop: isDark ? '1px solid #334155' : '1px solid #F3F4F6',
    },
    cardBtn: (variant = 'ghost') => ({
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 12px',
      borderRadius: 8,
      border: variant === 'ghost' ? 'none' : (isDark ? '1px solid #334155' : '1px solid #D1D5DB'),
      backgroundColor: variant === 'primary' ? COHRM_COLORS.primary : 'transparent',
      color: variant === 'primary' ? '#fff' : (isDark ? COHRM_COLORS.darkMuted : '#6B7280'),
      fontSize: 12,
      fontWeight: 500,
      cursor: 'pointer',
    }),
    // Pagination
    pagination: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderTop: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
      fontSize: 13,
      color: isDark ? '#94a3b8' : '#6B7280',
    },
    pageBtn: (disabled) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
      borderRadius: 6,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: 'transparent',
      color: isDark ? COHRM_COLORS.darkText : '#374151',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
    }),
    pageNum: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
      borderRadius: 6,
      border: 'none',
      backgroundColor: isActive ? COHRM_COLORS.primary : 'transparent',
      color: isActive ? '#fff' : (isDark ? COHRM_COLORS.darkText : '#374151'),
      cursor: 'pointer',
      fontWeight: isActive ? 600 : 400,
      fontSize: 13,
    }),
    // Stats bar
    statsBar: {
      display: 'flex',
      gap: 16,
      marginBottom: 20,
      flexWrap: 'wrap',
    },
    statCard: {
      flex: '1 1 150px',
      padding: '14px 18px',
      borderRadius: 12,
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 700,
      color: isDark ? COHRM_COLORS.darkText : '#1f2937',
    },
    statLabel: {
      fontSize: 12,
      color: isDark ? COHRM_COLORS.darkMuted : '#6B7280',
      marginTop: 2,
    },
  };

  // Page numbers pour pagination
  const getPageNumbers = () => {
    const range = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  };

  // Stats rapides
  const stats = useMemo(() => {
    const total = actors.length;
    const active = actors.filter(a => a.is_active).length;
    const byLevel = {};
    actors.forEach(a => {
      byLevel[a.actor_level] = (byLevel[a.actor_level] || 0) + 1;
    });
    return { total, active, inactive: total - active, byLevel };
  }, [actors]);

  return (
    <div style={s.container}>
      {/* En-tête */}
      <div style={s.header}>
        <div style={s.titleSection}>
          <div style={s.titleIcon}>
            <Users size={22} color={COHRM_COLORS.primaryLight} />
          </div>
          <div>
            <div style={s.title}>Acteurs COHRM</div>
            <div style={s.subtitle}>
              {filteredActors.length} acteur{filteredActors.length !== 1 ? 's' : ''}
              {searchText && ` pour "${searchText}"`}
            </div>
          </div>
        </div>
        <div style={s.actions}>
          <div style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 10, backgroundColor: isDark ? '#0f172a' : '#F3F4F6' }}>
            <button style={s.viewToggle(viewMode === 'table')} onClick={() => setViewMode('table')} title="Vue tableau">
              <List size={18} />
            </button>
            <button style={s.viewToggle(viewMode === 'grid')} onClick={() => setViewMode('grid')} title="Vue grille">
              <LayoutGrid size={18} />
            </button>
          </div>
          <button
            style={s.btn('secondary')}
            onClick={handleExportCSV}
            title="Exporter en CSV"
          >
            <Download size={16} />
            <span style={{ display: 'none', '@media (min-width: 768px)': { display: 'inline' } }}>Export</span>
          </button>
          <button style={s.btn('secondary')} onClick={loadActors} title="Actualiser">
            <RefreshCw size={16} />
          </button>
          <button
            style={s.btn('primary')}
            onClick={() => setActivePage('actor-create')}
          >
            <Plus size={16} />
            Nouvel acteur
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <div style={s.statsBar}>
        <div style={s.statCard}>
          <div style={s.statValue}>{stats.total}</div>
          <div style={s.statLabel}>Total acteurs</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statValue, color: '#27AE60' }}>{stats.active}</div>
          <div style={s.statLabel}>Actifs</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statValue, color: '#E74C3C' }}>{stats.inactive}</div>
          <div style={s.statLabel}>Inactifs</div>
        </div>
        {Object.entries(stats.byLevel).sort(([a], [b]) => a - b).map(([level, count]) => (
          <div key={level} style={s.statCard}>
            <div style={{ ...s.statValue, color: (LEVEL_COLORS[level] || LEVEL_COLORS[1]).color }}>{count}</div>
            <div style={s.statLabel}>{formatValidationLevel(Number(level)).name}</div>
          </div>
        ))}
      </div>

      {/* Barre de filtres */}
      <div style={s.filterBar}>
        <div style={s.searchWrapper}>
          <Search size={18} style={s.searchIcon} />
          <input
            style={s.searchInput}
            type="text"
            placeholder="Rechercher un acteur (nom, email, organisation...)"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {searchText && (
            <button
              onClick={() => setSearchText('')}
              style={{ position: 'absolute', right: 10, background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#94a3b8' : '#9CA3AF', display: 'flex' }}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button style={s.filterToggleBtn} onClick={() => setShowFilters(!showFilters)}>
          <Filter size={16} />
          Filtres
          {activeFilterCount > 0 && <span style={s.filterBadge}>{activeFilterCount}</span>}
          <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
        {(activeFilterCount > 0 || searchText) && (
          <button
            style={{ ...s.btn('secondary'), padding: '8px 14px', fontSize: 13 }}
            onClick={resetFilters}
          >
            <RotateCcw size={14} />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Panneau filtres dépliable */}
      {showFilters && (
        <div style={s.filtersPanel}>
          <div style={s.filterGroup}>
            <label style={s.filterLabel}>Niveau</label>
            <select style={s.select} value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
              <option value="">Tous les niveaux</option>
              {VALIDATION_LEVELS.map(v => (
                <option key={v.level} value={v.level}>Niveau {v.level} — {v.name}</option>
              ))}
            </select>
          </div>
          <div style={s.filterGroup}>
            <label style={s.filterLabel}>Région</label>
            <select style={s.select} value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)}>
              <option value="">Toutes les régions</option>
              {REGIONS_CAMEROON.map(r => (
                <option key={r.code} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>
          <div style={s.filterGroup}>
            <label style={s.filterLabel}>Statut</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                style={s.activeToggle(filterActive === 'true')}
                onClick={() => setFilterActive(filterActive === 'true' ? '' : 'true')}
              >
                <UserCheck size={14} />
                Actifs
              </button>
              <button
                style={s.activeToggle(filterActive === 'false')}
                onClick={() => setFilterActive(filterActive === 'false' ? '' : 'false')}
              >
                <UserX size={14} />
                Inactifs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenu */}
      {loading ? (
        <LoadingSpinner isDark={isDark} text="Chargement des acteurs..." />
      ) : filteredActors.length === 0 ? (
        <EmptyState
          variant={searchText ? 'search' : 'empty'}
          title={searchText ? 'Aucun acteur trouvé' : 'Aucun acteur'}
          message={searchText ? 'Essayez de modifier vos critères de recherche.' : 'Commencez par ajouter un nouvel acteur au système.'}
          action={() => searchText ? resetFilters() : setActivePage('actor-create')}
          actionLabel={searchText ? 'Réinitialiser' : 'Créer un acteur'}
          isDark={isDark}
        />
      ) : viewMode === 'table' ? (
        /* ========== VUE TABLEAU ========== */
        <div style={s.tableWrapper}>
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Acteur</th>
                  <th style={s.th}>Niveau</th>
                  <th style={s.th}>Type</th>
                  <th style={s.th}>Organisation</th>
                  <th style={s.th}>Région</th>
                  <th style={{ ...s.th, textAlign: 'center' }}>Statut</th>
                  <th style={s.th}>Téléphone</th>
                  <th style={{ ...s.th, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedActors.map((actor, idx) => {
                  const color = getAvatarColor(actor.user_name);
                  return (
                    <tr
                      key={actor.id}
                      style={s.tr(hoveredRow === idx)}
                      onMouseEnter={() => setHoveredRow(idx)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td style={s.td}>
                        <div style={s.nameCell}>
                          <div style={s.avatar(color)}>
                            {getInitials(actor.user_name)}
                          </div>
                          <div>
                            <div style={s.nameText}>{actor.user_name || '—'}</div>
                            <div style={s.nameRole}>{actor.role_in_org || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={s.td}>
                        <span style={s.levelBadge(actor.actor_level)}>
                          N{actor.actor_level}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{ fontSize: 13 }}>
                          {getActorTypeLabel(actor.actor_type, actor.actor_level)}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Building2 size={14} style={{ color: isDark ? '#64748b' : '#9CA3AF', flexShrink: 0 }} />
                          <span style={{ fontSize: 13 }}>{actor.organization || '—'}</span>
                        </div>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <MapPin size={14} style={{ color: isDark ? '#64748b' : '#9CA3AF', flexShrink: 0 }} />
                          <span style={{ fontSize: 13 }}>{actor.region || '—'}</span>
                        </div>
                      </td>
                      <td style={{ ...s.td, textAlign: 'center' }}>
                        <button
                          style={s.statusSwitch(actor.is_active)}
                          onClick={(e) => { e.stopPropagation(); handleToggleActive(actor); }}
                          title={actor.is_active ? 'Désactiver' : 'Réactiver'}
                        >
                          <div style={s.switchKnob(actor.is_active)} />
                        </button>
                      </td>
                      <td style={s.td}>
                        {actor.phone ? (
                          <a href={`tel:${actor.phone}`} style={s.phoneLink} onClick={(e) => e.stopPropagation()}>
                            <Phone size={14} />
                            {actor.phone}
                          </a>
                        ) : (
                          <span style={{ fontSize: 13, color: isDark ? '#64748b' : '#9CA3AF' }}>—</span>
                        )}
                      </td>
                      <td style={{ ...s.td, textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <button
                            style={s.actionBtn}
                            onClick={(e) => { e.stopPropagation(); setActivePage('actor-detail', { actorId: actor.id }); }}
                            title="Voir le détail"
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#F3F4F6'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            style={s.actionBtn}
                            onClick={(e) => { e.stopPropagation(); setActivePage('actor-edit', { actorId: actor.id }); }}
                            title="Modifier"
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#F3F4F6'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            style={{ ...s.actionBtn, color: actor.is_active ? '#E74C3C' : '#27AE60' }}
                            onClick={(e) => { e.stopPropagation(); handleToggleActive(actor); }}
                            title={actor.is_active ? 'Désactiver' : 'Réactiver'}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#F3F4F6'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                          >
                            {actor.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={s.pagination}>
              <span>
                {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredActors.length)} sur {filteredActors.length}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  style={s.pageBtn(currentPage <= 1)}
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                {getPageNumbers().map(num => (
                  <button key={num} style={s.pageNum(num === currentPage)} onClick={() => setCurrentPage(num)}>
                    {num}
                  </button>
                ))}
                <button
                  style={s.pageBtn(currentPage >= totalPages)}
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========== VUE GRILLE ========== */
        <>
          <div style={s.grid}>
            {paginatedActors.map((actor, idx) => {
              const color = getAvatarColor(actor.user_name);
              const levelInfo = LEVEL_COLORS[actor.actor_level] || LEVEL_COLORS[1];
              return (
                <div
                  key={actor.id}
                  style={s.card(hoveredCard === idx)}
                  onMouseEnter={() => setHoveredCard(idx)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => setActivePage('actor-detail', { actorId: actor.id })}
                >
                  <div style={s.cardHeader}>
                    <div style={s.cardAvatar(color)}>
                      {getInitials(actor.user_name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={s.cardName}>{actor.user_name || '—'}</div>
                      <div style={s.cardRole}>{actor.role_in_org || getActorTypeLabel(actor.actor_type, actor.actor_level)}</div>
                    </div>
                    <span style={s.levelBadge(actor.actor_level)}>N{actor.actor_level}</span>
                  </div>

                  <div style={s.cardInfo}>
                    <Building2 size={14} />
                    {actor.organization || '—'}
                  </div>
                  <div style={s.cardInfo}>
                    <MapPin size={14} />
                    {actor.region || '—'}
                    {actor.department && ` > ${actor.department}`}
                  </div>
                  {actor.phone && (
                    <div style={s.cardInfo}>
                      <Phone size={14} />
                      <a
                        href={`tel:${actor.phone}`}
                        style={{ color: COHRM_COLORS.primaryLight, textDecoration: 'none' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {actor.phone}
                      </a>
                    </div>
                  )}
                  {actor.email && (
                    <div style={s.cardInfo}>
                      <Mail size={14} />
                      {actor.email}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '3px 10px',
                      borderRadius: 12,
                      backgroundColor: actor.is_active ? (isDark ? '#27AE6020' : '#EAFAF1') : (isDark ? '#E74C3C20' : '#FDEDEC'),
                      color: actor.is_active ? '#27AE60' : '#E74C3C',
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {actor.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>

                  <div style={s.cardActions}>
                    <button
                      style={s.cardBtn('ghost')}
                      onClick={(e) => { e.stopPropagation(); setActivePage('actor-detail', { actorId: actor.id }); }}
                    >
                      <Eye size={14} /> Voir
                    </button>
                    <button
                      style={s.cardBtn('ghost')}
                      onClick={(e) => { e.stopPropagation(); setActivePage('actor-edit', { actorId: actor.id }); }}
                    >
                      <Edit2 size={14} /> Modifier
                    </button>
                    <div style={{ flex: 1 }} />
                    <button
                      style={{ ...s.cardBtn('ghost'), color: actor.is_active ? '#E74C3C' : '#27AE60' }}
                      onClick={(e) => { e.stopPropagation(); handleToggleActive(actor); }}
                    >
                      {actor.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination grille */}
          {totalPages > 1 && (
            <div style={{ ...s.pagination, marginTop: 16, borderRadius: 12, border: isDark ? '1px solid #334155' : '1px solid #E5E7EB', backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff' }}>
              <span>
                {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredActors.length)} sur {filteredActors.length}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button style={s.pageBtn(currentPage <= 1)} disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>
                  <ChevronLeft size={16} />
                </button>
                {getPageNumbers().map(num => (
                  <button key={num} style={s.pageNum(num === currentPage)} onClick={() => setCurrentPage(num)}>
                    {num}
                  </button>
                ))}
                <button style={s.pageBtn(currentPage >= totalPages)} disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal confirmation */}
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, actor: null, action: '' })}
        onConfirm={confirmToggle}
        title={confirmModal.action === 'deactivate' ? 'Désactiver l\'acteur' : 'Réactiver l\'acteur'}
        message={
          confirmModal.action === 'deactivate'
            ? `Voulez-vous vraiment désactiver ${confirmModal.actor?.user_name || 'cet acteur'} ? Il ne pourra plus effectuer de validations.`
            : `Voulez-vous réactiver ${confirmModal.actor?.user_name || 'cet acteur'} ?`
        }
        confirmLabel={confirmModal.action === 'deactivate' ? 'Désactiver' : 'Réactiver'}
        variant={confirmModal.action === 'deactivate' ? 'danger' : 'info'}
        isDark={isDark}
        loading={actionLoading}
      />
    </div>
  );
};

export default ActorsList;
