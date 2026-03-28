/**
 * RumorsLayer - MarkerCluster + CircleMarkers colorés par risque
 * Intégration directe via useMap() + L.markerClusterGroup
 */

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { RISK_MARKER_COLORS, PRIORITY_RADIUS_MAP } from '../../utils/constants';
import { renderToString } from 'react-dom/server';
import RumorPopup from './RumorPopup';

const RumorsLayer = ({ rumors, isDark, onRumorClick }) => {
  const map = useMap();
  const clusterRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Nettoyer le cluster précédent
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current);
    }

    // Créer le groupe de clusters
    const cluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (clusterObj) => {
        const markers = clusterObj.getAllChildMarkers();
        const count = markers.length;

        // Trouver le risque max dans le cluster
        const riskOrder = ['unknown', 'low', 'moderate', 'high', 'very_high'];
        let maxRiskIdx = 0;
        markers.forEach(m => {
          const idx = riskOrder.indexOf(m.options.riskLevel || 'unknown');
          if (idx > maxRiskIdx) maxRiskIdx = idx;
        });
        const maxRisk = riskOrder[maxRiskIdx];
        const color = RISK_MARKER_COLORS[maxRisk] || RISK_MARKER_COLORS.unknown;

        const size = count < 10 ? 36 : count < 50 ? 42 : 50;

        return L.divIcon({
          html: `<div style="
            width:${size}px;height:${size}px;
            border-radius:50%;
            background:${color};
            color:#fff;
            display:flex;align-items:center;justify-content:center;
            font-size:${count < 10 ? 13 : 12}px;font-weight:700;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
            border:2px solid rgba(255,255,255,0.8);
          ">${count}</div>`,
          className: 'cohrm-cluster-icon',
          iconSize: L.point(size, size),
        });
      },
    });

    // Ajouter les marqueurs
    rumors.forEach(rumor => {
      const color = RISK_MARKER_COLORS[rumor.risk_level] || RISK_MARKER_COLORS.unknown;
      const radius = PRIORITY_RADIUS_MAP[rumor.priority] || 7;

      const marker = L.circleMarker([rumor.lat, rumor.lng], {
        radius,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.8,
        riskLevel: rumor.risk_level,
      });

      // Tooltip au survol
      marker.bindTooltip(
        rumor.title ? (rumor.title.length > 50 ? rumor.title.slice(0, 50) + '…' : rumor.title) : `Rumeur #${rumor.id}`,
        { direction: 'top', offset: [0, -radius], className: 'cohrm-tooltip' }
      );

      // Popup au clic
      const popupHtml = renderToString(
        <RumorPopup rumor={rumor} isDark={isDark} />
      );
      marker.bindPopup(popupHtml, {
        maxWidth: 320,
        className: 'cohrm-popup',
      });

      // Clic pour détail
      if (onRumorClick) {
        marker.on('popupopen', () => {
          // Ajouter un handler sur le bouton "Voir le détail" dans le popup
          setTimeout(() => {
            const btn = document.querySelector('.cohrm-popup button');
            if (btn) {
              btn.onclick = () => onRumorClick(rumor);
            }
          }, 50);
        });
      }

      cluster.addLayer(marker);
    });

    map.addLayer(cluster);
    clusterRef.current = cluster;

    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
      }
    };
  }, [map, rumors, isDark, onRumorClick]);

  return null;
};

export default RumorsLayer;
