/**
 * ValidationAssigneesPage - Gestion des validateurs par niveau
 *
 * Permet d'assigner des utilisateurs aux 5 niveaux de validation,
 * de configurer leurs permissions et notifications.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCheck, Plus, Trash2, Save, X, Search, Mail, MessageCircle,
  Shield, ChevronUp, AlertTriangle, CheckCircle, XCircle, RefreshCw,
  ToggleLeft, ToggleRight, Send,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getValidationAssigneesByLevel,
  getAvailableUsersForAssignment,
  createValidationAssignee,
  updateValidationAssignee,
  deleteValidationAssignee,
} from '../services/cohrmApi';
import { COHRM_COLORS, VALIDATION_LEVELS, REGIONS_CAMEROON } from '../utils/constants';
import { LoadingSpinner, EmptyState, ConfirmModal } from '../components/shared';

// Labels de niveau courts pour les onglets
const LEVEL_TABS = [
  { level: 1, label: 'N1 Communautaire', short: 'N1' },
  { level: 2, label: 'N2 Verificateur', short: 'N2' },
  { level: 3, label: 'N3 Evaluateur', short: 'N3' },
  { level: 4, label: 'N4 Coordonnateur', short: 'N4' },
  { level: 5, label: 'N5 Superviseur', short: 'N5' },
];

const LEVEL_COLORS = {
  1: { bg: '#EBF5FB', color: '#2980B9' },
  2: { bg: '#EAFAF1', color: '#27AE60' },
  3: { bg: '#FEF9E7', color: '#F39C12' },
  4: { bg: '#FDF2E9', color: '#E67E22' },
  5: { bg: '#FDEDEC', color: '#E74C3C' },
};

const PERMISSION_FIELDS = [
  { key: 'can_validate', label: 'Valider', icon: CheckCircle },
  { key: 'can_reject', label: 'Rejeter', icon: XCircle },
  { key: 'can_escalate', label: 'Escalader', icon: ChevronUp },
  { key: 'can_assess_risk', label: 'Evaluer risque', icon: AlertTriangle },
  { key: 'can_send_feedback', label: 'Feedback', icon: Send },
];

/**
 * @param {object} props
 * @param {boolean} props.isDark - Mode sombre
 * @param {object} props.user - Utilisateur connecte
 */
