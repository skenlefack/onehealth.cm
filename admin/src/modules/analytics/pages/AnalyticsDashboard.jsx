import React, { useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, RefreshCw, BarChart3 } from 'lucide-react';
import useAnalyticsStore from '../stores/analyticsStore';
import DateRangePicker from '../components/DateRangePicker';
import RealtimeIndicator from '../components/RealtimeIndicator';
import KpiCards from '../components/KpiCards';
import VisitorChart from '../components/VisitorChart';
import TopPagesTable from '../components/TopPagesTable';
import ReferrersChart from '../components/ReferrersChart';
import BrowsersChart from '../components/BrowsersChart';
import OsChart from '../components/OsChart';
import DevicesChart from '../components/DevicesChart';
import CountriesChart from '../components/CountriesChart';
import UtmTable from '../components/UtmTable';

const Skeleton = ({ width = '100%', height = 20, borderRadius = 8, isDark }) => (
  <div style={{
    width, height, borderRadius,
    backgroundColor: isDark ? '#334155' : '#E5E7EB',
    animation: 'skeletonPulse 1.5s ease-in-out infinite',
  }} />
);

const SkeletonCard = ({ isDark }) => (
  <div style={{
    padding: 20, borderRadius: 16,
    backgroundColor: isDark ? '#1e293b' : '#fff',
    border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    display: 'flex', alignItems: 'center', gap: 16,
  }}>
    <Skeleton width={48} height={48} borderRadius={12} isDark={isDark} />
    <div style={{ flex: 1 }}>
      <Skeleton width={60} height={24} isDark={isDark} />
      <div style={{ marginTop: 6 }}><Skeleton width={90} height={14} isDark={isDark} /></div>
    </div>
  </div>
);

const SkeletonChart = ({ isDark, height = 280 }) => (
  <div style={{
    padding: 20, borderRadius: 16,
    backgroundColor: isDark ? '#1e293b' : '#fff',
    border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
  }}>
    <Skeleton width={180} height={20} isDark={isDark} />
    <div style={{ marginTop: 16 }}><Skeleton width="100%" height={height} isDark={isDark} /></div>
  </div>
);

const PERIOD_LABELS = {
  today: "Aujourd'hui",
  '7d': '7 derniers jours',
  '30d': '30 derniers jours',
  '90d': '90 derniers jours',
  custom: 'Période personnalisée',
};

