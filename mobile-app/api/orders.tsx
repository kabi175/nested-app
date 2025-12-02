import { api } from "./client";

export type SipOrder = {
  id: string;
  fund_id: string;
  fund_name: string;
  amount: number;
  units: number;
  type: "SIP" | "STP" | "SWP";
  scheduled_date?: string;
  frequency?: string;
  status: "pending" | "success" | "failed";
  created_at: Date;
  updated_at: Date;
};

export const getSipOrders = async (page: number) => {
  const { data } = await api.get("/order-items/sip", {
    params: {
      page,
    },
  });
  return data.data;
};

export type Transaction = {
  status: "in_progress" | "completed" | "failed" | "refunded";
  type: "SIP" | "BUY" | "SELL";
  amount: number;
  units: number;
  fund: string;
  executed_at: Date;
};

export const getTransactions = async (
  page: number,
  fromDate?: Date,
  toDate?: Date
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

  const { data } = await api.get("/transactions", {
    params,
  });
  return data.data.map((transaction: Transaction) => ({
    ...transaction,
    executed_at: new Date(transaction.executed_at),
  }));
};
