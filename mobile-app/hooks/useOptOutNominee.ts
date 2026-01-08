import { optOutNominee } from "@/api/nomineeApi";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function useOptOutNominee() {
  const api = useAuthAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => optOutNominee(api),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.nominees] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.user] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.pendingActivities],
      });
    },
  });
}
