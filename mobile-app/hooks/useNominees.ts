import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { getNominees } from "@/api/nomineeApi";
import { useAuthAxios } from "./useAuthAxios";

export function useNominees() {
  const api = useAuthAxios();
  return useQuery({
    queryKey: [QUERY_KEYS.nominees],
    queryFn: () => getNominees(api),
  });
}

