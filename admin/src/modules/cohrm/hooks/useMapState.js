/**
 * useMapState - State local pour la carte COHRM
 * Gère les couches, le mode dessin, le tile layer, les filtres carte
 */

import { useState, useCallback } from 'react';

const DEFAULT_OVERLAYS = {
  rumors: true,
  regions: false,
  heatmap: false,
  choropleth: false,
};

const DEFAULT_MAP_FILTERS = {
  search: '',
  status: '',
  priority: '',
  source: '',
  region: '',
  risk_level: '',
  species: '',
  date_from: '',
  date_to: '',
};

const useMapState = () => {
  const [tileLayer, setTileLayer] = useState('positron');
  const [overlays, setOverlays] = useState(DEFAULT_OVERLAYS);
  const [filters, setFilters] = useState(DEFAULT_MAP_FILTERS);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [drawMode, setDrawMode] = useState(null); // null | 'circle' | 'rectangle' | 'measure'
  const [radiusFilter, setRadiusFilter] = useState(null); // { center: [lat, lng], radius: km }
  const [choroplethMode, setChoroplethMode] = useState('count'); // 'count' | 'risk'
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleOverlay = useCallback((key) => {
    setOverlays(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_MAP_FILTERS);
    setRadiusFilter(null);
  }, []);

  const toggleFilterPanel = useCallback(() => {
    setFilterPanelOpen(prev => !prev);
  }, []);

  return {
    tileLayer,
    setTileLayer,
    overlays,
    toggleOverlay,
    filters,
    updateFilter,
    resetFilters,
    filterPanelOpen,
    setFilterPanelOpen,
    toggleFilterPanel,
    drawMode,
    setDrawMode,
    radiusFilter,
    setRadiusFilter,
    choroplethMode,
    setChoroplethMode,
    isFullscreen,
    setIsFullscreen,
  };
};

export default useMapState;
