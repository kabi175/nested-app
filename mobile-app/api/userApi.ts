import type { Child, Goal, User } from "@/types/user";
import { api } from "./client";

export const getUser = async (id: string): Promise<User> => {
  const { data } = await api.get(`/users/${id}`);
  return data;
};

export const updateUser = async (
  id: string,
  payload: Partial<User>
): Promise<User> => {
  const { data } = await api.put(`/users/${id}`, payload);
  return data;
};

export const createChild = async (payload: Child): Promise<Child> => {
  const childDTO = {
    first_name: payload.firstName,
    last_name: payload.lastName,
    date_of_birth: payload.dateOfBirth,
    gender: payload.gender,
    invest_under_child: payload.investUnderChild,
  };

  const { data } = await api.post("/children", { data: [childDTO] });
  return data;
};

export const getChildren = async (): Promise<Child[]> => {
  const { data } = await api.get("/children");

  const children = data.data.map(
    (child: ChildDTO): Child => ({
      id: child.id,
      firstName: child.first_name,
      lastName: child.last_name,
      dateOfBirth: child.date_of_birth,
      gender: child.gender,
      investUnderChild: child.invest_under_child,
    })
  );

  return children;
};

export const getGoals = async (): Promise<Goal[]> => {
  const { data } = await api.get("/goals");
  const goals = (data.data ?? []).map(
    (goal: any): Goal => ({
      id: goal.id,
      title: goal.title,
      childId: goal.child_id,
      targetAmount: goal.target_amount,
      currentAmount: goal.current_amount,
      status: goal.status,
      targetDate: goal.target_date ? new Date(goal.target_date) : new Date(),
      createdAt: goal.createdAt ? new Date(goal.createdAt) : new Date(),
      updatedAt: goal.updatedAt ? new Date(goal.updatedAt) : new Date(),
    })
  );
  return goals;
};

export const createGoal = async (
  payload: {
    childId: string;
    educationId: string;
    title: string;
    targetAmount: number;
    targetDate: Date;
  }[]
): Promise<Goal> => {
  const { data } = await api.post("/goals", { data: payload });

  return data.map((goal: any) => ({
    child: { id: goal.childId },
    education: {
      id: goal.educationId,
    },
    target_amount: goal.targetAmount,
    target_date: goal.targetDate.toLocaleDateString("en-CA"),
    title: goal.title,
  }));
};

type ChildDTO = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  gender: "male" | "female" | "other";
  invest_under_child: boolean;
};
