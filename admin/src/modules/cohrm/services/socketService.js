/**
 * COHRM Socket.IO Client Service
 * Gère la connexion WebSocket pour les notifications en temps réel
 */

import { io } from 'socket.io-client';

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

const API_URL = process.env.REACT_APP_API_URL || '';
const SOCKET_URL = API_URL.replace('/api', '') || window.location.origin;

/**
 * Connecte au namespace COHRM Socket.IO
 * @param {Function} onNotification - Callback pour les nouvelles notifications
 * @param {Function} onUnreadCount - Callback pour le compteur non lu
 * @param {Function} onConnectionChange - Callback pour l'état de connexion
 */
export const connect = ({ onNotification, onUnreadCount, onConnectionChange } = {}) => {
  if (socket?.connected) return socket;

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) return null;

  socket = io(`${SOCKET_URL}/cohrm`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30000,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
  });

  socket.on('connect', () => {
    reconnectAttempts = 0;
    onConnectionChange?.(true);
    console.log('[COHRM Socket] Connected');
  });

  socket.on('disconnect', (reason) => {
    onConnectionChange?.(false);
    console.log('[COHRM Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    reconnectAttempts++;
    onConnectionChange?.(false);
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.warn('[COHRM Socket] Max reconnection attempts reached');
    }
  });

  // Événements de notification
  socket.on('notification:new', (notification) => {
    onNotification?.(notification);
  });

  socket.on('notifications:unread-count', (data) => {
    onUnreadCount?.(data.count);
  });

  // Événements de rumeurs (pour mise à jour en temps réel des listes)
  socket.on('rumor:created', (data) => {
    window.dispatchEvent(new CustomEvent('cohrm:rumor-created', { detail: data }));
  });

  socket.on('rumor:updated', (data) => {
    window.dispatchEvent(new CustomEvent('cohrm:rumor-updated', { detail: data }));
  });

  return socket;
};

/**
 * Marque une notification comme lue
 */
export const markAsRead = (notificationId) => {
  socket?.emit('notification:read', { id: notificationId });
};

/**
 * Marque toutes les notifications comme lues
 */
export const markAllAsRead = () => {
  socket?.emit('notifications:read-all');
};

/**
 * Déconnecte le socket
 */
export const disconnect = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    reconnectAttempts = 0;
  }
};

/**
 * Vérifie si le socket est connecté
 */
export const isConnected = () => socket?.connected ?? false;

export default {
  connect,
  disconnect,
  markAsRead,
  markAllAsRead,
  isConnected,
};
