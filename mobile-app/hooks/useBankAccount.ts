import {
  addBankAccount,
  deleteBankAccount,
  getBankAccounts,
} from "@/api/bankAcountsAPI";
import { userAtom } from "@/atoms/user";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useAuthAxios } from "./useAuthAxios";

export function useBankAccounts() {
  const api = useAuthAxios();
  const user = useAtomValue(userAtom);

  return useQuery({
    queryKey: [QUERY_KEYS.bankAccounts, user?.id],
    queryFn: () => (user ? getBankAccounts(api, user.id) : Promise.resolve([])),
    enabled: !!user,
  });
}

export function useAddBankAccount() {
  const api = useAuthAxios();
  const user = useAtomValue(userAtom);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bank_account: {
      accountNumber: string;
      ifscCode: string;
      type: "savings" | "current";
      isPrimary: boolean;
    }) => {
      if (!user) throw new Error("User not found");
      return addBankAccount(api, user.id, bank_account);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.bankAccounts, user?.id],
      });

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.pendingActivities],
      });
    },
  });
}

export function useDeleteBankAccount() {
  const api = useAuthAxios();
  const user = useAtomValue(userAtom);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bank_id: string) => {
      if (!user) throw new Error("User not found");
      return deleteBankAccount(api, user.id, bank_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.bankAccounts, user?.id],
      });
    },
  });
}
