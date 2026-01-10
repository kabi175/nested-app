import { getChildren } from "@/api/childApi";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function useChildren() {
  const api = useAuthAxios();
  return useQuery({
    queryKey: [QUERY_KEYS.children],
    queryFn: () => getChildren(api),
  });
}
