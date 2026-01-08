import { createChild } from "@/api/childApi";
import { QUERY_KEYS } from "@/constants/queryKeys";
import type { Child } from "@/types/child";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function useCreateChild() {
  const api = useAuthAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Child) => createChild(api, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.children] });
    },
  });
}




