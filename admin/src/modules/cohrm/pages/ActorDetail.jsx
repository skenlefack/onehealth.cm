/**
 * ActorDetail - Page de détail d'un acteur COHRM
 *
 * Sections :
 * - En-tête : avatar, nom, niveau, type, organisation
 * - Informations complètes
 * - Historique des validations
 * - KPIs personnels + graphique d'activité 30 jours
 * - Actions : Modifier, Désactiver/Réactiver, Envoyer un message
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, Edit2, UserX, UserCheck, MessageCircle, Phone, Mail,
  MapPin, Building2, Shield, Calendar, Clock, CheckCircle, XCircle,
  ArrowUpRight, TrendingUp, BarChart3, Activity, AlertTriangle,
  ExternalLink, Radio, Hash, Loader,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { toast } from 'react-toastify';
import useCohrmStore from '../stores/cohrmStore';
import { getActor, deactivateActor, updateActor } from '../services/cohrmApi';
import {
  COHRM_COLORS, VALIDATION_LEVELS, ACTOR_TYPES, TRANSMISSION_CHANNELS,
} from '../utils/constants';
import { formatDate, formatDateTime, formatRelativeDate, formatValidationLevel, formatNumber, formatDuration } from '../utils/formatters';
import { LoadingSpinner, ConfirmModal } from '../components/shared';

// Couleurs par niveau
const LEVEL_COLORS = {
  1: { bg: '#EBF5FB', color: '#2980B9' },
  2: { bg: '#EAFAF1', color: '#27AE60' },
  3: { bg: '#FEF9E7', color: '#F39C12' },
  4: { bg: '#FDF2E9', color: '#E67E22' },
  5: { bg: '#FDEDEC', color: '#E74C3C' },
};

const AVATAR_COLORS = [
  '#1B4F72', '#2980B9', '#27AE60', '#F39C12', '#E74C3C',
  '#9B59B6', '#E67E22', '#16A085', '#2C3E50', '#8E44AD',
];
const getAvatarColor = (name) => {
  if (!name) return AVATAR_COLORS[0];
  const c = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
  return AVATAR_COLORS[c % AVATAR_COLORS.length];
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
  for (const types of Object.values(ACTOR_TYPES)) {
    const f = types.find(t => t.value === type);
    if (f) return f.label;
  }
  return type || '—';
};

const getChannelLabel = (value) => {
  const found = TRANSMISSION_CHANNELS.find(c => c.value === value);
  return found?.label || value;
};

const ACTION_LABELS = {
  validated: { label: 'Validé', color: '#27AE60', bg: '#EAFAF1', icon: CheckCircle },
  rejected: { label: 'Rejeté', color: '#E74C3C', bg: '#FDEDEC', icon: XCircle },
  escalated: { label: 'Escaladé', color: '#F39C12', bg: '#FEF9E7', icon: ArrowUpRight },
};

/**
 * @param {object} props
 * @param {boolean} props.isDark
 * @param {object} props.user
 */
