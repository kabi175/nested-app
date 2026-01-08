import { getTransactions } from "@/api/orders";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function useTransactions(
  page: number = 0,
  fromDate?: Date,
  toDate?: Date
) {
  const api = useAuthAxios();
  return useQuery({
    queryKey: [QUERY_KEYS.transactions, page, fromDate, toDate],
    queryFn: () => getTransactions(api, page, fromDate, toDate),
  });
}
