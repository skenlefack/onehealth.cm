/**
 * DusscDashboard - Tableau de bord principal DUSS-C
 *
 * 4 vues conformes a la note conceptuelle:
 * 1. Pilotage - 6 KPI cards
 * 2. Graphiques rapides - tendance journaliere + distribution par canal
 * 3. Bandeau plaidoyer - 3 grands chiffres
 * 4. Top questions echouees - tableau
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  BarChart3, CheckCircle, Percent, TrendingUp, Users, AlertTriangle,
  RefreshCw, Award, HelpCircle, BookOpen,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useDusscStore from '../stores/dusscStore';
import { DUSSC_COLORS } from '../utils/constants';

// ============================================
// CHART COLORS
// ============================================

const CHART_COLORS = [
  '#2F5D3A', '#27AE60', '#B4741F', '#3498DB', '#9B59B6',
  '#E67E22', '#1ABC9C', '#E74C3C', '#34495E', '#F39C12',
];

// ============================================
// COUNT-UP ANIMATION HOOK
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

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
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
// NUMBER FORMATTING
// ============================================

const fmt = (n) => {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('fr-FR').format(n);
};

const fmtPct = (n) => {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n) + ' %';
};

const fmtPts = (n) => {
  if (n === null || n === undefined) return '—';
  const sign = n > 0 ? '+' : '';
  return sign + new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);
};

// ============================================
// SKELETON LOADER
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
      padding: 20,
      borderRadius: 16,
      backgroundColor: isDark ? '#1e1e2e' : '#fff',
      border: isDark ? '1px solid #2d2d3d' : '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    }}
  >
    <Skeleton width={52} height={52} borderRadius={14} isDark={isDark} />
    <div style={{ flex: 1 }}>
      <Skeleton width={80} height={28} isDark={isDark} />
      <div style={{ marginTop: 8 }}>
        <Skeleton width={120} height={14} isDark={isDark} />
      </div>
    </div>
  </div>
);

// ============================================
// KPI CARD
// ============================================

const KpiCard = ({ label, value, displayValue, icon: Icon, color, bg, isDark, suffix }) => {
  const animatedValue = useCountUp(value);

  const s = {
    card: {
      padding: 20,
      borderRadius: 16,
      backgroundColor: isDark ? '#1e1e2e' : '#fff',
      border: isDark ? '1px solid #2d2d3d' : '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
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
    >
      <div style={s.iconWrapper}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <div style={s.value}>
          {displayValue !== undefined ? displayValue : fmt(animatedValue)}
          {suffix && <span style={{ fontSize: 16, fontWeight: 600, marginLeft: 2 }}>{suffix}</span>}
        </div>
        <div style={s.label}>{label}</div>
      </div>
    </div>
  );
};

// ============================================
// SECTION WRAPPER
// ============================================

const Section = ({ title, children, isDark, style = {} }) => (
  <div
    style={{
      backgroundColor: isDark ? '#1e1e2e' : '#fff',
      borderRadius: 16,
      border: isDark ? '1px solid #2d2d3d' : '1px solid #E5E7EB',
      padding: 24,
      ...style,
    }}
  >
    {title && (
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: 16,
        fontWeight: 700,
        color: isDark ? '#e2e8f0' : '#1f2937',
      }}>
        {title}
      </h3>
    )}
    {children}
  </div>
);

// ============================================
// EMPTY STATE
// ============================================

const EmptyState = ({ message, isDark }) => (
  <div style={{
    textAlign: 'center',
    padding: '40px 20px',
    color: isDark ? '#64748b' : '#9CA3AF',
  }}>
    <BarChart3 size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
    <div style={{ fontSize: 14 }}>{message}</div>
  </div>
);

// ============================================
// CUSTOM TOOLTIP
// ============================================

const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: isDark ? '#1e1e2e' : '#fff',
      border: isDark ? '1px solid #2d2d3d' : '1px solid #E5E7EB',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 13,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4, color: isDark ? '#e2e8f0' : '#1f2937' }}>
        {label}
      </div>
      {payload.map((entry, i) => (
        <div key={i} style={{ color: entry.color || DUSSC_COLORS.primary, display: 'flex', gap: 8 }}>
          <span>{entry.name}:</span>
          <span style={{ fontWeight: 600 }}>{fmt(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const DusscDashboard = ({ isDark, user }) => {
  const { t } = useTranslation('dussc');

  const {
    overview, learning, advocacy,
    loadingStats,
    fetchOverview, fetchLearning, fetchAdvocacy,
  } = useDusscStore();

  const [refreshing, setRefreshing] = useState(false);

  // Initial data load
  useEffect(() => {
    fetchOverview();
    fetchAdvocacy();
    fetchLearning();
  }, [fetchOverview, fetchAdvocacy, fetchLearning]);

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchOverview(), fetchAdvocacy(), fetchLearning()]);
    setRefreshing(false);
  };

  // ─── Derived data ───
  const totalSessions = overview?.total_sessions ?? 0;
  const completed = overview?.completed ?? 0;
  const completionRate = overview?.completion_rate ?? 0;
  const avgGain = overview?.avg_gain ?? 0;
  const assistedCount = overview?.assisted_count ?? 0;
  const suspiciousCount = overview?.suspicious_count ?? 0;

  const dailyTrend = overview?.daily_trend || [];
  const byCanal = overview?.by_canal || [];

  const topFailed = learning?.top_failed_questions || [];

  const advTotalSessions = advocacy?.total_sessions ?? 0;
  const advAvgGain = advocacy?.avg_gain ?? 0;
  const advTotalQuestions = advocacy?.total_questions ?? 0;

  // ─── Styles ───
  const styles = {
    container: {
      padding: 0,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: 800,
      color: isDark ? '#e2e8f0' : '#1f2937',
      margin: 0,
    },
    subtitle: {
      fontSize: 14,
      color: isDark ? '#64748b' : '#9CA3AF',
      marginTop: 4,
    },
    refreshBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 16px',
      borderRadius: 10,
      border: 'none',
      backgroundColor: isDark ? '#2d2d3d' : '#f3f4f6',
      color: isDark ? '#94a3b8' : '#6B7280',
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 600,
      transition: 'background-color 0.15s',
    },
    kpiGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 16,
      marginBottom: 24,
    },
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: 16,
      marginBottom: 24,
    },
    advocacyBanner: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '32px 24px',
      borderRadius: 16,
      marginBottom: 24,
      background: isDark
        ? `linear-gradient(135deg, ${DUSSC_COLORS.primaryDark} 0%, #1e1e2e 100%)`
        : `linear-gradient(135deg, ${DUSSC_COLORS.primary} 0%, ${DUSSC_COLORS.primaryLight} 100%)`,
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    },
    advocacyStat: {
      textAlign: 'center',
      flex: 1,
    },
    advocacyNumber: {
      fontSize: 42,
      fontWeight: 900,
      lineHeight: 1.1,
    },
    advocacyLabel: {
      fontSize: 14,
      opacity: 0.85,
      marginTop: 8,
      fontWeight: 500,
    },
    advocacyDivider: {
      width: 1,
      height: 60,
      backgroundColor: 'rgba(255,255,255,0.25)',
    },
    tableContainer: {
      overflowX: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13,
    },
    th: {
      textAlign: 'left',
      padding: '10px 12px',
      borderBottom: isDark ? '2px solid #2d2d3d' : '2px solid #E5E7EB',
      color: isDark ? '#94a3b8' : '#6B7280',
      fontWeight: 700,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    td: {
      padding: '10px 12px',
      borderBottom: isDark ? '1px solid #2d2d3d' : '1px solid #f3f4f6',
      color: isDark ? '#cbd5e1' : '#374151',
    },
    errorBadge: {
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 700,
    },
  };

  // ─── Loading skeleton ───
  if (loadingStats && !overview) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <Skeleton width={260} height={28} isDark={isDark} />
            <div style={{ marginTop: 8 }}>
              <Skeleton width={180} height={16} isDark={isDark} />
            </div>
          </div>
        </div>
        <div style={styles.kpiGrid}>
          {[...Array(6)].map((_, i) => <SkeletonKpi key={i} isDark={isDark} />)}
        </div>
        <div style={styles.chartsGrid}>
          <Section isDark={isDark}>
            <Skeleton height={250} isDark={isDark} />
          </Section>
          <Section isDark={isDark}>
            <Skeleton height={250} isDark={isDark} />
          </Section>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* ─── Header ─── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{t('dashboard.title')}</h1>
          <div style={styles.subtitle}>
            {t('dashboard.totalSessions')}: {fmt(totalSessions)}
          </div>
        </div>
        <button
          style={styles.refreshBtn}
          onClick={handleRefresh}
          disabled={refreshing}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? '#3d3d4d' : '#e5e7eb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? '#2d2d3d' : '#f3f4f6';
          }}
        >
          <RefreshCw size={14} style={{
            animation: refreshing ? 'spin 1s linear infinite' : 'none',
          }} />
          {refreshing ? t('common.loading') : t('common.filter')}
        </button>
      </div>

      {/* ─── Vue 1: Pilotage - 6 KPIs ─── */}
      <div style={styles.kpiGrid}>
        <KpiCard
          label={t('dashboard.totalSessions')}
          value={totalSessions}
          icon={BarChart3}
          color={DUSSC_COLORS.primary}
          bg={isDark ? 'rgba(47,93,58,0.15)' : '#EAEFEB'}
          isDark={isDark}
        />
        <KpiCard
          label={t('dashboard.completed')}
          value={completed}
          icon={CheckCircle}
          color={DUSSC_COLORS.primaryLight}
          bg={isDark ? 'rgba(39,174,96,0.15)' : '#EAFAF1'}
          isDark={isDark}
        />
        <KpiCard
          label={t('dashboard.completionRate')}
          value={Math.round(completionRate)}
          displayValue={fmtPct(completionRate)}
          icon={Percent}
          color='#3498DB'
          bg={isDark ? 'rgba(52,152,219,0.15)' : '#EBF5FB'}
          isDark={isDark}
        />
        <KpiCard
          label={t('dashboard.avgGain')}
          value={Math.round(Math.abs(avgGain))}
          displayValue={fmtPts(avgGain)}
          icon={TrendingUp}
          color={DUSSC_COLORS.accent}
          bg={isDark ? 'rgba(180,116,31,0.15)' : '#FEF5E7'}
          isDark={isDark}
          suffix="pts"
        />
        <KpiCard
          label={t('dashboard.assisted')}
          value={assistedCount}
          icon={Users}
          color='#9B59B6'
          bg={isDark ? 'rgba(155,89,182,0.15)' : '#F4ECF7'}
          isDark={isDark}
        />
        <KpiCard
          label={t('dashboard.suspicious')}
          value={suspiciousCount}
          icon={AlertTriangle}
          color='#E74C3C'
          bg={isDark ? 'rgba(231,76,60,0.15)' : '#FDEDEC'}
          isDark={isDark}
        />
      </div>

      {/* ─── Vue 2: Quick Charts ─── */}
      <div style={styles.chartsGrid}>
        {/* Daily Trend Line Chart */}
        <Section title={t('dashboard.dailyTrend')} isDark={isDark}>
          {dailyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dailyTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#2d2d3d' : '#f0f0f0'}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#9CA3AF' }}
                  tickLine={false}
                  axisLine={{ stroke: isDark ? '#2d2d3d' : '#E5E7EB' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#9CA3AF' }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name={t('dashboard.totalSessions')}
                  stroke={DUSSC_COLORS.primary}
                  strokeWidth={2.5}
                  dot={{ fill: DUSSC_COLORS.primary, strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: DUSSC_COLORS.primaryLight }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message={t('common.noData')} isDark={isDark} />
          )}
        </Section>

        {/* Distribution by Canal Bar Chart */}
        <Section title={t('dashboard.byCanal')} isDark={isDark}>
          {byCanal.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byCanal} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 60 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#2d2d3d' : '#f0f0f0'}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#9CA3AF' }}
                  tickLine={false}
                  axisLine={{ stroke: isDark ? '#2d2d3d' : '#E5E7EB' }}
                />
                <YAxis
                  type="category"
                  dataKey="canal"
                  tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#9CA3AF' }}
                  tickLine={false}
                  axisLine={false}
                  width={55}
                />
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
                <Bar
                  dataKey="count"
                  name={t('dashboard.totalSessions')}
                  radius={[0, 6, 6, 0]}
                  maxBarSize={28}
                >
                  {byCanal.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message={t('common.noData')} isDark={isDark} />
          )}
        </Section>
      </div>

      {/* ─── Vue 3: Advocacy Banner ─── */}
      <div style={styles.advocacyBanner}>
        {/* Decorative background circles */}
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 120, height: 120, borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', bottom: -20, left: 40,
          width: 80, height: 80, borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.04)',
        }} />

        <div style={styles.advocacyStat}>
          <div style={styles.advocacyNumber}>{fmt(advTotalSessions)}</div>
          <div style={styles.advocacyLabel}>
            <Award size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {t('dashboard.advocacy.formed')}
          </div>
        </div>

        <div style={styles.advocacyDivider} />

        <div style={styles.advocacyStat}>
          <div style={styles.advocacyNumber}>{fmtPts(advAvgGain)}</div>
          <div style={styles.advocacyLabel}>
            <TrendingUp size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {t('dashboard.advocacy.progression')}
          </div>
        </div>

        <div style={styles.advocacyDivider} />

        <div style={styles.advocacyStat}>
          <div style={styles.advocacyNumber}>{fmt(advTotalQuestions)}</div>
          <div style={styles.advocacyLabel}>
            <BookOpen size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {t('dashboard.advocacy.questions')}
          </div>
        </div>
      </div>

      {/* ─── Vue 4: Top Failed Questions Table ─── */}
      <Section title={t('dashboard.topFailed')} isDark={isDark}>
        {topFailed.length > 0 ? (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>{t('questions.id')}</th>
                  <th style={styles.th}>{t('questions.module')}</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>
                    {t('dashboard.completionRate').replace("d'achèvement", "d'erreur")}
                  </th>
                  <th style={styles.th}>{t('questions.enonce')}</th>
                </tr>
              </thead>
              <tbody>
                {topFailed.map((q, idx) => {
                  const errorRate = q.error_rate ?? 0;
                  const badgeColor = errorRate >= 70
                    ? '#E74C3C'
                    : errorRate >= 50
                      ? '#F39C12'
                      : '#27AE60';

                  return (
                    <tr
                      key={q.question_id || idx}
                      style={{ transition: 'background-color 0.15s' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? '#252535' : '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{ ...styles.td, fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>
                        {q.question_id || '—'}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          backgroundColor: isDark ? 'rgba(47,93,58,0.15)' : '#EAEFEB',
                          color: DUSSC_COLORS.primary,
                        }}>
                          {q.module || '—'}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <span style={{
                          ...styles.errorBadge,
                          backgroundColor: isDark
                            ? `${badgeColor}20`
                            : `${badgeColor}15`,
                          color: badgeColor,
                        }}>
                          {fmtPct(errorRate)}
                        </span>
                      </td>
                      <td style={{
                        ...styles.td,
                        maxWidth: 400,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {q.enonce_fr
                          ? (q.enonce_fr.length > 80
                            ? q.enonce_fr.substring(0, 80) + '...'
                            : q.enonce_fr)
                          : '—'
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message={t('common.noData')} isDark={isDark} />
        )}
      </Section>

      {/* Spin animation for refresh */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DusscDashboard;
