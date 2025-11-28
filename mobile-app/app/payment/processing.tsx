import {
  fetchLumpsumPaymentUrl,
  fetchMandatePaymentUrl,
} from "@/api/paymentAPI";
import { ThemedText } from "@/components/ThemedText";
import { formatCurrency } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { openBrowserAsync } from "expo-web-browser";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentProcessingScreen() {
  const { buyOrdersAmount, bankName, paymentId, paymentMethod } =
    useLocalSearchParams<{
      buyOrdersAmount?: string;
      bankName?: string;
      paymentMethod?: "net_banking" | "upi";
      paymentId?: string;
    }>();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "bank" | "upi"
  >(() => (paymentMethod === "upi" ? "upi" : "bank"));

  // Default values for demo
  const displayAmount = formatCurrency(Number(buyOrdersAmount));

  const displayBankName = bankName || "Kotak Mahindra Bank";

  const handleLumpsumPayment = async () => {
    const redirectUrl = await fetchLumpsumPaymentUrl(paymentId as string);
    if (redirectUrl) {
      await openBrowserAsync(redirectUrl);
    } else {
      Alert.alert("Error", "Failed to get payment redirect URL.");
    }
  };

  const handleMandatePayment = async () => {
    const redirectUrl = await fetchMandatePaymentUrl(paymentId as string);
    if (redirectUrl) {
      await openBrowserAsync(redirectUrl);
    } else {
      Alert.alert("Error", "Failed to get payment redirect URL.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>
            Payment Processing
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Payment Method Section */}
          <View style={styles.paymentMethodCard}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Payment Method
            </ThemedText>
            <View style={styles.paymentMethodContent}>
              <View style={styles.paymentMethodLeft}>
                <View style={styles.bankIconContainer}>
                  <Ionicons name="business" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.paymentMethodInfo}>
                  <ThemedText style={styles.paymentMethodLabel}>
                    Bank Account
                  </ThemedText>
                  <ThemedText style={styles.bankNameText}>
                    {displayBankName}
                  </ThemedText>
                </View>
              </View>
              <TouchableOpacity
                style={styles.upiOption}
                onPress={() =>
                  setSelectedPaymentMethod(
                    selectedPaymentMethod === "upi" ? "bank" : "upi"
                  )
                }
                activeOpacity={0.7}
              >
                <Ionicons
                  name={
                    selectedPaymentMethod === "upi"
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={24}
                  color={
                    selectedPaymentMethod === "upi" ? "#2563EB" : "#9CA3AF"
                  }
                />
                <ThemedText style={styles.upiText}>UPI</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Step 1: One-time Purchase */}
          <TouchableOpacity
            style={[styles.stepCard, styles.step1Card]}
            onPress={handleLumpsumPayment}
            activeOpacity={0.9}
          >
            <View style={styles.stepContent}>
              <View style={styles.stepLeft}>
                <View style={styles.stepIconContainer}>
                  <Ionicons name="cart" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.stepDetails}>
                  <ThemedText style={styles.stepTitle}>
                    Step 1: One-time Purchase
                  </ThemedText>
                  <ThemedText style={styles.stepSubtitle}>
                    Payment for mutual fund
                  </ThemedText>
                  <View style={styles.amountContainer}>
                    <ThemedText style={styles.amountLabel}>Amount</ThemedText>
                    <ThemedText style={styles.amountValue}>
                      ₹{displayAmount}
                    </ThemedText>
                  </View>
                  <View style={styles.processingContainer}>
                    <ActivityIndicator size="small" color="#2563EB" />
                    <ThemedText style={styles.processingText}>
                      Processing payment...
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Step 2: SIP Auto-Debit */}
          <TouchableOpacity
            style={[styles.stepCard, styles.step2Card]}
            onPress={handleMandatePayment}
            activeOpacity={0.9}
          >
            <View style={styles.stepContent}>
              <View style={styles.stepLeft}>
                <View style={[styles.stepIconContainer, styles.step2Icon]}>
                  <Ionicons name="refresh" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.stepDetails}>
                  <ThemedText style={styles.stepTitle}>
                    Step 2: SIP Auto-Debit
                  </ThemedText>
                  <ThemedText style={styles.stepSubtitle}>
                    Authorize recurring payment
                  </ThemedText>
                  <View style={styles.sipDetails}>
                    <View style={styles.sipRow}>
                      <ThemedText style={styles.sipLabel}>
                        SIP Amount
                      </ThemedText>
                      <ThemedText style={styles.sipValue}>
                        ₹1,000 / month
                      </ThemedText>
                    </View>
                    <View style={styles.sipRow}>
                      <ThemedText style={styles.sipLabel}>
                        Next debit on
                      </ThemedText>
                      <ThemedText style={styles.sipValue}>
                        Dec 5, 2025
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Warning Message */}
          <View style={styles.warningBox}>
            <ThemedText style={styles.warningText}>
              Please do not close this window or press back button
            </ThemedText>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  paymentMethodCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  paymentMethodContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paymentMethodLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  bankIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#E31837",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  bankNameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  upiOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  upiText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  stepCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  step1Card: {
    borderWidth: 2,
    borderColor: "#2563EB",
  },
  step2Card: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  stepContent: {
    // Removed gap to match image layout
  },
  stepLeft: {
    flexDirection: "row",
    gap: 16,
  },
  stepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  step2Icon: {
    backgroundColor: "#10B981",
  },
  stepDetails: {
    flex: 1,
    gap: 8,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  stepSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  amountContainer: {
    marginTop: 4,
  },
  amountLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
  },
  sipDetails: {
    marginTop: 8,
    gap: 8,
  },
  sipRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sipLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  sipValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
  },
  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  processingText: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "500",
  },
  warningBox: {
    backgroundColor: "#DBEAFE",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  warningText: {
    fontSize: 14,
    color: "#1E40AF",
    textAlign: "center",
    lineHeight: 20,
  },
});
