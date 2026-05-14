import type { Card } from "../types";

type CardPreviewProps = {
  card: Card;
  isOverlay?: boolean;
  onClick?: () => void;
};

export default function CardPreview({
  card,
  isOverlay = false,
  onClick,
}: CardPreviewProps) {
  return (
    <button
      type="button"
      className={`trello-card ${isOverlay ? "drag-overlay-card" : ""}`}
      onClick={onClick}
    >
      {card.labels.length > 0 && (
        <div className="trello-card-labels">
          {card.labels.slice(0, 4).map((label) => (
            <span
              key={label.id}
              style={{ backgroundColor: label.color }}
              title={label.name}
            />
          ))}
        </div>
      )}

      <strong>{card.title}</strong>

      {card.description && <p>{card.description}</p>}

      <div className="trello-card-footer">
        {card.due_date && (
          <span>📅 {new Date(card.due_date).toLocaleDateString()}</span>
        )}

        {card.assignees.length > 0 && (
          <span>👥 {card.assignees.length}</span>
        )}
      </div>
    </button>
  );
}