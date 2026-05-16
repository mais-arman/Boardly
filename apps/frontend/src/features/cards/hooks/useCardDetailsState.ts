import { useState } from "react";
import type { Card } from "../types";

export function useCardDetailsState(card: Card) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [dueDate, setDueDate] = useState(
    card.due_date ? card.due_date.slice(0, 10) : ""
  );
  const [comment, setComment] = useState("");

  return {
    state: {
      title,
      description,
      dueDate,
      comment,
    },

    actions: {
      setTitle,
      setDescription,
      setDueDate,
      setComment,
    },
  };
}