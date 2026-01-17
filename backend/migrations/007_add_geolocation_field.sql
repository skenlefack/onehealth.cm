-- =====================================================
-- Migration: Ajouter le champ geolocation
-- Permet de stocker des données GPS complexes (point, tracé, polygone)
-- =====================================================

-- Ajouter geolocation à organizations
ALTER TABLE organizations
ADD COLUMN geolocation JSON NULL COMMENT 'Données GPS: {type: point|polyline|polygon, coordinates: [...]}';

-- Ajouter geolocation à material_resources
ALTER TABLE material_resources
ADD COLUMN geolocation JSON NULL COMMENT 'Données GPS: {type: point|polyline|polygon, coordinates: [...]}';

-- Ajouter image à material_resources si non existant
ALTER TABLE material_resources
ADD COLUMN IF NOT EXISTS image VARCHAR(500) NULL COMMENT 'URL de l''image principale';
