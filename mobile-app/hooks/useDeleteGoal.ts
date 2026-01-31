import { deleteGoal } from "@/api/goalApi";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function useDeleteGoal() {
  const api = useAuthAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      goalId,
    }: {
      goalId: string;
    }) => deleteGoal(api, goalId),
    onSuccess: () => {
      // Invalidate and refetch goals after successful deletion
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.educationGoals] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.superFDGoals] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.goal] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.portfolio] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.pendingActivities] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.children] });
    },
  });
}
