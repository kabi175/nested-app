import { fetchPendingActivities } from "@/api/activitiesAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";
import { useUser } from "./useUser";

export function usePendingActivities() {
  const api = useAuthAxios();
  const { data: user, isLoading: isUserLoading } = useUser();
  const userId = user?.id;

  const queryResult = useQuery({
    queryKey: [QUERY_KEYS.pendingActivities],
    queryFn: () => {
      if (!userId) {
        throw new Error("User ID is required to fetch pending activities");
      }
      return fetchPendingActivities(api, userId);
    },
    enabled: !!userId,
    refetchInterval: 1000 * 60 * 1, // 1 minute
  });

  return {
    ...queryResult,
    isLoading: isUserLoading || queryResult.isLoading,
  };
}
