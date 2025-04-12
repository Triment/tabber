import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import translationEN from './locales/en/translation.json';
import translationZH from './locales/zh/translation.json';

const resources = {
  en: {
    translation: translationEN,
  },
  zh: {
    translation: translationZH,
  },
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // Init i18next
  .init({
    debug: import.meta.env.DEV, // Enable debug output in development
    fallbackLng: 'en', // Use 'en' if detected language is not available
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    resources: resources,
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'], // Order of detection methods
      caches: ['localStorage'], // Cache the detected language in localStorage
    },
  });

export default i18n;
