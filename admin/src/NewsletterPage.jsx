/**
 * NEWSLETTER PAGE - Admin Panel
 * One Health CMS
 *
 * Complete newsletter management:
 * - Dashboard with statistics
 * - Mailing lists management
 * - Subscribers management (CRUD, import/export)
 * - Email templates
 * - Campaigns (create, send, schedule)
 * - Settings
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { logoBase64 } from './logoBase64';
import {
  Mail, Users, Send, FileText, Settings, BarChart3, Plus, Edit2, Trash2,
  Search, Filter, Download, Upload, Eye, Play, Clock, CheckCircle, XCircle,
  AlertCircle, RefreshCw, ChevronDown, ChevronRight, Calendar, TrendingUp,
  Globe, List, Copy, Target, Pause, X, Check, Loader, ExternalLink,
  MousePointer, MailOpen, UserPlus, UserMinus, Activity, ArrowLeft, Image,
  Type, Layout, Newspaper, Bold, Italic, Underline, AlignLeft, AlignCenter,
  AlignRight, Link, Palette, Sparkles
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Colors
const colors = {
  primary: '#27AE60',
  secondary: '#2196F3',
  accent: '#FF9800',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  purple: '#8B5CF6',
  cyan: '#06b6d4',
  pink: '#ec4899'
};

// API helper
const api = {
  get: async (endpoint, token) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      return res.json();
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  },
  post: async (endpoint, data, token) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    } catch (error) {
      return { success: false, message: 'Erreur de connexion' };
    }
  },
  put: async (endpoint, data, token) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    } catch (error) {
      return { success: false, message: 'Erreur de connexion' };
    }
  },
  delete: async (endpoint, token) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    } catch (error) {
      return { success: false, message: 'Erreur de connexion' };
    }
  }
};

// ============================================
// MAIN COMPONENT
// ============================================

const NewsletterPage = ({ isDark, token }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Data states
  const [stats, setStats] = useState(null);
  const [lists, setLists] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [subscribersPagination, setSubscribersPagination] = useState({ page: 1, limit: 50, total: 0 });
  const [templates, setTemplates] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsPagination, setCampaignsPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [settings, setSettings] = useState({});

  // Filter states
  const [subscriberFilters, setSubscriberFilters] = useState({ status: '', list_id: '', language: '', search: '' });
  const [newsletterFilters, setNewsletterFilters] = useState({ status: '' });

  // Newsletter Editor states
  const [editorMode, setEditorMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [recentArticles, setRecentArticles] = useState([]);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [newsletterContent, setNewsletterContent] = useState({
    name: '',
    subject_fr: '',
    subject_en: '',
    content_html_fr: '',
    content_html_en: '',
    target_lists: [],
    target_language: 'all',
    blocks: []
  });
  const editorRef = useRef(null);

  // Modal states
  const [showListModal, setShowListModal] = useState(false);
  const [showSubscriberModal, setShowSubscriberModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);

  // Sending progress state
  const [sendingProgress, setSendingProgress] = useState({
    campaignId: null,
    name: '',
    status: 'pending',
    total: 0,
    sent: 0,
    failed: 0,
    progress: 0
  });
  const [scheduleData, setScheduleData] = useState({
    campaignId: null,
    scheduledDate: '',
    scheduledTime: ''
  });
  const progressIntervalRef = useRef(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    type: 'danger', // 'danger', 'warning', 'info'
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    onConfirm: null
  });

  // Styles
  const styles = {
    container: {
      padding: '24px',
      minHeight: '100vh',
      background: isDark ? '#0f172a' : '#f8fafc'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      margin: 0,
      fontSize: '28px',
      fontWeight: '700',
      color: isDark ? '#e2e8f0' : '#1e293b'
    },
    tabs: {
      display: 'flex',
      gap: '4px',
      background: isDark ? '#1e293b' : '#ffffff',
      padding: '6px',
      borderRadius: '14px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      flexWrap: 'wrap'
    },
    tab: (active) => ({
      padding: '10px 18px',
      borderRadius: '10px',
      border: 'none',
      background: active ? colors.primary : 'transparent',
      color: active ? 'white' : (isDark ? '#94a3b8' : '#64748b'),
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    }),
    card: {
      background: isDark ? '#1e293b' : '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      marginBottom: '20px'
    },
    statCard: (color) => ({
      background: isDark ? '#1e293b' : '#ffffff',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${color}`,
      flex: 1,
      minWidth: '200px'
    }),
    statValue: {
      fontSize: '32px',
      fontWeight: '700',
      color: isDark ? '#e2e8f0' : '#1e293b',
      marginBottom: '4px'
    },
    statLabel: {
      fontSize: '13px',
      color: isDark ? '#94a3b8' : '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      textAlign: 'left',
      padding: '14px 16px',
      fontSize: '12px',
      fontWeight: '600',
      color: isDark ? '#94a3b8' : '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
    },
    td: {
      padding: '14px 16px',
      fontSize: '14px',
      color: isDark ? '#e2e8f0' : '#1e293b',
      borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`
    },
    btn: (variant = 'primary') => ({
      padding: '10px 18px',
      borderRadius: '10px',
      border: 'none',
      background: variant === 'primary' ? colors.primary :
                  variant === 'secondary' ? colors.secondary :
                  variant === 'danger' ? colors.error :
                  (isDark ? '#334155' : '#e2e8f0'),
      color: ['primary', 'secondary', 'danger'].includes(variant) ? 'white' : (isDark ? '#e2e8f0' : '#1e293b'),
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    }),
    btnIcon: {
      padding: '8px',
      borderRadius: '8px',
      border: 'none',
      background: isDark ? '#334155' : '#f1f5f9',
      color: isDark ? '#94a3b8' : '#64748b',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    input: {
      padding: '12px 16px',
      borderRadius: '10px',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      background: isDark ? '#0f172a' : '#ffffff',
      color: isDark ? '#e2e8f0' : '#1e293b',
      fontSize: '14px',
      width: '100%',
      outline: 'none'
    },
    select: {
      padding: '12px 16px',
      borderRadius: '10px',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      background: isDark ? '#0f172a' : '#ffffff',
      color: isDark ? '#e2e8f0' : '#1e293b',
      fontSize: '14px',
      width: '100%',
      outline: 'none'
    },
    textarea: {
      padding: '12px 16px',
      borderRadius: '10px',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      background: isDark ? '#0f172a' : '#ffffff',
      color: isDark ? '#e2e8f0' : '#1e293b',
      fontSize: '14px',
      width: '100%',
      minHeight: '120px',
      resize: 'vertical',
      outline: 'none',
      fontFamily: 'inherit'
    },
    badge: (color) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      background: `${color}20`,
      color: color
    }),
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modalContent: {
      background: isDark ? '#1e293b' : '#ffffff',
      borderRadius: '20px',
      width: '100%',
      maxWidth: '700px',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
      padding: '30px'
    },
    modalHeader: {
      padding: '20px 24px',
      borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    modalBody: {
      padding: '24px'
    },
    modalFooter: {
      padding: '16px 24px',
      borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px'
    }
  };

  // Show notification
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // Show confirmation modal
  const showConfirm = useCallback(({ title, message, type = 'danger', confirmText = 'Confirmer', cancelText = 'Annuler', onConfirm }) => {
    setConfirmModal({
      show: true,
      title,
      message,
      type,
      confirmText,
      cancelText,
      onConfirm
    });
  }, []);

  const hideConfirm = useCallback(() => {
    setConfirmModal(prev => ({ ...prev, show: false, onConfirm: null }));
  }, []);

  // Load data
  const loadStats = useCallback(async () => {
    const res = await api.get('/newsletter/stats', token);
    if (res.success) setStats(res.data);
  }, [token]);

  const loadLists = useCallback(async () => {
    const res = await api.get('/newsletter/lists', token);
    if (res.success) setLists(res.data);
  }, [token]);

  const loadSubscribers = useCallback(async (page = 1) => {
    const params = new URLSearchParams({
      page,
      limit: subscribersPagination.limit,
      ...Object.fromEntries(Object.entries(subscriberFilters).filter(([_, v]) => v))
    });
    const res = await api.get(`/newsletter/subscribers?${params}`, token);
    if (res.success) {
      setSubscribers(res.data);
      setSubscribersPagination(res.pagination);
    }
  }, [token, subscriberFilters, subscribersPagination.limit]);

  const loadTemplates = useCallback(async () => {
    const res = await api.get('/newsletter/templates', token);
    if (res.success) setTemplates(res.data);
  }, [token]);

  const loadCampaigns = useCallback(async (page = 1) => {
    const params = new URLSearchParams({
      page,
      limit: campaignsPagination.limit,
      ...Object.fromEntries(Object.entries(newsletterFilters).filter(([_, v]) => v))
    });
    const res = await api.get(`/newsletter/campaigns?${params}`, token);
    if (res.success) {
      setCampaigns(res.data);
      setCampaignsPagination(res.pagination);
    }
  }, [token, newsletterFilters, campaignsPagination.limit]);

  // Load recent articles for newsletter
  const loadRecentArticles = useCallback(async () => {
    const res = await api.get('/posts?status=published&limit=10&sort=-published_at', token);
    if (res.success) {
      setRecentArticles(res.data || []);
    }
  }, [token]);

  const loadSettings = useCallback(async () => {
    const res = await api.get('/newsletter/settings', token);
    if (res.success) setSettings(res.data);
  }, [token]);

  // Initial load
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadStats(), loadLists(), loadTemplates(), loadSettings()]);
      setLoading(false);
    };
    loadAll();
  }, [loadStats, loadLists, loadTemplates, loadSettings]);

  // Load subscribers when tab changes or filters change
  useEffect(() => {
    if (activeTab === 'subscribers') {
      loadSubscribers(1);
    }
  }, [activeTab, subscriberFilters, loadSubscribers]);

  // Load newsletters when tab changes
  useEffect(() => {
    if (activeTab === 'newsletters') {
      loadCampaigns(1);
      loadRecentArticles();
    }
  }, [activeTab, newsletterFilters, loadCampaigns, loadRecentArticles]);

  // ============================================
  // LIST MANAGEMENT
  // ============================================

  // Confirmation Modal Component
  const ConfirmModal = () => {
    if (!confirmModal.show) return null;

    const typeConfig = {
      danger: { color: colors.error, icon: <AlertCircle size={48} />, bgColor: `${colors.error}15` },
      warning: { color: colors.warning, icon: <AlertCircle size={48} />, bgColor: `${colors.warning}15` },
      info: { color: colors.secondary, icon: <AlertCircle size={48} />, bgColor: `${colors.secondary}15` }
    };

    const config = typeConfig[confirmModal.type] || typeConfig.danger;

    return (
      <div style={styles.modal} onClick={hideConfirm}>
        <div
          style={{
            ...styles.modalContent,
            maxWidth: '420px',
            textAlign: 'center',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: config.bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: config.color
          }}>
            {config.icon}
          </div>

          {/* Title */}
          <h3 style={{
            margin: '0 0 12px',
            fontSize: '20px',
            fontWeight: '700',
            color: isDark ? '#e2e8f0' : '#1e293b'
          }}>
            {confirmModal.title}
          </h3>

          {/* Message */}
          <p style={{
            margin: '0 0 24px',
            fontSize: '14px',
            color: isDark ? '#94a3b8' : '#64748b',
            lineHeight: '1.6'
          }}>
            {confirmModal.message}
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              style={{
                ...styles.btn,
                background: isDark ? '#334155' : '#e2e8f0',
                color: isDark ? '#e2e8f0' : '#475569',
                minWidth: '120px'
              }}
              onClick={hideConfirm}
            >
              {confirmModal.cancelText}
            </button>
            <button
              style={{
                ...styles.btn,
                background: config.color,
                color: 'white',
                minWidth: '120px'
              }}
              onClick={confirmModal.onConfirm}
            >
              {confirmModal.confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ListModal = () => {
    const [form, setForm] = useState(editingItem || {
      name: '',
      description: '',
      color: '#27AE60',
      is_public: true,
      double_optin: true,
      welcome_email_enabled: true
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
      if (!form.name) {
        showNotification('Nom requis', 'error');
        return;
      }
      setSaving(true);
      const res = editingItem
        ? await api.put(`/newsletter/lists/${editingItem.id}`, form, token)
        : await api.post('/newsletter/lists', form, token);
      setSaving(false);

      if (res.success) {
        showNotification(editingItem ? 'Liste mise a jour' : 'Liste creee');
        setShowListModal(false);
        setEditingItem(null);
        loadLists();
      } else {
        showNotification(res.message || 'Erreur', 'error');
      }
    };

    return (
      <div style={styles.modal} onClick={() => { setShowListModal(false); setEditingItem(null); }}>
        <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <h3 style={{ margin: 0, color: isDark ? '#e2e8f0' : '#1e293b' }}>
              {editingItem ? 'Modifier la liste' : 'Nouvelle liste'}
            </h3>
            <button style={styles.btnIcon} onClick={() => { setShowListModal(false); setEditingItem(null); }}>
              <X size={20} />
            </button>
          </div>
          <div style={styles.modalBody}>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                  Nom *
                </label>
                <input
                  style={styles.input}
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Newsletter mensuelle"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                  Description
                </label>
                <textarea
                  style={styles.textarea}
                  value={form.description || ''}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Description de la liste..."
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                  Couleur
                </label>
                <input
                  type="color"
                  value={form.color || '#27AE60'}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                  style={{ width: '60px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.is_public}
                    onChange={e => setForm({ ...form, is_public: e.target.checked })}
                  />
                  <span style={{ fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>Liste publique</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.double_optin}
                    onChange={e => setForm({ ...form, double_optin: e.target.checked })}
                  />
                  <span style={{ fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>Double opt-in</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.welcome_email_enabled}
                    onChange={e => setForm({ ...form, welcome_email_enabled: e.target.checked })}
                  />
                  <span style={{ fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>Email de bienvenue</span>
                </label>
              </div>
            </div>
          </div>
          <div style={styles.modalFooter}>
            <button style={styles.btn('ghost')} onClick={() => { setShowListModal(false); setEditingItem(null); }}>
              Annuler
            </button>
            <button style={styles.btn('primary')} onClick={handleSave} disabled={saving}>
              {saving ? <Loader size={16} className="spin" /> : <Check size={16} />}
              {editingItem ? 'Mettre a jour' : 'Creer'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // SUBSCRIBER MANAGEMENT
  // ============================================

  const SubscriberModal = () => {
    const [form, setForm] = useState(editingItem || {
      email: '',
      first_name: '',
      last_name: '',
      language: 'fr',
      status: 'active',
      list_ids: []
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
      if (!form.email) {
        showNotification('Email requis', 'error');
        return;
      }
      setSaving(true);
      const res = editingItem
        ? await api.put(`/newsletter/subscribers/${editingItem.id}`, form, token)
        : await api.post('/newsletter/subscribers', form, token);
      setSaving(false);

      if (res.success) {
        showNotification(editingItem ? 'Abonne mis a jour' : 'Abonne ajoute');
        setShowSubscriberModal(false);
        setEditingItem(null);
        loadSubscribers(subscribersPagination.page);
        loadStats();
      } else {
        showNotification(res.message || 'Erreur', 'error');
      }
    };

    return (
      <div style={styles.modal} onClick={() => { setShowSubscriberModal(false); setEditingItem(null); }}>
        <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <h3 style={{ margin: 0, color: isDark ? '#e2e8f0' : '#1e293b' }}>
              {editingItem ? 'Modifier l\'abonne' : 'Nouvel abonne'}
            </h3>
            <button style={styles.btnIcon} onClick={() => { setShowSubscriberModal(false); setEditingItem(null); }}>
              <X size={20} />
            </button>
          </div>
          <div style={styles.modalBody}>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                  Email *
                </label>
                <input
                  type="email"
                  style={styles.input}
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                  disabled={!!editingItem}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Prenom
                  </label>
                  <input
                    style={styles.input}
                    value={form.first_name || ''}
                    onChange={e => setForm({ ...form, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Nom
                  </label>
                  <input
                    style={styles.input}
                    value={form.last_name || ''}
                    onChange={e => setForm({ ...form, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Langue
                  </label>
                  <select style={styles.select} value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}>
                    <option value="fr">Francais</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Statut
                  </label>
                  <select style={styles.select} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Actif</option>
                    <option value="pending">En attente</option>
                    <option value="unsubscribed">Desabonne</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                  Listes
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {lists.map(list => (
                    <label key={list.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '6px 12px', borderRadius: '20px', background: form.list_ids?.includes(list.id) ? `${list.color}20` : (isDark ? '#334155' : '#f1f5f9'), border: `1px solid ${form.list_ids?.includes(list.id) ? list.color : 'transparent'}` }}>
                      <input
                        type="checkbox"
                        checked={form.list_ids?.includes(list.id)}
                        onChange={e => {
                          const newIds = e.target.checked
                            ? [...(form.list_ids || []), list.id]
                            : (form.list_ids || []).filter(id => id !== list.id);
                          setForm({ ...form, list_ids: newIds });
                        }}
                        style={{ display: 'none' }}
                      />
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: list.color }} />
                      <span style={{ fontSize: '13px', color: isDark ? '#e2e8f0' : '#1e293b' }}>{list.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={styles.modalFooter}>
            <button style={styles.btn('ghost')} onClick={() => { setShowSubscriberModal(false); setEditingItem(null); }}>
              Annuler
            </button>
            <button style={styles.btn('primary')} onClick={handleSave} disabled={saving}>
              {saving ? <Loader size={16} className="spin" /> : <Check size={16} />}
              {editingItem ? 'Mettre a jour' : 'Ajouter'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Import Modal
  const ImportModal = () => {
    const [csvData, setCsvData] = useState('');
    const [targetList, setTargetList] = useState('');
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState(null);

    const handleImport = async () => {
      if (!csvData.trim()) {
        showNotification('Donnees CSV requises', 'error');
        return;
      }

      // Parse CSV
      const lines = csvData.trim().split('\n');
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      const subscribers = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
        const sub = {};
        headers.forEach((h, idx) => {
          if (h === 'email' || h === 'e-mail') sub.email = values[idx];
          else if (h === 'first_name' || h === 'firstname' || h === 'prenom') sub.first_name = values[idx];
          else if (h === 'last_name' || h === 'lastname' || h === 'nom') sub.last_name = values[idx];
          else if (h === 'language' || h === 'langue') sub.language = values[idx];
        });
        if (sub.email) subscribers.push(sub);
      }

      if (subscribers.length === 0) {
        showNotification('Aucun abonne valide trouve', 'error');
        return;
      }

      setImporting(true);
      const res = await api.post('/newsletter/subscribers/import', {
        subscribers,
        list_id: targetList || null
      }, token);
      setImporting(false);

      if (res.success) {
        setResult(res.data);
        loadSubscribers(1);
        loadStats();
        loadLists();
      } else {
        showNotification(res.message || 'Erreur', 'error');
      }
    };

    return (
      <div style={styles.modal} onClick={() => { setShowImportModal(false); setResult(null); }}>
        <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <h3 style={{ margin: 0, color: isDark ? '#e2e8f0' : '#1e293b' }}>
              Importer des abonnes
            </h3>
            <button style={styles.btnIcon} onClick={() => { setShowImportModal(false); setResult(null); }}>
              <X size={20} />
            </button>
          </div>
          <div style={styles.modalBody}>
            {result ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <CheckCircle size={48} color={colors.success} style={{ marginBottom: '16px' }} />
                <h4 style={{ color: isDark ? '#e2e8f0' : '#1e293b', marginBottom: '12px' }}>Import termine!</h4>
                <p style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                  {result.imported} importe(s), {result.skipped} ignore(s)
                </p>
                {result.errors?.length > 0 && (
                  <div style={{ marginTop: '16px', textAlign: 'left', padding: '12px', background: isDark ? '#0f172a' : '#fef2f2', borderRadius: '8px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: colors.error, marginBottom: '8px' }}>Erreurs:</p>
                    {result.errors.map((err, i) => (
                      <p key={i} style={{ fontSize: '12px', color: isDark ? '#f87171' : colors.error }}>{err.email}: {err.error}</p>
                    ))}
                  </div>
                )}
                <button style={{ ...styles.btn('primary'), marginTop: '20px' }} onClick={() => { setShowImportModal(false); setResult(null); }}>
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '14px', marginBottom: '16px' }}>
                  Collez vos donnees CSV ci-dessous. Format: email,first_name,last_name,language
                </p>
                <textarea
                  style={{ ...styles.textarea, minHeight: '200px', fontFamily: 'monospace' }}
                  value={csvData}
                  onChange={e => setCsvData(e.target.value)}
                  placeholder="email,first_name,last_name,language
john@example.com,John,Doe,en
marie@example.com,Marie,Dupont,fr"
                />
                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Ajouter a la liste (optionnel)
                  </label>
                  <select style={styles.select} value={targetList} onChange={e => setTargetList(e.target.value)}>
                    <option value="">Aucune liste</option>
                    {lists.map(list => (
                      <option key={list.id} value={list.id}>{list.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
          {!result && (
            <div style={styles.modalFooter}>
              <button style={styles.btn('ghost')} onClick={() => setShowImportModal(false)}>
                Annuler
              </button>
              <button style={styles.btn('primary')} onClick={handleImport} disabled={importing}>
                {importing ? <Loader size={16} className="spin" /> : <Upload size={16} />}
                Importer
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================
  // CAMPAIGN MANAGEMENT
  // ============================================

  const CampaignModal = () => {
    const [form, setForm] = useState(editingItem || {
      name: '',
      subject_fr: '',
      subject_en: '',
      content_html_fr: '',
      content_html_en: '',
      target_lists: [],
      target_language: 'all'
    });
    const [saving, setSaving] = useState(false);
    const [activeContentTab, setActiveContentTab] = useState('fr');

    const handleSave = async () => {
      if (!form.name || !form.subject_fr || !form.content_html_fr || form.target_lists.length === 0) {
        showNotification('Champs requis manquants', 'error');
        return;
      }
      setSaving(true);
      const res = editingItem
        ? await api.put(`/newsletter/campaigns/${editingItem.id}`, form, token)
        : await api.post('/newsletter/campaigns', form, token);
      setSaving(false);

      if (res.success) {
        showNotification(editingItem ? 'Newsletter mise a jour' : 'Newsletter creee');
        setShowCampaignModal(false);
        setEditingItem(null);
        loadCampaigns(campaignsPagination.page);
      } else {
        showNotification(res.message || 'Erreur', 'error');
      }
    };

    // Get default template content
    const applyTemplate = (template) => {
      setForm({
        ...form,
        content_html_fr: template.content_html_fr || '',
        content_html_en: template.content_html_en || ''
      });
    };

    return (
      <div style={styles.modal} onClick={() => { setShowCampaignModal(false); setEditingItem(null); }}>
        <div style={{ ...styles.modalContent, maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <h3 style={{ margin: 0, color: isDark ? '#e2e8f0' : '#1e293b' }}>
              {editingItem ? 'Modifier la newsletter' : 'Nouvelle newsletter'}
            </h3>
            <button style={styles.btnIcon} onClick={() => { setShowCampaignModal(false); setEditingItem(null); }}>
              <X size={20} />
            </button>
          </div>
          <div style={styles.modalBody}>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                  Nom de la newsletter *
                </label>
                <input
                  style={styles.input}
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Newsletter janvier 2026"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Sujet (FR) *
                  </label>
                  <input
                    style={styles.input}
                    value={form.subject_fr}
                    onChange={e => setForm({ ...form, subject_fr: e.target.value })}
                    placeholder="Sujet de l'email en francais"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Sujet (EN)
                  </label>
                  <input
                    style={styles.input}
                    value={form.subject_en || ''}
                    onChange={e => setForm({ ...form, subject_en: e.target.value })}
                    placeholder="Email subject in English"
                  />
                </div>
              </div>

              {/* Template selector */}
              {templates.length > 0 && (
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Appliquer un template
                  </label>
                  <select style={styles.select} onChange={e => {
                    const template = templates.find(t => t.id === parseInt(e.target.value));
                    if (template) applyTemplate(template);
                  }}>
                    <option value="">Selectionner un template...</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Content tabs */}
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeContentTab === 'fr' ? colors.primary : (isDark ? '#334155' : '#e2e8f0'),
                      color: activeContentTab === 'fr' ? 'white' : (isDark ? '#94a3b8' : '#64748b'),
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                    onClick={() => setActiveContentTab('fr')}
                  >
                    Contenu FR *
                  </button>
                  <button
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeContentTab === 'en' ? colors.secondary : (isDark ? '#334155' : '#e2e8f0'),
                      color: activeContentTab === 'en' ? 'white' : (isDark ? '#94a3b8' : '#64748b'),
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                    onClick={() => setActiveContentTab('en')}
                  >
                    Contenu EN
                  </button>
                </div>
                {activeContentTab === 'fr' ? (
                  <textarea
                    style={{ ...styles.textarea, minHeight: '250px', fontFamily: 'monospace', fontSize: '13px' }}
                    value={form.content_html_fr}
                    onChange={e => setForm({ ...form, content_html_fr: e.target.value })}
                    placeholder="Contenu HTML de l'email en francais..."
                  />
                ) : (
                  <textarea
                    style={{ ...styles.textarea, minHeight: '250px', fontFamily: 'monospace', fontSize: '13px' }}
                    value={form.content_html_en || ''}
                    onChange={e => setForm({ ...form, content_html_en: e.target.value })}
                    placeholder="HTML content in English..."
                  />
                )}
                <p style={{ fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8', marginTop: '8px' }}>
                  Variables disponibles: {'{{first_name}}'}, {'{{last_name}}'}, {'{{email}}'}, {'{{unsubscribe_url}}'}, {'{{date}}'}
                </p>
              </div>

              {/* Target lists */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                  Listes cibles *
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {lists.map(list => (
                    <label key={list.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '8px 14px', borderRadius: '20px', background: form.target_lists?.includes(list.id) ? `${list.color}20` : (isDark ? '#334155' : '#f1f5f9'), border: `2px solid ${form.target_lists?.includes(list.id) ? list.color : 'transparent'}` }}>
                      <input
                        type="checkbox"
                        checked={form.target_lists?.includes(list.id)}
                        onChange={e => {
                          const newIds = e.target.checked
                            ? [...(form.target_lists || []), list.id]
                            : (form.target_lists || []).filter(id => id !== list.id);
                          setForm({ ...form, target_lists: newIds });
                        }}
                        style={{ display: 'none' }}
                      />
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: list.color }} />
                      <span style={{ fontSize: '13px', color: isDark ? '#e2e8f0' : '#1e293b' }}>{list.name}</span>
                      <span style={{ fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>({list.active_subscribers || 0})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Target language */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                  Langue cible
                </label>
                <select style={styles.select} value={form.target_language} onChange={e => setForm({ ...form, target_language: e.target.value })}>
                  <option value="all">Toutes les langues</option>
                  <option value="fr">Francais uniquement</option>
                  <option value="en">English only</option>
                </select>
              </div>
            </div>
          </div>
          <div style={styles.modalFooter}>
            <button style={styles.btn('ghost')} onClick={() => { setShowCampaignModal(false); setEditingItem(null); }}>
              Annuler
            </button>
            <button style={styles.btn('primary')} onClick={handleSave} disabled={saving}>
              {saving ? <Loader size={16} className="spin" /> : <Check size={16} />}
              {editingItem ? 'Mettre a jour' : 'Creer'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // NEWSLETTER EDITOR (Full Page)
  // ============================================
  const NewsletterEditor = () => {
    const [step, setStep] = useState(selectedTemplate ? 'editor' : 'templates');
    const [activeContentTab, setActiveContentTab] = useState('visual');
    const [activeLang, setActiveLang] = useState('fr');
    const [saving, setSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    // Local form state to avoid parent re-render on each keystroke
    const [formData, setFormData] = useState({
      name: editingItem?.name || '',
      subject_fr: editingItem?.subject_fr || '',
      subject_en: editingItem?.subject_en || '',
      content_html_fr: editingItem?.content_html_fr || '',
      content_html_en: editingItem?.content_html_en || '',
      target_lists: editingItem?.target_lists || [],
      target_language: editingItem?.target_language || 'all'
    });

    // Initialize contentEditable with initial content
    useEffect(() => {
      if (editorRef.current && formData.content_html_fr) {
        editorRef.current.innerHTML = formData.content_html_fr;
      }
    }, []); // Only on mount

    // Open editor with template
    const selectTemplate = (template) => {
      setSelectedTemplate(template);
      setStep('editor');
    };

    // Generate HTML from template and content
    const generateHtmlFromBlocks = () => {
      // Use production URL - change this when deploying
      const siteUrl = 'https://onehealth.cm';
      // Backend URL for serving images (uploads)
      const backendUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:5001'
        : siteUrl;

      // One Health logo as embedded base64 JPG (works reliably in all email clients)
      const logoUrl = logoBase64;

      // Generate articles HTML
      let articlesHtml = '';
      if (selectedArticles.length > 0) {
        selectedArticles.forEach(article => {
          let imageUrl = `${siteUrl}/images/placeholder.jpg`;
          if (article.featured_image) {
            // Clean the path - remove leading slash if present for consistent handling
            const cleanPath = article.featured_image.replace(/^\/+/, '');
            if (article.featured_image.startsWith('http')) {
              imageUrl = article.featured_image;
            } else if (cleanPath.startsWith('uploads/')) {
              imageUrl = `${backendUrl}/${cleanPath}`;
            } else {
              imageUrl = `${backendUrl}/uploads/${cleanPath}`;
            }
          }
          articlesHtml += `
      <div class="article" style="margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px solid #e2e8f0;">
        <img src="${imageUrl}" alt="${article.title_fr || article.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 10px; margin-bottom: 15px;">
        <h2 style="font-size: 18px; color: #1e293b; margin: 0 0 10px;">${article.title_fr || article.title}</h2>
        <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 12px;">${(article.excerpt_fr || article.excerpt || '').substring(0, 200)}...</p>
        <a href="${siteUrl}/${activeLang}/news/${article.slug}" style="color: #059669; text-decoration: none; font-weight: 600; font-size: 14px;">Lire la suite &rarr;</a>
      </div>`;
        });
      }

      // If we have a template from the database, use it
      if (selectedTemplate && selectedTemplate.content_html_fr) {
        let html = selectedTemplate.content_html_fr;

        // Replace all template variables
        html = html.replace(/\{\{subject\}\}/g, formData.subject_fr || 'Newsletter');
        html = html.replace(/\{\{first_name\}\}/g, '{{first_name}}');
        html = html.replace(/\{\{last_name\}\}/g, '{{last_name}}');
        html = html.replace(/\{\{email\}\}/g, '{{email}}');
        html = html.replace(/\{\{site_url\}\}/g, siteUrl);
        html = html.replace(/\{\{backend_url\}\}/g, backendUrl);
        html = html.replace(/\{\{logo_url\}\}/g, logoUrl);
        html = html.replace(/\{\{unsubscribe_url\}\}/g, '{{unsubscribe_url}}');
        html = html.replace(/\{\{year\}\}/g, new Date().getFullYear().toString());
        html = html.replace(/\{\{articles\}\}/g, articlesHtml);
        html = html.replace(/\{\{custom_content\}\}/g, formData.content_html_fr || '');

        // Replace old logo URLs with base64 logo
        html = html.replace(/src=["']?\{\{site_url\}\}\/images\/one-health\.jpg["']?/g, `src="${logoUrl}"`);
        html = html.replace(/src=["']?https:\/\/onehealth\.cm\/images\/one-health\.jpg["']?/g, `src="${logoUrl}"`);

        return html;
      }

      // Fallback - generate basic HTML if no template selected
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${formData.subject_fr || 'Newsletter'}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, sans-serif; background: #f4f4f4; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #065f46 0%, #047857 100%); padding: 25px 30px; }
    .header-content { display: flex; align-items: center; gap: 15px; }
    .header img { height: 50px; width: 50px; border-radius: 10px; background: white; padding: 5px; }
    .header-text h1 { color: white; margin: 0; font-size: 22px; font-weight: 700; }
    .header-text p { color: #a7f3d0; margin: 3px 0 0; font-size: 12px; }
    .content { padding: 30px; }
    .footer { background: #1e293b; color: #94a3b8; padding: 30px; text-align: center; font-size: 12px; }
    .footer a { color: #10b981; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td width="60" valign="middle">
            <img src="${logoUrl}" alt="OH" style="height: 50px; width: 50px; border-radius: 10px; background: white; padding: 5px;">
          </td>
          <td valign="middle" style="padding-left: 15px;">
            <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">One Health</h1>
            <p style="color: #a7f3d0; margin: 3px 0 0; font-size: 12px;">Cameroon</p>
          </td>
        </tr>
      </table>
    </div>
    <div class="content">
      ${articlesHtml}
      ${formData.content_html_fr || ''}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} One Health Cameroon. Tous droits reserves.</p>
      <p><a href="{{unsubscribe_url}}">Se desabonner</a></p>
    </div>
  </div>
</body>
</html>`;
    };

    // Save newsletter
    const handleSave = async () => {
      // Get latest content from editor
      const currentContent = editorRef.current ? editorRef.current.innerHTML : formData.content_html_fr;

      if (!formData.name || !formData.subject_fr || formData.target_lists.length === 0) {
        showNotification('Veuillez remplir tous les champs requis', 'error');
        return;
      }

      setSaving(true);

      // Update formData with latest editor content before generating HTML
      const updatedFormData = { ...formData, content_html_fr: currentContent };
      const htmlContent = generateHtmlFromBlocks();

      const payload = {
        ...updatedFormData,
        content_html_fr: htmlContent,
        content_html_en: htmlContent,
        source_type: selectedArticles.length > 0 ? 'articles_digest' : 'custom'
      };

      const res = editingItem
        ? await api.put(`/newsletter/campaigns/${editingItem.id}`, payload, token)
        : await api.post('/newsletter/campaigns', payload, token);

      setSaving(false);

      if (res.success) {
        showNotification(editingItem ? 'Newsletter mise a jour' : 'Newsletter creee');
        setEditorMode(false);
        setSelectedTemplate(null);
        setSelectedArticles([]);
        setNewsletterContent({
          name: '', subject_fr: '', subject_en: '', content_html_fr: '', content_html_en: '',
          target_lists: [], target_language: 'all', blocks: []
        });
        loadCampaigns(campaignsPagination.page);
      } else {
        showNotification(res.message || 'Erreur', 'error');
      }
    };

    // Back to list
    const handleBack = () => {
      if (step === 'editor' && !editingItem) {
        setStep('templates');
        setSelectedTemplate(null);
      } else {
        setEditorMode(false);
        setEditingItem(null);
        setSelectedTemplate(null);
        setSelectedArticles([]);
      }
    };

    // Toggle article selection
    const toggleArticle = (article) => {
      setSelectedArticles(prev => {
        const exists = prev.find(a => a.id === article.id);
        if (exists) {
          return prev.filter(a => a.id !== article.id);
        }
        return [...prev, article];
      });
    };

    // Template Selection Step
    if (step === 'templates') {
      return (
        <div style={{ ...styles.container, padding: 0 }}>
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '20px 24px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            background: isDark ? '#1e293b' : '#ffffff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button style={styles.btnIcon} onClick={handleBack}>
                <ArrowLeft size={20} />
              </button>
              <h2 style={{ margin: 0, color: isDark ? '#e2e8f0' : '#1e293b' }}>
                Choisir un template
              </h2>
            </div>
          </div>

          {/* Templates Grid */}
          <div style={{ padding: '24px', overflowY: 'auto' }}>
            <p style={{ color: isDark ? '#94a3b8' : '#64748b', marginBottom: '24px' }}>
              Selectionnez un template professionnel pour commencer votre newsletter
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {templates.map(template => (
                <div
                  key={template.id}
                  onClick={() => selectTemplate(template)}
                  style={{
                    background: isDark ? '#1e293b' : '#ffffff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? '#334155' : '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {/* Preview gradient */}
                  <div style={{
                    height: '140px',
                    background: template.preview_gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative'
                  }}>
                    {/* Mini email preview */}
                    <div style={{
                      width: '90px', height: '110px', background: 'rgba(255,255,255,0.95)',
                      borderRadius: '6px', boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                      display: 'flex', flexDirection: 'column', padding: '10px'
                    }}>
                      <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '3px', marginBottom: '8px' }} />
                      <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '3px', marginBottom: '8px' }} />
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', width: '60%' }} />
                    </div>
                    {template.is_default && (
                      <span style={{
                        position: 'absolute', top: '10px', right: '10px',
                        background: 'rgba(255,255,255,0.95)', color: '#059669',
                        padding: '4px 12px', borderRadius: '12px', fontSize: '10px', fontWeight: '700'
                      }}>
                        Recommande
                      </span>
                    )}
                    <span style={{
                      position: 'absolute', bottom: '10px', left: '10px',
                      background: 'rgba(0,0,0,0.6)', color: '#fff',
                      padding: '4px 10px', borderRadius: '12px', fontSize: '10px'
                    }}>
                      {template.layout === 'image-top' ? 'Image en haut' :
                       template.layout === 'image-left' ? 'Image a gauche' :
                       template.layout === 'image-right' ? 'Image a droite' :
                       template.layout === 'hero-banner' ? 'Hero banner' :
                       template.layout === 'cards-grid' ? 'Grille' :
                       template.layout === 'minimal' ? 'Minimal' :
                       template.layout === 'zigzag' ? 'Zigzag' : template.layout}
                    </span>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
                      <h3 style={{ margin: 0, fontSize: '15px', color: isDark ? '#e2e8f0' : '#1e293b', fontWeight: '600' }}>
                        {template.name}
                      </h3>
                    </div>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: '10px',
                      background: isDark ? '#334155' : '#f1f5f9',
                      fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b'
                    }}>
                      {template.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Editor Step
    return (
      <div style={{ ...styles.container, padding: 0, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 24px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          background: isDark ? '#1e293b' : '#ffffff', flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={styles.btnIcon} onClick={handleBack}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                {editingItem ? 'Modifier la newsletter' : 'Nouvelle newsletter'}
              </h2>
              {selectedTemplate && (
                <span style={{ fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                  Template: {selectedTemplate.name}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              style={{ ...styles.btn('ghost'), display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye size={16} /> {previewMode ? 'Editeur' : 'Apercu'}
            </button>
            <button
              style={{ ...styles.btn('primary'), display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader size={16} className="spin" /> : <Check size={16} />}
              Enregistrer
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Sidebar - Articles */}
          <div style={{
            width: '320px', borderRight: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            background: isDark ? '#0f172a' : '#f8fafc', overflow: 'auto', flexShrink: 0
          }}>
            <div style={{ padding: '16px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                <Newspaper size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Articles recents
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                Selectionnez les articles a inclure
              </p>
            </div>
            <div style={{ padding: '12px' }}>
              {recentArticles.map(article => (
                <div
                  key={article.id}
                  onClick={() => toggleArticle(article)}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: selectedArticles.find(a => a.id === article.id)
                      ? `${colors.primary}15`
                      : (isDark ? '#1e293b' : '#ffffff'),
                    border: `2px solid ${selectedArticles.find(a => a.id === article.id) ? colors.primary : 'transparent'}`
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {article.featured_image && (
                      <img
                        src={article.featured_image?.startsWith('/') ? article.featured_image : `/uploads/${article.featured_image}`}
                        alt=""
                        style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{
                        margin: '0 0 4px', fontSize: '13px', fontWeight: '600',
                        color: isDark ? '#e2e8f0' : '#1e293b',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {article.title_fr || article.title}
                      </h4>
                      <span style={{ fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>
                        {new Date(article.published_at || article.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    {selectedArticles.find(a => a.id === article.id) && (
                      <CheckCircle size={18} color={colors.primary} />
                    )}
                  </div>
                </div>
              ))}
              {recentArticles.length === 0 && (
                <p style={{ textAlign: 'center', color: isDark ? '#64748b' : '#94a3b8', fontSize: '13px', padding: '20px' }}>
                  Aucun article publie
                </p>
              )}
            </div>
          </div>

          {/* Center - Editor/Preview */}
          <div style={{ flex: 1, overflow: 'auto', background: isDark ? '#0f172a' : '#f1f5f9' }}>
            {previewMode ? (
              <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: '600px', background: '#ffffff', borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                }}>
                  <iframe
                    srcDoc={generateHtmlFromBlocks()}
                    style={{ width: '100%', height: '800px', border: 'none', borderRadius: '8px' }}
                    title="Preview"
                  />
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px' }}>
                {/* Form Fields */}
                <div style={{
                  background: isDark ? '#1e293b' : '#ffffff',
                  borderRadius: '12px', padding: '20px', marginBottom: '20px'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                        Nom de la newsletter *
                      </label>
                      <input
                        style={styles.input}
                        value={formData.name}
                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Newsletter Janvier 2026"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                        Sujet de l'email *
                      </label>
                      <input
                        style={styles.input}
                        value={formData.subject_fr}
                        onChange={e => setFormData(prev => ({ ...prev, subject_fr: e.target.value }))}
                        placeholder="Sujet de votre newsletter"
                      />
                    </div>
                  </div>

                  {/* Target Lists */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                      Listes de diffusion *
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {lists.map(list => (
                        <label key={list.id} style={{
                          display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                          padding: '8px 14px', borderRadius: '20px',
                          background: formData.target_lists?.includes(list.id) ? `${list.color}20` : (isDark ? '#334155' : '#f1f5f9'),
                          border: `2px solid ${formData.target_lists?.includes(list.id) ? list.color : 'transparent'}`
                        }}>
                          <input
                            type="checkbox"
                            checked={formData.target_lists?.includes(list.id)}
                            onChange={e => {
                              const newIds = e.target.checked
                                ? [...(formData.target_lists || []), list.id]
                                : (formData.target_lists || []).filter(id => id !== list.id);
                              setFormData(prev => ({ ...prev, target_lists: newIds }));
                            }}
                            style={{ display: 'none' }}
                          />
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: list.color }} />
                          <span style={{ fontSize: '13px', color: isDark ? '#e2e8f0' : '#1e293b' }}>{list.name}</span>
                          <span style={{ fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>({list.active_subscribers || 0})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Selected Articles Preview */}
                {selectedArticles.length > 0 && (
                  <div style={{
                    background: isDark ? '#1e293b' : '#ffffff',
                    borderRadius: '12px', padding: '20px', marginBottom: '20px'
                  }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                      Articles selectionnes ({selectedArticles.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {selectedArticles.map((article, index) => (
                        <div key={article.id} style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '12px', borderRadius: '8px',
                          background: isDark ? '#0f172a' : '#f8fafc'
                        }}>
                          <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: colors.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600' }}>
                            {index + 1}
                          </span>
                          {article.featured_image && (
                            <img src={article.featured_image?.startsWith('/') ? article.featured_image : `/uploads/${article.featured_image}`} alt="" style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                          )}
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, fontSize: '13px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                              {article.title_fr || article.title}
                            </h4>
                          </div>
                          <button style={styles.btnIcon} onClick={() => toggleArticle(article)}>
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Content Editor */}
                <div style={{
                  background: isDark ? '#1e293b' : '#ffffff',
                  borderRadius: '12px', padding: '20px'
                }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                    Contenu personnalise (optionnel)
                  </h3>

                  {/* Simple WYSIWYG Toolbar */}
                  <div style={{
                    display: 'flex', gap: '4px', padding: '8px',
                    background: isDark ? '#0f172a' : '#f8fafc',
                    borderRadius: '8px 8px 0 0', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                  }}>
                    <button style={styles.btnIcon} title="Gras"><Bold size={16} /></button>
                    <button style={styles.btnIcon} title="Italique"><Italic size={16} /></button>
                    <button style={styles.btnIcon} title="Souligne"><Underline size={16} /></button>
                    <div style={{ width: '1px', background: isDark ? '#334155' : '#e2e8f0', margin: '0 8px' }} />
                    <button style={styles.btnIcon} title="Aligner a gauche"><AlignLeft size={16} /></button>
                    <button style={styles.btnIcon} title="Centrer"><AlignCenter size={16} /></button>
                    <button style={styles.btnIcon} title="Aligner a droite"><AlignRight size={16} /></button>
                    <div style={{ width: '1px', background: isDark ? '#334155' : '#e2e8f0', margin: '0 8px' }} />
                    <button style={styles.btnIcon} title="Lien"><Link size={16} /></button>
                    <button style={styles.btnIcon} title="Image"><Image size={16} /></button>
                  </div>

                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    style={{
                      minHeight: '200px',
                      padding: '16px',
                      background: isDark ? '#0f172a' : '#ffffff',
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                      borderTop: 'none',
                      borderRadius: '0 0 8px 8px',
                      color: isDark ? '#e2e8f0' : '#1e293b',
                      outline: 'none',
                      fontSize: '14px',
                      lineHeight: '1.6'
                    }}
                    onBlur={e => setFormData(prev => ({ ...prev, content_html_fr: e.currentTarget.innerHTML }))}
                  />
                  <p style={{ fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8', marginTop: '8px' }}>
                    Variables: {'{{first_name}}'}, {'{{last_name}}'}, {'{{email}}'}, {'{{unsubscribe_url}}'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Newsletter actions
  const sendNewsletter = (newsletterId, campaignName) => {
    showConfirm({
      title: 'Envoyer la newsletter',
      message: 'Etes-vous sur de vouloir envoyer cette newsletter maintenant? Les emails seront envoyes a tous les abonnes cibles.',
      type: 'warning',
      confirmText: 'Envoyer',
      onConfirm: async () => {
        hideConfirm();
        const res = await api.post(`/newsletter/campaigns/${newsletterId}/send`, {}, token);
        if (res.success) {
          // Show progress modal
          setSendingProgress({
            campaignId: newsletterId,
            name: campaignName || 'Newsletter',
            status: 'sending',
            total: res.data?.total_recipients || 0,
            sent: 0,
            failed: 0,
            progress: 0
          });
          setShowProgressModal(true);
          // Start polling for progress
          startProgressPolling(newsletterId);
          loadCampaigns(campaignsPagination.page);
        } else {
          showNotification(res.message || 'Erreur', 'error');
        }
      }
    });
  };

  // Progress polling
  const startProgressPolling = (campaignId) => {
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    // Poll every 2 seconds
    progressIntervalRef.current = setInterval(async () => {
      const res = await api.get(`/newsletter/campaigns/${campaignId}/progress`, token);
      if (res.success) {
        setSendingProgress(prev => ({
          ...prev,
          status: res.data.status,
          total: res.data.total_recipients,
          sent: res.data.sent_count,
          failed: res.data.failed_count,
          progress: res.data.progress
        }));
        // Stop polling if done
        if (res.data.status === 'sent' || res.data.status === 'draft') {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
          loadCampaigns(campaignsPagination.page);
          loadStats();
        }
      }
    }, 2000);
  };

  const stopProgressPolling = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const cancelSending = async () => {
    if (!sendingProgress.campaignId) return;
    const res = await api.post(`/newsletter/campaigns/${sendingProgress.campaignId}/cancel`, {}, token);
    if (res.success) {
      showNotification('Envoi annule');
      stopProgressPolling();
      setShowProgressModal(false);
      loadCampaigns(campaignsPagination.page);
    } else {
      showNotification(res.message || 'Erreur', 'error');
    }
  };

  // Schedule newsletter
  const openScheduleModal = (campaignId) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setScheduleData({
      campaignId,
      scheduledDate: tomorrow.toISOString().split('T')[0],
      scheduledTime: '09:00'
    });
    setShowScheduleModal(true);
  };

  const scheduleNewsletter = async () => {
    if (!scheduleData.campaignId || !scheduleData.scheduledDate || !scheduleData.scheduledTime) {
      showNotification('Veuillez selectionner une date et une heure', 'error');
      return;
    }
    const scheduledAt = `${scheduleData.scheduledDate}T${scheduleData.scheduledTime}:00`;
    const res = await api.post(`/newsletter/campaigns/${scheduleData.campaignId}/schedule`, {
      scheduled_at: scheduledAt
    }, token);
    if (res.success) {
      showNotification('Newsletter programmee');
      setShowScheduleModal(false);
      loadCampaigns(campaignsPagination.page);
    } else {
      showNotification(res.message || 'Erreur', 'error');
    }
  };

  const sendTestEmail = async (campaignId) => {
    const email = window.prompt('Email pour le test:');
    if (!email) return;

    const res = await api.post(`/newsletter/campaigns/${campaignId}/test`, { test_email: email }, token);
    if (res.success) {
      showNotification(`Email de test envoye a ${email}`);
    } else {
      showNotification(res.message || 'Erreur', 'error');
    }
  };

  // Delete handlers
  const deleteList = (id) => {
    showConfirm({
      title: 'Supprimer la liste',
      message: 'Etes-vous sur de vouloir supprimer cette liste? Cette action est irreversible.',
      type: 'danger',
      confirmText: 'Supprimer',
      onConfirm: async () => {
        hideConfirm();
        const res = await api.delete(`/newsletter/lists/${id}`, token);
        if (res.success) {
          showNotification('Liste supprimee');
          loadLists();
        } else {
          showNotification(res.message || 'Erreur', 'error');
        }
      }
    });
  };

  const deleteSubscriber = (id) => {
    showConfirm({
      title: 'Supprimer l\'abonne',
      message: 'Etes-vous sur de vouloir supprimer cet abonne? Cette action est irreversible.',
      type: 'danger',
      confirmText: 'Supprimer',
      onConfirm: async () => {
        hideConfirm();
        const res = await api.delete(`/newsletter/subscribers/${id}`, token);
        if (res.success) {
          showNotification('Abonne supprime');
          loadSubscribers(subscribersPagination.page);
          loadStats();
        } else {
          showNotification(res.message || 'Erreur', 'error');
        }
      }
    });
  };

  const activateSubscriber = async (id) => {
    const res = await api.post('/newsletter/subscribers/bulk', {
      subscriber_ids: [id],
      action: 'activate'
    }, token);
    if (res.success) {
      showNotification('Abonne active');
      loadSubscribers(subscribersPagination.page);
      loadStats();
    } else {
      showNotification(res.message || 'Erreur', 'error');
    }
  };

  const deleteNewsletter = (id) => {
    showConfirm({
      title: 'Supprimer la newsletter',
      message: 'Etes-vous sur de vouloir supprimer cette newsletter? Cette action est irreversible.',
      type: 'danger',
      confirmText: 'Supprimer',
      onConfirm: async () => {
        hideConfirm();
        const res = await api.delete(`/newsletter/campaigns/${id}`, token);
        if (res.success) {
          showNotification('Newsletter supprimee');
          loadCampaigns(campaignsPagination.page);
        } else {
          showNotification(res.message || 'Erreur', 'error');
        }
      }
    });
  };

  // Export subscribers
  const exportSubscribers = async () => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(subscriberFilters).filter(([_, v]) => v))
    );
    window.open(`${API_URL}/newsletter/subscribers/export?${params}&token=${token}`, '_blank');
  };

  // Bulk actions
  const handleBulkAction = async (action, listId = null) => {
    if (selectedSubscribers.length === 0) {
      showNotification('Selectionnez des abonnes', 'error');
      return;
    }

    const res = await api.post('/newsletter/subscribers/bulk', {
      subscriber_ids: selectedSubscribers,
      action,
      list_id: listId
    }, token);

    if (res.success) {
      showNotification(res.message);
      setSelectedSubscribers([]);
      loadSubscribers(subscribersPagination.page);
      loadStats();
      loadLists();
    } else {
      showNotification(res.message || 'Erreur', 'error');
    }
  };

  // Save settings
  const saveSettings = async () => {
    const res = await api.put('/newsletter/settings', settings, token);
    if (res.success) {
      showNotification('Parametres sauvegardes');
    } else {
      showNotification(res.message || 'Erreur', 'error');
    }
  };

  // Status badge
  const getStatusBadge = (status) => {
    const config = {
      active: { color: colors.success, label: 'Actif' },
      pending: { color: colors.warning, label: 'En attente' },
      unsubscribed: { color: colors.error, label: 'Desabonne' },
      bounced: { color: '#94a3b8', label: 'Bounce' },
      draft: { color: '#94a3b8', label: 'Brouillon' },
      scheduled: { color: colors.secondary, label: 'Programme' },
      sending: { color: colors.warning, label: 'En cours' },
      sent: { color: colors.success, label: 'Envoye' },
      paused: { color: colors.accent, label: 'Pause' }
    };
    const { color, label } = config[status] || { color: '#94a3b8', label: status };
    return <span style={styles.badge(color)}>{label}</span>;
  };

  // ============================================
  // RENDER TABS
  // ============================================

  const renderDashboard = () => (
    <div>
      {/* Stats cards */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={styles.statCard(colors.primary)}>
          <div style={styles.statValue}>{stats?.subscribers?.active || 0}</div>
          <div style={styles.statLabel}>Abonnes actifs</div>
        </div>
        <div style={styles.statCard(colors.secondary)}>
          <div style={styles.statValue}>{stats?.campaigns?.sent || 0}</div>
          <div style={styles.statLabel}>Newsletters envoyees</div>
        </div>
        <div style={styles.statCard(colors.accent)}>
          <div style={styles.statValue}>{(parseFloat(stats?.avgOpenRate) || 0).toFixed(1)}%</div>
          <div style={styles.statLabel}>Taux d'ouverture</div>
        </div>
        <div style={styles.statCard(colors.purple)}>
          <div style={styles.statValue}>{(parseFloat(stats?.avgClickRate) || 0).toFixed(1)}%</div>
          <div style={styles.statLabel}>Taux de clic</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Growth chart - Line chart */}
        <div style={styles.card}>
          <h4 style={{ margin: '0 0 16px', color: isDark ? '#e2e8f0' : '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color={colors.primary} />
            Croissance des abonnes (30 jours)
          </h4>
          {(() => {
            const growthData = stats?.growth || [];
            const chartWidth = 500;
            const chartHeight = 200;
            const padding = { top: 20, right: 20, bottom: 30, left: 40 };
            const innerWidth = chartWidth - padding.left - padding.right;
            const innerHeight = chartHeight - padding.top - padding.bottom;

            // Calculate cumulative total for growth curve
            let cumulative = 0;
            const cumulativeData = growthData.map(d => {
              cumulative += (d.count || 0);
              return { ...d, cumulative };
            });

            const maxValue = Math.max(...cumulativeData.map(d => d.cumulative), 1);
            const minValue = 0;

            // Generate path for smooth curve
            const getX = (i) => padding.left + (i / Math.max(cumulativeData.length - 1, 1)) * innerWidth;
            const getY = (val) => padding.top + innerHeight - ((val - minValue) / (maxValue - minValue)) * innerHeight;

            // Create smooth bezier curve path
            let linePath = '';
            let areaPath = '';
            if (cumulativeData.length > 0) {
              linePath = `M ${getX(0)} ${getY(cumulativeData[0].cumulative)}`;
              areaPath = `M ${getX(0)} ${getY(0)} L ${getX(0)} ${getY(cumulativeData[0].cumulative)}`;

              for (let i = 1; i < cumulativeData.length; i++) {
                const x0 = getX(i - 1);
                const y0 = getY(cumulativeData[i - 1].cumulative);
                const x1 = getX(i);
                const y1 = getY(cumulativeData[i].cumulative);
                const cpx = (x0 + x1) / 2;
                linePath += ` C ${cpx} ${y0}, ${cpx} ${y1}, ${x1} ${y1}`;
                areaPath += ` C ${cpx} ${y0}, ${cpx} ${y1}, ${x1} ${y1}`;
              }
              areaPath += ` L ${getX(cumulativeData.length - 1)} ${getY(0)} Z`;
            }

            // Y-axis labels
            const yTicks = 5;
            const yLabels = Array.from({ length: yTicks }, (_, i) => Math.round(minValue + (maxValue - minValue) * (i / (yTicks - 1))));

            return (
              <div style={{ position: 'relative' }}>
                <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ overflow: 'visible' }}>
                  {/* Grid lines */}
                  {yLabels.map((val, i) => (
                    <g key={i}>
                      <line
                        x1={padding.left}
                        y1={getY(val)}
                        x2={chartWidth - padding.right}
                        y2={getY(val)}
                        stroke={isDark ? '#334155' : '#e2e8f0'}
                        strokeDasharray="4,4"
                      />
                      <text
                        x={padding.left - 8}
                        y={getY(val) + 4}
                        textAnchor="end"
                        fontSize="10"
                        fill={isDark ? '#64748b' : '#94a3b8'}
                      >
                        {val}
                      </text>
                    </g>
                  ))}

                  {/* Area gradient */}
                  <defs>
                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={colors.primary} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={colors.primary} stopOpacity="0.05" />
                    </linearGradient>
                  </defs>

                  {/* Area fill */}
                  {cumulativeData.length > 0 && (
                    <path
                      d={areaPath}
                      fill="url(#growthGradient)"
                    />
                  )}

                  {/* Line */}
                  {cumulativeData.length > 0 && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke={colors.primary}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Data points */}
                  {cumulativeData.map((d, i) => (
                    <g key={i}>
                      <circle
                        cx={getX(i)}
                        cy={getY(d.cumulative)}
                        r="5"
                        fill={isDark ? '#1e293b' : '#ffffff'}
                        stroke={colors.primary}
                        strokeWidth="2"
                        style={{ cursor: 'pointer' }}
                      />
                      <title>{`${d.date}: +${d.count} (Total: ${d.cumulative})`}</title>
                    </g>
                  ))}

                  {/* X-axis labels (show every 5th day) */}
                  {cumulativeData.filter((_, i) => i % 5 === 0 || i === cumulativeData.length - 1).map((d, i, arr) => {
                    const originalIndex = cumulativeData.indexOf(d);
                    return (
                      <text
                        key={i}
                        x={getX(originalIndex)}
                        y={chartHeight - 8}
                        textAnchor="middle"
                        fontSize="10"
                        fill={isDark ? '#64748b' : '#94a3b8'}
                      >
                        {d.date ? new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }).replace('.', '') : ''}
                      </text>
                    );
                  })}
                </svg>

                {/* Legend */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '3px', background: colors.primary, borderRadius: '2px' }} />
                    <span style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}>Total abonnes</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: `2px solid ${colors.primary}`, background: isDark ? '#1e293b' : '#fff' }} />
                    <span style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}>Nouveaux abonnes</span>
                  </div>
                </div>

                {cumulativeData.length === 0 && (
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: isDark ? '#64748b' : '#94a3b8' }}>
                    <TrendingUp size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                    <p style={{ margin: 0, fontSize: '13px' }}>Pas encore de donnees</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Recent activity */}
        <div style={styles.card}>
          <h4 style={{ margin: '0 0 16px', color: isDark ? '#e2e8f0' : '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color={colors.secondary} />
            Activite recente
          </h4>
          <div style={{ maxHeight: '250px', overflow: 'auto' }}>
            {(stats?.recentActivity || []).slice(0, 10).map((activity, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: i < 9 ? `1px solid ${isDark ? '#334155' : '#f1f5f9'}` : 'none' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: activity.action === 'subscribe' ? `${colors.success}20` : activity.action === 'unsubscribe' ? `${colors.error}20` : `${colors.secondary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {activity.action === 'subscribe' ? <UserPlus size={14} color={colors.success} /> :
                   activity.action === 'unsubscribe' ? <UserMinus size={14} color={colors.error} /> :
                   <MailOpen size={14} color={colors.secondary} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#e2e8f0' : '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activity.email || 'Anonyme'}
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>
                    {activity.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top campaigns */}
      <div style={styles.card}>
        <h4 style={{ margin: '0 0 16px', color: isDark ? '#e2e8f0' : '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} color={colors.accent} />
          Meilleures newsletters
        </h4>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Newsletter</th>
              <th style={styles.th}>Envoye</th>
              <th style={styles.th}>Destinataires</th>
              <th style={styles.th}>Ouvertures</th>
              <th style={styles.th}>Clics</th>
            </tr>
          </thead>
          <tbody>
            {(stats?.topCampaigns || []).map(campaign => (
              <tr key={campaign.id}>
                <td style={styles.td}>{campaign.name}</td>
                <td style={styles.td}>{campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString('fr-FR') : '-'}</td>
                <td style={styles.td}>{campaign.total_recipients}</td>
                <td style={styles.td}>
                  {campaign.unique_open_count}
                  <span style={{ color: isDark ? '#64748b' : '#94a3b8', marginLeft: '4px' }}>
                    ({campaign.total_recipients > 0 ? ((campaign.unique_open_count / campaign.total_recipients) * 100).toFixed(1) : 0}%)
                  </span>
                </td>
                <td style={styles.td}>
                  {campaign.unique_click_count}
                  <span style={{ color: isDark ? '#64748b' : '#94a3b8', marginLeft: '4px' }}>
                    ({campaign.total_recipients > 0 ? ((campaign.unique_click_count / campaign.total_recipients) * 100).toFixed(1) : 0}%)
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderLists = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button style={styles.btn('primary')} onClick={() => { setEditingItem(null); setShowListModal(true); }}>
          <Plus size={18} /> Nouvelle liste
        </button>
      </div>
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nom</th>
              <th style={styles.th}>Abonnes</th>
              <th style={styles.th}>Options</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lists.map(list => (
              <tr key={list.id}>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: list.color }} />
                    <div>
                      <div style={{ fontWeight: '600' }}>{list.name}</div>
                      {list.description && <div style={{ fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>{list.description}</div>}
                    </div>
                    {list.is_default && <span style={styles.badge(colors.primary)}>Defaut</span>}
                  </div>
                </td>
                <td style={styles.td}>{list.active_subscribers || 0}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {list.double_optin && <span style={styles.badge(colors.secondary)}>Double opt-in</span>}
                    {list.welcome_email_enabled && <span style={styles.badge(colors.accent)}>Email bienvenue</span>}
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={styles.btnIcon} onClick={() => { setEditingItem(list); setShowListModal(true); }}>
                      <Edit2 size={16} />
                    </button>
                    {!list.is_default && (
                      <button style={{ ...styles.btnIcon, color: colors.error }} onClick={() => deleteList(list.id)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSubscribers = () => (
    <div>
      {/* Filters and actions */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#64748b' : '#94a3b8' }} />
          <input
            style={{ ...styles.input, paddingLeft: '40px' }}
            placeholder="Rechercher..."
            value={subscriberFilters.search}
            onChange={e => setSubscriberFilters({ ...subscriberFilters, search: e.target.value })}
          />
        </div>
        <select
          style={{ ...styles.select, width: 'auto' }}
          value={subscriberFilters.status}
          onChange={e => setSubscriberFilters({ ...subscriberFilters, status: e.target.value })}
        >
          <option value="">Tous statuts</option>
          <option value="active">Actifs</option>
          <option value="pending">En attente</option>
          <option value="unsubscribed">Desabonnes</option>
        </select>
        <select
          style={{ ...styles.select, width: 'auto' }}
          value={subscriberFilters.list_id}
          onChange={e => setSubscriberFilters({ ...subscriberFilters, list_id: e.target.value })}
        >
          <option value="">Toutes listes</option>
          {lists.map(list => (
            <option key={list.id} value={list.id}>{list.name}</option>
          ))}
        </select>
        <select
          style={{ ...styles.select, width: 'auto' }}
          value={subscriberFilters.language}
          onChange={e => setSubscriberFilters({ ...subscriberFilters, language: e.target.value })}
        >
          <option value="">Toutes langues</option>
          <option value="fr">Francais</option>
          <option value="en">English</option>
        </select>
        <button style={styles.btn('ghost')} onClick={() => setShowImportModal(true)}>
          <Upload size={16} /> Importer
        </button>
        <button style={styles.btn('ghost')} onClick={exportSubscribers}>
          <Download size={16} /> Exporter
        </button>
        <button style={styles.btn('primary')} onClick={() => { setEditingItem(null); setShowSubscriberModal(true); }}>
          <Plus size={18} /> Ajouter
        </button>
      </div>

      {/* Bulk actions */}
      {selectedSubscribers.length > 0 && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', padding: '12px 16px', background: isDark ? '#334155' : '#f1f5f9', borderRadius: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
            {selectedSubscribers.length} selectionne(s)
          </span>
          <button style={styles.btn('ghost')} onClick={() => handleBulkAction('activate')}>Activer</button>
          <button style={styles.btn('ghost')} onClick={() => handleBulkAction('deactivate')}>Desactiver</button>
          <button style={{ ...styles.btn('danger') }} onClick={() => handleBulkAction('delete')}>Supprimer</button>
          <button style={{ marginLeft: 'auto', ...styles.btnIcon }} onClick={() => setSelectedSubscribers([])}>
            <X size={16} />
          </button>
        </div>
      )}

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectedSubscribers.length === subscribers.length && subscribers.length > 0}
                  onChange={e => setSelectedSubscribers(e.target.checked ? subscribers.map(s => s.id) : [])}
                />
              </th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Nom</th>
              <th style={styles.th}>Listes</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Stats</th>
              <th style={styles.th}>Inscrit le</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map(sub => (
              <tr key={sub.id}>
                <td style={styles.td}>
                  <input
                    type="checkbox"
                    checked={selectedSubscribers.includes(sub.id)}
                    onChange={e => setSelectedSubscribers(e.target.checked ? [...selectedSubscribers, sub.id] : selectedSubscribers.filter(id => id !== sub.id))}
                  />
                </td>
                <td style={styles.td}>{sub.email}</td>
                <td style={styles.td}>{[sub.first_name, sub.last_name].filter(Boolean).join(' ') || '-'}</td>
                <td style={styles.td}>
                  <div style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>
                    {sub.list_names || '-'}
                  </div>
                </td>
                <td style={styles.td}>{getStatusBadge(sub.status)}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                    <span title="Emails recus"><Mail size={12} /> {sub.emails_received || 0}</span>
                    <span title="Ouvertures"><MailOpen size={12} /> {sub.emails_opened || 0}</span>
                    <span title="Clics"><MousePointer size={12} /> {sub.emails_clicked || 0}</span>
                  </div>
                </td>
                <td style={styles.td}>{new Date(sub.created_at).toLocaleDateString('fr-FR')}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={styles.btnIcon} onClick={() => { setEditingItem(sub); setShowSubscriberModal(true); }} title="Modifier">
                      <Edit2 size={16} />
                    </button>
                    {sub.status !== 'active' && (
                      <button style={{ ...styles.btnIcon, color: colors.success }} onClick={() => activateSubscriber(sub.id)} title="Activer">
                        <CheckCircle size={16} />
                      </button>
                    )}
                    <button style={{ ...styles.btnIcon, color: colors.error }} onClick={() => deleteSubscriber(sub.id)} title="Supprimer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {subscribersPagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
            {Array.from({ length: subscribersPagination.pages }, (_, i) => i + 1).slice(
              Math.max(0, subscribersPagination.page - 3),
              Math.min(subscribersPagination.pages, subscribersPagination.page + 2)
            ).map(page => (
              <button
                key={page}
                style={{
                  ...styles.btnIcon,
                  background: page === subscribersPagination.page ? colors.primary : (isDark ? '#334155' : '#f1f5f9'),
                  color: page === subscribersPagination.page ? 'white' : (isDark ? '#94a3b8' : '#64748b'),
                  width: '36px',
                  height: '36px'
                }}
                onClick={() => loadSubscribers(page)}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderNewsletters = () => (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <select
          style={{ ...styles.select, width: 'auto' }}
          value={newsletterFilters.status}
          onChange={e => setNewsletterFilters({ ...newsletterFilters, status: e.target.value })}
        >
          <option value="">Tous statuts</option>
          <option value="draft">Brouillons</option>
          <option value="scheduled">Programmes</option>
          <option value="sent">Envoyes</option>
        </select>
        <button style={styles.btn('primary')} onClick={() => { setEditingItem(null); setEditorMode(true); loadRecentArticles(); }}>
          <Plus size={18} /> Nouvelle newsletter
        </button>
      </div>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Newsletter</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Destinataires</th>
              <th style={styles.th}>Ouvertures</th>
              <th style={styles.th}>Clics</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map(newsletter => (
              <tr key={newsletter.id}>
                <td style={styles.td}>
                  <div>
                    <div style={{ fontWeight: '600' }}>{newsletter.name}</div>
                    <div style={{ fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>{newsletter.subject_fr}</div>
                  </div>
                </td>
                <td style={styles.td}>{getStatusBadge(newsletter.status)}</td>
                <td style={styles.td}>{newsletter.total_recipients || '-'}</td>
                <td style={styles.td}>
                  {newsletter.unique_open_count || 0}
                  {newsletter.total_recipients > 0 && (
                    <span style={{ color: isDark ? '#64748b' : '#94a3b8', marginLeft: '4px' }}>
                      ({((newsletter.unique_open_count || 0) / newsletter.total_recipients * 100).toFixed(1)}%)
                    </span>
                  )}
                </td>
                <td style={styles.td}>
                  {newsletter.unique_click_count || 0}
                  {newsletter.total_recipients > 0 && (
                    <span style={{ color: isDark ? '#64748b' : '#94a3b8', marginLeft: '4px' }}>
                      ({((newsletter.unique_click_count || 0) / newsletter.total_recipients * 100).toFixed(1)}%)
                    </span>
                  )}
                </td>
                <td style={styles.td}>
                  {newsletter.sent_at ? new Date(newsletter.sent_at).toLocaleDateString('fr-FR') :
                   newsletter.scheduled_at ? `Programme: ${new Date(newsletter.scheduled_at).toLocaleDateString('fr-FR')}` :
                   new Date(newsletter.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {newsletter.status === 'draft' && (
                      <>
                        <button style={styles.btnIcon} onClick={() => { setEditingItem(newsletter); setNewsletterContent(newsletter); setEditorMode(true); loadRecentArticles(); }} title="Modifier">
                          <Edit2 size={16} />
                        </button>
                        <button style={{ ...styles.btnIcon, background: `${colors.secondary}20`, color: colors.secondary }} onClick={() => sendTestEmail(newsletter.id)} title="Envoyer test">
                          <Eye size={16} />
                        </button>
                        <button style={{ ...styles.btnIcon, background: `${colors.warning}20`, color: colors.warning }} onClick={() => openScheduleModal(newsletter.id)} title="Programmer">
                          <Calendar size={16} />
                        </button>
                        <button style={{ ...styles.btnIcon, background: `${colors.success}20`, color: colors.success }} onClick={() => sendNewsletter(newsletter.id, newsletter.name)} title="Envoyer maintenant">
                          <Play size={16} />
                        </button>
                      </>
                    )}
                    {newsletter.status === 'scheduled' && (
                      <>
                        <button style={{ ...styles.btnIcon, background: `${colors.secondary}20`, color: colors.secondary }} onClick={() => sendTestEmail(newsletter.id)} title="Envoyer test">
                          <Eye size={16} />
                        </button>
                        <button style={{ ...styles.btnIcon, background: `${colors.error}20`, color: colors.error }} onClick={() => cancelSending()} title="Annuler">
                          <X size={16} />
                        </button>
                      </>
                    )}
                    {newsletter.status === 'sending' && (
                      <button style={{ ...styles.btnIcon, background: `${colors.primary}20`, color: colors.primary }} onClick={() => { setSendingProgress(p => ({ ...p, campaignId: newsletter.id, name: newsletter.name })); setShowProgressModal(true); startProgressPolling(newsletter.id); }} title="Voir progression">
                        <Activity size={16} />
                      </button>
                    )}
                    {newsletter.status === 'sent' && (
                      <button style={styles.btnIcon} title="Voir stats">
                        <BarChart3 size={16} />
                      </button>
                    )}
                    {!['sending'].includes(newsletter.status) && (
                      <button style={{ ...styles.btnIcon, color: colors.error }} onClick={() => deleteNewsletter(newsletter.id)} title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const [templateEditorMode, setTemplateEditorMode] = useState(false);
  const [templatePreviewMode, setTemplatePreviewMode] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const templateEditorRef = useRef(null);

  const renderTemplates = () => {
    // Template Editor Full Page
    if (templateEditorMode && editingTemplate) {
      return (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: isDark ? '#0f172a' : '#f1f5f9', zIndex: 1000,
          display: 'flex', flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            background: isDark ? '#1e293b' : '#ffffff',
            borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            padding: '16px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                style={{ ...styles.btnIcon, background: isDark ? '#334155' : '#f1f5f9' }}
                onClick={() => { setTemplateEditorMode(false); setEditingTemplate(null); }}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                  {editingTemplate.id ? 'Modifier le template' : 'Nouveau template'}
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>
                  {editingTemplate.name || 'Sans titre'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                style={{ ...styles.btn('secondary'), display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setTemplatePreviewMode(!templatePreviewMode)}
              >
                <Eye size={16} /> {templatePreviewMode ? 'Editeur' : 'Apercu'}
              </button>
              <button
                style={{ ...styles.btn('primary'), display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={async () => {
                  if (!editingTemplate.name) {
                    showNotification('Nom requis', 'error');
                    return;
                  }
                  const payload = {
                    name: editingTemplate.name,
                    category: editingTemplate.category || 'newsletter',
                    layout: editingTemplate.layout || 'image-top',
                    preview_gradient: editingTemplate.preview_gradient,
                    subject_fr: editingTemplate.subject_fr,
                    subject_en: editingTemplate.subject_en,
                    content_html_fr: templateEditorRef.current?.innerHTML || editingTemplate.content_html_fr,
                    content_html_en: editingTemplate.content_html_en
                  };
                  const res = editingTemplate.id
                    ? await api.put(`/newsletter/templates/${editingTemplate.id}`, payload, token)
                    : await api.post('/newsletter/templates', payload, token);
                  if (res.success) {
                    showNotification(editingTemplate.id ? 'Template mis a jour' : 'Template cree');
                    setTemplateEditorMode(false);
                    setEditingTemplate(null);
                    loadTemplates();
                  } else {
                    showNotification(res.message || 'Erreur', 'error');
                  }
                }}
              >
                <Check size={16} /> Enregistrer
              </button>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Left sidebar - Settings */}
            {!templatePreviewMode && (
              <div style={{
                width: '320px', background: isDark ? '#1e293b' : '#ffffff',
                borderRight: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                padding: '20px', overflowY: 'auto'
              }}>
                <h3 style={{ margin: '0 0 20px', fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                  Parametres du template
                </h3>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Nom *
                  </label>
                  <input
                    style={styles.input}
                    value={editingTemplate.name || ''}
                    onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    placeholder="Nom du template"
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Categorie
                  </label>
                  <select
                    style={styles.input}
                    value={editingTemplate.category || 'newsletter'}
                    onChange={e => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                  >
                    <option value="newsletter">Newsletter</option>
                    <option value="actualites">Actualites</option>
                    <option value="digest">Digest</option>
                    <option value="sante">Sante</option>
                    <option value="evenement">Evenement</option>
                    <option value="formation">Formation</option>
                    <option value="alerte">Alerte</option>
                    <option value="rapport">Rapport</option>
                  </select>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Layout
                  </label>
                  <select
                    style={styles.input}
                    value={editingTemplate.layout || 'image-top'}
                    onChange={e => setEditingTemplate({ ...editingTemplate, layout: e.target.value })}
                  >
                    <option value="image-top">Image en haut</option>
                    <option value="image-left">Image a gauche</option>
                    <option value="image-right">Image a droite</option>
                    <option value="hero-banner">Banniere hero</option>
                    <option value="cards-grid">Grille de cartes</option>
                    <option value="minimal">Minimal</option>
                    <option value="zigzag">Zigzag</option>
                    <option value="sidebar">Sidebar</option>
                  </select>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Sujet par defaut (FR)
                  </label>
                  <input
                    style={styles.input}
                    value={editingTemplate.subject_fr || ''}
                    onChange={e => setEditingTemplate({ ...editingTemplate, subject_fr: e.target.value })}
                    placeholder="Sujet de l'email"
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Couleur d'apercu
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                      'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
                      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                      'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
                      'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)',
                    ].map((gradient, i) => (
                      <div
                        key={i}
                        onClick={() => setEditingTemplate({ ...editingTemplate, preview_gradient: gradient })}
                        style={{
                          height: '40px',
                          borderRadius: '8px',
                          background: gradient,
                          cursor: 'pointer',
                          border: editingTemplate.preview_gradient === gradient ? '3px solid white' : 'none',
                          boxShadow: editingTemplate.preview_gradient === gradient ? '0 0 0 2px #059669' : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: '20px', padding: '15px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '10px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Variables disponibles
                  </h4>
                  <div style={{ fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8', lineHeight: '1.8' }}>
                    <code>{'{{subject}}'}</code> - Sujet<br/>
                    <code>{'{{first_name}}'}</code> - Prenom<br/>
                    <code>{'{{last_name}}'}</code> - Nom<br/>
                    <code>{'{{email}}'}</code> - Email<br/>
                    <code>{'{{site_url}}'}</code> - URL du site<br/>
                    <code>{'{{unsubscribe_url}}'}</code> - Lien desabonnement<br/>
                    <code>{'{{year}}'}</code> - Annee<br/>
                    <code>{'{{articles}}'}</code> - Articles<br/>
                    <code>{'{{custom_content}}'}</code> - Contenu
                  </div>
                </div>
              </div>
            )}

            {/* Main - Editor or Preview */}
            <div style={{ flex: 1, overflow: 'auto', background: isDark ? '#0f172a' : '#e2e8f0', padding: '24px' }}>
              {templatePreviewMode ? (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    width: '600px', background: '#ffffff', borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                  }}>
                    <iframe
                      srcDoc={editingTemplate.content_html_fr || '<html><body><p>Pas de contenu</p></body></html>'}
                      style={{ width: '100%', height: '800px', border: 'none', borderRadius: '8px' }}
                      title="Template Preview"
                    />
                  </div>
                </div>
              ) : (
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                  <div style={{
                    background: isDark ? '#1e293b' : '#ffffff',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}>
                    {/* Editor toolbar */}
                    <div style={{
                      display: 'flex', gap: '4px', padding: '12px',
                      background: isDark ? '#334155' : '#f8fafc',
                      borderBottom: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`
                    }}>
                      <button style={styles.btnIcon} title="Gras" onClick={() => document.execCommand('bold')}><Bold size={16} /></button>
                      <button style={styles.btnIcon} title="Italique" onClick={() => document.execCommand('italic')}><Italic size={16} /></button>
                      <button style={styles.btnIcon} title="Souligne" onClick={() => document.execCommand('underline')}><Underline size={16} /></button>
                      <div style={{ width: '1px', background: isDark ? '#475569' : '#e2e8f0', margin: '0 8px' }} />
                      <button style={styles.btnIcon} title="Gauche" onClick={() => document.execCommand('justifyLeft')}><AlignLeft size={16} /></button>
                      <button style={styles.btnIcon} title="Centre" onClick={() => document.execCommand('justifyCenter')}><AlignCenter size={16} /></button>
                      <button style={styles.btnIcon} title="Droite" onClick={() => document.execCommand('justifyRight')}><AlignRight size={16} /></button>
                      <div style={{ width: '1px', background: isDark ? '#475569' : '#e2e8f0', margin: '0 8px' }} />
                      <button style={styles.btnIcon} title="Lien" onClick={() => {
                        const url = prompt('URL du lien:');
                        if (url) document.execCommand('createLink', false, url);
                      }}><Link size={16} /></button>
                    </div>
                    {/* Editor content */}
                    <div
                      ref={templateEditorRef}
                      contentEditable
                      suppressContentEditableWarning
                      style={{
                        minHeight: '600px',
                        padding: '20px',
                        color: isDark ? '#e2e8f0' : '#1e293b',
                        outline: 'none',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        fontFamily: 'monospace'
                      }}
                      dangerouslySetInnerHTML={{ __html: editingTemplate.content_html_fr || '' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Templates Grid
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
              Templates d'email ({templates.length})
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>
              Modeles professionnels pour vos newsletters
            </p>
          </div>
          <button
            style={{ ...styles.btn('primary'), display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => {
              setEditingTemplate({ name: '', category: 'newsletter', layout: 'image-top', content_html_fr: '', preview_gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' });
              setTemplateEditorMode(true);
            }}
          >
            <Plus size={18} /> Nouveau template
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {templates.map(template => (
            <div
              key={template.id}
              style={{
                ...styles.card,
                overflow: 'hidden',
                padding: 0,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
            >
              {/* Preview gradient */}
              <div
                style={{
                  height: '120px',
                  background: template.preview_gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <div style={{
                  width: '80px', height: '100px', background: 'rgba(255,255,255,0.95)',
                  borderRadius: '4px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  display: 'flex', flexDirection: 'column', padding: '8px'
                }}>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '2px', marginBottom: '6px' }} />
                  <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '2px', marginBottom: '6px' }} />
                  <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', width: '60%' }} />
                </div>
                {template.is_default && (
                  <span style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'rgba(255,255,255,0.9)', color: '#059669',
                    padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '600'
                  }}>
                    Defaut
                  </span>
                )}
                <span style={{
                  position: 'absolute', bottom: '10px', left: '10px',
                  background: 'rgba(0,0,0,0.5)', color: '#fff',
                  padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '500'
                }}>
                  {template.layout || 'image-top'}
                </span>
              </div>
              {/* Info */}
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', color: isDark ? '#e2e8f0' : '#1e293b', fontWeight: '600' }}>
                    {template.name}
                  </h4>
                </div>
                <p style={{
                  margin: '0 0 12px', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: '10px',
                    background: isDark ? '#334155' : '#f1f5f9', fontSize: '11px'
                  }}>
                    {template.category}
                  </span>
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    style={{ ...styles.btnIcon, flex: 1, justifyContent: 'center' }}
                    onClick={(e) => { e.stopPropagation(); setEditingTemplate(template); setTemplateEditorMode(true); }}
                  >
                    <Edit2 size={14} /> Modifier
                  </button>
                  <button
                    style={styles.btnIcon}
                    onClick={async (e) => {
                      e.stopPropagation();
                      const res = await api.post(`/newsletter/templates/${template.id}/duplicate`, {}, token);
                      if (res.success) {
                        showNotification('Template duplique');
                        loadTemplates();
                      }
                    }}
                    title="Dupliquer"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    style={{ ...styles.btnIcon, color: '#ef4444' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      showConfirm({
                        title: 'Supprimer le template',
                        message: `Etes-vous sur de vouloir supprimer "${template.name}" ?`,
                        type: 'danger',
                        confirmText: 'Supprimer',
                        onConfirm: async () => {
                          const res = await api.delete(`/newsletter/templates/${template.id}`, token);
                          if (res.success) {
                            showNotification('Template supprime');
                            loadTemplates();
                          }
                        }
                      });
                    }}
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div style={styles.card}>
      <h4 style={{ margin: '0 0 20px', color: isDark ? '#e2e8f0' : '#1e293b' }}>Parametres Newsletter</h4>
      <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
            Nom de l'expediteur
          </label>
          <input
            style={styles.input}
            value={settings.sender_name || ''}
            onChange={e => setSettings({ ...settings, sender_name: e.target.value })}
            placeholder="One Health Cameroun"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
            Email de l'expediteur
          </label>
          <input
            type="email"
            style={styles.input}
            value={settings.sender_email || ''}
            onChange={e => setSettings({ ...settings, sender_email: e.target.value })}
            placeholder="newsletter@onehealth.cm"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
            Email de reponse (Reply-To)
          </label>
          <input
            type="email"
            style={styles.input}
            value={settings.reply_to || ''}
            onChange={e => setSettings({ ...settings, reply_to: e.target.value })}
            placeholder="contact@onehealth.cm"
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
              Taille du lot (batch)
            </label>
            <input
              type="number"
              style={styles.input}
              value={settings.batch_size || 50}
              onChange={e => setSettings({ ...settings, batch_size: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
              Delai entre lots (ms)
            </label>
            <input
              type="number"
              style={styles.input}
              value={settings.batch_delay_ms || 1000}
              onChange={e => setSettings({ ...settings, batch_delay_ms: parseInt(e.target.value) })}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.tracking_enabled !== false}
              onChange={e => setSettings({ ...settings, tracking_enabled: e.target.checked })}
            />
            <span style={{ fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>Tracking active</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.double_optin_enabled !== false}
              onChange={e => setSettings({ ...settings, double_optin_enabled: e.target.checked })}
            />
            <span style={{ fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>Double opt-in par defaut</span>
          </label>
        </div>
        <div style={{ marginTop: '10px' }}>
          <button style={styles.btn('primary')} onClick={saveSettings}>
            <Check size={16} /> Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  if (loading) {
    return (
      <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader size={40} color={colors.primary} className="spin" />
          <p style={{ marginTop: '16px', color: isDark ? '#94a3b8' : '#64748b' }}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '14px 20px',
          borderRadius: '12px',
          background: notification.type === 'error' ? colors.error : colors.success,
          color: 'white',
          fontWeight: '600',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'slideIn 0.3s ease'
        }}>
          {notification.type === 'error' ? <XCircle size={20} /> : <CheckCircle size={20} />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail size={24} color="white" />
          </div>
          Newsletter
        </h1>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button style={styles.tab(activeTab === 'dashboard')} onClick={() => setActiveTab('dashboard')}>
          <BarChart3 size={18} /> Tableau de bord
        </button>
        <button style={styles.tab(activeTab === 'lists')} onClick={() => setActiveTab('lists')}>
          <List size={18} /> Listes ({lists.length})
        </button>
        <button style={styles.tab(activeTab === 'subscribers')} onClick={() => setActiveTab('subscribers')}>
          <Users size={18} /> Abonnes ({stats?.subscribers?.active || 0})
        </button>
        <button style={styles.tab(activeTab === 'newsletters')} onClick={() => setActiveTab('newsletters')}>
          <Send size={18} /> Newsletters
        </button>
        <button style={styles.tab(activeTab === 'templates')} onClick={() => setActiveTab('templates')}>
          <FileText size={18} /> Templates
        </button>
        <button style={styles.tab(activeTab === 'settings')} onClick={() => setActiveTab('settings')}>
          <Settings size={18} /> Parametres
        </button>
      </div>

      {/* Content */}
      <div style={{ marginTop: '24px' }}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'lists' && renderLists()}
        {activeTab === 'subscribers' && renderSubscribers()}
        {activeTab === 'newsletters' && !editorMode && renderNewsletters()}
        {activeTab === 'newsletters' && editorMode && <NewsletterEditor />}
        {activeTab === 'templates' && renderTemplates()}
        {activeTab === 'settings' && renderSettings()}
      </div>

      {/* Modals */}
      {showListModal && <ListModal />}
      {showSubscriberModal && <SubscriberModal />}
      {showImportModal && <ImportModal />}

      {/* Progress Modal */}
      {showProgressModal && (
        <div style={styles.modal}>
          <div style={{ ...styles.modalContent, maxWidth: '500px', animation: 'fadeIn 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: isDark ? '#f1f5f9' : '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Send size={20} />
                Envoi en cours
              </h3>
              {sendingProgress.status === 'sent' && (
                <button style={styles.btnIcon} onClick={() => { setShowProgressModal(false); stopProgressPolling(); }}>
                  <X size={20} />
                </button>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: isDark ? '#94a3b8' : '#64748b', margin: '0 0 10px' }}>
                {sendingProgress.name}
              </p>
              <div style={{
                height: '24px',
                background: isDark ? '#334155' : '#e2e8f0',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  height: '100%',
                  width: `${sendingProgress.progress}%`,
                  background: sendingProgress.status === 'sent'
                    ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                    : 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                  borderRadius: '12px',
                  transition: 'width 0.5s ease'
                }} />
                <span style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: sendingProgress.progress > 50 ? 'white' : (isDark ? '#f1f5f9' : '#1e293b'),
                  fontWeight: '600',
                  fontSize: '12px'
                }}>
                  {sendingProgress.progress}%
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center', padding: '15px', background: isDark ? '#1e293b' : '#f8fafc', borderRadius: '10px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: colors.primary }}>{sendingProgress.total}</div>
                <div style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>Total</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', background: isDark ? '#1e293b' : '#f8fafc', borderRadius: '10px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: colors.success }}>{sendingProgress.sent}</div>
                <div style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>Envoyes</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', background: isDark ? '#1e293b' : '#f8fafc', borderRadius: '10px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: colors.error }}>{sendingProgress.failed}</div>
                <div style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>Echecs</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              {sendingProgress.status === 'sending' && (
                <>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors.primary, animation: 'pulse 1s infinite' }} />
                  <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '14px' }}>Envoi en cours...</span>
                </>
              )}
              {sendingProgress.status === 'sent' && (
                <>
                  <CheckCircle size={18} color={colors.success} />
                  <span style={{ color: colors.success, fontSize: '14px', fontWeight: '600' }}>Envoi termine!</span>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              {sendingProgress.status === 'sending' && (
                <button style={styles.btn('danger')} onClick={cancelSending}>
                  <X size={16} /> Annuler l'envoi
                </button>
              )}
              {sendingProgress.status === 'sent' && (
                <button style={styles.btn('primary')} onClick={() => { setShowProgressModal(false); stopProgressPolling(); }}>
                  Fermer
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div style={styles.modal} onClick={() => setShowScheduleModal(false)}>
          <div style={{ ...styles.modalContent, maxWidth: '450px', animation: 'fadeIn 0.2s ease' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3 style={{ margin: 0, color: isDark ? '#f1f5f9' : '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={20} />
                Programmer l'envoi
              </h3>
              <button style={styles.btnIcon} onClick={() => setShowScheduleModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: isDark ? '#e2e8f0' : '#374151', fontSize: '14px' }}>
                Date d'envoi
              </label>
              <input
                type="date"
                value={scheduleData.scheduledDate}
                onChange={e => setScheduleData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '10px',
                  border: `1px solid ${isDark ? '#475569' : '#d1d5db'}`,
                  background: isDark ? '#1e293b' : '#fff',
                  color: isDark ? '#f1f5f9' : '#1e293b',
                  fontSize: '15px'
                }}
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: isDark ? '#e2e8f0' : '#374151', fontSize: '14px' }}>
                Heure d'envoi
              </label>
              <input
                type="time"
                value={scheduleData.scheduledTime}
                onChange={e => setScheduleData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '10px',
                  border: `1px solid ${isDark ? '#475569' : '#d1d5db'}`,
                  background: isDark ? '#1e293b' : '#fff',
                  color: isDark ? '#f1f5f9' : '#1e293b',
                  fontSize: '15px'
                }}
              />
            </div>

            <div style={{
              padding: '15px',
              background: isDark ? '#1e293b' : '#f0fdf4',
              borderRadius: '10px',
              marginBottom: '20px',
              border: `1px solid ${isDark ? '#475569' : '#bbf7d0'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: colors.success }}>
                <Clock size={18} />
                <span style={{ fontWeight: '600' }}>
                  {scheduleData.scheduledDate && scheduleData.scheduledTime
                    ? `Envoi programme le ${new Date(scheduleData.scheduledDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} a ${scheduleData.scheduledTime}`
                    : 'Selectionnez une date et une heure'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button style={styles.btn('ghost')} onClick={() => setShowScheduleModal(false)}>
                Annuler
              </button>
              <button style={styles.btn('primary')} onClick={scheduleNewsletter}>
                <Calendar size={16} /> Programmer
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal />

      {/* Animation styles */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default NewsletterPage;
