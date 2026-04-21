/**
 * NotificationsCenter - Centre de gestion des notifications COHRM
 *
 * Fonctionnalites :
 * - Tableau des notifications avec filtres (type, statut, date)
 * - Statistiques : envoyees, echouees, taux de succes, par type
 * - Relance des notifications echouees
 * - Envoi de notification de test
 * - Preferences de notification (canaux, horaires silencieux)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, Mail, RefreshCw, Send, CheckCircle, XCircle,
  Clock, AlertTriangle, Filter, ChevronDown, ChevronUp,
  BarChart3, Settings, Loader, Play, Eye, X,
  ToggleLeft, ToggleRight, Moon,
} from 'lucide-react';
import {
  getNotifications,
  getMyNotifications,
  getNotificationStats,
  retryNotification,
  sendTestNotification,
  sendReminders,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../services/cohrmApi';
import { COHRM_COLORS } from '../utils/constants';
import { LoadingSpinner, EmptyState } from '../components/shared';
import { usePermissions } from '../hooks/usePermissions';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

// ============================================
// CONSTANTES
// ============================================

const NOTIFICATION_TYPES = [
  { value: 'new_rumor', label: 'Nouvelle rumeur', labelEn: 'New rumor', color: '#3498DB', icon: Bell },
  { value: 'escalation', label: 'Escalade', labelEn: 'Escalation', color: '#F39C12', icon: ChevronUp },
  { value: 'validation', label: 'Validation', labelEn: 'Validation', color: '#27AE60', icon: CheckCircle },
  { value: 'rejection', label: 'Rejet', labelEn: 'Rejection', color: '#E74C3C', icon: XCircle },
  { value: 'risk_assessment', label: 'Evaluation risque', labelEn: 'Risk assessment', color: '#9B59B6', icon: AlertTriangle },
  { value: 'reminder', label: 'Rappel', labelEn: 'Reminder', color: '#1ABC9C', icon: Clock },
  { value: 'system', label: 'Systeme', labelEn: 'System', color: '#95A5A6', icon: Settings },
];

const STATUS_COLORS = {
  sent: { color: '#27AE60', bg: '#EAFAF1', label: 'Envoyee', labelEn: 'Sent' },
  failed: { color: '#E74C3C', bg: '#FDEDEC', label: 'Echouee', labelEn: 'Failed' },
  pending: { color: '#F39C12', bg: '#FEF9E7', label: 'En attente', labelEn: 'Pending' },
};

const TABS = ['history', 'stats', 'preferences'];

/**
 * @param {object} props
 * @param {boolean} props.isDark - Mode sombre
 * @param {object} props.user - Utilisateur connecte
 */
