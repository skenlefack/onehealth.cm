import PageBuilderPage from './PageBuilderPage';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  LayoutDashboard, FileText, FolderTree, Image, Users, MessageSquare,
  Settings, Menu, X, Plus, Edit, Edit2, Edit3, Trash2, Eye, Search, Filter,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Save, Upload, LogOut, Bell, Moon, Sun,
  BarChart3, TrendingUp, Calendar, Clock, Check, AlertCircle, RefreshCw, RotateCcw,
  Lock, Mail, User, Shield, Activity, Heart, Leaf, Globe, EyeOff, Loader,
  Layers, Layout, Palette, Sliders, FileCode, GripVertical, Copy,
  Link, Tag, ImageIcon, Type, Box, Grid, Move, Maximize2, Monitor,
  Smartphone, Tablet, Code, Paintbrush, PanelLeft, LayoutTemplate,
  FolderOpen, Home, ExternalLink, MoreVertical, ArrowUp, ArrowDown,
  Columns, Square, Circle, Triangle, Star, Zap, Play, Pause, Camera,
  MapPin, GraduationCap, BookOpen, Award, Phone, Linkedin, Twitter,
  HelpCircle, FileQuestion, ListChecks, Timer, Target, CheckCircle2, XCircle, File
} from 'lucide-react';

// ============== COULEURS ONE HEALTH ==============
const colors = {
  primary: '#2196F3',
  secondary: '#4CAF50', 
  accent: '#FF9800',
  cameroonGreen: '#007A33',
  cameroonRed: '#CE1126',
  cameroonYellow: '#FCD116',
  teal: '#009688',
  dark: '#1a1a2e',
  darkBlue: '#16213e',
  purple: '#6366f1',
  pink: '#ec4899',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  cyan: '#06b6d4',
  indigo: '#4f46e5'
};

// ============== API CONFIG ==============
const API_URL = 'http://localhost:5000/api';

const api = {
  get: async (endpoint, token) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      return res.json();
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: 'Connection error' };
    }
  },
  post: async (endpoint, data, token) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    } catch (error) {
      return { success: false, message: 'Connection error' };
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
      return { success: false, message: 'Connection error' };
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
      return { success: false, message: 'Connection error' };
    }
  },
  upload: async (endpoint, formData, token) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      return res.json();
    } catch (error) {
      return { success: false, message: 'Upload error' };
    }
  }
};

// ============== STYLES ==============
const createStyles = (isDark) => ({
  app: {
    display: 'flex',
    minHeight: '100vh',
    background: isDark ? '#0f172a' : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)',
    color: isDark ? '#e2e8f0' : '#1e293b',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    transition: 'all 0.3s ease'
  },
  sidebar: (collapsed) => ({
    width: collapsed ? '72px' : '280px',
    background: isDark
      ? `linear-gradient(180deg, ${colors.darkBlue} 0%, ${colors.dark} 100%)`
      : `linear-gradient(180deg, ${colors.cameroonGreen} 0%, ${colors.teal} 100%)`,
    borderRight: 'none',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s ease',
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    overflow: 'hidden',
    boxShadow: isDark ? 'none' : '4px 0 20px rgba(0,122,51,0.15)'
  }),
  main: (collapsed) => ({
    flex: 1,
    marginLeft: collapsed ? '72px' : '280px',
    transition: 'margin 0.3s ease',
    minHeight: '100vh'
  }),
  header: {
    height: '72px',
    background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    borderBottom: `1px solid ${isDark ? '#334155' : 'rgba(0,122,51,0.1)'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.05)'
  },
  content: { padding: '32px', maxWidth: '1600px', margin: '0 auto' },
  card: {
    background: isDark ? '#1e293b' : '#ffffff',
    borderRadius: '16px',
    border: `1px solid ${isDark ? '#334155' : 'rgba(0,122,51,0.1)'}`,
    padding: '24px',
    boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,122,51,0.08)'
  },
  cardHover: {
    background: isDark ? '#1e293b' : '#ffffff',
    borderRadius: '16px',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    padding: '24px',
    boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  btnPrimary: {
    background: `linear-gradient(135deg, ${colors.cameroonGreen} 0%, ${colors.teal} 100%)`,
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    fontSize: '14px',
    fontFamily: 'inherit'
  },
  btnSecondary: {
    background: isDark ? '#334155' : '#f1f5f9',
    color: isDark ? '#e2e8f0' : '#475569',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontFamily: 'inherit'
  },
  btnDanger: {
    background: `linear-gradient(135deg, ${colors.error} 0%, #dc2626 100%)`,
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontFamily: 'inherit'
  },
  btnIcon: {
    background: 'transparent',
    border: 'none',
    padding: '10px',
    borderRadius: '10px',
    cursor: 'pointer',
    color: isDark ? '#94a3b8' : '#64748b',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    background: isDark ? '#0f172a' : '#ffffff',
    color: isDark ? '#e2e8f0' : '#1e293b',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit'
  },
  select: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    background: isDark ? '#0f172a' : '#ffffff',
    color: isDark ? '#e2e8f0' : '#1e293b',
    fontSize: '15px',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit'
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    background: isDark ? '#0f172a' : '#ffffff',
    color: isDark ? '#e2e8f0' : '#1e293b',
    fontSize: '15px',
    outline: 'none',
    resize: 'vertical',
    minHeight: '120px',
    fontFamily: 'inherit'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    fontSize: '14px',
    color: isDark ? '#e2e8f0' : '#374151'
  },
  badge: (color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    background: `${color}20`,
    color: color
  }),
  navItem: (active, collapsed) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: collapsed ? '14px' : '14px 20px',
    margin: '2px 12px',
    borderRadius: '12px',
    cursor: 'pointer',
    color: isDark
      ? (active ? colors.cameroonGreen : '#94a3b8')
      : (active ? '#ffffff' : 'rgba(255,255,255,0.7)'),
    background: isDark
      ? (active ? 'rgba(0, 122, 51, 0.15)' : 'transparent')
      : (active ? 'rgba(255,255,255,0.2)' : 'transparent'),
    fontWeight: active ? '600' : '500',
    transition: 'all 0.2s ease',
    justifyContent: collapsed ? 'center' : 'flex-start',
    fontSize: '14px',
    backdropFilter: active && !isDark ? 'blur(10px)' : 'none'
  }),
  navGroup: {
    fontSize: '11px',
    fontWeight: '700',
    color: isDark ? '#64748b' : 'rgba(255,255,255,0.5)',
    padding: '16px 20px 8px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    color: isDark ? '#94a3b8' : '#64748b',
    fontWeight: '600',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  tr: {
    background: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)',
    transition: 'all 0.2s ease'
  },
  td: {
    padding: '16px',
    borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    background: isDark ? '#0f172a' : '#f1f5f9',
    padding: '4px',
    borderRadius: '12px',
    marginBottom: '24px'
  },
  tab: (active) => ({
    padding: '12px 20px',
    borderRadius: '10px',
    border: 'none',
    background: active ? (isDark ? '#1e293b' : '#ffffff') : 'transparent',
    color: active ? (isDark ? '#e2e8f0' : '#1e293b') : (isDark ? '#64748b' : '#94a3b8'),
    fontWeight: active ? '600' : '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxShadow: active ? (isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)') : 'none'
  }),
  statCard: (color) => ({
    background: isDark ? '#1e293b' : '#ffffff',
    borderRadius: '16px',
    border: `1px solid ${isDark ? '#334155' : 'rgba(0,122,51,0.1)'}`,
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : `0 4px 20px ${color}15`,
    transition: 'all 0.3s ease'
  }),
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' },
  flex: { display: 'flex', alignItems: 'center', gap: '12px' },
  flexBetween: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  flexCol: { display: 'flex', flexDirection: 'column', gap: '12px' },
  mb16: { marginBottom: '16px' },
  mb24: { marginBottom: '24px' },
  mb32: { marginBottom: '32px' },
  textMuted: { color: isDark ? '#94a3b8' : '#64748b' },
  textSmall: { fontSize: '13px' },
  divider: { height: '1px', background: isDark ? '#334155' : '#e2e8f0', margin: '24px 0' },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px'
  },
  modal: {
    background: isDark ? '#1e293b' : '#ffffff',
    borderRadius: '20px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
  },
  modalHeader: {
    padding: '20px 24px',
    borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    background: isDark ? '#1e293b' : '#ffffff',
    zIndex: 10
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
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    color: isDark ? '#94a3b8' : '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

// ============== COMPOSANTS UTILITAIRES ==============

// Toast Notification avec auto-close
const Toast = ({ message, type = 'success', onClose }) => {
  // Auto-close: 3s pour success, 6s pour error/warning
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onClose();
    }, type === 'success' ? 3000 : 6000);
    return () => clearTimeout(timeout);
  }, [type, onClose]);

  return (
    <div style={{
      position: 'fixed', top: '24px', right: '24px', padding: '16px 24px', borderRadius: '12px',
      background: type === 'success' ? colors.success : type === 'error' ? colors.error : colors.warning,
      color: 'white', fontWeight: '500', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '12px', animation: 'slideIn 0.3s ease',
      maxWidth: '450px'
    }}>
      {type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '8px', flexShrink: 0 }}>
        <X size={18} />
      </button>
    </div>
  );
};

// Spinner
const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px' }}>
    <RefreshCw size={40} style={{ animation: 'spin 1s linear infinite', color: colors.cameroonGreen }} />
  </div>
);

// Modal
const Modal = ({ isOpen, onClose, title, children, isDark, width = '600px', fullScreen = false }) => {
  if (!isOpen) return null;
  const styles = createStyles(isDark);
  
  return (
    <div style={{ 
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: fullScreen ? '0' : '24px' 
    }} onClick={onClose}>
      <div style={{ 
        background: isDark ? '#1e293b' : '#ffffff', 
        borderRadius: fullScreen ? '0' : '20px', 
        width: fullScreen ? '100%' : '100%',
        maxWidth: fullScreen ? '100%' : width, 
        height: fullScreen ? '100%' : 'auto',
        maxHeight: fullScreen ? '100%' : '90vh', 
        overflow: 'auto', 
        boxShadow: '0 25px 50px rgba(0,0,0,0.3)' 
      }} onClick={e => e.stopPropagation()}>
        <div style={{ 
          padding: '20px 24px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, background: isDark ? '#1e293b' : '#ffffff', zIndex: 10
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>{title}</h2>
          <button onClick={onClose} style={styles.btnIcon}><X size={22} /></button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
};

// Confirmation Dialog Moderne
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDark,
  type = 'danger', // 'danger', 'warning', 'success', 'info'
  confirmText = 'Confirmer',
  cancelText = 'Annuler'
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    danger: { color: colors.error, icon: Trash2, bgColor: '#fef2f2' },
    warning: { color: colors.warning, icon: AlertCircle, bgColor: '#fffbeb' },
    success: { color: colors.success, icon: Check, bgColor: '#f0fdf4' },
    info: { color: colors.primary, icon: Eye, bgColor: '#eff6ff' }
  };

  const config = typeConfig[type] || typeConfig.danger;
  const IconComponent = config.icon;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '24px',
      animation: 'fadeIn 0.2s ease'
    }} onClick={onClose}>
      <div style={{
        background: isDark ? '#1e293b' : '#ffffff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        overflow: 'hidden',
        animation: 'slideUp 0.3s ease'
      }} onClick={e => e.stopPropagation()}>
        {/* Header avec icône */}
        <div style={{
          padding: '32px 24px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: isDark ? `${config.color}20` : config.bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <IconComponent size={36} color={config.color} />
          </div>
          <h3 style={{
            margin: '0 0 12px',
            fontSize: '22px',
            fontWeight: '700',
            color: isDark ? '#f1f5f9' : '#1e293b'
          }}>
            {title}
          </h3>
          <p style={{
            margin: 0,
            fontSize: '15px',
            color: isDark ? '#94a3b8' : '#64748b',
            lineHeight: '1.6'
          }}>
            {message}
          </p>
        </div>

        {/* Boutons */}
        <div style={{
          padding: '16px 24px 24px',
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px 24px',
              borderRadius: '12px',
              border: `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              background: 'transparent',
              color: isDark ? '#e2e8f0' : '#475569',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => {
              e.target.style.background = isDark ? '#334155' : '#f1f5f9';
            }}
            onMouseOut={e => {
              e.target.style.background = 'transparent';
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            style={{
              flex: 1,
              padding: '14px 24px',
              borderRadius: '12px',
              border: 'none',
              background: config.color,
              color: 'white',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: `0 4px 12px ${config.color}40`
            }}
            onMouseOver={e => {
              e.target.style.opacity = '0.9';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={e => {
              e.target.style.opacity = '1';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

// Stat Card
const StatCard = ({ icon: Icon, label, value, change, color, isDark }) => {
  const styles = createStyles(isDark);
  return (
    <div style={styles.statCard(color)}>
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: `${color}15`, opacity: 0.5 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={26} color={color} />
        </div>
        <div>
          <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '14px', margin: '0 0 4px 0' }}>{label}</p>
          <p style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>{value}</p>
        </div>
      </div>
      {change && (
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TrendingUp size={16} color={colors.success} />
          <span style={{ color: colors.success, fontWeight: '600', fontSize: '14px' }}>{change}</span>
        </div>
      )}
    </div>
  );
};

// Tabs Component
const Tabs = ({ tabs, activeTab, onChange, isDark }) => {
  const styles = createStyles(isDark);
  return (
    <div style={styles.tabs}>
      {tabs.map(tab => (
        <button key={tab.id} style={styles.tab(activeTab === tab.id)} onClick={() => onChange(tab.id)}>
          {tab.icon && <tab.icon size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// Image Picker
const ImagePicker = ({ value, onChange, isDark, token }) => {
  const styles = createStyles(isDark);
  const [showPicker, setShowPicker] = useState(false);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  const fetchMedia = async () => {
    setLoading(true);
    const res = await api.get('/media', token);
    if (res.success) {
      // Filtrer uniquement les images
      const images = res.data.filter(m => m.type && m.type.startsWith('image/'));
      setMedia(images);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (showPicker) {
      fetchMedia();
    }
  }, [showPicker]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('files', file); // Backend expects 'files'

    try {
      const response = await fetch('http://localhost:5000/api/media/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const res = await response.json();
      if (res.success && res.data && res.data.length > 0) {
        onChange(res.data[0].url);
        setShowPicker(false);
        fetchMedia(); // Rafraîchir la liste
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
    setUploading(false);
  };

  const filteredMedia = media.filter(m =>
    m.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.alt_text?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div
        onClick={() => setShowPicker(true)}
        style={{
          width: '100%',
          height: '160px',
          borderRadius: '12px',
          border: `2px dashed ${isDark ? '#334155' : '#e2e8f0'}`,
          background: isDark ? '#0f172a' : '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          transition: 'all 0.2s ease'
        }}
      >
        {value ? (
          <img src={value.startsWith('http') ? value : `http://localhost:5000${value}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <>
            <ImageIcon size={32} color={isDark ? '#64748b' : '#94a3b8'} />
            <p style={{ margin: '12px 0 0', fontSize: '14px', color: isDark ? '#64748b' : '#94a3b8' }}>Cliquer pour choisir une image</p>
          </>
        )}
      </div>
      {value && (
        <button
          onClick={(e) => { e.stopPropagation(); onChange(''); }}
          style={{ ...styles.btnSecondary, marginTop: '8px', padding: '8px 16px', fontSize: '13px' }}
        >
          <X size={14} /> Supprimer
        </button>
      )}

      {/* Modal de sélection d'image */}
      {showPicker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: isDark ? '#1e293b' : 'white',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '900px',
            maxHeight: '80vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>📷 Sélectionner une image</h3>
              <button onClick={() => setShowPicker(false)} style={{ ...styles.btnIcon }}>
                <X size={24} />
              </button>
            </div>

            {/* Toolbar */}
            <div style={{
              padding: '16px 24px',
              borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#64748b' : '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Rechercher une image..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ ...styles.input, paddingLeft: '40px', width: '100%' }}
                />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{ ...styles.btnPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Upload size={18} /> {uploading ? 'Envoi...' : 'Uploader'}
              </button>
            </div>

            {/* Grid d'images */}
            <div style={{
              padding: '24px',
              overflowY: 'auto',
              maxHeight: 'calc(80vh - 160px)'
            }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Spinner />
                </div>
              ) : filteredMedia.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: isDark ? '#64748b' : '#94a3b8' }}>
                  <ImageIcon size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p>Aucune image trouvée</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '16px'
                }}>
                  {filteredMedia.map(item => (
                    <div
                      key={item.id}
                      onClick={() => { onChange(item.url); setShowPicker(false); }}
                      style={{
                        position: 'relative',
                        paddingTop: '100%',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: value === item.url ? `3px solid ${colors.cameroonGreen}` : `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <img
                        src={`http://localhost:5000${item.url}`}
                        alt={item.alt_text || item.filename}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      {value === item.url && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: colors.cameroonGreen,
                          borderRadius: '50%',
                          padding: '4px'
                        }}>
                          <Check size={16} color="white" />
                        </div>
                      )}
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '8px',
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                        color: 'white',
                        fontSize: '11px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.filename}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Color Picker
const ColorPicker = ({ value, onChange, label, isDark }) => {
  const styles = createStyles(isDark);
  return (
    <div style={styles.mb16}>
      <label style={styles.label}>{label}</label>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input 
          type="color" 
          value={value || '#000000'} 
          onChange={(e) => onChange(e.target.value)}
          style={{ width: '50px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        />
        <input 
          type="text" 
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)}
          style={{ ...styles.input, flex: 1 }}
          placeholder="#000000"
        />
      </div>
    </div>
  );
};

// Tags Input
const TagsInput = ({ value = [], onChange, isDark, placeholder = "Ajouter un tag..." }) => {
  const styles = createStyles(isDark);
  const [input, setInput] = useState('');
  
  const addTag = () => {
    if (input.trim() && !value.includes(input.trim())) {
      onChange([...value, input.trim()]);
      setInput('');
    }
  };
  
  const removeTag = (tag) => {
    onChange(value.filter(t => t !== tag));
  };
  
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: value.length ? '12px' : '0' }}>
        {value.map((tag, i) => (
          <span key={i} style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '20px', fontSize: '13px',
            background: `${colors.cameroonGreen}20`, color: colors.cameroonGreen
          }}>
            {tag}
            <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeTag(tag)} />
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          style={{ ...styles.input, flex: 1 }}
          placeholder={placeholder}
        />
        <button style={styles.btnSecondary} onClick={addTag}><Plus size={18} /></button>
      </div>
    </div>
  );
};

// Sortable Tree Item (pour les catégories)
const TreeItem = ({ item, level = 0, onEdit, onDelete, onAddChild, isDark, expanded, onToggle, searchQuery = '' }) => {
  const styles = createStyles(isDark);
  const hasChildren = item.children && item.children.length > 0;
  const displayName = item.name_fr || item.name || 'Sans nom';

  // Fonction pour surligner le texte recherché
  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} style={{ background: colors.cameroonYellow, padding: '0 2px', borderRadius: '2px' }}>{part}</mark>
        : part
    );
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        marginLeft: `${level * 24}px`,
        marginBottom: '4px',
        background: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)',
        borderRadius: '10px',
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        transition: 'all 0.2s ease'
      }}>
        {hasChildren ? (
          <button style={{ ...styles.btnIcon, padding: '4px' }} onClick={() => onToggle(item.id)}>
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        ) : (
          <div style={{ width: '26px' }} />
        )}
        <span style={{ fontSize: '18px' }}>{level === 0 ? '📁' : '📂'}</span>
        <span style={{ flex: 1, fontWeight: '500' }}>{highlightText(displayName, searchQuery)}</span>
        <span style={styles.badge(colors.primary)}>{item.post_count || 0} articles</span>
        <button style={styles.btnIcon} onClick={() => onAddChild(item)} title="Ajouter sous-catégorie"><Plus size={16} /></button>
        <button style={styles.btnIcon} onClick={() => onEdit(item)} title="Modifier"><Edit size={16} /></button>
        <button style={{ ...styles.btnIcon, color: colors.error }} onClick={() => onDelete(item)} title="Supprimer"><Trash2 size={16} /></button>
      </div>
      {hasChildren && expanded && (
        <div>
          {item.children.map(child => (
            <TreeItem
              key={child.id}
              item={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              isDark={isDark}
              expanded={expanded}
              onToggle={onToggle}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Rich Text Editor Complet avec support Word
const RichEditor = ({ value, onChange, isDark, height = '400px', token }) => {
  const styles = createStyles(isDark);
  const editorRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceCode, setSourceCode] = useState(value || '');

  // Initialiser le contenu
  useEffect(() => {
    if (editorRef.current && !isSourceMode) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, isSourceMode]);

  // Exécuter une commande de formatage
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  // Gérer le changement de contenu
  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Insérer un lien
  const insertLink = () => {
    const url = prompt('Entrez l\'URL du lien:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  // Insérer une image depuis une URL
  const insertImageFromUrl = () => {
    const url = prompt('Entrez l\'URL de l\'image:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  // Upload d'image
  const handleImageUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('files', file); // Le backend attend 'files'

    try {
      const res = await fetch('http://localhost:5000/api/media/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      // data.data est un tableau
      if (data.success && data.data && data.data.length > 0) {
        const imgUrl = `http://localhost:5000${data.data[0].url}`;
        // Insérer l'image dans l'éditeur
        const img = `<img src="${imgUrl}" alt="" style="max-width: 100%; height: auto;" />`;
        document.execCommand('insertHTML', false, img);
        handleContentChange();
      } else {
        console.error('Upload failed:', data.message);
        alert('Erreur lors de l\'upload: ' + (data.message || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erreur de connexion lors de l\'upload');
    }
  };

  // Gérer le collage (paste) - support Word avec images
  const handlePaste = async (e) => {
    e.preventDefault();

    const clipboardData = e.clipboardData;

    // Vérifier s'il y a des images dans le presse-papiers
    const items = clipboardData.items;
    let hasImage = false;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        hasImage = true;
        const file = items[i].getAsFile();
        await handleImageUpload(file);
      }
    }

    if (!hasImage) {
      // Récupérer le contenu HTML (pour Word)
      let html = clipboardData.getData('text/html');

      if (html) {
        // Nettoyer le HTML de Word
        html = cleanWordHtml(html);

        // Extraire et uploader les images base64 de Word
        html = await processWordImages(html);

        // Insérer le HTML nettoyé
        document.execCommand('insertHTML', false, html);
      } else {
        // Coller en texte brut
        const text = clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
      }
    }

    handleContentChange();
  };

  // Nettoyer le HTML de Word
  const cleanWordHtml = (html) => {
    // Supprimer les commentaires conditionnels de Word
    html = html.replace(/<!--\[if[\s\S]*?endif\]-->/gi, '');
    html = html.replace(/<!--[\s\S]*?-->/g, '');

    // Supprimer les balises spécifiques à Office
    html = html.replace(/<o:[\s\S]*?<\/o:[^>]*>/gi, '');
    html = html.replace(/<w:[\s\S]*?<\/w:[^>]*>/gi, '');
    html = html.replace(/<m:[\s\S]*?<\/m:[^>]*>/gi, '');
    html = html.replace(/<\/?(o|w|m):[^>]*>/gi, '');

    // Supprimer les attributs de style MSO
    html = html.replace(/\s*mso-[^:]+:[^;"]+;?/gi, '');
    html = html.replace(/\s*class="Mso[^"]*"/gi, '');

    // Nettoyer les styles inline excessifs
    html = html.replace(/\s*style="\s*"/gi, '');

    // Supprimer les spans vides
    html = html.replace(/<span[^>]*>\s*<\/span>/gi, '');

    // Convertir les paragraphes Word en paragraphes standards
    html = html.replace(/<p class="MsoNormal"[^>]*>/gi, '<p>');

    return html;
  };

  // Traiter les images Word (base64 et fichiers)
  const processWordImages = async (html) => {
    // Regex pour trouver les images base64
    const base64Regex = /<img[^>]*src="data:image\/([^;]+);base64,([^"]+)"[^>]*>/gi;
    const matches = [...html.matchAll(base64Regex)];

    for (const match of matches) {
      const [fullMatch, imageType, base64Data] = match;

      try {
        // Convertir base64 en Blob
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: `image/${imageType}` });
        const file = new File([blob], `image_${Date.now()}.${imageType}`, { type: `image/${imageType}` });

        // Uploader l'image
        const formData = new FormData();
        formData.append('files', file); // Le backend attend 'files'

        const res = await fetch('http://localhost:5000/api/media/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const data = await res.json();

        if (data.success && data.data && data.data.length > 0) {
          const imgUrl = `http://localhost:5000${data.data[0].url}`;
          html = html.replace(fullMatch, `<img src="${imgUrl}" style="max-width: 100%; height: auto;" />`);
        }
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }

    return html;
  };

  // Basculer entre mode visuel et code source
  const toggleSourceMode = () => {
    if (isSourceMode) {
      // Revenir au mode visuel
      onChange(sourceCode);
    } else {
      // Passer au mode source
      setSourceCode(editorRef.current?.innerHTML || value || '');
    }
    setIsSourceMode(!isSourceMode);
  };

  // Boutons de la toolbar
  const toolbarButtons = [
    { icon: 'B', command: 'bold', title: 'Gras (Ctrl+B)', style: { fontWeight: 'bold' } },
    { icon: 'I', command: 'italic', title: 'Italique (Ctrl+I)', style: { fontStyle: 'italic' } },
    { icon: 'U', command: 'underline', title: 'Souligné (Ctrl+U)', style: { textDecoration: 'underline' } },
    { icon: 'S', command: 'strikeThrough', title: 'Barré', style: { textDecoration: 'line-through' } },
    { type: 'separator' },
    { icon: 'H1', command: 'formatBlock', value: 'h1', title: 'Titre 1' },
    { icon: 'H2', command: 'formatBlock', value: 'h2', title: 'Titre 2' },
    { icon: 'H3', command: 'formatBlock', value: 'h3', title: 'Titre 3' },
    { icon: 'P', command: 'formatBlock', value: 'p', title: 'Paragraphe' },
    { type: 'separator' },
    { icon: '•', command: 'insertUnorderedList', title: 'Liste à puces' },
    { icon: '1.', command: 'insertOrderedList', title: 'Liste numérotée' },
    { type: 'separator' },
    { icon: '←', command: 'justifyLeft', title: 'Aligner à gauche' },
    { icon: '↔', command: 'justifyCenter', title: 'Centrer' },
    { icon: '→', command: 'justifyRight', title: 'Aligner à droite' },
    { icon: '⇔', command: 'justifyFull', title: 'Justifier' },
    { type: 'separator' },
    { icon: '🔗', action: insertLink, title: 'Insérer un lien' },
    { icon: '📷', action: () => fileInputRef.current?.click(), title: 'Insérer une image' },
    { icon: '🖼️', action: insertImageFromUrl, title: 'Image depuis URL' },
    { type: 'separator' },
    { icon: '↩', command: 'undo', title: 'Annuler' },
    { icon: '↪', command: 'redo', title: 'Rétablir' },
    { icon: '🧹', command: 'removeFormat', title: 'Supprimer le formatage' },
    { type: 'separator' },
    { icon: '</>', action: toggleSourceMode, title: 'Code source', active: isSourceMode }
  ];

  const buttonStyle = (active = false) => ({
    padding: '8px 12px',
    border: 'none',
    borderRadius: '6px',
    background: active ? colors.cameroonGreen : (isDark ? '#334155' : '#e2e8f0'),
    color: active ? 'white' : (isDark ? '#e2e8f0' : '#374151'),
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '36px',
    transition: 'all 0.15s ease'
  });

  return (
    <div style={{ border: `2px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: '12px', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '10px 12px',
        background: isDark ? '#0f172a' : '#f8fafc',
        borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {toolbarButtons.map((btn, i) => (
          btn.type === 'separator' ? (
            <div key={i} style={{ width: '1px', height: '24px', background: isDark ? '#475569' : '#cbd5e1', margin: '0 4px' }} />
          ) : (
            <button
              key={i}
              title={btn.title}
              style={{ ...buttonStyle(btn.active), ...(btn.style || {}) }}
              onClick={() => {
                if (btn.action) {
                  btn.action();
                } else if (btn.value) {
                  execCommand(btn.command, btn.value);
                } else {
                  execCommand(btn.command);
                }
              }}
              onMouseOver={(e) => e.target.style.background = colors.cameroonGreen + '40'}
              onMouseOut={(e) => e.target.style.background = btn.active ? colors.cameroonGreen : (isDark ? '#334155' : '#e2e8f0')}
            >
              {btn.icon}
            </button>
          )
        ))}
      </div>

      {/* Zone d'édition */}
      {isSourceMode ? (
        <textarea
          value={sourceCode}
          onChange={(e) => setSourceCode(e.target.value)}
          style={{
            width: '100%',
            height: height,
            padding: '16px',
            border: 'none',
            background: isDark ? '#0f172a' : '#ffffff',
            color: isDark ? '#22d3ee' : '#0f766e',
            fontSize: '13px',
            fontFamily: 'Consolas, Monaco, monospace',
            resize: 'vertical',
            outline: 'none'
          }}
          placeholder="<p>Votre code HTML ici...</p>"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          onPaste={handlePaste}
          style={{
            width: '100%',
            minHeight: height,
            padding: '16px',
            background: isDark ? '#0f172a' : '#ffffff',
            color: isDark ? '#e2e8f0' : '#1e293b',
            fontSize: '15px',
            lineHeight: '1.7',
            outline: 'none',
            overflowY: 'auto'
          }}
          dangerouslySetInnerHTML={{ __html: '' }}
        />
      )}

      {/* Input caché pour upload d'images */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleImageUpload(e.target.files[0]);
            e.target.value = '';
          }
        }}
      />

      {/* Barre d'info */}
      <div style={{
        padding: '8px 12px',
        background: isDark ? '#0f172a' : '#f8fafc',
        borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        fontSize: '12px',
        color: isDark ? '#64748b' : '#94a3b8',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>💡 Astuce: Collez directement du texte depuis Word avec ses images</span>
        <span>{isSourceMode ? 'Mode Code Source' : 'Mode Visuel'}</span>
      </div>
    </div>
  );
};

// ============== NAV ITEM AVEC TOOLTIP ==============
const NavItem = ({ item, isActive, isCollapsed, isDark, onClick, styles }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{ ...styles.navItem(isActive, isCollapsed), position: 'relative' }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <item.icon size={20} />
      {!isCollapsed && <span>{item.label}</span>}
      {isCollapsed && isHovered && (
        <div style={{
          position: 'fixed',
          left: '80px',
          padding: '10px 18px',
          background: `linear-gradient(135deg, ${colors.cameroonGreen} 0%, ${colors.teal} 100%)`,
          color: 'white',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: '600',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 20px rgba(0,122,51,0.4)',
          zIndex: 9999,
          animation: 'tooltipFadeIn 0.2s ease'
        }}>
          {item.label}
          <div style={{
            position: 'absolute',
            left: '-8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: `8px solid ${colors.cameroonGreen}`
          }} />
        </div>
      )}
    </div>
  );
};

// ============== PAGE DE CONNEXION ==============
const LoginPage = ({ onLogin, isDark, setIsDark }) => {
  const styles = createStyles(isDark);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success) {
        if (rememberMe) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        } else {
          sessionStorage.setItem('token', res.data.token);
          sessionStorage.setItem('user', JSON.stringify(res.data.user));
        }
        onLogin(res.data.user, res.data.token);
      } else {
        setError(res.message || 'Identifiants incorrects');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden', background: isDark ? colors.dark : '#f0f9ff' }}>
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes gradientMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        * { margin: 0; padding: 0; box-sizing: border-box; }
      `}</style>

      {/* Partie gauche - Branding */}
      <div style={{
        flex: 1,
        background: `linear-gradient(135deg, ${colors.cameroonGreen} 0%, ${colors.teal} 50%, ${colors.primary} 100%)`,
        backgroundSize: '200% 200%',
        animation: 'gradientMove 15s ease infinite',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '10%', left: '10%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', animation: 'float 6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '15%', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', animation: 'float 8s ease-in-out infinite 1s' }} />
        
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <div style={{
            width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 40px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', animation: 'pulse 4s ease-in-out infinite'
          }}>
            <img src="one-health.jpg" alt="One Health" style={{ width: '120px', height: '120px', objectFit: 'contain', borderRadius: '50%' }} onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: '800', color: 'white', marginBottom: '16px', textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            One Health Administration Panel
          </h1>
          <p style={{ fontSize: '19px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5, whiteSpace: 'nowrap' }}>
            Panneau d'administration du site web de la plateforme Une Seule Santé au Cameroun
          </p>
          <div style={{ display: 'flex', gap: '20px', marginTop: '50px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: FileText, label: 'Contenus' },
              { icon: Layout, label: 'Pages' },
              { icon: Palette, label: 'Thèmes' },
              { icon: Globe, label: 'OH E-Learning' },
              { icon: Activity, label: 'OHWR-Map' },
              { icon: Shield, label: 'COHRM-SYSTEM' }
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center', animation: `float ${5 + i}s ease-in-out infinite ${i * 0.3}s` }}>
                <div style={{ width: '55px', height: '55px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', backdropFilter: 'blur(10px)' }}>
                  <item.icon size={24} color="white" />
                </div>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: '600' }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Partie droite - Formulaire avec fond bleu et cercles */}
      <div style={{ width: '500px', background: '#87d5fb', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', position: 'relative', overflow: 'hidden' }}>
        {/* Cercles décoratifs */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', border: '40px solid rgba(255,255,255,0.2)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '400px', height: '400px', borderRadius: '50%', border: '30px solid rgba(255,255,255,0.15)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '350px', height: '350px', borderRadius: '50%', border: '35px solid rgba(255,255,255,0.2)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-150px', left: '-150px', width: '450px', height: '450px', borderRadius: '50%', border: '25px solid rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '500px', height: '500px', borderRadius: '50%', border: '15px solid rgba(255,255,255,0.1)', pointerEvents: 'none' }} />

        {/* Bouton dark mode */}
        <button onClick={() => setIsDark(!isDark)} style={{ position: 'absolute', top: '24px', right: '24px', width: '44px', height: '44px', borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e293b', zIndex: 10, transition: 'all 0.3s ease' }}>
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Contenu du formulaire */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px', color: '#1e293b' }}>Bienvenue ! 👋</h2>
            <p style={{ color: '#334155', fontSize: '15px' }}>Connectez-vous au panneau d'administration</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '14px 16px', marginBottom: '24px', color: '#dc2626', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', backdropFilter: 'blur(10px)' }}>
                <AlertCircle size={18} />{error}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#1e293b' }}><Mail size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', fontSize: '15px', color: '#1e293b', outline: 'none', transition: 'all 0.3s ease' }} placeholder="admin@onehealth.cm" required />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#1e293b' }}><Lock size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', fontSize: '15px', color: '#1e293b', outline: 'none', transition: 'all 0.3s ease' }} placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '4px' }}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#334155' }}>
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: colors.cameroonGreen, cursor: 'pointer' }} />
                Se souvenir de moi
              </label>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: '600', borderRadius: '12px', border: 'none', background: `linear-gradient(135deg, ${colors.cameroonGreen} 0%, ${colors.teal} 100%)`, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: loading ? 0.7 : 1, boxShadow: '0 10px 30px rgba(0,122,51,0.3)', transition: 'all 0.3s ease' }}>
              {loading ? <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <><Shield size={20} />Se connecter</>}
            </button>
          </form>

          <div style={{ marginTop: '40px', textAlign: 'center', color: '#334155', fontSize: '13px' }}>
            <p>© {new Date().getFullYear()} One Health Cameroon CMS</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============== DASHBOARD ==============
const Dashboard = ({ isDark, token }) => {
  const styles = createStyles(isDark);
  const [stats, setStats] = useState({ posts: { total: 0 }, users: { total: 0 }, categories: { total: 0 }, media: { total: 0 } });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [statsRes, postsRes] = await Promise.all([
        api.get('/dashboard/stats', token),
        api.get('/dashboard/recent-posts', token)
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (postsRes.success) setRecentPosts(postsRes.data);
      setLoading(false);
    };
    fetchData();
  }, [token]);

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={styles.mb32}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800' }}>Tableau de Bord</h1>
        <p style={styles.textMuted}>Vue d'ensemble de votre plateforme</p>
      </div>

      <div style={{ ...styles.grid4, marginBottom: '32px' }}>
        <StatCard icon={FileText} label="Articles" value={stats?.posts?.total || 0} change="+12%" color={colors.cameroonGreen} isDark={isDark} />
        <StatCard icon={Layout} label="Pages" value={stats?.pages?.total || 0} color={colors.primary} isDark={isDark} />
        <StatCard icon={FolderTree} label="Catégories" value={stats?.categories?.total || 0} color={colors.accent} isDark={isDark} />
        <StatCard icon={Image} label="Médias" value={stats?.media?.total || 0} color={colors.purple} isDark={isDark} />
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <h3 style={{ margin: '0 0 20px 0', fontWeight: '700' }}>Articles Récents</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentPosts.length > 0 ? recentPosts.slice(0, 5).map(post => (
              <div key={post.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '10px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontWeight: '600', fontSize: '14px' }}>{post.title}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                    {new Date(post.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span style={styles.badge(post.status === 'published' ? colors.success : colors.warning)}>
                  {post.status === 'published' ? 'Publié' : 'Brouillon'}
                </span>
              </div>
            )) : <p style={styles.textMuted}>Aucun article</p>}
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={{ margin: '0 0 20px 0', fontWeight: '700' }}>Accès Rapides</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { icon: Plus, label: 'Nouvel Article', color: colors.cameroonGreen },
              { icon: Layout, label: 'Nouvelle Page', color: colors.primary },
              { icon: Image, label: 'Upload Media', color: colors.purple },
              { icon: Palette, label: 'Personnaliser', color: colors.accent }
            ].map((item, i) => (
              <div key={i} style={{ padding: '20px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                <item.icon size={24} color={item.color} style={{ marginBottom: '8px' }} />
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============== GESTION DES ARTICLES (POSTS) ==============
const PostsPage = ({ isDark, token, hasPermission = () => true }) => {
  const styles = createStyles(isDark);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' ou 'editor'
  const [editingPost, setEditingPost] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [perPage, setPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const categoryDropdownRef = React.useRef(null);

  const fetchPosts = async (status = null) => {
    const params = status && status !== 'all' ? `?status=${status}` : '';
    const res = await api.get(`/posts${params}`, token);
    if (res.success) setPosts(res.data);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const res = await api.get('/categories', token);
    if (res.success) setCategories(res.data);
  };

  useEffect(() => { fetchPosts(statusFilter); fetchCategories(); }, [token, statusFilter]);

  // Fermer le dropdown catégorie quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrer les catégories pour la recherche
  const filteredCategories = categories.filter(cat => {
    const name = (cat.name_fr || cat.name || '').toLowerCase();
    return name.includes(categorySearch.toLowerCase());
  });

  // Obtenir le nom de la catégorie sélectionnée
  const selectedCategoryName = categoryFilter === 'all'
    ? 'Toutes les catégories'
    : (categories.find(c => c.id == categoryFilter)?.name_fr || categories.find(c => c.id == categoryFilter)?.name || 'Catégorie');

  const handleSave = async (postData) => {
    // Validation côté client
    if (!postData.title_fr && !postData.title_en) {
      setToast({ message: 'Veuillez saisir un titre (français ou anglais)', type: 'error' });
      return;
    }

    if (!postData.content_fr && !postData.content_en) {
      setToast({ message: 'Veuillez saisir du contenu (français ou anglais)', type: 'error' });
      return;
    }

    try {
      const res = editingPost
        ? await api.put(`/posts/${editingPost.id}`, postData, token)
        : await api.post('/posts', postData, token);

      if (res.success) {
        setToast({ message: editingPost ? 'Article mis à jour avec succès' : 'Article créé avec succès', type: 'success' });
        setView('list');
        setEditingPost(null);
        fetchPosts();
      } else {
        // Messages d'erreur explicites
        let errorMessage = 'Une erreur est survenue';
        if (res.message) {
          errorMessage = res.message;
        } else if (res.errors && res.errors.length > 0) {
          errorMessage = res.errors.map(e => e.message || e.msg).join(', ');
        }
        setToast({ message: errorMessage, type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Erreur de connexion au serveur', type: 'error' });
    }
  };

  const handleDelete = (id) => {
    const post = posts.find(p => p.id === id);
    setConfirmDialog({
      title: 'Mettre à la corbeille ?',
      message: `L'article "${post?.title_fr || post?.title || 'cet article'}" sera déplacé dans la corbeille. Vous pourrez le restaurer ultérieurement.`,
      type: 'warning',
      confirmText: 'Mettre à la corbeille',
      onConfirm: async () => {
        const res = await api.delete(`/posts/${id}`, token);
        if (res.success) {
          setToast({ message: 'Article déplacé dans la corbeille', type: 'success' });
          fetchPosts(statusFilter);
        } else {
          setToast({ message: res.message || 'Erreur lors de la suppression', type: 'error' });
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleRestore = (id) => {
    const post = posts.find(p => p.id === id);
    setConfirmDialog({
      title: 'Restaurer cet article ?',
      message: `L'article "${post?.title_fr || post?.title || 'cet article'}" sera restauré en tant que brouillon.`,
      type: 'success',
      confirmText: 'Restaurer',
      onConfirm: async () => {
        const res = await api.post(`/posts/${id}/restore`, {}, token);
        if (res.success) {
          setToast({ message: 'Article restauré', type: 'success' });
          fetchPosts(statusFilter);
        } else {
          setToast({ message: res.message || 'Erreur lors de la restauration', type: 'error' });
        }
        setConfirmDialog(null);
      }
    });
  };

  const handlePermanentDelete = (id) => {
    const post = posts.find(p => p.id === id);
    setConfirmDialog({
      title: 'Supprimer définitivement ?',
      message: `L'article "${post?.title_fr || post?.title || 'cet article'}" sera supprimé définitivement. Cette action est irréversible.`,
      type: 'danger',
      confirmText: 'Supprimer définitivement',
      onConfirm: async () => {
        const res = await api.delete(`/posts/${id}/permanent`, token);
        if (res.success) {
          setToast({ message: 'Article supprimé définitivement', type: 'success' });
          fetchPosts(statusFilter);
        } else {
          setToast({ message: res.message || 'Erreur lors de la suppression', type: 'error' });
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleEmptyTrash = () => {
    const trashCount = posts.filter(p => p.status === 'trash').length;
    setConfirmDialog({
      title: 'Vider la corbeille ?',
      message: `${trashCount} article(s) seront supprimés définitivement. Cette action est irréversible.`,
      type: 'danger',
      confirmText: 'Vider la corbeille',
      onConfirm: async () => {
        const res = await api.delete('/posts/trash/empty', token);
        if (res.success) {
          setToast({ message: res.message || 'Corbeille vidée', type: 'success' });
          fetchPosts(statusFilter);
        } else {
          setToast({ message: res.message || 'Erreur', type: 'error' });
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleToggleStatus = (post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    const isPublishing = newStatus === 'published';

    setConfirmDialog({
      title: isPublishing ? 'Publier cet article ?' : 'Dépublier cet article ?',
      message: isPublishing
        ? `L'article "${post.title_fr || post.title}" sera visible par tous les visiteurs.`
        : `L'article "${post.title_fr || post.title}" ne sera plus visible par les visiteurs.`,
      type: isPublishing ? 'success' : 'warning',
      confirmText: isPublishing ? 'Publier' : 'Dépublier',
      onConfirm: async () => {
        try {
          const res = await api.put(`/posts/${post.id}`, { status: newStatus }, token);
          if (res.success) {
            setToast({
              message: isPublishing ? 'Article publié avec succès' : 'Article dépublié',
              type: 'success'
            });
            fetchPosts();
          } else {
            setToast({ message: res.message || 'Erreur lors du changement de statut', type: 'error' });
          }
        } catch (error) {
          setToast({ message: 'Erreur de connexion au serveur', type: 'error' });
        }
        setConfirmDialog(null);
      }
    });
  };

  const openEditor = (post = null) => {
    setEditingPost(post);
    setView('editor');
  };

  const closeEditor = () => {
    setEditingPost(null);
    setView('list');
  };

  const allFilteredPosts = posts.filter(post => {
    const titleFr = (post.title_fr || post.title || '').toLowerCase();
    const titleEn = (post.title_en || '').toLowerCase();
    const search = searchQuery.toLowerCase();
    const matchesSearch = titleFr.includes(search) || titleEn.includes(search);
    const matchesCategory = categoryFilter === 'all' || post.category_id == categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calcul de la pagination
  const totalFiltered = allFilteredPosts.length;
  const itemsPerPage = perPage === 'all' ? totalFiltered : perPage;
  const totalPages = perPage === 'all' ? 1 : Math.ceil(totalFiltered / perPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalFiltered);
  const filteredPosts = perPage === 'all' ? allFilteredPosts : allFilteredPosts.slice(startIndex, endIndex);

  // Reset page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, statusFilter, perPage]);

  // Compteurs pour les badges
  const trashCount = statusFilter === 'trash' ? posts.length : 0;

  if (loading) return <Spinner />;

  // Vue Éditeur pleine page
  if (view === 'editor') {
    return (
      <div>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        {confirmDialog && (
          <ConfirmDialog
            isOpen={true}
            onClose={() => setConfirmDialog(null)}
            onConfirm={confirmDialog.onConfirm}
            title={confirmDialog.title}
            message={confirmDialog.message}
            type={confirmDialog.type}
            confirmText={confirmDialog.confirmText}
            isDark={isDark}
          />
        )}

        {/* Header avec bouton retour */}
        <div style={{ ...styles.flexBetween, marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: '800' }}>
              {editingPost ? 'Modifier l\'article' : 'Nouvel article'}
            </h1>
            <p style={styles.textMuted}>
              {editingPost ? `Édition de "${editingPost.title_fr || editingPost.title}"` : 'Créer un nouveau contenu'}
            </p>
          </div>
          <button
            onClick={closeEditor}
            style={{
              ...styles.btnSecondary,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px'
            }}
          >
            <ChevronLeft size={20} /> Retour
          </button>
        </div>

        {/* Éditeur d'article */}
        <div style={{ ...styles.card, padding: '24px' }}>
          <PostEditor
            post={editingPost}
            categories={categories}
            onSave={handleSave}
            onCancel={closeEditor}
            isDark={isDark}
            token={token}
          />
        </div>
      </div>
    );
  }

  // Vue Liste des articles
  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setConfirmDialog(null)}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          confirmText={confirmDialog.confirmText}
          isDark={isDark}
        />
      )}

      <div style={styles.flexBetween}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800' }}>Articles</h1>
          <p style={styles.textMuted}>{posts.length} articles au total</p>
        </div>
        <button style={styles.btnPrimary} onClick={() => openEditor()}>
          <Plus size={20} /> Nouvel Article
        </button>
      </div>

      <div style={{ ...styles.card, marginTop: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 2, minWidth: '200px' }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#64748b' : '#94a3b8' }} />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ ...styles.input, paddingLeft: '48px', width: '100%' }}
            />
          </div>

          {/* Dropdown catégorie avec recherche */}
          <div ref={categoryDropdownRef} style={{ position: 'relative', flex: 1.5, minWidth: '220px' }}>
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              style={{
                ...styles.select,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                📁 {selectedCategoryName}
              </span>
              <ChevronDown size={18} style={{ flexShrink: 0, transform: showCategoryDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {showCategoryDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                background: isDark ? '#1e293b' : 'white',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                zIndex: 100,
                maxHeight: '300px',
                overflow: 'hidden'
              }}>
                {/* Recherche catégorie */}
                <div style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                  <input
                    type="text"
                    placeholder="🔍 Rechercher..."
                    value={categorySearch}
                    onChange={e => setCategorySearch(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    style={{ ...styles.input, width: '100%', padding: '10px 12px', fontSize: '14px' }}
                    autoFocus
                  />
                </div>

                {/* Liste des catégories */}
                <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                  <div
                    onClick={() => { setCategoryFilter('all'); setShowCategoryDropdown(false); setCategorySearch(''); }}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: categoryFilter === 'all' ? (isDark ? '#334155' : '#f1f5f9') : 'transparent',
                      borderLeft: categoryFilter === 'all' ? `3px solid ${colors.cameroonGreen}` : '3px solid transparent'
                    }}
                  >
                    📁 Toutes les catégories
                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                      {categories.length}
                    </span>
                  </div>
                  {filteredCategories.map(cat => {
                    const isChild = cat.parent_id !== null;
                    const isSelected = categoryFilter == cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => { setCategoryFilter(cat.id); setShowCategoryDropdown(false); setCategorySearch(''); }}
                        style={{
                          padding: '12px 16px',
                          paddingLeft: isChild ? '32px' : '16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: isSelected ? (isDark ? '#334155' : '#f1f5f9') : 'transparent',
                          borderLeft: isSelected ? `3px solid ${colors.cameroonGreen}` : '3px solid transparent',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = isDark ? '#334155' : '#f8fafc'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {isChild ? '└─ 📂' : '📁'} {cat.name_fr || cat.name}
                        <span style={{ marginLeft: 'auto', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                          {cat.post_count || 0}
                        </span>
                      </div>
                    );
                  })}
                  {filteredCategories.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: isDark ? '#64748b' : '#94a3b8' }}>
                      Aucune catégorie trouvée
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...styles.select, width: '165px', flexShrink: 0 }}>
            <option value="all">📋 Tous</option>
            <option value="published">🟢 Publiés</option>
            <option value="draft">📝 Brouillons</option>
            <option value="scheduled">📅 Programmés</option>
            <option value="trash">🗑️ Corbeille</option>
          </select>

          {/* Sélecteur du nombre d'articles par page */}
          <select
            value={perPage}
            onChange={e => setPerPage(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            style={{ ...styles.select, width: '90px', flexShrink: 0 }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
            <option value="all">Tout</option>
          </select>

          {statusFilter === 'trash' && posts.length > 0 && (
            <button
              onClick={handleEmptyTrash}
              style={{
                ...styles.btnSecondary,
                color: colors.error,
                borderColor: colors.error,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Trash2 size={18} /> Vider la corbeille
            </button>
          )}
        </div>

        {/* Info sur le nombre d'articles affichés */}
        <div style={{ marginTop: '12px', fontSize: '14px', color: isDark ? '#64748b' : '#94a3b8' }}>
          Affichage de {totalFiltered > 0 ? startIndex + 1 : 0} à {endIndex} sur {totalFiltered} article(s)
          {categoryFilter !== 'all' && ` dans "${selectedCategoryName}"`}
        </div>
      </div>

      {statusFilter === 'trash' && (
        <div style={{
          background: isDark ? '#1e293b' : '#fef3c7',
          border: `1px solid ${isDark ? '#334155' : '#fcd34d'}`,
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertCircle size={24} color={colors.warning} />
          <div>
            <p style={{ margin: 0, fontWeight: '600', color: isDark ? '#fcd34d' : '#92400e' }}>
              Vous consultez la corbeille
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: isDark ? '#94a3b8' : '#a16207' }}>
              Les articles dans la corbeille seront automatiquement supprimés après 30 jours. Vous pouvez les restaurer ou les supprimer définitivement.
            </p>
          </div>
        </div>
      )}

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Article</th>
              <th style={styles.th}>Catégorie</th>
              <th style={styles.th}>Auteur</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map(post => (
              <tr key={post.id} style={styles.tr}>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {post.featured_image && (
                      <img src={`http://localhost:5000${post.featured_image}`} alt="" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                    )}
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>{post.title_fr || post.title}</p>
                      {post.title_en && <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>{post.title_en}</p>}
                      <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>{post.slug}</p>
                    </div>
                  </div>
                </td>
                <td style={styles.td}>{post.category_name || '-'}</td>
                <td style={styles.td}>{post.author || 'Admin'}</td>
                <td style={styles.td}>
                  <span style={styles.badge(
                    post.status === 'published' ? colors.success :
                    post.status === 'scheduled' ? colors.primary :
                    post.status === 'trash' ? colors.error :
                    colors.warning
                  )}>
                    {post.status === 'published' ? 'Publié' :
                     post.status === 'scheduled' ? 'Programmé' :
                     post.status === 'trash' ? 'Corbeille' :
                     'Brouillon'}
                  </span>
                </td>
                <td style={styles.td}>{new Date(post.created_at).toLocaleDateString('fr-FR')}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {post.status === 'trash' ? (
                      <>
                        {/* Actions pour les articles dans la corbeille */}
                        <button
                          style={{ ...styles.btnIcon, color: colors.success }}
                          onClick={() => handleRestore(post.id)}
                          title="Restaurer"
                        >
                          <RotateCcw size={18} />
                        </button>
                        <button
                          style={{ ...styles.btnIcon, color: colors.error }}
                          onClick={() => handlePermanentDelete(post.id)}
                          title="Supprimer définitivement"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Bouton Publier/Dépublier - Icône reflète l'état actuel */}
                        {post.status === 'published' ? (
                          <button
                            style={{
                              ...styles.btnIcon,
                              color: colors.success,
                              position: 'relative'
                            }}
                            onClick={() => handleToggleStatus(post)}
                            title="Publié - Cliquer pour dépublier"
                          >
                            <Eye size={18} />
                          </button>
                        ) : (
                          <button
                            style={{
                              ...styles.btnIcon,
                              color: colors.warning,
                              position: 'relative'
                            }}
                            onClick={() => handleToggleStatus(post)}
                            title="Non publié - Cliquer pour publier"
                          >
                            <EyeOff size={18} />
                          </button>
                        )}
                        {/* Bouton Modifier */}
                        <button style={styles.btnIcon} onClick={() => openEditor(post)} title="Modifier">
                          <Edit size={18} />
                        </button>
                        {/* Bouton Supprimer (mettre à la corbeille) */}
                        <button style={{ ...styles.btnIcon, color: colors.error }} onClick={() => handleDelete(post.id)} title="Mettre à la corbeille">
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPosts.length === 0 && <p style={{ textAlign: 'center', padding: '40px', ...styles.textMuted }}>Aucun article trouvé</p>}

        {/* Pagination moderne */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            {/* Info pagination */}
            <div style={{ fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b' }}>
              Page <strong>{currentPage}</strong> sur <strong>{totalPages}</strong>
              <span style={{ marginLeft: '8px' }}>({totalFiltered} articles)</span>
            </div>

            {/* Contrôles de pagination */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {/* Première page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  background: currentPage === 1 ? (isDark ? '#1e293b' : '#f1f5f9') : (isDark ? '#0f172a' : 'white'),
                  color: currentPage === 1 ? (isDark ? '#475569' : '#94a3b8') : (isDark ? '#e2e8f0' : '#1e293b'),
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                title="Première page"
              >
                <ChevronLeft size={16} /><ChevronLeft size={16} style={{ marginLeft: '-12px' }} />
              </button>

              {/* Page précédente */}
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  background: currentPage === 1 ? (isDark ? '#1e293b' : '#f1f5f9') : (isDark ? '#0f172a' : 'white'),
                  color: currentPage === 1 ? (isDark ? '#475569' : '#94a3b8') : (isDark ? '#e2e8f0' : '#1e293b'),
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                <ChevronLeft size={16} /> Préc.
              </button>

              {/* Numéros de pages */}
              <div style={{ display: 'flex', gap: '4px', margin: '0 8px' }}>
                {(() => {
                  const pages = [];
                  const maxVisible = 5;
                  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                  let end = Math.min(totalPages, start + maxVisible - 1);
                  if (end - start + 1 < maxVisible) {
                    start = Math.max(1, end - maxVisible + 1);
                  }

                  if (start > 1) {
                    pages.push(
                      <button key={1} onClick={() => setCurrentPage(1)} style={{
                        padding: '8px 14px', borderRadius: '8px', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        background: isDark ? '#0f172a' : 'white', color: isDark ? '#e2e8f0' : '#1e293b',
                        cursor: 'pointer', fontSize: '14px', fontWeight: '500', minWidth: '40px'
                      }}>1</button>
                    );
                    if (start > 2) {
                      pages.push(<span key="dots1" style={{ padding: '8px 4px', color: isDark ? '#64748b' : '#94a3b8' }}>...</span>);
                    }
                  }

                  for (let i = start; i <= end; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: currentPage === i ? 'none' : `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                          background: currentPage === i
                            ? `linear-gradient(135deg, ${colors.cameroonGreen} 0%, ${colors.teal} 100%)`
                            : (isDark ? '#0f172a' : 'white'),
                          color: currentPage === i ? 'white' : (isDark ? '#e2e8f0' : '#1e293b'),
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: currentPage === i ? '700' : '500',
                          minWidth: '40px',
                          transition: 'all 0.2s',
                          boxShadow: currentPage === i ? '0 4px 12px rgba(0, 122, 51, 0.3)' : 'none'
                        }}
                      >
                        {i}
                      </button>
                    );
                  }

                  if (end < totalPages) {
                    if (end < totalPages - 1) {
                      pages.push(<span key="dots2" style={{ padding: '8px 4px', color: isDark ? '#64748b' : '#94a3b8' }}>...</span>);
                    }
                    pages.push(
                      <button key={totalPages} onClick={() => setCurrentPage(totalPages)} style={{
                        padding: '8px 14px', borderRadius: '8px', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        background: isDark ? '#0f172a' : 'white', color: isDark ? '#e2e8f0' : '#1e293b',
                        cursor: 'pointer', fontSize: '14px', fontWeight: '500', minWidth: '40px'
                      }}>{totalPages}</button>
                    );
                  }

                  return pages;
                })()}
              </div>

              {/* Page suivante */}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  background: currentPage === totalPages ? (isDark ? '#1e293b' : '#f1f5f9') : (isDark ? '#0f172a' : 'white'),
                  color: currentPage === totalPages ? (isDark ? '#475569' : '#94a3b8') : (isDark ? '#e2e8f0' : '#1e293b'),
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                Suiv. <ChevronRight size={16} />
              </button>

              {/* Dernière page */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  background: currentPage === totalPages ? (isDark ? '#1e293b' : '#f1f5f9') : (isDark ? '#0f172a' : 'white'),
                  color: currentPage === totalPages ? (isDark ? '#475569' : '#94a3b8') : (isDark ? '#e2e8f0' : '#1e293b'),
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                title="Dernière page"
              >
                <ChevronRight size={16} /><ChevronRight size={16} style={{ marginLeft: '-12px' }} />
              </button>
            </div>

            {/* Saut direct à une page */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b' }}>
              Aller à
              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={e => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    setCurrentPage(page);
                  }
                }}
                style={{
                  ...styles.input,
                  width: '70px',
                  padding: '8px 12px',
                  textAlign: 'center',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Post Editor Component avec support multilingue FR/EN
const PostEditor = ({ post, categories, onSave, onCancel, isDark, token }) => {
  const styles = createStyles(isDark);
  const [activeTab, setActiveTab] = useState('content');
  const [contentLang, setContentLang] = useState('fr'); // Langue pour contenu: 'fr' ou 'en'
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    // Champs multilingues
    title_fr: post?.title_fr || post?.title || '',
    title_en: post?.title_en || '',
    content_fr: post?.content_fr || post?.content || '',
    content_en: post?.content_en || '',
    excerpt_fr: post?.excerpt_fr || post?.excerpt || '',
    excerpt_en: post?.excerpt_en || '',
    meta_title_fr: post?.meta_title_fr || post?.meta_title || '',
    meta_title_en: post?.meta_title_en || '',
    meta_description_fr: post?.meta_description_fr || post?.meta_description || '',
    meta_description_en: post?.meta_description_en || '',
    // Champs communs
    slug: post?.slug || '',
    category_id: post?.category_id || '',
    status: post?.status || 'draft',
    featured_image: post?.featured_image || '',
    publish_at: post?.publish_at || '',
    author_id: post?.author_id || '',
    created_at: post?.created_at || '',
    published_at: post?.published_at || '',
    tags: post?.tags ? (Array.isArray(post.tags) ? post.tags : post.tags.split(',')) : [],
    meta_keywords: post?.meta_keywords || '',
    template: post?.template || 'default',
    allow_comments: post?.allow_comments ?? true,
    featured: post?.featured ?? false
  });

  // Fetch users for author dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users?limit=100', token);
        if (res.success) setUsers(res.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [token]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Générer le slug à partir du titre français
    if (field === 'title_fr' && !post) {
      const slug = value.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const tabs = [
    { id: 'content', label: 'Contenu', icon: FileText },
    { id: 'media', label: 'Image', icon: ImageIcon },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'settings', label: 'Options', icon: Settings }
  ];

  // Boutons de sélection de langue
  const LanguageTabs = () => (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
      <button
        onClick={() => setContentLang('fr')}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: contentLang === 'fr' ? colors.cameroonGreen : (isDark ? '#374151' : '#e5e7eb'),
          color: contentLang === 'fr' ? 'white' : (isDark ? '#e5e7eb' : '#374151')
        }}
      >
        <span style={{ fontSize: '16px' }}>🇫🇷</span> Français
      </button>
      <button
        onClick={() => setContentLang('en')}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: contentLang === 'en' ? colors.cameroonGreen : (isDark ? '#374151' : '#e5e7eb'),
          color: contentLang === 'en' ? 'white' : (isDark ? '#e5e7eb' : '#374151')
        }}
      >
        <span style={{ fontSize: '16px' }}>🇬🇧</span> English
      </button>
    </div>
  );

  return (
    <div>
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} isDark={isDark} />

      {activeTab === 'content' && (
        <div>
          <LanguageTabs />

          <div style={styles.grid2}>
            <div style={styles.mb16}>
              <label style={styles.label}>
                {contentLang === 'fr' ? 'Titre (Français)' : 'Title (English)'}
                <span style={{ color: colors.error, marginLeft: '4px' }}>*</span>
              </label>
              <input
                value={contentLang === 'fr' ? formData.title_fr : formData.title_en}
                onChange={e => handleChange(contentLang === 'fr' ? 'title_fr' : 'title_en', e.target.value)}
                style={{
                  ...styles.input,
                  borderColor: (!formData.title_fr && !formData.title_en) ? colors.error : undefined
                }}
                placeholder={contentLang === 'fr' ? "Titre de l'article (requis)" : "Article title (required)"}
              />
              {(!formData.title_fr && !formData.title_en) && (
                <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                  Au moins un titre (FR ou EN) est requis
                </p>
              )}
            </div>
            <div style={styles.mb16}>
              <label style={styles.label}>Slug (URL)</label>
              <input value={formData.slug} onChange={e => handleChange('slug', e.target.value)} style={styles.input} placeholder="url-de-l-article" />
            </div>
          </div>

          <div style={styles.mb16}>
            <label style={styles.label}>
              {contentLang === 'fr' ? 'Extrait (Français)' : 'Excerpt (English)'}
            </label>
            <textarea
              value={contentLang === 'fr' ? formData.excerpt_fr : formData.excerpt_en}
              onChange={e => handleChange(contentLang === 'fr' ? 'excerpt_fr' : 'excerpt_en', e.target.value)}
              style={styles.textarea}
              placeholder={contentLang === 'fr' ? "Court résumé..." : "Short summary..."}
            />
          </div>

          <div style={styles.mb16}>
            <label style={styles.label}>
              {contentLang === 'fr' ? 'Contenu (Français)' : 'Content (English)'}
              <span style={{ color: colors.error, marginLeft: '4px' }}>*</span>
            </label>
            <RichEditor
              value={contentLang === 'fr' ? formData.content_fr : formData.content_en}
              onChange={v => handleChange(contentLang === 'fr' ? 'content_fr' : 'content_en', v)}
              isDark={isDark}
              token={token}
            />
            {(!formData.content_fr && !formData.content_en) && (
              <p style={{ color: colors.error, fontSize: '12px', marginTop: '4px' }}>
                Au moins un contenu (FR ou EN) est requis
              </p>
            )}
          </div>

          <div style={styles.mb16}>
            <label style={styles.label}>Tags</label>
            <TagsInput value={formData.tags} onChange={v => handleChange('tags', v)} isDark={isDark} />
          </div>
        </div>
      )}

      {activeTab === 'media' && (
        <div>
          <label style={styles.label}>Image de mise en avant</label>
          <ImagePicker value={formData.featured_image} onChange={v => handleChange('featured_image', v)} isDark={isDark} token={token} />
        </div>
      )}

      {activeTab === 'seo' && (
        <div>
          <LanguageTabs />

          <div style={styles.mb16}>
            <label style={styles.label}>
              {contentLang === 'fr' ? 'Meta Titre (Français)' : 'Meta Title (English)'}
            </label>
            <input
              value={contentLang === 'fr' ? formData.meta_title_fr : formData.meta_title_en}
              onChange={e => handleChange(contentLang === 'fr' ? 'meta_title_fr' : 'meta_title_en', e.target.value)}
              style={styles.input}
              placeholder={contentLang === 'fr' ? "Titre pour les moteurs de recherche" : "Title for search engines"}
            />
          </div>
          <div style={styles.mb16}>
            <label style={styles.label}>
              {contentLang === 'fr' ? 'Meta Description (Français)' : 'Meta Description (English)'}
            </label>
            <textarea
              value={contentLang === 'fr' ? formData.meta_description_fr : formData.meta_description_en}
              onChange={e => handleChange(contentLang === 'fr' ? 'meta_description_fr' : 'meta_description_en', e.target.value)}
              style={{ ...styles.textarea, minHeight: '100px' }}
              placeholder={contentLang === 'fr' ? "Description pour les moteurs de recherche" : "Description for search engines"}
            />
          </div>
          <div style={styles.mb16}>
            <label style={styles.label}>Mots-clés / Keywords</label>
            <input value={formData.meta_keywords} onChange={e => handleChange('meta_keywords', e.target.value)} style={styles.input} placeholder="mot1, mot2, mot3" />
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={styles.grid2}>
          <div>
            <div style={styles.mb16}>
              <label style={styles.label}>Catégorie</label>
              <select value={formData.category_id} onChange={e => handleChange('category_id', e.target.value)} style={{ ...styles.select, width: '100%' }}>
                <option value="">Sélectionner</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name_fr || cat.name}</option>)}
              </select>
            </div>
            <div style={styles.mb16}>
              <label style={styles.label}>Auteur</label>
              <select value={formData.author_id} onChange={e => handleChange('author_id', e.target.value)} style={{ ...styles.select, width: '100%' }}>
                <option value="">Sélectionner un auteur</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.username}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.mb16}>
              <label style={styles.label}>Statut</label>
              <select value={formData.status} onChange={e => handleChange('status', e.target.value)} style={{ ...styles.select, width: '100%' }}>
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="scheduled">Programmé</option>
              </select>
            </div>
            {formData.status === 'scheduled' && (
              <div style={styles.mb16}>
                <label style={styles.label}>Programmer pour</label>
                <input type="datetime-local" value={formData.publish_at} onChange={e => handleChange('publish_at', e.target.value)} style={styles.input} />
              </div>
            )}
          </div>
          <div>
            <div style={styles.mb16}>
              <label style={styles.label}>Date de publication</label>
              <input
                type="datetime-local"
                value={formData.published_at ? formData.published_at.slice(0, 16) : ''}
                onChange={e => handleChange('published_at', e.target.value)}
                style={styles.input}
              />
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>
                Laisser vide pour utiliser la date actuelle lors de la publication
              </p>
            </div>
            {post && formData.created_at && (
              <div style={styles.mb16}>
                <label style={styles.label}>Date de création</label>
                <input
                  type="text"
                  value={new Date(formData.created_at).toLocaleString('fr-FR')}
                  style={{ ...styles.input, background: isDark ? '#1e293b' : '#f1f5f9', cursor: 'not-allowed' }}
                  disabled
                />
              </div>
            )}
            <div style={styles.mb16}>
              <label style={styles.label}>Template</label>
              <select value={formData.template} onChange={e => handleChange('template', e.target.value)} style={{ ...styles.select, width: '100%' }}>
                <option value="default">Par défaut</option>
                <option value="full-width">Pleine largeur</option>
                <option value="sidebar-left">Sidebar gauche</option>
                <option value="sidebar-right">Sidebar droite</option>
              </select>
            </div>
            <div style={styles.mb16}>
              <label style={{ ...styles.flex, cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.allow_comments} onChange={e => handleChange('allow_comments', e.target.checked)} style={{ width: '20px', height: '20px', accentColor: colors.cameroonGreen }} />
                <span style={{ marginLeft: '12px' }}>Autoriser les commentaires</span>
              </label>
            </div>
            <div style={styles.mb16}>
              <label style={{ ...styles.flex, cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.featured} onChange={e => handleChange('featured', e.target.checked)} style={{ width: '20px', height: '20px', accentColor: colors.cameroonGreen }} />
                <span style={{ marginLeft: '12px' }}>Article mis en avant</span>
              </label>
            </div>
          </div>
        </div>
      )}

      <div style={{ ...styles.divider }} />

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          style={{
            ...styles.btnSecondary,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onClick={onCancel}
        >
          <X size={18} /> Annuler
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={styles.btnSecondary} onClick={() => onSave({
            ...formData,
            status: 'draft',
            tags: Array.isArray(formData.tags) ? formData.tags.join(',') : formData.tags
          })}>
            <Save size={18} /> Brouillon
          </button>
          <button style={styles.btnPrimary} onClick={() => onSave({
            ...formData,
            tags: Array.isArray(formData.tags) ? formData.tags.join(',') : formData.tags
          })}>
            <Check size={18} /> {formData.status === 'published' ? 'Publier' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Suite dans la partie 2...

// ============== GESTION DES PAGES (PAGE BUILDER) ==============
const PagesPage = ({ isDark, token, hasPermission = () => true }) => {
  const styles = createStyles(isDark);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const fetchPages = async () => {
    const res = await api.get('/pages', token);
    if (res.success) setPages(res.data);
    else setPages([]);
    setLoading(false);
  };

  useEffect(() => { fetchPages(); }, [token]);

  const handleSave = async (pageData) => {
    const res = editingPage
      ? await api.put(`/pages/${editingPage.id}`, pageData, token)
      : await api.post('/pages', pageData, token);

    if (res.success) {
      setToast({ message: editingPage ? 'Page mise à jour' : 'Page créée', type: 'success' });
      setShowEditor(false);
      setEditingPage(null);
      fetchPages();
    } else {
      setToast({ message: res.message || 'Erreur', type: 'error' });
    }
  };

  const handleDelete = (id) => {
    const page = pages.find(p => p.id === id);
    setConfirmDialog({
      title: 'Supprimer cette page ?',
      message: `Êtes-vous sûr de vouloir supprimer "${page?.title || 'cette page'}" ? Cette action est irréversible.`,
      type: 'danger',
      confirmText: 'Supprimer',
      onConfirm: async () => {
        const res = await api.delete(`/pages/${id}`, token);
        if (res.success) {
          setToast({ message: 'Page supprimée', type: 'success' });
          fetchPages();
        } else {
          setToast({ message: res.message || 'Erreur lors de la suppression', type: 'error' });
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleDuplicate = async (id) => {
    const res = await api.put(`/pages/${id}/duplicate`, {}, token);
    if (res.success) {
      setToast({ message: 'Page dupliquée', type: 'success' });
      fetchPages();
    } else {
      setToast({ message: res.message || 'Erreur', type: 'error' });
    }
  };

  // Filtrer les pages
  const filteredPages = pages.filter(page => {
    const matchesSearch = (page.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (page.slug || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Compter par statut
  const countByStatus = {
    all: pages.length,
    published: pages.filter(p => p.status === 'published').length,
    draft: pages.filter(p => p.status === 'draft').length
  };

  // Templates avec icônes
  const templateIcons = {
    default: '📄',
    'full-width': '📐',
    landing: '🚀',
    sidebar: '📑'
  };

  if (loading) return <Spinner />;

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setConfirmDialog(null)}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          confirmText={confirmDialog.confirmText}
          isDark={isDark}
        />
      )}

      {/* Header */}
      <div style={styles.flexBetween}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800' }}>
            📄 Pages
          </h1>
          <p style={styles.textMuted}>Créez et gérez vos pages avec le Page Builder visuel</p>
        </div>
        <button style={{ ...styles.btnPrimary, padding: '14px 28px', fontSize: '15px' }} onClick={() => { setEditingPage(null); setShowEditor(true); }}>
          <Plus size={20} /> Nouvelle Page
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '24px' }}>
        {[
          { label: 'Total Pages', count: countByStatus.all, icon: '📄', color: colors.primary },
          { label: 'Publiées', count: countByStatus.published, icon: '🟢', color: colors.success },
          { label: 'Brouillons', count: countByStatus.draft, icon: '📝', color: colors.warning }
        ].map((stat, idx) => (
          <div key={idx} style={{
            ...styles.card,
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            border: statusFilter === (idx === 0 ? 'all' : idx === 1 ? 'published' : 'draft') ? `2px solid ${stat.color}` : `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            transition: 'all 0.2s ease'
          }} onClick={() => setStatusFilter(idx === 0 ? 'all' : idx === 1 ? 'published' : 'draft')}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: `${stat.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: stat.color }}>{stat.count}</p>
              <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ ...styles.card, marginTop: '24px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Search */}
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#64748b' : '#94a3b8' }} />
          <input
            type="text"
            placeholder="🔍 Rechercher une page..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ ...styles.input, paddingLeft: '44px', margin: 0, width: '100%' }}
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ ...styles.select, width: '180px' }}
        >
          <option value="all">📋 Tous les statuts ({countByStatus.all})</option>
          <option value="published">🟢 Publiées ({countByStatus.published})</option>
          <option value="draft">📝 Brouillons ({countByStatus.draft})</option>
        </select>

        {/* View Mode */}
        <div style={{ display: 'flex', background: isDark ? '#0f172a' : '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              ...styles.btnIcon,
              background: viewMode === 'grid' ? (isDark ? '#334155' : '#ffffff') : 'transparent',
              borderRadius: '6px'
            }}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              ...styles.btnIcon,
              background: viewMode === 'list' ? (isDark ? '#334155' : '#ffffff') : 'transparent',
              borderRadius: '6px'
            }}
          >
            <Layers size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ ...styles.card, marginTop: '16px' }}>
        {filteredPages.length > 0 ? (
          viewMode === 'grid' ? (
            // Grid View
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {filteredPages.map(page => {
                const sectionsCount = page.sections ? JSON.parse(page.sections).length : 0;
                return (
                  <div key={page.id} style={{
                    background: isDark ? '#0f172a' : '#ffffff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onClick={() => { setEditingPage(page); setShowEditor(true); }}
                  >
                    {/* Preview Area */}
                    <div style={{
                      height: '160px',
                      background: `linear-gradient(135deg, ${isDark ? '#1e293b' : '#f8fafc'} 0%, ${isDark ? '#0f172a' : '#e2e8f0'} 100%)`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <span style={{ fontSize: '48px', marginBottom: '8px' }}>{templateIcons[page.template] || '📄'}</span>
                      <span style={{
                        fontSize: '11px',
                        padding: '4px 10px',
                        background: isDark ? '#334155' : '#e2e8f0',
                        borderRadius: '20px',
                        textTransform: 'capitalize'
                      }}>
                        {page.template || 'default'}
                      </span>
                      {/* Status Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px'
                      }}>
                        <span style={{
                          ...styles.badge(page.status === 'published' ? colors.success : colors.warning),
                          fontSize: '11px'
                        }}>
                          {page.status === 'published' ? '🟢 Publié' : '📝 Brouillon'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '20px' }}>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', fontWeight: '700' }}>
                        {page.title || 'Sans titre'}
                      </h3>
                      <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: colors.primary }}>
                        /{page.slug}
                      </p>

                      {/* Meta Info */}
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Layers size={14} /> {sectionsCount} blocs
                        </span>
                        <span style={{ fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} /> {new Date(page.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                        <button
                          style={{ ...styles.btnSecondary, flex: 1, justifyContent: 'center', padding: '10px' }}
                          onClick={() => { setEditingPage(page); setShowEditor(true); }}
                        >
                          <Edit size={16} /> Modifier
                        </button>
                        <button
                          style={{ ...styles.btnIcon, background: isDark ? '#1e293b' : '#f1f5f9' }}
                          onClick={() => handleDuplicate(page.id)}
                          title="Dupliquer"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          style={{ ...styles.btnIcon, color: colors.error }}
                          onClick={() => handleDelete(page.id)}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // List View
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredPages.map(page => {
                const sectionsCount = page.sections ? JSON.parse(page.sections).length : 0;
                return (
                  <div key={page.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 20px',
                    background: isDark ? '#0f172a' : '#f8fafc',
                    borderRadius: '12px',
                    gap: '20px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = isDark ? '#1e293b' : '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.background = isDark ? '#0f172a' : '#f8fafc'}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '10px',
                      background: isDark ? '#334155' : '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px'
                    }}>
                      {templateIcons[page.template] || '📄'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600' }}>{page.title}</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: colors.primary }}>/{page.slug}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <span style={{ fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>
                        {sectionsCount} blocs
                      </span>
                      <span style={{
                        ...styles.badge(page.status === 'published' ? colors.success : colors.warning),
                        fontSize: '11px'
                      }}>
                        {page.status === 'published' ? '🟢 Publié' : '📝 Brouillon'}
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={styles.btnIcon} onClick={() => { setEditingPage(page); setShowEditor(true); }}>
                          <Edit size={18} />
                        </button>
                        <button style={styles.btnIcon} onClick={() => handleDuplicate(page.id)}>
                          <Copy size={18} />
                        </button>
                        <button style={{ ...styles.btnIcon, color: colors.error }} onClick={() => handleDelete(page.id)}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 40px' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: isDark ? '#1e293b' : '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '48px'
            }}>
              📄
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '700' }}>
              {searchQuery || statusFilter !== 'all' ? 'Aucune page trouvée' : 'Aucune page créée'}
            </h3>
            <p style={{ ...styles.textMuted, marginBottom: '24px' }}>
              {searchQuery || statusFilter !== 'all'
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Commencez par créer votre première page avec le Page Builder'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <button style={{ ...styles.btnPrimary, padding: '14px 28px' }} onClick={() => setShowEditor(true)}>
                <Plus size={20} /> Créer ma première page
              </button>
            )}
          </div>
        )}
      </div>

      {/* Page Builder Modal */}
      <Modal isOpen={showEditor} onClose={() => setShowEditor(false)} title={editingPage ? '✏️ Modifier la page' : '➕ Nouvelle page'} isDark={isDark} width="98%" fullScreen>
        <PageBuilder page={editingPage} onSave={handleSave} isDark={isDark} token={token} onClose={() => setShowEditor(false)} />
      </Modal>
    </div>
  );
};

// Page Builder Component - Version modernisée avec éditeurs de blocs fonctionnels
const PageBuilder = ({ page, onSave, isDark, token, onClose }) => {
  const styles = createStyles(isDark);

  // Parse sections properly - handle string, object with sections property, or array
  const parseSections = (sectionsData) => {
    if (!sectionsData) return [];
    try {
      const parsed = typeof sectionsData === 'string' ? JSON.parse(sectionsData) : sectionsData;
      // If parsed is an object with a 'sections' array property, extract it
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.sections)) {
        return parsed.sections;
      }
      // If parsed is already an array, return it
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch (e) {
      console.error('Error parsing sections:', e);
      return [];
    }
  };

  const [formData, setFormData] = useState({
    title: page?.title || '',
    title_en: page?.title_en || '',
    slug: page?.slug || '',
    content: page?.content || '',
    status: page?.status || 'draft',
    template: page?.template || 'default',
    meta_title: page?.meta_title || '',
    meta_description: page?.meta_description || '',
    featured_image: page?.featured_image || '',
    sections: parseSections(page?.sections),
    show_title: page?.show_title != null ? (page.show_title ? 1 : 0) : 1,
    show_breadcrumb: page?.show_breadcrumb != null ? (page.show_breadcrumb ? 1 : 0) : 1
  });
  const [activeSection, setActiveSection] = useState(null);
  const [viewMode, setViewMode] = useState('desktop');
  const [activeLang, setActiveLang] = useState('fr');
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [insertPosition, setInsertPosition] = useState(null); // Position where to insert new block
  const [sidebarTab, setSidebarTab] = useState('settings'); // 'section' | 'block' | 'settings' | 'seo'
  const [expandedSection, setExpandedSection] = useState(null); // For section controls
  const [draggedSection, setDraggedSection] = useState(null);

  // Blocs disponibles avec leurs configurations - VERSION COMPLETE
  const availableBlocks = [
    // === HERO & BANNIÈRES ===
    { type: 'hero', icon: '🎯', label: 'Hero Banner', description: 'Bannière avec image/gradient', category: 'hero' },
    { type: 'hero_advanced', icon: '🚀', label: 'Hero Avancé', description: 'Hero avec stats, badges, multi-CTA', category: 'hero' },

    // === CONTENU ===
    { type: 'text', icon: '📝', label: 'Texte', description: 'Bloc de texte riche HTML', category: 'content' },
    { type: 'text_image', icon: '📄', label: 'Texte + Image', description: 'Section avec texte et image cote a cote', category: 'content' },
    { type: 'heading', icon: '🔤', label: 'Titre Section', description: 'Titre avec badge et sous-titre', category: 'content' },
    { type: 'cta', icon: '⚡', label: 'Call to Action', description: 'Bouton d\'action avec fond', category: 'content' },
    { type: 'cta_banner', icon: '📢', label: 'CTA Bannière', description: 'CTA pleine largeur gradient', category: 'content' },

    // === LISTES & GRILLES ===
    { type: 'features', icon: '⭐', label: 'Fonctionnalités', description: 'Grille de features avec icônes', category: 'lists' },
    { type: 'pillars', icon: '🏛️', label: 'Piliers', description: 'Cartes piliers avec listes', category: 'lists' },
    { type: 'cards', icon: '🃏', label: 'Cartes', description: 'Grille de cartes personnalisées', category: 'lists' },
    { type: 'stats', icon: '📊', label: 'Statistiques', description: 'Chiffres clés avec icônes', category: 'lists' },
    { type: 'zoonoses', icon: '🦠', label: 'Zoonoses', description: 'Cartes maladies surveillance', category: 'lists' },
    { type: 'partners', icon: '🤝', label: 'Partenaires', description: 'Logos/noms partenaires', category: 'lists' },
    { type: 'team', icon: '👥', label: 'Équipe', description: 'Membres de l\'équipe', category: 'lists' },
    { type: 'timeline', icon: '📅', label: 'Timeline', description: 'Chronologie événements', category: 'lists' },

    // === MÉDIA ===
    { type: 'image', icon: '🖼️', label: 'Image', description: 'Image avec légende', category: 'media' },
    { type: 'gallery', icon: '🎨', label: 'Galerie', description: 'Grille d\'images', category: 'media' },
    { type: 'video', icon: '🎬', label: 'Vidéo', description: 'YouTube/Vimeo embed', category: 'media' },
    { type: 'map', icon: '🗺️', label: 'Carte', description: 'Google Maps / iframe', category: 'media' },

    // === DYNAMIQUE ===
    { type: 'news', icon: '📰', label: 'Actualités', description: 'Articles récents (API)', category: 'dynamic' },
    { type: 'posts_grid', icon: '📑', label: 'Grille Articles', description: 'Articles avec filtres', category: 'dynamic' },

    // === INTERACTION ===
    { type: 'testimonials', icon: '💬', label: 'Témoignages', description: 'Avis et témoignages', category: 'interaction' },
    { type: 'accordion', icon: '📋', label: 'Accordéon/FAQ', description: 'Questions-réponses', category: 'interaction' },
    { type: 'tabs', icon: '📑', label: 'Onglets', description: 'Contenu en onglets', category: 'interaction' },
    { type: 'contact', icon: '📧', label: 'Formulaire', description: 'Formulaire de contact', category: 'interaction' },

    // === MISE EN PAGE ===
    { type: 'columns', icon: '📊', label: 'Colonnes', description: 'Multi-colonnes flexible', category: 'layout' },
    { type: 'grid', icon: '⊞', label: 'Grille', description: 'Grille CSS configurable', category: 'layout' },
    { type: 'spacer', icon: '↕️', label: 'Espacement', description: 'Espace vertical', category: 'layout' },
    { type: 'divider', icon: '➖', label: 'Séparateur', description: 'Ligne de séparation', category: 'layout' },

    // === AVANCÉ ===
    { type: 'html', icon: '💻', label: 'HTML', description: 'Code HTML personnalisé', category: 'advanced' },
    { type: 'embed', icon: '🔗', label: 'Embed', description: 'iFrame / widget externe', category: 'advanced' },
    { type: 'script', icon: '⚙️', label: 'Script', description: 'JavaScript personnalisé', category: 'advanced' }
  ];

  // Paramètres par défaut pour chaque type de bloc - VERSION COMPLETE
  const getDefaultContent = (type) => {
    const defaults = {
      // === HERO BASIQUE ===
      hero: {
        title_fr: 'Titre principal', title_en: 'Main Title',
        subtitle_fr: 'Sous-titre de la section', subtitle_en: 'Section subtitle',
        buttonText_fr: 'En savoir plus', buttonText_en: 'Learn more',
        buttonUrl: '#', bgImage: '', bgColor: '#1a1a2e', textColor: '#ffffff',
        height: '500', overlay: true, overlayOpacity: 50
      },

      // === HERO AVANCÉ ===
      hero_advanced: {
        badge_fr: 'Bienvenue', badge_en: 'Welcome',
        title_fr: 'One Health', title_en: 'One Health',
        titleAccent_fr: 'pour le Cameroun', titleAccent_en: 'for Cameroon',
        description_fr: 'Une approche collaborative qui reconnaît l\'interconnexion entre la santé humaine, animale et environnementale.',
        description_en: 'A collaborative approach that recognizes the interconnection between human, animal and environmental health.',
        buttons: [
          { text_fr: 'Découvrir', text_en: 'Discover', url: '/about', style: 'primary', icon: 'arrow-right' },
          { text_fr: 'Actualités', text_en: 'News', url: '/news', style: 'secondary', icon: 'play' }
        ],
        stats: [
          { value: '09', label_fr: 'Ministères', label_en: 'Ministries', icon: 'building' },
          { value: '05', label_fr: 'Zoonoses', label_en: 'Zoonoses', icon: 'shield' },
          { value: '10+', label_fr: 'Partenaires', label_en: 'Partners', icon: 'users' }
        ],
        showPillars: true,
        pillars: [
          { label_fr: 'Santé Humaine', label_en: 'Human Health', color: '#2196F3', icon: '❤️' },
          { label_fr: 'Santé Animale', label_en: 'Animal Health', color: '#FF9800', icon: '🐾' },
          { label_fr: 'Environnement', label_en: 'Environment', color: '#4CAF50', icon: '🌿' }
        ],
        bgGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        showWave: true
      },

      // === TITRE SECTION ===
      heading: {
        badge_fr: 'Section', badge_en: 'Section',
        title_fr: 'Titre de la section', title_en: 'Section Title',
        subtitle_fr: 'Description de la section', subtitle_en: 'Section description',
        alignment: 'center', // left, center, right
        showBadge: true,
        titleSize: 'xl', // md, lg, xl, 2xl
        bgColor: 'transparent'
      },

      // === TEXTE ===
      text: {
        content_fr: '<p>Votre contenu ici...</p>', content_en: '<p>Your content here...</p>',
        bgColor: 'transparent', textAlign: 'left', padding: '40',
        maxWidth: '100%' // 100%, 80%, 60%
      },

      // === TEXTE + IMAGE ===
      text_image: {
        title_fr: 'Titre de la section',
        title_en: 'Section Title',
        layout: 'text-left-image-right', // text-left-image-right, image-left-text-right
        paragraphs_fr: ['Premier paragraphe en francais...', 'Deuxieme paragraphe...'],
        paragraphs_en: ['First paragraph in English...', 'Second paragraph...'],
        list_fr: [], // Liste a puces optionnelle
        list_en: [],
        image: {
          src: '',
          alt_fr: 'Description de l\'image',
          alt_en: 'Image description',
          caption_fr: '',
          caption_en: ''
        },
        bgColor: 'transparent'
      },

      // === IMAGE ===
      image: {
        src: '', alt_fr: '', alt_en: '', caption_fr: '', caption_en: '',
        width: '100', borderRadius: '0', alignment: 'center',
        shadow: false, link: ''
      },

      // === GALERIE ===
      gallery: {
        images: [], columns: 3, gap: '16', lightbox: true,
        aspectRatio: '1', // 1, 4/3, 16/9
        showCaptions: false
      },

      // === VIDÉO ===
      video: {
        url: '', type: 'youtube', autoplay: false,
        title_fr: '', title_en: '',
        aspectRatio: '16/9', borderRadius: '12'
      },

      // === COLONNES ===
      columns: {
        columns: 2, gap: '24', verticalAlign: 'top',
        content: [
          { title_fr: 'Colonne 1', title_en: 'Column 1', text_fr: 'Contenu...', text_en: 'Content...', icon: '' },
          { title_fr: 'Colonne 2', title_en: 'Column 2', text_fr: 'Contenu...', text_en: 'Content...', icon: '' }
        ]
      },

      // === CTA SIMPLE ===
      cta: {
        title_fr: 'Prêt à commencer ?', title_en: 'Ready to start?',
        description_fr: 'Rejoignez-nous dès maintenant', description_en: 'Join us now',
        buttonText_fr: 'Commencer', buttonText_en: 'Get Started',
        buttonUrl: '#', bgColor: colors.cameroonGreen, textColor: '#ffffff',
        buttonStyle: 'solid' // solid, outline, ghost
      },

      // === CTA BANNIÈRE ===
      cta_banner: {
        icon: '🗺️',
        title_fr: 'Explorez la Carte OHWR-Map', title_en: 'Explore the OHWR-Map',
        description_fr: 'Visualisez les données de surveillance des zoonoses en temps réel.',
        description_en: 'Visualize real-time zoonoses surveillance data.',
        buttonText_fr: 'Accéder à OHWR-Map', buttonText_en: 'Access OHWR-Map',
        buttonUrl: '#', buttonIcon: 'map',
        bgGradient: 'linear-gradient(135deg, #2196F3 0%, #009688 100%)',
        textColor: '#ffffff'
      },

      // === FEATURES ===
      features: {
        badge_fr: 'Fonctionnalités', badge_en: 'Features',
        title_fr: 'Nos fonctionnalités', title_en: 'Our Features',
        subtitle_fr: '', subtitle_en: '',
        items: [
          { icon: '🎯', title_fr: 'Feature 1', title_en: 'Feature 1', desc_fr: 'Description...', desc_en: 'Description...' },
          { icon: '⚡', title_fr: 'Feature 2', title_en: 'Feature 2', desc_fr: 'Description...', desc_en: 'Description...' },
          { icon: '🔒', title_fr: 'Feature 3', title_en: 'Feature 3', desc_fr: 'Description...', desc_en: 'Description...' }
        ],
        columns: 3,
        style: 'cards' // cards, icons, list
      },

      // === PILIERS ===
      pillars: {
        badge_fr: 'Notre Approche', badge_en: 'Our Approach',
        title_fr: 'Les Trois Piliers One Health', title_en: 'The Three One Health Pillars',
        subtitle_fr: 'Une approche intégrée pour la santé globale', subtitle_en: 'An integrated approach for global health',
        items: [
          {
            icon: '❤️', iconBg: '#2196F3',
            title_fr: 'Santé Humaine', title_en: 'Human Health',
            desc_fr: 'Surveillance des maladies, prévention et sensibilisation',
            desc_en: 'Disease surveillance, prevention and awareness',
            features_fr: ['Surveillance épidémiologique', 'Campagnes de vaccination', 'Éducation sanitaire'],
            features_en: ['Epidemiological surveillance', 'Vaccination campaigns', 'Health education']
          },
          {
            icon: '🐾', iconBg: '#FF9800',
            title_fr: 'Santé Animale', title_en: 'Animal Health',
            desc_fr: 'Contrôle des zoonoses et surveillance du bétail',
            desc_en: 'Zoonoses control and livestock surveillance',
            features_fr: ['Contrôle des zoonoses', 'Santé du bétail', 'Surveillance faune'],
            features_en: ['Zoonoses control', 'Livestock health', 'Wildlife surveillance']
          },
          {
            icon: '🌿', iconBg: '#4CAF50',
            title_fr: 'Environnement', title_en: 'Environment',
            desc_fr: 'Protection des écosystèmes et biodiversité',
            desc_en: 'Ecosystem protection and biodiversity',
            features_fr: ['Protection écosystèmes', 'Qualité de l\'eau', 'Biodiversité'],
            features_en: ['Ecosystem protection', 'Water quality', 'Biodiversity']
          }
        ]
      },

      // === CARTES PERSONNALISÉES ===
      cards: {
        title_fr: '', title_en: '',
        columns: 3, gap: '24',
        style: 'elevated', // flat, elevated, bordered
        items: [
          { icon: '🎯', title_fr: 'Carte 1', title_en: 'Card 1', desc_fr: 'Description', desc_en: 'Description', link: '', color: '#2196F3' },
          { icon: '⚡', title_fr: 'Carte 2', title_en: 'Card 2', desc_fr: 'Description', desc_en: 'Description', link: '', color: '#FF9800' },
          { icon: '🔒', title_fr: 'Carte 3', title_en: 'Card 3', desc_fr: 'Description', desc_en: 'Description', link: '', color: '#4CAF50' }
        ]
      },

      // === STATISTIQUES ===
      stats: {
        title_fr: '', title_en: '',
        style: 'horizontal', // horizontal, grid, cards
        bgColor: 'transparent',
        items: [
          { value: '100+', label_fr: 'Projets', label_en: 'Projects', icon: '📊', color: '#2196F3' },
          { value: '50K', label_fr: 'Bénéficiaires', label_en: 'Beneficiaries', icon: '👥', color: '#4CAF50' },
          { value: '10', label_fr: 'Régions', label_en: 'Regions', icon: '🗺️', color: '#FF9800' }
        ]
      },

      // === ZOONOSES ===
      zoonoses: {
        badge_fr: 'Surveillance', badge_en: 'Surveillance',
        title_fr: 'Zoonoses Prioritaires', title_en: 'Priority Zoonoses',
        subtitle_fr: 'Maladies sous surveillance active', subtitle_en: 'Diseases under active surveillance',
        items: [
          { emoji: '🐕', name_fr: 'Rage', name_en: 'Rabies', desc_fr: 'Maladie virale mortelle', desc_en: 'Fatal viral disease', cases: '200+', status_fr: 'Surveillance', status_en: 'Surveillance', color: '#2196F3' },
          { emoji: '🐔', name_fr: 'Grippe Aviaire', name_en: 'Avian Flu', desc_fr: 'Virus influenza aviaire', desc_en: 'Avian influenza virus', cases: '15', status_fr: 'Contrôlé', status_en: 'Controlled', color: '#FF9800' },
          { emoji: '🐄', name_fr: 'Tuberculose Bovine', name_en: 'Bovine TB', desc_fr: 'Infection bactérienne', desc_en: 'Bacterial infection', cases: '50+', status_fr: 'En cours', status_en: 'Ongoing', color: '#4CAF50' },
          { emoji: '🦠', name_fr: 'Anthrax', name_en: 'Anthrax', desc_fr: 'Maladie bactérienne', desc_en: 'Bacterial disease', cases: '8', status_fr: 'Alerte', status_en: 'Alert', color: '#CE1126' },
          { emoji: '🔬', name_fr: 'Ebola', name_en: 'Ebola', desc_fr: 'Fièvre hémorragique', desc_en: 'Hemorrhagic fever', cases: '0', status_fr: 'Préparation', status_en: 'Preparedness', color: '#009688' }
        ]
      },

      // === PARTENAIRES ===
      partners: {
        title_fr: 'Nos Partenaires', title_en: 'Our Partners',
        style: 'text', // text, logos, cards
        items: [
          { name: 'OMS', logo: '' },
          { name: 'FAO', logo: '' },
          { name: 'CDC', logo: '' },
          { name: 'USAID', logo: '' },
          { name: 'GIZ', logo: '' },
          { name: 'AFROHUN', logo: '' }
        ]
      },

      // === ÉQUIPE ===
      team: {
        title_fr: 'Notre Équipe', title_en: 'Our Team',
        subtitle_fr: '', subtitle_en: '',
        columns: 4,
        items: [
          { name: 'Dr. Jean Dupont', role_fr: 'Directeur', role_en: 'Director', photo: '', email: '', linkedin: '' }
        ]
      },

      // === TIMELINE ===
      timeline: {
        title_fr: 'Notre Histoire', title_en: 'Our History',
        style: 'vertical', // vertical, horizontal
        items: [
          { year: '2020', title_fr: 'Création', title_en: 'Creation', desc_fr: 'Lancement du programme', desc_en: 'Program launch' },
          { year: '2022', title_fr: 'Expansion', title_en: 'Expansion', desc_fr: 'Extension nationale', desc_en: 'National expansion' }
        ]
      },

      // === ACTUALITÉS ===
      news: {
        title_fr: 'Dernières Publications', title_en: 'Latest Publications',
        subtitle_fr: 'Restez informé des activités One Health', subtitle_en: 'Stay informed about One Health activities',
        buttonText_fr: 'Voir tout', buttonText_en: 'View all',
        buttonUrl: '/news',
        count: 6,
        columns: 3,
        showImage: true,
        showCategory: true,
        showDate: true,
        showExcerpt: true
      },

      // === GRILLE ARTICLES ===
      posts_grid: {
        title_fr: '', title_en: '',
        categoryFilter: '', // slug de catégorie ou vide
        count: 9,
        columns: 3,
        pagination: true,
        style: 'cards' // cards, list, minimal
      },

      // === TÉMOIGNAGES ===
      testimonials: {
        title_fr: 'Témoignages', title_en: 'Testimonials',
        style: 'cards', // cards, slider, quotes
        items: [
          { name: 'John Doe', role_fr: 'Client', role_en: 'Customer', text_fr: 'Excellent service !', text_en: 'Excellent service!', avatar: '', rating: 5 }
        ]
      },

      // === ACCORDÉON/FAQ ===
      accordion: {
        title_fr: 'Questions Fréquentes', title_en: 'FAQ',
        style: 'simple', // simple, bordered, separated
        allowMultiple: false,
        items: [
          { question_fr: 'Question 1 ?', question_en: 'Question 1?', answer_fr: 'Réponse 1...', answer_en: 'Answer 1...' },
          { question_fr: 'Question 2 ?', question_en: 'Question 2?', answer_fr: 'Réponse 2...', answer_en: 'Answer 2...' }
        ]
      },

      // === ONGLETS ===
      tabs: {
        style: 'pills', // pills, underline, boxed
        defaultTab: 0,
        items: [
          { label_fr: 'Onglet 1', label_en: 'Tab 1', content_fr: '<p>Contenu 1</p>', content_en: '<p>Content 1</p>' },
          { label_fr: 'Onglet 2', label_en: 'Tab 2', content_fr: '<p>Contenu 2</p>', content_en: '<p>Content 2</p>' }
        ]
      },

      // === FORMULAIRE CONTACT ===
      contact: {
        title_fr: 'Contactez-nous', title_en: 'Contact Us',
        description_fr: '', description_en: '',
        fields: ['name', 'email', 'message'],
        submitText_fr: 'Envoyer', submitText_en: 'Send',
        buttonColor: colors.cameroonGreen,
        recipientEmail: '',
        showMap: false,
        mapUrl: ''
      },

      // === CARTE/MAP ===
      map: {
        title_fr: '', title_en: '',
        type: 'google', // google, openstreetmap, iframe
        embedUrl: '',
        address: '',
        lat: '', lng: '',
        zoom: 15,
        height: '400',
        showMarker: true
      },

      // === GRILLE ===
      grid: {
        columns: 3, gap: '24',
        items: []
      },

      // === ESPACEUR ===
      spacer: { height: '60', showPattern: false },

      // === SÉPARATEUR ===
      divider: { style: 'solid', color: '#e2e8f0', width: '100', thickness: '1' },

      // === HTML PERSONNALISÉ ===
      html: {
        code: '<div>Custom HTML</div>',
        css: ''
      },

      // === EMBED ===
      embed: {
        url: '',
        title: '',
        width: '100%',
        height: '400',
        allowFullscreen: true
      },

      // === SCRIPT ===
      script: {
        code: '// JavaScript code',
        executeOn: 'load' // load, visible
      }
    };
    return defaults[type] || {};
  };

  const addSection = (type, position = null) => {
    const blockInfo = availableBlocks.find(b => b.type === type);
    const newSection = {
      id: Date.now(),
      type,
      name: blockInfo?.label || type, // Custom name for the section
      hidden: false, // Visibility toggle
      layout: 'full', // full | contained | narrow
      spacing: { top: '0', bottom: '0' }, // Custom spacing
      content: getDefaultContent(type)
    };

    if (position !== null && position >= 0) {
      const newSections = [...formData.sections];
      newSections.splice(position, 0, newSection);
      setFormData(prev => ({ ...prev, sections: newSections }));
    } else {
      setFormData(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
    }

    setActiveSection(newSection.id);
    setShowBlockPicker(false);
    setInsertPosition(null);
    setSidebarTab('section'); // Auto switch to section tab
  };

  const updateSection = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === id ? { ...s, [field]: value } : s
      )
    }));
  };

  const updateSectionContent = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== id) return s;

        // Pour le format DB direct (text-image avec title/content/image/layout au niveau racine)
        // Ces champs doivent etre mis a jour au niveau racine, pas dans content.content
        const rootLevelFields = ['title', 'image', 'layout', 'content'];
        const isDirectFormat = s.title && typeof s.title === 'object';

        if (isDirectFormat && rootLevelFields.includes(field)) {
          return { ...s, [field]: value };
        }

        // Pour les autres champs ou le format wrapper, mettre dans content
        return { ...s, content: { ...s.content, [field]: value } };
      })
    }));
  };

  const removeSection = (id) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== id)
    }));
    if (activeSection === id) setActiveSection(null);
  };

  const moveSection = (id, direction) => {
    const index = formData.sections.findIndex(s => s.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === formData.sections.length - 1)) return;
    const newSections = [...formData.sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    setFormData(prev => ({ ...prev, sections: newSections }));
  };

  const moveSectionToPosition = (id, targetIndex) => {
    const currentIndex = formData.sections.findIndex(s => s.id === id);
    if (currentIndex === targetIndex || currentIndex === -1) return;

    const newSections = [...formData.sections];
    const [removed] = newSections.splice(currentIndex, 1);
    newSections.splice(targetIndex, 0, removed);
    setFormData(prev => ({ ...prev, sections: newSections }));
  };

  const duplicateSection = (id) => {
    const section = formData.sections.find(s => s.id === id);
    if (section) {
      const newSection = {
        ...section,
        id: Date.now(),
        name: `${section.name} (copie)`,
        content: { ...section.content }
      };
      const index = formData.sections.findIndex(s => s.id === id);
      const newSections = [...formData.sections];
      newSections.splice(index + 1, 0, newSection);
      setFormData(prev => ({ ...prev, sections: newSections }));
      setActiveSection(newSection.id);
    }
  };

  const toggleSectionVisibility = (id) => {
    const section = formData.sections.find(s => s.id === id);
    if (section) {
      updateSection(id, 'hidden', !section.hidden);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'title' && !page) {
      const slug = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const getActiveBlock = () => formData.sections.find(s => s.id === activeSection);
  const activeBlock = getActiveBlock();

  // Handle drag and drop
  const handleDragStart = (e, index) => {
    setDraggedSection(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedSection !== null && draggedSection !== targetIndex) {
      const section = formData.sections[draggedSection];
      moveSectionToPosition(section.id, targetIndex);
    }
    setDraggedSection(null);
  };

  const handleDragEnd = () => {
    setDraggedSection(null);
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 140px)', gap: '0' }}>
      {/* Sidebar gauche - Liste des sections */}
      <div style={{ width: '320px', borderRight: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, display: 'flex', flexDirection: 'column', background: isDark ? '#1e293b' : '#ffffff' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700' }}>📦 Sections</h3>
              <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                {formData.sections.length} section{formData.sections.length !== 1 ? 's' : ''} • {formData.sections.filter(s => s.hidden).length} masquée{formData.sections.filter(s => s.hidden).length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => { setInsertPosition(formData.sections.length); setShowBlockPicker(true); }}
              style={{
                ...styles.btnPrimary,
                background: colors.cameroonGreen,
                padding: '8px 12px',
                fontSize: '13px'
              }}
            >
              <Plus size={16} /> Ajouter
            </button>
          </div>
        </div>

        {/* Liste des sections */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {formData.sections.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: isDark ? '#64748b' : '#94a3b8' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
              <p style={{ margin: '0 0 8px', fontWeight: '600' }}>Aucune section</p>
              <p style={{ margin: '0 0 16px', fontSize: '13px' }}>Ajoutez des sections pour construire votre page</p>
              <button
                onClick={() => setShowBlockPicker(true)}
                style={{ ...styles.btnSecondary, fontSize: '13px' }}
              >
                <Plus size={16} /> Ajouter une section
              </button>
            </div>
          ) : (
            <>
              {formData.sections.map((section, index) => {
                const blockInfo = availableBlocks.find(b => b.type === section.type);
                const isActive = activeSection === section.id;
                const isExpanded = expandedSection === section.id;
                const isDragging = draggedSection === index;

                return (
                  <React.Fragment key={section.id}>
                    {/* Insert indicator before */}
                    <div
                      style={{
                        height: '4px',
                        margin: '0 8px 4px',
                        borderRadius: '2px',
                        background: 'transparent',
                        transition: 'background 0.2s'
                      }}
                      onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.background = colors.cameroonGreen; }}
                      onDragLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      onDrop={(e) => { handleDrop(e, index); e.currentTarget.style.background = 'transparent'; }}
                    />

                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      onClick={() => { setActiveSection(section.id); setSidebarTab('block'); }}
                      style={{
                        marginBottom: '4px',
                        background: isActive ? `${colors.cameroonGreen}15` : (isDark ? '#0f172a' : '#f8fafc'),
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: isActive ? `2px solid ${colors.cameroonGreen}` : `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        transition: 'all 0.2s ease',
                        opacity: isDragging ? 0.5 : (section.hidden ? 0.5 : 1),
                        overflow: 'hidden'
                      }}
                    >
                      {/* Section header */}
                      <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Drag handle */}
                        <div
                          style={{
                            cursor: 'grab',
                            color: isDark ? '#64748b' : '#94a3b8',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Glisser pour réorganiser"
                        >
                          <GripVertical size={18} />
                        </div>

                        {/* Icon */}
                        <span style={{ fontSize: '22px' }}>{blockInfo?.icon || '📦'}</span>

                        {/* Name & Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            margin: 0,
                            fontSize: '14px',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            textDecoration: section.hidden ? 'line-through' : 'none',
                            opacity: section.hidden ? 0.6 : 1
                          }}>
                            {section.name || blockInfo?.label || section.type}
                          </p>
                          <p style={{ margin: 0, fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>
                            {blockInfo?.label} • #{index + 1}
                          </p>
                        </div>

                        {/* Quick actions */}
                        <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                          {/* Visibility toggle */}
                          <button
                            style={{
                              ...styles.btnIcon,
                              padding: '6px',
                              color: section.hidden ? colors.warning : (isDark ? '#64748b' : '#94a3b8')
                            }}
                            onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(section.id); }}
                            title={section.hidden ? 'Afficher la section' : 'Masquer la section'}
                          >
                            {section.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>

                          {/* Expand/collapse */}
                          <button
                            style={{ ...styles.btnIcon, padding: '6px' }}
                            onClick={(e) => { e.stopPropagation(); setExpandedSection(isExpanded ? null : section.id); }}
                            title="Plus d'options"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Content Preview for text_image blocks - supports both formats */}
                      {(section.type === 'text_image' || section.type === 'text-image') && (
                        <div style={{
                          padding: '12px 12px 12px 46px',
                          borderTop: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}`,
                          background: isDark ? '#0f172a40' : 'linear-gradient(135deg, #fafbfc 0%, #f1f5f9 100%)',
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'flex-start'
                        }}>
                          {/* Image thumbnail - supports both formats */}
                          {(() => {
                            const imgSrc = section.image?.src || section.content?.image?.src;
                            if (imgSrc) {
                              return (
                                <div style={{
                                  width: '64px',
                                  height: '48px',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  flexShrink: 0,
                                  background: isDark ? '#1e293b' : '#e2e8f0',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                  border: `2px solid ${isDark ? '#334155' : '#ffffff'}`
                                }}>
                                  <img
                                    src={imgSrc.startsWith('http') ? imgSrc : `http://localhost:5000${imgSrc}`}
                                    alt=""
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                </div>
                              );
                            }
                            return (
                              <div style={{
                                width: '64px',
                                height: '48px',
                                borderRadius: '8px',
                                background: isDark ? '#1e293b' : '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isDark ? '#475569' : '#94a3b8',
                                fontSize: '18px',
                                flexShrink: 0
                              }}>
                                🖼️
                              </div>
                            );
                          })()}
                          {/* Text preview - supports both formats */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              margin: 0,
                              fontSize: '12px',
                              fontWeight: '700',
                              color: isDark ? '#e2e8f0' : '#1e293b',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              marginBottom: '4px'
                            }}>
                              {/* Title - support direct format (section.title) and wrapper format (section.content.title) */}
                              {section.title?.[activeLang] || section.title?.fr || section.content?.title?.[activeLang] || section.content?.[`title_${activeLang}`] || 'Sans titre'}
                            </p>
                            <p style={{
                              margin: 0,
                              fontSize: '11px',
                              color: isDark ? '#64748b' : '#64748b',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: '1.4'
                            }}>
                              {(() => {
                                // Direct format: section.content = { fr: [{type: 'paragraph', text: '...'}] }
                                const directContent = section.content?.[activeLang] || section.content?.fr || [];
                                if (Array.isArray(directContent)) {
                                  const firstPara = directContent.find(item => item.type === 'paragraph');
                                  if (firstPara?.text) return firstPara.text;
                                }
                                // Wrapper format: section.content.content = { fr: [...] }
                                const wrapperContent = section.content?.content?.[activeLang] || section.content?.content?.fr || [];
                                if (Array.isArray(wrapperContent)) {
                                  const firstPara = wrapperContent.find(item => item.type === 'paragraph');
                                  if (firstPara?.text) return firstPara.text;
                                }
                                // Legacy flat format
                                const legacyParagraphs = section.content?.[`paragraphs_${activeLang}`] || [];
                                if (legacyParagraphs[0]) return legacyParagraphs[0];
                                return 'Cliquez pour modifier le contenu...';
                              })()}
                            </p>
                            {/* Layout indicator */}
                            <div style={{
                              marginTop: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <span style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: isDark ? '#334155' : '#e2e8f0',
                                color: isDark ? '#94a3b8' : '#64748b'
                              }}>
                                {(section.layout || 'text-left-image-right') === 'image-left-text-right' ? '◨ Image gauche' : '◧ Image droite'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Expanded controls */}
                      {isExpanded && (
                        <div style={{
                          padding: '12px',
                          borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                          background: isDark ? '#0f172a50' : '#f8fafc'
                        }}>
                          {/* Section name edit */}
                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ ...styles.label, fontSize: '11px', marginBottom: '4px' }}>Nom de la section</label>
                            <input
                              value={section.name || ''}
                              onChange={(e) => { e.stopPropagation(); updateSection(section.id, 'name', e.target.value); }}
                              onClick={(e) => e.stopPropagation()}
                              style={{ ...styles.input, fontSize: '13px', padding: '8px 12px' }}
                              placeholder="Nom personnalisé..."
                            />
                          </div>

                          {/* Layout selector */}
                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ ...styles.label, fontSize: '11px', marginBottom: '4px' }}>Mise en page</label>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {[
                                { value: 'full', label: 'Pleine', icon: '▮' },
                                { value: 'contained', label: 'Contenu', icon: '▭' },
                                { value: 'narrow', label: 'Étroit', icon: '▯' }
                              ].map(opt => (
                                <button
                                  key={opt.value}
                                  onClick={(e) => { e.stopPropagation(); updateSection(section.id, 'layout', opt.value); }}
                                  style={{
                                    flex: 1,
                                    padding: '8px 4px',
                                    background: section.layout === opt.value ? colors.cameroonGreen : (isDark ? '#1e293b' : '#ffffff'),
                                    color: section.layout === opt.value ? '#fff' : (isDark ? '#94a3b8' : '#64748b'),
                                    border: `1px solid ${section.layout === opt.value ? colors.cameroonGreen : (isDark ? '#334155' : '#e2e8f0')}`,
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    fontWeight: '500'
                                  }}
                                >
                                  {opt.icon} {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                              style={{ ...styles.btnIcon, padding: '8px', flex: 1, justifyContent: 'center', gap: '4px', fontSize: '11px', background: isDark ? '#1e293b' : '#ffffff', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: '6px' }}
                              onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'up'); }}
                              disabled={index === 0}
                            >
                              <ArrowUp size={12} /> Monter
                            </button>
                            <button
                              style={{ ...styles.btnIcon, padding: '8px', flex: 1, justifyContent: 'center', gap: '4px', fontSize: '11px', background: isDark ? '#1e293b' : '#ffffff', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: '6px' }}
                              onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'down'); }}
                              disabled={index === formData.sections.length - 1}
                            >
                              <ArrowDown size={12} /> Descendre
                            </button>
                            <button
                              style={{ ...styles.btnIcon, padding: '8px', flex: 1, justifyContent: 'center', gap: '4px', fontSize: '11px', background: isDark ? '#1e293b' : '#ffffff', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: '6px' }}
                              onClick={(e) => { e.stopPropagation(); duplicateSection(section.id); }}
                            >
                              <Copy size={12} /> Dupliquer
                            </button>
                            <button
                              style={{ ...styles.btnIcon, padding: '8px', flex: 1, justifyContent: 'center', gap: '4px', fontSize: '11px', background: `${colors.error}15`, color: colors.error, border: `1px solid ${colors.error}30`, borderRadius: '6px' }}
                              onClick={(e) => { e.stopPropagation(); if(confirm('Supprimer cette section ?')) removeSection(section.id); }}
                            >
                              <Trash2 size={12} /> Supprimer
                            </button>
                          </div>

                          {/* Insert section buttons */}
                          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setInsertPosition(index); setShowBlockPicker(true); }}
                              style={{
                                flex: 1,
                                padding: '8px',
                                background: 'transparent',
                                border: `1px dashed ${isDark ? '#334155' : '#cbd5e1'}`,
                                borderRadius: '6px',
                                color: isDark ? '#64748b' : '#94a3b8',
                                fontSize: '11px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px'
                              }}
                            >
                              <Plus size={12} /> Insérer avant
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setInsertPosition(index + 1); setShowBlockPicker(true); }}
                              style={{
                                flex: 1,
                                padding: '8px',
                                background: 'transparent',
                                border: `1px dashed ${isDark ? '#334155' : '#cbd5e1'}`,
                                borderRadius: '6px',
                                color: isDark ? '#64748b' : '#94a3b8',
                                fontSize: '11px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px'
                              }}
                            >
                              <Plus size={12} /> Insérer après
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}

              {/* Final drop zone */}
              <div
                style={{
                  height: '4px',
                  margin: '4px 8px',
                  borderRadius: '2px',
                  background: 'transparent',
                  transition: 'background 0.2s'
                }}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.background = colors.cameroonGreen; }}
                onDragLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                onDrop={(e) => { handleDrop(e, formData.sections.length); e.currentTarget.style.background = 'transparent'; }}
              />

              {/* Add section button at bottom */}
              <button
                onClick={() => { setInsertPosition(formData.sections.length); setShowBlockPicker(true); }}
                style={{
                  width: '100%',
                  padding: '16px',
                  marginTop: '8px',
                  background: isDark ? '#0f172a' : '#f1f5f9',
                  border: `2px dashed ${isDark ? '#334155' : '#cbd5e1'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: isDark ? '#94a3b8' : '#64748b',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = colors.cameroonGreen; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? '#334155' : '#cbd5e1'; }}
              >
                <Plus size={20} /> Ajouter une section
              </button>
            </>
          )}
        </div>
      </div>

      {/* Zone centrale - Preview */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: isDark ? '#0f172a' : '#f1f5f9' }}>
        {/* Toolbar */}
        <div style={{ padding: '12px 20px', background: isDark ? '#1e293b' : '#ffffff', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* View Mode */}
            <div style={{ display: 'flex', background: isDark ? '#0f172a' : '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
              {[
                { mode: 'desktop', icon: <Monitor size={16} />, label: 'Desktop' },
                { mode: 'tablet', icon: <Tablet size={16} />, label: 'Tablet' },
                { mode: 'mobile', icon: <Smartphone size={16} />, label: 'Mobile' }
              ].map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  title={label}
                  style={{
                    ...styles.btnIcon,
                    padding: '8px 12px',
                    background: viewMode === mode ? (isDark ? '#334155' : '#ffffff') : 'transparent',
                    borderRadius: '6px'
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
            {/* Language */}
            <div style={{ display: 'flex', background: isDark ? '#0f172a' : '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
              {['fr', 'en'].map(lang => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  style={{
                    padding: '8px 16px',
                    background: activeLang === lang ? colors.cameroonGreen : 'transparent',
                    color: activeLang === lang ? '#fff' : (isDark ? '#94a3b8' : '#64748b'),
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px'
                  }}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
            {/* Stats */}
            <div style={{ fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
              {formData.sections.filter(s => !s.hidden).length} sections visibles
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={styles.btnSecondary} onClick={onClose}>✕ Annuler</button>
            <button style={{ ...styles.btnPrimary, background: colors.cameroonGreen }} onClick={() => onSave({ ...formData, sections: JSON.stringify({ sections: formData.sections, settings: formData.settings || {} }) })}>
              <Save size={18} /> Enregistrer
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: viewMode === 'desktop' ? '100%' : viewMode === 'tablet' ? '768px' : '375px',
            maxWidth: '1200px',
            background: isDark ? '#1e293b' : '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            minHeight: '600px',
            transition: 'width 0.3s ease',
            overflow: 'hidden'
          }}>
            {formData.sections.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '500px', color: isDark ? '#64748b' : '#94a3b8' }}>
                <div style={{ fontSize: '64px', marginBottom: '24px' }}>📄</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600' }}>Page vide</h3>
                <p style={{ margin: '0 0 24px 0' }}>Cliquez sur "Ajouter une section" pour commencer</p>
                <button
                  onClick={() => setShowBlockPicker(true)}
                  style={{ ...styles.btnPrimary, background: colors.cameroonGreen }}
                >
                  <Plus size={18} /> Ajouter une section
                </button>
              </div>
            ) : (
              formData.sections.map((section, index) => {
                const isActive = activeSection === section.id;
                const blockInfo = availableBlocks.find(b => b.type === section.type);

                return (
                  <div
                    key={section.id}
                    style={{
                      position: 'relative',
                      outline: isActive ? `3px solid ${colors.cameroonGreen}` : 'none',
                      outlineOffset: '-3px',
                      opacity: section.hidden ? 0.4 : 1,
                      transition: 'opacity 0.2s'
                    }}
                    onClick={() => { setActiveSection(section.id); setSidebarTab('block'); }}
                  >
                    {/* Section overlay for hidden sections */}
                    {section.hidden && (
                      <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'} 10px, ${isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'} 20px)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 5,
                        pointerEvents: 'none'
                      }}>
                        <div style={{
                          padding: '8px 16px',
                          background: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: colors.warning
                        }}>
                          <EyeOff size={16} /> Section masquée
                        </div>
                      </div>
                    )}

                    {/* Hover toolbar */}
                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        display: 'flex',
                        gap: '4px',
                        zIndex: 10,
                        background: isDark ? '#1e293b' : '#ffffff',
                        padding: '4px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}>
                        <span style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          fontWeight: '600',
                          color: colors.cameroonGreen,
                          background: `${colors.cameroonGreen}15`,
                          borderRadius: '4px',
                          marginRight: '4px'
                        }}>
                          {blockInfo?.icon} {section.name || blockInfo?.label}
                        </span>
                        <button
                          style={{ ...styles.btnIcon, padding: '6px' }}
                          onClick={(e) => { e.stopPropagation(); setSidebarTab('block'); }}
                          title="Modifier le contenu"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          style={{ ...styles.btnIcon, padding: '6px' }}
                          onClick={(e) => { e.stopPropagation(); toggleSectionVisibility(section.id); }}
                          title={section.hidden ? 'Afficher' : 'Masquer'}
                        >
                          {section.hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button
                          style={{ ...styles.btnIcon, padding: '6px' }}
                          onClick={(e) => { e.stopPropagation(); duplicateSection(section.id); }}
                          title="Dupliquer"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          style={{ ...styles.btnIcon, padding: '6px', color: colors.error }}
                          onClick={(e) => { e.stopPropagation(); if(confirm('Supprimer ?')) removeSection(section.id); }}
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}

                    <BlockPreview section={section} isDark={isDark} lang={activeLang} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Sidebar droite - Éditeur de section/bloc ou Paramètres page */}
      <div style={{ width: '400px', borderLeft: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, display: 'flex', flexDirection: 'column', background: isDark ? '#1e293b' : '#ffffff' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
          {[
            { id: 'section', label: '📐 Section', show: !!activeBlock },
            { id: 'block', label: '🎨 Contenu', show: !!activeBlock },
            { id: 'settings', label: '⚙️ Page' },
            { id: 'seo', label: '🔍 SEO' }
          ].filter(t => t.show !== false).map(tab => (
            <button
              key={tab.id}
              onClick={() => setSidebarTab(tab.id)}
              style={{
                flex: 1,
                padding: '14px 8px',
                background: sidebarTab === tab.id ? (isDark ? '#0f172a' : '#f8fafc') : 'transparent',
                border: 'none',
                borderBottom: sidebarTab === tab.id ? `3px solid ${colors.cameroonGreen}` : '3px solid transparent',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '12px',
                color: sidebarTab === tab.id ? (isDark ? '#fff' : '#1e293b') : (isDark ? '#64748b' : '#94a3b8')
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* Section settings */}
          {sidebarTab === 'section' && activeBlock && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <span style={{ fontSize: '32px' }}>{availableBlocks.find(b => b.type === activeBlock.type)?.icon || '📦'}</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Paramètres de section</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                    {availableBlocks.find(b => b.type === activeBlock.type)?.label}
                  </p>
                </div>
              </div>

              {/* Section name */}
              <div style={styles.mb16}>
                <label style={styles.label}>🏷️ Nom de la section</label>
                <input
                  value={activeBlock.name || ''}
                  onChange={e => updateSection(activeBlock.id, 'name', e.target.value)}
                  style={styles.input}
                  placeholder="Donnez un nom à cette section..."
                />
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>
                  Ce nom apparaît dans la liste des sections pour vous aider à identifier chaque partie
                </p>
              </div>

              {/* Visibility */}
              <div style={styles.mb16}>
                <label style={styles.label}>👁️ Visibilité</label>
                <div
                  onClick={() => toggleSectionVisibility(activeBlock.id)}
                  style={{
                    padding: '12px 16px',
                    background: activeBlock.hidden ? `${colors.warning}15` : `${colors.success}15`,
                    border: `1px solid ${activeBlock.hidden ? colors.warning : colors.success}40`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {activeBlock.hidden ? (
                    <>
                      <EyeOff size={20} color={colors.warning} />
                      <div>
                        <p style={{ margin: 0, fontWeight: '600', color: colors.warning }}>Section masquée</p>
                        <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>Cliquez pour afficher</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Eye size={20} color={colors.success} />
                      <div>
                        <p style={{ margin: 0, fontWeight: '600', color: colors.success }}>Section visible</p>
                        <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>Cliquez pour masquer</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Layout */}
              <div style={styles.mb16}>
                <label style={styles.label}>📐 Mise en page</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { value: 'full', label: 'Pleine largeur', icon: <Maximize2 size={20} />, desc: '100% de la page' },
                    { value: 'contained', label: 'Contenu', icon: <Square size={20} />, desc: 'Largeur standard' },
                    { value: 'narrow', label: 'Étroit', icon: <Columns size={20} />, desc: 'Largeur réduite' }
                  ].map(opt => (
                    <div
                      key={opt.value}
                      onClick={() => updateSection(activeBlock.id, 'layout', opt.value)}
                      style={{
                        padding: '16px 12px',
                        background: activeBlock.layout === opt.value ? `${colors.cameroonGreen}15` : (isDark ? '#0f172a' : '#f8fafc'),
                        border: `2px solid ${activeBlock.layout === opt.value ? colors.cameroonGreen : (isDark ? '#334155' : '#e2e8f0')}`,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ color: activeBlock.layout === opt.value ? colors.cameroonGreen : (isDark ? '#94a3b8' : '#64748b'), marginBottom: '8px' }}>
                        {opt.icon}
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>{opt.label}</p>
                      <p style={{ margin: '4px 0 0', fontSize: '10px', color: isDark ? '#64748b' : '#94a3b8' }}>{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spacing */}
              <div style={styles.mb16}>
                <label style={styles.label}>↕️ Espacement</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ ...styles.label, fontSize: '11px' }}>Haut (px)</label>
                    <input
                      type="number"
                      min="0"
                      max="200"
                      value={activeBlock.spacing?.top || 0}
                      onChange={e => updateSection(activeBlock.id, 'spacing', { ...activeBlock.spacing, top: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div>
                    <label style={{ ...styles.label, fontSize: '11px' }}>Bas (px)</label>
                    <input
                      type="number"
                      min="0"
                      max="200"
                      value={activeBlock.spacing?.bottom || 0}
                      onChange={e => updateSection(activeBlock.id, 'spacing', { ...activeBlock.spacing, bottom: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </div>
              </div>

              <div style={styles.divider} />

              {/* Quick actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  style={{ ...styles.btnSecondary, justifyContent: 'center' }}
                  onClick={() => duplicateSection(activeBlock.id)}
                >
                  <Copy size={16} /> Dupliquer
                </button>
                <button
                  style={{ ...styles.btnSecondary, justifyContent: 'center', background: `${colors.error}15`, color: colors.error, border: `1px solid ${colors.error}30` }}
                  onClick={() => { if(confirm('Supprimer cette section ?')) removeSection(activeBlock.id); }}
                >
                  <Trash2 size={16} /> Supprimer
                </button>
              </div>

              {/* Tip to edit content */}
              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: `${colors.primary}10`,
                border: `1px solid ${colors.primary}30`,
                borderRadius: '10px'
              }}>
                <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
                  💡 <strong>Astuce :</strong> Cliquez sur l'onglet "Contenu" pour modifier le texte, les images et autres éléments de cette section.
                </p>
              </div>
            </div>
          )}

          {/* Block content editor */}
          {sidebarTab === 'block' && activeBlock && (
            <BlockEditor
              block={activeBlock}
              onUpdate={(field, value) => updateSectionContent(activeBlock.id, field, value)}
              onDelete={() => removeSection(activeBlock.id)}
              onDuplicate={() => duplicateSection(activeBlock.id)}
              isDark={isDark}
              activeLang={activeLang}
              styles={styles}
              token={token}
            />
          )}

          {/* No section selected */}
          {(sidebarTab === 'section' || sidebarTab === 'block') && !activeBlock && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: isDark ? '#64748b' : '#94a3b8' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👆</div>
              <h4 style={{ margin: '0 0 8px' }}>Aucune section sélectionnée</h4>
              <p style={{ margin: 0, fontSize: '13px' }}>
                Cliquez sur une section dans la liste ou sur l'aperçu pour la modifier
              </p>
            </div>
          )}

          {/* Paramètres de la page */}
          {sidebarTab === 'settings' && (
            <div>
              <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '700' }}>⚙️ Paramètres de la page</h4>
                <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                  Informations générales et configuration
                </p>
              </div>

              <div style={styles.mb16}>
                <label style={styles.label}>🏷️ Titre (FR)</label>
                <input value={formData.title} onChange={e => handleChange('title', e.target.value)} style={styles.input} placeholder="Titre de la page" />
              </div>
              <div style={styles.mb16}>
                <label style={styles.label}>🏷️ Title (EN)</label>
                <input value={formData.title_en} onChange={e => handleChange('title_en', e.target.value)} style={styles.input} placeholder="Page title" />
              </div>
              <div style={styles.mb16}>
                <label style={styles.label}>🔗 Slug (URL)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: isDark ? '#64748b' : '#94a3b8' }}>/</span>
                  <input value={formData.slug} onChange={e => handleChange('slug', e.target.value)} style={{ ...styles.input, flex: 1 }} placeholder="url-de-la-page" />
                </div>
              </div>
              <div style={styles.mb16}>
                <label style={styles.label}>📐 Template</label>
                <select value={formData.template} onChange={e => handleChange('template', e.target.value)} style={{ ...styles.select, width: '100%' }}>
                  <option value="default">📄 Par défaut</option>
                  <option value="full-width">📐 Pleine largeur</option>
                  <option value="landing">🚀 Landing Page</option>
                  <option value="sidebar">📑 Avec Sidebar</option>
                </select>
              </div>
              <div style={styles.mb16}>
                <label style={styles.label}>📊 Statut</label>
                <select value={formData.status} onChange={e => handleChange('status', e.target.value)} style={{ ...styles.select, width: '100%' }}>
                  <option value="draft">📝 Brouillon</option>
                  <option value="published">🟢 Publié</option>
                </select>
              </div>

              {/* Options d'affichage */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <h5 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: isDark ? '#f1f5f9' : '#334155' }}>
                  🎨 Options d'affichage
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: isDark ? '#0f172a' : '#f8fafc',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.show_title === 1 || formData.show_title === true}
                      onChange={e => handleChange('show_title', e.target.checked ? 1 : 0)}
                      style={{ width: '18px', height: '18px', accentColor: colors.cameroonGreen }}
                    />
                    <div>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>Afficher le bandeau titre</span>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                        Bandeau avec le titre et fil d'Ariane
                      </p>
                    </div>
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: isDark ? '#0f172a' : '#f8fafc',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.show_breadcrumb === 1 || formData.show_breadcrumb === true}
                      onChange={e => handleChange('show_breadcrumb', e.target.checked ? 1 : 0)}
                      style={{ width: '18px', height: '18px', accentColor: colors.cameroonGreen }}
                    />
                    <div>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>Afficher le fil d'Ariane</span>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                        Navigation: Accueil &gt; Page
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* SEO */}
          {sidebarTab === 'seo' && (
            <div>
              <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '700' }}>🔍 Référencement SEO</h4>
                <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                  Optimisez votre page pour les moteurs de recherche
                </p>
              </div>

              <div style={{ padding: '16px', background: isDark ? '#0f172a' : '#f0fdf4', borderRadius: '10px', marginBottom: '20px', border: `1px solid ${colors.cameroonGreen}40` }}>
                <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
                  💡 Un bon référencement aide votre page à apparaître dans les résultats de recherche Google
                </p>
              </div>
              <div style={styles.mb16}>
                <label style={styles.label}>🏷️ Meta Titre</label>
                <input value={formData.meta_title} onChange={e => handleChange('meta_title', e.target.value)} style={styles.input} placeholder={formData.title || 'Titre SEO'} />
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: (formData.meta_title || formData.title || '').length > 60 ? colors.error : (isDark ? '#64748b' : '#94a3b8') }}>
                  {(formData.meta_title || formData.title || '').length}/60 caractères {(formData.meta_title || formData.title || '').length > 60 && '⚠️ Trop long'}
                </p>
              </div>
              <div style={styles.mb16}>
                <label style={styles.label}>📝 Meta Description</label>
                <textarea
                  value={formData.meta_description}
                  onChange={e => handleChange('meta_description', e.target.value)}
                  style={{ ...styles.textarea, minHeight: '100px' }}
                  placeholder="Description pour les moteurs de recherche..."
                />
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: (formData.meta_description || '').length > 160 ? colors.error : (isDark ? '#64748b' : '#94a3b8') }}>
                  {(formData.meta_description || '').length}/160 caractères {(formData.meta_description || '').length > 160 && '⚠️ Trop long'}
                </p>
              </div>
              {/* Preview Google */}
              <div style={{ marginTop: '24px' }}>
                <label style={styles.label}>👁️ Aperçu Google</label>
                <div style={{ padding: '16px', background: isDark ? '#0f172a' : '#ffffff', borderRadius: '8px', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                  <p style={{ margin: '0 0 4px', fontSize: '18px', color: '#1a0dab', fontFamily: 'Arial' }}>
                    {formData.meta_title || formData.title || 'Titre de la page'}
                  </p>
                  <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#006621' }}>
                    votresite.com/{formData.slug || 'url-page'}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#545454', lineHeight: '1.4' }}>
                    {formData.meta_description || 'Ajoutez une meta description pour améliorer votre référencement...'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal sélection de bloc */}
      {showBlockPicker && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => { setShowBlockPicker(false); setInsertPosition(null); }}>
          <div style={{
            background: isDark ? '#1e293b' : '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            width: '700px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700' }}>➕ Ajouter une section</h3>
                <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>
                  {insertPosition !== null && insertPosition < formData.sections.length
                    ? `Sera insérée en position ${insertPosition + 1}`
                    : 'Sera ajoutée à la fin de la page'}
                </p>
              </div>
              <button style={styles.btnIcon} onClick={() => { setShowBlockPicker(false); setInsertPosition(null); }}><X size={20} /></button>
            </div>

            {/* Categories */}
            {[
              { id: 'hero', label: '🎯 Bannières', blocks: availableBlocks.filter(b => b.category === 'hero') },
              { id: 'content', label: '📝 Contenu', blocks: availableBlocks.filter(b => b.category === 'content') },
              { id: 'lists', label: '📋 Listes & Grilles', blocks: availableBlocks.filter(b => b.category === 'lists') },
              { id: 'media', label: '🖼️ Média', blocks: availableBlocks.filter(b => b.category === 'media') },
              { id: 'dynamic', label: '🔄 Dynamique', blocks: availableBlocks.filter(b => b.category === 'dynamic') },
              { id: 'interaction', label: '💬 Interaction', blocks: availableBlocks.filter(b => b.category === 'interaction') },
              { id: 'layout', label: '📐 Mise en page', blocks: availableBlocks.filter(b => b.category === 'layout') },
              { id: 'advanced', label: '⚙️ Avancé', blocks: availableBlocks.filter(b => b.category === 'advanced') }
            ].map(cat => (
              <div key={cat.id} style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>{cat.label}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {cat.blocks.map(block => (
                    <div
                      key={block.type}
                      onClick={() => addSection(block.type, insertPosition)}
                      style={{
                        padding: '20px 12px',
                        background: isDark ? '#0f172a' : '#f8fafc',
                        borderRadius: '12px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = colors.cameroonGreen; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = isDark ? '#334155' : '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>{block.icon}</span>
                      <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '600' }}>{block.label}</p>
                      <p style={{ margin: 0, fontSize: '10px', color: isDark ? '#64748b' : '#94a3b8' }}>{block.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Éditeur de bloc - composant générique
const BlockEditor = ({ block, onUpdate, onDelete, onDuplicate, isDark, activeLang, styles, token }) => {
  const blockTypes = {
    // Bannières
    hero: { label: 'Hero Banner', icon: '🎯' },
    hero_advanced: { label: 'Hero Avancé', icon: '🚀' },
    // Contenu
    text: { label: 'Texte', icon: '📝' },
    text_image: { label: 'Texte + Image', icon: '📄' },
    'text-image': { label: 'Texte + Image', icon: '📄' },
    heading: { label: 'Titre Section', icon: '🔤' },
    cta: { label: 'Call to Action', icon: '⚡' },
    cta_banner: { label: 'CTA Bannière', icon: '📢' },
    // Listes & Grilles
    features: { label: 'Fonctionnalités', icon: '⭐' },
    pillars: { label: 'Piliers', icon: '🏛️' },
    cards: { label: 'Cartes', icon: '🃏' },
    stats: { label: 'Statistiques', icon: '📊' },
    zoonoses: { label: 'Zoonoses', icon: '🦠' },
    partners: { label: 'Partenaires', icon: '🤝' },
    team: { label: 'Équipe', icon: '👥' },
    timeline: { label: 'Timeline', icon: '📅' },
    // Média
    image: { label: 'Image', icon: '🖼️' },
    gallery: { label: 'Galerie', icon: '🎨' },
    video: { label: 'Vidéo', icon: '🎬' },
    map: { label: 'Carte', icon: '🗺️' },
    // Dynamique
    news: { label: 'Actualités', icon: '📰' },
    posts_grid: { label: 'Grille Articles', icon: '📑' },
    // Interaction
    testimonials: { label: 'Témoignages', icon: '💬' },
    accordion: { label: 'Accordéon/FAQ', icon: '📋' },
    tabs: { label: 'Onglets', icon: '📑' },
    contact: { label: 'Formulaire', icon: '📧' },
    // Mise en page
    columns: { label: 'Colonnes', icon: '📊' },
    grid: { label: 'Grille', icon: '⊞' },
    spacer: { label: 'Espacement', icon: '↕️' },
    divider: { label: 'Séparateur', icon: '➖' },
    // Avancé
    html: { label: 'HTML', icon: '💻' },
    embed: { label: 'Embed', icon: '🔗' },
    script: { label: 'Script', icon: '⚙️' }
  };

  const info = blockTypes[block.type] || { label: block.type, icon: '📦' };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>{info.icon}</span>
          <div>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{info.label}</h4>
            <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>ID: {block.id}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={styles.btnIcon} onClick={onDuplicate} title="Dupliquer"><Copy size={16} /></button>
          <button style={{ ...styles.btnIcon, color: colors.error }} onClick={onDelete} title="Supprimer"><Trash2 size={16} /></button>
        </div>
      </div>

      <div style={styles.divider} />

      {/* Éditeur spécifique par type */}
      {block.type === 'hero' && (
        <HeroBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {block.type === 'text' && (
        <TextBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {(block.type === 'text_image' || block.type === 'text-image') && (
        <TextImageBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} token={token} />
      )}
      {block.type === 'image' && (
        <ImageBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} token={token} />
      )}
      {block.type === 'cta' && (
        <CTABlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {block.type === 'features' && (
        <FeaturesBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {block.type === 'video' && (
        <VideoBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {block.type === 'columns' && (
        <ColumnsBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {block.type === 'spacer' && (
        <SpacerBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} styles={styles} />
      )}
      {block.type === 'divider' && (
        <DividerBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} styles={styles} />
      )}
      {block.type === 'gallery' && (
        <GalleryBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {block.type === 'testimonials' && (
        <TestimonialsBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {block.type === 'contact' && (
        <ContactBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {/* Nouveaux types de blocs */}
      {block.type === 'hero_advanced' && (
        <HeroAdvancedBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {block.type === 'heading' && (
        <HeadingBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {block.type === 'cta_banner' && (
        <CTABannerBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {block.type === 'pillars' && (
        <PillarsBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {block.type === 'cards' && (
        <CardsBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {block.type === 'stats' && (
        <StatsBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {block.type === 'zoonoses' && (
        <ZoonosesBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {block.type === 'partners' && (
        <PartnersBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {block.type === 'team' && (
        <TeamBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {block.type === 'timeline' && (
        <TimelineBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {block.type === 'map' && (
        <MapBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {block.type === 'news' && (
        <NewsBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {block.type === 'posts_grid' && (
        <PostsGridBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {block.type === 'accordion' && (
        <AccordionBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {block.type === 'tabs' && (
        <TabsBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {block.type === 'grid' && (
        <GridBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} styles={styles} />
      )}
      {block.type === 'html' && (
        <HTMLBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} styles={styles} />
      )}
      {block.type === 'embed' && (
        <EmbedBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} activeLang={activeLang} styles={styles} />
      )}
      {block.type === 'script' && (
        <ScriptBlockEditor block={block} onUpdate={onUpdate} isDark={isDark} styles={styles} />
      )}
    </div>
  );
};

// Éditeurs de blocs spécifiques
const HeroBlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => (
  <div>
    <div style={styles.mb16}>
      <label style={styles.label}>🏷️ Titre ({activeLang.toUpperCase()})</label>
      <input
        value={block.content[`title_${activeLang}`] || ''}
        onChange={e => onUpdate(`title_${activeLang}`, e.target.value)}
        style={styles.input}
        placeholder="Titre principal"
      />
    </div>
    <div style={styles.mb16}>
      <label style={styles.label}>📝 Sous-titre ({activeLang.toUpperCase()})</label>
      <textarea
        value={block.content[`subtitle_${activeLang}`] || ''}
        onChange={e => onUpdate(`subtitle_${activeLang}`, e.target.value)}
        style={{ ...styles.textarea, minHeight: '80px' }}
        placeholder="Sous-titre ou description"
      />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      <div style={styles.mb16}>
        <label style={styles.label}>🔘 Texte bouton ({activeLang.toUpperCase()})</label>
        <input
          value={block.content[`buttonText_${activeLang}`] || ''}
          onChange={e => onUpdate(`buttonText_${activeLang}`, e.target.value)}
          style={styles.input}
        />
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>🔗 Lien bouton</label>
        <input
          value={block.content.buttonUrl || ''}
          onChange={e => onUpdate('buttonUrl', e.target.value)}
          style={styles.input}
          placeholder="#section ou /page"
        />
      </div>
    </div>
    <div style={styles.divider} />
    <h5 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>🎨 Style</h5>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      <div style={styles.mb16}>
        <label style={styles.label}>Couleur fond</label>
        <input type="color" value={block.content.bgColor || '#1a1a2e'} onChange={e => onUpdate('bgColor', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>Couleur texte</label>
        <input type="color" value={block.content.textColor || '#ffffff'} onChange={e => onUpdate('textColor', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
      </div>
    </div>
    <div style={styles.mb16}>
      <label style={styles.label}>📏 Hauteur (px)</label>
      <input type="range" min="300" max="800" value={block.content.height || 500} onChange={e => onUpdate('height', e.target.value)} style={{ width: '100%' }} />
      <span style={{ fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>{block.content.height || 500}px</span>
    </div>
    <div style={styles.mb16}>
      <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" checked={block.content.overlay !== false} onChange={e => onUpdate('overlay', e.target.checked)} />
        Overlay sombre
      </label>
    </div>
  </div>
);

const TextBlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => (
  <div>
    <div style={styles.mb16}>
      <label style={styles.label}>📝 Contenu ({activeLang.toUpperCase()})</label>
      <textarea
        value={block.content[`content_${activeLang}`] || ''}
        onChange={e => onUpdate(`content_${activeLang}`, e.target.value)}
        style={{ ...styles.textarea, minHeight: '200px', fontFamily: 'monospace' }}
        placeholder="Votre texte ici... (HTML supporté)"
      />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      <div style={styles.mb16}>
        <label style={styles.label}>Alignement</label>
        <select value={block.content.textAlign || 'left'} onChange={e => onUpdate('textAlign', e.target.value)} style={{ ...styles.select, width: '100%' }}>
          <option value="left">⬅️ Gauche</option>
          <option value="center">↔️ Centre</option>
          <option value="right">➡️ Droite</option>
          <option value="justify">📐 Justifié</option>
        </select>
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>Padding (px)</label>
        <input type="number" value={block.content.padding || 40} onChange={e => onUpdate('padding', e.target.value)} style={styles.input} />
      </div>
    </div>
  </div>
);

// TextImage Block Editor - Section avec texte et image cote a cote
// Supporte le format DB direct (block.title, block.content) et le format wrapper (block.content.title)
const TextImageBlockEditor = ({ block, onUpdate, isDark, activeLang, styles, token }) => {
  // Detecter le format:
  // - Format DB direct: block.title existe directement sur le bloc
  // - Format wrapper: block.content.title existe
  const isDirectFormat = block.title && typeof block.title === 'object';
  const isWrapperFormat = block.content?.title && typeof block.content.title === 'object';

  // Obtenir le titre selon le format
  const getTitle = () => {
    if (isDirectFormat) {
      return block.title?.[activeLang] || '';
    }
    if (isWrapperFormat) {
      return block.content?.title?.[activeLang] || '';
    }
    return block.content?.[`title_${activeLang}`] || '';
  };

  // Obtenir les paragraphes selon le format
  const getParagraphs = () => {
    if (isDirectFormat) {
      // Format DB: block.content = { fr: [{type: 'paragraph', text: '...'}], en: [...] }
      const contentArray = block.content?.[activeLang] || [];
      return contentArray
        .filter(item => item.type === 'paragraph')
        .map(item => item.text || '');
    }
    if (isWrapperFormat) {
      const contentArray = block.content?.content?.[activeLang] || [];
      return contentArray
        .filter(item => item.type === 'paragraph')
        .map(item => item.text || '');
    }
    return block.content?.[`paragraphs_${activeLang}`] || [];
  };

  // Obtenir la liste selon le format
  const getList = () => {
    if (isDirectFormat) {
      const contentArray = block.content?.[activeLang] || [];
      const listItem = contentArray.find(item => item.type === 'list');
      return listItem?.items || [];
    }
    if (isWrapperFormat) {
      const contentArray = block.content?.content?.[activeLang] || [];
      const listItem = contentArray.find(item => item.type === 'list');
      return listItem?.items || [];
    }
    return block.content?.[`list_${activeLang}`] || [];
  };

  // Obtenir l'image src
  const getImageSrc = () => {
    if (isDirectFormat) {
      return block.image?.src || '';
    }
    return block.content?.image?.src || '';
  };

  // Obtenir l'alt de l'image selon le format
  const getImageAlt = () => {
    if (isDirectFormat) {
      return block.image?.alt?.[activeLang] || '';
    }
    if (isWrapperFormat) {
      return block.content?.image?.alt?.[activeLang] || '';
    }
    return block.content?.image?.[`alt_${activeLang}`] || '';
  };

  // Obtenir le layout
  const getLayout = () => {
    if (isDirectFormat) {
      return block.layout || 'text-left-image-right';
    }
    return block.content?.layout || 'text-left-image-right';
  };

  const paragraphs = getParagraphs();
  const list = getList();

  // Fonctions de mise a jour
  const updateTitle = (value) => {
    if (isDirectFormat) {
      onUpdate('title', { ...block.title, [activeLang]: value });
    } else if (isWrapperFormat) {
      onUpdate('title', { ...block.content.title, [activeLang]: value });
    } else {
      onUpdate(`title_${activeLang}`, value);
    }
  };

  const updateParagraphs = (newParagraphs) => {
    if (isDirectFormat) {
      const otherItems = (block.content?.[activeLang] || []).filter(item => item.type !== 'paragraph');
      const paragraphItems = newParagraphs.map(text => ({ type: 'paragraph', text }));
      onUpdate('content', {
        ...block.content,
        [activeLang]: [...paragraphItems, ...otherItems]
      });
    } else if (isWrapperFormat) {
      const otherItems = (block.content?.content?.[activeLang] || []).filter(item => item.type !== 'paragraph');
      const paragraphItems = newParagraphs.map(text => ({ type: 'paragraph', text }));
      onUpdate('content', {
        ...block.content.content,
        [activeLang]: [...paragraphItems, ...otherItems]
      });
    } else {
      onUpdate(`paragraphs_${activeLang}`, newParagraphs);
    }
  };

  const updateList = (newList) => {
    if (isDirectFormat) {
      const contentArray = block.content?.[activeLang] || [];
      const nonListItems = contentArray.filter(item => item.type !== 'list');
      const newContentArray = newList.length > 0
        ? [...nonListItems, { type: 'list', style: 'bullet', items: newList }]
        : nonListItems;
      onUpdate('content', {
        ...block.content,
        [activeLang]: newContentArray
      });
    } else if (isWrapperFormat) {
      const contentArray = block.content?.content?.[activeLang] || [];
      const nonListItems = contentArray.filter(item => item.type !== 'list');
      const newContentArray = newList.length > 0
        ? [...nonListItems, { type: 'list', style: 'bullet', items: newList }]
        : nonListItems;
      onUpdate('content', {
        ...block.content.content,
        [activeLang]: newContentArray
      });
    } else {
      onUpdate(`list_${activeLang}`, newList);
    }
  };

  const updateLayout = (value) => {
    if (isDirectFormat) {
      onUpdate('layout', value);
    } else {
      onUpdate('layout', value);
    }
  };

  const updateImageSrc = (value) => {
    if (isDirectFormat) {
      onUpdate('image', { ...block.image, src: value });
    } else {
      onUpdate('image', { ...block.content?.image, src: value });
    }
  };

  const updateImageAlt = (value) => {
    if (isDirectFormat) {
      onUpdate('image', {
        ...block.image,
        alt: { ...block.image?.alt, [activeLang]: value }
      });
    } else if (isWrapperFormat) {
      onUpdate('image', {
        ...block.content.image,
        alt: { ...block.content.image?.alt, [activeLang]: value }
      });
    } else {
      onUpdate('image', { ...block.content?.image, [`alt_${activeLang}`]: value });
    }
  };

  // Obtenir les dimensions de l'image
  const getImageWidth = () => {
    if (isDirectFormat) {
      return block.image?.width || '';
    }
    return block.content?.image?.width || '';
  };

  const getImageHeight = () => {
    if (isDirectFormat) {
      return block.image?.height || '';
    }
    return block.content?.image?.height || '';
  };

  const updateImageWidth = (value) => {
    const numValue = value === '' ? '' : parseInt(value) || '';
    if (isDirectFormat) {
      onUpdate('image', { ...block.image, width: numValue });
    } else {
      onUpdate('image', { ...block.content?.image, width: numValue });
    }
  };

  const updateImageHeight = (value) => {
    const numValue = value === '' ? '' : parseInt(value) || '';
    if (isDirectFormat) {
      onUpdate('image', { ...block.image, height: numValue });
    } else {
      onUpdate('image', { ...block.content?.image, height: numValue });
    }
  };

  // Obtenir et mettre à jour l'alignement de l'image
  const getImageAlign = () => {
    if (isDirectFormat) {
      return block.image?.align || 'center';
    }
    return block.content?.image?.align || 'center';
  };

  const updateImageAlign = (value) => {
    if (isDirectFormat) {
      onUpdate('image', { ...block.image, align: value });
    } else {
      onUpdate('image', { ...block.content?.image, align: value });
    }
  };

  const addParagraph = () => updateParagraphs([...paragraphs, '']);
  const updateParagraph = (index, value) => {
    const newParagraphs = [...paragraphs];
    newParagraphs[index] = value;
    updateParagraphs(newParagraphs);
  };
  const removeParagraph = (index) => updateParagraphs(paragraphs.filter((_, i) => i !== index));

  const addListItem = () => updateList([...list, '']);
  const updateListItem = (index, value) => {
    const newList = [...list];
    newList[index] = value;
    updateList(newList);
  };
  const removeListItem = (index) => updateList(list.filter((_, i) => i !== index));

  // Styles modernes
  const sectionCard = {
    background: isDark ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)'
  };

  const sectionHeader = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
  };

  const sectionIcon = {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px'
  };

  const addButton = {
    background: `linear-gradient(135deg, ${colors.cameroonGreen} 0%, #059669 100%)`,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
  };

  const inputModern = {
    ...styles.input,
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    border: `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    background: isDark ? '#0f172a' : '#ffffff'
  };

  const textareaModern = {
    ...styles.textarea,
    borderRadius: '10px',
    padding: '14px 16px',
    fontSize: '14px',
    lineHeight: '1.6',
    minHeight: '100px',
    border: `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    background: isDark ? '#0f172a' : '#ffffff',
    resize: 'vertical'
  };

  const removeButton = {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
  };

  return (
    <div>
      {/* Titre de la section */}
      <div style={sectionCard}>
        <div style={sectionHeader}>
          <div style={{ ...sectionIcon, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
            <span style={{ filter: 'brightness(0) invert(1)' }}>T</span>
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: isDark ? '#f1f5f9' : '#1e293b' }}>
              Titre de la section
            </h4>
            <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
              Langue: {activeLang.toUpperCase()}
            </p>
          </div>
        </div>
        <input
          value={getTitle()}
          onChange={e => updateTitle(e.target.value)}
          style={inputModern}
          placeholder="Entrez le titre de cette section..."
        />
      </div>

      {/* Disposition */}
      <div style={sectionCard}>
        <div style={sectionHeader}>
          <div style={{ ...sectionIcon, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
            <span style={{ filter: 'brightness(0) invert(1)' }}>D</span>
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: isDark ? '#f1f5f9' : '#1e293b' }}>
              Disposition
            </h4>
            <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
              Position du texte et de l'image
            </p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {[
            {
              value: 'text-left-image-right',
              label: 'Texte | Image',
              visual: (
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '8px' }}>
                  <div style={{ width: '24px', height: '32px', borderRadius: '4px', background: 'currentColor', opacity: 0.3 }}></div>
                  <div style={{ width: '20px', height: '32px', borderRadius: '4px', background: 'currentColor', opacity: 0.7 }}></div>
                </div>
              )
            },
            {
              value: 'image-left-text-right',
              label: 'Image | Texte',
              visual: (
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '8px' }}>
                  <div style={{ width: '20px', height: '32px', borderRadius: '4px', background: 'currentColor', opacity: 0.7 }}></div>
                  <div style={{ width: '24px', height: '32px', borderRadius: '4px', background: 'currentColor', opacity: 0.3 }}></div>
                </div>
              )
            },
            {
              value: 'full-width',
              label: 'Pleine largeur',
              visual: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ width: '44px', height: '14px', borderRadius: '3px', background: 'currentColor', opacity: 0.3 }}></div>
                  <div style={{ width: '32px', height: '18px', borderRadius: '3px', background: 'currentColor', opacity: 0.7 }}></div>
                </div>
              )
            }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => updateLayout(opt.value)}
              style={{
                padding: '14px 8px',
                background: getLayout() === opt.value
                  ? `linear-gradient(135deg, ${colors.cameroonGreen} 0%, #059669 100%)`
                  : (isDark ? '#1e293b' : '#ffffff'),
                color: getLayout() === opt.value ? '#fff' : (isDark ? '#94a3b8' : '#64748b'),
                border: `2px solid ${getLayout() === opt.value ? colors.cameroonGreen : (isDark ? '#334155' : '#e2e8f0')}`,
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                boxShadow: getLayout() === opt.value ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
              }}
            >
              {opt.visual}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Paragraphes */}
      <div style={sectionCard}>
        <div style={{ ...sectionHeader, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ ...sectionIcon, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <span style={{ filter: 'brightness(0) invert(1)' }}>P</span>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                Paragraphes ({paragraphs.length})
              </h4>
              <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                Langue: {activeLang.toUpperCase()}
              </p>
            </div>
          </div>
          <button onClick={addParagraph} style={addButton}>
            <Plus size={16} /> Ajouter
          </button>
        </div>

        {paragraphs.length === 0 ? (
          <div style={{
            padding: '32px',
            textAlign: 'center',
            background: isDark ? '#0f172a50' : '#f8fafc',
            borderRadius: '12px',
            border: `2px dashed ${isDark ? '#334155' : '#e2e8f0'}`
          }}>
            <p style={{ margin: 0, color: isDark ? '#64748b' : '#94a3b8', fontSize: '14px' }}>
              Aucun paragraphe. Cliquez sur <strong>+ Ajouter</strong> pour commencer.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {paragraphs.map((para, index) => (
              <div key={index} style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                background: isDark ? '#0f172a50' : '#f8fafc',
                padding: '12px',
                borderRadius: '12px'
              }}>
                <span style={{
                  background: colors.cameroonGreen,
                  color: '#fff',
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  flexShrink: 0,
                  marginTop: '8px'
                }}>
                  {index + 1}
                </span>
                <textarea
                  value={para}
                  onChange={e => updateParagraph(index, e.target.value)}
                  style={{ ...textareaModern, flex: 1 }}
                  placeholder={`Contenu du paragraphe ${index + 1}...`}
                />
                <button onClick={() => removeParagraph(index)} style={removeButton}>
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Liste a puces */}
      <div style={sectionCard}>
        <div style={{ ...sectionHeader, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ ...sectionIcon, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <span style={{ filter: 'brightness(0) invert(1)' }}>L</span>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                Liste a puces ({list.length})
              </h4>
              <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                Optionnel - {activeLang.toUpperCase()}
              </p>
            </div>
          </div>
          <button onClick={addListItem} style={addButton}>
            <Plus size={16} /> Ajouter
          </button>
        </div>

        {list.length === 0 ? (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            background: isDark ? '#0f172a50' : '#f8fafc',
            borderRadius: '12px',
            border: `2px dashed ${isDark ? '#334155' : '#e2e8f0'}`
          }}>
            <p style={{ margin: 0, color: isDark ? '#64748b' : '#94a3b8', fontSize: '14px' }}>
              Aucune liste. Cliquez sur <strong>+ Ajouter</strong> si besoin.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {list.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{
                  color: colors.cameroonGreen,
                  fontSize: '20px',
                  flexShrink: 0
                }}>•</span>
                <input
                  value={item}
                  onChange={e => updateListItem(index, e.target.value)}
                  style={{ ...inputModern, flex: 1 }}
                  placeholder={`Element de liste ${index + 1}...`}
                />
                <button onClick={() => removeListItem(index)} style={{ ...removeButton, padding: '8px' }}>
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image */}
      <ImagePickerSection
        getImageSrc={getImageSrc}
        updateImageSrc={updateImageSrc}
        getImageAlt={getImageAlt}
        updateImageAlt={updateImageAlt}
        getImageWidth={getImageWidth}
        updateImageWidth={updateImageWidth}
        getImageHeight={getImageHeight}
        updateImageHeight={updateImageHeight}
        getImageAlign={getImageAlign}
        updateImageAlign={updateImageAlign}
        activeLang={activeLang}
        isDark={isDark}
        styles={styles}
        token={token}
        sectionCard={sectionCard}
        sectionHeader={sectionHeader}
        sectionIcon={sectionIcon}
        inputModern={inputModern}
        removeButton={removeButton}
      />
    </div>
  );
};

// Composant ImagePickerSection avec upload et galerie media
const ImagePickerSection = ({
  getImageSrc, updateImageSrc, getImageAlt, updateImageAlt,
  getImageWidth, updateImageWidth, getImageHeight, updateImageHeight,
  getImageAlign, updateImageAlign,
  activeLang, isDark, styles, token, sectionCard, sectionHeader, sectionIcon, inputModern, removeButton
}) => {
  const [showMediaPicker, setShowMediaPicker] = React.useState(false);
  const [mediaItems, setMediaItems] = React.useState([]);
  const [loadingMedia, setLoadingMedia] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const fileInputRef = React.useRef(null);

  // Charger les medias depuis l'API
  const loadMedia = async () => {
    setLoadingMedia(true);
    try {
      const res = await api.get('/media', token);
      if (res.success) {
        // Filtrer uniquement les images
        const images = res.data.filter(m => m.mime_type?.startsWith('image'));
        setMediaItems(images);
      }
    } catch (e) {
      console.error('Erreur chargement media:', e);
    }
    setLoadingMedia(false);
  };

  // Ouvrir le picker et charger les medias
  const openMediaPicker = () => {
    setShowMediaPicker(true);
    loadMedia();
  };

  // Upload d'une nouvelle image
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('files', file);
      const res = await api.upload('/media/upload', formData, token);
      if (res.success && res.data?.length > 0) {
        // Utiliser l'URL de l'image uploadee
        updateImageSrc(res.data[0].url);
        setShowMediaPicker(false);
      }
      // Recharger la liste
      loadMedia();
    } catch (e) {
      console.error('Erreur upload:', e);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Selectionner une image existante
  const selectImage = (url) => {
    updateImageSrc(url);
    setShowMediaPicker(false);
  };

  // Filtrer les medias par recherche
  const filteredMedia = mediaItems.filter(m =>
    m.filename?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={sectionCard}>
      <div style={sectionHeader}>
        <div style={{ ...sectionIcon, background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
          <span style={{ filter: 'brightness(0) invert(1)' }}>I</span>
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: isDark ? '#f1f5f9' : '#1e293b' }}>
            Image
          </h4>
          <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
            Image d'illustration de la section
          </p>
        </div>
      </div>

      {/* Image Preview */}
      {getImageSrc() ? (
        <div style={{
          marginBottom: '16px',
          borderRadius: '12px',
          overflow: 'hidden',
          background: isDark ? '#0f172a' : '#f1f5f9',
          position: 'relative'
        }}>
          <img
            src={getImageSrc().startsWith('http') ? getImageSrc() : `http://localhost:5000${getImageSrc()}`}
            alt=""
            style={{
              width: '100%',
              maxHeight: '200px',
              objectFit: 'cover',
              display: 'block'
            }}
          />
          <button
            onClick={() => updateImageSrc('')}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              ...removeButton,
              padding: '8px'
            }}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div style={{
          padding: '30px',
          textAlign: 'center',
          background: isDark ? '#0f172a50' : '#f8fafc',
          borderRadius: '12px',
          border: `2px dashed ${isDark ? '#334155' : '#e2e8f0'}`,
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}>🖼️</div>
          <p style={{ margin: '0 0 16px', color: isDark ? '#64748b' : '#94a3b8', fontSize: '14px' }}>
            Aucune image selectionnee
          </p>
        </div>
      )}

      {/* Boutons Upload et Galerie */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <label style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 16px',
          background: `linear-gradient(135deg, ${colors.cameroonGreen} 0%, #059669 100%)`,
          color: '#fff',
          borderRadius: '10px',
          cursor: uploading ? 'wait' : 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
          opacity: uploading ? 0.7 : 1
        }}>
          <Upload size={18} />
          {uploading ? 'Upload...' : 'Uploader'}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            style={{ display: 'none' }}
            disabled={uploading}
          />
        </label>
        <button
          onClick={openMediaPicker}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: `linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)`,
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
          }}
        >
          <ImageIcon size={18} />
          Galerie
        </button>
      </div>

      {/* URL manuelle */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ ...styles.label, fontSize: '12px', marginBottom: '6px', display: 'block' }}>
          Ou entrer l'URL manuellement
        </label>
        <input
          value={getImageSrc()}
          onChange={e => updateImageSrc(e.target.value)}
          style={inputModern}
          placeholder="/uploads/pages/mon-image.png"
        />
      </div>
      <div>
        <label style={{ ...styles.label, fontSize: '12px', marginBottom: '6px', display: 'block' }}>
          Texte alternatif ({activeLang.toUpperCase()})
        </label>
        <input
          value={getImageAlt()}
          onChange={e => updateImageAlt(e.target.value)}
          style={inputModern}
          placeholder="Description de l'image pour l'accessibilite..."
        />
      </div>

      {/* Dimensions de l'image */}
      {getImageWidth && getImageHeight && (
        <div style={{ marginTop: '16px' }}>
          <label style={{ ...styles.label, fontSize: '12px', marginBottom: '6px', display: 'block' }}>
            Dimensions (largeur x hauteur en pixels)
          </label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <input
                type="number"
                value={getImageWidth()}
                onChange={e => updateImageWidth(e.target.value)}
                style={{ ...inputModern, width: '100%' }}
                placeholder="Largeur"
                min="0"
              />
            </div>
            <span style={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: '16px', fontWeight: '600' }}>×</span>
            <div style={{ flex: 1 }}>
              <input
                type="number"
                value={getImageHeight()}
                onChange={e => updateImageHeight(e.target.value)}
                style={{ ...inputModern, width: '100%' }}
                placeholder="Hauteur"
                min="0"
              />
            </div>
            <span style={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: '12px' }}>px</span>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '11px', color: isDark ? '#475569' : '#94a3b8' }}>
            Laissez vide pour utiliser les dimensions originales
          </p>
        </div>
      )}

      {/* Alignement de l'image */}
      {getImageAlign && updateImageAlign && (
        <div style={{ marginTop: '16px' }}>
          <label style={{ ...styles.label, fontSize: '12px', marginBottom: '8px', display: 'block' }}>
            Alignement de l'image
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { value: 'left', label: 'Gauche', icon: '◀' },
              { value: 'center', label: 'Centre', icon: '◆' },
              { value: 'right', label: 'Droite', icon: '▶' }
            ].map(option => {
              const isActive = getImageAlign() === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => updateImageAlign(option.value)}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: `2px solid ${isActive ? colors.cameroonGreen : (isDark ? '#334155' : '#e2e8f0')}`,
                    background: isActive
                      ? `linear-gradient(135deg, ${colors.cameroonGreen}15 0%, ${colors.cameroonGreen}25 100%)`
                      : (isDark ? '#0f172a' : '#f8fafc'),
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    color: isActive ? colors.cameroonGreen : (isDark ? '#64748b' : '#94a3b8')
                  }}>
                    {option.icon}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? colors.cameroonGreen : (isDark ? '#94a3b8' : '#64748b')
                  }}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Galerie Media */}
      {showMediaPicker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: isDark ? '#1e293b' : '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px',
              borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Galerie Media</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>
                  Selectionnez une image ou uploadez-en une nouvelle
                </p>
              </div>
              <button
                onClick={() => setShowMediaPicker(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  color: isDark ? '#94a3b8' : '#64748b'
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Search & Upload */}
            <div style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              display: 'flex',
              gap: '12px'
            }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={18} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: isDark ? '#64748b' : '#94a3b8'
                }} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    ...inputModern,
                    paddingLeft: '40px',
                    width: '100%'
                  }}
                />
              </div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 20px',
                background: `linear-gradient(135deg, ${colors.cameroonGreen} 0%, #059669 100%)`,
                color: '#fff',
                borderRadius: '10px',
                cursor: uploading ? 'wait' : 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <Upload size={18} />
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Media Grid */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '20px'
            }}>
              {loadingMedia ? (
                <div style={{ textAlign: 'center', padding: '40px', color: isDark ? '#64748b' : '#94a3b8' }}>
                  <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
                  <p style={{ marginTop: '12px' }}>Chargement...</p>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: isDark ? '#64748b' : '#94a3b8' }}>
                  <ImageIcon size={48} style={{ opacity: 0.5, marginBottom: '12px' }} />
                  <p>Aucune image trouvee</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '12px'
                }}>
                  {filteredMedia.map(item => (
                    <div
                      key={item.id}
                      onClick={() => selectImage(item.url)}
                      style={{
                        borderRadius: '10px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: getImageSrc() === item.url
                          ? `3px solid ${colors.cameroonGreen}`
                          : `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        transition: 'all 0.2s ease',
                        background: isDark ? '#0f172a' : '#f8fafc'
                      }}
                    >
                      <div style={{ height: '100px', position: 'relative' }}>
                        <img
                          src={`http://localhost:5000${item.url}`}
                          alt={item.filename}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        {getImageSrc() === item.url && (
                          <div style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            background: colors.cameroonGreen,
                            borderRadius: '50%',
                            padding: '4px'
                          }}>
                            <Check size={14} color="#fff" />
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '8px' }}>
                        <p style={{
                          margin: 0,
                          fontSize: '11px',
                          fontWeight: '500',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: isDark ? '#e2e8f0' : '#334155'
                        }}>
                          {item.filename}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ImageBlockEditor = ({ block, onUpdate, isDark, activeLang, styles, token }) => (
  <div>
    <div style={styles.mb16}>
      <label style={styles.label}>🖼️ Image</label>
      {block.content.src ? (
        <div style={{ position: 'relative', marginBottom: '8px' }}>
          <img src={block.content.src} alt="" style={{ width: '100%', borderRadius: '8px' }} />
          <button onClick={() => onUpdate('src', '')} style={{ ...styles.btnIcon, position: 'absolute', top: '8px', right: '8px', background: '#ef4444', color: '#fff' }}><X size={16} /></button>
        </div>
      ) : (
        <div style={{ padding: '40px', background: isDark ? '#0f172a' : '#f1f5f9', borderRadius: '8px', textAlign: 'center', border: `2px dashed ${isDark ? '#334155' : '#cbd5e1'}` }}>
          <ImageIcon size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
          <p style={{ margin: '0 0 8px', fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>Entrez l'URL de l'image</p>
        </div>
      )}
      <input value={block.content.src || ''} onChange={e => onUpdate('src', e.target.value)} style={styles.input} placeholder="https://..." />
    </div>
    <div style={styles.mb16}>
      <label style={styles.label}>📝 Texte alternatif ({activeLang.toUpperCase()})</label>
      <input value={block.content[`alt_${activeLang}`] || ''} onChange={e => onUpdate(`alt_${activeLang}`, e.target.value)} style={styles.input} placeholder="Description de l'image" />
    </div>
    <div style={styles.mb16}>
      <label style={styles.label}>💬 Légende ({activeLang.toUpperCase()})</label>
      <input value={block.content[`caption_${activeLang}`] || ''} onChange={e => onUpdate(`caption_${activeLang}`, e.target.value)} style={styles.input} placeholder="Légende optionnelle" />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      <div style={styles.mb16}>
        <label style={styles.label}>Largeur (%)</label>
        <input type="number" min="10" max="100" value={block.content.width || 100} onChange={e => onUpdate('width', e.target.value)} style={styles.input} />
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>Coins arrondis</label>
        <input type="number" min="0" max="50" value={block.content.borderRadius || 0} onChange={e => onUpdate('borderRadius', e.target.value)} style={styles.input} />
      </div>
    </div>
  </div>
);

const CTABlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => (
  <div>
    <div style={styles.mb16}>
      <label style={styles.label}>🏷️ Titre ({activeLang.toUpperCase()})</label>
      <input value={block.content[`title_${activeLang}`] || ''} onChange={e => onUpdate(`title_${activeLang}`, e.target.value)} style={styles.input} />
    </div>
    <div style={styles.mb16}>
      <label style={styles.label}>📝 Description ({activeLang.toUpperCase()})</label>
      <textarea value={block.content[`description_${activeLang}`] || ''} onChange={e => onUpdate(`description_${activeLang}`, e.target.value)} style={{ ...styles.textarea, minHeight: '80px' }} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      <div style={styles.mb16}>
        <label style={styles.label}>🔘 Texte bouton</label>
        <input value={block.content[`buttonText_${activeLang}`] || ''} onChange={e => onUpdate(`buttonText_${activeLang}`, e.target.value)} style={styles.input} />
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>🔗 Lien</label>
        <input value={block.content.buttonUrl || ''} onChange={e => onUpdate('buttonUrl', e.target.value)} style={styles.input} />
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      <div style={styles.mb16}>
        <label style={styles.label}>Couleur fond</label>
        <input type="color" value={block.content.bgColor || colors.cameroonGreen} onChange={e => onUpdate('bgColor', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>Couleur texte</label>
        <input type="color" value={block.content.textColor || '#ffffff'} onChange={e => onUpdate('textColor', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
      </div>
    </div>
  </div>
);

const FeaturesBlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => {
  const items = block.content.items || [];
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onUpdate('items', newItems);
  };
  const addItem = () => {
    onUpdate('items', [...items, { icon: '✨', title_fr: 'Nouvelle feature', title_en: 'New feature', desc_fr: 'Description...', desc_en: 'Description...' }]);
  };
  const removeItem = (index) => {
    onUpdate('items', items.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div style={styles.mb16}>
        <label style={styles.label}>🏷️ Titre section ({activeLang.toUpperCase()})</label>
        <input value={block.content[`title_${activeLang}`] || ''} onChange={e => onUpdate(`title_${activeLang}`, e.target.value)} style={styles.input} />
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>Colonnes</label>
        <select value={block.content.columns || 3} onChange={e => onUpdate('columns', parseInt(e.target.value))} style={{ ...styles.select, width: '100%' }}>
          <option value={2}>2 colonnes</option>
          <option value={3}>3 colonnes</option>
          <option value={4}>4 colonnes</option>
        </select>
      </div>
      <div style={styles.divider} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <label style={styles.label}>⭐ Features ({items.length})</label>
        <button onClick={addItem} style={{ ...styles.btnSecondary, padding: '6px 12px', fontSize: '12px' }}><Plus size={14} /> Ajouter</button>
      </div>
      {items.map((item, index) => (
        <div key={index} style={{ padding: '12px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '8px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <input value={item.icon || ''} onChange={e => updateItem(index, 'icon', e.target.value)} style={{ ...styles.input, width: '60px', textAlign: 'center' }} placeholder="🎯" />
            <button onClick={() => removeItem(index)} style={{ ...styles.btnIcon, color: colors.error }}><Trash2 size={14} /></button>
          </div>
          <input value={item[`title_${activeLang}`] || ''} onChange={e => updateItem(index, `title_${activeLang}`, e.target.value)} style={{ ...styles.input, marginBottom: '8px' }} placeholder="Titre" />
          <textarea value={item[`desc_${activeLang}`] || ''} onChange={e => updateItem(index, `desc_${activeLang}`, e.target.value)} style={{ ...styles.textarea, minHeight: '60px' }} placeholder="Description" />
        </div>
      ))}
    </div>
  );
};

const VideoBlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => (
  <div>
    <div style={styles.mb16}>
      <label style={styles.label}>🔗 URL de la vidéo</label>
      <input value={block.content.url || ''} onChange={e => onUpdate('url', e.target.value)} style={styles.input} placeholder="https://youtube.com/watch?v=..." />
    </div>
    <div style={styles.mb16}>
      <label style={styles.label}>Type</label>
      <select value={block.content.type || 'youtube'} onChange={e => onUpdate('type', e.target.value)} style={{ ...styles.select, width: '100%' }}>
        <option value="youtube">📺 YouTube</option>
        <option value="vimeo">🎬 Vimeo</option>
      </select>
    </div>
    <div style={styles.mb16}>
      <label style={styles.label}>🏷️ Titre ({activeLang.toUpperCase()})</label>
      <input value={block.content[`title_${activeLang}`] || ''} onChange={e => onUpdate(`title_${activeLang}`, e.target.value)} style={styles.input} placeholder="Titre de la vidéo" />
    </div>
  </div>
);

const ColumnsBlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => {
  const content = block.content.content || [];
  const updateColumn = (index, field, value) => {
    const newContent = [...content];
    newContent[index] = { ...newContent[index], [field]: value };
    onUpdate('content', newContent);
  };
  const setColumns = (num) => {
    const newContent = Array.from({ length: num }, (_, i) => content[i] || { title_fr: `Colonne ${i + 1}`, title_en: `Column ${i + 1}`, text_fr: 'Contenu...', text_en: 'Content...' });
    onUpdate('columns', num);
    onUpdate('content', newContent);
  };

  return (
    <div>
      <div style={styles.mb16}>
        <label style={styles.label}>Nombre de colonnes</label>
        <select value={block.content.columns || 2} onChange={e => setColumns(parseInt(e.target.value))} style={{ ...styles.select, width: '100%' }}>
          <option value={2}>2 colonnes</option>
          <option value={3}>3 colonnes</option>
          <option value={4}>4 colonnes</option>
        </select>
      </div>
      <div style={styles.divider} />
      {content.slice(0, block.content.columns || 2).map((col, index) => (
        <div key={index} style={{ padding: '12px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '8px', marginBottom: '12px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: '600', color: colors.cameroonGreen }}>Colonne {index + 1}</p>
          <input value={col[`title_${activeLang}`] || ''} onChange={e => updateColumn(index, `title_${activeLang}`, e.target.value)} style={{ ...styles.input, marginBottom: '8px' }} placeholder="Titre" />
          <textarea value={col[`text_${activeLang}`] || ''} onChange={e => updateColumn(index, `text_${activeLang}`, e.target.value)} style={{ ...styles.textarea, minHeight: '80px' }} placeholder="Contenu..." />
        </div>
      ))}
    </div>
  );
};

const SpacerBlockEditor = ({ block, onUpdate, isDark, styles }) => (
  <div>
    <div style={styles.mb16}>
      <label style={styles.label}>📏 Hauteur (px)</label>
      <input type="range" min="20" max="200" value={block.content.height || 60} onChange={e => onUpdate('height', e.target.value)} style={{ width: '100%' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
        <span>20px</span>
        <span style={{ fontWeight: '600' }}>{block.content.height || 60}px</span>
        <span>200px</span>
      </div>
    </div>
  </div>
);

const DividerBlockEditor = ({ block, onUpdate, isDark, styles }) => (
  <div>
    <div style={styles.mb16}>
      <label style={styles.label}>Style</label>
      <select value={block.content.style || 'solid'} onChange={e => onUpdate('style', e.target.value)} style={{ ...styles.select, width: '100%' }}>
        <option value="solid">━━━ Solide</option>
        <option value="dashed">┅┅┅ Pointillés</option>
        <option value="dotted">┄┄┄ Points</option>
      </select>
    </div>
    <div style={styles.mb16}>
      <label style={styles.label}>Couleur</label>
      <input type="color" value={block.content.color || '#e2e8f0'} onChange={e => onUpdate('color', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
    </div>
    <div style={styles.mb16}>
      <label style={styles.label}>Largeur (%)</label>
      <input type="range" min="20" max="100" value={block.content.width || 100} onChange={e => onUpdate('width', e.target.value)} style={{ width: '100%' }} />
      <span style={{ fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>{block.content.width || 100}%</span>
    </div>
  </div>
);

// Galerie d'images
const GalleryBlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => {
  const images = block.content.images || [];
  const addImage = () => {
    onUpdate('images', [...images, { src: '', alt_fr: '', alt_en: '' }]);
  };
  const updateImage = (index, field, value) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], [field]: value };
    onUpdate('images', newImages);
  };
  const removeImage = (index) => {
    onUpdate('images', images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div style={styles.mb16}>
          <label style={styles.label}>Colonnes</label>
          <select value={block.content.columns || 3} onChange={e => onUpdate('columns', parseInt(e.target.value))} style={{ ...styles.select, width: '100%' }}>
            <option value={2}>2 colonnes</option>
            <option value={3}>3 colonnes</option>
            <option value={4}>4 colonnes</option>
          </select>
        </div>
        <div style={styles.mb16}>
          <label style={styles.label}>Espacement (px)</label>
          <input type="number" value={block.content.gap || 16} onChange={e => onUpdate('gap', e.target.value)} style={styles.input} />
        </div>
      </div>
      <div style={styles.mb16}>
        <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input type="checkbox" checked={block.content.lightbox !== false} onChange={e => onUpdate('lightbox', e.target.checked)} />
          Activer lightbox (zoom au clic)
        </label>
      </div>
      <div style={styles.divider} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <label style={styles.label}>🖼️ Images ({images.length})</label>
        <button onClick={addImage} style={{ ...styles.btnSecondary, padding: '6px 12px', fontSize: '12px' }}><Plus size={14} /> Ajouter</button>
      </div>
      {images.map((img, index) => (
        <div key={index} style={{ padding: '12px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '8px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: colors.cameroonGreen }}>Image {index + 1}</span>
            <button onClick={() => removeImage(index)} style={{ ...styles.btnIcon, color: colors.error, padding: '4px' }}><Trash2 size={14} /></button>
          </div>
          <input
            value={img.src || ''}
            onChange={e => updateImage(index, 'src', e.target.value)}
            style={{ ...styles.input, marginBottom: '8px' }}
            placeholder="URL de l'image"
          />
          <input
            value={img[`alt_${activeLang}`] || ''}
            onChange={e => updateImage(index, `alt_${activeLang}`, e.target.value)}
            style={styles.input}
            placeholder={`Texte alternatif (${activeLang.toUpperCase()})`}
          />
        </div>
      ))}
    </div>
  );
};

// Témoignages
const TestimonialsBlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => {
  const items = block.content.items || [];
  const addItem = () => {
    onUpdate('items', [...items, { name: '', role_fr: '', role_en: '', text_fr: '', text_en: '', avatar: '' }]);
  };
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onUpdate('items', newItems);
  };
  const removeItem = (index) => {
    onUpdate('items', items.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div style={styles.mb16}>
        <label style={styles.label}>🏷️ Titre section ({activeLang.toUpperCase()})</label>
        <input value={block.content[`title_${activeLang}`] || ''} onChange={e => onUpdate(`title_${activeLang}`, e.target.value)} style={styles.input} />
      </div>
      <div style={styles.divider} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <label style={styles.label}>💬 Témoignages ({items.length})</label>
        <button onClick={addItem} style={{ ...styles.btnSecondary, padding: '6px 12px', fontSize: '12px' }}><Plus size={14} /> Ajouter</button>
      </div>
      {items.map((item, index) => (
        <div key={index} style={{ padding: '12px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '8px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: colors.cameroonGreen }}>Témoignage {index + 1}</span>
            <button onClick={() => removeItem(index)} style={{ ...styles.btnIcon, color: colors.error, padding: '4px' }}><Trash2 size={14} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <input value={item.name || ''} onChange={e => updateItem(index, 'name', e.target.value)} style={styles.input} placeholder="Nom" />
            <input value={item[`role_${activeLang}`] || ''} onChange={e => updateItem(index, `role_${activeLang}`, e.target.value)} style={styles.input} placeholder={`Rôle (${activeLang.toUpperCase()})`} />
          </div>
          <textarea
            value={item[`text_${activeLang}`] || ''}
            onChange={e => updateItem(index, `text_${activeLang}`, e.target.value)}
            style={{ ...styles.textarea, minHeight: '80px' }}
            placeholder={`Témoignage (${activeLang.toUpperCase()})`}
          />
          <input
            value={item.avatar || ''}
            onChange={e => updateItem(index, 'avatar', e.target.value)}
            style={{ ...styles.input, marginTop: '8px' }}
            placeholder="URL avatar (optionnel)"
          />
        </div>
      ))}
    </div>
  );
};

// Formulaire de contact
const ContactBlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => {
  const availableFields = [
    { id: 'name', label: 'Nom' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Téléphone' },
    { id: 'subject', label: 'Sujet' },
    { id: 'message', label: 'Message' }
  ];
  const selectedFields = block.content.fields || ['name', 'email', 'message'];

  const toggleField = (fieldId) => {
    if (selectedFields.includes(fieldId)) {
      onUpdate('fields', selectedFields.filter(f => f !== fieldId));
    } else {
      onUpdate('fields', [...selectedFields, fieldId]);
    }
  };

  return (
    <div>
      <div style={styles.mb16}>
        <label style={styles.label}>🏷️ Titre ({activeLang.toUpperCase()})</label>
        <input value={block.content[`title_${activeLang}`] || ''} onChange={e => onUpdate(`title_${activeLang}`, e.target.value)} style={styles.input} />
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>📝 Description ({activeLang.toUpperCase()})</label>
        <textarea value={block.content[`description_${activeLang}`] || ''} onChange={e => onUpdate(`description_${activeLang}`, e.target.value)} style={{ ...styles.textarea, minHeight: '80px' }} />
      </div>
      <div style={styles.divider} />
      <div style={styles.mb16}>
        <label style={styles.label}>📋 Champs du formulaire</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {availableFields.map(field => (
            <button
              key={field.id}
              onClick={() => toggleField(field.id)}
              style={{
                padding: '8px 16px',
                background: selectedFields.includes(field.id) ? colors.cameroonGreen : (isDark ? '#0f172a' : '#f8fafc'),
                color: selectedFields.includes(field.id) ? '#fff' : (isDark ? '#94a3b8' : '#64748b'),
                border: `1px solid ${selectedFields.includes(field.id) ? colors.cameroonGreen : (isDark ? '#334155' : '#e2e8f0')}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              {selectedFields.includes(field.id) ? '✓ ' : ''}{field.label}
            </button>
          ))}
        </div>
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>🔘 Texte bouton ({activeLang.toUpperCase()})</label>
        <input value={block.content[`submitText_${activeLang}`] || ''} onChange={e => onUpdate(`submitText_${activeLang}`, e.target.value)} style={styles.input} placeholder="Envoyer" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={styles.mb16}>
          <label style={styles.label}>Couleur bouton</label>
          <input type="color" value={block.content.buttonColor || colors.cameroonGreen} onChange={e => onUpdate('buttonColor', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
        </div>
        <div style={styles.mb16}>
          <label style={styles.label}>Email destinataire</label>
          <input value={block.content.recipientEmail || ''} onChange={e => onUpdate('recipientEmail', e.target.value)} style={styles.input} placeholder="email@example.com" />
        </div>
      </div>
    </div>
  );
};

// === NOUVEAUX ÉDITEURS DE BLOCS ===

// Hero Avancé - Avec stats, multi-CTA, piliers animés
const HeroAdvancedBlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => {
  const updateButton = (idx, field, value) => {
    const buttons = [...(block.content.buttons || [])];
    buttons[idx] = { ...buttons[idx], [field]: value };
    onUpdate('buttons', buttons);
  };
  const updateStat = (idx, field, value) => {
    const stats = [...(block.content.stats || [])];
    stats[idx] = { ...stats[idx], [field]: value };
    onUpdate('stats', stats);
  };
  const updatePillar = (idx, field, value) => {
    const pillars = [...(block.content.pillars || [])];
    pillars[idx] = { ...pillars[idx], [field]: value };
    onUpdate('pillars', pillars);
  };

  return (
    <div>
      <div style={styles.mb16}>
        <label style={styles.label}>🏷️ Badge ({activeLang.toUpperCase()})</label>
        <input value={block.content[`badge_${activeLang}`] || ''} onChange={e => onUpdate(`badge_${activeLang}`, e.target.value)} style={styles.input} placeholder="Bienvenue" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={styles.mb16}>
          <label style={styles.label}>🎯 Titre principal ({activeLang.toUpperCase()})</label>
          <input value={block.content[`title_${activeLang}`] || ''} onChange={e => onUpdate(`title_${activeLang}`, e.target.value)} style={styles.input} placeholder="One Health" />
        </div>
        <div style={styles.mb16}>
          <label style={styles.label}>✨ Accent titre ({activeLang.toUpperCase()})</label>
          <input value={block.content[`titleAccent_${activeLang}`] || ''} onChange={e => onUpdate(`titleAccent_${activeLang}`, e.target.value)} style={styles.input} placeholder="pour le Cameroun" />
        </div>
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>📝 Description ({activeLang.toUpperCase()})</label>
        <textarea value={block.content[`description_${activeLang}`] || ''} onChange={e => onUpdate(`description_${activeLang}`, e.target.value)} style={{ ...styles.textarea, minHeight: '80px' }} placeholder="Description du hero" />
      </div>

      <div style={styles.divider} />
      <h5 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '600' }}>🔘 Boutons d'action ({(block.content.buttons || []).length})</h5>
      {(block.content.buttons || []).map((btn, idx) => (
        <div key={idx} style={{ padding: '12px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '8px', marginBottom: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <input value={btn[`text_${activeLang}`] || ''} onChange={e => updateButton(idx, `text_${activeLang}`, e.target.value)} style={styles.input} placeholder="Texte" />
            <input value={btn.url || ''} onChange={e => updateButton(idx, 'url', e.target.value)} style={styles.input} placeholder="URL" />
            <select value={btn.style || 'primary'} onChange={e => updateButton(idx, 'style', e.target.value)} style={styles.select}>
              <option value="primary">Primaire</option>
              <option value="secondary">Secondaire</option>
              <option value="outline">Contour</option>
            </select>
          </div>
        </div>
      ))}
      <button onClick={() => onUpdate('buttons', [...(block.content.buttons || []), { text_fr: 'Nouveau', text_en: 'New', url: '/', style: 'primary' }])} style={{ ...styles.btnSecondary, fontSize: '12px', padding: '8px 12px' }}>+ Ajouter bouton</button>

      <div style={styles.divider} />
      <h5 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '600' }}>📊 Statistiques ({(block.content.stats || []).length})</h5>
      {(block.content.stats || []).map((stat, idx) => (
        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 80px', gap: '8px', marginBottom: '8px' }}>
          <input value={stat.value || ''} onChange={e => updateStat(idx, 'value', e.target.value)} style={styles.input} placeholder="09" />
          <input value={stat[`label_${activeLang}`] || ''} onChange={e => updateStat(idx, `label_${activeLang}`, e.target.value)} style={styles.input} placeholder="Ministères" />
          <button onClick={() => onUpdate('stats', (block.content.stats || []).filter((_, i) => i !== idx))} style={{ ...styles.btnIcon, color: colors.error }}><Trash2 size={14} /></button>
        </div>
      ))}
      <button onClick={() => onUpdate('stats', [...(block.content.stats || []), { value: '0', label_fr: 'Label', label_en: 'Label', icon: 'star' }])} style={{ ...styles.btnSecondary, fontSize: '12px', padding: '8px 12px' }}>+ Ajouter stat</button>

      <div style={styles.divider} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <label style={{ ...styles.label, margin: 0 }}>🏛️ Afficher piliers</label>
        <input type="checkbox" checked={block.content.showPillars || false} onChange={e => onUpdate('showPillars', e.target.checked)} />
      </div>
      {block.content.showPillars && (
        <div>
          {(block.content.pillars || []).map((pillar, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 40px', gap: '8px', marginBottom: '8px' }}>
              <input value={pillar[`label_${activeLang}`] || ''} onChange={e => updatePillar(idx, `label_${activeLang}`, e.target.value)} style={styles.input} placeholder="Label" />
              <input type="color" value={pillar.color || '#2196F3'} onChange={e => updatePillar(idx, 'color', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
              <input value={pillar.icon || ''} onChange={e => updatePillar(idx, 'icon', e.target.value)} style={styles.input} placeholder="Emoji" />
            </div>
          ))}
        </div>
      )}

      <div style={styles.divider} />
      <h5 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '600' }}>🎨 Style</h5>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={styles.mb16}>
          <label style={styles.label}>Gradient fond</label>
          <input value={block.content.bgGradient || ''} onChange={e => onUpdate('bgGradient', e.target.value)} style={styles.input} placeholder="linear-gradient(135deg, #1a1a2e, #16213e)" />
        </div>
        <div style={styles.mb16}>
          <label style={styles.label}>Image fond</label>
          <input value={block.content.bgImage || ''} onChange={e => onUpdate('bgImage', e.target.value)} style={styles.input} placeholder="URL image" />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label style={{ ...styles.label, margin: 0 }}>🌊 Vague décorative</label>
        <input type="checkbox" checked={block.content.showWave || false} onChange={e => onUpdate('showWave', e.target.checked)} />
      </div>
    </div>
  );
};

// Heading - Titre de section avec badge
const HeadingBlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => (
  <div>
    <div style={styles.mb16}>
      <label style={styles.label}>🏷️ Badge ({activeLang.toUpperCase()})</label>
      <input value={block.content[`badge_${activeLang}`] || ''} onChange={e => onUpdate(`badge_${activeLang}`, e.target.value)} style={styles.input} placeholder="Notre mission" />
    </div>
    <div style={styles.mb16}>
      <label style={styles.label}>📌 Titre ({activeLang.toUpperCase()})</label>
      <input value={block.content[`title_${activeLang}`] || ''} onChange={e => onUpdate(`title_${activeLang}`, e.target.value)} style={styles.input} placeholder="Titre de section" />
    </div>
    <div style={styles.mb16}>
      <label style={styles.label}>📝 Sous-titre ({activeLang.toUpperCase()})</label>
      <textarea value={block.content[`subtitle_${activeLang}`] || ''} onChange={e => onUpdate(`subtitle_${activeLang}`, e.target.value)} style={{ ...styles.textarea, minHeight: '60px' }} placeholder="Description optionnelle" />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
      <div style={styles.mb16}>
        <label style={styles.label}>Niveau titre</label>
        <select value={block.content.level || 'h2'} onChange={e => onUpdate('level', e.target.value)} style={styles.select}>
          <option value="h1">H1</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
        </select>
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>Alignement</label>
        <select value={block.content.align || 'center'} onChange={e => onUpdate('align', e.target.value)} style={styles.select}>
          <option value="left">Gauche</option>
          <option value="center">Centre</option>
          <option value="right">Droite</option>
        </select>
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>Couleur badge</label>
        <input type="color" value={block.content.badgeColor || colors.cameroonGreen} onChange={e => onUpdate('badgeColor', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
      </div>
    </div>
  </div>
);

// CTA Banner - Bannière call-to-action large
const CTABannerBlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => (
  <div>
    <div style={styles.mb16}>
      <label style={styles.label}>📌 Titre ({activeLang.toUpperCase()})</label>
      <input value={block.content[`title_${activeLang}`] || ''} onChange={e => onUpdate(`title_${activeLang}`, e.target.value)} style={styles.input} placeholder="Rejoignez-nous" />
    </div>
    <div style={styles.mb16}>
      <label style={styles.label}>📝 Description ({activeLang.toUpperCase()})</label>
      <textarea value={block.content[`description_${activeLang}`] || ''} onChange={e => onUpdate(`description_${activeLang}`, e.target.value)} style={{ ...styles.textarea, minHeight: '60px' }} placeholder="Description" />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      <div style={styles.mb16}>
        <label style={styles.label}>🔘 Texte bouton ({activeLang.toUpperCase()})</label>
        <input value={block.content[`buttonText_${activeLang}`] || ''} onChange={e => onUpdate(`buttonText_${activeLang}`, e.target.value)} style={styles.input} />
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>🔗 Lien</label>
        <input value={block.content.buttonUrl || ''} onChange={e => onUpdate('buttonUrl', e.target.value)} style={styles.input} placeholder="/contact" />
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
      <div style={styles.mb16}>
        <label style={styles.label}>Couleur fond</label>
        <input type="color" value={block.content.bgColor || colors.cameroonGreen} onChange={e => onUpdate('bgColor', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>Couleur texte</label>
        <input type="color" value={block.content.textColor || '#ffffff'} onChange={e => onUpdate('textColor', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>Couleur bouton</label>
        <input type="color" value={block.content.buttonColor || '#ffffff'} onChange={e => onUpdate('buttonColor', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <label style={{ ...styles.label, margin: 0 }}>🌊 Vague décorative</label>
      <input type="checkbox" checked={block.content.showWave || false} onChange={e => onUpdate('showWave', e.target.checked)} />
    </div>
  </div>
);

// Pillars - Les 3 piliers One Health
const PillarsBlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => {
  const updatePillar = (idx, field, value) => {
    const pillars = [...(block.content.pillars || [])];
    pillars[idx] = { ...pillars[idx], [field]: value };
    onUpdate('pillars', pillars);
  };
  const updateFeature = (pillarIdx, featureIdx, field, value) => {
    const pillars = [...(block.content.pillars || [])];
    const features = [...(pillars[pillarIdx].features || [])];
    features[featureIdx] = { ...features[featureIdx], [field]: value };
    pillars[pillarIdx] = { ...pillars[pillarIdx], features };
    onUpdate('pillars', pillars);
  };

  return (
    <div>
      <div style={styles.mb16}>
        <label style={styles.label}>📌 Titre section ({activeLang.toUpperCase()})</label>
        <input value={block.content[`title_${activeLang}`] || ''} onChange={e => onUpdate(`title_${activeLang}`, e.target.value)} style={styles.input} placeholder="Les 3 Piliers One Health" />
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>🏷️ Badge ({activeLang.toUpperCase()})</label>
        <input value={block.content[`badge_${activeLang}`] || ''} onChange={e => onUpdate(`badge_${activeLang}`, e.target.value)} style={styles.input} placeholder="Notre approche" />
      </div>

      <div style={styles.divider} />
      <h5 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '600' }}>🏛️ Piliers ({(block.content.pillars || []).length})</h5>
      {(block.content.pillars || []).map((pillar, idx) => (
        <div key={idx} style={{ padding: '16px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px', marginBottom: '12px', borderLeft: `4px solid ${pillar.color || '#007A33'}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <input value={pillar[`title_${activeLang}`] || ''} onChange={e => updatePillar(idx, `title_${activeLang}`, e.target.value)} style={styles.input} placeholder="Titre" />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="color" value={pillar.color || '#007A33'} onChange={e => updatePillar(idx, 'color', e.target.value)} style={{ width: '48px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
              <input value={pillar.icon || ''} onChange={e => updatePillar(idx, 'icon', e.target.value)} style={{ ...styles.input, width: '60px' }} placeholder="Emoji" />
            </div>
          </div>
          <textarea value={pillar[`description_${activeLang}`] || ''} onChange={e => updatePillar(idx, `description_${activeLang}`, e.target.value)} style={{ ...styles.textarea, minHeight: '50px' }} placeholder="Description" />
          <div style={{ marginTop: '8px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', color: isDark ? '#64748b' : '#94a3b8', marginBottom: '4px' }}>Caractéristiques:</p>
            {(pillar.features || []).map((feat, fIdx) => (
              <div key={fIdx} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                <input value={feat[`text_${activeLang}`] || ''} onChange={e => updateFeature(idx, fIdx, `text_${activeLang}`, e.target.value)} style={{ ...styles.input, flex: 1, padding: '8px 12px' }} placeholder="Caractéristique" />
                <button onClick={() => updatePillar(idx, 'features', (pillar.features || []).filter((_, i) => i !== fIdx))} style={{ ...styles.btnIcon, color: colors.error, padding: '4px' }}><X size={12} /></button>
              </div>
            ))}
            <button onClick={() => updatePillar(idx, 'features', [...(pillar.features || []), { text_fr: '', text_en: '' }])} style={{ fontSize: '11px', padding: '4px 8px', background: 'transparent', border: 'none', color: colors.cameroonGreen, cursor: 'pointer' }}>+ Caractéristique</button>
          </div>
        </div>
      ))}
      <button onClick={() => onUpdate('pillars', [...(block.content.pillars || []), { title_fr: 'Nouveau pilier', title_en: 'New pillar', color: '#007A33', icon: '🏥', features: [] }])} style={{ ...styles.btnSecondary, fontSize: '12px', padding: '8px 12px' }}>+ Ajouter pilier</button>

      <div style={styles.divider} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label style={{ ...styles.label, margin: 0 }}>🔄 Animation diagramme</label>
        <input type="checkbox" checked={block.content.showDiagram || false} onChange={e => onUpdate('showDiagram', e.target.checked)} />
      </div>
    </div>
  );
};

// Cards - Cartes génériques
const CardsBlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => {
  const updateCard = (idx, field, value) => {
    const cards = [...(block.content.cards || [])];
    cards[idx] = { ...cards[idx], [field]: value };
    onUpdate('cards', cards);
  };

  return (
    <div>
      <div style={styles.mb16}>
        <label style={styles.label}>📌 Titre section ({activeLang.toUpperCase()})</label>
        <input value={block.content[`title_${activeLang}`] || ''} onChange={e => onUpdate(`title_${activeLang}`, e.target.value)} style={styles.input} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={styles.mb16}>
          <label style={styles.label}>Colonnes</label>
          <select value={block.content.columns || 3} onChange={e => onUpdate('columns', parseInt(e.target.value))} style={styles.select}>
            <option value={2}>2 colonnes</option>
            <option value={3}>3 colonnes</option>
            <option value={4}>4 colonnes</option>
          </select>
        </div>
        <div style={styles.mb16}>
          <label style={styles.label}>Style carte</label>
          <select value={block.content.cardStyle || 'default'} onChange={e => onUpdate('cardStyle', e.target.value)} style={styles.select}>
            <option value="default">Défaut</option>
            <option value="bordered">Bordure</option>
            <option value="elevated">Élevé</option>
            <option value="gradient">Gradient</option>
          </select>
        </div>
      </div>

      <div style={styles.divider} />
      <h5 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '600' }}>🃏 Cartes ({(block.content.cards || []).length})</h5>
      {(block.content.cards || []).map((card, idx) => (
        <div key={idx} style={{ padding: '12px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '8px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600' }}>Carte {idx + 1}</span>
            <button onClick={() => onUpdate('cards', (block.content.cards || []).filter((_, i) => i !== idx))} style={{ ...styles.btnIcon, color: colors.error, padding: '4px' }}><Trash2 size={14} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '8px', marginBottom: '8px' }}>
            <input value={card.icon || ''} onChange={e => updateCard(idx, 'icon', e.target.value)} style={styles.input} placeholder="Emoji" />
            <input value={card[`title_${activeLang}`] || ''} onChange={e => updateCard(idx, `title_${activeLang}`, e.target.value)} style={styles.input} placeholder="Titre" />
          </div>
          <textarea value={card[`description_${activeLang}`] || ''} onChange={e => updateCard(idx, `description_${activeLang}`, e.target.value)} style={{ ...styles.textarea, minHeight: '50px' }} placeholder="Description" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
            <input value={card.link || ''} onChange={e => updateCard(idx, 'link', e.target.value)} style={styles.input} placeholder="Lien (optionnel)" />
            <input type="color" value={card.color || colors.cameroonGreen} onChange={e => updateCard(idx, 'color', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
          </div>
        </div>
      ))}
      <button onClick={() => onUpdate('cards', [...(block.content.cards || []), { icon: '📌', title_fr: 'Nouvelle carte', title_en: 'New card', description_fr: '', description_en: '', color: colors.cameroonGreen }])} style={{ ...styles.btnSecondary, fontSize: '12px', padding: '8px 12px' }}>+ Ajouter carte</button>
    </div>
  );
};

// Stats - Statistiques/Chiffres clés
const StatsBlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => {
  const updateStat = (idx, field, value) => {
    const stats = [...(block.content.stats || [])];
    stats[idx] = { ...stats[idx], [field]: value };
    onUpdate('stats', stats);
  };

  return (
    <div>
      <div style={styles.mb16}>
        <label style={styles.label}>📌 Titre section ({activeLang.toUpperCase()})</label>
        <input value={block.content[`title_${activeLang}`] || ''} onChange={e => onUpdate(`title_${activeLang}`, e.target.value)} style={styles.input} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={styles.mb16}>
          <label style={styles.label}>Couleur fond</label>
          <input type="color" value={block.content.bgColor || colors.dark} onChange={e => onUpdate('bgColor', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
        </div>
        <div style={styles.mb16}>
          <label style={styles.label}>Style</label>
          <select value={block.content.style || 'cards'} onChange={e => onUpdate('style', e.target.value)} style={styles.select}>
            <option value="cards">Cartes</option>
            <option value="inline">En ligne</option>
            <option value="grid">Grille</option>
          </select>
        </div>
      </div>

      <div style={styles.divider} />
      <h5 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '600' }}>📊 Statistiques ({(block.content.stats || []).length})</h5>
      {(block.content.stats || []).map((stat, idx) => (
        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 60px 40px', gap: '8px', marginBottom: '8px' }}>
          <input value={stat.value || ''} onChange={e => updateStat(idx, 'value', e.target.value)} style={styles.input} placeholder="100+" />
          <input value={stat[`label_${activeLang}`] || ''} onChange={e => updateStat(idx, `label_${activeLang}`, e.target.value)} style={styles.input} placeholder="Partenaires" />
          <input value={stat.icon || ''} onChange={e => updateStat(idx, 'icon', e.target.value)} style={styles.input} placeholder="Emoji" />
          <button onClick={() => onUpdate('stats', (block.content.stats || []).filter((_, i) => i !== idx))} style={{ ...styles.btnIcon, color: colors.error }}><Trash2 size={14} /></button>
        </div>
      ))}
      <button onClick={() => onUpdate('stats', [...(block.content.stats || []), { value: '0', label_fr: 'Label', label_en: 'Label', icon: '📊' }])} style={{ ...styles.btnSecondary, fontSize: '12px', padding: '8px 12px' }}>+ Ajouter statistique</button>

      <div style={styles.divider} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label style={{ ...styles.label, margin: 0 }}>🔢 Animation compteur</label>
        <input type="checkbox" checked={block.content.animated || false} onChange={e => onUpdate('animated', e.target.checked)} />
      </div>
    </div>
  );
};

// Zoonoses - Maladies zoonotiques
const ZoonosesBlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => {
  const updateDisease = (idx, field, value) => {
    const diseases = [...(block.content.diseases || [])];
    diseases[idx] = { ...diseases[idx], [field]: value };
    onUpdate('diseases', diseases);
  };

  return (
    <div>
      <div style={styles.mb16}>
        <label style={styles.label}>📌 Titre section ({activeLang.toUpperCase()})</label>
        <input value={block.content[`title_${activeLang}`] || ''} onChange={e => onUpdate(`title_${activeLang}`, e.target.value)} style={styles.input} />
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>🏷️ Badge ({activeLang.toUpperCase()})</label>
        <input value={block.content[`badge_${activeLang}`] || ''} onChange={e => onUpdate(`badge_${activeLang}`, e.target.value)} style={styles.input} placeholder="Zoonoses prioritaires" />
      </div>

      <div style={styles.divider} />
      <h5 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '600' }}>🦠 Maladies ({(block.content.diseases || []).length})</h5>
      {(block.content.diseases || []).map((disease, idx) => (
        <div key={idx} style={{ padding: '12px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '8px', marginBottom: '8px', borderLeft: `4px solid ${disease.color || colors.cameroonRed}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <input value={disease[`name_${activeLang}`] || ''} onChange={e => updateDisease(idx, `name_${activeLang}`, e.target.value)} style={{ ...styles.input, flex: 1 }} placeholder="Nom de la maladie" />
            <button onClick={() => onUpdate('diseases', (block.content.diseases || []).filter((_, i) => i !== idx))} style={{ ...styles.btnIcon, color: colors.error }}><Trash2 size={14} /></button>
          </div>
          <textarea value={disease[`description_${activeLang}`] || ''} onChange={e => updateDisease(idx, `description_${activeLang}`, e.target.value)} style={{ ...styles.textarea, minHeight: '40px' }} placeholder="Description courte" />
          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 60px', gap: '8px', marginTop: '8px' }}>
            <input value={disease.icon || ''} onChange={e => updateDisease(idx, 'icon', e.target.value)} style={styles.input} placeholder="Emoji" />
            <input value={disease.link || ''} onChange={e => updateDisease(idx, 'link', e.target.value)} style={styles.input} placeholder="Lien détails" />
            <input type="color" value={disease.color || colors.cameroonRed} onChange={e => updateDisease(idx, 'color', e.target.value)} style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
          </div>
        </div>
      ))}
      <button onClick={() => onUpdate('diseases', [...(block.content.diseases || []), { name_fr: 'Maladie', name_en: 'Disease', description_fr: '', description_en: '', icon: '🦠', color: colors.cameroonRed }])} style={{ ...styles.btnSecondary, fontSize: '12px', padding: '8px 12px' }}>+ Ajouter maladie</button>

      <div style={styles.divider} />
      <div style={styles.mb16}>
        <label style={styles.label}>🔗 Lien "En savoir plus"</label>
        <input value={block.content.moreLink || ''} onChange={e => onUpdate('moreLink', e.target.value)} style={styles.input} placeholder="/zoonoses" />
      </div>
    </div>
  );
};

// Partners - Logo partenaires
const PartnersBlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => {
  const updatePartner = (idx, field, value) => {
    const partners = [...(block.content.partners || [])];
    partners[idx] = { ...partners[idx], [field]: value };
    onUpdate('partners', partners);
  };

  return (
    <div>
      <div style={styles.mb16}>
        <label style={styles.label}>📌 Titre section ({activeLang.toUpperCase()})</label>
        <input value={block.content[`title_${activeLang}`] || ''} onChange={e => onUpdate(`title_${activeLang}`, e.target.value)} style={styles.input} />
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>🏷️ Badge ({activeLang.toUpperCase()})</label>
        <input value={block.content[`badge_${activeLang}`] || ''} onChange={e => onUpdate(`badge_${activeLang}`, e.target.value)} style={styles.input} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={styles.mb16}>
          <label style={styles.label}>Colonnes</label>
          <select value={block.content.columns || 6} onChange={e => onUpdate('columns', parseInt(e.target.value))} style={styles.select}>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
            <option value={8}>8</option>
          </select>
        </div>
        <div style={styles.mb16}>
          <label style={styles.label}>Style</label>
          <select value={block.content.style || 'grid'} onChange={e => onUpdate('style', e.target.value)} style={styles.select}>
            <option value="grid">Grille</option>
            <option value="carousel">Carrousel</option>
            <option value="marquee">Défilant</option>
          </select>
        </div>
      </div>

      <div style={styles.divider} />
      <h5 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '600' }}>🤝 Partenaires ({(block.content.partners || []).length})</h5>
      {(block.content.partners || []).map((partner, idx) => (
        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 40px', gap: '8px', marginBottom: '8px' }}>
          <input value={partner.name || ''} onChange={e => updatePartner(idx, 'name', e.target.value)} style={styles.input} placeholder="Nom partenaire" />
          <input value={partner.logo || ''} onChange={e => updatePartner(idx, 'logo', e.target.value)} style={styles.input} placeholder="URL logo" />
          <button onClick={() => onUpdate('partners', (block.content.partners || []).filter((_, i) => i !== idx))} style={{ ...styles.btnIcon, color: colors.error }}><Trash2 size={14} /></button>
        </div>
      ))}
      <button onClick={() => onUpdate('partners', [...(block.content.partners || []), { name: 'Nouveau', logo: '' }])} style={{ ...styles.btnSecondary, fontSize: '12px', padding: '8px 12px' }}>+ Ajouter partenaire</button>

      <div style={styles.divider} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label style={{ ...styles.label, margin: 0 }}>Niveaux de gris</label>
        <input type="checkbox" checked={block.content.grayscale !== false} onChange={e => onUpdate('grayscale', e.target.checked)} />
      </div>
    </div>
  );
};

// Team - Équipe
const TeamBlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => {
  const updateMember = (idx, field, value) => {
    const members = [...(block.content.members || [])];
    members[idx] = { ...members[idx], [field]: value };
    onUpdate('members', members);
  };

  return (
    <div>
      <div style={styles.mb16}>
        <label style={styles.label}>📌 Titre section ({activeLang.toUpperCase()})</label>
        <input value={block.content[`title_${activeLang}`] || ''} onChange={e => onUpdate(`title_${activeLang}`, e.target.value)} style={styles.input} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={styles.mb16}>
          <label style={styles.label}>Colonnes</label>
          <select value={block.content.columns || 4} onChange={e => onUpdate('columns', parseInt(e.target.value))} style={styles.select}>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </div>
        <div style={styles.mb16}>
          <label style={styles.label}>Style</label>
          <select value={block.content.style || 'cards'} onChange={e => onUpdate('style', e.target.value)} style={styles.select}>
            <option value="cards">Cartes</option>
            <option value="grid">Grille</option>
            <option value="list">Liste</option>
          </select>
        </div>
      </div>

      <div style={styles.divider} />
      <h5 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '600' }}>👥 Membres ({(block.content.members || []).length})</h5>
      {(block.content.members || []).map((member, idx) => (
        <div key={idx} style={{ padding: '12px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '8px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600' }}>Membre {idx + 1}</span>
            <button onClick={() => onUpdate('members', (block.content.members || []).filter((_, i) => i !== idx))} style={{ ...styles.btnIcon, color: colors.error, padding: '4px' }}><Trash2 size={14} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <input value={member.name || ''} onChange={e => updateMember(idx, 'name', e.target.value)} style={styles.input} placeholder="Nom" />
            <input value={member[`role_${activeLang}`] || ''} onChange={e => updateMember(idx, `role_${activeLang}`, e.target.value)} style={styles.input} placeholder="Rôle" />
          </div>
          <input value={member.photo || ''} onChange={e => updateMember(idx, 'photo', e.target.value)} style={{ ...styles.input, marginBottom: '8px' }} placeholder="URL photo" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <input value={member.email || ''} onChange={e => updateMember(idx, 'email', e.target.value)} style={styles.input} placeholder="Email" />
            <input value={member.linkedin || ''} onChange={e => updateMember(idx, 'linkedin', e.target.value)} style={styles.input} placeholder="LinkedIn" />
            <input value={member.twitter || ''} onChange={e => updateMember(idx, 'twitter', e.target.value)} style={styles.input} placeholder="Twitter" />
          </div>
        </div>
      ))}
      <button onClick={() => onUpdate('members', [...(block.content.members || []), { name: '', role_fr: '', role_en: '', photo: '' }])} style={{ ...styles.btnSecondary, fontSize: '12px', padding: '8px 12px' }}>+ Ajouter membre</button>
    </div>
  );
};

// Timeline - Chronologie
const TimelineBlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => {
  const updateEvent = (idx, field, value) => {
    const events = [...(block.content.events || [])];
    events[idx] = { ...events[idx], [field]: value };
    onUpdate('events', events);
  };

  return (
    <div>
      <div style={styles.mb16}>
        <label style={styles.label}>📌 Titre section ({activeLang.toUpperCase()})</label>
        <input value={block.content[`title_${activeLang}`] || ''} onChange={e => onUpdate(`title_${activeLang}`, e.target.value)} style={styles.input} />
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>Orientation</label>
        <select value={block.content.orientation || 'vertical'} onChange={e => onUpdate('orientation', e.target.value)} style={styles.select}>
          <option value="vertical">Verticale</option>
          <option value="horizontal">Horizontale</option>
        </select>
      </div>

      <div style={styles.divider} />
      <h5 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '600' }}>📅 Événements ({(block.content.events || []).length})</h5>
      {(block.content.events || []).map((event, idx) => (
        <div key={idx} style={{ padding: '12px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '8px', marginBottom: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 40px', gap: '8px', marginBottom: '8px' }}>
            <input value={event.date || ''} onChange={e => updateEvent(idx, 'date', e.target.value)} style={styles.input} placeholder="2024" />
            <input value={event[`title_${activeLang}`] || ''} onChange={e => updateEvent(idx, `title_${activeLang}`, e.target.value)} style={styles.input} placeholder="Titre" />
            <button onClick={() => onUpdate('events', (block.content.events || []).filter((_, i) => i !== idx))} style={{ ...styles.btnIcon, color: colors.error }}><Trash2 size={14} /></button>
          </div>
          <textarea value={event[`description_${activeLang}`] || ''} onChange={e => updateEvent(idx, `description_${activeLang}`, e.target.value)} style={{ ...styles.textarea, minHeight: '40px' }} placeholder="Description" />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <input value={event.icon || ''} onChange={e => updateEvent(idx, 'icon', e.target.value)} style={{ ...styles.input, width: '60px' }} placeholder="Emoji" />
            <input type="color" value={event.color || colors.cameroonGreen} onChange={e => updateEvent(idx, 'color', e.target.value)} style={{ width: '48px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }} />
          </div>
        </div>
      ))}
      <button onClick={() => onUpdate('events', [...(block.content.events || []), { date: '', title_fr: '', title_en: '', description_fr: '', description_en: '', icon: '📌', color: colors.cameroonGreen }])} style={{ ...styles.btnSecondary, fontSize: '12px', padding: '8px 12px' }}>+ Ajouter événement</button>
    </div>
  );
};

// Map - Carte intégrée
const MapBlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => (
  <div>
    <div style={styles.mb16}>
      <label style={styles.label}>📌 Titre ({activeLang.toUpperCase()})</label>
      <input value={block.content[`title_${activeLang}`] || ''} onChange={e => onUpdate(`title_${activeLang}`, e.target.value)} style={styles.input} />
    </div>
    <div style={styles.mb16}>
      <label style={styles.label}>🗺️ Type de carte</label>
      <select value={block.content.type || 'iframe'} onChange={e => onUpdate('type', e.target.value)} style={styles.select}>
        <option value="iframe">Google Maps (iframe)</option>
        <option value="osm">OpenStreetMap</option>
        <option value="custom">SVG personnalisé</option>
      </select>
    </div>
    {block.content.type === 'iframe' && (
      <div style={styles.mb16}>
        <label style={styles.label}>🔗 URL iframe</label>
        <textarea value={block.content.embedUrl || ''} onChange={e => onUpdate('embedUrl', e.target.value)} style={{ ...styles.textarea, minHeight: '80px' }} placeholder="<iframe src='...'></iframe> ou URL directe" />
      </div>
    )}
    {block.content.type === 'osm' && (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <div style={styles.mb16}>
          <label style={styles.label}>Latitude</label>
          <input value={block.content.lat || ''} onChange={e => onUpdate('lat', e.target.value)} style={styles.input} placeholder="3.848" />
        </div>
        <div style={styles.mb16}>
          <label style={styles.label}>Longitude</label>
          <input value={block.content.lng || ''} onChange={e => onUpdate('lng', e.target.value)} style={styles.input} placeholder="11.502" />
        </div>
        <div style={styles.mb16}>
          <label style={styles.label}>Zoom</label>
          <input type="number" value={block.content.zoom || 12} onChange={e => onUpdate('zoom', parseInt(e.target.value))} style={styles.input} min="1" max="20" />
        </div>
      </div>
    )}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      <div style={styles.mb16}>
        <label style={styles.label}>Hauteur (px)</label>
        <input type="number" value={block.content.height || 400} onChange={e => onUpdate('height', parseInt(e.target.value))} style={styles.input} />
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>Bordure radius</label>
        <input type="number" value={block.content.borderRadius || 12} onChange={e => onUpdate('borderRadius', parseInt(e.target.value))} style={styles.input} />
      </div>
    </div>
  </div>
);

// News - Actualités dynamiques
const NewsBlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => (
  <div>
    <div style={styles.mb16}>
      <label style={styles.label}>📌 Titre section ({activeLang.toUpperCase()})</label>
      <input value={block.content[`title_${activeLang}`] || ''} onChange={e => onUpdate(`title_${activeLang}`, e.target.value)} style={styles.input} />
    </div>
    <div style={styles.mb16}>
      <label style={styles.label}>🏷️ Badge ({activeLang.toUpperCase()})</label>
      <input value={block.content[`badge_${activeLang}`] || ''} onChange={e => onUpdate(`badge_${activeLang}`, e.target.value)} style={styles.input} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
      <div style={styles.mb16}>
        <label style={styles.label}>Nombre d'articles</label>
        <input type="number" value={block.content.limit || 3} onChange={e => onUpdate('limit', parseInt(e.target.value))} style={styles.input} min="1" max="12" />
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>Colonnes</label>
        <select value={block.content.columns || 3} onChange={e => onUpdate('columns', parseInt(e.target.value))} style={styles.select}>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>Style carte</label>
        <select value={block.content.cardStyle || 'default'} onChange={e => onUpdate('cardStyle', e.target.value)} style={styles.select}>
          <option value="default">Défaut</option>
          <option value="minimal">Minimal</option>
          <option value="featured">Featured</option>
        </select>
      </div>
    </div>
    <div style={styles.mb16}>
      <label style={styles.label}>Catégorie (ID optionnel)</label>
      <input value={block.content.categoryId || ''} onChange={e => onUpdate('categoryId', e.target.value)} style={styles.input} placeholder="Laisser vide pour toutes" />
    </div>
    <div style={styles.mb16}>
      <label style={styles.label}>🔗 Lien "Voir tout"</label>
      <input value={block.content.viewAllLink || '/news'} onChange={e => onUpdate('viewAllLink', e.target.value)} style={styles.input} />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <label style={{ ...styles.label, margin: 0 }}>Afficher date</label>
      <input type="checkbox" checked={block.content.showDate !== false} onChange={e => onUpdate('showDate', e.target.checked)} />
    </div>
  </div>
);

// Posts Grid - Grille d'articles
const PostsGridBlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => (
  <div>
    <div style={styles.mb16}>
      <label style={styles.label}>📌 Titre section ({activeLang.toUpperCase()})</label>
      <input value={block.content[`title_${activeLang}`] || ''} onChange={e => onUpdate(`title_${activeLang}`, e.target.value)} style={styles.input} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
      <div style={styles.mb16}>
        <label style={styles.label}>Nombre</label>
        <input type="number" value={block.content.limit || 6} onChange={e => onUpdate('limit', parseInt(e.target.value))} style={styles.input} min="1" max="24" />
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>Colonnes</label>
        <select value={block.content.columns || 3} onChange={e => onUpdate('columns', parseInt(e.target.value))} style={styles.select}>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>Tri</label>
        <select value={block.content.orderBy || 'date'} onChange={e => onUpdate('orderBy', e.target.value)} style={styles.select}>
          <option value="date">Date</option>
          <option value="title">Titre</option>
          <option value="views">Vues</option>
        </select>
      </div>
    </div>
    <div style={styles.mb16}>
      <label style={styles.label}>Catégorie (ID)</label>
      <input value={block.content.categoryId || ''} onChange={e => onUpdate('categoryId', e.target.value)} style={styles.input} placeholder="Optionnel" />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" checked={block.content.showExcerpt !== false} onChange={e => onUpdate('showExcerpt', e.target.checked)} />
        <label style={{ ...styles.label, margin: 0, fontSize: '12px' }}>Extrait</label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" checked={block.content.showCategory !== false} onChange={e => onUpdate('showCategory', e.target.checked)} />
        <label style={{ ...styles.label, margin: 0, fontSize: '12px' }}>Catégorie</label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" checked={block.content.showPagination || false} onChange={e => onUpdate('showPagination', e.target.checked)} />
        <label style={{ ...styles.label, margin: 0, fontSize: '12px' }}>Pagination</label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="checkbox" checked={block.content.showFilters || false} onChange={e => onUpdate('showFilters', e.target.checked)} />
        <label style={{ ...styles.label, margin: 0, fontSize: '12px' }}>Filtres</label>
      </div>
    </div>
  </div>
);

// Accordion - FAQ/Accordéon
const AccordionBlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => {
  const updateItem = (idx, field, value) => {
    const items = [...(block.content.items || [])];
    items[idx] = { ...items[idx], [field]: value };
    onUpdate('items', items);
  };

  return (
    <div>
      <div style={styles.mb16}>
        <label style={styles.label}>📌 Titre section ({activeLang.toUpperCase()})</label>
        <input value={block.content[`title_${activeLang}`] || ''} onChange={e => onUpdate(`title_${activeLang}`, e.target.value)} style={styles.input} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={styles.mb16}>
          <label style={styles.label}>Style</label>
          <select value={block.content.style || 'default'} onChange={e => onUpdate('style', e.target.value)} style={styles.select}>
            <option value="default">Défaut</option>
            <option value="bordered">Bordure</option>
            <option value="separated">Séparé</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input type="checkbox" checked={block.content.allowMultiple || false} onChange={e => onUpdate('allowMultiple', e.target.checked)} />
          <label style={{ ...styles.label, margin: 0, fontSize: '12px' }}>Plusieurs ouverts</label>
        </div>
      </div>

      <div style={styles.divider} />
      <h5 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '600' }}>📋 Éléments ({(block.content.items || []).length})</h5>
      {(block.content.items || []).map((item, idx) => (
        <div key={idx} style={{ padding: '12px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '8px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <input value={item[`question_${activeLang}`] || ''} onChange={e => updateItem(idx, `question_${activeLang}`, e.target.value)} style={{ ...styles.input, flex: 1 }} placeholder="Question" />
            <button onClick={() => onUpdate('items', (block.content.items || []).filter((_, i) => i !== idx))} style={{ ...styles.btnIcon, color: colors.error }}><Trash2 size={14} /></button>
          </div>
          <textarea value={item[`answer_${activeLang}`] || ''} onChange={e => updateItem(idx, `answer_${activeLang}`, e.target.value)} style={{ ...styles.textarea, minHeight: '60px' }} placeholder="Réponse" />
        </div>
      ))}
      <button onClick={() => onUpdate('items', [...(block.content.items || []), { question_fr: '', question_en: '', answer_fr: '', answer_en: '' }])} style={{ ...styles.btnSecondary, fontSize: '12px', padding: '8px 12px' }}>+ Ajouter élément</button>
    </div>
  );
};

// Tabs - Onglets
const TabsBlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => {
  const updateTab = (idx, field, value) => {
    const tabs = [...(block.content.tabs || [])];
    tabs[idx] = { ...tabs[idx], [field]: value };
    onUpdate('tabs', tabs);
  };

  return (
    <div>
      <div style={styles.mb16}>
        <label style={styles.label}>📌 Titre section ({activeLang.toUpperCase()})</label>
        <input value={block.content[`title_${activeLang}`] || ''} onChange={e => onUpdate(`title_${activeLang}`, e.target.value)} style={styles.input} />
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>Style onglets</label>
        <select value={block.content.style || 'default'} onChange={e => onUpdate('style', e.target.value)} style={styles.select}>
          <option value="default">Défaut</option>
          <option value="pills">Pilules</option>
          <option value="underline">Souligné</option>
          <option value="vertical">Vertical</option>
        </select>
      </div>

      <div style={styles.divider} />
      <h5 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '600' }}>📑 Onglets ({(block.content.tabs || []).length})</h5>
      {(block.content.tabs || []).map((tab, idx) => (
        <div key={idx} style={{ padding: '12px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '8px', marginBottom: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 40px', gap: '8px', marginBottom: '8px' }}>
            <input value={tab.icon || ''} onChange={e => updateTab(idx, 'icon', e.target.value)} style={styles.input} placeholder="Icon" />
            <input value={tab[`label_${activeLang}`] || ''} onChange={e => updateTab(idx, `label_${activeLang}`, e.target.value)} style={styles.input} placeholder="Label" />
            <button onClick={() => onUpdate('tabs', (block.content.tabs || []).filter((_, i) => i !== idx))} style={{ ...styles.btnIcon, color: colors.error }}><Trash2 size={14} /></button>
          </div>
          <textarea value={tab[`content_${activeLang}`] || ''} onChange={e => updateTab(idx, `content_${activeLang}`, e.target.value)} style={{ ...styles.textarea, minHeight: '80px' }} placeholder="Contenu de l'onglet (HTML supporté)" />
        </div>
      ))}
      <button onClick={() => onUpdate('tabs', [...(block.content.tabs || []), { icon: '📌', label_fr: 'Onglet', label_en: 'Tab', content_fr: '', content_en: '' }])} style={{ ...styles.btnSecondary, fontSize: '12px', padding: '8px 12px' }}>+ Ajouter onglet</button>
    </div>
  );
};

// Grid - Grille personnalisée
const GridBlockEditor = ({ block, onUpdate, isDark, styles }) => (
  <div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
      <div style={styles.mb16}>
        <label style={styles.label}>Colonnes</label>
        <input type="number" value={block.content.columns || 3} onChange={e => onUpdate('columns', parseInt(e.target.value))} style={styles.input} min="1" max="12" />
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>Gap (px)</label>
        <input type="number" value={block.content.gap || 24} onChange={e => onUpdate('gap', parseInt(e.target.value))} style={styles.input} />
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>Min hauteur (px)</label>
        <input type="number" value={block.content.minHeight || 0} onChange={e => onUpdate('minHeight', parseInt(e.target.value))} style={styles.input} />
      </div>
    </div>
    <div style={styles.mb16}>
      <label style={styles.label}>Colonnes responsive</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        <input type="number" value={block.content.colsMobile || 1} onChange={e => onUpdate('colsMobile', parseInt(e.target.value))} style={styles.input} placeholder="Mobile" />
        <input type="number" value={block.content.colsTablet || 2} onChange={e => onUpdate('colsTablet', parseInt(e.target.value))} style={styles.input} placeholder="Tablet" />
        <input type="number" value={block.content.colsDesktop || 3} onChange={e => onUpdate('colsDesktop', parseInt(e.target.value))} style={styles.input} placeholder="Desktop" />
      </div>
      <p style={{ fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8', marginTop: '4px' }}>Mobile | Tablet | Desktop</p>
    </div>
  </div>
);

// HTML - Code HTML personnalisé
const HTMLBlockEditor = ({ block, onUpdate, isDark, styles }) => (
  <div>
    <div style={styles.mb16}>
      <label style={styles.label}>💻 Code HTML</label>
      <textarea
        value={block.content.html || ''}
        onChange={e => onUpdate('html', e.target.value)}
        style={{ ...styles.textarea, minHeight: '200px', fontFamily: 'monospace', fontSize: '13px' }}
        placeholder="<div>Votre code HTML ici...</div>"
      />
    </div>
    <div style={{ padding: '12px', background: isDark ? '#0f172a' : '#fff7ed', borderRadius: '8px', border: `1px solid ${isDark ? '#334155' : '#fed7aa'}` }}>
      <p style={{ fontSize: '12px', color: isDark ? '#f97316' : '#ea580c', margin: 0 }}>
        ⚠️ Attention : Le code HTML sera injecté directement. Assurez-vous qu'il est sécurisé.
      </p>
    </div>
  </div>
);

// Embed - Contenu embarqué
const EmbedBlockEditor = ({ block, onUpdate, isDark, activeLang, styles }) => (
  <div>
    <div style={styles.mb16}>
      <label style={styles.label}>📌 Titre ({activeLang.toUpperCase()})</label>
      <input value={block.content[`title_${activeLang}`] || ''} onChange={e => onUpdate(`title_${activeLang}`, e.target.value)} style={styles.input} />
    </div>
    <div style={styles.mb16}>
      <label style={styles.label}>🔗 Type</label>
      <select value={block.content.type || 'iframe'} onChange={e => onUpdate('type', e.target.value)} style={styles.select}>
        <option value="iframe">iFrame générique</option>
        <option value="youtube">YouTube</option>
        <option value="vimeo">Vimeo</option>
        <option value="twitter">Twitter/X</option>
        <option value="facebook">Facebook</option>
        <option value="instagram">Instagram</option>
        <option value="spotify">Spotify</option>
      </select>
    </div>
    <div style={styles.mb16}>
      <label style={styles.label}>🔗 URL ou code embed</label>
      <textarea
        value={block.content.embedCode || ''}
        onChange={e => onUpdate('embedCode', e.target.value)}
        style={{ ...styles.textarea, minHeight: '100px' }}
        placeholder="URL ou code iframe complet"
      />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      <div style={styles.mb16}>
        <label style={styles.label}>Largeur</label>
        <input value={block.content.width || '100%'} onChange={e => onUpdate('width', e.target.value)} style={styles.input} placeholder="100% ou 560px" />
      </div>
      <div style={styles.mb16}>
        <label style={styles.label}>Hauteur (px)</label>
        <input type="number" value={block.content.height || 400} onChange={e => onUpdate('height', parseInt(e.target.value))} style={styles.input} />
      </div>
    </div>
  </div>
);

// Script - Script personnalisé
const ScriptBlockEditor = ({ block, onUpdate, isDark, styles }) => (
  <div>
    <div style={styles.mb16}>
      <label style={styles.label}>⚙️ Script JavaScript</label>
      <textarea
        value={block.content.script || ''}
        onChange={e => onUpdate('script', e.target.value)}
        style={{ ...styles.textarea, minHeight: '150px', fontFamily: 'monospace', fontSize: '13px' }}
        placeholder="// Votre code JavaScript ici"
      />
    </div>
    <div style={styles.mb16}>
      <label style={styles.label}>Position d'exécution</label>
      <select value={block.content.position || 'body'} onChange={e => onUpdate('position', e.target.value)} style={styles.select}>
        <option value="head">Head (avant chargement)</option>
        <option value="body">Body (après DOM)</option>
        <option value="defer">Defer (après chargement)</option>
      </select>
    </div>
    <div style={{ padding: '12px', background: isDark ? '#450a0a' : '#fef2f2', borderRadius: '8px', border: `1px solid ${isDark ? '#7f1d1d' : '#fecaca'}` }}>
      <p style={{ fontSize: '12px', color: isDark ? '#fca5a5' : '#dc2626', margin: 0 }}>
        ⚠️ Danger : Les scripts personnalisés peuvent poser des risques de sécurité. Utilisez avec précaution.
      </p>
    </div>
  </div>
);

// Preview des blocs
const BlockPreview = ({ section, isDark, lang }) => {
  const c = section.content || {};

  switch (section.type) {
    case 'hero':
      return (
        <div style={{
          padding: '80px 40px',
          background: c.bgImage ? `url(${c.bgImage}) center/cover` : (c.bgColor || '#1a1a2e'),
          color: c.textColor || '#ffffff',
          textAlign: 'center',
          minHeight: `${c.height || 500}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {c.overlay && <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${(c.overlayOpacity || 50) / 100})` }} />}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ margin: '0 0 16px', fontSize: '42px', fontWeight: '800' }}>{c[`title_${lang}`] || 'Titre'}</h1>
            <p style={{ margin: '0 0 24px', fontSize: '18px', opacity: 0.9 }}>{c[`subtitle_${lang}`] || 'Sous-titre'}</p>
            {c[`buttonText_${lang}`] && (
              <button style={{ padding: '14px 32px', background: colors.cameroonGreen, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                {c[`buttonText_${lang}`]}
              </button>
            )}
          </div>
        </div>
      );

    case 'text':
      return (
        <div style={{ padding: `${c.padding || 40}px`, textAlign: c.textAlign || 'left', background: c.bgColor || 'transparent' }}>
          <div dangerouslySetInnerHTML={{ __html: c[`content_${lang}`] || '<p>Contenu texte...</p>' }} />
        </div>
      );

    case 'image':
      return (
        <div style={{ padding: '20px', textAlign: c.alignment || 'center' }}>
          {c.src ? (
            <figure style={{ margin: 0, display: 'inline-block', maxWidth: `${c.width || 100}%` }}>
              <img src={c.src} alt={c[`alt_${lang}`] || ''} style={{ width: '100%', borderRadius: `${c.borderRadius || 0}px` }} />
              {c[`caption_${lang}`] && <figcaption style={{ marginTop: '8px', fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b' }}>{c[`caption_${lang}`]}</figcaption>}
            </figure>
          ) : (
            <div style={{ padding: '60px', background: isDark ? '#0f172a' : '#f1f5f9', borderRadius: '8px', color: isDark ? '#64748b' : '#94a3b8' }}>
              🖼️ Aucune image sélectionnée
            </div>
          )}
        </div>
      );

    case 'cta':
      return (
        <div style={{ padding: '60px 40px', background: c.bgColor || colors.cameroonGreen, color: c.textColor || '#ffffff', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '32px', fontWeight: '700' }}>{c[`title_${lang}`] || 'Prêt à commencer ?'}</h2>
          <p style={{ margin: '0 0 24px', fontSize: '18px', opacity: 0.9 }}>{c[`description_${lang}`] || 'Description'}</p>
          <button style={{ padding: '14px 32px', background: '#fff', color: c.bgColor || colors.cameroonGreen, border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
            {c[`buttonText_${lang}`] || 'Action'}
          </button>
        </div>
      );

    case 'features':
      return (
        <div style={{ padding: '60px 40px' }}>
          <h2 style={{ margin: '0 0 40px', fontSize: '32px', fontWeight: '700', textAlign: 'center' }}>{c[`title_${lang}`] || 'Fonctionnalités'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${c.columns || 3}, 1fr)`, gap: '30px' }}>
            {(c.items || []).map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '40px', display: 'block', marginBottom: '16px' }}>{item.icon}</span>
                <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600' }}>{item[`title_${lang}`]}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b' }}>{item[`desc_${lang}`]}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'video':
      const videoId = c.url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/)([a-zA-Z0-9_-]+)/)?.[1];
      return (
        <div style={{ padding: '40px' }}>
          {c[`title_${lang}`] && <h3 style={{ margin: '0 0 20px', fontSize: '24px', fontWeight: '600', textAlign: 'center' }}>{c[`title_${lang}`]}</h3>}
          {videoId ? (
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src={c.type === 'vimeo' ? `https://player.vimeo.com/video/${videoId}` : `https://www.youtube.com/embed/${videoId}`}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '12px' }}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div style={{ padding: '80px', background: isDark ? '#0f172a' : '#f1f5f9', borderRadius: '12px', textAlign: 'center', color: isDark ? '#64748b' : '#94a3b8' }}>
              🎬 Entrez une URL YouTube ou Vimeo
            </div>
          )}
        </div>
      );

    case 'columns':
      return (
        <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: `repeat(${c.columns || 2}, 1fr)`, gap: `${c.gap || 24}px` }}>
          {(c.content || []).slice(0, c.columns || 2).map((col, i) => (
            <div key={i} style={{ padding: '20px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: '600' }}>{col[`title_${lang}`]}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b' }}>{col[`text_${lang}`]}</p>
            </div>
          ))}
        </div>
      );

    case 'spacer':
      return <div style={{ height: `${c.height || 60}px`, background: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${isDark ? '#334155' : '#e2e8f0'}22 10px, ${isDark ? '#334155' : '#e2e8f0'}22 20px)` }} />;

    case 'divider':
      return (
        <div style={{ padding: '20px 40px', display: 'flex', justifyContent: 'center' }}>
          <hr style={{ width: `${c.width || 100}%`, border: 'none', borderTop: `2px ${c.style || 'solid'} ${c.color || '#e2e8f0'}`, margin: 0 }} />
        </div>
      );

    case 'gallery':
      return (
        <div style={{ padding: '40px' }}>
          {(c.images || []).length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${c.columns || 3}, 1fr)`, gap: `${c.gap || 16}px` }}>
              {(c.images || []).map((img, i) => (
                <div key={i} style={{ aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', background: isDark ? '#0f172a' : '#f1f5f9' }}>
                  {img.src ? (
                    <img src={img.src} alt={img[`alt_${lang}`] || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? '#64748b' : '#94a3b8' }}>
                      🖼️
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '60px', background: isDark ? '#0f172a' : '#f1f5f9', borderRadius: '12px', textAlign: 'center', color: isDark ? '#64748b' : '#94a3b8' }}>
              🎨 Galerie vide - Ajoutez des images dans l'onglet Contenu
            </div>
          )}
        </div>
      );

    case 'testimonials':
      return (
        <div style={{ padding: '60px 40px', background: isDark ? '#0f172a' : '#f8fafc' }}>
          {c[`title_${lang}`] && (
            <h2 style={{ margin: '0 0 40px', fontSize: '32px', fontWeight: '700', textAlign: 'center' }}>{c[`title_${lang}`]}</h2>
          )}
          {(c.items || []).length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min((c.items || []).length, 3)}, 1fr)`, gap: '24px' }}>
              {(c.items || []).map((item, i) => (
                <div key={i} style={{ padding: '24px', background: isDark ? '#1e293b' : '#ffffff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%',
                      background: item.avatar ? `url(${item.avatar}) center/cover` : colors.cameroonGreen,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: '700', fontSize: '18px'
                    }}>
                      {!item.avatar && (item.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: '600' }}>{item.name || 'Nom'}</p>
                      <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>{item[`role_${lang}`] || 'Rôle'}</p>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', fontStyle: 'italic', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.6' }}>
                    "{item[`text_${lang}`] || 'Témoignage...'}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '40px', background: isDark ? '#1e293b' : '#ffffff', borderRadius: '12px', textAlign: 'center', color: isDark ? '#64748b' : '#94a3b8' }}>
              💬 Aucun témoignage - Ajoutez-en dans l'onglet Contenu
            </div>
          )}
        </div>
      );

    case 'contact':
      const fields = c.fields || ['name', 'email', 'message'];
      const fieldLabels = { name: 'Nom', email: 'Email', phone: 'Téléphone', subject: 'Sujet', message: 'Message' };
      return (
        <div style={{ padding: '60px 40px', background: isDark ? '#0f172a' : '#f8fafc' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {c[`title_${lang}`] && (
              <h2 style={{ margin: '0 0 12px', fontSize: '28px', fontWeight: '700', textAlign: 'center' }}>{c[`title_${lang}`]}</h2>
            )}
            {c[`description_${lang}`] && (
              <p style={{ margin: '0 0 32px', fontSize: '16px', color: isDark ? '#94a3b8' : '#64748b', textAlign: 'center' }}>{c[`description_${lang}`]}</p>
            )}
            <div style={{ background: isDark ? '#1e293b' : '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              {fields.map((field, i) => (
                <div key={i} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>{fieldLabels[field] || field}</label>
                  {field === 'message' ? (
                    <div style={{ height: '100px', background: isDark ? '#0f172a' : '#f1f5f9', borderRadius: '8px', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }} />
                  ) : (
                    <div style={{ height: '44px', background: isDark ? '#0f172a' : '#f1f5f9', borderRadius: '8px', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }} />
                  )}
                </div>
              ))}
              <button style={{
                width: '100%', padding: '14px', marginTop: '8px',
                background: c.buttonColor || colors.cameroonGreen,
                color: '#fff', border: 'none', borderRadius: '8px',
                fontSize: '16px', fontWeight: '600', cursor: 'pointer'
              }}>
                {c[`submitText_${lang}`] || 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      );

    // === NOUVEAUX APERÇUS DE BLOCS ===

    case 'hero_advanced':
      return (
        <div style={{
          padding: '100px 40px 80px',
          background: c.bgGradient || 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div>
              {c[`badge_${lang}`] && (
                <span style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(0,122,51,0.3)', color: colors.cameroonGreen, borderRadius: '20px', fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
                  {c[`badge_${lang}`]}
                </span>
              )}
              <h1 style={{ margin: '0 0 16px', fontSize: '48px', fontWeight: '800', lineHeight: '1.1' }}>
                {c[`title_${lang}`] || 'One Health'} <span style={{ color: colors.cameroonGreen }}>{c[`titleAccent_${lang}`] || ''}</span>
              </h1>
              <p style={{ margin: '0 0 32px', fontSize: '18px', opacity: 0.8, lineHeight: '1.6' }}>{c[`description_${lang}`] || ''}</p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {(c.buttons || []).map((btn, i) => (
                  <button key={i} style={{
                    padding: '14px 28px', borderRadius: '12px', fontWeight: '600', fontSize: '15px', cursor: 'pointer',
                    background: btn.style === 'primary' ? colors.cameroonGreen : 'transparent',
                    color: btn.style === 'primary' ? '#fff' : '#fff',
                    border: btn.style === 'primary' ? 'none' : '2px solid rgba(255,255,255,0.3)'
                  }}>{btn[`text_${lang}`] || 'Button'}</button>
                ))}
              </div>
              {(c.stats || []).length > 0 && (
                <div style={{ display: 'flex', gap: '32px', marginTop: '40px' }}>
                  {(c.stats || []).map((stat, i) => (
                    <div key={i}>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: colors.cameroonGreen }}>{stat.value}</div>
                      <div style={{ fontSize: '14px', opacity: 0.7 }}>{stat[`label_${lang}`]}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {c.showPillars && (
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '40px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                  {(c.pillars || []).map((p, i) => (
                    <div key={i} style={{ padding: '20px', background: `${p.color}20`, borderRadius: '16px', minWidth: '100px' }}>
                      <span style={{ fontSize: '32px' }}>{p.icon}</span>
                      <p style={{ margin: '8px 0 0', fontSize: '12px', fontWeight: '600' }}>{p[`label_${lang}`]}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {c.showWave && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'white', borderRadius: '100% 100% 0 0' }} />
          )}
        </div>
      );

    case 'heading':
      const HeadingTag = c.level || 'h2';
      return (
        <div style={{ padding: '40px', textAlign: c.align || 'center' }}>
          {c[`badge_${lang}`] && (
            <span style={{ display: 'inline-block', padding: '6px 16px', background: `${c.badgeColor || colors.cameroonGreen}15`, color: c.badgeColor || colors.cameroonGreen, borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
              {c[`badge_${lang}`]}
            </span>
          )}
          <HeadingTag style={{ margin: '0 0 8px', fontSize: HeadingTag === 'h1' ? '40px' : HeadingTag === 'h2' ? '32px' : '24px', fontWeight: '700' }}>
            {c[`title_${lang}`] || 'Titre de section'}
          </HeadingTag>
          {c[`subtitle_${lang}`] && (
            <p style={{ margin: 0, fontSize: '16px', color: isDark ? '#94a3b8' : '#64748b', maxWidth: '600px', marginLeft: c.align === 'center' ? 'auto' : 0, marginRight: c.align === 'center' ? 'auto' : 0 }}>
              {c[`subtitle_${lang}`]}
            </p>
          )}
        </div>
      );

    case 'cta_banner':
      return (
        <div style={{
          padding: '80px 40px',
          background: c.bgColor || colors.cameroonGreen,
          color: c.textColor || '#ffffff',
          textAlign: 'center',
          position: 'relative'
        }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '36px', fontWeight: '700' }}>{c[`title_${lang}`] || 'Rejoignez-nous'}</h2>
          <p style={{ margin: '0 0 32px', fontSize: '18px', opacity: 0.9 }}>{c[`description_${lang}`] || ''}</p>
          <button style={{
            padding: '16px 40px', fontSize: '16px', fontWeight: '600',
            background: c.buttonColor || '#ffffff',
            color: c.bgColor || colors.cameroonGreen,
            border: 'none', borderRadius: '12px', cursor: 'pointer'
          }}>{c[`buttonText_${lang}`] || 'Action'}</button>
          {c.showWave && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'white', borderRadius: '100% 100% 0 0' }} />}
        </div>
      );

    case 'pillars':
      return (
        <div style={{ padding: '80px 40px', background: isDark ? '#0f172a' : '#f8fafc' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            {c[`badge_${lang}`] && (
              <span style={{ display: 'inline-block', padding: '6px 16px', background: `${colors.cameroonGreen}15`, color: colors.cameroonGreen, borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                {c[`badge_${lang}`]}
              </span>
            )}
            <h2 style={{ margin: 0, fontSize: '32px', fontWeight: '700' }}>{c[`title_${lang}`] || 'Les 3 Piliers'}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${(c.pillars || []).length || 3}, 1fr)`, gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {(c.pillars || []).map((pillar, i) => (
              <div key={i} style={{ background: isDark ? '#1e293b' : '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderTop: `4px solid ${pillar.color || colors.cameroonGreen}` }}>
                <span style={{ fontSize: '40px', display: 'block', marginBottom: '16px' }}>{pillar.icon || '🏥'}</span>
                <h3 style={{ margin: '0 0 12px', fontSize: '20px', fontWeight: '700', color: pillar.color || colors.cameroonGreen }}>{pillar[`title_${lang}`] || 'Pilier'}</h3>
                <p style={{ margin: '0 0 16px', fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b' }}>{pillar[`description_${lang}`] || ''}</p>
                {(pillar.features || []).length > 0 && (
                  <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
                    {(pillar.features || []).map((f, fi) => <li key={fi} style={{ marginBottom: '4px' }}>{f[`text_${lang}`]}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'cards':
      return (
        <div style={{ padding: '60px 40px', background: isDark ? '#0f172a' : '#ffffff' }}>
          {c[`title_${lang}`] && <h2 style={{ margin: '0 0 32px', fontSize: '28px', fontWeight: '700', textAlign: 'center' }}>{c[`title_${lang}`]}</h2>}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${c.columns || 3}, 1fr)`, gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {(c.cards || []).map((card, i) => (
              <div key={i} style={{ background: isDark ? '#1e293b' : '#f8fafc', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <span style={{ fontSize: '36px', display: 'block', marginBottom: '12px' }}>{card.icon || '📌'}</span>
                <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700' }}>{card[`title_${lang}`] || 'Carte'}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.5' }}>{card[`description_${lang}`] || ''}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'stats':
      return (
        <div style={{ padding: '60px 40px', background: c.bgColor || colors.dark, color: '#ffffff' }}>
          {c[`title_${lang}`] && <h2 style={{ margin: '0 0 40px', fontSize: '28px', fontWeight: '700', textAlign: 'center' }}>{c[`title_${lang}`]}</h2>}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${(c.stats || []).length || 4}, 1fr)`, gap: '32px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            {(c.stats || []).map((stat, i) => (
              <div key={i}>
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>{stat.icon || '📊'}</span>
                <div style={{ fontSize: '42px', fontWeight: '700', color: colors.cameroonGreen }}>{stat.value}</div>
                <div style={{ fontSize: '14px', opacity: 0.7, marginTop: '4px' }}>{stat[`label_${lang}`] || 'Label'}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'zoonoses':
      return (
        <div style={{ padding: '80px 40px', background: isDark ? '#0f172a' : '#f8fafc' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            {c[`badge_${lang}`] && (
              <span style={{ display: 'inline-block', padding: '6px 16px', background: `${colors.cameroonRed}15`, color: colors.cameroonRed, borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                {c[`badge_${lang}`]}
              </span>
            )}
            <h2 style={{ margin: 0, fontSize: '32px', fontWeight: '700' }}>{c[`title_${lang}`] || 'Zoonoses'}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {(c.diseases || []).map((disease, i) => (
              <div key={i} style={{ background: isDark ? '#1e293b' : '#ffffff', borderRadius: '12px', padding: '24px', borderLeft: `4px solid ${disease.color || colors.cameroonRed}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>{disease.icon || '🦠'}</span>
                <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700' }}>{disease[`name_${lang}`] || 'Maladie'}</h3>
                <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.5' }}>{disease[`description_${lang}`] || ''}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'partners':
      return (
        <div style={{ padding: '60px 40px', background: isDark ? '#0f172a' : '#f8fafc' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            {c[`badge_${lang}`] && (
              <span style={{ display: 'inline-block', padding: '6px 16px', background: `${colors.cameroonGreen}15`, color: colors.cameroonGreen, borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                {c[`badge_${lang}`]}
              </span>
            )}
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>{c[`title_${lang}`] || 'Nos Partenaires'}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${c.columns || 6}, 1fr)`, gap: '24px', maxWidth: '1000px', margin: '0 auto', alignItems: 'center' }}>
            {(c.partners || []).map((partner, i) => (
              <div key={i} style={{ padding: '20px', background: isDark ? '#1e293b' : '#ffffff', borderRadius: '12px', textAlign: 'center', filter: c.grayscale !== false ? 'grayscale(100%)' : 'none', opacity: 0.7, transition: 'all 0.3s' }}>
                {partner.logo ? (
                  <img src={partner.logo} alt={partner.name} style={{ maxWidth: '100%', maxHeight: '60px', objectFit: 'contain' }} />
                ) : (
                  <div style={{ fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>{partner.name || 'Logo'}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'team':
      return (
        <div style={{ padding: '60px 40px', background: isDark ? '#0f172a' : '#ffffff' }}>
          {c[`title_${lang}`] && <h2 style={{ margin: '0 0 40px', fontSize: '28px', fontWeight: '700', textAlign: 'center' }}>{c[`title_${lang}`]}</h2>}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${c.columns || 4}, 1fr)`, gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {(c.members || []).map((member, i) => (
              <div key={i} style={{ background: isDark ? '#1e293b' : '#f8fafc', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: isDark ? '#334155' : '#e2e8f0', margin: '0 auto 16px', backgroundImage: member.photo ? `url(${member.photo})` : 'none', backgroundSize: 'cover' }} />
                <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700' }}>{member.name || 'Nom'}</h3>
                <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>{member[`role_${lang}`] || 'Rôle'}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'timeline':
      return (
        <div style={{ padding: '60px 40px', background: isDark ? '#0f172a' : '#f8fafc' }}>
          {c[`title_${lang}`] && <h2 style={{ margin: '0 0 40px', fontSize: '28px', fontWeight: '700', textAlign: 'center' }}>{c[`title_${lang}`]}</h2>}
          <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', paddingLeft: '40px' }}>
            <div style={{ position: 'absolute', left: '15px', top: 0, bottom: 0, width: '2px', background: colors.cameroonGreen }} />
            {(c.events || []).map((event, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: '32px', paddingLeft: '32px' }}>
                <div style={{ position: 'absolute', left: '-25px', top: '4px', width: '20px', height: '20px', borderRadius: '50%', background: event.color || colors.cameroonGreen, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                  {event.icon || '📌'}
                </div>
                <div style={{ background: isDark ? '#1e293b' : '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <span style={{ fontSize: '12px', color: event.color || colors.cameroonGreen, fontWeight: '600' }}>{event.date}</span>
                  <h3 style={{ margin: '8px 0', fontSize: '18px', fontWeight: '700' }}>{event[`title_${lang}`] || 'Événement'}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b' }}>{event[`description_${lang}`] || ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'map':
      return (
        <div style={{ padding: '40px' }}>
          {c[`title_${lang}`] && <h2 style={{ margin: '0 0 20px', fontSize: '24px', fontWeight: '700' }}>{c[`title_${lang}`]}</h2>}
          <div style={{
            height: `${c.height || 400}px`,
            background: isDark ? '#1e293b' : '#e2e8f0',
            borderRadius: `${c.borderRadius || 12}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '48px' }}>🗺️</span>
            <span style={{ marginLeft: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>Carte intégrée</span>
          </div>
        </div>
      );

    case 'news':
      return (
        <div style={{ padding: '80px 40px', background: isDark ? '#0f172a' : '#f8fafc' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            {c[`badge_${lang}`] && (
              <span style={{ display: 'inline-block', padding: '6px 16px', background: `${colors.cameroonGreen}15`, color: colors.cameroonGreen, borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                {c[`badge_${lang}`]}
              </span>
            )}
            <h2 style={{ margin: 0, fontSize: '32px', fontWeight: '700' }}>{c[`title_${lang}`] || 'Actualités'}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${c.columns || 3}, 1fr)`, gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {[1, 2, 3].slice(0, c.limit || 3).map((_, i) => (
              <div key={i} style={{ background: isDark ? '#1e293b' : '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ height: '180px', background: isDark ? '#334155' : '#e2e8f0' }} />
                <div style={{ padding: '20px' }}>
                  <span style={{ fontSize: '12px', color: colors.cameroonGreen }}>📅 {c.showDate !== false ? '01/01/2024' : ''}</span>
                  <h3 style={{ margin: '8px 0', fontSize: '18px', fontWeight: '700' }}>Article {i + 1}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b' }}>Aperçu de l'article dynamique...</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'posts_grid':
      return (
        <div style={{ padding: '60px 40px', background: isDark ? '#0f172a' : '#ffffff' }}>
          {c[`title_${lang}`] && <h2 style={{ margin: '0 0 32px', fontSize: '28px', fontWeight: '700', textAlign: 'center' }}>{c[`title_${lang}`]}</h2>}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${c.columns || 3}, 1fr)`, gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {Array.from({ length: c.limit || 6 }, (_, i) => (
              <div key={i} style={{ background: isDark ? '#1e293b' : '#f8fafc', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ height: '160px', background: isDark ? '#334155' : '#e2e8f0' }} />
                <div style={{ padding: '16px' }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '600' }}>Article {i + 1}</h3>
                  {c.showExcerpt !== false && <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>Extrait...</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'accordion':
      return (
        <div style={{ padding: '60px 40px', background: isDark ? '#0f172a' : '#ffffff' }}>
          {c[`title_${lang}`] && <h2 style={{ margin: '0 0 32px', fontSize: '28px', fontWeight: '700', textAlign: 'center' }}>{c[`title_${lang}`]}</h2>}
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {(c.items || []).map((item, i) => (
              <div key={i} style={{ background: isDark ? '#1e293b' : '#f8fafc', borderRadius: '12px', marginBottom: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <span style={{ fontWeight: '600' }}>{item[`question_${lang}`] || `Question ${i + 1}`}</span>
                  <ChevronDown size={20} />
                </div>
                {i === 0 && (
                  <div style={{ padding: '0 20px 20px', color: isDark ? '#94a3b8' : '#64748b', fontSize: '14px' }}>
                    {item[`answer_${lang}`] || 'Réponse...'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'tabs':
      return (
        <div style={{ padding: '60px 40px', background: isDark ? '#0f172a' : '#ffffff' }}>
          {c[`title_${lang}`] && <h2 style={{ margin: '0 0 32px', fontSize: '28px', fontWeight: '700', textAlign: 'center' }}>{c[`title_${lang}`]}</h2>}
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: c.style === 'underline' ? `2px solid ${isDark ? '#334155' : '#e2e8f0'}` : 'none' }}>
              {(c.tabs || []).map((tab, i) => (
                <button key={i} style={{
                  padding: '12px 20px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px',
                  background: i === 0 ? (c.style === 'pills' ? colors.cameroonGreen : 'transparent') : 'transparent',
                  color: i === 0 ? (c.style === 'pills' ? '#fff' : colors.cameroonGreen) : (isDark ? '#94a3b8' : '#64748b'),
                  borderRadius: c.style === 'pills' ? '20px' : '0',
                  borderBottom: c.style === 'underline' && i === 0 ? `2px solid ${colors.cameroonGreen}` : 'none'
                }}>
                  {tab.icon && <span style={{ marginRight: '6px' }}>{tab.icon}</span>}
                  {tab[`label_${lang}`] || `Tab ${i + 1}`}
                </button>
              ))}
            </div>
            <div style={{ background: isDark ? '#1e293b' : '#f8fafc', borderRadius: '12px', padding: '24px', minHeight: '120px' }}>
              {(c.tabs || [])[0]?.[`content_${lang}`] || 'Contenu de l\'onglet...'}
            </div>
          </div>
        </div>
      );

    case 'grid':
      return (
        <div style={{ padding: '40px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${c.columns || 3}, 1fr)`,
            gap: `${c.gap || 24}px`,
            minHeight: c.minHeight || 'auto'
          }}>
            {Array.from({ length: c.columns || 3 }, (_, i) => (
              <div key={i} style={{ background: isDark ? '#1e293b' : '#f8fafc', borderRadius: '12px', padding: '40px', textAlign: 'center', color: isDark ? '#64748b' : '#94a3b8' }}>
                Colonne {i + 1}
              </div>
            ))}
          </div>
        </div>
      );

    case 'html':
      return (
        <div style={{ padding: '40px' }}>
          <div style={{ background: isDark ? '#1e293b' : '#f8fafc', borderRadius: '12px', padding: '24px', fontFamily: 'monospace', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b', whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: '300px' }}>
            {c.html || '<div>Code HTML personnalisé</div>'}
          </div>
        </div>
      );

    case 'embed':
      return (
        <div style={{ padding: '40px' }}>
          {c[`title_${lang}`] && <h2 style={{ margin: '0 0 20px', fontSize: '24px', fontWeight: '700' }}>{c[`title_${lang}`]}</h2>}
          <div style={{
            width: c.width || '100%',
            height: `${c.height || 400}px`,
            background: isDark ? '#1e293b' : '#e2e8f0',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '36px' }}>🔗</span>
            <span style={{ marginLeft: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>Contenu intégré ({c.type || 'iframe'})</span>
          </div>
        </div>
      );

    case 'script':
      return (
        <div style={{ padding: '40px' }}>
          <div style={{ background: isDark ? '#450a0a' : '#fef2f2', borderRadius: '12px', padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>⚙️</span>
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: '600', color: isDark ? '#fca5a5' : '#dc2626' }}>Script personnalisé</p>
              <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#f87171' : '#ef4444' }}>Position: {c.position || 'body'}</p>
            </div>
          </div>
        </div>
      );

    case 'text_image':
    case 'text-image': {
      // Support both formats: direct (block.title) and wrapper (block.content.title)
      const isDirectFormat = section.title && typeof section.title === 'object';
      const isWrapperFormat = c?.title && typeof c.title === 'object';

      // Get title based on format
      const blockTitle = isDirectFormat
        ? (section.title?.[lang] || section.title?.fr || '')
        : isWrapperFormat
          ? (c.title?.[lang] || c.title?.fr || '')
          : (c[`title_${lang}`] || '');

      // Get content paragraphs
      let paragraphs = [];
      if (isDirectFormat) {
        const contentArray = section.content?.[lang] || section.content?.fr || [];
        paragraphs = contentArray.filter(item => item.type === 'paragraph').map(item => item.text || '');
      } else if (isWrapperFormat) {
        const contentArray = c.content?.[lang] || c.content?.fr || [];
        paragraphs = contentArray.filter(item => item.type === 'paragraph').map(item => item.text || '');
      } else {
        paragraphs = c[`paragraphs_${lang}`] || [];
      }

      // Get list items
      let listItems = [];
      if (isDirectFormat) {
        const contentArray = section.content?.[lang] || section.content?.fr || [];
        const listBlock = contentArray.find(item => item.type === 'list');
        listItems = listBlock?.items || [];
      } else if (isWrapperFormat) {
        const contentArray = c.content?.[lang] || c.content?.fr || [];
        const listBlock = contentArray.find(item => item.type === 'list');
        listItems = listBlock?.items || [];
      } else {
        listItems = c[`list_${lang}`] || [];
      }

      // Get image
      const imageSrc = isDirectFormat ? section.image?.src : c.image?.src;
      const imageAlt = isDirectFormat
        ? (section.image?.alt?.[lang] || '')
        : (c.image?.alt?.[lang] || c.image?.[`alt_${lang}`] || '');
      const imageWidth = isDirectFormat ? section.image?.width : c.image?.width;
      const imageHeight = isDirectFormat ? section.image?.height : c.image?.height;

      // Get layout
      const layout = isDirectFormat ? (section.layout || 'text-left-image-right') : (c.layout || 'text-left-image-right');
      const isImageLeft = layout === 'image-left-text-right';
      const isFullWidth = layout === 'full-width';

      return (
        <div style={{
          padding: '48px 40px',
          background: isDark ? '#0f172a' : '#ffffff'
        }}>
          {/* Title with gradient underline */}
          {blockTitle && (
            <div style={{ marginBottom: '32px', textAlign: isFullWidth ? 'center' : 'left' }}>
              <h2 style={{
                margin: '0 0 12px',
                fontSize: '28px',
                fontWeight: '700',
                color: isDark ? '#f1f5f9' : '#1e293b'
              }}>
                {blockTitle}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: isFullWidth ? 'center' : 'flex-start' }}>
                <div style={{ height: '4px', width: '60px', background: `linear-gradient(90deg, ${colors.cameroonGreen}, ${colors.primary})`, borderRadius: '2px' }}></div>
                <div style={{ height: '4px', width: '30px', background: `${colors.cameroonGreen}40`, borderRadius: '2px' }}></div>
                <div style={{ height: '4px', width: '15px', background: `${colors.primary}30`, borderRadius: '2px' }}></div>
              </div>
            </div>
          )}

          {/* Content grid - full width layout */}
          {isFullWidth ? (
            <div>
              {/* Text content centered */}
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {paragraphs.length > 0 && paragraphs.map((para, idx) => (
                  <p key={idx} style={{
                    margin: '0 0 16px',
                    fontSize: '15px',
                    lineHeight: '1.7',
                    color: isDark ? '#94a3b8' : '#64748b',
                    textAlign: 'justify'
                  }}>
                    {para.length > 200 ? para.substring(0, 200) + '...' : para}
                  </p>
                ))}
                {listItems.length > 0 && (
                  <ul style={{ margin: '16px 0', padding: 0, listStyle: 'none' }}>
                    {listItems.slice(0, 5).map((item, idx) => (
                      <li key={idx} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        marginBottom: '10px'
                      }}>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${colors.cameroonGreen}, ${colors.primary})`,
                          marginTop: '6px',
                          flexShrink: 0
                        }}></span>
                        <span style={{ fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b' }}>
                          {item.length > 80 ? item.substring(0, 80) + '...' : item}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Image centered below text */}
              {imageSrc && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
                  <div style={{
                    position: 'relative',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    maxWidth: '600px'
                  }}>
                    <img
                      src={imageSrc.startsWith('http') ? imageSrc : `http://localhost:5000${imageSrc}`}
                      alt={imageAlt}
                      style={{
                        width: '100%',
                        maxHeight: '350px',
                        objectFit: 'contain',
                        background: isDark ? '#1e293b' : '#f8fafc',
                        borderRadius: '16px',
                        padding: '8px'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
          /* Content grid - side by side layout */
          <div style={{
            display: 'grid',
            gridTemplateColumns: imageSrc ? '1fr 1fr' : '1fr',
            gap: '40px',
            alignItems: 'center'
          }}>
            {/* Text content - order based on layout */}
            <div style={{ order: isImageLeft ? 2 : 1 }}>
              {/* Paragraphs */}
              {paragraphs.length > 0 && paragraphs.map((para, idx) => (
                <p key={idx} style={{
                  margin: '0 0 16px',
                  fontSize: '15px',
                  lineHeight: '1.7',
                  color: isDark ? '#94a3b8' : '#64748b',
                  textAlign: 'justify'
                }}>
                  {para.length > 200 ? para.substring(0, 200) + '...' : para}
                </p>
              ))}

              {/* List items */}
              {listItems.length > 0 && (
                <ul style={{ margin: '16px 0 0', padding: 0, listStyle: 'none' }}>
                  {listItems.slice(0, 5).map((item, idx) => (
                    <li key={idx} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      marginBottom: '10px'
                    }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${colors.cameroonGreen}, ${colors.primary})`,
                        marginTop: '6px',
                        flexShrink: 0
                      }}></span>
                      <span style={{
                        fontSize: '14px',
                        color: isDark ? '#94a3b8' : '#64748b'
                      }}>
                        {item.length > 80 ? item.substring(0, 80) + '...' : item}
                      </span>
                    </li>
                  ))}
                  {listItems.length > 5 && (
                    <li style={{ fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8', marginLeft: '20px' }}>
                      ... et {listItems.length - 5} autres éléments
                    </li>
                  )}
                </ul>
              )}

              {/* Empty state */}
              {paragraphs.length === 0 && listItems.length === 0 && (
                <p style={{
                  color: isDark ? '#475569' : '#cbd5e1',
                  fontStyle: 'italic',
                  fontSize: '14px'
                }}>
                  Ajoutez du contenu dans l'onglet "Contenu"
                </p>
              )}
            </div>

            {/* Image - order based on layout */}
            {imageSrc && (
              <div style={{ order: isImageLeft ? 1 : 2 }}>
                <div style={{
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: '-2px',
                    background: `linear-gradient(135deg, ${colors.cameroonGreen}30, ${colors.primary}30)`,
                    borderRadius: '18px',
                    zIndex: -1
                  }}></div>
                  <img
                    src={imageSrc.startsWith('http') ? imageSrc : `http://localhost:5000${imageSrc}`}
                    alt={imageAlt}
                    style={{
                      width: '100%',
                      maxHeight: '300px',
                      objectFit: 'contain',
                      background: isDark ? '#1e293b' : '#f8fafc',
                      borderRadius: '16px',
                      padding: '8px'
                    }}
                  />
                </div>
                {imageAlt && (
                  <p style={{
                    textAlign: 'center',
                    fontSize: '12px',
                    color: isDark ? '#64748b' : '#94a3b8',
                    marginTop: '12px',
                    fontStyle: 'italic'
                  }}>
                    {imageAlt}
                  </p>
                )}
              </div>
            )}

            {/* Placeholder when no image */}
            {!imageSrc && (
              <div style={{ order: isImageLeft ? 1 : 2, display: 'none' }}></div>
            )}
          </div>
          )}

          {/* Layout indicator */}
          <div style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <span style={{
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: isDark ? '#334155' : '#e2e8f0',
              color: isDark ? '#94a3b8' : '#64748b'
            }}>
              📐 {isFullWidth ? 'Pleine largeur' : isImageLeft ? 'Image à gauche' : 'Image à droite'}
            </span>
            {imageSrc && (
              <span style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: isDark ? '#334155' : '#e2e8f0',
                color: isDark ? '#94a3b8' : '#64748b'
              }}>
                🖼️ {imageWidth || 'auto'}×{imageHeight || 'auto'}px
              </span>
            )}
          </div>
        </div>
      );
    }

    default:
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: isDark ? '#64748b' : '#94a3b8' }}>
          📦 {section.type.toUpperCase()}
        </div>
      );
  }
};

// ============== GESTION DES CATÉGORIES (ARBRE) ==============
const CategoriesPage = ({ isDark, token, hasPermission = () => true }) => {
  const styles = createStyles(isDark);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [parentCat, setParentCat] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [expandedIds, setExpandedIds] = useState([]);
  const [activeLang, setActiveLang] = useState('fr');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name_fr: '', name_en: '',
    slug: '',
    description_fr: '', description_en: '',
    parent_id: null, icon: '', color: colors.cameroonGreen
  });

  const fetchCategories = async () => {
    const res = await api.get('/categories', token);
    if (res.success) setCategories(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, [token]);

  // Construire l'arbre des catégories avec filtrage
  const buildTree = (items, parentId = null) => {
    return items
      .filter(item => item.parent_id === parentId)
      .map(item => ({
        ...item,
        children: buildTree(items, item.id)
      }));
  };

  // Vérifier si une catégorie ou ses enfants correspondent à la recherche
  const matchesSearch = (cat, query) => {
    const q = query.toLowerCase();
    const nameMatch = (cat.name_fr || cat.name || '').toLowerCase().includes(q) ||
                      (cat.name_en || '').toLowerCase().includes(q);
    if (nameMatch) return true;
    if (cat.children && cat.children.length > 0) {
      return cat.children.some(child => matchesSearch(child, query));
    }
    return false;
  };

  // Filtrer l'arbre pour garder les catégories correspondantes et leurs parents
  const filterTree = (tree, query) => {
    if (!query) return tree;
    return tree
      .filter(cat => matchesSearch(cat, query))
      .map(cat => ({
        ...cat,
        children: filterTree(cat.children, query)
      }));
  };

  const categoryTree = useMemo(() => buildTree(categories), [categories]);
  const filteredTree = useMemo(() => filterTree(categoryTree, searchQuery), [categoryTree, searchQuery]);

  // Auto-expand quand on recherche
  const displayedTree = searchQuery ? filteredTree : categoryTree;
  const expandedIdsToUse = searchQuery
    ? categories.filter(c => matchesSearch({ ...c, children: buildTree(categories, c.id) }, searchQuery)).map(c => c.id)
    : expandedIds;

  const toggleExpand = (id) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    if (!formData.name_fr.trim()) {
      setToast({ message: 'Le nom en français est requis', type: 'error' });
      return;
    }

    const data = {
      ...formData,
      name: formData.name_fr, // Backward compatibility
      description: formData.description_fr // Backward compatibility
    };
    if (parentCat) data.parent_id = parentCat.id;

    const res = editingCat
      ? await api.put(`/categories/${editingCat.id}`, data, token)
      : await api.post('/categories', data, token);

    if (res.success) {
      setToast({ message: editingCat ? 'Catégorie mise à jour' : 'Catégorie créée', type: 'success' });
      setShowModal(false);
      resetForm();
      fetchCategories();
    } else {
      setToast({ message: res.message || 'Erreur', type: 'error' });
    }
  };

  const handleDelete = (cat) => {
    setConfirmDialog({
      title: 'Supprimer cette catégorie ?',
      message: `Êtes-vous sûr de vouloir supprimer "${cat.name_fr || cat.name}" et toutes ses sous-catégories ? Cette action est irréversible.`,
      type: 'danger',
      confirmText: 'Supprimer',
      onConfirm: async () => {
        const res = await api.delete(`/categories/${cat.id}`, token);
        if (res.success) {
          setToast({ message: 'Catégorie supprimée', type: 'success' });
          fetchCategories();
        } else {
          setToast({ message: res.message || 'Erreur lors de la suppression', type: 'error' });
        }
        setConfirmDialog(null);
      }
    });
  };

  const openEdit = (cat) => {
    setEditingCat(cat);
    setParentCat(null);
    setFormData({
      name_fr: cat.name_fr || cat.name || '',
      name_en: cat.name_en || '',
      slug: cat.slug,
      description_fr: cat.description_fr || cat.description || '',
      description_en: cat.description_en || '',
      parent_id: cat.parent_id,
      icon: cat.icon || '',
      color: cat.color || colors.cameroonGreen
    });
    setActiveLang('fr');
    setShowModal(true);
  };

  const openAddChild = (parent) => {
    setEditingCat(null);
    setParentCat(parent);
    setFormData({
      name_fr: '', name_en: '',
      slug: '',
      description_fr: '', description_en: '',
      parent_id: parent.id, icon: '', color: colors.cameroonGreen
    });
    setActiveLang('fr');
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingCat(null);
    setParentCat(null);
    setFormData({
      name_fr: '', name_en: '',
      slug: '',
      description_fr: '', description_en: '',
      parent_id: null, icon: '', color: colors.cameroonGreen
    });
    setActiveLang('fr');
  };

  if (loading) return <Spinner />;

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setConfirmDialog(null)}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          confirmText={confirmDialog.confirmText}
          isDark={isDark}
        />
      )}

      <div style={styles.flexBetween}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800' }}>Catégories</h1>
          <p style={styles.textMuted}>Organisez vos contenus en catégories et sous-catégories</p>
        </div>
        <button style={styles.btnPrimary} onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus size={20} /> Nouvelle Catégorie
        </button>
      </div>

      {/* Barre de recherche et contrôles */}
      <div style={{ ...styles.card, marginTop: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '250px', maxWidth: '400px' }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#64748b' : '#94a3b8' }} />
            <input
              type="text"
              placeholder="🔍 Rechercher une catégorie..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ ...styles.input, paddingLeft: '48px', width: '100%' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isDark ? '#64748b' : '#94a3b8',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setExpandedIds(categories.map(c => c.id))}
              style={{ ...styles.btnSecondary, display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px' }}
              title="Tout déplier"
            >
              <ChevronDown size={18} /> Tout déplier
            </button>
            <button
              onClick={() => setExpandedIds([])}
              style={{ ...styles.btnSecondary, display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px' }}
              title="Tout replier"
            >
              <ChevronUp size={18} /> Tout replier
            </button>
          </div>
        </div>
        {searchQuery && (
          <p style={{ ...styles.textMuted, marginTop: '12px', marginBottom: 0, fontSize: '14px' }}>
            {displayedTree.length} résultat(s) pour "{searchQuery}"
          </p>
        )}
      </div>

      <div style={{ ...styles.card, marginTop: '16px' }}>
        {displayedTree.length > 0 ? (
          <div>
            {displayedTree.map(cat => (
              <TreeItem
                key={cat.id}
                item={cat}
                onEdit={openEdit}
                onDelete={handleDelete}
                onAddChild={openAddChild}
                isDark={isDark}
                expanded={expandedIdsToUse.includes(cat.id)}
                onToggle={toggleExpand}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <FolderTree size={64} color={isDark ? '#334155' : '#cbd5e1'} style={{ marginBottom: '16px' }} />
            <p style={styles.textMuted}>{searchQuery ? 'Aucune catégorie trouvée' : 'Aucune catégorie'}</p>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCat ? 'Modifier la catégorie' : parentCat ? `Sous-catégorie de "${parentCat.name}"` : 'Nouvelle catégorie'} isDark={isDark} width="650px">
        {/* Language Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: isDark ? '#0f172a' : '#f1f5f9', padding: '6px', borderRadius: '12px' }}>
          <button
            onClick={() => setActiveLang('fr')}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: '8px',
              border: 'none',
              background: activeLang === 'fr' ? `linear-gradient(135deg, ${colors.cameroonGreen} 0%, ${colors.teal} 100%)` : 'transparent',
              color: activeLang === 'fr' ? 'white' : (isDark ? '#94a3b8' : '#64748b'),
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            🇫🇷 Français
          </button>
          <button
            onClick={() => setActiveLang('en')}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: '8px',
              border: 'none',
              background: activeLang === 'en' ? `linear-gradient(135deg, ${colors.cameroonGreen} 0%, ${colors.teal} 100%)` : 'transparent',
              color: activeLang === 'en' ? 'white' : (isDark ? '#94a3b8' : '#64748b'),
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            🇬🇧 English
          </button>
        </div>

        {/* French Fields */}
        {activeLang === 'fr' && (
          <>
            <div style={styles.mb16}>
              <label style={styles.label}>Nom (Français) *</label>
              <input
                value={formData.name_fr}
                onChange={e => setFormData({
                  ...formData,
                  name_fr: e.target.value,
                  slug: formData.slug || e.target.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
                })}
                style={styles.input}
                placeholder="Nom de la catégorie en français"
              />
            </div>
            <div style={styles.mb16}>
              <label style={styles.label}>Description (Français)</label>
              <textarea
                value={formData.description_fr}
                onChange={e => setFormData({ ...formData, description_fr: e.target.value })}
                style={styles.textarea}
                placeholder="Description en français..."
              />
            </div>
          </>
        )}

        {/* English Fields */}
        {activeLang === 'en' && (
          <>
            <div style={styles.mb16}>
              <label style={styles.label}>Name (English)</label>
              <input
                value={formData.name_en}
                onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                style={styles.input}
                placeholder="Category name in English"
              />
            </div>
            <div style={styles.mb16}>
              <label style={styles.label}>Description (English)</label>
              <textarea
                value={formData.description_en}
                onChange={e => setFormData({ ...formData, description_en: e.target.value })}
                style={styles.textarea}
                placeholder="Description in English..."
              />
            </div>
          </>
        )}

        {/* Common Fields */}
        <div style={{ background: isDark ? '#0f172a' : '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>Paramètres communs</h4>
          <div style={styles.mb16}>
            <label style={styles.label}>Slug (URL)</label>
            <input value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} style={styles.input} placeholder="nom-categorie" />
          </div>
          <ColorPicker label="Couleur" value={formData.color} onChange={v => setFormData({ ...formData, color: v })} isDark={isDark} />
        </div>

        {/* Status indicators */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, padding: '12px', borderRadius: '8px', background: formData.name_fr ? (isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.1)') : (isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.1)'), display: 'flex', alignItems: 'center', gap: '8px' }}>
            {formData.name_fr ? <Check size={16} color={colors.success} /> : <AlertCircle size={16} color={colors.error} />}
            <span style={{ fontSize: '13px', color: formData.name_fr ? colors.success : colors.error }}>🇫🇷 {formData.name_fr ? 'Complété' : 'Requis'}</span>
          </div>
          <div style={{ flex: 1, padding: '12px', borderRadius: '8px', background: formData.name_en ? (isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.1)') : (isDark ? 'rgba(251,191,36,0.1)' : 'rgba(251,191,36,0.1)'), display: 'flex', alignItems: 'center', gap: '8px' }}>
            {formData.name_en ? <Check size={16} color={colors.success} /> : <AlertCircle size={16} color={colors.warning} />}
            <span style={{ fontSize: '13px', color: formData.name_en ? colors.success : colors.warning }}>🇬🇧 {formData.name_en ? 'Complété' : 'Optionnel'}</span>
          </div>
        </div>

        <button style={{ ...styles.btnPrimary, width: '100%', justifyContent: 'center', marginTop: '8px' }} onClick={handleSave}>
          <Save size={18} /> Enregistrer
        </button>
      </Modal>
    </div>
  );
};

// ============== GESTION DES MENUS ==============
const MenusPage = ({ isDark, token }) => {
  const styles = createStyles(isDark);
  const [menus, setMenus] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [pages, setPages] = useState([]);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingMenu, setEditingMenu] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [menuForm, setMenuForm] = useState({ name: '', location: 'header', description: '' });
  const [itemForm, setItemForm] = useState({
    label_fr: '', label_en: '', url: '', type: 'custom', target: '_self', parent_id: null,
    page_id: '', post_id: '', category_id: '', icon: '', css_class: ''
  });

  // États pour les recherches dans les sélecteurs
  const [pageSearch, setPageSearch] = useState('');
  const [postSearch, setPostSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [showPageDropdown, setShowPageDropdown] = useState(false);
  const [showPostDropdown, setShowPostDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const pageDropdownRef = React.useRef(null);
  const postDropdownRef = React.useRef(null);
  const categoryDropdownRef = React.useRef(null);

  // États pour le drag and drop
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [dropPosition, setDropPosition] = useState(null); // 'before', 'after', 'inside'

  // Construire l'arbre hiérarchique des items
  const buildMenuTree = (items) => {
    const map = {};
    const roots = [];

    // Créer un map de tous les items
    items.forEach(item => {
      map[item.id] = { ...item, children: [] };
    });

    // Construire l'arbre
    items.forEach(item => {
      if (item.parent_id && map[item.parent_id]) {
        map[item.parent_id].children.push(map[item.id]);
      } else {
        roots.push(map[item.id]);
      }
    });

    // Trier par sort_order
    const sortItems = (items) => {
      items.sort((a, b) => (a.sort_order || 999) - (b.sort_order || 999));
      items.forEach(item => {
        if (item.children.length > 0) sortItems(item.children);
      });
    };
    sortItems(roots);

    return roots;
  };

  const menuTree = buildMenuTree(menuItems);

  // Fermer les dropdowns au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pageDropdownRef.current && !pageDropdownRef.current.contains(e.target)) setShowPageDropdown(false);
      if (postDropdownRef.current && !postDropdownRef.current.contains(e.target)) setShowPostDropdown(false);
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) setShowCategoryDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Types d'éléments de menu avec leurs icônes
  const menuItemTypes = [
    { value: 'custom', label: '🔗 Lien personnalisé', icon: '🔗', description: 'URL externe ou interne' },
    { value: 'page', label: '📄 Page', icon: '📄', description: 'Lier à une page du site' },
    { value: 'post', label: '📰 Article', icon: '📰', description: 'Lier à un article de blog' },
    { value: 'category', label: '📁 Catégorie', icon: '📁', description: 'Lier à une catégorie' },
    { value: 'home', label: '🏠 Accueil', icon: '🏠', description: 'Lien vers la page d\'accueil' }
  ];

  // Emplacements de menu
  const menuLocations = [
    { value: 'header', label: '🔝 En-tête principal', icon: '🔝' },
    { value: 'header_top', label: '⬆️ Barre supérieure', icon: '⬆️' },
    { value: 'footer', label: '⬇️ Pied de page', icon: '⬇️' },
    { value: 'footer_secondary', label: '📋 Footer secondaire', icon: '📋' },
    { value: 'sidebar', label: '📐 Barre latérale', icon: '📐' },
    { value: 'mobile', label: '📱 Menu mobile', icon: '📱' }
  ];

  const fetchData = async () => {
    const [menusRes, pagesRes, postsRes, catsRes] = await Promise.all([
      api.get('/menus', token),
      api.get('/pages', token),
      api.get('/posts?status=published&limit=1000', token),
      api.get('/categories', token)
    ]);
    if (menusRes.success) {
      setMenus(menusRes.data);
      if (menusRes.data.length > 0 && !activeMenu) {
        setActiveMenu(menusRes.data[0]);
        fetchMenuItems(menusRes.data[0].id);
      }
    }
    if (pagesRes.success) setPages(pagesRes.data);
    if (postsRes.success) setPosts(postsRes.data);
    if (catsRes.success) setCategories(catsRes.data);
    setLoading(false);
  };

  const fetchMenuItems = async (menuId) => {
    const res = await api.get(`/menus/${menuId}/items`, token);
    if (res.success) setMenuItems(res.data);
    else setMenuItems([]);
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleSaveMenu = async () => {
    if (!menuForm.name.trim()) {
      setToast({ message: 'Le nom du menu est requis', type: 'error' });
      return;
    }
    const res = editingMenu
      ? await api.put(`/menus/${editingMenu.id}`, menuForm, token)
      : await api.post('/menus', menuForm, token);
    if (res.success) {
      setToast({ message: editingMenu ? 'Menu mis à jour' : 'Menu créé', type: 'success' });
      setShowMenuModal(false);
      setEditingMenu(null);
      setMenuForm({ name: '', location: 'header', description: '' });
      fetchData();
    } else {
      setToast({ message: res.message || 'Erreur', type: 'error' });
    }
  };

  const handleDeleteMenu = (menu) => {
    setConfirmDialog({
      title: 'Supprimer ce menu ?',
      message: `Le menu "${menu.name}" et tous ses éléments seront supprimés définitivement.`,
      type: 'danger',
      confirmText: 'Supprimer',
      onConfirm: async () => {
        const res = await api.delete(`/menus/${menu.id}`, token);
        if (res.success) {
          setToast({ message: 'Menu supprimé', type: 'success' });
          setActiveMenu(null);
          setMenuItems([]);
          fetchData();
        }
        setConfirmDialog(null);
      }
    });
  };

  // Générer l'URL en fonction du type
  const generateUrl = (form) => {
    switch (form.type) {
      case 'home': return '/';
      case 'page':
        const page = pages.find(p => p.id == form.page_id);
        return page ? `/page/${page.slug}` : '';
      case 'post':
        const post = posts.find(p => p.id == form.post_id);
        return post ? `/article/${post.slug}` : '';
      case 'category':
        const cat = categories.find(c => c.id == form.category_id);
        return cat ? `/categorie/${cat.slug}` : '';
      default: return form.url;
    }
  };

  const handleSaveItem = async () => {
    if (!itemForm.label_fr.trim()) {
      setToast({ message: 'Le label est requis', type: 'error' });
      return;
    }

    const url = generateUrl(itemForm);
    const data = { ...itemForm, url, menu_id: activeMenu.id };

    const res = editingItem
      ? await api.put(`/menus/items/${editingItem.id}`, data, token)
      : await api.post(`/menus/${activeMenu.id}/items`, data, token);

    if (res.success) {
      setToast({ message: 'Élément enregistré', type: 'success' });
      setShowItemModal(false);
      setEditingItem(null);
      resetItemForm();
      fetchMenuItems(activeMenu.id);
    } else {
      setToast({ message: res.message || 'Erreur', type: 'error' });
    }
  };

  const resetItemForm = () => {
    setItemForm({
      label_fr: '', label_en: '', url: '', type: 'custom', target: '_self', parent_id: null,
      page_id: '', post_id: '', category_id: '', icon: '', css_class: ''
    });
    // Réinitialiser les recherches
    setPageSearch('');
    setPostSearch('');
    setCategorySearch('');
    setShowPageDropdown(false);
    setShowPostDropdown(false);
    setShowCategoryDropdown(false);
  };

  const openEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      label_fr: item.label_fr || item.label || '',
      label_en: item.label_en || '',
      url: item.url || '',
      type: item.type || 'custom',
      target: item.target || '_self',
      parent_id: item.parent_id,
      page_id: item.page_id || '',
      post_id: item.post_id || '',
      category_id: item.category_id || '',
      icon: item.icon || '',
      css_class: item.css_class || ''
    });
    // Réinitialiser les recherches
    setPageSearch('');
    setPostSearch('');
    setCategorySearch('');
    setShowPageDropdown(false);
    setShowPostDropdown(false);
    setShowCategoryDropdown(false);
    setShowItemModal(true);
  };

  const handleDeleteItem = (id) => {
    const item = menuItems.find(i => i.id === id);
    setConfirmDialog({
      title: 'Supprimer cet élément ?',
      message: `Êtes-vous sûr de vouloir supprimer "${item?.label || 'cet élément'}" du menu ?`,
      type: 'danger',
      confirmText: 'Supprimer',
      onConfirm: async () => {
        const res = await api.delete(`/menus/items/${id}`, token);
        if (res.success) {
          setToast({ message: 'Élément supprimé', type: 'success' });
          fetchMenuItems(activeMenu.id);
        } else {
          setToast({ message: res.message || 'Erreur lors de la suppression', type: 'error' });
        }
        setConfirmDialog(null);
      }
    });
  };

  // === DRAG AND DROP HANDLERS ===
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
    // Ajouter une classe pour le style
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
    setDragOverItem(null);
    setDropPosition(null);
  };

  const handleDragOver = (e, item) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === item.id) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    // Déterminer la position de drop
    let position;
    if (y < height * 0.25) {
      position = 'before';
    } else if (y > height * 0.75) {
      position = 'after';
    } else {
      position = 'inside'; // Pour créer un sous-menu
    }

    setDragOverItem(item);
    setDropPosition(position);
  };

  const handleDragLeave = (e) => {
    // Vérifier si on quitte vraiment l'élément
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverItem(null);
      setDropPosition(null);
    }
  };

  const handleDrop = async (e, targetItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;

    // Empêcher de drop un parent dans son enfant
    const isChild = (parentId, childId) => {
      const child = menuItems.find(i => i.id === childId);
      if (!child) return false;
      if (child.parent_id === parentId) return true;
      if (child.parent_id) return isChild(parentId, child.parent_id);
      return false;
    };

    if (isChild(draggedItem.id, targetItem.id)) {
      setToast({ message: 'Impossible de déplacer un élément dans son propre enfant', type: 'error' });
      setDraggedItem(null);
      setDragOverItem(null);
      setDropPosition(null);
      return;
    }

    // Calculer le nouvel ordre et parent
    const newItems = [...menuItems];
    const draggedIndex = newItems.findIndex(i => i.id === draggedItem.id);
    const targetIndex = newItems.findIndex(i => i.id === targetItem.id);

    let newParentId = null;
    let newSortOrder = 1;

    if (dropPosition === 'inside') {
      // Devenir enfant de la cible
      newParentId = targetItem.id;
      const siblings = menuItems.filter(i => i.parent_id === targetItem.id);
      newSortOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.sort_order || 0)) + 1 : 1;
    } else {
      // Même parent que la cible
      newParentId = targetItem.parent_id;
      const siblings = menuItems.filter(i => i.parent_id === targetItem.parent_id && i.id !== draggedItem.id);

      if (dropPosition === 'before') {
        newSortOrder = (targetItem.sort_order || 1) - 0.5;
      } else {
        newSortOrder = (targetItem.sort_order || 1) + 0.5;
      }
    }

    // Recalculer les sort_order pour les éléments du même niveau
    const affectedItems = menuItems
      .filter(i => i.parent_id === newParentId)
      .map(i => ({
        id: i.id,
        sort_order: i.id === draggedItem.id ? newSortOrder : i.sort_order,
        parent_id: newParentId
      }));

    // Ajouter l'item déplacé s'il change de parent
    if (draggedItem.parent_id !== newParentId) {
      affectedItems.push({
        id: draggedItem.id,
        sort_order: newSortOrder,
        parent_id: newParentId
      });
    }

    // Trier et réassigner les sort_order
    affectedItems.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const reorderedItems = affectedItems.map((item, index) => ({
      id: item.id,
      sort_order: index + 1,
      parent_id: item.parent_id
    }));

    // Appeler l'API pour sauvegarder
    try {
      const res = await api.put(`/menus/${activeMenu.id}/reorder`, { items: reorderedItems }, token);
      if (res.success) {
        setToast({ message: 'Menu réorganisé', type: 'success' });
        fetchMenuItems(activeMenu.id);
      } else {
        setToast({ message: res.message || 'Erreur lors de la réorganisation', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Erreur lors de la réorganisation', type: 'error' });
    }

    setDraggedItem(null);
    setDragOverItem(null);
    setDropPosition(null);
  };

  // Déplacer vers le haut/bas avec les boutons
  const moveItem = async (item, direction) => {
    const siblings = menuItems.filter(i => i.parent_id === item.parent_id);
    siblings.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    const currentIndex = siblings.findIndex(i => i.id === item.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= siblings.length) return;

    // Échanger les positions
    const items = siblings.map((s, idx) => ({
      id: s.id,
      sort_order: idx === currentIndex ? newIndex + 1 : idx === newIndex ? currentIndex + 1 : idx + 1,
      parent_id: s.parent_id
    }));

    try {
      const res = await api.put(`/menus/${activeMenu.id}/reorder`, { items }, token);
      if (res.success) {
        fetchMenuItems(activeMenu.id);
      }
    } catch (error) {
      setToast({ message: 'Erreur lors du déplacement', type: 'error' });
    }
  };

  const getTypeIcon = (type) => {
    const t = menuItemTypes.find(mt => mt.value === type);
    return t ? t.icon : '🔗';
  };

  const getLocationLabel = (loc) => {
    const l = menuLocations.find(ml => ml.value === loc);
    return l ? l.label : loc;
  };

  if (loading) return <Spinner />;

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setConfirmDialog(null)}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          confirmText={confirmDialog.confirmText}
          isDark={isDark}
        />
      )}

      <div style={styles.flexBetween}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800' }}>🧭 Menus</h1>
          <p style={styles.textMuted}>Gérez vos menus de navigation et leurs éléments</p>
        </div>
        <button style={styles.btnPrimary} onClick={() => { setEditingMenu(null); setMenuForm({ name: '', location: 'header', description: '' }); setShowMenuModal(true); }}>
          <Plus size={20} /> Nouveau Menu
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', marginTop: '24px' }}>
        {/* Liste des menus */}
        <div style={styles.card}>
          <div style={{ ...styles.flexBetween, marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Menu size={20} /> Menus ({menus.length})
            </h3>
          </div>
          {menus.length > 0 ? menus.map(menu => (
            <div
              key={menu.id}
              style={{
                padding: '16px',
                marginBottom: '12px',
                borderRadius: '12px',
                cursor: 'pointer',
                background: activeMenu?.id === menu.id
                  ? `linear-gradient(135deg, ${colors.cameroonGreen}15 0%, ${colors.teal}15 100%)`
                  : (isDark ? '#0f172a' : '#f8fafc'),
                border: activeMenu?.id === menu.id
                  ? `2px solid ${colors.cameroonGreen}`
                  : `2px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                transition: 'all 0.2s ease'
              }}
            >
              <div onClick={() => { setActiveMenu(menu); fetchMenuItems(menu.id); }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>📋</span>
                  <span style={{ fontWeight: '700', fontSize: '15px', flex: 1 }}>{menu.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    ...styles.badge(colors.primary),
                    fontSize: '11px',
                    padding: '4px 10px'
                  }}>
                    {getLocationLabel(menu.location)}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: isDark ? '#64748b' : '#94a3b8'
                  }}>
                    {menu.items_count || 0} élément(s)
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, paddingTop: '12px' }}>
                <button
                  style={{ ...styles.btnIcon, flex: 1, justifyContent: 'center', padding: '8px', borderRadius: '8px', background: isDark ? '#1e293b' : '#f1f5f9' }}
                  onClick={(e) => { e.stopPropagation(); setEditingMenu(menu); setMenuForm({ name: menu.name, location: menu.location, description: menu.description || '' }); setShowMenuModal(true); }}
                  title="Modifier"
                >
                  <Edit size={16} />
                </button>
                <button
                  style={{ ...styles.btnIcon, flex: 1, justifyContent: 'center', padding: '8px', borderRadius: '8px', background: isDark ? '#1e293b' : '#f1f5f9', color: colors.error }}
                  onClick={(e) => { e.stopPropagation(); handleDeleteMenu(menu); }}
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Menu size={48} color={isDark ? '#334155' : '#cbd5e1'} style={{ marginBottom: '12px' }} />
              <p style={styles.textMuted}>Aucun menu créé</p>
              <button
                style={{ ...styles.btnSecondary, marginTop: '12px' }}
                onClick={() => { setEditingMenu(null); setMenuForm({ name: '', location: 'header', description: '' }); setShowMenuModal(true); }}
              >
                <Plus size={16} /> Créer un menu
              </button>
            </div>
          )}
        </div>

        {/* Éléments du menu */}
        <div style={styles.card}>
          {activeMenu ? (
            <>
              <div style={{ ...styles.flexBetween, marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📋 {activeMenu.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>
                    {getLocationLabel(activeMenu.location)} • {menuItems.length} élément(s)
                  </p>
                </div>
                <button style={styles.btnPrimary} onClick={() => { setEditingItem(null); resetItemForm(); setShowItemModal(true); }}>
                  <Plus size={18} /> Ajouter un élément
                </button>
              </div>

              <div>
                {menuTree.length > 0 ? (
                  <div>
                    {/* Rendu récursif des items */}
                    {(() => {
                      const renderMenuItem = (item, depth = 0, siblings = [], index = 0) => {
                        const isFirst = index === 0;
                        const isLast = index === siblings.length - 1;
                        const isDragging = draggedItem?.id === item.id;
                        const isOver = dragOverItem?.id === item.id;

                        return (
                          <div key={item.id}>
                            {/* Indicateur de drop "avant" */}
                            {isOver && dropPosition === 'before' && (
                              <div style={{
                                height: '3px',
                                background: colors.primary,
                                borderRadius: '2px',
                                marginLeft: depth * 32,
                                marginBottom: '4px'
                              }} />
                            )}

                            <div
                              draggable
                              onDragStart={(e) => handleDragStart(e, item)}
                              onDragEnd={handleDragEnd}
                              onDragOver={(e) => handleDragOver(e, item)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, item)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '14px 16px',
                                marginBottom: '8px',
                                marginLeft: depth * 32,
                                background: isDragging
                                  ? (isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)')
                                  : isOver && dropPosition === 'inside'
                                    ? (isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)')
                                    : (isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(248, 250, 252, 0.8)'),
                                borderRadius: '12px',
                                border: isOver && dropPosition === 'inside'
                                  ? `2px dashed ${colors.success}`
                                  : isDragging
                                    ? `2px solid ${colors.primary}`
                                    : `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                transition: 'all 0.2s ease',
                                cursor: 'grab',
                                opacity: isDragging ? 0.6 : 1
                              }}
                            >
                              {/* Grip handle */}
                              <GripVertical size={18} color={isDark ? '#475569' : '#94a3b8'} style={{ flexShrink: 0 }} />

                              {/* Flèches up/down */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <button
                                  style={{
                                    ...styles.btnIcon,
                                    padding: '2px',
                                    opacity: isFirst ? 0.3 : 1,
                                    cursor: isFirst ? 'not-allowed' : 'pointer'
                                  }}
                                  onClick={() => !isFirst && moveItem(item, 'up')}
                                  disabled={isFirst}
                                  title="Monter"
                                >
                                  <ChevronUp size={14} />
                                </button>
                                <button
                                  style={{
                                    ...styles.btnIcon,
                                    padding: '2px',
                                    opacity: isLast ? 0.3 : 1,
                                    cursor: isLast ? 'not-allowed' : 'pointer'
                                  }}
                                  onClick={() => !isLast && moveItem(item, 'down')}
                                  disabled={isLast}
                                  title="Descendre"
                                >
                                  <ChevronDown size={14} />
                                </button>
                              </div>

                              {/* Icon type */}
                              <span style={{ fontSize: '22px', flexShrink: 0 }}>{getTypeIcon(item.type)}</span>

                              {/* Label et URL */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: '0 0 2px 0', fontWeight: '600', fontSize: '14px' }}>
                                  {item.label}
                                  {item.children && item.children.length > 0 && (
                                    <span style={{ marginLeft: '8px', fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>
                                      ({item.children.length} sous-élément{item.children.length > 1 ? 's' : ''})
                                    </span>
                                  )}
                                </p>
                                <p style={{
                                  margin: 0,
                                  fontSize: '12px',
                                  color: isDark ? '#64748b' : '#94a3b8',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {item.url || '—'}
                                </p>
                              </div>

                              {/* Badge type */}
                              <span style={{
                                ...styles.badge(
                                  item.type === 'custom' ? colors.warning :
                                  item.type === 'page' ? colors.primary :
                                  item.type === 'post' ? colors.success :
                                  item.type === 'home' ? colors.teal : colors.secondary
                                ),
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                {item.type || 'custom'}
                              </span>

                              {/* Target blank */}
                              {item.target === '_blank' && (
                                <span title="Ouvre dans une nouvelle fenêtre" style={{ fontSize: '14px' }}>↗️</span>
                              )}

                              {/* Actions */}
                              <button style={styles.btnIcon} onClick={() => openEditItem(item)} title="Modifier">
                                <Edit size={15} />
                              </button>
                              <button style={{ ...styles.btnIcon, color: colors.error }} onClick={() => handleDeleteItem(item.id)} title="Supprimer">
                                <Trash2 size={15} />
                              </button>
                            </div>

                            {/* Indicateur de drop "après" */}
                            {isOver && dropPosition === 'after' && (
                              <div style={{
                                height: '3px',
                                background: colors.primary,
                                borderRadius: '2px',
                                marginLeft: depth * 32,
                                marginTop: '-4px',
                                marginBottom: '4px'
                              }} />
                            )}

                            {/* Rendu des enfants */}
                            {item.children && item.children.length > 0 && (
                              <div>
                                {item.children.map((child, childIndex) =>
                                  renderMenuItem(child, depth + 1, item.children, childIndex)
                                )}
                              </div>
                            )}
                          </div>
                        );
                      };

                      return menuTree.map((item, index) => renderMenuItem(item, 0, menuTree, index));
                    })()}

                    {/* Info drag & drop */}
                    <div style={{
                      marginTop: '16px',
                      padding: '12px 16px',
                      background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: isDark ? '#94a3b8' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <GripVertical size={14} />
                      <span>Glissez-déposez pour réorganiser • Déposez au centre d'un élément pour créer un sous-menu</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Menu size={48} color={isDark ? '#334155' : '#cbd5e1'} style={{ marginBottom: '12px' }} />
                    <p style={styles.textMuted}>Aucun élément dans ce menu</p>
                    <button
                      style={{ ...styles.btnSecondary, marginTop: '12px' }}
                      onClick={() => { setEditingItem(null); resetItemForm(); setShowItemModal(true); }}
                    >
                      <Plus size={16} /> Ajouter le premier élément
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 20px',
                borderRadius: '50%',
                background: isDark ? '#1e293b' : '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Menu size={40} color={isDark ? '#475569' : '#94a3b8'} />
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontWeight: '600' }}>Sélectionnez un menu</h3>
              <p style={{ ...styles.textMuted, maxWidth: '300px', margin: '0 auto' }}>
                Choisissez un menu dans la liste à gauche pour voir et gérer ses éléments
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal nouveau/édition menu */}
      <Modal isOpen={showMenuModal} onClose={() => { setShowMenuModal(false); setEditingMenu(null); }} title={editingMenu ? '✏️ Modifier le menu' : '➕ Nouveau menu'} isDark={isDark} width="480px">
        <div style={styles.mb16}>
          <label style={styles.label}>Nom du menu *</label>
          <input
            value={menuForm.name}
            onChange={e => setMenuForm({ ...menuForm, name: e.target.value })}
            style={styles.input}
            placeholder="Ex: Menu principal, Navigation footer..."
          />
        </div>
        <div style={styles.mb16}>
          <label style={styles.label}>Emplacement</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {menuLocations.map(loc => (
              <div
                key={loc.value}
                onClick={() => setMenuForm({ ...menuForm, location: loc.value })}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: menuForm.location === loc.value
                    ? `2px solid ${colors.cameroonGreen}`
                    : `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  background: menuForm.location === loc.value
                    ? `${colors.cameroonGreen}15`
                    : (isDark ? '#0f172a' : '#f8fafc'),
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '20px', display: 'block', marginBottom: '6px' }}>{loc.icon}</span>
                <span style={{ fontSize: '13px', fontWeight: menuForm.location === loc.value ? '600' : '400' }}>
                  {loc.label.replace(/^[^\s]+\s/, '')}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div style={styles.mb16}>
          <label style={styles.label}>Description (optionnel)</label>
          <textarea
            value={menuForm.description}
            onChange={e => setMenuForm({ ...menuForm, description: e.target.value })}
            style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
            placeholder="Description interne du menu..."
          />
        </div>
        <button style={{ ...styles.btnPrimary, width: '100%', justifyContent: 'center' }} onClick={handleSaveMenu}>
          <Save size={18} /> {editingMenu ? 'Enregistrer' : 'Créer le menu'}
        </button>
      </Modal>

      {/* Modal élément de menu */}
      <Modal isOpen={showItemModal} onClose={() => { setShowItemModal(false); setEditingItem(null); }} title={editingItem ? '✏️ Modifier l\'élément' : '➕ Nouvel élément'} isDark={isDark} width="550px">
        {/* Type de lien */}
        <div style={styles.mb16}>
          <label style={styles.label}>Type de lien</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {menuItemTypes.map(type => (
              <div
                key={type.value}
                onClick={() => setItemForm({ ...itemForm, type: type.value, url: type.value === 'home' ? '/' : '' })}
                style={{
                  padding: '12px 8px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  border: itemForm.type === type.value
                    ? `2px solid ${colors.cameroonGreen}`
                    : `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  background: itemForm.type === type.value
                    ? `${colors.cameroonGreen}15`
                    : (isDark ? '#0f172a' : '#f8fafc'),
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
                title={type.description}
              >
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '4px' }}>{type.icon}</span>
                <span style={{ fontSize: '11px', fontWeight: itemForm.type === type.value ? '600' : '400' }}>
                  {type.value === 'custom' ? 'Lien' : type.value === 'category' ? 'Catég.' : type.label.split(' ')[1] || type.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Labels FR/EN */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={styles.label}>🇫🇷 Label (Français) *</label>
            <input
              value={itemForm.label_fr}
              onChange={e => setItemForm({ ...itemForm, label_fr: e.target.value })}
              style={styles.input}
              placeholder="Accueil"
            />
          </div>
          <div>
            <label style={styles.label}>🇬🇧 Label (English)</label>
            <input
              value={itemForm.label_en}
              onChange={e => setItemForm({ ...itemForm, label_en: e.target.value })}
              style={styles.input}
              placeholder="Home"
            />
          </div>
        </div>

        {/* Champs dynamiques selon le type */}
        {itemForm.type === 'custom' && (
          <div style={styles.mb16}>
            <label style={styles.label}>🔗 URL</label>
            <input
              value={itemForm.url}
              onChange={e => setItemForm({ ...itemForm, url: e.target.value })}
              style={styles.input}
              placeholder="https://example.com ou /ma-page"
            />
          </div>
        )}

        {itemForm.type === 'page' && (
          <div style={styles.mb16}>
            <label style={styles.label}>📄 Sélectionner une page</label>
            <div ref={pageDropdownRef} style={{ position: 'relative' }}>
              <div
                onClick={() => setShowPageDropdown(!showPageDropdown)}
                style={{
                  ...styles.select,
                  width: '100%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>
                  {itemForm.page_id
                    ? `📄 ${pages.find(p => p.id == itemForm.page_id)?.title_fr || pages.find(p => p.id == itemForm.page_id)?.title || 'Page sélectionnée'}`
                    : '-- Choisir une page --'}
                </span>
                <ChevronDown size={16} />
              </div>
              {showPageDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: isDark ? '#1e293b' : '#fff',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                  zIndex: 1000,
                  maxHeight: '300px',
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '8px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                    <input
                      type="text"
                      placeholder="🔍 Rechercher une page..."
                      value={pageSearch}
                      onChange={e => setPageSearch(e.target.value)}
                      style={{ ...styles.input, width: '100%', margin: 0 }}
                      autoFocus
                    />
                  </div>
                  <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    <div
                      onClick={() => {
                        setItemForm({ ...itemForm, page_id: '' });
                        setShowPageDropdown(false);
                        setPageSearch('');
                      }}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        background: !itemForm.page_id ? (isDark ? '#334155' : '#e0f2fe') : 'transparent',
                        borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`
                      }}
                    >
                      -- Aucune page --
                    </div>
                    {pages
                      .filter(p => {
                        const title = (p.title_fr || p.title || '').toLowerCase();
                        return title.includes(pageSearch.toLowerCase());
                      })
                      .map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setItemForm({ ...itemForm, page_id: p.id });
                            setShowPageDropdown(false);
                            setPageSearch('');
                          }}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            background: itemForm.page_id == p.id ? (isDark ? '#334155' : '#e0f2fe') : 'transparent',
                            borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                          onMouseEnter={e => e.target.style.background = isDark ? '#334155' : '#f1f5f9'}
                          onMouseLeave={e => e.target.style.background = itemForm.page_id == p.id ? (isDark ? '#334155' : '#e0f2fe') : 'transparent'}
                        >
                          <span>📄</span>
                          <span>{p.title_fr || p.title}</span>
                        </div>
                      ))}
                    {pages.filter(p => (p.title_fr || p.title || '').toLowerCase().includes(pageSearch.toLowerCase())).length === 0 && (
                      <div style={{ padding: '16px', textAlign: 'center', color: isDark ? '#64748b' : '#94a3b8' }}>
                        Aucune page trouvée
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {itemForm.type === 'post' && (
          <div style={styles.mb16}>
            <label style={styles.label}>📰 Sélectionner un article</label>
            <div ref={postDropdownRef} style={{ position: 'relative' }}>
              <div
                onClick={() => setShowPostDropdown(!showPostDropdown)}
                style={{
                  ...styles.select,
                  width: '100%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>
                  {itemForm.post_id
                    ? `📰 ${posts.find(p => p.id == itemForm.post_id)?.title_fr || posts.find(p => p.id == itemForm.post_id)?.title || 'Article sélectionné'}`
                    : '-- Choisir un article --'}
                </span>
                <ChevronDown size={16} />
              </div>
              {showPostDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: isDark ? '#1e293b' : '#fff',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                  zIndex: 1000,
                  maxHeight: '300px',
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '8px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                    <input
                      type="text"
                      placeholder="🔍 Rechercher un article..."
                      value={postSearch}
                      onChange={e => setPostSearch(e.target.value)}
                      style={{ ...styles.input, width: '100%', margin: 0 }}
                      autoFocus
                    />
                  </div>
                  <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    <div
                      onClick={() => {
                        setItemForm({ ...itemForm, post_id: '' });
                        setShowPostDropdown(false);
                        setPostSearch('');
                      }}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        background: !itemForm.post_id ? (isDark ? '#334155' : '#e0f2fe') : 'transparent',
                        borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`
                      }}
                    >
                      -- Aucun article --
                    </div>
                    {posts
                      .filter(p => {
                        const title = (p.title_fr || p.title || '').toLowerCase();
                        return title.includes(postSearch.toLowerCase());
                      })
                      .map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setItemForm({ ...itemForm, post_id: p.id });
                            setShowPostDropdown(false);
                            setPostSearch('');
                          }}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            background: itemForm.post_id == p.id ? (isDark ? '#334155' : '#e0f2fe') : 'transparent',
                            borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                          onMouseEnter={e => e.target.style.background = isDark ? '#334155' : '#f1f5f9'}
                          onMouseLeave={e => e.target.style.background = itemForm.post_id == p.id ? (isDark ? '#334155' : '#e0f2fe') : 'transparent'}
                        >
                          <span>📰</span>
                          <span style={{ flex: 1 }}>{p.title_fr || p.title}</span>
                          {p.category_name && (
                            <span style={{ fontSize: '11px', padding: '2px 6px', background: isDark ? '#475569' : '#e2e8f0', borderRadius: '4px' }}>
                              {p.category_name}
                            </span>
                          )}
                        </div>
                      ))}
                    {posts.filter(p => (p.title_fr || p.title || '').toLowerCase().includes(postSearch.toLowerCase())).length === 0 && (
                      <div style={{ padding: '16px', textAlign: 'center', color: isDark ? '#64748b' : '#94a3b8' }}>
                        Aucun article trouvé
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {itemForm.type === 'category' && (
          <div style={styles.mb16}>
            <label style={styles.label}>📁 Sélectionner une catégorie</label>
            <div ref={categoryDropdownRef} style={{ position: 'relative' }}>
              <div
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                style={{
                  ...styles.select,
                  width: '100%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>
                  {itemForm.category_id
                    ? `📁 ${categories.find(c => c.id == itemForm.category_id)?.name_fr || categories.find(c => c.id == itemForm.category_id)?.name || 'Catégorie sélectionnée'}`
                    : '-- Choisir une catégorie --'}
                </span>
                <ChevronDown size={16} />
              </div>
              {showCategoryDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: isDark ? '#1e293b' : '#fff',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                  zIndex: 1000,
                  maxHeight: '300px',
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '8px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                    <input
                      type="text"
                      placeholder="🔍 Rechercher une catégorie..."
                      value={categorySearch}
                      onChange={e => setCategorySearch(e.target.value)}
                      style={{ ...styles.input, width: '100%', margin: 0 }}
                      autoFocus
                    />
                  </div>
                  <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    <div
                      onClick={() => {
                        setItemForm({ ...itemForm, category_id: '' });
                        setShowCategoryDropdown(false);
                        setCategorySearch('');
                      }}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        background: !itemForm.category_id ? (isDark ? '#334155' : '#e0f2fe') : 'transparent',
                        borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`
                      }}
                    >
                      -- Aucune catégorie --
                    </div>
                    {categories
                      .filter(c => {
                        const name = (c.name_fr || c.name || '').toLowerCase();
                        return name.includes(categorySearch.toLowerCase());
                      })
                      .map(c => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setItemForm({ ...itemForm, category_id: c.id });
                            setShowCategoryDropdown(false);
                            setCategorySearch('');
                          }}
                          style={{
                            padding: '10px 12px',
                            paddingLeft: c.parent_id ? '28px' : '12px',
                            cursor: 'pointer',
                            background: itemForm.category_id == c.id ? (isDark ? '#334155' : '#e0f2fe') : 'transparent',
                            borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                          onMouseEnter={e => e.target.style.background = isDark ? '#334155' : '#f1f5f9'}
                          onMouseLeave={e => e.target.style.background = itemForm.category_id == c.id ? (isDark ? '#334155' : '#e0f2fe') : 'transparent'}
                        >
                          <span>{c.parent_id ? '📂' : '📁'}</span>
                          <span>{c.name_fr || c.name}</span>
                        </div>
                      ))}
                    {categories.filter(c => (c.name_fr || c.name || '').toLowerCase().includes(categorySearch.toLowerCase())).length === 0 && (
                      <div style={{ padding: '16px', textAlign: 'center', color: isDark ? '#64748b' : '#94a3b8' }}>
                        Aucune catégorie trouvée
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {itemForm.type === 'home' && (
          <div style={{
            padding: '16px',
            background: isDark ? '#0f172a' : '#f0fdf4',
            borderRadius: '10px',
            marginBottom: '16px',
            border: `1px solid ${colors.cameroonGreen}40`
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b' }}>
              🏠 Ce lien pointe vers la page d'accueil (/)
            </p>
          </div>
        )}

        {/* Options supplémentaires */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={styles.label}>Ouvrir dans</label>
            <select
              value={itemForm.target}
              onChange={e => setItemForm({ ...itemForm, target: e.target.value })}
              style={{ ...styles.select, width: '100%' }}
            >
              <option value="_self">Même fenêtre</option>
              <option value="_blank">↗️ Nouvelle fenêtre</option>
            </select>
          </div>
          <div>
            <label style={styles.label}>Élément parent</label>
            <select
              value={itemForm.parent_id || ''}
              onChange={e => setItemForm({ ...itemForm, parent_id: e.target.value || null })}
              style={{ ...styles.select, width: '100%' }}
            >
              <option value="">Aucun (racine)</option>
              {menuItems.filter(i => !i.parent_id && i.id !== editingItem?.id).map(item => (
                <option key={item.id} value={item.id}>
                  └─ {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Options avancées */}
        <details style={{ marginBottom: '16px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>
            ⚙️ Options avancées
          </summary>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={styles.label}>Icône (emoji ou classe)</label>
              <input
                value={itemForm.icon}
                onChange={e => setItemForm({ ...itemForm, icon: e.target.value })}
                style={styles.input}
                placeholder="🏠 ou fa-home"
              />
            </div>
            <div>
              <label style={styles.label}>Classe CSS</label>
              <input
                value={itemForm.css_class}
                onChange={e => setItemForm({ ...itemForm, css_class: e.target.value })}
                style={styles.input}
                placeholder="highlight-link"
              />
            </div>
          </div>
        </details>

        <button style={{ ...styles.btnPrimary, width: '100%', justifyContent: 'center' }} onClick={handleSaveItem}>
          <Save size={18} /> {editingItem ? 'Enregistrer' : 'Ajouter au menu'}
        </button>
      </Modal>
    </div>
  );
};

// ============== GESTION DES MODULES ==============
const ModulesPage = ({ isDark, token }) => {
  const styles = createStyles(isDark);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const moduleTypes = [
    { type: 'latest_posts', label: 'Derniers articles', icon: FileText, description: 'Affiche les articles récents' },
    { type: 'categories', label: 'Catégories', icon: FolderTree, description: 'Liste des catégories' },
    { type: 'search', label: 'Recherche', icon: Search, description: 'Formulaire de recherche' },
    { type: 'social', label: 'Réseaux sociaux', icon: Globe, description: 'Liens vers les réseaux' },
    { type: 'newsletter', label: 'Newsletter', icon: Mail, description: 'Inscription newsletter' },
    { type: 'html', label: 'HTML personnalisé', icon: Code, description: 'Contenu HTML libre' },
    { type: 'image', label: 'Image/Banner', icon: ImageIcon, description: 'Affiche une image' },
    { type: 'menu', label: 'Menu', icon: Menu, description: 'Affiche un menu' },
    { type: 'tags', label: 'Nuage de tags', icon: Tag, description: 'Tags populaires' },
    { type: 'calendar', label: 'Calendrier', icon: Calendar, description: 'Calendrier des événements' }
  ];

  const [formData, setFormData] = useState({
    title: '',
    type: 'latest_posts',
    position: 'sidebar_right',
    settings: {},
    status: 'active',
    order: 0
  });

  const fetchModules = async () => {
    const res = await api.get('/modules', token);
    if (res.success) setModules(res.data);
    else setModules([]);
    setLoading(false);
  };

  useEffect(() => { fetchModules(); }, [token]);

  const handleSave = async () => {
    const res = editingModule
      ? await api.put(`/modules/${editingModule.id}`, formData, token)
      : await api.post('/modules', formData, token);
    
    if (res.success) {
      setToast({ message: editingModule ? 'Module mis à jour' : 'Module créé', type: 'success' });
      setShowModal(false);
      resetForm();
      fetchModules();
    }
  };

  const handleDelete = (id) => {
    const module = modules.find(m => m.id === id);
    setConfirmDialog({
      title: 'Supprimer ce module ?',
      message: `Êtes-vous sûr de vouloir supprimer le module "${module?.title || 'ce module'}" ? Cette action est irréversible.`,
      type: 'danger',
      confirmText: 'Supprimer',
      onConfirm: async () => {
        const res = await api.delete(`/modules/${id}`, token);
        if (res.success) {
          setToast({ message: 'Module supprimé', type: 'success' });
          fetchModules();
        } else {
          setToast({ message: res.message || 'Erreur lors de la suppression', type: 'error' });
        }
        setConfirmDialog(null);
      }
    });
  };

  const resetForm = () => {
    setEditingModule(null);
    setFormData({ title: '', type: 'latest_posts', position: 'sidebar_right', settings: {}, status: 'active', order: 0 });
  };

  if (loading) return <Spinner />;

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setConfirmDialog(null)}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          confirmText={confirmDialog.confirmText}
          isDark={isDark}
        />
      )}

      <div style={styles.flexBetween}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800' }}>Modules</h1>
          <p style={styles.textMuted}>Widgets et blocs réutilisables</p>
        </div>
        <button style={styles.btnPrimary} onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus size={20} /> Nouveau Module
        </button>
      </div>

      <div style={{ ...styles.card, marginTop: '24px' }}>
        {modules.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {modules.map(mod => {
              const modType = moduleTypes.find(t => t.type === mod.type);
              const ModIcon = modType?.icon || Box;
              return (
                <div key={mod.id} style={{ ...styles.cardHover, padding: '20px' }}>
                  <div style={styles.flexBetween}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: `${colors.cameroonGreen}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ModIcon size={24} color={colors.cameroonGreen} />
                    </div>
                    <span style={styles.badge(mod.status === 'active' ? colors.success : colors.warning)}>
                      {mod.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <h3 style={{ margin: '16px 0 8px', fontWeight: '700' }}>{mod.title}</h3>
                  <p style={{ margin: '0 0 16px', fontSize: '13px', ...styles.textMuted }}>{modType?.description || mod.type}</p>
                  <div style={styles.flex}>
                    <button style={{ ...styles.btnSecondary, flex: 1, justifyContent: 'center' }} onClick={() => { setEditingModule(mod); setFormData(mod); setShowModal(true); }}>
                      <Edit size={16} />
                    </button>
                    <button style={{ ...styles.btnIcon, color: colors.error }} onClick={() => handleDelete(mod.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Box size={64} color={isDark ? '#334155' : '#cbd5e1'} style={{ marginBottom: '16px' }} />
            <p style={styles.textMuted}>Aucun module</p>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingModule ? 'Modifier le module' : 'Nouveau module'} isDark={isDark}>
        <div style={styles.mb16}>
          <label style={styles.label}>Titre</label>
          <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={styles.input} />
        </div>
        <div style={styles.mb16}>
          <label style={styles.label}>Type</label>
          <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={{ ...styles.select, width: '100%' }}>
            {moduleTypes.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}
          </select>
        </div>
        <div style={styles.mb16}>
          <label style={styles.label}>Position</label>
          <select value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} style={{ ...styles.select, width: '100%' }}>
            <option value="sidebar_left">Sidebar gauche</option>
            <option value="sidebar_right">Sidebar droite</option>
            <option value="footer">Footer</option>
            <option value="header">Header</option>
            <option value="before_content">Avant contenu</option>
            <option value="after_content">Après contenu</option>
          </select>
        </div>
        <div style={styles.mb16}>
          <label style={styles.label}>Statut</label>
          <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ ...styles.select, width: '100%' }}>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
        <button style={{ ...styles.btnPrimary, width: '100%', justifyContent: 'center' }} onClick={handleSave}>
          <Save size={18} /> Enregistrer
        </button>
      </Modal>
    </div>
  );
};

// Export tous les composants
// export { colors, api, createStyles, Toast, Spinner, Modal, StatCard, Tabs, LoginPage, Dashboard, PostsPage, PagesPage, CategoriesPage, MenusPage, ModulesPage };

// ============== GESTION DES SLIDERS ==============
const SlidersPage = ({ isDark, token }) => {
  const styles = createStyles(isDark);
  const [sliders, setSliders] = useState([]);
  const [activeSlider, setActiveSlider] = useState(null);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSliderModal, setShowSliderModal] = useState(false);
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const [sliderForm, setSliderForm] = useState({
    name: '', location: 'home_hero', settings: { autoplay: true, interval: 5000, arrows: true, dots: true, effect: 'fade' }
  });

  const [slideForm, setSlideForm] = useState({
    title: '', subtitle: '', image: '', button_text: '', button_url: '', order: 0, status: 'active'
  });

  const fetchSliders = async () => {
    const res = await api.get('/sliders', token);
    if (res.success) {
      setSliders(res.data);
      if (res.data.length > 0 && !activeSlider) {
        setActiveSlider(res.data[0]);
        fetchSlides(res.data[0].id);
      }
    } else setSliders([]);
    setLoading(false);
  };

  const fetchSlides = async (sliderId) => {
    const res = await api.get(`/sliders/${sliderId}/slides`, token);
    if (res.success) setSlides(res.data);
    else setSlides([]);
  };

  useEffect(() => { fetchSliders(); }, [token]);

  const handleSaveSlider = async () => {
    const res = await api.post('/sliders', { ...sliderForm, settings: JSON.stringify(sliderForm.settings) }, token);
    if (res.success) {
      setToast({ message: 'Slider créé', type: 'success' });
      setShowSliderModal(false);
      setSliderForm({ name: '', location: 'home_hero', settings: { autoplay: true, interval: 5000, arrows: true, dots: true, effect: 'fade' } });
      fetchSliders();
    }
  };

  const handleSaveSlide = async () => {
    const data = { ...slideForm, slider_id: activeSlider.id };
    const res = editingSlide
      ? await api.put(`/sliders/slides/${editingSlide.id}`, data, token)
      : await api.post(`/sliders/${activeSlider.id}/slides`, data, token);
    
    if (res.success) {
      setToast({ message: 'Slide enregistré', type: 'success' });
      setShowSlideModal(false);
      setEditingSlide(null);
      setSlideForm({ title: '', subtitle: '', image: '', button_text: '', button_url: '', order: 0, status: 'active' });
      fetchSlides(activeSlider.id);
    }
  };

  const handleDeleteSlide = (id) => {
    const slide = slides.find(s => s.id === id);
    setConfirmDialog({
      title: 'Supprimer ce slide ?',
      message: `Êtes-vous sûr de vouloir supprimer "${slide?.title || 'ce slide'}" ? Cette action est irréversible.`,
      type: 'danger',
      confirmText: 'Supprimer',
      onConfirm: async () => {
        const res = await api.delete(`/sliders/slides/${id}`, token);
        if (res.success) {
          setToast({ message: 'Slide supprimé', type: 'success' });
          fetchSlides(activeSlider.id);
        } else {
          setToast({ message: res.message || 'Erreur lors de la suppression', type: 'error' });
        }
        setConfirmDialog(null);
      }
    });
  };

  if (loading) return <Spinner />;

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setConfirmDialog(null)}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          confirmText={confirmDialog.confirmText}
          isDark={isDark}
        />
      )}

      <div style={styles.flexBetween}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800' }}>Sliders</h1>
          <p style={styles.textMuted}>Gérez vos diaporamas et carrousels</p>
        </div>
        <button style={styles.btnPrimary} onClick={() => setShowSliderModal(true)}>
          <Plus size={20} /> Nouveau Slider
        </button>
      </div>

      <div style={{ marginTop: '24px' }}>
        {/* Sélecteur de slider */}
        <div style={{ ...styles.card, marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {sliders.map(slider => (
              <button
                key={slider.id}
                onClick={() => { setActiveSlider(slider); fetchSlides(slider.id); }}
                style={{
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: `2px solid ${activeSlider?.id === slider.id ? colors.cameroonGreen : (isDark ? '#334155' : '#e2e8f0')}`,
                  background: activeSlider?.id === slider.id ? `${colors.cameroonGreen}20` : 'transparent',
                  color: isDark ? '#e2e8f0' : '#1e293b',
                  fontWeight: activeSlider?.id === slider.id ? '600' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Sliders size={18} />
                {slider.name}
                <span style={styles.badge(colors.primary)}>{slider.location}</span>
              </button>
            ))}
            {sliders.length === 0 && <p style={styles.textMuted}>Aucun slider</p>}
          </div>
        </div>

        {/* Slides du slider actif */}
        {activeSlider && (
          <div style={styles.card}>
            <div style={styles.flexBetween}>
              <h3 style={{ margin: 0, fontWeight: '700' }}>Slides de "{activeSlider.name}"</h3>
              <button style={styles.btnPrimary} onClick={() => { setEditingSlide(null); setSlideForm({ title: '', subtitle: '', image: '', button_text: '', button_url: '', order: slides.length, status: 'active' }); setShowSlideModal(true); }}>
                <Plus size={18} /> Ajouter un Slide
              </button>
            </div>
            
            <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {slides.map((slide, index) => (
                <div key={slide.id} style={{ ...styles.cardHover, padding: '0', overflow: 'hidden' }}>
                  <div style={{ height: '160px', background: isDark ? '#0f172a' : '#f1f5f9', position: 'relative' }}>
                    {slide.image ? (
                      <img src={slide.image.startsWith('http') ? slide.image : `http://localhost:5000${slide.image}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <ImageIcon size={48} color={isDark ? '#334155' : '#cbd5e1'} />
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: '8px', left: '8px', background: colors.cameroonGreen, color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>
                      #{index + 1}
                    </div>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700' }}>{slide.title || 'Sans titre'}</h4>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', ...styles.textMuted }}>{slide.subtitle || '-'}</p>
                    <div style={styles.flex}>
                      <button style={{ ...styles.btnSecondary, flex: 1, justifyContent: 'center', padding: '8px' }} onClick={() => { setEditingSlide(slide); setSlideForm(slide); setShowSlideModal(true); }}>
                        <Edit size={14} />
                      </button>
                      <button style={{ ...styles.btnIcon, color: colors.error }} onClick={() => handleDeleteSlide(slide.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {slides.length === 0 && (
                <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '60px' }}>
                  <Play size={48} color={isDark ? '#334155' : '#cbd5e1'} style={{ marginBottom: '16px' }} />
                  <p style={styles.textMuted}>Aucun slide dans ce slider</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal nouveau slider */}
      <Modal isOpen={showSliderModal} onClose={() => setShowSliderModal(false)} title="Nouveau Slider" isDark={isDark}>
        <div style={styles.mb16}>
          <label style={styles.label}>Nom du slider</label>
          <input value={sliderForm.name} onChange={e => setSliderForm({ ...sliderForm, name: e.target.value })} style={styles.input} placeholder="Slider Hero" />
        </div>
        <div style={styles.mb16}>
          <label style={styles.label}>Emplacement</label>
          <select value={sliderForm.location} onChange={e => setSliderForm({ ...sliderForm, location: e.target.value })} style={{ ...styles.select, width: '100%' }}>
            <option value="home_hero">Accueil - Hero</option>
            <option value="home_bottom">Accueil - Bas de page</option>
            <option value="sidebar">Sidebar</option>
            <option value="page_header">En-tête de page</option>
            <option value="footer">Footer</option>
          </select>
        </div>
        <div style={styles.mb16}>
          <label style={{ ...styles.flex, cursor: 'pointer' }}>
            <input type="checkbox" checked={sliderForm.settings.autoplay} onChange={e => setSliderForm({ ...sliderForm, settings: { ...sliderForm.settings, autoplay: e.target.checked } })} style={{ width: '20px', height: '20px', accentColor: colors.cameroonGreen }} />
            <span style={{ marginLeft: '12px' }}>Lecture automatique</span>
          </label>
        </div>
        <div style={styles.mb16}>
          <label style={styles.label}>Intervalle (ms)</label>
          <input type="number" value={sliderForm.settings.interval} onChange={e => setSliderForm({ ...sliderForm, settings: { ...sliderForm.settings, interval: parseInt(e.target.value) } })} style={styles.input} />
        </div>
        <button style={{ ...styles.btnPrimary, width: '100%', justifyContent: 'center' }} onClick={handleSaveSlider}>
          <Save size={18} /> Créer
        </button>
      </Modal>

      {/* Modal slide */}
      <Modal isOpen={showSlideModal} onClose={() => setShowSlideModal(false)} title={editingSlide ? 'Modifier le slide' : 'Nouveau slide'} isDark={isDark}>
        <div style={styles.mb16}>
          <label style={styles.label}>Titre</label>
          <input value={slideForm.title} onChange={e => setSlideForm({ ...slideForm, title: e.target.value })} style={styles.input} />
        </div>
        <div style={styles.mb16}>
          <label style={styles.label}>Sous-titre</label>
          <input value={slideForm.subtitle} onChange={e => setSlideForm({ ...slideForm, subtitle: e.target.value })} style={styles.input} />
        </div>
        <div style={styles.mb16}>
          <label style={styles.label}>Image URL</label>
          <input value={slideForm.image} onChange={e => setSlideForm({ ...slideForm, image: e.target.value })} style={styles.input} placeholder="/uploads/image.jpg ou https://..." />
        </div>
        <div style={styles.grid2}>
          <div style={styles.mb16}>
            <label style={styles.label}>Texte du bouton</label>
            <input value={slideForm.button_text} onChange={e => setSlideForm({ ...slideForm, button_text: e.target.value })} style={styles.input} />
          </div>
          <div style={styles.mb16}>
            <label style={styles.label}>URL du bouton</label>
            <input value={slideForm.button_url} onChange={e => setSlideForm({ ...slideForm, button_url: e.target.value })} style={styles.input} />
          </div>
        </div>
        <button style={{ ...styles.btnPrimary, width: '100%', justifyContent: 'center' }} onClick={handleSaveSlide}>
          <Save size={18} /> Enregistrer
        </button>
      </Modal>
    </div>
  );
};

// ============== GESTION DES THÈMES ==============
const ThemesPage = ({ isDark, token }) => {
  const styles = createStyles(isDark);
  const [themes, setThemes] = useState([]);
  const [activeTheme, setActiveTheme] = useState('onehealth-default');
  const [customizing, setCustomizing] = useState(false);
  const [customSettings, setCustomSettings] = useState({});
  const [toast, setToast] = useState(null);

  // 5 thèmes par défaut
  const defaultThemes = [
    {
      id: 'onehealth-default',
      name: 'One Health Default',
      description: 'Thème officiel aux couleurs du Cameroun',
      preview: 'linear-gradient(135deg, #007A33, #009688, #2196F3)',
      colors: {
        primary: '#007A33',
        secondary: '#009688',
        accent: '#FF9800',
        background: '#f8fafc',
        text: '#1e293b',
        headerBg: '#ffffff',
        footerBg: '#1a1a2e'
      }
    },
    {
      id: 'medical-blue',
      name: 'Medical Blue',
      description: 'Thème médical professionnel',
      preview: 'linear-gradient(135deg, #1976D2, #42A5F5, #90CAF9)',
      colors: {
        primary: '#1976D2',
        secondary: '#42A5F5',
        accent: '#FF5722',
        background: '#f5f7fa',
        text: '#263238',
        headerBg: '#ffffff',
        footerBg: '#0D47A1'
      }
    },
    {
      id: 'nature-green',
      name: 'Nature Green',
      description: 'Thème écologique et naturel',
      preview: 'linear-gradient(135deg, #2E7D32, #4CAF50, #81C784)',
      colors: {
        primary: '#2E7D32',
        secondary: '#4CAF50',
        accent: '#FFC107',
        background: '#f1f8e9',
        text: '#1b5e20',
        headerBg: '#ffffff',
        footerBg: '#1b5e20'
      }
    },
    {
      id: 'dark-mode',
      name: 'Dark Mode',
      description: 'Thème sombre moderne',
      preview: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
      colors: {
        primary: '#00bcd4',
        secondary: '#7c4dff',
        accent: '#ff4081',
        background: '#0f172a',
        text: '#e2e8f0',
        headerBg: '#1e293b',
        footerBg: '#0f172a'
      }
    },
    {
      id: 'warm-sunset',
      name: 'Warm Sunset',
      description: 'Couleurs chaudes et accueillantes',
      preview: 'linear-gradient(135deg, #E65100, #FF9800, #FFB74D)',
      colors: {
        primary: '#E65100',
        secondary: '#FF9800',
        accent: '#7B1FA2',
        background: '#fff8e1',
        text: '#4e342e',
        headerBg: '#ffffff',
        footerBg: '#bf360c'
      }
    }
  ];

  useEffect(() => {
    const fetchActiveTheme = async () => {
      const res = await api.get('/settings/theme', token);
      if (res.success && res.data) {
        setActiveTheme(res.data.theme_id || 'onehealth-default');
        setCustomSettings(res.data.custom_settings || {});
      }
    };
    fetchActiveTheme();
    setThemes(defaultThemes);
  }, [token]);

  const activateTheme = async (themeId) => {
    const res = await api.put('/settings/theme', { theme_id: themeId }, token);
    if (res.success) {
      setActiveTheme(themeId);
      setToast({ message: 'Thème activé', type: 'success' });
    }
  };

  const saveCustomization = async () => {
    const res = await api.put('/settings/theme', { theme_id: activeTheme, custom_settings: customSettings }, token);
    if (res.success) {
      setToast({ message: 'Personnalisation enregistrée', type: 'success' });
      setCustomizing(false);
    }
  };

  const currentTheme = themes.find(t => t.id === activeTheme) || themes[0];

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div style={styles.flexBetween}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800' }}>Thèmes</h1>
          <p style={styles.textMuted}>Personnalisez l'apparence de votre site</p>
        </div>
        <button style={styles.btnPrimary} onClick={() => setCustomizing(!customizing)}>
          <Paintbrush size={20} /> {customizing ? 'Fermer' : 'Personnaliser'}
        </button>
      </div>

      {customizing ? (
        <div style={{ ...styles.card, marginTop: '24px' }}>
          <h3 style={{ margin: '0 0 24px 0', fontWeight: '700' }}>Personnaliser "{currentTheme.name}"</h3>
          <div style={styles.grid2}>
            <div>
              <ColorPicker label="Couleur primaire" value={customSettings.primary || currentTheme.colors.primary} onChange={v => setCustomSettings({ ...customSettings, primary: v })} isDark={isDark} />
              <ColorPicker label="Couleur secondaire" value={customSettings.secondary || currentTheme.colors.secondary} onChange={v => setCustomSettings({ ...customSettings, secondary: v })} isDark={isDark} />
              <ColorPicker label="Couleur d'accent" value={customSettings.accent || currentTheme.colors.accent} onChange={v => setCustomSettings({ ...customSettings, accent: v })} isDark={isDark} />
            </div>
            <div>
              <ColorPicker label="Fond" value={customSettings.background || currentTheme.colors.background} onChange={v => setCustomSettings({ ...customSettings, background: v })} isDark={isDark} />
              <ColorPicker label="Texte" value={customSettings.text || currentTheme.colors.text} onChange={v => setCustomSettings({ ...customSettings, text: v })} isDark={isDark} />
              <ColorPicker label="Header" value={customSettings.headerBg || currentTheme.colors.headerBg} onChange={v => setCustomSettings({ ...customSettings, headerBg: v })} isDark={isDark} />
            </div>
          </div>
          <div style={styles.divider} />
          <div style={styles.flexBetween}>
            <button style={styles.btnSecondary} onClick={() => setCustomSettings({})}>Réinitialiser</button>
            <button style={styles.btnPrimary} onClick={saveCustomization}><Save size={18} /> Enregistrer</button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {themes.map(theme => (
            <div
              key={theme.id}
              style={{
                ...styles.cardHover,
                padding: '0',
                overflow: 'hidden',
                border: activeTheme === theme.id ? `3px solid ${colors.cameroonGreen}` : `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
              }}
            >
              <div style={{ height: '120px', background: theme.preview, position: 'relative' }}>
                {activeTheme === theme.id && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: colors.cameroonGreen, color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={14} /> Actif
                  </div>
                )}
              </div>
              <div style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>{theme.name}</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', ...styles.textMuted }}>{theme.description}</p>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                  {Object.values(theme.colors).slice(0, 5).map((color, i) => (
                    <div key={i} style={{ width: '24px', height: '24px', borderRadius: '6px', background: color, border: '2px solid rgba(0,0,0,0.1)' }} />
                  ))}
                </div>
                <button
                  style={{ ...styles.btnPrimary, width: '100%', justifyContent: 'center', opacity: activeTheme === theme.id ? 0.5 : 1 }}
                  onClick={() => activateTheme(theme.id)}
                  disabled={activeTheme === theme.id}
                >
                  {activeTheme === theme.id ? 'Thème actif' : 'Activer'}
                </button>
              </div>
            </div>
          ))}

          {/* Carte pour ajouter un thème */}
          <div style={{ ...styles.cardHover, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '280px', border: `2px dashed ${isDark ? '#334155' : '#e2e8f0'}` }}>
            <Plus size={48} color={isDark ? '#334155' : '#cbd5e1'} style={{ marginBottom: '16px' }} />
            <p style={{ ...styles.textMuted, marginBottom: '16px' }}>Ajouter un thème</p>
            <button style={styles.btnSecondary}>
              <Upload size={18} /> Importer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============== GESTION DES MÉDIAS ==============
const MediaPage = ({ isDark, token, hasPermission = () => true }) => {
  const styles = createStyles(isDark);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [previewImage, setPreviewImage] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = (url) => {
    const fullUrl = `http://localhost:5000${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchMedia = async () => {
    const res = await api.get('/media', token);
    if (res.success) setMedia(res.data);
    else setMedia([]);
    setLoading(false);
  };

  useEffect(() => { fetchMedia(); }, [token]);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    
    for (let file of files) {
      const formData = new FormData();
      formData.append('files', file);
      const res = await api.upload('/media/upload', formData, token);
      if (res.success) {
        setToast({ message: `${file.name} uploadé`, type: 'success' });
      }
    }
    fetchMedia();
  };

  const handleDelete = (id) => {
    const file = media.find(m => m.id === id);
    setConfirmDialog({
      title: 'Supprimer ce fichier ?',
      message: `Êtes-vous sûr de vouloir supprimer "${file?.filename || 'ce fichier'}" ? Cette action est irréversible.`,
      type: 'danger',
      confirmText: 'Supprimer',
      onConfirm: async () => {
        const res = await api.delete(`/media/${id}`, token);
        if (res.success) {
          setToast({ message: 'Fichier supprimé', type: 'success' });
          fetchMedia();
        } else {
          setToast({ message: res.message || 'Erreur lors de la suppression', type: 'error' });
        }
        setConfirmDialog(null);
      }
    });
  };

  const filteredMedia = media.filter(item => {
    const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || 
      (typeFilter === 'images' && item.mime_type?.startsWith('image')) ||
      (typeFilter === 'documents' && !item.mime_type?.startsWith('image'));
    return matchesSearch && matchesType;
  });

  if (loading) return <Spinner />;

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setConfirmDialog(null)}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          confirmText={confirmDialog.confirmText}
          isDark={isDark}
        />
      )}

      <div style={styles.flexBetween}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800' }}>Médiathèque</h1>
          <p style={styles.textMuted}>{media.length} fichiers</p>
        </div>
        {hasPermission('media.upload') && (
          <label style={{ ...styles.btnPrimary, cursor: 'pointer' }}>
            <Upload size={20} /> Uploader
            <input type="file" multiple onChange={handleUpload} style={{ display: 'none' }} accept="image/*,.pdf,.doc,.docx" />
          </label>
        )}
      </div>

      <div style={{ ...styles.card, marginTop: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#64748b' : '#94a3b8' }} />
            <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ ...styles.input, paddingLeft: '48px' }} />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ ...styles.select, width: '150px' }}>
            <option value="all">Tous</option>
            <option value="images">Images</option>
            <option value="documents">Documents</option>
          </select>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button style={{ ...styles.btnIcon, background: viewMode === 'grid' ? (isDark ? '#334155' : '#e2e8f0') : 'transparent' }} onClick={() => setViewMode('grid')}><Grid size={20} /></button>
            <button style={{ ...styles.btnIcon, background: viewMode === 'list' ? (isDark ? '#334155' : '#e2e8f0') : 'transparent' }} onClick={() => setViewMode('list')}><Menu size={20} /></button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '10px' }}>
          {filteredMedia.map(item => (
            <div key={item.id} style={{ ...styles.cardHover, padding: '0', overflow: 'hidden', cursor: 'pointer' }} onClick={() => item.mime_type?.startsWith('image') && setPreviewImage(item)}>
              <div style={{ height: '70px', background: isDark ? '#0f172a' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.mime_type?.startsWith('image') ? (
                  <img src={`http://localhost:5000${item.url}`} alt={item.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <FileText size={32} color={isDark ? '#64748b' : '#94a3b8'} />
                )}
              </div>
              <div style={{ padding: '8px' }}>
                <p style={{ margin: '0 0 2px 0', fontWeight: '600', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.filename}</p>
                <div style={styles.flexBetween}>
                  <span style={{ fontSize: '10px', ...styles.textMuted }}>{(item.size / 1024).toFixed(1)} KB</span>
                  {hasPermission('media.delete') && (
                    <button style={{ ...styles.btnIcon, padding: '2px', color: colors.error }} onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}><Trash2 size={12} /></button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Fichier</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Taille</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedia.map(item => (
                <tr key={item.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.flex}>
                      {item.mime_type?.startsWith('image') ? (
                        <img src={`http://localhost:5000${item.url}`} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                      ) : (
                        <FileText size={24} color={isDark ? '#64748b' : '#94a3b8'} />
                      )}
                      <span style={{ fontWeight: '500' }}>{item.filename}</span>
                    </div>
                  </td>
                  <td style={styles.td}>{item.mime_type}</td>
                  <td style={styles.td}>{(item.size / 1024).toFixed(1)} KB</td>
                  <td style={styles.td}>{new Date(item.created_at).toLocaleDateString('fr-FR')}</td>
                  <td style={styles.td}>
                    {hasPermission('media.delete') && (
                      <button style={{ ...styles.btnIcon, color: colors.error }} onClick={() => handleDelete(item.id)}><Trash2 size={18} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {filteredMedia.length === 0 && (
        <div style={{ ...styles.card, textAlign: 'center', padding: '60px' }}>
          <Image size={64} color={isDark ? '#334155' : '#cbd5e1'} style={{ marginBottom: '16px' }} />
          <p style={styles.textMuted}>Aucun média</p>
        </div>
      )}

      {/* Modal de prévisualisation */}
      {previewImage && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px'
        }} onClick={() => setPreviewImage(null)}>
          <div style={{
            background: isDark ? '#1e293b' : '#fff',
            borderRadius: '16px', maxWidth: '90vw', maxHeight: '90vh',
            overflow: 'hidden', position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{previewImage.filename}</h3>
              <button onClick={() => setPreviewImage(null)} style={{ ...styles.btnIcon, padding: '8px' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', background: isDark ? '#0f172a' : '#f8fafc' }}>
              <img src={`http://localhost:5000${previewImage.url}`} alt={previewImage.filename} style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }} />
            </div>
            <div style={{ padding: '16px', borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  readOnly
                  value={`http://localhost:5000${previewImage.url}`}
                  style={{ ...styles.input, flex: 1, fontSize: '13px' }}
                />
                <button
                  onClick={() => handleCopyLink(previewImage.url)}
                  style={{ ...styles.btnPrimary, display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
                >
                  {copied ? <><Check size={16} /> Copié !</> : <><Copy size={16} /> Copier le lien</>}
                </button>
              </div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '16px', fontSize: '13px', ...styles.textMuted }}>
                <span>Type: {previewImage.mime_type}</span>
                <span>Taille: {(previewImage.size / 1024).toFixed(1)} KB</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============== OHWR-MAPPING ==============
const OHWRMappingPage = ({ isDark, token }) => {
  const styles = createStyles(isDark);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    human_resources: { total: 0 },
    material_resources: { total: 0 },
    organizations: { total: 0 },
    documents: { total: 0 }
  });

  // Regions & Expertise
  const [regions, setRegions] = useState([]);
  const [expertiseDomains, setExpertiseDomains] = useState([]);
  const [expertiseDomainsGrouped, setExpertiseDomainsGrouped] = useState({});
  const [expertiseCategoryLabels, setExpertiseCategoryLabels] = useState({});
  const [loadingDomains, setLoadingDomains] = useState(false);
  const [documentThemes, setDocumentThemes] = useState([]);

  // Lists
  const [experts, setExperts] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [documents, setDocuments] = useState([]);

  // Pagination
  const [expertsPagination, setExpertsPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [orgsPagination, setOrgsPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [materialsPagination, setMaterialsPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [docsPagination, setDocsPagination] = useState({ page: 1, total: 0, pages: 0 });

  // Filters
  const [expertFilters, setExpertFilters] = useState({ search: '', category: '', region: '' });
  const [orgFilters, setOrgFilters] = useState({ search: '', type: '', region: '' });
  const [materialFilters, setMaterialFilters] = useState({ search: '', type: '', status: '', region: '' });
  const [docFilters, setDocFilters] = useState({ search: '', type: '', language: '' });

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Current edit items
  const [currentExpert, setCurrentExpert] = useState(null);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [currentMaterial, setCurrentMaterial] = useState(null);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Domain management
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  const [domainForm, setDomainForm] = useState({ name: '', category: 'health', description: '', icon: 'award', is_active: true });

  // All organizations (for dropdowns in modals)
  const [allOrganizations, setAllOrganizations] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  // Form validation errors
  const [formErrors, setFormErrors] = useState({});

  // Upload state
  const [uploading, setUploading] = useState(false);

  // View mode: 'list' or 'form'
  const [viewMode, setViewMode] = useState('list');

  // Form states
  const [expertForm, setExpertForm] = useState({
    first_name: '', last_name: '', title: '', category: 'expert',
    email: '', phone: '', organization_id: '', region: '', city: '',
    latitude: '', longitude: '', biography: '', photo: '',
    // New fields
    years_experience: '', cv_url: '', linkedin_url: '', twitter_url: '',
    orcid_id: '', google_scholar_url: '', researchgate_url: '', website: '',
    languages: [], education: [], certifications: [],
    publications_count: '', projects_count: '', awards: '',
    research_interests: '', available_for_collaboration: true,
    consultation_rate: '', expertise_summary: '', selected_expertise_ids: []
  });

  const [orgForm, setOrgForm] = useState({
    name: '', acronym: '', type: 'government', description: '', mission: '',
    website: '', region: '', city: '', address: '',
    contact_email: '', contact_phone: '', latitude: '', longitude: '', logo: ''
  });

  const [materialForm, setMaterialForm] = useState({
    name: '', type: 'laboratory', description: '', status: 'available',
    organization_id: '', region: '', city: '', address: '',
    contact_email: '', contact_phone: '', latitude: '', longitude: '', capacity: ''
  });

  const [docForm, setDocForm] = useState({
    title: '', type: 'article', description: '', content: '',
    organization_id: '', language: 'fr', publication_date: '',
    file_path: '', thumbnail: '', access_level: 'public', is_featured: false
  });

  const piliers = [
    { id: 'human', label: 'Ressources Humaines', icon: User, color: '#27AE60', count: stats.human_resources.total, description: 'Experts, professionnels, chercheurs' },
    { id: 'material', label: 'Ressources Matérielles', icon: Box, color: '#3498DB', count: stats.material_resources.total, description: 'Laboratoires, équipements, infrastructures' },
    { id: 'organization', label: 'Organisations', icon: Home, color: '#E67E22', count: stats.organizations.total, description: 'Institutions, ONG, réseaux' },
    { id: 'document', label: 'Documents', icon: FileText, color: '#9B59B6', count: stats.documents.total, description: 'Guides, articles, thèses, formations' }
  ];

  const expertCategories = [
    { value: 'expert', label: 'Expert' },
    { value: 'researcher', label: 'Chercheur' },
    { value: 'practitioner', label: 'Praticien' },
    { value: 'consultant', label: 'Consultant' },
    { value: 'trainer', label: 'Formateur' }
  ];

  const orgTypes = [
    { value: 'government', label: 'Gouvernement' },
    { value: 'ngo', label: 'ONG' },
    { value: 'university', label: 'Université' },
    { value: 'research', label: 'Centre de recherche' },
    { value: 'hospital', label: 'Hôpital' },
    { value: 'network', label: 'Réseau' },
    { value: 'international', label: 'Organisation internationale' }
  ];

  const materialTypes = [
    { value: 'laboratory', label: 'Laboratoire' },
    { value: 'equipment', label: 'Équipement' },
    { value: 'vehicle', label: 'Véhicule' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'other', label: 'Autre' }
  ];

  const materialStatuses = [
    { value: 'available', label: 'Disponible' },
    { value: 'in_use', label: 'En utilisation' },
    { value: 'maintenance', label: 'En maintenance' },
    { value: 'unavailable', label: 'Indisponible' }
  ];

  const docTypes = [
    { value: 'article', label: 'Article scientifique' },
    { value: 'guide', label: 'Guide' },
    { value: 'report', label: 'Rapport' },
    { value: 'thesis', label: 'Thèse' },
    { value: 'manual', label: 'Manuel' },
    { value: 'video', label: 'Vidéo' },
    { value: 'presentation', label: 'Présentation' }
  ];

  // Region coordinates for auto-fill
  const regionCoordinates = {
    'Adamaoua': { lat: 7.3167, lng: 13.5833 },
    'Centre': { lat: 3.8667, lng: 11.5167 },
    'Est': { lat: 4.0333, lng: 13.6833 },
    'Extrême-Nord': { lat: 10.5833, lng: 14.3167 },
    'Littoral': { lat: 4.0500, lng: 9.7000 },
    'Nord': { lat: 9.3000, lng: 13.3833 },
    'Nord-Ouest': { lat: 5.9500, lng: 10.1500 },
    'Ouest': { lat: 5.4833, lng: 10.4167 },
    'Sud': { lat: 2.9333, lng: 10.1500 },
    'Sud-Ouest': { lat: 4.1500, lng: 9.2333 }
  };

  // Validation functions
  const validateEmail = (email) => {
    if (!email) return true;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    if (!phone) return true;
    const re = /^[+]?[\d\s\-()]{8,20}$/;
    return re.test(phone);
  };

  const validateExpertForm = () => {
    const errors = {};
    if (!expertForm.first_name?.trim()) errors.first_name = 'Le prénom est requis';
    if (!expertForm.last_name?.trim()) errors.last_name = 'Le nom est requis';
    if (expertForm.email && !validateEmail(expertForm.email)) errors.email = 'Email invalide';
    if (expertForm.phone && !validatePhone(expertForm.phone)) errors.phone = 'Téléphone invalide';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateOrgForm = () => {
    const errors = {};
    if (!orgForm.name?.trim()) errors.name = 'Le nom est requis';
    if (orgForm.contact_email && !validateEmail(orgForm.contact_email)) errors.contact_email = 'Email invalide';
    if (orgForm.contact_phone && !validatePhone(orgForm.contact_phone)) errors.contact_phone = 'Téléphone invalide';
    if (orgForm.website && !orgForm.website.startsWith('http')) errors.website = 'URL invalide (doit commencer par http)';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateMaterialForm = () => {
    const errors = {};
    if (!materialForm.name?.trim()) errors.name = 'Le nom est requis';
    if (materialForm.contact_email && !validateEmail(materialForm.contact_email)) errors.contact_email = 'Email invalide';
    if (materialForm.contact_phone && !validatePhone(materialForm.contact_phone)) errors.contact_phone = 'Téléphone invalide';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateDocForm = () => {
    const errors = {};
    if (!docForm.title?.trim()) errors.title = 'Le titre est requis';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fetch functions
  const fetchStats = async () => {
    const res = await api.get('/mapping/stats', token);
    if (res.success) setStats(res.data);
  };

  const fetchRegions = async () => {
    const res = await api.get('/mapping/regions', token);
    if (res.success) setRegions(res.data);
  };

  const fetchExpertiseDomains = async () => {
    setLoadingDomains(true);
    try {
      const res = await api.get('/mapping/expertise-domains', token);
      if (res.success) {
        setExpertiseDomains(res.data || []);
        setExpertiseDomainsGrouped(res.grouped || {});
        setExpertiseCategoryLabels(res.categoryLabels || {});
      }
    } catch (err) {
      console.error('Error fetching expertise domains:', err);
    }
    setLoadingDomains(false);
  };

  const fetchAllOrganizations = async () => {
    if (allOrganizations.length > 0) return; // Already loaded
    setLoadingOrgs(true);
    const res = await api.get('/mapping/organizations?limit=500', token);
    if (res.success) setAllOrganizations(res.data);
    setLoadingOrgs(false);
  };

  const fetchExperts = async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20, ...expertFilters });
    const res = await api.get(`/mapping/experts?${params}`, token);
    if (res.success) {
      setExperts(res.data);
      setExpertsPagination(res.pagination);
    }
    setLoading(false);
  };

  const fetchOrganizations = async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20, ...orgFilters });
    const res = await api.get(`/mapping/organizations?${params}`, token);
    if (res.success) {
      setOrganizations(res.data);
      setOrgsPagination(res.pagination);
    }
    setLoading(false);
  };

  const fetchMaterials = async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20, ...materialFilters });
    const res = await api.get(`/mapping/materials?${params}`, token);
    if (res.success) {
      setMaterials(res.data);
      setMaterialsPagination(res.pagination);
    }
    setLoading(false);
  };

  const fetchDocuments = async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20, ...docFilters });
    const res = await api.get(`/mapping/documents?${params}`, token);
    if (res.success) {
      setDocuments(res.data);
      setDocsPagination(res.pagination);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
    fetchRegions();
    fetchExpertiseDomains();
  }, []);

  useEffect(() => {
    if (activeTab === 'human') fetchExperts();
    if (activeTab === 'organization') fetchOrganizations();
    if (activeTab === 'material') fetchMaterials();
    if (activeTab === 'document') fetchDocuments();
  }, [activeTab]);

  useEffect(() => { if (activeTab === 'human') fetchExperts(); }, [expertFilters]);
  useEffect(() => { if (activeTab === 'organization') fetchOrganizations(); }, [orgFilters]);
  useEffect(() => { if (activeTab === 'material') fetchMaterials(); }, [materialFilters]);
  useEffect(() => { if (activeTab === 'document') fetchDocuments(); }, [docFilters]);

  // CRUD handlers
  const handleSaveExpert = async () => {
    if (!validateExpertForm()) {
      setToast({ message: 'Veuillez corriger les erreurs du formulaire', type: 'error' });
      return;
    }
    setLoading(true);
    const res = currentExpert
      ? await api.put(`/mapping/experts/${currentExpert.id}`, expertForm, token)
      : await api.post('/mapping/experts', expertForm, token);

    if (res.success) {
      setToast({ message: currentExpert ? 'Expert modifié avec succès' : 'Expert créé avec succès', type: 'success' });
      setViewMode('list');
      setFormErrors({});
      fetchExperts();
      fetchStats();
    } else {
      setToast({ message: res.message || 'Erreur lors de l\'enregistrement', type: 'error' });
    }
    setLoading(false);
  };

  const handleSaveOrg = async () => {
    if (!validateOrgForm()) {
      setToast({ message: 'Veuillez corriger les erreurs du formulaire', type: 'error' });
      return;
    }
    setLoading(true);
    const res = currentOrg
      ? await api.put(`/mapping/organizations/${currentOrg.id}`, orgForm, token)
      : await api.post('/mapping/organizations', orgForm, token);

    if (res.success) {
      setToast({ message: currentOrg ? 'Organisation modifiée avec succès' : 'Organisation créée avec succès', type: 'success' });
      setViewMode('list');
      setFormErrors({});
      fetchOrganizations();
      fetchStats();
      setAllOrganizations([]);
    } else {
      setToast({ message: res.message || 'Erreur lors de l\'enregistrement', type: 'error' });
    }
    setLoading(false);
  };

  const handleSaveMaterial = async () => {
    if (!validateMaterialForm()) {
      setToast({ message: 'Veuillez corriger les erreurs du formulaire', type: 'error' });
      return;
    }
    setLoading(true);
    const res = currentMaterial
      ? await api.put(`/mapping/materials/${currentMaterial.id}`, materialForm, token)
      : await api.post('/mapping/materials', materialForm, token);

    if (res.success) {
      setToast({ message: currentMaterial ? 'Ressource modifiée avec succès' : 'Ressource créée avec succès', type: 'success' });
      setViewMode('list');
      setFormErrors({});
      fetchMaterials();
      fetchStats();
    } else {
      setToast({ message: res.message || 'Erreur lors de l\'enregistrement', type: 'error' });
    }
    setLoading(false);
  };

  const handleSaveDoc = async () => {
    if (!validateDocForm()) {
      setToast({ message: 'Veuillez corriger les erreurs du formulaire', type: 'error' });
      return;
    }
    setLoading(true);
    const res = currentDoc
      ? await api.put(`/mapping/documents/${currentDoc.id}`, docForm, token)
      : await api.post('/mapping/documents', docForm, token);

    if (res.success) {
      setToast({ message: currentDoc ? 'Document modifié avec succès' : 'Document créé avec succès', type: 'success' });
      setViewMode('list');
      setFormErrors({});
      fetchDocuments();
      fetchStats();
    } else {
      setToast({ message: res.message || 'Erreur lors de l\'enregistrement', type: 'error' });
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    const res = await api.delete(`/mapping/${deleteTarget.type}/${deleteTarget.id}`, token);
    if (res.success) {
      setToast({ message: 'Supprimé avec succès', type: 'success' });
      setShowDeleteModal(false);
      if (deleteTarget.type === 'experts') fetchExperts();
      if (deleteTarget.type === 'organizations') fetchOrganizations();
      if (deleteTarget.type === 'materials') fetchMaterials();
      if (deleteTarget.type === 'documents') fetchDocuments();
      fetchStats();
    } else {
      setToast({ message: res.message || 'Erreur', type: 'error' });
    }
    setLoading(false);
  };

  // Fetch expert's expertise when editing
  const fetchExpertExpertise = async (expertId) => {
    try {
      const res = await api.get(`/mapping/experts/${expertId}/expertise`, token);
      if (res.success) {
        return res.data.map(e => e.id);
      }
    } catch (err) {
      console.error('Error fetching expert expertise:', err);
    }
    return [];
  };

  const openExpertForm = async (expert = null) => {
    setCurrentExpert(expert);
    setFormErrors({});

    const defaultForm = {
      first_name: '', last_name: '', title: '', category: 'expert',
      email: '', phone: '', organization_id: '', region: '', city: '',
      latitude: '', longitude: '', biography: '', photo: '',
      years_experience: '', cv_url: '', linkedin_url: '', twitter_url: '',
      orcid_id: '', google_scholar_url: '', researchgate_url: '', website: '',
      languages: [], education: [], certifications: [],
      publications_count: '', projects_count: '', awards: '',
      research_interests: '', available_for_collaboration: true,
      consultation_rate: '', expertise_summary: '', selected_expertise_ids: []
    };

    if (expert) {
      const expertiseIds = await fetchExpertExpertise(expert.id);
      setExpertForm({
        ...defaultForm,
        ...expert,
        languages: expert.languages ? (typeof expert.languages === 'string' ? JSON.parse(expert.languages) : expert.languages) : [],
        education: expert.education ? (typeof expert.education === 'string' ? JSON.parse(expert.education) : expert.education) : [],
        certifications: expert.certifications ? (typeof expert.certifications === 'string' ? JSON.parse(expert.certifications) : expert.certifications) : [],
        selected_expertise_ids: expertiseIds
      });
    } else {
      setExpertForm(defaultForm);
    }

    fetchAllOrganizations();
    fetchExpertiseDomains();
    setViewMode('form');
  };

  const openOrgForm = (org = null) => {
    setCurrentOrg(org);
    setFormErrors({});
    setOrgForm(org || {
      name: '', acronym: '', type: 'government', description: '', mission: '',
      website: '', region: '', city: '', address: '',
      contact_email: '', contact_phone: '', latitude: '', longitude: '', logo: ''
    });
    fetchAllOrganizations();
    setViewMode('form');
  };

  const openMaterialForm = (material = null) => {
    setCurrentMaterial(material);
    setFormErrors({});
    setMaterialForm(material ? { ...material, image: material.image || '' } : {
      name: '', type: 'laboratory', description: '', status: 'available',
      organization_id: '', region: '', city: '', address: '',
      contact_email: '', contact_phone: '', latitude: '', longitude: '', capacity: '', image: ''
    });
    fetchAllOrganizations();
    setViewMode('form');
  };

  const openDocForm = (doc = null) => {
    setCurrentDoc(doc);
    setFormErrors({});
    setDocForm(doc || {
      title: '', type: 'article', description: '', content: '',
      organization_id: '', language: 'fr', publication_date: '',
      file_path: '', thumbnail: '', access_level: 'public', is_featured: false
    });
    fetchAllOrganizations();
    setViewMode('form');
  };

  const goBackToList = () => {
    setViewMode('list');
    setFormErrors({});
  };

  // Auto-fill coordinates when region changes
  const handleRegionChange = (form, setForm, region) => {
    const coords = regionCoordinates[region];
    setForm({
      ...form,
      region,
      latitude: coords?.lat || form.latitude,
      longitude: coords?.lng || form.longitude
    });
  };

  // File upload handler
  const handleFileUpload = async (file, type, fieldName, form, setForm) => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const endpoint = type === 'document' ? '/upload/document' : `/upload/image/${type}`;
      const result = await api.upload(endpoint, formData, token);

      if (result.success && result.data) {
        const url = `http://localhost:5000${result.data.url}`;
        setForm({ ...form, [fieldName]: url });
        setToast({ message: 'Fichier uploadé avec succès', type: 'success' });
      } else {
        setToast({ message: result.message || 'Erreur upload', type: 'error' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setToast({ message: 'Erreur lors de l\'upload', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  // File upload input component
  const FileUploadInput = ({ label, value, onChange, onUpload, accept, type, disabled }) => (
    <div>
      <label style={styles.label}>{label}</label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
        <input
          style={{ ...styles.input, flex: 1 }}
          value={value || ''}
          onChange={onChange}
          placeholder="URL ou uploader un fichier"
          disabled={disabled}
        />
        <label style={{
          ...styles.btnSecondary,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          padding: '0 16px',
          margin: 0
        }}>
          <Upload size={16} />
          <span>Upload</span>
          <input
            type="file"
            accept={accept}
            onChange={(e) => onUpload(e.target.files[0], type)}
            style={{ display: 'none' }}
            disabled={disabled}
          />
        </label>
      </div>
      {value && value.startsWith('http') && accept?.includes('image') && (
        <div style={{ marginTop: '8px' }}>
          <img
            src={value}
            alt="Preview"
            style={{
              maxWidth: '100px',
              maxHeight: '100px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              objectFit: 'cover'
            }}
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
      )}
    </div>
  );

  const confirmDelete = (type, id, name) => {
    setDeleteTarget({ type, id, name });
    setShowDeleteModal(true);
  };

  // Render filter bar
  const renderFilterBar = (filters, setFilters, options = {}) => (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#64748b' : '#94a3b8' }} />
        <input
          type="text"
          placeholder="Rechercher..."
          value={filters.search || ''}
          onChange={e => setFilters({ ...filters, search: e.target.value })}
          style={{ ...styles.input, paddingLeft: '42px' }}
        />
      </div>
      {options.categories && (
        <select value={filters.category || ''} onChange={e => setFilters({ ...filters, category: e.target.value })} style={{ ...styles.select, minWidth: '150px' }}>
          <option value="">Toutes catégories</option>
          {options.categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      )}
      {options.types && (
        <select value={filters.type || ''} onChange={e => setFilters({ ...filters, type: e.target.value })} style={{ ...styles.select, minWidth: '150px' }}>
          <option value="">Tous types</option>
          {options.types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      )}
      {options.statuses && (
        <select value={filters.status || ''} onChange={e => setFilters({ ...filters, status: e.target.value })} style={{ ...styles.select, minWidth: '150px' }}>
          <option value="">Tous statuts</option>
          {options.statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      )}
      {options.showRegion && (
        <select value={filters.region || ''} onChange={e => setFilters({ ...filters, region: e.target.value })} style={{ ...styles.select, minWidth: '150px' }}>
          <option value="">Toutes régions</option>
          {regions.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
        </select>
      )}
      {options.languages && (
        <select value={filters.language || ''} onChange={e => setFilters({ ...filters, language: e.target.value })} style={{ ...styles.select, minWidth: '120px' }}>
          <option value="">Toutes langues</option>
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      )}
    </div>
  );

  // Render pagination
  const renderPagination = (pagination, fetchFn) => (
    pagination.pages > 1 && (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
        <button
          style={{ ...styles.btnSecondary, opacity: pagination.page === 1 ? 0.5 : 1 }}
          disabled={pagination.page === 1}
          onClick={() => fetchFn(pagination.page - 1)}
        >
          <ChevronLeft size={18} />
        </button>
        <span style={{ ...styles.textMuted, display: 'flex', alignItems: 'center', padding: '0 16px' }}>
          Page {pagination.page} / {pagination.pages}
        </span>
        <button
          style={{ ...styles.btnSecondary, opacity: pagination.page === pagination.pages ? 0.5 : 1 }}
          disabled={pagination.page === pagination.pages}
          onClick={() => fetchFn(pagination.page + 1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    )
  );

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} isDark={isDark} />}

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, #8B9A2D 0%, #6B7A1D 100%)`,
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '24px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <MapPin size={32} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800' }}>OHWR-MAPPING</h1>
            <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '15px' }}>
              Cartographie des Ressources One Health du Cameroun
            </p>
          </div>
        </div>
        <p style={{ margin: 0, opacity: 0.85, fontSize: '14px', maxWidth: '600px' }}>
          Gérez les 4 piliers des ressources One Health : Humaines, Matérielles, Organisationnelles et Documentaires
        </p>
      </div>

      {/* Tabs */}
      <div style={{ ...styles.tabs, marginBottom: '24px' }}>
        <button style={styles.tab(activeTab === 'dashboard')} onClick={() => setActiveTab('dashboard')}>
          <BarChart3 size={16} style={{ marginRight: '8px' }} /> Tableau de bord
        </button>
        <button style={styles.tab(activeTab === 'human')} onClick={() => setActiveTab('human')}>
          <User size={16} style={{ marginRight: '8px', color: '#27AE60' }} /> Experts
        </button>
        <button style={styles.tab(activeTab === 'material')} onClick={() => setActiveTab('material')}>
          <Box size={16} style={{ marginRight: '8px', color: '#3498DB' }} /> Matériels
        </button>
        <button style={styles.tab(activeTab === 'organization')} onClick={() => setActiveTab('organization')}>
          <Home size={16} style={{ marginRight: '8px', color: '#E67E22' }} /> Organisations
        </button>
        <button style={styles.tab(activeTab === 'document')} onClick={() => setActiveTab('document')}>
          <FileText size={16} style={{ marginRight: '8px', color: '#9B59B6' }} /> Documents
        </button>
        <button style={styles.tab(activeTab === 'settings')} onClick={() => setActiveTab('settings')}>
          <Settings size={16} style={{ marginRight: '8px', color: '#64748b' }} /> Paramètres
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
            {piliers.map(pilier => (
              <div key={pilier.id} style={{
                ...styles.card,
                borderLeft: `4px solid ${pilier.color}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }} onClick={() => setActiveTab(pilier.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '14px',
                    background: `${pilier.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <pilier.icon size={26} color={pilier.color} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: pilier.color }}>
                      {pilier.count}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>
                      {pilier.label}
                    </p>
                  </div>
                </div>
                <p style={{ margin: '12px 0 0', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                  {pilier.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experts Tab */}
      {activeTab === 'human' && (
        viewMode === 'form' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header */}
            <div style={{ ...styles.card, background: `linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)`, color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={28} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                      {currentExpert ? 'Modifier l\'expert' : 'Nouvel Expert'}
                    </h2>
                    <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '14px' }}>Renseignez les informations du professionnel</p>
                  </div>
                </div>
                <button style={{ ...styles.btnSecondary, background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }} onClick={goBackToList}>
                  <ChevronLeft size={18} /> Retour
                </button>
              </div>
            </div>

            {/* Section 1: Identité */}
            <div style={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: `2px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#27AE6020', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color="#27AE60" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Identité</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>Informations personnelles de l'expert</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '24px', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '140px', height: '140px', borderRadius: '20px', background: isDark ? '#1e293b' : '#f1f5f9', border: `2px dashed ${isDark ? '#334155' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {expertForm.photo ? (
                      <img src={expertForm.photo} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Camera size={40} color={isDark ? '#475569' : '#94a3b8'} />
                    )}
                  </div>
                  <FileUploadInput
                    label=""
                    value={expertForm.photo}
                    onChange={e => setExpertForm({ ...expertForm, photo: e.target.value })}
                    onUpload={(file) => handleFileUpload(file, 'experts', 'photo', expertForm, setExpertForm)}
                    accept="image/jpeg,image/png,image/webp"
                    type="experts"
                    disabled={uploading}
                    compact
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={styles.label}>Prénom *</label>
                    <input style={{ ...styles.input, borderColor: formErrors.first_name ? '#ef4444' : undefined }} value={expertForm.first_name} onChange={e => setExpertForm({ ...expertForm, first_name: e.target.value })} placeholder="Prénom" />
                    {formErrors.first_name && <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.first_name}</span>}
                  </div>
                  <div>
                    <label style={styles.label}>Nom *</label>
                    <input style={{ ...styles.input, borderColor: formErrors.last_name ? '#ef4444' : undefined }} value={expertForm.last_name} onChange={e => setExpertForm({ ...expertForm, last_name: e.target.value })} placeholder="Nom" />
                    {formErrors.last_name && <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.last_name}</span>}
                  </div>
                  <div>
                    <label style={styles.label}>Titre / Fonction</label>
                    <input style={styles.input} value={expertForm.title} onChange={e => setExpertForm({ ...expertForm, title: e.target.value })} placeholder="Ex: Dr., Prof., Directeur..." />
                  </div>
                  <div>
                    <label style={styles.label}>Catégorie</label>
                    <select style={styles.select} value={expertForm.category} onChange={e => setExpertForm({ ...expertForm, category: e.target.value })}>
                      {expertCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Expertise & Expérience */}
            <div style={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: `2px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#3498DB20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={20} color="#3498DB" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Expertise & Expérience</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>Domaines de compétence et années d'expérience</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={styles.label}>Années d'expérience</label>
                  <input style={styles.input} type="number" min="0" max="60" value={expertForm.years_experience} onChange={e => setExpertForm({ ...expertForm, years_experience: e.target.value })} placeholder="Nombre d'années" />
                </div>
                <div>
                  <label style={styles.label}>Résumé d'expertise</label>
                  <input style={styles.input} value={expertForm.expertise_summary} onChange={e => setExpertForm({ ...expertForm, expertise_summary: e.target.value })} placeholder="Ex: Spécialiste en épidémiologie..." />
                </div>
              </div>

              {/* Expertise Domains Selector */}
              <div style={{ marginTop: '20px' }}>
                <label style={styles.label}>
                  Domaines d'expertise {loadingDomains && <Loader size={12} className="spin" style={{ marginLeft: 4 }} />}
                </label>
                <p style={{ margin: '0 0 12px', fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>Sélectionnez un ou plusieurs domaines</p>

                {Object.keys(expertiseDomainsGrouped).length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {Object.entries(expertiseDomainsGrouped).map(([category, domains]) => (
                      <div key={category} style={{ background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px', padding: '16px', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
                        <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: isDark ? '#cbd5e1' : '#475569' }}>
                          {expertiseCategoryLabels[category] || category}
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {domains.map(domain => {
                            const isSelected = expertForm.selected_expertise_ids.includes(domain.id);
                            return (
                              <button
                                key={domain.id}
                                type="button"
                                onClick={() => {
                                  const newIds = isSelected
                                    ? expertForm.selected_expertise_ids.filter(id => id !== domain.id)
                                    : [...expertForm.selected_expertise_ids, domain.id];
                                  setExpertForm({ ...expertForm, selected_expertise_ids: newIds });
                                }}
                                style={{
                                  padding: '8px 14px',
                                  borderRadius: '20px',
                                  border: isSelected ? 'none' : `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                                  background: isSelected ? (domain.color || '#3498DB') : 'transparent',
                                  color: isSelected ? 'white' : (isDark ? '#94a3b8' : '#64748b'),
                                  fontSize: '13px',
                                  fontWeight: isSelected ? '600' : '400',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                {isSelected && <Check size={14} />}
                                {domain.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px', color: isDark ? '#64748b' : '#94a3b8' }}>
                    <Award size={32} style={{ opacity: 0.5, marginBottom: '8px' }} />
                    <p style={{ margin: 0 }}>Aucun domaine d'expertise disponible</p>
                  </div>
                )}

                {expertForm.selected_expertise_ids.length > 0 && (
                  <div style={{ marginTop: '12px', padding: '12px', background: isDark ? '#0f172a' : '#f0fdf4', borderRadius: '8px', border: '1px solid #27AE6040' }}>
                    <span style={{ fontSize: '13px', color: '#27AE60', fontWeight: '500' }}>
                      {expertForm.selected_expertise_ids.length} domaine(s) sélectionné(s)
                    </span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '20px' }}>
                <label style={styles.label}>Centres d'intérêt de recherche</label>
                <textarea style={{ ...styles.input, minHeight: '80px' }} value={expertForm.research_interests} onChange={e => setExpertForm({ ...expertForm, research_interests: e.target.value })} placeholder="Domaines de recherche actuels, sujets d'intérêt..." />
              </div>
            </div>

            {/* Section 3: Contact & Réseaux */}
            <div style={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: `2px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#9B59B620', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={20} color="#9B59B6" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Contact & Réseaux</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>Coordonnées et présence en ligne</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={styles.label}><Mail size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Email</label>
                  <input style={{ ...styles.input, borderColor: formErrors.email ? '#ef4444' : undefined }} type="email" value={expertForm.email} onChange={e => setExpertForm({ ...expertForm, email: e.target.value })} placeholder="email@example.com" />
                  {formErrors.email && <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.email}</span>}
                </div>
                <div>
                  <label style={styles.label}><Phone size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Téléphone</label>
                  <input style={styles.input} value={expertForm.phone} onChange={e => setExpertForm({ ...expertForm, phone: e.target.value })} placeholder="+237 6XX XXX XXX" />
                </div>
                <div>
                  <label style={styles.label}><Globe size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Site web personnel</label>
                  <input style={styles.input} value={expertForm.website} onChange={e => setExpertForm({ ...expertForm, website: e.target.value })} placeholder="https://..." />
                </div>
                <div>
                  <label style={styles.label}><Linkedin size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />LinkedIn</label>
                  <input style={styles.input} value={expertForm.linkedin_url} onChange={e => setExpertForm({ ...expertForm, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <label style={styles.label}><Twitter size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Twitter / X</label>
                  <input style={styles.input} value={expertForm.twitter_url} onChange={e => setExpertForm({ ...expertForm, twitter_url: e.target.value })} placeholder="https://twitter.com/..." />
                </div>
                <div>
                  <label style={styles.label}>ORCID ID</label>
                  <input style={styles.input} value={expertForm.orcid_id} onChange={e => setExpertForm({ ...expertForm, orcid_id: e.target.value })} placeholder="0000-0000-0000-0000" />
                </div>
                <div>
                  <label style={styles.label}>Google Scholar</label>
                  <input style={styles.input} value={expertForm.google_scholar_url} onChange={e => setExpertForm({ ...expertForm, google_scholar_url: e.target.value })} placeholder="https://scholar.google.com/..." />
                </div>
                <div>
                  <label style={styles.label}>ResearchGate</label>
                  <input style={styles.input} value={expertForm.researchgate_url} onChange={e => setExpertForm({ ...expertForm, researchgate_url: e.target.value })} placeholder="https://researchgate.net/..." />
                </div>
              </div>
            </div>

            {/* Section 4: Organisation & Localisation */}
            <div style={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: `2px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E67E2220', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={20} color="#E67E22" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Organisation & Localisation</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>Affiliation et emplacement géographique</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={styles.label}>Organisation {loadingOrgs && <Loader size={12} className="spin" style={{ marginLeft: 4 }} />}</label>
                  <select style={styles.select} value={expertForm.organization_id} onChange={e => setExpertForm({ ...expertForm, organization_id: e.target.value })}>
                    <option value="">Sélectionner une organisation...</option>
                    {allOrganizations.map(o => <option key={o.id} value={o.id}>{o.acronym ? `${o.name} (${o.acronym})` : o.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Région</label>
                  <select style={styles.select} value={expertForm.region} onChange={e => handleRegionChange(expertForm, setExpertForm, e.target.value)}>
                    <option value="">Sélectionner...</option>
                    {regions.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Ville</label>
                  <input style={styles.input} value={expertForm.city} onChange={e => setExpertForm({ ...expertForm, city: e.target.value })} placeholder="Ville" />
                </div>
                <div>
                  <label style={styles.label}>Latitude <span style={{ fontSize: '11px', color: '#64748b' }}>(auto)</span></label>
                  <input style={styles.input} type="number" step="any" value={expertForm.latitude} onChange={e => setExpertForm({ ...expertForm, latitude: e.target.value })} placeholder="Ex: 3.848" />
                </div>
                <div>
                  <label style={styles.label}>Longitude <span style={{ fontSize: '11px', color: '#64748b' }}>(auto)</span></label>
                  <input style={styles.input} type="number" step="any" value={expertForm.longitude} onChange={e => setExpertForm({ ...expertForm, longitude: e.target.value })} placeholder="Ex: 11.502" />
                </div>
              </div>
            </div>

            {/* Section 5: Profil Professionnel */}
            <div style={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: `2px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#1ABC9C20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} color="#1ABC9C" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Profil Professionnel</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>CV, publications et distinctions</p>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={styles.label}>Biographie</label>
                <textarea style={{ ...styles.input, minHeight: '120px' }} value={expertForm.biography} onChange={e => setExpertForm({ ...expertForm, biography: e.target.value })} placeholder="Parcours professionnel, formation, réalisations majeures..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <FileUploadInput
                  label="CV (PDF)"
                  value={expertForm.cv_url}
                  onChange={e => setExpertForm({ ...expertForm, cv_url: e.target.value })}
                  onUpload={(file) => handleFileUpload(file, 'document', 'cv_url', expertForm, setExpertForm)}
                  accept=".pdf,.doc,.docx"
                  type="documents"
                  disabled={uploading}
                />
                <div>
                  <label style={styles.label}>Nombre de publications</label>
                  <input style={styles.input} type="number" min="0" value={expertForm.publications_count} onChange={e => setExpertForm({ ...expertForm, publications_count: e.target.value })} placeholder="0" />
                </div>
                <div>
                  <label style={styles.label}>Nombre de projets</label>
                  <input style={styles.input} type="number" min="0" value={expertForm.projects_count} onChange={e => setExpertForm({ ...expertForm, projects_count: e.target.value })} placeholder="0" />
                </div>
                <div>
                  <label style={styles.label}>Tarif consultation</label>
                  <input style={styles.input} value={expertForm.consultation_rate} onChange={e => setExpertForm({ ...expertForm, consultation_rate: e.target.value })} placeholder="Ex: 50 000 FCFA/heure" />
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={styles.label}>Prix et distinctions</label>
                <textarea style={{ ...styles.input, minHeight: '80px' }} value={expertForm.awards} onChange={e => setExpertForm({ ...expertForm, awards: e.target.value })} placeholder="Prix, distinctions, reconnaissances..." />
              </div>

              <div style={{ marginTop: '16px', padding: '16px', background: isDark ? '#0f172a' : '#f0fdf4', borderRadius: '12px', border: '1px solid #27AE6030' }}>
                <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={expertForm.available_for_collaboration}
                    onChange={e => setExpertForm({ ...expertForm, available_for_collaboration: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#27AE60' }}
                  />
                  <span style={{ fontWeight: '500' }}>Disponible pour des collaborations</span>
                </label>
                <p style={{ margin: '8px 0 0 28px', fontSize: '13px', color: isDark ? '#64748b' : '#6b7280' }}>
                  Cochez si l'expert accepte d'être contacté pour des projets ou consultations
                </p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button style={styles.btnSecondary} onClick={goBackToList}>
                <X size={18} /> Annuler
              </button>
              <button style={{ ...styles.btnPrimary, background: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)', padding: '14px 28px', fontSize: '15px' }} onClick={handleSaveExpert} disabled={uploading || loading}>
                {loading ? <><Loader size={18} className="spin" /> Enregistrement...</> : <><Save size={18} /> Enregistrer l'expert</>}
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                <User size={20} style={{ marginRight: '10px', color: '#27AE60', verticalAlign: 'middle' }} />
                Ressources Humaines ({expertsPagination.total})
              </h3>
              <button style={{ ...styles.btnPrimary, background: '#27AE60' }} onClick={() => openExpertForm()}>
                <Plus size={18} /> Ajouter un expert
              </button>
            </div>

            {renderFilterBar(expertFilters, setExpertFilters, { categories: expertCategories, showRegion: true })}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}><Loader size={32} className="spin" /></div>
            ) : experts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: isDark ? '#64748b' : '#94a3b8' }}>
                <User size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p>Aucun expert trouvé</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {experts.map(expert => (
                  <div key={expert.id} style={{
                    padding: '20px',
                    background: isDark ? '#0f172a' : '#f8fafc',
                    borderRadius: '16px',
                    border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`
                  }}>
                    <div style={{ display: 'flex', gap: '14px', marginBottom: '12px' }}>
                      <div style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        background: expert.photo ? `url(${expert.photo}) center/cover` : '#27AE6020',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {!expert.photo && <User size={24} color="#27AE60" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '600' }}>
                          {expert.first_name} {expert.last_name}
                        </h4>
                        <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
                          {expert.title || expertCategories.find(c => c.value === expert.category)?.label}
                        </p>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8', marginBottom: '12px' }}>
                      {expert.organization_name && <p style={{ margin: '4px 0' }}><Home size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />{expert.organization_name}</p>}
                      {expert.region && <p style={{ margin: '4px 0' }}><MapPin size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />{expert.region}{expert.city && `, ${expert.city}`}</p>}
                      {expert.email && <p style={{ margin: '4px 0' }}><Mail size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />{expert.email}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ ...styles.btnSecondary, flex: 1, padding: '8px' }} onClick={() => openExpertForm(expert)}>
                        <Edit2 size={14} /> Modifier
                      </button>
                      <button style={{ ...styles.btnSecondary, padding: '8px', color: '#ef4444' }} onClick={() => confirmDelete('experts', expert.id, `${expert.first_name} ${expert.last_name}`)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {renderPagination(expertsPagination, fetchExperts)}
          </div>
        )
      )}

      {/* Organizations Tab */}
      {activeTab === 'organization' && (
        viewMode === 'form' ? (
          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                <Home size={22} style={{ marginRight: '10px', color: '#E67E22', verticalAlign: 'middle' }} />
                {currentOrg ? 'Modifier l\'organisation' : 'Ajouter une organisation'}
              </h3>
              <button style={{ ...styles.btnSecondary, padding: '10px 16px' }} onClick={goBackToList}>
                <ChevronLeft size={18} /> Retour
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={styles.label}>Nom *</label>
                <input style={{ ...styles.input, borderColor: formErrors.name ? '#ef4444' : undefined }} value={orgForm.name} onChange={e => setOrgForm({ ...orgForm, name: e.target.value })} placeholder="Nom complet" />
                {formErrors.name && <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.name}</span>}
              </div>
              <div>
                <label style={styles.label}>Acronyme</label>
                <input style={styles.input} value={orgForm.acronym} onChange={e => setOrgForm({ ...orgForm, acronym: e.target.value })} placeholder="Ex: OMS, FAO..." />
              </div>
              <div>
                <label style={styles.label}>Type</label>
                <select style={styles.select} value={orgForm.type} onChange={e => setOrgForm({ ...orgForm, type: e.target.value })}>
                  {orgTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Email de contact</label>
                <input style={{ ...styles.input, borderColor: formErrors.contact_email ? '#ef4444' : undefined }} type="email" value={orgForm.contact_email} onChange={e => setOrgForm({ ...orgForm, contact_email: e.target.value })} placeholder="contact@organisation.cm" />
                {formErrors.contact_email && <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.contact_email}</span>}
              </div>
              <div>
                <label style={styles.label}>Téléphone</label>
                <input style={{ ...styles.input, borderColor: formErrors.contact_phone ? '#ef4444' : undefined }} value={orgForm.contact_phone} onChange={e => setOrgForm({ ...orgForm, contact_phone: e.target.value })} placeholder="+237..." />
                {formErrors.contact_phone && <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.contact_phone}</span>}
              </div>
              <div>
                <label style={styles.label}>Site web</label>
                <input style={{ ...styles.input, borderColor: formErrors.website ? '#ef4444' : undefined }} value={orgForm.website} onChange={e => setOrgForm({ ...orgForm, website: e.target.value })} placeholder="https://..." />
                {formErrors.website && <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.website}</span>}
              </div>
              <FileUploadInput
                label="Logo"
                value={orgForm.logo}
                onChange={e => setOrgForm({ ...orgForm, logo: e.target.value })}
                onUpload={(file) => handleFileUpload(file, 'organizations', 'logo', orgForm, setOrgForm)}
                accept="image/jpeg,image/png,image/webp"
                type="organizations"
                disabled={uploading}
              />
              <div>
                <label style={styles.label}>Région</label>
                <select style={styles.select} value={orgForm.region} onChange={e => handleRegionChange(orgForm, setOrgForm, e.target.value)}>
                  <option value="">Sélectionner...</option>
                  {regions.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Ville</label>
                <input style={styles.input} value={orgForm.city} onChange={e => setOrgForm({ ...orgForm, city: e.target.value })} placeholder="Ville" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={styles.label}>Adresse</label>
                <input style={styles.input} value={orgForm.address} onChange={e => setOrgForm({ ...orgForm, address: e.target.value })} placeholder="Adresse complète" />
              </div>
              <div>
                <label style={styles.label}>Latitude <span style={{ fontSize: '11px', color: '#64748b' }}>(auto)</span></label>
                <input style={styles.input} type="number" step="any" value={orgForm.latitude} onChange={e => setOrgForm({ ...orgForm, latitude: e.target.value })} placeholder="Ex: 3.848" />
              </div>
              <div>
                <label style={styles.label}>Longitude <span style={{ fontSize: '11px', color: '#64748b' }}>(auto)</span></label>
                <input style={styles.input} type="number" step="any" value={orgForm.longitude} onChange={e => setOrgForm({ ...orgForm, longitude: e.target.value })} placeholder="Ex: 11.502" />
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={styles.label}>Description</label>
              <textarea style={{ ...styles.input, minHeight: '80px' }} value={orgForm.description} onChange={e => setOrgForm({ ...orgForm, description: e.target.value })} placeholder="Description..." />
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={styles.label}>Mission</label>
              <textarea style={{ ...styles.input, minHeight: '80px' }} value={orgForm.mission} onChange={e => setOrgForm({ ...orgForm, mission: e.target.value })} placeholder="Mission de l'organisation..." />
            </div>
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button style={styles.btnSecondary} onClick={goBackToList}>Annuler</button>
              <button style={{ ...styles.btnPrimary, background: '#E67E22' }} onClick={handleSaveOrg} disabled={uploading || loading}>
                {loading ? <><Loader size={16} className="spin" /> Enregistrement...</> : <><Save size={16} /> Enregistrer</>}
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                <Home size={20} style={{ marginRight: '10px', color: '#E67E22', verticalAlign: 'middle' }} />
                Organisations ({orgsPagination.total})
              </h3>
              <button style={{ ...styles.btnPrimary, background: '#E67E22' }} onClick={() => openOrgForm()}>
                <Plus size={18} /> Ajouter une organisation
              </button>
            </div>

            {renderFilterBar(orgFilters, setOrgFilters, { types: orgTypes, showRegion: true })}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}><Loader size={32} className="spin" /></div>
            ) : organizations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: isDark ? '#64748b' : '#94a3b8' }}>
                <Home size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p>Aucune organisation trouvée</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {organizations.map(org => (
                  <div key={org.id} style={{
                    padding: '20px',
                    background: isDark ? '#0f172a' : '#f8fafc',
                    borderRadius: '16px',
                    border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`
                  }}>
                    <div style={{ display: 'flex', gap: '14px', marginBottom: '12px' }}>
                      <div style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        background: org.logo ? `url(${org.logo}) center/cover` : '#E67E2220',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {!org.logo && <Home size={24} color="#E67E22" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '600' }}>
                          {org.name} {org.acronym && <span style={{ color: '#E67E22' }}>({org.acronym})</span>}
                        </h4>
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: '6px',
                          fontSize: '11px', fontWeight: '600',
                          background: '#E67E2220', color: '#E67E22'
                        }}>
                          {orgTypes.find(t => t.value === org.type)?.label || org.type}
                        </span>
                      </div>
                    </div>
                    {org.description && <p style={{ margin: '0 0 12px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.5 }}>{org.description.substring(0, 100)}...</p>}
                    <div style={{ fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8', marginBottom: '12px' }}>
                      {org.region && <p style={{ margin: '4px 0' }}><MapPin size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />{org.region}{org.city && `, ${org.city}`}</p>}
                      {org.contact_email && <p style={{ margin: '4px 0' }}><Mail size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />{org.contact_email}</p>}
                      {org.website && <p style={{ margin: '4px 0' }}><Globe size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />{org.website}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ ...styles.btnSecondary, flex: 1, padding: '8px' }} onClick={() => openOrgForm(org)}>
                        <Edit2 size={14} /> Modifier
                      </button>
                      <button style={{ ...styles.btnSecondary, padding: '8px', color: '#ef4444' }} onClick={() => confirmDelete('organizations', org.id, org.name)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {renderPagination(orgsPagination, fetchOrganizations)}
          </div>
        )
      )}

      {/* Materials Tab */}
      {activeTab === 'material' && (
        viewMode === 'form' ? (
          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                <Box size={22} style={{ marginRight: '10px', color: '#3498DB', verticalAlign: 'middle' }} />
                {currentMaterial ? 'Modifier la ressource' : 'Ajouter une ressource matérielle'}
              </h3>
              <button style={{ ...styles.btnSecondary, padding: '10px 16px' }} onClick={goBackToList}>
                <ChevronLeft size={18} /> Retour
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={styles.label}>Nom *</label>
                <input style={{ ...styles.input, borderColor: formErrors.name ? '#ef4444' : undefined }} value={materialForm.name} onChange={e => setMaterialForm({ ...materialForm, name: e.target.value })} placeholder="Nom de la ressource" />
                {formErrors.name && <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.name}</span>}
              </div>
              <div>
                <label style={styles.label}>Type</label>
                <select style={styles.select} value={materialForm.type} onChange={e => setMaterialForm({ ...materialForm, type: e.target.value })}>
                  {materialTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Statut</label>
                <select style={styles.select} value={materialForm.status} onChange={e => setMaterialForm({ ...materialForm, status: e.target.value })}>
                  {materialStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Organisation {loadingOrgs && <Loader size={12} className="spin" style={{ marginLeft: 4 }} />}</label>
                <select style={styles.select} value={materialForm.organization_id} onChange={e => setMaterialForm({ ...materialForm, organization_id: e.target.value })}>
                  <option value="">Sélectionner...</option>
                  {allOrganizations.map(o => <option key={o.id} value={o.id}>{o.acronym ? `${o.name} (${o.acronym})` : o.name}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Capacité</label>
                <input style={styles.input} value={materialForm.capacity} onChange={e => setMaterialForm({ ...materialForm, capacity: e.target.value })} placeholder="Ex: 50 personnes, 100 échantillons/jour..." />
              </div>
              <div>
                <label style={styles.label}>Email de contact</label>
                <input style={{ ...styles.input, borderColor: formErrors.contact_email ? '#ef4444' : undefined }} type="email" value={materialForm.contact_email} onChange={e => setMaterialForm({ ...materialForm, contact_email: e.target.value })} placeholder="contact@labo.cm" />
                {formErrors.contact_email && <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.contact_email}</span>}
              </div>
              <div>
                <label style={styles.label}>Téléphone</label>
                <input style={{ ...styles.input, borderColor: formErrors.contact_phone ? '#ef4444' : undefined }} value={materialForm.contact_phone} onChange={e => setMaterialForm({ ...materialForm, contact_phone: e.target.value })} placeholder="+237..." />
                {formErrors.contact_phone && <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.contact_phone}</span>}
              </div>
              <div>
                <label style={styles.label}>Région</label>
                <select style={styles.select} value={materialForm.region} onChange={e => handleRegionChange(materialForm, setMaterialForm, e.target.value)}>
                  <option value="">Sélectionner...</option>
                  {regions.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Ville</label>
                <input style={styles.input} value={materialForm.city} onChange={e => setMaterialForm({ ...materialForm, city: e.target.value })} placeholder="Ville" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={styles.label}>Adresse</label>
                <input style={styles.input} value={materialForm.address} onChange={e => setMaterialForm({ ...materialForm, address: e.target.value })} placeholder="Adresse complète" />
              </div>
              <FileUploadInput
                label="Image"
                value={materialForm.image}
                onChange={e => setMaterialForm({ ...materialForm, image: e.target.value })}
                onUpload={(file) => handleFileUpload(file, 'materials', 'image', materialForm, setMaterialForm)}
                accept="image/jpeg,image/png,image/webp"
                type="materials"
                disabled={uploading}
              />
              <div>
                <label style={styles.label}>Latitude <span style={{ fontSize: '11px', color: '#64748b' }}>(auto)</span></label>
                <input style={styles.input} type="number" step="any" value={materialForm.latitude} onChange={e => setMaterialForm({ ...materialForm, latitude: e.target.value })} placeholder="Ex: 3.848" />
              </div>
              <div>
                <label style={styles.label}>Longitude <span style={{ fontSize: '11px', color: '#64748b' }}>(auto)</span></label>
                <input style={styles.input} type="number" step="any" value={materialForm.longitude} onChange={e => setMaterialForm({ ...materialForm, longitude: e.target.value })} placeholder="Ex: 11.502" />
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={styles.label}>Description</label>
              <textarea style={{ ...styles.input, minHeight: '100px' }} value={materialForm.description} onChange={e => setMaterialForm({ ...materialForm, description: e.target.value })} placeholder="Description, équipements, services..." />
            </div>
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button style={styles.btnSecondary} onClick={goBackToList}>Annuler</button>
              <button style={{ ...styles.btnPrimary, background: '#3498DB' }} onClick={handleSaveMaterial} disabled={uploading || loading}>
                {loading ? <><Loader size={16} className="spin" /> Enregistrement...</> : <><Save size={16} /> Enregistrer</>}
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                <Box size={20} style={{ marginRight: '10px', color: '#3498DB', verticalAlign: 'middle' }} />
                Ressources Matérielles ({materialsPagination.total})
              </h3>
              <button style={{ ...styles.btnPrimary, background: '#3498DB' }} onClick={() => openMaterialForm()}>
                <Plus size={18} /> Ajouter une ressource
              </button>
            </div>

            {renderFilterBar(materialFilters, setMaterialFilters, { types: materialTypes, statuses: materialStatuses, showRegion: true })}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}><Loader size={32} className="spin" /></div>
            ) : materials.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: isDark ? '#64748b' : '#94a3b8' }}>
                <Box size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p>Aucune ressource matérielle trouvée</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {materials.map(mat => (
                  <div key={mat.id} style={{
                    padding: '20px',
                    background: isDark ? '#0f172a' : '#f8fafc',
                    borderRadius: '16px',
                    border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{
                          width: '48px', height: '48px', borderRadius: '12px',
                          background: '#3498DB20',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <Box size={22} color="#3498DB" />
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '600' }}>{mat.name}</h4>
                          <span style={{
                            display: 'inline-block', padding: '2px 8px', borderRadius: '6px',
                            fontSize: '11px', fontWeight: '600',
                            background: '#3498DB20', color: '#3498DB'
                          }}>
                            {materialTypes.find(t => t.value === mat.type)?.label || mat.type}
                          </span>
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600',
                        background: mat.status === 'available' ? '#27AE6020' : mat.status === 'in_use' ? '#F39C1220' : '#EF444420',
                        color: mat.status === 'available' ? '#27AE60' : mat.status === 'in_use' ? '#F39C12' : '#EF4444'
                      }}>
                        {materialStatuses.find(s => s.value === mat.status)?.label || mat.status}
                      </span>
                    </div>
                    {mat.description && <p style={{ margin: '0 0 12px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>{mat.description.substring(0, 80)}...</p>}
                    <div style={{ fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8', marginBottom: '12px' }}>
                      {mat.organization_name && <p style={{ margin: '4px 0' }}><Home size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />{mat.organization_name}</p>}
                      {mat.region && <p style={{ margin: '4px 0' }}><MapPin size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />{mat.region}{mat.city && `, ${mat.city}`}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ ...styles.btnSecondary, flex: 1, padding: '8px' }} onClick={() => openMaterialForm(mat)}>
                        <Edit2 size={14} /> Modifier
                      </button>
                      <button style={{ ...styles.btnSecondary, padding: '8px', color: '#ef4444' }} onClick={() => confirmDelete('materials', mat.id, mat.name)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {renderPagination(materialsPagination, fetchMaterials)}
          </div>
        )
      )}

      {/* Documents Tab */}
      {activeTab === 'document' && (
        viewMode === 'form' ? (
          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                <FileText size={22} style={{ marginRight: '10px', color: '#9B59B6', verticalAlign: 'middle' }} />
                {currentDoc ? 'Modifier le document' : 'Ajouter un document'}
              </h3>
              <button style={{ ...styles.btnSecondary, padding: '10px 16px' }} onClick={goBackToList}>
                <ChevronLeft size={18} /> Retour
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={styles.label}>Titre *</label>
                <input style={{ ...styles.input, borderColor: formErrors.title ? '#ef4444' : undefined }} value={docForm.title} onChange={e => setDocForm({ ...docForm, title: e.target.value })} placeholder="Titre du document" />
                {formErrors.title && <span style={{ color: '#ef4444', fontSize: '12px' }}>{formErrors.title}</span>}
              </div>
              <div>
                <label style={styles.label}>Type</label>
                <select style={styles.select} value={docForm.type} onChange={e => setDocForm({ ...docForm, type: e.target.value })}>
                  {docTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Langue</label>
                <select style={styles.select} value={docForm.language} onChange={e => setDocForm({ ...docForm, language: e.target.value })}>
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label style={styles.label}>Organisation {loadingOrgs && <Loader size={12} className="spin" style={{ marginLeft: 4 }} />}</label>
                <select style={styles.select} value={docForm.organization_id} onChange={e => setDocForm({ ...docForm, organization_id: e.target.value })}>
                  <option value="">Sélectionner...</option>
                  {allOrganizations.map(o => <option key={o.id} value={o.id}>{o.acronym ? `${o.name} (${o.acronym})` : o.name}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Date de publication</label>
                <input style={styles.input} type="date" value={docForm.publication_date ? docForm.publication_date.split('T')[0] : ''} onChange={e => setDocForm({ ...docForm, publication_date: e.target.value })} />
              </div>
              <div>
                <label style={styles.label}>Niveau d'accès</label>
                <select style={styles.select} value={docForm.access_level} onChange={e => setDocForm({ ...docForm, access_level: e.target.value })}>
                  <option value="public">Public</option>
                  <option value="registered">Utilisateurs enregistrés</option>
                  <option value="private">Privé</option>
                </select>
              </div>
              <FileUploadInput
                label="Fichier (PDF, Vidéo...)"
                value={docForm.file_path}
                onChange={e => setDocForm({ ...docForm, file_path: e.target.value })}
                onUpload={(file) => handleFileUpload(file, 'document', 'file_path', docForm, setDocForm)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp4,.webm,.mov"
                type="documents"
                disabled={uploading}
              />
              <FileUploadInput
                label="Vignette"
                value={docForm.thumbnail}
                onChange={e => setDocForm({ ...docForm, thumbnail: e.target.value })}
                onUpload={(file) => handleFileUpload(file, 'materials', 'thumbnail', docForm, setDocForm)}
                accept="image/jpeg,image/png,image/webp"
                type="materials"
                disabled={uploading}
              />
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ ...styles.label, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={docForm.is_featured} onChange={e => setDocForm({ ...docForm, is_featured: e.target.checked })} />
                  <Star size={16} color="#F39C12" /> Mettre en avant ce document
                </label>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={styles.label}>Description</label>
              <textarea style={{ ...styles.input, minHeight: '80px' }} value={docForm.description} onChange={e => setDocForm({ ...docForm, description: e.target.value })} placeholder="Résumé du document..." />
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={styles.label}>Contenu / Notes</label>
              <textarea style={{ ...styles.input, minHeight: '100px' }} value={docForm.content} onChange={e => setDocForm({ ...docForm, content: e.target.value })} placeholder="Contenu détaillé ou notes..." />
            </div>
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button style={styles.btnSecondary} onClick={goBackToList}>Annuler</button>
              <button style={{ ...styles.btnPrimary, background: '#9B59B6' }} onClick={handleSaveDoc} disabled={uploading || loading}>
                {loading ? <><Loader size={16} className="spin" /> Enregistrement...</> : <><Save size={16} /> Enregistrer</>}
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                <FileText size={20} style={{ marginRight: '10px', color: '#9B59B6', verticalAlign: 'middle' }} />
                Documents ({docsPagination.total})
              </h3>
              <button style={{ ...styles.btnPrimary, background: '#9B59B6' }} onClick={() => openDocForm()}>
                <Plus size={18} /> Ajouter un document
              </button>
            </div>

            {renderFilterBar(docFilters, setDocFilters, { types: docTypes, languages: true })}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}><Loader size={32} className="spin" /></div>
            ) : documents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: isDark ? '#64748b' : '#94a3b8' }}>
                <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p>Aucun document trouvé</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {documents.map(doc => (
                  <div key={doc.id} style={{
                    padding: '20px',
                    background: isDark ? '#0f172a' : '#f8fafc',
                    borderRadius: '16px',
                    border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`
                  }}>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                          background: '#9B59B620', color: '#9B59B6'
                        }}>
                          {docTypes.find(t => t.value === doc.type)?.label || doc.type}
                        </span>
                        <span style={{
                          padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                          background: isDark ? '#1e293b' : '#e2e8f0', color: isDark ? '#94a3b8' : '#64748b'
                        }}>
                          {doc.language === 'fr' ? 'FR' : 'EN'}
                        </span>
                        {doc.is_featured && (
                          <span style={{
                            padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                            background: '#F39C1220', color: '#F39C12'
                          }}>
                            <Star size={10} style={{ marginRight: '4px' }} /> Mis en avant
                          </span>
                        )}
                      </div>
                      <h4 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: '600', lineHeight: 1.4 }}>{doc.title}</h4>
                      {doc.description && <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.5 }}>{doc.description.substring(0, 100)}...</p>}
                    </div>
                    <div style={{ fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8', marginBottom: '12px' }}>
                      {doc.organization_name && <p style={{ margin: '4px 0' }}><Home size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />{doc.organization_name}</p>}
                      {doc.publication_date && <p style={{ margin: '4px 0' }}><Calendar size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />{new Date(doc.publication_date).toLocaleDateString('fr-FR')}</p>}
                      <p style={{ margin: '4px 0' }}><Eye size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />{doc.view_count || 0} vues | {doc.download_count || 0} téléchargements</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ ...styles.btnSecondary, flex: 1, padding: '8px' }} onClick={() => openDocForm(doc)}>
                        <Edit2 size={14} /> Modifier
                      </button>
                      <button style={{ ...styles.btnSecondary, padding: '8px', color: '#ef4444' }} onClick={() => confirmDelete('documents', doc.id, doc.title)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {renderPagination(docsPagination, fetchDocuments)}
          </div>
        )
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div>
          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#64748b20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={24} color="#64748b" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Domaines d'expertise</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: isDark ? '#64748b' : '#94a3b8' }}>
                    Gérez les domaines qui apparaissent dans le formulaire des experts
                  </p>
                </div>
              </div>
              <button
                style={styles.btnPrimary}
                onClick={() => {
                  setEditingDomain(null);
                  setDomainForm({ name: '', category: 'health', description: '', icon: 'award', is_active: true });
                  setShowDomainModal(true);
                }}
              >
                <Plus size={18} /> Ajouter un domaine
              </button>
            </div>

            {loadingDomains ? (
              <div style={{ textAlign: 'center', padding: '60px' }}><Loader size={32} className="spin" /></div>
            ) : Object.keys(expertiseDomainsGrouped).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: isDark ? '#64748b' : '#94a3b8' }}>
                <Award size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p>Aucun domaine d'expertise configuré</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {Object.entries(expertiseDomainsGrouped).map(([category, domains]) => (
                  <div key={category} style={{ background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '16px', padding: '20px', border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` }}>
                    <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: category === 'health' ? '#27AE60' : category === 'animal' ? '#3498DB' : category === 'environment' ? '#2ECC71' : category === 'laboratory' ? '#9B59B6' : '#E67E22' }}></span>
                      {expertiseCategoryLabels[category] || category}
                      <span style={{ fontSize: '13px', fontWeight: '400', color: isDark ? '#64748b' : '#94a3b8' }}>({domains.length})</span>
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {domains.map(domain => (
                        <div
                          key={domain.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 14px',
                            background: isDark ? '#1e293b' : '#ffffff',
                            borderRadius: '10px',
                            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onClick={() => {
                            setEditingDomain(domain);
                            setDomainForm({
                              name: domain.name,
                              category: domain.category,
                              description: domain.description || '',
                              icon: domain.icon || 'award',
                              is_active: domain.is_active
                            });
                            setShowDomainModal(true);
                          }}
                        >
                          <span style={{ fontSize: '14px', fontWeight: '500' }}>{domain.name}</span>
                          {!domain.is_active && (
                            <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', background: '#ef444420', color: '#ef4444' }}>Inactif</span>
                          )}
                          <Edit2 size={14} style={{ color: isDark ? '#64748b' : '#94a3b8', marginLeft: '4px' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Domain Modal */}
      {showDomainModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modal, maxWidth: '500px' }}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                {editingDomain ? 'Modifier le domaine' : 'Ajouter un domaine'}
              </h3>
              <button style={styles.closeBtn} onClick={() => setShowDomainModal(false)}><X size={20} /></button>
            </div>
            <div style={styles.modalBody}>
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Nom (Français) *</label>
                <input
                  style={styles.input}
                  value={domainForm.name}
                  onChange={e => setDomainForm({ ...domainForm, name: e.target.value })}
                  placeholder="Ex: Épidémiologie"
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Catégorie *</label>
                <select
                  style={styles.select}
                  value={domainForm.category}
                  onChange={e => setDomainForm({ ...domainForm, category: e.target.value })}
                >
                  <option value="health">Santé Humaine</option>
                  <option value="animal">Santé Animale</option>
                  <option value="environment">Santé Environnementale</option>
                  <option value="laboratory">Laboratoire</option>
                  <option value="management">Gestion & Coordination</option>
                  <option value="other">Autres</option>
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Description</label>
                <textarea
                  style={{ ...styles.textarea, minHeight: '80px' }}
                  value={domainForm.description}
                  onChange={e => setDomainForm({ ...domainForm, description: e.target.value })}
                  placeholder="Description courte du domaine..."
                />
              </div>
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="checkbox"
                  id="domain_active"
                  checked={domainForm.is_active}
                  onChange={e => setDomainForm({ ...domainForm, is_active: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="domain_active" style={{ ...styles.label, margin: 0 }}>Actif (visible dans le formulaire)</label>
              </div>
            </div>
            <div style={styles.modalFooter}>
              {editingDomain && (
                <button
                  style={{ ...styles.btnSecondary, color: '#ef4444', marginRight: 'auto' }}
                  onClick={async () => {
                    if (confirm('Supprimer ce domaine ?')) {
                      const res = await api.delete(`/mapping/expertise-domains/${editingDomain.id}`, token);
                      if (res.success) {
                        setToast({ message: 'Domaine supprimé', type: 'success' });
                        setShowDomainModal(false);
                        fetchExpertiseDomains();
                      } else {
                        setToast({ message: res.message || 'Erreur', type: 'error' });
                      }
                    }
                  }}
                >
                  <Trash2 size={16} /> Supprimer
                </button>
              )}
              <button style={styles.btnSecondary} onClick={() => setShowDomainModal(false)}>Annuler</button>
              <button
                style={styles.btnPrimary}
                onClick={async () => {
                  if (!domainForm.name.trim()) {
                    setToast({ message: 'Le nom est requis', type: 'error' });
                    return;
                  }
                  const slug = domainForm.name.toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                  const payload = { ...domainForm, slug };

                  const res = editingDomain
                    ? await api.put(`/mapping/expertise-domains/${editingDomain.id}`, payload, token)
                    : await api.post('/mapping/expertise-domains', payload, token);

                  if (res.success) {
                    setToast({ message: editingDomain ? 'Domaine modifié' : 'Domaine créé', type: 'success' });
                    setShowDomainModal(false);
                    fetchExpertiseDomains();
                  } else {
                    setToast({ message: res.message || 'Erreur', type: 'error' });
                  }
                }}
              >
                {editingDomain ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modal, maxWidth: '420px' }}>
            <div style={styles.modalBody}>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: '#ef444420', margin: '0 auto 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Trash2 size={28} color="#ef4444" />
                </div>
                <h3 style={{ margin: '0 0 12px', fontSize: '20px', fontWeight: '700' }}>Confirmer la suppression</h3>
                <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b' }}>
                  Êtes-vous sûr de vouloir supprimer <strong>{deleteTarget?.name}</strong> ? Cette action est irréversible.
                </p>
              </div>
            </div>
            <div style={{ ...styles.modalFooter, justifyContent: 'center' }}>
              <button style={styles.btnSecondary} onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button style={{ ...styles.btnPrimary, background: '#ef4444' }} onClick={handleDelete} disabled={loading}>
                {loading ? <><Loader size={16} className="spin" /> Suppression...</> : <><Trash2 size={16} /> Supprimer</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============== OH E-LEARNING ==============
const OHELearningPage = ({ isDark, token }) => {
  const styles = createStyles(isDark);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // Data states
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [certificates, setCertificates] = useState([]);

  // UI states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showPathModal, setShowPathModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editingPath, setEditingPath] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showQuizQuestionsModal, setShowQuizQuestionsModal] = useState(false);

  // Filters
  const [courseSearch, setCourseSearch] = useState('');
  const [courseStatusFilter, setCourseStatusFilter] = useState('all');
  const [courseLevelFilter, setCourseLevelFilter] = useState('all');
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionTypeFilter, setQuestionTypeFilter] = useState('all');
  const [questionDifficultyFilter, setQuestionDifficultyFilter] = useState('all');
  const [quizSearch, setQuizSearch] = useState('');
  const [quizTypeFilter, setQuizTypeFilter] = useState('all');
  const [certificateSearch, setCertificateSearch] = useState('');
  const [certificateStatusFilter, setCertificateStatusFilter] = useState('all');
  const [pathSearch, setPathSearch] = useState('');
  const [pathStatusFilter, setPathStatusFilter] = useState('all');
  const [selectedPath, setSelectedPath] = useState(null);
  const [showPathCoursesModal, setShowPathCoursesModal] = useState(false);

  // Fetch functions
  const fetchStats = async () => {
    try {
      const res = await api.get('/elearning/stats', token);
      if (res.success) setStats(res.data);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/elearning/courses?limit=100', token);
      if (res.success) setCourses(res.data);
    } catch (error) {
      console.error('Fetch courses error:', error);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/elearning/categories', token);
      if (res.success) setCategories(res.data);
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  };

  const fetchLearningPaths = async () => {
    try {
      const res = await api.get('/elearning/paths?limit=100', token);
      if (res.success) setLearningPaths(res.data);
    } catch (error) {
      console.error('Fetch paths error:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/elearning/questions?limit=500', token);
      if (res.success) setQuestions(res.data);
    } catch (error) {
      console.error('Fetch questions error:', error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const res = await api.get('/elearning/quizzes?limit=100', token);
      if (res.success) setQuizzes(res.data);
    } catch (error) {
      console.error('Fetch quizzes error:', error);
    }
  };

  const fetchCertificates = async () => {
    try {
      const res = await api.get('/elearning/certificates/all', token);
      if (res.success) setCertificates(res.data);
    } catch (error) {
      console.error('Fetch certificates error:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchCourses();
    fetchCategories();
    fetchLearningPaths();
    fetchQuestions();
    fetchQuizzes();
    fetchCertificates();
  }, [token]);

  // Course CRUD
  const handleSaveCourse = async (courseData) => {
    try {
      const res = editingCourse
        ? await api.put(`/elearning/courses/${editingCourse.id}`, courseData, token)
        : await api.post('/elearning/courses', courseData, token);

      if (res.success) {
        setToast({ message: editingCourse ? 'Cours mis à jour' : 'Cours créé', type: 'success' });
        setShowCourseModal(false);
        setEditingCourse(null);
        fetchCourses();
        fetchStats();
      } else {
        setToast({ message: res.message || 'Erreur', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Erreur de connexion', type: 'error' });
    }
  };

  const handleDeleteCourse = async (course) => {
    setConfirmDialog({
      title: 'Supprimer ce cours ?',
      message: `Êtes-vous sûr de vouloir supprimer "${course.title_fr}" ? Cette action est irréversible.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await api.delete(`/elearning/courses/${course.id}`, token);
          if (res.success) {
            setToast({ message: 'Cours supprimé', type: 'success' });
            fetchCourses();
            fetchStats();
          }
        } catch (error) {
          setToast({ message: 'Erreur de suppression', type: 'error' });
        }
        setConfirmDialog(null);
      }
    });
  };

  // Module CRUD
  const handleSaveModule = async (moduleData) => {
    try {
      const res = editingModule
        ? await api.put(`/elearning/modules/${editingModule.id}`, moduleData, token)
        : await api.post('/elearning/modules', { ...moduleData, course_id: selectedCourse.id }, token);

      if (res.success) {
        setToast({ message: editingModule ? 'Module mis à jour' : 'Module créé', type: 'success' });
        setShowModuleModal(false);
        setEditingModule(null);
        // Refresh course curriculum
        const currRes = await api.get(`/elearning/courses/${selectedCourse.id}/curriculum`, token);
        if (currRes.success) {
          setSelectedCourse(prev => ({ ...prev, modules: currRes.data.modules }));
        }
      } else {
        setToast({ message: res.message || 'Erreur', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Erreur de connexion', type: 'error' });
    }
  };

  const handleDeleteModule = async (module) => {
    setConfirmDialog({
      title: 'Supprimer ce module ?',
      message: `Êtes-vous sûr de vouloir supprimer "${module.title_fr}" et toutes ses leçons ?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await api.delete(`/elearning/modules/${module.id}`, token);
          if (res.success) {
            setToast({ message: 'Module supprimé', type: 'success' });
            const currRes = await api.get(`/elearning/courses/${selectedCourse.id}/curriculum`, token);
            if (currRes.success) {
              setSelectedCourse(prev => ({ ...prev, modules: currRes.data.modules }));
            }
          }
        } catch (error) {
          setToast({ message: 'Erreur', type: 'error' });
        }
        setConfirmDialog(null);
      }
    });
  };

  // Lesson CRUD
  const handleSaveLesson = async (lessonData) => {
    try {
      const res = editingLesson
        ? await api.put(`/elearning/lessons/${editingLesson.id}`, lessonData, token)
        : await api.post('/elearning/lessons', { ...lessonData, module_id: selectedModule.id }, token);

      if (res.success) {
        setToast({ message: editingLesson ? 'Leçon mise à jour' : 'Leçon créée', type: 'success' });
        setShowLessonModal(false);
        setEditingLesson(null);
        // Refresh
        const currRes = await api.get(`/elearning/courses/${selectedCourse.id}/curriculum`, token);
        if (currRes.success) {
          setSelectedCourse(prev => ({ ...prev, modules: currRes.data.modules }));
          const updatedModule = currRes.data.modules.find(m => m.id === selectedModule.id);
          if (updatedModule) setSelectedModule(updatedModule);
        }
      } else {
        setToast({ message: res.message || 'Erreur', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Erreur de connexion', type: 'error' });
    }
  };

  const handleDeleteLesson = async (lesson) => {
    setConfirmDialog({
      title: 'Supprimer cette leçon ?',
      message: `Êtes-vous sûr de vouloir supprimer "${lesson.title_fr}" ?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await api.delete(`/elearning/lessons/${lesson.id}`, token);
          if (res.success) {
            setToast({ message: 'Leçon supprimée', type: 'success' });
            const currRes = await api.get(`/elearning/courses/${selectedCourse.id}/curriculum`, token);
            if (currRes.success) {
              setSelectedCourse(prev => ({ ...prev, modules: currRes.data.modules }));
              const updatedModule = currRes.data.modules.find(m => m.id === selectedModule.id);
              if (updatedModule) setSelectedModule(updatedModule);
            }
          }
        } catch (error) {
          setToast({ message: 'Erreur', type: 'error' });
        }
        setConfirmDialog(null);
      }
    });
  };

  // Learning Path CRUD
  const handleSavePath = async (pathData) => {
    try {
      const res = editingPath
        ? await api.put(`/elearning/paths/${editingPath.id}`, pathData, token)
        : await api.post('/elearning/paths', pathData, token);

      if (res.success) {
        setToast({ message: editingPath ? 'Parcours mis à jour' : 'Parcours créé', type: 'success' });
        setShowPathModal(false);
        setEditingPath(null);
        fetchLearningPaths();
      } else {
        setToast({ message: res.message || 'Erreur', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Erreur de connexion', type: 'error' });
    }
  };

  // Category CRUD
  const handleSaveCategory = async (categoryData) => {
    try {
      const res = editingCategory
        ? await api.put(`/elearning/categories/${editingCategory.id}`, categoryData, token)
        : await api.post('/elearning/categories', categoryData, token);

      if (res.success) {
        setToast({ message: editingCategory ? 'Catégorie mise à jour' : 'Catégorie créée', type: 'success' });
        setShowCategoryModal(false);
        setEditingCategory(null);
        fetchCategories();
      } else {
        setToast({ message: res.message || 'Erreur', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Erreur de connexion', type: 'error' });
    }
  };

  // Question CRUD
  const handleSaveQuestion = async (questionData) => {
    try {
      const res = editingQuestion
        ? await api.put(`/elearning/questions/${editingQuestion.id}`, questionData, token)
        : await api.post('/elearning/questions', questionData, token);

      if (res.success) {
        setToast({ message: editingQuestion ? 'Question mise à jour' : 'Question créée', type: 'success' });
        setShowQuestionModal(false);
        setEditingQuestion(null);
        fetchQuestions();
      } else {
        setToast({ message: res.message || 'Erreur', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Erreur de connexion', type: 'error' });
    }
  };

  const handleDeleteQuestion = async (question) => {
    setConfirmDialog({
      title: 'Supprimer cette question ?',
      message: `Êtes-vous sûr de vouloir supprimer cette question ? Elle sera retirée de tous les quiz.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await api.delete(`/elearning/questions/${question.id}`, token);
          if (res.success) {
            setToast({ message: 'Question supprimée', type: 'success' });
            fetchQuestions();
          }
        } catch (error) {
          setToast({ message: 'Erreur de suppression', type: 'error' });
        }
        setConfirmDialog(null);
      }
    });
  };

  // Quiz CRUD
  const handleSaveQuiz = async (quizData) => {
    try {
      const res = editingQuiz
        ? await api.put(`/elearning/quizzes/${editingQuiz.id}`, quizData, token)
        : await api.post('/elearning/quizzes', quizData, token);

      if (res.success) {
        setToast({ message: editingQuiz ? 'Quiz mis à jour' : 'Quiz créé', type: 'success' });
        setShowQuizModal(false);
        setEditingQuiz(null);
        fetchQuizzes();
      } else {
        setToast({ message: res.message || 'Erreur', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Erreur de connexion', type: 'error' });
    }
  };

  const handleDeleteQuiz = async (quiz) => {
    setConfirmDialog({
      title: 'Supprimer ce quiz ?',
      message: `Êtes-vous sûr de vouloir supprimer "${quiz.title_fr}" ? Toutes les tentatives seront également supprimées.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await api.delete(`/elearning/quizzes/${quiz.id}`, token);
          if (res.success) {
            setToast({ message: 'Quiz supprimé', type: 'success' });
            fetchQuizzes();
          }
        } catch (error) {
          setToast({ message: 'Erreur de suppression', type: 'error' });
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleAddQuizQuestions = async (quizId, questionIds) => {
    try {
      const res = await api.post(`/elearning/quizzes/${quizId}/questions`, { question_ids: questionIds }, token);
      if (res.success) {
        setToast({ message: 'Questions ajoutées au quiz', type: 'success' });
        setShowQuizQuestionsModal(false);
        fetchQuizzes();
      } else {
        setToast({ message: res.message || 'Erreur', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Erreur de connexion', type: 'error' });
    }
  };

  const handleRemoveQuizQuestion = async (quizId, questionId) => {
    try {
      const res = await api.delete(`/elearning/quizzes/${quizId}/questions/${questionId}`, token);
      if (res.success) {
        setToast({ message: 'Question retirée du quiz', type: 'success' });
        fetchQuizzes();
      }
    } catch (error) {
      setToast({ message: 'Erreur', type: 'error' });
    }
  };

  // Certificate handlers
  const handleRevokeCertificate = async (cert) => {
    setConfirmDialog({
      title: 'Révoquer ce certificat ?',
      message: `Êtes-vous sûr de vouloir révoquer le certificat de "${cert.recipient_name}" ?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await api.put(`/elearning/certificates/${cert.id}/revoke`, { reason: 'Révoqué par administrateur' }, token);
          if (res.success) {
            setToast({ message: 'Certificat révoqué', type: 'success' });
            fetchCertificates();
          }
        } catch (error) {
          setToast({ message: 'Erreur', type: 'error' });
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleReinstateCertificate = async (cert) => {
    try {
      const res = await api.put(`/elearning/certificates/${cert.id}/reinstate`, {}, token);
      if (res.success) {
        setToast({ message: 'Certificat réactivé', type: 'success' });
        fetchCertificates();
      }
    } catch (error) {
      setToast({ message: 'Erreur', type: 'error' });
    }
  };

  // Path courses handlers
  const handleAddPathCourse = async (pathId, courseId) => {
    try {
      const res = await api.post(`/elearning/paths/${pathId}/courses`, { course_id: courseId, is_required: true }, token);
      if (res.success) {
        setToast({ message: 'Cours ajouté au parcours', type: 'success' });
        fetchLearningPaths();
        // Refresh selected path
        if (selectedPath) {
          const pathRes = await api.get(`/elearning/paths/${selectedPath.slug}`, token);
          if (pathRes.success) setSelectedPath(pathRes.data);
        }
      }
    } catch (error) {
      setToast({ message: 'Erreur', type: 'error' });
    }
  };

  const handleRemovePathCourse = async (pathId, courseId) => {
    try {
      const res = await api.delete(`/elearning/paths/${pathId}/courses/${courseId}`, token);
      if (res.success) {
        setToast({ message: 'Cours retiré du parcours', type: 'success' });
        fetchLearningPaths();
        // Refresh selected path
        if (selectedPath) {
          const pathRes = await api.get(`/elearning/paths/${selectedPath.slug}`, token);
          if (pathRes.success) setSelectedPath(pathRes.data);
        }
      }
    } catch (error) {
      setToast({ message: 'Erreur', type: 'error' });
    }
  };

  const handleDeletePath = async (path) => {
    setConfirmDialog({
      title: 'Supprimer ce parcours ?',
      message: `Êtes-vous sûr de vouloir supprimer "${path.title_fr}" ?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await api.delete(`/elearning/paths/${path.id}`, token);
          if (res.success) {
            setToast({ message: 'Parcours supprimé', type: 'success' });
            fetchLearningPaths();
          }
        } catch (error) {
          setToast({ message: 'Erreur de suppression', type: 'error' });
        }
        setConfirmDialog(null);
      }
    });
  };

  const viewPathCourses = async (path) => {
    try {
      const res = await api.get(`/elearning/paths/${path.slug}`, token);
      if (res.success) {
        setSelectedPath(res.data);
        setShowPathCoursesModal(true);
      }
    } catch (error) {
      setToast({ message: 'Erreur de chargement', type: 'error' });
    }
  };

  // View course curriculum
  const viewCourseCurriculum = async (course) => {
    try {
      const res = await api.get(`/elearning/courses/${course.id}/curriculum`, token);
      if (res.success) {
        setSelectedCourse({ ...course, modules: res.data.modules });
        setActiveTab('curriculum');
      }
    } catch (error) {
      setToast({ message: 'Erreur de chargement', type: 'error' });
    }
  };

  // Filtered courses
  const filteredCourses = courses.filter(course => {
    if (courseSearch && !course.title_fr?.toLowerCase().includes(courseSearch.toLowerCase()) &&
        !course.title_en?.toLowerCase().includes(courseSearch.toLowerCase())) return false;
    if (courseStatusFilter !== 'all' && course.status !== courseStatusFilter) return false;
    if (courseLevelFilter !== 'all' && course.level !== courseLevelFilter) return false;
    return true;
  });

  // Filtered questions
  const filteredQuestions = questions.filter(q => {
    if (questionSearch && !q.question_text_fr?.toLowerCase().includes(questionSearch.toLowerCase()) &&
        !q.question_text_en?.toLowerCase().includes(questionSearch.toLowerCase())) return false;
    if (questionTypeFilter !== 'all' && q.question_type !== questionTypeFilter) return false;
    if (questionDifficultyFilter !== 'all' && q.difficulty !== questionDifficultyFilter) return false;
    return true;
  });

  // Filtered quizzes
  const filteredQuizzes = quizzes.filter(q => {
    if (quizSearch && !q.title_fr?.toLowerCase().includes(quizSearch.toLowerCase()) &&
        !q.title_en?.toLowerCase().includes(quizSearch.toLowerCase())) return false;
    if (quizTypeFilter !== 'all' && q.quiz_type !== quizTypeFilter) return false;
    return true;
  });

  // Filtered certificates
  const filteredCertificates = certificates.filter(c => {
    if (certificateSearch && !c.certificate_number?.toLowerCase().includes(certificateSearch.toLowerCase()) &&
        !c.recipient_name?.toLowerCase().includes(certificateSearch.toLowerCase()) &&
        !c.username?.toLowerCase().includes(certificateSearch.toLowerCase())) return false;
    if (certificateStatusFilter !== 'all' && c.status !== certificateStatusFilter) return false;
    return true;
  });

  // Filtered paths
  const filteredPaths = learningPaths.filter(p => {
    if (pathSearch && !p.title_fr?.toLowerCase().includes(pathSearch.toLowerCase()) &&
        !p.title_en?.toLowerCase().includes(pathSearch.toLowerCase())) return false;
    if (pathStatusFilter !== 'all' && p.status !== pathStatusFilter) return false;
    return true;
  });

  // Tab definitions
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'Cours', icon: BookOpen },
    { id: 'curriculum', label: 'Modules & Leçons', icon: FolderTree, hidden: !selectedCourse },
    { id: 'paths', label: 'Parcours', icon: Award },
    { id: 'questions', label: 'Banque Questions', icon: HelpCircle },
    { id: 'quizzes', label: 'Quiz', icon: FileQuestion },
    { id: 'certificates', label: 'Certificats', icon: Award },
    { id: 'categories', label: 'Catégories', icon: Tag },
    { id: 'enrollments', label: 'Inscriptions', icon: Users }
  ].filter(t => !t.hidden);

  // Level badge
  const getLevelBadge = (level) => {
    const levelConfig = {
      beginner: { label: 'Débutant', color: colors.success },
      intermediate: { label: 'Intermédiaire', color: colors.warning },
      advanced: { label: 'Avancé', color: colors.error }
    };
    const config = levelConfig[level] || levelConfig.beginner;
    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '600',
        background: `${config.color}20`,
        color: config.color
      }}>
        {config.label}
      </span>
    );
  };

  // Status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'Brouillon', color: '#94a3b8' },
      published: { label: 'Publié', color: colors.success },
      archived: { label: 'Archivé', color: colors.error }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '600',
        background: `${config.color}20`,
        color: config.color
      }}>
        {config.label}
      </span>
    );
  };

  // Content type icon
  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Play size={16} />;
      case 'pdf': return <FileText size={16} />;
      case 'quiz': return <Check size={16} />;
      case 'text': return <FileText size={16} />;
      default: return <File size={16} />;
    }
  };

  // ============ RENDER DASHBOARD TAB ============
  const renderDashboard = () => (
    <div>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {[
          { icon: BookOpen, label: 'Cours', value: stats?.totals?.courses || 0, sub: `${stats?.totals?.publishedCourses || 0} publiés`, color: colors.primary },
          { icon: Award, label: 'Parcours', value: stats?.totals?.paths || 0, color: colors.purple },
          { icon: Users, label: 'Inscriptions', value: stats?.totals?.enrollments || 0, sub: `${stats?.totals?.activeEnrollments || 0} actives`, color: colors.success },
          { icon: FileText, label: 'Certificats', value: stats?.totals?.certificates || 0, color: colors.warning }
        ].map((stat, i) => (
          <div key={i} style={{
            ...styles.card,
            background: isDark ? `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)` : `linear-gradient(135deg, ${stat.color}10 0%, white 100%)`,
            border: `1px solid ${stat.color}30`
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>{stat.label}</p>
                <p style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: stat.color }}>{stat.value}</p>
                {stat.sub && <p style={{ margin: '4px 0 0', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>{stat.sub}</p>}
              </div>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: `${stat.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <stat.icon size={24} color={stat.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Quick Actions */}
        <div style={styles.card}>
          <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '700' }}>Actions Rapides</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { icon: Plus, label: 'Nouveau Cours', action: () => { setEditingCourse(null); setShowCourseModal(true); }, color: colors.primary },
              { icon: Award, label: 'Nouveau Parcours', action: () => { setEditingPath(null); setShowPathModal(true); }, color: colors.purple },
              { icon: Tag, label: 'Catégorie', action: () => { setEditingCategory(null); setShowCategoryModal(true); }, color: colors.teal },
              { icon: RefreshCw, label: 'Actualiser', action: () => { fetchStats(); fetchCourses(); }, color: colors.success }
            ].map((item, i) => (
              <button key={i} onClick={item.action} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '14px 16px', borderRadius: '12px',
                background: `${item.color}15`, border: 'none',
                color: item.color, fontWeight: '600', fontSize: '13px',
                cursor: 'pointer', transition: 'all 0.2s'
              }}>
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Popular Courses */}
        <div style={styles.card}>
          <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '700' }}>Cours Populaires</h3>
          {stats?.popularCourses?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.popularCourses.slice(0, 4).map((course, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px', borderRadius: '10px',
                  background: isDark ? '#0f172a' : '#f8fafc'
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '8px',
                    background: course.thumbnail ? `url(http://localhost:5000${course.thumbnail}) center/cover` : `${colors.primary}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {!course.thumbnail && <BookOpen size={18} color={colors.primary} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '13px' }}>{course.title_fr}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>
                      {course.enrolled_count} inscrits • {course.average_rating?.toFixed(1) || '0.0'} ⭐
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ ...styles.textMuted, textAlign: 'center', padding: '20px' }}>Aucun cours pour le moment</p>
          )}
        </div>
      </div>
    </div>
  );

  // ============ RENDER COURSES TAB ============
  const renderCourses = () => (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Gestion des Cours</h2>
          <p style={{ margin: '4px 0 0', ...styles.textMuted }}>{filteredCourses.length} cours</p>
        </div>
        <button onClick={() => { setEditingCourse(null); setShowCourseModal(true); }} style={styles.btnPrimary}>
          <Plus size={18} /> Nouveau Cours
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 2, minWidth: '200px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#64748b' : '#94a3b8' }} />
          <input
            type="text"
            placeholder="Rechercher un cours..."
            value={courseSearch}
            onChange={e => setCourseSearch(e.target.value)}
            style={{ ...styles.input, paddingLeft: '42px', width: '100%' }}
          />
        </div>
        <select value={courseStatusFilter} onChange={e => setCourseStatusFilter(e.target.value)} style={{ ...styles.select, minWidth: '140px' }}>
          <option value="all">Tous les statuts</option>
          <option value="draft">Brouillons</option>
          <option value="published">Publiés</option>
          <option value="archived">Archivés</option>
        </select>
        <select value={courseLevelFilter} onChange={e => setCourseLevelFilter(e.target.value)} style={{ ...styles.select, minWidth: '140px' }}>
          <option value="all">Tous les niveaux</option>
          <option value="beginner">Débutant</option>
          <option value="intermediate">Intermédiaire</option>
          <option value="advanced">Avancé</option>
        </select>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ width: '40px', height: '40px', border: `3px solid ${colors.primary}30`, borderTopColor: colors.primary, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={styles.textMuted}>Chargement...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div style={{ ...styles.card, textAlign: 'center', padding: '60px' }}>
          <BookOpen size={48} color={isDark ? '#475569' : '#cbd5e1'} style={{ marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>Aucun cours trouvé</h3>
          <p style={styles.textMuted}>Créez votre premier cours pour commencer</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredCourses.map(course => (
            <div key={course.id} style={{
              ...styles.card,
              overflow: 'hidden',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}>
              {/* Thumbnail */}
              <div style={{
                height: '160px',
                background: course.thumbnail
                  ? `url(http://localhost:5000${course.thumbnail}) center/cover`
                  : `linear-gradient(135deg, ${colors.primary}30 0%, ${colors.purple}30 100%)`,
                margin: '-20px -20px 16px -20px',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                  {getStatusBadge(course.status)}
                  {getLevelBadge(course.level)}
                </div>
                {course.is_featured && (
                  <div style={{
                    position: 'absolute', top: '12px', left: '12px',
                    background: colors.warning, color: 'white',
                    padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '700'
                  }}>
                    ⭐ EN VEDETTE
                  </div>
                )}
              </div>

              {/* Content */}
              <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '700' }}>{course.title_fr}</h3>
              {course.short_description_fr && (
                <p style={{ margin: '0 0 12px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: 1.4 }}>
                  {course.short_description_fr.substring(0, 100)}{course.short_description_fr.length > 100 ? '...' : ''}
                </p>
              )}

              {/* Meta */}
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8', marginBottom: '16px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} /> {course.duration_hours || 0}h
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FolderTree size={14} /> {course.module_count || 0} modules
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={14} /> {course.enrolled_count || 0}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => viewCourseCurriculum(course)} style={{ ...styles.btnSecondary, flex: 1, padding: '10px' }}>
                  <FolderTree size={16} /> Modules
                </button>
                <button onClick={() => { setEditingCourse(course); setShowCourseModal(true); }} style={{ ...styles.btnIcon, background: `${colors.primary}15`, color: colors.primary }}>
                  <Edit3 size={16} />
                </button>
                <button onClick={() => handleDeleteCourse(course)} style={{ ...styles.btnIcon, background: `${colors.error}15`, color: colors.error }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ============ RENDER CURRICULUM TAB ============
  const renderCurriculum = () => {
    if (!selectedCourse) {
      return (
        <div style={{ ...styles.card, textAlign: 'center', padding: '60px' }}>
          <FolderTree size={48} color={isDark ? '#475569' : '#cbd5e1'} style={{ marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px' }}>Sélectionnez un cours</h3>
          <p style={styles.textMuted}>Choisissez un cours dans l'onglet "Cours" pour gérer ses modules et leçons</p>
        </div>
      );
    }

    return (
      <div>
        {/* Course Header */}
        <div style={{
          ...styles.card,
          background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.purple}10 100%)`,
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '12px',
                background: selectedCourse.thumbnail
                  ? `url(http://localhost:5000${selectedCourse.thumbnail}) center/cover`
                  : `${colors.primary}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {!selectedCourse.thumbnail && <BookOpen size={32} color={colors.primary} />}
              </div>
              <div>
                <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: '700' }}>{selectedCourse.title_fr}</h2>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  {getStatusBadge(selectedCourse.status)}
                  {getLevelBadge(selectedCourse.level)}
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
                  {selectedCourse.modules?.length || 0} modules • {selectedCourse.duration_hours || 0}h de contenu
                </p>
              </div>
            </div>
            <button onClick={() => { setSelectedCourse(null); setActiveTab('courses'); }} style={styles.btnSecondary}>
              <ArrowLeft size={16} /> Retour aux cours
            </button>
          </div>
        </div>

        {/* Add Module Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Modules & Leçons</h3>
          <button onClick={() => { setEditingModule(null); setShowModuleModal(true); }} style={styles.btnPrimary}>
            <Plus size={18} /> Ajouter un Module
          </button>
        </div>

        {/* Modules List */}
        {selectedCourse.modules?.length === 0 ? (
          <div style={{ ...styles.card, textAlign: 'center', padding: '40px' }}>
            <FolderTree size={40} color={isDark ? '#475569' : '#cbd5e1'} style={{ marginBottom: '12px' }} />
            <p style={styles.textMuted}>Aucun module. Ajoutez votre premier module pour structurer ce cours.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedCourse.modules?.map((module, moduleIndex) => (
              <div key={module.id} style={styles.card}>
                {/* Module Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: `${colors.primary}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '700', color: colors.primary
                    }}>
                      {moduleIndex + 1}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{module.title_fr}</h4>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                        {module.lessons?.length || 0} leçons • {module.duration_minutes || 0} min
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setSelectedModule(module); setEditingLesson(null); setShowLessonModal(true); }}
                      style={{ ...styles.btnSecondary, padding: '8px 12px', fontSize: '12px' }}>
                      <Plus size={14} /> Leçon
                    </button>
                    <button onClick={() => { setEditingModule(module); setShowModuleModal(true); }}
                      style={{ ...styles.btnIcon, background: `${colors.primary}15`, color: colors.primary, width: '32px', height: '32px' }}>
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleDeleteModule(module)}
                      style={{ ...styles.btnIcon, background: `${colors.error}15`, color: colors.error, width: '32px', height: '32px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Lessons */}
                {module.lessons?.length > 0 && (
                  <div style={{
                    background: isDark ? '#0f172a' : '#f8fafc',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}>
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div key={lesson.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderBottom: lessonIndex < module.lessons.length - 1 ? `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}` : 'none'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '8px',
                            background: isDark ? '#1e293b' : '#e2e8f0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: isDark ? '#94a3b8' : '#64748b'
                          }}>
                            {getContentTypeIcon(lesson.content_type)}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>{lesson.title_fr}</p>
                            <p style={{ margin: '2px 0 0', fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>
                              {lesson.content_type === 'video' ? 'Vidéo' : lesson.content_type === 'pdf' ? 'PDF' : lesson.content_type === 'quiz' ? 'Quiz' : 'Texte'}
                              {lesson.duration_minutes > 0 && ` • ${lesson.duration_minutes} min`}
                              {lesson.is_preview && ' • Aperçu gratuit'}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => { setSelectedModule(module); setEditingLesson(lesson); setShowLessonModal(true); }}
                            style={{ ...styles.btnIcon, width: '28px', height: '28px', background: `${colors.primary}15`, color: colors.primary }}>
                            <Edit3 size={12} />
                          </button>
                          <button onClick={() => handleDeleteLesson(lesson)}
                            style={{ ...styles.btnIcon, width: '28px', height: '28px', background: `${colors.error}15`, color: colors.error }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ============ RENDER LEARNING PATHS TAB ============
  const renderPaths = () => (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Parcours Diplômants</h2>
          <p style={{ margin: '4px 0 0', ...styles.textMuted }}>{filteredPaths.length} parcours</p>
        </div>
        <button onClick={() => { setEditingPath(null); setShowPathModal(true); }} style={styles.btnPrimary}>
          <Plus size={18} /> Nouveau Parcours
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 2, minWidth: '200px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#64748b' : '#94a3b8' }} />
          <input
            type="text"
            placeholder="Rechercher un parcours..."
            value={pathSearch}
            onChange={e => setPathSearch(e.target.value)}
            style={{ ...styles.input, paddingLeft: '42px', width: '100%' }}
          />
        </div>
        <select value={pathStatusFilter} onChange={e => setPathStatusFilter(e.target.value)} style={{ ...styles.select, minWidth: '150px' }}>
          <option value="all">Tous les statuts</option>
          <option value="draft">Brouillon</option>
          <option value="published">Publié</option>
          <option value="archived">Archivé</option>
        </select>
      </div>

      {/* Paths Grid */}
      {filteredPaths.length === 0 ? (
        <div style={{ ...styles.card, textAlign: 'center', padding: '60px' }}>
          <Award size={48} color={isDark ? '#475569' : '#cbd5e1'} style={{ marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px' }}>Aucun parcours</h3>
          <p style={styles.textMuted}>Créez des parcours diplômants regroupant plusieurs cours</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {filteredPaths.map(path => (
            <div key={path.id} style={{ ...styles.card, borderLeft: `4px solid ${colors.purple}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: '700' }}>{path.title_fr}</h3>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {getStatusBadge(path.status)}
                    {getLevelBadge(path.level)}
                  </div>
                </div>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: `${colors.purple}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Award size={22} color={colors.purple} />
                </div>
              </div>

              {path.description_fr && (
                <p style={{ margin: '0 0 12px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
                  {path.description_fr.substring(0, 120)}...
                </p>
              )}

              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8', marginBottom: '16px' }}>
                <span><BookOpen size={14} style={{ marginRight: '4px' }} />{path.course_count || 0} cours</span>
                <span><Clock size={14} style={{ marginRight: '4px' }} />{path.duration_hours || 0}h</span>
                <span><Users size={14} style={{ marginRight: '4px' }} />{path.enrolled_count || 0} inscrits</span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => viewPathCourses(path)} style={{ ...styles.btnSecondary, flex: 1 }}>
                  <BookOpen size={16} /> Cours
                </button>
                <button onClick={() => { setEditingPath(path); setShowPathModal(true); }} style={styles.btnIcon}>
                  <Edit3 size={16} />
                </button>
                <button onClick={() => handleDeletePath(path)} style={{ ...styles.btnIcon, background: `${colors.error}15`, color: colors.error }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Helper functions for Question types
  const getQuestionTypeBadge = (type) => {
    const typeConfig = {
      mcq: { label: 'QCM', color: colors.primary },
      multiple_select: { label: 'Sélection Multiple', color: colors.purple },
      true_false: { label: 'Vrai/Faux', color: colors.teal },
      short_answer: { label: 'Réponse Courte', color: colors.warning },
      matching: { label: 'Association', color: colors.success },
      fill_blank: { label: 'Texte à Trous', color: colors.error }
    };
    const config = typeConfig[type] || { label: type, color: '#94a3b8' };
    return (
      <span style={{
        padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600',
        background: `${config.color}20`, color: config.color
      }}>
        {config.label}
      </span>
    );
  };

  const getDifficultyBadge = (difficulty) => {
    const config = {
      easy: { label: 'Facile', color: colors.success },
      medium: { label: 'Moyen', color: colors.warning },
      hard: { label: 'Difficile', color: colors.error }
    };
    const c = config[difficulty] || config.medium;
    return (
      <span style={{
        padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600',
        background: `${c.color}20`, color: c.color
      }}>
        {c.label}
      </span>
    );
  };

  const getQuizTypeBadge = (type) => {
    const config = {
      practice: { label: 'Pratique', color: colors.teal },
      graded: { label: 'Noté', color: colors.primary },
      final_exam: { label: 'Examen Final', color: colors.purple }
    };
    const c = config[type] || config.graded;
    return (
      <span style={{
        padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600',
        background: `${c.color}20`, color: c.color
      }}>
        {c.label}
      </span>
    );
  };

  // ============ RENDER QUESTIONS TAB ============
  const renderQuestions = () => (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Banque de Questions</h2>
          <p style={{ margin: '4px 0 0', ...styles.textMuted }}>{filteredQuestions.length} questions</p>
        </div>
        <button onClick={() => { setEditingQuestion(null); setShowQuestionModal(true); }} style={styles.btnPrimary}>
          <Plus size={18} /> Nouvelle Question
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 2, minWidth: '200px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#64748b' : '#94a3b8' }} />
          <input
            type="text"
            placeholder="Rechercher une question..."
            value={questionSearch}
            onChange={e => setQuestionSearch(e.target.value)}
            style={{ ...styles.input, paddingLeft: '42px', width: '100%' }}
          />
        </div>
        <select value={questionTypeFilter} onChange={e => setQuestionTypeFilter(e.target.value)} style={{ ...styles.select, minWidth: '160px' }}>
          <option value="all">Tous les types</option>
          <option value="mcq">QCM</option>
          <option value="multiple_select">Sélection Multiple</option>
          <option value="true_false">Vrai/Faux</option>
          <option value="short_answer">Réponse Courte</option>
          <option value="matching">Association</option>
          <option value="fill_blank">Texte à Trous</option>
        </select>
        <select value={questionDifficultyFilter} onChange={e => setQuestionDifficultyFilter(e.target.value)} style={{ ...styles.select, minWidth: '140px' }}>
          <option value="all">Toutes difficultés</option>
          <option value="easy">Facile</option>
          <option value="medium">Moyen</option>
          <option value="hard">Difficile</option>
        </select>
      </div>

      {/* Questions Grid */}
      {filteredQuestions.length === 0 ? (
        <div style={{ ...styles.card, textAlign: 'center', padding: '60px' }}>
          <HelpCircle size={48} color={isDark ? '#475569' : '#cbd5e1'} style={{ marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px' }}>Aucune question trouvée</h3>
          <p style={styles.textMuted}>Créez des questions pour les utiliser dans vos quiz</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredQuestions.map(question => (
            <div key={question.id} style={{
              ...styles.card,
              borderLeft: `4px solid ${
                question.question_type === 'mcq' ? colors.primary :
                question.question_type === 'true_false' ? colors.teal :
                question.question_type === 'multiple_select' ? colors.purple :
                colors.warning
              }`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, marginRight: '16px' }}>
                  <p style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: '500', lineHeight: '1.5' }}>
                    {question.question_text_fr?.substring(0, 200) || 'Question sans texte'}
                    {question.question_text_fr?.length > 200 && '...'}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {getQuestionTypeBadge(question.question_type)}
                    {getDifficultyBadge(question.difficulty)}
                    <span style={{ fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                      {question.points} pt{question.points > 1 ? 's' : ''}
                    </span>
                    {question.quiz_count > 0 && (
                      <span style={{ fontSize: '12px', color: colors.primary }}>
                        <FileQuestion size={12} style={{ marginRight: '4px' }} />
                        {question.quiz_count} quiz
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => { setEditingQuestion(question); setShowQuestionModal(true); }}
                    style={styles.btnIcon}
                    title="Modifier"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(question)}
                    style={{ ...styles.btnIcon, background: `${colors.error}15`, color: colors.error }}
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Options preview for MCQ */}
              {(question.question_type === 'mcq' || question.question_type === 'multiple_select') && question.options && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                  <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '600', color: isDark ? '#64748b' : '#94a3b8', textTransform: 'uppercase' }}>Options:</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {(Array.isArray(question.options) ? question.options : []).slice(0, 4).map((opt, idx) => (
                      <span key={idx} style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '12px',
                        background: isDark ? '#0f172a' : '#f1f5f9',
                        border: `1px solid ${
                          (question.question_type === 'mcq' && question.correct_answer === idx) ||
                          (question.question_type === 'multiple_select' && Array.isArray(question.correct_answer) && question.correct_answer.includes(idx))
                            ? colors.success : 'transparent'
                        }`,
                        color: isDark ? '#e2e8f0' : '#475569'
                      }}>
                        {typeof opt === 'string' ? opt : opt.text_fr || opt.text}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ============ RENDER QUIZZES TAB ============
  const renderQuizzes = () => (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Gestion des Quiz</h2>
          <p style={{ margin: '4px 0 0', ...styles.textMuted }}>{filteredQuizzes.length} quiz</p>
        </div>
        <button onClick={() => { setEditingQuiz(null); setShowQuizModal(true); }} style={styles.btnPrimary}>
          <Plus size={18} /> Nouveau Quiz
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 2, minWidth: '200px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#64748b' : '#94a3b8' }} />
          <input
            type="text"
            placeholder="Rechercher un quiz..."
            value={quizSearch}
            onChange={e => setQuizSearch(e.target.value)}
            style={{ ...styles.input, paddingLeft: '42px', width: '100%' }}
          />
        </div>
        <select value={quizTypeFilter} onChange={e => setQuizTypeFilter(e.target.value)} style={{ ...styles.select, minWidth: '160px' }}>
          <option value="all">Tous les types</option>
          <option value="practice">Pratique</option>
          <option value="graded">Noté</option>
          <option value="final_exam">Examen Final</option>
        </select>
      </div>

      {/* Quizzes Grid */}
      {filteredQuizzes.length === 0 ? (
        <div style={{ ...styles.card, textAlign: 'center', padding: '60px' }}>
          <FileQuestion size={48} color={isDark ? '#475569' : '#cbd5e1'} style={{ marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px' }}>Aucun quiz trouvé</h3>
          <p style={styles.textMuted}>Créez des quiz pour évaluer vos apprenants</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {filteredQuizzes.map(quiz => (
            <div key={quiz.id} style={{
              ...styles.card,
              borderTop: `4px solid ${
                quiz.quiz_type === 'final_exam' ? colors.purple :
                quiz.quiz_type === 'graded' ? colors.primary :
                colors.teal
              }`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700' }}>{quiz.title_fr}</h3>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {getQuizTypeBadge(quiz.quiz_type)}
                    {getStatusBadge(quiz.status)}
                  </div>
                </div>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: `${quiz.quiz_type === 'final_exam' ? colors.purple : colors.primary}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <FileQuestion size={24} color={quiz.quiz_type === 'final_exam' ? colors.purple : colors.primary} />
                </div>
              </div>

              {quiz.description_fr && (
                <p style={{ margin: '0 0 12px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.5' }}>
                  {quiz.description_fr.substring(0, 100)}{quiz.description_fr.length > 100 && '...'}
                </p>
              )}

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ textAlign: 'center', padding: '10px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '10px' }}>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: colors.primary }}>{quiz.question_count || 0}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>Questions</p>
                </div>
                <div style={{ textAlign: 'center', padding: '10px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '10px' }}>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: colors.warning }}>{quiz.passing_score}%</p>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>Seuil</p>
                </div>
                <div style={{ textAlign: 'center', padding: '10px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '10px' }}>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: colors.teal }}>
                    {quiz.time_limit_minutes || '∞'}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>Minutes</p>
                </div>
              </div>

              {/* Settings */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {quiz.shuffle_questions && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: colors.success }}>
                    <CheckCircle2 size={12} /> Questions aléatoires
                  </span>
                )}
                {quiz.show_correct_answers && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: colors.primary }}>
                    <Eye size={12} /> Réponses visibles
                  </span>
                )}
                {quiz.max_attempts > 1 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: colors.warning }}>
                    <RefreshCw size={12} /> {quiz.max_attempts} tentatives
                  </span>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => { setSelectedQuiz(quiz); setShowQuizQuestionsModal(true); }}
                  style={{ ...styles.btnSecondary, flex: 1 }}
                >
                  <ListChecks size={16} /> Gérer Questions
                </button>
                <button
                  onClick={() => { setEditingQuiz(quiz); setShowQuizModal(true); }}
                  style={styles.btnIcon}
                  title="Modifier"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => handleDeleteQuiz(quiz)}
                  style={{ ...styles.btnIcon, background: `${colors.error}15`, color: colors.error }}
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ============ RENDER CATEGORIES TAB ============
  const renderCategories = () => (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Catégories E-Learning</h2>
          <p style={{ margin: '4px 0 0', ...styles.textMuted }}>{categories.length} catégories</p>
        </div>
        <button onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }} style={styles.btnPrimary}>
          <Plus size={18} /> Nouvelle Catégorie
        </button>
      </div>

      {/* Categories Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {categories.map(cat => (
          <div key={cat.id} style={{
            ...styles.card,
            borderLeft: `4px solid ${cat.color || colors.primary}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: `${cat.color || colors.primary}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: cat.color || colors.primary, fontWeight: '700'
                }}>
                  {cat.icon ? <span style={{ fontSize: '18px' }}>{cat.icon}</span> : <Tag size={18} />}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>{cat.name_fr}</h4>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                    {cat.course_count || 0} cours
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => { setEditingCategory(cat); setShowCategoryModal(true); }}
                  style={{ ...styles.btnIcon, width: '32px', height: '32px' }}>
                  <Edit3 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ============ RENDER ENROLLMENTS TAB ============
  // ============ RENDER CERTIFICATES TAB ============
  const renderCertificates = () => {
    const getCertStatusBadge = (status) => {
      const config = {
        active: { label: 'Actif', color: colors.success },
        expired: { label: 'Expiré', color: colors.warning },
        revoked: { label: 'Révoqué', color: colors.error },
        pending: { label: 'En attente', color: colors.textSecondary }
      };
      const c = config[status] || config.active;
      return (
        <span style={{
          padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600',
          background: `${c.color}20`, color: c.color
        }}>
          {c.label}
        </span>
      );
    };

    return (
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Certificats</h2>
            <p style={{ margin: '4px 0 0', ...styles.textMuted }}>{filteredCertificates.length} certificats émis</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 2, minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#64748b' : '#94a3b8' }} />
            <input
              type="text"
              placeholder="Rechercher par numéro, nom..."
              value={certificateSearch}
              onChange={e => setCertificateSearch(e.target.value)}
              style={{ ...styles.input, paddingLeft: '42px', width: '100%' }}
            />
          </div>
          <select value={certificateStatusFilter} onChange={e => setCertificateStatusFilter(e.target.value)} style={{ ...styles.select, minWidth: '150px' }}>
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="expired">Expiré</option>
            <option value="revoked">Révoqué</option>
          </select>
        </div>

        {/* Certificates Table */}
        {filteredCertificates.length === 0 ? (
          <div style={{ ...styles.card, textAlign: 'center', padding: '60px' }}>
            <Award size={48} color={isDark ? '#475569' : '#cbd5e1'} style={{ marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px' }}>Aucun certificat</h3>
            <p style={styles.textMuted}>Les certificats seront générés automatiquement lorsque les apprenants termineront leurs cours.</p>
          </div>
        ) : (
          <div style={styles.card}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.textSecondary }}>Numéro</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.textSecondary }}>Titulaire</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.textSecondary }}>Cours/Parcours</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.textSecondary }}>Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.textSecondary }}>Score</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: colors.textSecondary }}>Statut</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: colors.textSecondary }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCertificates.map(cert => (
                    <tr key={cert.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '13px', color: colors.primary }}>{cert.certificate_number}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div>
                          <div style={{ fontWeight: '500', color: colors.text }}>{cert.recipient_name}</div>
                          <div style={{ fontSize: '12px', color: colors.textSecondary }}>{cert.username || cert.user_email}</div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {cert.enrollable_type === 'learning_path' ? (
                            <Award size={16} color={colors.purple} />
                          ) : (
                            <BookOpen size={16} color={colors.primary} />
                          )}
                          <span style={{ color: colors.text, fontSize: '13px' }}>{cert.course_title_fr || cert.title_fr}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: colors.textSecondary, fontSize: '13px' }}>
                        {new Date(cert.issue_date).toLocaleDateString('fr-FR')}
                        {cert.expiry_date && (
                          <div style={{ fontSize: '11px', color: colors.warning }}>
                            Expire: {new Date(cert.expiry_date).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {cert.final_score ? (
                          <span style={{ fontWeight: '600', color: cert.final_score >= 70 ? colors.success : colors.warning }}>
                            {Math.round(cert.final_score)}%
                          </span>
                        ) : '-'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {getCertStatusBadge(cert.status)}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {cert.status === 'active' ? (
                            <button
                              onClick={() => handleRevokeCertificate(cert)}
                              title="Révoquer"
                              style={{ ...styles.btnIcon, background: `${colors.error}15`, color: colors.error }}
                            >
                              <XCircle size={16} />
                            </button>
                          ) : cert.status === 'revoked' ? (
                            <button
                              onClick={() => handleReinstateCertificate(cert)}
                              title="Réactiver"
                              style={{ ...styles.btnIcon, background: `${colors.success}15`, color: colors.success }}
                            >
                              <CheckCircle size={16} />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEnrollments = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Inscriptions</h2>
          <p style={{ margin: '4px 0 0', ...styles.textMuted }}>Gérez les inscriptions aux cours et parcours</p>
        </div>
      </div>

      <div style={{ ...styles.card, textAlign: 'center', padding: '60px' }}>
        <Users size={48} color={isDark ? '#475569' : '#cbd5e1'} style={{ marginBottom: '16px' }} />
        <h3 style={{ margin: '0 0 8px' }}>Gestion des inscriptions</h3>
        <p style={styles.textMuted}>Les inscriptions des apprenants apparaîtront ici une fois que des utilisateurs seront inscrits à vos cours.</p>
      </div>
    </div>
  );

  // ============ COURSE MODAL ============
  const CourseModal = () => {
    const [form, setForm] = useState({
      title_fr: editingCourse?.title_fr || '',
      title_en: editingCourse?.title_en || '',
      description_fr: editingCourse?.description_fr || '',
      short_description_fr: editingCourse?.short_description_fr || '',
      thumbnail: editingCourse?.thumbnail || '',
      level: editingCourse?.level || 'beginner',
      duration_hours: editingCourse?.duration_hours || 0,
      category_id: editingCourse?.category_id || '',
      status: editingCourse?.status || 'draft',
      is_featured: editingCourse?.is_featured || false
    });

    const [uploading, setUploading] = useState(false);

    const handleThumbnailUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('http://localhost:5000/api/upload/elearning/thumbnail', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const res = await response.json();
        if (res.success) {
          setForm(prev => ({ ...prev, thumbnail: res.data.url }));
        }
      } catch (err) {
        console.error('Upload error:', err);
      }
      setUploading(false);
    };

    return (
      <Modal isOpen={showCourseModal} onClose={() => setShowCourseModal(false)} title={editingCourse ? 'Modifier le Cours' : 'Nouveau Cours'} isDark={isDark} width="700px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Thumbnail */}
          <div>
            <label style={styles.label}>Image du cours</label>
            <div style={{
              width: '100%', height: '180px', borderRadius: '12px',
              border: `2px dashed ${isDark ? '#334155' : '#e2e8f0'}`,
              background: form.thumbnail ? `url(http://localhost:5000${form.thumbnail}) center/cover` : (isDark ? '#0f172a' : '#f8fafc'),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative', overflow: 'hidden'
            }} onClick={() => document.getElementById('course-thumbnail-input').click()}>
              {!form.thumbnail && (
                <div style={{ textAlign: 'center' }}>
                  <Image size={32} color={isDark ? '#475569' : '#94a3b8'} />
                  <p style={{ margin: '8px 0 0', fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>
                    {uploading ? 'Upload en cours...' : 'Cliquer pour uploader'}
                  </p>
                </div>
              )}
              {form.thumbnail && (
                <button onClick={(e) => { e.stopPropagation(); setForm(prev => ({ ...prev, thumbnail: '' })); }}
                  style={{ position: 'absolute', top: '8px', right: '8px', ...styles.btnIcon, background: 'rgba(0,0,0,0.5)', color: 'white' }}>
                  <X size={16} />
                </button>
              )}
            </div>
            <input type="file" id="course-thumbnail-input" accept="image/*" onChange={handleThumbnailUpload} style={{ display: 'none' }} />
          </div>

          {/* Title FR */}
          <div>
            <label style={styles.label}>Titre (Français) *</label>
            <input type="text" value={form.title_fr} onChange={e => setForm({ ...form, title_fr: e.target.value })}
              style={styles.input} placeholder="Introduction à One Health" />
          </div>

          {/* Title EN */}
          <div>
            <label style={styles.label}>Titre (Anglais)</label>
            <input type="text" value={form.title_en} onChange={e => setForm({ ...form, title_en: e.target.value })}
              style={styles.input} placeholder="Introduction to One Health" />
          </div>

          {/* Short Description */}
          <div>
            <label style={styles.label}>Description courte</label>
            <textarea value={form.short_description_fr} onChange={e => setForm({ ...form, short_description_fr: e.target.value })}
              style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
              placeholder="Une brève description du cours..." />
          </div>

          {/* Row: Level, Duration, Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={styles.label}>Niveau</label>
              <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} style={styles.select}>
                <option value="beginner">Débutant</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="advanced">Avancé</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Durée (heures)</label>
              <input type="number" value={form.duration_hours} onChange={e => setForm({ ...form, duration_hours: parseInt(e.target.value) || 0 })}
                style={styles.input} min="0" />
            </div>
            <div>
              <label style={styles.label}>Catégorie</label>
              <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} style={styles.select}>
                <option value="">-- Sélectionner --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name_fr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: Status, Featured */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={styles.label}>Statut</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={styles.select}>
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', paddingTop: '28px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} />
                <span style={{ fontSize: '14px' }}>Mettre en vedette</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button onClick={() => setShowCourseModal(false)} style={styles.btnSecondary}>Annuler</button>
            <button onClick={() => handleSaveCourse(form)} style={styles.btnPrimary} disabled={!form.title_fr}>
              {editingCourse ? 'Enregistrer' : 'Créer le cours'}
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  // ============ MODULE MODAL ============
  const ModuleModal = () => {
    const [form, setForm] = useState({
      title_fr: editingModule?.title_fr || '',
      title_en: editingModule?.title_en || '',
      description_fr: editingModule?.description_fr || '',
      duration_minutes: editingModule?.duration_minutes || 0,
      status: editingModule?.status || 'draft'
    });

    return (
      <Modal isOpen={showModuleModal} onClose={() => setShowModuleModal(false)} title={editingModule ? 'Modifier le Module' : 'Nouveau Module'} isDark={isDark} width="550px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={styles.label}>Titre (Français) *</label>
            <input type="text" value={form.title_fr} onChange={e => setForm({ ...form, title_fr: e.target.value })}
              style={styles.input} placeholder="Module 1: Introduction" />
          </div>
          <div>
            <label style={styles.label}>Titre (Anglais)</label>
            <input type="text" value={form.title_en} onChange={e => setForm({ ...form, title_en: e.target.value })}
              style={styles.input} placeholder="Module 1: Introduction" />
          </div>
          <div>
            <label style={styles.label}>Description</label>
            <textarea value={form.description_fr} onChange={e => setForm({ ...form, description_fr: e.target.value })}
              style={{ ...styles.input, minHeight: '80px' }} placeholder="Description du module..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={styles.label}>Durée (minutes)</label>
              <input type="number" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })}
                style={styles.input} min="0" />
            </div>
            <div>
              <label style={styles.label}>Statut</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={styles.select}>
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button onClick={() => setShowModuleModal(false)} style={styles.btnSecondary}>Annuler</button>
            <button onClick={() => handleSaveModule(form)} style={styles.btnPrimary} disabled={!form.title_fr}>
              {editingModule ? 'Enregistrer' : 'Créer le module'}
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  // ============ LESSON MODAL ============
  const LessonModal = () => {
    const [form, setForm] = useState({
      title_fr: editingLesson?.title_fr || '',
      title_en: editingLesson?.title_en || '',
      content_type: editingLesson?.content_type || 'text',
      content_fr: editingLesson?.content_fr || '',
      video_url: editingLesson?.video_url || '',
      pdf_url: editingLesson?.pdf_url || '',
      duration_minutes: editingLesson?.duration_minutes || 0,
      is_preview: editingLesson?.is_preview || false,
      status: editingLesson?.status || 'draft'
    });

    const [uploading, setUploading] = useState(false);

    const handleVideoUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await fetch('http://localhost:5000/api/upload/elearning/video', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const res = await response.json();
        if (res.success) {
          setForm(prev => ({ ...prev, video_url: res.data.url }));
        }
      } catch (err) {
        console.error('Video upload error:', err);
      }
      setUploading(false);
    };

    const handlePdfUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await fetch('http://localhost:5000/api/upload/elearning/pdf', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const res = await response.json();
        if (res.success) {
          setForm(prev => ({ ...prev, pdf_url: res.data.url }));
        }
      } catch (err) {
        console.error('PDF upload error:', err);
      }
      setUploading(false);
    };

    return (
      <Modal isOpen={showLessonModal} onClose={() => setShowLessonModal(false)} title={editingLesson ? 'Modifier la Leçon' : 'Nouvelle Leçon'} isDark={isDark} width="650px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={styles.label}>Titre (Français) *</label>
            <input type="text" value={form.title_fr} onChange={e => setForm({ ...form, title_fr: e.target.value })}
              style={styles.input} placeholder="Leçon 1: Introduction" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={styles.label}>Type de contenu</label>
              <select value={form.content_type} onChange={e => setForm({ ...form, content_type: e.target.value })} style={styles.select}>
                <option value="text">Texte</option>
                <option value="video">Vidéo</option>
                <option value="pdf">PDF</option>
                <option value="mixed">Mixte</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Durée (minutes)</label>
              <input type="number" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })}
                style={styles.input} min="0" />
            </div>
          </div>

          {/* Video Upload */}
          {(form.content_type === 'video' || form.content_type === 'mixed') && (
            <div>
              <label style={styles.label}>Vidéo</label>
              {form.video_url ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: isDark ? '#0f172a' : '#f0fdf4', borderRadius: '10px' }}>
                  <Play size={20} color={colors.success} />
                  <span style={{ flex: 1, fontSize: '13px' }}>{form.video_url}</span>
                  <button onClick={() => setForm({ ...form, video_url: '' })} style={{ ...styles.btnIcon, width: '28px', height: '28px' }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div style={{
                  padding: '24px', borderRadius: '10px', border: `2px dashed ${isDark ? '#334155' : '#e2e8f0'}`,
                  textAlign: 'center', cursor: 'pointer'
                }} onClick={() => document.getElementById('lesson-video-input').click()}>
                  <Play size={28} color={isDark ? '#475569' : '#94a3b8'} />
                  <p style={{ margin: '8px 0 0', fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>
                    {uploading ? 'Upload en cours...' : 'Cliquer pour uploader une vidéo (max 500MB)'}
                  </p>
                </div>
              )}
              <input type="file" id="lesson-video-input" accept="video/*" onChange={handleVideoUpload} style={{ display: 'none' }} />
            </div>
          )}

          {/* PDF Upload */}
          {(form.content_type === 'pdf' || form.content_type === 'mixed') && (
            <div>
              <label style={styles.label}>Document PDF</label>
              {form.pdf_url ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: isDark ? '#0f172a' : '#fef3c7', borderRadius: '10px' }}>
                  <FileText size={20} color={colors.warning} />
                  <span style={{ flex: 1, fontSize: '13px' }}>{form.pdf_url}</span>
                  <button onClick={() => setForm({ ...form, pdf_url: '' })} style={{ ...styles.btnIcon, width: '28px', height: '28px' }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div style={{
                  padding: '24px', borderRadius: '10px', border: `2px dashed ${isDark ? '#334155' : '#e2e8f0'}`,
                  textAlign: 'center', cursor: 'pointer'
                }} onClick={() => document.getElementById('lesson-pdf-input').click()}>
                  <FileText size={28} color={isDark ? '#475569' : '#94a3b8'} />
                  <p style={{ margin: '8px 0 0', fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>
                    {uploading ? 'Upload en cours...' : 'Cliquer pour uploader un PDF (max 50MB)'}
                  </p>
                </div>
              )}
              <input type="file" id="lesson-pdf-input" accept="application/pdf" onChange={handlePdfUpload} style={{ display: 'none' }} />
            </div>
          )}

          {/* Text Content */}
          {(form.content_type === 'text' || form.content_type === 'mixed') && (
            <div>
              <label style={styles.label}>Contenu texte</label>
              <textarea value={form.content_fr} onChange={e => setForm({ ...form, content_fr: e.target.value })}
                style={{ ...styles.input, minHeight: '150px' }} placeholder="Contenu de la leçon..." />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={styles.label}>Statut</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={styles.select}>
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', paddingTop: '28px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_preview} onChange={e => setForm({ ...form, is_preview: e.target.checked })} />
                <span style={{ fontSize: '14px' }}>Aperçu gratuit</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button onClick={() => setShowLessonModal(false)} style={styles.btnSecondary}>Annuler</button>
            <button onClick={() => handleSaveLesson(form)} style={styles.btnPrimary} disabled={!form.title_fr}>
              {editingLesson ? 'Enregistrer' : 'Créer la leçon'}
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  // ============ PATH MODAL ============
  const PathModal = () => {
    const [form, setForm] = useState({
      title_fr: editingPath?.title_fr || '',
      title_en: editingPath?.title_en || '',
      description_fr: editingPath?.description_fr || '',
      short_description_fr: editingPath?.short_description_fr || '',
      level: editingPath?.level || 'beginner',
      duration_hours: editingPath?.duration_hours || 0,
      min_passing_score: editingPath?.min_passing_score || 70,
      certificate_enabled: editingPath?.certificate_enabled !== false,
      status: editingPath?.status || 'draft'
    });

    return (
      <Modal isOpen={showPathModal} onClose={() => setShowPathModal(false)} title={editingPath ? 'Modifier le Parcours' : 'Nouveau Parcours'} isDark={isDark} width="600px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={styles.label}>Titre (Français) *</label>
            <input type="text" value={form.title_fr} onChange={e => setForm({ ...form, title_fr: e.target.value })}
              style={styles.input} placeholder="One Health Leadership" />
          </div>
          <div>
            <label style={styles.label}>Titre (Anglais)</label>
            <input type="text" value={form.title_en} onChange={e => setForm({ ...form, title_en: e.target.value })}
              style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Description courte</label>
            <textarea value={form.short_description_fr} onChange={e => setForm({ ...form, short_description_fr: e.target.value })}
              style={{ ...styles.input, minHeight: '80px' }} placeholder="Description du parcours..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={styles.label}>Niveau</label>
              <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} style={styles.select}>
                <option value="beginner">Débutant</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="advanced">Avancé</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Durée (heures)</label>
              <input type="number" value={form.duration_hours} onChange={e => setForm({ ...form, duration_hours: parseInt(e.target.value) || 0 })}
                style={styles.input} min="0" />
            </div>
            <div>
              <label style={styles.label}>Score min. (%)</label>
              <input type="number" value={form.min_passing_score} onChange={e => setForm({ ...form, min_passing_score: parseInt(e.target.value) || 70 })}
                style={styles.input} min="0" max="100" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={styles.label}>Statut</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={styles.select}>
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', paddingTop: '28px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.certificate_enabled} onChange={e => setForm({ ...form, certificate_enabled: e.target.checked })} />
                <span style={{ fontSize: '14px' }}>Certificat activé</span>
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button onClick={() => setShowPathModal(false)} style={styles.btnSecondary}>Annuler</button>
            <button onClick={() => handleSavePath(form)} style={styles.btnPrimary} disabled={!form.title_fr}>
              {editingPath ? 'Enregistrer' : 'Créer le parcours'}
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  // ============ QUESTION MODAL ============
  const QuestionModal = () => {
    const [form, setForm] = useState({
      question_text_fr: editingQuestion?.question_text_fr || '',
      question_text_en: editingQuestion?.question_text_en || '',
      question_type: editingQuestion?.question_type || 'mcq',
      explanation_fr: editingQuestion?.explanation_fr || '',
      explanation_en: editingQuestion?.explanation_en || '',
      options: editingQuestion?.options || [
        { text_fr: '', text_en: '' },
        { text_fr: '', text_en: '' },
        { text_fr: '', text_en: '' },
        { text_fr: '', text_en: '' }
      ],
      correct_answer: editingQuestion?.correct_answer ?? 0,
      points: editingQuestion?.points || 1,
      difficulty: editingQuestion?.difficulty || 'medium',
      is_active: editingQuestion?.is_active !== false
    });

    const handleOptionChange = (index, field, value) => {
      const newOptions = [...form.options];
      newOptions[index] = { ...newOptions[index], [field]: value };
      setForm({ ...form, options: newOptions });
    };

    const addOption = () => {
      setForm({ ...form, options: [...form.options, { text_fr: '', text_en: '' }] });
    };

    const removeOption = (index) => {
      const newOptions = form.options.filter((_, i) => i !== index);
      setForm({
        ...form,
        options: newOptions,
        correct_answer: form.correct_answer >= newOptions.length ? 0 : form.correct_answer
      });
    };

    const toggleMultipleAnswer = (index) => {
      if (form.question_type !== 'multiple_select') return;
      const currentAnswers = Array.isArray(form.correct_answer) ? form.correct_answer : [];
      if (currentAnswers.includes(index)) {
        setForm({ ...form, correct_answer: currentAnswers.filter(i => i !== index) });
      } else {
        setForm({ ...form, correct_answer: [...currentAnswers, index] });
      }
    };

    return (
      <Modal isOpen={showQuestionModal} onClose={() => setShowQuestionModal(false)} title={editingQuestion ? 'Modifier la Question' : 'Nouvelle Question'} isDark={isDark} width="700px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '70vh', overflowY: 'auto', padding: '4px' }}>
          {/* Question Type */}
          <div>
            <label style={styles.label}>Type de question *</label>
            <select
              value={form.question_type}
              onChange={e => {
                const type = e.target.value;
                setForm({
                  ...form,
                  question_type: type,
                  correct_answer: type === 'multiple_select' ? [] : type === 'true_false' ? true : 0
                });
              }}
              style={styles.select}
            >
              <option value="mcq">QCM (choix unique)</option>
              <option value="multiple_select">Sélection multiple</option>
              <option value="true_false">Vrai/Faux</option>
              <option value="short_answer">Réponse courte</option>
            </select>
          </div>

          {/* Question Text */}
          <div>
            <label style={styles.label}>Question (Français) *</label>
            <textarea
              value={form.question_text_fr}
              onChange={e => setForm({ ...form, question_text_fr: e.target.value })}
              style={{ ...styles.input, minHeight: '100px' }}
              placeholder="Entrez la question..."
            />
          </div>
          <div>
            <label style={styles.label}>Question (Anglais)</label>
            <textarea
              value={form.question_text_en}
              onChange={e => setForm({ ...form, question_text_en: e.target.value })}
              style={{ ...styles.input, minHeight: '80px' }}
              placeholder="Enter question in English..."
            />
          </div>

          {/* Options for MCQ/Multiple Select */}
          {(form.question_type === 'mcq' || form.question_type === 'multiple_select') && (
            <div>
              <label style={styles.label}>
                Options {form.question_type === 'multiple_select' ? '(sélectionnez les bonnes réponses)' : '(sélectionnez la bonne réponse)'}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {form.options.map((option, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {form.question_type === 'mcq' ? (
                      <input
                        type="radio"
                        name="correct_answer"
                        checked={form.correct_answer === idx}
                        onChange={() => setForm({ ...form, correct_answer: idx })}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={Array.isArray(form.correct_answer) && form.correct_answer.includes(idx)}
                        onChange={() => toggleMultipleAnswer(idx)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                    )}
                    <input
                      type="text"
                      value={option.text_fr || ''}
                      onChange={e => handleOptionChange(idx, 'text_fr', e.target.value)}
                      style={{ ...styles.input, flex: 1 }}
                      placeholder={`Option ${idx + 1} (FR)`}
                    />
                    <input
                      type="text"
                      value={option.text_en || ''}
                      onChange={e => handleOptionChange(idx, 'text_en', e.target.value)}
                      style={{ ...styles.input, flex: 1 }}
                      placeholder={`Option ${idx + 1} (EN)`}
                    />
                    {form.options.length > 2 && (
                      <button onClick={() => removeOption(idx)} style={{ ...styles.btnIcon, background: `${colors.error}15`, color: colors.error }}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {form.options.length < 6 && (
                <button onClick={addOption} style={{ ...styles.btnSecondary, marginTop: '10px', fontSize: '13px' }}>
                  <Plus size={14} /> Ajouter une option
                </button>
              )}
            </div>
          )}

          {/* True/False */}
          {form.question_type === 'true_false' && (
            <div>
              <label style={styles.label}>Bonne réponse</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px 20px', borderRadius: '10px', background: form.correct_answer === true ? `${colors.success}20` : (isDark ? '#1e293b' : '#f1f5f9'), border: form.correct_answer === true ? `2px solid ${colors.success}` : '2px solid transparent' }}>
                  <input type="radio" name="tf_answer" checked={form.correct_answer === true} onChange={() => setForm({ ...form, correct_answer: true })} style={{ display: 'none' }} />
                  <CheckCircle2 size={20} color={form.correct_answer === true ? colors.success : '#94a3b8'} />
                  <span style={{ fontWeight: '600' }}>Vrai</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px 20px', borderRadius: '10px', background: form.correct_answer === false ? `${colors.error}20` : (isDark ? '#1e293b' : '#f1f5f9'), border: form.correct_answer === false ? `2px solid ${colors.error}` : '2px solid transparent' }}>
                  <input type="radio" name="tf_answer" checked={form.correct_answer === false} onChange={() => setForm({ ...form, correct_answer: false })} style={{ display: 'none' }} />
                  <XCircle size={20} color={form.correct_answer === false ? colors.error : '#94a3b8'} />
                  <span style={{ fontWeight: '600' }}>Faux</span>
                </label>
              </div>
            </div>
          )}

          {/* Short Answer */}
          {form.question_type === 'short_answer' && (
            <div>
              <label style={styles.label}>Réponse(s) acceptée(s) (séparées par une virgule)</label>
              <input
                type="text"
                value={Array.isArray(form.correct_answer) ? form.correct_answer.join(', ') : form.correct_answer}
                onChange={e => setForm({ ...form, correct_answer: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                style={styles.input}
                placeholder="réponse1, réponse2, ..."
              />
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                La comparaison est insensible à la casse
              </p>
            </div>
          )}

          {/* Explanation */}
          <div>
            <label style={styles.label}>Explication (FR)</label>
            <textarea
              value={form.explanation_fr}
              onChange={e => setForm({ ...form, explanation_fr: e.target.value })}
              style={{ ...styles.input, minHeight: '80px' }}
              placeholder="Explication de la bonne réponse..."
            />
          </div>

          {/* Points & Difficulty */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={styles.label}>Points</label>
              <input
                type="number"
                value={form.points}
                onChange={e => setForm({ ...form, points: parseInt(e.target.value) || 1 })}
                style={styles.input}
                min="1"
                max="10"
              />
            </div>
            <div>
              <label style={styles.label}>Difficulté</label>
              <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} style={styles.select}>
                <option value="easy">Facile</option>
                <option value="medium">Moyen</option>
                <option value="hard">Difficile</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', paddingTop: '28px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                <span style={{ fontSize: '14px' }}>Active</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button onClick={() => setShowQuestionModal(false)} style={styles.btnSecondary}>Annuler</button>
            <button onClick={() => handleSaveQuestion(form)} style={styles.btnPrimary} disabled={!form.question_text_fr}>
              {editingQuestion ? 'Enregistrer' : 'Créer la question'}
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  // ============ QUIZ MODAL ============
  const QuizModal = () => {
    const [form, setForm] = useState({
      title_fr: editingQuiz?.title_fr || '',
      title_en: editingQuiz?.title_en || '',
      description_fr: editingQuiz?.description_fr || '',
      quiz_type: editingQuiz?.quiz_type || 'graded',
      time_limit_minutes: editingQuiz?.time_limit_minutes || null,
      passing_score: editingQuiz?.passing_score || 70,
      max_attempts: editingQuiz?.max_attempts || 3,
      shuffle_questions: editingQuiz?.shuffle_questions !== false,
      shuffle_options: editingQuiz?.shuffle_options !== false,
      show_correct_answers: editingQuiz?.show_correct_answers !== false,
      show_explanation: editingQuiz?.show_explanation !== false,
      allow_retake: editingQuiz?.allow_retake !== false,
      status: editingQuiz?.status || 'draft'
    });

    return (
      <Modal isOpen={showQuizModal} onClose={() => setShowQuizModal(false)} title={editingQuiz ? 'Modifier le Quiz' : 'Nouveau Quiz'} isDark={isDark} width="650px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '70vh', overflowY: 'auto', padding: '4px' }}>
          {/* Title */}
          <div>
            <label style={styles.label}>Titre (Français) *</label>
            <input
              type="text"
              value={form.title_fr}
              onChange={e => setForm({ ...form, title_fr: e.target.value })}
              style={styles.input}
              placeholder="Quiz Module 1"
            />
          </div>
          <div>
            <label style={styles.label}>Titre (Anglais)</label>
            <input
              type="text"
              value={form.title_en}
              onChange={e => setForm({ ...form, title_en: e.target.value })}
              style={styles.input}
              placeholder="Module 1 Quiz"
            />
          </div>

          {/* Description */}
          <div>
            <label style={styles.label}>Description</label>
            <textarea
              value={form.description_fr}
              onChange={e => setForm({ ...form, description_fr: e.target.value })}
              style={{ ...styles.input, minHeight: '80px' }}
              placeholder="Description du quiz..."
            />
          </div>

          {/* Type & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={styles.label}>Type de quiz</label>
              <select value={form.quiz_type} onChange={e => setForm({ ...form, quiz_type: e.target.value })} style={styles.select}>
                <option value="practice">Pratique (non noté)</option>
                <option value="graded">Noté</option>
                <option value="final_exam">Examen Final</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Statut</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={styles.select}>
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </select>
            </div>
          </div>

          {/* Scores & Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={styles.label}>Seuil de réussite (%)</label>
              <input
                type="number"
                value={form.passing_score}
                onChange={e => setForm({ ...form, passing_score: parseInt(e.target.value) || 70 })}
                style={styles.input}
                min="0"
                max="100"
              />
            </div>
            <div>
              <label style={styles.label}>Limite de temps (min)</label>
              <input
                type="number"
                value={form.time_limit_minutes || ''}
                onChange={e => setForm({ ...form, time_limit_minutes: e.target.value ? parseInt(e.target.value) : null })}
                style={styles.input}
                min="1"
                placeholder="∞"
              />
            </div>
            <div>
              <label style={styles.label}>Tentatives max</label>
              <input
                type="number"
                value={form.max_attempts}
                onChange={e => setForm({ ...form, max_attempts: parseInt(e.target.value) || 1 })}
                style={styles.input}
                min="1"
                max="10"
              />
            </div>
          </div>

          {/* Options */}
          <div>
            <label style={styles.label}>Options</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px', borderRadius: '10px', background: isDark ? '#1e293b' : '#f8fafc' }}>
                <input type="checkbox" checked={form.shuffle_questions} onChange={e => setForm({ ...form, shuffle_questions: e.target.checked })} />
                <span style={{ fontSize: '13px' }}>Mélanger les questions</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px', borderRadius: '10px', background: isDark ? '#1e293b' : '#f8fafc' }}>
                <input type="checkbox" checked={form.shuffle_options} onChange={e => setForm({ ...form, shuffle_options: e.target.checked })} />
                <span style={{ fontSize: '13px' }}>Mélanger les options</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px', borderRadius: '10px', background: isDark ? '#1e293b' : '#f8fafc' }}>
                <input type="checkbox" checked={form.show_correct_answers} onChange={e => setForm({ ...form, show_correct_answers: e.target.checked })} />
                <span style={{ fontSize: '13px' }}>Afficher les bonnes réponses</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px', borderRadius: '10px', background: isDark ? '#1e293b' : '#f8fafc' }}>
                <input type="checkbox" checked={form.show_explanation} onChange={e => setForm({ ...form, show_explanation: e.target.checked })} />
                <span style={{ fontSize: '13px' }}>Afficher les explications</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px', borderRadius: '10px', background: isDark ? '#1e293b' : '#f8fafc' }}>
                <input type="checkbox" checked={form.allow_retake} onChange={e => setForm({ ...form, allow_retake: e.target.checked })} />
                <span style={{ fontSize: '13px' }}>Permettre les reprises</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button onClick={() => setShowQuizModal(false)} style={styles.btnSecondary}>Annuler</button>
            <button onClick={() => handleSaveQuiz(form)} style={styles.btnPrimary} disabled={!form.title_fr}>
              {editingQuiz ? 'Enregistrer' : 'Créer le quiz'}
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  // ============ QUIZ QUESTIONS MODAL ============
  const QuizQuestionsModal = () => {
    const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    // Get questions already in quiz
    const quizQuestionIds = selectedQuiz?.questions?.map(q => q.id) || [];

    // Filter available questions
    const availableQuestions = questions.filter(q => {
      if (!q.is_active) return false;
      if (quizQuestionIds.includes(q.id)) return false;
      if (searchQuery && !q.question_text_fr?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (typeFilter !== 'all' && q.question_type !== typeFilter) return false;
      return true;
    });

    const toggleQuestion = (questionId) => {
      if (selectedQuestionIds.includes(questionId)) {
        setSelectedQuestionIds(selectedQuestionIds.filter(id => id !== questionId));
      } else {
        setSelectedQuestionIds([...selectedQuestionIds, questionId]);
      }
    };

    const handleAdd = () => {
      if (selectedQuestionIds.length > 0 && selectedQuiz) {
        handleAddQuizQuestions(selectedQuiz.id, selectedQuestionIds);
        setSelectedQuestionIds([]);
      }
    };

    return (
      <Modal isOpen={showQuizQuestionsModal} onClose={() => { setShowQuizQuestionsModal(false); setSelectedQuiz(null); }} title={`Gérer les questions - ${selectedQuiz?.title_fr || ''}`} isDark={isDark} width="900px">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxHeight: '70vh' }}>
          {/* Left: Questions in Quiz */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: colors.primary }}>
              Questions dans le quiz ({selectedQuiz?.questions?.length || 0})
            </h4>
            <div style={{ flex: 1, overflowY: 'auto', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: '12px', padding: '12px' }}>
              {selectedQuiz?.questions?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedQuiz.questions.map((q, idx) => (
                    <div key={q.id} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px',
                      borderRadius: '10px', background: isDark ? '#1e293b' : '#f8fafc'
                    }}>
                      <span style={{
                        width: '24px', height: '24px', borderRadius: '6px', background: colors.primary,
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: '700', flexShrink: 0
                      }}>
                        {idx + 1}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '500' }}>
                          {q.question_text_fr?.substring(0, 80)}...
                        </p>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {getQuestionTypeBadge(q.question_type)}
                          <span style={{ fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>
                            {q.points} pt{q.points > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveQuizQuestion(selectedQuiz.id, q.id)}
                        style={{ ...styles.btnIcon, width: '28px', height: '28px', background: `${colors.error}15`, color: colors.error }}
                        title="Retirer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: isDark ? '#64748b' : '#94a3b8' }}>
                  <FileQuestion size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '13px' }}>Aucune question dans ce quiz</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Available Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: colors.success }}>
              Banque de questions ({availableQuestions.length})
            </h4>
            {/* Search & Filter */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#64748b' : '#94a3b8' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  style={{ ...styles.input, paddingLeft: '36px', fontSize: '13px' }}
                />
              </div>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ ...styles.select, width: '140px', fontSize: '13px' }}>
                <option value="all">Tous types</option>
                <option value="mcq">QCM</option>
                <option value="multiple_select">Multiple</option>
                <option value="true_false">Vrai/Faux</option>
                <option value="short_answer">Courte</option>
              </select>
            </div>
            {/* Questions List */}
            <div style={{ flex: 1, overflowY: 'auto', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: '12px', padding: '12px' }}>
              {availableQuestions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {availableQuestions.slice(0, 50).map(q => (
                    <label
                      key={q.id}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px',
                        borderRadius: '10px', cursor: 'pointer',
                        background: selectedQuestionIds.includes(q.id)
                          ? `${colors.success}15`
                          : (isDark ? '#1e293b' : '#f8fafc'),
                        border: `2px solid ${selectedQuestionIds.includes(q.id) ? colors.success : 'transparent'}`,
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedQuestionIds.includes(q.id)}
                        onChange={() => toggleQuestion(q.id)}
                        style={{ width: '18px', height: '18px', marginTop: '2px' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '500' }}>
                          {q.question_text_fr?.substring(0, 80)}...
                        </p>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {getQuestionTypeBadge(q.question_type)}
                          {getDifficultyBadge(q.difficulty)}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: isDark ? '#64748b' : '#94a3b8' }}>
                  <p style={{ margin: 0, fontSize: '13px' }}>Aucune question disponible</p>
                </div>
              )}
            </div>
            {/* Add Button */}
            {selectedQuestionIds.length > 0 && (
              <button onClick={handleAdd} style={{ ...styles.btnPrimary, marginTop: '12px', background: colors.success }}>
                <Plus size={18} /> Ajouter {selectedQuestionIds.length} question{selectedQuestionIds.length > 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>
      </Modal>
    );
  };

  // ============ CATEGORY MODAL ============
  const CategoryModal = () => {
    const [form, setForm] = useState({
      name_fr: editingCategory?.name_fr || '',
      name_en: editingCategory?.name_en || '',
      description_fr: editingCategory?.description_fr || '',
      color: editingCategory?.color || '#2196F3',
      icon: editingCategory?.icon || ''
    });

    return (
      <Modal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)} title={editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'} isDark={isDark} width="500px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={styles.label}>Nom (Français) *</label>
            <input type="text" value={form.name_fr} onChange={e => setForm({ ...form, name_fr: e.target.value })}
              style={styles.input} placeholder="Santé Humaine" />
          </div>
          <div>
            <label style={styles.label}>Nom (Anglais)</label>
            <input type="text" value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })}
              style={styles.input} placeholder="Human Health" />
          </div>
          <div>
            <label style={styles.label}>Description</label>
            <textarea value={form.description_fr} onChange={e => setForm({ ...form, description_fr: e.target.value })}
              style={{ ...styles.input, minHeight: '80px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={styles.label}>Couleur</label>
              <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                style={{ ...styles.input, padding: '4px', height: '44px' }} />
            </div>
            <div>
              <label style={styles.label}>Icône (emoji)</label>
              <input type="text" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}
                style={styles.input} placeholder="🏥" maxLength={2} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button onClick={() => setShowCategoryModal(false)} style={styles.btnSecondary}>Annuler</button>
            <button onClick={() => handleSaveCategory(form)} style={styles.btnPrimary} disabled={!form.name_fr}>
              {editingCategory ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  // ============ MAIN RENDER ============
  return (
    <div>
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setConfirmDialog(null)}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          isDark={isDark}
          type={confirmDialog.type}
        />
      )}

      {/* Modals */}
      {showCourseModal && <CourseModal />}
      {showModuleModal && <ModuleModal />}
      {showLessonModal && <LessonModal />}
      {showPathModal && <PathModal />}
      {showCategoryModal && <CategoryModal />}
      {showQuestionModal && <QuestionModal />}
      {showQuizModal && <QuizModal />}
      {showQuizQuestionsModal && <QuizQuestionsModal />}

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.primary} 0%, #1976D2 100%)`,
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '24px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <GraduationCap size={32} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800' }}>OH E-LEARNING</h1>
            <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '15px' }}>
              Plateforme de Formation One Health
            </p>
          </div>
        </div>
        <p style={{ margin: 0, opacity: 0.85, fontSize: '14px', maxWidth: '600px' }}>
          Gérez les cours, modules de formation, parcours diplômants et certifications
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '10px',
              border: 'none', cursor: 'pointer',
              background: activeTab === tab.id ? colors.primary : (isDark ? '#1e293b' : '#f1f5f9'),
              color: activeTab === tab.id ? 'white' : (isDark ? '#e2e8f0' : '#475569'),
              fontWeight: activeTab === tab.id ? '600' : '500',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'courses' && renderCourses()}
      {activeTab === 'curriculum' && renderCurriculum()}
      {activeTab === 'paths' && renderPaths()}
      {activeTab === 'questions' && renderQuestions()}
      {activeTab === 'quizzes' && renderQuizzes()}
      {activeTab === 'certificates' && renderCertificates()}
      {activeTab === 'categories' && renderCategories()}
      {activeTab === 'enrollments' && renderEnrollments()}

      {/* Path Courses Modal */}
      {showPathCoursesModal && selectedPath && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: colors.text }}>Cours du parcours: {selectedPath.title_fr}</h3>
              <button onClick={() => { setShowPathCoursesModal(false); setSelectedPath(null); }} style={styles.btnSecondary}>
                <X size={18} />
              </button>
            </div>

            {/* Current courses in path */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: colors.text, marginBottom: '10px' }}>Cours inclus ({selectedPath.courses?.length || 0})</h4>
              {selectedPath.courses?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedPath.courses.map((course, idx) => (
                    <div key={course.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: isDark ? colors.surfaceHover : colors.background,
                      borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: colors.textSecondary, fontWeight: '500' }}>{idx + 1}.</span>
                        <span style={{ color: colors.text }}>{course.title_fr}</span>
                        {course.is_required && (
                          <span style={{ padding: '2px 8px', background: colors.primary + '20', color: colors.primary, borderRadius: '4px', fontSize: '11px' }}>
                            Obligatoire
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemovePathCourse(selectedPath.id, course.id)}
                        style={{ ...styles.btnSecondary, padding: '6px 12px' }}
                      >
                        <X size={14} /> Retirer
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: colors.textSecondary }}>Aucun cours dans ce parcours</p>
              )}
            </div>

            {/* Add courses */}
            <div>
              <h4 style={{ color: colors.text, marginBottom: '10px' }}>Ajouter des cours</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {courses.filter(c => !selectedPath.courses?.find(pc => pc.id === c.id) && c.status === 'published').map(course => (
                  <div key={course.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    background: isDark ? colors.surface : colors.background,
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`
                  }}>
                    <span style={{ color: colors.text }}>{course.title_fr}</span>
                    <button
                      onClick={() => handleAddPathCourse(selectedPath.id, course.id)}
                      style={{ ...styles.btnPrimary, padding: '6px 12px' }}
                    >
                      <Plus size={14} /> Ajouter
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============== PAGE PROFIL ==============
const ProfilePage = ({ isDark, token, user, setUser }) => {
  const styles = createStyles(isDark);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const fileInputRef = useRef(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.bio || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    const res = await api.put('/auth/profile', profileForm, token);
    if (res.success) {
      const updatedUser = { ...user, ...profileForm };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      setToast({ message: 'Profil mis à jour avec succès', type: 'success' });
    } else {
      setToast({ message: res.message || 'Erreur lors de la mise à jour', type: 'error' });
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setToast({ message: 'Veuillez remplir tous les champs', type: 'error' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast({ message: 'Les mots de passe ne correspondent pas', type: 'error' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setToast({ message: 'Le mot de passe doit contenir au moins 6 caractères', type: 'error' });
      return;
    }

    setLoading(true);
    const res = await api.put('/auth/password', {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    }, token);

    if (res.success) {
      setToast({ message: 'Mot de passe modifié avec succès', type: 'success' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setToast({ message: res.message || 'Mot de passe actuel incorrect', type: 'error' });
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Veuillez sélectionner une image', type: 'error' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'L\'image ne doit pas dépasser 5 Mo', type: 'error' });
      return;
    }

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('files', file);

    const uploadRes = await api.upload('/media/upload', formData, token);
    if (uploadRes.success && uploadRes.data?.length > 0) {
      const avatarUrl = uploadRes.data[0].url;

      // Update profile with new avatar
      const profileRes = await api.put('/auth/profile', {
        ...profileForm,
        avatar: avatarUrl
      }, token);

      if (profileRes.success) {
        const updatedUser = { ...user, ...profileForm, avatar: avatarUrl };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        setToast({ message: 'Photo de profil mise à jour', type: 'success' });
      }
    } else {
      setToast({ message: 'Erreur lors de l\'upload', type: 'error' });
    }
    setUploadingAvatar(false);
  };

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    const res = await api.put('/auth/profile', { ...profileForm, avatar: null }, token);
    if (res.success) {
      const updatedUser = { ...user, avatar: null };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      setToast({ message: 'Photo de profil supprimée', type: 'success' });
    }
    setUploadingAvatar(false);
  };

  const roleLabels = {
    admin: 'Administrateur',
    editor: 'Éditeur',
    author: 'Auteur',
    contributor: 'Contributeur',
    subscriber: 'Abonné'
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
        {/* Sidebar - Profile Card */}
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
              <div style={{
                width: '140px', height: '140px', borderRadius: '50%',
                background: user?.avatar
                  ? `url(http://localhost:5000${user.avatar}) center/cover`
                  : `linear-gradient(135deg, ${colors.cameroonGreen} 0%, ${colors.teal} 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '48px', fontWeight: '700',
                boxShadow: '0 8px 32px rgba(0,122,51,0.3)',
                border: `4px solid ${isDark ? '#1e293b' : '#ffffff'}`,
                margin: '0 auto'
              }}>
                {!user?.avatar && (user?.first_name?.[0] || user?.username?.[0] || 'U')}
              </div>

              {/* Upload button overlay */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                style={{
                  position: 'absolute', bottom: '8px', right: '8px',
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: colors.cameroonGreen, border: `3px solid ${isDark ? '#1e293b' : '#ffffff'}`,
                  color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s ease'
                }}
                title="Changer la photo"
              >
                {uploadingAvatar ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Camera size={18} />}
              </button>
            </div>

            {/* User info */}
            <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '700' }}>
              {user?.first_name && user?.last_name
                ? `${user.first_name} ${user.last_name}`
                : user?.username}
            </h2>
            <p style={{ margin: '0 0 12px', fontSize: '14px', color: isDark ? '#64748b' : '#94a3b8' }}>
              @{user?.username}
            </p>
            <span style={{
              display: 'inline-block', padding: '6px 16px', borderRadius: '20px',
              background: `${colors.cameroonGreen}15`, color: colors.cameroonGreen,
              fontSize: '13px', fontWeight: '600'
            }}>
              {roleLabels[user?.role] || user?.role}
            </span>

            {/* Remove avatar button */}
            {user?.avatar && (
              <button
                onClick={handleRemoveAvatar}
                disabled={uploadingAvatar}
                style={{
                  display: 'block', width: '100%', marginTop: '20px',
                  padding: '10px', borderRadius: '10px',
                  background: 'transparent', border: `1px solid ${colors.error}40`,
                  color: colors.error, fontSize: '13px', fontWeight: '500',
                  cursor: 'pointer', transition: 'all 0.2s ease'
                }}
              >
                <Trash2 size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Supprimer la photo
              </button>
            )}
          </div>

          {/* Stats */}
          <div style={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ textAlign: 'center', padding: '12px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px' }}>
                <p style={{ margin: 0, fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8', fontWeight: '500' }}>MEMBRE DEPUIS</p>
                <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '600' }}>
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : '-'}
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px' }}>
                <p style={{ margin: 0, fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8', fontWeight: '500' }}>EMAIL</p>
                <p style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: '500', wordBreak: 'break-all' }}>
                  {user?.email || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div>
          {/* Tabs */}
          <div style={styles.tabs}>
            <button style={styles.tab(activeTab === 'info')} onClick={() => setActiveTab('info')}>
              <User size={16} style={{ marginRight: '8px' }} /> Informations
            </button>
            <button style={styles.tab(activeTab === 'password')} onClick={() => setActiveTab('password')}>
              <Lock size={16} style={{ marginRight: '8px' }} /> Mot de passe
            </button>
          </div>

          {/* Info Tab */}
          {activeTab === 'info' && (
            <div style={styles.card}>
              <h3 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User size={20} color={colors.cameroonGreen} />
                Informations personnelles
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={styles.label}>Prénom</label>
                  <input
                    type="text"
                    value={profileForm.first_name}
                    onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })}
                    style={styles.input}
                    placeholder="Votre prénom"
                  />
                </div>
                <div>
                  <label style={styles.label}>Nom</label>
                  <input
                    type="text"
                    value={profileForm.last_name}
                    onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })}
                    style={styles.input}
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <label style={styles.label}>Nom d'utilisateur</label>
                <input
                  type="text"
                  value={user?.username || ''}
                  disabled
                  style={{ ...styles.input, opacity: 0.6, cursor: 'not-allowed' }}
                />
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                  Le nom d'utilisateur ne peut pas être modifié
                </p>
              </div>

              <div style={{ marginTop: '20px' }}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  style={{ ...styles.input, opacity: 0.6, cursor: 'not-allowed' }}
                />
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                  Contactez un administrateur pour modifier votre email
                </p>
              </div>

              <div style={{ marginTop: '20px' }}>
                <label style={styles.label}>Biographie</label>
                <textarea
                  value={profileForm.bio}
                  onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  style={{ ...styles.textarea, minHeight: '100px' }}
                  placeholder="Parlez-nous de vous..."
                />
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  style={styles.btnPrimary}
                  onClick={handleUpdateProfile}
                  disabled={loading}
                >
                  {loading ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div style={styles.card}>
              <h3 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Lock size={20} color={colors.cameroonGreen} />
                Changer le mot de passe
              </h3>

              <div style={{ maxWidth: '400px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={styles.label}>Mot de passe actuel</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      style={styles.input}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#64748b' : '#94a3b8'
                      }}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={styles.label}>Nouveau mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      style={styles.input}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#64748b' : '#94a3b8'
                      }}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                    Minimum 6 caractères
                  </p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={styles.label}>Confirmer le nouveau mot de passe</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    style={styles.input}
                    placeholder="••••••••"
                  />
                  {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p style={{ margin: '6px 0 0', fontSize: '12px', color: colors.error }}>
                      Les mots de passe ne correspondent pas
                    </p>
                  )}
                </div>

                <button
                  style={styles.btnPrimary}
                  onClick={handleChangePassword}
                  disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
                >
                  {loading ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Lock size={18} />}
                  Changer le mot de passe
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============== GESTION DES UTILISATEURS ==============
const UsersPage = ({ isDark, token, hasPermission = () => true }) => {
  const styles = createStyles(isDark);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showGroupsModal, setShowGroupsModal] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState([]);

  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'subscriber',
    status: 'active',
    bio: ''
  });

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    const [usersRes, groupsRes] = await Promise.all([
      api.get('/users?limit=100', token),
      api.get('/groups', token)
    ]);
    if (usersRes.success) setUsers(usersRes.data);
    if (groupsRes.success) setGroups(groupsRes.data);
    setLoading(false);
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        username: user.username,
        email: user.email,
        password: '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        role: user.role,
        status: user.status,
        bio: user.bio || ''
      });
    } else {
      setEditingUser(null);
      setUserForm({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'subscriber',
        status: 'active',
        bio: ''
      });
    }
    setShowModal(true);
  };

  const handleSaveUser = async () => {
    if (!userForm.username.trim() || !userForm.email.trim()) {
      setToast({ message: 'Nom d\'utilisateur et email requis', type: 'error' });
      return;
    }

    if (!editingUser && !userForm.password) {
      setToast({ message: 'Mot de passe requis pour un nouvel utilisateur', type: 'error' });
      return;
    }

    let res;
    const dataToSend = { ...userForm };
    if (editingUser && !userForm.password) {
      delete dataToSend.password;
    }

    if (editingUser) {
      res = await api.put(`/users/${editingUser.id}`, dataToSend, token);
    } else {
      res = await api.post('/users', dataToSend, token);
    }

    if (res.success) {
      setToast({ message: editingUser ? 'Utilisateur modifié' : 'Utilisateur créé', type: 'success' });
      setShowModal(false);
      fetchData();
    } else {
      setToast({ message: res.message || 'Erreur', type: 'error' });
    }
  };

  const handleDeleteUser = async (id) => {
    const res = await api.delete(`/users/${id}`, token);
    if (res.success) {
      setToast({ message: 'Utilisateur supprimé', type: 'success' });
      fetchData();
    } else {
      setToast({ message: res.message || 'Erreur', type: 'error' });
    }
    setShowDeleteConfirm(null);
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const res = await api.put(`/users/${user.id}`, { status: newStatus }, token);
    if (res.success) {
      setToast({ message: `Utilisateur ${newStatus === 'active' ? 'activé' : 'désactivé'}`, type: 'success' });
      fetchData();
    }
  };

  const handleOpenGroupsModal = async (user) => {
    const res = await api.get(`/groups/user/${user.id}`, token);
    if (res.success) {
      setSelectedGroups(res.data.map(g => g.id));
    }
    setShowGroupsModal(user);
  };

  const handleToggleGroup = (groupId) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSaveUserGroups = async () => {
    const res = await api.put(`/groups/user/${showGroupsModal.id}/groups`, { groups: selectedGroups }, token);
    if (res.success) {
      setToast({ message: 'Groupes mis à jour', type: 'success' });
      setShowGroupsModal(null);
      fetchData();
    } else {
      setToast({ message: res.message || 'Erreur', type: 'error' });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.first_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.last_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const roleLabels = {
    admin: { label: 'Administrateur', color: colors.error },
    editor: { label: 'Éditeur', color: colors.primary },
    author: { label: 'Auteur', color: colors.success },
    contributor: { label: 'Contributeur', color: colors.warning },
    subscriber: { label: 'Abonné', color: colors.cyan }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header avec actions */}
      <div style={{ ...styles.flexBetween, marginBottom: '24px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '600' }}>
            Gestion des utilisateurs ({users.length})
          </h3>
          <p style={{ margin: 0, ...styles.textMuted, fontSize: '14px' }}>
            Gérez les comptes utilisateurs et leurs accès
          </p>
        </div>
        {hasPermission('users.create') && (
          <button style={styles.btnPrimary} onClick={() => handleOpenModal()}>
            <Plus size={18} /> Nouvel utilisateur
          </button>
        )}
      </div>

      {/* Filtres */}
      <div style={{ ...styles.card, marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#64748b' : '#94a3b8' }} />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ ...styles.input, paddingLeft: '42px' }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ ...styles.select, minWidth: '150px' }}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{ ...styles.select, minWidth: '150px' }}
          >
            <option value="all">Tous les rôles</option>
            <option value="admin">Administrateurs</option>
            <option value="editor">Éditeurs</option>
            <option value="author">Auteurs</option>
            <option value="contributor">Contributeurs</option>
            <option value="subscriber">Abonnés</option>
          </select>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      {filteredUsers.length > 0 ? (
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Utilisateur</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Rôle</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Dernière connexion</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} style={styles.tr}>
                  <td style={{ ...styles.td, borderRadius: '12px 0 0 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: user.avatar
                          ? `url(http://localhost:5000${user.avatar}) center/cover`
                          : `linear-gradient(135deg, ${colors.cameroonGreen} 0%, ${colors.teal} 100%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: '700', fontSize: '16px'
                      }}>
                        {!user.avatar && (user.first_name?.[0] || user.username?.[0] || 'U')}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>
                          {user.first_name && user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : user.username}
                        </p>
                        <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontSize: '14px' }}>{user.email}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge(roleLabels[user.role]?.color || colors.cyan),
                      fontSize: '12px'
                    }}>
                      {roleLabels[user.role]?.label || user.role}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleToggleStatus(user)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 12px', borderRadius: '20px', border: 'none',
                        background: user.status === 'active' ? `${colors.success}20` : `${colors.error}20`,
                        color: user.status === 'active' ? colors.success : colors.error,
                        fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                      }}
                    >
                      <span style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: user.status === 'active' ? colors.success : colors.error
                      }} />
                      {user.status === 'active' ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'Jamais'}
                    </span>
                  </td>
                  <td style={{ ...styles.td, borderRadius: '0 12px 12px 0', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      {hasPermission('users.edit') && (
                        <button
                          style={{ ...styles.btnSecondary, padding: '8px 12px', fontSize: '12px' }}
                          onClick={() => handleOpenGroupsModal(user)}
                          title="Gérer les groupes"
                        >
                          <Shield size={14} /> Groupes
                        </button>
                      )}
                      {hasPermission('users.edit') && (
                        <button
                          style={{ ...styles.btnIcon, padding: '8px' }}
                          onClick={() => handleOpenModal(user)}
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {hasPermission('users.delete') && (
                        <button
                          style={{ ...styles.btnIcon, color: colors.error, padding: '8px' }}
                          onClick={() => setShowDeleteConfirm(user)}
                          title="Supprimer"
                        >
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
      ) : (
        <div style={{ ...styles.card, textAlign: 'center', padding: '60px' }}>
          <Users size={64} color={isDark ? '#334155' : '#cbd5e1'} style={{ marginBottom: '16px' }} />
          <p style={{ ...styles.textMuted, margin: 0 }}>
            {searchQuery || statusFilter !== 'all' || roleFilter !== 'all'
              ? 'Aucun utilisateur trouvé avec ces critères'
              : 'Aucun utilisateur'}
          </p>
        </div>
      )}

      {/* Modal Création/Edition Utilisateur */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingUser ? '✏️ Modifier l\'utilisateur' : '➕ Nouvel utilisateur'} isDark={isDark} width="600px">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={styles.mb16}>
            <label style={styles.label}>Nom d'utilisateur *</label>
            <input
              value={userForm.username}
              onChange={e => setUserForm({ ...userForm, username: e.target.value })}
              style={styles.input}
              placeholder="johndoe"
            />
          </div>
          <div style={styles.mb16}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              value={userForm.email}
              onChange={e => setUserForm({ ...userForm, email: e.target.value })}
              style={styles.input}
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={styles.mb16}>
            <label style={styles.label}>Prénom</label>
            <input
              value={userForm.first_name}
              onChange={e => setUserForm({ ...userForm, first_name: e.target.value })}
              style={styles.input}
              placeholder="John"
            />
          </div>
          <div style={styles.mb16}>
            <label style={styles.label}>Nom</label>
            <input
              value={userForm.last_name}
              onChange={e => setUserForm({ ...userForm, last_name: e.target.value })}
              style={styles.input}
              placeholder="Doe"
            />
          </div>
        </div>

        <div style={styles.mb16}>
          <label style={styles.label}>
            Mot de passe {editingUser ? '(laisser vide pour ne pas modifier)' : '*'}
          </label>
          <input
            type="password"
            value={userForm.password}
            onChange={e => setUserForm({ ...userForm, password: e.target.value })}
            style={styles.input}
            placeholder="••••••••"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={styles.mb16}>
            <label style={styles.label}>Rôle</label>
            <select
              value={userForm.role}
              onChange={e => setUserForm({ ...userForm, role: e.target.value })}
              style={{ ...styles.select, width: '100%' }}
            >
              <option value="admin">Administrateur</option>
              <option value="editor">Éditeur</option>
              <option value="author">Auteur</option>
              <option value="contributor">Contributeur</option>
              <option value="subscriber">Abonné</option>
            </select>
          </div>
          <div style={styles.mb16}>
            <label style={styles.label}>Statut</label>
            <select
              value={userForm.status}
              onChange={e => setUserForm({ ...userForm, status: e.target.value })}
              style={{ ...styles.select, width: '100%' }}
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        </div>

        <div style={styles.mb24}>
          <label style={styles.label}>Biographie</label>
          <textarea
            value={userForm.bio}
            onChange={e => setUserForm({ ...userForm, bio: e.target.value })}
            style={{ ...styles.textarea, minHeight: '80px' }}
            placeholder="Une courte biographie..."
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button style={styles.btnSecondary} onClick={() => setShowModal(false)}>
            Annuler
          </button>
          <button style={styles.btnPrimary} onClick={handleSaveUser}>
            <Save size={18} /> {editingUser ? 'Enregistrer' : 'Créer l\'utilisateur'}
          </button>
        </div>
      </Modal>

      {/* Modal Gestion des groupes */}
      <Modal isOpen={!!showGroupsModal} onClose={() => setShowGroupsModal(null)} title={`🛡️ Groupes de ${showGroupsModal?.username}`} isDark={isDark} width="500px">
        <div style={{ marginBottom: '16px' }}>
          <p style={{ ...styles.textMuted, margin: 0, fontSize: '14px' }}>
            Sélectionnez les groupes auxquels cet utilisateur appartient
          </p>
        </div>

        <div style={{
          maxHeight: '350px', overflowY: 'auto',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          borderRadius: '12px'
        }}>
          {groups.map(group => (
            <label
              key={group.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 16px',
                borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                cursor: 'pointer',
                background: selectedGroups.includes(group.id)
                  ? (isDark ? '#1e3a5f' : '#e0f2fe')
                  : 'transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <input
                type="checkbox"
                checked={selectedGroups.includes(group.id)}
                onChange={() => handleToggleGroup(group.id)}
                style={{ width: '20px', height: '20px', accentColor: group.color || colors.primary }}
              />
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: `${group.color || colors.primary}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Shield size={20} color={group.color || colors.primary} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>{group.name}</p>
                <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                  {group.permission_count || 0} permissions
                </p>
              </div>
              {group.is_system && (
                <span style={{
                  padding: '3px 8px', fontSize: '10px', fontWeight: '600',
                  background: colors.warning + '20', color: colors.warning,
                  borderRadius: '4px'
                }}>
                  Système
                </span>
              )}
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button style={styles.btnSecondary} onClick={() => setShowGroupsModal(null)}>
            Annuler
          </button>
          <button style={styles.btnPrimary} onClick={handleSaveUserGroups}>
            <Save size={18} /> Enregistrer
          </button>
        </div>
      </Modal>

      {/* Confirmation de suppression */}
      <ConfirmDialog
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => handleDeleteUser(showDeleteConfirm?.id)}
        title="Supprimer l'utilisateur"
        message={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${showDeleteConfirm?.username}" ? Cette action est irréversible.`}
        isDark={isDark}
        type="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  );
};

// ============== GROUPES & PERMISSIONS ==============
const GroupsPage = ({ isDark, token }) => {
  const styles = createStyles(isDark);
  const [groups, setGroups] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('groups');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showUserModal, setShowUserModal] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    permissions: []
  });

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    const [groupsRes, permsRes, usersRes] = await Promise.all([
      api.get('/groups', token),
      api.get('/permissions', token),
      api.get('/users', token)
    ]);
    if (groupsRes.success) setGroups(groupsRes.data);
    if (permsRes.success) setPermissions(permsRes.data);
    if (usersRes.success) setUsers(usersRes.data);
    setLoading(false);
  };

  const handleOpenModal = (group = null) => {
    if (group) {
      setEditingGroup(group);
      api.get(`/groups/${group.id}`, token).then(res => {
        if (res.success) {
          setGroupForm({
            name: res.data.name,
            description: res.data.description || '',
            color: res.data.color || '#6366f1',
            permissions: res.data.permissions?.map(p => p.id) || []
          });
        }
      });
    } else {
      setEditingGroup(null);
      setGroupForm({ name: '', description: '', color: '#6366f1', permissions: [] });
    }
    setShowModal(true);
  };

  const handleSaveGroup = async () => {
    if (!groupForm.name.trim()) {
      setToast({ message: 'Le nom du groupe est requis', type: 'error' });
      return;
    }

    let res;
    if (editingGroup) {
      res = await api.put(`/groups/${editingGroup.id}`, groupForm, token);
    } else {
      res = await api.post('/groups', groupForm, token);
    }

    if (res.success) {
      setToast({ message: editingGroup ? 'Groupe modifié' : 'Groupe créé', type: 'success' });
      setShowModal(false);
      fetchData();
    } else {
      setToast({ message: res.message || 'Erreur', type: 'error' });
    }
  };

  const handleDeleteGroup = async (id) => {
    const res = await api.delete(`/groups/${id}`, token);
    if (res.success) {
      setToast({ message: 'Groupe supprimé', type: 'success' });
      fetchData();
    } else {
      setToast({ message: res.message || 'Erreur', type: 'error' });
    }
    setShowDeleteConfirm(null);
  };

  const handleOpenUserModal = async (group) => {
    const res = await api.get(`/groups/${group.id}`, token);
    if (res.success) {
      setSelectedUsers(res.data.users?.map(u => u.id) || []);
    }
    setShowUserModal(group);
  };

  const handleToggleUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSaveUsers = async () => {
    // Get current users in group
    const res = await api.get(`/groups/${showUserModal.id}`, token);
    const currentUserIds = res.data.users?.map(u => u.id) || [];

    // Add new users
    for (const userId of selectedUsers) {
      if (!currentUserIds.includes(userId)) {
        await api.post(`/groups/${showUserModal.id}/users`, { user_id: userId }, token);
      }
    }

    // Remove users
    for (const userId of currentUserIds) {
      if (!selectedUsers.includes(userId)) {
        await api.delete(`/groups/${showUserModal.id}/users/${userId}`, token);
      }
    }

    setToast({ message: 'Utilisateurs mis à jour', type: 'success' });
    setShowUserModal(null);
    fetchData();
  };

  const handleTogglePermission = (permId) => {
    setGroupForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(id => id !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const permissionsByModule = useMemo(() => {
    return permissions.reduce((acc, perm) => {
      const module = perm.module || 'general';
      if (!acc[module]) acc[module] = [];
      acc[module].push(perm);
      return acc;
    }, {});
  }, [permissions]);

  const moduleLabels = {
    posts: '📝 Articles',
    media: '🖼️ Médias',
    users: '👥 Utilisateurs',
    groups: '🛡️ Groupes',
    settings: '⚙️ Paramètres',
    categories: '📁 Catégories',
    menus: '📋 Menus',
    dashboard: '📊 Tableau de bord',
    general: '🔧 Général'
  };

  if (loading) return <Spinner />;

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button style={styles.tab(activeTab === 'groups')} onClick={() => setActiveTab('groups')}>
          <Shield size={16} style={{ marginRight: '8px' }} /> Groupes
        </button>
        <button style={styles.tab(activeTab === 'permissions')} onClick={() => setActiveTab('permissions')}>
          <Lock size={16} style={{ marginRight: '8px' }} /> Permissions
        </button>
      </div>

      {/* Groups Tab */}
      {activeTab === 'groups' && (
        <div>
          <div style={{ ...styles.flexBetween, marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              Gestion des groupes ({groups.length})
            </h3>
            <button style={styles.btnPrimary} onClick={() => handleOpenModal()}>
              <Plus size={18} /> Nouveau groupe
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {groups.map(group => (
              <div key={group.id} style={{
                ...styles.card,
                borderLeft: `4px solid ${group.color || colors.primary}`,
                position: 'relative'
              }}>
                {group.is_system && (
                  <span style={{
                    position: 'absolute', top: '12px', right: '12px',
                    padding: '4px 8px', fontSize: '10px', fontWeight: '600',
                    background: colors.warning + '20', color: colors.warning,
                    borderRadius: '4px', textTransform: 'uppercase'
                  }}>
                    Système
                  </span>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: `${group.color || colors.primary}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Shield size={24} color={group.color || colors.primary} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '17px', fontWeight: '700' }}>{group.name}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                      {group.slug}
                    </p>
                  </div>
                </div>

                {group.description && (
                  <p style={{ margin: '0 0 16px', fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b' }}>
                    {group.description}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={16} color={colors.primary} />
                    {group.user_count || 0} utilisateur{(group.user_count || 0) !== 1 ? 's' : ''}
                  </span>
                  <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={16} color={colors.success} />
                    {group.permission_count || 0} permission{(group.permission_count || 0) !== 1 ? 's' : ''}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    style={{ ...styles.btnSecondary, flex: 1, justifyContent: 'center' }}
                    onClick={() => handleOpenUserModal(group)}
                  >
                    <Users size={16} /> Utilisateurs
                  </button>
                  <button
                    style={{ ...styles.btnSecondary, padding: '10px' }}
                    onClick={() => handleOpenModal(group)}
                  >
                    <Edit size={16} />
                  </button>
                  {!group.is_system && (
                    <button
                      style={{ ...styles.btnIcon, color: colors.error }}
                      onClick={() => setShowDeleteConfirm(group)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600' }}>
              Liste des permissions ({permissions.length})
            </h3>
            <p style={{ margin: 0, ...styles.textMuted, fontSize: '14px' }}>
              Les permissions définissent les actions autorisées dans le système
            </p>
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>
            {Object.entries(permissionsByModule).map(([module, perms]) => (
              <div key={module} style={styles.card}>
                <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {moduleLabels[module] || module}
                  <span style={{ fontSize: '12px', fontWeight: '500', color: isDark ? '#64748b' : '#94a3b8' }}>
                    ({perms.length})
                  </span>
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                  {perms.map(perm => (
                    <div key={perm.id} style={{
                      padding: '14px 16px',
                      background: isDark ? '#0f172a' : '#f8fafc',
                      borderRadius: '10px',
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <Lock size={14} color={colors.success} />
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>{perm.name}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                        {perm.description || perm.slug}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Création/Edition Groupe */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingGroup ? '✏️ Modifier le groupe' : '➕ Nouveau groupe'} isDark={isDark} width="800px">
        <div style={styles.mb16}>
          <label style={styles.label}>Nom du groupe *</label>
          <input
            value={groupForm.name}
            onChange={e => setGroupForm({ ...groupForm, name: e.target.value })}
            style={styles.input}
            placeholder="Ex: Éditeurs, Modérateurs..."
            disabled={editingGroup?.is_system}
          />
        </div>

        <div style={styles.mb16}>
          <label style={styles.label}>Description</label>
          <textarea
            value={groupForm.description}
            onChange={e => setGroupForm({ ...groupForm, description: e.target.value })}
            style={{ ...styles.textarea, minHeight: '80px' }}
            placeholder="Description du groupe et de ses responsabilités..."
          />
        </div>

        <div style={styles.mb24}>
          <label style={styles.label}>Couleur</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="color"
              value={groupForm.color}
              onChange={e => setGroupForm({ ...groupForm, color: e.target.value })}
              style={{ width: '60px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            />
            <input
              value={groupForm.color}
              onChange={e => setGroupForm({ ...groupForm, color: e.target.value })}
              style={{ ...styles.input, width: '120px' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'].map(c => (
                <div
                  key={c}
                  onClick={() => setGroupForm({ ...groupForm, color: c })}
                  style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: c, cursor: 'pointer',
                    border: groupForm.color === c ? '3px solid white' : 'none',
                    boxShadow: groupForm.color === c ? `0 0 0 2px ${c}` : 'none'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div style={styles.mb24}>
          <label style={styles.label}>Permissions</label>
          <div style={{
            maxHeight: '300px', overflowY: 'auto',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            borderRadius: '12px', padding: '16px'
          }}>
            {Object.entries(permissionsByModule).map(([module, perms]) => (
              <div key={module} style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: '12px', paddingBottom: '8px',
                  borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                }}>
                  <span style={{ fontWeight: '700', fontSize: '14px' }}>
                    {moduleLabels[module] || module}
                  </span>
                  <button
                    type="button"
                    style={{ fontSize: '12px', color: colors.primary, background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => {
                      const modulePermIds = perms.map(p => p.id);
                      const allSelected = modulePermIds.every(id => groupForm.permissions.includes(id));
                      if (allSelected) {
                        setGroupForm(prev => ({
                          ...prev,
                          permissions: prev.permissions.filter(id => !modulePermIds.includes(id))
                        }));
                      } else {
                        setGroupForm(prev => ({
                          ...prev,
                          permissions: [...new Set([...prev.permissions, ...modulePermIds])]
                        }));
                      }
                    }}
                  >
                    {perms.every(p => groupForm.permissions.includes(p.id)) ? 'Tout désélectionner' : 'Tout sélectionner'}
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {perms.map(perm => (
                    <label
                      key={perm.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 12px', borderRadius: '8px',
                        background: groupForm.permissions.includes(perm.id)
                          ? (isDark ? '#1e3a5f' : '#e0f2fe')
                          : (isDark ? '#0f172a' : '#f8fafc'),
                        cursor: 'pointer', transition: 'all 0.2s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={groupForm.permissions.includes(perm.id)}
                        onChange={() => handleTogglePermission(perm.id)}
                        style={{ width: '18px', height: '18px', accentColor: colors.primary }}
                      />
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>{perm.name}</span>
                        {perm.description && (
                          <p style={{ margin: 0, fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>
                            {perm.description}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button style={styles.btnSecondary} onClick={() => setShowModal(false)}>
            Annuler
          </button>
          <button style={styles.btnPrimary} onClick={handleSaveGroup}>
            <Save size={18} /> {editingGroup ? 'Enregistrer' : 'Créer le groupe'}
          </button>
        </div>
      </Modal>

      {/* Modal Gestion des utilisateurs */}
      <Modal isOpen={!!showUserModal} onClose={() => setShowUserModal(null)} title={`👥 Utilisateurs - ${showUserModal?.name}`} isDark={isDark} width="600px">
        <div style={{ marginBottom: '16px' }}>
          <p style={{ ...styles.textMuted, margin: 0, fontSize: '14px' }}>
            Sélectionnez les utilisateurs qui appartiennent à ce groupe
          </p>
        </div>

        <div style={{
          maxHeight: '400px', overflowY: 'auto',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          borderRadius: '12px'
        }}>
          {users.map(user => (
            <label
              key={user.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 16px',
                borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                cursor: 'pointer',
                background: selectedUsers.includes(user.id)
                  ? (isDark ? '#1e3a5f' : '#e0f2fe')
                  : 'transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.id)}
                onChange={() => handleToggleUser(user.id)}
                style={{ width: '20px', height: '20px', accentColor: colors.primary }}
              />
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: `linear-gradient(135deg, ${colors.cameroonGreen} 0%, ${colors.teal} 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: '700', fontSize: '14px'
              }}>
                {user.first_name?.[0] || user.username?.[0] || 'U'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>
                  {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                  {user.email}
                </p>
              </div>
              <span style={{
                ...styles.badge(user.status === 'active' ? colors.success : colors.warning),
                fontSize: '11px'
              }}>
                {user.status === 'active' ? 'Actif' : 'Inactif'}
              </span>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button style={styles.btnSecondary} onClick={() => setShowUserModal(null)}>
            Annuler
          </button>
          <button style={styles.btnPrimary} onClick={handleSaveUsers}>
            <Save size={18} /> Enregistrer
          </button>
        </div>
      </Modal>

      {/* Confirmation de suppression */}
      <ConfirmDialog
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => handleDeleteGroup(showDeleteConfirm?.id)}
        title="Supprimer le groupe"
        message={`Êtes-vous sûr de vouloir supprimer le groupe "${showDeleteConfirm?.name}" ? Cette action est irréversible.`}
        isDark={isDark}
        type="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  );
};

// ============== PARAMÈTRES ==============
const SettingsPage = ({ isDark, token }) => {
  const styles = createStyles(isDark);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await api.get('/settings', token);
      if (res.success) {
        const settingsObj = {};
        res.data.forEach(s => { settingsObj[s.setting_key] = s.setting_value; });
        setSettings(settingsObj);
      }
      setLoading(false);
    };
    fetchSettings();
  }, [token]);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const settingsArray = Object.entries(settings).map(([key, value]) => ({ setting_key: key, setting_value: value }));
    const res = await api.put('/settings', { settings: settingsArray }, token);
    if (res.success) {
      setToast({ message: 'Paramètres enregistrés', type: 'success' });
    }
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'social', label: 'Réseaux sociaux', icon: Globe },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'emails', label: 'Emails', icon: Mail }
  ];

  if (loading) return <Spinner />;

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div style={styles.flexBetween}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800' }}>Paramètres</h1>
          <p style={styles.textMuted}>Configuration générale du site</p>
        </div>
        <button style={styles.btnPrimary} onClick={handleSave}>
          <Save size={20} /> Enregistrer
        </button>
      </div>

      <div style={{ marginTop: '24px' }}>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} isDark={isDark} />

        <div style={styles.card}>
          {activeTab === 'general' && (
            <div style={styles.grid2}>
              <div>
                <div style={styles.mb16}>
                  <label style={styles.label}>Nom du site</label>
                  <input value={settings.site_name || ''} onChange={e => handleChange('site_name', e.target.value)} style={styles.input} />
                </div>
                <div style={styles.mb16}>
                  <label style={styles.label}>Slogan</label>
                  <input value={settings.site_tagline || ''} onChange={e => handleChange('site_tagline', e.target.value)} style={styles.input} />
                </div>
                <div style={styles.mb16}>
                  <label style={styles.label}>Description</label>
                  <textarea value={settings.site_description || ''} onChange={e => handleChange('site_description', e.target.value)} style={styles.textarea} />
                </div>
              </div>
              <div>
                <div style={styles.mb16}>
                  <label style={styles.label}>Email de contact</label>
                  <input type="email" value={settings.contact_email || ''} onChange={e => handleChange('contact_email', e.target.value)} style={styles.input} />
                </div>
                <div style={styles.mb16}>
                  <label style={styles.label}>Téléphone</label>
                  <input value={settings.site_phone || ''} onChange={e => handleChange('site_phone', e.target.value)} style={styles.input} />
                </div>
                <div style={styles.mb16}>
                  <label style={styles.label}>Adresse</label>
                  <textarea value={settings.site_address || ''} onChange={e => handleChange('site_address', e.target.value)} style={styles.textarea} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div style={styles.grid2}>
              {['facebook', 'twitter', 'linkedin', 'youtube', 'instagram', 'tiktok'].map(social => (
                <div key={social} style={styles.mb16}>
                  <label style={{ ...styles.label, textTransform: 'capitalize' }}>{social}</label>
                  <input type="url" value={settings[`${social}_url`] || ''} onChange={e => handleChange(`${social}_url`, e.target.value)} style={styles.input} placeholder={`https://${social}.com/...`} />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'seo' && (
            <div>
              <div style={styles.mb16}>
                <label style={styles.label}>Meta Title par défaut</label>
                <input value={settings.default_meta_title || ''} onChange={e => handleChange('default_meta_title', e.target.value)} style={styles.input} />
              </div>
              <div style={styles.mb16}>
                <label style={styles.label}>Meta Description par défaut</label>
                <textarea value={settings.default_meta_description || ''} onChange={e => handleChange('default_meta_description', e.target.value)} style={styles.textarea} />
              </div>
              <div style={styles.mb16}>
                <label style={styles.label}>Google Analytics ID</label>
                <input value={settings.google_analytics_id || ''} onChange={e => handleChange('google_analytics_id', e.target.value)} style={styles.input} placeholder="UA-XXXXXXXX-X" />
              </div>
            </div>
          )}

          {activeTab === 'emails' && (
            <div style={styles.grid2}>
              <div>
                <div style={styles.mb16}>
                  <label style={styles.label}>Serveur SMTP</label>
                  <input value={settings.smtp_host || ''} onChange={e => handleChange('smtp_host', e.target.value)} style={styles.input} />
                </div>
                <div style={styles.mb16}>
                  <label style={styles.label}>Port SMTP</label>
                  <input value={settings.smtp_port || ''} onChange={e => handleChange('smtp_port', e.target.value)} style={styles.input} />
                </div>
              </div>
              <div>
                <div style={styles.mb16}>
                  <label style={styles.label}>Email SMTP</label>
                  <input value={settings.smtp_user || ''} onChange={e => handleChange('smtp_user', e.target.value)} style={styles.input} />
                </div>
                <div style={styles.mb16}>
                  <label style={styles.label}>Mot de passe SMTP</label>
                  <input type="password" value={settings.smtp_password || ''} onChange={e => handleChange('smtp_password', e.target.value)} style={styles.input} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============== APPLICATION PRINCIPALE ==============

// Mapping des permissions requises pour chaque page/action
const PERMISSION_MAP = {
  // Pages
  dashboard: ['dashboard.view'],
  posts: ['posts.view'],
  categories: ['categories.manage'],
  pages: ['posts.view'], // Pages uses same permission as posts
  media: ['media.view'],
  menus: ['menus.manage'],
  modules: ['settings.manage'],
  sliders: ['settings.manage'],
  pagebuilder: ['settings.manage'],
  themes: ['settings.manage'],
  settings: ['settings.manage'],
  users: ['users.view'],
  groups: ['groups.manage'],
  // Actions
  'posts.create': ['posts.create'],
  'posts.edit': ['posts.edit'],
  'posts.delete': ['posts.delete'],
  'posts.publish': ['posts.publish'],
  'media.upload': ['media.upload'],
  'media.delete': ['media.delete'],
  'users.create': ['users.create'],
  'users.edit': ['users.edit'],
  'users.delete': ['users.delete']
};

export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    const savedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      // Refresh permissions from server
      fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            const updatedUser = { ...parsedUser, permissions: data.data.permissions || [] };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
          }
        })
        .catch(err => console.error('Error refreshing permissions:', err));
    }
  }, []);

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  // Permission check helper - admin role has all permissions
  const hasPermission = useCallback((permissionKey) => {
    if (!user) return false;
    if (user.role === 'admin') return true; // Admin has all permissions

    const requiredPerms = PERMISSION_MAP[permissionKey] || [];
    if (requiredPerms.length === 0) return true; // No permission required

    const userPerms = user.permissions || [];
    return requiredPerms.some(perm => userPerms.includes(perm));
  }, [user]);

  // Check if user can access a page
  const canAccessPage = useCallback((pageId) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return hasPermission(pageId);
  }, [user, hasPermission]);

  if (!user || !token) {
    return <LoginPage onLogin={handleLogin} isDark={isDark} setIsDark={setIsDark} />;
  }

  const styles = createStyles(isDark);

  // Navigation avec permissions
  const navGroups = [
    {
      label: 'Contenu',
      items: [
        { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, permission: 'dashboard' },
        { id: 'posts', label: 'Articles', icon: FileText, permission: 'posts' },
        { id: 'categories', label: 'Catégories', icon: FolderTree, permission: 'categories' },
        { id: 'pages', label: 'Pages', icon: Layout, permission: 'pages' },
        { id: 'media', label: 'Médias', icon: Image, permission: 'media' }
      ]
    },
    {
      label: 'Structure',
      items: [
        { id: 'menus', label: 'Menus', icon: Menu, permission: 'menus' },
        { id: 'modules', label: 'Modules', icon: Box, permission: 'modules' },
        { id: 'sliders', label: 'Sliders', icon: Sliders, permission: 'sliders' },
        { id: 'pagebuilder', label: 'Home Page Builder', icon: LayoutTemplate, permission: 'pagebuilder' }
      ]
    },
    {
      label: 'Utilisateurs',
      items: [
        { id: 'users', label: 'Utilisateurs', icon: Users, permission: 'users' },
        { id: 'groups', label: 'Groupes & Permissions', icon: Shield, permission: 'groups' }
      ]
    },
    {
      label: 'Apparence',
      items: [
        { id: 'themes', label: 'Thèmes', icon: Palette, permission: 'themes' },
        { id: 'settings', label: 'Paramètres', icon: Settings, permission: 'settings' }
      ]
    }
  ];

  // Filtrer les groupes de navigation selon les permissions
  const filteredNavGroups = navGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => canAccessPage(item.permission || item.id))
    }))
    .filter(group => group.items.length > 0);

  // Composant "Accès refusé"
  const AccessDenied = () => (
    <div style={{ ...styles.card, textAlign: 'center', padding: '80px 40px' }}>
      <div style={{
        width: '100px', height: '100px', borderRadius: '50%',
        background: `${colors.error}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px'
      }}>
        <Lock size={48} color={colors.error} />
      </div>
      <h2 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: '700' }}>Accès refusé</h2>
      <p style={{ margin: '0 0 24px', ...styles.textMuted, fontSize: '16px', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        Contactez un administrateur si vous pensez qu'il s'agit d'une erreur.
      </p>
      <button
        style={styles.btnPrimary}
        onClick={() => setActivePage(filteredNavGroups[0]?.items[0]?.id || 'dashboard')}
      >
        Retour à l'accueil
      </button>
    </div>
  );

  const renderPage = () => {
    // Check permission for current page
    if (!canAccessPage(activePage)) {
      return <AccessDenied />;
    }

    switch (activePage) {
      case 'dashboard': return <Dashboard isDark={isDark} token={token} />;
      case 'posts': return <PostsPage isDark={isDark} token={token} hasPermission={hasPermission} />;
      case 'pages': return <PagesPage isDark={isDark} token={token} hasPermission={hasPermission} />;
      case 'categories': return <CategoriesPage isDark={isDark} token={token} hasPermission={hasPermission} />;
      case 'media': return <MediaPage isDark={isDark} token={token} hasPermission={hasPermission} />;
      case 'menus': return <MenusPage isDark={isDark} token={token} />;
      case 'modules': return <ModulesPage isDark={isDark} token={token} />;
      case 'sliders': return <SlidersPage isDark={isDark} token={token} />;
      case 'pagebuilder': return <PageBuilderPage isDark={isDark} token={token} />;
      case 'themes': return <ThemesPage isDark={isDark} token={token} />;
      case 'settings': return <SettingsPage isDark={isDark} token={token} />;
      case 'groups': return <GroupsPage isDark={isDark} token={token} />;
      case 'users': return <UsersPage isDark={isDark} token={token} hasPermission={hasPermission} />;
      case 'profile': return <ProfilePage isDark={isDark} token={token} user={user} setUser={setUser} />;
      case 'ohwr-mapping': return <OHWRMappingPage isDark={isDark} token={token} />;
      case 'oh-elearning': return <OHELearningPage isDark={isDark} token={token} />;
      default: return <Dashboard isDark={isDark} token={token} />;
    }
  };

  const currentPage = activePage === 'profile'
    ? { id: 'profile', label: 'Mon Profil', icon: User }
    : activePage === 'ohwr-mapping'
    ? { id: 'ohwr-mapping', label: 'OHWR-Mapping', icon: MapPin }
    : activePage === 'oh-elearning'
    ? { id: 'oh-elearning', label: 'OH E-Learning', icon: GraduationCap }
    : filteredNavGroups.flatMap(g => g.items).find(i => i.id === activePage);

  return (
    <div style={styles.app}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: ${isDark ? '#1e293b' : '#f1f5f9'}; }
        ::-webkit-scrollbar-thumb { background: ${isDark ? '#475569' : '#cbd5e1'}; border-radius: 4px; }
        input:focus, textarea:focus, select:focus { border-color: ${colors.cameroonGreen} !important; box-shadow: 0 0 0 3px ${colors.cameroonGreen}20 !important; }
        button:hover { opacity: 0.9; transform: translateY(-1px); }
        @keyframes tooltipFadeIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

      {/* Sidebar */}
      <aside style={styles.sidebar(sidebarCollapsed)}>
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: `1px solid ${isDark ? '#334155' : 'rgba(255,255,255,0.2)'}` }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }}>
            <img src="/one-health.jpg" alt="One Health" style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px' }} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span style="font-size:20px">🏥</span>'; }} />
          </div>
          {!sidebarCollapsed && (
            <div>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: isDark ? '#e2e8f0' : '#ffffff' }}>One Health Platform</p>
              <p style={{ margin: 0, fontSize: '11px', color: isDark ? '#64748b' : 'rgba(255,255,255,0.7)' }}>Panneau d'Administration</p>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {filteredNavGroups.map((group, gi) => (
            <div key={gi}>
              {!sidebarCollapsed && <div style={styles.navGroup}>{group.label}</div>}
              {group.items.map(item => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={activePage === item.id}
                  isCollapsed={sidebarCollapsed}
                  isDark={isDark}
                  onClick={() => setActivePage(item.id)}
                  styles={styles}
                />
              ))}
            </div>
          ))}
        </nav>

        <div style={{ padding: '12px', borderTop: `1px solid ${isDark ? '#334155' : 'rgba(255,255,255,0.2)'}` }}>
          <button
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              gap: '14px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.15)',
              color: isDark ? '#94a3b8' : 'rgba(255,255,255,0.9)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <span style={{ fontSize: '10px', opacity: 0.8 }}>© Copyright 2026, PROGRAMME ZOONOSE</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={styles.main(sidebarCollapsed)}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.flex}>
            <button
              style={{
                ...styles.btnIcon,
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,122,51,0.1)',
                borderRadius: '12px',
                marginRight: '8px'
              }}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Agrandir le menu' : 'Réduire le menu'}
            >
              {sidebarCollapsed ? <ChevronRight size={20} color={isDark ? '#94a3b8' : colors.cameroonGreen} /> : <ChevronLeft size={20} color={isDark ? '#94a3b8' : colors.cameroonGreen} />}
            </button>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', background: isDark ? 'none' : `linear-gradient(135deg, ${colors.cameroonGreen} 0%, ${colors.teal} 100%)`, WebkitBackgroundClip: isDark ? 'unset' : 'text', WebkitTextFillColor: isDark ? '#e2e8f0' : 'transparent' }}>{currentPage?.label || 'Dashboard'}</h2>
          </div>

          <div style={styles.flex}>
            {/* OHWR-Mapping Button */}
            <button
              style={{
                ...styles.btnIcon,
                background: activePage === 'ohwr-mapping' ? '#8B9A2D' : (isDark ? 'rgba(139,154,45,0.2)' : 'rgba(139,154,45,0.15)'),
                borderRadius: '12px',
                color: activePage === 'ohwr-mapping' ? 'white' : '#8B9A2D',
                position: 'relative'
              }}
              onClick={() => setActivePage('ohwr-mapping')}
              title="OHWR-Mapping"
            >
              <MapPin size={20} />
            </button>
            {/* OH E-Learning Button */}
            <button
              style={{
                ...styles.btnIcon,
                background: activePage === 'oh-elearning' ? colors.primary : (isDark ? 'rgba(33,150,243,0.2)' : 'rgba(33,150,243,0.15)'),
                borderRadius: '12px',
                color: activePage === 'oh-elearning' ? 'white' : colors.primary,
                position: 'relative'
              }}
              onClick={() => setActivePage('oh-elearning')}
              title="OH E-Learning"
            >
              <GraduationCap size={20} />
            </button>
            <div style={{ width: '1px', height: '32px', background: isDark ? '#334155' : 'rgba(0,122,51,0.2)' }} />
            <button style={{ ...styles.btnIcon, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,122,51,0.1)', borderRadius: '12px' }} onClick={() => setIsDark(!isDark)}>
              {isDark ? <Sun size={20} color="#fbbf24" /> : <Moon size={20} color={colors.cameroonGreen} />}
            </button>
            <button style={{ ...styles.btnIcon, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,122,51,0.1)', borderRadius: '12px', position: 'relative' }}>
              <Bell size={20} color={isDark ? '#94a3b8' : colors.cameroonGreen} />
              <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: colors.error, borderRadius: '50%' }} />
            </button>
            <div style={{ width: '1px', height: '32px', background: isDark ? '#334155' : 'rgba(0,122,51,0.2)' }} />
            <div
              style={{ ...styles.flex, cursor: 'pointer', padding: '6px 12px', borderRadius: '12px', transition: 'all 0.2s ease', background: activePage === 'profile' ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,122,51,0.1)') : 'transparent' }}
              onClick={() => setActivePage('profile')}
              title="Mon profil"
            >
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: user.avatar
                  ? `url(http://localhost:5000${user.avatar}) center/cover`
                  : `linear-gradient(135deg, ${colors.cameroonGreen} 0%, ${colors.teal} 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: '700', fontSize: '15px',
                boxShadow: '0 4px 12px rgba(0,122,51,0.3)'
              }}>
                {!user.avatar && (user.first_name?.[0] || user.username?.[0] || 'A')}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: isDark ? '#e2e8f0' : '#1e293b' }}>{user.first_name || user.username}</p>
                <p style={{ margin: 0, fontSize: '11px', color: isDark ? '#64748b' : colors.teal, textTransform: 'capitalize', fontWeight: '500' }}>{user.role}</p>
              </div>
            </div>
            <button style={{ ...styles.btnIcon, background: 'rgba(239,68,68,0.1)', borderRadius: '12px', color: colors.error }} onClick={handleLogout} title="Déconnexion">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={styles.content}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
