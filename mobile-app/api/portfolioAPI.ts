import { api } from "./client";

export type Transaction = {
  fund: string;
  type: "BUY" | "SELL" | "SIP";
  units: number;
  unit_price: number;
  amount: number;
  executed_at: Date;
};

export type Holding = {
  fund: string;
  allocation_percentage: number;
  invested_amount: number;
  current_value: number;
  returns_amount: number;
};

export const getTranscationsForGoal = async (
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
    units: transaction.units,
    unit_price: transaction.unit_price,
    amount: transaction.amount,
    executed_at: new Date(transaction.executed_at),
  }));
};

export const getHoldingsForGoal = async (
  goalId: string
): Promise<Holding[]> => {
  const { data } = await api.get(`/portfolio/goals/${goalId}/holdings`);
  return data.data.map((holding: any) => ({
    fund: holding.fund,
    allocation_percentage: holding.allocation_percentage,
    invested_amount: holding.invested_amount,
    current_value: holding.current_value,
    returns_amount: holding.returns_amount,
  }));
};
