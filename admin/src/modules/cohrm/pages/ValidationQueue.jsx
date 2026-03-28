/**
 * ValidationQueue - File d'attente de validation COHRM
 *
 * Affiche la liste des rumeurs en attente de validation au niveau de l'utilisateur.
 * Inclut filtrage, tri, actions rapides inline et drawer de détail latéral.
 *
 * Props :
 *   - user (object) : utilisateur connecté
 *   - isDark (boolean) : mode sombre
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CheckCircle, X, Filter, Clock, AlertTriangle, MapPin,
  ChevronRight, Search, RotateCcw, Eye, ChevronDown,
  User, Calendar, ArrowUpRight, Loader2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getRumors, validateRumor, getValidations } from '../services/cohrmApi';
import { usePermissions } from '../hooks/usePermissions';
import { LoadingSpinner, PriorityBadge, StatusBadge } from '../components/shared';
import ValidationTimeline from '../components/ValidationTimeline';
import ValidationActions from '../components/ValidationActions';
import {
  VALIDATION_LEVELS, REGIONS_CAMEROON, PRIORITY_OPTIONS, COHRM_COLORS,
} from '../utils/constants';
import {
  formatDateTime, formatRelativeDate, formatRegion, truncateText,
} from '../utils/formatters';

const ValidationQueue = ({ user, isDark = false }) => {
  const { userLevel, canValidate } = usePermissions(user);

  // State
  const [rumors, setRumors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ region: '', priority: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRumor, setSelectedRumor] = useState(null);
  const [drawerValidations, setDrawerValidations] = useState([]);
  const [loadingDrawer, setLoadingDrawer] = useState(false);

  // Fade-out animations
  const [fadingIds, setFadingIds] = useState(new Set());

  // Inline action loading
  const [inlineLoading, setInlineLoading] = useState({});

  // Charger les rumeurs en attente
  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRumors({
        status: 'pending',
        validation_level: userLevel,
        limit: 200,
      });
      if (response.success) {
        setRumors(response.data || []);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userLevel]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Filtrage et tri des rumeurs
  const filteredRumors = useMemo(() => {
    let result = [...rumors];

    // Filtrer par région
    if (filters.region) {
      result = result.filter(r => r.region === filters.region);
    }

    // Filtrer par priorité
    if (filters.priority) {
      result = result.filter(r => r.priority === filters.priority);
    }

    // Recherche textuelle
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r =>
        (r.title && r.title.toLowerCase().includes(term)) ||
        (r.description && r.description.toLowerCase().includes(term)) ||
        (r.id && String(r.id).includes(term))
      );
    }

    // Tri : critique/high en premier, puis par ancienneté
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    result.sort((a, b) => {
      const pa = priorityOrder[a.priority] ?? 4;
      const pb = priorityOrder[b.priority] ?? 4;
      if (pa !== pb) return pa - pb;
      return new Date(a.created_at) - new Date(b.created_at);
    });

    return result;
  }, [rumors, filters, searchTerm]);

  // Calculer le temps d'attente en heures
  const getWaitHours = (dateStr) => {
    if (!dateStr) return 0;
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60));
  };

  // Action rapide inline
  const handleInlineAction = async (rumorId, action) => {
    setInlineLoading(prev => ({ ...prev, [rumorId]: action }));
    try {
      await validateRumor(rumorId, { action });
      toast.success(action === 'validate' ? 'Rumeur validée' : 'Rumeur rejetée');

      // Animation fade-out puis suppression
      setFadingIds(prev => new Set([...prev, rumorId]));
      setTimeout(() => {
        setRumors(prev => prev.filter(r => r.id !== rumorId));
        setFadingIds(prev => {
          const next = new Set(prev);
          next.delete(rumorId);
          return next;
        });
      }, 400);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setInlineLoading(prev => ({ ...prev, [rumorId]: null }));
    }
  };

  // Ouvrir le drawer
  const openDrawer = async (rumor) => {
    setSelectedRumor(rumor);
    setDrawerOpen(true);
    setLoadingDrawer(true);
    try {
      const response = await getValidations(rumor.id);
      if (response.success) {
        setDrawerValidations(response.data || []);
      }
    } catch (err) {
      console.error('Erreur chargement validations:', err);
    } finally {
      setLoadingDrawer(false);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      setSelectedRumor(null);
      setDrawerValidations([]);
    }, 300);
  };

  // Callback après action dans le drawer
  const handleDrawerActionComplete = () => {
    closeDrawer();
    fetchQueue();
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({ region: '', priority: '' });
    setSearchTerm('');
  };

  const levelInfo = VALIDATION_LEVELS.find(l => l.level === userLevel) || {};

  // --- Styles ---
  const s = {
    container: {
      padding: 0,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: 800,
      color: isDark ? '#e2e8f0' : '#1f2937',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: isDark ? '#94a3b8' : '#6B7280',
    },
    counter: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 18px',
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(52, 152, 219, 0.15)' : '#EBF5FB',
      color: isDark ? '#93c5fd' : '#1B4F72',
      fontSize: 15,
      fontWeight: 700,
      marginTop: 12,
    },
    counterNum: {
      fontSize: 22,
      fontWeight: 800,
    },
    // Barre de filtres
    filtersRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
      flexWrap: 'wrap',
    },
    searchWrapper: {
      display: 'flex',
      alignItems: 'center',
      flex: '1 1 250px',
      minWidth: 200,
      position: 'relative',
    },
    searchInput: {
      width: '100%',
      padding: '10px 14px 10px 40px',
      borderRadius: 10,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: isDark ? '#0f172a' : '#fff',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 14,
      outline: 'none',
      boxSizing: 'border-box',
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
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 13,
      outline: 'none',
      cursor: 'pointer',
      minWidth: 140,
    },
    resetBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '10px 14px',
      borderRadius: 10,
      border: 'none',
      backgroundColor: isDark ? '#334155' : '#E5E7EB',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 13,
      fontWeight: 500,
      cursor: 'pointer',
    },
    // Tableau style inbox
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
    tr: (isHovered, isUrgent, isFading) => ({
      backgroundColor: isFading
        ? (isDark ? 'rgba(39, 174, 96, 0.1)' : '#EAFAF1')
        : isHovered
          ? (isDark ? '#334155' : '#F9FAFB')
          : isUrgent
            ? (isDark ? 'rgba(231, 76, 60, 0.05)' : '#FFF5F5')
            : 'transparent',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      opacity: isFading ? 0 : 1,
      transform: isFading ? 'translateX(20px)' : 'none',
    }),
    td: {
      padding: '12px 16px',
      borderBottom: isDark ? '1px solid #1e293b' : '1px solid #F3F4F6',
      color: isDark ? '#e2e8f0' : '#374151',
      verticalAlign: 'middle',
    },
    rumorId: {
      fontSize: 12,
      fontWeight: 600,
      color: isDark ? '#64748b' : '#9CA3AF',
      fontFamily: 'monospace',
    },
    rumorTitle: {
      fontSize: 14,
      fontWeight: 600,
      color: isDark ? '#e2e8f0' : '#1f2937',
      marginBottom: 2,
    },
    rumorMeta: {
      fontSize: 12,
      color: isDark ? '#64748b' : '#9CA3AF',
    },
    waitBadge: (isUrgent) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      backgroundColor: isUrgent
        ? (isDark ? 'rgba(231, 76, 60, 0.15)' : '#FDEDEC')
        : (isDark ? 'rgba(243, 156, 18, 0.15)' : '#FEF9E7'),
      color: isUrgent
        ? (isDark ? '#fca5a5' : '#E74C3C')
        : (isDark ? '#fbbf24' : '#F39C12'),
      animation: isUrgent ? 'cohrmBlink 1s ease-in-out infinite' : 'none',
    }),
    inlineActions: {
      display: 'flex',
      gap: 6,
    },
    inlineBtn: (color, isHovered) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
      borderRadius: 8,
      border: 'none',
      backgroundColor: isHovered ? color : `${color}15`,
      color: isHovered ? '#fff' : color,
      cursor: 'pointer',
      transition: 'all 0.15s',
    }),
    // Drawer
    drawerOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      zIndex: 9999,
      animation: 'cohrmQFadeIn 0.2s ease-out',
    },
    drawer: (open) => ({
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '480px',
      maxWidth: '90vw',
      backgroundColor: isDark ? '#1e293b' : '#fff',
      boxShadow: '-4px 0 30px rgba(0, 0, 0, 0.2)',
      zIndex: 10000,
      transform: open ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s ease-out',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }),
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '20px 24px',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      flexShrink: 0,
    },
    drawerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#1f2937',
    },
    drawerClose: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 36,
      height: 36,
      borderRadius: 10,
      border: 'none',
      backgroundColor: isDark ? '#334155' : '#F3F4F6',
      color: isDark ? '#e2e8f0' : '#374151',
      cursor: 'pointer',
    },
    drawerBody: {
      flex: 1,
      overflowY: 'auto',
      padding: '24px',
    },
    drawerSection: {
      marginBottom: 24,
    },
    drawerSectionTitle: {
      fontSize: 13,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: isDark ? '#94a3b8' : '#6B7280',
      marginBottom: 12,
    },
    drawerField: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #F3F4F6',
    },
    drawerFieldLabel: {
      fontSize: 13,
      color: isDark ? '#64748b' : '#9CA3AF',
    },
    drawerFieldValue: {
      fontSize: 13,
      fontWeight: 600,
      color: isDark ? '#e2e8f0' : '#374151',
      textAlign: 'right',
      maxWidth: '60%',
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      textAlign: 'center',
    },
    emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: '50%',
      backgroundColor: isDark ? 'rgba(39, 174, 96, 0.1)' : '#EAFAF1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#1f2937',
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: isDark ? '#94a3b8' : '#6B7280',
      maxWidth: 360,
    },
  };

  // --- Loading state ---
  if (loading) {
    return <LoadingSpinner isDark={isDark} text="Chargement de la file d'attente..." />;
  }

  // --- Error state ---
  if (error) {
    return (
      <div style={s.emptyState}>
        <div style={{ ...s.emptyIcon, backgroundColor: isDark ? 'rgba(231, 76, 60, 0.1)' : '#FDEDEC' }}>
          <AlertTriangle size={36} color="#E74C3C" />
        </div>
        <div style={s.emptyTitle}>Erreur de chargement</div>
        <div style={s.emptyText}>{error}</div>
        <button
          style={{ ...s.resetBtn, marginTop: 16 }}
          onClick={fetchQueue}
        >
          <RotateCcw size={14} /> Réessayer
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes cohrmBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes cohrmQFadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div style={s.container}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.title}>
            File d'attente de validation — Niveau {userLevel}
          </div>
          <div style={s.subtitle}>
            {levelInfo.name} • {levelInfo.role}
          </div>
          <div style={s.counter}>
            <span style={s.counterNum}>{filteredRumors.length}</span>
            rumeur{filteredRumors.length !== 1 ? 's' : ''} en attente à votre niveau
          </div>
        </div>

        {/* Filtres */}
        <div style={s.filtersRow}>
          <div style={s.searchWrapper}>
            <Search size={18} style={s.searchIcon} />
            <input
              style={s.searchInput}
              type="text"
              placeholder="Rechercher par ID, titre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            style={s.select}
            value={filters.region}
            onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
          >
            <option value="">Toutes les régions</option>
            {REGIONS_CAMEROON.map(r => (
              <option key={r.code} value={r.name}>{r.name}</option>
            ))}
          </select>
          <select
            style={s.select}
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
          >
            <option value="">Toutes les priorités</option>
            {PRIORITY_OPTIONS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          {(filters.region || filters.priority || searchTerm) && (
            <button style={s.resetBtn} onClick={resetFilters}>
              <RotateCcw size={14} /> Réinitialiser
            </button>
          )}
        </div>

        {/* Tableau ou état vide */}
        {filteredRumors.length === 0 ? (
          <div style={s.tableWrapper}>
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>
                <CheckCircle size={36} color="#27AE60" />
              </div>
              <div style={s.emptyTitle}>Aucune rumeur en attente</div>
              <div style={s.emptyText}>
                Toutes les rumeurs de votre niveau ont été traitées. Bravo !
              </div>
            </div>
          </div>
        ) : (
          <QueueTable
            rumors={filteredRumors}
            fadingIds={fadingIds}
            inlineLoading={inlineLoading}
            isDark={isDark}
            s={s}
            onRowClick={openDrawer}
            onInlineAction={handleInlineAction}
            getWaitHours={getWaitHours}
          />
        )}
      </div>

      {/* Drawer overlay */}
      {drawerOpen && (
        <div style={s.drawerOverlay} onClick={closeDrawer} />
      )}

      {/* Drawer */}
      <div style={s.drawer(drawerOpen)}>
        {selectedRumor && (
          <>
            <div style={s.drawerHeader}>
              <div style={s.drawerTitle}>
                Rumeur #{selectedRumor.id}
              </div>
              <button style={s.drawerClose} onClick={closeDrawer}>
                <X size={20} />
              </button>
            </div>
            <div style={s.drawerBody}>
              {/* Infos de la rumeur */}
              <div style={s.drawerSection}>
                <div style={s.drawerSectionTitle}>Informations</div>
                <div style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: isDark ? '#e2e8f0' : '#1f2937',
                  marginBottom: 12,
                }}>
                  {selectedRumor.title}
                </div>
                {selectedRumor.description && (
                  <div style={{
                    fontSize: 14,
                    color: isDark ? '#94a3b8' : '#6B7280',
                    lineHeight: 1.6,
                    marginBottom: 16,
                  }}>
                    {selectedRumor.description}
                  </div>
                )}
                <div style={s.drawerField}>
                  <span style={s.drawerFieldLabel}>Région</span>
                  <span style={s.drawerFieldValue}>{selectedRumor.region || '—'}</span>
                </div>
                <div style={s.drawerField}>
                  <span style={s.drawerFieldLabel}>Priorité</span>
                  <span style={s.drawerFieldValue}>
                    <PriorityBadge value={selectedRumor.priority} size="sm" />
                  </span>
                </div>
                <div style={s.drawerField}>
                  <span style={s.drawerFieldLabel}>Statut</span>
                  <span style={s.drawerFieldValue}>
                    <StatusBadge value={selectedRumor.status} size="sm" />
                  </span>
                </div>
                <div style={s.drawerField}>
                  <span style={s.drawerFieldLabel}>Créée le</span>
                  <span style={s.drawerFieldValue}>{formatDateTime(selectedRumor.created_at)}</span>
                </div>
                <div style={s.drawerField}>
                  <span style={s.drawerFieldLabel}>Source</span>
                  <span style={s.drawerFieldValue}>{selectedRumor.source || '—'}</span>
                </div>
              </div>

              {/* Timeline de validation */}
              <div style={s.drawerSection}>
                <div style={s.drawerSectionTitle}>Progression de validation</div>
                {loadingDrawer ? (
                  <LoadingSpinner isDark={isDark} size="sm" text="Chargement..." />
                ) : (
                  <ValidationTimeline
                    validations={drawerValidations}
                    currentLevel={selectedRumor.validation_level || 1}
                    status={selectedRumor.status}
                    isDark={isDark}
                  />
                )}
              </div>

              {/* Actions de validation */}
              <div style={s.drawerSection}>
                <div style={s.drawerSectionTitle}>Actions</div>
                <ValidationActions
                  rumorId={selectedRumor.id}
                  currentLevel={selectedRumor.validation_level || 1}
                  user={user}
                  isDark={isDark}
                  onActionComplete={handleDrawerActionComplete}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

// --- Sous-composant Tableau ---
const QueueTable = ({
  rumors, fadingIds, inlineLoading, isDark, s,
  onRowClick, onInlineAction, getWaitHours,
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredAction, setHoveredAction] = useState(null);

  return (
    <div style={s.tableWrapper}>
      <div style={{ overflowX: 'auto' }}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={{ ...s.th, width: 70 }}>ID</th>
              <th style={s.th}>Titre</th>
              <th style={{ ...s.th, width: 130 }}>Région</th>
              <th style={{ ...s.th, width: 100 }}>Priorité</th>
              <th style={{ ...s.th, width: 140 }}>Attente</th>
              <th style={{ ...s.th, width: 140 }}>Validateur préc.</th>
              <th style={{ ...s.th, width: 100, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rumors.map((rumor, idx) => {
              const waitHours = getWaitHours(rumor.created_at);
              const isUrgent = waitHours >= 24;
              const isFading = fadingIds.has(rumor.id);

              return (
                <tr
                  key={rumor.id}
                  style={s.tr(hoveredRow === idx, isUrgent, isFading)}
                  onMouseEnter={() => setHoveredRow(idx)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => onRowClick(rumor)}
                >
                  <td style={s.td}>
                    <span style={s.rumorId}>#{rumor.id}</span>
                  </td>
                  <td style={s.td}>
                    <div style={s.rumorTitle}>{truncateText(rumor.title, 60)}</div>
                    <div style={s.rumorMeta}>
                      {rumor.source && <span>{rumor.source}</span>}
                      {rumor.category && <span> • {rumor.category}</span>}
                    </div>
                  </td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={13} color={isDark ? '#64748b' : '#9CA3AF'} />
                      <span style={{ fontSize: 13 }}>{rumor.region || '—'}</span>
                    </div>
                  </td>
                  <td style={s.td}>
                    <PriorityBadge value={rumor.priority} size="sm" />
                  </td>
                  <td style={s.td}>
                    <span style={s.waitBadge(isUrgent)}>
                      <Clock size={13} />
                      {waitHours < 1
                        ? '< 1h'
                        : waitHours < 24
                          ? `${waitHours}h`
                          : `${Math.floor(waitHours / 24)}j ${waitHours % 24}h`
                      }
                    </span>
                  </td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: isDark ? '#334155' : '#E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <User size={13} color={isDark ? '#94a3b8' : '#6B7280'} />
                      </div>
                      <span style={{ fontSize: 13 }}>
                        {rumor.last_validator_name || '—'}
                      </span>
                    </div>
                  </td>
                  <td style={{ ...s.td, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <div style={s.inlineActions}>
                      {/* Valider rapide */}
                      <button
                        title="Valider"
                        style={s.inlineBtn('#27AE60', hoveredAction === `v-${rumor.id}`)}
                        onMouseEnter={() => setHoveredAction(`v-${rumor.id}`)}
                        onMouseLeave={() => setHoveredAction(null)}
                        onClick={() => onInlineAction(rumor.id, 'validate')}
                        disabled={!!inlineLoading[rumor.id]}
                      >
                        {inlineLoading[rumor.id] === 'validate'
                          ? <Loader2 size={15} style={{ animation: 'cohrmBlink 0.6s linear infinite' }} />
                          : <CheckCircle size={15} />
                        }
                      </button>
                      {/* Rejeter rapide */}
                      <button
                        title="Rejeter"
                        style={s.inlineBtn('#E74C3C', hoveredAction === `r-${rumor.id}`)}
                        onMouseEnter={() => setHoveredAction(`r-${rumor.id}`)}
                        onMouseLeave={() => setHoveredAction(null)}
                        onClick={() => onInlineAction(rumor.id, 'reject')}
                        disabled={!!inlineLoading[rumor.id]}
                      >
                        {inlineLoading[rumor.id] === 'reject'
                          ? <Loader2 size={15} style={{ animation: 'cohrmBlink 0.6s linear infinite' }} />
                          : <X size={15} />
                        }
                      </button>
                      {/* Voir détail */}
                      <button
                        title="Voir détail"
                        style={s.inlineBtn(isDark ? '#94a3b8' : '#6B7280', hoveredAction === `e-${rumor.id}`)}
                        onMouseEnter={() => setHoveredAction(`e-${rumor.id}`)}
                        onMouseLeave={() => setHoveredAction(null)}
                        onClick={() => onRowClick(rumor)}
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ValidationQueue;
