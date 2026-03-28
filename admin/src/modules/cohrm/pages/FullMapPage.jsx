/**
 * FullMapPage - Page carte interactive des rumeurs COHRM
 * Orchestrateur principal : hooks, couches, filtres, toolbar
 */

import React, { useRef, useCallback } from 'react';
import { ZoomControl } from 'react-leaflet';
import FullMapContainer from '../components/map/FullMapContainer';
import RumorsLayer from '../components/map/RumorsLayer';
import RegionsLayer from '../components/map/RegionsLayer';
import HeatmapLayer from '../components/map/HeatmapLayer';
import ChoroplethLayer from '../components/map/ChoroplethLayer';
import MapLegend from '../components/map/MapLegend';
import MapFilterPanel from '../components/map/MapFilterPanel';
import MapToolbar from '../components/map/MapToolbar';
import RadiusFilter from '../components/map/RadiusFilter';
import useMapState from '../hooks/useMapState';
import useMapRumors from '../hooks/useMapRumors';
import { MAP_DEFAULTS, COHRM_COLORS } from '../utils/constants';

const FullMapPage = ({ isDark, user }) => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  const mapState = useMapState();
  const {
    tileLayer, overlays, filters, filterPanelOpen,
    drawMode, radiusFilter, choroplethMode,
    isFullscreen, setIsFullscreen,
    toggleOverlay, updateFilter, resetFilters,
    toggleFilterPanel, setTileLayer, setDrawMode,
    setRadiusFilter, setChoroplethMode,
  } = mapState;

  const {
    rumors, regionStats, loading, error,
    refetch, totalCount, geoCount,
  } = useMapRumors(filters, radiusFilter);

  // Recentrer la carte
  const handleRecenter = useCallback(() => {
    const map = mapRef.current;
    if (map) {
      map.setView(MAP_DEFAULTS.center, MAP_DEFAULTS.zoom, { animate: true });
    }
  }, []);

  // Plein écran
  const handleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, [setIsFullscreen]);

  // Screenshot via html2canvas
  const handleScreenshot = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const el = containerRef.current;
      if (!el) return;
      const canvas = await html2canvas(el, { useCORS: true, allowTaint: true });
      const link = document.createElement('a');
      link.download = `cohrm-carte-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error('Screenshot error:', err);
    }
  }, []);

  // Navigation vers le détail d'une rumeur
  const handleRumorClick = useCallback((rumor) => {
    // Pour l'instant, log - sera connecté au routing COHRM
    console.log('Rumor clicked:', rumor.id);
  }, []);

  const s = {
    container: {
      position: 'relative',
      width: '100%',
      height: 'calc(100vh - 64px)',
      overflow: 'hidden',
      backgroundColor: isDark ? COHRM_COLORS.darkBg : '#f0f0f0',
    },
    loadingOverlay: {
      position: 'absolute',
      top: 12,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      padding: '8px 20px',
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(30,41,59,0.9)' : 'rgba(255,255,255,0.95)',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 13,
      fontWeight: 500,
      boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    errorBanner: {
      position: 'absolute',
      top: 12,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      padding: '8px 20px',
      borderRadius: 20,
      backgroundColor: '#FDEDEC',
      color: '#E74C3C',
      fontSize: 13,
      fontWeight: 500,
      boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
    },
    statsBar: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      zIndex: 1000,
      padding: '6px 14px',
      borderRadius: 16,
      backgroundColor: isDark ? 'rgba(30,41,59,0.9)' : 'rgba(255,255,255,0.95)',
      color: isDark ? '#94a3b8' : '#6B7280',
      fontSize: 12,
      fontWeight: 500,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
  };

  return (
    <div ref={containerRef} style={s.container}>
      {/* Carte */}
      <FullMapContainer
        tileLayer={tileLayer}
        isDark={isDark}
        mapRef={mapRef}
      >
        <ZoomControl position="bottomright" />

        {/* Couche Rumeurs (marqueurs + clusters) */}
        {overlays.rumors && (
          <RumorsLayer
            rumors={rumors}
            isDark={isDark}
            onRumorClick={handleRumorClick}
          />
        )}

        {/* Couche Régions (GeoJSON polygones) */}
        {overlays.regions && (
          <RegionsLayer
            regionStats={regionStats}
            isDark={isDark}
          />
        )}

        {/* Couche Heatmap */}
        {overlays.heatmap && (
          <HeatmapLayer rumors={rumors} />
        )}

        {/* Couche Choroplèthe */}
        {overlays.choropleth && (
          <ChoroplethLayer
            regionStats={regionStats}
            mode={choroplethMode}
            isDark={isDark}
          />
        )}

        {/* Filtre Rayon */}
        {radiusFilter && (
          <RadiusFilter
            center={radiusFilter.center}
            radius={radiusFilter.radius}
            isDark={isDark}
          />
        )}
      </FullMapContainer>

      {/* Toolbar flottante */}
      <MapToolbar
        isDark={isDark}
        tileLayer={tileLayer}
        setTileLayer={setTileLayer}
        overlays={overlays}
        toggleOverlay={toggleOverlay}
        drawMode={drawMode}
        setDrawMode={setDrawMode}
        onRecenter={handleRecenter}
        onFullscreen={handleFullscreen}
        onScreenshot={handleScreenshot}
        isFullscreen={isFullscreen}
        filterPanelOpen={filterPanelOpen}
        toggleFilterPanel={toggleFilterPanel}
      />

      {/* Panneau de filtres */}
      <MapFilterPanel
        isDark={isDark}
        open={filterPanelOpen}
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
        onClose={() => toggleFilterPanel()}
        geoCount={geoCount}
        totalCount={totalCount}
        radiusFilter={radiusFilter}
        setRadiusFilter={setRadiusFilter}
      />

      {/* Légende dynamique */}
      {(overlays.choropleth || overlays.rumors) && (
        <MapLegend
          isDark={isDark}
          showChoropleth={overlays.choropleth}
          choroplethMode={choroplethMode}
          setChoroplethMode={setChoroplethMode}
          showRumors={overlays.rumors}
          regionStats={regionStats}
        />
      )}

      {/* Indicateur de chargement */}
      {loading && (
        <div style={s.loadingOverlay}>
          <span style={{
            width: 14, height: 14, border: '2px solid transparent',
            borderTop: `2px solid ${COHRM_COLORS.primary}`,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          Chargement des rumeurs...
        </div>
      )}

      {/* Erreur */}
      {error && <div style={s.errorBanner}>{error}</div>}

      {/* Compteur */}
      {!loading && (
        <div style={s.statsBar}>
          {geoCount} rumeur{geoCount !== 1 ? 's' : ''} sur la carte
          {geoCount < totalCount && ` (${totalCount} total)`}
        </div>
      )}

      {/* Styles CSS pour Leaflet + spinner */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .cohrm-cluster-icon { background: transparent !important; border: none !important; }
        .cohrm-popup .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
          padding: 0 !important;
        }
        .cohrm-popup .leaflet-popup-content { margin: 14px !important; }
        .cohrm-popup .leaflet-popup-tip { box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important; }
        .cohrm-tooltip {
          border-radius: 8px !important;
          padding: 4px 10px !important;
          font-size: 12px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12) !important;
        }
        .cohrm-region-tooltip .leaflet-tooltip-content-wrapper {
          border-radius: 10px !important;
        }
        .leaflet-container { font-family: 'Inter', sans-serif !important; }
      `}</style>
    </div>
  );
};

export default FullMapPage;
