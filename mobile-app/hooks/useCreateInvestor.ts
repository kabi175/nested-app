import { createInvestor } from "@/api/userApi";
import { QUERY_KEYS } from "@/constants/queryKeys";
import type { User } from "@/types/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function useCreateInvestor() {
  const api = useAuthAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: User) => createInvestor(api, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.user] });
    },
  });
}
