import { usePreVerification } from "@/hooks/usePreVerification";
import { getErrorMessage } from "@/utils/kyc";
import Button from "@/components/v2/Button";
import { useRouter } from "expo-router";
import { AlertCircle } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
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
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <AlertCircle size={80} color="#FF3B30" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Verification Failed</Text>
            <Text style={styles.subtitle}>{errorMessage}</Text>
          </View>
        </View>
        <View style={styles.footer}>
          <Button title="Back to Basic Details" onPress={handleRetry} />
        </View>
      </View>
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
    paddingTop: 24,
    justifyContent: "space-between",
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
    fontSize: 24,
    fontWeight: "700",
    color: "#222B45",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    color: "#8F9BB3",
    paddingHorizontal: 16,
  },
  footer: {
    paddingBottom: 16,
  },
});
