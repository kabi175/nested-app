import { getSipOrders } from "@/api/orders";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useSipOrders(page: number = 1) {
  return useQuery({
    queryKey: [QUERY_KEYS.sipOrders, page],
    queryFn: () => getSipOrders(page),
  });
}

