import type { Goal } from "@/types/investment";
import type { AxiosInstance } from "axios";

export const getGoals = async (
  api: AxiosInstance,
  type: "education" | "super_fd",
): Promise<Goal[]> => {
  const { data } = await api.get(`/goals?type=${type}`);
  return (data.data ?? []).map((goal: GoalDTO): Goal => mapGoalToGoal(goal));
};

export const getGoalsByBasketName = async (
  api: AxiosInstance,
  basketName: string,
): Promise<Goal[]> => {
  const { data } = await api.get(`/goals/by-basket/${basketName}`);
  return (data.data ?? []).map((goal: GoalDTO): Goal => mapGoalToGoal(goal));
};

export const deleteGoal = async (
  api: AxiosInstance,
  goalId: string,
): Promise<void> => {
  await api.delete(`/goals/${goalId}`);
};

export const getGoal = async (
  api: AxiosInstance,
  id: string,
): Promise<Goal> => {
  const { data } = await api.get(`/goals/${id}`);
  const goals = (data.data ?? []).map(
    (goal: GoalDTO): Goal => mapGoalToGoal(goal),
  );
  if (goals.length === 0) {
    throw new Error("Goal not found");
  }
  return goals[0];
};

export type CreateGoalRequest = {
  childId?: string;
  basketId?: string;
  educationId: string;
  title: string;
  targetAmount: number;
  targetDate: Date;
};
export const createGoal = async (
  api: AxiosInstance,
  goals: CreateGoalRequest[],
): Promise<Goal[]> => {
  const payload = goals.map((goal) => {
    const payloadItem: any = {
      child: goal.childId ? { id: goal.childId } : undefined,
      basket: goal.basketId ? { id: goal.basketId } : undefined,
      target_amount: goal.targetAmount,
      target_date: goal.targetDate.toLocaleDateString("en-CA"),
      title: goal.title,
    };

    // Only include education if educationId is not empty
    if (goal.educationId && goal.educationId.trim() !== "") {
      payloadItem.education = {
        id: goal.educationId,
      };
    }

    return payloadItem;
  });
  const { data } = await api.post("/goals", { data: payload });
  return (data.data ?? []).map((goal: GoalDTO): Goal => mapGoalToGoal(goal));
};

export const updateGoal = async (
  api: AxiosInstance,
  goal: UpdateGoalRequest,
): Promise<Goal> => {
  const payload = {
    id: goal.id,
    title: goal.title,
    target_amount: goal.target_amount,
    target_date: goal.target_date.toLocaleDateString("en-CA"),
    education: null as any,
  };

  if (goal.educationId) {
    payload.education = {
      id: goal.educationId,
    };
  }

  const { data } = await api.put(`/goals`, { data: [payload] });
  // Handle array response - API returns array of goals
  const goals = (data.data ?? []).map(
    (goal: GoalDTO): Goal => mapGoalToGoal(goal),
  );
  if (goals.length === 0) {
    throw new Error("Goal not found in response");
  }
  return goals[0];
};

export type UpdateGoalRequest = {
  id: string;
  title: string;
  target_amount: number;
  target_date: Date;
  educationId?: string;
};

export type GoalDTO = {
  id: string;
  title: string;
  child: { id: string; name: string };
  target_amount: number;
  current_amount: number;
  invested_amount: number;
  monthly_sip: number | null;
  status: Goal["status"];
  basket: {
    id: string;
    title: string;
    min_investment: number;
    min_sip: number;
    min_step_up: number;
  };
  next_sip_amount: number | null;
  next_sip_date: string | null;
  sip_order_id: string | null;
  has_pending_sip_modification: boolean;
  step_up_percent: number | null;
  target_date?: string;
  createdAt?: string;
  updatedAt?: string;
  education_id?: string;
  education?: {
    id: string;
    name: string;
    type: "INSTITUTION" | "COURSE";
  };
};

export function mapGoalToGoal(goal: GoalDTO): Goal {
  return {
    id: goal.id,
    title: goal.title,
    childId: goal.child?.id,
    child: goal.child,
    targetAmount: goal.target_amount,
    currentAmount: goal.current_amount,
    investedAmount: goal.invested_amount,
    monthlySip: goal.monthly_sip,
    status: goal.status,
    targetDate: goal.target_date ? new Date(goal.target_date) : new Date(),
    createdAt: goal.createdAt ? new Date(goal.createdAt) : new Date(),
    updatedAt: goal.updatedAt ? new Date(goal.updatedAt) : new Date(),
    basket: goal.basket,
    educationId: goal.education_id || goal.education?.id,
    education: goal.education,

    nextSipAmount: goal.next_sip_amount,
    nextSipDate: goal.next_sip_date ? new Date(goal.next_sip_date) : null,
    sipOrderId: goal.sip_order_id ?? null,
    hasPendingSipModification: goal.has_pending_sip_modification ?? false,
    stepUpPercent: goal.step_up_percent ?? 0,
  };
}
