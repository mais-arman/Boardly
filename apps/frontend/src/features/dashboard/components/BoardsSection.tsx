import Button from "../../../shared/components/Button";
import type { Board } from "../../boards/types";
import BoardCard from "./BoardCard";

type BoardsSectionProps = {
  boards: Board[];
  fallbackColor: string;
  onCreateBoard: () => void;
  onEditBoard: (board: Board) => void;
  onDeleteBoard: (board: Board) => void;
};

export default function BoardsSection({
  boards,
  fallbackColor,
  onCreateBoard,
  onEditBoard,
  onDeleteBoard,
}: BoardsSectionProps) {
  return (
    <section className="section-block">
      <div className="section-header">
        <div>
          <h2>Your boards</h2>
          <p>Boards you own or collaborate on.</p>
        </div>
      </div>

      {boards.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No boards yet</h3>
          <p>Create your first Kanban board and start organizing work.</p>

          <Button type="button" onClick={onCreateBoard}>
            Create board
          </Button>
        </div>
      ) : (
        <div className="boards-grid">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              fallbackColor={fallbackColor}
              onEdit={onEditBoard}
              onDelete={onDeleteBoard}
            />
          ))}
        </div>
      )}
    </section>
  );
}