import {
  createPayment,
  fetchLumpsumPaymentUrl,
  fetchMandatePaymentUrl,
  PaymentOption,
  verifyPayment,
} from "@/api/paymentAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { Order } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function useCreatePayment() {
  const api = useAuthAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orders,
      paymentOption,
    }: {
      orders: Order[];
      paymentOption: PaymentOption;
    }) => createPayment(api, orders, paymentOption),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.payment] });
      return data;
    },
  });
}

export function useVerifyPayment() {
  const api = useAuthAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: string) => verifyPayment(api, paymentId),
    onSuccess: (_, paymentId) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.payment, paymentId],
      });
    },
  });
}

export function useFetchLumpsumPaymentUrl() {
  const api = useAuthAxios();

  return useMutation({
    mutationFn: (paymentId: string) => fetchLumpsumPaymentUrl(api, paymentId),
  });
}

export function useFetchMandatePaymentUrl() {
  const api = useAuthAxios();

  return useMutation({
    mutationFn: (paymentId: string) => fetchMandatePaymentUrl(api, paymentId),
  });
}
