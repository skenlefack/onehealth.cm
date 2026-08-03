/**
 * DusscAlertForm — Formulaire pleine page de création d'alerte
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import useDusscStore from '../stores/dusscStore';
import * as dusscApi from '../services/dusscApi';
import { ALERT_SCENARIOS, REGIONS_CAMEROON, DUSSC_COLORS } from '../utils/constants';

const DusscAlertForm = ({ isDark }) => {
  const { t } = useTranslation('dussc');
  const { setActivePage, fetchAlerts } = useDusscStore();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: '',
    name_fr: '',
    name_en: '',
    scenario: 'mpox',
    description_fr: '',
    description_en: '',
    target_regions: [],
  });

  const toggleRegion = (value) => {
    const current = form.target_regions;
    if (current.includes(value)) {
      setForm({ ...form, target_regions: current.filter(r => r !== value) });
    } else {
      setForm({ ...form, target_regions: [...current, value] });
    }
  };

  const handleSubmit = async () => {
    if (!form.code || !form.name_fr) {
      toast.error('Code et nom français requis');
      return;
    }
    setSaving(true);
    try {
      await dusscApi.createAlert(form);
      toast.success('Alerte créée');
      fetchAlerts();
      setActivePage('alerts');
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
    select: {
      width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14,
      border: `1px solid ${isDark ? '#444' : '#ddd'}`, background: isDark ? '#2a2a3e' : '#fafafa',
      color: isDark ? '#ddd' : '#333',
    },
    scenarioGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 },
    scenarioCard: (selected, color) => ({
      padding: '14px 10px', borderRadius: 10, textAlign: 'center', cursor: 'pointer',
      border: `2px solid ${selected ? color : (isDark ? '#333' : '#e8ece8')}`,
      background: selected ? `${color}12` : (isDark ? '#2a2a3e' : '#fafafa'),
      transition: 'all 0.15s',
    }),
    scenarioIcon: { fontSize: 24, marginBottom: 6 },
    scenarioLabel: (selected, color) => ({
      fontSize: 12, fontWeight: 600, color: selected ? color : (isDark ? '#aaa' : '#666'),
    }),
    regionGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 },
    regionChip: (selected) => ({
      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
      borderRadius: 8, cursor: 'pointer',
      border: `1px solid ${selected ? DUSSC_COLORS.primary : (isDark ? '#333' : '#ddd')}`,
      background: selected ? `${DUSSC_COLORS.primary}10` : 'transparent',
      fontSize: 13, color: selected ? DUSSC_COLORS.primary : (isDark ? '#ccc' : '#555'),
      fontWeight: selected ? 600 : 400,
    }),
    checkbox: (selected) => ({
      width: 18, height: 18, borderRadius: 4, flexShrink: 0,
      border: `2px solid ${selected ? DUSSC_COLORS.primary : (isDark ? '#555' : '#ccc')}`,
      background: selected ? DUSSC_COLORS.primary : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: 11, fontWeight: 700,
    }),
    actions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginBottom: 40 },
    btn: (primary) => ({
      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px',
      borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
      border: primary ? 'none' : `1px solid ${isDark ? '#444' : '#ddd'}`,
      background: primary ? '#C0392B' : 'transparent',
      color: primary ? '#fff' : (isDark ? '#ccc' : '#555'),
    }),
  };

  const scenarioIcons = { mpox: '🦠', cholera: '💧', influenza_aviaire: '🐔', autre: '⚠️' };

  return (
    <div style={s.page}>
      <button style={s.backBtn} onClick={() => setActivePage('alerts')}>
        <ArrowLeft size={16} /> Retour aux alertes
      </button>

      <div style={s.title}>Nouvelle alerte</div>
      <div style={s.subtitle}>Configurez un scénario d'alerte pour le module M12 activable</div>

      {/* Scénario */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Scénario</div>
        <div style={s.scenarioGrid}>
          {ALERT_SCENARIOS.map(sc => (
            <div
              key={sc.value}
              style={s.scenarioCard(form.scenario === sc.value, sc.color)}
              onClick={() => setForm({ ...form, scenario: sc.value })}
            >
              <div style={s.scenarioIcon}>{scenarioIcons[sc.value]}</div>
              <div style={s.scenarioLabel(form.scenario === sc.value, sc.color)}>{sc.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Identité */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Identité</div>
        <div style={s.fieldRow}>
          <div>
            <label style={s.label}>Code *</label>
            <input style={s.input} value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="ALERT-MPOX-2026" />
          </div>
          <div>
            <label style={s.label}>Nom FR *</label>
            <input style={s.input} value={form.name_fr} onChange={e => setForm({ ...form, name_fr: e.target.value })} placeholder="Alerte Mpox Littoral" />
          </div>
        </div>
        <div style={s.field}>
          <label style={s.label}>Nom EN</label>
          <input style={s.input} value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} />
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

      {/* Régions ciblées */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Régions ciblées</div>
        <div style={s.regionGrid}>
          {REGIONS_CAMEROON.map(r => (
            <div
              key={r.value}
              style={s.regionChip(form.target_regions.includes(r.value))}
              onClick={() => toggleRegion(r.value)}
            >
              <div style={s.checkbox(form.target_regions.includes(r.value))}>
                {form.target_regions.includes(r.value) ? '✓' : ''}
              </div>
              {r.label}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={s.actions}>
        <button style={s.btn(false)} onClick={() => setActivePage('alerts')}>
          {t('common.cancel')}
        </button>
        <button style={{ ...s.btn(true) }} onClick={handleSubmit} disabled={saving}>
          <Save size={16} /> {saving ? t('common.loading') : 'Créer l\'alerte'}
        </button>
      </div>
    </div>
  );
};

export default DusscAlertForm;
