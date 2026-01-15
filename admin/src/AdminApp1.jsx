import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { 
  LayoutDashboard, FileText, FolderOpen, Image, Users, MessageSquare, 
  Settings, Menu, X, Plus, Edit, Trash2, Eye, Search, Filter,
  ChevronLeft, ChevronRight, Save, Upload, LogOut, Bell, Moon, Sun,
  BarChart3, TrendingUp, Calendar, Clock, Check, AlertCircle, RefreshCw,
  Lock, Mail, User, Shield, Activity, Heart, Leaf, Globe, EyeOff
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
  error: '#ef4444'
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
        headers: { 
          'Authorization': token ? `Bearer ${token}` : '', 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data)
      });
      return res.json();
    } catch (error) {
      console.error('API Error:', error);
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
const styles = {
  app: (isDark) => ({
    display: 'flex',
    minHeight: '100vh',
    background: isDark ? '#0f172a' : '#f8fafc',
    color: isDark ? '#e2e8f0' : '#1e293b',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    transition: 'all 0.3s ease'
  }),
  sidebar: (isDark, collapsed) => ({
    width: collapsed ? '72px' : '260px',
    background: isDark 
      ? `linear-gradient(180deg, ${colors.darkBlue} 0%, ${colors.dark} 100%)`
      : 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
    borderRight: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s ease',
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    overflow: 'hidden'
  }),
  main: (collapsed) => ({
    flex: 1,
    marginLeft: collapsed ? '72px' : '260px',
    transition: 'margin 0.3s ease'
  }),
  header: (isDark) => ({
    height: '72px',
    background: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    position: 'sticky',
    top: 0,
    zIndex: 50
  }),
  content: { padding: '32px', maxWidth: '1400px', margin: '0 auto' },
  card: (isDark) => ({
    background: isDark ? '#1e293b' : '#ffffff',
    borderRadius: '16px',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    padding: '24px',
    boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)'
  }),
  statCard: (isDark, color) => ({
    background: isDark ? '#1e293b' : '#ffffff',
    borderRadius: '16px',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    padding: '24px',
    position: 'relative',
    overflow: 'hidden'
  }),
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
  btnSecondary: (isDark) => ({
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
  }),
  btnIcon: (isDark) => ({
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
  }),
  input: (isDark) => ({
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
  }),
  select: (isDark) => ({
    padding: '14px 16px',
    borderRadius: '12px',
    border: `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    background: isDark ? '#0f172a' : '#ffffff',
    color: isDark ? '#e2e8f0' : '#1e293b',
    fontSize: '15px',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit'
  }),
  table: (isDark) => ({ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }),
  th: (isDark) => ({
    textAlign: 'left',
    padding: '12px 16px',
    color: isDark ? '#94a3b8' : '#64748b',
    fontWeight: '600',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }),
  tr: (isDark) => ({
    background: isDark ? '#1e293b' : '#ffffff',
    borderRadius: '12px',
    transition: 'all 0.2s ease'
  }),
  td: (isDark) => ({
    padding: '16px',
    borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
  }),
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
  navItem: (isDark, active, collapsed) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: collapsed ? '14px' : '14px 20px',
    margin: '4px 12px',
    borderRadius: '12px',
    cursor: 'pointer',
    color: active ? colors.cameroonGreen : (isDark ? '#94a3b8' : '#64748b'),
    background: active ? (isDark ? 'rgba(0, 122, 51, 0.15)' : 'rgba(0, 122, 51, 0.1)') : 'transparent',
    fontWeight: active ? '600' : '500',
    transition: 'all 0.2s ease',
    justifyContent: collapsed ? 'center' : 'flex-start',
    textDecoration: 'none',
    fontSize: '14px'
  })
};

// ============== COMPONENTS ==============
const Toast = ({ message, type = 'success', onClose }) => (
  <div style={{
    position: 'fixed', top: '24px', right: '24px', padding: '16px 24px', borderRadius: '12px',
    background: type === 'success' ? colors.success : type === 'error' ? colors.error : colors.warning,
    color: 'white', fontWeight: '500', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', zIndex: 9999,
    display: 'flex', alignItems: 'center', gap: '12px', animation: 'slideIn 0.3s ease'
  }}>
    {type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
    {message}
    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '8px' }}>
      <X size={18} />
    </button>
  </div>
);

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
    <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: colors.cameroonGreen }} />
  </div>
);

const StatCard = ({ icon: Icon, label, value, change, color, isDark }) => (
  <div style={styles.statCard(isDark, color)}>
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
        <span style={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: '13px' }}>vs last month</span>
      </div>
    )}
  </div>
);

const Modal = ({ isOpen, onClose, title, children, isDark, width = '600px' }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }} onClick={onClose}>
      <div style={{ background: isDark ? '#1e293b' : '#ffffff', borderRadius: '20px', width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>{title}</h2>
          <button onClick={onClose} style={styles.btnIcon(isDark)}><X size={22} /></button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
};

// ============== PAGE DE CONNEXION SPECTACULAIRE ==============
const LoginPage = ({ onLogin, isDark, setIsDark }) => {
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
      background: isDark ? colors.dark : '#f0f9ff'
    }}>
      {/* Animations globales */}
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes gradientMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes waveMove { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        * { margin: 0; padding: 0; box-sizing: border-box; }
      `}</style>

      {/* Partie gauche - Branding One Health */}
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
        {/* Éléments décoratifs animés */}
        <div style={{ position: 'absolute', top: '10%', left: '10%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', animation: 'float 6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '15%', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', animation: 'float 8s ease-in-out infinite 1s' }} />
        <div style={{ position: 'absolute', top: '50%', left: '5%', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', animation: 'float 7s ease-in-out infinite 2s' }} />
        
        {/* Vagues animées en bas */}
        <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '200%', height: '150px', opacity: 0.1 }} viewBox="0 0 1440 150" preserveAspectRatio="none">
          <path fill="white" d="M0,100 C360,150 720,50 1080,100 C1260,125 1350,75 1440,100 L1440,150 L0,150 Z">
            <animate attributeName="d" dur="10s" repeatCount="indefinite" values="
              M0,100 C360,150 720,50 1080,100 C1260,125 1350,75 1440,100 L1440,150 L0,150 Z;
              M0,80 C360,50 720,150 1080,80 C1260,60 1350,120 1440,80 L1440,150 L0,150 Z;
              M0,100 C360,150 720,50 1080,100 C1260,125 1350,75 1440,100 L1440,150 L0,150 Z
            " />
          </path>
        </svg>

        {/* Logo et texte */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          {/* Logo One Health */}
          <div style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'pulse 4s ease-in-out infinite'
          }}>
            <img 
              src="one-health.jpg" 
              alt="One Health" 
              style={{ width: '120px', height: '120px', objectFit: 'contain', borderRadius: '50%' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          <h1 style={{ 
            fontSize: '42px', 
            fontWeight: '800', 
            color: 'white', 
            marginBottom: '16px',
            textShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            One Health Cameroon
          </h1>
          <p style={{ 
            fontSize: '18px', 
            color: 'rgba(255,255,255,0.9)', 
            maxWidth: '400px',
            lineHeight: 1.7
          }}>
            Plateforme de gestion du contenu pour la surveillance des zoonoses
          </p>

          {/* Les 3 piliers */}
          <div style={{ display: 'flex', gap: '30px', marginTop: '50px', justifyContent: 'center' }}>
            {[
              { icon: Heart, label: 'Santé Humaine', color: colors.primary },
              { icon: Activity, label: 'Santé Animale', color: colors.accent },
              { icon: Leaf, label: 'Environnement', color: colors.secondary }
            ].map((pillar, i) => (
              <div key={i} style={{
                textAlign: 'center',
                animation: `float ${5 + i}s ease-in-out infinite ${i * 0.5}s`
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <pillar.icon size={28} color="white" />
                </div>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '600' }}>{pillar.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Partie droite - Formulaire de connexion */}
      <div style={{
        width: '500px',
        background: isDark ? colors.darkBlue : 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        position: 'relative'
      }}>
        {/* Toggle Dark Mode */}
        <button 
          onClick={() => setIsDark(!isDark)}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            ...styles.btnIcon(isDark),
            background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            borderRadius: '12px'
          }}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: '800', 
            marginBottom: '12px',
            color: isDark ? 'white' : colors.dark
          }}>
            Bienvenue ! 👋
          </h2>
          <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '15px' }}>
            Connectez-vous pour accéder au panneau d'administration
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              background: isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2',
              border: `1px solid ${isDark ? 'rgba(239,68,68,0.3)' : '#fecaca'}`,
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '24px',
              color: colors.error,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              fontSize: '14px',
              color: isDark ? '#e2e8f0' : '#374151'
            }}>
              <Mail size={14} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              Adresse Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                ...styles.input(isDark),
                paddingLeft: '48px',
                background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'/%3E%3Cpolyline points='22,6 12,13 2,6'/%3E%3C/svg%3E") no-repeat 16px center, ${isDark ? '#0f172a' : '#ffffff'}`
              }}
              placeholder="admin@onehealth.cm"
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              fontSize: '14px',
              color: isDark ? '#e2e8f0' : '#374151'
            }}>
              <Lock size={14} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  ...styles.input(isDark),
                  paddingLeft: '48px',
                  paddingRight: '48px',
                  background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Crect x='3' y='11' width='18' height='11' rx='2' ry='2'/%3E%3Cpath d='M7 11V7a5 5 0 0110 0v4'/%3E%3C/svg%3E") no-repeat 16px center, ${isDark ? '#0f172a' : '#ffffff'}`
                }}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isDark ? '#64748b' : '#94a3b8',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '32px' 
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              cursor: 'pointer',
              fontSize: '14px',
              color: isDark ? '#94a3b8' : '#64748b'
            }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                style={{ 
                  width: '18px', 
                  height: '18px', 
                  accentColor: colors.cameroonGreen,
                  cursor: 'pointer'
                }}
              />
              Se souvenir de moi
            </label>
            <a href="#" style={{ 
              color: colors.cameroonGreen, 
              fontSize: '14px', 
              fontWeight: '600',
              textDecoration: 'none'
            }}>
              Mot de passe oublié ?
            </a>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.btnPrimary,
              width: '100%',
              justifyContent: 'center',
              padding: '16px',
              fontSize: '16px',
              opacity: loading ? 0.7 : 1,
              transform: loading ? 'scale(0.98)' : 'scale(1)',
              boxShadow: `0 10px 30px ${colors.cameroonGreen}40`
            }}
          >
            {loading ? (
              <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                <Shield size={20} />
                Se connecter
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{ 
          marginTop: '40px', 
          textAlign: 'center',
          color: isDark ? '#64748b' : '#94a3b8',
          fontSize: '13px'
        }}>
          <p>© {new Date().getFullYear()} One Health Cameroon</p>
          <p style={{ marginTop: '8px' }}>
            <Globe size={12} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            Plateforme Une Seule Santé
          </p>
        </div>
      </div>
    </div>
  );
};

