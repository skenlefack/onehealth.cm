import React, { useState, useEffect, useRef } from 'react';
import { Users, Eye, Activity, Clock, TrendingDown, TrendingUp } from 'lucide-react';

const useCountUp = (target, duration = 1200) => {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  const prevRef = useRef(0);

  useEffect(() => {
    if (target === null || target === undefined) { setValue(0); return; }
    const startVal = prevRef.current;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(startVal + (target - startVal) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      else prevRef.current = target;
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return value;
};

const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const KpiCard = ({ label, value, icon: Icon, color, change, isDark, formatFn }) => {
  const animatedValue = useCountUp(value);
  const isPositive = change > 0;
  const changeColor = isPositive ? '#10B981' : change < 0 ? '#EF4444' : (isDark ? '#94a3b8' : '#6B7280');

  const s = {
    card: {
      padding: '20px',
      borderRadius: 16,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      transition: 'all 0.2s',
    },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: `${color}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    value: {
      fontSize: 24,
      fontWeight: 700,
      color: isDark ? '#f1f5f9' : '#1f2937',
      lineHeight: 1.2,
    },
    label: {
      fontSize: 13,
      color: isDark ? '#94a3b8' : '#6B7280',
      marginTop: 2,
    },
    change: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      fontSize: 12,
      fontWeight: 600,
      color: changeColor,
      marginTop: 4,
    },
  };

  return (
    <div style={s.card}>
      <div style={s.iconWrap}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={s.value}>{formatFn ? formatFn(animatedValue) : animatedValue.toLocaleString()}</div>
        <div style={s.label}>{label}</div>
        {change !== undefined && change !== null && (
          <div style={s.change}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isPositive ? '+' : ''}{change}%
          </div>
        )}
      </div>
    </div>
  );
};

const KpiCards = ({ kpis, changes, isDark }) => {
  if (!kpis) return null;

  const cards = [
    { label: 'Visiteurs', value: kpis.visitors, icon: Users, color: '#3B82F6', change: changes?.visitors },
    { label: 'Pages vues', value: kpis.pageviews, icon: Eye, color: '#10B981', change: changes?.pageviews },
    { label: 'Sessions', value: kpis.sessions, icon: Activity, color: '#8B5CF6', change: changes?.sessions },
    { label: 'Durée moyenne', value: kpis.avgDuration, icon: Clock, color: '#F59E0B', change: changes?.avgDuration, formatFn: formatDuration },
    { label: 'Taux de rebond', value: kpis.bounceRate, icon: TrendingDown, color: '#EF4444', change: changes?.bounceRate, formatFn: (v) => `${v}%` },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} isDark={isDark} />
      ))}
    </div>
  );
};

export default KpiCards;
