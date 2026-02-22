import { createGoal } from "@/api/goalApi";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppEventsLogger } from "react-native-fbsdk-next";
import { useAuthAxios } from "./useAuthAxios";

export function useGoalCreation() {
  const api = useAuthAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goals: Parameters<typeof createGoal>[1]) => createGoal(api, goals),
    onSuccess: () => {
      AppEventsLogger.logEvent("goal_create");
      // Invalidate and refetch goals after successful creation
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.educationGoals] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.superFDGoals] });
    },
  });
}
