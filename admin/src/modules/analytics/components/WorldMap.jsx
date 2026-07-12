import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Country ISO alpha-2 -> [lat, lng, name]
const COUNTRY_COORDS = {
  AF: [33.93, 67.71, 'Afghanistan'], AL: [41.15, 20.17, 'Albanie'], DZ: [28.03, 1.66, 'Algérie'],
  AO: [-11.20, 17.87, 'Angola'], AR: [-38.42, -63.62, 'Argentine'], AU: [-25.27, 133.78, 'Australie'],
  AT: [47.52, 14.55, 'Autriche'], BD: [23.68, 90.36, 'Bangladesh'], BE: [50.50, 4.47, 'Belgique'],
  BJ: [9.31, 2.32, 'Bénin'], BR: [-14.24, -51.93, 'Brésil'], BF: [12.24, -1.56, 'Burkina Faso'],
  BI: [-3.37, 29.92, 'Burundi'], CM: [7.37, 12.35, 'Cameroun'], CA: [56.13, -106.35, 'Canada'],
  CF: [6.61, 20.94, 'Centrafrique'], TD: [15.45, 18.73, 'Tchad'], CL: [-35.68, -71.54, 'Chili'],
  CN: [35.86, 104.20, 'Chine'], CO: [4.57, -74.30, 'Colombie'], CD: [-4.04, 21.76, 'RD Congo'],
  CG: [-0.23, 15.83, 'Congo'], CI: [7.54, -5.55, "Côte d'Ivoire"], HR: [45.10, 15.20, 'Croatie'],
  CZ: [49.82, 15.47, 'Tchéquie'], DK: [56.26, 9.50, 'Danemark'], EG: [26.82, 30.80, 'Égypte'],
  GQ: [1.65, 10.27, 'Guinée Éq.'], ET: [9.15, 40.49, 'Éthiopie'], FI: [61.92, 25.75, 'Finlande'],
  FR: [46.23, 2.21, 'France'], GA: [-0.80, 11.61, 'Gabon'], DE: [51.17, 10.45, 'Allemagne'],
  GH: [7.95, -1.02, 'Ghana'], GR: [39.07, 21.82, 'Grèce'], GN: [9.95, -9.70, 'Guinée'],
  HT: [18.97, -72.29, 'Haïti'], HN: [15.20, -86.24, 'Honduras'], HU: [47.16, 19.50, 'Hongrie'],
  IN: [20.59, 78.96, 'Inde'], ID: [-0.79, 113.92, 'Indonésie'], IR: [32.43, 53.69, 'Iran'],
  IQ: [33.22, 43.68, 'Irak'], IE: [53.14, -7.69, 'Irlande'], IL: [31.05, 34.85, 'Israël'],
  IT: [41.87, 12.57, 'Italie'], JP: [36.20, 138.25, 'Japon'], JO: [30.59, 36.24, 'Jordanie'],
  KE: [-0.02, 37.91, 'Kenya'], KR: [35.91, 127.77, 'Corée du Sud'], KW: [29.31, 47.48, 'Koweït'],
  LB: [33.85, 35.86, 'Liban'], LR: [6.43, -9.43, 'Libéria'], LY: [26.34, 17.23, 'Libye'],
  MG: [-18.77, 46.87, 'Madagascar'], MW: [-13.25, 34.30, 'Malawi'], MY: [4.21, 101.98, 'Malaisie'],
  ML: [17.57, -4.00, 'Mali'], MR: [21.01, -10.94, 'Mauritanie'], MX: [23.63, -102.55, 'Mexique'],
  MA: [31.79, -7.09, 'Maroc'], MZ: [-18.67, 35.53, 'Mozambique'], MM: [21.91, 95.96, 'Myanmar'],
  NA: [-22.96, 18.49, 'Namibie'], NL: [52.13, 5.29, 'Pays-Bas'], NZ: [-40.90, 174.89, 'Nouvelle-Zélande'],
  NE: [17.61, 8.08, 'Niger'], NG: [9.08, 8.68, 'Nigéria'], NO: [60.47, 8.47, 'Norvège'],
  PK: [30.38, 69.35, 'Pakistan'], PE: [-9.19, -75.02, 'Pérou'], PH: [12.88, 121.77, 'Philippines'],
  PL: [51.92, 19.15, 'Pologne'], PT: [39.40, -8.22, 'Portugal'], QA: [25.35, 51.18, 'Qatar'],
  RO: [45.94, 24.97, 'Roumanie'], RU: [61.52, 105.32, 'Russie'], RW: [-1.94, 29.87, 'Rwanda'],
  SA: [23.89, 45.08, 'Arabie Saoudite'], SN: [14.50, -14.45, 'Sénégal'], RS: [44.02, 21.01, 'Serbie'],
  SL: [8.46, -11.78, 'Sierra Leone'], SG: [1.35, 103.82, 'Singapour'], ZA: [-30.56, 22.94, 'Afrique du Sud'],
  ES: [40.46, -3.75, 'Espagne'], SD: [12.86, 30.22, 'Soudan'], SE: [60.13, 18.64, 'Suède'],
  CH: [46.82, 8.23, 'Suisse'], SY: [34.80, 38.99, 'Syrie'], TW: [23.70, 120.96, 'Taïwan'],
  TZ: [-6.37, 34.89, 'Tanzanie'], TH: [15.87, 100.99, 'Thaïlande'], TG: [8.62, 1.21, 'Togo'],
  TN: [33.89, 9.54, 'Tunisie'], TR: [38.96, 35.24, 'Turquie'], UG: [1.37, 32.29, 'Ouganda'],
  UA: [48.38, 31.17, 'Ukraine'], AE: [23.42, 53.85, 'Émirats Arabes Unis'], GB: [55.38, -3.44, 'Royaume-Uni'],
  US: [37.09, -95.71, 'États-Unis'], UY: [-32.52, -55.77, 'Uruguay'], VE: [6.42, -66.59, 'Venezuela'],
  VN: [14.06, 108.28, 'Vietnam'], YE: [15.55, 48.52, 'Yémen'], ZM: [-13.13, 27.85, 'Zambie'],
  ZW: [-19.02, 29.15, 'Zimbabwe'], SS: [6.88, 31.31, 'Soudan du Sud'], SO: [5.15, 46.20, 'Somalie'],
  ER: [15.18, 39.78, 'Érythrée'], DJ: [11.83, 42.59, 'Djibouti'], KM: [-11.88, 43.87, 'Comores'],
  SC: [-4.68, 55.49, 'Seychelles'], MU: [-20.35, 57.55, 'Maurice'], CV: [16.00, -24.01, 'Cap-Vert'],
  GW: [11.80, -15.18, 'Guinée-Bissau'], ST: [0.19, 6.61, 'São Tomé'], GM: [13.44, -15.31, 'Gambie'],
  SZ: [-26.52, 31.47, 'Eswatini'], LS: [-29.61, 28.23, 'Lesotho'], BW: [-22.33, 24.68, 'Botswana'],
};

