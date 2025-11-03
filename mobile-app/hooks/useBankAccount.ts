import {
  addBankAccount,
  deleteBankAccount,
  getBankAccounts,
} from "@/api/bankAcountsAPI";
import { userAtom } from "@/atoms/user";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

export function useBankAccounts() {
  const user = useAtomValue(userAtom);

  return useQuery({
    queryKey: [QUERY_KEYS.bankAccounts, user?.id],
    queryFn: () => (user ? getBankAccounts(user.id) : Promise.resolve([])),
    enabled: !!user,
  });
}

export function useAddBankAccount() {
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
      return addBankAccount(user.id, bank_account);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.bankAccounts, user?.id],
      });
    },
  });
}

export function useDeleteBankAccount() {
  const user = useAtomValue(userAtom);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bank_id: string) => {
      if (!user) throw new Error("User not found");
      return deleteBankAccount(user.id, bank_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.bankAccounts, user?.id],
      });
    },
  });
}
