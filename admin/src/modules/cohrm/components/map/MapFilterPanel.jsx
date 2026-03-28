/**
 * MapFilterPanel - Drawer gauche pliable avec filtres verticaux
 * Glassmorphism style, all inline CSS
 */

import React, { useState } from 'react';
import { X, RotateCcw, Search, MapPin, Crosshair } from 'lucide-react';
import {
  STATUS_OPTIONS, PRIORITY_OPTIONS, SOURCE_OPTIONS,
  RISK_LEVELS, REGIONS_CAMEROON, SPECIES_CODES,
  COHRM_COLORS,
} from '../../utils/constants';

const MapFilterPanel = ({
  isDark, open, filters, updateFilter, resetFilters,
  onClose, geoCount, totalCount, radiusFilter, setRadiusFilter,
}) => {
  const [radiusKm, setRadiusKm] = useState(50);
  const [radiusMode, setRadiusMode] = useState(false); // mode sélection sur carte

  const s = {
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: open ? 340 : 0,
      zIndex: 1100,
      overflow: 'hidden',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    panel: {
      width: 340,
      height: '100%',
      backgroundColor: isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(16px)',
      borderRight: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', sans-serif",
      overflowY: 'auto',
      overflowX: 'hidden',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 18px',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      flexShrink: 0,
    },
    headerTitle: {
      fontSize: 15,
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#1f2937',
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    iconBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 30,
      height: 30,
      borderRadius: 8,
      border: 'none',
      backgroundColor: 'transparent',
      color: isDark ? '#94a3b8' : '#6B7280',
      cursor: 'pointer',
    },
    body: {
      flex: 1,
      padding: '12px 18px',
      overflowY: 'auto',
    },
    section: {
      marginBottom: 16,
    },
    label: {
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: isDark ? '#64748b' : '#9CA3AF',
      marginBottom: 6,
      display: 'block',
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      borderRadius: 8,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: isDark ? '#1e293b' : '#F9FAFB',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 13,
      outline: 'none',
      boxSizing: 'border-box',
    },
    select: {
      width: '100%',
      padding: '8px 12px',
      borderRadius: 8,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: isDark ? '#1e293b' : '#F9FAFB',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 13,
      outline: 'none',
      boxSizing: 'border-box',
      appearance: 'auto',
    },
    dateRow: {
      display: 'flex',
      gap: 8,
    },
    counter: {
      padding: '10px 18px',
      borderTop: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      fontSize: 12,
      color: isDark ? '#94a3b8' : '#6B7280',
      textAlign: 'center',
      flexShrink: 0,
    },
    counterBold: {
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#374151',
    },
    radiusBox: {
      padding: '10px 12px',
      borderRadius: 8,
      backgroundColor: isDark ? '#1e293b' : '#F0F9FF',
      border: isDark ? '1px solid #334155' : '1px solid #BFDBFE',
    },
    radiusRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    slider: {
      flex: 1,
      accentColor: COHRM_COLORS.primary,
    },
    radiusBtn: (active) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 12px',
      borderRadius: 8,
      border: 'none',
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
      backgroundColor: active ? COHRM_COLORS.primary : (isDark ? '#334155' : '#E5E7EB'),
      color: active ? '#fff' : (isDark ? '#94a3b8' : '#6B7280'),
      width: '100%',
      justifyContent: 'center',
    }),
    clearRadiusBtn: {
      marginTop: 6,
      fontSize: 11,
      color: COHRM_COLORS.danger,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      textDecoration: 'underline',
    },
  };

  const speciesOptions = Object.entries(SPECIES_CODES).map(([code, val]) => ({
    value: code,
    label: val.label,
  }));

  return (
    <div style={s.overlay}>
      <div style={s.panel}>
        {/* Header */}
        <div style={s.header}>
          <span style={s.headerTitle}>Filtres</span>
          <div style={s.headerActions}>
            <button
              style={s.iconBtn}
              onClick={resetFilters}
              title="Réinitialiser"
            >
              <RotateCcw size={15} />
            </button>
            <button style={s.iconBtn} onClick={onClose} title="Fermer">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={s.body}>
          {/* Recherche */}
          <div style={s.section}>
            <label style={s.label}>Recherche</label>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{
                position: 'absolute', left: 10, top: '50%',
                transform: 'translateY(-50%)',
                color: isDark ? '#64748b' : '#9CA3AF',
              }} />
              <input
                type="text"
                placeholder="Titre, description..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                style={{ ...s.input, paddingLeft: 32 }}
              />
            </div>
          </div>

          {/* Statut */}
          <div style={s.section}>
            <label style={s.label}>Statut</label>
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              style={s.select}
            >
              <option value="">Tous les statuts</option>
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Priorité */}
          <div style={s.section}>
            <label style={s.label}>Priorité</label>
            <select
              value={filters.priority}
              onChange={(e) => updateFilter('priority', e.target.value)}
              style={s.select}
            >
              <option value="">Toutes</option>
              {PRIORITY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Niveau de risque */}
          <div style={s.section}>
            <label style={s.label}>Niveau de risque</label>
            <select
              value={filters.risk_level}
              onChange={(e) => updateFilter('risk_level', e.target.value)}
              style={s.select}
            >
              <option value="">Tous</option>
              {RISK_LEVELS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Source */}
          <div style={s.section}>
            <label style={s.label}>Source</label>
            <select
              value={filters.source}
              onChange={(e) => updateFilter('source', e.target.value)}
              style={s.select}
            >
              <option value="">Toutes</option>
              {SOURCE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Région */}
          <div style={s.section}>
            <label style={s.label}>Région</label>
            <select
              value={filters.region}
              onChange={(e) => updateFilter('region', e.target.value)}
              style={s.select}
            >
              <option value="">Toutes</option>
              {REGIONS_CAMEROON.map(reg => (
                <option key={reg.code} value={reg.code}>{reg.name}</option>
              ))}
            </select>
          </div>

          {/* Espèce */}
          <div style={s.section}>
            <label style={s.label}>Espèce</label>
            <select
              value={filters.species}
              onChange={(e) => updateFilter('species', e.target.value)}
              style={s.select}
            >
              <option value="">Toutes</option>
              {speciesOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div style={s.section}>
            <label style={s.label}>Période</label>
            <div style={s.dateRow}>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => updateFilter('date_from', e.target.value)}
                style={{ ...s.input, flex: 1 }}
              />
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => updateFilter('date_to', e.target.value)}
                style={{ ...s.input, flex: 1 }}
              />
            </div>
          </div>

          {/* Filtre Rayon */}
          <div style={s.section}>
            <label style={s.label}>Filtre par rayon</label>
            <div style={s.radiusBox}>
              <div style={s.radiusRow}>
                <MapPin size={14} color={COHRM_COLORS.primary} />
                <input
                  type="range"
                  min={5}
                  max={200}
                  step={5}
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  style={s.slider}
                />
                <span style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#e2e8f0' : '#374151', minWidth: 45, textAlign: 'right' }}>
                  {radiusKm} km
                </span>
              </div>
              <button
                style={s.radiusBtn(radiusMode)}
                onClick={() => {
                  if (radiusMode) {
                    setRadiusMode(false);
                  } else {
                    setRadiusMode(true);
                    // Le clic sur la carte sera géré par FullMapPage
                    // Pour l'instant, utiliser le centre du Cameroun comme démo
                    setRadiusFilter({ center: [7.3697, 12.3547], radius: radiusKm });
                  }
                }}
              >
                <Crosshair size={13} />
                {radiusFilter ? 'Filtre actif' : 'Activer le filtre rayon'}
              </button>
              {radiusFilter && (
                <button
                  style={s.clearRadiusBtn}
                  onClick={() => { setRadiusFilter(null); setRadiusMode(false); }}
                >
                  Supprimer le filtre rayon
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Compteur */}
        <div style={s.counter}>
          <span style={s.counterBold}>{geoCount}</span> rumeur{geoCount !== 1 ? 's' : ''} affichée{geoCount !== 1 ? 's' : ''}
          {geoCount < totalCount && (
            <span> sur {totalCount} total</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapFilterPanel;
