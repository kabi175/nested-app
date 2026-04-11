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

export function useChild(childId: string) {
  const api = useAuthAxios();
  return useQuery({
    queryKey: [QUERY_KEYS.children, childId],
    queryFn: () => getChildren(api).then((children) => children.find((child) => child.id === childId) ?? null)
  });
}