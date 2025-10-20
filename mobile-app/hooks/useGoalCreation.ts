import { createGoal } from "@/api/userApi";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useGoalCreation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      // Invalidate and refetch goals after successful creation
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.goals] });
    },
  });
}
