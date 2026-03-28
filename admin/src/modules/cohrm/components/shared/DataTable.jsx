/**
 * DataTable - Tableau réutilisable avec tri, pagination et sélection
 */

import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

/**
 * @param {object} props
 * @param {Array} props.columns - Définition des colonnes [{ key, label, width, sortable, render }]
 * @param {Array} props.data - Données à afficher
 * @param {boolean} props.loading - État de chargement
 * @param {object} props.pagination - { page, limit, total, pages }
 * @param {function} props.onPageChange - Callback changement de page
 * @param {function} props.onRowClick - Callback clic sur une ligne
 * @param {boolean} props.selectable - Active la sélection de lignes
 * @param {Array} props.selectedIds - IDs des lignes sélectionnées
 * @param {function} props.onSelectionChange - Callback changement de sélection
 * @param {boolean} props.isDark - Mode sombre
 * @param {string} props.emptyMessage - Message quand le tableau est vide
 */
const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  pagination,
  onPageChange,
  onRowClick,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  isDark = false,
  emptyMessage,
}) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [hoveredRow, setHoveredRow] = useState(null);

  // Tri local des données
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleSelectAll = (e) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      onSelectionChange(data.map(row => row.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(sid => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  // Styles
  const s = {
    wrapper: {
      borderRadius: 12,
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      overflow: 'hidden',
      backgroundColor: isDark ? '#1e293b' : '#fff',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 14,
    },
    th: {
      padding: '12px 16px',
      textAlign: 'left',
      fontWeight: 600,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: isDark ? '#94a3b8' : '#6B7280',
      backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      whiteSpace: 'nowrap',
      userSelect: 'none',
    },
    thSortable: {
      cursor: 'pointer',
    },
    td: {
      padding: '12px 16px',
      borderBottom: isDark ? '1px solid #1e293b' : '1px solid #F3F4F6',
      color: isDark ? '#e2e8f0' : '#374151',
      verticalAlign: 'middle',
    },
    tr: (isHovered) => ({
      backgroundColor: isHovered
        ? (isDark ? '#334155' : '#F9FAFB')
        : 'transparent',
      cursor: onRowClick ? 'pointer' : 'default',
      transition: 'background-color 0.15s',
    }),
    checkbox: {
      width: 16,
      height: 16,
      cursor: 'pointer',
      accentColor: '#1B4F72',
    },
    pagination: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderTop: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
      fontSize: 13,
      color: isDark ? '#94a3b8' : '#6B7280',
    },
    pageBtn: (disabled) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
      borderRadius: 6,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: 'transparent',
      color: isDark ? '#e2e8f0' : '#374151',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
    }),
    pageNum: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
      borderRadius: 6,
      border: 'none',
      backgroundColor: isActive ? '#1B4F72' : 'transparent',
      color: isActive ? '#fff' : (isDark ? '#e2e8f0' : '#374151'),
      cursor: 'pointer',
      fontWeight: isActive ? 600 : 400,
      fontSize: 13,
    }),
  };

  if (loading) {
    return (
      <div style={s.wrapper}>
        <LoadingSpinner isDark={isDark} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={s.wrapper}>
        <EmptyState
          variant="empty"
          message={emptyMessage || 'Aucune donnée à afficher'}
          isDark={isDark}
        />
      </div>
    );
  }

  // Générer les numéros de page visibles
  const getPageNumbers = () => {
    if (!pagination) return [];
    const { page, pages } = pagination;
    const range = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(pages, page + 2);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  };

  return (
    <div style={s.wrapper}>
      <div style={{ overflowX: 'auto' }}>
        <table style={s.table}>
          <thead>
            <tr>
              {selectable && (
                <th style={{ ...s.th, width: 40, textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    style={s.checkbox}
                    checked={selectedIds.length === data.length && data.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    ...s.th,
                    ...(col.sortable ? s.thSortable : {}),
                    width: col.width || 'auto',
                  }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc'
                        ? <ChevronUp size={14} />
                        : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <tr
                key={row.id || idx}
                style={s.tr(hoveredRow === idx)}
                onMouseEnter={() => setHoveredRow(idx)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {selectable && (
                  <td style={{ ...s.td, textAlign: 'center', width: 40 }}>
                    <input
                      type="checkbox"
                      style={s.checkbox}
                      checked={selectedIds.includes(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} style={{ ...s.td, width: col.width || 'auto' }}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div style={s.pagination}>
          <span>
            {((pagination.page - 1) * pagination.limit) + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} sur{' '}
            {pagination.total}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              style={s.pageBtn(pagination.page <= 1)}
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            {getPageNumbers().map((num) => (
              <button
                key={num}
                style={s.pageNum(num === pagination.page)}
                onClick={() => onPageChange(num)}
              >
                {num}
              </button>
            ))}
            <button
              style={s.pageBtn(pagination.page >= pagination.pages)}
              disabled={pagination.page >= pagination.pages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
