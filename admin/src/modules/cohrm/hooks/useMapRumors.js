/**
 * useMapRumors - Fetch des rumeurs pour la carte + calcul des stats par région
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getAllRumorsForMap } from '../services/cohrmApi';
import { REGIONS_CAMEROON } from '../utils/constants';

const useMapRumors = (filters, radiusFilter) => {
  const [rumors, setRumors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetchRumors = useCallback(async () => {
    // Annuler la requête précédente
    if (abortRef.current) {
      abortRef.current.cancel?.();
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getAllRumorsForMap(filters);
      const data = result?.rumors || result?.data || result || [];
      setRumors(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err?.message !== 'canceled') {
        setError(err.message || 'Erreur de chargement des rumeurs');
        console.error('useMapRumors fetch error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRumors();
  }, [fetchRumors]);

  // Filtrer les rumeurs ayant des coordonnées valides
  const geoRumors = useMemo(() => {
    let filtered = rumors.filter(r =>
      r.latitude && r.longitude &&
      !isNaN(parseFloat(r.latitude)) && !isNaN(parseFloat(r.longitude))
    ).map(r => ({
      ...r,
      lat: parseFloat(r.latitude),
      lng: parseFloat(r.longitude),
    }));

    // Appliquer le filtre rayon si actif
    if (radiusFilter?.center && radiusFilter?.radius) {
      const [cLat, cLng] = radiusFilter.center;
      const maxDist = radiusFilter.radius; // en km
      filtered = filtered.filter(r => {
        const dist = haversineDistance(cLat, cLng, r.lat, r.lng);
        return dist <= maxDist;
      });
    }

    return filtered;
  }, [rumors, radiusFilter]);

  // Statistiques par région
  const regionStats = useMemo(() => {
    const stats = {};
    REGIONS_CAMEROON.forEach(reg => {
      stats[reg.code] = { count: 0, riskSum: 0, riskCount: 0, avgRisk: 0, maxRisk: 'unknown' };
    });

    const riskValues = { unknown: 0, low: 1, moderate: 2, high: 3, very_high: 4 };

    geoRumors.forEach(r => {
      const regionCode = r.region;
      if (regionCode && stats[regionCode]) {
        stats[regionCode].count++;
        const rv = riskValues[r.risk_level] || 0;
        if (rv > 0) {
          stats[regionCode].riskSum += rv;
          stats[regionCode].riskCount++;
        }
        if (rv > riskValues[stats[regionCode].maxRisk]) {
          stats[regionCode].maxRisk = r.risk_level;
        }
      }
    });

    // Calculer la moyenne de risque
    Object.keys(stats).forEach(code => {
      const s = stats[code];
      if (s.riskCount > 0) {
        s.avgRisk = s.riskSum / s.riskCount;
      }
    });

    return stats;
  }, [geoRumors]);

  return {
    rumors: geoRumors,
    allRumors: rumors,
    regionStats,
    loading,
    error,
    refetch: fetchRumors,
    totalCount: rumors.length,
    geoCount: geoRumors.length,
  };
};

// Calcul de distance Haversine (km)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) { return deg * Math.PI / 180; }

export default useMapRumors;
