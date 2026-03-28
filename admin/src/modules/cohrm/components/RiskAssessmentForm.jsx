/**
 * RiskAssessmentForm - Formulaire d'évaluation des risques sanitaires
 *
 * - Select visuel du niveau de risque (cards horizontales)
 * - Description du risque (obligatoire si >= moderate, min 20 car)
 * - Contexte (optionnel)
 * - Niveau d'exposition (select avec icônes)
 * - Résumé visuel avant soumission
 * - Confirmation modale si high/very_high
 */

import React, { useState, useCallback } from 'react';
import {
  HelpCircle, Shield, AlertCircle, AlertTriangle, AlertOctagon,
  User, Users, Home, Map, Flag,
  Send, Eye, ChevronDown, ChevronUp, Check,
} from 'lucide-react';
import { ConfirmModal } from './shared';
import { RISK_LEVELS, EXPOSURE_LEVELS, COHRM_COLORS } from '../utils/constants';
import { validateRiskAssessment } from '../utils/validators';
import { assessRisk } from '../services/cohrmApi';

// ============================================
// ICÔNES PAR CATÉGORIE
// ============================================

const RISK_ICON_MAP = {
  unknown: HelpCircle,
  low: Shield,
  moderate: AlertCircle,
  high: AlertTriangle,
  very_high: AlertOctagon,
};

const EXPOSURE_ICON_MAP = {
  individual: User,
  group: Users,
  community: Home,
  regional: Map,
  national: Flag,
};

const RISK_DESCRIPTIONS_FULL = {
  unknown: 'Non évalué — en attente d\'analyse',
  low: 'Risque faible — surveillance standard recommandée',
  moderate: 'Risque modéré — vigilance accrue et suivi régulier',
  high: 'Risque élevé — action prioritaire et mobilisation des équipes',
  very_high: 'Risque très élevé — action urgente immédiate requise',
};

