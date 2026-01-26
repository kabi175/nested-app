import { Order } from "@/types";
import type { AxiosInstance } from "axios";
import { redirectClient } from "./client";

export type CreateOrderRequest = {
  type: "buy" | "sip";
  amount: number;
  start_date?: Date;
  yearly_setup?: number;
  goalId: string;
};

export const createOrders = async (
  api: AxiosInstance,
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
  api: AxiosInstance,
  goalId: string
): Promise<Order[]> => {
  const { data } = await api.get(`/goals/${goalId}/orders/pending`);
  return data.data as Order[];
};

export type PaymentOption = {
  payment_method: "upi" | "net_banking";
  bank_id: string;
};

export type PaymentStatus =
  | "not_available" // No payment is available for the goal
  | "pending" // Payment is pending
  | "submitted" // Payment is submitted
  | "completed" // Payment is completed
  | "failed" // Payment is failed
  | "cancelled"; // Payment is cancelled

export type Payment = {
  id: string;
  buy_status: PaymentStatus;
  sip_status: PaymentStatus;
  mandate_id: string;
  verification_status: "pending" | "verified" | "failed";
  payment_method: "net_banking" | "upi";
};

export const createPayment = async (
  api: AxiosInstance,
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
  const { data } = await api.post(`/payments`, payload);
  return data;
};

export const fetchLumpsumPaymentUrl = async (
  api: AxiosInstance,
  paymentId: string
): Promise<string | null> => {
  const { data } = await api.post(
    `/payments/${paymentId}/buy/actions/fetch_redirect_url`,
    {
      timeout: 100000,
    }
  );
  return data.redirect_url;
};

export const verifyPayment = async (
  api: AxiosInstance,
  paymentId: string
): Promise<void> => {
  await api.post(`/payments/${paymentId}/actions/verify`, {
    id: paymentId,
    verification_code: "123456",
  });
};

export const fetchMandatePaymentUrl = async (
  api: AxiosInstance,
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

export const fetchPayment = async (
  api: AxiosInstance,
  paymentId: string
): Promise<Payment> => {
  const { data } = await api.get(`/payments/${paymentId}`);
  // Handle both possible response structures: data.data or data
  const payment = data.data ?? data;
  if (!payment) {
    throw new Error(`Payment with id ${paymentId} not found`);
  }
  return payment;
};

export const lumsumPostPayment = async (paymentId: string): Promise<void> => {
  try {
    console.log("posting lumsum payment", paymentId);
    await redirectClient.post(`/redirects/payment/${paymentId}`);
  } catch (error) {
    console.error("Error posting lumsum payment", error);
    throw error;
  }
};

export const mandatePostPayment = async (mandateId: string): Promise<void> => {
  try {
    console.log("posting mandate payment", mandateId);
    await redirectClient.post(`/redirects/mandate/${mandateId}`);
  } catch (error) {
    console.error("Error posting mandate payment", error);
    throw error;
  }
};
