import {
  getLinkBankAccountStatus,
  linkBankAccount,
} from "@/api/bankAcountsAPI";
import { useAuthAxios } from "@/hooks/useAuthAxios";
import { useUser } from "@/hooks/useUser";
import { useQuery } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 180; // ~6 minutes

type LinkBankAccountStatus = "pending" | "completed" | "failed" | "cancelled";

function routeByStatus(status: LinkBankAccountStatus) {
  if (status === "completed") router.push("/bank-accounts/success");
  else if (status === "failed") router.push("/bank-accounts/failure");
  else if (status === "cancelled") router.push("/bank-accounts/cancelled");
}

export function useLinkBankAccount() {
  const { data: user } = useUser();
  const api = useAuthAxios();

  const [isPending, setIsPending] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    userID: string;
    actionID: string;
  } | null>(null);
  const attemptCountRef = useRef(0);

  const { data: pollStatus } = useQuery({
    queryKey: [
      "bankAccountLinkStatus",
      pendingAction?.userID,
      pendingAction?.actionID,
    ],
    queryFn: async () => {
      if (!pendingAction) throw new Error("No pending action");
      const status = await getLinkBankAccountStatus(
        api,
        pendingAction.userID,
        pendingAction.actionID
      );
      attemptCountRef.current += 1;
      return status;
    },
    enabled: isPending && !!pendingAction,
    refetchInterval: (query) => {
      const current = query.state.data;
      if (current && current !== "pending") return false;
      if (attemptCountRef.current >= MAX_POLL_ATTEMPTS) return false;
      return POLL_INTERVAL_MS;
    },
    refetchIntervalInBackground: false,
    retry: true,
  });

  useEffect(() => {
    if (isPending && pendingAction) {
      attemptCountRef.current = 0;
    }
  }, [isPending, pendingAction]);

  useEffect(() => {
    if (!isPending || !pendingAction || !pollStatus) return;

    if (pollStatus !== "pending") {
      setIsPending(false);
      setPendingAction(null);
      attemptCountRef.current = 0;
      routeByStatus(pollStatus);
      return;
    }

    if (attemptCountRef.current >= MAX_POLL_ATTEMPTS) {
      setIsPending(false);
      setPendingAction(null);
      attemptCountRef.current = 0;
      Alert.alert(
        "Still processing",
        "Bank verification is taking longer than usual. Please wait a moment and try again."
      );
    }
  }, [pollStatus, isPending, pendingAction]);

  const linkViaUPI = async () => {
    if (!user?.id) return;
    const { redirect_url, id } = await linkBankAccount(api, user.id);
    try {
      await Linking.openURL(redirect_url);
    } catch {
      Alert.alert(
        "Error",
        "UPI app not installed. Please install a UPI app like Google Pay or PhonePe."
      );
      return;
    }
    try {
      const status = await getLinkBankAccountStatus(api, user.id, id);
      if (status === "pending") {
        setPendingAction({ userID: user.id, actionID: id });
        setIsPending(true);
        return;
      }
      routeByStatus(status);
    } catch {
      Alert.alert("Error", "Failed to link bank account. Please try again.");
    }
  };

  return { isPending, linkViaUPI };
}
