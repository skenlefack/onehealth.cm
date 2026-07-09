import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Smartphone } from 'lucide-react';

const DEVICE_COLORS = {
  desktop: '#3B82F6',
  mobile: '#8B5CF6',
  tablet: '#F59E0B',
  unknown: '#94A3B8',
};

const DEVICE_LABELS = {
  desktop: 'Desktop',
  mobile: 'Mobile',
  tablet: 'Tablette',
  unknown: 'Autre',
};

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

const DevicesChart = ({ data, isDark }) => {
  const total = (data || []).reduce((s, d) => s + d.visitors, 0);
  const chartData = (data || []).map((d) => ({
    name: DEVICE_LABELS[d.device] || d.device,
    value: d.visitors,
    fill: DEVICE_COLORS[d.device] || '#94A3B8',
    total,
  }));

  return (
    <div style={{
      padding: '20px', borderRadius: 16,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Smartphone size={18} color="#8B5CF6" />
        <span style={{ fontSize: 16, fontWeight: 600, color: isDark ? '#f1f5f9' : '#1f2937' }}>Appareils</span>
      </div>
      {chartData.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', color: isDark ? '#64748b' : '#9CA3AF', fontSize: 13 }}>Aucune donnée</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
              {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Pie>
            <Tooltip content={<CustomTooltip isDark={isDark} />} />
            <Legend iconType="circle" iconSize={8}
              formatter={(value) => <span style={{ fontSize: 12, color: isDark ? '#CBD5E1' : '#4B5563' }}>{value}</span>} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default DevicesChart;
