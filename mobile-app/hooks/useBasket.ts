import { getBasketByName } from "@/api/basketAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useBasket(name: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.basket, name],
    queryFn: () => getBasketByName(name),
    enabled: !!name,
  });
}

