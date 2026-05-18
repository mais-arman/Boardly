import type { ReactNode } from "react";
import Skeleton from "../../../shared/components/Skeleton";
import Button from "../../../shared/components/Button";
import type { SortOrder } from "../../../shared/pagination";


export type DataTableColumn<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  render: (item: T) => ReactNode;
};

type DataTableLabels = {
  search: string;
  rowsPerPage: string;
  pageOf: (page: number, totalPages: number) => string;
  previous: string;
  next: string;
};

type DataTablePagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowKey: (item: T) => string;
  isLoading?: boolean;
  emptyMessage: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  pagination: DataTablePagination;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  sortBy?: string;
  sortOrder?: SortOrder;
  onSort: (key: string) => void;
  labels: DataTableLabels;
  pageSizeOptions?: number[];
};

export default function DataTable<T>({
  data,
  columns,
  getRowKey,
  isLoading = false,
  emptyMessage,
  searchValue,
  onSearchChange,
  pagination,
  onPageChange,
  onLimitChange,
  sortBy,
  sortOrder = "asc",
  onSort,
  labels,
  pageSizeOptions = [5, 10, 20],
}: DataTableProps<T>) {
  const canGoPrevious = pagination.page > 1;
  const canGoNext = pagination.page < pagination.totalPages;

  return (
    <div className="data-table-card">
      <div className="data-table-toolbar">
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={labels.search}
          className="data-table-search"
        />

        <label className="data-table-limit">
          <span>{labels.rowsPerPage}</span>

          <select
            value={pagination.limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            className="data-table-page-size"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={column.sortable ? "sortable-column" : ""}
                  onClick={() => {
                    if (column.sortable) {
                      onSort(column.key);
                    }
                  }}
                >
                  {column.header}

                  {column.sortable && sortBy === column.key && (
                    <span className="sort-indicator">
                      {sortOrder === "asc" ? " ↑" : " ↓"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading
              ? Array.from({ length: pagination.limit }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((column) => (
                      <td key={column.key}>
                        <Skeleton height="18px" />
                      </td>
                    ))}
                  </tr>
                ))
              : data.map((item) => (
                  <tr key={getRowKey(item)}>
                    {columns.map((column) => (
                      <td key={column.key}>{column.render(item)}</td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {!isLoading && data.length === 0 && (
        <div className="data-table-empty">{emptyMessage}</div>
      )}

      <div className="data-table-pagination">
        <span>{labels.pageOf(pagination.page, pagination.totalPages)}</span>

        <div>
          <Button
            type="button"
            variant="secondary"
            disabled={!canGoPrevious || isLoading}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            {labels.previous}
          </Button>

          <Button
            type="button"
            variant="secondary"
            disabled={!canGoNext || isLoading}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            {labels.next}
          </Button>
        </div>
      </div>
    </div>
  );
}