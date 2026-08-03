/**
 * DusscAlerts — Liste des alertes M12 (sans modal)
 */

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Plus, Power, PowerOff } from 'lucide-react';
import { toast } from 'react-toastify';
import useDusscStore from '../stores/dusscStore';
import * as dusscApi from '../services/dusscApi';
import { ALERT_SCENARIOS, DUSSC_COLORS } from '../utils/constants';

const DusscAlerts = ({ isDark }) => {
  const { t } = useTranslation('dussc');
  const { alerts, loadingAlerts, fetchAlerts, setActivePage } = useDusscStore();

  useEffect(() => { fetchAlerts(); }, []);

  const handleToggle = async (alert) => {
    try {
      if (alert.status === 'actif') {
        await dusscApi.deactivateAlert(alert.id);
      } else {
        await dusscApi.activateAlert(alert.id);
      }
      toast.success(t('common.success'));
      fetchAlerts();
    } catch { toast.error(t('common.error')); }
  };

  const s = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 22, fontWeight: 700, color: isDark ? '#fff' : DUSSC_COLORS.encre },
    subtitle: { fontSize: 13, color: isDark ? '#888' : '#999', marginTop: 4 },
    btn: (primary, color) => ({
      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
      borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
      border: primary ? 'none' : `1px solid ${isDark ? '#444' : '#ddd'}`,
      background: primary ? (color || '#C0392B') : 'transparent',
      color: primary ? '#fff' : (isDark ? '#ccc' : '#555'),
    }),
    card: (status) => ({
      background: isDark ? '#1e1e2e' : '#fff', borderRadius: 12, padding: 24,
      border: `2px solid ${status === 'actif' ? '#E74C3C' : (isDark ? '#333' : '#e8ece8')}`,
      marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }),
    statusBadge: (status) => {
      const colors = { pre_arme: '#F39C12', actif: '#E74C3C', desactive: '#95A5A6', archive: '#7F8C8D' };
      const c = colors[status] || '#999';
      return { padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${c}15`, color: c };
    },
    scenarioBadge: (color) => ({
      padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}15`, color,
    }),
    empty: { textAlign: 'center', padding: 60, color: isDark ? '#888' : '#999' },
  };

  return (
    <div>
      <div style={s.header}>
        <div>
          <div style={s.title}>{t('alerts.title')}</div>
          <div style={s.subtitle}>Scénarios pré-armés et alertes actives</div>
        </div>
        <button style={s.btn(true, '#C0392B')} onClick={() => setActivePage('alert-create')}>
          <Plus size={16} /> {t('alerts.create')}
        </button>
      </div>

      {loadingAlerts ? (
        <div style={s.empty}>{t('common.loading')}</div>
      ) : alerts.length === 0 ? (
        <div style={s.empty}>
          <AlertTriangle size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div>Aucune alerte configurée</div>
          <div style={{ fontSize: 12, marginTop: 4, color: isDark ? '#666' : '#bbb' }}>
            Créez un scénario pré-armé (mpox, choléra, influenza aviaire)
          </div>
        </div>
      ) : (
        alerts.map((alert) => {
          const scenarioInfo = ALERT_SCENARIOS.find(sc => sc.value === alert.scenario) || {};
          return (
            <div key={alert.id} style={s.card(alert.status)}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: isDark ? '#fff' : '#333', marginBottom: 8 }}>
                  {alert.name_fr}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={s.scenarioBadge(scenarioInfo.color || '#999')}>{scenarioInfo.label || alert.scenario}</span>
                  <span style={s.statusBadge(alert.status)}>
                    {alert.status === 'pre_arme' ? t('alerts.preArmed') :
                     alert.status === 'actif' ? t('alerts.active') : t('alerts.inactive')}
                  </span>
                  <span style={{ fontSize: 11, color: isDark ? '#666' : '#bbb', fontFamily: 'monospace' }}>{alert.code}</span>
                </div>
                {alert.activated_at && (
                  <div style={{ fontSize: 12, color: isDark ? '#888' : '#999', marginTop: 8 }}>
                    Activée le {new Date(alert.activated_at).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
              <button
                style={s.btn(alert.status !== 'actif', alert.status !== 'actif' ? DUSSC_COLORS.primary : undefined)}
                onClick={() => handleToggle(alert)}
              >
                {alert.status === 'actif'
                  ? <><PowerOff size={14} /> {t('alerts.deactivate')}</>
                  : <><Power size={14} /> {t('alerts.activate')}</>
                }
              </button>
            </div>
          );
        })
      )}
    </div>
  );
};

export default DusscAlerts;
