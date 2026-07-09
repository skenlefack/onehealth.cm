import { create } from 'zustand';
import * as api from '../services/analyticsApi';

const useAnalyticsStore = create((set, get) => ({
  // State
  period: '7d',
  startDate: null,
  endDate: null,
  dashboard: null,
  pages: null,
  referrers: null,
  browsers: null,
  os: null,
  devices: null,
  countries: null,
  realtime: null,
  events: null,
  utm: null,
  loading: false,
  error: null,

  // Actions
  setPeriod: (period) => {
    set({ period, startDate: null, endDate: null });
    get().fetchAll();
  },

  setCustomRange: (startDate, endDate) => {
    set({ period: 'custom', startDate, endDate });
    get().fetchAll();
  },

  getParams: () => {
    const { period, startDate, endDate } = get();
    if (period === 'custom' && startDate && endDate) {
      return { period: 'custom', start: startDate, end: endDate };
    }
    return { period };
  },

  fetchDashboard: async () => {
    try {
      const res = await api.getDashboard(get().getParams());
      if (res.success) set({ dashboard: res.data });
    } catch (err) {
      console.error('fetchDashboard:', err.message);
    }
  },

  fetchPages: async () => {
    try {
      const res = await api.getPages(get().getParams());
      if (res.success) set({ pages: res.data });
    } catch (err) {
      console.error('fetchPages:', err.message);
    }
  },

  fetchReferrers: async () => {
    try {
      const res = await api.getReferrers(get().getParams());
      if (res.success) set({ referrers: res.data });
    } catch (err) {
      console.error('fetchReferrers:', err.message);
    }
  },

  fetchBrowsers: async () => {
    try {
      const res = await api.getBrowsers(get().getParams());
      if (res.success) set({ browsers: res.data });
    } catch (err) {
      console.error('fetchBrowsers:', err.message);
    }
  },

  fetchOs: async () => {
    try {
      const res = await api.getOsStats(get().getParams());
      if (res.success) set({ os: res.data });
    } catch (err) {
      console.error('fetchOs:', err.message);
    }
  },

  fetchDevices: async () => {
    try {
      const res = await api.getDevices(get().getParams());
      if (res.success) set({ devices: res.data });
    } catch (err) {
      console.error('fetchDevices:', err.message);
    }
  },

  fetchCountries: async () => {
    try {
      const res = await api.getCountries(get().getParams());
      if (res.success) set({ countries: res.data });
    } catch (err) {
      console.error('fetchCountries:', err.message);
    }
  },

  fetchRealtime: async () => {
    try {
      const res = await api.getRealtime();
      if (res.success) set({ realtime: res.data });
    } catch (err) {
      console.error('fetchRealtime:', err.message);
    }
  },

  fetchEvents: async () => {
    try {
      const res = await api.getEvents(get().getParams());
      if (res.success) set({ events: res.data });
    } catch (err) {
      console.error('fetchEvents:', err.message);
    }
  },

  fetchUtm: async () => {
    try {
      const res = await api.getUtm(get().getParams());
      if (res.success) set({ utm: res.data });
    } catch (err) {
      console.error('fetchUtm:', err.message);
    }
  },

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      await Promise.all([
        get().fetchDashboard(),
        get().fetchPages(),
        get().fetchReferrers(),
        get().fetchBrowsers(),
        get().fetchOs(),
        get().fetchDevices(),
        get().fetchCountries(),
        get().fetchEvents(),
        get().fetchUtm(),
      ]);
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },
}));

export default useAnalyticsStore;
