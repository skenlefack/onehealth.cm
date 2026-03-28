/**
 * RiskBadge - Badge de niveau de risque avec icône et tooltip
 * Tailles : sm (inline), md (standard), lg (détail page)
 * Animation pulse pour very_high
 * Tooltip au hover avec description du niveau
 */

import React, { useState, useRef } from 'react';
import { Shield, AlertCircle, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';
import { formatRiskLevel } from '../../utils/formatters';

const RISK_ICONS = {
  unknown: HelpCircle,
  low: Shield,
  moderate: AlertCircle,
  high: AlertTriangle,
  very_high: AlertOctagon,
};

const RISK_DESCRIPTIONS = {
  unknown: 'Aucune évaluation de risque effectuée',
  low: 'Risque faible — surveillance standard',
  moderate: 'Risque modéré — vigilance accrue recommandée',
  high: 'Risque élevé — action prioritaire requise',
  very_high: 'Risque très élevé — action urgente immédiate',
};

const RiskBadge = ({ level, size = 'md', showIcon = true, showTooltip = true }) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const badgeRef = useRef(null);
  const info = formatRiskLevel(level);
  const Icon = RISK_ICONS[level] || HelpCircle;

  const sizes = {
    sm: { fontSize: 11, padding: '2px 8px', iconSize: 12, gap: 4 },
    md: { fontSize: 12, padding: '4px 12px', iconSize: 14, gap: 5 },
    lg: { fontSize: 14, padding: '6px 16px', iconSize: 16, gap: 6 },
  };

  const s = sizes[size] || sizes.md;
  const isVeryHigh = level === 'very_high';

  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: s.gap,
    padding: s.padding,
    borderRadius: 20,
    fontSize: s.fontSize,
    fontWeight: 600,
    color: info.color,
    backgroundColor: info.bgColor,
    border: `1px solid ${info.color}20`,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    animation: isVeryHigh ? 'cohrmRiskPulse 2s ease-in-out infinite' : 'none',
    position: 'relative',
    cursor: showTooltip ? 'help' : 'default',
  };

  const tooltipStyle = {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: 8,
    padding: '8px 12px',
    borderRadius: 8,
    backgroundColor: '#1f2937',
    color: '#f9fafb',
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    zIndex: 9999,
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    pointerEvents: 'none',
    opacity: tooltipVisible ? 1 : 0,
    transition: 'opacity 0.15s ease',
  };

  const arrowStyle = {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '5px solid transparent',
    borderRight: '5px solid transparent',
    borderTop: '5px solid #1f2937',
  };

  return (
    <>
      {isVeryHigh && (
        <style>{`
          @keyframes cohrmRiskPulse {
            0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4); }
            50% { opacity: 0.85; box-shadow: 0 0 0 ${size === 'lg' ? '6px' : '4px'} rgba(231, 76, 60, 0); }
          }
        `}</style>
      )}
      <span
        ref={badgeRef}
        style={style}
        onMouseEnter={() => showTooltip && setTooltipVisible(true)}
        onMouseLeave={() => showTooltip && setTooltipVisible(false)}
      >
        {showTooltip && (
          <span style={tooltipStyle}>
            {RISK_DESCRIPTIONS[level] || RISK_DESCRIPTIONS.unknown}
            <span style={arrowStyle} />
          </span>
        )}
        {showIcon && <Icon size={s.iconSize} />}
        {info.label}
      </span>
    </>
  );
};

export default RiskBadge;
