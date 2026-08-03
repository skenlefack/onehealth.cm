/**
 * DUSS-C API Service
 * Client Axios pour toutes les routes /api/dussc
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: `${API_URL}/dussc`,
  headers: { 'Content-Type': 'application/json' },
});

// Intercepteur : injection automatique du JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur : gestion des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// MODULES
// ============================================

export const getModules = () => api.get('/modules');
export const updateModule = (id, data) => api.put(`/modules/${id}`, data);
export const getModuleQuestions = (id) => api.get(`/modules/${id}/questions`);

// ============================================
// PERSONAS
// ============================================

export const getPersonas = () => api.get('/personas');
export const getPersonaMatrix = () => api.get('/personas/matrix');

// ============================================
// QUESTIONS
// ============================================

export const getQuestions = (params) => api.get('/questions', { params });
export const getQuestion = (id) => api.get(`/questions/${id}`);
export const createQuestion = (data) => api.post('/questions', data);
export const updateQuestion = (id, data) => api.put(`/questions/${id}`, data);
export const changeQuestionStatus = (id, data) => api.patch(`/questions/${id}/status`, data);

export const importQuestions = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/questions/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const exportQuestions = (params) =>
  api.get('/questions/export', { params, responseType: 'blob' });

// ============================================
// TEMPLATES
// ============================================

export const getTemplates = () => api.get('/templates');
export const createTemplate = (data) => api.post('/templates', data);
export const publishTemplate = (id) => api.post(`/templates/${id}/publish`);
export const assignTemplateQuestions = (id, questions) =>
  api.post(`/templates/${id}/questions`, { questions });

// ============================================
// ALERTES
// ============================================

export const getAlerts = () => api.get('/alerts');
export const createAlert = (data) => api.post('/alerts', data);
export const activateAlert = (id) => api.patch(`/alerts/${id}/activate`);
export const deactivateAlert = (id) => api.patch(`/alerts/${id}/deactivate`);

// ============================================
// ANALYTICS
// ============================================

export const getOverview = (params) => api.get('/analytics/overview', { params });
export const getLearning = (params) => api.get('/analytics/learning', { params });
export const getMap = (params) => api.get('/analytics/map', { params });
export const getAdvocacy = () => api.get('/analytics/advocacy');
export const getPsychometrics = () => api.get('/analytics/psychometrics');
export const getWeeklyStats = (params) => api.get('/analytics/weekly', { params });
export const triggerCompute = (data) => api.post('/analytics/compute', data);

// ============================================
// SETTINGS
// ============================================

export const getSettings = () => api.get('/settings');
export const updateSetting = (key, value) => api.put(`/settings/${key}`, { value });

export default api;
