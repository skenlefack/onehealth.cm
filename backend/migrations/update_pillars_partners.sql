-- Update pillars section with features
SET NAMES utf8mb4;

UPDATE homepage_sections SET
  content_fr = JSON_OBJECT(
    'title', 'Les 3 Piliers',
    'subtitle', 'Une approche integree de la sante',
    'show_features', true,
    'human_title', 'Sante Humaine',
    'human_description', 'Protection et amelioration de la sante des populations camerounaises.',
    'human_features', JSON_ARRAY('Surveillance epidemiologique', 'Prevention des maladies', 'Reponse aux urgences'),
    'animal_title', 'Sante Animale',
    'animal_description', 'Surveillance et controle des maladies animales, y compris les zoonoses.',
    'animal_features', JSON_ARRAY('Controle des zoonoses', 'Sante du betail', 'Faune sauvage'),
    'environment_title', 'Sante Environnementale',
    'environment_description', 'Preservation des ecosystemes et gestion durable des ressources naturelles.',
    'environment_features', JSON_ARRAY('Qualite de l''eau', 'Ecosystemes', 'Changement climatique')
  ),
  content_en = JSON_OBJECT(
    'title', 'The 3 Pillars',
    'subtitle', 'An integrated approach to health',
    'show_features', true,
    'human_title', 'Human Health',
    'human_description', 'Protection and improvement of Cameroonian population health.',
    'human_features', JSON_ARRAY('Epidemiological surveillance', 'Disease prevention', 'Emergency response'),
    'animal_title', 'Animal Health',
    'animal_description', 'Surveillance and control of animal diseases, including zoonoses.',
    'animal_features', JSON_ARRAY('Zoonoses control', 'Livestock health', 'Wildlife'),
    'environment_title', 'Environmental Health',
    'environment_description', 'Preservation of ecosystems and sustainable management of natural resources.',
    'environment_features', JSON_ARRAY('Water quality', 'Ecosystems', 'Climate change')
  )
WHERE section_key = 'pillars';

-- Update partners section with items array
UPDATE homepage_sections SET
  content_fr = JSON_OBJECT(
    'title', 'Nos Partenaires',
    'subtitle', 'Ensemble pour une seule sante',
    'items', JSON_ARRAY(
      JSON_OBJECT('name', 'SPM', 'logo', '/images/partners/spm1.png', 'url', 'https://www.spm.gov.cm'),
      JSON_OBJECT('name', 'MINSANTE', 'logo', '/images/partners/minsante.png', 'url', 'https://www.minsante.cm'),
      JSON_OBJECT('name', 'MINEPIA', 'logo', '/images/partners/minepia.png', 'url', 'https://www.minepia.cm'),
      JSON_OBJECT('name', 'MINEPDED', 'logo', '/images/partners/minepdep.png', 'url', 'https://www.minepded.cm'),
      JSON_OBJECT('name', 'MINTOUR', 'logo', '/images/partners/mintour.jpg', 'url', 'https://www.mintour.cm'),
      JSON_OBJECT('name', 'OMS', 'logo', '/images/partners/oms.png', 'url', 'https://www.who.int'),
      JSON_OBJECT('name', 'FAO', 'logo', '/images/partners/fao.png', 'url', 'https://www.fao.org'),
      JSON_OBJECT('name', 'CDC', 'logo', '/images/partners/cdc100.png', 'url', 'https://www.cdc.gov'),
      JSON_OBJECT('name', 'USAID', 'logo', '/images/partners/usaid.jpg', 'url', 'https://www.usaid.gov'),
      JSON_OBJECT('name', 'GIZ', 'logo', '/images/partners/giz.jpg', 'url', 'https://www.giz.de'),
      JSON_OBJECT('name', 'AFROHUN', 'logo', '/images/partners/afrohun100.png', 'url', 'https://afrohun.org'),
      JSON_OBJECT('name', 'DAI', 'logo', '/images/partners/dai.jpg', 'url', 'https://www.dai.com'),
      JSON_OBJECT('name', 'IFRC', 'logo', '/images/partners/ifrc.jpg', 'url', 'https://www.ifrc.org'),
      JSON_OBJECT('name', 'Breakthrough', 'logo', '/images/partners/breakthrough100.jpg', 'url', 'https://breakthroughactionandresearch.org')
    )
  ),
  content_en = JSON_OBJECT(
    'title', 'Our Partners',
    'subtitle', 'Together for one health',
    'items', JSON_ARRAY(
      JSON_OBJECT('name', 'SPM', 'logo', '/images/partners/spm1.png', 'url', 'https://www.spm.gov.cm'),
      JSON_OBJECT('name', 'MINSANTE', 'logo', '/images/partners/minsante.png', 'url', 'https://www.minsante.cm'),
      JSON_OBJECT('name', 'MINEPIA', 'logo', '/images/partners/minepia.png', 'url', 'https://www.minepia.cm'),
      JSON_OBJECT('name', 'MINEPDED', 'logo', '/images/partners/minepdep.png', 'url', 'https://www.minepded.cm'),
      JSON_OBJECT('name', 'MINTOUR', 'logo', '/images/partners/mintour.jpg', 'url', 'https://www.mintour.cm'),
      JSON_OBJECT('name', 'WHO', 'logo', '/images/partners/oms.png', 'url', 'https://www.who.int'),
      JSON_OBJECT('name', 'FAO', 'logo', '/images/partners/fao.png', 'url', 'https://www.fao.org'),
      JSON_OBJECT('name', 'CDC', 'logo', '/images/partners/cdc100.png', 'url', 'https://www.cdc.gov'),
      JSON_OBJECT('name', 'USAID', 'logo', '/images/partners/usaid.jpg', 'url', 'https://www.usaid.gov'),
      JSON_OBJECT('name', 'GIZ', 'logo', '/images/partners/giz.jpg', 'url', 'https://www.giz.de'),
      JSON_OBJECT('name', 'AFROHUN', 'logo', '/images/partners/afrohun100.png', 'url', 'https://afrohun.org'),
      JSON_OBJECT('name', 'DAI', 'logo', '/images/partners/dai.jpg', 'url', 'https://www.dai.com'),
      JSON_OBJECT('name', 'IFRC', 'logo', '/images/partners/ifrc.jpg', 'url', 'https://www.ifrc.org'),
      JSON_OBJECT('name', 'Breakthrough', 'logo', '/images/partners/breakthrough100.jpg', 'url', 'https://breakthroughactionandresearch.org')
    )
  )
WHERE section_key = 'partners';
