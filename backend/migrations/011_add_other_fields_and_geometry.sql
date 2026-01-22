-- =====================================================
-- Migration: Ajout des champs "Autre" et Géométrie
-- Pour le formulaire de rumeur COHRM
-- =====================================================

-- Ajouter les champs "autre" pour les valeurs personnalisées
ALTER TABLE cohrm_rumors
  ADD COLUMN category_other VARCHAR(255) COMMENT 'Valeur personnalisée si category=other' AFTER category,
  ADD COLUMN source_type_other VARCHAR(255) COMMENT 'Valeur personnalisée si source_type=other' AFTER source_type,
  ADD COLUMN reporter_type_other VARCHAR(255) COMMENT 'Valeur personnalisée si reporter_type=other' AFTER reporter_type;

-- Ajouter les champs de géométrie pour point/tracé/polygone
ALTER TABLE cohrm_rumors
  ADD COLUMN geometry_type ENUM('point', 'line', 'polygon') DEFAULT 'point' COMMENT 'Type de géométrie: point, tracé ou polygone' AFTER longitude,
  ADD COLUMN geometry_data JSON COMMENT 'Données géométriques (coordonnées du tracé ou polygone)' AFTER geometry_type;

-- Ajouter 'other' à l'ENUM reporter_type si pas déjà présent
-- Note: MySQL nécessite de recréer la colonne pour modifier l'ENUM
ALTER TABLE cohrm_rumors
  MODIFY COLUMN reporter_type ENUM('community', 'health_worker', 'vet', 'official', 'agent', 'anonymous', 'other') DEFAULT 'anonymous' COMMENT 'Type de déclarant';
