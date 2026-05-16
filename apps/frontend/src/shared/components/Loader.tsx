import { useTranslation } from "react-i18next";

export default function Loader() {
  const { t } = useTranslation();

  return (
    <main className="screen-center">
      <div className="loader-card">
        <span className="loader-spinner" />
        <p>{t("common.loading")}</p>
      </div>
    </main>
  );
}