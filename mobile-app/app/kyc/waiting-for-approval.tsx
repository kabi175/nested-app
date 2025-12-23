import { getUser } from "@/api/userApi";
import { userAtom } from "@/atoms/user";
import { StepProgress } from "@/components/ui/StepProgress";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Layout, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

export default function WaitingForApprovalScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useAtom(userAtom);
  const [shouldPoll, setShouldPoll] = useState(true);

  // Poll for user updates every 5 seconds, but stop if we have a final status
  const { data: currentUser, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.user],
    queryFn: () => getUser(),
    refetchInterval: shouldPoll ? 5000 : false, // Poll every 5 seconds, stop if final status
    refetchIntervalInBackground: false, // Only poll when app is in foreground
  });

  // Update user atom when data changes
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);

      // Stop polling if we reach a final status
      const status = currentUser.kycStatus;
      if (status === "completed" || status === "failed") {
        setShouldPoll(false);
      }
    }
  }, [currentUser, setUser]);

  // Check for status changes and navigate accordingly
  useEffect(() => {
    if (!currentUser) return;

    const status = currentUser.kycStatus;

    // If KYC is completed, navigate to home
    if (status === "completed") {
      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.user] });
      router.replace("/(tabs)");
      return;
    }

    // If KYC failed, we'll show an error message (handled in render)
    // User can retry or go back
  }, [currentUser, router, queryClient]);

  const displayStatus = currentUser?.kycStatus || user?.kycStatus;
  const isFailed = displayStatus === "failed";

  const handleRetry = () => {
    // Restart polling and refresh the query immediately
    setShouldPoll(true);
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.user] });
  };

  const handleGoBack = () => {
    router.replace("/child");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={{ flex: 1 }}
    >
      <StepProgress current={6} total={6} />
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
              <View style={{ marginTop: 16, gap: 8, width: "100%" }}>
                <Button onPress={handleRetry}>Retry Verification</Button>
                <Button appearance="ghost" onPress={handleGoBack}>
                  Go Back
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
                Your KYC documents have been submitted successfully. We're
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
                  This usually takes a few minutes. We'll automatically update
                  you when your status changes.
                </Text>
              </View>
              <Button
                appearance="ghost"
                onPress={handleGoBack}
                style={{ marginTop: 8 }}
              >
                Go Back
              </Button>
            </>
          )}
        </Layout>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
