/**
 * DashboardMap - Mini-carte Leaflet du dashboard COHRM
 *
 * Affiche les 10 dernières rumeurs géolocalisées sur une carte
 * centrée sur le Cameroun. Les marqueurs sont colorés selon le
 * niveau de risque de la rumeur.
 */

import React, { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { COHRM_COLORS } from '../utils/constants';
import { formatStatus, formatPriority, formatRelativeDate } from '../utils/formatters';

// Centre du Cameroun et bounds approximatifs
const CAMEROON_CENTER = [7.3697, 12.3547];
const CAMEROON_ZOOM = 6;

// Couleurs des marqueurs par risque
const RISK_MARKER_COLORS = {
  low: '#27AE60',
  moderate: '#F39C12',
  high: '#E67E22',
  very_high: '#E74C3C',
  unknown: '#3498DB',
};

// Couleurs des marqueurs par priorité (fallback si pas de risk_level)
const PRIORITY_MARKER_COLORS = {
  low: '#27AE60',
  medium: '#F39C12',
  high: '#E67E22',
  critical: '#E74C3C',
};

const getMarkerColor = (rumor) => {
  if (rumor.risk_level && rumor.risk_level !== 'unknown') {
    return RISK_MARKER_COLORS[rumor.risk_level] || '#3498DB';
  }
  return PRIORITY_MARKER_COLORS[rumor.priority] || '#3498DB';
};

const DashboardMap = ({ rumors = [], isDark, onRumorClick }) => {
  // Filtrer uniquement les rumeurs avec coordonnées GPS
  const geoRumors = useMemo(() => {
    return rumors
      .filter(r => r.latitude && r.longitude)
      .slice(0, 10);
  }, [rumors]);

  const s = {
    container: {
      height: 280,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
    },
    noData: {
      height: 280,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: isDark ? '#64748b' : '#9CA3AF',
      fontSize: 14,
      gap: 8,
      borderRadius: 12,
      backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    legend: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      zIndex: 1000,
      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderRadius: 8,
      padding: '6px 10px',
      fontSize: 11,
      display: 'flex',
      gap: 8,
      border: isDark ? '1px solid #475569' : '1px solid #E5E7EB',
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      color: isDark ? '#94a3b8' : '#6B7280',
    },
    legendDot: (color) => ({
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: color,
    }),
    popupTitle: {
      fontSize: 13,
      fontWeight: 700,
      color: '#1f2937',
      marginBottom: 4,
      maxWidth: 200,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    popupMeta: {
      fontSize: 12,
      color: '#6B7280',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      marginBottom: 2,
    },
    popupBtn: {
      marginTop: 6,
      fontSize: 12,
      color: COHRM_COLORS.primaryLight,
      cursor: 'pointer',
      fontWeight: 600,
      background: 'none',
      border: 'none',
      padding: 0,
    },
  };

  // Si pas de données géolocalisées, afficher un placeholder
  if (geoRumors.length === 0) {
    return (
      <div style={s.noData}>
        <div style={{ fontSize: 32, opacity: 0.4 }}>&#128506;</div>
        <div>Aucune rumeur géolocalisée récente</div>
      </div>
    );
  }

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileAttribution = isDark
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  return (
    <div style={{ position: 'relative' }}>
      <div style={s.container}>
        <MapContainer
          center={CAMEROON_CENTER}
          zoom={CAMEROON_ZOOM}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          zoomControl={true}
          attributionControl={true}
        >
          <TileLayer url={tileUrl} attribution={tileAttribution} />

          {geoRumors.map((rumor) => {
            const color = getMarkerColor(rumor);
            const statusInfo = formatStatus(rumor.status);
            const priorityInfo = formatPriority(rumor.priority);

            return (
              <CircleMarker
                key={rumor.id}
                center={[parseFloat(rumor.latitude), parseFloat(rumor.longitude)]}
                radius={8}
                fillColor={color}
                fillOpacity={0.8}
                color={color}
                weight={2}
                opacity={1}
              >
                <Popup>
                  <div style={s.popupTitle}>
                    {rumor.title || rumor.description?.substring(0, 50) || `Rumeur #${rumor.id}`}
                  </div>
                  <div style={s.popupMeta}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '1px 6px',
                        borderRadius: 4,
                        fontSize: 11,
                        backgroundColor: statusInfo.bgColor,
                        color: statusInfo.color,
                        fontWeight: 600,
                      }}
                    >
                      {statusInfo.label}
                    </span>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '1px 6px',
                        borderRadius: 4,
                        fontSize: 11,
                        backgroundColor: priorityInfo.bgColor,
                        color: priorityInfo.color,
                        fontWeight: 600,
                      }}
                    >
                      {priorityInfo.label}
                    </span>
                  </div>
                  <div style={s.popupMeta}>
                    {rumor.region && <span>{rumor.region}</span>}
                    <span>{formatRelativeDate(rumor.created_at)}</span>
                  </div>
                  {onRumorClick && (
                    <button
                      style={s.popupBtn}
                      onClick={() => onRumorClick(rumor.id)}
                    >
                      Voir le détail &rarr;
                    </button>
                  )}
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* Légende */}
      <div style={s.legend}>
        <div style={s.legendItem}>
          <div style={s.legendDot('#27AE60')} />
          Faible
        </div>
        <div style={s.legendItem}>
          <div style={s.legendDot('#F39C12')} />
          Modéré
        </div>
        <div style={s.legendItem}>
          <div style={s.legendDot('#E67E22')} />
          Élevé
        </div>
        <div style={s.legendItem}>
          <div style={s.legendDot('#E74C3C')} />
          Très élevé
        </div>
      </div>
    </div>
  );
};

export default DashboardMap;
