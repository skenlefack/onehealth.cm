import React, { useState } from 'react';
import { FileText } from 'lucide-react';

const formatDuration = (s) => {
  if (!s) return '0:00';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
};

const TopPagesTable = ({ data, isDark }) => {
  const [hoveredRow, setHoveredRow] = useState(null);
  const maxViews = data && data.length > 0 ? data[0].views : 1;

  const s = {
    container: {
      padding: '20px',
      borderRadius: 16,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    title: { fontSize: 16, fontWeight: 600, color: isDark ? '#f1f5f9' : '#1f2937' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
      textAlign: 'left',
      padding: '8px 12px',
      fontSize: 12,
      fontWeight: 600,
      color: isDark ? '#64748b' : '#9CA3AF',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    td: (isHovered) => ({
      padding: '10px 12px',
      fontSize: 13,
      color: isDark ? '#e2e8f0' : '#1f2937',
      borderBottom: isDark ? '1px solid #1e293b' : '1px solid #F3F4F6',
      backgroundColor: isHovered ? (isDark ? '#334155' : '#F9FAFB') : 'transparent',
      transition: 'background-color 0.1s',
    }),
    bar: (width) => ({
      height: 4,
      borderRadius: 2,
      backgroundColor: '#8B5CF620',
      marginTop: 4,
      position: 'relative',
      overflow: 'hidden',
    }),
    barFill: (width) => ({
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
      width: `${width}%`,
      borderRadius: 2,
      backgroundColor: '#8B5CF6',
    }),
    url: {
      maxWidth: 300,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <FileText size={18} color="#8B5CF6" />
        <span style={s.title}>Pages les plus visitées</span>
      </div>
      {!data || data.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', color: isDark ? '#64748b' : '#9CA3AF', fontSize: 13 }}>
          Aucune donnée
        </div>
      ) : (
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Page</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Vues</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Visiteurs</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Durée moy.</th>
              </tr>
            </thead>
            <tbody>
              {data.map((page, i) => (
                <tr key={i} onMouseEnter={() => setHoveredRow(i)} onMouseLeave={() => setHoveredRow(null)}>
                  <td style={s.td(hoveredRow === i)}>
                    <div style={s.url} title={page.url}>{page.url}</div>
                    <div style={s.bar(100)}>
                      <div style={s.barFill(Math.round((page.views / maxViews) * 100))} />
                    </div>
                  </td>
                  <td style={{ ...s.td(hoveredRow === i), textAlign: 'right', fontWeight: 600 }}>{page.views.toLocaleString()}</td>
                  <td style={{ ...s.td(hoveredRow === i), textAlign: 'right' }}>{page.visitors.toLocaleString()}</td>
                  <td style={{ ...s.td(hoveredRow === i), textAlign: 'right' }}>{formatDuration(page.avg_duration)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TopPagesTable;
