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
