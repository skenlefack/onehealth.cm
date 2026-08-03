/**
 * DusscRoutes — Routage interne du module DUSS-C
 * Switch sur activePage du store Zustand
 * Formulaires ouverts en pleine page avec bouton retour
 */

import React from 'react';
import useDusscStore from '../stores/dusscStore';
import DusscDashboard from './DusscDashboard';
import DusscQuestions from './DusscQuestions';
import DusscQuestionDetail from './DusscQuestionDetail';
import DusscQuestionForm from './DusscQuestionForm';
import DusscQuestionImport from './DusscQuestionImport';
import DusscTemplates from './DusscTemplates';
import DusscTemplateForm from './DusscTemplateForm';
import DusscAlerts from './DusscAlerts';
import DusscAlertForm from './DusscAlertForm';
import DusscPsychometrics from './DusscPsychometrics';
import DusscSettings from './DusscSettings';

const DusscRoutes = ({ isDark, user }) => {
  const { activePage } = useDusscStore();

  const props = { isDark, user };

  switch (activePage) {
    // Dashboard
    case 'dashboard':
      return <DusscDashboard {...props} />;

    // Questions
    case 'questions':
      return <DusscQuestions {...props} />;
    case 'question-detail':
      return <DusscQuestionDetail {...props} />;
    case 'question-create':
      return <DusscQuestionForm {...props} />;
    case 'question-import':
      return <DusscQuestionImport {...props} />;

    // Templates
    case 'templates':
      return <DusscTemplates {...props} />;
    case 'template-create':
      return <DusscTemplateForm {...props} />;

    // Alertes
    case 'alerts':
      return <DusscAlerts {...props} />;
    case 'alert-create':
      return <DusscAlertForm {...props} />;

    // Analytics
    case 'psychometrics':
      return <DusscPsychometrics {...props} />;

    // Settings
    case 'settings':
      return <DusscSettings {...props} />;

    default:
      return <DusscDashboard {...props} />;
  }
};

export default DusscRoutes;
