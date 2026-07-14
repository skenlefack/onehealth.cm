/**
 * PublicFormSettings - Configuration du formulaire public de signalement
 */

import React, { useState, useEffect } from 'react';
import {
  Globe, Save, ToggleLeft, ToggleRight, ExternalLink, Copy,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getSettings, updateSettings } from '../services/cohrmApi';
import { COHRM_COLORS } from '../utils/constants';
import { LoadingSpinner } from '../components/shared';
import { toast } from 'react-toastify';

const PublicFormSettings = ({ isDark, user }) => {
  const { t } = useTranslation('cohrm');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    public_form_enabled: true,
    public_form_captcha: true,
    public_form_welcome_fr: 'Bienvenue sur le formulaire de signalement COHRM. Signalez tout événement sanitaire suspect.',
    public_form_welcome_en: 'Welcome to the COHRM reporting form. Report any suspicious health event.',
    public_form_require_name: false,
    public_form_require_location: true,
    public_form_require_gps: false,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSettings();
        if (res.success && res.data) {
          const merged = { ...settings };
          res.data.forEach(s => {
            if (s.key in merged) {
              merged[s.key] = s.value === 'true' ? true : s.value === 'false' ? false : s.value;
            }
          });
          setSettings(merged);
        }
      } catch (err) {
        console.error('Load settings error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {};
      Object.entries(settings).forEach(([key, value]) => {
        data[key] = String(value);
      });
      await updateSettings(data);
      toast.success(t('settings.saved', 'Paramètres sauvegardés'));
    } catch (err) {
      toast.error(t('common.error', 'Erreur'));
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const publicUrl = `${window.location.origin}/fr/cohrm-system`;

  const s = {
    container: { maxWidth: 720, margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
    title: { fontSize: 22, fontWeight: 700, color: isDark ? '#e2e8f0' : '#1f2937', display: 'flex', alignItems: 'center', gap: 10 },
    section: {
      padding: 24, borderRadius: 12, marginBottom: 16,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    sectionTitle: { fontSize: 15, fontWeight: 600, color: isDark ? '#e2e8f0' : '#1f2937', marginBottom: 16 },
    row: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 0',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #F3F4F6',
    },
    rowLabel: { fontSize: 14, color: isDark ? '#e2e8f0' : '#374151' },
    rowDesc: { fontSize: 12, color: isDark ? '#64748b' : '#9CA3AF', marginTop: 2 },
    toggleBtn: (active) => ({
      cursor: 'pointer', color: active ? '#10B981' : (isDark ? '#475569' : '#D1D5DB'),
      transition: 'color 0.2s',
    }),
    textarea: {
      width: '100%', padding: 12, borderRadius: 8, fontSize: 13,
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      backgroundColor: isDark ? '#0f172a' : '#FAFAFA',
      color: isDark ? '#e2e8f0' : '#374151',
      outline: 'none', resize: 'vertical', minHeight: 80, boxSizing: 'border-box',
      fontFamily: 'inherit',
    },
    label: { fontSize: 13, fontWeight: 500, color: isDark ? '#94a3b8' : '#6B7280', marginBottom: 6, display: 'block' },
    saveBtn: {
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 24px', borderRadius: 8, border: 'none',
      backgroundColor: COHRM_COLORS.primary, color: '#fff',
      fontSize: 14, fontWeight: 600, cursor: 'pointer',
    },
    urlBox: {
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 14px', borderRadius: 8,
      backgroundColor: isDark ? '#0f172a' : '#F3F4F6',
      fontSize: 13, color: isDark ? '#94a3b8' : '#6B7280',
    },
    copyBtn: {
      padding: '4px 8px', borderRadius: 6, border: 'none',
      backgroundColor: 'transparent', color: COHRM_COLORS.primary,
      cursor: 'pointer', display: 'flex', alignItems: 'center',
    },
  };

  if (loading) return <LoadingSpinner isDark={isDark} />;

  const ToggleIcon = ({ active, onClick }) => {
    const Icon = active ? ToggleRight : ToggleLeft;
    return <Icon size={28} style={s.toggleBtn(active)} onClick={onClick} />;
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div style={s.title}>
          <Globe size={22} />
          {t('publicForm.settings', 'Formulaire public')}
        </div>
        <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
          <Save size={16} />
          {saving ? t('common.saving', 'Enregistrement...') : t('common.save', 'Enregistrer')}
        </button>
      </div>

      {/* URL publique */}
      <div style={s.section}>
        <div style={s.sectionTitle}>{t('publicForm.url', 'Lien public')}</div>
        <div style={s.urlBox}>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{publicUrl}</span>
          <button style={s.copyBtn} onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success('Lien copié'); }}>
            <Copy size={15} />
          </button>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" style={{ ...s.copyBtn, textDecoration: 'none' }}>
            <ExternalLink size={15} />
          </a>
        </div>
      </div>

      {/* Activation */}
      <div style={s.section}>
        <div style={s.sectionTitle}>{t('publicForm.activation', 'Activation')}</div>
        <div style={s.row}>
          <div>
            <div style={s.rowLabel}>{t('publicForm.enable', 'Activer le formulaire public')}</div>
            <div style={s.rowDesc}>{t('publicForm.enableDesc', 'Permet aux citoyens de soumettre des signalements')}</div>
          </div>
          <ToggleIcon active={settings.public_form_enabled} onClick={() => toggle('public_form_enabled')} />
        </div>
        <div style={s.row}>
          <div>
            <div style={s.rowLabel}>{t('publicForm.captcha', 'CAPTCHA')}</div>
            <div style={s.rowDesc}>{t('publicForm.captchaDesc', 'Protection anti-robot sur le formulaire')}</div>
          </div>
          <ToggleIcon active={settings.public_form_captcha} onClick={() => toggle('public_form_captcha')} />
        </div>
      </div>

      {/* Champs requis */}
      <div style={s.section}>
        <div style={s.sectionTitle}>{t('publicForm.requiredFields', 'Champs requis')}</div>
        <div style={s.row}>
          <div style={s.rowLabel}>{t('publicForm.requireName', 'Nom du signalant')}</div>
          <ToggleIcon active={settings.public_form_require_name} onClick={() => toggle('public_form_require_name')} />
        </div>
        <div style={s.row}>
          <div style={s.rowLabel}>{t('publicForm.requireLocation', 'Localisation')}</div>
          <ToggleIcon active={settings.public_form_require_location} onClick={() => toggle('public_form_require_location')} />
        </div>
        <div style={{ ...s.row, borderBottom: 'none' }}>
          <div style={s.rowLabel}>{t('publicForm.requireGPS', 'Coordonnées GPS')}</div>
          <ToggleIcon active={settings.public_form_require_gps} onClick={() => toggle('public_form_require_gps')} />
        </div>
      </div>

      {/* Messages d'accueil */}
      <div style={s.section}>
        <div style={s.sectionTitle}>{t('publicForm.welcomeMessage', 'Message d\'accueil')}</div>
        <div style={{ marginBottom: 16 }}>
          <label style={s.label}>Français</label>
          <textarea
            style={s.textarea}
            value={settings.public_form_welcome_fr}
            onChange={(e) => update('public_form_welcome_fr', e.target.value)}
          />
        </div>
        <div>
          <label style={s.label}>English</label>
          <textarea
            style={s.textarea}
            value={settings.public_form_welcome_en}
            onChange={(e) => update('public_form_welcome_en', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default PublicFormSettings;
