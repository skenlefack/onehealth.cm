/**
 * RumorEdit - Page d'édition d'une rumeur
 * Réutilise le formulaire RumorCreate en mode édition
 */

import React, { useEffect } from 'react';
import useCohrmStore from '../stores/cohrmStore';
import { updateRumor } from '../services/cohrmApi';
import { LoadingSpinner, EmptyState } from '../components/shared';
import RumorCreate from './RumorCreate';
import { toast } from 'react-toastify';

const RumorEdit = ({ isDark = false, user }) => {
  const {
    currentRumor,
    loadingRumor,
    selectedRumorId,
    fetchRumor,
    clearCurrentRumor,
    setActivePage,
    navigateToRumor,
    fetchRumors,
  } = useCohrmStore();

  // Charger la rumeur à éditer
  useEffect(() => {
    if (selectedRumorId) {
      fetchRumor(selectedRumorId);
    }
    return () => clearCurrentRumor();
  }, [selectedRumorId]); // eslint-disable-line

  // Handler de soumission (mise à jour)
  const handleSubmit = async (payload) => {
    await updateRumor(selectedRumorId, payload);
    toast.success('Rumeur mise à jour avec succès');
    fetchRumors();
    navigateToRumor(selectedRumorId);
  };

  if (loadingRumor) {
    return <LoadingSpinner isDark={isDark} size="lg" />;
  }

  if (!currentRumor) {
    return (
      <EmptyState
        variant="error"
        message="Rumeur non trouvée"
        isDark={isDark}
        actionLabel="Retour"
        onAction={() => setActivePage('rumors')}
      />
    );
  }

  return (
    <RumorCreate
      isDark={isDark}
      user={user}
      editMode
      initialData={currentRumor}
      onSubmit={handleSubmit}
    />
  );
};

export default RumorEdit;
