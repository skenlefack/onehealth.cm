/**
 * DusscTemplates — Liste des templates de quiz (sans modal)
 */

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout, Plus, Globe } from 'lucide-react';
import { toast } from 'react-toastify';
import useDusscStore from '../stores/dusscStore';
import * as dusscApi from '../services/dusscApi';
import { DUSSC_COLORS, BLOC_OPTIONS } from '../utils/constants';

const DusscTemplates = ({ isDark }) => {
  const { t } = useTranslation('dussc');
  const { templates, loadingTemplates, fetchTemplates, setActivePage } = useDusscStore();

  useEffect(() => { fetchTemplates(); }, []);

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
    subtitle: { fontSize: 13, color: isDark ? '#888' : '#999', marginTop: 4 },
    btn: (primary) => ({
      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
      borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
      border: primary ? 'none' : `1px solid ${isDark ? '#444' : '#ddd'}`,
      background: primary ? DUSSC_COLORS.primary : 'transparent',
      color: primary ? '#fff' : (isDark ? '#ccc' : '#555'),
    }),
    card: (isActive) => ({
      background: isDark ? '#1e1e2e' : '#fff', borderRadius: 12, padding: 24,
      border: `2px solid ${isActive ? DUSSC_COLORS.primary : (isDark ? '#333' : '#e8ece8')}`,
      marginBottom: 14, position: 'relative',
    }),
    activeBadge: {
      position: 'absolute', top: 14, right: 14, padding: '4px 12px',
      borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: `${DUSSC_COLORS.primary}15`, color: DUSSC_COLORS.primary,
    },
    cardTitle: { fontSize: 17, fontWeight: 700, color: isDark ? '#fff' : '#333', marginBottom: 4 },
    cardCode: { fontSize: 12, color: isDark ? '#888' : '#999', fontFamily: 'monospace', marginBottom: 14 },
    cardDesc: { fontSize: 13, color: isDark ? '#aaa' : '#666', marginBottom: 16, lineHeight: 1.5 },
    blocGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 },
    blocItem: (color) => ({
      padding: '12px 10px', borderRadius: 8, textAlign: 'center',
      background: `${color}10`, border: `1px solid ${color}25`,
    }),
    blocLabel: { fontSize: 10, fontWeight: 600, color: isDark ? '#aaa' : '#777', textTransform: 'uppercase', letterSpacing: '0.05em' },
    blocValue: { fontSize: 22, fontWeight: 700, color: isDark ? '#fff' : '#333', marginTop: 4 },
    totalBar: {
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      padding: '8px', borderRadius: 6, fontSize: 13, fontWeight: 600,
      background: `${DUSSC_COLORS.primary}08`, color: DUSSC_COLORS.primary,
      marginBottom: 16,
    },
    empty: { textAlign: 'center', padding: 60, color: isDark ? '#888' : '#999' },
  };

  return (
    <div>
      <div style={s.header}>
        <div>
          <div style={s.title}>{t('templates.title')}</div>
          <div style={s.subtitle}>{templates.length} template{templates.length !== 1 ? 's' : ''}</div>
        </div>
        <button style={s.btn(true)} onClick={() => setActivePage('template-create')}>
          <Plus size={16} /> {t('templates.create')}
        </button>
      </div>

      {loadingTemplates ? (
        <div style={s.empty}>{t('common.loading')}</div>
      ) : templates.length === 0 ? (
        <div style={s.empty}>
          <Layout size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div>Aucun template créé</div>
        </div>
      ) : (
        templates.map((tpl) => {
          const total = (tpl.pre_test_count || 0) + (tpl.common_count || 0) + (tpl.profile_count || 0) + (tpl.post_test_count || 0);
          return (
            <div key={tpl.id} style={s.card(!!tpl.is_active)}>
              {tpl.is_active && <div style={s.activeBadge}>✓ Actif</div>}
              <div style={s.cardTitle}>{tpl.name_fr}</div>
              <div style={s.cardCode}>{tpl.code}</div>
              {tpl.description_fr && <div style={s.cardDesc}>{tpl.description_fr}</div>}

              <div style={s.blocGrid}>
                {BLOC_OPTIONS.map((bloc) => {
                  const val = bloc.value === 'pre_test' ? tpl.pre_test_count
                    : bloc.value === 'tronc_commun' ? tpl.common_count
                    : bloc.value === 'profil' ? tpl.profile_count
                    : tpl.post_test_count;
                  return (
                    <div key={bloc.value} style={s.blocItem(bloc.color)}>
                      <div style={s.blocLabel}>{bloc.label}</div>
                      <div style={s.blocValue}>{val}</div>
                    </div>
                  );
                })}
              </div>

              <div style={s.totalBar}>
                <Layout size={14} /> {total} questions par parcours
              </div>

              {!tpl.is_active && (
                <button style={s.btn(true)} onClick={() => handlePublish(tpl.id)}>
                  <Globe size={14} /> {t('templates.publish')}
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default DusscTemplates;
