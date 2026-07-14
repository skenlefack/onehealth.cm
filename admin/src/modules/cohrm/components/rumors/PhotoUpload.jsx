/**
 * PhotoUpload - Composant d'upload de photos pour les rumeurs COHRM
 * Drag-and-drop, prévisualisation, légendes, progression
 */

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { COHRM_COLORS } from '../../utils/constants';

const PhotoUpload = ({ rumorId, isDark, onUpload, maxPhotos = 10, existingCount = 0 }) => {
  const { t } = useTranslation('cohrm');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const remaining = maxPhotos - existingCount;

  const handleFiles = useCallback((newFiles) => {
    const fileList = Array.from(newFiles).slice(0, remaining - files.length);
    const validFiles = fileList.filter(f => {
      const valid = /\.(jpg|jpeg|png|webp)$/i.test(f.name);
      const sizeOk = f.size <= 5 * 1024 * 1024;
      return valid && sizeOk;
    });

    const withPreviews = validFiles.map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
      caption: '',
    }));

    setFiles(prev => [...prev, ...withPreviews]);
  }, [files.length, remaining]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    setFiles(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateCaption = (index, caption) => {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, caption } : f));
  };

  const handleUpload = async () => {
    if (!files.length || !rumorId) return;
    setUploading(true);

    const formData = new FormData();
    files.forEach(f => formData.append('photos', f.file));
    formData.append('captions', JSON.stringify(files.map(f => f.caption)));

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || '/api';
      const res = await fetch(`${API_URL}/cohrm/rumors/${rumorId}/photos`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        files.forEach(f => URL.revokeObjectURL(f.preview));
        setFiles([]);
        onUpload?.(data.data);
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const s = {
    container: { marginBottom: 20 },
    dropZone: {
      border: `2px dashed ${dragOver ? COHRM_COLORS.primary : (isDark ? '#334155' : '#D1D5DB')}`,
      borderRadius: 12,
      padding: '32px 20px',
      textAlign: 'center',
      cursor: 'pointer',
      backgroundColor: dragOver
        ? (isDark ? 'rgba(255,87,34,0.08)' : 'rgba(255,87,34,0.04)')
        : (isDark ? '#0f172a' : '#FAFAFA'),
      transition: 'all 0.2s',
    },
    dropIcon: {
      width: 48, height: 48, borderRadius: '50%',
      backgroundColor: isDark ? '#1e293b' : '#F3F4F6',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 12px',
    },
    dropText: { fontSize: 14, color: isDark ? '#94a3b8' : '#6B7280', marginBottom: 4 },
    dropHint: { fontSize: 12, color: isDark ? '#475569' : '#9CA3AF' },
    grid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: 12, marginTop: 16,
    },
    preview: {
      position: 'relative', borderRadius: 10, overflow: 'hidden',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      backgroundColor: isDark ? '#1e293b' : '#fff',
    },
    previewImg: { width: '100%', height: 120, objectFit: 'cover', display: 'block' },
    removeBtn: {
      position: 'absolute', top: 6, right: 6, width: 24, height: 24,
      borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff',
      border: 'none', cursor: 'pointer', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 0,
    },
    captionInput: {
      width: '100%', padding: '6px 8px', border: 'none',
      borderTop: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      backgroundColor: 'transparent', fontSize: 12,
      color: isDark ? '#e2e8f0' : '#374151', outline: 'none', boxSizing: 'border-box',
    },
    uploadBtn: {
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '10px 24px', borderRadius: 8, border: 'none',
      backgroundColor: COHRM_COLORS.primary, color: '#fff',
      fontSize: 14, fontWeight: 600, cursor: uploading ? 'wait' : 'pointer',
      marginTop: 12, opacity: uploading ? 0.7 : 1,
    },
  };

  return (
    <div style={s.container}>
      {remaining > 0 && (
        <div
          style={s.dropZone}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
        >
          <div style={s.dropIcon}>
            <Upload size={22} color={isDark ? '#64748b' : '#9CA3AF'} />
          </div>
          <div style={s.dropText}>
            {t('photos.dragDrop', 'Glissez des photos ici ou cliquez pour parcourir')}
          </div>
          <div style={s.dropHint}>
            {t('photos.maxSize', 'JPG, PNG, WebP - Max 5 Mo')} · {t('photos.remaining', { count: remaining })}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp"
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {files.length > 0 && (
        <>
          <div style={s.grid}>
            {files.map((f, i) => (
              <div key={i} style={s.preview}>
                <img src={f.preview} alt="" style={s.previewImg} />
                <button style={s.removeBtn} onClick={() => removeFile(i)}>
                  <X size={14} />
                </button>
                <input
                  style={s.captionInput}
                  placeholder={t('photos.caption', 'Légende...')}
                  value={f.caption}
                  onChange={(e) => updateCaption(i, e.target.value)}
                />
              </div>
            ))}
          </div>
          <button style={s.uploadBtn} onClick={handleUpload} disabled={uploading}>
            {uploading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={16} />}
            {uploading
              ? t('photos.uploading', 'Envoi en cours...')
              : t('photos.upload', `Envoyer ${files.length} photo(s)`)}
          </button>
        </>
      )}
    </div>
  );
};

export default PhotoUpload;
