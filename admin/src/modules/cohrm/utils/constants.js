/**
 * COHRM - Constantes du système de gestion des rumeurs
 * Cameroon One Health Rumor Management System
 */

// ============================================
// STATUTS DES RUMEURS
// ============================================
export const RUMOR_STATUS = {
  PENDING: 'pending',
  INVESTIGATING: 'investigating',
  CONFIRMED: 'confirmed',
  FALSE_ALARM: 'false_alarm',
  CLOSED: 'closed',
};

export const STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente', labelEn: 'Pending', color: '#3498DB', bgColor: '#EBF5FB' },
  { value: 'investigating', label: 'En investigation', labelEn: 'Investigating', color: '#F39C12', bgColor: '#FEF9E7' },
  { value: 'confirmed', label: 'Confirmée', labelEn: 'Confirmed', color: '#E74C3C', bgColor: '#FDEDEC' },
  { value: 'false_alarm', label: 'Fausse alerte', labelEn: 'False alarm', color: '#95A5A6', bgColor: '#F2F3F4' },
  { value: 'closed', label: 'Clôturée', labelEn: 'Closed', color: '#27AE60', bgColor: '#EAFAF1' },
];

// ============================================
// PRIORITÉS
// ============================================
export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Basse', labelEn: 'Low', color: '#27AE60', bgColor: '#EAFAF1' },
  { value: 'medium', label: 'Moyenne', labelEn: 'Medium', color: '#F39C12', bgColor: '#FEF9E7' },
  { value: 'high', label: 'Haute', labelEn: 'High', color: '#E67E22', bgColor: '#FDF2E9' },
  { value: 'critical', label: 'Critique', labelEn: 'Critical', color: '#E74C3C', bgColor: '#FDEDEC' },
];

// ============================================
// SOURCES DE RUMEURS
// ============================================
export const SOURCE_OPTIONS = [
  { value: 'direct', label: 'Signalement direct', labelEn: 'Direct report', icon: 'Phone' },
  { value: 'field', label: 'Agent de terrain', labelEn: 'Field agent', icon: 'MapPin' },
  { value: 'sms', label: 'SMS', labelEn: 'SMS', icon: 'MessageCircle' },
  { value: 'mobile', label: 'Application mobile', labelEn: 'Mobile app', icon: 'Smartphone' },
  { value: 'web', label: 'Formulaire web', labelEn: 'Web form', icon: 'Globe' },
  { value: 'scanner', label: 'Scanner web', labelEn: 'Web scanner', icon: 'Radar' },
  { value: 'social_media', label: 'Réseaux sociaux', labelEn: 'Social media', icon: 'Share2' },
  { value: 'media', label: 'Médias', labelEn: 'Media', icon: 'Radio' },
];

// ============================================
// NIVEAUX DE RISQUE
// ============================================
export const RISK_LEVELS = [
  { value: 'unknown', label: 'Non évalué', labelEn: 'Not assessed', color: '#BDC3C7', bgColor: '#F2F3F4', icon: 'HelpCircle' },
  { value: 'low', label: 'Faible', labelEn: 'Low', color: '#27AE60', bgColor: '#EAFAF1', icon: 'Shield' },
  { value: 'moderate', label: 'Modéré', labelEn: 'Moderate', color: '#F39C12', bgColor: '#FEF9E7', icon: 'AlertCircle' },
  { value: 'high', label: 'Élevé', labelEn: 'High', color: '#E67E22', bgColor: '#FDF2E9', icon: 'AlertTriangle' },
  { value: 'very_high', label: 'Très élevé', labelEn: 'Very high', color: '#E74C3C', bgColor: '#FDEDEC', icon: 'Siren' },
];

// ============================================
// NIVEAUX D'EXPOSITION
// ============================================
export const EXPOSURE_LEVELS = [
  { value: 'individual', label: 'Individuel', labelEn: 'Individual', icon: 'User', description: '1 personne affectée' },
  { value: 'group', label: 'Groupe', labelEn: 'Group', icon: 'Users', description: 'Plusieurs personnes' },
  { value: 'community', label: 'Communauté', labelEn: 'Community', icon: 'Home', description: 'Communauté locale' },
  { value: 'regional', label: 'Régional', labelEn: 'Regional', icon: 'Map', description: 'Niveau régional' },
  { value: 'national', label: 'National', labelEn: 'National', icon: 'Flag', description: 'Niveau national' },
];

