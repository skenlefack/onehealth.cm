/**
 * MapToolbar - Toolbar flottante en haut à droite
 * Sélecteur tile, toggles couches, outils, actions
 */

import React, { useState } from 'react';
import {
  Layers, Map, Thermometer, Grid3x3, MapPin,
  Maximize, Camera, Navigation, Filter,
  ChevronDown,
} from 'lucide-react';
import { MAP_TILE_LAYERS, COHRM_COLORS } from '../../utils/constants';

const MapToolbar = ({
  isDark, tileLayer, setTileLayer, overlays, toggleOverlay,
  drawMode, setDrawMode, onRecenter, onFullscreen, onScreenshot,
  isFullscreen, filterPanelOpen, toggleFilterPanel,
}) => {
  const [tileDropdown, setTileDropdown] = useState(false);

  const s = {
    container: {
      position: 'absolute',
      top: 12,
      right: 12,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      fontFamily: "'Inter', sans-serif",
    },
    group: {
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 10,
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
    },
    btn: (active = false) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      width: 38,
      height: 38,
      border: 'none',
      borderBottom: isDark ? '1px solid #1e293b' : '1px solid #E5E7EB',
      backgroundColor: active
        ? (isDark ? COHRM_COLORS.primary : COHRM_COLORS.primary)
        : (isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)'),
      color: active
        ? '#fff'
        : (isDark ? '#94a3b8' : '#6B7280'),
      cursor: 'pointer',
      transition: 'all 0.15s',
      position: 'relative',
      backdropFilter: 'blur(8px)',
    }),
    labelBtn: (active = false) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '0 14px',
      height: 38,
      border: 'none',
      borderBottom: isDark ? '1px solid #1e293b' : '1px solid #E5E7EB',
      backgroundColor: active
        ? (isDark ? COHRM_COLORS.primary : COHRM_COLORS.primary)
        : (isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)'),
      color: active
        ? '#fff'
        : (isDark ? '#e2e8f0' : '#374151'),
      cursor: 'pointer',
      transition: 'all 0.15s',
      fontSize: 12,
      fontWeight: 500,
      whiteSpace: 'nowrap',
      backdropFilter: 'blur(8px)',
    }),
    dropdown: {
      position: 'absolute',
      top: 0,
      right: 44,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      borderRadius: 10,
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      overflow: 'hidden',
      minWidth: 160,
      zIndex: 1100,
    },
    dropdownItem: (active) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 14px',
      border: 'none',
      width: '100%',
      backgroundColor: active
        ? (isDark ? '#334155' : '#EFF6FF')
        : 'transparent',
      color: isDark ? '#e2e8f0' : '#374151',
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: active ? 600 : 400,
      textAlign: 'left',
    }),
    filterBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: COHRM_COLORS.accent,
    },
  };

  const overlayDefs = [
    { key: 'rumors', label: 'Rumeurs', icon: MapPin },
    { key: 'regions', label: 'Régions', icon: Grid3x3 },
    { key: 'heatmap', label: 'Heatmap', icon: Thermometer },
    { key: 'choropleth', label: 'Choroplèthe', icon: Map },
  ];

  const hasActiveFilters = Object.values(filterPanelOpen).some(Boolean);

  return (
    <div style={s.container}>
      {/* Bouton filtres */}
      <div style={s.group}>
        <button
          style={s.btn(filterPanelOpen)}
          onClick={toggleFilterPanel}
          title="Filtres"
        >
          <Filter size={16} />
          {hasActiveFilters && <div style={s.filterBadge} />}
        </button>
      </div>

      {/* Couches */}
      <div style={s.group}>
        {overlayDefs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            style={s.btn(overlays[key])}
            onClick={() => toggleOverlay(key)}
            title={label}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>

      {/* Tile layer */}
      <div style={s.group}>
        <button
          style={s.btn()}
          onClick={() => setTileDropdown(!tileDropdown)}
          title="Fond de carte"
        >
          <Layers size={16} />
        </button>

        {tileDropdown && (
          <div style={s.dropdown}>
            {Object.entries(MAP_TILE_LAYERS).map(([key, tile]) => (
              <button
                key={key}
                style={s.dropdownItem(tileLayer === key)}
                onClick={() => { setTileLayer(key); setTileDropdown(false); }}
              >
                {tile.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={s.group}>
        <button style={s.btn()} onClick={onRecenter} title="Recentrer">
          <Navigation size={16} />
        </button>
        <button style={s.btn(isFullscreen)} onClick={onFullscreen} title="Plein écran">
          <Maximize size={16} />
        </button>
        <button style={s.btn()} onClick={onScreenshot} title="Capture d'écran">
          <Camera size={16} />
        </button>
      </div>
    </div>
  );
};

export default MapToolbar;
