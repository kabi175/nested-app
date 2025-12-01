import { fetchPayment } from "@/api/paymentAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function usePayment(paymentId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.payment, paymentId],
    queryFn: () => fetchPayment(paymentId),
    enabled: !!paymentId,
  });
}
