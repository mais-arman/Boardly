import { useTranslation } from "react-i18next";
import {
  supportedLanguages,
  type SupportedLanguage,
} from "../../app/i18n";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language.startsWith("ar") ? "ar" : "en";

  function handleChangeLanguage(language: SupportedLanguage) {
    i18n.changeLanguage(language);
  }

  return (
    <div className="language-switcher" aria-label="Language switcher">
      {(Object.keys(supportedLanguages) as SupportedLanguage[]).map(
        (language) => (
          <button
            key={language}
            type="button"
            className={
              currentLanguage === language
                ? "language-option active"
                : "language-option"
            }
            onClick={() => handleChangeLanguage(language)}
          >
            {supportedLanguages[language].shortLabel}
          </button>
        )
      )}
    </div>
  );
}