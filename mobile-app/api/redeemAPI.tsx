import { api } from "./client";

export type SellOrder = {
  id: string;
  type: "sell";
  goal: {
    id: string;
  };
};

export const redeemFund = async (
  goalId: string,
  fundId: string,
  amount: number | null,
  units: number | null
): Promise<SellOrder[]> => {
  const payload = {
    sell_orders: [{ goal: { id: goalId }, fund_id: fundId, units, amount }],
  };
  const { data } = await api.post(`/sell-orders`, payload);
  return data.data.map((order: any) => ({
    id: order.id,
    type: "sell",
    goal: { id: order.goal.id },
  }));
};

export const verifyRedeemOrder = async (orderIds: string[]): Promise<void> => {
  await api.post(`/sell-orders/verify`, { order_ids: orderIds });
};
