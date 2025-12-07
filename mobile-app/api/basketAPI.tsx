import { api } from "./client";

export type Basket = {
  id: string;
  title: string;
  funds: BasketFund[];
};

export type BasketFund = {
  id: string;
  name: string;
  expRatio: number | null;
  cagr: number | null;
  allocationPercentage: number;
};

export const getBasketByName = async (name: string): Promise<Basket> => {
  const { data } = await api.get(`/bucket/name/${name}`);
  console.log(data);
  return data;
};
