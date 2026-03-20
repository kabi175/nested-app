import { getCourses, getInstitutions } from "@/api/educationAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { Education } from "@/types/education";
import { useQuery } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export const useEducations = (search?: string) => {
  const api = useAuthAxios();
  const coursesQuery = useQuery<Education[]>({
    queryKey: [QUERY_KEYS.education, "courses"],
    queryFn: () => getCourses(api, search),
  });

  const institutionsQuery = useQuery<Education[]>({
    queryKey: [QUERY_KEYS.education, "institutions"],
    queryFn: () => getInstitutions(api, search),
  });

  return {
    courses: coursesQuery.data ?? [],
    institutions: institutionsQuery.data ?? [],
    isLoadingCourses: coursesQuery.isLoading,
    isLoadingInstitutions: institutionsQuery.isLoading,
    isLoading: coursesQuery.isLoading || institutionsQuery.isLoading,
  };
};