const ValidationAssigneesPage = ({ isDark, user }) => {
  const [activeLevel, setActiveLevel] = useState(1);
  const [assignees, setAssignees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [saving, setSaving] = useState({});
  const [confirmModal, setConfirmModal] = useState({ open: false, assignee: null });
  const [newAssignee, setNewAssignee] = useState({
    user_id: '',
    region: '',
    can_validate: true,
    can_reject: true,
    can_escalate: true,
    can_assess_risk: false,
    can_send_feedback: false,
    notify_email: true,
    notify_sms: false,
    notes: '',
  });

  // Charger les assignes du niveau actif
  const loadAssignees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getValidationAssigneesByLevel(activeLevel);
      if (response.success) {
        setAssignees(response.data || []);
      }
    } catch (err) {
      toast.error('Erreur lors du chargement des validateurs');
    } finally {
      setLoading(false);
    }
  }, [activeLevel]);

  useEffect(() => {
    loadAssignees();
  }, [loadAssignees]);

  // Charger les utilisateurs disponibles
  const loadAvailableUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const response = await getAvailableUsersForAssignment(activeLevel);
      if (response.success) {
        setAvailableUsers(response.data || []);
      }
    } catch (err) {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoadingUsers(false);
    }
  }, [activeLevel]);

  // Ouvrir le modal d'ajout
  const handleOpenAdd = () => {
    setShowAddModal(true);
    setUserSearch('');
    setNewAssignee({
      user_id: '',
      region: '',
      can_validate: true,
      can_reject: true,
      can_escalate: true,
      can_assess_risk: false,
      can_send_feedback: false,
      notify_email: true,
      notify_sms: false,
      notes: '',
    });
    loadAvailableUsers();
  };

  // Creer une assignation
  const handleCreate = async () => {
    if (!newAssignee.user_id) {
      toast.warn('Veuillez selectionner un utilisateur');
      return;
    }
    setSaving(prev => ({ ...prev, create: true }));
    try {
      const data = {
        ...newAssignee,
        validation_level: activeLevel,
      };
      await createValidationAssignee(data);
      toast.success('Validateur ajoute avec succes');
      setShowAddModal(false);
      loadAssignees();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de l\'ajout');
    } finally {
      setSaving(prev => ({ ...prev, create: false }));
    }
  };

  // Mettre a jour un champ d'un assigne
  const handleUpdateField = async (assignee, field, value) => {
    const id = assignee.id;
    setSaving(prev => ({ ...prev, [id]: true }));
    try {
      await updateValidationAssignee(id, { [field]: value });
      setAssignees(prev =>
        prev.map(a => a.id === id ? { ...a, [field]: value } : a)
      );
      toast.success('Mis a jour');
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la mise a jour');
    } finally {
      setSaving(prev => ({ ...prev, [id]: false }));
    }
  };

  // Supprimer une assignation
  const handleDelete = async () => {
    const { assignee } = confirmModal;
    if (!assignee) return;
    setSaving(prev => ({ ...prev, [`del-${assignee.id}`]: true }));
    try {
      await deleteValidationAssignee(assignee.id);
      toast.success(`${assignee.user_name || 'Validateur'} retire du niveau ${activeLevel}`);
      setAssignees(prev => prev.filter(a => a.id !== assignee.id));
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
    } finally {
      setSaving(prev => ({ ...prev, [`del-${assignee.id}`]: false }));
      setConfirmModal({ open: false, assignee: null });
    }
  };

  // Filtrer les utilisateurs disponibles par recherche
  const filteredUsers = availableUsers.filter(u => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q);
  });

  const levelInfo = VALIDATION_LEVELS.find(v => v.level === activeLevel) || {};
  const levelColor = LEVEL_COLORS[activeLevel] || LEVEL_COLORS[1];

  // ============================================
  // STYLES
  // ============================================
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
    // Tabs
    tabBar: {
      display: 'flex',
      gap: 4,
      marginBottom: 24,
      overflowX: 'auto',
      paddingBottom: 4,
    },
    tab: (isActive, level) => {
      const c = LEVEL_COLORS[level] || LEVEL_COLORS[1];
      return {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 20px',
        borderRadius: 10,
        border: isActive ? 'none' : (isDark ? '1px solid #334155' : '1px solid #E5E7EB'),
        backgroundColor: isActive ? (isDark ? `${c.color}30` : c.bg) : 'transparent',
        color: isActive ? c.color : (isDark ? COHRM_COLORS.darkMuted : '#6B7280'),
        fontSize: 14,
        fontWeight: isActive ? 700 : 500,
        cursor: 'pointer',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
        flex: '0 0 auto',
      };
    },
    tabBadge: (level) => {
      const c = LEVEL_COLORS[level] || LEVEL_COLORS[1];
      return {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: c.color,
        color: '#fff',
        fontSize: 11,
        fontWeight: 700,
        padding: '0 6px',
      };
    },
    // Level info banner
    levelBanner: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: 16,
      marginBottom: 20,
      borderRadius: 12,
      backgroundColor: isDark ? `${levelColor.color}15` : levelColor.bg,
      border: `1px solid ${isDark ? levelColor.color + '30' : levelColor.color + '30'}`,
    },
    levelBannerIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: levelColor.color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    levelBannerTitle: {
      fontSize: 16,
      fontWeight: 700,
      color: isDark ? COHRM_COLORS.darkText : '#1f2937',
    },
    levelBannerDesc: {
      fontSize: 13,
      color: isDark ? COHRM_COLORS.darkMuted : '#6B7280',
      marginTop: 2,
    },
    // Cards
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
      gap: 16,
    },
    card: {
      borderRadius: 12,
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      backgroundColor: isDark ? '#1e293b' : '#fff',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s',
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 16px',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #F3F4F6',
    },
    cardUserInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    avatar: (name) => {
      const colors = ['#1B4F72', '#2980B9', '#27AE60', '#F39C12', '#E74C3C', '#9B59B6', '#E67E22'];
      const idx = (name || '').charCodeAt(0) % colors.length;
      return {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: colors[idx],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 15,
        fontWeight: 700,
        flexShrink: 0,
      };
    },
    userName: {
      fontSize: 15,
      fontWeight: 600,
      color: isDark ? COHRM_COLORS.darkText : '#1f2937',
    },
    userEmail: {
      fontSize: 12,
      color: isDark ? COHRM_COLORS.darkMuted : '#6B7280',
    },
    cardBody: {
      padding: 16,
    },
    cardSection: {
      marginBottom: 14,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: isDark ? '#94a3b8' : '#6B7280',
      marginBottom: 8,
    },
    permGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
    },
    permChip: (active) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '5px 10px',
      borderRadius: 8,
      border: 'none',
      backgroundColor: active
        ? (isDark ? '#27AE6020' : '#EAFAF1')
        : (isDark ? '#64748b20' : '#F3F4F6'),
      color: active ? '#27AE60' : (isDark ? '#64748b' : '#9CA3AF'),
      fontSize: 12,
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.15s',
    }),
    notifyRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    },
    notifyToggle: (active) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 10px',
      borderRadius: 8,
      border: 'none',
      backgroundColor: active
        ? (isDark ? '#3498DB20' : '#EBF5FB')
        : (isDark ? '#64748b20' : '#F3F4F6'),
      color: active ? '#3498DB' : (isDark ? '#64748b' : '#9CA3AF'),
      fontSize: 12,
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.15s',
    }),
    regionSelect: {
      padding: '8px 12px',
      borderRadius: 8,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: isDark ? '#0f172a' : '#fff',
      color: isDark ? COHRM_COLORS.darkText : '#374151',
      fontSize: 13,
      outline: 'none',
      width: '100%',
    },
    activeToggle: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 12px',
      borderRadius: 8,
      border: 'none',
      backgroundColor: isActive
        ? (isDark ? '#27AE6020' : '#EAFAF1')
        : (isDark ? '#E74C3C20' : '#FDEDEC'),
      color: isActive ? '#27AE60' : '#E74C3C',
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
    }),
    deleteBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 34,
      height: 34,
      borderRadius: 8,
      border: 'none',
      backgroundColor: isDark ? '#E74C3C20' : '#FDEDEC',
      color: '#E74C3C',
      cursor: 'pointer',
      transition: 'all 0.15s',
    },
    cardFooter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 16px',
      borderTop: isDark ? '1px solid #334155' : '1px solid #F3F4F6',
      backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
    },
    // Modal
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 20,
    },
    modal: {
      width: '100%',
      maxWidth: 520,
      maxHeight: '90vh',
      overflowY: 'auto',
      borderRadius: 16,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    modalHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 20px',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: 700,
      color: isDark ? COHRM_COLORS.darkText : '#1f2937',
    },
    modalClose: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
      borderRadius: 8,
      border: 'none',
      backgroundColor: isDark ? '#334155' : '#F3F4F6',
      color: isDark ? '#94a3b8' : '#6B7280',
      cursor: 'pointer',
    },
    modalBody: {
      padding: 20,
    },
    formGroup: {
      marginBottom: 16,
    },
    formLabel: {
      display: 'block',
      fontSize: 13,
      fontWeight: 600,
      color: isDark ? COHRM_COLORS.darkText : '#374151',
      marginBottom: 6,
    },
    formSelect: {
      width: '100%',
      padding: '10px 14px',
      borderRadius: 10,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: isDark ? '#0f172a' : '#fff',
      color: isDark ? COHRM_COLORS.darkText : '#374151',
      fontSize: 14,
      outline: 'none',
    },
    formInput: {
      width: '100%',
      padding: '10px 14px',
      borderRadius: 10,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: isDark ? '#0f172a' : '#fff',
      color: isDark ? COHRM_COLORS.darkText : '#374151',
      fontSize: 14,
      outline: 'none',
      boxSizing: 'border-box',
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
      boxSizing: 'border-box',
    },
    searchWrapper: {
      position: 'relative',
      marginBottom: 12,
    },
    searchIcon: {
      position: 'absolute',
      left: 12,
      top: '50%',
      transform: 'translateY(-50%)',
      color: isDark ? '#64748b' : '#9CA3AF',
      pointerEvents: 'none',
    },
    userList: {
      maxHeight: 200,
      overflowY: 'auto',
      borderRadius: 10,
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    userOption: (selected) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 14px',
      cursor: 'pointer',
      backgroundColor: selected
        ? (isDark ? `${COHRM_COLORS.primary}20` : '#EBF5FB')
        : 'transparent',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #F3F4F6',
      transition: 'background-color 0.15s',
    }),
    modalFooter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 8,
      padding: '14px 20px',
      borderTop: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
  };

  // ============================================
  // RENDU
  // ============================================

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.titleSection}>
          <div style={s.titleIcon}>
            <UserCheck size={22} color={COHRM_COLORS.primary} />
          </div>
          <div>
            <div style={s.title}>Gestion des validateurs</div>
            <div style={s.subtitle}>Assigner et configurer les validateurs par niveau</div>
          </div>
        </div>
        <div style={s.actions}>
          <button style={s.btn('secondary')} onClick={loadAssignees}>
            <RefreshCw size={16} />
            Actualiser
          </button>
          <button style={s.btn('primary')} onClick={handleOpenAdd}>
            <Plus size={16} />
            Ajouter un validateur
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={s.tabBar}>
        {LEVEL_TABS.map(tab => (
          <button
            key={tab.level}
            style={s.tab(activeLevel === tab.level, tab.level)}
            onClick={() => setActiveLevel(tab.level)}
          >
            {tab.label}
            {activeLevel === tab.level && assignees.length > 0 && (
              <span style={s.tabBadge(tab.level)}>{assignees.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Level info banner */}
      <div style={s.levelBanner}>
        <div style={s.levelBannerIcon}>
          <Shield size={20} color="#fff" />
        </div>
        <div>
          <div style={s.levelBannerTitle}>
            Niveau {activeLevel} - {levelInfo.name || ''}
          </div>
          <div style={s.levelBannerDesc}>
            {levelInfo.role || ''} - {levelInfo.description || ''}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner isDark={isDark} />
      ) : assignees.length === 0 ? (
        <EmptyState
          isDark={isDark}
          title="Aucun validateur pour ce niveau"
          message={`Ajoutez des utilisateurs au niveau ${activeLevel} pour commencer`}
          action={handleOpenAdd}
          actionLabel="Ajouter un validateur"
        />
      ) : (
        <div style={s.cardGrid}>
          {assignees.map(assignee => (
            <div key={assignee.id} style={s.card}>
              {/* Card header */}
              <div style={s.cardHeader}>
                <div style={s.cardUserInfo}>
                  <div style={s.avatar(assignee.user_name || '')}>
                    {getInitials(assignee.user_name)}
                  </div>
                  <div>
                    <div style={s.userName}>{assignee.user_name || 'Utilisateur'}</div>
                    <div style={s.userEmail}>{assignee.user_email || assignee.email || ''}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    style={s.activeToggle(assignee.is_active !== false && assignee.is_active !== 0)}
                    onClick={() => handleUpdateField(assignee, 'is_active', assignee.is_active ? 0 : 1)}
                    title={assignee.is_active ? 'Desactiver' : 'Activer'}
                  >
                    {assignee.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {assignee.is_active ? 'Actif' : 'Inactif'}
                  </button>
                  <button
                    style={s.deleteBtn}
                    onClick={() => setConfirmModal({ open: true, assignee })}
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Card body */}
              <div style={s.cardBody}>
                {/* Region */}
                <div style={s.cardSection}>
                  <div style={s.sectionLabel}>Region</div>
                  <select
                    style={s.regionSelect}
                    value={assignee.region || ''}
                    onChange={(e) => handleUpdateField(assignee, 'region', e.target.value)}
                  >
                    <option value="">Toutes les regions</option>
                    {REGIONS_CAMEROON.map(r => (
                      <option key={r.code} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {/* Permissions */}
                <div style={s.cardSection}>
                  <div style={s.sectionLabel}>Permissions</div>
                  <div style={s.permGrid}>
                    {PERMISSION_FIELDS.map(perm => {
                      const Icon = perm.icon;
                      const active = assignee[perm.key] === 1 || assignee[perm.key] === true;
                      return (
                        <button
                          key={perm.key}
                          style={s.permChip(active)}
                          onClick={() => handleUpdateField(assignee, perm.key, active ? 0 : 1)}
                          title={perm.label}
                        >
                          <Icon size={12} />
                          {perm.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notifications */}
                <div style={s.cardSection}>
                  <div style={s.sectionLabel}>Notifications</div>
                  <div style={s.notifyRow}>
                    <button
                      style={s.notifyToggle(assignee.notify_email === 1 || assignee.notify_email === true)}
                      onClick={() => handleUpdateField(assignee, 'notify_email', assignee.notify_email ? 0 : 1)}
                    >
                      <Mail size={12} />
                      Email
                    </button>
                    <button
                      style={s.notifyToggle(assignee.notify_sms === 1 || assignee.notify_sms === true)}
                      onClick={() => handleUpdateField(assignee, 'notify_sms', assignee.notify_sms ? 0 : 1)}
                    >
                      <MessageCircle size={12} />
                      SMS
                    </button>
                  </div>
                </div>
              </div>

              {/* Card footer */}
              {assignee.notes && (
                <div style={s.cardFooter}>
                  <span style={{ fontSize: 12, color: isDark ? COHRM_COLORS.darkMuted : '#6B7280' }}>
                    {assignee.notes}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div style={s.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>
                Ajouter un validateur - Niveau {activeLevel}
              </div>
              <button style={s.modalClose} onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div style={s.modalBody}>
              {/* User selection */}
              <div style={s.formGroup}>
                <label style={s.formLabel}>Utilisateur</label>
                <div style={s.searchWrapper}>
                  <Search size={16} style={s.searchIcon} />
                  <input
                    style={s.searchInput}
                    placeholder="Rechercher un utilisateur..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
                <div style={s.userList}>
                  {loadingUsers ? (
                    <div style={{ padding: 20, textAlign: 'center', color: isDark ? COHRM_COLORS.darkMuted : '#6B7280' }}>
                      Chargement...
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: isDark ? COHRM_COLORS.darkMuted : '#6B7280' }}>
                      Aucun utilisateur disponible
                    </div>
                  ) : (
                    filteredUsers.map(u => (
                      <div
                        key={u.id}
                        style={s.userOption(newAssignee.user_id === u.id)}
                        onClick={() => setNewAssignee(prev => ({ ...prev, user_id: u.id }))}
                      >
                        <div style={s.avatar(u.name || '')}>
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? COHRM_COLORS.darkText : '#1f2937' }}>
                            {u.name}
                          </div>
                          <div style={{ fontSize: 12, color: isDark ? COHRM_COLORS.darkMuted : '#6B7280' }}>
                            {u.email}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Region */}
              <div style={s.formGroup}>
                <label style={s.formLabel}>Region (optionnel)</label>
                <select
                  style={s.formSelect}
                  value={newAssignee.region}
                  onChange={(e) => setNewAssignee(prev => ({ ...prev, region: e.target.value }))}
                >
                  <option value="">Toutes les regions</option>
                  {REGIONS_CAMEROON.map(r => (
                    <option key={r.code} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              {/* Permissions */}
              <div style={s.formGroup}>
                <label style={s.formLabel}>Permissions</label>
                <div style={s.permGrid}>
                  {PERMISSION_FIELDS.map(perm => {
                    const Icon = perm.icon;
                    const active = newAssignee[perm.key];
                    return (
                      <button
                        key={perm.key}
                        type="button"
                        style={s.permChip(active)}
                        onClick={() => setNewAssignee(prev => ({ ...prev, [perm.key]: !prev[perm.key] }))}
                      >
                        <Icon size={12} />
                        {perm.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notifications */}
              <div style={s.formGroup}>
                <label style={s.formLabel}>Notifications</label>
                <div style={s.notifyRow}>
                  <button
                    type="button"
                    style={s.notifyToggle(newAssignee.notify_email)}
                    onClick={() => setNewAssignee(prev => ({ ...prev, notify_email: !prev.notify_email }))}
                  >
                    <Mail size={12} />
                    Email
                  </button>
                  <button
                    type="button"
                    style={s.notifyToggle(newAssignee.notify_sms)}
                    onClick={() => setNewAssignee(prev => ({ ...prev, notify_sms: !prev.notify_sms }))}
                  >
                    <MessageCircle size={12} />
                    SMS
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div style={s.formGroup}>
                <label style={s.formLabel}>Notes (optionnel)</label>
                <input
                  style={s.formInput}
                  placeholder="Notes sur ce validateur..."
                  value={newAssignee.notes}
                  onChange={(e) => setNewAssignee(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.btn('secondary')} onClick={() => setShowAddModal(false)}>
                Annuler
              </button>
              <button
                style={s.btn('primary')}
                onClick={handleCreate}
                disabled={saving.create || !newAssignee.user_id}
              >
                {saving.create ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={14} />}
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete modal */}
      <ConfirmModal
        isDark={isDark}
        isOpen={confirmModal.open}
        title="Retirer ce validateur ?"
        message={`Voulez-vous retirer ${confirmModal.assignee?.user_name || 'ce validateur'} du niveau ${activeLevel} ?`}
        confirmLabel="Retirer"
        variant="danger"
        onConfirm={handleDelete}
        onClose={() => setConfirmModal({ open: false, assignee: null })}
      />
    </div>
  );
};

export default ValidationAssigneesPage;
