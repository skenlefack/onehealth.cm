/**
 * DusscSettings — Paramètres du module DUSS-C
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import useDusscStore from '../stores/dusscStore';
import * as dusscApi from '../services/dusscApi';
import { DUSSC_COLORS } from '../utils/constants';

const DusscSettings = ({ isDark }) => {
  const { t } = useTranslation('dussc');
  const { settings, fetchSettings } = useDusscStore();
  const [localSettings, setLocalSettings] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  useEffect(() => {
    const map = {};
    settings.forEach(s => { map[s.setting_key] = s.setting_value; });
    setLocalSettings(map);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(localSettings)) {
        const original = settings.find(s => s.setting_key === key);
        if (original && original.setting_value !== value) {
          await dusscApi.updateSetting(key, value);
        }
      }
      toast.success(t('common.success'));
      fetchSettings();
    } catch { toast.error(t('common.error')); }
    setSaving(false);
  };

  const s = {
    title: { fontSize: 22, fontWeight: 700, color: isDark ? '#fff' : DUSSC_COLORS.encre, marginBottom: 24 },
    section: { background: isDark ? '#1e1e2e' : '#fff', borderRadius: 12, padding: 24, marginBottom: 16, border: `1px solid ${isDark ? '#333' : '#e8ece8'}` },
    sectionTitle: { fontSize: 14, fontWeight: 700, color: isDark ? '#ccc' : '#555', marginBottom: 16 },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${isDark ? '#2a2a3e' : '#f5f5f5'}` },
    label: { fontSize: 14, color: isDark ? '#ddd' : '#333' },
    desc: { fontSize: 11, color: isDark ? '#888' : '#999', marginTop: 2 },
    input: { width: 120, padding: '8px 12px', borderRadius: 8, fontSize: 14, textAlign: 'right', border: `1px solid ${isDark ? '#444' : '#ddd'}`, background: isDark ? '#2a2a3e' : '#fafafa', color: isDark ? '#ddd' : '#333' },
    btn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '12px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', background: DUSSC_COLORS.primary, color: '#fff', marginTop: 16 },
  };

  const settingGroups = [
    {
      title: 'Quiz',
      items: [
        { key: 'quiz_duration_target_minutes', label: t('settings.quizDuration') },
        { key: 'pre_test_question_count', label: 'Questions pré-test' },
        { key: 'post_test_question_count', label: 'Questions post-test' },
        { key: 'common_question_count', label: 'Questions tronc commun' },
        { key: 'profile_question_count', label: 'Questions profilées' },
      ],
    },
    {
      title: 'Qualité des données',
      items: [
        { key: 'suspicious_min_duration_seconds', label: t('settings.suspiciousDuration') },
        { key: 'min_observations_psychometrics', label: 'Min observations psychométrie' },
        { key: 'min_aggregation_threshold', label: t('settings.minAggregation') },
      ],
    },
    {
      title: 'Gouvernance',
      items: [
        { key: 'revision_period_months', label: 'Période de révision (mois)' },
        { key: 'data_retention_months', label: t('settings.retentionMonths') },
        { key: 'auto_suspend_expired_revision', label: t('settings.autoSuspend') },
      ],
    },
  ];

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={s.title}>{t('settings.title')}</div>

      {settingGroups.map((group) => (
        <div key={group.title} style={s.section}>
          <div style={s.sectionTitle}>{group.title}</div>
          {group.items.map((item) => {
            const desc = settings.find(st => st.setting_key === item.key)?.description;
            return (
              <div key={item.key} style={s.row}>
                <div>
                  <div style={s.label}>{item.label}</div>
                  {desc && <div style={s.desc}>{desc}</div>}
                </div>
                <input
                  style={s.input}
                  value={localSettings[item.key] || ''}
                  onChange={(e) => setLocalSettings({ ...localSettings, [item.key]: e.target.value })}
                />
              </div>
            );
          })}
        </div>
      ))}

      <button style={s.btn} onClick={handleSave} disabled={saving}>
        <Save size={16} /> {saving ? t('common.loading') : t('common.save')}
      </button>
    </div>
  );
};

export default DusscSettings;
