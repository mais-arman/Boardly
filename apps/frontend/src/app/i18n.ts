import i18n from "i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

export const supportedLanguages = {
  en: {
    label: "English",
    shortLabel: "EN",
    dir: "ltr",
  },
  ar: {
    label: "العربية",
    shortLabel: "AR",
    dir: "rtl",
  },
} as const;

export type SupportedLanguage = keyof typeof supportedLanguages;

function getNormalizedLanguage(language: string): SupportedLanguage {
  return language.startsWith("ar") ? "ar" : "en";
}

function applyDocumentDirection(language: string) {
  const currentLanguage = getNormalizedLanguage(language);
  const direction = supportedLanguages[currentLanguage].dir;

  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = direction;
}

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: Object.keys(supportedLanguages),
    ns: ["translation"],
    defaultNS: "translation",
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "boardly_language",
    },

    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
  })
  .then(() => {
    applyDocumentDirection(i18n.language);
  });

i18n.on("languageChanged", (language) => {
  applyDocumentDirection(language);
});

export default i18n;