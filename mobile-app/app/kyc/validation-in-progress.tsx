import { usePreVerification } from "@/hooks/usePreVerification";
import { Layout, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ValidationInProgressScreen() {
  const router = useRouter();
  const { status  } = usePreVerification();

  useEffect(() => {
    if (status === "success") {
      router.replace("/kyc/validation-success");
    } else if (status === "failed") {
      router.replace("/kyc/validation-failure");
    }
  }, [status, router]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <Layout level="1" style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#0A84FF" />
          <View style={styles.textContainer}>
            <Text category="h4" style={styles.title}>
              Verifying your details
            </Text>
            <Text appearance="hint" category="s1" style={styles.subtitle}>
              We are verifying your PAN and other details. This usually takes less than a minute.
            </Text>
          </View>
        </View>
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
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  content: {
    alignItems: "center",
    gap: 32,
  },
  textContainer: {
    gap: 12,
    alignItems: "center",
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
});
