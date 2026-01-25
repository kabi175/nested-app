import { getGoals } from "@/api/goalApi";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function useEducationGoals() {
  const api = useAuthAxios();
  return useQuery({
    queryKey: [QUERY_KEYS.goals],
    queryFn: () => getGoals(api, "education"),
  });
}

export function useSuperFDGoals() {
  const api = useAuthAxios();
  return useQuery({
    queryKey: [QUERY_KEYS.goals],
    queryFn: () => getGoals(api, "super_fd"),
  });
}