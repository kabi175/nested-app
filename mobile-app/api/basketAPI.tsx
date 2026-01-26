import type { AxiosInstance } from "axios";

export type Basket = {
  id: string;
  title: string;
  funds: BasketFund[];
  min_investment: number;
  min_sip: number;
};

export type BasketFund = {
  id: string;
  name: string;
  expRatio: number | null;
  cagr: number | null;
  allocationPercentage: number;
};

export const getBasketByName = async (api: AxiosInstance, name: string): Promise<Basket> => {
  const { data } = await api.get(`/bucket/name/${name}`);
  return data;
};
