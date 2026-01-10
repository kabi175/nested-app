import { CreateOrderRequest, createOrders } from "@/api/paymentAPI";
import { useMutation } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function useCreateOrders() {
  const api = useAuthAxios();
  return useMutation({
    mutationFn: ({ orders }: { orders: CreateOrderRequest[] }) =>
      createOrders(api, orders),
  });
}

