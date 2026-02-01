import { fetchPreVerification } from "@/api/userApi";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useUser } from "@/hooks/useUser";
import { getValidationStatus } from "@/utils/kyc";
import { useQuery } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function usePreVerification() {
  const api = useAuthAxios();
  const { data: user } = useUser();

  const query = useQuery({
    queryKey: [QUERY_KEYS.preVerification],
    queryFn: () => {
      if (!user) throw new Error("User not found");
      return fetchPreVerification(api, user);
    },
    enabled: !!user,
    refetchInterval: 10000, // Poll every 10 seconds
    retry: true,
  });

  const status = getValidationStatus(query.data);

  return {
    ...query,
    status,
  };
}
