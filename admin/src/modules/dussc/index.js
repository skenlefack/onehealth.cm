/**
 * DUSS-C Module — Point d'entrée
 * Défi Une Seule Santé Cameroun
 *
 * Usage dans AdminApp:
 *   import DusscModule from './modules/dussc';
 *   <DusscModule isDark={isDark} token={token} user={user} onBack={() => setActivePage('dashboard')} />
 */

import React, { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Initialiser i18n
import './i18n';

// Composants internes
import DusscLayout from './components/DusscLayout';
import DusscRoutes from './pages/DusscRoutes';
import useDusscStore from './stores/dusscStore';

const DusscModule = ({ isDark, token, user, onBack }) => {
  const { fetchModules, fetchPersonas } = useDusscStore();

  // Charger les données de référence au montage
  useEffect(() => {
    fetchModules();
    fetchPersonas();
  }, []);

  return (
    <>
      <DusscLayout isDark={isDark} user={user} onBack={onBack}>
        <DusscRoutes isDark={isDark} user={user} />
      </DusscLayout>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDark ? 'dark' : 'light'}
      />
    </>
  );
};

export default DusscModule;

// Exports nommés pour usage avancé
export { default as DusscLayout } from './components/DusscLayout';
export { default as DusscRoutes } from './pages/DusscRoutes';
export { default as useDusscStore } from './stores/dusscStore';
