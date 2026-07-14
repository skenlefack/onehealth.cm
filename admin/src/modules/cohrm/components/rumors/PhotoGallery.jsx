/**
 * PhotoGallery - Galerie de photos avec lightbox pour les rumeurs COHRM
 */

import React, { useState } from 'react';
import {
  ChevronLeft, ChevronRight, X, Download, Trash2, Image,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { COHRM_COLORS } from '../../utils/constants';

const PhotoGallery = ({ photos = [], isDark, onDelete, canDelete = false }) => {
  const { t } = useTranslation('cohrm');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevPhoto = () => setLightboxIndex(i => (i > 0 ? i - 1 : photos.length - 1));
  const nextPhoto = () => setLightboxIndex(i => (i < photos.length - 1 ? i + 1 : 0));

  const handleDownload = (photo) => {
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = photo.url.split('/').pop();
    a.click();
  };

  const handleDelete = (photoId) => {
    onDelete?.(photoId);
    setConfirmDelete(null);
    if (lightboxIndex !== null && photos.length <= 1) closeLightbox();
  };

  const API_URL = process.env.REACT_APP_API_URL || '';
  const getUrl = (url) => url?.startsWith('http') ? url : `${API_URL.replace('/api', '')}${url}`;

  const s = {
    container: { marginBottom: 16 },
    grid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: 10,
    },
    thumb: {
      position: 'relative', borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      aspectRatio: '1', backgroundColor: isDark ? '#1e293b' : '#F3F4F6',
    },
    thumbImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
    thumbCaption: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: '16px 8px 6px', fontSize: 11, color: '#fff',
      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    },
    deleteOverlay: {
      position: 'absolute', top: 4, right: 4,
      width: 26, height: 26, borderRadius: '50%',
      backgroundColor: 'rgba(239,68,68,0.85)', color: '#fff',
      border: 'none', cursor: 'pointer', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 0,
    },
    empty: {
      textAlign: 'center', padding: '40px 20px',
      color: isDark ? '#64748b' : '#9CA3AF',
    },
    emptyIcon: {
      width: 48, height: 48, borderRadius: '50%',
      backgroundColor: isDark ? '#1e293b' : '#F3F4F6',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 12px',
    },
    // Lightbox
    lightbox: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 10000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    },
    lightboxImg: { maxWidth: '85vw', maxHeight: '75vh', objectFit: 'contain', borderRadius: 8 },
    lightboxClose: {
      position: 'absolute', top: 16, right: 16, padding: 10, borderRadius: '50%',
      backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer',
    },
    lightboxNav: (side) => ({
      position: 'absolute', [side]: 16, top: '50%', transform: 'translateY(-50%)',
      padding: 12, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)',
      border: 'none', color: '#fff', cursor: 'pointer',
    }),
    lightboxCaption: {
      color: '#fff', fontSize: 14, marginTop: 12, textAlign: 'center',
      maxWidth: '80vw',
    },
    lightboxActions: {
      display: 'flex', gap: 10, marginTop: 16,
    },
    lightboxBtn: {
      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
      borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)',
      backgroundColor: 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer',
    },
    confirmModal: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10001,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    confirmBox: {
      backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: 12,
      padding: 24, maxWidth: 360, textAlign: 'center',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
  };

  if (photos.length === 0) {
    return (
      <div style={s.empty}>
        <div style={s.emptyIcon}>
          <Image size={22} color={isDark ? '#475569' : '#D1D5DB'} />
        </div>
        <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
          {t('photos.noPhotos', 'Aucune photo')}
        </p>
      </div>
    );
  }

  return (
    <div style={s.container}>
      <div style={s.grid}>
        {photos.map((photo, index) => (
          <div key={photo.id} style={s.thumb} onClick={() => openLightbox(index)}>
            <img src={getUrl(photo.thumbnail_url || photo.url)} alt={photo.caption || ''} style={s.thumbImg} />
            {photo.caption && <div style={s.thumbCaption}>{photo.caption}</div>}
            {canDelete && (
              <button
                style={s.deleteOverlay}
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(photo.id); }}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div style={s.lightbox} onClick={closeLightbox}>
          <div onClick={(e) => e.stopPropagation()}>
            <img
              src={getUrl(photos[lightboxIndex].url)}
              alt={photos[lightboxIndex].caption || ''}
              style={s.lightboxImg}
            />
            {photos[lightboxIndex].caption && (
              <div style={s.lightboxCaption}>{photos[lightboxIndex].caption}</div>
            )}
            <div style={s.lightboxActions}>
              <button style={s.lightboxBtn} onClick={() => handleDownload(photos[lightboxIndex])}>
                <Download size={15} /> {t('photos.download', 'Télécharger')}
              </button>
              {canDelete && (
                <button
                  style={{ ...s.lightboxBtn, borderColor: 'rgba(239,68,68,0.5)', color: '#f87171' }}
                  onClick={() => setConfirmDelete(photos[lightboxIndex].id)}
                >
                  <Trash2 size={15} /> {t('common.delete', 'Supprimer')}
                </button>
              )}
            </div>
          </div>
          <button style={s.lightboxClose} onClick={closeLightbox}><X size={20} /></button>
          {photos.length > 1 && (
            <>
              <button style={s.lightboxNav('left')} onClick={(e) => { e.stopPropagation(); prevPhoto(); }}>
                <ChevronLeft size={24} />
              </button>
              <button style={s.lightboxNav('right')} onClick={(e) => { e.stopPropagation(); nextPhoto(); }}>
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDelete !== null && (
        <div style={s.confirmModal} onClick={() => setConfirmDelete(null)}>
          <div style={s.confirmBox} onClick={(e) => e.stopPropagation()}>
            <p style={{ fontSize: 15, fontWeight: 600, color: isDark ? '#e2e8f0' : '#1f2937', marginBottom: 8 }}>
              {t('photos.confirmDelete', 'Supprimer cette photo ?')}
            </p>
            <p style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#6B7280', marginBottom: 20 }}>
              {t('common.irreversible', 'Cette action est irréversible.')}
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  padding: '8px 20px', borderRadius: 8, fontSize: 13,
                  border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
                  backgroundColor: 'transparent', color: isDark ? '#e2e8f0' : '#374151', cursor: 'pointer',
                }}
              >
                {t('common.cancel', 'Annuler')}
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                style={{
                  padding: '8px 20px', borderRadius: 8, fontSize: 13,
                  border: 'none', backgroundColor: '#EF4444', color: '#fff', cursor: 'pointer',
                }}
              >
                {t('common.delete', 'Supprimer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
