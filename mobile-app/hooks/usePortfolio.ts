import { getHoldingsForGoal, getTranscationsForGoal } from "@/api/portfolioAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function usePortfolioHoldings(goalId: string) {
  const api = useAuthAxios();
  return useQuery({
    queryKey: [QUERY_KEYS.goal, goalId, "holdings"],
    queryFn: () => getHoldingsForGoal(api, goalId),
    enabled: !!goalId,
  });
}

export function usePortfolioTransactions(goalId: string, page: number = 0) {
  const api = useAuthAxios();
  return useQuery({
    queryKey: [QUERY_KEYS.goal, goalId, "transactions", page],
    queryFn: () => getTranscationsForGoal(api, goalId, page),
    enabled: !!goalId,
  });
}

