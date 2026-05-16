import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES } from "../../../../app/constants/routes";
import Button from "../../../../shared/components/Button";
import type { Board } from "../../types";

type BoardPageHeaderProps = {
  board: Board;
  role: string;
  isOwner: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  isViewer: boolean;
  canManageMembers: boolean;
  canDeleteBoard: boolean;
  onOpenMembers: () => void;
  onOpenDeleteBoard: () => void;
};

export default function BoardPageHeader({
  board,
  role,
  canManageMembers,
  canDeleteBoard,
  onOpenMembers,
  onOpenDeleteBoard,
}: BoardPageHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="trello-board-header">
      <div>
        <Link to={ROUTES.DASHBOARD} className="back-link">
          ← {t("boards.backToBoards")}
        </Link>

        <h1>{board.title}</h1>

        <div className="role-explainer">
          <span className={`role-pill ${role}`}>
            {t(`roles.${role}`)}
          </span>
        </div>
      </div>

      <div className="board-header-actions">
        {canManageMembers && (
          <Button type="button" variant="secondary" onClick={onOpenMembers}>
            {t("boards.membersAndRoles")}
          </Button>
        )}

        {canDeleteBoard && (
          <Button type="button" variant="danger" onClick={onOpenDeleteBoard}>
            {t("boards.deleteBoard")}
          </Button>
        )}
      </div>
    </header>
  );
}