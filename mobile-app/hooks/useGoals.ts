import { getGoals } from "@/api/goalApi";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useGoals() {
  return useQuery({
    queryKey: [QUERY_KEYS.goals],
    queryFn: getGoals,
  });
}
