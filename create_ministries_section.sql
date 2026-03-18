-- Insert ministries section into homepage_sections
INSERT INTO homepage_sections (section_key, section_name, content_fr, content_en, is_active, sort_order, created_at, updated_at)
VALUES (
  'ministries',
  'Ministeres Sectoriels',
  JSON_OBJECT(
    'title', 'Ministeres Sectoriels du Programme',
    'subtitle', 'Les ministeres impliques dans la mise en oeuvre de l''approche One Health au Cameroun',
    'description', '',
    'show_description', false,
    'columns', 5,
    'ministries', JSON_ARRAY(
      JSON_OBJECT('icon', '🐄', 'color', '#007A33', 'name_fr', 'Elevage, Peches et Industries Animales', 'name_en', 'Livestock, Fisheries and Animal Industries', 'abbreviation', 'MINEPIA', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '🏥', 'color', '#2196F3', 'name_fr', 'Sante Publique', 'name_en', 'Public Health', 'abbreviation', 'MINSANTE', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '🌲', 'color', '#4CAF50', 'name_fr', 'Forets et Faune', 'name_en', 'Forestry and Wildlife', 'abbreviation', 'MINFOF', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '🌿', 'color', '#009688', 'name_fr', 'Environnement, Protection de la Nature et Developpement Durable', 'name_en', 'Environment, Nature Protection and Sustainable Development', 'abbreviation', 'MINEPDED', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '🔬', 'color', '#9C27B0', 'name_fr', 'Recherche Scientifique et Innovation', 'name_en', 'Scientific Research and Innovation', 'abbreviation', 'MINRESI', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '🎓', 'color', '#3F51B5', 'name_fr', 'Enseignement Superieur', 'name_en', 'Higher Education', 'abbreviation', 'MINESUP', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '🗺️', 'color', '#795548', 'name_fr', 'Administration Territoriale', 'name_en', 'Territorial Administration', 'abbreviation', 'MINAT', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '🏝️', 'color', '#00BCD4', 'name_fr', 'Tourisme et Loisirs', 'name_en', 'Tourism and Leisure', 'abbreviation', 'MINTOUL', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '🌾', 'color', '#8BC34A', 'name_fr', 'Agriculture et Developpement Rural', 'name_en', 'Agriculture and Rural Development', 'abbreviation', 'MINADER', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '📡', 'color', '#E91E63', 'name_fr', 'Communication', 'name_en', 'Communication', 'abbreviation', 'MINCOM', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '📈', 'color', '#FF9800', 'name_fr', 'Economie, Planification et Amenagement du Territoire', 'name_en', 'Economy, Planning and Territorial Development', 'abbreviation', 'MINEPAT', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '👥', 'color', '#607D8B', 'name_fr', 'Decentralisation et Developpement Local', 'name_en', 'Decentralization and Local Development', 'abbreviation', 'MINDDEVEL', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '🏭', 'color', '#673AB7', 'name_fr', 'Mines, Industrie et Developpement Technologique', 'name_en', 'Mines, Industry and Technological Development', 'abbreviation', 'MINMIDT', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '💰', 'color', '#FFC107', 'name_fr', 'Finances', 'name_en', 'Finance', 'abbreviation', 'MINFI', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '🛡️', 'color', '#F44336', 'name_fr', 'Defense', 'name_en', 'Defense', 'abbreviation', 'MINDEF', 'description_fr', '', 'description_en', '')
    )
  ),
  JSON_OBJECT(
    'title', 'Program Sectoral Ministries',
    'subtitle', 'Ministries involved in implementing the One Health approach in Cameroon',
    'description', '',
    'show_description', false,
    'columns', 5,
    'ministries', JSON_ARRAY(
      JSON_OBJECT('icon', '🐄', 'color', '#007A33', 'name_fr', 'Elevage, Peches et Industries Animales', 'name_en', 'Livestock, Fisheries and Animal Industries', 'abbreviation', 'MINEPIA', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '🏥', 'color', '#2196F3', 'name_fr', 'Sante Publique', 'name_en', 'Public Health', 'abbreviation', 'MINSANTE', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '🌲', 'color', '#4CAF50', 'name_fr', 'Forets et Faune', 'name_en', 'Forestry and Wildlife', 'abbreviation', 'MINFOF', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '🌿', 'color', '#009688', 'name_fr', 'Environnement, Protection de la Nature et Developpement Durable', 'name_en', 'Environment, Nature Protection and Sustainable Development', 'abbreviation', 'MINEPDED', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '🔬', 'color', '#9C27B0', 'name_fr', 'Recherche Scientifique et Innovation', 'name_en', 'Scientific Research and Innovation', 'abbreviation', 'MINRESI', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '🎓', 'color', '#3F51B5', 'name_fr', 'Enseignement Superieur', 'name_en', 'Higher Education', 'abbreviation', 'MINESUP', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '🗺️', 'color', '#795548', 'name_fr', 'Administration Territoriale', 'name_en', 'Territorial Administration', 'abbreviation', 'MINAT', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '🏝️', 'color', '#00BCD4', 'name_fr', 'Tourisme et Loisirs', 'name_en', 'Tourism and Leisure', 'abbreviation', 'MINTOUL', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '🌾', 'color', '#8BC34A', 'name_fr', 'Agriculture et Developpement Rural', 'name_en', 'Agriculture and Rural Development', 'abbreviation', 'MINADER', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '📡', 'color', '#E91E63', 'name_fr', 'Communication', 'name_en', 'Communication', 'abbreviation', 'MINCOM', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '📈', 'color', '#FF9800', 'name_fr', 'Economie, Planification et Amenagement du Territoire', 'name_en', 'Economy, Planning and Territorial Development', 'abbreviation', 'MINEPAT', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '👥', 'color', '#607D8B', 'name_fr', 'Decentralisation et Developpement Local', 'name_en', 'Decentralization and Local Development', 'abbreviation', 'MINDDEVEL', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '🏭', 'color', '#673AB7', 'name_fr', 'Mines, Industrie et Developpement Technologique', 'name_en', 'Mines, Industry and Technological Development', 'abbreviation', 'MINMIDT', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '💰', 'color', '#FFC107', 'name_fr', 'Finances', 'name_en', 'Finance', 'abbreviation', 'MINFI', 'description_fr', '', 'description_en', ''),
      JSON_OBJECT('icon', '🛡️', 'color', '#F44336', 'name_fr', 'Defense', 'name_en', 'Defense', 'abbreviation', 'MINDEF', 'description_fr', '', 'description_en', '')
    )
  ),
  1,
  25,
  NOW(),
  NOW()
);

SELECT 'Ministries section created!' as result, LAST_INSERT_ID() as id;
