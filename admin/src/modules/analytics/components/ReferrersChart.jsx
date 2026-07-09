import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Link2 } from 'lucide-react';

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#6366F1'];

const CustomTooltip = ({ active, payload, isDark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #475569' : '1px solid #E5E7EB',
      borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#f1f5f9' : '#1f2937' }}>
        {payload[0].name}: {payload[0].value}
      </div>
    </div>
  );
};

const shortenUrl = (url) => {
  if (!url || url === 'Direct') return 'Direct';
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url.substring(0, 30);
  }
};

const ReferrersChart = ({ data, isDark }) => {
  const chartData = (data || []).slice(0, 8).map((r) => ({
    name: shortenUrl(r.referrer),
    value: r.views,
    visitors: r.visitors,
  }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  const s = {
    container: {
      padding: '20px',
      borderRadius: 16,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    header: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 },
    title: { fontSize: 16, fontWeight: 600, color: isDark ? '#f1f5f9' : '#1f2937' },
    row: {
      display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
      fontSize: 13, color: isDark ? '#e2e8f0' : '#1f2937',
    },
    dot: (color) => ({ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }),
    pct: { fontSize: 12, color: isDark ? '#64748b' : '#9CA3AF', marginLeft: 'auto' },
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <Link2 size={18} color="#3B82F6" />
        <span style={s.title}>Sources de trafic</span>
      </div>
      {chartData.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', color: isDark ? '#64748b' : '#9CA3AF', fontSize: 13 }}>Aucune donnée</div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 180, height: 180, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={2}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {chartData.map((item, i) => (
              <div key={i} style={s.row}>
                <div style={s.dot(COLORS[i % COLORS.length])} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                <span style={{ fontWeight: 600, marginLeft: 8 }}>{item.value}</span>
                <span style={s.pct}>{total > 0 ? Math.round((item.value / total) * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferrersChart;
