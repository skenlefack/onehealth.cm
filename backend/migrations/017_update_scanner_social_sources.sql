-- =====================================================
-- Migration 017: Update Scanner Social Media Sources
-- Enable Twitter/X and Facebook sources with proper config
-- Requires: TWITTER_BEARER_TOKEN and FACEBOOK_ACCESS_TOKEN env vars
-- =====================================================

-- Update Twitter/X source with proper search queries config
UPDATE cohrm_scan_sources
SET
  config = JSON_OBJECT(
    'search_queries', JSON_ARRAY(
      'cholera cameroun',
      'epidemie cameroun',
      'zoonose cameroun',
      'maladie infectieuse cameroun',
      'grippe aviaire cameroun',
      'fievre cameroun sante'
    )
  ),
  is_active = 1,
  scan_frequency = 30
WHERE name = 'Twitter/X Cameroun' AND type = 'twitter';

-- Update Facebook source with page IDs and search queries
UPDATE cohrm_scan_sources
SET
  config = JSON_OBJECT(
    'pages', JSON_ARRAY('MinSanteCameroun', 'OMS_Afrique', 'WHOCameroon'),
    'search_queries', JSON_ARRAY(
      'cholera cameroun',
      'epidemie cameroun',
      'zoonose cameroun'
    )
  ),
  is_active = 1,
  scan_frequency = 60
WHERE name = 'Facebook Public Health Pages' AND type = 'facebook';

-- Add social_scan_enabled setting if not exists
INSERT IGNORE INTO cohrm_settings (`key`, value, description)
VALUES ('scanner_social_scan_enabled', 'true', 'Enable/disable social media scanning (Twitter, Facebook)');
