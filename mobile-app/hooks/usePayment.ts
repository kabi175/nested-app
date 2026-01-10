import { fetchPayment } from "@/api/paymentAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function usePayment(paymentId: string) {
  const api = useAuthAxios();
  return useQuery({
    queryKey: [QUERY_KEYS.payment, paymentId],
    queryFn: () => fetchPayment(api, paymentId),
    enabled: !!paymentId,
  });
}
