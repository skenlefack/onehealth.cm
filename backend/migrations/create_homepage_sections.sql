-- Table pour stocker les sections de la page d'accueil
CREATE TABLE IF NOT EXISTS homepage_sections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  section_key VARCHAR(50) NOT NULL UNIQUE,
  section_name VARCHAR(100) NOT NULL,
  content_fr JSON,
  content_en JSON,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insérer les sections par défaut
INSERT INTO homepage_sections (section_key, section_name, content_fr, content_en, sort_order) VALUES
('hero', 'Section Hero',
  JSON_OBJECT(
    'badge', 'Plateforme Nationale Active',
    'title1', 'Une Seule Santé',
    'title2', 'pour le Cameroun',
    'description', 'Une approche intégrée et unifiée visant à équilibrer et optimiser durablement la santé des personnes, des animaux et des écosystèmes.',
    'discover_btn', 'Découvrir',
    'news_btn', 'Actualités',
    'ministries_label', 'Ministères',
    'ministries_value', '09',
    'zoonoses_label', 'Zoonoses',
    'zoonoses_value', '05',
    'partners_label', 'Partenaires',
    'partners_value', '10+',
    'image', '/images/onehealthnationalstrategy.jpg'
  ),
  JSON_OBJECT(
    'badge', 'Active National Platform',
    'title1', 'One Health',
    'title2', 'for Cameroon',
    'description', 'An integrated and unified approach to sustainably balance and optimize the health of people, animals and ecosystems.',
    'discover_btn', 'Discover',
    'news_btn', 'News',
    'ministries_label', 'Ministries',
    'ministries_value', '09',
    'zoonoses_label', 'Zoonoses',
    'zoonoses_value', '05',
    'partners_label', 'Partners',
    'partners_value', '10+',
    'image', '/images/onehealthnationalstrategy.jpg'
  ),
  1
),

('editor_note', 'Note de l''Éditeur',
  JSON_OBJECT(
    'title', 'Note de l''Éditeur',
    'name', 'Dr Conrad Ntoh Nkuo',
    'role', 'Secrétaire Permanent',
    'message', 'Bienvenue sur la Plateforme Une Seule Santé du Cameroun. Ensemble, construisons un avenir plus sain pour notre nation.',
    'image', '/images/note_editeur.jpg'
  ),
  JSON_OBJECT(
    'title', 'Editor''s Note',
    'name', 'Dr Conrad Ntoh Nkuo',
    'role', 'Permanent Secretary',
    'message', 'Welcome to the One Health Cameroon Platform. Together, let''s build a healthier future for our nation.',
    'image', '/images/note_editeur.jpg'
  ),
  2
),

('pillars', 'Les 4 Piliers',
  JSON_OBJECT(
    'title', 'Les 4 Piliers',
    'subtitle', 'Une approche intégrée de la santé',
    'human_title', 'Santé Humaine',
    'human_description', 'Protection et amélioration de la santé des populations camerounaises.',
    'animal_title', 'Santé Animale',
    'animal_description', 'Surveillance et contrôle des maladies animales, y compris les zoonoses.',
    'environment_title', 'Santé Environnementale',
    'environment_description', 'Préservation des écosystèmes et gestion durable des ressources naturelles.'
  ),
  JSON_OBJECT(
    'title', 'The 4 Pillars',
    'subtitle', 'An integrated approach to health',
    'human_title', 'Human Health',
    'human_description', 'Protection and improvement of Cameroonian population health.',
    'animal_title', 'Animal Health',
    'animal_description', 'Surveillance and control of animal diseases, including zoonoses.',
    'environment_title', 'Environmental Health',
    'environment_description', 'Preservation of ecosystems and sustainable management of natural resources.'
  ),
  3
),

('implementation', 'Stratégie de Mise en Œuvre',
  JSON_OBJECT(
    'title', 'Stratégie de Mise en Œuvre',
    'subtitle', 'Notre approche pour une santé intégrée',
    'coordination_title', 'Coordination Multisectorielle',
    'coordination_description', 'Collaboration entre ministères et partenaires pour une réponse unifiée.',
    'surveillance_title', 'Surveillance Intégrée',
    'surveillance_description', 'Système de surveillance des maladies à l''interface homme-animal-environnement.',
    'capacity_title', 'Renforcement des Capacités',
    'capacity_description', 'Formation et équipement des professionnels de santé.',
    'communication_title', 'Communication',
    'communication_description', 'Sensibilisation du public et partage d''informations.'
  ),
  JSON_OBJECT(
    'title', 'Implementation Strategy',
    'subtitle', 'Our approach to integrated health',
    'coordination_title', 'Multi-sectoral Coordination',
    'coordination_description', 'Collaboration between ministries and partners for a unified response.',
    'surveillance_title', 'Integrated Surveillance',
    'surveillance_description', 'Disease surveillance system at the human-animal-environment interface.',
    'capacity_title', 'Capacity Building',
    'capacity_description', 'Training and equipping health professionals.',
    'communication_title', 'Communication',
    'communication_description', 'Public awareness and information sharing.'
  ),
  4
),

