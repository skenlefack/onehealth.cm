-- =====================================================
-- EXPERT ENHANCEMENTS MIGRATION
-- Adds expertise domains, experience, CV and social links
-- =====================================================

-- Expertise Domains Table (if not exists)
CREATE TABLE IF NOT EXISTS expertise_domains (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  slug VARCHAR(255) NOT NULL UNIQUE,
  category ENUM('human_health', 'animal_health', 'environmental_health', 'food_safety', 'epidemiology', 'laboratory', 'policy', 'communication', 'other') DEFAULT 'other',
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(20),
  parent_id INT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES expertise_domains(id) ON DELETE SET NULL
);

-- Junction table for Expert-Expertise relationship
CREATE TABLE IF NOT EXISTS expert_expertise (
  id INT PRIMARY KEY AUTO_INCREMENT,
  expert_id INT NOT NULL,
  expertise_domain_id INT NOT NULL,
  level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
  years_in_domain INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (expert_id) REFERENCES human_resources(id) ON DELETE CASCADE,
  FOREIGN KEY (expertise_domain_id) REFERENCES expertise_domains(id) ON DELETE CASCADE,
  UNIQUE KEY unique_expert_expertise (expert_id, expertise_domain_id)
);

-- Add new columns to human_resources table
ALTER TABLE human_resources
  ADD COLUMN IF NOT EXISTS years_experience INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cv_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS orcid_id VARCHAR(50),
  ADD COLUMN IF NOT EXISTS google_scholar_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS researchgate_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS website VARCHAR(255),
  ADD COLUMN IF NOT EXISTS languages JSON,
  ADD COLUMN IF NOT EXISTS education JSON,
  ADD COLUMN IF NOT EXISTS certifications JSON,
  ADD COLUMN IF NOT EXISTS publications_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS projects_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS awards TEXT,
  ADD COLUMN IF NOT EXISTS research_interests TEXT,
  ADD COLUMN IF NOT EXISTS available_for_collaboration BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS consultation_rate VARCHAR(100),
  ADD COLUMN IF NOT EXISTS expertise_summary TEXT;

-- Pre-populate One Health related expertise domains
INSERT INTO expertise_domains (name, name_en, slug, category, description, color, display_order) VALUES
-- Sante Humaine
('Epidemiologie humaine', 'Human Epidemiology', 'epidemiologie-humaine', 'human_health', 'Etude de la distribution et des determinants des maladies humaines', '#E74C3C', 1),
('Maladies infectieuses', 'Infectious Diseases', 'maladies-infectieuses', 'human_health', 'Diagnostic et traitement des maladies infectieuses', '#C0392B', 2),
('Sante publique', 'Public Health', 'sante-publique', 'human_health', 'Prevention et promotion de la sante des populations', '#E91E63', 3),
('Medecine tropicale', 'Tropical Medicine', 'medecine-tropicale', 'human_health', 'Maladies tropicales et medecine des voyages', '#9C27B0', 4),
('Parasitologie medicale', 'Medical Parasitology', 'parasitologie-medicale', 'human_health', 'Etude des parasites affectant l''homme', '#673AB7', 5),

-- Sante Animale
('Epidemiologie veterinaire', 'Veterinary Epidemiology', 'epidemiologie-veterinaire', 'animal_health', 'Etude des maladies animales et leur transmission', '#3498DB', 10),
('Zoonoses', 'Zoonoses', 'zoonoses', 'animal_health', 'Maladies transmissibles entre animaux et humains', '#2196F3', 11),
('Faune sauvage', 'Wildlife Health', 'faune-sauvage', 'animal_health', 'Sante de la faune sauvage et conservation', '#00BCD4', 12),
('Production animale', 'Animal Production', 'production-animale', 'animal_health', 'Elevage et production animale durable', '#009688', 13),
('Pathologie aviaire', 'Avian Pathology', 'pathologie-aviaire', 'animal_health', 'Maladies des oiseaux et volailles', '#4CAF50', 14),

