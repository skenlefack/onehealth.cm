/**
 * ValidationTimeline - Timeline verticale de validation COHRM (5 niveaux)
 *
 * Affiche la progression de validation d'une rumeur à travers les 5 niveaux
 * hiérarchiques avec états visuels : complété, en cours, à venir, rejeté.
 *
 * Props :
 *   - validations (array) : historique des validations [{level, action, validator_name, comment, created_at}]
 *   - currentLevel (number) : niveau de validation actuel (1-5)
 *   - status (string) : statut global ('pending'|'validated'|'rejected'|'returned')
 *   - isDark (boolean) : mode sombre
 */

import React, { useState, useEffect } from 'react';
import { Check, X, Clock, ChevronRight, ArrowUpRight, CornerDownLeft, User } from 'lucide-react';
import { VALIDATION_LEVELS, COHRM_COLORS } from '../utils/constants';
import { formatDateTime, formatRelativeDate } from '../utils/formatters';

const ValidationTimeline = ({ validations = [], currentLevel = 1, status = 'pending', isDark = false }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Trouver la validation pour un niveau donné
  const getValidationForLevel = (level) => {
    return validations.find(v => v.level === level || v.target_level === level);
  };

  // Déterminer l'état d'une étape
  const getStepState = (level) => {
    const validation = getValidationForLevel(level);

    if (validation) {
      if (validation.action === 'reject') return 'rejected';
      if (validation.action === 'return') return 'returned';
      if (validation.action === 'validate' || validation.action === 'escalate') return 'completed';
    }

    if (level === currentLevel) {
      if (status === 'rejected') return 'rejected';
      return 'current';
    }

    if (level < currentLevel) return 'completed';
    return 'upcoming';
  };

  // Couleurs selon l'état
  const getStateColors = (state) => {
    switch (state) {
      case 'completed':
        return {
          circle: '#27AE60',
          circleBg: isDark ? 'rgba(39, 174, 96, 0.15)' : '#EAFAF1',
          line: '#27AE60',
          text: isDark ? '#6ee7b7' : '#27AE60',
        };
      case 'current':
        return {
          circle: '#3498DB',
          circleBg: isDark ? 'rgba(52, 152, 219, 0.15)' : '#EBF5FB',
          line: isDark ? '#334155' : '#D1D5DB',
          text: isDark ? '#93c5fd' : '#3498DB',
        };
      case 'rejected':
        return {
          circle: '#E74C3C',
          circleBg: isDark ? 'rgba(231, 76, 60, 0.15)' : '#FDEDEC',
          line: '#E74C3C',
          text: isDark ? '#fca5a5' : '#E74C3C',
        };
      case 'returned':
        return {
          circle: '#E67E22',
          circleBg: isDark ? 'rgba(230, 126, 34, 0.15)' : '#FDF2E9',
          line: '#E67E22',
          text: isDark ? '#fdba74' : '#E67E22',
        };
      default: // upcoming
        return {
          circle: isDark ? '#475569' : '#D1D5DB',
          circleBg: isDark ? '#1e293b' : '#F3F4F6',
          line: isDark ? '#334155' : '#E5E7EB',
          text: isDark ? '#64748b' : '#9CA3AF',
        };
    }
  };

  // Icône selon l'état
  const getStateIcon = (state) => {
    switch (state) {
      case 'completed': return <Check size={18} color="#fff" strokeWidth={3} />;
      case 'rejected': return <X size={18} color="#fff" strokeWidth={3} />;
      case 'returned': return <CornerDownLeft size={16} color="#fff" strokeWidth={2.5} />;
      case 'current': return <Clock size={16} color="#fff" strokeWidth={2} />;
      default: return null;
    }
  };

  const s = {
    container: {
      padding: isMobile ? '16px 0' : '20px 0',
    },
    // --- Layout vertical (desktop) ---
    stepVertical: {
      display: 'flex',
      position: 'relative',
      minHeight: 80,
    },
    lineColumn: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: 48,
      flexShrink: 0,
    },
    circle: (state) => {
      const colors = getStateColors(state);
      return {
        width: 44,
        height: 44,
        borderRadius: '50%',
        backgroundColor: state === 'upcoming' ? colors.circleBg : colors.circle,
        border: state === 'current' ? `3px solid ${colors.circle}` : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        fontWeight: 700,
        color: state === 'upcoming' ? colors.circle : '#fff',
        flexShrink: 0,
        position: 'relative',
        zIndex: 2,
        boxShadow: state === 'current'
          ? `0 0 0 4px ${isDark ? 'rgba(52, 152, 219, 0.2)' : 'rgba(52, 152, 219, 0.15)'}`
          : state === 'completed'
            ? `0 2px 8px rgba(39, 174, 96, 0.3)`
            : state === 'rejected'
              ? `0 2px 8px rgba(231, 76, 60, 0.3)`
              : 'none',
        animation: state === 'current' ? 'cohrmPulse 2s ease-in-out infinite' : 'none',
      };
    },
    line: (state, isLast) => {
      const colors = getStateColors(state);
      return {
        flex: 1,
        width: 3,
        backgroundColor: isLast ? 'transparent' : colors.line,
        minHeight: isLast ? 0 : 20,
        transition: 'background-color 0.3s',
      };
    },
    content: (state) => {
      const colors = getStateColors(state);
      return {
        flex: 1,
        padding: '0 0 28px 16px',
        opacity: state === 'upcoming' ? 0.5 : 1,
        transition: 'opacity 0.3s',
      };
    },
    levelName: (state) => {
      const colors = getStateColors(state);
      return {
        fontSize: 15,
        fontWeight: 700,
        color: state === 'upcoming'
          ? (isDark ? '#64748b' : '#9CA3AF')
          : (isDark ? '#e2e8f0' : '#1f2937'),
        marginBottom: 2,
      };
    },
    roleName: (state) => ({
      fontSize: 13,
      color: getStateColors(state).text,
      fontWeight: 500,
      marginBottom: 4,
    }),
    description: {
      fontSize: 12,
      color: isDark ? '#64748b' : '#9CA3AF',
      marginBottom: 8,
      lineHeight: 1.4,
    },
    validationInfo: {
      padding: '10px 14px',
      borderRadius: 10,
      backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      marginTop: 8,
    },
    validatorRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    validatorAvatar: {
      width: 24,
      height: 24,
      borderRadius: '50%',
      backgroundColor: isDark ? '#334155' : '#E5E7EB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    validatorName: {
      fontSize: 13,
      fontWeight: 600,
      color: isDark ? '#e2e8f0' : '#374151',
    },
    validationDate: {
      fontSize: 12,
      color: isDark ? '#64748b' : '#9CA3AF',
      marginLeft: 'auto',
    },
    comment: {
      fontSize: 13,
      color: isDark ? '#94a3b8' : '#6B7280',
      fontStyle: 'italic',
      lineHeight: 1.5,
      marginTop: 6,
      paddingLeft: 32,
    },
    currentBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 12px',
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(52, 152, 219, 0.15)' : '#EBF5FB',
      color: isDark ? '#93c5fd' : '#3498DB',
      fontSize: 12,
      fontWeight: 600,
      marginTop: 8,
      animation: 'cohrmPulse 2s ease-in-out infinite',
    },
    rejectedBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 12px',
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(231, 76, 60, 0.15)' : '#FDEDEC',
      color: isDark ? '#fca5a5' : '#E74C3C',
      fontSize: 12,
      fontWeight: 600,
      marginTop: 8,
    },
    // --- Layout horizontal (mobile) ---
    horizontalContainer: {
      display: 'flex',
      overflowX: 'auto',
      gap: 0,
      paddingBottom: 8,
    },
    stepHorizontal: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minWidth: 100,
      flex: 1,
      position: 'relative',
    },
    hLineRow: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      marginBottom: 10,
    },
    hLineBefore: (state, isFirst) => ({
      flex: 1,
      height: 3,
      backgroundColor: isFirst ? 'transparent' : getStateColors(state).line,
    }),
    hLineAfter: (state, isLast) => ({
      flex: 1,
      height: 3,
      backgroundColor: isLast ? 'transparent' : getStateColors(state).line,
    }),
    hCircle: (state) => ({
      ...s.circle(state),
      width: 36,
      height: 36,
      fontSize: 14,
    }),
    hContent: {
      textAlign: 'center',
      padding: '0 4px',
    },
    hLevelName: (state) => ({
      fontSize: 11,
      fontWeight: 700,
      color: state === 'upcoming'
        ? (isDark ? '#64748b' : '#9CA3AF')
        : (isDark ? '#e2e8f0' : '#1f2937'),
      marginBottom: 2,
    }),
    hRoleName: (state) => ({
      fontSize: 10,
      color: getStateColors(state).text,
      fontWeight: 500,
    }),
  };

  // --- Rendu mobile (horizontal) ---
  if (isMobile) {
    return (
      <>
        <style>{`
          @keyframes cohrmPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.4); }
            50% { box-shadow: 0 0 0 8px rgba(52, 152, 219, 0); }
          }
        `}</style>
        <div style={s.container}>
          <div style={s.horizontalContainer}>
            {VALIDATION_LEVELS.map((level, idx) => {
              const state = getStepState(level.level);
              const isFirst = idx === 0;
              const isLast = idx === VALIDATION_LEVELS.length - 1;
              const prevState = idx > 0 ? getStepState(VALIDATION_LEVELS[idx - 1].level) : state;

              return (
                <div key={level.level} style={s.stepHorizontal}>
                  <div style={s.hLineRow}>
                    <div style={s.hLineBefore(prevState, isFirst)} />
                    <div style={s.hCircle(state)}>
                      {getStateIcon(state) || level.level}
                    </div>
                    <div style={s.hLineAfter(state, isLast)} />
                  </div>
                  <div style={s.hContent}>
                    <div style={s.hLevelName(state)}>{level.name}</div>
                    <div style={s.hRoleName(state)}>{level.role}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  // --- Rendu desktop (vertical) ---
  return (
    <>
      <style>{`
        @keyframes cohrmPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(52, 152, 219, 0); }
        }
      `}</style>
      <div style={s.container}>
        {VALIDATION_LEVELS.map((level, idx) => {
          const state = getStepState(level.level);
          const isLast = idx === VALIDATION_LEVELS.length - 1;
          const validation = getValidationForLevel(level.level);
          const nextState = !isLast ? getStepState(VALIDATION_LEVELS[idx + 1].level) : 'upcoming';

          // La ligne prend la couleur du step complété, sinon grise
          const lineState = state === 'completed' && (nextState === 'completed' || nextState === 'current')
            ? 'completed'
            : state === 'completed' && nextState !== 'completed'
              ? 'upcoming'
              : 'upcoming';

          return (
            <div key={level.level} style={s.stepVertical}>
              {/* Colonne cercle + ligne */}
              <div style={s.lineColumn}>
                <div style={s.circle(state)}>
                  {getStateIcon(state) || level.level}
                </div>
                <div style={s.line(
                  state === 'completed' ? 'completed' : 'upcoming',
                  isLast
                )} />
              </div>

              {/* Contenu */}
              <div style={s.content(state)}>
                <div style={s.levelName(state)}>
                  Niveau {level.level} — {level.name}
                </div>
                <div style={s.roleName(state)}>{level.role}</div>
                <div style={s.description}>{level.description}</div>

                {/* Validation complétée */}
                {(state === 'completed' || state === 'rejected' || state === 'returned') && validation && (
                  <div style={s.validationInfo}>
                    <div style={s.validatorRow}>
                      <div style={s.validatorAvatar}>
                        <User size={14} color={isDark ? '#94a3b8' : '#6B7280'} />
                      </div>
                      <span style={s.validatorName}>
                        {validation.validator_name || validation.actor_name || 'Validateur'}
                      </span>
                      <span style={s.validationDate}>
                        {formatDateTime(validation.created_at)}
                        {' '}
                        <span style={{ fontSize: 11 }}>({formatRelativeDate(validation.created_at)})</span>
                      </span>
                    </div>
                    {validation.comment && (
                      <div style={s.comment}>
                        &laquo; {validation.comment} &raquo;
                      </div>
                    )}
                    {state === 'completed' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, paddingLeft: 32 }}>
                        <Check size={14} color="#27AE60" />
                        <span style={{ fontSize: 12, color: '#27AE60', fontWeight: 600 }}>
                          {validation.action === 'escalate' ? 'Escaladé' : 'Validé'}
                        </span>
                      </div>
                    )}
                    {state === 'rejected' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, paddingLeft: 32 }}>
                        <X size={14} color="#E74C3C" />
                        <span style={{ fontSize: 12, color: '#E74C3C', fontWeight: 600 }}>Rejeté</span>
                      </div>
                    )}
                    {state === 'returned' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, paddingLeft: 32 }}>
                        <CornerDownLeft size={14} color="#E67E22" />
                        <span style={{ fontSize: 12, color: '#E67E22', fontWeight: 600 }}>Retourné</span>
                      </div>
                    )}
                  </div>
                )}

                {/* En cours de validation */}
                {state === 'current' && (
                  <div style={s.currentBadge}>
                    <Clock size={14} />
                    En attente de validation
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ValidationTimeline;
