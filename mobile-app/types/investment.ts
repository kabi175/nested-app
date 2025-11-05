export type Goal = {
  id: string;
  childId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  monthlySip: number | null;
  targetDate: Date;
  status: "draft" | "payment_pending" | "active" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
};

export type Order = {
  id: string;
  type: "sip" | "buy" | "sell";
  amount: number;
  yearly_setup?: number;
  start_date?: Date;
  status: "not_placed" | "placed" | "completed" | "failed" | "cancelled";
  goal: { id: string };
  updated_at: Date;
  created_at: Date;
};
