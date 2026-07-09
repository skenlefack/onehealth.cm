import React from 'react';
import { Radio } from 'lucide-react';

const RealtimeIndicator = ({ count, isDark }) => {
  const s = {
    container: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 16px',
      borderRadius: 12,
      backgroundColor: isDark ? '#064e3b' : '#ecfdf5',
      border: isDark ? '1px solid #065f46' : '1px solid #a7f3d0',
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      backgroundColor: '#10B981',
      animation: 'pulse-dot 1.5s ease-in-out infinite',
    },
    count: {
      fontSize: 20,
      fontWeight: 700,
      color: isDark ? '#34d399' : '#059669',
    },
    label: {
      fontSize: 13,
      color: isDark ? '#6ee7b7' : '#047857',
    },
  };

  return (
    <>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
      <div style={s.container}>
        <div style={s.dot} />
        <Radio size={16} color={isDark ? '#34d399' : '#059669'} />
        <span style={s.count}>{count ?? 0}</span>
        <span style={s.label}>visiteur{(count ?? 0) !== 1 ? 's' : ''} en ligne</span>
      </div>
    </>
  );
};

export default RealtimeIndicator;
