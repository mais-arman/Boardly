export type SortOrder = "asc" | "desc";

export type PaginationParams = {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  order?: SortOrder;
};