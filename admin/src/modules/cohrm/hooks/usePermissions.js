/**
 * COHRM - Hook de gestion des permissions
 * Gère les niveaux d'accès basés sur le niveau d'acteur (1-5)
 */

import React, { useMemo, useCallback } from 'react';

// ============================================
// MATRICE DE PERMISSIONS PAR SECTION
// ============================================

/**
 * Définit le niveau minimum requis pour accéder à chaque section
 * Format : { section: { view: minLevel, edit: minLevel } }
 */
const PERMISSION_MATRIX = {
  dashboard:    { view: 1, edit: 5 },
  rumors:       { view: 1, edit: 1 },
  'rumor-create': { view: 1, edit: 1 },
  'rumor-detail': { view: 1, edit: 2 },
  'rumor-edit':   { view: 2, edit: 2 },
  validation:   { view: 1, edit: 1 },
  map:          { view: 1, edit: 3 },
  risk:         { view: 3, edit: 3 },
  sms:          { view: 3, edit: 3 },
  scanner:      { view: 3, edit: 3 },
  actors:       { view: 4, edit: 4 },
  'actor-create': { view: 4, edit: 4 },
  'actor-edit':   { view: 4, edit: 4 },
  'actor-detail': { view: 4, edit: 4 },
  notifications: { view: 3, edit: 5 },
  export:       { view: 2, edit: 2 },
  settings:     { view: 5, edit: 5 },
};

// ============================================
// HOOK usePermissions
// ============================================

/**
 * Hook de permissions COHRM
 *
 * @param {object} user - Objet utilisateur (contient role, actor_level, permissions)
 * @returns {object} Fonctions et données de permissions
 *
 * Usage :
 *   const { userLevel, canView, canEdit, canDelete, canValidate } = usePermissions(user);
 *   if (canView('risk')) { ... }
 */
export const usePermissions = (user) => {
  /**
   * Détermine le niveau de l'acteur COHRM
   * Les admins ont automatiquement le niveau 5
   */
  const userLevel = useMemo(() => {
    if (!user) return 0;
    if (user.role === 'admin') return 5;
    return user.actor_level || user.cohrm_level || 1;
  }, [user]);

  /**
   * Vérifie si l'utilisateur peut voir une section
   */
  const canView = useCallback((section) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    const perm = PERMISSION_MATRIX[section];
    if (!perm) return userLevel >= 1; // Par défaut, niveau 1 minimum
    return userLevel >= perm.view;
  }, [user, userLevel]);

  /**
   * Vérifie si l'utilisateur peut éditer dans une section
   */
  const canEdit = useCallback((section) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    const perm = PERMISSION_MATRIX[section];
    if (!perm) return userLevel >= 2;
    return userLevel >= perm.edit;
  }, [user, userLevel]);

  /**
   * Vérifie si l'utilisateur peut supprimer (niveau 5 / admin)
   */
  const canDelete = useCallback(() => {
    if (!user) return false;
    return user.role === 'admin' || userLevel >= 5;
  }, [user, userLevel]);

  /**
   * Vérifie si l'utilisateur peut valider une rumeur à un niveau donné
   * Un acteur peut valider les rumeurs de son niveau ou inférieur
   */
  const canValidate = useCallback((rumorLevel) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return userLevel >= rumorLevel;
  }, [user, userLevel]);

  /**
   * Vérifie si l'utilisateur peut escalader une rumeur
   * Peut escalader si le niveau suivant existe et l'utilisateur a le niveau requis
   */
  const canEscalate = useCallback((currentLevel) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return userLevel >= currentLevel && currentLevel < 5;
  }, [user, userLevel]);

  return {
    userLevel,
    canView,
    canEdit,
    canDelete,
    canValidate,
    canEscalate,
    isAdmin: user?.role === 'admin',
  };
};

// ============================================
// COMPOSANT ProtectedRoute
// ============================================

/**
 * Wrapper qui vérifie le niveau d'accès avant de rendre le contenu
 *
 * Usage :
 *   <ProtectedRoute user={user} section="risk" isDark={isDark}>
 *     <RiskDashboard />
 *   </ProtectedRoute>
 */
export const ProtectedRoute = ({ user, section, isDark, children, fallback }) => {
  const { canView } = usePermissions(user);

  if (!canView(section)) {
    return fallback || <AccessDenied isDark={isDark} section={section} />;
  }

  return children;
};

// ============================================
// COMPOSANT PermissionGate
// ============================================

/**
 * Masque les enfants si la permission est insuffisante
 * Ne rend rien (pas de message d'erreur) si l'accès est refusé
 *
 * Usage :
 *   <PermissionGate user={user} minLevel={3}>
 *     <button>Action réservée niveau 3+</button>
 *   </PermissionGate>
 */
export const PermissionGate = ({ user, minLevel = 1, section, children }) => {
  const { userLevel, canView } = usePermissions(user);

  // Vérifier par section si fournie
  if (section && !canView(section)) return null;

  // Vérifier par niveau minimum
  if (userLevel < minLevel) return null;

  return children;
};

// ============================================
// COMPOSANT AccessDenied (interne)
// ============================================

const AccessDenied = ({ isDark, section }) => {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 20px',
      textAlign: 'center',
    },
    icon: {
      width: 80,
      height: 80,
      borderRadius: '50%',
      background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 20,
      fontWeight: 700,
      color: isDark ? '#f87171' : '#DC2626',
      marginBottom: 8,
    },
    message: {
      fontSize: 14,
      color: isDark ? '#94a3b8' : '#6B7280',
      maxWidth: 400,
      lineHeight: 1.6,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.icon}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <div style={styles.title}>Accès restreint</div>
      <div style={styles.message}>
        Vous n'avez pas les permissions nécessaires pour accéder à cette section
        {section ? ` (${section})` : ''}.
        Contactez votre administrateur si vous pensez que c'est une erreur.
      </div>
    </div>
  );
};

export default usePermissions;
