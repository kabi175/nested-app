import { getEducationById } from "@/api/educationAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export const useEducation = (educationId: string) => {
  const api = useAuthAxios();
  return useQuery({
    queryKey: [QUERY_KEYS.education, educationId],
    queryFn: () => getEducationById(api, educationId),
  });
};
