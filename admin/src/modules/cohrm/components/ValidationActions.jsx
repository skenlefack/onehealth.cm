/**
 * ValidationActions - Boutons d'action de validation COHRM
 *
 * Affiche les 4 actions possibles (Valider, Escalader, Rejeter, Retourner)
 * avec modales de confirmation et appels API.
 *
 * Props :
 *   - rumorId (number|string) : ID de la rumeur
 *   - currentLevel (number) : niveau de validation actuel
 *   - user (object) : utilisateur connecté
 *   - isDark (boolean) : mode sombre
 *   - onActionComplete (function) : callback après action réussie
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Check, X, ArrowUpRight, CornerDownLeft,
  AlertTriangle, Loader2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { validateRumor } from '../services/cohrmApi';
import { usePermissions } from '../hooks/usePermissions';
import { VALIDATION_LEVELS, COHRM_COLORS } from '../utils/constants';

// Sons de notification
const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.1;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Audio non supporté
  }
};

// Raisons prédéfinies de rejet
const REJECTION_REASONS = [
  { value: '', label: 'Sélectionner une raison (optionnel)' },
  { value: 'insufficient_data', label: 'Données insuffisantes' },
  { value: 'false_information', label: 'Information fausse ou non vérifiable' },
  { value: 'duplicate', label: 'Doublon d\'une rumeur existante' },
  { value: 'out_of_scope', label: 'Hors périmètre One Health' },
  { value: 'outdated', label: 'Information obsolète' },
  { value: 'other', label: 'Autre (préciser dans le commentaire)' },
];

const ValidationActions = ({
  rumorId,
  currentLevel = 1,
  user,
  isDark = false,
  onActionComplete,
}) => {
  const { userLevel, canValidate } = usePermissions(user);
  const [activeModal, setActiveModal] = useState(null); // 'validate'|'escalate'|'reject'|'return'
  const [comment, setComment] = useState('');
  const [targetLevel, setTargetLevel] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  // Ne pas afficher si l'utilisateur ne peut pas valider ce niveau
  if (!canValidate(currentLevel)) return null;

  // Niveaux disponibles pour escalade (supérieurs au niveau actuel)
  const escalateLevels = VALIDATION_LEVELS.filter(l => l.level > currentLevel);

  // Niveaux disponibles pour retour (inférieurs au niveau actuel)
  const returnLevels = VALIDATION_LEVELS.filter(l => l.level < currentLevel);

  const resetModal = () => {
    setActiveModal(null);
    setComment('');
    setTargetLevel(null);
    setRejectionReason('');
    setLoading(false);
  };

  const handleAction = async (action) => {
    // Validations côté client
    if (action === 'reject' && (!comment || comment.trim().length < 10)) {
      toast.error('Le motif de rejet doit contenir au moins 10 caractères');
      return;
    }
    if (action === 'return' && !targetLevel) {
      toast.error('Veuillez sélectionner le niveau de retour');
      return;
    }
    if (action === 'return' && (!comment || comment.trim().length < 10)) {
      toast.error('Le motif de retour doit contenir au moins 10 caractères');
      return;
    }
    if (action === 'escalate' && !targetLevel) {
      toast.error('Veuillez sélectionner le niveau cible');
      return;
    }
    if (action === 'escalate' && (!comment || comment.trim().length < 1)) {
      toast.error('Veuillez fournir un motif d\'escalade');
      return;
    }

    setLoading(true);
    try {
      const body = {
        action,
        comment: comment.trim() || undefined,
        target_level: targetLevel || undefined,
      };

      if (action === 'reject' && rejectionReason) {
        body.comment = rejectionReason !== 'other'
          ? `[${REJECTION_REASONS.find(r => r.value === rejectionReason)?.label}] ${comment.trim()}`
          : comment.trim();
      }

      await validateRumor(rumorId, body);

      const messages = {
        validate: 'Rumeur validée avec succès',
        escalate: `Rumeur escaladée au niveau ${targetLevel}`,
        reject: 'Rumeur rejetée',
        return: `Rumeur retournée au niveau ${targetLevel}`,
      };

      toast.success(messages[action]);
      playNotificationSound();
      resetModal();

      if (onActionComplete) {
        onActionComplete(action);
      }
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la validation');
    } finally {
      setLoading(false);
    }
  };

  // Fermer avec Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeModal) resetModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  // Config des boutons
  const actions = [
    {
      id: 'validate',
      label: 'Valider',
      icon: Check,
      color: '#27AE60',
      hoverColor: '#219a52',
      bgLight: '#EAFAF1',
    },
    {
      id: 'escalate',
      label: 'Escalader',
      icon: ArrowUpRight,
      color: '#8E44AD',
      hoverColor: '#7D3C98',
      bgLight: '#F4ECF7',
      disabled: escalateLevels.length === 0,
    },
    {
      id: 'reject',
      label: 'Rejeter',
      icon: X,
      color: '#E74C3C',
      hoverColor: '#CB4335',
      bgLight: '#FDEDEC',
    },
    {
      id: 'return',
      label: 'Retourner',
      icon: CornerDownLeft,
      color: '#E67E22',
      hoverColor: '#CA6F1E',
      bgLight: '#FDF2E9',
      disabled: returnLevels.length === 0,
    },
  ];

  const s = {
    container: {
      padding: '16px 0',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: 12,
    },
    actionBtn: (action, isHovered) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      padding: '14px 20px',
      borderRadius: 12,
      border: 'none',
      backgroundColor: isHovered ? action.hoverColor : action.color,
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      cursor: action.disabled ? 'not-allowed' : 'pointer',
      opacity: action.disabled ? 0.4 : 1,
      transition: 'all 0.2s ease',
      transform: isHovered && !action.disabled ? 'scale(1.03)' : 'scale(1)',
      boxShadow: isHovered && !action.disabled
        ? `0 6px 20px ${action.color}40`
        : `0 2px 8px ${action.color}25`,
      letterSpacing: '0.3px',
    }),
    // --- Modale ---
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 10000,
      animation: 'cohrmVFadeIn 0.2s ease-out',
    },
    modal: {
      backgroundColor: isDark ? '#1e293b' : '#fff',
      borderRadius: '20px 20px 0 0',
      padding: '28px',
      maxWidth: 520,
      width: '100%',
      maxHeight: '80vh',
      overflowY: 'auto',
      boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.3)',
      animation: 'cohrmVSlideUp 0.3s ease-out',
    },
    modalHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 20,
    },
    modalIconWrapper: (color) => ({
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: isDark ? `${color}20` : `${color}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }),
    modalTitle: {
      fontSize: 20,
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#1f2937',
      flex: 1,
    },
    modalCloseBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 6,
      borderRadius: 8,
      color: isDark ? '#94a3b8' : '#9CA3AF',
      display: 'flex',
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      display: 'block',
      fontSize: 13,
      fontWeight: 600,
      color: isDark ? '#94a3b8' : '#6B7280',
      marginBottom: 6,
    },
    textarea: {
      width: '100%',
      minHeight: 100,
      padding: '12px 14px',
      borderRadius: 10,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: isDark ? '#0f172a' : '#fff',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 14,
      fontFamily: 'inherit',
      resize: 'vertical',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box',
    },
    select: {
      width: '100%',
      padding: '10px 14px',
      borderRadius: 10,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: isDark ? '#0f172a' : '#fff',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 14,
      outline: 'none',
      cursor: 'pointer',
      boxSizing: 'border-box',
    },
    charCount: (valid) => ({
      fontSize: 11,
      color: valid ? (isDark ? '#64748b' : '#9CA3AF') : '#E74C3C',
      textAlign: 'right',
      marginTop: 4,
    }),
    modalActions: {
      display: 'flex',
      gap: 12,
      marginTop: 24,
    },
    cancelBtn: {
      flex: 1,
      padding: '12px 20px',
      borderRadius: 10,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: 'transparent',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
    },
    confirmBtn: (color) => ({
      flex: 1,
      padding: '12px 20px',
      borderRadius: 10,
      border: 'none',
      backgroundColor: color,
      color: '#fff',
      fontSize: 14,
      fontWeight: 700,
      cursor: loading ? 'wait' : 'pointer',
      opacity: loading ? 0.7 : 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    }),
    warningBox: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      padding: '12px 14px',
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#FFFBEB',
      border: isDark ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid #FDE68A',
      marginBottom: 16,
      fontSize: 13,
      color: isDark ? '#fbbf24' : '#92400E',
      lineHeight: 1.5,
    },
  };

  // Rendu des modales
  const renderModal = () => {
    if (!activeModal) return null;

    const actionConfig = actions.find(a => a.id === activeModal);
    const Icon = actionConfig.icon;
    const titles = {
      validate: 'Valider la rumeur',
      escalate: 'Escalader la rumeur',
      reject: 'Rejeter la rumeur',
      return: 'Retourner la rumeur',
    };

    return (
      <>
        <style>{`
          @keyframes cohrmVFadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes cohrmVSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
          @keyframes cohrmVSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
        <div style={s.overlay} onClick={resetModal}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={s.modalHeader}>
              <div style={s.modalIconWrapper(actionConfig.color)}>
                <Icon size={24} color={actionConfig.color} />
              </div>
              <div style={s.modalTitle}>{titles[activeModal]}</div>
              <button style={s.modalCloseBtn} onClick={resetModal}>
                <X size={22} />
              </button>
            </div>

            {/* Contenu spécifique à chaque action */}

            {/* VALIDER */}
            {activeModal === 'validate' && (
              <>
                <div style={s.warningBox}>
                  <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>
                    Cette action validera la rumeur au niveau {currentLevel} et la fera progresser
                    au niveau suivant dans le processus de validation.
                  </span>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Commentaire (optionnel)</label>
                  <textarea
                    style={s.textarea}
                    placeholder="Ajoutez un commentaire de validation..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* ESCALADER */}
            {activeModal === 'escalate' && (
              <>
                <div style={s.warningBox}>
                  <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>
                    L'escalade transmettra cette rumeur directement au niveau sélectionné,
                    en contournant les étapes intermédiaires.
                  </span>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Niveau cible *</label>
                  <select
                    style={s.select}
                    value={targetLevel || ''}
                    onChange={(e) => setTargetLevel(Number(e.target.value))}
                  >
                    <option value="">Sélectionner le niveau</option>
                    {escalateLevels.map(l => (
                      <option key={l.level} value={l.level}>
                        Niveau {l.level} — {l.name} ({l.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Motif d'escalade *</label>
                  <textarea
                    style={s.textarea}
                    placeholder="Expliquez pourquoi cette rumeur nécessite une escalade..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* REJETER */}
            {activeModal === 'reject' && (
              <>
                <div style={{
                  ...s.warningBox,
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
                  borderColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FECACA',
                  color: isDark ? '#fca5a5' : '#991B1B',
                }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>
                    Le rejet mettra fin au processus de validation de cette rumeur.
                    Cette action est irréversible.
                  </span>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Raison prédéfinie</label>
                  <select
                    style={s.select}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  >
                    {REJECTION_REASONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Motif détaillé * (min. 10 caractères)</label>
                  <textarea
                    style={s.textarea}
                    placeholder="Expliquez en détail la raison du rejet..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <div style={s.charCount(comment.trim().length >= 10)}>
                    {comment.trim().length}/10 caractères minimum
                  </div>
                </div>
              </>
            )}

            {/* RETOURNER */}
            {activeModal === 'return' && (
              <>
                <div style={s.warningBox}>
                  <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>
                    Le retour renverra cette rumeur au niveau sélectionné pour
                    complément d'information ou correction.
                  </span>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Retourner au niveau *</label>
                  <select
                    style={s.select}
                    value={targetLevel || ''}
                    onChange={(e) => setTargetLevel(Number(e.target.value))}
                  >
                    <option value="">Sélectionner le niveau</option>
                    {returnLevels.map(l => (
                      <option key={l.level} value={l.level}>
                        Niveau {l.level} — {l.name} ({l.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Motif de retour * (min. 10 caractères)</label>
                  <textarea
                    style={s.textarea}
                    placeholder="Expliquez ce qui doit être corrigé ou complété..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <div style={s.charCount(comment.trim().length >= 10)}>
                    {comment.trim().length}/10 caractères minimum
                  </div>
                </div>
              </>
            )}

            {/* Actions de la modale */}
            <div style={s.modalActions}>
              <button style={s.cancelBtn} onClick={resetModal} disabled={loading}>
                Annuler
              </button>
              <button
                style={s.confirmBtn(actionConfig.color)}
                onClick={() => handleAction(activeModal)}
                disabled={loading}
              >
                {loading && (
                  <Loader2 size={16} style={{ animation: 'cohrmVSpin 0.8s linear infinite' }} />
                )}
                {loading ? 'Traitement...' : `Confirmer ${actionConfig.label.toLowerCase()}`}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div style={s.container}>
      <div style={s.grid}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              style={s.actionBtn(action, hoveredBtn === action.id)}
              onMouseEnter={() => setHoveredBtn(action.id)}
              onMouseLeave={() => setHoveredBtn(null)}
              onClick={() => !action.disabled && setActiveModal(action.id)}
              disabled={action.disabled}
            >
              <Icon size={20} />
              {action.label}
            </button>
          );
        })}
      </div>
      {renderModal()}
    </div>
  );
};

export default ValidationActions;
