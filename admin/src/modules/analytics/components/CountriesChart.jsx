import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MapPin } from 'lucide-react';

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#6366F1', '#F97316', '#06B6D4'];

const CustomTooltip = ({ active, payload, isDark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #475569' : '1px solid #E5E7EB',
      borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#f1f5f9' : '#1f2937' }}>
        {payload[0].payload.country}: {payload[0].value} visiteurs
      </div>
    </div>
  );
};

const CountriesChart = ({ data, isDark }) => {
  const chartData = (data || []).slice(0, 10);

  return (
    <div style={{
      padding: '20px', borderRadius: 16,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <MapPin size={18} color="#EF4444" />
        <span style={{ fontSize: 16, fontWeight: 600, color: isDark ? '#f1f5f9' : '#1f2937' }}>Pays</span>
      </div>
      {chartData.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', color: isDark ? '#64748b' : '#9CA3AF', fontSize: 13 }}>Aucune donnée</div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 36)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#F3F4F6'} horizontal={false} />
            <XAxis type="number" fontSize={12} tick={{ fill: isDark ? '#94a3b8' : '#6B7280' }} allowDecimals={false} />
            <YAxis type="category" dataKey="country" fontSize={12} width={50} tick={{ fill: isDark ? '#94a3b8' : '#6B7280' }} />
            <Tooltip content={<CustomTooltip isDark={isDark} />} />
            <Bar dataKey="visitors" name="Visiteurs" radius={[0, 6, 6, 0]} barSize={20}>
              {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CountriesChart;
