import { usePreVerification } from "@/hooks/usePreVerification";
import { getErrorMessage } from "@/utils/kyc";
import { Button, Layout, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import { AlertCircle } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ValidationFailureScreen() {
  const router = useRouter();
  const { data: preVerificationData } = usePreVerification();

  const firstError = preVerificationData?.find((item) => !item.is_valid);
  const errorMessage = firstError
    ? getErrorMessage(firstError.error_code)
    : "We couldn't verify your details. Please check your information and try again.";

  const handleRetry = () => {
    router.replace("/kyc/basic-details");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <Layout level="1" style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <AlertCircle size={80} color="#FF3B30" />
          </View>
          <View style={styles.textContainer}>
            <Text category="h4" style={styles.title}>
              Verification Failed
            </Text>
            <Text appearance="hint" category="s1" style={styles.subtitle}>
              {errorMessage}
            </Text>
          </View>
        </View>
        <Button size="large" onPress={handleRetry} style={styles.button}>
          Back to Basic Details
        </Button>
      </Layout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: "space-between",
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
  },
  iconContainer: {
    marginBottom: 8,
  },
  textContainer: {
    gap: 12,
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    fontWeight: "700",
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  button: {
    width: "100%",
  },
});
