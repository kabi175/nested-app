import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { getNominees } from "@/api/nomineeApi";

export function useNominees() {
  return useQuery({
    queryKey: [QUERY_KEYS.nominees],
    queryFn: getNominees,
  });
}

