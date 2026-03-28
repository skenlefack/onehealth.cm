/**
 * PriorityBadge - Badge coloré pour les priorités
 */

import React from 'react';
import { formatPriority } from '../../utils/formatters';

const PriorityBadge = ({ priority, size = 'md' }) => {
  const info = formatPriority(priority);

  const sizes = {
    sm: { fontSize: 11, padding: '2px 8px' },
    md: { fontSize: 12, padding: '4px 10px' },
    lg: { fontSize: 14, padding: '6px 14px' },
  };

  const s = sizes[size] || sizes.md;
  const isCritical = priority === 'critical';

  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: s.padding,
    borderRadius: 20,
    fontSize: s.fontSize,
    fontWeight: 600,
    color: info.color,
    backgroundColor: info.bgColor,
    border: `1px solid ${info.color}20`,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    animation: isCritical ? 'cohrmPulse 2s ease-in-out infinite' : 'none',
  };

  return (
    <>
      {isCritical && (
        <style>{`
          @keyframes cohrmPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}</style>
      )}
      <span style={style}>
        {isCritical && (
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: info.color,
            display: 'inline-block',
          }} />
        )}
        {info.label}
      </span>
    </>
  );
};

export default PriorityBadge;
