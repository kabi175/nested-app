import { updateGoal, UpdateGoalRequest } from "@/api/goalApi";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function useUpdateGoal() {
    const api = useAuthAxios();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ goalId, goal }: { goalId: string; goal: UpdateGoalRequest }) =>
            updateGoal(api, goalId, goal),
        onSuccess: (_, variables) => {
            // Invalidate and refetch goals after successful update
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.educationGoals] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.superFDGoals] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.goal, variables.goalId] });
        },
    });
}
