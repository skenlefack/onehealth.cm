/**
 * COHRM - Service API
 * Couche de communication avec le backend COHRM
 * Utilise Axios avec intercepteurs JWT et gestion d'erreurs
 */

import axios from 'axios';

// ============================================
// INSTANCE AXIOS
// ============================================

const API_URL = process.env.REACT_APP_API_URL || '/api';

const cohrmClient = axios.create({
  baseURL: `${API_URL}/cohrm`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requête : injection du token JWT
cohrmClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponse : gestion des erreurs
cohrmClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Token expiré ou invalide → redirection login
      if (status === 401) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        // Recharger la page pour retourner au login
        window.location.reload();
        return Promise.reject(new Error('Session expirée'));
      }

      // Accès refusé
      if (status === 403) {
        return Promise.reject(new Error('Accès refusé : permissions insuffisantes'));
      }

      // Erreur serveur
      if (status >= 500) {
        return Promise.reject(new Error('Erreur serveur. Veuillez réessayer.'));
      }

      // Autres erreurs (400, 404, etc.)
      return Promise.reject(new Error(data?.message || 'Une erreur est survenue'));
    }

    // Erreur réseau
    if (error.request) {
      return Promise.reject(new Error('Impossible de contacter le serveur'));
    }

    return Promise.reject(error);
  }
);

// ============================================
// RUMEURS
// ============================================

/**
 * Récupère la liste des rumeurs avec filtres et pagination
 * @param {object} params - Filtres (page, limit, status, priority, source, region, species, search, date_from, date_to)
 */
export const getRumors = (params = {}) => {
  // Nettoyer les paramètres vides
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  return cohrmClient.get('/rumors', { params: cleanParams });
};

/**
 * Récupère le détail d'une rumeur (avec historique et notes)
 * @param {number|string} id - ID de la rumeur
 */
export const getRumor = (id) => cohrmClient.get(`/rumors/${id}`);

/**
 * Crée une nouvelle rumeur
 * @param {object} data - Données de la rumeur
 */
export const createRumor = (data) => cohrmClient.post('/rumors', data);

/**
 * Crée une rumeur avec tous les champs étendus
 * @param {object} data - Données complètes de la rumeur
 */
export const createExtendedRumor = (data) => cohrmClient.post('/rumors/extended', data);

/**
 * Met à jour une rumeur existante
 * @param {number|string} id - ID de la rumeur
 * @param {object} data - Données à mettre à jour
 */
export const updateRumor = (id, data) => cohrmClient.put(`/rumors/${id}`, data);

/**
 * Supprime une rumeur (admin uniquement)
 * @param {number|string} id - ID de la rumeur
 */
export const deleteRumor = (id) => cohrmClient.delete(`/rumors/${id}`);

/**
 * Ajoute une note à une rumeur
 * @param {number|string} rumorId - ID de la rumeur
 * @param {object} data - { content, is_private }
 */
export const addNote = (rumorId, data) => cohrmClient.post(`/rumors/${rumorId}/notes`, data);

/**
 * Récupère toutes les rumeurs pour la carte (limit élevé)
 * @param {object} params - Filtres (status, priority, source, region, species, search, date_from, date_to, risk_level)
 */
export const getAllRumorsForMap = (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries({ ...params, limit: 1000, page: 1 }).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  return cohrmClient.get('/rumors', { params: cleanParams });
};

// ============================================
// VALIDATION MULTI-NIVEAUX
// ============================================

/**
 * Valide, escalade ou rejette une rumeur
 * @param {number|string} rumorId - ID de la rumeur
 * @param {object} data - { action_type, status, notes, rejection_reason, actor_id }
 */
export const validateRumor = (rumorId, data) => cohrmClient.post(`/rumors/${rumorId}/validate`, data);

/**
 * Récupère l'historique de validation d'une rumeur
 * @param {number|string} rumorId - ID de la rumeur
 */
export const getValidations = (rumorId) => cohrmClient.get(`/rumors/${rumorId}/validations`);

// ============================================
// ÉVALUATION DES RISQUES
// ============================================

/**
 * Soumet une évaluation des risques pour une rumeur
 * @param {number|string} rumorId - ID de la rumeur
 * @param {object} data - { risk_level, risk_description, risk_context, risk_exposure }
 */
