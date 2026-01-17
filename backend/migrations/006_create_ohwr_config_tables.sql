-- =====================================================
-- OHWR-MAPPING Configuration Tables
-- Permet de gérer dynamiquement les types et catégories
-- =====================================================

-- Table pour les types de matériel
CREATE TABLE IF NOT EXISTS ohwr_material_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'box',
  color VARCHAR(7) DEFAULT '#3498DB',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table pour les types d'organisation
CREATE TABLE IF NOT EXISTS ohwr_organization_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'building',
  color VARCHAR(7) DEFAULT '#E67E22',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table pour les types de document
CREATE TABLE IF NOT EXISTS ohwr_document_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'file-text',
  color VARCHAR(7) DEFAULT '#9B59B6',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table pour les catégories d'experts (domaines d'expertise categories)
CREATE TABLE IF NOT EXISTS ohwr_expert_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'user',
  color VARCHAR(7) DEFAULT '#27AE60',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- Données initiales - Types de matériel
-- =====================================================
INSERT INTO ohwr_material_types (name, name_en, slug, icon, color, display_order) VALUES
('Laboratoire', 'Laboratory', 'laboratory', 'flask-conical', '#9B59B6', 1),
('Équipement', 'Equipment', 'equipment', 'cog', '#3498DB', 2),
('Infrastructure', 'Infrastructure', 'infrastructure', 'building-2', '#27AE60', 3),
('Véhicule', 'Vehicle', 'vehicle', 'car', '#E67E22', 4),
('Stockage', 'Storage', 'storage', 'warehouse', '#64748b', 5)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- =====================================================
-- Données initiales - Types d'organisation
-- =====================================================
INSERT INTO ohwr_organization_types (name, name_en, slug, icon, color, display_order) VALUES
('Gouvernement', 'Government', 'government', 'landmark', '#E74C3C', 1),
('Académique', 'Academic', 'academic', 'graduation-cap', '#3498DB', 2),
('International', 'International', 'international', 'globe', '#9B59B6', 3),
('ONG', 'NGO', 'ngo', 'heart-handshake', '#27AE60', 4),
('Réseau', 'Network', 'network', 'network', '#F39C12', 5),
('Privé', 'Private', 'private', 'briefcase', '#64748b', 6)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- =====================================================
-- Données initiales - Types de document
-- =====================================================
INSERT INTO ohwr_document_types (name, name_en, slug, icon, color, display_order) VALUES
('Guide', 'Guide', 'guide', 'book-open', '#27AE60', 1),
('Protocole', 'Protocol', 'protocol', 'clipboard-list', '#3498DB', 2),
('Article Scientifique', 'Scientific Article', 'article', 'file-text', '#9B59B6', 3),
('Thèse / Mémoire', 'Thesis / Dissertation', 'thesis', 'graduation-cap', '#E67E22', 4),
('Sensibilisation', 'Awareness Material', 'awareness', 'megaphone', '#F39C12', 5),
('Formation', 'Training Material', 'training', 'presentation', '#00BCD4', 6),
('Rapport', 'Report', 'report', 'file-bar-chart', '#64748b', 7),
('Autre', 'Other', 'other', 'file', '#94a3b8', 8)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- =====================================================
-- Données initiales - Catégories d'experts
-- =====================================================
INSERT INTO ohwr_expert_categories (name, name_en, slug, icon, color, display_order) VALUES
('Santé Humaine', 'Human Health', 'health_human', 'heart-pulse', '#E74C3C', 1),
('Santé Animale', 'Animal Health', 'health_animal', 'paw-print', '#27AE60', 2),
('Environnement', 'Environment', 'environment', 'leaf', '#2ECC71', 3),
('Laboratoire', 'Laboratory', 'laboratory', 'flask-conical', '#9B59B6', 4),
('Coordination', 'Coordination', 'coordination', 'users', '#3498DB', 5)
ON DUPLICATE KEY UPDATE name = VALUES(name);
