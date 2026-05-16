import { useTranslation } from "react-i18next";
import Button from "../../../../shared/components/Button";

type EmptyBoardStateProps = {
  canManageLists: boolean;
  isCreating: boolean;
  onCreateDefaultWorkflow: () => void;
};

export default function EmptyBoardState({
  canManageLists,
  isCreating,
  onCreateDefaultWorkflow,
}: EmptyBoardStateProps) {
  const { t } = useTranslation();

  return (
    <section className="workflow-empty">
      <h2>{t("boards.noListsYet")}</h2>

      {canManageLists ? (
        <>
          <p>{t("boards.emptyWorkflowDescription")}</p>

          <Button
            type="button"
            isLoading={isCreating}
            onClick={onCreateDefaultWorkflow}
          >
            {t("boards.createDefaultWorkflow")}
          </Button>
        </>
      ) : (
        <>
          <p>{t("boards.viewerBoardAccess")}</p>

          <span className="permission-note">
            {t("boards.askForEditorAccess")}
          </span>
        </>
      )}
    </section>
  );
}