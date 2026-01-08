import { getFundAllocationWithOrders } from "@/api/orders";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function useFundAllocations(orderIds: string[]) {
  const api = useAuthAxios();
  return useQuery({
    queryKey: [QUERY_KEYS.goal, "fundAllocations", orderIds.join(",")],
    queryFn: () => getFundAllocationWithOrders(api, orderIds),
    enabled: orderIds.length > 0,
  });
}

