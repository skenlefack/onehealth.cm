/**
 * RecentRumorsTable - Tableau des 10 dernières rumeurs
 *
 * Affiche un tableau compact des rumeurs récentes avec
 * badges de statut/priorité, source, région et date relative.
 * Clic sur une ligne pour naviguer vers le détail.
 */

import React from 'react';
import { COHRM_COLORS } from '../utils/constants';
import {
  formatStatus,
  formatPriority,
  formatSource,
  formatRelativeDate,
  truncateText,
} from '../utils/formatters';

const RecentRumorsTable = ({ rumors = [], isDark, onRumorClick }) => {
  const s = {
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13,
    },
    th: {
      textAlign: 'left',
      padding: '8px 10px',
      fontSize: 12,
      fontWeight: 600,
      color: isDark ? '#94a3b8' : '#6B7280',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      whiteSpace: 'nowrap',
    },
    td: {
      padding: '10px 10px',
      borderBottom: isDark ? '1px solid #1e293b' : '1px solid #F3F4F6',
      color: isDark ? '#e2e8f0' : '#374151',
      verticalAlign: 'middle',
    },
    row: {
      cursor: 'pointer',
      transition: 'background-color 0.15s',
    },
    badge: (color, bgColor) => ({
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600,
      color: color,
      backgroundColor: bgColor,
      whiteSpace: 'nowrap',
    }),
    title: {
      fontWeight: 600,
      color: isDark ? '#e2e8f0' : '#1f2937',
      maxWidth: 180,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    noData: {
      textAlign: 'center',
      padding: '30px 20px',
      color: isDark ? '#64748b' : '#9CA3AF',
      fontSize: 14,
    },
  };

  if (!rumors.length) {
    return (
      <div style={s.noData}>
        Aucune rumeur récente
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', maxHeight: 310, overflowY: 'auto' }}>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Rumeur</th>
            <th style={s.th}>Statut</th>
            <th style={s.th}>Priorité</th>
            <th style={s.th}>Région</th>
            <th style={s.th}>Date</th>
          </tr>
        </thead>
        <tbody>
          {rumors.slice(0, 10).map((rumor) => {
            const statusInfo = formatStatus(rumor.status);
            const priorityInfo = formatPriority(rumor.priority);

            return (
              <tr
                key={rumor.id}
                style={s.row}
                onClick={() => onRumorClick && onRumorClick(rumor.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark
                    ? 'rgba(51, 65, 85, 0.3)'
                    : 'rgba(59, 130, 246, 0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <td style={s.td}>
                  <div style={s.title}>
                    {truncateText(rumor.title || rumor.description || `#${rumor.id}`, 40)}
                  </div>
                </td>
                <td style={s.td}>
                  <span style={s.badge(statusInfo.color, statusInfo.bgColor)}>
                    {statusInfo.label}
                  </span>
                </td>
                <td style={s.td}>
                  <span style={s.badge(priorityInfo.color, priorityInfo.bgColor)}>
                    {priorityInfo.label}
                  </span>
                </td>
                <td style={{ ...s.td, whiteSpace: 'nowrap', fontSize: 12 }}>
                  {rumor.region || '—'}
                </td>
                <td style={{ ...s.td, whiteSpace: 'nowrap', fontSize: 12, color: isDark ? '#94a3b8' : '#6B7280' }}>
                  {formatRelativeDate(rumor.created_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RecentRumorsTable;
