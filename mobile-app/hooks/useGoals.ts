import { getGoals } from "@/api/goalApi";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function useGoals() {
  const api = useAuthAxios();
  return useQuery({
    queryKey: [QUERY_KEYS.goals],
    queryFn: () => getGoals(api),
  });
}
