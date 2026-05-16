import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getBoardPath } from "../../../app/constants/routes";
import Button from "../../../shared/components/Button";
import type { AdminBoard } from "../types";

type AdminBoardsTableProps = {
  boards: AdminBoard[];
  onDeleteBoard: (board: AdminBoard) => void;
};

export default function AdminBoardsTable({
  boards,
  onDeleteBoard,
}: AdminBoardsTableProps) {
  const { t } = useTranslation();

  return (
    <section className="admin-section">
      <div className="section-header">
        <div>
          <h2>{t("admin.boards")}</h2>
          <p>{t("admin.viewBoards")}</p>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("admin.board")}</th>
              <th>{t("admin.owner")}</th>
              <th>{t("common.members")}</th>
              <th>{t("common.lists")}</th>
              <th>{t("common.cards")}</th>
              <th>{t("common.created")}</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {boards.map((board) => (
              <tr key={board.id}>
                <td>
                  <span
                    className="admin-board-color"
                    style={{ backgroundColor: board.background_color }}
                  />
                  {board.title}
                </td>

                <td>
                  {board.owner_name || t("admin.unknownOwner")}
                  <small>{board.owner_email}</small>
                </td>

                <td>{board.members_count}</td>
                <td>{board.lists_count}</td>
                <td>{board.cards_count}</td>
                <td>{new Date(board.created_at).toLocaleDateString()}</td>

                <td>
                  <div className="admin-actions">
                    <Link
                      to={getBoardPath(board.id)}
                      className="button button-secondary"
                    >
                      {t("common.open")}
                    </Link>

                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => onDeleteBoard(board)}
                    >
                      {t("common.delete")}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}