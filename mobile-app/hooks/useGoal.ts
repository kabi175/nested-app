import { getGoal } from "@/api/userApi";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useGoal(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.goal, id],
    queryFn: () => getGoal(id),
  });
}
