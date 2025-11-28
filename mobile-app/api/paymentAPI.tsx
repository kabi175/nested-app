import { Order } from "@/types";
import { api } from "./client";

export type CreateOrderRequest = {
  type: "buy" | "sip";
  amount: number;
  start_date?: Date;
  yearly_setup?: number;
  goalId: string;
};

export const createOrders = async (
  orders: CreateOrderRequest[]
): Promise<Order[]> => {
  const buyOrders = orders
    .filter((order) => order.type === "buy")
    .map((order) => ({
      amount: order.amount,
      goal: { id: order.goalId },
    }));
  const sipOrders = orders
    .filter((order) => order.type === "sip")
    .map((order) => {
      const sip = {
        amount: order.amount,
        goal: { id: order.goalId },
        start_date: (order.start_date || new Date()).toLocaleDateString(
          "en-CA"
        ),
        setup_option: undefined as any,
      };

      if (order.yearly_setup) {
        sip.setup_option = {
          amount: order.yearly_setup,
        };
      }
      return sip;
    });
  const payload = {
    buy_order: buyOrders,
    sip_order: sipOrders,
  };
  const { data } = await api.post(`/orders`, payload);
  return data.data;
};

export const getPendingOrdersByGoalId = async (
  goalId: string
): Promise<Order[]> => {
  const { data } = await api.get(`/goals/${goalId}/orders/pending`);
  return data.data as Order[];
};

type PaymentOption = {
  payment_method: "upi" | "net_banking";
  bank_id: string;
};

type Payment = {
  id: string;
};

export const createPayment = async (
  orders: Order[],
  paymentOption: PaymentOption
): Promise<Payment> => {
  const payload = {
    orders: orders.map((order) => ({
      id: order.id,
    })),
    payment_method: paymentOption.payment_method,
    bank_id: paymentOption.bank_id,
  };
  console.log("payload", payload);
  const { data } = await api.post(`/payments`, payload);
  return data;
};

export const fetchLumpsumPaymentUrl = async (
  paymentId: string
): Promise<string | null> => {
  const { data } = await api.post(
    `/payments/${paymentId}/buy/actions/fetch_redirect_url`,
    {
      timeout: 30000,
    }
  );
  return data.redirect_url;
};

export const verifyPayment = async (paymentId: string): Promise<void> => {
  await api.post(`/payments/${paymentId}/actions/verify`, {
    id: paymentId,
    verification_code: "123456",
  });
};

export const fetchMandatePaymentUrl = async (
  paymentId: string
): Promise<string | null> => {
  const { data } = await api.post(
    `/payments/${paymentId}/sip/actions/fetch_redirect_url`,
    {
      timeout: 30000,
    }
  );
  return data.redirect_url;
};
