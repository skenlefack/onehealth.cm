/**
 * EmptyState - Illustration + message quand pas de données
 */

import React from 'react';
import { Inbox, Search, AlertCircle } from 'lucide-react';

const VARIANTS = {
  empty: { Icon: Inbox, defaultTitle: 'Aucune donnée', defaultMessage: 'Aucun élément à afficher pour le moment.' },
  search: { Icon: Search, defaultTitle: 'Aucun résultat', defaultMessage: 'Aucun résultat ne correspond à votre recherche.' },
  error: { Icon: AlertCircle, defaultTitle: 'Erreur', defaultMessage: 'Une erreur est survenue lors du chargement.' },
};

const EmptyState = ({
  variant = 'empty',
  title,
  message,
  action,
  actionLabel,
  isDark = false,
}) => {
  const v = VARIANTS[variant] || VARIANTS.empty;
  const Icon = v.Icon;

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      textAlign: 'center',
    },
    iconWrapper: {
      width: 80,
      height: 80,
      borderRadius: '50%',
      background: isDark ? 'rgba(148, 163, 184, 0.1)' : '#F1F5F9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: 600,
      color: isDark ? '#e2e8f0' : '#374151',
      marginBottom: 8,
    },
    message: {
      fontSize: 14,
      color: isDark ? '#94a3b8' : '#6B7280',
      maxWidth: 360,
      lineHeight: 1.6,
      marginBottom: action ? 20 : 0,
    },
    button: {
      padding: '10px 24px',
      borderRadius: 8,
      border: 'none',
      backgroundColor: '#1B4F72',
      color: '#fff',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.iconWrapper}>
        <Icon size={36} color={isDark ? '#64748b' : '#9CA3AF'} />
      </div>
      <div style={styles.title}>{title || v.defaultTitle}</div>
      <div style={styles.message}>{message || v.defaultMessage}</div>
      {action && (
        <button
          style={styles.button}
          onClick={action}
          onMouseEnter={(e) => { e.target.style.backgroundColor = '#2980B9'; }}
          onMouseLeave={(e) => { e.target.style.backgroundColor = '#1B4F72'; }}
        >
          {actionLabel || 'Réessayer'}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
