/**
 * FullMapContainer - Wrapper MapContainer avec tile layers switchables et recentrage
 */

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_TILE_LAYERS, MAP_DEFAULTS } from '../../utils/constants';

// Composant interne pour recentrer la carte
const RecenterMap = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [map, center, zoom]);
  return null;
};

// Composant pour invalider la taille quand le conteneur change
const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

const FullMapContainer = ({
  tileLayer = 'positron',
  center,
  zoom,
  children,
  isDark,
  mapRef,
}) => {
  const tile = MAP_TILE_LAYERS[tileLayer] || MAP_TILE_LAYERS.positron;
  const effectiveCenter = center || MAP_DEFAULTS.center;
  const effectiveZoom = zoom || MAP_DEFAULTS.zoom;

  return (
    <MapContainer
      center={effectiveCenter}
      zoom={effectiveZoom}
      minZoom={MAP_DEFAULTS.minZoom}
      maxZoom={MAP_DEFAULTS.maxZoom}
      style={{ width: '100%', height: '100%', zIndex: 1 }}
      zoomControl={false}
      ref={mapRef}
    >
      <TileLayer
        key={tileLayer}
        url={tile.url}
        attribution={tile.attribution}
      />
      <MapResizer />
      {center && <RecenterMap center={center} zoom={zoom} />}
      {children}
    </MapContainer>
  );
};

export default FullMapContainer;