// ============================================
// CATÉGORIES DE RUMEURS (Fiche officielle)
// ============================================
export const RUMOR_CATEGORIES = [
  { value: 'human_health', label: 'Santé humaine', labelEn: 'Human health', icon: 'Heart', color: '#E74C3C' },
  { value: 'animal_health', label: 'Santé animale', labelEn: 'Animal health', icon: 'Bug', color: '#9B59B6' },
  { value: 'environmental', label: 'Santé environnement', labelEn: 'Environmental', icon: 'Leaf', color: '#27AE60' },
  { value: 'safety', label: 'Sécurité', labelEn: 'Safety', icon: 'AlertTriangle', color: '#E67E22' },
  { value: 'disaster', label: 'Catastrophe', labelEn: 'Disaster', icon: 'Siren', color: '#3498DB' },
  { value: 'other', label: 'Autre', labelEn: 'Other', icon: 'AlertCircle', color: '#95A5A6' },
];

// ============================================
// CODES SMS - SYMPTÔMES
// ============================================
export const SYMPTOM_CODES = {
  FI: { label: 'Fièvre', labelEn: 'Fever' },
  VO: { label: 'Vomissements', labelEn: 'Vomiting' },
  DI: { label: 'Diarrhée', labelEn: 'Diarrhea' },
  TO: { label: 'Toux', labelEn: 'Cough' },
  ER: { label: 'Éruption cutanée', labelEn: 'Skin rash' },
  HE: { label: 'Hémorragie', labelEn: 'Hemorrhage' },
  PA: { label: 'Paralysie', labelEn: 'Paralysis' },
  MO: { label: 'Mortalité', labelEn: 'Mortality' },
  AB: { label: 'Avortement', labelEn: 'Abortion' },
  RE: { label: 'Problèmes respiratoires', labelEn: 'Respiratory issues' },
  NE: { label: 'Symptômes neurologiques', labelEn: 'Neurological symptoms' },
  OE: { label: 'Oedèmes', labelEn: 'Edema' },
};

// ============================================
// CODES SMS - ESPÈCES
// ============================================
export const SPECIES_CODES = {
  HUM: { label: 'Humain', labelEn: 'Human' },
  BOV: { label: 'Bovin', labelEn: 'Bovine' },
  OVI: { label: 'Ovin/Caprin', labelEn: 'Sheep/Goat' },
  VOL: { label: 'Volaille', labelEn: 'Poultry' },
  POR: { label: 'Porcin', labelEn: 'Swine' },
  SAU: { label: 'Faune sauvage', labelEn: 'Wildlife' },
  CHI: { label: 'Chien/Chat', labelEn: 'Dog/Cat' },
  AUT: { label: 'Autre', labelEn: 'Other' },
};

// ============================================
// CODES SMS - ÉVÉNEMENTS
// ============================================
export const EVENT_CODES = {
  MAL: { label: 'Maladie suspecte', labelEn: 'Suspected disease' },
  MOR: { label: 'Mortalité anormale', labelEn: 'Abnormal mortality' },
  EPI: { label: 'Épidémie suspectée', labelEn: 'Suspected epidemic' },
  ZOO: { label: 'Zoonose suspectée', labelEn: 'Suspected zoonosis' },
  INT: { label: 'Intoxication', labelEn: 'Intoxication' },
  ENV: { label: 'Événement environnemental', labelEn: 'Environmental event' },
};

// ============================================
// RÉGIONS DU CAMEROUN
// ============================================
export const REGIONS_CAMEROON = [
  { code: 'AD', name: 'Adamaoua', nameEn: 'Adamawa', capital: 'Ngaoundéré', lat: 7.3167, lng: 13.5833 },
  { code: 'CE', name: 'Centre', nameEn: 'Centre', capital: 'Yaoundé', lat: 3.8667, lng: 11.5167 },
  { code: 'ES', name: 'Est', nameEn: 'East', capital: 'Bertoua', lat: 4.5833, lng: 13.6833 },
  { code: 'EN', name: 'Extrême-Nord', nameEn: 'Far North', capital: 'Maroua', lat: 10.5958, lng: 14.3159 },
  { code: 'LT', name: 'Littoral', nameEn: 'Littoral', capital: 'Douala', lat: 4.0511, lng: 9.7679 },
  { code: 'NO', name: 'Nord', nameEn: 'North', capital: 'Garoua', lat: 9.3, lng: 13.4 },
  { code: 'NW', name: 'Nord-Ouest', nameEn: 'Northwest', capital: 'Bamenda', lat: 5.9631, lng: 10.1591 },
  { code: 'OU', name: 'Ouest', nameEn: 'West', capital: 'Bafoussam', lat: 5.4737, lng: 10.4176 },
  { code: 'SU', name: 'Sud', nameEn: 'South', capital: 'Ebolowa', lat: 2.9, lng: 11.15 },
  { code: 'SW', name: 'Sud-Ouest', nameEn: 'Southwest', capital: 'Buéa', lat: 4.1597, lng: 9.2295 },
];

