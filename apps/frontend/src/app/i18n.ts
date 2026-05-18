import i18n from "i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { STORAGE_KEYS } from "./constants/storage";

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

export const DEFAULT_LANGUAGE: SupportedLanguage = "en";

export const supportedLanguageKeys = Object.keys(
  supportedLanguages
) as SupportedLanguage[];

export function getNormalizedLanguage(language: string): SupportedLanguage {
  return (
    supportedLanguageKeys.find((supportedLanguage) =>
      language.startsWith(supportedLanguage)
    ) || DEFAULT_LANGUAGE
  );
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
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: supportedLanguageKeys,
    ns: ["translation"],
    defaultNS: "translation",
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: STORAGE_KEYS.LANGUAGE,
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