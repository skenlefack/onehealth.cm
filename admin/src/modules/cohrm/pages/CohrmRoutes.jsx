/**
 * CohrmRoutes - Système de routing interne du module COHRM
 *
 * Utilise le state activePage du store Zustand pour la navigation interne,
 * compatible avec le routing par état du AdminApp existant.
 *
 * Pages protégées par le système de permissions (niveaux 1-5).
 */

import React from 'react';
import useCohrmStore from '../stores/cohrmStore';
import { ProtectedRoute } from '../hooks/usePermissions';
import CohrmDashboard from './CohrmDashboard';
import ValidationQueue from './ValidationQueue';
import ValidationStats from './ValidationStats';
import RiskDashboard from './RiskDashboard';
import FullMapPage from './FullMapPage';
import SMSManager from './SMSManager';
import WebScanner from './WebScanner';
import RumorsList from './RumorsList';
import RumorDetail from './RumorDetail';
import RumorCreate from './RumorCreate';
import RumorEdit from './RumorEdit';
import ExportPage from './ExportPage';
import CohrmSettings from './CohrmSettings';
import ActorsList from './ActorsList';
import ActorForm from './ActorForm';
import ActorDetail from './ActorDetail';

/**
 * Composant de routing COHRM
 * Rend la page correspondant à activePage du store
 *
 * @param {object} props
 * @param {object} props.user - Utilisateur connecté
 * @param {boolean} props.isDark - Mode sombre
 */
const CohrmRoutes = ({ user, isDark }) => {
  const { activePage, selectedRumorId, selectedActorId } = useCohrmStore();

  /**
   * Résout la page active vers le composant correspondant
   * Chaque page est protégée par un niveau minimum
   */
  const renderPage = () => {
    switch (activePage) {
      // ---- Dashboard (niveau 1+) ----
      case 'dashboard':
        return (
          <ProtectedRoute user={user} section="dashboard" isDark={isDark}>
            <CohrmDashboard isDark={isDark} user={user} />
          </ProtectedRoute>
        );

      // ---- Rumeurs (niveau 1+) ----
      case 'rumors':
        return (
          <ProtectedRoute user={user} section="rumors" isDark={isDark}>
            <RumorsList isDark={isDark} user={user} />
          </ProtectedRoute>
        );

      case 'rumor-create':
        return (
          <ProtectedRoute user={user} section="rumor-create" isDark={isDark}>
            <RumorCreate isDark={isDark} user={user} />
          </ProtectedRoute>
        );

      case 'rumor-detail':
        return (
          <ProtectedRoute user={user} section="rumor-detail" isDark={isDark}>
            <RumorDetail isDark={isDark} user={user} />
          </ProtectedRoute>
        );

      case 'rumor-edit':
        return (
          <ProtectedRoute user={user} section="rumor-edit" isDark={isDark}>
            <RumorEdit isDark={isDark} user={user} />
          </ProtectedRoute>
        );

      // ---- Validation (niveau 1+, actions selon niveau) ----
      case 'validation':
        return (
          <ProtectedRoute user={user} section="validation" isDark={isDark}>
            <ValidationQueue user={user} isDark={isDark} />
          </ProtectedRoute>
        );

      case 'validation-stats':
        return (
          <ProtectedRoute user={user} section="validation" isDark={isDark}>
            <ValidationStats user={user} isDark={isDark} />
          </ProtectedRoute>
        );

      // ---- Carte (niveau 1+) ----
      case 'map':
        return (
          <ProtectedRoute user={user} section="map" isDark={isDark}>
            <FullMapPage isDark={isDark} user={user} />
          </ProtectedRoute>
        );

      // ---- Risques (niveau 3+) ----
      case 'risk':
        return (
          <ProtectedRoute user={user} section="risk" isDark={isDark}>
            <RiskDashboard isDark={isDark} user={user} />
          </ProtectedRoute>
        );

      // ---- SMS (niveau 3+) ----
      case 'sms':
        return (
          <ProtectedRoute user={user} section="sms" isDark={isDark}>
            <SMSManager isDark={isDark} user={user} />
          </ProtectedRoute>
        );

      // ---- Scanner Web (niveau 3+) ----
      case 'scanner':
        return (
          <ProtectedRoute user={user} section="scanner" isDark={isDark}>
            <WebScanner isDark={isDark} user={user} />
          </ProtectedRoute>
        );

      // ---- Acteurs (niveau 4+) ----
      case 'actors':
        return (
          <ProtectedRoute user={user} section="actors" isDark={isDark}>
            <ActorsList isDark={isDark} user={user} />
          </ProtectedRoute>
        );

      case 'actor-create':
        return (
          <ProtectedRoute user={user} section="actor-create" isDark={isDark}>
            <ActorForm isDark={isDark} user={user} />
          </ProtectedRoute>
        );

      case 'actor-edit':
        return (
          <ProtectedRoute user={user} section="actor-detail" isDark={isDark}>
            <ActorForm isDark={isDark} user={user} isEdit />
          </ProtectedRoute>
        );

      case 'actor-detail':
        return (
          <ProtectedRoute user={user} section="actor-detail" isDark={isDark}>
            <ActorDetail isDark={isDark} user={user} />
          </ProtectedRoute>
        );

      // ---- Export (niveau 2+) ----
      case 'export':
        return (
          <ProtectedRoute user={user} section="export" isDark={isDark}>
            <ExportPage isDark={isDark} user={user} />
          </ProtectedRoute>
        );

      // ---- Paramètres (niveau 5 uniquement) ----
      case 'settings':
        return (
          <ProtectedRoute user={user} section="settings" isDark={isDark}>
            <CohrmSettings isDark={isDark} user={user} />
          </ProtectedRoute>
        );

      // ---- Défaut : Dashboard ----
      default:
        return <CohrmDashboard isDark={isDark} user={user} />;
    }
  };

  return renderPage();
};

export default CohrmRoutes;
