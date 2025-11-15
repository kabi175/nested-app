import { fetchEsignUploadRedirectUrl } from "@/api/userApi";
import { userAtom } from "@/atoms/user";
import { StepProgress } from "@/components/ui/StepProgress";
import { Button, Layout, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useAtomValue } from "jotai";
import React, { useCallback, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

export default function EsignUploadScreen() {
  const user = useAtomValue(userAtom);
  const router = useRouter();
  const [isLaunching, setIsLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const totalSteps = 6;
  const currentStep = 6;

  const startEsign = useCallback(async () => {
    if (!user) {
      setError("We couldn't find your account details. Please try again.");
      return;
    }

    setIsLaunching(true);
    setError(null);
    try {
      const redirectUrl = await fetchEsignUploadRedirectUrl(user);
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
    } catch (err) {
      console.error("Failed to launch eSign flow", err);
      setError("We couldn't launch the eSign flow. Please retry in a moment.");
    } finally {
      setIsLaunching(false);
      router.push("/kyc/waiting-for-approval");
    }
  }, [user]);

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
