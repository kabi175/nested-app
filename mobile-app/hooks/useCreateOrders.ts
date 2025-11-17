import { CreateOrderRequest, createOrders } from "@/api/paymentAPI";
import { useMutation } from "@tanstack/react-query";

export function useCreateOrders() {
  return useMutation({
    mutationFn: ({ orders }: { orders: CreateOrderRequest[] }) =>
      createOrders(orders),
  });
}

