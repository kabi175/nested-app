import { Button, Layout, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function KycIntroScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.push("/kyc/basic-details");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Layout level="1" style={styles.container}>
        <View style={styles.content}>
          <View style={styles.badge}>
            <Text category="h3" style={styles.badgeTitle}>
              Ready to invest?
            </Text>
            <Text appearance="hint" category="c1" style={styles.badgeSubtitle}>
              A quick KYC keeps your investments compliant and secure.
            </Text>
          </View>
          <View style={styles.textContainer}>
            <Text category="h4" style={styles.title}>
              Complete your KYC
            </Text>
            <Text appearance="hint" category="s1" style={styles.subtitle}>
              Complete your KYC to make your investment and unlock all the
              benefits of your account.
            </Text>
          </View>
        </View>
        <Button size="large" onPress={handleContinue} style={styles.button}>
          Continue
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
    paddingTop: 40,
    paddingBottom: 24,
    justifyContent: "space-between",
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
  },
  textContainer: {
    gap: 12,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 22,
  },
  badge: {
    width: "100%",
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#F4F8FF",
    borderWidth: 1,
    borderColor: "#D6E4FF",
    alignItems: "center",
    gap: 8,
  },
  badgeTitle: {
    textAlign: "center",
  },
  badgeSubtitle: {
    textAlign: "center",
    lineHeight: 18,
  },
  button: {
    marginTop: 24,
  },
});

