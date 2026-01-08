import { upsertNominees } from "@/api/nomineeApi";
import { QUERY_KEYS } from "@/constants/queryKeys";
import type { NomineePayload } from "@/types/nominee";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function useUpsertNominees() {
  const api = useAuthAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payloads: (NomineePayload & { id?: number })[]) =>
      upsertNominees(api, payloads),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.nominees] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.user] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.pendingActivities],
      });
    },
  });
}
