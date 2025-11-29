import { getHoldingsForGoal, getTranscationsForGoal } from "@/api/portfolioAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function usePortfolioHoldings(goalId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.goal, goalId, "holdings"],
    queryFn: () => getHoldingsForGoal(goalId),
    enabled: !!goalId,
  });
}

export function usePortfolioTransactions(goalId: string, page: number = 0) {
  return useQuery({
    queryKey: [QUERY_KEYS.goal, goalId, "transactions", page],
    queryFn: () => getTranscationsForGoal(goalId, page),
    enabled: !!goalId,
  });
}

