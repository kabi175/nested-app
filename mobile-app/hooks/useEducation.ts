import { getCourses, getInstitutions } from "@/api/educationAPI";
import { Education } from "@/types/user";
import { useQuery } from "@tanstack/react-query";

export const useEducation = () => {
  const coursesQuery = useQuery<Education[]>({
    queryKey: ["education", "courses"],
    queryFn: getCourses,
  });

  const institutionsQuery = useQuery<Education[]>({
    queryKey: ["education", "institutions"],
    queryFn: getInstitutions,
  });

  return {
    courses: coursesQuery.data ?? [],
    institutions: institutionsQuery.data ?? [],
    isLoadingCourses: coursesQuery.isLoading,
    isLoadingInstitutions: institutionsQuery.isLoading,
    isLoading: coursesQuery.isLoading || institutionsQuery.isLoading,
  };
};
