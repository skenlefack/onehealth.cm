/**
 * DusscAlerts — Gestion du module Alerte M12
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Plus, Power, PowerOff } from 'lucide-react';
import { toast } from 'react-toastify';
import useDusscStore from '../stores/dusscStore';
import * as dusscApi from '../services/dusscApi';
import { ALERT_SCENARIOS, REGIONS_CAMEROON, DUSSC_COLORS } from '../utils/constants';

const DusscAlerts = ({ isDark }) => {
  const { t } = useTranslation('dussc');
  const { alerts, loadingAlerts, fetchAlerts } = useDusscStore();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ code: '', name_fr: '', name_en: '', scenario: 'mpox', target_regions: [] });

  useEffect(() => { fetchAlerts(); }, []);

  const handleCreate = async () => {
    try {
      await dusscApi.createAlert(form);
      toast.success(t('common.success'));
      fetchAlerts();
      setShowCreate(false);
    } catch (err) { toast.error(t('common.error')); }
  };

  const handleToggle = async (alert) => {
    try {
      if (alert.status === 'actif') {
        await dusscApi.deactivateAlert(alert.id);
      } else {
        await dusscApi.activateAlert(alert.id);
      }
      toast.success(t('common.success'));
      fetchAlerts();
    } catch (err) { toast.error(t('common.error')); }
  };

  const s = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 22, fontWeight: 700, color: isDark ? '#fff' : DUSSC_COLORS.encre },
    btn: (primary) => ({
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px',
      borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
      border: primary ? 'none' : `1px solid ${isDark ? '#444' : '#ddd'}`,
      background: primary ? '#C0392B' : 'transparent',
      color: primary ? '#fff' : (isDark ? '#ccc' : '#555'),
    }),
    card: (status) => ({
      background: isDark ? '#1e1e2e' : '#fff', borderRadius: 12, padding: 20,
      border: `2px solid ${status === 'actif' ? '#E74C3C' : (isDark ? '#333' : '#e8ece8')}`,
      marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }),
    statusBadge: (status) => {
      const colors = { pre_arme: '#F39C12', actif: '#E74C3C', desactive: '#95A5A6', archive: '#7F8C8D' };
      return { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${colors[status] || '#999'}18`, color: colors[status] || '#999' };
    },
    scenario: (color) => ({ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${color}18`, color }),
    input: { width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14, border: `1px solid ${isDark ? '#444' : '#ddd'}`, background: isDark ? '#2a2a3e' : '#fafafa', color: isDark ? '#ddd' : '#333' },
    label: { display: 'block', fontSize: 11, fontWeight: 600, color: isDark ? '#999' : '#777', marginBottom: 4 },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modalContent: { background: isDark ? '#1e1e2e' : '#fff', borderRadius: 12, padding: 24, width: 450, maxWidth: '90vw' },
  };

  return (
    <div>
      <div style={s.header}>
        <div>
          <div style={s.title}>{t('alerts.title')}</div>
          <div style={{ fontSize: 13, color: isDark ? '#888' : '#999', marginTop: 4 }}>
            Scénarios pré-armés et alertes actives
          </div>
        </div>
        <button style={s.btn(true)} onClick={() => setShowCreate(true)}>
          <Plus size={16} /> {t('alerts.create')}
        </button>
      </div>

      {loadingAlerts ? (
        <div style={{ textAlign: 'center', padding: 40, color: isDark ? '#888' : '#999' }}>{t('common.loading')}</div>
      ) : alerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: isDark ? '#888' : '#999' }}>
          <AlertTriangle size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div>Aucune alerte configurée</div>
        </div>
      ) : (
        alerts.map((alert) => {
          const scenarioInfo = ALERT_SCENARIOS.find(s => s.value === alert.scenario) || {};
          return (
            <div key={alert.id} style={s.card(alert.status)}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: isDark ? '#fff' : '#333', marginBottom: 6 }}>
                  {alert.name_fr}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={s.scenario(scenarioInfo.color || '#999')}>{scenarioInfo.label || alert.scenario}</span>
                  <span style={s.statusBadge(alert.status)}>
                    {alert.status === 'pre_arme' ? t('alerts.preArmed') :
                     alert.status === 'actif' ? t('alerts.active') : t('alerts.inactive')}
                  </span>
                  <span style={{ fontSize: 11, color: isDark ? '#666' : '#bbb', fontFamily: 'monospace' }}>{alert.code}</span>
                </div>
                {alert.activated_at && (
                  <div style={{ fontSize: 11, color: isDark ? '#888' : '#999', marginTop: 6 }}>
                    Activée le {new Date(alert.activated_at).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
              <button
                style={s.btn(alert.status !== 'actif')}
                onClick={() => handleToggle(alert)}
              >
                {alert.status === 'actif' ? <><PowerOff size={14} /> {t('alerts.deactivate')}</> : <><Power size={14} /> {t('alerts.activate')}</>}
              </button>
            </div>
          );
        })
      )}

      {showCreate && (
        <div style={s.modal} onClick={() => setShowCreate(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: isDark ? '#fff' : '#333' }}>{t('alerts.create')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div><div style={s.label}>Code</div><input style={s.input} value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="ALERT-MPOX-2026" /></div>
              <div><div style={s.label}>Nom FR</div><input style={s.input} value={form.name_fr} onChange={e => setForm({ ...form, name_fr: e.target.value })} /></div>
              <div><div style={s.label}>Nom EN</div><input style={s.input} value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} /></div>
              <div><div style={s.label}>{t('alerts.scenario')}</div>
                <select style={s.input} value={form.scenario} onChange={e => setForm({ ...form, scenario: e.target.value })}>
                  {ALERT_SCENARIOS.map(sc => <option key={sc.value} value={sc.value}>{sc.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button style={s.btn(false)} onClick={() => setShowCreate(false)}>{t('common.cancel')}</button>
              <button style={{ ...s.btn(true), background: DUSSC_COLORS.primary }} onClick={handleCreate} disabled={!form.code || !form.name_fr}>{t('common.create')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DusscAlerts;
