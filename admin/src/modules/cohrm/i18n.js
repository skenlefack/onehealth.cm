/**
 * COHRM - Configuration i18next
 *
 * Langues : fr (défaut), en
 * Détection automatique de la langue du navigateur
 * Persistance dans localStorage (clé 'cohrm_language')
 * Namespace : cohrm
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from './locales/fr/cohrm.json';
import en from './locales/en/cohrm.json';

const STORAGE_KEY = 'cohrm_language';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { cohrm: fr },
      en: { cohrm: en },
    },

    // Langue par défaut
    fallbackLng: 'fr',

    // Namespace par défaut
    defaultNS: 'cohrm',
    ns: ['cohrm'],

    // Détection de la langue
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: STORAGE_KEY,
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React échappe déjà
    },

    // Ne pas charger de langues manquantes en async
    partialBundledLanguages: false,

    react: {
      useSuspense: false,
    },
  });

export default i18n;
