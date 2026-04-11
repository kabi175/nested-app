import { cancelSipOrder } from "@/api/orders";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function useCancelSipOrder() {
  const api = useAuthAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sipOrderId,
      cancellationCode,
      cancellationReason,
    }: {
      sipOrderId: string;
      cancellationCode: string;
      cancellationReason?: string;
    }) => cancelSipOrder(api, sipOrderId, cancellationCode, cancellationReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.sipOrders] });
    },
  });
}
