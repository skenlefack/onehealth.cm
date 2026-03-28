/**
 * COHRM - Fonctions de validation
 * Validation des formulaires rumeurs, acteurs, SMS, GPS
 */

import { REGIONS_CAMEROON } from './constants';

// ============================================
// VALIDATION D'UNE RUMEUR
// ============================================

/**
 * Valide les données d'une rumeur
 * @param {object} data - Données de la rumeur
 * @returns {{ valid: boolean, errors: object }} Résultat de la validation
 */
export const validateRumor = (data) => {
  const errors = {};

  // Titre requis (3-200 caractères)
  if (!data.title || data.title.trim().length < 3) {
    errors.title = 'Le titre est requis (minimum 3 caractères)';
  } else if (data.title.length > 200) {
    errors.title = 'Le titre ne doit pas dépasser 200 caractères';
  }

  // Région requise
  if (!data.region) {
    errors.region = 'La région est requise';
  }

  // Description optionnelle mais si présente, min 10 caractères
  if (data.description && data.description.trim().length < 10) {
    errors.description = 'La description doit faire au moins 10 caractères';
  }

  // Nombre de cas (si fourni, doit être positif)
  if (data.affected_count !== undefined && data.affected_count !== '' && data.affected_count !== null) {
    const count = parseInt(data.affected_count);
    if (isNaN(count) || count < 0) {
      errors.affected_count = 'Le nombre de cas doit être un entier positif';
    }
  }

  // Nombre de décès (si fourni, doit être positif et <= cas)
  if (data.dead_count !== undefined && data.dead_count !== '' && data.dead_count !== null) {
    const dead = parseInt(data.dead_count);
    if (isNaN(dead) || dead < 0) {
      errors.dead_count = 'Le nombre de décès doit être un entier positif';
    }
    if (data.affected_count && dead > parseInt(data.affected_count)) {
      errors.dead_count = 'Le nombre de décès ne peut pas dépasser le nombre de cas';
    }
  }

  // Coordonnées GPS (si fournies)
  if (data.latitude || data.longitude) {
    const gpsErrors = validateGPS(data.latitude, data.longitude);
    if (gpsErrors) {
      errors.coordinates = gpsErrors;
    }
  }

  // Téléphone du rapporteur (si fourni)
  if (data.reporter_phone) {
    if (!/^(\+237)?[0-9]{8,9}$/.test(data.reporter_phone.replace(/\s/g, ''))) {
      errors.reporter_phone = 'Numéro de téléphone invalide (format: +237XXXXXXXXX)';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================
// VALIDATION D'UN ACTEUR
// ============================================

/**
 * Valide les données d'un acteur COHRM
 * @param {object} data - Données de l'acteur
 * @returns {{ valid: boolean, errors: object }} Résultat de la validation
 */
export const validateActor = (data) => {
  const errors = {};

  // Niveau requis (1-5)
  if (!data.actor_level || data.actor_level < 1 || data.actor_level > 5) {
    errors.actor_level = 'Le niveau doit être compris entre 1 et 5';
  }

  // Type requis
  if (!data.actor_type) {
    errors.actor_type = 'Le type d\'acteur est requis';
  }

  // Région requise pour les niveaux 1-4
  if (data.actor_level && data.actor_level < 5 && !data.region) {
    errors.region = 'La région est requise pour ce niveau';
  }

  // Vérifier que la région est valide
  if (data.region) {
    const validRegion = REGIONS_CAMEROON.find(r => r.name === data.region || r.code === data.region);
    if (!validRegion) {
      errors.region = 'Région invalide';
    }
  }

  // Email (si fourni, format valide)
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Adresse email invalide';
  }

  // Téléphone (si fourni)
  if (data.phone && !/^(\+237)?[0-9]{8,9}$/.test(data.phone.replace(/\s/g, ''))) {
    errors.phone = 'Numéro de téléphone invalide';
  }

  // Organisation requise
  if (!data.organization || data.organization.trim().length < 2) {
    errors.organization = 'L\'organisation est requise';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================
// VALIDATION SMS
// ============================================

/**
 * Valide le format d'un SMS COHRM
 * Format attendu : CODE*LOCALITE*SYMPTOMES*ESPECE*NOMBRE*DETAILS
 * @param {string} smsText - Texte du SMS
 * @returns {{ valid: boolean, error: string|null }} Résultat de la validation
 */
export const validateSMS = (smsText) => {
  if (!smsText || typeof smsText !== 'string') {
    return { valid: false, error: 'Le texte SMS est requis' };
  }

  const trimmed = smsText.trim();
  if (trimmed.length < 7) {
    return { valid: false, error: 'SMS trop court (minimum: CODE*LOCALITE*SYMPTOMES*ESPECE)' };
  }

  const parts = trimmed.split('*');
  if (parts.length < 4) {
    return {
      valid: false,
      error: 'Format invalide. Minimum 4 parties séparées par *: CODE*LOCALITE*SYMPTOMES*ESPECE',
    };
  }

  // Vérifier le code événement
  const validEventCodes = ['MAL', 'MOR', 'EPI', 'ZOO', 'INT', 'ENV'];
  if (!validEventCodes.includes(parts[0].toUpperCase())) {
    return {
      valid: false,
      error: `Code événement invalide: ${parts[0]}. Codes valides: ${validEventCodes.join(', ')}`,
    };
  }

  // Vérifier la localité (non vide)
  if (!parts[1].trim()) {
    return { valid: false, error: 'La localité ne peut pas être vide' };
  }

  // Vérifier les codes symptômes
  const validSymptomCodes = ['FI', 'VO', 'DI', 'TO', 'ER', 'HE', 'PA', 'MO', 'AB', 'RE', 'NE', 'OE'];
  const symptoms = parts[2].split(',').map(s => s.trim().toUpperCase());
  const invalidSymptoms = symptoms.filter(s => !validSymptomCodes.includes(s));
  if (invalidSymptoms.length > 0) {
    return {
      valid: false,
      error: `Codes symptômes invalides: ${invalidSymptoms.join(', ')}`,
    };
  }

  // Vérifier le code espèce
  const validSpeciesCodes = ['HUM', 'BOV', 'OVI', 'VOL', 'POR', 'SAU', 'CHI', 'AUT'];
  if (!validSpeciesCodes.includes(parts[3].toUpperCase())) {
    return {
      valid: false,
      error: `Code espèce invalide: ${parts[3]}. Codes valides: ${validSpeciesCodes.join(', ')}`,
    };
  }

  // Vérifier le nombre (optionnel, partie 5)
  if (parts[4]) {
    const count = parseInt(parts[4]);
    if (isNaN(count) || count < 0) {
      return { valid: false, error: 'Le nombre de cas doit être un entier positif' };
    }
  }

  return { valid: true, error: null };
};

// ============================================
// VALIDATION GPS
// ============================================

/**
 * Valide des coordonnées GPS pour le Cameroun
 * Le Cameroun est entre lat 1.6-13.1 et lng 8.4-16.2 approximativement
 * @param {number|string} lat - Latitude
 * @param {number|string} lng - Longitude
 * @returns {string|null} Message d'erreur ou null si valide
 */
export const validateGPS = (lat, lng) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return 'Les coordonnées GPS doivent être des nombres valides';
  }

  if (latitude < -90 || latitude > 90) {
    return 'Latitude invalide (doit être entre -90 et 90)';
  }

  if (longitude < -180 || longitude > 180) {
    return 'Longitude invalide (doit être entre -180 et 180)';
  }

  // Vérification approximative pour le Cameroun
  const inCameroon = latitude >= 1.5 && latitude <= 13.2 && longitude >= 8.3 && longitude <= 16.3;
  if (!inCameroon) {
    return 'Les coordonnées semblent être en dehors du Cameroun';
  }

  return null;
};

// ============================================
// VALIDATION D'ÉVALUATION DES RISQUES
// ============================================

/**
 * Valide les données d'évaluation des risques
 * @param {object} data - Données d'évaluation
 * @returns {{ valid: boolean, errors: object }}
 */
export const validateRiskAssessment = (data) => {
  const errors = {};

  const validLevels = ['unknown', 'low', 'moderate', 'high', 'very_high'];
  if (!data.risk_level || !validLevels.includes(data.risk_level)) {
    errors.risk_level = 'Le niveau de risque est requis';
  }

  // Description obligatoire si niveau >= moderate
  const requiresDescription = ['moderate', 'high', 'very_high'].includes(data.risk_level);
  if (requiresDescription) {
    if (!data.risk_description || data.risk_description.trim().length < 20) {
      errors.risk_description = 'La description est requise pour ce niveau de risque (minimum 20 caractères)';
    }
  }

  // Exposition optionnelle mais si fournie, doit être valide
  const validExposures = ['individual', 'group', 'community', 'regional', 'national'];
  if (data.risk_exposure && !validExposures.includes(data.risk_exposure)) {
    errors.risk_exposure = 'Niveau d\'exposition invalide';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
