/**
 * GeoJSON simplifié des 10 régions du Cameroun
 * Polygones approximatifs pour la carte choroplèthe
 * Codes régions alignés sur REGIONS_CAMEROON dans constants.js
 */

const cameroonRegionsGeoJson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { code: 'EN', name: 'Extrême-Nord', nameEn: 'Far North' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [13.0, 10.0], [14.0, 10.0], [14.7, 10.5], [15.1, 11.0],
          [15.2, 11.5], [15.0, 12.0], [14.8, 12.5], [14.5, 13.1],
          [14.0, 13.1], [13.5, 12.8], [13.2, 12.2], [13.0, 11.5],
          [12.9, 11.0], [13.0, 10.5], [13.0, 10.0],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { code: 'NO', name: 'Nord', nameEn: 'North' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [12.5, 8.0], [13.0, 8.0], [13.8, 8.3], [14.5, 8.7],
          [15.0, 9.2], [15.1, 9.8], [15.0, 10.0], [14.7, 10.5],
          [14.0, 10.0], [13.0, 10.0], [13.0, 10.5], [12.9, 11.0],
          [12.5, 10.0], [12.2, 9.5], [12.5, 9.0], [12.5, 8.0],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { code: 'AD', name: 'Adamaoua', nameEn: 'Adamawa' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [11.0, 6.5], [12.0, 6.5], [13.0, 6.8], [14.0, 7.0],
          [14.5, 7.5], [14.5, 8.0], [14.5, 8.7], [13.8, 8.3],
          [13.0, 8.0], [12.5, 8.0], [12.5, 9.0], [12.2, 9.5],
          [11.5, 8.5], [11.0, 7.8], [10.5, 7.2], [11.0, 6.5],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { code: 'ES', name: 'Est', nameEn: 'East' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [13.0, 2.5], [14.0, 2.3], [15.0, 2.2], [15.5, 2.5],
          [16.0, 3.0], [16.2, 3.5], [16.0, 4.0], [15.5, 4.5],
          [15.0, 5.0], [14.5, 5.5], [14.0, 6.0], [14.0, 7.0],
          [13.0, 6.8], [12.0, 6.5], [12.0, 5.5], [12.5, 4.5],
          [13.0, 3.5], [13.0, 2.5],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { code: 'CE', name: 'Centre', nameEn: 'Centre' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [10.5, 3.5], [11.0, 3.3], [11.5, 3.0], [12.0, 3.0],
          [13.0, 2.5], [13.0, 3.5], [12.5, 4.5], [12.0, 5.5],
          [12.0, 6.5], [11.0, 6.5], [10.5, 5.5], [10.0, 5.0],
          [10.0, 4.5], [10.2, 4.0], [10.5, 3.5],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { code: 'SU', name: 'Sud', nameEn: 'South' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [9.8, 2.0], [10.5, 2.0], [11.0, 2.0], [11.5, 2.0],
          [12.0, 2.0], [13.0, 2.5], [12.0, 3.0], [11.5, 3.0],
          [11.0, 3.3], [10.5, 3.5], [10.0, 3.2], [9.5, 2.8],
          [9.5, 2.5], [9.8, 2.0],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { code: 'LT', name: 'Littoral', nameEn: 'Littoral' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [9.4, 3.8], [10.0, 3.7], [10.2, 4.0], [10.0, 4.5],
          [10.0, 5.0], [9.6, 5.0], [9.5, 4.7], [9.3, 4.4],
          [9.3, 4.1], [9.4, 3.8],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { code: 'SW', name: 'Sud-Ouest', nameEn: 'Southwest' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [8.5, 4.2], [9.0, 4.0], [9.3, 4.1], [9.3, 4.4],
          [9.4, 4.7], [9.5, 5.0], [9.5, 5.3], [9.6, 5.6],
          [9.3, 5.8], [9.0, 5.8], [8.8, 5.5], [8.5, 5.2],
          [8.5, 4.8], [8.5, 4.2],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { code: 'NW', name: 'Nord-Ouest', nameEn: 'Northwest' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [9.6, 5.6], [10.0, 5.5], [10.5, 5.5], [10.5, 6.0],
          [10.5, 6.5], [10.5, 7.2], [10.2, 7.0], [9.8, 6.8],
          [9.6, 6.5], [9.5, 6.2], [9.3, 5.8], [9.6, 5.6],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { code: 'OU', name: 'Ouest', nameEn: 'West' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [9.6, 5.0], [10.0, 5.0], [10.0, 5.5], [9.6, 5.6],
          [9.5, 6.2], [9.6, 6.5], [9.8, 6.8], [10.2, 7.0],
          [10.5, 7.2], [10.0, 7.0], [9.5, 6.8], [9.0, 6.2],
          [9.0, 5.8], [9.5, 5.3], [9.6, 5.0],
        ]],
      },
    },
  ],
};

export default cameroonRegionsGeoJson;
