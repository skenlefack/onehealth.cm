/**
 * ConfirmModal - Modale de confirmation avec titre, message et boutons
 */

import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmer l\'action',
  message = 'Êtes-vous sûr de vouloir effectuer cette action ?',
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger', // 'danger' | 'warning' | 'info'
  isDark = false,
  loading = false,
}) => {
  // Fermer avec Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const variantColors = {
    danger: { bg: '#FEE2E2', color: '#DC2626', button: '#DC2626', buttonHover: '#B91C1C' },
    warning: { bg: '#FEF3C7', color: '#D97706', button: '#D97706', buttonHover: '#B45309' },
    info: { bg: '#DBEAFE', color: '#2563EB', button: '#2563EB', buttonHover: '#1D4ED8' },
  };

  const colors = variantColors[variant] || variantColors.danger;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      animation: 'cohrmFadeIn 0.2s ease-out',
    },
    modal: {
      backgroundColor: isDark ? '#1e293b' : '#fff',
      borderRadius: 16,
      padding: '28px',
      maxWidth: 440,
      width: '90%',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      animation: 'cohrmSlideIn 0.2s ease-out',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    iconWrapper: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    title: {
      fontSize: 18,
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#1f2937',
      flex: 1,
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 4,
      borderRadius: 6,
      color: isDark ? '#94a3b8' : '#9CA3AF',
      display: 'flex',
    },
    message: {
      fontSize: 14,
      color: isDark ? '#94a3b8' : '#6B7280',
      lineHeight: 1.6,
      marginBottom: 24,
    },
    actions: {
      display: 'flex',
      gap: 12,
      justifyContent: 'flex-end',
    },
    cancelBtn: {
      padding: '10px 20px',
      borderRadius: 8,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: 'transparent',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
    },
    confirmBtn: {
      padding: '10px 20px',
      borderRadius: 8,
      border: 'none',
      backgroundColor: colors.button,
      color: '#fff',
      fontSize: 14,
      fontWeight: 600,
      cursor: loading ? 'wait' : 'pointer',
      opacity: loading ? 0.7 : 1,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
  };

  return (
    <>
      <style>{`
        @keyframes cohrmFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cohrmSlideIn { from { transform: scale(0.95) translateY(-10px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
      `}</style>
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={styles.header}>
            <div style={styles.iconWrapper}>
              <AlertTriangle size={22} color={colors.color} />
            </div>
            <div style={styles.title}>{title}</div>
            <button style={styles.closeBtn} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div style={styles.message}>{message}</div>
          <div style={styles.actions}>
            <button style={styles.cancelBtn} onClick={onClose}>
              {cancelLabel}
            </button>
            <button
              style={styles.confirmBtn}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading && (
                <span style={{
                  width: 14,
                  height: 14,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'cohrmSpin 0.6s linear infinite',
                }} />
              )}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;
