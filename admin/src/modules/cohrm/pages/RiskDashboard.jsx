/**
 * RiskDashboard - Tableau de bord des risques sanitaires
 * Style "centre de commandement" avec dark mode toggle
 *
 * Sections :
 *   1. KPIs : Total évaluations, High actifs, Very High actifs, Temps moyen évaluation
 *   2. Pie chart : répartition par niveau de risque
 *   3. Heatmap : catégorie × niveau de risque
 *   4. Carte choroplèthe : régions du Cameroun
 *   5. Tableau des alertes actives (high/very_high non résolues)
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Shield, AlertTriangle, AlertOctagon, Clock, Activity,
  Eye, MapPin, Table2, BarChart3, RefreshCw, Moon, Sun,
  ChevronRight, ExternalLink,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import useCohrmStore from '../stores/cohrmStore';
import { LoadingSpinner, RiskBadge } from '../components/shared';
import { RISK_LEVELS, RUMOR_CATEGORIES, COHRM_COLORS, REGIONS_CAMEROON, EXPOSURE_LEVELS } from '../utils/constants';
import { formatNumber, formatDate, formatRegion } from '../utils/formatters';
import { getRumors, getRiskStats } from '../services/cohrmApi';
import cameroonRegionsGeoJson from '../utils/cameroonGeoJson';

// ============================================
// CONSTANTES DE COULEURS
// ============================================

const RISK_COLORS = {
  unknown: '#BDC3C7',
  low: '#27AE60',
  moderate: '#F39C12',
  high: '#E67E22',
  very_high: '#E74C3C',
};

const HEATMAP_COLORS = [
  '#1e293b', // 0
  '#1e3a5f', // 1-2
  '#2563eb', // 3-5
  '#f59e0b', // 6-10
  '#ef4444', // 11+
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const RiskDashboard = ({ isDark: parentDark, user }) => {
  const { setActivePage, navigateToRumor } = useCohrmStore();

  // État local pour le dashboard
  const [localDark, setLocalDark] = useState(parentDark);
  const [riskStats, setRiskStats] = useState(null);
  const [highRiskRumors, setHighRiskRumors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapMode, setMapMode] = useState('risk_avg'); // 'risk_avg' | 'count'
  const [refreshing, setRefreshing] = useState(false);

  const isDark = localDark;

  // Chargement des données
  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [statsRes, rumorsRes] = await Promise.all([
        getRiskStats(),
        getRumors({ risk_level: 'high,very_high', status: 'pending,investigating', limit: 50 }),
      ]);
      if (statsRes.success) setRiskStats(statsRes.data);
      if (rumorsRes.success) setHighRiskRumors(rumorsRes.data || []);
    } catch (err) {
      console.error('Erreur chargement dashboard risques:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ============================================
  // DONNÉES CALCULÉES
  // ============================================

  // KPIs
  const kpis = useMemo(() => {
    const byRisk = riskStats?.byRisk || [];
    const total = byRisk.reduce((sum, r) => sum + (r.count || 0), 0);
    const highCount = byRisk.find(r => r.risk_level === 'high')?.count || 0;
    const veryHighCount = byRisk.find(r => r.risk_level === 'very_high')?.count || 0;
    return { total, highCount, veryHighCount };
  }, [riskStats]);

  // Données Pie Chart
  const pieData = useMemo(() => {
    const byRisk = riskStats?.byRisk || [];
    return RISK_LEVELS
      .filter(rl => rl.value !== 'unknown')
      .map(rl => ({
        name: rl.label,
        value: byRisk.find(r => r.risk_level === rl.value)?.count || 0,
        color: rl.color,
        key: rl.value,
      }))
      .filter(d => d.value > 0);
  }, [riskStats]);

  // Données Heatmap : catégorie × niveau
  const heatmapData = useMemo(() => {
    if (!highRiskRumors.length && !riskStats?.byCategory?.length) return [];
    // On construit la heatmap à partir des rumeurs high risk chargées
    // Pour une vraie heatmap, il faudrait un endpoint dédié ; ici on simule
    const categories = RUMOR_CATEGORIES.map(c => c.value);
    const levels = ['low', 'moderate', 'high', 'very_high'];
    const matrix = {};
    categories.forEach(cat => {
      matrix[cat] = {};
      levels.forEach(lvl => { matrix[cat][lvl] = 0; });
    });
    // Remplir depuis les rumeurs disponibles
    highRiskRumors.forEach(r => {
      if (r.category && matrix[r.category] && r.risk_level) {
        matrix[r.category][r.risk_level] = (matrix[r.category][r.risk_level] || 0) + 1;
      }
    });
    return { categories, levels, matrix };
  }, [highRiskRumors, riskStats]);

  // Données carte par région
  const regionData = useMemo(() => {
    const data = {};
    REGIONS_CAMEROON.forEach(r => {
      data[r.code] = { count: 0, riskSum: 0, riskAvg: 0 };
    });
    const riskValues = { low: 1, moderate: 2, high: 3, very_high: 4 };
    highRiskRumors.forEach(r => {
      const region = REGIONS_CAMEROON.find(
        reg => reg.name === r.region || reg.code === r.region || reg.nameEn === r.region
      );
      if (region && data[region.code]) {
        data[region.code].count++;
        data[region.code].riskSum += riskValues[r.risk_level] || 0;
      }
    });
    Object.keys(data).forEach(code => {
      if (data[code].count > 0) {
        data[code].riskAvg = data[code].riskSum / data[code].count;
      }
    });
    return data;
  }, [highRiskRumors]);

  // ============================================
  // STYLES
  // ============================================

  const s = {
    page: {
      backgroundColor: isDark ? '#0a0f1a' : '#f1f5f9',
      minHeight: '100vh',
      padding: '0 0 40px',
      transition: 'background-color 0.3s',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
      flexWrap: 'wrap',
      gap: 12,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 800,
      color: isDark ? '#e2e8f0' : '#0f172a',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    },
    headerSubtitle: {
      fontSize: 13,
      color: isDark ? '#64748b' : '#94a3b8',
      marginTop: 4,
    },
    headerActions: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
    },
    iconBtn: (active) => ({
      width: 38,
      height: 38,
      borderRadius: 10,
      border: 'none',
      backgroundColor: active ? COHRM_COLORS.primary : (isDark ? '#1e293b' : '#fff'),
      color: active ? '#fff' : (isDark ? '#94a3b8' : '#6b7280'),
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s',
      boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
    }),
    // KPIs
    kpiGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16,
      marginBottom: 24,
    },
    kpiCard: (color, isAlert) => ({
      padding: '20px 24px',
      borderRadius: 14,
      backgroundColor: isDark ? '#111827' : '#fff',
      border: isDark ? `1px solid ${color}30` : `1px solid ${color}20`,
      boxShadow: isDark ? `0 0 20px ${color}10` : `0 2px 8px ${color}10`,
      position: 'relative',
      overflow: 'hidden',
      animation: isAlert ? 'cohrmDashPulse 3s ease-in-out infinite' : 'none',
    }),
    kpiGlow: (color) => ({
      position: 'absolute',
      top: 0,
      right: 0,
      width: 80,
      height: 80,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
    }),
    kpiValue: {
      fontSize: 32,
      fontWeight: 900,
      color: isDark ? '#f1f5f9' : '#0f172a',
      lineHeight: 1,
      marginBottom: 4,
    },
    kpiLabel: {
      fontSize: 12,
      fontWeight: 600,
      color: isDark ? '#94a3b8' : '#64748b',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    kpiIcon: (color) => ({
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: `${color}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    }),
    // Cards
    card: {
      padding: '24px',
      borderRadius: 16,
      backgroundColor: isDark ? '#111827' : '#fff',
      border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
      boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#0f172a',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    row2: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 20,
      marginBottom: 24,
    },
    fullRow: {
      marginBottom: 24,
    },
    // Heatmap
    heatmapTable: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 12,
    },
    heatmapTh: {
      padding: '8px 12px',
      fontSize: 11,
      fontWeight: 700,
      color: isDark ? '#94a3b8' : '#64748b',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      borderBottom: isDark ? '1px solid #1e293b' : '1px solid #e5e7eb',
      textAlign: 'center',
    },
    heatmapTd: {
      padding: '6px 12px',
      textAlign: 'left',
      borderBottom: isDark ? '1px solid #1e293b' : '1px solid #f1f5f9',
      fontSize: 13,
      color: isDark ? '#e2e8f0' : '#374151',
      fontWeight: 600,
    },
    heatmapCell: (count) => {
      let bg = 'transparent';
      let color = isDark ? '#64748b' : '#9ca3af';
      if (count >= 11) { bg = '#ef4444'; color = '#fff'; }
      else if (count >= 6) { bg = '#f59e0b'; color = '#fff'; }
      else if (count >= 3) { bg = '#3b82f6'; color = '#fff'; }
      else if (count >= 1) { bg = isDark ? '#1e3a5f' : '#dbeafe'; color = isDark ? '#93c5fd' : '#1e40af'; }
      return {
        padding: '8px 12px',
        textAlign: 'center',
        borderBottom: isDark ? '1px solid #1e293b' : '1px solid #f1f5f9',
        backgroundColor: bg,
        color: color,
        fontWeight: 700,
        fontSize: 13,
        borderRadius: 4,
      };
    },
    // Map
    mapContainer: {
      width: '100%',
      height: 420,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: isDark ? '#0a0f1a' : '#e8f4f8',
      position: 'relative',
    },
    mapToggle: {
      position: 'absolute',
      top: 12,
      right: 12,
      zIndex: 1000,
      display: 'flex',
      gap: 4,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      borderRadius: 8,
      padding: 4,
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    },
    mapToggleBtn: (active) => ({
      padding: '6px 12px',
      borderRadius: 6,
      border: 'none',
      fontSize: 11,
      fontWeight: 600,
      cursor: 'pointer',
      backgroundColor: active ? COHRM_COLORS.primary : 'transparent',
      color: active ? '#fff' : (isDark ? '#94a3b8' : '#64748b'),
      transition: 'all 0.2s',
    }),
    legendBar: {
      position: 'absolute',
      bottom: 12,
      left: 12,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      backgroundColor: isDark ? 'rgba(17,24,39,0.9)' : 'rgba(255,255,255,0.9)',
      borderRadius: 8,
      padding: '8px 12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    },
    legendGradient: {
      width: 120,
      height: 10,
      borderRadius: 5,
      background: 'linear-gradient(to right, #27AE60, #F39C12, #E74C3C)',
    },
    legendLabel: {
      fontSize: 10,
      color: isDark ? '#94a3b8' : '#64748b',
      fontWeight: 600,
    },
    // Table
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      padding: '10px 14px',
      fontSize: 11,
      fontWeight: 700,
      color: isDark ? '#94a3b8' : '#64748b',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      borderBottom: isDark ? '2px solid #1e293b' : '2px solid #e5e7eb',
      textAlign: 'left',
    },
    td: {
      padding: '12px 14px',
      fontSize: 13,
      color: isDark ? '#e2e8f0' : '#374151',
      borderBottom: isDark ? '1px solid #1e293b' : '1px solid #f1f5f9',
      verticalAlign: 'middle',
    },
    viewBtn: {
      padding: '6px 14px',
      borderRadius: 8,
      border: 'none',
      backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
      color: COHRM_COLORS.primaryLight,
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      transition: 'all 0.2s',
    },
    emptyState: {
      padding: '40px 20px',
      textAlign: 'center',
      color: isDark ? '#64748b' : '#94a3b8',
      fontSize: 14,
    },
  };

  // ============================================
  // RENDU LOADING
  // ============================================

  if (loading) {
    return (
      <div style={s.page}>
        <LoadingSpinner isDark={isDark} text="Chargement du centre de commandement risques..." />
      </div>
    );
  }

  // ============================================
  // RENDU SVG CARTE
  // ============================================

  const renderSvgMap = () => {
    // Calcul des bounds
    const allCoords = [];
    cameroonRegionsGeoJson.features.forEach(f => {
      f.geometry.coordinates[0].forEach(([lng, lat]) => {
        allCoords.push({ lng, lat });
      });
    });
    const minLng = Math.min(...allCoords.map(c => c.lng));
    const maxLng = Math.max(...allCoords.map(c => c.lng));
    const minLat = Math.min(...allCoords.map(c => c.lat));
    const maxLat = Math.max(...allCoords.map(c => c.lat));

    const padding = 20;
    const svgW = 400;
    const svgH = 420;
    const mapW = svgW - padding * 2;
    const mapH = svgH - padding * 2;

    const scaleX = mapW / (maxLng - minLng);
    const scaleY = mapH / (maxLat - minLat);
    const scale = Math.min(scaleX, scaleY);

    const toSvg = (lng, lat) => {
      const x = padding + (lng - minLng) * scale;
      const y = padding + (maxLat - lat) * scale; // flip Y
      return [x, y];
    };

    const getRegionColor = (code) => {
      const d = regionData[code];
      if (!d || d.count === 0) return isDark ? '#1e293b' : '#e2e8f0';
      if (mapMode === 'count') {
        if (d.count >= 10) return '#E74C3C';
        if (d.count >= 5) return '#E67E22';
        if (d.count >= 2) return '#F39C12';
        return '#27AE60';
      }
      // risk_avg mode
      if (d.riskAvg >= 3.5) return '#E74C3C';
      if (d.riskAvg >= 2.5) return '#E67E22';
      if (d.riskAvg >= 1.5) return '#F39C12';
      return '#27AE60';
    };

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: 'block' }}>
        {cameroonRegionsGeoJson.features.map(feature => {
          const { code, name } = feature.properties;
          const coords = feature.geometry.coordinates[0];
          const points = coords.map(([lng, lat]) => toSvg(lng, lat).join(',')).join(' ');
          const fillColor = getRegionColor(code);
          const d = regionData[code] || { count: 0, riskAvg: 0 };

          // Centre du polygone pour le label
          const cx = coords.reduce((s, c) => s + c[0], 0) / coords.length;
          const cy = coords.reduce((s, c) => s + c[1], 0) / coords.length;
          const [labelX, labelY] = toSvg(cx, cy);

          return (
            <g key={code}>
              <polygon
                points={points}
                fill={fillColor}
                stroke={isDark ? '#0a0f1a' : '#fff'}
                strokeWidth={1.5}
                style={{ cursor: 'pointer', transition: 'fill 0.3s, opacity 0.2s' }}
                onMouseEnter={(e) => { e.target.style.opacity = '0.8'; }}
                onMouseLeave={(e) => { e.target.style.opacity = '1'; }}
              >
                <title>{`${name}\nRumeurs: ${d.count}\nRisque moy: ${d.riskAvg.toFixed(1)}`}</title>
              </polygon>
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={9}
                fontWeight={700}
                fill={d.count > 0 ? '#fff' : (isDark ? '#64748b' : '#94a3b8')}
                style={{ pointerEvents: 'none', textShadow: d.count > 0 ? '0 1px 2px rgba(0,0,0,0.5)' : 'none' }}
              >
                {code}
              </text>
              {d.count > 0 && (
                <text
                  x={labelX}
                  y={labelY + 12}
                  textAnchor="middle"
                  fontSize={8}
                  fill="#fff"
                  style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {mapMode === 'count' ? d.count : d.riskAvg.toFixed(1)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  // ============================================
  // CUSTOM TOOLTIP RECHARTS
  // ============================================

  const CustomPieTooltip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null;
    return (
      <div style={{
        backgroundColor: isDark ? '#1e293b' : '#fff',
        padding: '10px 14px',
        borderRadius: 10,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: payload[0].payload.color, marginBottom: 4 }}>
          {payload[0].name}
        </div>
        <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>
          {payload[0].value} rumeur{payload[0].value > 1 ? 's' : ''}
        </div>
      </div>
    );
  };

  const CustomLegend = ({ payload }) => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
      {payload?.map((entry, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: entry.color, display: 'inline-block' }} />
          {entry.value}
        </div>
      ))}
    </div>
  );

  // ============================================
  // RENDU
  // ============================================

  return (
    <div style={s.page}>
      <style>{`
        @keyframes cohrmDashPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(231,76,60,0.1); }
          50% { box-shadow: 0 0 30px rgba(231,76,60,0.25); }
        }
      `}</style>

      {/* ========== HEADER ========== */}
      <div style={s.header}>
        <div>
          <div style={s.headerTitle}>
            <Shield size={22} color={COHRM_COLORS.primaryLight} />
            Centre de Commandement — Risques
          </div>
          <div style={s.headerSubtitle}>
            Surveillance en temps réel des risques sanitaires
          </div>
        </div>
        <div style={s.headerActions}>
          <button
            style={s.iconBtn(false)}
            onClick={() => loadData(true)}
            title="Actualiser"
          >
            <RefreshCw size={16} style={{ animation: refreshing ? 'cohrmSpin 1s linear infinite' : 'none' }} />
          </button>
          <button
            style={s.iconBtn(false)}
            onClick={() => setLocalDark(!isDark)}
            title={isDark ? 'Mode clair' : 'Mode sombre'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>

      {/* ========== KPIs ========== */}
      <div style={s.kpiGrid}>
        {[
          { label: 'Total évaluations', value: kpis.total, icon: BarChart3, color: '#3b82f6' },
          { label: 'High actifs', value: kpis.highCount, icon: AlertTriangle, color: '#E67E22' },
          { label: 'Very High actifs', value: kpis.veryHighCount, icon: AlertOctagon, color: '#E74C3C', isAlert: kpis.veryHighCount > 0 },
          { label: 'Alertes non résolues', value: highRiskRumors.length, icon: Activity, color: '#8b5cf6' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} style={s.kpiCard(kpi.color, kpi.isAlert)}>
              <div style={s.kpiGlow(kpi.color)} />
              <div style={s.kpiIcon(kpi.color)}>
                <Icon size={20} color={kpi.color} />
              </div>
              <div style={s.kpiValue}>{formatNumber(kpi.value)}</div>
              <div style={s.kpiLabel}>{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* ========== PIE + HEATMAP ========== */}
      <div style={s.row2}>
        {/* Pie Chart */}
        <div style={s.card}>
          <div style={s.cardTitle}>
            <BarChart3 size={16} color={COHRM_COLORS.primaryLight} />
            Répartition par niveau de risque
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomPieTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={s.emptyState}>Aucune donnée de risque disponible</div>
          )}
        </div>

        {/* Heatmap catégorie × niveau */}
        <div style={s.card}>
          <div style={s.cardTitle}>
            <Table2 size={16} color={COHRM_COLORS.primaryLight} />
            Heatmap Catégorie × Risque
          </div>
          {heatmapData.categories?.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={s.heatmapTable}>
                <thead>
                  <tr>
                    <th style={{ ...s.heatmapTh, textAlign: 'left' }}>Catégorie</th>
                    {['low', 'moderate', 'high', 'very_high'].map(lvl => {
                      const info = RISK_LEVELS.find(r => r.value === lvl);
                      return (
                        <th key={lvl} style={s.heatmapTh}>
                          <span style={{ color: info?.color }}>{info?.label}</span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.categories.map(cat => {
                    const catInfo = RUMOR_CATEGORIES.find(c => c.value === cat);
                    return (
                      <tr key={cat}>
                        <td style={s.heatmapTd}>{catInfo?.label || cat}</td>
                        {['low', 'moderate', 'high', 'very_high'].map(lvl => {
                          const count = heatmapData.matrix[cat]?.[lvl] || 0;
                          return (
                            <td key={lvl} style={s.heatmapCell(count)}>
                              {count || '—'}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={s.emptyState}>Aucune donnée pour la heatmap</div>
          )}
          {/* Légende heatmap */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            marginTop: 16,
            fontSize: 10,
            color: isDark ? '#64748b' : '#94a3b8',
          }}>
            {[
              { label: '0', bg: 'transparent', border: true },
              { label: '1-2', bg: isDark ? '#1e3a5f' : '#dbeafe' },
              { label: '3-5', bg: '#3b82f6' },
              { label: '6-10', bg: '#f59e0b' },
              { label: '11+', bg: '#ef4444' },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{
                  width: 14, height: 14, borderRadius: 3,
                  backgroundColor: item.bg,
                  border: item.border ? (isDark ? '1px solid #334155' : '1px solid #d1d5db') : 'none',
                  display: 'inline-block',
                }} />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========== CARTE CHOROPLÈTHE ========== */}
      <div style={s.fullRow}>
        <div style={s.card}>
          <div style={s.cardTitle}>
            <MapPin size={16} color={COHRM_COLORS.primaryLight} />
            Carte des risques — Régions du Cameroun
          </div>
          <div style={s.mapContainer}>
            {/* Toggle */}
            <div style={s.mapToggle}>
              <button
                style={s.mapToggleBtn(mapMode === 'risk_avg')}
                onClick={() => setMapMode('risk_avg')}
              >
                Par risque moyen
              </button>
              <button
                style={s.mapToggleBtn(mapMode === 'count')}
                onClick={() => setMapMode('count')}
              >
                Par nombre
              </button>
            </div>

            {/* SVG Map */}
            {renderSvgMap()}

            {/* Légende */}
            <div style={s.legendBar}>
              <span style={s.legendLabel}>Faible</span>
              <div style={s.legendGradient} />
              <span style={s.legendLabel}>Élevé</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========== TABLEAU ALERTES ACTIVES ========== */}
      <div style={s.fullRow}>
        <div style={s.card}>
          <div style={s.cardTitle}>
            <AlertTriangle size={16} color="#E74C3C" />
            Alertes actives — Rumeurs à risque élevé non résolues
            {highRiskRumors.length > 0 && (
              <span style={{
                marginLeft: 'auto',
                fontSize: 12,
                fontWeight: 600,
                color: isDark ? '#94a3b8' : '#64748b',
              }}>
                {highRiskRumors.length} alerte{highRiskRumors.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {highRiskRumors.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Titre</th>
                    <th style={s.th}>Région</th>
                    <th style={s.th}>Risque</th>
                    <th style={s.th}>Exposition</th>
                    <th style={s.th}>Date évaluation</th>
                    <th style={{ ...s.th, textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {highRiskRumors.map(rumor => {
                    const exposureInfo = EXPOSURE_LEVELS.find(e => e.value === rumor.risk_exposure);
                    return (
                      <tr
                        key={rumor.id}
                        style={{ transition: 'background-color 0.15s' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <td style={{ ...s.td, fontWeight: 600, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {rumor.title || 'Sans titre'}
                        </td>
                        <td style={s.td}>
                          {rumor.region || '—'}
                        </td>
                        <td style={s.td}>
                          <RiskBadge level={rumor.risk_level} size="sm" />
                        </td>
                        <td style={s.td}>
                          {exposureInfo?.label || '—'}
                        </td>
                        <td style={{ ...s.td, fontSize: 12, color: isDark ? '#94a3b8' : '#6b7280' }}>
                          {formatDate(rumor.updated_at)}
                        </td>
                        <td style={{ ...s.td, textAlign: 'center' }}>
                          <button
                            style={s.viewBtn}
                            onClick={() => navigateToRumor(rumor.id)}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = COHRM_COLORS.primary;
                              e.target.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = isDark ? '#1e293b' : '#f1f5f9';
                              e.target.style.color = COHRM_COLORS.primaryLight;
                            }}
                          >
                            <Eye size={13} />
                            Voir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={s.emptyState}>
              <Shield size={32} color={isDark ? '#334155' : '#d1d5db'} style={{ marginBottom: 12 }} />
              <div>Aucune alerte active</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                Toutes les rumeurs à risque élevé ont été traitées
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes cohrmSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RiskDashboard;
