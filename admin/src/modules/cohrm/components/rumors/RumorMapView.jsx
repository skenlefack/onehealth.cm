/**
 * RumorMapView - Vue carte Leaflet avec marqueurs clusterisés
 */

import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { StatusBadge, PriorityBadge, LoadingSpinner, EmptyState } from '../shared';
import { formatRelativeDate, truncateText } from '../../utils/formatters';
import { STATUS_OPTIONS, PRIORITY_OPTIONS, COHRM_COLORS } from '../../utils/constants';

// Centre du Cameroun
const CAMEROON_CENTER = [7.3697, 12.3547];
const CAMEROON_ZOOM = 6;

// Créer un icône de marqueur coloré selon la priorité
const createMarkerIcon = (priority, status) => {
  const priorityInfo = PRIORITY_OPTIONS.find(p => p.value === priority);
  const color = priorityInfo?.color || '#95A5A6';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="40">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z"
        fill="${color}" stroke="#fff" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="#fff"/>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -36],
    className: '',
  });
};

// Sous-composant pour auto-fit bounds
const FitBounds = ({ rumors }) => {
  const map = useMap();
  React.useEffect(() => {
    const validRumors = rumors.filter(r => r.latitude && r.longitude);
    if (validRumors.length > 0) {
      const bounds = L.latLngBounds(validRumors.map(r => [r.latitude, r.longitude]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [rumors, map]);
  return null;
};

const RumorMapView = ({
  rumors = [],
  loading = false,
  onRumorClick,
  isDark = false,
}) => {
  // Filtrer uniquement les rumeurs avec coordonnées
  const geoRumors = useMemo(
    () => rumors.filter(r => r.latitude && r.longitude),
    [rumors]
  );

  const s = {
    container: {
      borderRadius: 12,
      overflow: 'hidden',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      height: 'calc(100vh - 320px)',
      minHeight: 400,
      position: 'relative',
    },
    noGeoOverlay: {
      position: 'absolute',
      bottom: 12,
      left: 12,
      zIndex: 1000,
      padding: '8px 14px',
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(30,41,59,0.9)' : 'rgba(255,255,255,0.9)',
      fontSize: 12,
      color: isDark ? '#94a3b8' : '#6B7280',
      backdropFilter: 'blur(4px)',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    popup: {
      minWidth: 220,
    },
    popupTitle: {
      fontSize: 14,
      fontWeight: 600,
      color: '#1f2937',
      marginBottom: 6,
      lineHeight: 1.3,
    },
    popupMeta: {
      fontSize: 12,
      color: '#6B7280',
      marginBottom: 4,
    },
    popupBadges: {
      display: 'flex',
      gap: 4,
      flexWrap: 'wrap',
      margin: '6px 0',
    },
    popupBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '6px 12px',
      borderRadius: 6,
      border: 'none',
      backgroundColor: COHRM_COLORS.primary,
      color: '#fff',
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
      marginTop: 8,
      fontFamily: 'inherit',
    },
  };

  if (loading) {
    return (
      <div style={s.container}>
        <LoadingSpinner isDark={isDark} size="lg" />
      </div>
    );
  }

  if (geoRumors.length === 0) {
    return (
      <div style={s.container}>
        <EmptyState
          variant="empty"
          message="Aucune rumeur avec coordonnées GPS à afficher sur la carte"
          isDark={isDark}
        />
      </div>
    );
  }

  return (
    <div style={s.container}>
      <MapContainer
        center={CAMEROON_CENTER}
        zoom={CAMEROON_ZOOM}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
          url={isDark
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        />

        <FitBounds rumors={geoRumors} />

        {geoRumors.map((rumor) => (
          <Marker
            key={rumor.id}
            position={[rumor.latitude, rumor.longitude]}
            icon={createMarkerIcon(rumor.priority, rumor.status)}
          >
            <Popup>
              <div style={s.popup}>
                <div style={s.popupTitle}>
                  {truncateText(rumor.title, 60)}
                </div>
                {rumor.code && (
                  <div style={s.popupMeta}>{rumor.code}</div>
                )}
                <div style={s.popupMeta}>
                  {rumor.region}{rumor.department ? ` > ${rumor.department}` : ''}
                </div>
                <div style={s.popupMeta}>
                  {formatRelativeDate(rumor.created_at)}
                </div>
                <div style={s.popupBadges}>
                  <StatusBadge status={rumor.status} size="sm" />
                  <PriorityBadge priority={rumor.priority} size="sm" />
                </div>
                {rumor.affected_count > 0 && (
                  <div style={s.popupMeta}>
                    {rumor.affected_count} cas
                    {rumor.dead_count > 0 ? ` / ${rumor.dead_count} décès` : ''}
                  </div>
                )}
                <button
                  style={s.popupBtn}
                  onClick={() => onRumorClick && onRumorClick(rumor)}
                >
                  Voir le détail
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Compteur rumeurs sans GPS */}
      {rumors.length > geoRumors.length && (
        <div style={s.noGeoOverlay}>
          {rumors.length - geoRumors.length} rumeur(s) sans coordonnées GPS
        </div>
      )}
    </div>
  );
};

export default RumorMapView;
