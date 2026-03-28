/**
 * RegionsLayer - GeoJSON polygones des régions avec hover stats
 */

import React, { useCallback } from 'react';
import { GeoJSON, Tooltip } from 'react-leaflet';
import cameroonRegions from '../../data/cameroonRegions';
import { REGIONS_CAMEROON, COHRM_COLORS } from '../../utils/constants';

const RegionsLayer = ({ regionStats, isDark }) => {
  const style = useCallback((feature) => ({
    fillColor: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(27,79,114,0.08)',
    fillOpacity: 0.4,
    color: isDark ? '#3b82f6' : COHRM_COLORS.primary,
    weight: 1.5,
    opacity: 0.6,
    dashArray: '4 4',
  }), [isDark]);

  const onEachFeature = useCallback((feature, layer) => {
    const code = feature.properties.code;
    const region = REGIONS_CAMEROON.find(r => r.code === code);
    const stats = regionStats?.[code];

    const tooltipContent = `
      <div style="font-family:Inter,sans-serif;min-width:140px;">
        <div style="font-weight:700;font-size:13px;margin-bottom:4px;">
          ${region?.name || feature.properties.name}
        </div>
        <div style="font-size:12px;color:#6B7280;">
          ${stats?.count || 0} rumeur${(stats?.count || 0) !== 1 ? 's' : ''}
        </div>
        ${stats?.maxRisk && stats.maxRisk !== 'unknown' ? `
          <div style="font-size:11px;color:#9CA3AF;margin-top:2px;">
            Risque max: ${stats.maxRisk}
          </div>
        ` : ''}
      </div>
    `;

    layer.bindTooltip(tooltipContent, {
      sticky: true,
      direction: 'auto',
      className: 'cohrm-region-tooltip',
    });

    layer.on({
      mouseover: (e) => {
        e.target.setStyle({
          fillOpacity: 0.6,
          weight: 2.5,
          opacity: 1,
          dashArray: null,
        });
      },
      mouseout: (e) => {
        e.target.setStyle({
          fillOpacity: 0.4,
          weight: 1.5,
          opacity: 0.6,
          dashArray: '4 4',
        });
      },
    });
  }, [regionStats]);

  return (
    <GeoJSON
      key="regions-layer"
      data={cameroonRegions}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
};

export default RegionsLayer;
