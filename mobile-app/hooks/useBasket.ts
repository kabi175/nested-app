import { getBasketById, getBasketByName } from "@/api/basketAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function useBasket(name: string) {
  const api = useAuthAxios();
  return useQuery({
    queryKey: [QUERY_KEYS.basket, name],
    queryFn: () => getBasketByName(api, name),
    enabled: !!name,
  });
}

export function useBasketById(id: string) {
  const api = useAuthAxios();
  return useQuery({
    queryKey: [QUERY_KEYS.basket, 'id', id],
    queryFn: () => getBasketById(api, id),
    enabled: !!id,
  });
}

