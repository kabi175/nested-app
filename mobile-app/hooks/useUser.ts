import { getUser } from "@/api/userApi";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function useUser() {
  const api = useAuthAxios();
  const query = useQuery({
    queryKey: [QUERY_KEYS.user],
    queryFn: () => getUser(api),
  });

  return query;
}
