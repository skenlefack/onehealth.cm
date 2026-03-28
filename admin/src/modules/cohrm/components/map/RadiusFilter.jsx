/**
 * RadiusFilter - Cercle de rayon visuel sur la carte
 */

import React from 'react';
import { Circle, Tooltip } from 'react-leaflet';
import { COHRM_COLORS } from '../../utils/constants';

const RadiusFilter = ({ center, radius, isDark }) => {
  if (!center || !radius) return null;

  return (
    <Circle
      center={center}
      radius={radius * 1000} // Convertir km en mètres
      pathOptions={{
        color: COHRM_COLORS.primary,
        fillColor: COHRM_COLORS.primaryLight,
        fillOpacity: 0.1,
        weight: 2,
        dashArray: '6 4',
      }}
    >
      <Tooltip permanent direction="center" className="cohrm-radius-tooltip">
        <span style={{ fontSize: 11, fontWeight: 600 }}>{radius} km</span>
      </Tooltip>
    </Circle>
  );
};

export default RadiusFilter;