const RiskAssessmentForm = ({ rumorId, rumorTitle, currentRiskLevel, isDark, onSuccess, onCancel }) => {
  // State du formulaire
  const [formData, setFormData] = useState({
    risk_level: currentRiskLevel || '',
    risk_description: '',
    risk_context: '',
    risk_exposure: '',
  });
  const [errors, setErrors] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Gestion du changement
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
    setSubmitError(null);
  }, []);

  // Validation
  const validate = useCallback(() => {
    const result = validateRiskAssessment(formData);
    setErrors(result.errors);
    return result.valid;
  }, [formData]);

  // Préparation soumission
  const handlePreSubmit = useCallback(() => {
    if (!validate()) return;
    const needsConfirm = ['high', 'very_high'].includes(formData.risk_level);
    if (needsConfirm) {
      setShowConfirm(true);
    } else {
      handleSubmit();
    }
  }, [formData, validate]);

  // Soumission
  const handleSubmit = useCallback(async () => {
    setShowConfirm(false);
    setSubmitting(true);
    setSubmitError(null);
    try {
      await assessRisk(rumorId, formData);
      if (onSuccess) onSuccess(formData);
    } catch (err) {
      setSubmitError(err.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  }, [rumorId, formData, onSuccess]);

  // Infos du niveau sélectionné
  const selectedRisk = RISK_LEVELS.find(r => r.value === formData.risk_level);
  const selectedExposure = EXPOSURE_LEVELS.find(e => e.value === formData.risk_exposure);
  const requiresDescription = ['moderate', 'high', 'very_high'].includes(formData.risk_level);

  // ============================================
  // STYLES
  // ============================================
  const s = {
    container: {
      maxWidth: 800,
    },
    section: {
      marginBottom: 28,
    },
    label: {
      fontSize: 14,
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#1f2937',
      marginBottom: 12,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    sublabel: {
      fontSize: 12,
      fontWeight: 400,
      color: isDark ? '#94a3b8' : '#6b7280',
    },
    // Risk level cards
    riskGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: 10,
    },
    riskCard: (risk, isSelected) => ({
      padding: '16px 12px',
      borderRadius: 12,
      border: isSelected
        ? `2px solid ${risk.color}`
        : isDark ? '2px solid #334155' : '2px solid #e5e7eb',
      backgroundColor: isSelected
        ? (isDark ? `${risk.color}20` : risk.bgColor)
        : (isDark ? '#1e293b' : '#fff'),
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.2s ease',
      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
      boxShadow: isSelected ? `0 4px 12px ${risk.color}30` : 'none',
      animation: isSelected && risk.value === 'very_high' ? 'cohrmFormPulse 2s ease-in-out infinite' : 'none',
    }),
    riskCardIcon: (risk, isSelected) => ({
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: isSelected ? `${risk.color}20` : (isDark ? '#334155' : '#f3f4f6'),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 8px',
      transition: 'background-color 0.2s',
    }),
    riskCardLabel: (risk, isSelected) => ({
      fontSize: 12,
      fontWeight: isSelected ? 700 : 600,
      color: isSelected ? risk.color : (isDark ? '#e2e8f0' : '#374151'),
      marginBottom: 4,
    }),
    riskCardDesc: {
      fontSize: 10,
      color: isDark ? '#64748b' : '#9ca3af',
      lineHeight: 1.3,
    },
    // Textarea
    textarea: (hasError) => ({
      width: '100%',
      minHeight: 100,
      padding: '12px 16px',
      borderRadius: 10,
      border: hasError
        ? '2px solid #ef4444'
        : isDark ? '2px solid #334155' : '2px solid #e5e7eb',
      backgroundColor: isDark ? '#0f172a' : '#fff',
      color: isDark ? '#e2e8f0' : '#1f2937',
      fontSize: 14,
      lineHeight: 1.6,
      resize: 'vertical',
      outline: 'none',
      fontFamily: 'inherit',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box',
    }),
    charCount: (current, min, isRequired) => ({
      fontSize: 11,
      marginTop: 6,
      color: isRequired && current < min ? '#ef4444' : (isDark ? '#64748b' : '#9ca3af'),
      textAlign: 'right',
    }),
    errorText: {
      fontSize: 12,
      color: '#ef4444',
      marginTop: 6,
    },
    // Exposure select
    exposureGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: 10,
    },
    exposureCard: (exp, isSelected) => ({
      padding: '14px 10px',
      borderRadius: 10,
      border: isSelected
        ? `2px solid ${COHRM_COLORS.primary}`
        : isDark ? '2px solid #334155' : '2px solid #e5e7eb',
      backgroundColor: isSelected
        ? (isDark ? `${COHRM_COLORS.primary}20` : '#EBF5FB')
        : (isDark ? '#1e293b' : '#fff'),
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.2s ease',
    }),
    exposureIcon: (isSelected) => ({
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: isSelected ? `${COHRM_COLORS.primary}15` : (isDark ? '#334155' : '#f3f4f6'),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 6px',
    }),
    exposureLabel: (isSelected) => ({
      fontSize: 12,
      fontWeight: isSelected ? 700 : 600,
      color: isSelected ? COHRM_COLORS.primary : (isDark ? '#e2e8f0' : '#374151'),
      marginBottom: 2,
    }),
    exposureDesc: {
      fontSize: 10,
      color: isDark ? '#64748b' : '#9ca3af',
    },
    // Summary
    summaryBox: {
      padding: '20px 24px',
      borderRadius: 14,
      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
      marginBottom: 20,
    },
    summaryTitle: {
      fontSize: 15,
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#1f2937',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '8px 0',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #e5e7eb',
    },
    summaryLabel: {
      fontSize: 13,
      color: isDark ? '#94a3b8' : '#6b7280',
      minWidth: 140,
      flexShrink: 0,
    },
    summaryValue: {
      fontSize: 13,
      fontWeight: 600,
      color: isDark ? '#e2e8f0' : '#1f2937',
      textAlign: 'right',
      flex: 1,
    },
    // Buttons
    actions: {
      display: 'flex',
      gap: 12,
      justifyContent: 'flex-end',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    btnSecondary: {
      padding: '12px 24px',
      borderRadius: 10,
      border: isDark ? '1px solid #334155' : '1px solid #d1d5db',
      backgroundColor: 'transparent',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    btnPrimary: (disabled) => ({
      padding: '12px 28px',
      borderRadius: 10,
      border: 'none',
      backgroundColor: disabled ? (isDark ? '#334155' : '#d1d5db') : COHRM_COLORS.primary,
      color: disabled ? (isDark ? '#64748b' : '#9ca3af') : '#fff',
      fontSize: 14,
      fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      transition: 'background-color 0.2s',
    }),
    submitError: {
      padding: '12px 16px',
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
      border: '1px solid #fca5a5',
      color: '#ef4444',
      fontSize: 13,
      marginBottom: 16,
    },
  };

  return (
    <div style={s.container}>
      <style>{`
        @keyframes cohrmFormPulse {
          0%, 100% { box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3); }
          50% { box-shadow: 0 4px 20px rgba(231, 76, 60, 0.5); }
        }
      `}</style>

      {/* ========== NIVEAU DE RISQUE ========== */}
      <div style={s.section}>
        <div style={s.label}>
          <Shield size={16} color={COHRM_COLORS.primaryLight} />
          Niveau de risque
        </div>
        <div style={s.riskGrid}>
          {RISK_LEVELS.map(risk => {
            const Icon = RISK_ICON_MAP[risk.value] || HelpCircle;
            const isSelected = formData.risk_level === risk.value;
            return (
              <div
                key={risk.value}
                style={s.riskCard(risk, isSelected)}
                onClick={() => handleChange('risk_level', risk.value)}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = risk.color;
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = isDark ? '#334155' : '#e5e7eb';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                <div style={s.riskCardIcon(risk, isSelected)}>
                  <Icon size={20} color={isSelected ? risk.color : (isDark ? '#64748b' : '#9ca3af')} />
                </div>
                <div style={s.riskCardLabel(risk, isSelected)}>{risk.label}</div>
                <div style={s.riskCardDesc}>
                  {RISK_DESCRIPTIONS_FULL[risk.value]?.split('—')[0]?.trim()}
                </div>
                {isSelected && (
                  <div style={{
                    marginTop: 6,
                    width: 20, height: 20,
                    borderRadius: '50%',
                    backgroundColor: risk.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '6px auto 0',
                  }}>
                    <Check size={12} color="#fff" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {errors.risk_level && <div style={s.errorText}>{errors.risk_level}</div>}
      </div>

      {/* ========== DESCRIPTION DU RISQUE ========== */}
      <div style={s.section}>
        <div style={s.label}>
          Description du risque
          {requiresDescription && (
            <span style={{ ...s.sublabel, color: '#ef4444' }}>* obligatoire (min. 20 caractères)</span>
          )}
          {!requiresDescription && <span style={s.sublabel}>optionnel</span>}
        </div>
        <textarea
          style={s.textarea(!!errors.risk_description)}
          value={formData.risk_description}
          onChange={(e) => handleChange('risk_description', e.target.value)}
          placeholder="Décrivez les facteurs de risque identifiés, les populations affectées, la probabilité de propagation..."
          onFocus={(e) => { e.target.style.borderColor = COHRM_COLORS.primaryLight; }}
          onBlur={(e) => {
            e.target.style.borderColor = errors.risk_description ? '#ef4444' : (isDark ? '#334155' : '#e5e7eb');
          }}
        />
        <div style={s.charCount(formData.risk_description.length, 20, requiresDescription)}>
          {formData.risk_description.length} / 20 caractères min.
        </div>
        {errors.risk_description && <div style={s.errorText}>{errors.risk_description}</div>}
      </div>

      {/* ========== CONTEXTE ========== */}
      <div style={s.section}>
        <div style={s.label}>
          Contexte <span style={s.sublabel}>optionnel</span>
        </div>
        <textarea
          style={s.textarea(false)}
          value={formData.risk_context}
          onChange={(e) => handleChange('risk_context', e.target.value)}
          placeholder="Contexte épidémiologique, historique de la zone, facteurs environnementaux..."
          rows={3}
          onFocus={(e) => { e.target.style.borderColor = COHRM_COLORS.primaryLight; }}
          onBlur={(e) => { e.target.style.borderColor = isDark ? '#334155' : '#e5e7eb'; }}
        />
      </div>

      {/* ========== NIVEAU D'EXPOSITION ========== */}
      <div style={s.section}>
        <div style={s.label}>
          <Users size={16} color={COHRM_COLORS.primaryLight} />
          Niveau d'exposition
          <span style={s.sublabel}>optionnel</span>
        </div>
        <div style={s.exposureGrid}>
          {EXPOSURE_LEVELS.map(exp => {
            const Icon = EXPOSURE_ICON_MAP[exp.value] || User;
            const isSelected = formData.risk_exposure === exp.value;
            return (
              <div
                key={exp.value}
                style={s.exposureCard(exp, isSelected)}
                onClick={() => handleChange('risk_exposure', isSelected ? '' : exp.value)}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = COHRM_COLORS.primaryLight;
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = isDark ? '#334155' : '#e5e7eb';
                }}
              >
                <div style={s.exposureIcon(isSelected)}>
                  <Icon
                    size={18}
                    color={isSelected ? COHRM_COLORS.primary : (isDark ? '#64748b' : '#9ca3af')}
                  />
                </div>
                <div style={s.exposureLabel(isSelected)}>{exp.label}</div>
                <div style={s.exposureDesc}>{exp.description}</div>
              </div>
            );
          })}
        </div>
        {errors.risk_exposure && <div style={s.errorText}>{errors.risk_exposure}</div>}
      </div>

      {/* ========== RÉSUMÉ ========== */}
      {formData.risk_level && (
        <div style={s.section}>
          <div
            style={{ ...s.label, cursor: 'pointer', userSelect: 'none' }}
            onClick={() => setShowSummary(!showSummary)}
          >
            <Eye size={16} color={COHRM_COLORS.primaryLight} />
            Résumé de l'évaluation
            {showSummary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
          {showSummary && (
            <div style={s.summaryBox}>
              <div style={s.summaryTitle}>
                {selectedRisk && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 700,
                    color: selectedRisk.color,
                    backgroundColor: selectedRisk.bgColor,
                    border: `1px solid ${selectedRisk.color}20`,
                  }}>
                    {React.createElement(RISK_ICON_MAP[selectedRisk.value] || HelpCircle, { size: 14 })}
                    {selectedRisk.label}
                  </span>
                )}
                {rumorTitle && (
                  <span style={{ fontSize: 13, fontWeight: 400, color: isDark ? '#94a3b8' : '#6b7280' }}>
                    — {rumorTitle}
                  </span>
                )}
              </div>

              <div style={s.summaryRow}>
                <span style={s.summaryLabel}>Niveau de risque</span>
                <span style={{ ...s.summaryValue, color: selectedRisk?.color }}>
                  {selectedRisk?.label || '—'}
                </span>
              </div>

              <div style={s.summaryRow}>
                <span style={s.summaryLabel}>Description</span>
                <span style={s.summaryValue}>
                  {formData.risk_description || '—'}
                </span>
              </div>

              {formData.risk_context && (
                <div style={s.summaryRow}>
                  <span style={s.summaryLabel}>Contexte</span>
                  <span style={s.summaryValue}>{formData.risk_context}</span>
                </div>
              )}

              <div style={{ ...s.summaryRow, borderBottom: 'none' }}>
                <span style={s.summaryLabel}>Exposition</span>
                <span style={s.summaryValue}>
                  {selectedExposure ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {React.createElement(EXPOSURE_ICON_MAP[selectedExposure.value] || User, { size: 14 })}
                      {selectedExposure.label}
                    </span>
                  ) : '—'}
                </span>
              </div>

              {['high', 'very_high'].includes(formData.risk_level) && (
                <div style={{
                  marginTop: 12,
                  padding: '10px 14px',
                  borderRadius: 8,
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
                  border: '1px solid #fca5a5',
                  fontSize: 12,
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <AlertTriangle size={14} />
                  Les superviseurs seront automatiquement notifiés pour ce niveau de risque.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========== ERREUR SOUMISSION ========== */}
      {submitError && (
        <div style={s.submitError}>
          <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          {submitError}
        </div>
      )}

      {/* ========== BOUTONS ========== */}
      <div style={s.actions}>
        {onCancel && (
          <button style={s.btnSecondary} onClick={onCancel}>
            Annuler
          </button>
        )}
        <button
          style={s.btnPrimary(submitting || !formData.risk_level)}
          onClick={handlePreSubmit}
          disabled={submitting || !formData.risk_level}
          onMouseEnter={(e) => {
            if (!submitting && formData.risk_level) {
              e.target.style.backgroundColor = COHRM_COLORS.primaryLight;
            }
          }}
          onMouseLeave={(e) => {
            if (!submitting && formData.risk_level) {
              e.target.style.backgroundColor = COHRM_COLORS.primary;
            }
          }}
        >
          {submitting ? (
            <>
              <span style={{
                width: 16, height: 16,
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'cohrmSpin 0.6s linear infinite',
              }} />
              Soumission...
            </>
          ) : (
            <>
              <Send size={16} />
              Soumettre l'évaluation
            </>
          )}
        </button>
      </div>

      {/* ========== MODALE DE CONFIRMATION ========== */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSubmit}
        title="Confirmer l'évaluation de risque élevé"
        message={
          `Vous classez cette rumeur en risque "${selectedRisk?.label || ''}". ` +
          'Cette action déclenchera une notification automatique aux superviseurs. ' +
          'Êtes-vous sûr de vouloir soumettre cette évaluation ?'
        }
        confirmLabel="Confirmer et notifier"
        variant="warning"
        isDark={isDark}
        loading={submitting}
      />

      <style>{`
        @keyframes cohrmSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RiskAssessmentForm;
