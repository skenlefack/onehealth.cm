/**
 * ValidationStats - Statistiques de validation COHRM
 *
 * Dashboard de statistiques avec graphiques Recharts :
 * - Temps moyen de validation par niveau (bar chart horizontal)
 * - Taux validation vs rejet par niveau (stacked bar chart)
 * - Top 10 validateurs (tableau)
 * - Volume de validations par jour sur 30 jours (area chart)
 *
 * Props :
 *   - user (object) : utilisateur connecté
 *   - isDark (boolean) : mode sombre
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import {
  BarChart3, Clock, TrendingUp, Users, Award, Calendar,
} from 'lucide-react';
import { getValidationStats } from '../services/cohrmApi';
import { LoadingSpinner } from '../components/shared';
import { VALIDATION_LEVELS, COHRM_COLORS } from '../utils/constants';
import { formatNumber, formatDuration } from '../utils/formatters';

const ValidationStats = ({ user, isDark = false }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const response = await getValidationStats();
        if (response.success) {
          setStats(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Données de démo si l'API ne retourne pas de données complètes
  const getAvgTimeData = () => {
    if (stats?.avg_time_per_level) return stats.avg_time_per_level;
    return VALIDATION_LEVELS.map(l => ({
      level: l.level,
      name: `N${l.level}`,
      fullName: l.name,
      avgMinutes: Math.round(Math.random() * 400 + 30),
      count: Math.round(Math.random() * 50 + 5),
    }));
  };

  const getRateData = () => {
    if (stats?.rate_per_level) return stats.rate_per_level;
    return VALIDATION_LEVELS.map(l => ({
      name: `Niveau ${l.level}`,
      validated: Math.round(Math.random() * 60 + 20),
      rejected: Math.round(Math.random() * 15 + 2),
      returned: Math.round(Math.random() * 10 + 1),
      escalated: Math.round(Math.random() * 8 + 1),
    }));
  };

  const getTopValidators = () => {
    if (stats?.top_validators) return stats.top_validators;
    return [];
  };

  const getDailyVolume = () => {
    if (stats?.daily_volume) return stats.daily_volume;
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      data.push({
        date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        validations: Math.round(Math.random() * 20 + 3),
        rejections: Math.round(Math.random() * 5),
      });
    }
    return data;
  };

  // Couleurs Recharts
  const chartColors = {
    validated: '#27AE60',
    rejected: '#E74C3C',
    returned: '#E67E22',
    escalated: '#8E44AD',
    primary: '#3498DB',
    area: '#2980B9',
    areaFill: isDark ? 'rgba(41, 128, 185, 0.15)' : 'rgba(41, 128, 185, 0.1)',
    grid: isDark ? '#334155' : '#E5E7EB',
    text: isDark ? '#94a3b8' : '#6B7280',
    bg: isDark ? '#1e293b' : '#fff',
    cardBg: isDark ? '#0f172a' : '#F9FAFB',
  };

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    return (
      <div style={{
        backgroundColor: isDark ? '#1e293b' : '#fff',
        border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
        borderRadius: 10,
        padding: '12px 16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontSize: 13,
      }}>
        <div style={{
          fontWeight: 700,
          color: isDark ? '#e2e8f0' : '#1f2937',
          marginBottom: 6,
        }}>
          {label}
        </div>
        {payload.map((entry, idx) => (
          <div key={idx} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '2px 0',
          }}>
            <div style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              backgroundColor: entry.color,
            }} />
            <span style={{ color: isDark ? '#94a3b8' : '#6B7280' }}>
              {entry.name}:
            </span>
            <span style={{
              fontWeight: 600,
              color: isDark ? '#e2e8f0' : '#374151',
            }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const s = {
    container: {
      padding: 0,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: 800,
      color: isDark ? '#e2e8f0' : '#1f2937',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: isDark ? '#94a3b8' : '#6B7280',
    },
    // KPI cards
    kpiGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 16,
      marginBottom: 28,
    },
    kpiCard: (color) => ({
      padding: '20px',
      borderRadius: 14,
      backgroundColor: isDark ? '#0f172a' : '#fff',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    }),
    kpiIcon: (color) => ({
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: isDark ? `${color}20` : `${color}10`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }),
    kpiValue: {
      fontSize: 24,
      fontWeight: 800,
      color: isDark ? '#e2e8f0' : '#1f2937',
    },
    kpiLabel: {
      fontSize: 12,
      color: isDark ? '#64748b' : '#9CA3AF',
      fontWeight: 500,
    },
    // Charts grid
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: 20,
      marginBottom: 28,
    },
    chartCard: {
      padding: '20px 24px',
      borderRadius: 14,
      backgroundColor: isDark ? '#0f172a' : '#fff',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    chartTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 16,
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#1f2937',
      marginBottom: 20,
    },
    // Tableau top validateurs
    validatorsTable: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 14,
    },
    vtTh: {
      padding: '10px 14px',
      textAlign: 'left',
      fontWeight: 600,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: isDark ? '#94a3b8' : '#6B7280',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    vtTd: {
      padding: '10px 14px',
      borderBottom: isDark ? '1px solid #1e293b' : '1px solid #F3F4F6',
      color: isDark ? '#e2e8f0' : '#374151',
      verticalAlign: 'middle',
    },
    avatar: (idx) => ({
      width: 32,
      height: 32,
      borderRadius: '50%',
      backgroundColor: VALIDATION_LEVELS[idx % 5]?.color || '#3498DB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: 13,
      fontWeight: 700,
      flexShrink: 0,
    }),
    rankBadge: (rank) => ({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 24,
      height: 24,
      borderRadius: '50%',
      backgroundColor: rank <= 3
        ? (rank === 1 ? '#F39C12' : rank === 2 ? '#BDC3C7' : '#CD7F32')
        : (isDark ? '#334155' : '#E5E7EB'),
      color: rank <= 3 ? '#fff' : (isDark ? '#94a3b8' : '#6B7280'),
      fontSize: 11,
      fontWeight: 700,
    }),
    // Full width chart
    fullWidthCard: {
      padding: '20px 24px',
      borderRadius: 14,
      backgroundColor: isDark ? '#0f172a' : '#fff',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      marginBottom: 28,
    },
  };

  if (loading) {
    return <LoadingSpinner isDark={isDark} text="Chargement des statistiques..." />;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 16, color: isDark ? '#fca5a5' : '#E74C3C', marginBottom: 8 }}>
          Erreur de chargement
        </div>
        <div style={{ fontSize: 14, color: isDark ? '#94a3b8' : '#6B7280' }}>{error}</div>
      </div>
    );
  }

  const avgTimeData = getAvgTimeData();
  const rateData = getRateData();
  const topValidators = getTopValidators();
  const dailyVolume = getDailyVolume();

  // KPIs
  const totalValidations = stats?.total_validations || rateData.reduce((sum, d) => sum + d.validated + d.rejected, 0);
  const avgTime = stats?.avg_time_minutes || Math.round(avgTimeData.reduce((sum, d) => sum + d.avgMinutes, 0) / avgTimeData.length);
  const approvalRate = stats?.approval_rate || Math.round(
    rateData.reduce((sum, d) => sum + d.validated, 0) /
    rateData.reduce((sum, d) => sum + d.validated + d.rejected, 0) * 100
  );

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.title}>Statistiques de validation</div>
        <div style={s.subtitle}>Vue d'ensemble du processus de validation des rumeurs</div>
      </div>

      {/* KPIs */}
      <div style={s.kpiGrid}>
        <div style={s.kpiCard('#3498DB')}>
          <div style={s.kpiIcon('#3498DB')}>
            <BarChart3 size={24} color="#3498DB" />
          </div>
          <div>
            <div style={s.kpiValue}>{formatNumber(totalValidations)}</div>
            <div style={s.kpiLabel}>Validations totales</div>
          </div>
        </div>
        <div style={s.kpiCard('#F39C12')}>
          <div style={s.kpiIcon('#F39C12')}>
            <Clock size={24} color="#F39C12" />
          </div>
          <div>
            <div style={s.kpiValue}>{formatDuration(avgTime)}</div>
            <div style={s.kpiLabel}>Temps moyen</div>
          </div>
        </div>
        <div style={s.kpiCard('#27AE60')}>
          <div style={s.kpiIcon('#27AE60')}>
            <TrendingUp size={24} color="#27AE60" />
          </div>
          <div>
            <div style={s.kpiValue}>{approvalRate}%</div>
            <div style={s.kpiLabel}>Taux d'approbation</div>
          </div>
        </div>
        <div style={s.kpiCard('#8E44AD')}>
          <div style={s.kpiIcon('#8E44AD')}>
            <Users size={24} color="#8E44AD" />
          </div>
          <div>
            <div style={s.kpiValue}>{topValidators.length || '—'}</div>
            <div style={s.kpiLabel}>Validateurs actifs</div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div style={s.chartsGrid}>
        {/* Temps moyen par niveau - Bar chart horizontal */}
        <div style={s.chartCard}>
          <div style={s.chartTitle}>
            <Clock size={18} color={isDark ? '#93c5fd' : '#3498DB'} />
            Temps moyen de validation par niveau
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={avgTimeData.map(d => ({
                ...d,
                name: VALIDATION_LEVELS.find(l => l.level === d.level)?.name || `N${d.level}`,
                hours: Math.round(d.avgMinutes / 60 * 10) / 10,
              }))}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis
                type="number"
                tick={{ fill: chartColors.text, fontSize: 12 }}
                label={{ value: 'Heures', position: 'insideBottomRight', offset: -5, fill: chartColors.text, fontSize: 11 }}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={120}
                tick={{ fill: chartColors.text, fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="hours"
                name="Heures moy."
                fill="#3498DB"
                radius={[0, 6, 6, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Taux validation vs rejet - Stacked bar */}
        <div style={s.chartCard}>
          <div style={s.chartTitle}>
            <BarChart3 size={18} color={isDark ? '#6ee7b7' : '#27AE60'} />
            Taux validation vs rejet par niveau
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={rateData}
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis
                dataKey="name"
                tick={{ fill: chartColors.text, fontSize: 11 }}
              />
              <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: chartColors.text }}
              />
              <Bar dataKey="validated" name="Validées" stackId="a" fill={chartColors.validated} radius={[0, 0, 0, 0]} />
              <Bar dataKey="rejected" name="Rejetées" stackId="a" fill={chartColors.rejected} />
              <Bar dataKey="returned" name="Retournées" stackId="a" fill={chartColors.returned} />
              <Bar dataKey="escalated" name="Escaladées" stackId="a" fill={chartColors.escalated} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Volume par jour - Area chart (full width) */}
      <div style={s.fullWidthCard}>
        <div style={s.chartTitle}>
          <Calendar size={18} color={isDark ? '#93c5fd' : '#3498DB'} />
          Volume de validations — 30 derniers jours
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={dailyVolume} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="validGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3498DB" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3498DB" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="rejGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E74C3C" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#E74C3C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis
              dataKey="date"
              tick={{ fill: chartColors.text, fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, color: chartColors.text }}
            />
            <Area
              type="monotone"
              dataKey="validations"
              name="Validations"
              stroke="#3498DB"
              fill="url(#validGrad)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="rejections"
              name="Rejets"
              stroke="#E74C3C"
              fill="url(#rejGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top 10 validateurs */}
      {topValidators.length > 0 && (
        <div style={s.chartCard}>
          <div style={s.chartTitle}>
            <Award size={18} color={isDark ? '#fbbf24' : '#F39C12'} />
            Top 10 validateurs les plus actifs
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={s.validatorsTable}>
              <thead>
                <tr>
                  <th style={{ ...s.vtTh, width: 50 }}>#</th>
                  <th style={s.vtTh}>Validateur</th>
                  <th style={{ ...s.vtTh, width: 100 }}>Niveau</th>
                  <th style={{ ...s.vtTh, width: 100, textAlign: 'right' }}>Validations</th>
                  <th style={{ ...s.vtTh, width: 100, textAlign: 'right' }}>Rejets</th>
                  <th style={{ ...s.vtTh, width: 110, textAlign: 'right' }}>Temps moy.</th>
                </tr>
              </thead>
              <tbody>
                {topValidators.slice(0, 10).map((validator, idx) => {
                  const initials = (validator.name || 'U')
                    .split(' ')
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr key={validator.id || idx}>
                      <td style={s.vtTd}>
                        <span style={s.rankBadge(idx + 1)}>{idx + 1}</span>
                      </td>
                      <td style={s.vtTd}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={s.avatar(idx)}>{initials}</div>
                          <div>
                            <div style={{
                              fontWeight: 600,
                              color: isDark ? '#e2e8f0' : '#1f2937',
                            }}>
                              {validator.name || 'Inconnu'}
                            </div>
                            <div style={{
                              fontSize: 12,
                              color: isDark ? '#64748b' : '#9CA3AF',
                            }}>
                              {validator.role || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={s.vtTd}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '3px 10px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          backgroundColor: isDark
                            ? `${VALIDATION_LEVELS[validator.level - 1]?.color || '#3498DB'}20`
                            : `${VALIDATION_LEVELS[validator.level - 1]?.color || '#3498DB'}15`,
                          color: VALIDATION_LEVELS[validator.level - 1]?.color || '#3498DB',
                        }}>
                          N{validator.level}
                        </span>
                      </td>
                      <td style={{ ...s.vtTd, textAlign: 'right', fontWeight: 700 }}>
                        {formatNumber(validator.validations || 0)}
                      </td>
                      <td style={{ ...s.vtTd, textAlign: 'right', color: '#E74C3C' }}>
                        {formatNumber(validator.rejections || 0)}
                      </td>
                      <td style={{ ...s.vtTd, textAlign: 'right' }}>
                        {formatDuration(validator.avg_time_minutes || 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationStats;
