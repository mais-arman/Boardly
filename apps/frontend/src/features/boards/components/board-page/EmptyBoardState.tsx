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
  return (
    <section className="workflow-empty">
      <h2>No lists yet</h2>

      {canManageLists ? (
        <>
          <p>Create a Trello-like workflow to start managing cards.</p>

          <Button
            type="button"
            isLoading={isCreating}
            onClick={onCreateDefaultWorkflow}
          >
            Create default workflow
          </Button>
        </>
      ) : (
        <>
          <p>You have viewer access. You can view board content only.</p>

          <span className="permission-note">
            Ask the owner or admin for Editor access.
          </span>
        </>
      )}
    </section>
  );
}