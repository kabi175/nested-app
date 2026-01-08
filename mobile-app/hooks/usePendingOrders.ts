import { getPendingOrdersByGoalId } from "@/api/paymentAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function usePendingOrdersByGoalId(goalId: string | undefined) {
  const api = useAuthAxios();
  return useQuery({
    queryKey: [QUERY_KEYS.pendingOrders, goalId],
    queryFn: () => {
      if (!goalId) {
        return Promise.resolve([]);
      }
      return getPendingOrdersByGoalId(api, goalId);
    },
    enabled: !!goalId,
  });
}




