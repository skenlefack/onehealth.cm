/**
 * RumorCard - Carte de rumeur réutilisable (kanban, carte, grille)
 */

import React, { useState } from 'react';
import { MapPin, Clock, AlertTriangle, Users, Eye } from 'lucide-react';
import { StatusBadge, PriorityBadge, RiskBadge, SourceBadge } from '../shared';
import { formatRelativeDate, truncateText, formatLocation } from '../../utils/formatters';
import { COHRM_COLORS } from '../../utils/constants';

const RumorCard = ({
  rumor,
  onClick,
  isDark = false,
  compact = false,
  draggable = false,
  onDragStart,
  onDragEnd,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const s = {
    card: {
      padding: compact ? '12px' : '16px',
      borderRadius: 12,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark
        ? `1px solid ${isHovered ? '#475569' : '#334155'}`
        : `1px solid ${isHovered ? '#D1D5DB' : '#E5E7EB'}`,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s',
      boxShadow: isHovered
        ? (isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)')
        : (isDark ? '0 1px 4px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.04)'),
      transform: isHovered ? 'translateY(-1px)' : 'none',
      ...(draggable ? { userSelect: 'none' } : {}),
    },
    header: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 8,
      marginBottom: 8,
    },
    code: {
      fontSize: 11,
      fontWeight: 600,
      color: COHRM_COLORS.primary,
      opacity: 0.8,
      letterSpacing: '0.3px',
    },
    title: {
      fontSize: compact ? 13 : 14,
      fontWeight: 600,
      color: isDark ? '#e2e8f0' : '#1f2937',
      lineHeight: 1.4,
      marginBottom: 8,
    },
    badges: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 4,
      marginBottom: 8,
    },
    meta: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: compact ? 8 : 12,
      fontSize: 12,
      color: isDark ? '#94a3b8' : '#6B7280',
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    },
    footer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
      paddingTop: 8,
      borderTop: isDark ? '1px solid #334155' : '1px solid #F3F4F6',
    },
    viewBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 12,
      fontWeight: 500,
      color: COHRM_COLORS.primaryLight,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '2px 6px',
      borderRadius: 4,
    },
  };

  return (
    <div
      style={s.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick && onClick(rumor)}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {/* Code rumeur */}
      {rumor.code && <div style={s.code}>{rumor.code}</div>}

      {/* Titre */}
      <div style={s.title}>
        {truncateText(rumor.title, compact ? 40 : 60)}
      </div>

      {/* Badges */}
      <div style={s.badges}>
        <PriorityBadge priority={rumor.priority} size="sm" />
        <RiskBadge riskLevel={rumor.risk_level} size="sm" />
        {!compact && <SourceBadge source={rumor.source} size="sm" />}
      </div>

      {/* Méta-infos */}
      <div style={s.meta}>
        {rumor.region && (
          <span style={s.metaItem}>
            <MapPin size={12} />
            {rumor.region}
          </span>
        )}
        <span style={s.metaItem}>
          <Clock size={12} />
          {formatRelativeDate(rumor.created_at)}
        </span>
        {rumor.affected_count > 0 && (
          <span style={s.metaItem}>
            <Users size={12} />
            {rumor.affected_count} cas
          </span>
        )}
      </div>

      {/* Footer */}
      {!compact && (
        <div style={s.footer}>
          <StatusBadge status={rumor.status} size="sm" />
          <button
            style={s.viewBtn}
            onClick={(e) => {
              e.stopPropagation();
              onClick && onClick(rumor);
            }}
          >
            <Eye size={12} />
            Voir
          </button>
        </div>
      )}
    </div>
  );
};

export default RumorCard;
