import { initKyc } from "@/api/userApi";
import { QUERY_KEYS } from "@/constants/queryKeys";
import type { User } from "@/types/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useInitKyc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: User) => initKyc(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.user] });
    },
  });
}
