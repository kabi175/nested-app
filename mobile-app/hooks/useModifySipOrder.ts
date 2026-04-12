import { ModifySipResponse, modifySipOrder } from "@/api/orders";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function useModifySipOrder() {
  const api = useAuthAxios();
  const queryClient = useQueryClient();

  return useMutation<ModifySipResponse, Error, { sipOrderId: string; amount: number }>({
    mutationFn: ({ sipOrderId, amount }) => modifySipOrder(api, sipOrderId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.sipOrders] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.goal] });
    },
  });
}
