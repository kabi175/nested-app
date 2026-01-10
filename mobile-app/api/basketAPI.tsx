import type { AxiosInstance } from "axios";

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

export const getBasketByName = async (api: AxiosInstance, name: string): Promise<Basket> => {
  const { data } = await api.get(`/bucket/name/${name}`);
  console.log(data);
  return data;
};
