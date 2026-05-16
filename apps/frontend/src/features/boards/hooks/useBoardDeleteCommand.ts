import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ROUTES } from "../../../app/constants/routes";
import { deleteBoardRequest } from "../api/boardsApi";

type UseBoardDeleteCommandParams = {
  boardId: string | undefined;
};

export function useBoardDeleteCommand({
  boardId,
}: UseBoardDeleteCommandParams) {
  const navigate = useNavigate();

  const deleteBoardMutation = useMutation({
    mutationFn: () => deleteBoardRequest(boardId as string),

    onSuccess: () => {
      navigate(ROUTES.DASHBOARD, {
        replace: true,
      });
    },
  });

  return {
    mutations: {
      deleteBoardMutation,
    },
  };
}