// ============================================
// NIVEAUX DE VALIDATION (5 niveaux hiérarchiques)
// ============================================
export const VALIDATION_LEVELS = [
  {
    level: 1,
    name: 'Collecte communautaire',
    nameEn: 'Community collection',
    role: 'Agent communautaire',
    roleEn: 'Community agent',
    description: 'Collecte et premier tri des rumeurs au niveau local',
    color: '#3498DB',
  },
  {
    level: 2,
    name: 'Vérification',
    nameEn: 'Verification',
    role: 'Responsable district',
    roleEn: 'District officer',
    description: 'Vérification des informations et investigation terrain',
    color: '#2ECC71',
  },
  {
    level: 3,
    name: 'Évaluation des risques',
    nameEn: 'Risk assessment',
    role: 'Expert santé publique',
    roleEn: 'Public health expert',
    description: 'Évaluation approfondie des risques sanitaires',
    color: '#F39C12',
  },
  {
    level: 4,
    name: 'Coordination régionale',
    nameEn: 'Regional coordination',
    role: 'Coordinateur régional',
    roleEn: 'Regional coordinator',
    description: 'Coordination de la réponse au niveau régional',
    color: '#E67E22',
  },
  {
    level: 5,
    name: 'Supervision centrale',
    nameEn: 'Central supervision',
    role: 'Superviseur national',
    roleEn: 'National supervisor',
    description: 'Supervision nationale et décision stratégique',
    color: '#E74C3C',
  },
];

// ============================================
// TYPES D'ACTEURS PAR NIVEAU
// ============================================
export const ACTOR_TYPES = {
  1: [
    { value: 'community_health_worker', label: 'Agent de santé communautaire' },
    { value: 'community_animal_health_worker', label: 'Agent de santé animale communautaire' },
    { value: 'community_leader', label: 'Leader communautaire' },
    { value: 'traditional_healer', label: 'Tradipraticien' },
  ],
  2: [
    { value: 'district_health_officer', label: 'Responsable santé district' },
    { value: 'district_vet_officer', label: 'Responsable vétérinaire district' },
    { value: 'district_environment_officer', label: 'Responsable environnement district' },
  ],
  3: [
    { value: 'epidemiologist', label: 'Épidémiologiste' },
    { value: 'veterinarian', label: 'Vétérinaire' },
    { value: 'lab_technician', label: 'Technicien de laboratoire' },
    { value: 'public_health_expert', label: 'Expert en santé publique' },
  ],
  4: [
    { value: 'regional_health_delegate', label: 'Délégué régional de santé' },
    { value: 'regional_vet_delegate', label: 'Délégué régional de l\'élevage' },
    { value: 'regional_coordinator', label: 'Coordinateur régional One Health' },
  ],
  5: [
    { value: 'national_coordinator', label: 'Coordinateur national One Health' },
    { value: 'director_epidemiology', label: 'Directeur de l\'épidémiologie' },
    { value: 'director_vet_services', label: 'Directeur des services vétérinaires' },
    { value: 'minister_delegate', label: 'Délégué ministériel' },
  ],
};

// ============================================
// CANAUX DE TRANSMISSION
// ============================================
export const TRANSMISSION_CHANNELS = [
  { value: 'system', label: 'Système (plateforme web)' },
  { value: 'sms', label: 'SMS' },
  { value: 'phone', label: 'Appel téléphonique' },
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'radio', label: 'Radio communautaire' },
];

