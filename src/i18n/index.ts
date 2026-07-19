import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

// Stub locales for remaining 5 languages (full translations use en as fallback)
const ar = { ...en, nav: { ...en.nav }, home: { ...en.home, tagline: 'دليلك الذكي لأعظم احتفال كروي' } };
const pt = { ...en, nav: { ...en.nav }, home: { ...en.home, tagline: 'O seu guia de IA para o maior espetáculo do mundo' } };
const zh = { ...en, nav: { ...en.nav }, home: { ...en.home, tagline: '您的AI智能体育场向导' } };
const hi = { ...en, nav: { ...en.nav }, home: { ...en.home, tagline: 'दुनिया के सबसे बड़े खेल उत्सव के लिए आपका AI गाइड' } };
const ja = { ...en, nav: { ...en.nav }, home: { ...en.home, tagline: '世界最大のサッカーの祭典のためのAIガイド' } };

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      ar: { translation: ar },
      pt: { translation: pt },
      zh: { translation: zh },
      hi: { translation: hi },
      ja: { translation: ja },
    },
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  });

// Update <html lang> and dir on language change (RTL for Arabic)
i18n.on('languageChanged', (lng: string) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
});

export default i18n;
