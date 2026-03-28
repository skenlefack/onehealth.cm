/**
 * MapLegend - Légende dynamique (risques + choroplèthe)
 */

import React from 'react';
import {
  RISK_MARKER_COLORS, RISK_LEVELS,
  CHOROPLETH_PALETTE, COHRM_COLORS,
} from '../../utils/constants';

const MapLegend = ({ isDark, showChoropleth, choroplethMode, setChoroplethMode, showRumors, regionStats }) => {
  const s = {
    container: {
      position: 'absolute',
      bottom: 40,
      left: 12,
      zIndex: 1000,
      backgroundColor: isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)',
      borderRadius: 12,
      padding: '12px 14px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      fontSize: 12,
      color: isDark ? '#e2e8f0' : '#374151',
      fontFamily: "'Inter', sans-serif",
      backdropFilter: 'blur(8px)',
      minWidth: 160,
    },
    title: {
      fontWeight: 700,
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: isDark ? '#94a3b8' : '#6B7280',
      marginBottom: 8,
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    dot: (color) => ({
      width: 12,
      height: 12,
      borderRadius: '50%',
      backgroundColor: color,
      border: '1.5px solid rgba(255,255,255,0.5)',
      flexShrink: 0,
    }),
    bar: (color) => ({
      width: 24,
      height: 12,
      borderRadius: 2,
      backgroundColor: color,
      flexShrink: 0,
    }),
    label: {
      fontSize: 11,
      color: isDark ? '#cbd5e1' : '#4B5563',
    },
    toggle: {
      display: 'flex',
      gap: 4,
      marginBottom: 8,
    },
    toggleBtn: (active) => ({
      padding: '3px 8px',
      borderRadius: 6,
      border: 'none',
      fontSize: 10,
      fontWeight: 600,
      cursor: 'pointer',
      backgroundColor: active
        ? (isDark ? COHRM_COLORS.primary : COHRM_COLORS.primary)
        : (isDark ? '#334155' : '#E5E7EB'),
      color: active ? '#fff' : (isDark ? '#94a3b8' : '#6B7280'),
    }),
    divider: {
      height: 1,
      backgroundColor: isDark ? '#334155' : '#E5E7EB',
      margin: '8px 0',
    },
  };

  return (
    <div style={s.container}>
      {/* Légende Risque marqueurs */}
      {showRumors && (
        <>
          <div style={s.title}>Niveau de risque</div>
          {RISK_LEVELS.filter(r => r.value !== 'unknown').map(risk => (
            <div key={risk.value} style={s.item}>
              <div style={s.dot(RISK_MARKER_COLORS[risk.value])} />
              <span style={s.label}>{risk.label}</span>
            </div>
          ))}
        </>
      )}

      {/* Légende Choroplèthe */}
      {showChoropleth && (
        <>
          {showRumors && <div style={s.divider} />}
          <div style={s.title}>Choroplèthe</div>
          <div style={s.toggle}>
            <button
              style={s.toggleBtn(choroplethMode === 'count')}
              onClick={() => setChoroplethMode('count')}
            >
              Nombre
            </button>
            <button
              style={s.toggleBtn(choroplethMode === 'risk')}
              onClick={() => setChoroplethMode('risk')}
            >
              Risque
            </button>
          </div>
          {(choroplethMode === 'count' ? CHOROPLETH_PALETTE.count : CHOROPLETH_PALETTE.risk)
            .filter((_, i) => i > 0)
            .map((color, i) => (
              <div key={i} style={s.item}>
                <div style={s.bar(color)} />
                <span style={s.label}>
                  {choroplethMode === 'count'
                    ? (i === 0 ? 'Faible' : i < 3 ? 'Moyen' : 'Élevé')
                    : (i === 0 ? 'Faible' : i < 3 ? 'Modéré' : 'Élevé')
                  }
                </span>
              </div>
            ))}
        </>
      )}
    </div>
  );
};

export default MapLegend;
