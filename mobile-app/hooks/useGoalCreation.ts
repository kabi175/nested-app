import { createGoal } from "@/api/goalApi";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function useGoalCreation() {
  const api = useAuthAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goals: Parameters<typeof createGoal>[1]) => createGoal(api, goals),
    onSuccess: () => {
      // Invalidate and refetch goals after successful creation
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.goals] });
    },
  });
}
