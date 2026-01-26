import {
  createPayment,
  fetchLumpsumPaymentUrl,
  fetchMandatePaymentUrl,
  lumsumPostPayment,
  mandatePostPayment,
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

export function useLumsumPostPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: string) => lumsumPostPayment(paymentId),
    onSuccess: (_, paymentId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.payment, paymentId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.pendingActivities] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.educationGoals] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.superFDGoals] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.goal] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.portfolio] });
    },
  });
}

export function useMandatePostPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mandateId: string) => mandatePostPayment(mandateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.payment] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.pendingActivities] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.educationGoals] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.superFDGoals] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.goal] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.portfolio] });
    },
  });
}
