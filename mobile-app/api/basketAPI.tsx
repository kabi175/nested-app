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

export const getBasketById = async (api: AxiosInstance, id: string): Promise<Basket> => {
  const { data } = await api.get(`/bucket/${id}`);
  console.log("Raw basket API response:", data);
  if (Array.isArray(data.data)) {
    console.log("data[0]", data.data[0])
    return data.data[0];
  }
  return data;
};
