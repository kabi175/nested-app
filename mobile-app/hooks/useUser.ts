import { getUser } from "@/api/userApi";
import { userAtom } from "@/atoms/user";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { useAuthAxios } from "./useAuthAxios";

export function useUser() {
  const api = useAuthAxios();
  const setUser = useSetAtom(userAtom);
  const query = useQuery({
    queryKey: [QUERY_KEYS.user],
    queryFn: () => getUser(api),
  });

  useEffect(() => {
    if (query.data !== undefined) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  return query;
}
