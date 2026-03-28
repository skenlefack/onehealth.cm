/**
 * ChoroplethLayer - Régions colorées par count ou risque moyen
 */

import React, { useCallback, useMemo } from 'react';
import { GeoJSON, Tooltip } from 'react-leaflet';
import cameroonRegions from '../../data/cameroonRegions';
import { REGIONS_CAMEROON, CHOROPLETH_PALETTE, COHRM_COLORS } from '../../utils/constants';

const ChoroplethLayer = ({ regionStats, mode = 'count', isDark }) => {
  // Calculer les bornes pour la palette
  const { maxVal, getColor } = useMemo(() => {
    const values = Object.values(regionStats || {}).map(s =>
      mode === 'count' ? s.count : s.avgRisk
    );
    const max = Math.max(...values, 1);
    const palette = mode === 'count' ? CHOROPLETH_PALETTE.count : CHOROPLETH_PALETTE.risk;

    const getColorFn = (val) => {
      if (val === 0) return palette[0];
      const idx = Math.min(
        Math.floor((val / max) * (palette.length - 1)),
        palette.length - 1
      );
      return palette[Math.max(idx, 1)]; // Éviter la couleur 0 (blanc) si valeur > 0
    };

    return { maxVal: max, getColor: getColorFn };
  }, [regionStats, mode]);

  const style = useCallback((feature) => {
    const code = feature.properties.code;
    const stats = regionStats?.[code];
    const val = stats ? (mode === 'count' ? stats.count : stats.avgRisk) : 0;

    return {
      fillColor: getColor(val),
      fillOpacity: 0.65,
      color: isDark ? '#475569' : '#94a3b8',
      weight: 1,
      opacity: 0.8,
    };
  }, [regionStats, mode, isDark, getColor]);

  const onEachFeature = useCallback((feature, layer) => {
    const code = feature.properties.code;
    const region = REGIONS_CAMEROON.find(r => r.code === code);
    const stats = regionStats?.[code];

    const tooltipContent = `
      <div style="font-family:Inter,sans-serif;min-width:160px;">
        <div style="font-weight:700;font-size:13px;margin-bottom:6px;">
          ${region?.name || feature.properties.name}
        </div>
        <div style="font-size:12px;color:#374151;margin-bottom:2px;">
          <strong>${stats?.count || 0}</strong> rumeur${(stats?.count || 0) !== 1 ? 's' : ''}
        </div>
        ${stats?.avgRisk > 0 ? `
          <div style="font-size:11px;color:#6B7280;">
            Risque moyen: ${stats.avgRisk.toFixed(1)}/4
          </div>
        ` : ''}
        ${stats?.maxRisk && stats.maxRisk !== 'unknown' ? `
          <div style="font-size:11px;color:#6B7280;">
            Risque max: ${stats.maxRisk}
          </div>
        ` : ''}
      </div>
    `;

    layer.bindTooltip(tooltipContent, {
      sticky: true,
      direction: 'auto',
    });

    layer.on({
      mouseover: (e) => {
        e.target.setStyle({ fillOpacity: 0.85, weight: 2 });
      },
      mouseout: (e) => {
        e.target.setStyle({ fillOpacity: 0.65, weight: 1 });
      },
    });
  }, [regionStats]);

  return (
    <GeoJSON
      key={`choropleth-${mode}`}
      data={cameroonRegions}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
};

export default ChoroplethLayer;
