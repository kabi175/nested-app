import { optOutNominee } from "@/api/nomineeApi";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useOptOutNominee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => optOutNominee(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.nominees] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.user] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.pendingActivities],
      });
    },
  });
}
