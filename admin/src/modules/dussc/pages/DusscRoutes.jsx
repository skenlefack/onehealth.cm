/**
 * DusscRoutes — Routage interne du module DUSS-C
 * Switch sur activePage du store Zustand
 */

import React from 'react';
import useDusscStore from '../stores/dusscStore';
import DusscDashboard from './DusscDashboard';
import DusscQuestions from './DusscQuestions';
import DusscQuestionDetail from './DusscQuestionDetail';
import DusscTemplates from './DusscTemplates';
import DusscAlerts from './DusscAlerts';
import DusscPsychometrics from './DusscPsychometrics';
import DusscSettings from './DusscSettings';

const DusscRoutes = ({ isDark, user }) => {
  const { activePage } = useDusscStore();

  const props = { isDark, user };

  switch (activePage) {
    case 'dashboard':
      return <DusscDashboard {...props} />;
    case 'questions':
      return <DusscQuestions {...props} />;
    case 'question-detail':
      return <DusscQuestionDetail {...props} />;
    case 'templates':
      return <DusscTemplates {...props} />;
    case 'alerts':
      return <DusscAlerts {...props} />;
    case 'psychometrics':
      return <DusscPsychometrics {...props} />;
    case 'settings':
      return <DusscSettings {...props} />;
    default:
      return <DusscDashboard {...props} />;
  }
};

export default DusscRoutes;