const AnalyticsDashboard = ({ isDark, token, user, onBack }) => {
  const store = useAnalyticsStore();
  const realtimeIntervalRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  const loadAll = useCallback(() => {
    store.fetchAll();
    store.fetchRealtime();
  }, []);

  useEffect(() => {
    loadAll();

    // Auto-refresh data every 60s
    refreshIntervalRef.current = setInterval(() => store.fetchAll(), 60000);
    // Realtime every 30s
    realtimeIntervalRef.current = setInterval(() => store.fetchRealtime(), 30000);

    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      if (realtimeIntervalRef.current) clearInterval(realtimeIntervalRef.current);
    };
  }, []);

  const s = {
    container: {
      padding: '24px',
      maxWidth: 1400,
      margin: '0 auto',
      minHeight: '100vh',
      backgroundColor: isDark ? '#0f172a' : '#F8FAFC',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
      flexWrap: 'wrap',
      gap: 16,
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 10,
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      backgroundColor: isDark ? '#1e293b' : '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: isDark ? '#e2e8f0' : '#1f2937',
    },
    title: {
      fontSize: 24,
      fontWeight: 700,
      color: isDark ? '#f1f5f9' : '#1f2937',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    },
    subtitle: {
      fontSize: 13,
      color: isDark ? '#64748b' : '#9CA3AF',
      marginTop: 2,
    },
    refreshBtn: {
      width: 38,
      height: 38,
      borderRadius: 10,
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      backgroundColor: isDark ? '#1e293b' : '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: isDark ? '#e2e8f0' : '#1f2937',
      transition: 'all 0.2s',
    },
    section: { marginBottom: 24 },
    grid2: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 },
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 },
  };

  return (
    <>
      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 1024px) {
          .analytics-grid-2 { grid-template-columns: 1fr !important; }
          .analytics-grid-3 { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .analytics-grid-3 { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      <div style={s.container}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            {onBack && (
              <button style={s.backBtn} onClick={onBack} title="Retour">
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <div style={s.title}>
                <BarChart3 size={24} color="#8B5CF6" />
                Analytics
              </div>
              <div style={s.subtitle}>{PERIOD_LABELS[store.period] || store.period}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <RealtimeIndicator count={store.realtime?.active_visitors} isDark={isDark} />
            <button
              style={s.refreshBtn}
              onClick={loadAll}
              title="Rafraîchir"
            >
              <RefreshCw size={16} style={{ animation: store.loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>
        </div>

        {/* Date Range Picker */}
        <div style={{ ...s.section }}>
          <DateRangePicker
            period={store.period}
            onPeriodChange={store.setPeriod}
            onCustomRange={store.setCustomRange}
            isDark={isDark}
          />
        </div>

        {/* KPI Cards */}
        <div style={s.section}>
          {store.loading && !store.dashboard ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[1,2,3,4,5].map(i => <SkeletonCard key={i} isDark={isDark} />)}
            </div>
          ) : (
            <KpiCards
              kpis={store.dashboard?.kpis}
              changes={store.dashboard?.changes}
              isDark={isDark}
            />
          )}
        </div>

        {/* Visitor Trend Chart */}
        <div style={s.section}>
          {store.loading && !store.dashboard ? (
            <SkeletonChart isDark={isDark} />
          ) : (
            <VisitorChart data={store.dashboard?.trend} isDark={isDark} />
          )}
        </div>

        {/* Top Pages + Referrers */}
        <div style={{ ...s.grid2, ...s.section }} className="analytics-grid-2">
          {store.loading && !store.pages ? (
            <>
              <SkeletonChart isDark={isDark} height={350} />
              <SkeletonChart isDark={isDark} height={350} />
            </>
          ) : (
            <>
              <TopPagesTable data={store.pages} isDark={isDark} />
              <ReferrersChart data={store.referrers} isDark={isDark} />
            </>
          )}
        </div>

        {/* Browsers + OS + Devices */}
        <div style={{ ...s.grid3, ...s.section }} className="analytics-grid-3">
          {store.loading && !store.browsers ? (
            <>
              <SkeletonChart isDark={isDark} height={220} />
              <SkeletonChart isDark={isDark} height={220} />
              <SkeletonChart isDark={isDark} height={220} />
            </>
          ) : (
            <>
              <BrowsersChart data={store.browsers} isDark={isDark} />
              <OsChart data={store.os} isDark={isDark} />
              <DevicesChart data={store.devices} isDark={isDark} />
            </>
          )}
        </div>

        {/* Countries + UTM */}
        <div style={{ ...s.grid2, ...s.section }} className="analytics-grid-2">
          {store.loading && !store.countries ? (
            <>
              <SkeletonChart isDark={isDark} height={300} />
              <SkeletonChart isDark={isDark} height={300} />
            </>
          ) : (
            <>
              <CountriesChart data={store.countries} isDark={isDark} />
              <UtmTable data={store.utm} isDark={isDark} />
            </>
          )}
        </div>

        {/* Realtime feed */}
        {store.realtime?.recent && store.realtime.recent.length > 0 && (
          <div style={{
            padding: 20, borderRadius: 16,
            backgroundColor: isDark ? '#1e293b' : '#fff',
            border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: isDark ? '#f1f5f9' : '#1f2937', marginBottom: 12 }}>
              Activité en temps réel
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {store.realtime.recent.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px',
                  borderRadius: 8, backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
                  fontSize: 13, color: isDark ? '#CBD5E1' : '#4B5563',
                }}>
                  <span style={{ fontSize: 16 }}>
                    {item.device === 'mobile' ? '📱' : item.device === 'tablet' ? '📟' : '🖥️'}
                  </span>
                  <span style={{ fontWeight: 500, color: isDark ? '#e2e8f0' : '#1f2937', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.url}
                  </span>
                  {item.country && (
                    <span style={{ fontSize: 12, padding: '2px 6px', borderRadius: 4, backgroundColor: isDark ? '#334155' : '#E5E7EB' }}>
                      {item.country}
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: isDark ? '#64748b' : '#9CA3AF', whiteSpace: 'nowrap' }}>
                    {new Date(item.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AnalyticsDashboard;
