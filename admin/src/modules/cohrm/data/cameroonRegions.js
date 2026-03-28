/**
 * GeoJSON simplifié des 10 régions du Cameroun
 * Coordonnées simplifiées pour affichage cartographique
 * Chaque Feature.properties.code correspond à REGIONS_CAMEROON[].code
 */

const cameroonRegions = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { code: 'EN', name: 'Extrême-Nord', nameEn: 'Far North', capital: 'Maroua' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [14.0, 10.0], [14.2, 10.3], [14.5, 10.5], [14.8, 10.8], [15.0, 11.0],
          [15.1, 11.5], [15.0, 12.0], [14.8, 12.5], [14.5, 12.8], [14.2, 13.0],
          [14.0, 13.1], [13.8, 13.0], [13.5, 12.8], [13.3, 12.5], [13.2, 12.0],
          [13.3, 11.5], [13.5, 11.0], [13.7, 10.5], [13.9, 10.2], [14.0, 10.0]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { code: 'NO', name: 'Nord', nameEn: 'North', capital: 'Garoua' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [13.0, 8.5], [13.3, 8.6], [13.7, 8.8], [14.0, 9.0], [14.5, 9.2],
          [14.8, 9.5], [15.0, 9.8], [15.0, 10.0], [14.8, 10.2], [14.5, 10.3],
          [14.0, 10.0], [13.9, 10.2], [13.7, 10.5], [13.5, 11.0], [13.3, 11.0],
          [13.0, 10.5], [12.8, 10.0], [12.8, 9.5], [12.9, 9.0], [13.0, 8.5]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { code: 'AD', name: 'Adamaoua', nameEn: 'Adamawa', capital: 'Ngaoundéré' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [11.0, 6.5], [11.5, 6.6], [12.0, 6.8], [12.5, 7.0], [13.0, 7.2],
          [13.5, 7.5], [14.0, 7.8], [14.5, 8.0], [15.0, 8.2], [15.0, 8.5],
          [14.5, 8.5], [14.0, 8.5], [13.5, 8.5], [13.0, 8.5], [12.9, 9.0],
          [12.8, 9.0], [12.5, 8.5], [12.0, 8.0], [11.5, 7.5], [11.0, 7.2],
          [10.8, 7.0], [11.0, 6.5]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { code: 'ES', name: 'Est', nameEn: 'East', capital: 'Bertoua' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [13.2, 2.0], [13.5, 2.2], [14.0, 2.5], [14.5, 3.0], [15.0, 3.5],
          [15.5, 4.0], [16.0, 4.5], [16.2, 5.0], [16.0, 5.5], [15.5, 6.0],
          [15.0, 6.5], [15.0, 7.0], [15.0, 7.5], [15.0, 8.0], [14.5, 8.0],
          [14.0, 7.8], [13.5, 7.5], [13.0, 7.2], [12.5, 7.0], [12.0, 6.5],
          [12.0, 6.0], [12.5, 5.5], [13.0, 5.0], [13.5, 4.5], [13.5, 4.0],
          [13.3, 3.5], [13.2, 3.0], [13.2, 2.0]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { code: 'CE', name: 'Centre', nameEn: 'Centre', capital: 'Yaoundé' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [10.5, 3.5], [10.8, 3.6], [11.0, 3.8], [11.5, 4.0], [12.0, 4.2],
          [12.5, 4.5], [13.0, 5.0], [12.5, 5.5], [12.0, 6.0], [12.0, 6.5],
          [11.5, 6.6], [11.0, 6.5], [10.8, 7.0], [10.5, 6.8], [10.2, 6.5],
          [10.0, 6.0], [9.8, 5.5], [9.8, 5.0], [10.0, 4.5], [10.2, 4.0],
          [10.5, 3.5]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { code: 'SU', name: 'Sud', nameEn: 'South', capital: 'Ebolowa' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [9.8, 2.0], [10.0, 2.1], [10.5, 2.2], [11.0, 2.3], [11.5, 2.2],
          [12.0, 2.1], [12.5, 2.0], [13.0, 2.0], [13.2, 2.0], [13.2, 2.5],
          [13.0, 3.0], [12.5, 3.5], [12.0, 4.0], [11.5, 4.0], [11.0, 3.8],
          [10.8, 3.6], [10.5, 3.5], [10.2, 3.5], [10.0, 3.3], [9.8, 3.0],
          [9.7, 2.5], [9.8, 2.0]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { code: 'LT', name: 'Littoral', nameEn: 'Littoral', capital: 'Douala' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [9.3, 3.8], [9.5, 3.9], [9.7, 4.0], [9.8, 4.2], [10.0, 4.5],
          [10.2, 4.8], [10.0, 5.0], [9.8, 5.0], [9.5, 5.0], [9.5, 5.2],
          [9.3, 5.0], [9.2, 4.8], [9.0, 4.5], [9.0, 4.2], [9.1, 4.0],
          [9.3, 3.8]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { code: 'OU', name: 'Ouest', nameEn: 'West', capital: 'Bafoussam' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [9.8, 5.0], [10.0, 5.0], [10.2, 5.0], [10.2, 5.3], [10.2, 5.5],
          [10.2, 5.8], [10.2, 6.0], [10.0, 6.0], [9.8, 5.8], [9.5, 5.8],
          [9.5, 5.5], [9.5, 5.2], [9.5, 5.0], [9.8, 5.0]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { code: 'NW', name: 'Nord-Ouest', nameEn: 'Northwest', capital: 'Bamenda' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [9.5, 5.8], [9.8, 5.8], [10.0, 6.0], [10.2, 6.0], [10.2, 6.3],
          [10.2, 6.5], [10.5, 6.8], [10.3, 7.0], [10.0, 7.0], [9.8, 6.8],
          [9.5, 6.5], [9.3, 6.3], [9.3, 6.0], [9.5, 5.8]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { code: 'SW', name: 'Sud-Ouest', nameEn: 'Southwest', capital: 'Buéa' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [8.5, 4.0], [8.7, 4.2], [9.0, 4.5], [9.2, 4.8], [9.3, 5.0],
          [9.5, 5.2], [9.5, 5.5], [9.5, 5.8], [9.3, 6.0], [9.0, 6.0],
          [8.8, 5.8], [8.5, 5.5], [8.3, 5.2], [8.4, 5.0], [8.5, 4.8],
          [8.5, 4.5], [8.4, 4.2], [8.5, 4.0]
        ]]
      }
    },
  ],
};

export default cameroonRegions;