// ============================================
// TYPES DE FEEDBACK (Rétro-information)
// ============================================
export const FEEDBACK_TYPES = [
  { value: 'acknowledgment', label: 'Accusé de réception', color: '#3498DB' },
  { value: 'status_update', label: 'Mise à jour du statut', color: '#2ECC71' },
  { value: 'clarification', label: 'Demande de clarification', color: '#F39C12' },
  { value: 'response_action', label: 'Action de réponse', color: '#9B59B6' },
  { value: 'alert', label: 'Alerte', color: '#E74C3C' },
  { value: 'correction', label: 'Correction d\'information', color: '#E67E22' },
];

// ============================================
// COULEURS DU MODULE COHRM
// ============================================
export const COHRM_COLORS = {
  primary: '#1B4F72',
  primaryLight: '#2980B9',
  primaryDark: '#154360',
  accent: '#FF5722',
  accentLight: '#FF8A65',
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  info: '#3498DB',
  muted: '#95A5A6',
  dark: '#2C3E50',
  light: '#ECF0F1',
  white: '#FFFFFF',
  // Fond sombre (dark mode)
  darkBg: '#0f172a',
  darkCard: '#1e293b',
  darkBorder: '#334155',
  darkText: '#e2e8f0',
  darkMuted: '#94a3b8',
};

// ============================================
// CONFIGURATION PAR DÉFAUT DES FILTRES
// ============================================
export const DEFAULT_FILTERS = {
  page: 1,
  limit: 20,
  status: '',
  priority: '',
  source: '',
  region: '',
  species: '',
  search: '',
  date_from: '',
  date_to: '',
};

// ============================================
// NAVIGATION COHRM (items du menu sidebar)
// ============================================
export const COHRM_NAV_ITEMS = [
  { id: 'dashboard', label: 'Tableau de bord', icon: 'BarChart3', minLevel: 1 },
  { id: 'rumors', label: 'Rumeurs', icon: 'Megaphone', minLevel: 1, badge: true },
  { id: 'validation', label: 'Validation', icon: 'CheckCircle', minLevel: 1, badge: true },
  { id: 'map', label: 'Carte', icon: 'Map', minLevel: 1 },
  { id: 'risk', label: 'Risques', icon: 'Shield', minLevel: 3 },
  { id: 'sms', label: 'SMS', icon: 'MessageCircle', minLevel: 3 },
  { id: 'scanner', label: 'Scanner Web', icon: 'Globe', minLevel: 3 },
  { id: 'actors', label: 'Acteurs', icon: 'Users', minLevel: 4 },
  { id: 'export', label: 'Export', icon: 'Download', minLevel: 2 },
  { id: 'settings', label: 'Paramètres', icon: 'Settings', minLevel: 5 },
];

// ============================================
// PAGINATION
// ============================================
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ============================================
// CARTE - TILE LAYERS
// ============================================
export const MAP_TILE_LAYERS = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  positron: {
    name: 'Clair (Positron)',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO',
  },
  dark: {
    name: 'Sombre',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO',
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
  },
};

// ============================================
// CARTE - PARAMÈTRES PAR DÉFAUT
// ============================================
export const MAP_DEFAULTS = {
  center: [7.3697, 12.3547], // Centre du Cameroun
  zoom: 6,
  minZoom: 5,
  maxZoom: 18,
};

// ============================================
// CARTE - COULEURS MARQUEURS PAR RISQUE
// ============================================
export const RISK_MARKER_COLORS = {
  unknown: '#BDC3C7',
  low: '#27AE60',
  moderate: '#F39C12',
  high: '#E67E22',
  very_high: '#E74C3C',
};

// ============================================
// CARTE - TAILLE MARQUEURS PAR PRIORITÉ
// ============================================
export const PRIORITY_RADIUS_MAP = {
  low: 6,
  medium: 8,
  high: 10,
  critical: 13,
};

// ============================================
// CARTE - PALETTE CHOROPLÈTHE
// ============================================
export const CHOROPLETH_PALETTE = {
  count: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#3182bd', '#08519c'],
  risk: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#31a354', '#006d2c'],
};

// ============================================
// CARTE - PARAMÈTRES HEATMAP
// ============================================
export const HEATMAP_DEFAULTS = {
  radius: 25,
  blur: 15,
  maxZoom: 12,
  max: 1.0,
  gradient: { 0.2: '#ffffb2', 0.4: '#fecc5c', 0.6: '#fd8d3c', 0.8: '#f03b20', 1.0: '#bd0026' },
};
