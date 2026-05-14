import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import type { BoardList, Card } from "../types";
import {
  getBoardListsRequest,
  getBoardRequest,
  getCardCommentsRequest,
  getListCardsRequest,
} from "../api/boardPageApi";

export const BOARD_QUERY_KEY = "board";
export const LISTS_QUERY_KEY = "board-lists";
export const CARDS_QUERY_KEY = "list-cards";
export const COMMENTS_QUERY_KEY = "card-comments";

export function useBoardData(
  boardId: string | undefined,
  selectedCardId?: string
) {
  const boardQuery = useQuery({
    queryKey: [BOARD_QUERY_KEY, boardId],
    queryFn: () => getBoardRequest(boardId as string),
    enabled: Boolean(boardId),
  });

  const listsQuery = useQuery({
    queryKey: [LISTS_QUERY_KEY, boardId],
    queryFn: () => getBoardListsRequest(boardId as string),
    enabled: Boolean(boardId),
  });

  const lists = useMemo<BoardList[]>(
    () => listsQuery.data ?? [],
    [listsQuery.data]
  );

  const cardQueries = useQueries({
    queries: lists.map((list) => ({
      queryKey: [CARDS_QUERY_KEY, list.id],
      queryFn: () => getListCardsRequest(list.id),
      enabled: Boolean(list.id),
    })),
  });

  const cardsByList = useMemo(() => {
    return lists.reduce<Record<string, Card[]>>((acc, list, index) => {
      acc[list.id] = cardQueries[index]?.data || [];
      return acc;
    }, {});
  }, [lists, cardQueries]);

  const commentsQuery = useQuery({
    queryKey: [COMMENTS_QUERY_KEY, selectedCardId],
    queryFn: () => getCardCommentsRequest(selectedCardId as string),
    enabled: Boolean(selectedCardId),
  });

  return {
    boardQuery,
    listsQuery,
    cardQueries,
    commentsQuery,

    board: boardQuery.data,
    lists,
    listIds: lists.map((list) => list.id),
    cardsByList,
    comments: commentsQuery.data || [],

    isLoading: boardQuery.isLoading || listsQuery.isLoading,
    isError: boardQuery.isError || listsQuery.isError,
  };
}