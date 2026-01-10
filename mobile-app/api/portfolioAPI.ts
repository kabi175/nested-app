import type { AxiosInstance } from "axios";

export type Transaction = {
  fund: string;
  type: "BUY" | "SELL" | "SIP";
  status: "completed" | "in_progress" | "failed" | "refunded";
  units: number;
  unit_price: number;
  amount: number;
  executed_at: Date;
};

export type Holding = {
  fund: string;
  fund_id: string;
  allocation_percentage: number;
  invested_amount: number;
  current_value: number;
  returns_amount: number;
  current_nav: number;
  average_nav: number;
  total_units: number;
};

export const getTranscationsForGoal = async (
  api: AxiosInstance,
  goalId: string,
  page: number
): Promise<Transaction[]> => {
  const { data } = await api.get(`/portfolio/goals/${goalId}/transactions`, {
    params: {
      page,
    },
  });

  return data.data.map((transaction: any) => ({
    fund: transaction.fund,
    type: transaction.type,
    status: transaction.status,
    units: transaction.units,
    unit_price: transaction.unit_price,
    amount: transaction.amount,
    executed_at: new Date(transaction.executed_at),
  }));
};

export const getHoldingsForGoal = async (
  api: AxiosInstance,
  goalId: string
): Promise<Holding[]> => {
  const { data } = await api.get(`/portfolio/goals/${goalId}/holdings`);
  return data.data.map((holding: any) => ({
    fund: holding.fund,
    allocation_percentage: holding.allocation_percentage,
    invested_amount: Number(holding.invested_amount),
    current_value: Number(holding.current_value),
    returns_amount: Number(holding.returns_amount),
    current_nav: Number(holding.current_nav),
    average_nav: Number(holding.average_nav),
    total_units: Number(holding.total_units),
    fund_id: holding.fund_id,
  }));
};
