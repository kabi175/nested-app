import { FundAllocation } from "@/types/fund";
import type { AxiosInstance } from "axios";

export type SipOrder = {
  id: string;
  order_id: string;
  fund_id: string;
  fund_name: string;
  amount: number;
  units: number;
  type: "SIP" | "STP" | "SWP";
  scheduled_date?: string;
  frequency?: string;
  status: "pending" | "success" | "failed" | "cancelled";
  created_at: Date;
  updated_at: Date;
};

export const cancelSipOrder = async (
  api: AxiosInstance,
  sipOrderId: string,
  cancellationCode: string,
  cancellationReason?: string
) => {
  await api.post(`/order-items/sip/${sipOrderId}/actions/cancel`, {
    cancellation_code: cancellationCode,
    ...(cancellationReason ? { cancellation_reason: cancellationReason } : {}),
  });
};

export const getSipOrders = async (api: AxiosInstance, page: number) => {
  const { data } = await api.get("/order-items/sip", {
    params: {
      page,
    },
  });
  return data.data;
};

export type Transaction = {
  status: "in_progress" | "submitted" | "completed" | "failed" | "refunded";
  type: "SIP" | "BUY" | "SELL" | "STP" | "SWP";
  amount: number;
  units: number;
  fund: string;
  executed_at: Date;
  member_name?: string;
};

export const getTransactions = async (
  api: AxiosInstance,
  page: number,
  fromDate?: Date,
  toDate?: Date,
  childId?: string
) => {
  const params: Record<string, any> = {
    page,
  };

  if (fromDate) {
    params.from_date = fromDate.toISOString().split("T")[0];
  }

  if (toDate) {
    params.to_date = toDate.toISOString().split("T")[0];
  }

  if (childId) {
    params.child_id = childId;
  }

  try {
    const { data } = await api.get("/transactions", {
      params,
    });
    return data.data.map((transaction: Transaction) => ({
      ...transaction,
      executed_at: new Date(transaction.executed_at),
    }));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

export type ModifySipResponse = {
  message?: string;      // 200 — submitted immediately
  mandate_url?: string;  // 202 — mandate authorization required
};

export const modifySipOrder = async (
  api: AxiosInstance,
  sipOrderId: string,
  amount: number
): Promise<ModifySipResponse> => {
  const { data } = await api.post(`/order-items/sip/${sipOrderId}/actions/modify`, { amount });
  return data;
};

export const getFundAllocationWithOrders = async (
  api: AxiosInstance,
  orderIds: string[]
): Promise<FundAllocation[]> => {
  const { data } = await api.get(`/orders/allocation`, {
    params: {
      orders: orderIds.join(","),
    },
  });

  return data.data.map((data: any) => {
    // Format percentage - handle both number and string formats
    const allocationPercent =
      typeof data.allocationPercent === "number"
        ? `${data.allocationPercent}%`
        : data.allocationPercent || "0%";

    return {
      id: data.id || "",
      fundName: data.fundName,
      percentage: allocationPercent,
      cagr: data.cagr || "0.00%",
      expenseRatio: data.expenseRatio || "0.00%",
    };
  });
};
