import { Link } from "react-router-dom";
import { getBoardPath } from "../../../app/constants/routes";
import Button from "../../../shared/components/Button";
import type { Board, BoardRole } from "../../boards/types";

type BoardCardProps = {
  board: Board;
  fallbackColor: string;
  onEdit: (board: Board) => void;
  onDelete: (board: Board) => void;
};

function getRoleLabel(role: BoardRole | null) {
  if (!role) return "";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function BoardCard({
  board,
  fallbackColor,
  onEdit,
  onDelete,
}: BoardCardProps) {
  return (
    <article className="board-card">
      <Link to={getBoardPath(board.id)} className="board-card-link">
        <div
          className="board-cover"
          style={{
            background: board.background_color || fallbackColor,
          }}
        />

        <div className="board-card-body">
          <div className="board-card-top">
            <h3>{board.title}</h3>

            {board.role && (
              <span className={`role-pill ${board.role}`}>
                {getRoleLabel(board.role)}
              </span>
            )}
          </div>

          <p>{board.description || "No description provided."}</p>

          <div className="board-meta">
            <span>{board.members_count} members</span>
            <span>{board.lists_count} lists</span>
            <span>{board.cards_count} cards</span>
          </div>

          <div className="board-date">
            Created: {new Date(board.created_at).toLocaleDateString()}
          </div>
        </div>
      </Link>

      {board.role === "owner" && (
        <div className="board-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onEdit(board)}
          >
            Edit
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={() => onDelete(board)}
          >
            Delete
          </Button>
        </div>
      )}
    </article>
  );
}