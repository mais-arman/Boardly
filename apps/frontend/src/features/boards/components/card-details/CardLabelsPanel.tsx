import Button from "../../../../shared/components/Button";
import type { CardLabel } from "../../types";

type CardLabelsPanelProps = {
  labels: CardLabel[];
  selectedLabelIds: string[];
  selectedLabels: CardLabel[];
  labelName: string;
  labelColor: string;
  canEdit: boolean;
  isCreatingLabel: boolean;
  onToggleLabel: (label: CardLabel) => void;
  onLabelNameChange: (value: string) => void;
  onLabelColorChange: (value: string) => void;
  onCreateLabel: () => void;
};

export default function CardLabelsPanel({
  labels,
  selectedLabelIds,
  selectedLabels,
  labelName,
  labelColor,
  canEdit,
  isCreatingLabel,
  onToggleLabel,
  onLabelNameChange,
  onLabelColorChange,
  onCreateLabel,
}: CardLabelsPanelProps) {
  return (
    <section className="trello-section">
      <h3>Labels</h3>

      {selectedLabels.length > 0 && (
        <div className="selected-meta-list">
          {selectedLabels.map((label) => (
            <span
              key={label.id}
              className="label-chip"
              style={{
                backgroundColor: label.color,
                color: "white",
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {canEdit && (
        <>
          <div className="label-picker">
            {labels.map((label) => (
              <button
                key={label.id}
                type="button"
                className={selectedLabelIds.includes(label.id) ? "selected" : ""}
                onClick={() => onToggleLabel(label)}
              >
                <span style={{ backgroundColor: label.color }} />
                {label.name}
              </button>
            ))}
          </div>

          <div className="create-label-row">
            <input
              value={labelName}
              onChange={(event) => onLabelNameChange(event.target.value)}
              placeholder="New label"
            />

            <input
              type="color"
              value={labelColor}
              onChange={(event) => onLabelColorChange(event.target.value)}
            />

            <Button
              type="button"
              variant="secondary"
              isLoading={isCreatingLabel}
              onClick={onCreateLabel}
            >
              Create
            </Button>
          </div>
        </>
      )}
    </section>
  );
}