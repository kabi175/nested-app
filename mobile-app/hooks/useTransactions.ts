import { getTransactions } from "@/api/orders";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useTransactions(
  page: number = 0,
  fromDate?: Date,
  toDate?: Date
) {
  return useQuery({
    queryKey: [QUERY_KEYS.transactions, page, fromDate, toDate],
    queryFn: () => getTransactions(page, fromDate, toDate),
  });
}
