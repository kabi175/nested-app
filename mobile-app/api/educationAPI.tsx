import { Education } from "@/types/education";
import { api } from "./client";

export const getCourses = async (): Promise<Education[]> => {
  const { data } = await api.get(`/education?type=COURSE`);
  return data.data as Education[] | [];
};

export const getInstitutions = async (): Promise<Education[]> => {
  const { data } = await api.get(`/education?type=INSTITUTION`);
  return data.data as Education[] | [];
};
