import type { User } from "@/types/auth";
import type { Child } from "@/types/child";
import type { Goal } from "@/types/investment";
import type { AxiosError } from "axios";
import { api } from "./client";

type UploadableFile = {
  uri: string;
  name?: string;
  type?: string;
};

export const getUser = async (): Promise<User | null> => {
  try {
    const { data } = await api.get(`/users?type=CURRENT_USER`);
    const user = data.data?.[0];
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      panNumber: user.pan_number,
      status: user.status,
      aadhaar: user.aadhaar_last4,
      dob: new Date(user.date_of_birth),
      gender: user.gender,
      created_at: user.created_at,
      updated_at: user.updated_at,
      address: user.address,
      father_name: user.father_name,
      income_source: user.income_source,
      income_slab: user.income_slab,
      occupation: user.occupation,
      pep:
        typeof user.pep === "boolean"
          ? user.pep
          : typeof user.pep_status === "boolean"
          ? user.pep_status
          : typeof user.pepStatus === "boolean"
          ? user.pepStatus
          : null,
    };
  } catch {
    return null;
  }
};

export const updateUser = async (
  id: string,
  payload: Partial<User>
): Promise<User> => {
  const userDTO = {
    first_name: payload.firstName,
    last_name: payload.lastName,
    email: payload.email,
    phone_number: payload.phone_number,
    pan_number: payload.panNumber,
    aadhaar_last4: payload.aadhaar,
    date_of_birth: payload.dob
      ? payload.dob.toLocaleDateString("en-CA")
      : undefined,
    gender: payload.gender,
    address: payload.address,
    father_name: payload.father_name,
    income_source: payload.income_source,
    income_slab: payload.income_slab,
    occupation: payload.occupation,
    pep_status: payload.pep,
    pep: payload.pep,
  };

  const { data } = await api.patch(`/users/${id}`, userDTO);
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

export const uploadUserSignature = async (
  id: string,
  file: UploadableFile
): Promise<void> => {
  const formData = new FormData();
  const fallbackName = "signature.jpg";
  const fallbackType = "image/jpeg";

  const filename =
    file.name ??
    (() => {
      const uriParts = file.uri.split("/");
      const lastPart = uriParts[uriParts.length - 1];
      if (lastPart?.includes(".")) {
        return lastPart;
      }
      return fallbackName;
    })();

  const extension = filename.split(".").pop()?.toLowerCase();
  const mimeType =
    file.type ??
    (extension === "png"
      ? "image/png"
      : extension === "jpg" || extension === "jpeg"
      ? "image/jpeg"
      : fallbackType);

  formData.append("file", {
    uri: file.uri,
    name: filename,
    type: mimeType,
  } as any);

  await api.post(`/users/${id}/signature`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getUserSignature = async (id: string): Promise<string | null> => {
  try {
    const response = await api.get(`/users/${id}/signature`, {
      responseType: "arraybuffer",
    });

    const requestObject = response.request as unknown;
    const responseUrl =
      typeof requestObject === "object" &&
      requestObject !== null &&
      "responseURL" in requestObject
        ? (requestObject as { responseURL?: string }).responseURL ?? undefined
        : undefined;

    const headerLocation =
      (response.headers?.location as string | undefined) ??
      (response.headers?.Location as string | undefined) ??
      (response.headers?.["x-final-url"] as string | undefined);

    const resolvedUrl = responseUrl ?? headerLocation;
    if (resolvedUrl) {
      return resolvedUrl;
    }

    const data = response.data as any;
    if (!data) {
      return null;
    }

    if (typeof data === "string") {
      return data;
    }

    const possibleUrl =
      data?.data?.url ??
      data?.data?.signedUrl ??
      data?.data?.signed_url ??
      data?.signedUrl ??
      data?.signed_url ??
      data?.url;

    return typeof possibleUrl === "string" ? possibleUrl : null;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      return null;
    }
    throw error;
  }
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
  const goals = (data.data ?? []).map((goal: any): Goal => mapGoalToGoal(goal));
  return goals;
};

export const getGoal = async (id: string): Promise<Goal> => {
  const { data } = await api.get(`/goals/${id}`);
  const goals = (data.data ?? []).map((goal: any): Goal => mapGoalToGoal(goal));
  if (goals.length === 0) {
    throw new Error("Goal not found");
  }
  return goals[0];
};

function mapGoalToGoal(goal: any): Goal {
  return {
    id: goal.id,
    title: goal.title,
    childId: goal.child_id,
    targetAmount: goal.target_amount,
    currentAmount: goal.current_amount,
    monthlySip: goal.monthly_sip,
    status: goal.status,
    targetDate: goal.target_date ? new Date(goal.target_date) : new Date(),
    createdAt: goal.createdAt ? new Date(goal.createdAt) : new Date(),
    updatedAt: goal.updatedAt ? new Date(goal.updatedAt) : new Date(),
  };
}
export const createGoal = async (
  goals: {
    childId: string;
    educationId: string;
    title: string;
    targetAmount: number;
    targetDate: Date;
  }[]
): Promise<Goal[]> => {
  const payload = goals.map((goal) => ({
    child: { id: goal.childId },
    education: {
      id: goal.educationId,
    },
    target_amount: goal.targetAmount,
    target_date: goal.targetDate.toLocaleDateString("en-CA"),
    title: goal.title,
  }));
  const { data } = await api.post("/goals", { data: payload });
  return (data.data ?? []).map((goal: any): Goal => mapGoalToGoal(goal));
};

type ChildDTO = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  gender: "male" | "female" | "other";
  invest_under_child: boolean;
};
