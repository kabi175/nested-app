import { Button, Layout, Text } from "@ui-kitten/components";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AlertCircle, XCircle } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BankAccountFailureScreen() {
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
          {/* Failure Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={["#EF4444", "#DC2626"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <XCircle size={64} color="#FFFFFF" strokeWidth={2.5} />
            </LinearGradient>
          </View>

          {/* Failure Message */}
          <View style={styles.textContainer}>
            <Text category="h3" style={styles.title}>
              Link Bank Account Failed!
            </Text>
            <Text category="s1" appearance="hint" style={styles.subtitle}>
              We couldn&apos;t link your bank account. This could be due to
              incorrect information.
            </Text>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <AlertCircle size={20} color="#F59E0B" />
            <Text category="s2" style={styles.infoText}>
              Make sure your Bank Account name matched the name on your Aadhar
              Card or PAN Card.
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
    shadowColor: "#EF4444",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 32,
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
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#FDE68A",
    width: "100%",
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    color: "#92400E",
    lineHeight: 20,
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
