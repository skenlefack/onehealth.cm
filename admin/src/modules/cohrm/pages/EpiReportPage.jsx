/**
 * EpiReportPage - Rapport epidemiologique COHRM
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Activity, Calendar, Filter, RefreshCw, Download,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { getReportEpidemiological } from '../services/cohrmApi';
import {
  COHRM_COLORS, REGIONS_CAMEROON, RUMOR_CATEGORIES,
  STATUS_OPTIONS, PRIORITY_OPTIONS, SOURCE_OPTIONS,
} from '../utils/constants';
import { LoadingSpinner } from '../components/shared';

const CHART_COLORS = ['#FF5722', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#EC4899'];

const GRANULARITY_OPTIONS = [
  { value: 'day', label: 'Jour' },
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
];

const EpiReportPage = ({ isDark, user }) => {
  const { t } = useTranslation('cohrm');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [category, setCategory] = useState('');
  const [region, setRegion] = useState('');
  const [department, setDepartment] = useState('');
  const [district, setDistrict] = useState('');
  const [granularity, setGranularity] = useState('day');
  const [stacked, setStacked] = useState(false);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 3);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getReportEpidemiological({
        date_from: dateFrom, date_to: dateTo, category, region, department, district, granularity,
      });
      if (res.success) setData(res.data);
    } catch (err) {
      console.error('Epi report error:', err);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, category, region, department, district, granularity]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Aggregate epiCurve data by date (sum across categories) for simple view
  const aggregatedEpiCurve = useMemo(() => {
    if (!data?.epiCurve) return [];
    const map = new Map();
    for (const row of data.epiCurve) {
      const existing = map.get(row.date) || { date: row.date, count: 0 };
      existing.count += row.count;
      map.set(row.date, existing);
    }
    return Array.from(map.values());
  }, [data?.epiCurve]);

  // Build stacked data: pivot categories into columns
  const stackedEpiCurve = useMemo(() => {
    if (!data?.epiCurve) return { data: [], categories: [] };
    const categories = new Set();
    const map = new Map();
    for (const row of data.epiCurve) {
      const cat = row.category || 'other';
      categories.add(cat);
      const existing = map.get(row.date) || { date: row.date };
      existing[cat] = (existing[cat] || 0) + row.count;
      map.set(row.date, existing);
    }
    return { data: Array.from(map.values()), categories: Array.from(categories) };
  }, [data?.epiCurve]);

  // Get label for option values
  const getLabel = (options, value, field = 'value') => {
    const found = options.find(o => o[field] === value);
    return found?.label || value || 'Inconnu';
  };

  // CSV export
  const exportCSV = () => {
    if (!data) return;
    const lines = ['Section,Cle,Valeur'];

    if (data.bySpecies) {
      data.bySpecies.forEach(r => {
        lines.push(`Espece,${r.species},${r.count} cas / ${r.total_affected || 0} affectes / ${r.total_dead || 0} morts`);
      });
    }
    if (data.byCategory) {
      data.byCategory.forEach(r => lines.push(`Categorie,${r.category},${r.count}`));
    }
    if (data.byPriority) {
      data.byPriority.forEach(r => lines.push(`Priorite,${r.priority},${r.count}`));
    }
    if (data.bySource) {
      data.bySource.forEach(r => lines.push(`Source,${r.source},${r.count}`));
    }
    if (data.byStatus) {
      data.byStatus.forEach(r => lines.push(`Statut,${r.status},${r.count}`));
    }
    if (aggregatedEpiCurve.length) {
      aggregatedEpiCurve.forEach(r => lines.push(`CourbeEpi,${r.date},${r.count}`));
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-epi-${dateFrom}-${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Mini pie chart renderer
  const renderPieSection = (title, chartData, colorMap) => {
    if (!chartData || chartData.length === 0) return null;
    return (
      <div style={s.box}>
        <div style={s.boxTitle}>{title}</div>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={90} dataKey="count" nameKey="name" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={colorMap?.[entry.key] || CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Prepare pie data with labels
  const priorityData = useMemo(() => {
    if (!data?.byPriority) return [];
    return data.byPriority.map(r => ({
      name: getLabel(PRIORITY_OPTIONS, r.priority),
      key: r.priority,
      count: r.count,
    }));
  }, [data?.byPriority]);

  const priorityColors = useMemo(() => {
    const m = {};
    PRIORITY_OPTIONS.forEach(o => { m[o.value] = o.color; });
    m['unknown'] = '#BDC3C7';
    return m;
  }, []);

  const sourceData = useMemo(() => {
    if (!data?.bySource) return [];
    return data.bySource.map(r => ({
      name: getLabel(SOURCE_OPTIONS, r.source),
      key: r.source,
      count: r.count,
    }));
  }, [data?.bySource]);

  const statusData = useMemo(() => {
    if (!data?.byStatus) return [];
    return data.byStatus.map(r => ({
      name: getLabel(STATUS_OPTIONS, r.status),
      key: r.status,
      count: r.count,
    }));
  }, [data?.byStatus]);

  const statusColors = useMemo(() => {
    const m = {};
    STATUS_OPTIONS.forEach(o => { m[o.value] = o.color; });
    m['unknown'] = '#BDC3C7';
    return m;
  }, []);

  const categoryData = useMemo(() => {
    if (!data?.byCategory) return [];
    return data.byCategory.map(r => ({
      name: getLabel(RUMOR_CATEGORIES, r.category),
      key: r.category,
      count: r.count,
    }));
  }, [data?.byCategory]);

  const categoryColors = useMemo(() => {
    const m = {};
    RUMOR_CATEGORIES.forEach(c => { m[c.value] = c.color; });
    return m;
  }, []);

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
    btnGroup: { display: 'flex', borderRadius: 8, overflow: 'hidden', border: isDark ? '1px solid #334155' : '1px solid #E5E7EB' },
    btnGroupItem: (active) => ({
      padding: '6px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none',
      backgroundColor: active ? COHRM_COLORS.primary : (isDark ? '#1e293b' : '#fff'),
      color: active ? '#fff' : (isDark ? '#e2e8f0' : '#374151'),
    }),
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16 },
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
    toggleBtn: (active) => ({
      padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      backgroundColor: active ? COHRM_COLORS.primary : 'transparent',
      color: active ? '#fff' : (isDark ? '#94a3b8' : '#6B7280'),
    }),
    exportBtn: {
      padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
      border: 'none', display: 'flex', alignItems: 'center', gap: 6,
      backgroundColor: COHRM_COLORS.success, color: '#fff',
    },
  };

  if (loading) return <LoadingSpinner isDark={isDark} message="Chargement du rapport epidemiologique..." />;

  return (
    <div>
      <div style={s.header}>
        <div style={s.title}>
          <Activity size={22} />
          {t('reports.epiTitle', 'Rapport epidemiologique')}
        </div>
        <div style={s.controls}>
          <input type="date" style={s.input} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <span style={{ color: isDark ? '#64748b' : '#9CA3AF' }}>→</span>
          <input type="date" style={s.input} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          <select style={s.input} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Toutes categories</option>
            {(RUMOR_CATEGORIES || []).map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select style={s.input} value={region} onChange={(e) => { setRegion(e.target.value); setDepartment(''); setDistrict(''); }}>
            <option value="">Toutes regions</option>
            {(REGIONS_CAMEROON || []).map(r => (
              <option key={r.code} value={r.code}>{r.name}</option>
            ))}
          </select>
          {data?.departments?.length > 0 && (
            <select style={s.input} value={department} onChange={(e) => { setDepartment(e.target.value); setDistrict(''); }}>
              <option value="">Tous departements</option>
              {data.departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          )}
          {data?.districts?.length > 0 && (
            <select style={s.input} value={district} onChange={(e) => setDistrict(e.target.value)}>
              <option value="">Tous districts</option>
              {data.districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          )}
          <button onClick={fetchData} style={{ ...s.input, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <RefreshCw size={14} />
          </button>
          <button onClick={exportCSV} style={s.exportBtn}>
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      {/* Granularity + stacked toggle */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#6B7280' }}>Granularite :</span>
        <div style={s.btnGroup}>
          {GRANULARITY_OPTIONS.map(g => (
            <button key={g.value} style={s.btnGroupItem(granularity === g.value)} onClick={() => setGranularity(g.value)}>
              {g.label}
            </button>
          ))}
        </div>
        <button style={s.toggleBtn(stacked)} onClick={() => setStacked(!stacked)}>
          {stacked ? 'Vue empilee par categorie' : 'Vue simple'}
        </button>
      </div>

      <div style={s.grid}>
        {/* Courbe epidemique */}
        <div style={{ ...s.box, gridColumn: '1 / -1' }}>
          <div style={s.boxTitle}>Courbe epidemique</div>
          <ResponsiveContainer width="100%" height={300}>
            {stacked ? (
              <BarChart data={stackedEpiCurve.data}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#E5E7EB'} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#9CA3AF' }} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: 8 }} />
                <Legend />
                {stackedEpiCurve.categories.map((cat, i) => (
                  <Bar key={cat} dataKey={cat} stackId="a" fill={categoryColors[cat] || CHART_COLORS[i % CHART_COLORS.length]} name={getLabel(RUMOR_CATEGORIES, cat)} />
                ))}
              </BarChart>
            ) : (
              <BarChart data={aggregatedEpiCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#E5E7EB'} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#9CA3AF' }} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: 8 }} />
                <Bar dataKey="count" fill={COHRM_COLORS.primary} radius={[4, 4, 0, 0]} name="Cas" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Par espece */}
        <div style={s.box}>
          <div style={s.boxTitle}>Par espece</div>
          {data?.bySpecies?.length > 0 ? (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Espece</th>
                  <th style={s.th}>Cas</th>
                  <th style={s.th}>Affectes</th>
                  <th style={s.th}>Morts</th>
                  <th style={s.th}>Letalite</th>
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
              Aucune donnee
            </p>
          )}
        </div>

        {/* Par categorie */}
        {renderPieSection('Par categorie', categoryData, categoryColors)}

        {/* Par priorite */}
        {renderPieSection('Par priorite', priorityData, priorityColors)}

        {/* Par source */}
        {renderPieSection('Par source', sourceData, null)}

        {/* Par statut */}
        {renderPieSection('Par statut', statusData, statusColors)}
      </div>
    </div>
  );
};

export default EpiReportPage;
