import { cartAtom } from "@/atoms/cart";
import { ThemedText } from "@/components/ThemedText";
import { SectionHeader } from "@/components/v2/profile/SectionHeader";
import { BankAccountChip } from "@/components/v2/top-up/BankAccountChip";
import { PaymentMethodRow } from "@/components/v2/top-up/PaymentMethodRow";
import { PAYMENT_METHODS } from "@/components/v2/top-up/types";
import { useBankAccounts } from "@/hooks/useBankAccount";
import { useCreatePayment } from "@/hooks/usePaymentMutations";
import { BankAccount } from "@/types/bank";
import { formatCurrency } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@ui-kitten/components";
import { Redirect, router } from "expo-router";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type PaymentMethod = "upi" | "netbanking";


export default function PaymentMethodScreen() {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const cart = useAtomValue(cartAtom);
  const { data: bankAccountsData, isLoading: isLoadingBanks } =
    useBankAccounts();
  const createPaymentMutation = useCreatePayment();
  // Ensure bankAccounts is always an array
  const bankAccounts = useMemo(
    () => (Array.isArray(bankAccountsData) ? bankAccountsData : []),
    [bankAccountsData]
  );
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    "upi"
  );
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Auto-select bank account when bank accounts finish loading and a payment method is selected
  useEffect(() => {
    if (
      !isLoadingBanks &&
      selectedMethod &&
      !selectedBank &&
      bankAccounts.length > 0
    ) {
      // Prefer primary bank account, otherwise select the first one
      const primaryBank = bankAccounts.find((bank) => bank.isPrimary);
      setSelectedBank(primaryBank || bankAccounts[0]);
    }
  }, [isLoadingBanks, selectedMethod, selectedBank, bankAccounts]);

  // Auto-select bank when method is pre-selected (UPI)
  useEffect(() => {
    if (selectedMethod === "upi" && !selectedBank && bankAccounts.length > 0) {
      const primaryBank = bankAccounts.find((bank) => bank.isPrimary);
      setSelectedBank(primaryBank || bankAccounts[0]);
    }
  }, [selectedMethod, selectedBank, bankAccounts]);

  if (cart == null || cart.length === 0) {
    return <Redirect href="/(tabs)" />;
  }

  // Check if banks are available when any payment method is selected
  // Keep selected bank across payment method changes since both need it

  const buyOrdersAmount = cart
    .filter((item) => item.type === "buy")
    .reduce((acc, item) => acc + item.amount, 0);

  const sipOrdersAmount = cart
    .filter((item) => item.type === "sip")
    .reduce((acc, item) => acc + item.amount, 0);

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    // Check if banks are available before selecting any payment method
    if (!isLoadingBanks && bankAccounts.length === 0) {
      const methodName = method === "upi" ? "UPI" : "net banking";
      Alert.alert(
        "No Bank Account",
        `Please add a bank account to use ${methodName}.`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Add Bank Account",
            onPress: () => router.push("/bank-accounts"),
          },
        ]
      );
      return;
    }
    setSelectedMethod(method);
    setPaymentError(null);

    // Auto-select bank account if available and none is selected
    if (!selectedBank && bankAccounts.length > 0) {
      const primaryBank = bankAccounts.find((bank) => bank.isPrimary);
      setSelectedBank(primaryBank || bankAccounts[0]);
    }
  };

  const handleConfirmOrder = async () => {
    if (!selectedMethod) {
      Alert.alert("Error", "Please select a payment method");
      return;
    }

    if (!selectedBank) {
      Alert.alert("Error", "Please select a bank account");
      return;
    }

    if (!cart || cart.length === 0) {
      Alert.alert("Error", "No orders found to process payment.");
      return;
    }

    setPaymentError(null);
    setIsProcessing(true);

    try {
      const paymentMethod =
        selectedMethod === "netbanking" ? "net_banking" : "upi";

      const payment = await createPaymentMutation.mutateAsync({
        orders: cart,
        paymentOption: {
          payment_method: paymentMethod,
          bank_id: selectedBank.id,
        },
      });

      router.replace({ pathname: `/payment/${payment.id}/verify` });
    } catch (error: any) {
      const status = error?.response?.status;
      let message: string;

      if (status === 401) {
        message = "Your session has expired. Please log in again.";
      } else if (status === 403) {
        message = "You don't have permission to do this. Contact support if the issue persists.";
      } else if (status === 404) {
        message = "Payment service unavailable. Please try again later.";
      } else if (status >= 500) {
        message = "Something went wrong on our end. Please try again in a moment.";
      } else {
        message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to process payment. Please try again.";
      }

      setPaymentError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color="#1F2937" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <ThemedText style={styles.headerTitle}>
                Complete Your Payment
              </ThemedText>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Payment Methods Section */}
          <View style={styles.section}>
            <SectionHeader label="CHOOSE A PAYMENT METHOD" />
            {PAYMENT_METHODS.map((method) => (
              <PaymentMethodRow
                key={method.id}
                method={method}
                selected={
                  selectedMethod === (method.id === "net_banking" ? "netbanking" : "upi")
                }
                onPress={() =>
                  handlePaymentMethodSelect(
                    method.id === "net_banking" ? "netbanking" : "upi"
                  )
                }
              />
            ))}
          </View>

          {/* Bank Selection Section */}
          {selectedMethod && (
            <View style={styles.section}>
              <SectionHeader label="SELECT BANK ACCOUNT" />
              {isLoadingBanks ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#3137D5" />
                  <ThemedText style={styles.loadingText}>
                    Loading banks...
                  </ThemedText>
                </View>
              ) : bankAccounts.length > 0 ? (
                <View style={styles.bankChipsRow}>
                  {bankAccounts.map((bankAccount, index) => (
                    <BankAccountChip
                      key={bankAccount.id || index}
                      bank={bankAccount}
                      selected={selectedBank?.id === bankAccount.id}
                      onPress={() => setSelectedBank(bankAccount)}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="card-outline"
                    size={48}
                    color="#9CA3AF"
                    style={{ opacity: 0.5 }}
                  />
                  <ThemedText style={styles.emptyText}>
                    No bank accounts available
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.addBankButton}
                    onPress={() => router.push("/bank-accounts")}
                  >
                    <ThemedText style={styles.addBankButtonText}>
                      Add Bank Account
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Payment Steps Section */}
          {(buyOrdersAmount > 0 || sipOrdersAmount > 0) && selectedBank && (
            <View style={styles.section}>
              <SectionHeader label="PAYMENT STEPS" />
              {/* Security Message */}
              <View style={styles.securityBox}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color="#3137D5"
                  style={styles.securityIcon}
                />
                <ThemedText style={styles.securityText}>
                  Each step opens a secure page — complete it and you&apos;ll be brought back here automatically.
                </ThemedText>
              </View>

              <ThemedText style={styles.stepsDescription}>
                {buyOrdersAmount > 0 && sipOrdersAmount > 0
                  ? "Two steps to activate your investment"
                  : "One step to activate your investment"}
              </ThemedText>

              <View style={styles.paymentSteps}>
                {buyOrdersAmount > 0 && (
                  <>
                    <View style={styles.stepCard}>
                      <View style={styles.stepLeft}>
                        <View style={styles.stepIconContainer}>
                          <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
                        </View>
                        {sipOrdersAmount > 0 && <View style={styles.stepConnector} />}
                      </View>
                      <View style={styles.stepContent}>
                        <View style={styles.stepTitleRow}>
                          <ThemedText style={styles.stepTitle}>
                            {sipOrdersAmount > 0 ? "Step 1: " : ""}Pay Now
                          </ThemedText>
                          <View style={styles.pendingBadge}>
                            <ThemedText style={styles.pendingBadgeText}>Pending</ThemedText>
                          </View>
                        </View>
                        <ThemedText style={styles.stepDescription}>
                          One-time lumpsum of{" "}
                          <ThemedText style={styles.stepAmount}>
                            {formatCurrency(buyOrdersAmount)}
                          </ThemedText>
                        </ThemedText>
                      </View>
                    </View>
                  </>
                )}

                {sipOrdersAmount > 0 && (
                  <View style={styles.stepCard}>
                    <View style={styles.stepLeft}>
                      <View style={styles.stepIconContainer}>
                        <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
                      </View>
                    </View>
                    <View style={styles.stepContent}>
                      <View style={styles.stepTitleRow}>
                        <ThemedText style={styles.stepTitle}>
                          {buyOrdersAmount > 0 ? "Step 2: " : ""}Activate SIP
                        </ThemedText>
                        <View style={styles.pendingBadge}>
                          <ThemedText style={styles.pendingBadgeText}>Pending</ThemedText>
                        </View>
                      </View>
                      <ThemedText style={styles.stepDescription}>
                        Allow auto-debit for monthly investments
                      </ThemedText>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Proceed to Pay Button */}
        <View style={[styles.buttonContainer, { paddingBottom: Math.max(bottomInset, 20) }]}>
          {paymentError && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" />
              <ThemedText style={styles.errorBannerText}>{paymentError}</ThemedText>
            </View>
          )}
          <Button
            onPress={handleConfirmOrder}
            disabled={!selectedMethod || !selectedBank || isProcessing}
            size="large"
            status="primary"
            accessoryLeft={() =>
              isProcessing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <></>
              )
            }
            accessoryRight={() =>
              !isProcessing ? (
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              ) : (
                <></>
              )
            }
          >
            {isProcessing ? "Processing..." : "Proceed to Pay"}
          </Button>
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
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 28,
  },
  bankChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  stepsDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 14,
    lineHeight: 18,
  },
  paymentSteps: {
    gap: 0,
  },
  stepCard: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepLeft: {
    alignItems: "center",
    marginRight: 14,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3137D5",
    justifyContent: "center",
    alignItems: "center",
  },
  stepConnector: {
    width: 2,
    flex: 1,
    minHeight: 20,
    backgroundColor: "#E0E0E0",
    marginVertical: 4,
    borderRadius: 1,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 20,
  },
  stepTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  pendingBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#D97706",
  },
  stepDescription: {
    fontSize: 13,
    color: "#9CA3AF",
    lineHeight: 18,
  },
  stepAmount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  securityBox: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  securityIcon: {
    marginRight: 10,
  },
  securityText: {
    fontSize: 13,
    color: "#3137D5",
    lineHeight: 18,
    flex: 1,
    fontWeight: "500",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginLeft: 12,
    color: "#6B7280",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 24,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },
  emptyText: {
    marginTop: 12,
    marginBottom: 16,
    color: "#6B7280",
    textAlign: "center",
    fontSize: 14,
  },
  addBankButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#2563EB",
  },
  addBankButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
    gap: 10,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: "#DC2626",
    lineHeight: 18,
  },
});
