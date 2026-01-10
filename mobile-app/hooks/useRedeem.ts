import { redeemFund, verifyRedeemOrder } from "@/api/redeemAPI";
import { useMutation } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function useRedeemFund() {
  const api = useAuthAxios();

  return useMutation({
    mutationFn: ({
      goalId,
      fundId,
      amount,
      units,
    }: {
      goalId: string;
      fundId: string;
      amount: number | null;
      units: number | null;
    }) => redeemFund(api, goalId, fundId, amount, units),
  });
}

export function useVerifyRedeemOrder() {
  const api = useAuthAxios();

  return useMutation({
    mutationFn: (orderIds: string[]) => verifyRedeemOrder(api, orderIds),
  });
}




