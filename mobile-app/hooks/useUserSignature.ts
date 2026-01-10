import { getUserSignature } from "@/api/userApi";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function useUserSignature(userId: string | undefined) {
  const api = useAuthAxios();
  return useQuery({
    queryKey: [QUERY_KEYS.userSignature, userId],
    queryFn: () => {
      if (!userId) {
        return Promise.resolve(null);
      }
      return getUserSignature(api, userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}




