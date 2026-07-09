import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Monitor } from 'lucide-react';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#14B8A6', '#6366F1'];

const CustomTooltip = ({ active, payload, isDark }) => {
  if (!active || !payload?.length) return null;
  const total = payload[0].payload?.total || 1;
  return (
    <div style={{
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #475569' : '1px solid #E5E7EB',
      borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#f1f5f9' : '#1f2937' }}>
        {payload[0].name}: {payload[0].value} ({Math.round((payload[0].value / total) * 100)}%)
      </div>
    </div>
  );
};

const OsChart = ({ data, isDark }) => {
  const total = (data || []).reduce((s, d) => s + d.visitors, 0);
  const chartData = (data || []).slice(0, 8).map((d) => ({ name: d.os, value: d.visitors, total }));

  return (
    <div style={{
      padding: '20px', borderRadius: 16,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Monitor size={18} color="#10B981" />
        <span style={{ fontSize: 16, fontWeight: 600, color: isDark ? '#f1f5f9' : '#1f2937' }}>Systèmes d'exploitation</span>
      </div>
      {chartData.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', color: isDark ? '#64748b' : '#9CA3AF', fontSize: 13 }}>Aucune donnée</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" outerRadius={75} dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={{ stroke: isDark ? '#64748b' : '#9CA3AF' }}
              fontSize={11}>
              {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip content={<CustomTooltip isDark={isDark} />} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default OsChart;
