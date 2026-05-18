import { useTranslation } from "react-i18next";
import type { Board } from "../../../boards/types";
import Button from "../../../../shared/components/Button";
import BoardCard from "./BoardCard";
import BoardCardSkeleton from "./BoardCardSkeleton";

type BoardsSectionProps = {
  boards: Board[];
  fallbackColor: string;
  isLoading: boolean;
  onCreateBoard: () => void;
  onEditBoard: (board: Board) => void;
  onDeleteBoard: (board: Board) => void;
};

export default function BoardsSection({
  boards,
  fallbackColor,
  isLoading,
  onCreateBoard,
  onEditBoard,
  onDeleteBoard,
}: BoardsSectionProps) {
  const { t } = useTranslation();

  return (
    <section className="section-block">
      <div className="section-header">
        <div>
          <h2>{t("dashboard.yourBoards")}</h2>
          <p>{t("dashboard.boardsSubtitle")}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="boards-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <BoardCardSkeleton key={index} />
          ))}
        </div>
      ) : boards.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>{t("boards.emptyTitle")}</h3>
          <p>{t("boards.emptyDescription")}</p>

          <Button type="button" onClick={onCreateBoard}>
            {t("dashboard.createBoard")}
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