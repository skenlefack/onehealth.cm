/**
 * FilterBar - Barre de filtres horizontale avec chips actifs
 */

import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown, RotateCcw } from 'lucide-react';
import { STATUS_OPTIONS, PRIORITY_OPTIONS, SOURCE_OPTIONS, REGIONS_CAMEROON } from '../../utils/constants';

/**
 * @param {object} props
 * @param {object} props.filters - Filtres actuels
 * @param {function} props.onFilterChange - Callback modification d'un filtre
 * @param {function} props.onReset - Callback réinitialisation
 * @param {boolean} props.isDark - Mode sombre
 * @param {boolean} props.showSearch - Afficher le champ de recherche (défaut: true)
 * @param {Array} props.visibleFilters - Filtres à afficher ['status', 'priority', 'source', 'region', 'date']
 */
const FilterBar = ({
  filters = {},
  onFilterChange,
  onReset,
  isDark = false,
  showSearch = true,
  visibleFilters = ['status', 'priority', 'source', 'region'],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      onFilterChange({ search: searchValue });
    }
  };

  const handleSearchSubmit = () => {
    onFilterChange({ search: searchValue });
  };

  const handleFilterSelect = (key, value) => {
    onFilterChange({ [key]: value });
  };

  const handleClearFilter = (key) => {
    if (key === 'search') {
      setSearchValue('');
    }
    onFilterChange({ [key]: '' });
  };

  // Compter les filtres actifs
  const activeFilters = Object.entries(filters).filter(
    ([key, val]) => val && val !== '' && key !== 'page' && key !== 'limit'
  );

  // Options de filtres disponibles
  const FILTER_DEFS = {
    status: { label: 'Statut', options: STATUS_OPTIONS.map(s => ({ value: s.value, label: s.label })) },
    priority: { label: 'Priorité', options: PRIORITY_OPTIONS.map(p => ({ value: p.value, label: p.label })) },
    source: { label: 'Source', options: SOURCE_OPTIONS.map(s => ({ value: s.value, label: s.label })) },
    region: { label: 'Région', options: REGIONS_CAMEROON.map(r => ({ value: r.name, label: r.name })) },
  };

  // Styles
  const s = {
    container: {
      marginBottom: 16,
    },
    topRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
    },
    searchWrapper: {
      display: 'flex',
      alignItems: 'center',
      flex: '1 1 300px',
      minWidth: 200,
      position: 'relative',
    },
    searchInput: {
      width: '100%',
      padding: '10px 14px 10px 40px',
      borderRadius: 10,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: isDark ? '#0f172a' : '#fff',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 14,
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    searchIcon: {
      position: 'absolute',
      left: 12,
      color: isDark ? '#64748b' : '#9CA3AF',
      pointerEvents: 'none',
    },
    filterToggle: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '10px 16px',
      borderRadius: 10,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: activeFilters.length > 0
        ? (isDark ? '#1B4F7220' : '#EBF5FB')
        : 'transparent',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 14,
      fontWeight: 500,
      cursor: 'pointer',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 20,
      height: 20,
      borderRadius: '50%',
      backgroundColor: '#1B4F72',
      color: '#fff',
      fontSize: 11,
      fontWeight: 700,
    },
    filtersRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 12,
      padding: '16px',
      borderRadius: 12,
      backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      minWidth: 160,
      flex: '1 1 160px',
    },
    filterLabel: {
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: isDark ? '#94a3b8' : '#6B7280',
    },
    select: {
      padding: '8px 12px',
      borderRadius: 8,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: isDark ? '#1e293b' : '#fff',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 13,
      outline: 'none',
      cursor: 'pointer',
    },
    dateInput: {
      padding: '8px 12px',
      borderRadius: 8,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: isDark ? '#1e293b' : '#fff',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 13,
      outline: 'none',
    },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 8,
    },
    chip: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 10px',
      borderRadius: 16,
      backgroundColor: isDark ? '#1B4F7230' : '#EBF5FB',
      color: isDark ? '#93c5fd' : '#1B4F72',
      fontSize: 12,
      fontWeight: 500,
    },
    chipClose: {
      display: 'flex',
      cursor: 'pointer',
      padding: 0,
      background: 'none',
      border: 'none',
      color: 'inherit',
      opacity: 0.7,
    },
    resetBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 14px',
      borderRadius: 8,
      border: 'none',
      backgroundColor: isDark ? '#334155' : '#E5E7EB',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 13,
      fontWeight: 500,
      cursor: 'pointer',
    },
  };

  // Label lisible pour un filtre actif
  const getFilterLabel = (key, value) => {
    const def = FILTER_DEFS[key];
    if (def) {
      const opt = def.options.find(o => o.value === value);
      return `${def.label}: ${opt?.label || value}`;
    }
    if (key === 'search') return `Recherche: "${value}"`;
    if (key === 'date_from') return `Depuis: ${value}`;
    if (key === 'date_to') return `Jusqu'au: ${value}`;
    return `${key}: ${value}`;
  };

  return (
    <div style={s.container}>
      {/* Ligne du haut : recherche + toggle filtres */}
      <div style={s.topRow}>
        {showSearch && (
          <div style={s.searchWrapper}>
            <Search size={18} style={s.searchIcon} />
            <input
              style={s.searchInput}
              type="text"
              placeholder="Rechercher une rumeur..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearch}
              onBlur={handleSearchSubmit}
            />
          </div>
        )}
        <button
          style={s.filterToggle}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Filter size={16} />
          Filtres
          {activeFilters.length > 0 && (
            <span style={s.badge}>{activeFilters.length}</span>
          )}
          <ChevronDown
            size={14}
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          />
        </button>
        {activeFilters.length > 0 && (
          <button style={s.resetBtn} onClick={onReset}>
            <RotateCcw size={14} />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Chips des filtres actifs */}
      {activeFilters.length > 0 && (
        <div style={s.chips}>
          {activeFilters.map(([key, val]) => (
            <span key={key} style={s.chip}>
              {getFilterLabel(key, val)}
              <button style={s.chipClose} onClick={() => handleClearFilter(key)}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Panneau de filtres détaillé */}
      {isExpanded && (
        <div style={s.filtersRow}>
          {visibleFilters.map((filterKey) => {
            const def = FILTER_DEFS[filterKey];
            if (def) {
              return (
                <div key={filterKey} style={s.filterGroup}>
                  <label style={s.filterLabel}>{def.label}</label>
                  <select
                    style={s.select}
                    value={filters[filterKey] || ''}
                    onChange={(e) => handleFilterSelect(filterKey, e.target.value)}
                  >
                    <option value="">Tous</option>
                    {def.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              );
            }
            if (filterKey === 'date') {
              return (
                <React.Fragment key="date">
                  <div style={s.filterGroup}>
                    <label style={s.filterLabel}>Date début</label>
                    <input
                      type="date"
                      style={s.dateInput}
                      value={filters.date_from || ''}
                      onChange={(e) => handleFilterSelect('date_from', e.target.value)}
                    />
                  </div>
                  <div style={s.filterGroup}>
                    <label style={s.filterLabel}>Date fin</label>
                    <input
                      type="date"
                      style={s.dateInput}
                      value={filters.date_to || ''}
                      onChange={(e) => handleFilterSelect('date_to', e.target.value)}
                    />
                  </div>
                </React.Fragment>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
