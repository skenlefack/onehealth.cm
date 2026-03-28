/**
 * StatusBadge - Badge coloré pour les statuts de rumeurs
 */

import React from 'react';
import { Bell, Search, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { formatStatus } from '../../utils/formatters';

const STATUS_ICONS = {
  pending: Bell,
  investigating: Search,
  confirmed: AlertTriangle,
  false_alarm: XCircle,
  closed: CheckCircle,
};

const StatusBadge = ({ status, size = 'md', showIcon = true }) => {
  const info = formatStatus(status);
  const Icon = STATUS_ICONS[status];

  const sizes = {
    sm: { fontSize: 11, padding: '2px 8px', iconSize: 12, gap: 4 },
    md: { fontSize: 12, padding: '4px 12px', iconSize: 14, gap: 5 },
    lg: { fontSize: 14, padding: '6px 16px', iconSize: 16, gap: 6 },
  };

  const s = sizes[size] || sizes.md;

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
  };

  return (
    <span style={style}>
      {showIcon && Icon && <Icon size={s.iconSize} />}
      {info.label}
    </span>
  );
};

export default StatusBadge;
