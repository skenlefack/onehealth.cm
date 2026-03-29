/**
 * COHRM Module - Point d'entrée principal
 *
 * Ce module exporte le composant CohrmModule qui s'intègre
 * dans le AdminApp existant via le mécanisme activePage.
 *
 * Usage dans AdminApp.jsx :
 *   import CohrmModule from './modules/cohrm';
 *   // ...
 *   case 'cohrm-system':
 *     return <CohrmModule isDark={isDark} token={token} user={user} onBack={() => setActivePage('dashboard')} />;
 */

import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Initialisation i18n (doit être importé avant les composants qui utilisent useTranslation)
import './i18n';

import CohrmLayout from './components/CohrmLayout';
import CohrmRoutes from './pages/CohrmRoutes';

/**
 * Composant racine du module COHRM
 *
 * @param {object} props
 * @param {boolean} props.isDark - Mode sombre
 * @param {string} props.token - Token JWT
 * @param {object} props.user - Utilisateur connecté
 * @param {function} props.onBack - Callback pour retourner au panel admin principal
 */
const CohrmModule = ({ isDark, token, user, onBack }) => {
  return (
    <>
      <CohrmLayout user={user} isDark={isDark} onBack={onBack}>
        <CohrmRoutes user={user} isDark={isDark} />
      </CohrmLayout>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDark ? 'dark' : 'light'}
      />
    </>
  );
};

export default CohrmModule;

// Exports nommés pour usage avancé
export { default as CohrmLayout } from './components/CohrmLayout';
export { default as CohrmRoutes } from './pages/CohrmRoutes';
export { default as useCohrmStore } from './stores/cohrmStore';
export { usePermissions, ProtectedRoute, PermissionGate } from './hooks/usePermissions';
export * from './services/cohrmApi';
export { validateRumor as validateRumorForm, validateActor, validateSMS, validateGPS, validateRiskAssessment } from './utils/validators';
export * from './utils/constants';
export * from './utils/formatters';
export * from './components/shared';
export { default as ValidationQueue } from './pages/ValidationQueue';
export { default as ValidationStats } from './pages/ValidationStats';
export { default as RiskDashboard } from './pages/RiskDashboard';
export { default as RiskAssessmentForm } from './components/RiskAssessmentForm';
export { default as LanguageSwitcher } from './components/LanguageSwitcher';
export { default as useTranslatedOptions } from './hooks/useTranslatedOptions';