// ============== DASHBOARD ==============
const Dashboard = ({ isDark, token }) => {
  const [stats, setStats] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, postsRes] = await Promise.all([
          api.get('/dashboard/stats', token),
          api.get('/dashboard/recent-posts', token)
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (postsRes.success) setRecentPosts(postsRes.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }, [token]);

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800' }}>Tableau de Bord</h1>
        <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b' }}>Bienvenue ! Voici un aperçu de votre plateforme.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <StatCard icon={FileText} label="Total Articles" value={stats?.posts?.total || 0} change="+12%" color={colors.cameroonGreen} isDark={isDark} />
        <StatCard icon={Eye} label="Vues Totales" value={stats?.posts?.total_views || 0} change="+8%" color={colors.purple} isDark={isDark} />
        <StatCard icon={Users} label="Utilisateurs" value={stats?.users?.total || 0} color={colors.accent} isDark={isDark} />
        <StatCard icon={MessageSquare} label="Commentaires" value={stats?.comments?.total || 0} color={colors.pink} isDark={isDark} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={styles.card(isDark)}>
          <h3 style={{ margin: '0 0 20px 0', fontWeight: '700' }}>Articles Récents</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentPosts.length > 0 ? recentPosts.slice(0, 5).map(post => (
              <div key={post.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: isDark ? '#0f172a' : '#f8fafc',
                borderRadius: '12px'
              }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>{post.title}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>
                    par {post.author} • {new Date(post.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span style={styles.badge(post.status === 'published' ? colors.success : colors.warning)}>
                  {post.status === 'published' ? 'Publié' : 'Brouillon'}
                </span>
              </div>
            )) : (
              <p style={{ color: isDark ? '#64748b' : '#94a3b8', textAlign: 'center', padding: '20px' }}>
                Aucun article récent
              </p>
            )}
          </div>
        </div>

        <div style={styles.card(isDark)}>
          <h3 style={{ margin: '0 0 20px 0', fontWeight: '700' }}>Statistiques Rapides</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Articles publiés', value: stats?.posts?.published || 0, color: colors.success },
              { label: 'Brouillons', value: stats?.posts?.drafts || 0, color: colors.warning },
              { label: 'Catégories', value: stats?.categories?.total || 0, color: colors.primary },
              { label: 'Médias', value: stats?.media?.total || 0, color: colors.purple }
            ].map((item, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px 16px',
                background: isDark ? '#0f172a' : '#f8fafc',
                borderRadius: '10px'
              }}>
                <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '14px' }}>{item.label}</span>
                <span style={{ fontWeight: '700', color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============== POSTS PAGE ==============
const PostsPage = ({ isDark, token }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [categories, setCategories] = useState([]);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    const res = await api.get('/posts', token);
    if (res.success) setPosts(res.data);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const res = await api.get('/categories', token);
    if (res.success) setCategories(res.data);
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [token]);

  const handleSave = async (postData) => {
    const res = editingPost
      ? await api.put(`/posts/${editingPost.id}`, postData, token)
      : await api.post('/posts', postData, token);
    
    if (res.success) {
      setToast({ message: editingPost ? 'Article mis à jour' : 'Article créé', type: 'success' });
      setShowModal(false);
      setEditingPost(null);
      fetchPosts();
    } else {
      setToast({ message: res.message || 'Erreur', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      const res = await api.delete(`/posts/${id}`, token);
      if (res.success) {
        setToast({ message: 'Article supprimé', type: 'success' });
        fetchPosts();
      }
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800' }}>Articles</h1>
          <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b' }}>{posts.length} articles au total</p>
        </div>
        <button style={styles.btnPrimary} onClick={() => { setEditingPost(null); setShowModal(true); }}>
          <Plus size={20} /> Nouvel Article
        </button>
      </div>

      <div style={{ ...styles.card(isDark), marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#64748b' : '#94a3b8' }} />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ ...styles.input(isDark), paddingLeft: '48px' }}
            />
          </div>
        </div>
      </div>

      <div style={styles.card(isDark)}>
        <table style={styles.table(isDark)}>
          <thead>
            <tr>
              <th style={styles.th(isDark)}>Titre</th>
              <th style={styles.th(isDark)}>Catégorie</th>
              <th style={styles.th(isDark)}>Statut</th>
              <th style={styles.th(isDark)}>Date</th>
              <th style={styles.th(isDark)}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map(post => (
              <tr key={post.id} style={styles.tr(isDark)}>
                <td style={{ ...styles.td(isDark), fontWeight: '600' }}>{post.title}</td>
                <td style={styles.td(isDark)}>{post.category_name || '-'}</td>
                <td style={styles.td(isDark)}>
                  <span style={styles.badge(post.status === 'published' ? colors.success : colors.warning)}>
                    {post.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td style={styles.td(isDark)}>{new Date(post.created_at).toLocaleDateString('fr-FR')}</td>
                <td style={styles.td(isDark)}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={styles.btnIcon(isDark)} onClick={() => { setEditingPost(post); setShowModal(true); }}>
                      <Edit size={18} />
                    </button>
                    <button style={{ ...styles.btnIcon(isDark), color: colors.error }} onClick={() => handleDelete(post.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPosts.length === 0 && (
          <p style={{ textAlign: 'center', padding: '40px', color: isDark ? '#64748b' : '#94a3b8' }}>
            Aucun article trouvé
          </p>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingPost(null); }} title={editingPost ? 'Modifier l\'article' : 'Nouvel article'} isDark={isDark} width="800px">
        <PostForm post={editingPost} categories={categories} onSave={handleSave} isDark={isDark} />
      </Modal>
    </div>
  );
};

// Post Form Component
const PostForm = ({ post, categories, onSave, isDark }) => {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    content: post?.content || '',
    excerpt: post?.excerpt || '',
    category_id: post?.category_id || '',
    status: post?.status || 'draft',
    featured_image: post?.featured_image || ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'title' && !post) {
      setFormData(prev => ({ ...prev, slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }));
    }
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Titre</label>
          <input value={formData.title} onChange={e => handleChange('title', e.target.value)} style={styles.input(isDark)} placeholder="Titre de l'article" />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Slug</label>
          <input value={formData.slug} onChange={e => handleChange('slug', e.target.value)} style={styles.input(isDark)} placeholder="url-de-l-article" />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Extrait</label>
        <textarea value={formData.excerpt} onChange={e => handleChange('excerpt', e.target.value)} style={{ ...styles.input(isDark), minHeight: '80px', resize: 'vertical' }} placeholder="Court résumé de l'article..." />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Contenu</label>
        <textarea value={formData.content} onChange={e => handleChange('content', e.target.value)} style={{ ...styles.input(isDark), minHeight: '200px', resize: 'vertical' }} placeholder="Contenu de l'article..." />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Catégorie</label>
          <select value={formData.category_id} onChange={e => handleChange('category_id', e.target.value)} style={{ ...styles.select(isDark), width: '100%' }}>
            <option value="">Sélectionner</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Statut</label>
          <select value={formData.status} onChange={e => handleChange('status', e.target.value)} style={{ ...styles.select(isDark), width: '100%' }}>
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Image</label>
          <input value={formData.featured_image} onChange={e => handleChange('featured_image', e.target.value)} style={styles.input(isDark)} placeholder="/uploads/image.jpg" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button style={styles.btnPrimary} onClick={() => onSave(formData)}>
          <Save size={18} /> Enregistrer
        </button>
      </div>
    </div>
  );
};

// ============== MEDIA PAGE ==============
const MediaPage = ({ isDark, token }) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchMedia = async () => {
    const res = await api.get('/media', token);
    if (res.success) setMedia(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchMedia(); }, [token]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.upload('/media/upload', formData, token);
    if (res.success) {
      setToast({ message: 'Fichier uploadé', type: 'success' });
      fetchMedia();
    } else {
      setToast({ message: res.message || 'Erreur upload', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce fichier ?')) {
      const res = await api.delete(`/media/${id}`, token);
      if (res.success) {
        setToast({ message: 'Fichier supprimé', type: 'success' });
        fetchMedia();
      }
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800' }}>Médiathèque</h1>
          <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b' }}>{media.length} fichiers</p>
        </div>
        <label style={{ ...styles.btnPrimary, cursor: 'pointer' }}>
          <Upload size={20} /> Uploader
          <input type="file" onChange={handleUpload} style={{ display: 'none' }} accept="image/*" />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {media.map(item => (
          <div key={item.id} style={{ ...styles.card(isDark), padding: '0', overflow: 'hidden' }}>
            <div style={{ height: '160px', background: isDark ? '#0f172a' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.mime_type?.startsWith('image') ? (
                <img src={`http://localhost:5000${item.file_path}`} alt={item.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <FileText size={48} color={isDark ? '#64748b' : '#94a3b8'} />
              )}
            </div>
            <div style={{ padding: '16px' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: '600', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.filename}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>{(item.file_size / 1024).toFixed(1)} KB</span>
                <button style={{ ...styles.btnIcon(isDark), color: colors.error, padding: '6px' }} onClick={() => handleDelete(item.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {media.length === 0 && (
        <div style={{ ...styles.card(isDark), textAlign: 'center', padding: '60px' }}>
          <Image size={48} color={isDark ? '#64748b' : '#94a3b8'} style={{ marginBottom: '16px' }} />
          <p style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Aucun média uploadé</p>
        </div>
      )}
    </div>
  );
};

// ============== CATEGORIES PAGE ==============
const CategoriesPage = ({ isDark, token }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });

  const fetchCategories = async () => {
    const res = await api.get('/categories', token);
    if (res.success) setCategories(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, [token]);

  const handleSave = async () => {
    const res = editingCat
      ? await api.put(`/categories/${editingCat.id}`, formData, token)
      : await api.post('/categories', formData, token);
    
    if (res.success) {
      setToast({ message: editingCat ? 'Catégorie mise à jour' : 'Catégorie créée', type: 'success' });
      setShowModal(false);
      setEditingCat(null);
      setFormData({ name: '', slug: '', description: '' });
      fetchCategories();
    } else {
      setToast({ message: res.message || 'Erreur', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette catégorie ?')) {
      const res = await api.delete(`/categories/${id}`, token);
      if (res.success) {
        setToast({ message: 'Catégorie supprimée', type: 'success' });
        fetchCategories();
      }
    }
  };

  const openEdit = (cat) => {
    setEditingCat(cat);
    setFormData({ name: cat.name, slug: cat.slug, description: cat.description || '' });
    setShowModal(true);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800' }}>Catégories</h1>
          <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b' }}>{categories.length} catégories</p>
        </div>
        <button style={styles.btnPrimary} onClick={() => { setEditingCat(null); setFormData({ name: '', slug: '', description: '' }); setShowModal(true); }}>
          <Plus size={20} /> Nouvelle Catégorie
        </button>
      </div>

      <div style={styles.card(isDark)}>
        <table style={styles.table(isDark)}>
          <thead>
            <tr>
              <th style={styles.th(isDark)}>Nom</th>
              <th style={styles.th(isDark)}>Slug</th>
              <th style={styles.th(isDark)}>Description</th>
              <th style={styles.th(isDark)}>Articles</th>
              <th style={styles.th(isDark)}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id} style={styles.tr(isDark)}>
                <td style={{ ...styles.td(isDark), fontWeight: '600' }}>{cat.name}</td>
                <td style={styles.td(isDark)}>{cat.slug}</td>
                <td style={styles.td(isDark)}>{cat.description || '-'}</td>
                <td style={styles.td(isDark)}>{cat.post_count || 0}</td>
                <td style={styles.td(isDark)}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={styles.btnIcon(isDark)} onClick={() => openEdit(cat)}>
                      <Edit size={18} />
                    </button>
                    <button style={{ ...styles.btnIcon(isDark), color: colors.error }} onClick={() => handleDelete(cat.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCat ? 'Modifier la catégorie' : 'Nouvelle catégorie'} isDark={isDark}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Nom</label>
          <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} style={styles.input(isDark)} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Slug</label>
          <input value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} style={styles.input(isDark)} />
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Description</label>
          <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ ...styles.input(isDark), minHeight: '100px' }} />
        </div>
        <button style={{ ...styles.btnPrimary, width: '100%', justifyContent: 'center' }} onClick={handleSave}>
          <Save size={18} /> Enregistrer
        </button>
      </Modal>
    </div>
  );
};

// ============== SETTINGS PAGE ==============
const SettingsPage = ({ isDark, token }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

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
    } else {
      setToast({ message: 'Erreur', type: 'error' });
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800' }}>Paramètres</h1>
          <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b' }}>Configuration du site</p>
        </div>
        <button style={styles.btnPrimary} onClick={handleSave}>
          <Save size={20} /> Enregistrer
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={styles.card(isDark)}>
          <h3 style={{ margin: '0 0 24px 0', fontWeight: '700' }}>Général</h3>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Nom du site</label>
            <input value={settings.site_name || ''} onChange={e => handleChange('site_name', e.target.value)} style={styles.input(isDark)} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Description</label>
            <textarea value={settings.site_description || ''} onChange={e => handleChange('site_description', e.target.value)} style={{ ...styles.input(isDark), minHeight: '100px' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Email de contact</label>
            <input type="email" value={settings.contact_email || ''} onChange={e => handleChange('contact_email', e.target.value)} style={styles.input(isDark)} />
          </div>
        </div>

        <div style={styles.card(isDark)}>
          <h3 style={{ margin: '0 0 24px 0', fontWeight: '700' }}>Réseaux Sociaux</h3>
          {['facebook', 'twitter', 'linkedin', 'youtube'].map(social => (
            <div key={social} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', textTransform: 'capitalize' }}>{social}</label>
              <input type="url" value={settings[`${social}_url`] || ''} onChange={e => handleChange(`${social}_url`, e.target.value)} style={styles.input(isDark)} placeholder={`https://${social}.com/...`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============== MAIN APP ==============
export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    const savedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
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

  if (!user || !token) {
    return <LoginPage onLogin={handleLogin} isDark={isDark} setIsDark={setIsDark} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'posts', label: 'Articles', icon: FileText },
    { id: 'media', label: 'Médias', icon: Image },
    { id: 'categories', label: 'Catégories', icon: FolderOpen },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard isDark={isDark} token={token} />;
      case 'posts': return <PostsPage isDark={isDark} token={token} />;
      case 'media': return <MediaPage isDark={isDark} token={token} />;
      case 'categories': return <CategoriesPage isDark={isDark} token={token} />;
      case 'settings': return <SettingsPage isDark={isDark} token={token} />;
      default: return <Dashboard isDark={isDark} token={token} />;
    }
  };

  return (
    <div style={styles.app(isDark)}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: ${isDark ? '#1e293b' : '#f1f5f9'}; }
        ::-webkit-scrollbar-thumb { background: ${isDark ? '#475569' : '#cbd5e1'}; border-radius: 4px; }
        input:focus, textarea:focus, select:focus { border-color: ${colors.cameroonGreen} !important; }
      `}</style>

      {/* Sidebar */}
      <aside style={styles.sidebar(isDark, sidebarCollapsed)}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: `linear-gradient(135deg, ${colors.cameroonGreen} 0%, ${colors.teal} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Activity size={24} color="white" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '16px' }}>One Health</p>
              <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>Administration</p>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, padding: '16px 0' }}>
          {navItems.map(item => (
            <div key={item.id} style={styles.navItem(isDark, activePage === item.id, sidebarCollapsed)} onClick={() => setActivePage(item.id)} title={sidebarCollapsed ? item.label : ''}>
              <item.icon size={22} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </div>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
          <button style={{ ...styles.btnIcon(isDark), width: '100%', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', gap: '14px', padding: '14px' }} onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? <ChevronRight size={22} /> : <><ChevronLeft size={22} /><span>Réduire</span></>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={styles.main(sidebarCollapsed)}>
        {/* Header */}
        <header style={styles.header(isDark)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', textTransform: 'capitalize' }}>
              {navItems.find(n => n.id === activePage)?.label || activePage}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={styles.btnIcon(isDark)} onClick={() => setIsDark(!isDark)}>
              {isDark ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            <button style={styles.btnIcon(isDark)}>
              <Bell size={22} />
            </button>
            <div style={{ width: '1px', height: '32px', background: isDark ? '#334155' : '#e2e8f0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: `linear-gradient(135deg, ${colors.cameroonGreen} 0%, ${colors.teal} 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: '700', fontSize: '14px'
              }}>
                {user.first_name?.[0] || user.username?.[0] || 'A'}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>{user.first_name || user.username}</p>
                <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8', textTransform: 'capitalize' }}>{user.role}</p>
              </div>
            </div>
            <button style={{ ...styles.btnIcon(isDark), color: colors.error }} onClick={handleLogout} title="Déconnexion">
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