const ActorDetail = ({ isDark, user }) => {
  const { selectedActorId, setActivePage } = useCohrmStore();
  const [actor, setActor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ open: false, action: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'history' | 'stats'

  // Charger l'acteur
  useEffect(() => {
    if (!selectedActorId) {
      setActivePage('actors');
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const response = await getActor(selectedActorId);
        if (response.success) {
          setActor(response.data);
        } else {
          toast.error('Acteur introuvable');
          setActivePage('actors');
        }
      } catch (err) {
        toast.error('Erreur lors du chargement');
        setActivePage('actors');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedActorId, setActivePage]);

  // KPIs calculés
  const kpis = useMemo(() => {
    if (!actor?.recent_validations) return { total: 0, avgTime: 0, rejectionRate: 0, chartData: [] };

    const validations = actor.recent_validations;
    const total = validations.length;

    // Taux de rejet
    const rejected = validations.filter(v => v.status === 'rejected' || v.action_type === 'rejected').length;
    const rejectionRate = total > 0 ? (rejected / total * 100) : 0;

    // Temps moyen (simulé basé sur les timestamps)
    let totalHours = 0;
    let countWithTime = 0;
    validations.forEach(v => {
      if (v.validated_at && v.created_at) {
        const diff = new Date(v.validated_at) - new Date(v.created_at);
        if (diff > 0) {
          totalHours += diff / (1000 * 60 * 60);
          countWithTime++;
        }
      }
    });
    const avgTime = countWithTime > 0 ? Math.round(totalHours / countWithTime * 60) : 0; // en minutes

    // Graphique d'activité 30 derniers jours
    const now = new Date();
    const days = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(5, 10); // MM-DD
      days[key] = 0;
    }
    validations.forEach(v => {
      const date = new Date(v.validated_at || v.created_at);
      const diff = (now - date) / (1000 * 60 * 60 * 24);
      if (diff <= 30) {
        const key = date.toISOString().slice(5, 10);
        if (key in days) days[key]++;
      }
    });
    const chartData = Object.entries(days).map(([day, count]) => ({ day, count }));

    return { total, avgTime, rejectionRate, chartData };
  }, [actor]);

  // Actions
  const handleToggleActive = () => {
    setConfirmModal({
      open: true,
      action: actor.is_active ? 'deactivate' : 'reactivate',
    });
  };

  const confirmToggle = async () => {
    setActionLoading(true);
    try {
      if (confirmModal.action === 'deactivate') {
        await deactivateActor(actor.id);
        toast.success('Acteur désactivé');
        setActor(prev => ({ ...prev, is_active: false }));
      } else {
        await updateActor(actor.id, { is_active: true });
        toast.success('Acteur réactivé');
        setActor(prev => ({ ...prev, is_active: true }));
      }
    } catch (err) {
      toast.error('Erreur lors de la modification');
    } finally {
      setActionLoading(false);
      setConfirmModal({ open: false, action: '' });
    }
  };

  // Styles
  const s = {
    container: { maxWidth: 1000, margin: '0 auto' },
    // Back header
    topBar: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 24,
    },
    backBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 40,
      height: 40,
      borderRadius: 10,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: 'transparent',
      color: isDark ? COHRM_COLORS.darkText : '#374151',
      cursor: 'pointer',
    },
    breadcrumb: {
      fontSize: 13,
      color: isDark ? COHRM_COLORS.darkMuted : '#6B7280',
    },
    breadcrumbLink: {
      color: COHRM_COLORS.primaryLight,
      cursor: 'pointer',
      textDecoration: 'none',
    },
    // Hero card
    heroCard: {
      padding: 28,
      borderRadius: 16,
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
      marginBottom: 20,
    },
    heroContent: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 20,
      flexWrap: 'wrap',
    },
    heroAvatar: (color) => ({
      width: 72,
      height: 72,
      borderRadius: 18,
      backgroundColor: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: 26,
      fontWeight: 700,
      flexShrink: 0,
    }),
    heroInfo: {
      flex: 1,
      minWidth: 200,
    },
    heroName: {
      fontSize: 24,
      fontWeight: 700,
      color: isDark ? COHRM_COLORS.darkText : '#1f2937',
      marginBottom: 4,
    },
    heroMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
      marginTop: 8,
    },
    levelBadge: (level) => {
      const c = LEVEL_COLORS[level] || LEVEL_COLORS[1];
      return {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 14px',
        borderRadius: 20,
        backgroundColor: isDark ? `${c.color}20` : c.bg,
        color: c.color,
        fontSize: 13,
        fontWeight: 600,
      };
    },
    typeBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 14px',
      borderRadius: 20,
      backgroundColor: isDark ? '#1B4F7220' : '#EBF5FB',
      color: COHRM_COLORS.primaryLight,
      fontSize: 13,
      fontWeight: 500,
    },
    statusBadge: (isActive) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 14px',
      borderRadius: 20,
      backgroundColor: isActive ? (isDark ? '#27AE6020' : '#EAFAF1') : (isDark ? '#E74C3C20' : '#FDEDEC'),
      color: isActive ? '#27AE60' : '#E74C3C',
      fontSize: 13,
      fontWeight: 600,
    }),
    heroActions: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      alignSelf: 'flex-start',
    },
    actionBtn: (variant = 'secondary') => ({
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 18px',
      borderRadius: 10,
      border: variant === 'primary' ? 'none' : (isDark ? '1px solid #334155' : '1px solid #D1D5DB'),
      backgroundColor: variant === 'primary' ? COHRM_COLORS.primary : 'transparent',
      color: variant === 'primary' ? '#fff' : (variant === 'danger' ? '#E74C3C' : (isDark ? COHRM_COLORS.darkText : '#374151')),
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
    // Tabs
    tabs: {
      display: 'flex',
      gap: 0,
      marginBottom: 20,
      borderRadius: 12,
      overflow: 'hidden',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    tab: (isActive) => ({
      flex: 1,
      padding: '12px 20px',
      textAlign: 'center',
      fontSize: 14,
      fontWeight: 600,
      color: isActive ? COHRM_COLORS.primary : (isDark ? COHRM_COLORS.darkMuted : '#6B7280'),
      backgroundColor: isActive ? (isDark ? '#1B4F7215' : '#EBF5FB') : (isDark ? COHRM_COLORS.darkCard : '#fff'),
      borderBottom: isActive ? `2px solid ${COHRM_COLORS.primary}` : '2px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    }),
    // Info card
    card: {
      padding: 24,
      borderRadius: 16,
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 700,
      color: isDark ? COHRM_COLORS.darkText : '#1f2937',
      marginBottom: 16,
      paddingBottom: 12,
      borderBottom: isDark ? '1px solid #334155' : '1px solid #F3F4F6',
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: 16,
    },
    infoItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
    },
    infoIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: isDark ? '#334155' : '#F3F4F6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    infoLabel: {
      fontSize: 12,
      color: isDark ? COHRM_COLORS.darkMuted : '#6B7280',
      marginBottom: 2,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: 600,
      color: isDark ? COHRM_COLORS.darkText : '#1f2937',
    },
    // KPI cards
    kpiGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 16,
      marginBottom: 24,
    },
    kpiCard: (accentColor) => ({
      padding: 20,
      borderRadius: 14,
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
      borderLeft: `4px solid ${accentColor}`,
    }),
    kpiValue: {
      fontSize: 28,
      fontWeight: 700,
      color: isDark ? COHRM_COLORS.darkText : '#1f2937',
    },
    kpiLabel: {
      fontSize: 13,
      color: isDark ? COHRM_COLORS.darkMuted : '#6B7280',
      marginTop: 4,
    },
    kpiIcon: (color) => ({
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: `${color}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    }),
    // History table
    histTable: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 14,
    },
    histTh: {
      padding: '10px 14px',
      textAlign: 'left',
      fontWeight: 600,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: isDark ? '#94a3b8' : '#6B7280',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    histTd: {
      padding: '10px 14px',
      borderBottom: isDark ? '1px solid #1e293b' : '1px solid #F3F4F6',
      color: isDark ? COHRM_COLORS.darkText : '#374151',
    },
    actionBadge: (type) => {
      const info = ACTION_LABELS[type] || { label: type, color: '#95A5A6', bg: '#F2F3F4' };
      return {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 10px',
        borderRadius: 12,
        backgroundColor: isDark ? `${info.color}20` : info.bg,
        color: info.color,
        fontSize: 12,
        fontWeight: 600,
      };
    },
    rumorLink: {
      color: COHRM_COLORS.primaryLight,
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 13,
    },
    // Chart
    chartWrapper: {
      height: 250,
      marginTop: 8,
    },
  };

  if (loading) {
    return <LoadingSpinner isDark={isDark} text="Chargement de l'acteur..." />;
  }

  if (!actor) return null;

  const avatarColor = getAvatarColor(actor.user_name);
  const levelInfo = formatValidationLevel(actor.actor_level);
  const channels = actor.transmission_channel ? actor.transmission_channel.split(',').map(c => c.trim()).filter(Boolean) : ['system'];

  return (
    <div style={s.container}>
      {/* Navigation */}
      <div style={s.topBar}>
        <button style={s.backBtn} onClick={() => setActivePage('actors')}>
          <ArrowLeft size={18} />
        </button>
        <div style={s.breadcrumb}>
          <span style={s.breadcrumbLink} onClick={() => setActivePage('actors')}>Acteurs</span>
          {' > '}
          <span>{actor.user_name || 'Détail'}</span>
        </div>
      </div>

      {/* Hero Card */}
      <div style={s.heroCard}>
        <div style={s.heroContent}>
          <div style={s.heroAvatar(avatarColor)}>
            {getInitials(actor.user_name)}
          </div>
          <div style={s.heroInfo}>
            <div style={s.heroName}>{actor.user_name || '—'}</div>
            <div style={{ fontSize: 14, color: isDark ? COHRM_COLORS.darkMuted : '#6B7280' }}>
              {actor.role_in_org || getActorTypeLabel(actor.actor_type, actor.actor_level)}
              {actor.organization && ` — ${actor.organization}`}
            </div>
            <div style={s.heroMeta}>
              <span style={s.levelBadge(actor.actor_level)}>
                <Shield size={14} />
                Niveau {actor.actor_level} — {levelInfo.name}
              </span>
              <span style={s.typeBadge}>
                {getActorTypeLabel(actor.actor_type, actor.actor_level)}
              </span>
              <span style={s.statusBadge(actor.is_active)}>
                {actor.is_active ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
          <div style={s.heroActions}>
            <button
              style={s.actionBtn('primary')}
              onClick={() => setActivePage('actor-edit', { actorId: actor.id })}
            >
              <Edit2 size={15} />
              Modifier
            </button>
            <button
              style={s.actionBtn(actor.is_active ? 'danger' : 'secondary')}
              onClick={handleToggleActive}
            >
              {actor.is_active ? <UserX size={15} /> : <UserCheck size={15} />}
              {actor.is_active ? 'Désactiver' : 'Réactiver'}
            </button>
            {actor.phone && (
              <a
                href={`tel:${actor.phone}`}
                style={{ ...s.actionBtn('secondary'), textDecoration: 'none' }}
              >
                <MessageCircle size={15} />
                Contacter
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        <div style={s.tab(activeTab === 'info')} onClick={() => setActiveTab('info')}>
          <Building2 size={16} />
          Informations
        </div>
        <div style={s.tab(activeTab === 'history')} onClick={() => setActiveTab('history')}>
          <Clock size={16} />
          Historique
          {actor.recent_validations?.length > 0 && (
            <span style={{
              padding: '1px 8px', borderRadius: 10,
              backgroundColor: isDark ? '#334155' : '#E5E7EB',
              fontSize: 11, fontWeight: 700,
            }}>
              {actor.recent_validations.length}
            </span>
          )}
        </div>
        <div style={s.tab(activeTab === 'stats')} onClick={() => setActiveTab('stats')}>
          <BarChart3 size={16} />
          Statistiques
        </div>
      </div>

      {/* Tab : Informations */}
      {activeTab === 'info' && (
        <div style={s.card}>
          <div style={s.sectionTitle}>Informations complètes</div>
          <div style={s.infoGrid}>
            <div style={s.infoItem}>
              <div style={s.infoIcon}><Shield size={16} color={isDark ? '#94a3b8' : '#6B7280'} /></div>
              <div>
                <div style={s.infoLabel}>Niveau</div>
                <div style={s.infoValue}>Niveau {actor.actor_level} — {levelInfo.name}</div>
              </div>
            </div>
            <div style={s.infoItem}>
              <div style={s.infoIcon}><Hash size={16} color={isDark ? '#94a3b8' : '#6B7280'} /></div>
              <div>
                <div style={s.infoLabel}>Type d'acteur</div>
                <div style={s.infoValue}>{getActorTypeLabel(actor.actor_type, actor.actor_level)}</div>
              </div>
            </div>
            <div style={s.infoItem}>
              <div style={s.infoIcon}><Building2 size={16} color={isDark ? '#94a3b8' : '#6B7280'} /></div>
              <div>
                <div style={s.infoLabel}>Organisation</div>
                <div style={s.infoValue}>{actor.organization || '—'}</div>
              </div>
            </div>
            <div style={s.infoItem}>
              <div style={s.infoIcon}><Activity size={16} color={isDark ? '#94a3b8' : '#6B7280'} /></div>
              <div>
                <div style={s.infoLabel}>Rôle / Fonction</div>
                <div style={s.infoValue}>{actor.role_in_org || '—'}</div>
              </div>
            </div>
            <div style={s.infoItem}>
              <div style={s.infoIcon}><MapPin size={16} color={isDark ? '#94a3b8' : '#6B7280'} /></div>
              <div>
                <div style={s.infoLabel}>Localisation</div>
                <div style={s.infoValue}>
                  {[actor.region, actor.department, actor.district].filter(Boolean).join(' > ') || '—'}
                </div>
              </div>
            </div>
            <div style={s.infoItem}>
              <div style={s.infoIcon}><Phone size={16} color={isDark ? '#94a3b8' : '#6B7280'} /></div>
              <div>
                <div style={s.infoLabel}>Téléphone</div>
                <div style={s.infoValue}>
                  {actor.phone ? (
                    <a href={`tel:${actor.phone}`} style={{ color: COHRM_COLORS.primaryLight, textDecoration: 'none' }}>
                      {actor.phone}
                    </a>
                  ) : '—'}
                </div>
              </div>
            </div>
            <div style={s.infoItem}>
              <div style={s.infoIcon}><Mail size={16} color={isDark ? '#94a3b8' : '#6B7280'} /></div>
              <div>
                <div style={s.infoLabel}>Email</div>
                <div style={s.infoValue}>
                  {actor.email || actor.user_email ? (
                    <a href={`mailto:${actor.email || actor.user_email}`} style={{ color: COHRM_COLORS.primaryLight, textDecoration: 'none' }}>
                      {actor.email || actor.user_email}
                    </a>
                  ) : '—'}
                </div>
              </div>
            </div>
            <div style={s.infoItem}>
              <div style={s.infoIcon}><Radio size={16} color={isDark ? '#94a3b8' : '#6B7280'} /></div>
              <div>
                <div style={s.infoLabel}>Canaux de transmission</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {channels.map(ch => (
                    <span key={ch} style={{
                      padding: '3px 10px', borderRadius: 12,
                      backgroundColor: isDark ? '#334155' : '#F3F4F6',
                      color: isDark ? COHRM_COLORS.darkText : '#374151',
                      fontSize: 12, fontWeight: 500,
                    }}>
                      {getChannelLabel(ch)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div style={s.infoItem}>
              <div style={s.infoIcon}><Calendar size={16} color={isDark ? '#94a3b8' : '#6B7280'} /></div>
              <div>
                <div style={s.infoLabel}>Inscrit le</div>
                <div style={s.infoValue}>{formatDate(actor.created_at)}</div>
              </div>
            </div>
            <div style={s.infoItem}>
              <div style={s.infoIcon}><Clock size={16} color={isDark ? '#94a3b8' : '#6B7280'} /></div>
              <div>
                <div style={s.infoLabel}>Dernière mise à jour</div>
                <div style={s.infoValue}>{formatRelativeDate(actor.updated_at)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab : Historique des validations */}
      {activeTab === 'history' && (
        <div style={s.card}>
          <div style={s.sectionTitle}>Historique des validations</div>
          {(!actor.recent_validations || actor.recent_validations.length === 0) ? (
            <div style={{ textAlign: 'center', padding: 40, color: isDark ? COHRM_COLORS.darkMuted : '#9CA3AF' }}>
              <Clock size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Aucune validation</div>
              <div style={{ fontSize: 13 }}>Cet acteur n'a pas encore effectué de validation.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={s.histTable}>
                <thead>
                  <tr>
                    <th style={s.histTh}>Rumeur</th>
                    <th style={s.histTh}>Action</th>
                    <th style={s.histTh}>Niveau</th>
                    <th style={s.histTh}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {actor.recent_validations.map((v, idx) => {
                    const actionInfo = ACTION_LABELS[v.status] || ACTION_LABELS[v.action_type] || { label: v.status || v.action_type || '—', color: '#95A5A6', bg: '#F2F3F4' };
                    const Icon = actionInfo.icon || CheckCircle;
                    return (
                      <tr key={v.id || idx}>
                        <td style={s.histTd}>
                          <div
                            style={s.rumorLink}
                            onClick={() => {
                              if (v.rumor_id) {
                                useCohrmStore.getState().setActivePage('rumor-detail', { rumorId: v.rumor_id });
                              }
                            }}
                          >
                            {v.rumor_code || v.rumor_title || `#${v.rumor_id}`}
                            <ExternalLink size={12} />
                          </div>
                          {v.rumor_title && v.rumor_code && (
                            <div style={{ fontSize: 12, color: isDark ? COHRM_COLORS.darkMuted : '#9CA3AF', marginTop: 2 }}>
                              {v.rumor_title}
                            </div>
                          )}
                        </td>
                        <td style={s.histTd}>
                          <span style={s.actionBadge(v.status || v.action_type)}>
                            <Icon size={12} />
                            {actionInfo.label}
                          </span>
                        </td>
                        <td style={s.histTd}>
                          <span style={{
                            padding: '2px 8px', borderRadius: 8,
                            backgroundColor: isDark ? '#334155' : '#F3F4F6',
                            fontSize: 12, fontWeight: 600,
                          }}>
                            N{v.level}
                          </span>
                        </td>
                        <td style={s.histTd}>
                          <div style={{ fontSize: 13 }}>{formatDateTime(v.validated_at || v.created_at)}</div>
                          <div style={{ fontSize: 11, color: isDark ? COHRM_COLORS.darkMuted : '#9CA3AF' }}>
                            {formatRelativeDate(v.validated_at || v.created_at)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab : Statistiques */}
      {activeTab === 'stats' && (
        <>
          {/* KPIs */}
          <div style={s.kpiGrid}>
            <div style={s.kpiCard(COHRM_COLORS.primaryLight)}>
              <div style={s.kpiIcon(COHRM_COLORS.primaryLight)}>
                <CheckCircle size={20} color={COHRM_COLORS.primaryLight} />
              </div>
              <div style={s.kpiValue}>{formatNumber(kpis.total)}</div>
              <div style={s.kpiLabel}>Validations totales</div>
            </div>
            <div style={s.kpiCard('#F39C12')}>
              <div style={s.kpiIcon('#F39C12')}>
                <Clock size={20} color="#F39C12" />
              </div>
              <div style={s.kpiValue}>{kpis.avgTime > 0 ? formatDuration(kpis.avgTime) : '—'}</div>
              <div style={s.kpiLabel}>Temps moyen de traitement</div>
            </div>
            <div style={s.kpiCard('#E74C3C')}>
              <div style={s.kpiIcon('#E74C3C')}>
                <XCircle size={20} color="#E74C3C" />
              </div>
              <div style={s.kpiValue}>{kpis.total > 0 ? `${kpis.rejectionRate.toFixed(1)}%` : '—'}</div>
              <div style={s.kpiLabel}>Taux de rejet</div>
            </div>
            <div style={s.kpiCard('#27AE60')}>
              <div style={s.kpiIcon('#27AE60')}>
                <TrendingUp size={20} color="#27AE60" />
              </div>
              <div style={s.kpiValue}>
                {kpis.chartData.filter(d => d.count > 0).length}
              </div>
              <div style={s.kpiLabel}>Jours actifs (30 j.)</div>
            </div>
          </div>

          {/* Graphique d'activité */}
          <div style={s.card}>
            <div style={s.sectionTitle}>
              <Activity size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
              Activité des 30 derniers jours
            </div>
            {kpis.total === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: isDark ? COHRM_COLORS.darkMuted : '#9CA3AF' }}>
                <BarChart3 size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                <div style={{ fontSize: 14 }}>Aucune activité récente à afficher.</div>
              </div>
            ) : (
              <div style={s.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={kpis.chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? '#334155' : '#F3F4F6'}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#9CA3AF' }}
                      tickLine={false}
                      axisLine={false}
                      interval={4}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#9CA3AF' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1e293b' : '#fff',
                        border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
                        borderRadius: 8,
                        fontSize: 13,
                        color: isDark ? '#e2e8f0' : '#374151',
                      }}
                      formatter={(value) => [`${value} validation(s)`, 'Activité']}
                      labelFormatter={(label) => `Jour : ${label}`}
                    />
                    <Bar
                      dataKey="count"
                      fill={COHRM_COLORS.primaryLight}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal confirmation */}
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, action: '' })}
        onConfirm={confirmToggle}
        title={confirmModal.action === 'deactivate' ? 'Désactiver l\'acteur' : 'Réactiver l\'acteur'}
        message={
          confirmModal.action === 'deactivate'
            ? `Voulez-vous vraiment désactiver ${actor.user_name || 'cet acteur'} ? Il ne pourra plus effectuer de validations.`
            : `Voulez-vous réactiver ${actor.user_name || 'cet acteur'} ?`
        }
        confirmLabel={confirmModal.action === 'deactivate' ? 'Désactiver' : 'Réactiver'}
        variant={confirmModal.action === 'deactivate' ? 'danger' : 'info'}
        isDark={isDark}
        loading={actionLoading}
      />
    </div>
  );
};

export default ActorDetail;
