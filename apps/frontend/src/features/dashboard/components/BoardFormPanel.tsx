import type { FormEvent } from "react";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import type { Board } from "../../boards/types";

type BoardFormPanelProps = {
  editingBoard: Board | null;
  boardTitle: string;
  boardDescription: string;
  boardColor: string;
  boardColors: string[];
  isSaving: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export default function BoardFormPanel({
  editingBoard,
  boardTitle,
  boardDescription,
  boardColor,
  boardColors,
  isSaving,
  onTitleChange,
  onDescriptionChange,
  onColorChange,
  onSubmit,
  onCancel,
}: BoardFormPanelProps) {
  return (
    <section className="section-block create-board-panel">
      <div className="section-header">
        <div>
          <h2>{editingBoard ? "Edit board" : "Create board"}</h2>
          <p>Choose title, description, and board background.</p>
        </div>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        <Input
          label="Board title"
          value={boardTitle}
          onChange={(event) => onTitleChange(event.target.value)}
          required
        />

        <div className="field-group">
          <label htmlFor="board-description">Description</label>

          <textarea
            id="board-description"
            value={boardDescription}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder="Optional board description"
          />
        </div>

        <div className="field-group">
          <label>Background color</label>

          <div className="color-picker-grid">
            {boardColors.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-option ${
                  boardColor === color ? "selected" : ""
                }`}
                style={{ background: color }}
                onClick={() => onColorChange(color)}
                aria-label={`Choose ${color}`}
              />
            ))}
          </div>
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>

          <Button type="submit" isLoading={isSaving}>
            {editingBoard ? "Save changes" : "Create board"}
          </Button>
        </div>
      </form>
    </section>
  );
}