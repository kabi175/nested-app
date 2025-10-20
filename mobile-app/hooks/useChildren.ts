import { getChildren } from "@/api/userApi";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useChildren() {
  return useQuery({
    queryKey: [QUERY_KEYS.children],
    queryFn: getChildren,
  });
}
