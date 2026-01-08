import { getSipOrders } from "@/api/orders";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function useSipOrders(page: number = 1) {
  const api = useAuthAxios();
  return useQuery({
    queryKey: [QUERY_KEYS.sipOrders, page],
    queryFn: () => getSipOrders(api, page),
  });
}

