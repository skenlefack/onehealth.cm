import React from 'react';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

const AnalyticsModule = ({ isDark, token, user, onBack }) => {
  return <AnalyticsDashboard isDark={isDark} token={token} user={user} onBack={onBack} />;
};

export default AnalyticsModule;
export { default as useAnalyticsStore } from './stores/analyticsStore';
