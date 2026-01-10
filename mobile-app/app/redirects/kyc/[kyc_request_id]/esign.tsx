import { getUser } from "@/api/userApi";
import { userAtom } from "@/atoms/user";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAuthAxios } from "@/hooks/useAuthAxios";
import type { User } from "@/types/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Layout, Spinner, Text } from "@ui-kitten/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useSetAtom } from "jotai";
import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, View } from "react-native";

export default function EsignRedirectSuccessScreen() {
  const { kyc_request_id } = useLocalSearchParams<{
    kyc_request_id?: string;
  }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useSetAtom(userAtom);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<User["kycStatus"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const api = useAuthAxios();
  useEffect(() => {
    WebBrowser.dismissBrowser();
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const latestUser = await getUser(api);
        if (!active) {
          return;
        }
        if (latestUser) {
          setUser(latestUser);
          queryClient.setQueryData([QUERY_KEYS.user], latestUser);
          setStatus(latestUser.kycStatus);
        } else {
          setStatus(null);
        }
      } catch (err) {
        console.error("Failed to refresh user after eSign", err);
        if (active) {
          setError(
            "We completed eSign, but couldn't refresh your account. You can continue safely."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [queryClient, setUser]);

  const nextActionLabel = useMemo(() => {
    if (status === "submitted" || status === "completed") {
      return "View KYC Summary";
    }
    return "Back to Review";
  }, [status]);

  const handleContinue = () => {
    if (status === "submitted" || status === "completed") {
      router.replace("/kyc/review");
      return;
    }
    if (status === "esign_pending") {
      router.replace("/kyc/esign-upload");
      return;
    }
    router.replace("/kyc/review");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <Layout
        level="1"
        style={{
          flex: 1,
          padding: 24,
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
        }}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: "#E8F2FF",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text category="h3">✅</Text>
        </View>

        <View style={{ alignItems: "center", gap: 8 }}>
          <Text category="h5">eSign completed successfully!</Text>
          <Text category="c1" appearance="hint" style={{ textAlign: "center" }}>
            {kyc_request_id
              ? `Reference ID: ${kyc_request_id}`
              : "Your documents have been digitally signed."}
          </Text>
        </View>

        {loading ? (
          <Spinner />
        ) : (
          <Button size="large" onPress={handleContinue}>
            {nextActionLabel}
          </Button>
        )}

        {error && (
          <Text
            category="c2"
            status="danger"
            style={{ textAlign: "center", marginTop: 8 }}
          >
            {error}
          </Text>
        )}

        <Button
          appearance="ghost"
          onPress={() => router.replace("/(tabs)")}
          size="small"
        >
          Go to Dashboard
        </Button>
      </Layout>
    </SafeAreaView>
  );
}
