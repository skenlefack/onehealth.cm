import React, { useState, useEffect, useCallback } from 'react';
import {
  Radar, AlertTriangle, Megaphone, Send, MessageCircle, Hash, Search, Filter,
  Plus, Edit2, Trash2, Eye, Check, X, Clock, MapPin, User, Phone, Mail,
  ChevronLeft, ChevronRight, RefreshCw, Download, Upload, Settings, Bell,
  Globe, Wifi, Signal, Database, TrendingUp, TrendingDown, BarChart3,
  Calendar, Target, CheckCircle, XCircle, AlertCircle, Loader, Save,
  Share2, QrCode, Smartphone, Radio, Bug, Skull, ThermometerSun, Heart,
  Leaf, Home, FileText, Copy, ExternalLink, Siren, MapPinned
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ============== API HELPER ==============
const api = {
  get: async (endpoint, token) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  },
  post: async (endpoint, data, token) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  },
  put: async (endpoint, data, token) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  },
  delete: async (endpoint, token) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }
};

// ============== CONSTANTS ==============
const RUMOR_STATUSES = [
  { value: 'pending', label: 'En attente', color: '#3498DB', icon: Bell },
  { value: 'investigating', label: 'En investigation', color: '#F39C12', icon: Search },
  { value: 'confirmed', label: 'Confirmée', color: '#E74C3C', icon: AlertTriangle },
  { value: 'false_alarm', label: 'Fausse alerte', color: '#95a5a6', icon: XCircle },
  { value: 'closed', label: 'Clôturée', color: '#27AE60', icon: CheckCircle }
];

const RUMOR_PRIORITIES = [
  { value: 'low', label: 'Basse', color: '#27AE60' },
  { value: 'medium', label: 'Moyenne', color: '#F39C12' },
  { value: 'high', label: 'Haute', color: '#E67E22' },
  { value: 'critical', label: 'Critique', color: '#E74C3C' }
];

const RUMOR_CATEGORIES = [
  { value: 'epidemic', label: 'Épidémie', icon: Bug, color: '#E74C3C' },
  { value: 'zoonosis', label: 'Zoonose', icon: Bug, color: '#9B59B6' },
  { value: 'food_safety', label: 'Sécurité alimentaire', icon: ThermometerSun, color: '#E67E22' },
  { value: 'water_contamination', label: 'Contamination eau', icon: Leaf, color: '#3498DB' },
  { value: 'animal_disease', label: 'Maladie animale', icon: Heart, color: '#27AE60' },
  { value: 'environmental', label: 'Environnemental', icon: Globe, color: '#1ABC9C' },
  { value: 'unknown_disease', label: 'Maladie inconnue', icon: Skull, color: '#34495e' },
  { value: 'other', label: 'Autre', icon: AlertCircle, color: '#95a5a6' }
];

const RUMOR_SOURCES = [
  { value: 'sms', label: 'SMS Codifié', icon: Phone },
  { value: 'web', label: 'Scan Web', icon: Globe },
  { value: 'mobile', label: 'Application mobile', icon: Smartphone },
  { value: 'direct', label: 'Signalement direct', icon: Megaphone },
  { value: 'hotline', label: 'Ligne téléphonique', icon: Phone },
  { value: 'media', label: 'Médias', icon: Radio },
  { value: 'social', label: 'Réseaux sociaux', icon: Share2 }
];

const SMS_CODES = [
  { code: 'EP', meaning: 'Épidémie suspectée', category: 'epidemic', priority: 'critical' },
  { code: 'ZO', meaning: 'Cas de zoonose', category: 'zoonosis', priority: 'high' },
  { code: 'MA', meaning: 'Maladie animale', category: 'animal_disease', priority: 'medium' },
  { code: 'EC', meaning: 'Eau contaminée', category: 'water_contamination', priority: 'high' },
  { code: 'AL', meaning: 'Aliment suspect', category: 'food_safety', priority: 'high' },
  { code: 'EN', meaning: 'Problème environnemental', category: 'environmental', priority: 'medium' },
  { code: 'DC', meaning: 'Décès suspect', category: 'unknown_disease', priority: 'critical' },
  { code: 'AU', meaning: 'Autre signalement', category: 'other', priority: 'low' }
];

const REGIONS_CAMEROON = [
  'Adamaoua', 'Centre', 'Est', 'Extrême-Nord', 'Littoral',
  'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest'
];

