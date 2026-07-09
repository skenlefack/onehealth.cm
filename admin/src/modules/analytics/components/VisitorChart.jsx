import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #475569' : '1px solid #E5E7EB',
      borderRadius: 10,
      padding: '10px 14px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }}>
      <div style={{ fontSize: 12, marginBottom: 6, color: isDark ? '#94a3b8' : '#6B7280' }}>{label}</div>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color }} />
          <span style={{ fontWeight: 600, color: isDark ? '#f1f5f9' : '#1f2937' }}>{entry.value}</span>
          <span style={{ color: isDark ? '#94a3b8' : '#6B7280' }}>{entry.name}</span>
        </div>
      ))}
    </div>
  );
};

const VisitorChart = ({ data, isDark }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: isDark ? '#64748b' : '#9CA3AF' }}>
        Aucune donnée pour cette période
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      borderRadius: 16,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: isDark ? '#f1f5f9' : '#1f2937', marginBottom: 16 }}>
        Visiteurs & Pages vues
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="gradVisitors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradPageviews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#F3F4F6'} />
          <XAxis
            dataKey="label"
            fontSize={12}
            tick={{ fill: isDark ? '#94a3b8' : '#6B7280' }}
            tickFormatter={(v) => {
              if (v.includes('-') && v.length === 10) return v.slice(5);
              return v;
            }}
          />
          <YAxis fontSize={12} tick={{ fill: isDark ? '#94a3b8' : '#6B7280' }} allowDecimals={false} />
          <Tooltip content={<CustomTooltip isDark={isDark} />} />
          <Area type="monotone" dataKey="visitors" name="Visiteurs" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#gradVisitors)" dot={false} activeDot={{ r: 5, strokeWidth: 2 }} />
          <Area type="monotone" dataKey="pageviews" name="Pages vues" stroke="#3B82F6" strokeWidth={2} fill="url(#gradPageviews)" dot={false} activeDot={{ r: 4, strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VisitorChart;
