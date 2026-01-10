import {
  linkBankAccount,
  getLinkBankAccountStatus,
} from "@/api/bankAcountsAPI";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthAxios } from "./useAuthAxios";

export function useLinkBankAccount() {
  const api = useAuthAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userID: string) => linkBankAccount(api, userID),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.bankAccounts],
      });
    },
  });
}

export function useGetLinkBankAccountStatus() {
  const api = useAuthAxios();

  return useMutation({
    mutationFn: ({
      userID,
      actionID,
    }: {
      userID: string;
      actionID: string;
    }) => getLinkBankAccountStatus(api, userID, actionID),
  });
}




