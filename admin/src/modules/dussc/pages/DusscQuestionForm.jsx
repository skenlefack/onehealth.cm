/**
 * DusscQuestionForm — Formulaire pleine page de création/édition de question
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, Plus, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import useDusscStore from '../stores/dusscStore';
import * as dusscApi from '../services/dusscApi';
import { NIVEAU_OPTIONS, TYPE_ITEM_OPTIONS, ROLE_TEST_OPTIONS, DUSSC_COLORS } from '../utils/constants';

const DusscQuestionForm = ({ isDark }) => {
  const { t } = useTranslation('dussc');
  const { setActivePage, modules, fetchQuestions } = useDusscStore();
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  const [form, setForm] = useState({
    module_id: '',
    enonce_fr: '',
    enonce_en: '',
    options_fr: ['', '', '', ''],
    options_en: ['', '', '', ''],
    reponse_correcte: 'A',
    explication_fr: '',
    explication_en: '',
    action_fr: '',
    action_en: '',
    idee_fausse_ciblee_fr: '',
    idee_fausse_ciblee_en: '',
    type_item: 'connaissance',
    niveau: 'grand_public',
    role_test: 'courante',
    sensibilite: 'standard',
    public_cible: [],
    secteur_validateur: [],
  });

  const updateOption = (lang, idx, value) => {
    const key = `options_${lang}`;
    const opts = [...form[key]];
    opts[idx] = value;
    setForm({ ...form, [key]: opts });
  };

  const handleSubmit = async () => {
    if (!form.module_id || !form.enonce_fr || form.options_fr.some(o => !o.trim())) {
      toast.error('Remplissez tous les champs obligatoires (module, énoncé, options FR)');
      return;
    }
    setSaving(true);
    try {
      await dusscApi.createQuestion({
        ...form,
        options_fr: form.options_fr.filter(o => o.trim()),
        options_en: form.options_en.filter(o => o.trim()).length > 0 ? form.options_en.filter(o => o.trim()) : undefined,
      });
      toast.success('Question créée');
      fetchQuestions();
      setActivePage('questions');
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    }
    setSaving(false);
  };

  const s = {
    page: { maxWidth: 900, margin: '0 auto' },
    backBtn: {
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 0',
      border: 'none', background: 'none', color: DUSSC_COLORS.primary,
      fontSize: 14, fontWeight: 500, cursor: 'pointer', marginBottom: 16,
    },
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24,
    },
    title: { fontSize: 22, fontWeight: 700, color: isDark ? '#fff' : DUSSC_COLORS.encre },
    subtitle: { fontSize: 13, color: isDark ? '#888' : '#999', marginTop: 4 },
    section: {
      background: isDark ? '#1e1e2e' : '#fff', borderRadius: 12, padding: 24,
      marginBottom: 20, border: `1px solid ${isDark ? '#333' : '#e8ece8'}`,
    },
    sectionTitle: {
      fontSize: 15, fontWeight: 700, color: isDark ? '#ccc' : DUSSC_COLORS.encre,
      marginBottom: 16, paddingBottom: 10,
      borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`,
    },
    fieldRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
    field: { marginBottom: 16 },
    label: {
      display: 'block', fontSize: 12, fontWeight: 600, color: isDark ? '#aaa' : '#555',
      marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.03em',
    },
    required: { color: '#E74C3C', marginLeft: 2 },
    input: {
      width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14,
      border: `1px solid ${isDark ? '#444' : '#ddd'}`, background: isDark ? '#2a2a3e' : '#fafafa',
      color: isDark ? '#ddd' : '#333', fontFamily: 'inherit',
    },
    textarea: {
      width: '100%', padding: '12px 14px', borderRadius: 8, fontSize: 14,
      border: `1px solid ${isDark ? '#444' : '#ddd'}`, background: isDark ? '#2a2a3e' : '#fafafa',
      color: isDark ? '#ddd' : '#333', minHeight: 100, resize: 'vertical',
      fontFamily: 'inherit', lineHeight: 1.6,
    },
    select: {
      width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14,
      border: `1px solid ${isDark ? '#444' : '#ddd'}`, background: isDark ? '#2a2a3e' : '#fafafa',
      color: isDark ? '#ddd' : '#333',
    },
    optionRow: {
      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
    },
    optionLetter: (isCorrect) => ({
      width: 32, height: 32, borderRadius: '50%', fontSize: 13, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      cursor: 'pointer', transition: 'all 0.15s',
      background: isCorrect ? DUSSC_COLORS.correct : (isDark ? '#333' : '#e8ece8'),
      color: isCorrect ? '#fff' : (isDark ? '#aaa' : '#666'),
      border: `2px solid ${isCorrect ? DUSSC_COLORS.correct : 'transparent'}`,
    }),
    actions: {
      display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 20, marginBottom: 40,
    },
    btn: (primary) => ({
      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px',
      borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
      border: primary ? 'none' : `1px solid ${isDark ? '#444' : '#ddd'}`,
      background: primary ? DUSSC_COLORS.primary : 'transparent',
      color: primary ? '#fff' : (isDark ? '#ccc' : '#555'),
      transition: 'opacity 0.15s',
    }),
    previewCard: {
      background: isDark ? '#1a1a2a' : '#EAEFEB', borderRadius: 12, padding: 24,
      marginBottom: 20, border: `2px solid ${DUSSC_COLORS.primary}30`,
    },
    previewOption: (isCorrect) => ({
      display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px',
      borderRadius: 8, marginBottom: 8, cursor: 'default',
      border: `2px solid ${isCorrect ? DUSSC_COLORS.correct : (isDark ? '#333' : '#ddd')}`,
      background: isCorrect ? `${DUSSC_COLORS.correct}10` : (isDark ? '#2a2a3e' : '#fff'),
    }),
  };

  return (
    <div style={s.page}>
      <button style={s.backBtn} onClick={() => setActivePage('questions')}>
        <ArrowLeft size={16} /> Retour à la banque
      </button>

      <div style={s.header}>
        <div>
          <div style={s.title}>Nouvelle question</div>
          <div style={s.subtitle}>Remplissez les champs pour créer une question dans la banque DUSS-C</div>
        </div>
        <button
          style={{ ...s.btn(false), fontSize: 13 }}
          onClick={() => setPreview(!preview)}
        >
          <Eye size={16} /> {preview ? 'Édition' : 'Prévisualiser'}
        </button>
      </div>

      {preview ? (
        /* ── PRÉVISUALISATION ── */
        <div style={s.previewCard}>
          <div style={{ fontSize: 11, fontWeight: 600, color: DUSSC_COLORS.primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Prévisualisation
          </div>
          <div style={{ fontSize: 20, fontWeight: 400, fontFamily: 'Georgia, serif', color: isDark ? '#ddd' : DUSSC_COLORS.encre, marginBottom: 20, lineHeight: 1.4 }}>
            {form.enonce_fr || 'Énoncé de la question...'}
          </div>
          {form.options_fr.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            const isCorrect = letter === form.reponse_correcte;
            return opt.trim() ? (
              <div key={i} style={s.previewOption(isCorrect)}>
                <div style={s.optionLetter(isCorrect)}>{letter}</div>
                <div style={{ flex: 1, fontSize: 15, color: isDark ? '#ddd' : '#333' }}>{opt}</div>
              </div>
            ) : null;
          })}
          {form.explication_fr && (
            <div style={{ marginTop: 16, padding: '14px 16px', borderLeft: `4px solid ${DUSSC_COLORS.correct}`, background: isDark ? '#1e2e1e' : '#F1F6F1', borderRadius: '0 8px 8px 0' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: DUSSC_COLORS.correct, textTransform: 'uppercase', marginBottom: 6 }}>Explication</div>
              <div style={{ fontSize: 14, color: isDark ? '#ccc' : '#333', lineHeight: 1.6 }}>{form.explication_fr}</div>
              {form.action_fr && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.08)', fontSize: 13, color: isDark ? '#aaa' : '#555' }}>
                  <strong style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? '#888' : '#999' }}>À faire</strong><br />
                  {form.action_fr}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ── FORMULAIRE ── */
        <>
          {/* Classification */}
          <div style={s.section}>
            <div style={s.sectionTitle}>Classification</div>
            <div style={s.fieldRow}>
              <div>
                <label style={s.label}>Module <span style={s.required}>*</span></label>
                <select style={s.select} value={form.module_id} onChange={e => setForm({ ...form, module_id: e.target.value })}>
                  <option value="">-- Sélectionner --</option>
                  {modules.map(m => (
                    <option key={m.id} value={m.id}>{m.code} — {m.name_fr}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={s.label}>Type</label>
                <select style={s.select} value={form.type_item} onChange={e => setForm({ ...form, type_item: e.target.value })}>
                  {TYPE_ITEM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Niveau</label>
                <select style={s.select} value={form.niveau} onChange={e => setForm({ ...form, niveau: e.target.value })}>
                  {NIVEAU_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Rôle test</label>
                <select style={s.select} value={form.role_test} onChange={e => setForm({ ...form, role_test: e.target.value })}>
                  {ROLE_TEST_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Contenu FR */}
          <div style={s.section}>
            <div style={s.sectionTitle}>🇫🇷 Contenu français</div>
            <div style={s.field}>
              <label style={s.label}>Énoncé <span style={s.required}>*</span></label>
              <textarea style={s.textarea} value={form.enonce_fr} onChange={e => setForm({ ...form, enonce_fr: e.target.value })} placeholder="Dans votre quartier, plusieurs poulets d'un élevage voisin meurent..." />
            </div>

            <label style={s.label}>Options de réponse <span style={s.required}>*</span> — cliquez sur la lettre pour marquer la bonne réponse</label>
            {form.options_fr.map((opt, i) => {
              const letter = String.fromCharCode(65 + i);
              const isCorrect = letter === form.reponse_correcte;
              return (
                <div key={i} style={s.optionRow}>
                  <div
                    style={s.optionLetter(isCorrect)}
                    onClick={() => setForm({ ...form, reponse_correcte: letter })}
                    title={isCorrect ? 'Bonne réponse' : 'Cliquez pour marquer comme bonne réponse'}
                  >
                    {letter}
                  </div>
                  <input
                    style={{ ...s.input, flex: 1 }}
                    value={opt}
                    onChange={e => updateOption('fr', i, e.target.value)}
                    placeholder={`Option ${letter}`}
                  />
                </div>
              );
            })}

            <div style={{ ...s.fieldRow, marginTop: 16 }}>
              <div>
                <label style={s.label}>Explication pédagogique <span style={s.required}>*</span></label>
                <textarea style={{ ...s.textarea, minHeight: 80 }} value={form.explication_fr} onChange={e => setForm({ ...form, explication_fr: e.target.value })} placeholder="25 à 45 mots, en langage courant..." />
              </div>
              <div>
                <label style={s.label}>Instruction actionnable <span style={s.required}>*</span></label>
                <textarea style={{ ...s.textarea, minHeight: 80 }} value={form.action_fr} onChange={e => setForm({ ...form, action_fr: e.target.value })} placeholder="Signalez toute mortalité inhabituelle au..." />
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Idée fausse ciblée</label>
              <input style={s.input} value={form.idee_fausse_ciblee_fr} onChange={e => setForm({ ...form, idee_fausse_ciblee_fr: e.target.value })} placeholder="« Les maladies des animaux ne concernent que les vétérinaires »" />
            </div>
          </div>

          {/* Contenu EN */}
          <div style={s.section}>
            <div style={s.sectionTitle}>🇬🇧 English content (optional)</div>
            <div style={s.field}>
              <label style={s.label}>Statement</label>
              <textarea style={s.textarea} value={form.enonce_en} onChange={e => setForm({ ...form, enonce_en: e.target.value })} placeholder="English translation of the question..." />
            </div>

            {form.options_en.map((opt, i) => {
              const letter = String.fromCharCode(65 + i);
              return (
                <div key={i} style={s.optionRow}>
                  <div style={s.optionLetter(false)}>{letter}</div>
                  <input
                    style={{ ...s.input, flex: 1 }}
                    value={opt}
                    onChange={e => updateOption('en', i, e.target.value)}
                    placeholder={`Option ${letter} (EN)`}
                  />
                </div>
              );
            })}

            <div style={{ ...s.fieldRow, marginTop: 16 }}>
              <div>
                <label style={s.label}>Explanation</label>
                <textarea style={{ ...s.textarea, minHeight: 80 }} value={form.explication_en} onChange={e => setForm({ ...form, explication_en: e.target.value })} />
              </div>
              <div>
                <label style={s.label}>Action</label>
                <textarea style={{ ...s.textarea, minHeight: 80 }} value={form.action_en} onChange={e => setForm({ ...form, action_en: e.target.value })} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <div style={s.actions}>
        <button style={s.btn(false)} onClick={() => setActivePage('questions')}>
          {t('common.cancel')}
        </button>
        <button style={s.btn(true)} onClick={handleSubmit} disabled={saving}>
          <Save size={16} /> {saving ? t('common.loading') : 'Créer la question'}
        </button>
      </div>
    </div>
  );
};

export default DusscQuestionForm;
