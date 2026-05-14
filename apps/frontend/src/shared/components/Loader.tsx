import { t } from "../../app/constants/translations";

export default function Loader() {
    return (
        <main className="screen-center">
        <div className="loader-card">
            <span className="loader-spinner" />
            <p>{t.common.loading}</p>
        </div>
        </main>
    );
}