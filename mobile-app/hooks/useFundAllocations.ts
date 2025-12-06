import { getFundAllocationWithOrders } from "@/api/orders";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useFundAllocations(orderIds: string[]) {
  return useQuery({
    queryKey: [QUERY_KEYS.goal, "fundAllocations", orderIds.join(",")],
    queryFn: () => getFundAllocationWithOrders(orderIds),
    enabled: orderIds.length > 0,
  });
}