// ============== MAIN COMPONENT ==============
const COHRMSystemPage = ({ isDark, token }) => {
  // States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Data states
  const [rumors, setRumors] = useState([]);
  const [stats, setStats] = useState({
    total: 0, pending: 0, confirmed: 0, alerts: 0,
    bySource: [], byRegion: [], trend: []
  });
  const [agents, setAgents] = useState([]);
  const [sources, setSources] = useState([]);
  const [smsCodes, setSmsCodes] = useState(SMS_CODES);

  // UI states
  const [viewMode, setViewMode] = useState('list');
  const [selectedRumor, setSelectedRumor] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  // Filter states
  const [filters, setFilters] = useState({
    status: '', priority: '', category: '', source: '', region: '', search: '', dateFrom: '', dateTo: ''
  });

  // Form states
  const [rumorForm, setRumorForm] = useState({
    title: '', description: '', category: 'other', priority: 'medium', source: 'direct',
    region: '', district: '', locality: '', latitude: '', longitude: '',
    reporter_name: '', reporter_phone: '', reporter_email: '',
    affected_count: '', symptoms: '', animals_involved: '', actions_taken: ''
  });

  // Settings states
  const [settingsTab, setSettingsTab] = useState('sms-codes');
  const [scannerSettings, setScannerSettings] = useState({
    enabled: false, interval: 30, keywords: [], sources: []
  });

  // SMS Decoder states
  const [smsInput, setSmsInput] = useState('');
  const [decodedResult, setDecodedResult] = useState(null);

  // Scan History states
  const [scanHistory, setScanHistory] = useState([]);
  const [scanHistoryLoading, setScanHistoryLoading] = useState(false);
  const [scanHistoryPagination, setScanHistoryPagination] = useState({ page: 1, limit: 20, total: 0 });

  // Styles
  const styles = {
    card: {
      background: isDark ? '#1e293b' : '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.08)',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '10px',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      background: isDark ? '#0f172a' : '#ffffff',
      color: isDark ? '#e2e8f0' : '#1e293b',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '10px',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      background: isDark ? '#0f172a' : '#ffffff',
      color: isDark ? '#e2e8f0' : '#1e293b',
      fontSize: '14px',
      outline: 'none',
      cursor: 'pointer'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '13px',
      fontWeight: '600',
      color: isDark ? '#94a3b8' : '#64748b'
    },
    btnPrimary: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 20px',
      background: '#E74C3C',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    btnSecondary: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 20px',
      background: isDark ? '#334155' : '#f1f5f9',
      color: isDark ? '#e2e8f0' : '#475569',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    tab: (active) => ({
      padding: '12px 20px',
      background: active ? (isDark ? '#334155' : '#ffffff') : 'transparent',
      color: active ? (isDark ? '#e2e8f0' : '#1e293b') : (isDark ? '#64748b' : '#94a3b8'),
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: active ? '600' : '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    }),
    statCard: (color) => ({
      background: isDark ? '#1e293b' : '#ffffff',
      borderRadius: '16px',
      padding: '20px',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      borderLeft: `4px solid ${color}`,
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    }),
    badge: (color) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      background: `${color}20`,
      color: color,
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600'
    })
  };

  // Toast effect
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch data on mount
  useEffect(() => {
    fetchRumors();
    fetchStats();
  }, [filters, pagination.page]);

  // Fetch rumors
  const fetchRumors = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: pagination.page,
      limit: pagination.limit,
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
    });
    const res = await api.get(`/cohrm/rumors?${params}`, token);
    if (res.success) {
      setRumors(res.data || []);
      if (res.pagination) setPagination(res.pagination);
    }
    setLoading(false);
  };

  // Fetch stats
  const fetchStats = async () => {
    const res = await api.get('/cohrm/stats', token);
    if (res.success && res.data) {
      setStats(res.data);
    }
  };

  // Fetch scan history
  const fetchScanHistory = async (page = 1) => {
    setScanHistoryLoading(true);
    const res = await api.get(`/cohrm/scan-history?page=${page}&limit=20`, token);
    if (res.success && res.data) {
      setScanHistory(res.data);
      if (res.pagination) setScanHistoryPagination(res.pagination);
    }
    setScanHistoryLoading(false);
  };

  // Run manual scan
  const runManualScan = async () => {
    setLoading(true);
    const res = await api.post('/cohrm/scan/run', {}, token);
    if (res.success) {
      setToast({ type: 'success', message: 'Scan lancé avec succès' });
      fetchScanHistory();
    } else {
      setToast({ type: 'error', message: res.message || 'Erreur lors du scan' });
    }
    setLoading(false);
  };

  // Save rumor
  const handleSaveRumor = async () => {
    if (!rumorForm.title || !rumorForm.description) {
      setToast({ type: 'error', message: 'Titre et description requis' });
      return;
    }
    setLoading(true);
    const res = selectedRumor
      ? await api.put(`/cohrm/rumors/${selectedRumor.id}`, rumorForm, token)
      : await api.post('/cohrm/rumors', rumorForm, token);

    if (res.success) {
      setToast({ type: 'success', message: selectedRumor ? 'Rumeur mise à jour' : 'Rumeur enregistrée' });
      setViewMode('list');
      setSelectedRumor(null);
      resetForm();
      fetchRumors();
      fetchStats();
    } else {
      setToast({ type: 'error', message: res.message || 'Erreur' });
    }
    setLoading(false);
  };

  // Update rumor status
  const updateRumorStatus = async (id, status) => {
    const res = await api.put(`/cohrm/rumors/${id}`, { status }, token);
    if (res.success) {
      setToast({ type: 'success', message: 'Statut mis à jour' });
      fetchRumors();
      fetchStats();
    }
  };

  // Delete rumor
  const deleteRumor = async (id) => {
    if (!window.confirm('Supprimer cette rumeur ?')) return;
    const res = await api.delete(`/cohrm/rumors/${id}`, token);
    if (res.success) {
      setToast({ type: 'success', message: 'Rumeur supprimée' });
      fetchRumors();
      fetchStats();
    }
  };

  // Reset form
  const resetForm = () => {
    setRumorForm({
      title: '', description: '', category: 'other', priority: 'medium', source: 'direct',
      region: '', district: '', locality: '', latitude: '', longitude: '',
      reporter_name: '', reporter_phone: '', reporter_email: '',
      affected_count: '', symptoms: '', animals_involved: '', actions_taken: ''
    });
  };

  // Open form for new/edit
  const openRumorForm = (rumor = null) => {
    if (rumor) {
      setSelectedRumor(rumor);
      setRumorForm({
        title: rumor.title || '',
        description: rumor.description || '',
        category: rumor.category || 'other',
        priority: rumor.priority || 'medium',
        source: rumor.source || 'direct_report',
        region: rumor.region || '',
        district: rumor.district || '',
        locality: rumor.locality || '',
        latitude: rumor.latitude || '',
        longitude: rumor.longitude || '',
        reporter_name: rumor.reporter_name || '',
        reporter_phone: rumor.reporter_phone || '',
        reporter_email: rumor.reporter_email || '',
        affected_count: rumor.affected_count || '',
        symptoms: rumor.symptoms || '',
        animals_involved: rumor.animals_involved || '',
        actions_taken: rumor.actions_taken || ''
      });
    } else {
      setSelectedRumor(null);
      resetForm();
    }
    setViewMode('form');
  };

  // Get current position
  const getCurrentPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setRumorForm({
            ...rumorForm,
            latitude: pos.coords.latitude.toFixed(6),
            longitude: pos.coords.longitude.toFixed(6)
          });
          setToast({ type: 'success', message: 'Position obtenue' });
        },
        () => setToast({ type: 'error', message: 'Impossible d\'obtenir la position' })
      );
    }
  };

  // Decode SMS
  const decodeSMS = (smsText) => {
    const parts = smsText.toUpperCase().trim().split(/[\s,;]+/);
    const code = parts[0];
    const codeInfo = smsCodes.find(c => c.code === code);

    if (!codeInfo) {
      return { success: false, message: 'Code non reconnu' };
    }

    return {
      success: true,
      category: codeInfo.category,
      priority: codeInfo.priority,
      meaning: codeInfo.meaning,
      details: parts.slice(1).join(' ')
    };
  };

  // Render Dashboard
  const renderDashboard = () => (
    <div>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={styles.statCard('#3498DB')}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#3498DB20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Radar size={24} color="#3498DB" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>{stats.total || 0}</p>
            <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>Total Rumeurs</p>
          </div>
        </div>

        <div style={styles.statCard('#F39C12')}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#F39C1220', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={24} color="#F39C12" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>{stats.pending || 0}</p>
            <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>En attente</p>
          </div>
        </div>

        <div style={styles.statCard('#E74C3C')}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#E74C3C20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={24} color="#E74C3C" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>{stats.alerts || 0}</p>
            <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>Alertes actives</p>
          </div>
        </div>

        <div style={styles.statCard('#27AE60')}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#27AE6020', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={24} color="#27AE60" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>{stats.confirmed || 0}</p>
            <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>Confirmées ce mois</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ ...styles.card, marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>
          Actions rapides
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button style={styles.btnPrimary} onClick={() => { setActiveTab('rumors'); openRumorForm(); }}>
            <Plus size={18} /> Signaler une rumeur
          </button>
          <button style={styles.btnSecondary} onClick={() => setActiveTab('sms-decoder')}>
            <Phone size={18} /> Décoder SMS
          </button>
          <button style={styles.btnSecondary} onClick={() => { fetchRumors(); fetchStats(); }}>
            <RefreshCw size={18} /> Actualiser
          </button>
        </div>
      </div>

      {/* Recent Rumors */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>
            Rumeurs récentes
          </h3>
          <button style={{ ...styles.btnSecondary, padding: '8px 16px' }} onClick={() => setActiveTab('rumors')}>
            Voir tout <ChevronRight size={16} />
          </button>
        </div>

        {rumors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: isDark ? '#64748b' : '#94a3b8' }}>
            <Radar size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p>Aucune rumeur enregistrée</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rumors.slice(0, 5).map(rumor => {
              const status = RUMOR_STATUSES.find(s => s.value === rumor.status) || RUMOR_STATUSES[0];
              const priority = RUMOR_PRIORITIES.find(p => p.value === rumor.priority);
              const category = RUMOR_CATEGORIES.find(c => c.value === rumor.category);
              const CategoryIcon = category?.icon || AlertCircle;

              return (
                <div
                  key={rumor.id}
                  style={{
                    padding: '16px',
                    background: isDark ? '#0f172a' : '#f8fafc',
                    borderRadius: '12px',
                    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    cursor: 'pointer'
                  }}
                  onClick={() => { setActiveTab('rumors'); openRumorForm(rumor); }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        background: `${category?.color || '#64748b'}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <CategoryIcon size={18} color={category?.color || '#64748b'} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                          {rumor.title}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                          {rumor.region} • {new Date(rumor.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={styles.badge(status.color)}>
                        {status.label}
                      </span>
                      {priority && (
                        <span style={styles.badge(priority.color)}>
                          {priority.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // Render Rumors List
  const renderRumorsList = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>
          <Radar size={20} style={{ marginRight: '10px', verticalAlign: 'middle', color: '#E74C3C' }} />
          Gestion des Rumeurs ({pagination.total || rumors.length})
        </h3>
        <button style={styles.btnPrimary} onClick={() => openRumorForm()}>
          <Plus size={18} /> Nouvelle rumeur
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
        padding: '16px',
        background: isDark ? '#0f172a' : '#f8fafc',
        borderRadius: '12px'
      }}>
        <div>
          <input
            style={styles.input}
            placeholder="Rechercher..."
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select style={styles.select} value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">Tous les statuts</option>
          {RUMOR_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select style={styles.select} value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">Toutes priorités</option>
          {RUMOR_PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <select style={styles.select} value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
          <option value="">Toutes catégories</option>
          {RUMOR_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select style={styles.select} value={filters.region} onChange={e => setFilters({ ...filters, region: e.target.value })}>
          <option value="">Toutes régions</option>
          {REGIONS_CAMEROON.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} color={isDark ? '#64748b' : '#94a3b8'} />
        </div>
      ) : rumors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: isDark ? '#64748b' : '#94a3b8' }}>
          <Radar size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
          <p>Aucune rumeur trouvée</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {rumors.map(rumor => {
            const status = RUMOR_STATUSES.find(s => s.value === rumor.status) || RUMOR_STATUSES[0];
            const StatusIcon = status.icon;
            const priority = RUMOR_PRIORITIES.find(p => p.value === rumor.priority);
            const category = RUMOR_CATEGORIES.find(c => c.value === rumor.category);
            const CategoryIcon = category?.icon || AlertCircle;
            const source = RUMOR_SOURCES.find(s => s.value === rumor.source);

            return (
              <div
                key={rumor.id}
                style={{
                  padding: '20px',
                  background: isDark ? '#0f172a' : '#f8fafc',
                  borderRadius: '12px',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  borderLeft: `4px solid ${status.color}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '14px', flex: 1 }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '12px',
                      background: `${category?.color || '#64748b'}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <CategoryIcon size={24} color={category?.color || '#64748b'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                        {rumor.title}
                      </h4>
                      <p style={{ margin: '0 0 10px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.5' }}>
                        {rumor.description?.substring(0, 150)}{rumor.description?.length > 150 ? '...' : ''}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                        <span><MapPin size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />{rumor.region || 'Non spécifié'}</span>
                        <span><Calendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />{new Date(rumor.created_at).toLocaleDateString('fr-FR')}</span>
                        {source && <span>{React.createElement(source.icon, { size: 12, style: { marginRight: '4px', verticalAlign: 'middle' } })}{source.label}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={styles.badge(status.color)}>
                        <StatusIcon size={12} /> {status.label}
                      </span>
                      {priority && (
                        <span style={styles.badge(priority.color)}>
                          {priority.label}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        style={{ ...styles.btnSecondary, padding: '8px 12px' }}
                        onClick={() => openRumorForm(rumor)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <select
                        style={{ ...styles.select, width: 'auto', padding: '8px 12px' }}
                        value={rumor.status}
                        onChange={e => updateRumorStatus(rumor.id, e.target.value)}
                      >
                        {RUMOR_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <button
                        style={{ ...styles.btnSecondary, padding: '8px 12px', color: '#E74C3C' }}
                        onClick={() => deleteRumor(rumor.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          <button
            style={styles.btnSecondary}
            disabled={pagination.page <= 1}
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
          >
            <ChevronLeft size={18} />
          </button>
          <span style={{ padding: '12px 20px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
            Page {pagination.page} / {pagination.pages}
          </span>
          <button
            style={styles.btnSecondary}
            disabled={pagination.page >= pagination.pages}
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );

  // Render Rumor Form
  const renderRumorForm = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>
          <AlertTriangle size={22} style={{ marginRight: '10px', color: '#E74C3C', verticalAlign: 'middle' }} />
          {selectedRumor ? 'Modifier la rumeur' : 'Signaler une rumeur'}
        </h3>
        <button style={styles.btnSecondary} onClick={() => { setViewMode('list'); setSelectedRumor(null); resetForm(); }}>
          <ChevronLeft size={18} /> Retour
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left Column */}
        <div>
          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>Titre de la rumeur *</label>
            <input
              style={styles.input}
              value={rumorForm.title}
              onChange={e => setRumorForm({ ...rumorForm, title: e.target.value })}
              placeholder="Ex: Cas suspects de choléra dans le village..."
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>Description détaillée *</label>
            <textarea
              style={{ ...styles.input, minHeight: '120px', resize: 'vertical' }}
              value={rumorForm.description}
              onChange={e => setRumorForm({ ...rumorForm, description: e.target.value })}
              placeholder="Décrivez la situation en détail..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={styles.label}>Catégorie</label>
              <select style={styles.select} value={rumorForm.category} onChange={e => setRumorForm({ ...rumorForm, category: e.target.value })}>
                {RUMOR_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={styles.label}>Priorité</label>
              <select style={styles.select} value={rumorForm.priority} onChange={e => setRumorForm({ ...rumorForm, priority: e.target.value })}>
                {RUMOR_PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>Source du signalement</label>
            <select style={styles.select} value={rumorForm.source} onChange={e => setRumorForm({ ...rumorForm, source: e.target.value })}>
              {RUMOR_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>Symptômes observés</label>
            <textarea
              style={{ ...styles.input, minHeight: '80px' }}
              value={rumorForm.symptoms}
              onChange={e => setRumorForm({ ...rumorForm, symptoms: e.target.value })}
              placeholder="Liste des symptômes..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={styles.label}>Nombre affecté (estimé)</label>
              <input
                style={styles.input}
                type="number"
                value={rumorForm.affected_count}
                onChange={e => setRumorForm({ ...rumorForm, affected_count: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <label style={styles.label}>Animaux impliqués</label>
              <input
                style={styles.input}
                value={rumorForm.animals_involved}
                onChange={e => setRumorForm({ ...rumorForm, animals_involved: e.target.value })}
                placeholder="Ex: Volailles, bovins..."
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          <div style={{ padding: '16px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
              <MapPin size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Localisation
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={styles.label}>Région</label>
                <select style={styles.select} value={rumorForm.region} onChange={e => setRumorForm({ ...rumorForm, region: e.target.value })}>
                  <option value="">Sélectionner...</option>
                  {REGIONS_CAMEROON.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>District</label>
                <input style={styles.input} value={rumorForm.district} onChange={e => setRumorForm({ ...rumorForm, district: e.target.value })} placeholder="District" />
              </div>
              <div>
                <label style={styles.label}>Localité</label>
                <input style={styles.input} value={rumorForm.locality} onChange={e => setRumorForm({ ...rumorForm, locality: e.target.value })} placeholder="Village/Quartier" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px' }}>
              <div>
                <label style={styles.label}>Latitude</label>
                <input style={styles.input} value={rumorForm.latitude} onChange={e => setRumorForm({ ...rumorForm, latitude: e.target.value })} placeholder="Ex: 5.9631" />
              </div>
              <div>
                <label style={styles.label}>Longitude</label>
                <input style={styles.input} value={rumorForm.longitude} onChange={e => setRumorForm({ ...rumorForm, longitude: e.target.value })} placeholder="Ex: 10.1591" />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button style={{ ...styles.btnSecondary, padding: '12px' }} onClick={getCurrentPosition} title="Obtenir ma position">
                  <MapPinned size={18} />
                </button>
              </div>
            </div>
          </div>

          <div style={{ padding: '16px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
              <User size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Informateur
            </h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={styles.label}>Nom</label>
                <input style={styles.input} value={rumorForm.reporter_name} onChange={e => setRumorForm({ ...rumorForm, reporter_name: e.target.value })} placeholder="Nom de l'informateur" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={styles.label}>Téléphone</label>
                  <input style={styles.input} value={rumorForm.reporter_phone} onChange={e => setRumorForm({ ...rumorForm, reporter_phone: e.target.value })} placeholder="+237..." />
                </div>
                <div>
                  <label style={styles.label}>Email</label>
                  <input style={styles.input} type="email" value={rumorForm.reporter_email} onChange={e => setRumorForm({ ...rumorForm, reporter_email: e.target.value })} placeholder="email@..." />
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>Actions déjà entreprises</label>
            <textarea
              style={{ ...styles.input, minHeight: '80px' }}
              value={rumorForm.actions_taken}
              onChange={e => setRumorForm({ ...rumorForm, actions_taken: e.target.value })}
              placeholder="Décrivez les actions déjà prises..."
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '24px', borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
        <button style={styles.btnSecondary} onClick={() => { setViewMode('list'); setSelectedRumor(null); resetForm(); }}>
          Annuler
        </button>
        <button style={styles.btnPrimary} onClick={handleSaveRumor} disabled={loading}>
          {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Enregistrement...</> : <><Save size={16} /> Enregistrer</>}
        </button>
      </div>
    </div>
  );

  // Render SMS Decoder
  const renderSMSDecoder = () => {
    const handleDecode = () => {
      const result = decodeSMS(smsInput);
      setDecodedResult(result);
      if (result.success) {
        setRumorForm({
          ...rumorForm,
          category: result.category,
          priority: result.priority,
          title: result.meaning,
          description: result.details,
          source: 'sms'
        });
      }
    };

    return (
      <div style={styles.card}>
        <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>
          <Phone size={20} style={{ marginRight: '10px', verticalAlign: 'middle', color: '#E74C3C' }} />
          Décodeur SMS
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Input Section */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>Message SMS reçu</label>
              <textarea
                style={{ ...styles.input, minHeight: '120px', fontFamily: 'monospace' }}
                value={smsInput}
                onChange={e => setSmsInput(e.target.value)}
                placeholder="Ex: EP YAOUNDE 5 CAS DIARRHEE"
              />
            </div>
            <button style={styles.btnPrimary} onClick={handleDecode}>
              <Radio size={18} /> Décoder
            </button>

            {decodedResult && (
              <div style={{
                marginTop: '16px',
                padding: '16px',
                borderRadius: '12px',
                background: decodedResult.success ? (isDark ? '#0f172a' : '#f0fdf4') : (isDark ? '#0f172a' : '#fef2f2'),
                border: `1px solid ${decodedResult.success ? '#27AE60' : '#E74C3C'}`
              }}>
                {decodedResult.success ? (
                  <>
                    <p style={{ margin: '0 0 8px', fontWeight: '600', color: '#27AE60' }}>
                      <CheckCircle size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                      Décodage réussi
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                      <strong>Signification:</strong> {decodedResult.meaning}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                      <strong>Catégorie:</strong> {RUMOR_CATEGORIES.find(c => c.value === decodedResult.category)?.label}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                      <strong>Priorité:</strong> {RUMOR_PRIORITIES.find(p => p.value === decodedResult.priority)?.label}
                    </p>
                    {decodedResult.details && (
                      <p style={{ margin: '4px 0', fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                        <strong>Détails:</strong> {decodedResult.details}
                      </p>
                    )}
                    <button
                      style={{ ...styles.btnPrimary, marginTop: '12px' }}
                      onClick={() => { setActiveTab('rumors'); setViewMode('form'); }}
                    >
                      <Plus size={16} /> Créer la rumeur
                    </button>
                  </>
                ) : (
                  <p style={{ margin: 0, color: '#E74C3C' }}>
                    <XCircle size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    {decodedResult.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Codes Reference */}
          <div>
            <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
              <Hash size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Codes SMS disponibles
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {smsCodes.map(code => {
                const category = RUMOR_CATEGORIES.find(c => c.value === code.category);
                const priority = RUMOR_PRIORITIES.find(p => p.value === code.priority);
                return (
                  <div
                    key={code.code}
                    style={{
                      padding: '12px 16px',
                      background: isDark ? '#0f172a' : '#f8fafc',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        padding: '4px 10px',
                        background: category?.color || '#64748b',
                        color: 'white',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontFamily: 'monospace',
                        fontSize: '14px'
                      }}>
                        {code.code}
                      </span>
                      <span style={{ fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                        {code.meaning}
                      </span>
                    </div>
                    <span style={styles.badge(priority?.color || '#64748b')}>
                      {priority?.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '20px', padding: '16px', background: isDark ? '#0f172a' : '#fffbeb', borderRadius: '12px', border: '1px solid #F39C12' }}>
              <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#fbbf24' : '#92400e' }}>
                <AlertCircle size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                <strong>Format SMS:</strong> CODE LOCALITE DETAILS
                <br />
                <span style={{ opacity: 0.8 }}>Ex: EP DOUALA 3 CAS FIEVRE VOMISSEMENTS</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Scan History
  const renderScanHistory = () => {
    const SCAN_STATUS = {
      running: { label: 'En cours', color: '#3498DB', icon: Loader },
      completed: { label: 'Terminé', color: '#27AE60', icon: CheckCircle },
      failed: { label: 'Échoué', color: '#E74C3C', icon: XCircle },
      partial: { label: 'Partiel', color: '#F39C12', icon: AlertCircle }
    };

    const SCAN_SOURCES = {
      twitter: { label: 'Twitter/X', color: '#1DA1F2', icon: Share2 },
      facebook: { label: 'Facebook', color: '#4267B2', icon: Globe },
      news: { label: 'Sites d\'actualités', color: '#E74C3C', icon: FileText },
      forums: { label: 'Forums santé', color: '#9B59B6', icon: MessageCircle },
      whatsapp: { label: 'WhatsApp (signalements)', color: '#25D366', icon: Phone }
    };

    return (
      <div style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>
            <Globe size={20} style={{ marginRight: '10px', verticalAlign: 'middle', color: '#3498DB' }} />
            Historique des Scans Web & Réseaux Sociaux
          </h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={styles.btnPrimary} onClick={runManualScan} disabled={loading}>
              {loading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={16} />}
              Lancer un scan
            </button>
            <button style={styles.btnSecondary} onClick={() => fetchScanHistory()}>
              <RefreshCw size={16} /> Actualiser
            </button>
          </div>
        </div>

        {/* Scan Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? '#0f172a' : '#f0f9ff', border: `1px solid ${isDark ? '#1e3a5f' : '#bae6fd'}` }}>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#3498DB' }}>
              {scanHistory.filter(s => s.status === 'completed').length}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: isDark ? '#64748b' : '#64748b' }}>Scans réussis</p>
          </div>
          <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? '#0f172a' : '#fef3c7', border: `1px solid ${isDark ? '#78350f' : '#fcd34d'}` }}>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#F39C12' }}>
              {scanHistory.reduce((acc, s) => acc + (s.rumors_found || 0), 0)}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: isDark ? '#64748b' : '#64748b' }}>Rumeurs détectées</p>
          </div>
          <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? '#0f172a' : '#f0fdf4', border: `1px solid ${isDark ? '#166534' : '#86efac'}` }}>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#27AE60' }}>
              {scanHistory.reduce((acc, s) => acc + (s.rumors_created || 0), 0)}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: isDark ? '#64748b' : '#64748b' }}>Rumeurs créées</p>
          </div>
          <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? '#0f172a' : '#fef2f2', border: `1px solid ${isDark ? '#991b1b' : '#fecaca'}` }}>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#E74C3C' }}>
              {scanHistory.filter(s => s.status === 'failed').length}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: isDark ? '#64748b' : '#64748b' }}>Échecs</p>
          </div>
        </div>

        {/* Scan History Table */}
        {scanHistoryLoading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Loader size={40} style={{ animation: 'spin 1s linear infinite', color: '#3498DB' }} />
            <p style={{ marginTop: '16px', color: isDark ? '#64748b' : '#94a3b8' }}>Chargement...</p>
          </div>
        ) : scanHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: isDark ? '#64748b' : '#94a3b8' }}>
            <Globe size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>Aucun scan effectué</p>
            <p style={{ fontSize: '14px' }}>Lancez un scan pour commencer à détecter les rumeurs</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>Date/Heure</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>Source</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>Statut</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>Analysés</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>Détectés</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>Créés</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>Mots-clés</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>Durée</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scanHistory.map((scan, idx) => {
                  const status = SCAN_STATUS[scan.status] || SCAN_STATUS.completed;
                  const StatusIcon = status.icon;
                  const source = SCAN_SOURCES[scan.source] || { label: scan.source, color: '#94a3b8', icon: Globe };
                  const SourceIcon = source.icon;

                  return (
                    <tr key={scan.id || idx} style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                      <td style={{ padding: '12px', fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                        <div>{new Date(scan.created_at).toLocaleDateString('fr-FR')}</div>
                        <div style={{ fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                          {new Date(scan.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          background: `${source.color}20`,
                          color: source.color
                        }}>
                          <SourceIcon size={14} />
                          {source.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '500',
                          background: `${status.color}20`,
                          color: status.color
                        }}>
                          <StatusIcon size={14} style={scan.status === 'running' ? { animation: 'spin 1s linear infinite' } : {}} />
                          {status.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                        {scan.items_scanned || 0}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#F39C12' }}>
                        {scan.rumors_found || 0}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#27AE60' }}>
                        {scan.rumors_created || 0}
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
                        {scan.keywords ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {(typeof scan.keywords === 'string' ? JSON.parse(scan.keywords) : scan.keywords).slice(0, 3).map((kw, i) => (
                              <span key={i} style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                background: isDark ? '#1e293b' : '#f1f5f9',
                                color: isDark ? '#94a3b8' : '#64748b'
                              }}>
                                {kw}
                              </span>
                            ))}
                            {(typeof scan.keywords === 'string' ? JSON.parse(scan.keywords) : scan.keywords).length > 3 && (
                              <span style={{ fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>
                                +{(typeof scan.keywords === 'string' ? JSON.parse(scan.keywords) : scan.keywords).length - 3}
                              </span>
                            )}
                          </div>
                        ) : '-'}
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
                        {scan.duration ? `${scan.duration}s` : '-'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          style={{ ...styles.btnIcon, padding: '6px' }}
                          onClick={() => {
                            // View scan details
                            setToast({ type: 'info', message: `Scan #${scan.id}: ${scan.rumors_found} rumeurs trouvées` });
                          }}
                          title="Voir les détails"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {scanHistoryPagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
                <button
                  style={{ ...styles.btnSecondary, padding: '8px 12px' }}
                  onClick={() => fetchScanHistory(scanHistoryPagination.page - 1)}
                  disabled={scanHistoryPagination.page <= 1}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b' }}>
                  Page {scanHistoryPagination.page} / {scanHistoryPagination.pages}
                </span>
                <button
                  style={{ ...styles.btnSecondary, padding: '8px 12px' }}
                  onClick={() => fetchScanHistory(scanHistoryPagination.page + 1)}
                  disabled={scanHistoryPagination.page >= scanHistoryPagination.pages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Scan Configuration Info */}
        <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: isDark ? '#0f172a' : '#f8fafc', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
            <Settings size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Configuration du Scanner
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '13px' }}>
            <div>
              <span style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Statut:</span>
              <span style={{ marginLeft: '8px', color: scannerSettings.enabled ? '#27AE60' : '#E74C3C', fontWeight: '500' }}>
                {scannerSettings.enabled ? 'Actif' : 'Inactif'}
              </span>
            </div>
            <div>
              <span style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Intervalle:</span>
              <span style={{ marginLeft: '8px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                {scannerSettings.interval} minutes
              </span>
            </div>
            <div>
              <span style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Mots-clés:</span>
              <span style={{ marginLeft: '8px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                {scannerSettings.keywords?.length || 0} configurés
              </span>
            </div>
          </div>
          <button
            style={{ ...styles.btnSecondary, marginTop: '12px', padding: '8px 16px' }}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={14} /> Modifier la configuration
          </button>
        </div>
      </div>
    );
  };

  // Render Settings
  const renderSettings = () => (
    <div style={styles.card}>
      <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>
        <Settings size={20} style={{ marginRight: '10px', verticalAlign: 'middle', color: '#E74C3C' }} />
        Paramètres COHRM
      </h3>

      {/* Settings Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: isDark ? '#0f172a' : '#f1f5f9', padding: '8px', borderRadius: '12px' }}>
        <button style={styles.tab(settingsTab === 'sms-codes')} onClick={() => setSettingsTab('sms-codes')}>
          <Hash size={16} /> Codes SMS
        </button>
        <button style={styles.tab(settingsTab === 'scanner')} onClick={() => setSettingsTab('scanner')}>
          <Radar size={16} /> Scanner
        </button>
        <button style={styles.tab(settingsTab === 'notifications')} onClick={() => setSettingsTab('notifications')}>
          <Bell size={16} /> Notifications
        </button>
        <button style={styles.tab(settingsTab === 'api')} onClick={() => setSettingsTab('api')}>
          <Database size={16} /> API Mobile
        </button>
      </div>

      {/* SMS Codes Settings */}
      {settingsTab === 'sms-codes' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b' }}>
              Configurez les codes SMS utilisés par les agents de santé communautaire
            </p>
            <button style={styles.btnPrimary}>
              <Plus size={16} /> Ajouter un code
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {smsCodes.map((code, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  background: isDark ? '#0f172a' : '#f8fafc',
                  borderRadius: '12px',
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 150px 100px 80px',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <input
                  style={{ ...styles.input, fontFamily: 'monospace', fontWeight: '700', textAlign: 'center' }}
                  value={code.code}
                  readOnly
                />
                <input style={styles.input} value={code.meaning} readOnly />
                <select style={styles.select} value={code.category} disabled>
                  {RUMOR_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <select style={styles.select} value={code.priority} disabled>
                  {RUMOR_PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                <button style={{ ...styles.btnSecondary, padding: '10px' }}>
                  <Edit2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scanner Settings */}
      {settingsTab === 'scanner' && (
        <div>
          <div style={{
            padding: '20px',
            background: isDark ? '#0f172a' : '#f8fafc',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                  Scanner automatique
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>
                  Analyse automatique des sources web et réseaux sociaux
                </p>
              </div>
              <button
                style={{
                  width: '60px',
                  height: '32px',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  background: scannerSettings.enabled ? '#27AE60' : (isDark ? '#334155' : '#e2e8f0'),
                  position: 'relative',
                  transition: 'background 0.2s'
                }}
                onClick={() => setScannerSettings({ ...scannerSettings, enabled: !scannerSettings.enabled })}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '4px',
                  left: scannerSettings.enabled ? '32px' : '4px',
                  transition: 'left 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={styles.label}>Intervalle de scan (minutes)</label>
                <input
                  style={styles.input}
                  type="number"
                  min="5"
                  max="1440"
                  value={scannerSettings.interval}
                  onChange={e => setScannerSettings({ ...scannerSettings, interval: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label style={styles.label}>Sources à scanner</label>
                <select style={styles.select} multiple>
                  <option value="twitter">Twitter/X</option>
                  <option value="facebook">Facebook</option>
                  <option value="news">Sites d'actualités</option>
                  <option value="whatsapp">WhatsApp (via API)</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ padding: '20px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px' }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
              Mots-clés de détection
            </h4>
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>
              Termes recherchés automatiquement (un par ligne)
            </p>
            <textarea
              style={{ ...styles.input, minHeight: '150px', fontFamily: 'monospace' }}
              placeholder="épidémie&#10;maladie&#10;mort animale&#10;eau contaminée&#10;fièvre&#10;..."
              defaultValue="épidémie\ncholéra\nfièvre hémorragique\ngrippe aviaire\nmaladie mystérieuse\nmort massive\neau contaminée\nintoxication alimentaire"
            />
          </div>
        </div>
      )}

      {/* Notifications Settings */}
      {settingsTab === 'notifications' && (
        <div style={{ padding: '20px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px' }}>
          <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
            Configuration des alertes
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {RUMOR_PRIORITIES.map(p => (
              <div key={p.value} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: isDark ? '#1e293b' : '#ffffff', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={styles.badge(p.color)}>{p.label}</span>
                  <span style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>Priorité {p.label.toLowerCase()}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked={p.value !== 'low'} /> Email
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked={p.value === 'critical' || p.value === 'high'} /> SMS
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked={p.value === 'critical'} /> Push
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Settings */}
      {settingsTab === 'api' && (
        <div>
          <div style={{ padding: '20px', background: isDark ? '#0f172a' : '#f0fdf4', borderRadius: '12px', border: '1px solid #27AE60', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '600', color: '#27AE60' }}>
              <Smartphone size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              API Mobile Ready
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
              Le système est prêt pour l'intégration avec une application mobile. Les endpoints suivants sont disponibles.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { method: 'GET', endpoint: '/api/cohrm/rumors', desc: 'Liste des rumeurs' },
              { method: 'POST', endpoint: '/api/cohrm/rumors', desc: 'Signaler une rumeur' },
              { method: 'POST', endpoint: '/api/cohrm/sms/decode', desc: 'Décoder un SMS' },
              { method: 'GET', endpoint: '/api/cohrm/stats', desc: 'Statistiques' },
              { method: 'GET', endpoint: '/api/cohrm/codes', desc: 'Liste des codes SMS' }
            ].map((api, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 16px',
                  background: isDark ? '#0f172a' : '#f8fafc',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <span style={{
                  padding: '4px 8px',
                  background: api.method === 'GET' ? '#27AE60' : '#3498DB',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '700'
                }}>
                  {api.method}
                </span>
                <code style={{ flex: 1, fontFamily: 'monospace', fontSize: '13px', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                  {api.endpoint}
                </code>
                <span style={{ fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>
                  {api.desc}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={styles.label}>Clé API</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                style={{ ...styles.input, fontFamily: 'monospace' }}
                type="password"
                value="sk_cohrm_xxxxxxxxxxxxxxxxxxxxx"
                readOnly
              />
              <button style={styles.btnSecondary}>
                <Copy size={16} /> Copier
              </button>
              <button style={styles.btnSecondary}>
                <RefreshCw size={16} /> Régénérer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '16px 24px',
          background: toast.type === 'success' ? '#27AE60' : '#E74C3C',
          color: 'white',
          borderRadius: '12px',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          animation: 'slideIn 0.3s ease'
        }}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {toast.message}
        </div>
      )}

      {/* Header with tabs */}
      <div style={{ ...styles.card, marginBottom: '24px', padding: '16px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Radar size={24} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                COHRM-SYSTEM
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                Cameroon One Health Rumor Management System
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', background: isDark ? '#0f172a' : '#f1f5f9', padding: '6px', borderRadius: '12px' }}>
            <button style={styles.tab(activeTab === 'dashboard')} onClick={() => setActiveTab('dashboard')}>
              <BarChart3 size={16} /> Dashboard
            </button>
            <button style={styles.tab(activeTab === 'rumors')} onClick={() => { setActiveTab('rumors'); setViewMode('list'); }}>
              <AlertTriangle size={16} /> Rumeurs
            </button>
            <button style={styles.tab(activeTab === 'sms-decoder')} onClick={() => setActiveTab('sms-decoder')}>
              <Phone size={16} /> SMS
            </button>
            <button style={styles.tab(activeTab === 'scan-history')} onClick={() => { setActiveTab('scan-history'); fetchScanHistory(); }}>
              <Globe size={16} /> Historique Scans
            </button>
            <button style={styles.tab(activeTab === 'settings')} onClick={() => setActiveTab('settings')}>
              <Settings size={16} /> Paramètres
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'rumors' && (viewMode === 'form' ? renderRumorForm() : renderRumorsList())}
      {activeTab === 'sms-decoder' && renderSMSDecoder()}
      {activeTab === 'scan-history' && renderScanHistory()}
      {activeTab === 'settings' && renderSettings()}

      <style>{`
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default COHRMSystemPage;
