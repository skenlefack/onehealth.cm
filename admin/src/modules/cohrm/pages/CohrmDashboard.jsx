/**
 * CohrmDashboard - Tableau de bord principal COHRM
 *
 * Sections:
 * 1. KPIs avec animation count-up et variation mensuelle
 * 2. Graphiques Recharts (tendances, sources, régions, risques)
 * 3. Mini-carte Leaflet (dernières rumeurs géolocalisées)
 * 4. Tableau des dernières rumeurs
 * 5. Notifications rapides
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  LineChart, Line, PieChart, Pie, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Megaphone, AlertTriangle, CheckCircle, Clock,
  TrendingUp, TrendingDown, MapPin, Activity, Shield,
  Bell, RefreshCw, Eye, ChevronRight, Minus,
} from 'lucide-react';
import useCohrmStore from '../stores/cohrmStore';
import { COHRM_COLORS, RISK_LEVELS, SOURCE_OPTIONS } from '../utils/constants';
import { formatNumber, formatRelativeDate } from '../utils/formatters';
import DashboardMap from '../components/DashboardMap';
import RecentRumorsTable from '../components/RecentRumorsTable';

// ============================================
// CONSTANTES COULEURS GRAPHIQUES
// ============================================

const CHART_COLORS = ['#3498DB', '#E74C3C', '#27AE60', '#F39C12', '#9B59B6', '#E67E22', '#1ABC9C', '#34495E'];

const RISK_COLORS = {
  low: '#27AE60',
  moderate: '#F39C12',
  high: '#E67E22',
  very_high: '#E74C3C',
  unknown: '#BDC3C7',
};

const SOURCE_LABELS = {};
SOURCE_OPTIONS.forEach(s => { SOURCE_LABELS[s.value] = s.label; });

const RISK_LABELS = {};
RISK_LEVELS.forEach(r => { RISK_LABELS[r.value] = r.label; });

// ============================================
// HOOK COUNT-UP ANIMATION
// ============================================

const useCountUp = (target, duration = 1200) => {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (target === 0 || target === null || target === undefined) {
      setValue(0);
      return;
    }

    const startTime = performance.now();
    const startVal = 0;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (target - startVal) * eased);
      setValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
};

// ============================================
// COMPOSANT KPI CARD
// ============================================

const KpiCard = ({ label, value, icon: Icon, color, bg, variation, isDark, onClick }) => {
  const animatedValue = useCountUp(value);
  const isPositive = variation > 0;
  const isNegative = variation < 0;

  const s = {
    card: {
      padding: '20px',
      borderRadius: 16,
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.15s, box-shadow 0.15s',
      position: 'relative',
      overflow: 'hidden',
    },
    iconWrapper: {
      width: 52,
      height: 52,
      borderRadius: 14,
      backgroundColor: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    value: {
      fontSize: 28,
      fontWeight: 800,
      color: isDark ? '#e2e8f0' : '#1f2937',
      lineHeight: 1,
    },
    label: {
      fontSize: 13,
      color: isDark ? '#94a3b8' : '#6B7280',
      marginTop: 4,
    },
    variation: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 2,
      fontSize: 12,
      fontWeight: 600,
      marginTop: 4,
      padding: '2px 6px',
      borderRadius: 8,
      color: isPositive ? '#E74C3C' : isNegative ? '#27AE60' : '#95A5A6',
      backgroundColor: isPositive
        ? (isDark ? 'rgba(231, 76, 60, 0.1)' : '#FDEDEC')
        : isNegative
          ? (isDark ? 'rgba(39, 174, 96, 0.1)' : '#EAFAF1')
          : 'transparent',
    },
  };

  return (
    <div
      style={s.card}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }}
      onClick={onClick}
    >
      <div style={s.iconWrapper}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <div style={s.value}>{formatNumber(animatedValue)}</div>
        <div style={s.label}>{label}</div>
        {variation !== undefined && variation !== null && (
          <div style={s.variation}>
            {isPositive ? <TrendingUp size={12} /> : isNegative ? <TrendingDown size={12} /> : <Minus size={12} />}
            {isPositive ? '+' : ''}{variation}%
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// COMPOSANT SKELETON LOADER
// ============================================

const Skeleton = ({ width = '100%', height = 20, borderRadius = 8, isDark }) => (
  <div
    style={{
      width,
      height,
      borderRadius,
      backgroundColor: isDark ? '#334155' : '#E5E7EB',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}
  />
);

const SkeletonKpi = ({ isDark }) => (
  <div
    style={{
      padding: '20px',
      borderRadius: 16,
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    }}
  >
    <Skeleton width={52} height={52} borderRadius={14} isDark={isDark} />
    <div style={{ flex: 1 }}>
      <Skeleton width={60} height={28} isDark={isDark} />
      <div style={{ marginTop: 6 }}>
        <Skeleton width={100} height={14} isDark={isDark} />
      </div>
    </div>
  </div>
);

const SkeletonChart = ({ isDark, height = 280 }) => (
  <div
    style={{
      padding: '24px',
      borderRadius: 16,
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
    }}
  >
    <Skeleton width={180} height={18} isDark={isDark} />
    <div style={{ marginTop: 16 }}>
      <Skeleton width="100%" height={height - 60} borderRadius={12} isDark={isDark} />
    </div>
  </div>
);

// ============================================
// CUSTOM TOOLTIP
// ============================================

const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        backgroundColor: isDark ? '#1e293b' : '#fff',
        border: isDark ? '1px solid #475569' : '1px solid #E5E7EB',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      {label && (
        <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#6B7280', marginBottom: 6 }}>
          {label}
        </div>
      )}
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color }} />
          <span style={{ color: isDark ? '#e2e8f0' : '#1f2937', fontWeight: 600 }}>
            {entry.value}
          </span>
          {entry.name && (
            <span style={{ color: isDark ? '#94a3b8' : '#6B7280' }}>{entry.name}</span>
          )}
        </div>
      ))}
    </div>
  );
};

// ============================================
// CHART SECTION WRAPPER
// ============================================

const ChartCard = ({ title, icon: Icon, children, isDark }) => (
  <div
    style={{
      padding: '24px',
      borderRadius: 16,
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
    }}
  >
    <div
      style={{
        fontSize: 15,
        fontWeight: 700,
        color: isDark ? '#e2e8f0' : '#1f2937',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {Icon && <Icon size={18} color={COHRM_COLORS.primaryLight} />}
      {title}
    </div>
    {children}
  </div>
);

// ============================================
// DASHBOARD PRINCIPAL
// ============================================

const CohrmDashboard = ({ isDark, user }) => {
  const {
    stats, loadingStats, fetchStats,
    recentRumors, fetchRecentRumors,
    riskStats, fetchRiskStats,
    setActivePage, navigateToRumor,
  } = useCohrmStore();

  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef(null);

  // Chargement initial et auto-refresh
  const loadAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchStats(),
      fetchRecentRumors(),
      fetchRiskStats(),
    ]);
    setLastRefresh(new Date());
    setRefreshing(false);
  }, [fetchStats, fetchRecentRumors, fetchRiskStats]);

  useEffect(() => {
    loadAll();

    // Auto-refresh toutes les 60 secondes
    intervalRef.current = setInterval(loadAll, 60000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadAll]);

  const isLoading = loadingStats && !stats;

  // ---- Préparer les données des graphiques ----

  // Tendances 7 jours
  const trendData = (stats?.trend || []).map(item => ({
    date: new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    rumeurs: item.count,
  }));

  // Par source (PieChart)
  const sourceData = (stats?.bySource || []).map((item, i) => ({
    name: SOURCE_LABELS[item.source] || item.source || 'Autre',
    value: item.count,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // Par région (BarChart horizontal)
  const regionData = (stats?.byRegion || []).slice(0, 8).map(item => ({
    region: item.region || 'N/D',
    count: item.count,
  }));

  // Par risque (Donut)
  const riskData = (riskStats?.byRisk || []).map(item => ({
    name: RISK_LABELS[item.risk_level] || item.risk_level,
    value: item.count,
    fill: RISK_COLORS[item.risk_level] || '#BDC3C7',
  }));

  // ---- Styles ----
  const s = {
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 800,
      color: isDark ? '#e2e8f0' : '#1f2937',
    },
    headerSub: {
      fontSize: 13,
      color: isDark ? '#94a3b8' : '#6B7280',
      marginTop: 2,
    },
    refreshBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 14px',
      borderRadius: 10,
      border: isDark ? '1px solid #475569' : '1px solid #E5E7EB',
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      color: isDark ? '#94a3b8' : '#6B7280',
      fontSize: 13,
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    kpiGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 16,
      marginBottom: 24,
    },
    chartGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 16,
      marginBottom: 24,
    },
    mapAndTable: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#1f2937',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    notifCard: {
      padding: '24px',
      borderRadius: 16,
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
    },
    notifItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '12px 0',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #F3F4F6',
      cursor: 'pointer',
    },
    notifDot: (color) => ({
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: color,
      marginTop: 6,
      flexShrink: 0,
    }),
    notifText: {
      fontSize: 13,
      color: isDark ? '#e2e8f0' : '#374151',
      lineHeight: 1.5,
    },
    notifTime: {
      fontSize: 12,
      color: isDark ? '#64748b' : '#9CA3AF',
      marginTop: 2,
    },
    viewAll: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '10px 0',
      fontSize: 13,
      fontWeight: 600,
      color: COHRM_COLORS.primaryLight,
      cursor: 'pointer',
      border: 'none',
      background: 'none',
    },
  };

  // Pulse animation CSS
  const pulseStyle = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `;

  // ---- KPIs ----
  const kpis = [
    {
      label: 'Total rumeurs',
      value: stats?.total || 0,
      icon: Megaphone,
      color: '#3498DB',
      bg: isDark ? 'rgba(52, 152, 219, 0.1)' : '#EBF5FB',
      variation: null,
      onClick: () => setActivePage('rumors'),
    },
    {
      label: 'En attente',
      value: stats?.pending || 0,
      icon: Clock,
      color: '#F39C12',
      bg: isDark ? 'rgba(243, 156, 18, 0.1)' : '#FEF9E7',
      variation: null,
      onClick: () => setActivePage('validation'),
    },
    {
      label: 'Confirmées ce mois',
      value: stats?.confirmed || 0,
      icon: CheckCircle,
      color: '#27AE60',
      bg: isDark ? 'rgba(39, 174, 96, 0.1)' : '#EAFAF1',
      variation: null,
    },
    {
      label: 'Alertes actives',
      value: stats?.alerts || 0,
      icon: AlertTriangle,
      color: '#E74C3C',
      bg: isDark ? 'rgba(231, 76, 60, 0.1)' : '#FDEDEC',
      variation: null,
      onClick: () => setActivePage('risk'),
    },
  ];

  // ---- Notifications (from recent rumors with high priority) ----
  const notifications = (recentRumors || [])
    .filter(r => r.priority === 'high' || r.priority === 'critical' || r.status === 'confirmed')
    .slice(0, 5)
    .map(r => ({
      id: r.id,
      text: `${r.priority === 'critical' ? 'CRITIQUE' : r.priority === 'high' ? 'ALERTE' : 'Confirmée'} - ${r.title || r.description?.substring(0, 80) || 'Rumeur sans titre'}`,
      time: r.created_at,
      color: r.priority === 'critical' ? '#E74C3C' : r.priority === 'high' ? '#E67E22' : '#27AE60',
    }));

  // ============================================
  // RENDER
  // ============================================

  return (
    <div>
      <style>{pulseStyle}</style>

      {/* Header avec bouton refresh */}
      <div style={s.header}>
        <div>
          <div style={s.headerTitle}>Tableau de bord COHRM</div>
          <div style={s.headerSub}>
            Dernière mise à jour : {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <button
          style={s.refreshBtn}
          onClick={loadAll}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = COHRM_COLORS.primaryLight; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = isDark ? '#475569' : '#E5E7EB'; }}
        >
          <RefreshCw
            size={14}
            style={{
              animation: refreshing ? 'spin 1s linear infinite' : 'none',
            }}
          />
          Actualiser
        </button>
      </div>

      {/* Spin animation for refresh icon */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* ============================================ */}
      {/* SECTION 1 - KPIs */}
      {/* ============================================ */}
      <div style={s.kpiGrid}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonKpi key={i} isDark={isDark} />)
          : kpis.map((kpi, idx) => (
              <KpiCard key={idx} {...kpi} isDark={isDark} />
            ))
        }
      </div>

      {/* ============================================ */}
      {/* SECTION 2 - GRAPHIQUES (grille 2x2) */}
      {/* ============================================ */}
      {isLoading ? (
        <div style={s.chartGrid}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonChart key={i} isDark={isDark} />)}
        </div>
      ) : (
        <div style={s.chartGrid}>
          {/* --- Tendances 7 jours (LineChart) --- */}
          <ChartCard title="Tendances (7 jours)" icon={TrendingUp} isDark={isDark}>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#334155' : '#F3F4F6'}
                  />
                  <XAxis
                    dataKey="date"
                    fontSize={12}
                    tick={{ fill: isDark ? '#94a3b8' : '#6B7280' }}
                    axisLine={{ stroke: isDark ? '#475569' : '#E5E7EB' }}
                  />
                  <YAxis
                    fontSize={12}
                    tick={{ fill: isDark ? '#94a3b8' : '#6B7280' }}
                    axisLine={{ stroke: isDark ? '#475569' : '#E5E7EB' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip isDark={isDark} />} />
                  <Line
                    type="monotone"
                    dataKey="rumeurs"
                    name="Rumeurs"
                    stroke={COHRM_COLORS.primaryLight}
                    strokeWidth={3}
                    dot={{ fill: COHRM_COLORS.primaryLight, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? '#64748b' : '#9CA3AF', fontSize: 14 }}>
                Aucune donnée sur les 7 derniers jours
              </div>
            )}
          </ChartCard>

          {/* --- Répartition par source (PieChart) --- */}
          <ChartCard title="Par source" icon={Activity} isDark={isDark}>
            {sourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={{ stroke: isDark ? '#94a3b8' : '#6B7280' }}
                    fontSize={11}
                  >
                    {sourceData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip isDark={isDark} />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? '#64748b' : '#9CA3AF', fontSize: 14 }}>
                Aucune donnée disponible
              </div>
            )}
          </ChartCard>

          {/* --- Top régions (BarChart horizontal) --- */}
          <ChartCard title="Top régions" icon={MapPin} isDark={isDark}>
            {regionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={regionData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#334155' : '#F3F4F6'}
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    fontSize={12}
                    tick={{ fill: isDark ? '#94a3b8' : '#6B7280' }}
                    axisLine={{ stroke: isDark ? '#475569' : '#E5E7EB' }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="region"
                    fontSize={12}
                    width={90}
                    tick={{ fill: isDark ? '#94a3b8' : '#6B7280' }}
                    axisLine={{ stroke: isDark ? '#475569' : '#E5E7EB' }}
                  />
                  <Tooltip content={<CustomTooltip isDark={isDark} />} />
                  <Bar dataKey="count" name="Rumeurs" radius={[0, 6, 6, 0]}>
                    {regionData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? '#64748b' : '#9CA3AF', fontSize: 14 }}>
                Aucune donnée disponible
              </div>
            )}
          </ChartCard>

          {/* --- Répartition par risque (Donut) --- */}
          <ChartCard title="Par niveau de risque" icon={Shield} isDark={isDark}>
            {riskData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={{ stroke: isDark ? '#94a3b8' : '#6B7280' }}
                    fontSize={11}
                  >
                    {riskData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip isDark={isDark} />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12, color: isDark ? '#94a3b8' : '#6B7280' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? '#64748b' : '#9CA3AF', fontSize: 14 }}>
                Aucune évaluation de risque
              </div>
            )}
          </ChartCard>
        </div>
      )}

      {/* ============================================ */}
      {/* SECTION 3 & 4 - CARTE + RUMEURS RECENTES */}
      {/* ============================================ */}
      <div style={s.mapAndTable}>
        {/* Mini-carte */}
        <ChartCard title="Dernières rumeurs géolocalisées" icon={MapPin} isDark={isDark}>
          <DashboardMap
            rumors={recentRumors || []}
            isDark={isDark}
            onRumorClick={(id) => navigateToRumor(id)}
          />
        </ChartCard>

        {/* Tableau des dernières rumeurs */}
        <ChartCard title="Dernières rumeurs" icon={Megaphone} isDark={isDark}>
          <RecentRumorsTable
            rumors={recentRumors || []}
            isDark={isDark}
            onRumorClick={(id) => navigateToRumor(id)}
          />
          <button
            style={s.viewAll}
            onClick={() => setActivePage('rumors')}
          >
            <Eye size={14} />
            Voir toutes les rumeurs
            <ChevronRight size={14} />
          </button>
        </ChartCard>
      </div>

      {/* ============================================ */}
      {/* SECTION 5 - NOTIFICATIONS RAPIDES */}
      {/* ============================================ */}
      <div style={s.notifCard}>
        <div style={s.sectionTitle}>
          <Bell size={18} color={COHRM_COLORS.primaryLight} />
          Notifications rapides
        </div>
        {notifications.length > 0 ? (
          notifications.map((notif, idx) => (
            <div
              key={notif.id || idx}
              style={{
                ...s.notifItem,
                borderBottom: idx === notifications.length - 1 ? 'none' : s.notifItem.borderBottom,
              }}
              onClick={() => navigateToRumor(notif.id)}
            >
              <div style={s.notifDot(notif.color)} />
              <div>
                <div style={s.notifText}>{notif.text}</div>
                <div style={s.notifTime}>{formatRelativeDate(notif.time)}</div>
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '20px',
              color: isDark ? '#64748b' : '#9CA3AF',
              fontSize: 14,
            }}
          >
            Aucune notification récente
          </div>
        )}
      </div>
    </div>
  );
};

export default CohrmDashboard;
