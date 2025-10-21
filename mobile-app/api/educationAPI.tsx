import { Education } from "@/types/user";
import { api } from "./client";

export const getCourses = async (): Promise<Education[]> => {
  const { data } = await api.get(`/education?type=COURSE`);
  return data;
};

export const getInstitutions = async (): Promise<Education[]> => {
  const { data } = await api.get(`/education?type=INSTITUTION`);
  return data;
};