-- Sante Environnementale
('Ecologie de la sante', 'Health Ecology', 'ecologie-sante', 'environmental_health', 'Interactions entre ecosystemes et sante', '#27AE60', 20),
('Changement climatique et sante', 'Climate Change & Health', 'changement-climatique-sante', 'environmental_health', 'Impact du climat sur la sante', '#2ECC71', 21),
('Qualite de l''eau', 'Water Quality', 'qualite-eau', 'environmental_health', 'Gestion et analyse de la qualite de l''eau', '#1ABC9C', 22),
('Pollution et sante', 'Pollution & Health', 'pollution-sante', 'environmental_health', 'Impact de la pollution sur la sante', '#16A085', 23),
('Biodiversite et sante', 'Biodiversity & Health', 'biodiversite-sante', 'environmental_health', 'Lien entre biodiversite et sante', '#8BC34A', 24),

-- Securite Alimentaire
('Securite sanitaire des aliments', 'Food Safety', 'securite-sanitaire-aliments', 'food_safety', 'Prevention des risques alimentaires', '#F39C12', 30),
('Microbiologie alimentaire', 'Food Microbiology', 'microbiologie-alimentaire', 'food_safety', 'Micro-organismes dans les aliments', '#E67E22', 31),
('Toxicologie alimentaire', 'Food Toxicology', 'toxicologie-alimentaire', 'food_safety', 'Substances toxiques dans l''alimentation', '#D35400', 32),
('Nutrition et sante', 'Nutrition & Health', 'nutrition-sante', 'food_safety', 'Lien entre alimentation et sante', '#FF9800', 33),

-- Laboratoire
('Diagnostic moleculaire', 'Molecular Diagnostics', 'diagnostic-moleculaire', 'laboratory', 'Techniques PCR et sequencage', '#9B59B6', 40),
('Bacteriologie', 'Bacteriology', 'bacteriologie', 'laboratory', 'Analyse bacteriologique', '#8E44AD', 41),
('Virologie', 'Virology', 'virologie', 'laboratory', 'Etude des virus', '#7B1FA2', 42),
('Serologie', 'Serology', 'serologie', 'laboratory', 'Tests serologiques et immunologie', '#6A1B9A', 43),
('Bioinformatique', 'Bioinformatics', 'bioinformatique', 'laboratory', 'Analyse de donnees biologiques', '#4A148C', 44),

-- Epidemiologie
('Surveillance epidemiologique', 'Epidemiological Surveillance', 'surveillance-epidemiologique', 'epidemiology', 'Systemes de surveillance des maladies', '#3F51B5', 50),
('Modelisation epidemique', 'Epidemic Modeling', 'modelisation-epidemique', 'epidemiology', 'Modeles mathematiques des epidemies', '#303F9F', 51),
('Investigation d''epidemies', 'Outbreak Investigation', 'investigation-epidemies', 'epidemiology', 'Enquetes sur les epidemies', '#1A237E', 52),
('Biostatistiques', 'Biostatistics', 'biostatistiques', 'epidemiology', 'Analyse statistique en sante', '#5C6BC0', 53),

-- Politique et Communication
('Politique sanitaire', 'Health Policy', 'politique-sanitaire', 'policy', 'Elaboration de politiques de sante', '#607D8B', 60),
('Reglementation sanitaire', 'Health Regulation', 'reglementation-sanitaire', 'policy', 'Cadres reglementaires en sante', '#455A64', 61),
('Communication en sante', 'Health Communication', 'communication-sante', 'communication', 'Communication sur les risques sanitaires', '#78909C', 62),
('Formation One Health', 'One Health Training', 'formation-one-health', 'communication', 'Education et formation en One Health', '#90A4AE', 63),
('Coordination intersectorielle', 'Intersectoral Coordination', 'coordination-intersectorielle', 'policy', 'Collaboration entre secteurs', '#B0BEC5', 64),

-- Autres
('Gestion de projet sante', 'Health Project Management', 'gestion-projet-sante', 'other', 'Gestion de projets en sante', '#795548', 70),
('Recherche operationnelle', 'Operational Research', 'recherche-operationnelle', 'other', 'Recherche appliquee en sante', '#5D4037', 71),
('Systemes d''information sanitaire', 'Health Information Systems', 'systemes-information-sanitaire', 'other', 'Gestion des donnees de sante', '#4E342E', 72),
('Economie de la sante', 'Health Economics', 'economie-sante', 'other', 'Analyse economique en sante', '#3E2723', 73)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_expertise_category ON expertise_domains(category);
CREATE INDEX IF NOT EXISTS idx_expert_expertise_expert ON expert_expertise(expert_id);
CREATE INDEX IF NOT EXISTS idx_expert_expertise_domain ON expert_expertise(expertise_domain_id);