export const assessRisk = (rumorId, data) => cohrmClient.post(`/rumors/${rumorId}/risk-assessment`, data);

// ============================================
// FEEDBACK (Rétro-information)
// ============================================

/**
 * Envoie un feedback pour une rumeur
 * @param {number|string} rumorId - ID de la rumeur
 * @param {object} data - { recipient_type, recipient_phone, recipient_email, feedback_type, message, channel, actor_id }
 */
export const sendFeedback = (rumorId, data) => cohrmClient.post(`/rumors/${rumorId}/feedback`, data);

/**
 * Récupère les feedbacks d'une rumeur
 * @param {number|string} rumorId - ID de la rumeur
 */
export const getFeedbacks = (rumorId) => cohrmClient.get(`/rumors/${rumorId}/feedback`);

// ============================================
// SMS
// ============================================

/**
 * Décode un message SMS au format COHRM
 * @param {string} smsText - Texte du SMS
 * @param {string} senderPhone - Numéro de l'expéditeur
 */
export const decodeSMS = (smsText, senderPhone) =>
  cohrmClient.post('/decode-sms', { sms_text: smsText, sender_phone: senderPhone });

/**
 * Récupère la liste des codes SMS actifs (groupés par catégorie)
 */
export const getSMSCodes = () => cohrmClient.get('/sms-codes');

/**
 * Crée un nouveau code SMS
 * @param {object} data - { code, label_fr, label_en, category, description }
 */
export const createSMSCode = (data) => cohrmClient.post('/sms-codes', data);

/**
 * Désactive un code SMS
 * @param {number|string} id - ID du code SMS
 */
export const deleteSMSCode = (id) => cohrmClient.delete(`/sms-codes/${id}`);

/**
 * Récupère le journal des SMS avec filtres et pagination
 * @param {object} params - { page, limit, status, sender, date_from, date_to }
 */
export const getSMSLogs = (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  return cohrmClient.get('/sms-logs', { params: cleanParams });
};

// ============================================
// API MOBILE
// ============================================

/**
 * Soumet un signalement public (sans authentification côté backend)
 * @param {object} data - Données du signalement
 */
export const submitPublicReport = (data) => cohrmClient.post('/mobile/report', data);

/**
 * Synchronise les données pour l'application mobile
 */
export const syncMobile = () => cohrmClient.get('/mobile/sync');

// ============================================
// ACTEURS
// ============================================

/**
 * Récupère la liste des acteurs COHRM
 * @param {object} params - Filtres (level, region, is_active)
 */
export const getActors = (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  return cohrmClient.get('/actors', { params: cleanParams });
};

/**
 * Récupère le détail d'un acteur
 * @param {number|string} id - ID de l'acteur
 */
export const getActor = (id) => cohrmClient.get(`/actors/${id}`);

/**
 * Crée un nouvel acteur
 * @param {object} data - Données de l'acteur
 */
export const createActor = (data) => cohrmClient.post('/actors', data);

/**
 * Met à jour un acteur
 * @param {number|string} id - ID de l'acteur
 * @param {object} data - Données à mettre à jour
 */
export const updateActor = (id, data) => cohrmClient.put(`/actors/${id}`, data);

/**
 * Désactive un acteur
 * @param {number|string} id - ID de l'acteur
 */
export const deactivateActor = (id) => cohrmClient.delete(`/actors/${id}`);

/**
 * Récupère les types d'acteurs configurés
 */
export const getActorTypes = () => cohrmClient.get('/actor-types');

// ============================================
// SCANNER WEB
// ============================================

/**
 * Lance un scan web manuel
 * @param {object} data - { source, keywords }
 */
export const runScan = (data = {}) => cohrmClient.post('/scan/run', data);

/**
 * Récupère l'historique des scans
 * @param {object} params - Filtres (page, limit, source, status)
 */
export const getScanHistory = (params = {}) => cohrmClient.get('/scan-history', { params });

/**
 * Récupère le détail d'un scan avec ses résultats
 * @param {number|string} id - ID du scan
 */
export const getScanDetail = (id) => cohrmClient.get(`/scan-history/${id}`);

/**
 * Met à jour un résultat de scan (review, conversion en rumeur)
 * @param {number|string} id - ID du résultat
 * @param {object} data - { status, rumor_id, is_rumor, notes }
 */
