import React, { useState } from 'react';
import { Target } from 'lucide-react';

const UtmTable = ({ data, isDark }) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const s = {
    container: {
      padding: '20px', borderRadius: 16,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    header: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 },
    title: { fontSize: 16, fontWeight: 600, color: isDark ? '#f1f5f9' : '#1f2937' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
      textAlign: 'left', padding: '8px 12px', fontSize: 12, fontWeight: 600,
      color: isDark ? '#64748b' : '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    td: (isHovered) => ({
      padding: '10px 12px', fontSize: 13, color: isDark ? '#e2e8f0' : '#1f2937',
      borderBottom: isDark ? '1px solid #1e293b' : '1px solid #F3F4F6',
      backgroundColor: isHovered ? (isDark ? '#334155' : '#F9FAFB') : 'transparent',
      transition: 'background-color 0.1s',
    }),
    badge: (color) => ({
      display: 'inline-block', padding: '2px 8px', borderRadius: 6,
      fontSize: 11, fontWeight: 600, backgroundColor: `${color}20`, color,
    }),
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <Target size={18} color="#F59E0B" />
        <span style={s.title}>Campagnes UTM</span>
      </div>
      {!data || data.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', color: isDark ? '#64748b' : '#9CA3AF', fontSize: 13 }}>
          Aucune campagne trackée
        </div>
      ) : (
        <div style={{ maxHeight: 350, overflowY: 'auto' }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Source</th>
                <th style={s.th}>Medium</th>
                <th style={s.th}>Campagne</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Sessions</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Pages vues</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} onMouseEnter={() => setHoveredRow(i)} onMouseLeave={() => setHoveredRow(null)}>
                  <td style={s.td(hoveredRow === i)}>
                    <span style={s.badge('#3B82F6')}>{row.source || '-'}</span>
                  </td>
                  <td style={s.td(hoveredRow === i)}>
                    <span style={s.badge('#8B5CF6')}>{row.medium || '-'}</span>
                  </td>
                  <td style={s.td(hoveredRow === i)}>{row.campaign || '-'}</td>
                  <td style={{ ...s.td(hoveredRow === i), textAlign: 'right', fontWeight: 600 }}>{row.sessions}</td>
                  <td style={{ ...s.td(hoveredRow === i), textAlign: 'right' }}>{row.pageviews}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UtmTable;
