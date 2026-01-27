import { fetchEsignUploadRedirectUrl } from "@/api/userApi";
import { StepProgress } from "@/components/ui/StepProgress";
import { useAuthAxios } from "@/hooks/useAuthAxios";
import { useUser } from "@/hooks/useUser";
import { Button, Layout, Spinner, Text } from "@ui-kitten/components";
import * as Linking from "expo-linking";
import { Redirect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

export default function EsignUploadScreen() {
  const { data: user, isLoading, refetch } = useUser();
  const router = useRouter();
  const [isLaunching, setIsLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const totalSteps = 5;
  const currentStep = 5;
  const api = useAuthAxios();

  const startEsign = useCallback(async () => {
    if (!user) {
      setError("We couldn't find your account details. Please try again.");
      return;
    }

    setIsLaunching(true);
    setError(null);
    try {
      const redirectUrl = await fetchEsignUploadRedirectUrl(api, user);
      if (redirectUrl) {
        await Linking.openURL(redirectUrl);
      }
      router.push("/kyc/waiting-for-approval");
      await refetch();
    } catch (err) {
      console.error("Failed to launch eSign flow", err);
      setError("We couldn't launch the eSign flow. Please retry in a moment.");
    } finally {
      setIsLaunching(false);
    }
  }, [user]);

  if (isLoading) {
    return <Spinner />;
  }

  if (user?.kycStatus === "aadhaar_pending") {
    return <Redirect href="/kyc/aadhaar-upload" />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={{ flex: 1 }}
    >
      <StepProgress current={currentStep} total={totalSteps} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Layout level="1" style={{ padding: 16, borderRadius: 12, gap: 8 }}>
          <Text category="s1">eSign Authorisation</Text>
          <Text category="c1" appearance="hint">
            Complete the eSign step to digitally sign your KYC documents. This
            uses a government-approved provider and takes just a minute.
          </Text>
        </Layout>

        <Layout level="1" style={{ padding: 16, borderRadius: 12, gap: 12 }}>
          <View style={{ gap: 4 }}>
            <Text category="label">What happens next?</Text>
            <Text category="c1" appearance="hint">
              1. Tap the button below to open a secure signing window.{"\n"}
              2. Verify with Aadhaar OTP to sign your documents.{"\n"}
              3. Once finished, you will return to the app automatically.
            </Text>
          </View>

          <Button onPress={startEsign} disabled={isLaunching}>
            {isLaunching ? "Opening..." : "Start eSign"}
          </Button>

          {error && (
            <Text category="c2" status="danger">
              {error}
            </Text>
          )}

          <Button
            appearance="ghost"
            onPress={() => router.back()}
            disabled={isLaunching}
          >
            Back
          </Button>
        </Layout>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
