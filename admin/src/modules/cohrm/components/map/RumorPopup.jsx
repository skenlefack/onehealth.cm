/**
 * RumorPopup - Contenu popup réutilisable pour les marqueurs de rumeurs
 */

import React from 'react';
import { STATUS_OPTIONS, PRIORITY_OPTIONS, RISK_LEVELS, COHRM_COLORS } from '../../utils/constants';

const RumorPopup = ({ rumor, isDark, onDetailClick }) => {
  const status = STATUS_OPTIONS.find(s => s.value === rumor.status);
  const priority = PRIORITY_OPTIONS.find(p => p.value === rumor.priority);
  const risk = RISK_LEVELS.find(r => r.value === rumor.risk_level);

  const s = {
    container: {
      minWidth: 260,
      maxWidth: 320,
      fontFamily: "'Inter', sans-serif",
    },
    title: {
      fontSize: 14,
      fontWeight: 700,
      color: '#1f2937',
      marginBottom: 8,
      lineHeight: 1.3,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    badges: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 4,
      marginBottom: 8,
    },
    badge: (color, bgColor) => ({
      padding: '2px 8px',
      borderRadius: 10,
      fontSize: 11,
      fontWeight: 600,
      color: color,
      backgroundColor: bgColor,
      whiteSpace: 'nowrap',
    }),
    row: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 12,
      color: '#6B7280',
      marginBottom: 3,
    },
    label: {
      fontWeight: 500,
      color: '#374151',
    },
    btn: {
      marginTop: 8,
      width: '100%',
      padding: '6px 12px',
      borderRadius: 8,
      border: 'none',
      backgroundColor: COHRM_COLORS.primary,
      color: '#fff',
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
      textAlign: 'center',
    },
  };

  return (
    <div style={s.container}>
      <div style={s.title}>{rumor.title || 'Rumeur sans titre'}</div>

      <div style={s.badges}>
        {status && (
          <span style={s.badge(status.color, status.bgColor)}>{status.label}</span>
        )}
        {priority && (
          <span style={s.badge(priority.color, priority.bgColor)}>{priority.label}</span>
        )}
        {risk && risk.value !== 'unknown' && (
          <span style={s.badge(risk.color, risk.bgColor)}>{risk.label}</span>
        )}
      </div>

      {rumor.source && (
        <div style={s.row}>
          <span style={s.label}>Source</span>
          <span>{rumor.source}</span>
        </div>
      )}
      {rumor.species && (
        <div style={s.row}>
          <span style={s.label}>Espèce</span>
          <span>{rumor.species}</span>
        </div>
      )}
      {rumor.region && (
        <div style={s.row}>
          <span style={s.label}>Région</span>
          <span>{rumor.region}</span>
        </div>
      )}
      {rumor.created_at && (
        <div style={s.row}>
          <span style={s.label}>Date</span>
          <span>{new Date(rumor.created_at).toLocaleDateString('fr-FR')}</span>
        </div>
      )}

      {onDetailClick && (
        <button
          style={s.btn}
          onClick={(e) => { e.stopPropagation(); onDetailClick(rumor); }}
        >
          Voir le détail
        </button>
      )}
    </div>
  );
};

export default RumorPopup;
