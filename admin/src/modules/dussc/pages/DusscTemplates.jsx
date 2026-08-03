/**
 * DusscTemplates — Gestion des templates de quiz
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout, Plus, Check, Globe, Settings } from 'lucide-react';
import { toast } from 'react-toastify';
import useDusscStore from '../stores/dusscStore';
import * as dusscApi from '../services/dusscApi';
import { DUSSC_COLORS, BLOC_OPTIONS } from '../utils/constants';

const DusscTemplates = ({ isDark, user }) => {
  const { t } = useTranslation('dussc');
  const { templates, loadingTemplates, fetchTemplates } = useDusscStore();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ code: '', name_fr: '', name_en: '', pre_test_count: 3, common_count: 4, profile_count: 5, post_test_count: 3 });
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchTemplates(); }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await dusscApi.createTemplate(form);
      toast.success(t('common.success'));
      fetchTemplates();
      setShowCreate(false);
      setForm({ code: '', name_fr: '', name_en: '', pre_test_count: 3, common_count: 4, profile_count: 5, post_test_count: 3 });
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    }
    setCreating(false);
  };

  const handlePublish = async (id) => {
    try {
      await dusscApi.publishTemplate(id);
      toast.success('Template activé');
      fetchTemplates();
    } catch (err) {
      toast.error(t('common.error'));
    }
  };

  const s = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 22, fontWeight: 700, color: isDark ? '#fff' : DUSSC_COLORS.encre },
    btn: (primary) => ({
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px',
      borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
      border: primary ? 'none' : `1px solid ${isDark ? '#444' : '#ddd'}`,
      background: primary ? DUSSC_COLORS.primary : 'transparent',
      color: primary ? '#fff' : (isDark ? '#ccc' : '#555'),
    }),
    card: (isActive) => ({
      background: isDark ? '#1e1e2e' : '#fff', borderRadius: 12, padding: 20,
      border: `2px solid ${isActive ? DUSSC_COLORS.primary : (isDark ? '#333' : '#e8ece8')}`,
      marginBottom: 12, position: 'relative',
    }),
    activeBadge: {
      position: 'absolute', top: 12, right: 12, padding: '3px 10px',
      borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: `${DUSSC_COLORS.primary}18`, color: DUSSC_COLORS.primary,
    },
    cardTitle: { fontSize: 16, fontWeight: 700, color: isDark ? '#fff' : '#333', marginBottom: 4 },
    cardCode: { fontSize: 12, color: isDark ? '#888' : '#999', fontFamily: 'monospace', marginBottom: 12 },
    blocGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 },
    blocItem: (color) => ({
      padding: '10px 12px', borderRadius: 8, textAlign: 'center',
      background: `${color}12`, border: `1px solid ${color}30`,
    }),
    blocLabel: { fontSize: 10, fontWeight: 600, color: isDark ? '#aaa' : '#777', textTransform: 'uppercase', letterSpacing: '0.05em' },
    blocValue: { fontSize: 20, fontWeight: 700, color: isDark ? '#fff' : '#333', marginTop: 2 },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 },
    input: {
      width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14,
      border: `1px solid ${isDark ? '#444' : '#ddd'}`, background: isDark ? '#2a2a3e' : '#fafafa',
      color: isDark ? '#ddd' : '#333',
    },
    label: { display: 'block', fontSize: 11, fontWeight: 600, color: isDark ? '#999' : '#777', marginBottom: 4 },
    modal: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    modalContent: {
      background: isDark ? '#1e1e2e' : '#fff', borderRadius: 12, padding: 24,
      width: 500, maxWidth: '90vw',
    },
  };

  return (
    <div>
      <div style={s.header}>
        <div>
          <div style={s.title}>{t('templates.title')}</div>
          <div style={{ fontSize: 13, color: isDark ? '#888' : '#999', marginTop: 4 }}>
            {templates.length} template{templates.length > 1 ? 's' : ''}
          </div>
        </div>
        <button style={s.btn(true)} onClick={() => setShowCreate(true)}>
          <Plus size={16} /> {t('templates.create')}
        </button>
      </div>

      {loadingTemplates ? (
        <div style={{ textAlign: 'center', padding: 40, color: isDark ? '#888' : '#999' }}>{t('common.loading')}</div>
      ) : templates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: isDark ? '#888' : '#999' }}>
          <Layout size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div>Aucun template créé</div>
        </div>
      ) : (
        templates.map((tpl) => (
          <div key={tpl.id} style={s.card(!!tpl.is_active)}>
            {tpl.is_active && <div style={s.activeBadge}>✓ Actif</div>}
            <div style={s.cardTitle}>{tpl.name_fr}</div>
            <div style={s.cardCode}>{tpl.code}</div>

            <div style={s.blocGrid}>
              {BLOC_OPTIONS.map((bloc) => (
                <div key={bloc.value} style={s.blocItem(bloc.color)}>
                  <div style={s.blocLabel}>{bloc.label}</div>
                  <div style={s.blocValue}>
                    {bloc.value === 'pre_test' ? tpl.pre_test_count :
                     bloc.value === 'tronc_commun' ? tpl.common_count :
                     bloc.value === 'profil' ? tpl.profile_count :
                     tpl.post_test_count}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {!tpl.is_active && (
                <button style={s.btn(true)} onClick={() => handlePublish(tpl.id)}>
                  <Globe size={14} /> {t('templates.publish')}
                </button>
              )}
            </div>
          </div>
        ))
      )}

      {/* Modal création */}
      {showCreate && (
        <div style={s.modal} onClick={() => setShowCreate(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: isDark ? '#fff' : '#333' }}>
              {t('templates.create')}
            </div>
            <div style={s.formGrid}>
              <div><div style={s.label}>{t('templates.code')}</div><input style={s.input} value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="PILOT-2026-V1" /></div>
              <div><div style={s.label}>Nom FR</div><input style={s.input} value={form.name_fr} onChange={e => setForm({ ...form, name_fr: e.target.value })} /></div>
              <div><div style={s.label}>Nom EN</div><input style={s.input} value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} /></div>
              <div><div style={s.label}>{t('templates.preTest')}</div><input style={s.input} type="number" value={form.pre_test_count} onChange={e => setForm({ ...form, pre_test_count: parseInt(e.target.value) || 0 })} /></div>
              <div><div style={s.label}>{t('templates.common')}</div><input style={s.input} type="number" value={form.common_count} onChange={e => setForm({ ...form, common_count: parseInt(e.target.value) || 0 })} /></div>
              <div><div style={s.label}>{t('templates.profile')}</div><input style={s.input} type="number" value={form.profile_count} onChange={e => setForm({ ...form, profile_count: parseInt(e.target.value) || 0 })} /></div>
              <div><div style={s.label}>{t('templates.postTest')}</div><input style={s.input} type="number" value={form.post_test_count} onChange={e => setForm({ ...form, post_test_count: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button style={s.btn(false)} onClick={() => setShowCreate(false)}>{t('common.cancel')}</button>
              <button style={s.btn(true)} onClick={handleCreate} disabled={creating || !form.code || !form.name_fr}>
                {creating ? t('common.loading') : t('common.create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DusscTemplates;
