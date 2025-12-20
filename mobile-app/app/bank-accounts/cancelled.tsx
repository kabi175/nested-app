import { Button, Layout, Text } from "@ui-kitten/components";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { XCircle } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BankAccountCancelledScreen() {
  const handleTryAgain = () => {
    router.replace("/bank-accounts");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar style="auto" backgroundColor="#F8FAFC" />
      <Layout style={styles.container} level="1">
        <View style={styles.content}>
          {/* Cancelled Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={["#6B7280", "#4B5563"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <XCircle size={64} color="#FFFFFF" strokeWidth={2.5} />
            </LinearGradient>
          </View>

          {/* Cancelled Message */}
          <View style={styles.textContainer}>
            <Text category="h3" style={styles.title}>
              Action Cancelled!
            </Text>
            <Text category="s1" appearance="hint" style={styles.subtitle}>
              You cancelled the bank account linking process. No changes have
              been made to your account.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              style={styles.primaryButton}
              size="large"
              onPress={handleTryAgain}
            >
              Try Again
            </Button>
            <Button
              style={styles.secondaryButton}
              size="large"
              appearance="ghost"
              onPress={handleGoBack}
            >
              Go Back
            </Button>
          </View>
        </View>
      </Layout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6B7280",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 48,
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 16,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    lineHeight: 24,
    color: "#64748B",
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 20,
    gap: 12,
  },
  primaryButton: {
    width: "100%",
  },
  secondaryButton: {
    width: "100%",
  },
});
