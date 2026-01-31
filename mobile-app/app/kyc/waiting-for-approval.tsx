import { getUser } from "@/api/userApi";
import { cartAtom } from "@/atoms/cart";
import { goalsForCustomizeAtom } from "@/atoms/goals";
import { FirstPendingActivityCard } from "@/components/FirstPendingActivityCard";
import { StepProgress } from "@/components/ui/StepProgress";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAuthAxios } from "@/hooks/useAuthAxios";
import { usePendingActivities } from "@/hooks/usePendingActivities";
import { useUser } from "@/hooks/useUser";
import { handleActivityNavigation } from "@/utils/activityNavigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Layout, Text } from "@ui-kitten/components";
import { Redirect, useRouter } from "expo-router";
import { useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

export default function WaitingForApprovalScreen() {
  const api = useAuthAxios();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const { data: activities } = usePendingActivities();
  const setCart = useSetAtom(cartAtom);
  const setGoalsForCustomize = useSetAtom(goalsForCustomizeAtom);
  const [shouldPoll, setShouldPoll] = useState(true);

  const firstActivity = activities?.[0];

  // Poll for user updates every 5 seconds, but stop if we have a final status
  const { data: currentUser, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.user],
    queryFn: () => getUser(api),
    refetchInterval: shouldPoll ? 5000 : false, // Poll every 5 seconds, stop if final status
    refetchIntervalInBackground: false, // Only poll when app is in foreground
  });

  // Update query cache on each refetch and stop polling if we reach a final status
  useEffect(() => {
    if (currentUser !== undefined) {
      queryClient.setQueryData([QUERY_KEYS.user], currentUser);

      // Stop polling if we reach a final status
      const status = currentUser?.kycStatus;
      if (status === "completed" || status === "failed") {
        setShouldPoll(false);
      }
    }
  }, [currentUser, queryClient]);

  // Check for status changes and navigate accordingly
  useEffect(() => {
    if (!currentUser) return;

    const status = currentUser.kycStatus;

    // If KYC is completed, navigate to home
    if (status === "completed") {
      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.user] });
      router.replace("/nominees");
      return;
    }

    // If KYC failed, we'll show an error message (handled in render)
    // User can retry or go back
  }, [currentUser, router, queryClient]);

  const displayStatus = currentUser?.kycStatus || user?.kycStatus;
  const isFailed = displayStatus === "failed";

  const handleRetry = () => {
    router.push("/kyc/basic-details");
  };

  const handleNextPendingActivity = async () => {
    if (firstActivity) {
      await handleActivityNavigation(
        firstActivity,
        api,
        queryClient,
        setCart,
        setGoalsForCustomize
      );
    } else {
      router.replace("/child");
    }
  };

  if (user?.kycStatus === "esign_pending") {
    return <Redirect href="/kyc/esign-upload" />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={{ flex: 1 }}
    >
      <StepProgress current={5} total={5} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Layout
          level="1"
          style={{
            padding: 16,
            borderRadius: 12,
            gap: 12,
            alignItems: "center",
          }}
        >
          {isLoading && !currentUser ? (
            <>
              <ActivityIndicator size="large" color="#0A84FF" />
              <Text category="s1" style={{ marginTop: 16 }}>
                Loading...
              </Text>
            </>
          ) : isFailed ? (
            <>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: "#FEE2E2",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <Text category="h1" status="danger">
                  ✕
                </Text>
              </View>
              <Text
                category="h6"
                status="danger"
                style={{ textAlign: "center" }}
              >
                KYC Verification Failed
              </Text>
              <Text
                category="c1"
                appearance="hint"
                style={{ textAlign: "center", marginTop: 8 }}
              >
                Your KYC verification was not successful. Please review your
                submitted documents and try again.
              </Text>
              {firstActivity && (
                <View style={{ marginTop: 16, width: "100%" }}>
                  <FirstPendingActivityCard showProceedButton={false} />
                </View>
              )}
              <View style={{ marginTop: 16, gap: 8, width: "100%" }}>
                <Button onPress={handleRetry}>Retry Verification</Button>
                <Button appearance="ghost" onPress={handleNextPendingActivity}>
                  {firstActivity ? "Next Pending Activity" : "Go Back"}
                </Button>
              </View>
            </>
          ) : (
            <>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: "#E0F2FE",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <ActivityIndicator size="large" color="#0A84FF" />
              </View>
              <Text category="h6" style={{ textAlign: "center" }}>
                Waiting for Approval
              </Text>
              <Text
                category="c1"
                appearance="hint"
                style={{ textAlign: "center", marginTop: 8 }}
              >
                Your KYC documents have been submitted successfully. We&apos;re
                reviewing your information and will notify you once the
                verification is complete.
              </Text>
              <View
                style={{
                  marginTop: 16,
                  padding: 12,
                  backgroundColor: "#F0F9FF",
                  borderRadius: 8,
                  width: "100%",
                }}
              >
                <Text
                  category="c2"
                  appearance="hint"
                  style={{ textAlign: "center" }}
                >
                  KYC pending approval (usually takes 30-45 minutes) with SEBI KRA. We&apos;ll notify you by email and in-app as soon as it&apos;s verified.
                </Text>
              </View>
              {firstActivity && (
                <View style={{ marginTop: 16, width: "100%" }}>
                  <FirstPendingActivityCard showProceedButton={false} />
                </View>
              )}
              <Button
                appearance="ghost"
                onPress={handleNextPendingActivity}
                style={{ marginTop: 8 }}
              >
                {firstActivity ? "Continue" : "Go Back"}
              </Button>
            </>
          )}
        </Layout>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
