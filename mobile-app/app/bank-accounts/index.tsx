import {
  getLinkBankAccountStatus,
  linkBankAccount,
} from "@/api/bankAcountsAPI";
import UPIButton from "@/components/buttons/UPIButton";
import { useAuthAxios } from "@/hooks/useAuthAxios";
import { useUser } from "@/hooks/useUser";
import { formatCurrency } from "@/utils/formatters";
import { Button, Layout, Text } from "@ui-kitten/components";
import { LinearGradient } from "expo-linear-gradient";
import { Link, Redirect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowRight, CreditCard, Lock, Sparkles } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 60; // ~2 minutes

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export default function BankAccountsScreen() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const api = useAuthAxios();

  const [isPendingStatus, setIsPendingStatus] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    userID: string;
    actionID: string;
  } | null>(null);
  const abortPollRef = useRef(false);

  const routeByStatus = (
    status: "pending" | "completed" | "failed" | "cancelled"
  ) => {
    if (status === "completed") router.push("/bank-accounts/success");
    else if (status === "failed") router.push("/bank-accounts/failure");
    else if (status === "cancelled") router.push("/bank-accounts/cancelled");
  };

  useEffect(() => {
    if (!isPendingStatus || !pendingAction) return;

    abortPollRef.current = false;
    const { userID, actionID } = pendingAction;

    const poll = async () => {
      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        if (abortPollRef.current) return;
        try {
          const status = await getLinkBankAccountStatus(api, userID, actionID);
          if (status === "pending") {
            await sleep(POLL_INTERVAL_MS);
            continue;
          }
          setIsPendingStatus(false);
          setPendingAction(null);
          routeByStatus(status);
          return;
        } catch {
          // transient failures -> keep polling
          await sleep(POLL_INTERVAL_MS);
        }
      }

      if (abortPollRef.current) return;
      setIsPendingStatus(false);
      setPendingAction(null);
      Alert.alert(
        "Still processing",
        "Bank verification is taking longer than usual. Please wait a moment and try again."
      );
    };

    poll();
    return () => {
      abortPollRef.current = true;
    };
  }, [api, isPendingStatus, pendingAction]);

  const handleContinue = async () => {
    if (!user?.id) return;
    const { redirect_url, id } = await linkBankAccount(api, user?.id);
    try {
      await Linking.openURL(redirect_url);
    } catch (error: unknown) {
      console.log("error during opening bank link url", error);
      Alert.alert(
        "Error",
        "UPI app not installed. Please install a UPI app like Google Pay or PhonePe."
      );
      return;
    }
    try {
      const status = await getLinkBankAccountStatus(api, user?.id, id);
      console.log("status of bank account link", id, status);
      if (status === "pending") {
        setPendingAction({ userID: user.id, actionID: id });
        setIsPendingStatus(true);
        return;
      }

      routeByStatus(status);
    } catch (error: unknown) {
      console.log("error during getting bank account link status", error);
      Alert.alert("Error", "Failed to link bank account. Please try again.");
      return;
    }
  };
  if (!isUserLoading && user?.is_ready_to_invest !== true) {
    return <Redirect href="/kyc" />;
  }
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="auto" backgroundColor="#fff" />
      <Layout style={styles.container} level="1">
        {isPendingStatus ? (
          <View style={styles.pendingOverlay} pointerEvents="auto">
            <View style={styles.pendingCard}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text category="s1" style={styles.pendingTitle}>
                Waiting for bank verification…
              </Text>
              <Text
                category="c1"
                appearance="hint"
                style={styles.pendingSubtitle}
              >
                This can take a few seconds. Please keep this screen open.
              </Text>
            </View>
          </View>
        ) : null}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text category="h4" style={styles.title}>
              Link bank account
            </Text>
            <Text category="s1" appearance="hint" style={styles.subtitle}>
              Securely connect your bank account to start investing for your
              child&apos;s future
            </Text>
          </View>

          {/* UPI Card */}
          <TouchableOpacity activeOpacity={0.95}>
            <LinearGradient
              colors={["#2563EB", "#1D4ED8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.upiCard}
            >
              <View style={styles.upiCardHeader}>
                <View style={styles.upiIconContainer}>
                  <CreditCard size={24} color="#fff" />
                </View>
                <View style={styles.upiCardContent}>
                  <Text category="h6" style={styles.upiCardTitle}>
                    Quick Link with UPI
                  </Text>
                  <Text category="s2" style={styles.upiCardSubtitle}>
                    Fast & secure verification
                  </Text>
                </View>
                <View style={styles.sparklesContainer}>
                  <Sparkles size={20} color="rgba(255,255,255,0.5)" />
                </View>
              </View>

              <View style={styles.upiButtonContainer}>
                <UPIButton />
              </View>

              <View style={styles.verificationInfo}>
                <Lock size={14} color="rgba(255,255,255,0.8)" />
                <Text category="s1" style={styles.verificationText}>
                  {formatCurrency(1)} will be deducted from your account
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider with "OR" text */}
          <View style={styles.orDivider}>
            <View style={styles.dividerLine} />
            <Text category="s1" appearance="hint" style={styles.orText}>
              or
            </Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Manual Link Option */}
          <Link replace href="/bank-accounts/add-manual" asChild>
            <TouchableOpacity style={styles.manualLinkCard}>
              <View style={styles.manualLinkContent}>
                <Text category="h6" style={styles.manualLinkTitle}>
                  Link manually
                </Text>
                <Text category="s2" appearance="hint">
                  Enter your bank details manually
                </Text>
              </View>
              <View style={styles.arrowContainer}>
                <ArrowRight size={20} color="#2563EB" />
              </View>
            </TouchableOpacity>
          </Link>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <View style={styles.securityHeader}>
              <Lock size={16} color="#10B981" />
              <Text category="s1" style={styles.securityTitle}>
                Your security matters
              </Text>
            </View>
            <Text category="s2" style={styles.securityDescription}>
              All transactions are encrypted and your data is protected with
              bank-level security
            </Text>
          </View>
        </ScrollView>

        {/* Continue Button - Fixed at Bottom */}
        <SafeAreaView style={styles.buttonContainer} edges={["bottom"]}>
          <Button
            style={styles.continueButton}
            size="large"
            onPress={handleContinue}
            disabled={isPendingStatus}
          >
            Continue
          </Button>
        </SafeAreaView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  headerSection: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 8,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  subtitle: {
    lineHeight: 22,
    color: "#64748B",
  },
  // UPI Card Styles
  upiCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  upiCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  upiIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  upiCardContent: {
    flex: 1,
  },
  upiCardTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginBottom: 4,
  },
  upiCardSubtitle: {
    color: "rgba(255,255,255,0.9)",
  },
  sparklesContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  verificationInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 12,
  },
  verificationText: {
    flex: 1,
    marginLeft: 8,
    color: "rgba(255,255,255,0.95)",
    lineHeight: 18,
  },
  // OR Divider Styles
  orDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  orText: {
    marginHorizontal: 16,
    color: "#94A3B8",
    fontWeight: "500",
  },
  // Manual Link Styles
  manualLinkCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  manualLinkContent: {
    flex: 1,
  },
  manualLinkTitle: {
    fontWeight: "600",
    marginBottom: 4,
    color: "#0F172A",
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  // Security Note Styles
  securityNote: {
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  securityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  securityTitle: {
    marginLeft: 8,
    fontWeight: "600",
    color: "#065F46",
  },
  securityDescription: {
    color: "#047857",
    lineHeight: 20,
  },
  // Button Container
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  continueButton: {
    width: "100%",
  },
  upiButtonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pendingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.25)",
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  pendingCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  pendingTitle: {
    marginTop: 12,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "center",
  },
  pendingSubtitle: {
    marginTop: 6,
    textAlign: "center",
    lineHeight: 18,
  },
});
