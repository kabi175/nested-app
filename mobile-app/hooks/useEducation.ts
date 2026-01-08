import { getCourses, getInstitutions } from "@/api/educationAPI";
import { Education } from "@/types/education";
import { useQuery } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export const useEducation = (search?: string) => {
  const api = useAuthAxios();
  const coursesQuery = useQuery<Education[]>({
    queryKey: ["education", "courses"],
    queryFn: () => getCourses(api, search),
  });

  const institutionsQuery = useQuery<Education[]>({
    queryKey: ["education", "institutions"],
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
