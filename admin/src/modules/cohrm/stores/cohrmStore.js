/**
 * COHRM - Store Zustand
 * État global du module COHRM avec actions et persistance des filtres
 */

import { create } from 'zustand';
import {
  getRumors,
  getRumor,
  getDashboardStats,
  getActors,
  getValidationStats,
  getRiskStats,
} from '../services/cohrmApi';
import { DEFAULT_FILTERS } from '../utils/constants';

/**
 * Store principal COHRM
 *
 * State :
 *   - rumors[]           : Liste des rumeurs chargées
 *   - currentRumor       : Rumeur sélectionnée (détail)
 *   - actors[]           : Liste des acteurs
 *   - stats              : Statistiques du dashboard
 *   - validationStats    : Statistiques de validation
 *   - riskStats          : Statistiques de risque
 *   - filters            : Filtres actuels (avec persistance)
 *   - pagination         : Infos de pagination { page, limit, total, pages }
 *   - loading            : Indicateur de chargement global
 *   - loadingRumor       : Chargement d'une rumeur spécifique
 *   - loadingStats       : Chargement des stats
 *   - error              : Dernière erreur
 *   - activePage         : Page active dans le module COHRM
 *   - selectedRumorId    : ID de la rumeur sélectionnée (pour navigation)
 *   - selectedActorId    : ID de l'acteur sélectionné
 *   - sidebarCollapsed   : État du sidebar COHRM
 */
const useCohrmStore = create((set, get) => ({
  // ============================================
  // STATE
  // ============================================

  // Données
  rumors: [],
  recentRumors: [],
  currentRumor: null,
  actors: [],
  stats: null,
  validationStats: null,
  riskStats: null,

  // Filtres et pagination
  filters: loadFiltersFromStorage(),
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },

  // Chargement et erreurs
  loading: false,
  loadingRumor: false,
  loadingStats: false,
  error: null,

  // Navigation interne
  activePage: 'dashboard',
  selectedRumorId: null,
  selectedActorId: null,
  sidebarCollapsed: false,

  // ============================================
  // ACTIONS - NAVIGATION
  // ============================================

  /**
   * Change la page active du module COHRM
   */
  setActivePage: (page, params = {}) => {
    set({
      activePage: page,
      selectedRumorId: params.rumorId || null,
      selectedActorId: params.actorId || null,
      error: null,
    });
  },

  /**
   * Navigue vers le détail d'une rumeur
   */
  navigateToRumor: (rumorId) => {
    set({
      activePage: 'rumor-detail',
      selectedRumorId: rumorId,
      error: null,
    });
  },

  /**
   * Navigue vers l'édition d'une rumeur
   */
  navigateToRumorEdit: (rumorId) => {
    set({
      activePage: 'rumor-edit',
      selectedRumorId: rumorId,
      error: null,
    });
  },

  /**
   * Navigue vers le détail d'un acteur
   */
  navigateToActor: (actorId) => {
    set({
      activePage: 'actor-detail',
      selectedActorId: actorId,
      error: null,
    });
  },

  /**
   * Navigue vers l'édition d'un acteur
   */
  navigateToActorEdit: (actorId) => {
    set({
      activePage: 'actor-edit',
      selectedActorId: actorId,
      error: null,
    });
  },

  /**
   * Toggle le sidebar COHRM
   */
  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // ============================================
  // ACTIONS - RUMEURS
  // ============================================

  /**
   * Charge la liste des rumeurs avec les filtres actuels
   */
  fetchRumors: async () => {
    const { filters } = get();
    set({ loading: true, error: null });
    try {
      const response = await getRumors(filters);
      if (response.success) {
        set({
          rumors: response.data,
          pagination: response.pagination || { page: 1, limit: 20, total: 0, pages: 0 },
          loading: false,
        });
      } else {
        set({ error: response.message, loading: false });
      }
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  /**
   * Charge le détail d'une rumeur
   */
  fetchRumor: async (id) => {
    set({ loadingRumor: true, error: null });
    try {
      const response = await getRumor(id);
      if (response.success) {
        set({ currentRumor: response.data, loadingRumor: false });
      } else {
        set({ error: response.message, loadingRumor: false });
      }
    } catch (err) {
      set({ error: err.message, loadingRumor: false });
    }
  },

  /**
   * Efface la rumeur courante
   */
  clearCurrentRumor: () => set({ currentRumor: null }),

  // ============================================
  // ACTIONS - FILTRES
  // ============================================

  /**
   * Met à jour les filtres et relance la recherche
   */
  setFilters: (newFilters) => {
    const merged = { ...get().filters, ...newFilters, page: newFilters.page || 1 };
    set({ filters: merged });
    saveFiltersToStorage(merged);
    // Recharger automatiquement les rumeurs
    get().fetchRumors();
  },

  /**
   * Change la page de pagination
   */
  setPage: (page) => {
    const filters = { ...get().filters, page };
    set({ filters });
    saveFiltersToStorage(filters);
    get().fetchRumors();
  },

  /**
   * Réinitialise tous les filtres
   */
  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } });
    saveFiltersToStorage(DEFAULT_FILTERS);
    get().fetchRumors();
  },

  // ============================================
  // ACTIONS - STATISTIQUES
  // ============================================

  /**
   * Charge les statistiques du dashboard
   */
  fetchStats: async () => {
    set({ loadingStats: true });
    try {
      const response = await getDashboardStats();
      if (response.success) {
        set({ stats: response.data, loadingStats: false });
      } else {
        set({ loadingStats: false });
      }
    } catch (err) {
      set({ loadingStats: false });
    }
  },

  /**
   * Charge les statistiques de validation
   */
  fetchValidationStats: async () => {
    try {
      const response = await getValidationStats();
      if (response.success) {
        set({ validationStats: response.data });
      }
    } catch (err) {
      console.error('Erreur chargement stats validation:', err);
    }
  },

  /**
   * Charge les statistiques de risque
   */
  fetchRiskStats: async () => {
    try {
      const response = await getRiskStats();
      if (response.success) {
        set({ riskStats: response.data });
      }
    } catch (err) {
      console.error('Erreur chargement stats risque:', err);
    }
  },

  /**
   * Charge les 10 dernières rumeurs pour le dashboard
   */
  fetchRecentRumors: async () => {
    try {
      const response = await getRumors({ page: 1, limit: 10 });
      if (response.success) {
        set({ recentRumors: response.data });
      }
    } catch (err) {
      console.error('Erreur chargement rumeurs récentes:', err);
    }
  },

  // ============================================
  // ACTIONS - ACTEURS
  // ============================================

  /**
   * Charge la liste des acteurs
   */
  fetchActors: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await getActors(params);
      if (response.success) {
        set({ actors: response.data, loading: false });
      } else {
        set({ error: response.message, loading: false });
      }
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // ============================================
  // ACTIONS - ERREURS
  // ============================================

  /**
   * Efface l'erreur courante
   */
  clearError: () => set({ error: null }),
}));

// ============================================
// HELPERS PERSISTANCE
// ============================================

const FILTERS_STORAGE_KEY = 'cohrm_filters';

function loadFiltersFromStorage() {
  try {
    const saved = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_FILTERS, ...JSON.parse(saved) };
    }
  } catch {
    // Ignorer les erreurs de parsing
  }
  return { ...DEFAULT_FILTERS };
}

function saveFiltersToStorage(filters) {
  try {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  } catch {
    // Ignorer les erreurs de stockage
  }
}

export default useCohrmStore;
