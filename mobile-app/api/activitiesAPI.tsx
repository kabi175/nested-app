import { Goal, User } from "@/types";
import type { AxiosInstance } from "axios";

type Activity = {
  id: string;
  title: string;
  type:
    | "kyc_incomplete"
    | "bank_account_pending"
    | "goal_payment_pending"
    | "profile_incomplete"
    | "nominee_configuration_pending";
  priority: "low" | "medium" | "high";
  description: string;
  status: "PENDING";
  metadata: User | Goal | null;
  created_at: Date;
  updated_at: Date;
};

export const fetchPendingActivities = async (
  api: AxiosInstance,
  user_id: string
): Promise<Activity[]> => {
  const { data } = await api.get(`/users/${user_id}/pending-activities`);
  if (
    !data ||
    !Array.isArray(data.pendingActivities) ||
    data.pendingActivities.length === 0
  ) {
    return [];
  }
  return data.pendingActivities.map((activity: any) => ({
    id: activity.id,
    title: activity.title,
    type: activity.type,
    priority: activity.priority,
    description: activity.description,
    status: activity.status,
    metadata: activity.metadata,
    created_at: new Date(activity.created_at),
    updated_at: new Date(activity.updated_at),
  }));
};
