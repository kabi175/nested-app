export type Goal = {
  id: string;
  childId: string;
  child?: { id: string; name: string };
  title: string;
  targetAmount: number;
  currentAmount: number;
  investedAmount: number;
  monthlySip: number | null;

  basket: {
    id: string;
    title: string;
    min_investment: number;
    min_sip: number;
    min_step_up: number;
  };

  nextSipAmount: number | null;
  nextSipDate: Date | null;
  sipOrderId: string | null;
  hasPendingSipModification: boolean;
  stepUpAmount: number;

  targetDate: Date;
  status: "draft" | "payment_pending" | "active" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
  education?: {
    id: string;
    name: string;
  };
  educationId?: string;
};

export type Order = {
  id: string;
  type: "sip" | "buy" | "sell";
  amount: number;
  yearly_setup?: number;
  start_date?: Date;
  is_placed: boolean;
  goal: { id: string };
  updated_at: Date;
  created_at: Date;
};
