/**
 * EpiReportPage - Rapport épidémiologique COHRM
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity, Calendar, Filter, RefreshCw, Bug, Heart,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { getReportEpidemiological } from '../services/cohrmApi';
import { COHRM_COLORS, REGIONS_CAMEROON, RUMOR_CATEGORIES } from '../utils/constants';
import { LoadingSpinner } from '../components/shared';

const CHART_COLORS = ['#FF5722', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#EC4899'];

const EpiReportPage = ({ isDark, user }) => {
  const { t } = useTranslation('cohrm');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [category, setCategory] = useState('');
  const [region, setRegion] = useState('');
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 3);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getReportEpidemiological({
        date_from: dateFrom, date_to: dateTo, category, region,
      });
      if (res.success) setData(res.data);
    } catch (err) {
      console.error('Epi report error:', err);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, category, region]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const s = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
    title: { fontSize: 22, fontWeight: 700, color: isDark ? '#e2e8f0' : '#1f2937', display: 'flex', alignItems: 'center', gap: 10 },
    controls: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
    input: {
      padding: '8px 12px', borderRadius: 8, fontSize: 13,
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      backgroundColor: isDark ? '#1e293b' : '#fff',
      color: isDark ? '#e2e8f0' : '#374151', outline: 'none',
    },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 16 },
    box: {
      padding: 20, borderRadius: 12,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    boxTitle: { fontSize: 15, fontWeight: 600, color: isDark ? '#e2e8f0' : '#1f2937', marginBottom: 16 },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
    th: {
      textAlign: 'left', padding: '10px 12px', fontWeight: 600,
      color: isDark ? '#94a3b8' : '#6B7280',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    td: {
      padding: '10px 12px', color: isDark ? '#e2e8f0' : '#374151',
      borderBottom: isDark ? '1px solid #1e293b' : '1px solid #F3F4F6',
    },
  };

  if (loading) return <LoadingSpinner isDark={isDark} message="Chargement du rapport épidémiologique..." />;

  return (
    <div>
      <div style={s.header}>
        <div style={s.title}>
          <Activity size={22} />
          {t('reports.epiTitle', 'Rapport épidémiologique')}
        </div>
        <div style={s.controls}>
          <input type="date" style={s.input} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <span style={{ color: isDark ? '#64748b' : '#9CA3AF' }}>→</span>
          <input type="date" style={s.input} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          <select style={s.input} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">{t('common.allCategories', 'Toutes catégories')}</option>
            {(RUMOR_CATEGORIES || []).map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select style={s.input} value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">{t('common.allRegions', 'Toutes régions')}</option>
            {Object.entries(REGIONS_CAMEROON || {}).map(([code, r]) => (
              <option key={code} value={code}>{r.name || code}</option>
            ))}
          </select>
          <button onClick={fetchData} style={{ ...s.input, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div style={s.grid}>
        {/* Courbe épidémique */}
        <div style={{ ...s.box, gridColumn: '1 / -1' }}>
          <div style={s.boxTitle}>{t('reports.epiCurve', 'Courbe épidémique')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.epiCurve || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#E5E7EB'} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#9CA3AF' }} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: 8 }} />
              <Bar dataKey="count" fill={COHRM_COLORS.primary} radius={[4, 4, 0, 0]} name="Cas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Par espèce */}
        <div style={s.box}>
          <div style={s.boxTitle}>{t('reports.bySpecies', 'Par espèce')}</div>
          {data?.bySpecies?.length > 0 ? (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>{t('common.species', 'Espèce')}</th>
                  <th style={s.th}>{t('reports.cases', 'Cas')}</th>
                  <th style={s.th}>{t('reports.affected', 'Affectés')}</th>
                  <th style={s.th}>{t('reports.dead', 'Morts')}</th>
                  <th style={s.th}>{t('reports.cfr', 'Létalité')}</th>
                </tr>
              </thead>
              <tbody>
                {data.bySpecies.map((row, i) => (
                  <tr key={i}>
                    <td style={s.td}>{row.species}</td>
                    <td style={s.td}>{row.count}</td>
                    <td style={s.td}>{row.total_affected || 0}</td>
                    <td style={s.td}>{row.total_dead || 0}</td>
                    <td style={{ ...s.td, color: row.total_dead > 0 ? '#EF4444' : '#10B981', fontWeight: 600 }}>
                      {row.total_affected > 0
                        ? `${((row.total_dead / row.total_affected) * 100).toFixed(1)}%`
                        : '0%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: isDark ? '#64748b' : '#9CA3AF', textAlign: 'center', padding: 20 }}>
              {t('common.noData', 'Aucune donnée')}
            </p>
          )}
        </div>

        {/* Par catégorie */}
        <div style={s.box}>
          <div style={s.boxTitle}>{t('reports.byCategory', 'Par catégorie')}</div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data?.byCategory || []} cx="50%" cy="50%" innerRadius={40} outerRadius={90} dataKey="count" nameKey="category" label>
                {(data?.byCategory || []).map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default EpiReportPage;
