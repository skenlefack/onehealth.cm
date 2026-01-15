import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutTemplate, Save, Eye, EyeOff, Edit, Trash2, Plus, GripVertical,
  ChevronDown, ChevronUp, Globe, RefreshCw, Check, X, Image as ImageIcon,
  Upload, FolderOpen, Search, Grid, List
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const api = {
  get: async (endpoint, token) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
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

const colors = {
  primary: '#2196F3',
  cameroonGreen: '#007A33',
  teal: '#009688',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444'
};

// Toast Component
const Toast = ({ message, type = 'success', onClose }) => (
  <div style={{
    position: 'fixed', bottom: '24px', right: '24px', zIndex: 1100,
    background: type === 'success' ? colors.success : type === 'error' ? colors.error : colors.warning,
    color: 'white', padding: '16px 24px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', gap: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)', animation: 'slideIn 0.3s ease'
  }}>
    {type === 'success' ? <Check size={20} /> : <X size={20} />}
    <span style={{ fontWeight: '500' }}>{message}</span>
    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '8px' }}>
      <X size={18} />
    </button>
  </div>
);

// Spinner Component
const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
    <div style={{
      width: '48px', height: '48px', border: '4px solid #e2e8f0',
      borderTop: `4px solid ${colors.cameroonGreen}`, borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
  </div>
);

// Media Picker Modal
const MediaPickerModal = ({ onClose, onSelect, token, isDark }) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    const res = await api.get('/media', token);
    if (res.success) {
      setMedia(res.data.filter(m => m.mime_type?.startsWith('image/')));
    }
    setLoading(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('files', file);

    const res = await api.upload('/media/upload', formData, token);
    if (res.success) {
      await fetchMedia();
      // Auto-select the uploaded file
      if (res.data?.[0]?.url) {
        onSelect(res.data[0].url);
      }
    }
    setUploading(false);
  };

  const filteredMedia = media.filter(m =>
    m.original_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.url?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050,
      backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div style={{
        background: isDark ? '#1e293b' : '#ffffff',
        borderRadius: '20px', width: '90%', maxWidth: '1000px', maxHeight: '85vh',
        overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FolderOpen size={24} style={{ color: colors.cameroonGreen }} />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>
              Gestionnaire de Médias
            </h2>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: isDark ? '#94a3b8' : '#6b7280', padding: '8px'
          }}>
            <X size={24} />
          </button>
        </div>

        {/* Toolbar */}
        <div style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px'
        }}>
          {/* Search */}
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: isDark ? '#64748b' : '#94a3b8' }} />
            <input
              type="text"
              placeholder="Rechercher une image..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px 10px 40px', borderRadius: '10px',
                border: `1px solid ${isDark ? '#475569' : '#d1d5db'}`,
                background: isDark ? '#0f172a' : '#f8fafc',
                color: isDark ? '#e2e8f0' : '#1e293b',
                fontSize: '14px'
              }}
            />
          </div>

          {/* View Toggle */}
          <div style={{ display: 'flex', gap: '4px', background: isDark ? '#0f172a' : '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                background: viewMode === 'grid' ? colors.cameroonGreen : 'transparent',
                color: viewMode === 'grid' ? 'white' : (isDark ? '#94a3b8' : '#64748b')
              }}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                background: viewMode === 'list' ? colors.cameroonGreen : 'transparent',
                color: viewMode === 'list' ? 'white' : (isDark ? '#94a3b8' : '#64748b')
              }}
            >
              <List size={18} />
            </button>
          </div>

          {/* Upload Button */}
          <label style={{
            padding: '10px 20px', borderRadius: '10px',
            background: `linear-gradient(135deg, ${colors.cameroonGreen} 0%, ${colors.teal} 100%)`,
            color: 'white', fontWeight: '600', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            opacity: uploading ? 0.7 : 1
          }}>
            {uploading ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={18} />}
            {uploading ? 'Upload...' : 'Uploader'}
            <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
          </label>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', maxHeight: '55vh', overflowY: 'auto' }}>
          {loading ? (
            <Spinner />
          ) : filteredMedia.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: isDark ? '#64748b' : '#94a3b8' }}>
              <ImageIcon size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>Aucune image trouvée</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelect(item.url)}
                  style={{
                    aspectRatio: '1', borderRadius: '12px', overflow: 'hidden',
                    border: `2px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                    cursor: 'pointer', position: 'relative',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.cameroonGreen}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = isDark ? '#334155' : '#e5e7eb'}
                >
                  <img
                    src={getImageUrl(item.url)}
                    alt={item.original_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    padding: '8px', color: 'white', fontSize: '11px',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    {item.original_name}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelect(item.url)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '12px', borderRadius: '10px',
                    background: isDark ? '#0f172a' : '#f8fafc',
                    cursor: 'pointer', transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = isDark ? '#334155' : '#e5e7eb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = isDark ? '#0f172a' : '#f8fafc'}
                >
                  <img
                    src={getImageUrl(item.url)}
                    alt={item.original_name}
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>{item.original_name}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: isDark ? '#64748b' : '#94a3b8' }}>{item.url}</p>
                  </div>
                  <Check size={20} style={{ color: colors.cameroonGreen }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Image Field Component
const ImageField = ({ label, value, onChange, isDark, token }) => {
  const [showPicker, setShowPicker] = useState(false);

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/images/')) return `http://localhost:3002${path}`; // Frontend public images
    return `http://localhost:5000${path}`; // Backend uploads
  };

  const handleSelect = (path) => {
    onChange(path);
    setShowPicker(false);
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#374151', fontSize: '14px' }}>
        {label} <ImageIcon size={14} style={{ marginLeft: '6px', opacity: 0.5 }} />
      </label>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        {/* Preview */}
        <div style={{
          width: '120px', height: '80px', borderRadius: '10px',
          border: `2px dashed ${isDark ? '#475569' : '#d1d5db'}`,
          overflow: 'hidden', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isDark ? '#0f172a' : '#f8fafc'
        }}>
          {value ? (
            <img src={getImageUrl(value)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <ImageIcon size={32} style={{ color: isDark ? '#475569' : '#cbd5e1' }} />
          )}
        </div>

        {/* Controls */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/images/exemple.jpg"
            style={{
              width: '100%', padding: '10px 12px', borderRadius: '8px',
              border: `1px solid ${isDark ? '#475569' : '#d1d5db'}`,
              background: isDark ? '#0f172a' : '#ffffff',
              color: isDark ? '#e2e8f0' : '#1e293b',
              fontSize: '13px', fontFamily: 'monospace'
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              style={{
                padding: '8px 16px', borderRadius: '8px',
                background: isDark ? '#334155' : '#f1f5f9',
                color: isDark ? '#e2e8f0' : '#475569',
                border: 'none', fontSize: '13px', fontWeight: '500',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <FolderOpen size={16} /> Parcourir
            </button>
            <label style={{
              padding: '8px 16px', borderRadius: '8px',
              background: `${colors.cameroonGreen}15`,
              color: colors.cameroonGreen,
              fontSize: '13px', fontWeight: '500',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <Upload size={16} /> Uploader
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append('files', file);
                  const res = await api.upload('/media/upload', formData, token);
                  if (res.success && res.data?.[0]?.url) {
                    onChange(res.data[0].url);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {showPicker && (
        <MediaPickerModal
          onClose={() => setShowPicker(false)}
          onSelect={handleSelect}
          token={token}
          isDark={isDark}
        />
      )}
    </div>
  );
};

// Section Editor Modal
const SectionEditorModal = ({ section, onClose, onSave, isDark, token }) => {
  const [editData, setEditData] = useState({
    section_name: section?.section_name || '',
    content_fr: section?.content_fr || {},
    content_en: section?.content_en || {},
    is_active: section?.is_active ?? true
  });
  const [activeLang, setActiveLang] = useState('fr');
  const [saving, setSaving] = useState(false);

  const handleContentChange = (key, value) => {
    const langKey = activeLang === 'fr' ? 'content_fr' : 'content_en';
    setEditData(prev => ({
      ...prev,
      [langKey]: { ...prev[langKey], [key]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(editData);
    setSaving(false);
  };

  const currentContent = activeLang === 'fr' ? editData.content_fr : editData.content_en;

  // Handle array item change
  const handleArrayItemChange = (key, index, newValue) => {
    const langKey = activeLang === 'fr' ? 'content_fr' : 'content_en';
    const currentArray = [...(editData[langKey][key] || [])];
    currentArray[index] = newValue;
    setEditData(prev => ({
      ...prev,
      [langKey]: { ...prev[langKey], [key]: currentArray }
    }));
  };

  // Handle partner item change
  const handlePartnerItemChange = (index, field, newValue) => {
    const langKey = activeLang === 'fr' ? 'content_fr' : 'content_en';
    const currentArray = [...(editData[langKey].items || [])];
    currentArray[index] = { ...currentArray[index], [field]: newValue };
    setEditData(prev => ({
      ...prev,
      [langKey]: { ...prev[langKey], items: currentArray }
    }));
  };

  // Add new item to array
  const addArrayItem = (key, defaultValue = '') => {
    const langKey = activeLang === 'fr' ? 'content_fr' : 'content_en';
    const currentArray = [...(editData[langKey][key] || [])];
    currentArray.push(defaultValue);
    setEditData(prev => ({
      ...prev,
      [langKey]: { ...prev[langKey], [key]: currentArray }
    }));
  };

  // Remove item from array
  const removeArrayItem = (key, index) => {
    const langKey = activeLang === 'fr' ? 'content_fr' : 'content_en';
    const currentArray = [...(editData[langKey][key] || [])];
    currentArray.splice(index, 1);
    setEditData(prev => ({
      ...prev,
      [langKey]: { ...prev[langKey], [key]: currentArray }
    }));
  };

  // Add new partner
  const addPartner = () => {
    const langKey = activeLang === 'fr' ? 'content_fr' : 'content_en';
    const currentArray = [...(editData[langKey].items || [])];
    currentArray.push({ name: 'Nouveau Partenaire', logo: '', url: '' });
    setEditData(prev => ({
      ...prev,
      [langKey]: { ...prev[langKey], items: currentArray }
    }));
  };

  // Remove partner
  const removePartner = (index) => {
    const langKey = activeLang === 'fr' ? 'content_fr' : 'content_en';
    const currentArray = [...(editData[langKey].items || [])];
    currentArray.splice(index, 1);
    setEditData(prev => ({
      ...prev,
      [langKey]: { ...prev[langKey], items: currentArray }
    }));
  };

  // Render fields based on content structure
  const renderFields = () => {
    if (!currentContent) return null;

    return Object.entries(currentContent).map(([key, value]) => {
      const fieldLabel = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');

      // Boolean field (toggle)
      if (typeof value === 'boolean') {
        return (
          <div key={key} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{
              position: 'relative', display: 'inline-block', width: '50px', height: '26px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleContentChange(key, e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute', cursor: 'pointer', inset: 0,
                background: value ? colors.cameroonGreen : (isDark ? '#475569' : '#cbd5e1'),
                borderRadius: '26px', transition: 'all 0.3s ease'
              }}>
                <span style={{
                  position: 'absolute', height: '20px', width: '20px',
                  left: value ? '27px' : '3px', bottom: '3px',
                  background: 'white', borderRadius: '50%',
                  transition: 'all 0.3s ease'
                }} />
              </span>
            </label>
            <span style={{ fontWeight: '600', color: isDark ? '#e2e8f0' : '#374151', fontSize: '14px' }}>
              {fieldLabel}
            </span>
          </div>
        );
      }

      // Array of strings (features)
      if (Array.isArray(value) && (key.includes('features') || (typeof value[0] === 'string'))) {
        return (
          <div key={key} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontWeight: '600', color: isDark ? '#e2e8f0' : '#374151', fontSize: '14px' }}>
                {fieldLabel}
              </label>
              <button
                type="button"
                onClick={() => addArrayItem(key, '')}
                style={{
                  padding: '6px 12px', borderRadius: '8px',
                  background: `${colors.cameroonGreen}20`, color: colors.cameroonGreen,
                  border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                <Plus size={14} /> Ajouter
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {value.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={item || ''}
                    onChange={(e) => handleArrayItemChange(key, index, e.target.value)}
                    style={{
                      flex: 1, padding: '10px 12px', borderRadius: '8px',
                      border: `1px solid ${isDark ? '#475569' : '#d1d5db'}`,
                      background: isDark ? '#0f172a' : '#ffffff',
                      color: isDark ? '#e2e8f0' : '#1e293b',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem(key, index)}
                    style={{
                      padding: '8px', borderRadius: '8px',
                      background: `${colors.error}20`, color: colors.error,
                      border: 'none', cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // Array of objects (partners/items)
      if (key === 'items' && Array.isArray(value)) {
        return (
          <div key={key} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontWeight: '600', color: isDark ? '#e2e8f0' : '#374151', fontSize: '14px' }}>
                Partenaires ({value.length})
              </label>
              <button
                type="button"
                onClick={addPartner}
                style={{
                  padding: '8px 16px', borderRadius: '8px',
                  background: `linear-gradient(135deg, ${colors.cameroonGreen} 0%, ${colors.teal} 100%)`,
                  color: 'white', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Plus size={16} /> Nouveau Partenaire
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
              {value.map((item, index) => (
                <div key={index} style={{
                  padding: '16px', borderRadius: '12px',
                  background: isDark ? '#0f172a' : '#f8fafc',
                  border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: '600', color: isDark ? '#e2e8f0' : '#374151', fontSize: '13px' }}>
                      #{index + 1} - {item.name || 'Sans nom'}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePartner(index)}
                      style={{
                        padding: '6px 10px', borderRadius: '6px',
                        background: `${colors.error}20`, color: colors.error,
                        border: 'none', fontSize: '12px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>Nom</label>
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => handlePartnerItemChange(index, 'name', e.target.value)}
                        style={{
                          width: '100%', padding: '8px 10px', borderRadius: '6px',
                          border: `1px solid ${isDark ? '#475569' : '#d1d5db'}`,
                          background: isDark ? '#1e293b' : '#ffffff',
                          color: isDark ? '#e2e8f0' : '#1e293b',
                          fontSize: '13px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>URL</label>
                      <input
                        type="text"
                        value={item.url || ''}
                        onChange={(e) => handlePartnerItemChange(index, 'url', e.target.value)}
                        placeholder="https://..."
                        style={{
                          width: '100%', padding: '8px 10px', borderRadius: '6px',
                          border: `1px solid ${isDark ? '#475569' : '#d1d5db'}`,
                          background: isDark ? '#1e293b' : '#ffffff',
                          color: isDark ? '#e2e8f0' : '#1e293b',
                          fontSize: '13px'
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>Logo</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {item.logo && (
                        <div style={{
                          width: '50px', height: '50px', borderRadius: '8px',
                          border: `1px solid ${isDark ? '#475569' : '#d1d5db'}`,
                          overflow: 'hidden', flexShrink: 0
                        }}>
                          <img
                            src={item.logo.startsWith('/images/') ? `http://localhost:3002${item.logo}` : `http://localhost:5000${item.logo}`}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      )}
                      <input
                        type="text"
                        value={item.logo || ''}
                        onChange={(e) => handlePartnerItemChange(index, 'logo', e.target.value)}
                        placeholder="/images/partners/logo.png"
                        style={{
                          flex: 1, padding: '8px 10px', borderRadius: '6px',
                          border: `1px solid ${isDark ? '#475569' : '#d1d5db'}`,
                          background: isDark ? '#1e293b' : '#ffffff',
                          color: isDark ? '#e2e8f0' : '#1e293b',
                          fontSize: '13px', fontFamily: 'monospace'
                        }}
                      />
                      <label style={{
                        padding: '8px 12px', borderRadius: '6px',
                        background: `${colors.cameroonGreen}15`, color: colors.cameroonGreen,
                        fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}>
                        <Upload size={14} /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append('files', file);
                            const res = await api.upload('/media/upload', formData, token);
                            if (res.success && res.data?.[0]?.url) {
                              handlePartnerItemChange(index, 'logo', res.data[0].url);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      const isLongText = typeof value === 'string' && value.length > 100;
      const isImage = key.toLowerCase().includes('image') || key.toLowerCase().includes('logo');

      // Image field with picker
      if (isImage && typeof value === 'string') {
        return (
          <ImageField
            key={key}
            label={fieldLabel}
            value={value}
            onChange={(newValue) => handleContentChange(key, newValue)}
            isDark={isDark}
            token={token}
          />
        );
      }

      // Skip arrays that are already handled
      if (Array.isArray(value)) return null;

      return (
        <div key={key} style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#374151', fontSize: '14px' }}>
            {fieldLabel}
          </label>
          {isLongText ? (
            <textarea
              value={value || ''}
              onChange={(e) => handleContentChange(key, e.target.value)}
              rows={4}
              style={{
                width: '100%', padding: '12px', borderRadius: '8px',
                border: `1px solid ${isDark ? '#475569' : '#d1d5db'}`,
                background: isDark ? '#0f172a' : '#ffffff',
                color: isDark ? '#e2e8f0' : '#1e293b',
                fontSize: '14px', resize: 'vertical', fontFamily: 'inherit'
              }}
            />
          ) : (
            <input
              type="text"
              value={typeof value === 'string' ? value : JSON.stringify(value)}
              onChange={(e) => handleContentChange(key, e.target.value)}
              style={{
                width: '100%', padding: '12px', borderRadius: '8px',
                border: `1px solid ${isDark ? '#475569' : '#d1d5db'}`,
                background: isDark ? '#0f172a' : '#ffffff',
                color: isDark ? '#e2e8f0' : '#1e293b',
                fontSize: '14px', fontFamily: 'inherit'
              }}
            />
          )}
        </div>
      );
    });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div style={{
        background: isDark ? '#1e293b' : '#ffffff',
        borderRadius: '20px', width: '90%', maxWidth: '800px', maxHeight: '90vh',
        overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>
              Modifier: {section?.section_name}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: isDark ? '#94a3b8' : '#6b7280' }}>
              Section: {section?.section_key}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: isDark ? '#94a3b8' : '#6b7280', padding: '8px'
          }}>
            <X size={24} />
          </button>
        </div>

        {/* Language Tabs */}
        <div style={{ padding: '16px 24px 0', display: 'flex', gap: '8px', borderBottom: `1px solid ${isDark ? '#334155' : '#e5e7eb'}` }}>
          {['fr', 'en'].map(lang => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              style={{
                padding: '12px 24px',
                background: activeLang === lang ? (isDark ? '#334155' : '#f0fdf4') : 'transparent',
                border: 'none',
                borderBottom: activeLang === lang ? `3px solid ${colors.cameroonGreen}` : '3px solid transparent',
                color: activeLang === lang ? colors.cameroonGreen : (isDark ? '#94a3b8' : '#6b7280'),
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                marginBottom: '-1px',
                transition: 'all 0.2s ease'
              }}
            >
              <Globe size={16} />
              {lang === 'fr' ? 'Français' : 'English'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
          {renderFields()}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={editData.is_active}
              onChange={(e) => setEditData(prev => ({ ...prev, is_active: e.target.checked }))}
              style={{ width: '18px', height: '18px', accentColor: colors.cameroonGreen }}
            />
            <span style={{ color: isDark ? '#e2e8f0' : '#374151', fontWeight: '500' }}>Section active</span>
          </label>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onClose} style={{
              padding: '12px 24px', borderRadius: '10px',
              background: isDark ? '#334155' : '#f1f5f9',
              color: isDark ? '#e2e8f0' : '#475569',
              border: 'none', fontWeight: '600', cursor: 'pointer'
            }}>
              Annuler
            </button>
            <button onClick={handleSave} disabled={saving} style={{
              padding: '12px 24px', borderRadius: '10px',
              background: `linear-gradient(135deg, ${colors.cameroonGreen} 0%, ${colors.teal} 100%)`,
              color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              opacity: saving ? 0.7 : 1
            }}>
              {saving ? <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main PageBuilder Component
const PageBuilderPage = ({ isDark, token }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [editingSection, setEditingSection] = useState(null);

  const styles = {
    card: {
      background: isDark ? '#1e293b' : '#ffffff',
      borderRadius: '16px',
      border: `1px solid ${isDark ? '#334155' : 'rgba(0,122,51,0.1)'}`,
      padding: '24px',
      boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,122,51,0.08)'
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
      fontSize: '14px'
    },
    btnIcon: {
      background: isDark ? '#334155' : '#f1f5f9',
      color: isDark ? '#e2e8f0' : '#475569',
      border: 'none',
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    textMuted: { color: isDark ? '#94a3b8' : '#64748b', fontSize: '14px' }
  };

  const fetchSections = useCallback(async () => {
    setLoading(true);
    const res = await api.get('/homepage/all', token);
    if (res.success) {
      setSections(res.data);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleToggleActive = async (section) => {
    const res = await api.put(`/homepage/${section.id}/toggle`, {}, token);
    if (res.success) {
      setSections(prev => prev.map(s => s.id === section.id ? { ...s, is_active: !s.is_active } : s));
      setToast({ message: `Section ${!section.is_active ? 'activée' : 'désactivée'}`, type: 'success' });
    }
  };

  const handleSaveSection = async (data) => {
    const res = await api.put(`/homepage/${editingSection.id}`, {
      ...data,
      sort_order: editingSection.sort_order
    }, token);

    if (res.success) {
      setSections(prev => prev.map(s => s.id === editingSection.id ? { ...s, ...data } : s));
      setToast({ message: 'Section mise à jour', type: 'success' });
      setEditingSection(null);
    } else {
      setToast({ message: 'Erreur lors de la mise à jour', type: 'error' });
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {editingSection && (
        <SectionEditorModal
          section={editingSection}
          onClose={() => setEditingSection(null)}
          onSave={handleSaveSection}
          isDark={isDark}
          token={token}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '800', color: isDark ? '#e2e8f0' : '#1e293b' }}>
            Home Page Builder
          </h1>
          <p style={styles.textMuted}>Gérez le contenu de la page d'accueil en français et anglais</p>
        </div>
        <button style={styles.btnPrimary} onClick={fetchSections}>
          <RefreshCw size={20} /> Actualiser
        </button>
      </div>

      {/* Sections List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sections.map((section, index) => (
          <div key={section.id} style={{
            ...styles.card,
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            opacity: section.is_active ? 1 : 0.6,
            transition: 'all 0.3s ease'
          }}>
            {/* Drag Handle */}
            <div style={{ color: isDark ? '#475569' : '#cbd5e1', cursor: 'grab' }}>
              <GripVertical size={24} />
            </div>

            {/* Order Number */}
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: `linear-gradient(135deg, ${colors.cameroonGreen}20 0%, ${colors.teal}20 100%)`,
              color: colors.cameroonGreen,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '700', fontSize: '16px'
            }}>
              {index + 1}
            </div>

            {/* Section Info */}
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                {section.section_name}
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#64748b' : '#94a3b8' }}>
                Clé: <code style={{ background: isDark ? '#334155' : '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                  {section.section_key}
                </code>
              </p>
            </div>

            {/* Status Badge */}
            <div style={{
              padding: '6px 14px', borderRadius: '20px',
              background: section.is_active ? `${colors.success}20` : `${colors.error}20`,
              color: section.is_active ? colors.success : colors.error,
              fontSize: '13px', fontWeight: '600'
            }}>
              {section.is_active ? 'Active' : 'Inactive'}
            </div>

            {/* Language Indicators */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{
                padding: '4px 10px', borderRadius: '6px',
                background: isDark ? '#334155' : '#f1f5f9',
                color: isDark ? '#94a3b8' : '#64748b',
                fontSize: '12px', fontWeight: '600'
              }}>FR</span>
              <span style={{
                padding: '4px 10px', borderRadius: '6px',
                background: isDark ? '#334155' : '#f1f5f9',
                color: isDark ? '#94a3b8' : '#64748b',
                fontSize: '12px', fontWeight: '600'
              }}>EN</span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setEditingSection(section)}
                style={{ ...styles.btnIcon, background: `${colors.primary}20`, color: colors.primary }}
                title="Modifier"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleToggleActive(section)}
                style={{ ...styles.btnIcon, background: section.is_active ? `${colors.warning}20` : `${colors.success}20`, color: section.is_active ? colors.warning : colors.success }}
                title={section.is_active ? 'Désactiver' : 'Activer'}
              >
                {section.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {sections.length === 0 && (
        <div style={{ ...styles.card, textAlign: 'center', padding: '60px' }}>
          <LayoutTemplate size={64} style={{ color: isDark ? '#475569' : '#cbd5e1', marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px 0', color: isDark ? '#e2e8f0' : '#1e293b' }}>Aucune section</h3>
          <p style={styles.textMuted}>Exécutez le script SQL pour créer les sections par défaut</p>
        </div>
      )}
    </div>
  );
};

export default PageBuilderPage;
