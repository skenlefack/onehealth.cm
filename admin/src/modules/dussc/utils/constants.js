/**
 * DUSS-C Constants
 * Enums, couleurs, configurations du module Défi Une Seule Santé
 */

// Statuts du cycle de vie des questions
export const QUESTION_STATUS = {
  brouillon: { label: 'Brouillon', labelEn: 'Draft', color: '#95A5A6', icon: 'FileEdit' },
  revue_editoriale: { label: 'Revue éditoriale', labelEn: 'Editorial Review', color: '#3498DB', icon: 'Eye' },
  en_validation: { label: 'En validation', labelEn: 'In Validation', color: '#F39C12', icon: 'Clock' },
  traduction: { label: 'Traduction', labelEn: 'Translation', color: '#9B59B6', icon: 'Languages' },
  contre_validation: { label: 'Contre-validation', labelEn: 'Counter-validation', color: '#E67E22', icon: 'CheckCheck' },
  test_utilisateur: { label: 'Test utilisateur', labelEn: 'User Testing', color: '#1ABC9C', icon: 'Users' },
  valide: { label: 'Validé', labelEn: 'Validated', color: '#27AE60', icon: 'Check' },
  publie: { label: 'Publié', labelEn: 'Published', color: '#2ECC71', icon: 'Globe' },
  suspendu: { label: 'Suspendu', labelEn: 'Suspended', color: '#E74C3C', icon: 'Pause' },
  retire: { label: 'Retiré', labelEn: 'Retired', color: '#7F8C8D', icon: 'Trash2' },
};

// Niveaux de difficulté
export const NIVEAU_OPTIONS = [
  { value: 'grand_public', label: 'Grand public', labelEn: 'General Public', color: '#27AE60' },
  { value: 'intermediaire', label: 'Intermédiaire', labelEn: 'Intermediate', color: '#F39C12' },
  { value: 'professionnel', label: 'Professionnel', labelEn: 'Professional', color: '#E74C3C' },
];

// Types de questions
export const TYPE_ITEM_OPTIONS = [
  { value: 'situation', label: 'Situation', labelEn: 'Situation' },
  { value: 'connaissance', label: 'Connaissance', labelEn: 'Knowledge' },
  { value: 'attitude', label: 'Attitude', labelEn: 'Attitude' },
  { value: 'orientation', label: 'Orientation', labelEn: 'Orientation' },
];

// Rôles de test
export const ROLE_TEST_OPTIONS = [
  { value: 'courante', label: 'Question courante', labelEn: 'Regular Question', color: '#3498DB' },
  { value: 'ancre_pre', label: 'Ancre pré-test', labelEn: 'Pre-test Anchor', color: '#E67E22' },
  { value: 'ancre_post', label: 'Ancre post-test', labelEn: 'Post-test Anchor', color: '#9B59B6' },
];

// Blocs du parcours
export const BLOC_OPTIONS = [
  { value: 'pre_test', label: 'Pré-test', labelEn: 'Pre-test', color: '#E67E22' },
  { value: 'tronc_commun', label: 'Tronc commun', labelEn: 'Common Block', color: '#3498DB' },
  { value: 'profil', label: 'Bloc profilé', labelEn: 'Profile Block', color: '#27AE60' },
  { value: 'post_test', label: 'Post-test', labelEn: 'Post-test', color: '#9B59B6' },
];

// Modules thématiques (couleurs alignées sur le prototype DUSS-C)
export const MODULE_COLORS = {
  M00: '#1F5162', M01: '#2980B9', M02: '#E74C3C', M03: '#8C3B2E',
  M04: '#B4741F', M05: '#9B59B6', M06: '#E67E22', M07: '#27AE60',
  M08: '#3498DB', M09: '#F39C12', M10: '#2F5D3A', M11: '#1B4F72',
  M12: '#C0392B',
};

// Régions du Cameroun
export const REGIONS_CAMEROON = [
  { value: 'adamaoua', label: 'Adamaoua' },
  { value: 'centre', label: 'Centre' },
  { value: 'est', label: 'Est' },
  { value: 'extreme_nord', label: 'Extrême-Nord' },
  { value: 'littoral', label: 'Littoral' },
  { value: 'nord', label: 'Nord' },
  { value: 'nord_ouest', label: 'Nord-Ouest' },
  { value: 'ouest', label: 'Ouest' },
  { value: 'sud', label: 'Sud' },
  { value: 'sud_ouest', label: 'Sud-Ouest' },
];

// Canaux de participation
export const CANAL_OPTIONS = [
  { value: 'web', label: 'Web', icon: 'Globe' },
  { value: 'mobile', label: 'Mobile', icon: 'Smartphone' },
  { value: 'assiste', label: 'Mode assisté', icon: 'Users' },
  { value: 'sms', label: 'SMS', icon: 'MessageSquare' },
  { value: 'ussd', label: 'USSD', icon: 'Phone' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'MessageCircle' },
  { value: 'radio', label: 'Radio', icon: 'Radio' },
  { value: 'papier', label: 'Papier', icon: 'FileText' },
];

// Scénarios d'alerte
export const ALERT_SCENARIOS = [
  { value: 'mpox', label: 'Mpox', color: '#9B59B6' },
  { value: 'cholera', label: 'Choléra', color: '#2980B9' },
  { value: 'influenza_aviaire', label: 'Influenza aviaire', color: '#E67E22' },
  { value: 'autre', label: 'Autre', color: '#95A5A6' },
];

// Couleurs du module DUSS-C
export const DUSSC_COLORS = {
  primary: '#2F5D3A',
  primaryLight: '#27AE60',
  primaryDark: '#1A3D25',
  accent: '#B4741F',
  correct: '#2F5D3A',
  incorrect: '#8A6116',
  paper: '#EAEFEB',
  encre: '#12333D',
};

// Navigation du module
export const DUSSC_NAV_ITEMS = [
  { key: 'dashboard', label: 'Tableau de bord', labelEn: 'Dashboard', icon: 'BarChart3', minLevel: 1 },
  { key: 'questions', label: 'Banque de questions', labelEn: 'Question Bank', icon: 'HelpCircle', minLevel: 1 },
  { key: 'templates', label: 'Templates de quiz', labelEn: 'Quiz Templates', icon: 'Layout', minLevel: 2 },
  { key: 'alerts', label: 'Alertes', labelEn: 'Alerts', icon: 'AlertTriangle', minLevel: 3 },
  { key: 'psychometrics', label: 'Psychométrie', labelEn: 'Psychometrics', icon: 'TrendingUp', minLevel: 2 },
  { key: 'settings', label: 'Paramètres', labelEn: 'Settings', icon: 'Settings', minLevel: 5 },
];

// Filtres par défaut
export const DEFAULT_FILTERS = {
  page: 1,
  limit: 20,
  module: '',
  statut: '',
  niveau: '',
  role_test: '',
  search: '',
};

// Seuils psychométriques
export const PSYCHOMETRIC_THRESHOLDS = {
  difficulty: { low: 0.20, optimal_min: 0.30, optimal_max: 0.85, high: 0.95 },
  discrimination: { poor: 0, acceptable: 0.15, good: 0.30 },
};