const NotificationsCenter = ({ isDark, user }) => {
  const { t } = useTranslation('cohrm');
  const { userLevel, isAdmin } = usePermissions(user);

  // ============================================
  // STATE
  // ============================================
  const [activeTab, setActiveTab] = useState('history');
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [stats, setStats] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [retrying, setRetrying] = useState(null);
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState(isAdmin ? 'all' : 'my');

  // Detail modal
  const [selectedNotif, setSelectedNotif] = useState(null);

  // ============================================
  // DATA LOADING
  // ============================================

  const loadNotifications = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;
      if (filterDateFrom) params.startDate = filterDateFrom;
      if (filterDateTo) params.endDate = filterDateTo;

      const response = viewMode === 'all'
        ? await getNotifications(params)
        : await getMyNotifications(params);

      if (response.success) {
        setNotifications(response.data || []);
        setPagination(response.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
      }
    } catch (err) {
      toast.error('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, filterDateFrom, filterDateTo, viewMode]);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const response = await getNotificationStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadPreferences = useCallback(async () => {
    setLoadingPrefs(true);
    try {
      const response = await getNotificationPreferences();
      if (response.success) {
        setPreferences(response.data);
      }
    } catch (err) {
      toast.error('Erreur lors du chargement des preferences');
    } finally {
      setLoadingPrefs(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'history') loadNotifications();
    else if (activeTab === 'stats') loadStats();
    else if (activeTab === 'preferences') loadPreferences();
  }, [activeTab, loadNotifications, loadStats, loadPreferences]);

  // ============================================
  // ACTIONS
  // ============================================

  const handleRetry = async (id) => {
    setRetrying(id);
    try {
      const response = await retryNotification(id);
      if (response.success) {
        toast.success('Notification renvoyee avec succes');
        loadNotifications(pagination.page);
      } else {
        toast.error(response.message || 'Erreur lors de la relance');
      }
    } catch (err) {
      toast.error('Erreur lors de la relance de la notification');
    } finally {
      setRetrying(null);
    }
  };

  const handleSendTest = async (type) => {
    setSendingTest(true);
    try {
      const response = await sendTestNotification(type);
      if (response.success) {
        toast.success(response.message || 'Notification de test envoyee');
        loadNotifications(pagination.page);
      } else {
        toast.error(response.message || 'Erreur lors de l\'envoi');
      }
    } catch (err) {
      toast.error('Erreur lors de l\'envoi de la notification de test');
    } finally {
      setSendingTest(false);
    }
  };

  const handleSendReminders = async () => {
    setSendingReminders(true);
    try {
      const response = await sendReminders();
      if (response.success) {
        toast.success(response.message || 'Rappels envoyes');
      }
    } catch (err) {
      toast.error('Erreur lors de l\'envoi des rappels');
    } finally {
      setSendingReminders(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences) return;
    setSavingPrefs(true);
    try {
      const response = await updateNotificationPreferences(preferences);
      if (response.success) {
        toast.success('Preferences mises a jour');
      }
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleFilterApply = () => {
    loadNotifications(1);
  };

  const handleFilterReset = () => {
    setFilterType('');
    setFilterStatus('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  // ============================================
  // HELPERS
  // ============================================

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getTypeInfo = (type) =>
    NOTIFICATION_TYPES.find(t => t.value === type) || { label: type, color: '#95A5A6', icon: Bell };

  const getStatusInfo = (status) =>
    STATUS_COLORS[status] || { color: '#95A5A6', bg: '#F2F3F4', label: status };

  // ============================================
  // STYLES
  // ============================================
  const s = {
    container: { padding: '0 0 40px 0' },
    header: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, marginBottom: 24, flexWrap: 'wrap',
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
    headerIcon: {
      width: 44, height: 44, borderRadius: 12,
      background: `linear-gradient(135deg, ${COHRM_COLORS.primary}, ${COHRM_COLORS.primaryLight})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    title: { fontSize: 22, fontWeight: 700, color: isDark ? '#e2e8f0' : '#1f2937' },
    subtitle: { fontSize: 13, color: isDark ? '#64748b' : '#9CA3AF' },
    headerActions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    btn: (variant = 'default') => ({
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '8px 16px', borderRadius: 8, border: 'none',
      fontSize: 13, fontWeight: 600, cursor: 'pointer',
      backgroundColor: variant === 'primary' ? COHRM_COLORS.primary
        : variant === 'success' ? '#27AE60'
        : variant === 'warning' ? '#F39C12'
        : isDark ? '#1e293b' : '#F3F4F6',
      color: variant === 'default' ? (isDark ? '#e2e8f0' : '#374151') : '#fff',
      transition: 'all 0.15s',
      opacity: 1,
    }),
    tabs: {
      display: 'flex', gap: 4, marginBottom: 24,
      backgroundColor: isDark ? '#0f172a' : '#F3F4F6',
      padding: 4, borderRadius: 12,
    },
    tab: (isActive) => ({
      padding: '10px 20px', borderRadius: 8, border: 'none',
      fontSize: 14, fontWeight: isActive ? 600 : 400, cursor: 'pointer',
      backgroundColor: isActive ? (isDark ? '#1e293b' : '#fff') : 'transparent',
      color: isActive ? (isDark ? '#e2e8f0' : '#1f2937') : (isDark ? '#64748b' : '#6B7280'),
      boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
      transition: 'all 0.15s',
      display: 'flex', alignItems: 'center', gap: 6,
    }),
    card: {
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      borderRadius: 14, padding: 20,
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 15, fontWeight: 600, color: isDark ? '#e2e8f0' : '#1f2937',
      marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
      padding: '10px 12px', fontSize: 12, fontWeight: 600,
      color: isDark ? '#94a3b8' : '#6B7280', textTransform: 'uppercase',
      letterSpacing: '0.5px', textAlign: 'left',
      borderBottom: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
    },
    td: {
      padding: '12px 12px', fontSize: 13,
      color: isDark ? '#e2e8f0' : '#374151',
      borderBottom: isDark ? `1px solid ${COHRM_COLORS.darkBorder}20` : '1px solid #F3F4F6',
    },
    badge: (color, bg) => ({
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20,
      backgroundColor: isDark ? `${color}20` : bg,
      color: color, fontSize: 12, fontWeight: 600,
    }),
    statCard: (color) => ({
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      borderRadius: 14, padding: 20,
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
      borderLeft: `4px solid ${color}`,
      flex: '1 1 200px',
    }),
    statValue: { fontSize: 28, fontWeight: 800, color: isDark ? '#e2e8f0' : '#1f2937' },
    statLabel: { fontSize: 13, color: isDark ? '#64748b' : '#6B7280', marginTop: 4 },
    filterBar: {
      backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
      borderRadius: 12, padding: 16, marginBottom: 16,
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
    },
    filterRow: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' },
    filterGroup: { display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 160px' },
    filterLabel: { fontSize: 12, fontWeight: 600, color: isDark ? '#94a3b8' : '#6B7280' },
    select: {
      padding: '8px 12px', borderRadius: 8, fontSize: 13,
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #D1D5DB',
      backgroundColor: isDark ? '#1e293b' : '#fff',
      color: isDark ? '#e2e8f0' : '#374151',
    },
    input: {
      padding: '8px 12px', borderRadius: 8, fontSize: 13,
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #D1D5DB',
      backgroundColor: isDark ? '#1e293b' : '#fff',
      color: isDark ? '#e2e8f0' : '#374151',
    },
    pagination: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 0', flexWrap: 'wrap', gap: 8,
    },
    pageBtn: (disabled) => ({
      padding: '6px 14px', borderRadius: 6, border: 'none',
      fontSize: 13, fontWeight: 500, cursor: disabled ? 'default' : 'pointer',
      backgroundColor: isDark ? '#1e293b' : '#F3F4F6',
      color: disabled ? (isDark ? '#475569' : '#9CA3AF') : (isDark ? '#e2e8f0' : '#374151'),
      opacity: disabled ? 0.5 : 1,
    }),
    toggleRow: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: isDark ? `1px solid ${COHRM_COLORS.darkBorder}20` : '1px solid #F3F4F6',
    },
    toggleLabel: { fontSize: 14, color: isDark ? '#e2e8f0' : '#374151' },
    toggleDesc: { fontSize: 12, color: isDark ? '#64748b' : '#9CA3AF', marginTop: 2 },
    toggleBtn: (on) => ({
      width: 44, height: 24, borderRadius: 12, border: 'none',
      backgroundColor: on ? COHRM_COLORS.primary : (isDark ? '#334155' : '#D1D5DB'),
      cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
      display: 'flex', alignItems: 'center',
      padding: 2,
    }),
    toggleKnob: (on) => ({
      width: 20, height: 20, borderRadius: '50%', backgroundColor: '#fff',
      transition: 'transform 0.2s',
      transform: on ? 'translateX(20px)' : 'translateX(0)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    }),
    modal: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    },
    modalContent: {
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      borderRadius: 16, padding: 24, width: '90%', maxWidth: 560,
      maxHeight: '80vh', overflow: 'auto',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : 'none',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    grid: { display: 'flex', flexWrap: 'wrap', gap: 16 },
  };

  // ============================================
  // RENDER - HISTORY TAB
  // ============================================
  const renderHistory = () => (
    <>
      {/* View mode toggle + filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {isAdmin && (
            <>
              <button
                style={s.btn(viewMode === 'all' ? 'primary' : 'default')}
                onClick={() => setViewMode('all')}
              >
                <Bell size={14} /> {t('notifications.allNotifications', 'Toutes')}
              </button>
              <button
                style={s.btn(viewMode === 'my' ? 'primary' : 'default')}
                onClick={() => setViewMode('my')}
              >
                <Mail size={14} /> {t('notifications.myNotifications', 'Mes notifications')}
              </button>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={s.btn()} onClick={() => setShowFilters(!showFilters)}>
            <Filter size={14} /> {t('common.filter', 'Filtrer')}
          </button>
          <button style={s.btn()} onClick={() => loadNotifications(pagination.page)}>
            <RefreshCw size={14} /> {t('common.refresh', 'Actualiser')}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div style={s.filterBar}>
          <div style={s.filterRow}>
            <div style={s.filterGroup}>
              <span style={s.filterLabel}>{t('notifications.type', 'Type')}</span>
              <select style={s.select} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">{t('common.all', 'Tous')}</option>
                {NOTIFICATION_TYPES.map((nt) => (
                  <option key={nt.value} value={nt.value}>{nt.label}</option>
                ))}
              </select>
            </div>
            <div style={s.filterGroup}>
              <span style={s.filterLabel}>{t('notifications.status', 'Statut')}</span>
              <select style={s.select} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">{t('common.all', 'Tous')}</option>
                <option value="sent">{t('notifications.sent', 'Envoyee')}</option>
                <option value="failed">{t('notifications.failed', 'Echouee')}</option>
                <option value="pending">{t('notifications.pending', 'En attente')}</option>
              </select>
            </div>
            <div style={s.filterGroup}>
              <span style={s.filterLabel}>{t('notifications.dateFrom', 'Du')}</span>
              <input type="date" style={s.input} value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
            </div>
            <div style={s.filterGroup}>
              <span style={s.filterLabel}>{t('notifications.dateTo', 'Au')}</span>
              <input type="date" style={s.input} value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <button style={s.btn('primary')} onClick={handleFilterApply}>
                {t('common.filter', 'Filtrer')}
              </button>
              <button style={s.btn()} onClick={handleFilterReset}>
                {t('common.reset', 'Reset')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={s.card}>
        {loading ? (
          <LoadingSpinner />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Bell size={40} color={isDark ? '#475569' : '#D1D5DB'} />}
            title={t('notifications.noNotifications', 'Aucune notification')}
            description={t('notifications.noNotificationsDesc', 'Aucune notification ne correspond aux criteres.')}
          />
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>{t('notifications.type', 'Type')}</th>
                    <th style={s.th}>{t('notifications.recipient', 'Destinataire')}</th>
                    <th style={s.th}>{t('notifications.subject', 'Sujet')}</th>
                    <th style={s.th}>{t('notifications.rumor', 'Rumeur')}</th>
                    <th style={s.th}>{t('notifications.status', 'Statut')}</th>
                    <th style={s.th}>{t('notifications.date', 'Date')}</th>
                    <th style={s.th}>{t('common.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notif) => {
                    const typeInfo = getTypeInfo(notif.notification_type);
                    const statusInfo = getStatusInfo(notif.status);
                    const TypeIcon = typeInfo.icon;
                    return (
                      <tr key={notif.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedNotif(notif)}>
                        <td style={s.td}>
                          <span style={s.badge(typeInfo.color, `${typeInfo.color}15`)}>
                            <TypeIcon size={12} /> {typeInfo.label}
                          </span>
                        </td>
                        <td style={s.td}>
                          <div style={{ fontSize: 13 }}>{notif.recipient_name || '-'}</div>
                          <div style={{ fontSize: 11, color: isDark ? '#64748b' : '#9CA3AF' }}>
                            {notif.recipient_email || ''}
                          </div>
                        </td>
                        <td style={{ ...s.td, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {notif.subject || '-'}
                        </td>
                        <td style={s.td}>
                          {notif.rumor_code ? (
                            <span style={{ fontFamily: 'monospace', fontSize: 12, color: COHRM_COLORS.primary }}>
                              {notif.rumor_code}
                            </span>
                          ) : '-'}
                        </td>
                        <td style={s.td}>
                          <span style={s.badge(statusInfo.color, statusInfo.bg)}>
                            {notif.status === 'sent' ? <CheckCircle size={11} /> : notif.status === 'failed' ? <XCircle size={11} /> : <Clock size={11} />}
                            {statusInfo.label}
                          </span>
                        </td>
                        <td style={s.td}>{formatDateTime(notif.created_at)}</td>
                        <td style={s.td} onClick={(e) => e.stopPropagation()}>
                          {notif.status === 'failed' && (
                            <button
                              style={{ ...s.btn('warning'), padding: '4px 10px', fontSize: 12 }}
                              onClick={() => handleRetry(notif.id)}
                              disabled={retrying === notif.id}
                            >
                              {retrying === notif.id ? <Loader size={12} className="spin" /> : <RefreshCw size={12} />}
                              {t('notifications.retry', 'Relancer')}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={s.pagination}>
              <span style={{ fontSize: 13, color: isDark ? '#64748b' : '#6B7280' }}>
                {t('common.showing', 'Affichage de')} {((pagination.page - 1) * pagination.limit) + 1} {t('common.to', 'a')} {Math.min(pagination.page * pagination.limit, pagination.total)} {t('common.of', 'sur')} {pagination.total}
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  style={s.pageBtn(pagination.page <= 1)}
                  onClick={() => pagination.page > 1 && loadNotifications(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  {t('common.previous', 'Precedent')}
                </button>
                <button
                  style={s.pageBtn(pagination.page >= pagination.pages)}
                  onClick={() => pagination.page < pagination.pages && loadNotifications(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                >
                  {t('common.next', 'Suivant')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );

  // ============================================
  // RENDER - STATS TAB
  // ============================================
  const renderStats = () => {
    if (loadingStats) return <LoadingSpinner />;
    if (!stats) return <EmptyState icon={<BarChart3 size={40} />} title="Aucune statistique" />;

    const { byType = [], byStatus = [], byDay = [], successRate = {} } = stats;

    return (
      <>
        {/* Summary cards */}
        <div style={{ ...s.grid, marginBottom: 24 }}>
          <div style={s.statCard(COHRM_COLORS.primary)}>
            <div style={s.statValue}>{successRate.total || 0}</div>
            <div style={s.statLabel}>{t('notifications.totalSent', 'Total envoye (30j)')}</div>
          </div>
          <div style={s.statCard('#27AE60')}>
            <div style={{ ...s.statValue, color: '#27AE60' }}>{successRate.sent || 0}</div>
            <div style={s.statLabel}>{t('notifications.successful', 'Reussies')}</div>
          </div>
          <div style={s.statCard('#E74C3C')}>
            <div style={{ ...s.statValue, color: '#E74C3C' }}>{successRate.failed || 0}</div>
            <div style={s.statLabel}>{t('notifications.failedCount', 'Echouees')}</div>
          </div>
          <div style={s.statCard('#F39C12')}>
            <div style={{ ...s.statValue, color: '#F39C12' }}>{successRate.success_rate || 0}%</div>
            <div style={s.statLabel}>{t('notifications.successRate', 'Taux de succes')}</div>
          </div>
        </div>

        {/* By type */}
        <div style={s.card}>
          <div style={s.cardTitle}>
            <Bell size={16} color={COHRM_COLORS.primary} />
            {t('notifications.byType', 'Par type (30 derniers jours)')}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {byType.length === 0 ? (
              <span style={{ fontSize: 13, color: isDark ? '#64748b' : '#9CA3AF' }}>
                {t('common.noData', 'Aucune donnee')}
              </span>
            ) : byType.map((item) => {
              const typeInfo = getTypeInfo(item.notification_type);
              return (
                <div key={item.notification_type} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 16px', borderRadius: 10,
                  backgroundColor: isDark ? `${typeInfo.color}15` : `${typeInfo.color}10`,
                }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: typeInfo.color }}>{item.count}</span>
                  <span style={{ fontSize: 13, color: isDark ? '#e2e8f0' : '#374151' }}>{typeInfo.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* By day chart (simple bar) */}
        <div style={s.card}>
          <div style={s.cardTitle}>
            <BarChart3 size={16} color={COHRM_COLORS.primary} />
            {t('notifications.last7Days', '7 derniers jours')}
          </div>
          {byDay.length === 0 ? (
            <span style={{ fontSize: 13, color: isDark ? '#64748b' : '#9CA3AF' }}>
              {t('common.noData', 'Aucune donnee')}
            </span>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, paddingTop: 20 }}>
              {byDay.map((day) => {
                const max = Math.max(...byDay.map(d => d.total || 1));
                const height = Math.max(((day.total || 0) / max) * 100, 4);
                return (
                  <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: isDark ? '#e2e8f0' : '#374151' }}>{day.total}</span>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <div style={{
                        height: Math.max((((day.sent || 0) / max) * 100), day.sent ? 2 : 0),
                        backgroundColor: '#27AE60', borderRadius: '4px 4px 0 0',
                      }} />
                      <div style={{
                        height: Math.max((((day.failed || 0) / max) * 100), day.failed ? 2 : 0),
                        backgroundColor: '#E74C3C', borderRadius: '0 0 4px 4px',
                      }} />
                    </div>
                    <span style={{ fontSize: 10, color: isDark ? '#64748b' : '#9CA3AF' }}>
                      {new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#27AE60' }} />
              <span style={{ color: isDark ? '#94a3b8' : '#6B7280' }}>{t('notifications.sent', 'Envoyees')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#E74C3C' }} />
              <span style={{ color: isDark ? '#94a3b8' : '#6B7280' }}>{t('notifications.failed', 'Echouees')}</span>
            </div>
          </div>
        </div>

        {/* Admin actions */}
        {isAdmin && (
          <div style={s.card}>
            <div style={s.cardTitle}>
              <Settings size={16} color={COHRM_COLORS.primary} />
              {t('notifications.adminActions', 'Actions administrateur')}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                style={s.btn('primary')}
                onClick={handleSendReminders}
                disabled={sendingReminders}
              >
                {sendingReminders ? <Loader size={14} /> : <Send size={14} />}
                {t('notifications.sendReminders', 'Envoyer les rappels')}
              </button>
              <button
                style={s.btn('success')}
                onClick={() => handleSendTest('new_rumor')}
                disabled={sendingTest}
              >
                {sendingTest ? <Loader size={14} /> : <Play size={14} />}
                {t('notifications.sendTest', 'Notification de test')}
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  // ============================================
  // RENDER - PREFERENCES TAB
  // ============================================
  const renderPreferences = () => {
    if (loadingPrefs) return <LoadingSpinner />;
    if (!preferences) return <EmptyState icon={<Settings size={40} />} title="Erreur de chargement" />;

    const Toggle = ({ field, label, desc }) => (
      <div style={s.toggleRow}>
        <div>
          <div style={s.toggleLabel}>{label}</div>
          {desc && <div style={s.toggleDesc}>{desc}</div>}
        </div>
        <button
          style={s.toggleBtn(preferences[field])}
          onClick={() => setPreferences({ ...preferences, [field]: !preferences[field] })}
        >
          <div style={s.toggleKnob(preferences[field])} />
        </button>
      </div>
    );

    return (
      <>
        {/* Notification types */}
        <div style={s.card}>
          <div style={s.cardTitle}>
            <Bell size={16} color={COHRM_COLORS.primary} />
            {t('notifications.notifTypes', 'Types de notifications')}
          </div>
          <Toggle field="notify_new_rumor" label={t('notifications.prefNewRumor', 'Nouvelles rumeurs')} desc={t('notifications.prefNewRumorDesc', 'Recevoir une notification quand une rumeur est assignee')} />
          <Toggle field="notify_escalation" label={t('notifications.prefEscalation', 'Escalades')} desc={t('notifications.prefEscalationDesc', 'Quand une rumeur est escaladee a votre niveau')} />
          <Toggle field="notify_validation" label={t('notifications.prefValidation', 'Validations')} desc={t('notifications.prefValidationDesc', 'Quand une rumeur est validee')} />
          <Toggle field="notify_rejection" label={t('notifications.prefRejection', 'Rejets')} desc={t('notifications.prefRejectionDesc', 'Quand une rumeur est rejetee')} />
          <Toggle field="notify_risk_assessment" label={t('notifications.prefRisk', 'Evaluations de risque')} desc={t('notifications.prefRiskDesc', 'Quand une evaluation de risque est completee')} />
          <Toggle field="notify_reminder" label={t('notifications.prefReminder', 'Rappels')} desc={t('notifications.prefReminderDesc', 'Rappels de validation en attente')} />
          <Toggle field="notify_feedback" label={t('notifications.prefFeedback', 'Retro-information')} desc={t('notifications.prefFeedbackDesc', 'Quand un feedback est envoye')} />
        </div>

        {/* Channels */}
        <div style={s.card}>
          <div style={s.cardTitle}>
            <Mail size={16} color={COHRM_COLORS.primary} />
            {t('notifications.channels', 'Canaux de notification')}
          </div>
          <Toggle field="prefer_email" label={t('notifications.channelEmail', 'Email')} />
          <Toggle field="prefer_sms" label={t('notifications.channelSms', 'SMS')} />
          <Toggle field="prefer_push" label={t('notifications.channelPush', 'Notification push')} />
        </div>

        {/* Quiet hours */}
        <div style={s.card}>
          <div style={s.cardTitle}>
            <Moon size={16} color={COHRM_COLORS.primary} />
            {t('notifications.quietHours', 'Heures silencieuses')}
          </div>
          <Toggle field="respect_quiet_hours" label={t('notifications.enableQuietHours', 'Activer les heures silencieuses')} />
          {preferences.respect_quiet_hours && (
            <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
              <div style={s.filterGroup}>
                <span style={s.filterLabel}>{t('notifications.quietStart', 'Debut')}</span>
                <input
                  type="time" style={s.input}
                  value={preferences.quiet_hours_start || '22:00'}
                  onChange={(e) => setPreferences({ ...preferences, quiet_hours_start: e.target.value })}
                />
              </div>
              <div style={s.filterGroup}>
                <span style={s.filterLabel}>{t('notifications.quietEnd', 'Fin')}</span>
                <input
                  type="time" style={s.input}
                  value={preferences.quiet_hours_end || '07:00'}
                  onChange={(e) => setPreferences({ ...preferences, quiet_hours_end: e.target.value })}
                />
              </div>
              <div style={s.filterGroup}>
                <span style={s.filterLabel}>{t('notifications.reminderFreq', 'Frequence des rappels')}</span>
                <select
                  style={s.select}
                  value={preferences.reminder_frequency || 'daily'}
                  onChange={(e) => setPreferences({ ...preferences, reminder_frequency: e.target.value })}
                >
                  <option value="hourly">{t('notifications.freqHourly', 'Toutes les heures')}</option>
                  <option value="daily">{t('notifications.freqDaily', 'Quotidien')}</option>
                  <option value="weekly">{t('notifications.freqWeekly', 'Hebdomadaire')}</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            style={s.btn('primary')}
            onClick={handleSavePreferences}
            disabled={savingPrefs}
          >
            {savingPrefs ? <Loader size={14} /> : <CheckCircle size={14} />}
            {t('common.save', 'Enregistrer')}
          </button>
        </div>
      </>
    );
  };

  // ============================================
  // RENDER - DETAIL MODAL
  // ============================================
  const renderDetailModal = () => {
    if (!selectedNotif) return null;
    const typeInfo = getTypeInfo(selectedNotif.notification_type);
    const statusInfo = getStatusInfo(selectedNotif.status);
    const TypeIcon = typeInfo.icon;

    return (
      <div style={s.modal} onClick={() => setSelectedNotif(null)}>
        <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${typeInfo.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <TypeIcon size={18} color={typeInfo.color} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: isDark ? '#e2e8f0' : '#1f2937' }}>
                  {t('notifications.detailTitle', 'Detail de la notification')}
                </div>
                <span style={s.badge(typeInfo.color, `${typeInfo.color}15`)}>{typeInfo.label}</span>
              </div>
            </div>
            <button
              style={{ ...s.btn(), padding: '6px 8px', borderRadius: '50%' }}
              onClick={() => setSelectedNotif(null)}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={s.filterLabel}>{t('notifications.status', 'Statut')}</div>
              <span style={s.badge(statusInfo.color, statusInfo.bg)}>{statusInfo.label}</span>
            </div>
            <div>
              <div style={s.filterLabel}>{t('notifications.date', 'Date')}</div>
              <div style={{ fontSize: 13, color: isDark ? '#e2e8f0' : '#374151' }}>
                {formatDateTime(selectedNotif.created_at)}
              </div>
            </div>
            <div>
              <div style={s.filterLabel}>{t('notifications.recipient', 'Destinataire')}</div>
              <div style={{ fontSize: 13, color: isDark ? '#e2e8f0' : '#374151' }}>
                {selectedNotif.recipient_name || selectedNotif.recipient_email || '-'}
              </div>
            </div>
            <div>
              <div style={s.filterLabel}>{t('notifications.channel', 'Canal')}</div>
              <div style={{ fontSize: 13, color: isDark ? '#e2e8f0' : '#374151' }}>
                {selectedNotif.channel || 'email'}
              </div>
            </div>
            {selectedNotif.rumor_code && (
              <div>
                <div style={s.filterLabel}>{t('notifications.rumor', 'Rumeur')}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 13, color: COHRM_COLORS.primary }}>
                  {selectedNotif.rumor_code} - {selectedNotif.rumor_title || ''}
                </div>
              </div>
            )}
            {selectedNotif.sent_at && (
              <div>
                <div style={s.filterLabel}>{t('notifications.sentAt', 'Envoye le')}</div>
                <div style={{ fontSize: 13, color: isDark ? '#e2e8f0' : '#374151' }}>
                  {formatDateTime(selectedNotif.sent_at)}
                </div>
              </div>
            )}
          </div>

          {selectedNotif.subject && (
            <div style={{ marginTop: 16 }}>
              <div style={s.filterLabel}>{t('notifications.subject', 'Sujet')}</div>
              <div style={{ fontSize: 13, color: isDark ? '#e2e8f0' : '#374151', marginTop: 4 }}>
                {selectedNotif.subject}
              </div>
            </div>
          )}

          {selectedNotif.error_message && (
            <div style={{
              marginTop: 16, padding: 12, borderRadius: 8,
              backgroundColor: isDark ? '#7f1d1d20' : '#FEE2E2',
              border: '1px solid #FECACA',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#DC2626', marginBottom: 4 }}>
                {t('notifications.errorMessage', 'Message d\'erreur')}
              </div>
              <div style={{ fontSize: 12, color: '#DC2626', fontFamily: 'monospace' }}>
                {selectedNotif.error_message}
              </div>
            </div>
          )}

          {selectedNotif.status === 'failed' && (
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                style={s.btn('warning')}
                onClick={() => { handleRetry(selectedNotif.id); setSelectedNotif(null); }}
              >
                <RefreshCw size={14} /> {t('notifications.retry', 'Relancer')}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.headerIcon}>
            <Bell size={22} color="#fff" />
          </div>
          <div>
            <div style={s.title}>{t('notifications.title', 'Centre de notifications')}</div>
            <div style={s.subtitle}>{t('notifications.subtitle', 'Historique, statistiques et preferences')}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        <button style={s.tab(activeTab === 'history')} onClick={() => setActiveTab('history')}>
          <Bell size={15} /> {t('notifications.tabHistory', 'Historique')}
        </button>
        <button style={s.tab(activeTab === 'stats')} onClick={() => setActiveTab('stats')}>
          <BarChart3 size={15} /> {t('notifications.tabStats', 'Statistiques')}
        </button>
        <button style={s.tab(activeTab === 'preferences')} onClick={() => setActiveTab('preferences')}>
          <Settings size={15} /> {t('notifications.tabPreferences', 'Preferences')}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'history' && renderHistory()}
      {activeTab === 'stats' && renderStats()}
      {activeTab === 'preferences' && renderPreferences()}

      {/* Detail modal */}
      {renderDetailModal()}
    </div>
  );
};

export default NotificationsCenter;
