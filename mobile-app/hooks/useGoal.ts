import { getGoal } from "@/api/goalApi";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function useGoal(id: string) {
  const api = useAuthAxios();
  return useQuery({
    queryKey: [QUERY_KEYS.goal, id],
    queryFn: () => getGoal(api, id),
  });
}
