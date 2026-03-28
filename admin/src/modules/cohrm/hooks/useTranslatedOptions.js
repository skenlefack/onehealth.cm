/**
 * useTranslatedOptions - Hook retournant les listes d'options traduites
 *
 * Traduit dynamiquement toutes les options de sélection (statut, priorité,
 * source, risque, espèces, symptômes, événements, régions) en utilisant
 * les traductions i18next du namespace cohrm.
 *
 * Usage :
 *   const { statusOptions, priorityOptions, sourceOptions } = useTranslatedOptions();
 *   // Chaque option : { value, label, color?, bgColor?, icon? }
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  SOURCE_OPTIONS,
  RISK_LEVELS,
  REGIONS_CAMEROON,
} from '../utils/constants';

const useTranslatedOptions = () => {
  const { t, i18n } = useTranslation('cohrm');
  const lang = i18n.language;

  return useMemo(() => {
    // ---- Statuts ----
    const statusOptions = STATUS_OPTIONS.map(s => ({
      value: s.value,
      label: t(`rumors.status.${s.value}`),
      color: s.color,
      bgColor: s.bgColor,
    }));

    // ---- Priorités ----
    const priorityOptions = PRIORITY_OPTIONS.map(p => ({
      value: p.value,
      label: t(`rumors.priority.${p.value}`),
      color: p.color,
      bgColor: p.bgColor,
    }));

    // ---- Sources ----
    const sourceOptions = SOURCE_OPTIONS.map(s => ({
      value: s.value,
      label: t(`rumors.source.${s.value}`),
      icon: s.icon,
    }));

    // ---- Niveaux de risque ----
    const riskOptions = RISK_LEVELS.map(r => ({
      value: r.value,
      label: t(`risk.levels.${r.value}`),
      color: r.color,
      bgColor: r.bgColor,
      icon: r.icon,
    }));

    // ---- Espèces ----
    const speciesOptions = [
      { value: 'HUM', code: 'HUM' },
      { value: 'BOV', code: 'BOV' },
      { value: 'OVI', code: 'OVI' },
      { value: 'VOL', code: 'VOL' },
      { value: 'POR', code: 'POR' },
      { value: 'SAU', code: 'SAU' },
      { value: 'CHI', code: 'CHI' },
      { value: 'AUT', code: 'AUT' },
    ].map(s => ({
      value: s.value,
      label: t(`sms.species.${s.code}`),
    }));

    // ---- Symptômes ----
    const symptomOptions = [
      'FI', 'VO', 'DI', 'TO', 'ER', 'HE', 'PA', 'MO', 'AB', 'RE', 'NE', 'OE',
    ].map(code => ({
      value: code,
      label: t(`sms.symptoms.${code}`),
    }));

    // ---- Événements SMS ----
    const eventOptions = [
      'MAL', 'MOR', 'EPI', 'ZOO', 'INT', 'ENV',
    ].map(code => ({
      value: code,
      label: t(`sms.events.${code}`),
    }));

    // ---- Régions ----
    const regionOptions = REGIONS_CAMEROON.map(r => ({
      value: r.code,
      label: t(`regions.${r.code}`),
      capital: r.capital,
      lat: r.lat,
      lng: r.lng,
    }));

    // ---- Catégories ----
    const categoryOptions = [
      'human_health', 'animal_health', 'environmental', 'safety', 'disaster', 'other',
    ].map(cat => ({
      value: cat,
      label: t(`rumors.category.${cat}`),
    }));

    // ---- Niveaux de validation ----
    const validationLevelOptions = [1, 2, 3, 4, 5].map(level => ({
      value: level,
      label: t(`validation.levels.${level}.name`),
      role: t(`validation.levels.${level}.role`),
      description: t(`validation.levels.${level}.description`),
    }));

    // ---- Types de feedback ----
    const feedbackTypeOptions = [
      'acknowledgment', 'status_update', 'clarification',
      'response_action', 'alert', 'correction',
    ].map(type => ({
      value: type,
      label: t(`feedback.types.${type}`),
    }));

    // ---- Canaux de communication ----
    const channelOptions = [
      'system', 'sms', 'phone', 'email', 'whatsapp', 'radio',
    ].map(ch => ({
      value: ch,
      label: t(`feedback.channels.${ch}`),
    }));

    return {
      statusOptions,
      priorityOptions,
      sourceOptions,
      riskOptions,
      speciesOptions,
      symptomOptions,
      eventOptions,
      regionOptions,
      categoryOptions,
      validationLevelOptions,
      feedbackTypeOptions,
      channelOptions,
    };
  }, [t, lang]);
};

export default useTranslatedOptions;
