import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getBoardPath } from "../../../app/constants/routes";
import Button from "../../../shared/components/Button";
import type { Board, BoardRole } from "../../boards/types";

type BoardCardProps = {
  board: Board;
  fallbackColor: string;
  onEdit: (board: Board) => void;
  onDelete: (board: Board) => void;
};

function getRoleKey(role: BoardRole | null) {
  return role || "";
}

export default function BoardCard({
  board,
  fallbackColor,
  onEdit,
  onDelete,
}: BoardCardProps) {
  const { t } = useTranslation();

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
                {t(`roles.${getRoleKey(board.role)}`)}
              </span>
            )}
          </div>

          <p>{board.description || t("boards.noDescription")}</p>

          <div className="board-meta">
            <span>
              {board.members_count} {t("common.members")}
            </span>
            <span>
              {board.lists_count} {t("common.lists")}
            </span>
            <span>
              {board.cards_count} {t("common.cards")}
            </span>
          </div>

          <div className="board-date">
            {t("common.created")}:{" "}
            {new Date(board.created_at).toLocaleDateString()}
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
            {t("common.edit")}
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={() => onDelete(board)}
          >
            {t("common.delete")}
          </Button>
        </div>
      )}
    </article>
  );
}