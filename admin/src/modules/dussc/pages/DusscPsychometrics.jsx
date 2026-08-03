/**
 * DusscPsychometrics — Analyse psychométrique des questions
 */

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import useDusscStore from '../stores/dusscStore';
import * as dusscApi from '../services/dusscApi';
import { PSYCHOMETRIC_THRESHOLDS, MODULE_COLORS, DUSSC_COLORS } from '../utils/constants';

const DusscPsychometrics = ({ isDark }) => {
  const { t } = useTranslation('dussc');
  const { psychometrics, fetchPsychometrics } = useDusscStore();

  useEffect(() => { fetchPsychometrics(); }, []);

  const handleCompute = async () => {
    try {
      await dusscApi.triggerCompute({});
      toast.success('Calcul lancé');
      fetchPsychometrics();
    } catch { toast.error(t('common.error')); }
  };

  const getDifficultyColor = (val) => {
    if (val === null || val === undefined) return isDark ? '#666' : '#ccc';
    const th = PSYCHOMETRIC_THRESHOLDS.difficulty;
    if (val < th.low) return '#E74C3C';
    if (val < th.optimal_min) return '#F39C12';
    if (val <= th.optimal_max) return '#27AE60';
    if (val <= th.high) return '#F39C12';
    return '#E74C3C';
  };

  const getDifficultyLabel = (val) => {
    if (val === null || val === undefined) return '—';
    const th = PSYCHOMETRIC_THRESHOLDS.difficulty;
    if (val < th.low) return t('psychometrics.tooHard');
    if (val > th.high) return t('psychometrics.tooEasy');
    if (val >= th.optimal_min && val <= th.optimal_max) return t('psychometrics.optimalRange');
    return '⚠️';
  };

  const s = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 22, fontWeight: 700, color: isDark ? '#fff' : DUSSC_COLORS.encre },
    btn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: DUSSC_COLORS.primary, color: '#fff' },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: isDark ? '#1e1e2e' : '#fff', borderRadius: 12, overflow: 'hidden', border: `1px solid ${isDark ? '#333' : '#e8ece8'}` },
    th: { padding: '12px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isDark ? '#888' : '#999', borderBottom: `1px solid ${isDark ? '#333' : '#eee'}`, textAlign: 'left', background: isDark ? '#16162e' : '#fafafa' },
    td: { padding: '12px 14px', fontSize: 13, color: isDark ? '#ddd' : '#333', borderBottom: `1px solid ${isDark ? '#2a2a3e' : '#f5f5f5'}` },
    badge: (color) => ({ display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: `${color}18`, color }),
    diffBar: (val, color) => ({ width: 60, height: 6, borderRadius: 3, background: isDark ? '#333' : '#eee', position: 'relative', overflow: 'hidden' }),
    diffFill: (val, color) => ({ position: 'absolute', top: 0, left: 0, height: '100%', width: `${Math.min((val || 0) * 100, 100)}%`, borderRadius: 3, background: color }),
  };

  return (
    <div>
      <div style={s.header}>
        <div>
          <div style={s.title}>{t('psychometrics.title')}</div>
          <div style={{ fontSize: 13, color: isDark ? '#888' : '#999', marginTop: 4 }}>
            {t('psychometrics.subtitle')} · {psychometrics.length} questions analysées
          </div>
        </div>
        <button style={s.btn} onClick={handleCompute}>
          <RefreshCw size={14} /> {t('psychometrics.compute')}
        </button>
      </div>

      {psychometrics.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: isDark ? '#888' : '#999' }}>
          <TrendingUp size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div>Pas encore de données psychométriques</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Publiez des questions et collectez des réponses</div>
        </div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>ID</th>
              <th style={s.th}>{t('questions.module')}</th>
              <th style={s.th}>{t('psychometrics.difficulty')}</th>
              <th style={s.th}>Qualité</th>
              <th style={s.th}>{t('psychometrics.distractor')}</th>
              <th style={s.th}>N</th>
            </tr>
          </thead>
          <tbody>
            {psychometrics.map((q) => {
              const diffColor = getDifficultyColor(q.indice_difficulte);
              return (
                <tr key={q.id} style={{ cursor: 'default' }}>
                  <td style={s.td}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{q.id_question}</span>
                  </td>
                  <td style={s.td}>
                    <span style={s.badge(MODULE_COLORS[q.module_code] || '#666')}>{q.module_code}</span>
                  </td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, color: diffColor, minWidth: 40 }}>
                        {q.indice_difficulte !== null ? (q.indice_difficulte * 100).toFixed(0) + '%' : '—'}
                      </span>
                      <div style={s.diffBar()}>
                        <div style={s.diffFill(q.indice_difficulte, diffColor)} />
                      </div>
                    </div>
                  </td>
                  <td style={s.td}>
                    <span style={s.badge(diffColor)}>{getDifficultyLabel(q.indice_difficulte)}</span>
                  </td>
                  <td style={s.td}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: isDark ? '#ddd' : '#333' }}>
                      {q.distracteur_dominant || '—'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={{ color: isDark ? '#888' : '#999' }}>{q.n_observations || 0}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DusscPsychometrics;
