import { fetchPendingActivities } from "@/api/activitiesAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "./useUser";

export function usePendingActivities() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const userId = user?.id;

  const queryResult = useQuery({
    queryKey: [QUERY_KEYS.pendingActivities, userId],
    queryFn: () => {
      if (!userId) {
        throw new Error("User ID is required to fetch pending activities");
      }
      return fetchPendingActivities(userId);
    },
    enabled: !!userId,
  });

  return {
    ...queryResult,
    isLoading: isUserLoading || queryResult.isLoading,
  };
}


