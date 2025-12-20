import { Button, Layout, Text } from "@ui-kitten/components";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CheckCircle } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BankAccountSuccessScreen() {
  const handleContinue = () => {
    router.replace("/bank-accounts/list");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar style="auto" backgroundColor="#F8FAFC" />
      <Layout style={styles.container} level="1">
        <View style={styles.content}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={["#10B981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <CheckCircle size={64} color="#FFFFFF" strokeWidth={2.5} />
            </LinearGradient>
          </View>

          {/* Success Message */}
          <View style={styles.textContainer}>
            <Text category="h3" style={styles.title}>
              Bank Account Linked!
            </Text>
            <Text category="s1" appearance="hint" style={styles.subtitle}>
              Your bank account has been successfully linked and verified. You
              can now start investing for your child&apos;s future.
            </Text>
          </View>

          {/* Action Button */}
          <View style={styles.buttonContainer}>
            <Button
              style={styles.continueButton}
              size="large"
              onPress={handleContinue}
            >
              View Bank Accounts
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
    shadowColor: "#10B981",
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
  },
  continueButton: {
    width: "100%",
  },
});

