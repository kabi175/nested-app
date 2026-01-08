import type { Child } from "@/types/child";
import type { AxiosInstance } from "axios";

export const createChild = async (api: AxiosInstance, payload: Child): Promise<Child> => {
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

export const getChildren = async (api: AxiosInstance): Promise<Child[]> => {
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

type ChildDTO = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  gender: "male" | "female" | "other";
  invest_under_child: boolean;
};

