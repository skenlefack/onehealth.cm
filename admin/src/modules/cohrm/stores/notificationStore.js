/**
 * COHRM Notification Store (Zustand)
 * Gestion des notifications en temps réel
 */

import { create } from 'zustand';
import { getNotifications, getMyNotifications } from '../services/cohrmApi';
import socketService from '../services/socketService';

const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  loading: false,
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  filter: 'all', // 'all', 'unread', notification_type

  // Actions
  setFilter: (filter) => set({ filter }),

  /**
   * Initialise la connexion Socket.IO et les handlers
   */
  initSocket: () => {
    socketService.connect({
      onNotification: (notification) => {
        set(state => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },
      onUnreadCount: (count) => {
        set({ unreadCount: count });
      },
      onConnectionChange: (connected) => {
        set({ isConnected: connected });
      },
    });
  },

  /**
   * Déconnecte Socket.IO
   */
  disconnectSocket: () => {
    socketService.disconnect();
    set({ isConnected: false });
  },

  /**
   * Charge les notifications depuis l'API
   */
  fetchNotifications: async (params = {}) => {
    set({ loading: true });
    try {
      const { filter, pagination } = get();
      const queryParams = {
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
        ...params,
      };

      if (filter === 'unread') {
        queryParams.status = 'sent';
      } else if (filter !== 'all') {
        queryParams.type = filter;
      }

      const response = await getMyNotifications(queryParams);
      if (response.success) {
        set({
          notifications: response.data || [],
          pagination: response.pagination || pagination,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      set({ loading: false });
    }
  },

  /**
   * Marque une notification comme lue
   */
  markAsRead: (id) => {
    socketService.markAsRead(id);
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, status: 'delivered' } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  /**
   * Marque toutes les notifications comme lues
   */
  markAllAsRead: () => {
    socketService.markAllAsRead();
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, status: 'delivered' })),
      unreadCount: 0,
    }));
  },

  /**
   * Supprime une notification (côté client uniquement)
   */
  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },
}));

export default useNotificationStore;