export const updateScanResult = (id, data) => cohrmClient.put(`/scan-results/${id}`, data);

// ============================================
// STATISTIQUES
// ============================================

/**
 * Récupère les statistiques du dashboard COHRM
 */
export const getDashboardStats = () => cohrmClient.get('/stats');

/**
 * Récupère les statistiques de validation par niveau
 */
export const getValidationStats = () => cohrmClient.get('/stats/validation');

/**
 * Récupère les statistiques de risque
 */
export const getRiskStats = () => cohrmClient.get('/stats/risk');

// ============================================
// EXPORT
// ============================================

/**
 * Exporte les données COHRM
 * @param {object} params - { format: 'json'|'csv', status, date_from, date_to }
 */
export const exportData = (params = {}) => {
  if (params.format === 'csv') {
    // Pour le CSV, on utilise un lien de téléchargement direct
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const queryString = new URLSearchParams(params).toString();
    window.open(`${API_URL}/cohrm/export?${queryString}&token=${token}`, '_blank');
    return Promise.resolve({ success: true });
  }
  return cohrmClient.get('/export', { params });
};

// ============================================
// PARAMÈTRES
// ============================================

/**
 * Récupère les paramètres COHRM
 */
export const getSettings = () => cohrmClient.get('/settings');

/**
 * Met à jour les paramètres COHRM
 * @param {object} data - Paires clé-valeur des paramètres
 */
export const updateSettings = (data) => cohrmClient.put('/settings', data);

/**
 * Récupère les thèmes/catégories configurés
 */
export const getThemes = () => cohrmClient.get('/themes');

/**
 * Crée un nouveau thème
 * @param {object} data - { label_fr, label_en, category, description, color, icon }
 */
export const createTheme = (data) => cohrmClient.post('/themes', data);

/**
 * Met à jour un thème
 * @param {number|string} id - ID du thème
 * @param {object} data - Données à mettre à jour
 */
export const updateTheme = (id, data) => cohrmClient.put(`/themes/${id}`, data);

/**
 * Supprime (désactive) un thème
 * @param {number|string} id - ID du thème
 */
export const deleteTheme = (id) => cohrmClient.delete(`/themes/${id}`);

/**
 * Réordonne les thèmes
 * @param {Array} order - [{ id, display_order }]
 */
export const reorderThemes = (order) => cohrmClient.put('/themes/reorder', { order });

/**
 * Prévisualisation d'export (JSON seulement, limité)
 * @param {object} params - { status, date_from, date_to }
 */
export const exportPreview = (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries({ ...params, format: 'json' }).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  return cohrmClient.get('/export', { params: cleanParams });
};

/**
 * Télécharge l'export CSV
 * @param {object} params - { status, date_from, date_to }
 */
export const downloadCSV = (params = {}) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const queryString = new URLSearchParams({ ...params, format: 'csv', token }).toString();
  window.open(`${API_URL}/cohrm/export?${queryString}`, '_blank');
  return Promise.resolve({ success: true });
};

/**
 * Teste la configuration SMS gateway
 * @param {object} data - { phone, message }
 */
export const testSMSGateway = (data) => cohrmClient.post('/sms/test', data);

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

const cohrmApi = {
  // Rumeurs
  getRumors,
  getAllRumorsForMap,
  getRumor,
  createRumor,
  createExtendedRumor,
  updateRumor,
  deleteRumor,
  addNote,
  // Validation
  validateRumor,
  getValidations,
  // Risques
  assessRisk,
  // Feedback
  sendFeedback,
  getFeedbacks,
  // SMS
  decodeSMS,
  getSMSCodes,
  createSMSCode,
  deleteSMSCode,
  getSMSLogs,
  // Mobile
  submitPublicReport,
  syncMobile,
  // Acteurs
  getActors,
  getActor,
  createActor,
  updateActor,
  deactivateActor,
  getActorTypes,
  // Scanner
  runScan,
  getScanHistory,
  getScanDetail,
  updateScanResult,
  // Stats
  getDashboardStats,
  getValidationStats,
  getRiskStats,
  // Export
  exportData,
  // Settings
  getSettings,
  updateSettings,
  getThemes,
  createTheme,
  updateTheme,
  deleteTheme,
  reorderThemes,
  // Export
  exportPreview,
  downloadCSV,
  // SMS test
  testSMSGateway,
};

export default cohrmApi;
