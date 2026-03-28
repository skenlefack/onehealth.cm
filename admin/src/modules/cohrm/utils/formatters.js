/**
 * COHRM - Fonctions de formatage
 * Formatage des dates, statuts, priorités, régions, etc.
 */

import {
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  RISK_LEVELS,
  SOURCE_OPTIONS,
  REGIONS_CAMEROON,
  VALIDATION_LEVELS,
  RUMOR_CATEGORIES,
  FEEDBACK_TYPES,
} from './constants';

// ============================================
// DATES
// ============================================

/**
 * Formate une date ISO en format local français
 * @param {string} dateStr - Date ISO string
 * @param {object} options - Options de formatage Intl
 * @returns {string} Date formatée
 */
export const formatDate = (dateStr, options = {}) => {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      ...options,
    });
  } catch {
    return '—';
  }
};

/**
 * Formate une date avec heure
 * @param {string} dateStr - Date ISO string
 * @returns {string} Date et heure formatées
 */
export const formatDateTime = (dateStr) => {
  return formatDate(dateStr, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Retourne une durée relative (il y a X minutes/heures/jours)
 * @param {string} dateStr - Date ISO string
 * @returns {string} Durée relative en français
 */
export const formatRelativeDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffSec < 60) return 'À l\'instant';
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffWeeks < 4) return `Il y a ${diffWeeks} sem.`;
    if (diffMonths < 12) return `Il y a ${diffMonths} mois`;
    return formatDate(dateStr);
  } catch {
    return '—';
  }
};

// ============================================
// STATUTS, PRIORITÉS, RISQUES
// ============================================

/**
 * Retourne les infos de formatage d'un statut
 * @param {string} status - Code du statut
 * @returns {object} { label, color, bgColor }
 */
export const formatStatus = (status) => {
  const found = STATUS_OPTIONS.find(s => s.value === status);
  return found || { label: status || 'Inconnu', color: '#95A5A6', bgColor: '#F2F3F4' };
};

/**
 * Retourne les infos de formatage d'une priorité
 * @param {string} priority - Code de la priorité
 * @returns {object} { label, color, bgColor }
 */
export const formatPriority = (priority) => {
  const found = PRIORITY_OPTIONS.find(p => p.value === priority);
  return found || { label: priority || 'Inconnu', color: '#95A5A6', bgColor: '#F2F3F4' };
};

/**
 * Retourne les infos de formatage d'un niveau de risque
 * @param {string} riskLevel - Code du niveau de risque
 * @returns {object} { label, color, bgColor, icon }
 */
export const formatRiskLevel = (riskLevel) => {
  const found = RISK_LEVELS.find(r => r.value === riskLevel);
  return found || { label: riskLevel || 'Non évalué', color: '#BDC3C7', bgColor: '#F2F3F4', icon: 'HelpCircle' };
};

/**
 * Retourne les infos d'une source
 * @param {string} source - Code de la source
 * @returns {object} { label, icon }
 */
export const formatSource = (source) => {
  const found = SOURCE_OPTIONS.find(s => s.value === source);
  return found || { label: source || 'Inconnue', icon: 'AlertCircle' };
};

/**
 * Retourne les infos d'une catégorie
 * @param {string} category - Code de la catégorie
 * @returns {object} { label, icon, color }
 */
export const formatCategory = (category) => {
  const found = RUMOR_CATEGORIES.find(c => c.value === category);
  return found || { label: category || 'Non catégorisée', icon: 'AlertCircle', color: '#95A5A6' };
};

// ============================================
// RÉGIONS
// ============================================

/**
 * Retourne les infos d'une région du Cameroun
 * @param {string} regionCode - Code ou nom de la région
 * @returns {object} { code, name, capital, lat, lng }
 */
export const formatRegion = (regionCode) => {
  if (!regionCode) return { name: 'Non définie' };
  // Chercher par code ou par nom
  const found = REGIONS_CAMEROON.find(
    r => r.code === regionCode || r.name === regionCode || r.nameEn === regionCode
  );
  return found || { name: regionCode };
};

/**
 * Formate la localisation complète (région > département > district)
 * @param {object} rumor - Objet rumeur
 * @returns {string} Localisation formatée
 */
export const formatLocation = (rumor) => {
  const parts = [rumor.region, rumor.department, rumor.district, rumor.location].filter(Boolean);
  return parts.join(' › ') || 'Non définie';
};

// ============================================
// VALIDATION
// ============================================

/**
 * Retourne les infos d'un niveau de validation
 * @param {number} level - Numéro du niveau (1-5)
 * @returns {object} Infos du niveau
 */
export const formatValidationLevel = (level) => {
  const found = VALIDATION_LEVELS.find(v => v.level === level);
  return found || { level, name: `Niveau ${level}`, role: 'Inconnu', color: '#95A5A6' };
};

/**
 * Retourne les infos d'un type de feedback
 * @param {string} type - Code du type
 * @returns {object} { label, color }
 */
export const formatFeedbackType = (type) => {
  const found = FEEDBACK_TYPES.find(f => f.value === type);
  return found || { label: type || 'Inconnu', color: '#95A5A6' };
};

// ============================================
// TEXTE
// ============================================

/**
 * Tronque un texte à N caractères avec ellipsis
 * @param {string} text - Texte à tronquer
 * @param {number} maxLen - Longueur maximale (défaut 100)
 * @returns {string} Texte tronqué
 */
export const truncateText = (text, maxLen = 100) => {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen).trim() + '…';
};

/**
 * Formate un nombre avec séparateur de milliers
 * @param {number} num - Nombre à formater
 * @returns {string} Nombre formaté
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '—';
  return new Intl.NumberFormat('fr-FR').format(num);
};

/**
 * Formate un pourcentage
 * @param {number} value - Valeur (0-100)
 * @param {number} decimals - Nombre de décimales
 * @returns {string} Pourcentage formaté
 */
export const formatPercent = (value, decimals = 0) => {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Formate une durée en heures/minutes
 * @param {number} minutes - Durée en minutes
 * @returns {string} Durée formatée
 */
export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return '—';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
};
