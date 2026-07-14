/**
 * ReportsPage - Rapports avancés COHRM
 * Dashboard analytique avec graphiques recharts
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, TrendingUp, MapPin, Activity, Download,
  Calendar, Filter, RefreshCw, FileText, ChevronDown,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import {
  getReportSummary, getReportTrends, getReportGeographic, getReportPerformance,
} from '../services/cohrmApi';
import { COHRM_COLORS, REGIONS_CAMEROON } from '../utils/constants';
import { LoadingSpinner } from '../components/shared';

const CHART_COLORS = ['#FF5722', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#EC4899'];

const DATE_PRESETS = [
  { key: '7d', label: '7 jours', days: 7 },
  { key: '30d', label: '30 jours', days: 30 },
  { key: '90d', label: '90 jours', days: 90 },
  { key: '1y', label: '1 an', days: 365 },
];

const ReportsPage = ({ isDark, user }) => {
  const { t } = useTranslation('cohrm');
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState('30d');
  const [region, setRegion] = useState('');
  const [groupBy, setGroupBy] = useState('day');
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [geographic, setGeographic] = useState(null);
  const [performance, setPerformance] = useState(null);

  const getDateRange = () => {
    const days = DATE_PRESETS.find(p => p.key === preset)?.days || 30;
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    return { date_from: from, date_to: to };
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { date_from, date_to } = getDateRange();
    const params = { date_from, date_to, region, group_by: groupBy };

    try {
      const [sumRes, trendRes, geoRes, perfRes] = await Promise.all([
        getReportSummary(params).catch(() => ({ success: false })),
        getReportTrends(params).catch(() => ({ success: false })),
        getReportGeographic(params).catch(() => ({ success: false })),
        getReportPerformance(params).catch(() => ({ success: false })),
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (trendRes.success) setTrends(trendRes.data);
      if (geoRes.success) setGeographic(geoRes.data);
      if (perfRes.success) setPerformance(perfRes.data);
    } catch (err) {
      console.error('Reports fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [preset, region, groupBy]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const s = {
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: 24, flexWrap: 'wrap', gap: 12,
    },
    title: { fontSize: 22, fontWeight: 700, color: isDark ? '#e2e8f0' : '#1f2937', display: 'flex', alignItems: 'center', gap: 10 },
    controls: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
    select: {
      padding: '8px 12px', borderRadius: 8, fontSize: 13,
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      backgroundColor: isDark ? '#1e293b' : '#fff',
      color: isDark ? '#e2e8f0' : '#374151', cursor: 'pointer', outline: 'none',
    },
    btn: (active) => ({
      padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: active ? 600 : 400,
      border: active ? `1px solid ${COHRM_COLORS.primary}` : (isDark ? '1px solid #334155' : '1px solid #E5E7EB'),
      backgroundColor: active ? (isDark ? 'rgba(255,87,34,0.15)' : 'rgba(255,87,34,0.08)') : 'transparent',
      color: active ? COHRM_COLORS.primary : (isDark ? '#94a3b8' : '#6B7280'),
      cursor: 'pointer',
    }),
    cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 },
    card: {
      padding: 20, borderRadius: 12,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    cardValue: { fontSize: 28, fontWeight: 700, color: isDark ? '#e2e8f0' : '#1f2937' },
    cardLabel: { fontSize: 13, color: isDark ? '#64748b' : '#9CA3AF', marginTop: 4 },
    charts: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 16 },
    chartBox: {
      padding: 20, borderRadius: 12,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    chartTitle: { fontSize: 15, fontWeight: 600, color: isDark ? '#e2e8f0' : '#1f2937', marginBottom: 16 },
  };

  if (loading) return <LoadingSpinner isDark={isDark} message={t('reports.loading', 'Chargement des rapports...')} />;

  const totals = summary?.totals || {};

  return (
    <div>
      <div style={s.header}>
        <div style={s.title}>
          <BarChart3 size={22} />
          {t('reports.title', 'Rapports avancés')}
        </div>
        <div style={s.controls}>
          {DATE_PRESETS.map(p => (
            <button key={p.key} style={s.btn(preset === p.key)} onClick={() => setPreset(p.key)}>
              {p.label}
            </button>
          ))}
          <select style={s.select} value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">{t('common.allRegions', 'Toutes les régions')}</option>
            {Object.entries(REGIONS_CAMEROON || {}).map(([code, r]) => (
              <option key={code} value={code}>{r.name || code}</option>
            ))}
          </select>
          <button style={s.btn(false)} onClick={fetchData}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={s.cards}>
        <div style={s.card}>
          <div style={s.cardValue}>{totals.total || 0}</div>
          <div style={s.cardLabel}>{t('reports.totalRumors', 'Total rumeurs')}</div>
        </div>
        <div style={s.card}>
          <div style={{ ...s.cardValue, color: '#10B981' }}>{totals.closed || 0}</div>
          <div style={s.cardLabel}>{t('reports.resolved', 'Résolues')}</div>
        </div>
        <div style={s.card}>
          <div style={{ ...s.cardValue, color: '#F59E0B' }}>{totals.pending || 0}</div>
          <div style={s.cardLabel}>{t('reports.pending', 'En attente')}</div>
        </div>
        <div style={s.card}>
          <div style={{ ...s.cardValue, color: '#EF4444' }}>{totals.high_risk || 0}</div>
          <div style={s.cardLabel}>{t('reports.highRisk', 'Risque élevé')}</div>
        </div>
        <div style={s.card}>
          <div style={s.cardValue}>{summary?.avgResolutionHours || 0}h</div>
          <div style={s.cardLabel}>{t('reports.avgResolution', 'Temps moyen résolution')}</div>
        </div>
      </div>

      {/* Charts */}
      <div style={s.charts}>
        {/* Trends Chart */}
        <div style={s.chartBox}>
          <div style={s.chartTitle}>{t('reports.trends', 'Tendances')}</div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trends?.created || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#E5E7EB'} />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#9CA3AF' }} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: isDark ? '1px solid #334155' : '1px solid #E5E7EB', borderRadius: 8 }} />
              <Area type="monotone" dataKey="count" stroke={COHRM_COLORS.primary} fill={`${COHRM_COLORS.primary}30`} name={t('reports.created', 'Créées')} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie */}
        <div style={s.chartBox}>
          <div style={s.chartTitle}>{t('reports.byStatus', 'Par statut')}</div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={summary?.byStatus || []} cx="50%" cy="50%" outerRadius={100} dataKey="count" nameKey="status" label={({ status, count }) => `${status} (${count})`}>
                {(summary?.byStatus || []).map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* By Region Bar */}
        <div style={s.chartBox}>
          <div style={s.chartTitle}>{t('reports.byRegion', 'Par région')}</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={summary?.byRegion || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#E5E7EB'} />
              <XAxis type="number" tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#9CA3AF' }} />
              <YAxis dataKey="region" type="category" width={80} tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#9CA3AF' }} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: 8 }} />
              <Bar dataKey="count" fill={COHRM_COLORS.primary} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By Source */}
        <div style={s.chartBox}>
          <div style={s.chartTitle}>{t('reports.bySource', 'Par source')}</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={summary?.bySource || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#E5E7EB'} />
              <XAxis dataKey="source" tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#9CA3AF' }} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By Category */}
        <div style={s.chartBox}>
          <div style={s.chartTitle}>{t('reports.byCategory', 'Par catégorie')}</div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={summary?.byCategory || []} cx="50%" cy="50%" innerRadius={50} outerRadius={100} dataKey="count" nameKey="category" label>
                {(summary?.byCategory || []).map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Performance */}
        {performance && (
          <div style={s.chartBox}>
            <div style={s.chartTitle}>{t('reports.performance', 'Performance')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ textAlign: 'center', padding: 20, borderRadius: 10, backgroundColor: isDark ? '#0f172a' : '#F9FAFB' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#3B82F6' }}>{performance.avgFirstValidationHours}h</div>
                <div style={{ fontSize: 12, color: isDark ? '#64748b' : '#9CA3AF', marginTop: 4 }}>
                  {t('reports.avgFirstValidation', 'Temps 1ère validation')}
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: 20, borderRadius: 10, backgroundColor: isDark ? '#0f172a' : '#F9FAFB' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#10B981' }}>{performance.avgCloseTimeHours}h</div>
                <div style={{ fontSize: 12, color: isDark ? '#64748b' : '#9CA3AF', marginTop: 4 }}>
                  {t('reports.avgCloseTime', 'Temps moyen clôture')}
                </div>
              </div>
            </div>
            {performance.actorWorkload?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#e2e8f0' : '#374151', marginBottom: 8 }}>
                  {t('reports.actorWorkload', 'Charge par acteur')}
                </div>
                {performance.actorWorkload.slice(0, 5).map((actor, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: isDark ? '#94a3b8' : '#6B7280', borderBottom: isDark ? '1px solid #1e293b' : '1px solid #F3F4F6' }}>
                    <span>{actor.name} (L{actor.actor_level})</span>
                    <span style={{ fontWeight: 600, color: isDark ? '#e2e8f0' : '#374151' }}>{actor.validations_count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
