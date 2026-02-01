import type { Goal } from "@/types/investment";
import type { AxiosInstance } from "axios";

export const getGoals = async (api: AxiosInstance, type: "education" | "super_fd"): Promise<Goal[]> => {
  console.log("fetching goals for type", type);
  const { data } = await api.get(`/goals?type=${type}`);
  return (data.data ?? []).map((goal: GoalDTO): Goal => mapGoalToGoal(goal));
};

export const getGoalsByBasketName = async (api: AxiosInstance, basketName: string): Promise<Goal[]> => {
  const { data } = await api.get(`/goals/by-basket/${basketName}`);
  return (data.data ?? []).map((goal: GoalDTO): Goal => mapGoalToGoal(goal));
};

export const deleteGoal = async (
  api: AxiosInstance,
  goalId: string
): Promise<void> => {
  await api.delete(`/goals/${goalId}`);
};

export const getGoal = async (
  api: AxiosInstance,
  id: string
): Promise<Goal> => {
  const { data } = await api.get(`/goals/${id}`);
  const goals = (data.data ?? []).map(
    (goal: GoalDTO): Goal => mapGoalToGoal(goal)
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
  goals: CreateGoalRequest[]
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
  goalId: string,
  goal: UpdateGoalRequest
): Promise<Goal> => {
  const { data } = await api.patch(`/goals/${goalId}`, { data: goal });
  return mapGoalToGoal(data.data);
};

export type UpdateGoalRequest = {
  title: string;
  targetAmount: number;
  targetDate: Date;
  educationId: string;
}

export type GoalDTO = {
  id: string;
  title: string;
  child_id: string;
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
  target_date?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function mapGoalToGoal(goal: GoalDTO): Goal {
  return {
    id: goal.id,
    title: goal.title,
    childId: goal.child_id,
    targetAmount: goal.target_amount,
    currentAmount: goal.current_amount,
    investedAmount: goal.invested_amount,
    monthlySip: goal.monthly_sip,
    status: goal.status,
    targetDate: goal.target_date ? new Date(goal.target_date) : new Date(),
    createdAt: goal.createdAt ? new Date(goal.createdAt) : new Date(),
    updatedAt: goal.updatedAt ? new Date(goal.updatedAt) : new Date(),
    basket: goal.basket,
  };
}
