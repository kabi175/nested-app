import { Education } from "@/types/education";
import type { AxiosInstance } from "axios";

export const getCourses = async (api: AxiosInstance, search?: string): Promise<Education[]> => {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
  const { data } = await api.get(`/education?type=COURSE${searchParam}`);
  return (data.data || []) as Education[];
};

export const getInstitutions = async (
  api: AxiosInstance,
  search?: string
): Promise<Education[]> => {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
  const { data } = await api.get(`/education?type=INSTITUTION${searchParam}`);
  return (data.data || []) as Education[];
};
