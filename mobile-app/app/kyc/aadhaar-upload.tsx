import { fetchAadhaarUploadRedirectUrl } from "@/api/userApi";
import { userAtom } from "@/atoms/user";
import { StepProgress } from "@/components/ui/StepProgress";
import { useAuthAxios } from "@/hooks/useAuthAxios";
import { useUser } from "@/hooks/useUser";
import { Button, Layout, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useAtomValue } from "jotai";
import React, { useCallback, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

export default function AadhaarUploadScreen() {
  const user = useAtomValue(userAtom);
  const api = useAuthAxios();
  const router = useRouter();
  const [isLaunching, setIsLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const totalSteps = 6;
  const currentStep = 6;
  const { refetch } = useUser();

  const startAadhaarUpload = useCallback(async () => {
    if (!user) {
      setError("We couldn't find your account details. Please try again.");
      return;
    }

    setIsLaunching(true);
    setError(null);
    try {
      const redirectUrl = await fetchAadhaarUploadRedirectUrl(api, user);
      if (redirectUrl) {
        await WebBrowser.openBrowserAsync(redirectUrl, {
          toolbarColor: "#0A84FF",
          controlsColor: "#ffffff",
          showTitle: true,
          enableDefaultShareMenuItem: false,
          dismissButtonStyle: "done",
          readerMode: false,
        });
      }
      await refetch();
      if (user?.kycStatus === "esign_pending") {
        router.push("/kyc/esign-upload");
      } else if (user?.kycStatus === "submitted") {
        router.push("/kyc/waiting-for-approval");
      }
    } catch (err) {
      console.error("Failed to start Aadhaar upload flow", err);
      setError(
        "We couldn't launch the Aadhaar verification flow. Please retry in a moment."
      );
    } finally {
      setIsLaunching(false);
    }
  }, [user, api, refetch, router]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={{ flex: 1 }}
    >
      <StepProgress current={currentStep} total={totalSteps} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Layout level="1" style={{ padding: 16, borderRadius: 12, gap: 8 }}>
          <Text category="s1">Aadhaar Verification</Text>
          <Text category="c1" appearance="hint">
            You will be redirected to our verification partner to complete your
            Aadhaar KYC. Keep your Aadhaar-linked mobile phone nearby to receive
            the OTP.
          </Text>
        </Layout>

        <Layout level="1" style={{ padding: 16, borderRadius: 12, gap: 12 }}>
          <View style={{ gap: 4 }}>
            <Text category="label">What happens next?</Text>
            <Text category="c1" appearance="hint">
              1. Tap the button below to launch a secure in-app browser.{"\n"}
              2. Complete the Aadhaar OTP verification flow.{"\n"}
              3. Once successful, you will be brought back here automatically.
            </Text>
          </View>

          <Button onPress={startAadhaarUpload} disabled={isLaunching}>
            {isLaunching ? "Opening..." : "Start Aadhaar Verification"}
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
