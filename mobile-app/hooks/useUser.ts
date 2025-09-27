import { getUser } from "@/api/userApi";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useUser(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.user, id],
    queryFn: () => getUser(id),
  });
}
