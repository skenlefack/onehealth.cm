/**
 * DusscQuestionDetail — Détail et édition d'une question
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, Clock, Eye, Globe, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import useDusscStore from '../stores/dusscStore';
import * as dusscApi from '../services/dusscApi';
import { QUESTION_STATUS, NIVEAU_OPTIONS, TYPE_ITEM_OPTIONS, ROLE_TEST_OPTIONS, MODULE_COLORS, DUSSC_COLORS } from '../utils/constants';

const DusscQuestionDetail = ({ isDark, user }) => {
  const { t } = useTranslation('dussc');
  const { selectedQuestionId, currentQuestion, loadingQuestion, fetchQuestion, clearCurrentQuestion, setActivePage, modules } = useDusscStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (selectedQuestionId) fetchQuestion(selectedQuestionId);
    return () => clearCurrentQuestion();
  }, [selectedQuestionId]);

  useEffect(() => {
    if (currentQuestion) {
      setForm({
        enonce_fr: currentQuestion.enonce_fr || '',
        enonce_en: currentQuestion.enonce_en || '',
        explication_fr: currentQuestion.explication_fr || '',
        explication_en: currentQuestion.explication_en || '',
        action_fr: currentQuestion.action_fr || '',
        action_en: currentQuestion.action_en || '',
        idee_fausse_ciblee_fr: currentQuestion.idee_fausse_ciblee_fr || '',
        reponse_correcte: currentQuestion.reponse_correcte || 'A',
        niveau: currentQuestion.niveau || 'grand_public',
        type_item: currentQuestion.type_item || 'connaissance',
        role_test: currentQuestion.role_test || 'courante',
      });
    }
  }, [currentQuestion]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await dusscApi.updateQuestion(selectedQuestionId, form);
      toast.success(t('common.success'));
      fetchQuestion(selectedQuestionId);
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    }
    setSaving(false);
  };

  const handleStatusChange = async () => {
    try {
      await dusscApi.changeQuestionStatus(selectedQuestionId, { statut: newStatus });
      toast.success(`Statut changé vers ${QUESTION_STATUS[newStatus]?.label}`);
      fetchQuestion(selectedQuestionId);
      setStatusModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    }
  };

  const q = currentQuestion;

  const s = {
    container: { maxWidth: 900, margin: '0 auto' },
    backBtn: {
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 0',
      border: 'none', background: 'none', color: DUSSC_COLORS.primary,
      fontSize: 14, fontWeight: 500, cursor: 'pointer', marginBottom: 16,
    },
    header: {
      background: isDark ? '#1e1e2e' : '#fff', borderRadius: 12, padding: 24,
      marginBottom: 16, border: `1px solid ${isDark ? '#333' : '#e8ece8'}`,
    },
    id: { fontSize: 12, color: isDark ? '#888' : '#999', fontFamily: 'monospace', marginBottom: 4 },
    title: { fontSize: 20, fontWeight: 700, color: isDark ? '#fff' : DUSSC_COLORS.encre, marginBottom: 12 },
    badges: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
    badge: (color) => ({
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: `${color}18`, color,
    }),
    section: {
      background: isDark ? '#1e1e2e' : '#fff', borderRadius: 12, padding: 20,
      marginBottom: 16, border: `1px solid ${isDark ? '#333' : '#e8ece8'}`,
    },
    sectionTitle: { fontSize: 14, fontWeight: 700, color: isDark ? '#ccc' : '#555', marginBottom: 12 },
    field: { marginBottom: 14 },
    label: { display: 'block', fontSize: 11, fontWeight: 600, color: isDark ? '#999' : '#777', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' },
    value: { fontSize: 14, color: isDark ? '#ddd' : '#333', lineHeight: 1.6 },
    textarea: {
      width: '100%', padding: 10, borderRadius: 8, fontSize: 14, lineHeight: 1.6, resize: 'vertical',
      border: `1px solid ${isDark ? '#444' : '#ddd'}`, background: isDark ? '#2a2a3e' : '#fafafa',
      color: isDark ? '#ddd' : '#333', minHeight: 80, fontFamily: 'inherit',
    },
    select: {
      padding: '8px 12px', borderRadius: 8, fontSize: 13,
      border: `1px solid ${isDark ? '#444' : '#ddd'}`, background: isDark ? '#2a2a3e' : '#fafafa',
      color: isDark ? '#ddd' : '#333',
    },
    options: { display: 'flex', flexDirection: 'column', gap: 8 },
    option: (isCorrect) => ({
      padding: '10px 14px', borderRadius: 8, fontSize: 14,
      border: `2px solid ${isCorrect ? DUSSC_COLORS.correct : (isDark ? '#333' : '#e0e0e0')}`,
      background: isCorrect ? `${DUSSC_COLORS.correct}10` : (isDark ? '#2a2a3e' : '#fafafa'),
      display: 'flex', gap: 10, alignItems: 'flex-start',
    }),
    optLetter: (isCorrect) => ({
      width: 24, height: 24, borderRadius: '50%', fontSize: 12, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      background: isCorrect ? DUSSC_COLORS.correct : (isDark ? '#444' : '#ddd'),
      color: isCorrect ? '#fff' : (isDark ? '#ccc' : '#666'),
    }),
    actions: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
    btn: (primary) => ({
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px',
      borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
      border: primary ? 'none' : `1px solid ${isDark ? '#444' : '#ddd'}`,
      background: primary ? DUSSC_COLORS.primary : 'transparent',
      color: primary ? '#fff' : (isDark ? '#ccc' : '#555'),
    }),
    historyItem: {
      display: 'flex', gap: 10, padding: '8px 0',
      borderBottom: `1px solid ${isDark ? '#333' : '#f0f0f0'}`, fontSize: 13,
    },
    modal: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    modalContent: {
      background: isDark ? '#1e1e2e' : '#fff', borderRadius: 12, padding: 24,
      width: 400, maxWidth: '90vw',
    },
  };

  if (loadingQuestion) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <div style={{ color: isDark ? '#888' : '#999' }}>{t('common.loading')}</div>
      </div>
    );
  }

  if (!q) {
    return (
      <div style={s.container}>
        <button style={s.backBtn} onClick={() => setActivePage('questions')}>
          <ArrowLeft size={16} /> {t('common.back')}
        </button>
        <div style={{ textAlign: 'center', padding: 40, color: isDark ? '#888' : '#999' }}>
          Question non trouvée
        </div>
      </div>
    );
  }

  const optionsFr = (() => { try { return JSON.parse(q.options_fr); } catch { return []; } })();
  const optionsEn = (() => { try { return JSON.parse(q.options_en || '[]'); } catch { return []; } })();
  const statusInfo = QUESTION_STATUS[q.statut] || {};
  const moduleCode = q.module_code || '';

  return (
    <div style={s.container}>
      <button style={s.backBtn} onClick={() => setActivePage('questions')}>
        <ArrowLeft size={16} /> {t('common.back')}
      </button>

      {/* Header */}
      <div style={s.header}>
        <div style={s.id}>{q.id_question} · {q.id_version}</div>
        <div style={s.title}>{q.enonce_fr}</div>
        <div style={s.badges}>
          <span style={s.badge(MODULE_COLORS[moduleCode] || '#666')}>{moduleCode} · {q.module_name_fr}</span>
          <span style={s.badge(statusInfo.color || '#999')}>{statusInfo.label}</span>
          <span style={s.badge(NIVEAU_OPTIONS.find(n => n.value === q.niveau)?.color || '#666')}>
            {NIVEAU_OPTIONS.find(n => n.value === q.niveau)?.label}
          </span>
          <span style={s.badge('#666')}>v{q.version}</span>
        </div>
        <div style={s.actions}>
          <button style={s.btn(false)} onClick={() => setStatusModal(true)}>
            <Clock size={14} /> {t('questions.changeStatus')}
          </button>
          <button style={s.btn(true)} onClick={() => setEditing(!editing)}>
            {editing ? t('common.cancel') : t('common.edit')}
          </button>
        </div>
      </div>

      {/* Options FR */}
      <div style={s.section}>
        <div style={s.sectionTitle}>🇫🇷 {t('questions.options')} (Français)</div>
        <div style={s.options}>
          {optionsFr.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            const isCorrect = letter === q.reponse_correcte;
            return (
              <div key={i} style={s.option(isCorrect)}>
                <div style={s.optLetter(isCorrect)}>{letter}</div>
                <div style={{ flex: 1, color: isDark ? '#ddd' : '#333' }}>{opt}</div>
                {isCorrect && <CheckCircle size={18} color={DUSSC_COLORS.correct} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedback FR */}
      <div style={s.section}>
        <div style={s.sectionTitle}>{t('questions.explanation')}</div>
        <div style={s.field}>
          <div style={s.label}>Explication</div>
          {editing ? (
            <textarea style={s.textarea} value={form.explication_fr} onChange={e => setForm({ ...form, explication_fr: e.target.value })} />
          ) : (
            <div style={s.value}>{q.explication_fr}</div>
          )}
        </div>
        <div style={s.field}>
          <div style={s.label}>Action</div>
          {editing ? (
            <textarea style={s.textarea} value={form.action_fr} onChange={e => setForm({ ...form, action_fr: e.target.value })} />
          ) : (
            <div style={s.value}>{q.action_fr}</div>
          )}
        </div>
        {q.idee_fausse_ciblee_fr && (
          <div style={s.field}>
            <div style={s.label}>{t('questions.misconception')}</div>
            <div style={{ ...s.value, fontStyle: 'italic', color: isDark ? '#e67e22' : '#c0392b' }}>
              « {q.idee_fausse_ciblee_fr} »
            </div>
          </div>
        )}
      </div>

      {/* Options EN */}
      {optionsEn.length > 0 && (
        <div style={s.section}>
          <div style={s.sectionTitle}>🇬🇧 {t('questions.options')} (English)</div>
          <div style={s.options}>
            {optionsEn.map((opt, i) => {
              const letter = String.fromCharCode(65 + i);
              const isCorrect = letter === q.reponse_correcte;
              return (
                <div key={i} style={s.option(isCorrect)}>
                  <div style={s.optLetter(isCorrect)}>{letter}</div>
                  <div style={{ flex: 1, color: isDark ? '#ddd' : '#333' }}>{opt}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Psychométrie */}
      {q.n_observations > 0 && (
        <div style={s.section}>
          <div style={s.sectionTitle}>{t('psychometrics.title')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div><div style={s.label}>{t('psychometrics.difficulty')}</div><div style={{ fontSize: 20, fontWeight: 700, color: isDark ? '#fff' : '#333' }}>{q.indice_difficulte ?? '—'}</div></div>
            <div><div style={s.label}>{t('psychometrics.discrimination')}</div><div style={{ fontSize: 20, fontWeight: 700, color: isDark ? '#fff' : '#333' }}>{q.indice_discrimination ?? '—'}</div></div>
            <div><div style={s.label}>{t('psychometrics.distractor')}</div><div style={{ fontSize: 20, fontWeight: 700, color: isDark ? '#fff' : '#333' }}>{q.distracteur_dominant || '—'}</div></div>
            <div><div style={s.label}>{t('psychometrics.observations')}</div><div style={{ fontSize: 20, fontWeight: 700, color: isDark ? '#fff' : '#333' }}>{q.n_observations}</div></div>
          </div>
        </div>
      )}

      {/* Historique */}
      {q.history?.length > 0 && (
        <div style={s.section}>
          <div style={s.sectionTitle}>{t('questions.history')}</div>
          {q.history.map((h, i) => (
            <div key={i} style={s.historyItem}>
              <Clock size={14} color={isDark ? '#666' : '#bbb'} style={{ marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 500, color: isDark ? '#ddd' : '#333' }}>{h.action}</div>
                <div style={{ fontSize: 11, color: isDark ? '#888' : '#999' }}>
                  {h.user_name || 'Système'} · {new Date(h.created_at).toLocaleDateString('fr-FR')}
                </div>
                {h.comment && <div style={{ fontSize: 12, color: isDark ? '#aaa' : '#666', marginTop: 2 }}>{h.comment}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save button */}
      {editing && (
        <div style={{ ...s.actions, marginBottom: 40 }}>
          <button style={s.btn(false)} onClick={() => setEditing(false)}>{t('common.cancel')}</button>
          <button style={s.btn(true)} onClick={handleSave} disabled={saving}>
            <Save size={14} /> {saving ? t('common.loading') : t('common.save')}
          </button>
        </div>
      )}

      {/* Status change modal */}
      {statusModal && (
        <div style={s.modal} onClick={() => setStatusModal(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: isDark ? '#fff' : '#333' }}>
              {t('questions.changeStatus')}
            </div>
            <select style={{ ...s.select, width: '100%', marginBottom: 16 }} value={newStatus} onChange={e => setNewStatus(e.target.value)}>
              <option value="">-- Sélectionner --</option>
              {Object.entries(QUESTION_STATUS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
            <div style={s.actions}>
              <button style={s.btn(false)} onClick={() => setStatusModal(false)}>{t('common.cancel')}</button>
              <button style={s.btn(true)} onClick={handleStatusChange} disabled={!newStatus}>{t('common.confirm')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DusscQuestionDetail;
