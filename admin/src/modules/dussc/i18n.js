import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import fr from './locales/fr/dussc.json';
import en from './locales/en/dussc.json';

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: { fr: { dussc: fr }, en: { dussc: en } },
      ns: ['dussc'],
      defaultNS: 'dussc',
      fallbackLng: 'fr',
      detection: { lookupLocalStorage: 'dussc_language', caches: ['localStorage'] },
      interpolation: { escapeValue: false },
    });
} else {
  i18n.addResourceBundle('fr', 'dussc', fr, true, true);
  i18n.addResourceBundle('en', 'dussc', en, true, true);
}

export default i18n;
