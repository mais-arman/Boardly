import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getBoardPath } from "../../../app/constants/routes";
import Button from "../../../shared/components/Button";

import type { AdminBoard } from "../types";
import type { SortOrder } from "../../../shared/pagination";
import DataTable, { type DataTableColumn } from "./DataTable";

type AdminBoardsTableProps = {
  boards: AdminBoard[];
  isLoading: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  sortBy: string;
  sortOrder: SortOrder;
  onSort: (key: string) => void;
  onDeleteBoard: (board: AdminBoard) => void;
};

export default function AdminBoardsTable({
  boards,
  isLoading,
  searchValue,
  onSearchChange,
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  sortBy,
  sortOrder,
  onSort,
  onDeleteBoard,
}: AdminBoardsTableProps) {
  const { t } = useTranslation();

  const columns = useMemo<DataTableColumn<AdminBoard>[]>(
    () => [
      {
        key: "title",
        header: t("admin.board"),
        sortable: true,
        render: (board) => (
          <>
            <span
              className="admin-board-color"
              style={{ backgroundColor: board.background_color }}
            />
            {board.title}
          </>
        ),
      },
      {
        key: "owner_name",
        header: t("admin.owner"),
        sortable: true,
        render: (board) => (
          <>
            {board.owner_name || t("admin.unknownOwner")}
            <small>{board.owner_email}</small>
          </>
        ),
      },
      {
        key: "members_count",
        header: t("common.members"),
        sortable: true,
        render: (board) => board.members_count,
      },
      {
        key: "lists_count",
        header: t("common.lists"),
        sortable: true,
        render: (board) => board.lists_count,
      },
      {
        key: "cards_count",
        header: t("common.cards"),
        sortable: true,
        render: (board) => board.cards_count,
      },
      {
        key: "created_at",
        header: t("common.created"),
        sortable: true,
        render: (board) => new Date(board.created_at).toLocaleDateString(),
      },
      {
        key: "actions",
        header: "",
        render: (board) => (
          <div className="admin-actions">
            <Link to={getBoardPath(board.id)} className="button button-secondary">
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
        ),
      },
    ],
    [onDeleteBoard, t]
  );

  return (
    <section className="admin-section">
      <div className="section-header">
        <div>
          <h2>{t("admin.boards")}</h2>
          <p>{t("admin.viewBoards")}</p>
        </div>
      </div>

      <DataTable
        data={boards}
        columns={columns}
        getRowKey={(board) => board.id}
        isLoading={isLoading}
        emptyMessage={t("admin.noBoards")}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        pagination={{
          page,
          limit,
          total,
          totalPages,
        }}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
        labels={{
          search: t("admin.searchBoards"),
          rowsPerPage: t("common.rowsPerPage"),
          pageOf: (currentPage, pages) =>
            t("common.pageOf", {
              page: currentPage,
              totalPages: pages,
            }),
          previous: t("common.previous"),
          next: t("common.next"),
        }}
      />
    </section>
  );
}