('zoonoses', 'Zoonoses Prioritaires',
  JSON_OBJECT(
    'title', 'Zoonoses Prioritaires',
    'subtitle', 'Les maladies sous surveillance',
    'items', JSON_ARRAY(
      JSON_OBJECT('name', 'Rage', 'description', 'Maladie virale mortelle transmise par morsure d''animal infecté', 'status', 'Surveillance active', 'cases', '150+ cas/an'),
      JSON_OBJECT('name', 'Grippe Aviaire', 'description', 'Virus influenza affectant les oiseaux et potentiellement l''homme', 'status', 'Alerte', 'cases', 'Foyers détectés'),
      JSON_OBJECT('name', 'Anthrax', 'description', 'Infection bactérienne grave touchant le bétail et l''homme', 'status', 'Endémique', 'cases', '50+ cas/an'),
      JSON_OBJECT('name', 'Tuberculose Bovine', 'description', 'Maladie chronique transmissible du bétail à l''homme', 'status', 'Surveillance', 'cases', 'Données en cours'),
      JSON_OBJECT('name', 'Brucellose', 'description', 'Infection bactérienne transmise par les animaux d''élevage', 'status', 'Endémique', 'cases', '100+ cas/an')
    )
  ),
  JSON_OBJECT(
    'title', 'Priority Zoonoses',
    'subtitle', 'Diseases under surveillance',
    'items', JSON_ARRAY(
      JSON_OBJECT('name', 'Rabies', 'description', 'Fatal viral disease transmitted by bite from infected animal', 'status', 'Active surveillance', 'cases', '150+ cases/year'),
      JSON_OBJECT('name', 'Avian Flu', 'description', 'Influenza virus affecting birds and potentially humans', 'status', 'Alert', 'cases', 'Outbreaks detected'),
      JSON_OBJECT('name', 'Anthrax', 'description', 'Serious bacterial infection affecting livestock and humans', 'status', 'Endemic', 'cases', '50+ cases/year'),
      JSON_OBJECT('name', 'Bovine TB', 'description', 'Chronic disease transmissible from cattle to humans', 'status', 'Surveillance', 'cases', 'Data ongoing'),
      JSON_OBJECT('name', 'Brucellosis', 'description', 'Bacterial infection transmitted by livestock', 'status', 'Endemic', 'cases', '100+ cases/year')
    )
  ),
  5
),

('partners', 'Nos Partenaires',
  JSON_OBJECT(
    'title', 'Nos Partenaires',
    'subtitle', 'Ensemble pour une seule santé',
    'items', JSON_ARRAY(
      JSON_OBJECT('name', 'SPM', 'logo', '/images/logos/spm1.png'),
      JSON_OBJECT('name', 'MINSANTE', 'logo', '/images/logos/minsante.png'),
      JSON_OBJECT('name', 'MINEPIA', 'logo', '/images/logos/minepia.png'),
      JSON_OBJECT('name', 'MINEPDED', 'logo', '/images/logos/minepded.jpg'),
      JSON_OBJECT('name', 'MINTOUR', 'logo', '/images/logos/mintour.png'),
      JSON_OBJECT('name', 'OMS', 'logo', '/images/logos/oms.png'),
      JSON_OBJECT('name', 'FAO', 'logo', '/images/logos/fao.png'),
      JSON_OBJECT('name', 'CDC', 'logo', '/images/logos/cdc.png'),
      JSON_OBJECT('name', 'USAID', 'logo', '/images/logos/usaid.png'),
      JSON_OBJECT('name', 'GIZ', 'logo', '/images/logos/giz.png'),
      JSON_OBJECT('name', 'AFROHUN', 'logo', '/images/logos/afrohun.jpg'),
      JSON_OBJECT('name', 'DAI', 'logo', '/images/logos/dai.png'),
      JSON_OBJECT('name', 'IFRC', 'logo', '/images/logos/ifrc.png'),
      JSON_OBJECT('name', 'Breakthrough', 'logo', '/images/logos/breakthrough.png')
    )
  ),
  JSON_OBJECT(
    'title', 'Our Partners',
    'subtitle', 'Together for one health',
    'items', JSON_ARRAY(
      JSON_OBJECT('name', 'SPM', 'logo', '/images/logos/spm1.png'),
      JSON_OBJECT('name', 'MINSANTE', 'logo', '/images/logos/minsante.png'),
      JSON_OBJECT('name', 'MINEPIA', 'logo', '/images/logos/minepia.png'),
      JSON_OBJECT('name', 'MINEPDED', 'logo', '/images/logos/minepded.jpg'),
      JSON_OBJECT('name', 'MINTOUR', 'logo', '/images/logos/mintour.png'),
      JSON_OBJECT('name', 'WHO', 'logo', '/images/logos/oms.png'),
      JSON_OBJECT('name', 'FAO', 'logo', '/images/logos/fao.png'),
      JSON_OBJECT('name', 'CDC', 'logo', '/images/logos/cdc.png'),
      JSON_OBJECT('name', 'USAID', 'logo', '/images/logos/usaid.png'),
      JSON_OBJECT('name', 'GIZ', 'logo', '/images/logos/giz.png'),
      JSON_OBJECT('name', 'AFROHUN', 'logo', '/images/logos/afrohun.jpg'),
      JSON_OBJECT('name', 'DAI', 'logo', '/images/logos/dai.png'),
      JSON_OBJECT('name', 'IFRC', 'logo', '/images/logos/ifrc.png'),
      JSON_OBJECT('name', 'Breakthrough', 'logo', '/images/logos/breakthrough.png')
    )
  ),
  6
);
