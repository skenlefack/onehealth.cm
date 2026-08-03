/**
 * DusscTemplateForm — Formulaire pleine page de création de template
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, Layout } from 'lucide-react';
import { toast } from 'react-toastify';
import useDusscStore from '../stores/dusscStore';
import * as dusscApi from '../services/dusscApi';
import { BLOC_OPTIONS, DUSSC_COLORS } from '../utils/constants';

const DusscTemplateForm = ({ isDark }) => {
  const { t } = useTranslation('dussc');
  const { setActivePage, fetchTemplates } = useDusscStore();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: '',
    name_fr: '',
    name_en: '',
    description_fr: '',
    description_en: '',
    pre_test_count: 3,
    common_count: 4,
    profile_count: 5,
    post_test_count: 3,
    randomize_options: true,
    show_feedback: true,
    show_progress_bar: true,
    require_consent: true,
  });

  const totalQuestions = form.pre_test_count + form.common_count + form.profile_count + form.post_test_count;

  const handleSubmit = async () => {
    if (!form.code || !form.name_fr) {
      toast.error('Code et nom français requis');
      return;
    }
    setSaving(true);
    try {
      await dusscApi.createTemplate(form);
      toast.success('Template créé');
      fetchTemplates();
      setActivePage('templates');
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    }
    setSaving(false);
  };

  const s = {
    page: { maxWidth: 700, margin: '0 auto' },
    backBtn: {
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 0',
      border: 'none', background: 'none', color: DUSSC_COLORS.primary,
      fontSize: 14, fontWeight: 500, cursor: 'pointer', marginBottom: 16,
    },
    title: { fontSize: 22, fontWeight: 700, color: isDark ? '#fff' : DUSSC_COLORS.encre, marginBottom: 8 },
    subtitle: { fontSize: 14, color: isDark ? '#888' : '#999', marginBottom: 24 },
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
    input: {
      width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14,
      border: `1px solid ${isDark ? '#444' : '#ddd'}`, background: isDark ? '#2a2a3e' : '#fafafa',
      color: isDark ? '#ddd' : '#333', fontFamily: 'inherit',
    },
    textarea: {
      width: '100%', padding: '12px 14px', borderRadius: 8, fontSize: 14,
      border: `1px solid ${isDark ? '#444' : '#ddd'}`, background: isDark ? '#2a2a3e' : '#fafafa',
      color: isDark ? '#ddd' : '#333', minHeight: 80, resize: 'vertical', fontFamily: 'inherit',
    },
    blocGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 },
    blocCard: (color) => ({
      padding: '16px 14px', borderRadius: 10, textAlign: 'center',
      background: `${color}10`, border: `1px solid ${color}25`,
    }),
    blocLabel: { fontSize: 11, fontWeight: 600, color: isDark ? '#aaa' : '#777', textTransform: 'uppercase', marginBottom: 8 },
    blocInput: {
      width: '100%', padding: '8px', borderRadius: 8, fontSize: 20, fontWeight: 700,
      textAlign: 'center', border: `1px solid ${isDark ? '#444' : '#ddd'}`,
      background: isDark ? '#2a2a3e' : '#fff', color: isDark ? '#fff' : '#333',
    },
    totalBanner: {
      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
      padding: '12px', borderRadius: 8, marginTop: 8,
      background: `${DUSSC_COLORS.primary}10`, border: `1px solid ${DUSSC_COLORS.primary}25`,
      fontSize: 14, fontWeight: 600, color: DUSSC_COLORS.primary,
    },
    toggle: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${isDark ? '#2a2a3e' : '#f5f5f5'}` },
    toggleLabel: { fontSize: 14, color: isDark ? '#ddd' : '#333' },
    toggleSwitch: (on) => ({
      width: 44, height: 24, borderRadius: 12, cursor: 'pointer', border: 'none',
      background: on ? DUSSC_COLORS.primary : (isDark ? '#444' : '#ccc'),
      position: 'relative', transition: 'background 0.2s',
    }),
    toggleKnob: (on) => ({
      width: 18, height: 18, borderRadius: '50%', background: '#fff',
      position: 'absolute', top: 3, left: on ? 23 : 3, transition: 'left 0.2s',
    }),
    actions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginBottom: 40 },
    btn: (primary) => ({
      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px',
      borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
      border: primary ? 'none' : `1px solid ${isDark ? '#444' : '#ddd'}`,
      background: primary ? DUSSC_COLORS.primary : 'transparent',
      color: primary ? '#fff' : (isDark ? '#ccc' : '#555'),
    }),
  };

  return (
    <div style={s.page}>
      <button style={s.backBtn} onClick={() => setActivePage('templates')}>
        <ArrowLeft size={16} /> Retour aux templates
      </button>

      <div style={s.title}>Nouveau template de quiz</div>
      <div style={s.subtitle}>Définissez la structure du parcours : nombre de questions par bloc et options</div>

      {/* Identité */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Identité</div>
        <div style={s.fieldRow}>
          <div>
            <label style={s.label}>Code *</label>
            <input style={s.input} value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="PILOT-2026-V2" />
          </div>
          <div>
            <label style={s.label}>Nom FR *</label>
            <input style={s.input} value={form.name_fr} onChange={e => setForm({ ...form, name_fr: e.target.value })} placeholder="Parcours pilote V2" />
          </div>
        </div>
        <div style={s.fieldRow}>
          <div>
            <label style={s.label}>Nom EN</label>
            <input style={s.input} value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} />
          </div>
        </div>
        <div style={s.fieldRow}>
          <div>
            <label style={s.label}>Description FR</label>
            <textarea style={s.textarea} value={form.description_fr} onChange={e => setForm({ ...form, description_fr: e.target.value })} />
          </div>
          <div>
            <label style={s.label}>Description EN</label>
            <textarea style={s.textarea} value={form.description_en} onChange={e => setForm({ ...form, description_en: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Structure des blocs */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Structure du parcours</div>
        <div style={s.blocGrid}>
          {BLOC_OPTIONS.map((bloc) => {
            const key = bloc.value === 'pre_test' ? 'pre_test_count'
              : bloc.value === 'tronc_commun' ? 'common_count'
              : bloc.value === 'profil' ? 'profile_count'
              : 'post_test_count';
            return (
              <div key={bloc.value} style={s.blocCard(bloc.color)}>
                <div style={s.blocLabel}>{bloc.label}</div>
                <input
                  style={s.blocInput}
                  type="number"
                  min={0}
                  max={20}
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: parseInt(e.target.value) || 0 })}
                />
              </div>
            );
          })}
        </div>
        <div style={s.totalBanner}>
          <Layout size={16} /> Total : {totalQuestions} questions par parcours
        </div>
      </div>

      {/* Options */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Options</div>
        {[
          { key: 'randomize_options', label: 'Randomiser l\'ordre des options' },
          { key: 'show_feedback', label: 'Afficher le feedback pédagogique' },
          { key: 'show_progress_bar', label: 'Afficher la barre de progression' },
          { key: 'require_consent', label: 'Exiger le consentement' },
        ].map(opt => (
          <div key={opt.key} style={s.toggle}>
            <span style={s.toggleLabel}>{opt.label}</span>
            <button
              style={s.toggleSwitch(form[opt.key])}
              onClick={() => setForm({ ...form, [opt.key]: !form[opt.key] })}
            >
              <div style={s.toggleKnob(form[opt.key])} />
            </button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={s.actions}>
        <button style={s.btn(false)} onClick={() => setActivePage('templates')}>
          {t('common.cancel')}
        </button>
        <button style={s.btn(true)} onClick={handleSubmit} disabled={saving}>
          <Save size={16} /> {saving ? t('common.loading') : 'Créer le template'}
        </button>
      </div>
    </div>
  );
};

export default DusscTemplateForm;
