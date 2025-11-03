import { getCourses, getInstitutions } from "@/api/educationAPI";
import { Education } from "@/types/education";
import { useQuery } from "@tanstack/react-query";

export const useEducation = (search?: string) => {
  const coursesQuery = useQuery<Education[]>({
    queryKey: ["education", "courses"],
    queryFn: () => getCourses(search),
  });

  const institutionsQuery = useQuery<Education[]>({
    queryKey: ["education", "institutions"],
    queryFn: () => getInstitutions(search),
  });

  return {
    courses: coursesQuery.data ?? [],
    institutions: institutionsQuery.data ?? [],
    isLoadingCourses: coursesQuery.isLoading,
    isLoadingInstitutions: institutionsQuery.isLoading,
    isLoading: coursesQuery.isLoading || institutionsQuery.isLoading,
  };
};
