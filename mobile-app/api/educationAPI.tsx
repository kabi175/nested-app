import { Education } from "@/types/education";
import { api } from "./client";

export const getCourses = async (search?: string): Promise<Education[]> => {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
  const { data } = await api.get(`/education?type=COURSE${searchParam}`);
  return (data.data || []) as Education[];
};

export const getInstitutions = async (
  search?: string
): Promise<Education[]> => {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
  const { data } = await api.get(`/education?type=INSTITUTION${searchParam}`);
  return (data.data || []) as Education[];
};
