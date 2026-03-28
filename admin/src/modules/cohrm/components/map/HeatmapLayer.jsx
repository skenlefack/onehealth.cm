/**
 * HeatmapLayer - Couche heatmap via leaflet.heat + useMap()
 */

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { HEATMAP_DEFAULTS } from '../../utils/constants';

const HeatmapLayer = ({ rumors }) => {
  const map = useMap();
  const heatRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Nettoyer
    if (heatRef.current) {
      map.removeLayer(heatRef.current);
    }

    if (!rumors || rumors.length === 0) return;

    // Préparer les points [lat, lng, intensity]
    const riskIntensity = { unknown: 0.3, low: 0.4, moderate: 0.6, high: 0.8, very_high: 1.0 };
    const points = rumors.map(r => [
      r.lat,
      r.lng,
      riskIntensity[r.risk_level] || 0.4,
    ]);

    const heat = L.heatLayer(points, {
      radius: HEATMAP_DEFAULTS.radius,
      blur: HEATMAP_DEFAULTS.blur,
      maxZoom: HEATMAP_DEFAULTS.maxZoom,
      max: HEATMAP_DEFAULTS.max,
      gradient: HEATMAP_DEFAULTS.gradient,
    });

    heat.addTo(map);
    heatRef.current = heat;

    return () => {
      if (heatRef.current) {
        map.removeLayer(heatRef.current);
      }
    };
  }, [map, rumors]);

  return null;
};

export default HeatmapLayer;
