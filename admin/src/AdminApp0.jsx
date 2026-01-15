import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { 
  LayoutDashboard, FileText, FolderOpen, Image, Users, MessageSquare, 
  Settings, Menu, X, Plus, Edit, Trash2, Eye, Search, Filter,
  ChevronLeft, ChevronRight, Save, Upload, LogOut, Bell, Moon, Sun,
  BarChart3, TrendingUp, Calendar, Clock, Check, AlertCircle, RefreshCw
} from 'lucide-react';

// ============== CONTEXT ==============
const AuthContext = createContext(null);
const ThemeContext = createContext(null);

// ============== API CONFIG ==============
const API_URL = 'http://localhost:5000/api';

const api = {
  get: async (endpoint, token) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    return res.json();
  },
  post: async (endpoint, data, token) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  put: async (endpoint, data, token) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  delete: async (endpoint, token) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },
  upload: async (endpoint, formData, token) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return res.json();
  }
};

// ============== STYLES ==============
const styles = {
  // Base layout
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
    background: isDark ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)' : 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
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
    background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
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
  
  // Cards
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
  
  // Buttons
  btnPrimary: {
    background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    fontSize: '14px'
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
    fontSize: '14px'
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
  
  // Inputs
  input: (isDark) => ({
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    background: isDark ? '#0f172a' : '#ffffff',
    color: isDark ? '#e2e8f0' : '#1e293b',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.2s ease'
  }),
  select: (isDark) => ({
    padding: '14px 16px',
    borderRadius: '12px',
    border: `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    background: isDark ? '#0f172a' : '#ffffff',
    color: isDark ? '#e2e8f0' : '#1e293b',
    fontSize: '15px',
    outline: 'none',
    cursor: 'pointer'
  }),
  
  // Table
  table: (isDark) => ({
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 8px'
  }),
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
  
  // Badge
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
  
  // Nav
  navItem: (isDark, active, collapsed) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: collapsed ? '14px' : '14px 20px',
    margin: '4px 12px',
    borderRadius: '12px',
    cursor: 'pointer',
    color: active ? '#0d9488' : (isDark ? '#94a3b8' : '#64748b'),
    background: active ? (isDark ? 'rgba(13, 148, 136, 0.15)' : 'rgba(13, 148, 136, 0.1)') : 'transparent',
    fontWeight: active ? '600' : '500',
    transition: 'all 0.2s ease',
    justifyContent: collapsed ? 'center' : 'flex-start',
    textDecoration: 'none',
    fontSize: '14px'
  })
};

// ============== COMPONENTS ==============

// Toast notification
const Toast = ({ message, type = 'success', onClose }) => (
  <div style={{
    position: 'fixed',
    top: '24px',
    right: '24px',
    padding: '16px 24px',
    borderRadius: '12px',
    background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b',
    color: 'white',
    fontWeight: '500',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    animation: 'slideIn 0.3s ease'
  }}>
    {type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
    {message}
    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '8px' }}>
      <X size={18} />
    </button>
  </div>
);

// Loading Spinner
const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
    <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: '#0d9488' }} />
  </div>
);

// Stat Card
const StatCard = ({ icon: Icon, label, value, change, color, isDark }) => (
  <div style={styles.statCard(isDark, color)}>
    <div style={{ 
      position: 'absolute', 
      top: '-20px', 
      right: '-20px', 
      width: '100px', 
      height: '100px', 
      borderRadius: '50%', 
      background: `${color}15`,
      opacity: 0.5
    }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
      <div style={{ 
        width: '56px', 
        height: '56px', 
        borderRadius: '14px', 
        background: `${color}20`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Icon size={26} color={color} />
      </div>
      <div>
        <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '14px', margin: '0 0 4px 0' }}>{label}</p>
        <p style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>{value}</p>
      </div>
    </div>
    {change && (
      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <TrendingUp size={16} color="#10b981" />
        <span style={{ color: '#10b981', fontWeight: '600', fontSize: '14px' }}>{change}</span>
        <span style={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: '13px' }}>vs last month</span>
      </div>
    )}
  </div>
);

// Modal
const Modal = ({ isOpen, onClose, title, children, isDark, width = '600px' }) => {
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px'
    }} onClick={onClose}>
      <div style={{
        background: isDark ? '#1e293b' : '#ffffff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: width,
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ 
          padding: '24px', 
          borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>{title}</h2>
          <button onClick={onClose} style={styles.btnIcon(isDark)}>
            <X size={22} />
          </button>
        </div>
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// ============== LOGIN PAGE ==============
const LoginPage = ({ onLogin, isDark }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        onLogin(res.data.user, res.data.token);
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      setError('Connection error');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDark 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        : 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: isDark ? '#1e293b' : '#ffffff',
        borderRadius: '24px',
        padding: '48px',
        boxShadow: isDark ? '0 25px 50px rgba(0,0,0,0.5)' : '0 25px 50px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 10px 30px rgba(13, 148, 136, 0.4)'
          }}>
            <FileText size={36} color="white" />
          </div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '800' }}>One Health CMS</h1>
          <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b' }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '24px',
              color: '#dc2626',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: isDark ? '#e2e8f0' : '#374151' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={styles.input(isDark)}
              placeholder="admin@onehealth.cm"
              required
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: isDark ? '#e2e8f0' : '#374151' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input(isDark)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading} style={{
            ...styles.btnPrimary,
            width: '100%',
            justifyContent: 'center',
            padding: '16px',
            fontSize: '16px',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Sign In'}
          </button>
        </form>
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
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800' }}>Dashboard</h1>
        <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b' }}>Welcome back! Here's what's happening.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <StatCard icon={FileText} label="Total Posts" value={stats?.posts?.total || 0} change="+12%" color="#0d9488" isDark={isDark} />
        <StatCard icon={Eye} label="Total Views" value={stats?.posts?.total_views || 0} change="+8%" color="#8b5cf6" isDark={isDark} />
        <StatCard icon={Users} label="Users" value={stats?.users?.total || 0} color="#f59e0b" isDark={isDark} />
        <StatCard icon={MessageSquare} label="Comments" value={stats?.comments?.total || 0} color="#ec4899" isDark={isDark} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={styles.card(isDark)}>
          <h3 style={{ margin: '0 0 20px 0', fontWeight: '700' }}>Recent Posts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentPosts.slice(0, 5).map(post => (
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
                    by {post.author} • {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span style={styles.badge(post.status === 'published' ? '#10b981' : '#f59e0b')}>
                  {post.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.card(isDark)}>
          <h3 style={{ margin: '0 0 20px 0', fontWeight: '700' }}>Quick Stats</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Published</span>
              <span style={{ fontWeight: '700', color: '#10b981' }}>{stats?.posts?.published || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Drafts</span>
              <span style={{ fontWeight: '700', color: '#f59e0b' }}>{stats?.posts?.drafts || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Pending Comments</span>
              <span style={{ fontWeight: '700', color: '#ec4899' }}>{stats?.comments?.pending || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Media Files</span>
              <span style={{ fontWeight: '700' }}>{stats?.media?.total || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Storage Used</span>
              <span style={{ fontWeight: '700' }}>{stats?.media?.total_size_mb || 0} MB</span>
            </div>
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
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [filter, setFilter] = useState({ status: '', type: 'post', search: '' });
  const [toast, setToast] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams(filter).toString();
    const res = await api.get(`/posts?${params}`, token);
    if (res.success) setPosts(res.data);
    setLoading(false);
  }, [token, filter]);

  const fetchMeta = useCallback(async () => {
    const [catRes, tagRes] = await Promise.all([
      api.get('/categories', token),
      api.get('/tags', token)
    ]);
    if (catRes.success) setCategories(catRes.data);
    if (tagRes.success) setTags(tagRes.data);
  }, [token]);

  useEffect(() => {
    fetchPosts();
    fetchMeta();
  }, [fetchPosts, fetchMeta]);

  const handleSave = async (postData) => {
    const res = editingPost
      ? await api.put(`/posts/${editingPost.id}`, postData, token)
      : await api.post('/posts', postData, token);

    if (res.success) {
      setToast({ message: editingPost ? 'Post updated!' : 'Post created!', type: 'success' });
      setShowEditor(false);
      setEditingPost(null);
      fetchPosts();
    } else {
      setToast({ message: res.message || 'Error saving post', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    const res = await api.delete(`/posts/${id}`, token);
    if (res.success) {
      setToast({ message: 'Post deleted!', type: 'success' });
      fetchPosts();
    }
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800' }}>Posts</h1>
          <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b' }}>Manage your content</p>
        </div>
        <button style={styles.btnPrimary} onClick={() => { setEditingPost(null); setShowEditor(true); }}>
          <Plus size={20} /> New Post
        </button>
      </div>

      {/* Filters */}
      <div style={{ ...styles.card(isDark), marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#64748b' : '#94a3b8' }} />
            <input
              placeholder="Search posts..."
              value={filter.search}
              onChange={e => setFilter({ ...filter, search: e.target.value })}
              style={{ ...styles.input(isDark), paddingLeft: '44px' }}
            />
          </div>
          <select
            value={filter.status}
            onChange={e => setFilter({ ...filter, status: e.target.value })}
            style={styles.select(isDark)}
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
          <select
            value={filter.type}
            onChange={e => setFilter({ ...filter, type: e.target.value })}
            style={styles.select(isDark)}
          >
            <option value="post">Posts</option>
            <option value="page">Pages</option>
            <option value="news">News</option>
            <option value="event">Events</option>
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div style={styles.card(isDark)}>
        {loading ? <Spinner /> : (
          <table style={styles.table(isDark)}>
            <thead>
              <tr>
                <th style={styles.th(isDark)}>Title</th>
                <th style={styles.th(isDark)}>Author</th>
                <th style={styles.th(isDark)}>Category</th>
                <th style={styles.th(isDark)}>Status</th>
                <th style={styles.th(isDark)}>Views</th>
                <th style={styles.th(isDark)}>Date</th>
                <th style={styles.th(isDark)}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id} style={styles.tr(isDark)}>
                  <td style={{ ...styles.td(isDark), borderRadius: '12px 0 0 12px', fontWeight: '600' }}>
                    {post.title}
                    {post.featured && <span style={{ marginLeft: '8px', color: '#f59e0b' }}>★</span>}
                  </td>
                  <td style={styles.td(isDark)}>{post.author_username}</td>
                  <td style={styles.td(isDark)}>{post.category_name || '-'}</td>
                  <td style={styles.td(isDark)}>
                    <span style={styles.badge(
                      post.status === 'published' ? '#10b981' : 
                      post.status === 'draft' ? '#f59e0b' : '#8b5cf6'
                    )}>
                      {post.status}
                    </span>
                  </td>
                  <td style={styles.td(isDark)}>{post.view_count}</td>
                  <td style={styles.td(isDark)}>{new Date(post.created_at).toLocaleDateString()}</td>
                  <td style={{ ...styles.td(isDark), borderRadius: '0 12px 12px 0' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={styles.btnIcon(isDark)} onClick={() => { setEditingPost(post); setShowEditor(true); }}>
                        <Edit size={18} />
                      </button>
                      <button style={{ ...styles.btnIcon(isDark), color: '#ef4444' }} onClick={() => handleDelete(post.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Post Editor Modal */}
      <Modal isOpen={showEditor} onClose={() => { setShowEditor(false); setEditingPost(null); }} title={editingPost ? 'Edit Post' : 'New Post'} isDark={isDark} width="900px">
        <PostEditor
          post={editingPost}
          categories={categories}
          tags={tags}
          onSave={handleSave}
          onCancel={() => { setShowEditor(false); setEditingPost(null); }}
          isDark={isDark}
        />
      </Modal>
    </div>
  );
};

// ============== POST EDITOR WITH TINYMCE ==============
const PostEditor = ({ post, categories, tags, onSave, onCancel, isDark }) => {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || '',
    excerpt: post?.excerpt || '',
    category_id: post?.category_id || '',
    type: post?.type || 'post',
    status: post?.status || 'draft',
    featured: post?.featured || false,
    featured_image: post?.featured_image || '',
    meta_title: post?.meta_title || '',
    meta_description: post?.meta_description || '',
    tags: post?.tags?.map(t => t.id) || []
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Main content */}
        <div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => handleChange('title', e.target.value)}
              style={styles.input(isDark)}
              placeholder="Enter post title"
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Content</label>
            <Editor
              apiKey="no-api-key" // Replace with your TinyMCE API key
              value={formData.content}
              onEditorChange={(content) => handleChange('content', content)}
              init={{
                height: 400,
                menubar: true,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | image media link | code fullscreen | help',
                content_style: `body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; line-height: 1.6; }`,
                skin: isDark ? 'oxide-dark' : 'oxide',
                content_css: isDark ? 'dark' : 'default'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Excerpt</label>
            <textarea
              value={formData.excerpt}
              onChange={e => handleChange('excerpt', e.target.value)}
              style={{ ...styles.input(isDark), minHeight: '100px', resize: 'vertical' }}
              placeholder="Brief description of the post"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div style={{ ...styles.card(isDark), marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontWeight: '700' }}>Publish</h4>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>Status</label>
              <select
                value={formData.status}
                onChange={e => handleChange('status', e.target.value)}
                style={{ ...styles.select(isDark), width: '100%' }}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>Type</label>
              <select
                value={formData.type}
                onChange={e => handleChange('type', e.target.value)}
                style={{ ...styles.select(isDark), width: '100%' }}
              >
                <option value="post">Post</option>
                <option value="page">Page</option>
                <option value="news">News</option>
                <option value="event">Event</option>
                <option value="resource">Resource</option>
              </select>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={e => handleChange('featured', e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#0d9488' }}
              />
              <span style={{ fontSize: '14px' }}>Featured post</span>
            </label>
          </div>

          <div style={{ ...styles.card(isDark), marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontWeight: '700' }}>Category</h4>
            <select
              value={formData.category_id}
              onChange={e => handleChange('category_id', e.target.value)}
              style={{ ...styles.select(isDark), width: '100%' }}
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div style={{ ...styles.card(isDark), marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontWeight: '700' }}>Featured Image</h4>
            <input
              type="text"
              value={formData.featured_image}
              onChange={e => handleChange('featured_image', e.target.value)}
              style={styles.input(isDark)}
              placeholder="Image URL"
            />
            {formData.featured_image && (
              <img src={formData.featured_image} alt="Preview" style={{ width: '100%', borderRadius: '8px', marginTop: '12px' }} />
            )}
          </div>

          <div style={styles.card(isDark)}>
            <h4 style={{ margin: '0 0 16px 0', fontWeight: '700' }}>SEO</h4>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>Meta Title</label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={e => handleChange('meta_title', e.target.value)}
                style={styles.input(isDark)}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>Meta Description</label>
              <textarea
                value={formData.meta_description}
                onChange={e => handleChange('meta_description', e.target.value)}
                style={{ ...styles.input(isDark), minHeight: '80px', resize: 'vertical' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '24px', borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
        <button type="button" onClick={onCancel} style={styles.btnSecondary(isDark)}>Cancel</button>
        <button type="submit" style={styles.btnPrimary}>
          <Save size={18} /> {post ? 'Update' : 'Publish'}
        </button>
      </div>
    </form>
  );
};

// ============== MEDIA LIBRARY ==============
const MediaPage = ({ isDark, token }) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    const res = await api.get('/media?limit=50', token);
    if (res.success) setMedia(res.data);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    setUploading(true);
    const formData = new FormData();
    for (let file of files) {
      formData.append('files', file);
    }

    try {
      const res = await api.upload('/media/upload', formData, token);
      if (res.success) {
        setToast({ message: `${res.data.length} file(s) uploaded!`, type: 'success' });
        fetchMedia();
      } else {
        setToast({ message: res.message || 'Upload failed', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Upload error', type: 'error' });
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this file?')) return;
    const res = await api.delete(`/media/${id}`, token);
    if (res.success) {
      setToast({ message: 'File deleted!', type: 'success' });
      fetchMedia();
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(`http://localhost:5000${url}`);
    setToast({ message: 'URL copied!', type: 'success' });
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800' }}>Media Library</h1>
          <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b' }}>Manage your images and files</p>
        </div>
        <label style={{ ...styles.btnPrimary, cursor: 'pointer' }}>
          <Upload size={20} /> Upload Files
          <input type="file" multiple onChange={handleUpload} style={{ display: 'none' }} />
        </label>
      </div>

      {uploading && (
        <div style={{ ...styles.card(isDark), marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', color: '#0d9488' }} />
          Uploading files...
        </div>
      )}

      <div style={styles.card(isDark)}>
        {loading ? <Spinner /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
            {media.map(item => (
              <div key={item.id} style={{
                background: isDark ? '#0f172a' : '#f8fafc',
                borderRadius: '16px',
                overflow: 'hidden',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
              }}>
                <div style={{
                  height: '140px',
                  background: isDark ? '#1e293b' : '#e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {item.mime_type.startsWith('image/') ? (
                    <img src={`http://localhost:5000${item.url}`} alt={item.original_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <FileText size={48} color={isDark ? '#64748b' : '#94a3b8'} />
                  )}
                </div>
                <div style={{ padding: '12px' }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: '600', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.original_name}
                  </p>
                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>
                    {(item.size / 1024).toFixed(1)} KB
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => copyUrl(item.url)} style={{ ...styles.btnIcon(isDark), flex: 1, background: isDark ? '#334155' : '#e2e8f0' }} title="Copy URL">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} style={{ ...styles.btnIcon(isDark), flex: 1, background: '#fef2f2', color: '#ef4444' }} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============== CATEGORIES PAGE ==============
const CategoriesPage = ({ isDark, token }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [toast, setToast] = useState(null);

  const fetchCategories = useCallback(async () => {
    const res = await api.get('/categories', token);
    if (res.success) setCategories(res.data);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSave = async () => {
    const res = editing
      ? await api.put(`/categories/${editing.id}`, formData, token)
      : await api.post('/categories', formData, token);

    if (res.success) {
      setToast({ message: editing ? 'Category updated!' : 'Category created!', type: 'success' });
      setShowModal(false);
      setEditing(null);
      setFormData({ name: '', description: '' });
      fetchCategories();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    const res = await api.delete(`/categories/${id}`, token);
    if (res.success) {
      setToast({ message: 'Category deleted!', type: 'success' });
      fetchCategories();
    }
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800' }}>Categories</h1>
          <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b' }}>Organize your content</p>
        </div>
        <button style={styles.btnPrimary} onClick={() => { setEditing(null); setFormData({ name: '', description: '' }); setShowModal(true); }}>
          <Plus size={20} /> New Category
        </button>
      </div>

      <div style={styles.card(isDark)}>
        {loading ? <Spinner /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {categories.map(cat => (
              <div key={cat.id} style={{
                background: isDark ? '#0f172a' : '#f8fafc',
                borderRadius: '16px',
                padding: '20px',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FolderOpen size={22} color="white" />
                  </div>
                  <span style={styles.badge('#0d9488')}>{cat.post_count || 0} posts</span>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontWeight: '700' }}>{cat.name}</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b' }}>
                  {cat.description || 'No description'}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ ...styles.btnSecondary(isDark), flex: 1, justifyContent: 'center', padding: '10px' }} 
                    onClick={() => { setEditing(cat); setFormData({ name: cat.name, description: cat.description || '' }); setShowModal(true); }}>
                    <Edit size={16} />
                  </button>
                  <button style={{ ...styles.btnSecondary(isDark), flex: 1, justifyContent: 'center', padding: '10px', color: '#ef4444' }} 
                    onClick={() => handleDelete(cat.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Category' : 'New Category'} isDark={isDark} width="500px">
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            style={styles.input(isDark)}
            placeholder="Category name"
          />
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Description</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            style={{ ...styles.input(isDark), minHeight: '100px', resize: 'vertical' }}
            placeholder="Category description"
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={() => setShowModal(false)} style={styles.btnSecondary(isDark)}>Cancel</button>
          <button onClick={handleSave} style={styles.btnPrimary}>
            <Save size={18} /> Save
          </button>
        </div>
      </Modal>
    </div>
  );
};

// ============== SETTINGS PAGE ==============
const SettingsPage = ({ isDark, token }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await api.get('/settings', token);
      if (res.success) {
        const obj = {};
        res.data.forEach(s => { obj[s.setting_key] = s.setting_value; });
        setSettings(obj);
      }
      setLoading(false);
    };
    fetchSettings();
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    const res = await api.put('/settings', { settings }, token);
    if (res.success) {
      setToast({ message: 'Settings saved!', type: 'success' });
    }
    setSaving(false);
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <Spinner />;

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800' }}>Settings</h1>
          <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b' }}>Configure your site</p>
        </div>
        <button style={styles.btnPrimary} onClick={handleSave} disabled={saving}>
          {saving ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
          Save Changes
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        <div style={styles.card(isDark)}>
          <h3 style={{ margin: '0 0 24px 0', fontWeight: '700' }}>General</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Site Name</label>
            <input
              type="text"
              value={settings.site_name || ''}
              onChange={e => handleChange('site_name', e.target.value)}
              style={styles.input(isDark)}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Site Description</label>
            <textarea
              value={settings.site_description || ''}
              onChange={e => handleChange('site_description', e.target.value)}
              style={{ ...styles.input(isDark), minHeight: '80px', resize: 'vertical' }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Site Email</label>
            <input
              type="email"
              value={settings.site_email || ''}
              onChange={e => handleChange('site_email', e.target.value)}
              style={styles.input(isDark)}
            />
          </div>
        </div>

        <div style={styles.card(isDark)}>
          <h3 style={{ margin: '0 0 24px 0', fontWeight: '700' }}>Appearance</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Primary Color</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="color"
                value={settings.primary_color || '#0d9488'}
                onChange={e => handleChange('primary_color', e.target.value)}
                style={{ width: '50px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              />
              <input
                type="text"
                value={settings.primary_color || '#0d9488'}
                onChange={e => handleChange('primary_color', e.target.value)}
                style={{ ...styles.input(isDark), flex: 1 }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Logo URL</label>
            <input
              type="text"
              value={settings.site_logo || ''}
              onChange={e => handleChange('site_logo', e.target.value)}
              style={styles.input(isDark)}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Posts Per Page</label>
            <input
              type="number"
              value={settings.posts_per_page || '10'}
              onChange={e => handleChange('posts_per_page', e.target.value)}
              style={styles.input(isDark)}
            />
          </div>
        </div>

        <div style={styles.card(isDark)}>
          <h3 style={{ margin: '0 0 24px 0', fontWeight: '700' }}>Social Media</h3>
          
          {['facebook', 'twitter', 'linkedin', 'youtube'].map(social => (
            <div key={social} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', textTransform: 'capitalize' }}>{social} URL</label>
              <input
                type="url"
                value={settings[`${social}_url`] || ''}
                onChange={e => handleChange(`${social}_url`, e.target.value)}
                style={styles.input(isDark)}
                placeholder={`https://${social}.com/...`}
              />
            </div>
          ))}
        </div>

        <div style={styles.card(isDark)}>
          <h3 style={{ margin: '0 0 24px 0', fontWeight: '700' }}>Contact</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Phone</label>
            <input
              type="tel"
              value={settings.site_phone || ''}
              onChange={e => handleChange('site_phone', e.target.value)}
              style={styles.input(isDark)}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Address</label>
            <textarea
              value={settings.site_address || ''}
              onChange={e => handleChange('site_address', e.target.value)}
              style={{ ...styles.input(isDark), minHeight: '80px', resize: 'vertical' }}
            />
          </div>
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
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
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
    setUser(null);
    setToken(null);
  };

  if (!user || !token) {
    return <LoginPage onLogin={handleLogin} isDark={isDark} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'media', label: 'Media', icon: Image },
    { id: 'categories', label: 'Categories', icon: FolderOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
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
      `}</style>

      {/* Sidebar */}
      <aside style={styles.sidebar(isDark, sidebarCollapsed)}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <FileText size={24} color="white" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '16px' }}>One Health</p>
              <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>CMS Admin</p>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, padding: '16px 0' }}>
          {navItems.map(item => (
            <div
              key={item.id}
              style={styles.navItem(isDark, activePage === item.id, sidebarCollapsed)}
              onClick={() => setActivePage(item.id)}
              title={sidebarCollapsed ? item.label : ''}
            >
              <item.icon size={22} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </div>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
          <button
            style={{ ...styles.btnIcon(isDark), width: '100%', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', gap: '14px', padding: '14px' }}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRight size={22} /> : <><ChevronLeft size={22} /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={styles.main(sidebarCollapsed)}>
        {/* Header */}
        <header style={styles.header(isDark)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', textTransform: 'capitalize' }}>{activePage}</h2>
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
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '700',
                fontSize: '14px'
              }}>
                {user.first_name?.[0] || user.username?.[0] || 'A'}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>{user.first_name || user.username}</p>
                <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8', textTransform: 'capitalize' }}>{user.role}</p>
              </div>
            </div>
            <button style={{ ...styles.btnIcon(isDark), color: '#ef4444' }} onClick={handleLogout} title="Logout">
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