const WorldMap = ({ data, isDark }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Destroy previous instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current, {
      center: [10, 10],
      zoom: 2,
      minZoom: 2,
      maxZoom: 6,
      scrollWheelZoom: true,
      attributionControl: false,
      zoomControl: true,
    });

    // Tile layer - dark or light
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Add markers for each country
    if (data && data.length > 0) {
      const maxVisitors = data[0].visitors || 1;

      data.forEach((item) => {
        const coords = COUNTRY_COORDS[item.country];
        if (!coords) return;

        const [lat, lng, name] = coords;
        const ratio = Math.min(item.visitors / maxVisitors, 1);
        const radius = Math.max(8, Math.round(ratio * 30));

        const marker = L.circleMarker([lat, lng], {
          radius: radius,
          fillColor: '#8B5CF6',
          color: '#7C3AED',
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.5 + ratio * 0.3,
        }).addTo(map);

        marker.bindPopup(
          `<div style="font-family:Inter,sans-serif;padding:4px;">
            <strong style="font-size:14px;">${name}</strong><br/>
            <span style="font-size:13px;color:#8B5CF6;font-weight:600;">${item.visitors}</span>
            <span style="font-size:12px;color:#666;"> visiteur${item.visitors > 1 ? 's' : ''}</span>
          </div>`,
          { closeButton: false, className: 'analytics-popup' }
        );

        marker.on('mouseover', function () { this.openPopup(); });
        marker.on('mouseout', function () { this.closePopup(); });
      });
    }

    mapInstanceRef.current = map;

    // Fix: invalidate size after render
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [data, isDark]);

  const s = {
    container: {
      padding: '20px',
      borderRadius: 16,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    title: {
      fontSize: 16,
      fontWeight: 600,
      color: isDark ? '#f1f5f9' : '#1f2937',
    },
    map: {
      width: '100%',
      height: 450,
      borderRadius: 12,
      overflow: 'hidden',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    empty: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 300,
      color: isDark ? '#64748b' : '#9CA3AF',
      fontSize: 14,
    },
  };

  return (
    <div style={s.container}>
      <style>{`
        .analytics-popup .leaflet-popup-content-wrapper {
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          ${isDark ? 'background: #1e293b; color: #e2e8f0;' : ''}
        }
        .analytics-popup .leaflet-popup-tip {
          ${isDark ? 'background: #1e293b;' : ''}
        }
      `}</style>
      <div style={s.header}>
        <MapPin size={18} color="#EF4444" />
        <span style={s.title}>Carte mondiale des visiteurs</span>
        {data && data.length > 0 && (
          <span style={{ fontSize: 12, color: isDark ? '#64748b' : '#9CA3AF', marginLeft: 'auto' }}>
            {data.length} pays
          </span>
        )}
      </div>
      {!data || data.length === 0 ? (
        <div style={s.empty}>Aucune donnée géographique</div>
      ) : (
        <div ref={mapRef} style={s.map} />
      )}
    </div>
  );
};

export default WorldMap;
