import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../../../app/constants/queryKeys";
import type { Card } from "../../../cards/types";
import type { BoardList } from "../../../boards/types";
import {
  getBoardListsRequest,
  getBoardRequest,
  getCardCommentsRequest,
  getListCardsRequest,
} from "../../api/boardPageApi";

export function useBoardData(
  boardId: string | undefined,
  selectedCardId?: string
) {
  const boardQuery = useQuery({
    queryKey: QUERY_KEYS.BOARDS.DETAIL(boardId),
    queryFn: () => getBoardRequest(boardId as string),
    enabled: Boolean(boardId),
  });

  const listsQuery = useQuery({
    queryKey: QUERY_KEYS.BOARDS.LISTS(boardId),
    queryFn: () => getBoardListsRequest(boardId as string),
    enabled: Boolean(boardId),
  });

  const lists = useMemo<BoardList[]>(
    () => listsQuery.data ?? [],
    [listsQuery.data]
  );

  const cardQueries = useQueries({
    queries: lists.map((list) => ({
      queryKey: QUERY_KEYS.BOARDS.LIST_CARDS(list.id),
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
    queryKey: QUERY_KEYS.BOARDS.CARD_COMMENTS(selectedCardId),
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