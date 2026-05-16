import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card } from "../../cards/types";
import CardPreview from "./CardPreview";

type SortableCardProps = {
  card: Card;
  disabled: boolean;
  onOpen: (card: Card) => void;
};

export default function SortableCard({
  card,
  disabled,
  onOpen,
}: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    disabled,
    data: {
      type: "card",
      card,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={isDragging ? "sortable-card dragging" : "sortable-card"}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
    >
      <CardPreview card={card} onClick={() => onOpen(card)} />
    </div>
  );
}