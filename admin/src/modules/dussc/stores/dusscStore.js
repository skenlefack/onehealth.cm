/**
 * DUSS-C Zustand Store
 * État global du module Défi Une Seule Santé
 */

import { create } from 'zustand';
import * as dusscApi from '../services/dusscApi';
import { DEFAULT_FILTERS } from '../utils/constants';

// Persistance des filtres
const FILTERS_KEY = 'dussc_filters';
const loadFilters = () => {
  try {
    const saved = localStorage.getItem(FILTERS_KEY);
    return saved ? { ...DEFAULT_FILTERS, ...JSON.parse(saved) } : { ...DEFAULT_FILTERS };
  } catch { return { ...DEFAULT_FILTERS }; }
};
const saveFilters = (filters) => {
  try { localStorage.setItem(FILTERS_KEY, JSON.stringify(filters)); } catch {}
};

const useDusscStore = create((set, get) => ({
  // ─── Navigation ───
  activePage: 'dashboard',
  selectedQuestionId: null,
  selectedTemplateId: null,
  selectedAlertId: null,
  sidebarCollapsed: false,

  setActivePage: (page) => set({ activePage: page }),
  navigateToQuestion: (id) => set({ activePage: 'question-detail', selectedQuestionId: id }),
  navigateToQuestionCreate: () => set({ activePage: 'question-create', selectedQuestionId: null }),
  navigateToQuestionImport: () => set({ activePage: 'question-import' }),
  navigateToTemplateCreate: () => set({ activePage: 'template-create', selectedTemplateId: null }),
  navigateToAlertCreate: () => set({ activePage: 'alert-create', selectedAlertId: null }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  // ─── Modules & Personas ───
  modules: [],
  personas: [],

  fetchModules: async () => {
    try {
      const { data } = await dusscApi.getModules();
      set({ modules: data.data || [] });
    } catch (err) {
      console.error('[DUSSC Store] fetchModules:', err.message);
    }
  },

  fetchPersonas: async () => {
    try {
      const { data } = await dusscApi.getPersonas();
      set({ personas: data.data || [] });
    } catch (err) {
      console.error('[DUSSC Store] fetchPersonas:', err.message);
    }
  },

  // ─── Questions ───
  questions: [],
  currentQuestion: null,
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  filters: loadFilters(),
  loading: false,
  loadingQuestion: false,
  error: null,

  fetchQuestions: async () => {
    set({ loading: true, error: null });
    try {
      const filters = get().filters;
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });

      const { data } = await dusscApi.getQuestions(params);
      set({
        questions: data.data || [],
        pagination: data.pagination || get().pagination,
        loading: false,
      });
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },

  fetchQuestion: async (id) => {
    set({ loadingQuestion: true });
    try {
      const { data } = await dusscApi.getQuestion(id);
      set({ currentQuestion: data.data, loadingQuestion: false });
    } catch (err) {
      set({ loadingQuestion: false, error: err.message });
    }
  },

  clearCurrentQuestion: () => set({ currentQuestion: null }),

  setFilters: (newFilters) => {
    const merged = { ...get().filters, ...newFilters, page: 1 };
    saveFilters(merged);
    set({ filters: merged });
  },

  setPage: (page) => {
    const merged = { ...get().filters, page };
    saveFilters(merged);
    set({ filters: merged });
  },

  resetFilters: () => {
    const defaults = { ...DEFAULT_FILTERS };
    saveFilters(defaults);
    set({ filters: defaults });
  },

  // ─── Templates ───
  templates: [],
  loadingTemplates: false,

  fetchTemplates: async () => {
    set({ loadingTemplates: true });
    try {
      const { data } = await dusscApi.getTemplates();
      set({ templates: data.data || [], loadingTemplates: false });
    } catch (err) {
      set({ loadingTemplates: false });
    }
  },

  // ─── Alerts ───
  alerts: [],
  loadingAlerts: false,

  fetchAlerts: async () => {
    set({ loadingAlerts: true });
    try {
      const { data } = await dusscApi.getAlerts();
      set({ alerts: data.data || [], loadingAlerts: false });
    } catch (err) {
      set({ loadingAlerts: false });
    }
  },

  // ─── Analytics ───
  overview: null,
  learning: null,
  mapData: null,
  advocacy: null,
  psychometrics: [],
  weeklyStats: [],
  loadingStats: false,

  fetchOverview: async (params) => {
    set({ loadingStats: true });
    try {
      const { data } = await dusscApi.getOverview(params);
      set({ overview: data.data, loadingStats: false });
    } catch (err) {
      set({ loadingStats: false });
    }
  },

  fetchLearning: async (params) => {
    try {
      const { data } = await dusscApi.getLearning(params);
      set({ learning: data.data });
    } catch {}
  },

  fetchMap: async (params) => {
    try {
      const { data } = await dusscApi.getMap(params);
      set({ mapData: data.data });
    } catch {}
  },

  fetchAdvocacy: async () => {
    try {
      const { data } = await dusscApi.getAdvocacy();
      set({ advocacy: data.data });
    } catch {}
  },

  fetchPsychometrics: async () => {
    try {
      const { data } = await dusscApi.getPsychometrics();
      set({ psychometrics: data.data || [] });
    } catch {}
  },

  fetchWeeklyStats: async () => {
    try {
      const { data } = await dusscApi.getWeeklyStats();
      set({ weeklyStats: data.data || [] });
    } catch {}
  },

  // ─── Settings ───
  settings: [],

  fetchSettings: async () => {
    try {
      const { data } = await dusscApi.getSettings();
      set({ settings: data.data || [] });
    } catch {}
  },

  // ─── Error ───
  clearError: () => set({ error: null }),
}));

export default useDusscStore;
