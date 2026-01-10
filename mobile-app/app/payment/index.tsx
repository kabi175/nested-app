import { cartAtom } from "@/atoms/cart";
import { ThemedText } from "@/components/ThemedText";
import { useBankAccounts } from "@/hooks/useBankAccount";
import { useCreatePayment } from "@/hooks/usePaymentMutations";
import { BankAccount } from "@/types/bank";
import { formatCurrency } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@ui-kitten/components";
import { router } from "expo-router";
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
import { SafeAreaView } from "react-native-safe-area-context";

type PaymentMethod = "upi" | "netbanking";

export default function PaymentMethodScreen() {
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

  const cardBackground = "#FFFFFF";

  // Check if banks are available when any payment method is selected
  // Keep selected bank across payment method changes since both need it

  const buyOrdersAmount = cart
    .filter((item) => item.type === "buy")
    .reduce((acc, item) => acc + item.amount, 0);

  const sipOrdersAmount = cart
    .filter((item) => item.type === "sip")
    .reduce((acc, item) => acc + item.amount, 0);

  // Get bank name from IFSC code
  const getBankNameFromIFSC = (ifsc: string): string => {
    const bankCode = ifsc.substring(0, 4).toUpperCase();
    const bankMap: { [key: string]: string } = {
      AXIS: "Axis Bank",
      HDFC: "HDFC Bank",
      ICIC: "ICICI Bank",
      SBIN: "State Bank of India",
      KOTAK: "Kotak Mahindra Bank",
    };
    return bankMap[bankCode] || `${bankCode} Bank`;
  };

  // Get bank icon color based on bank name
  const getBankIconColor = (bankName: string): string => {
    const colorMap: { [key: string]: string } = {
      "HDFC Bank": "#004C8C",
      "State Bank of India": "#004C8C",
      "ICICI Bank": "#FF6600",
      "Axis Bank": "#8E2DE2",
      "Kotak Mahindra Bank": "#E31837",
    };
    return colorMap[bankName] || "#2563EB";
  };

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

    // Auto-select bank account if available and none is selected
    if (!selectedBank && bankAccounts.length > 0) {
      // Prefer primary bank account, otherwise select the first one
      const primaryBank = bankAccounts.find((bank) => bank.isPrimary);
      setSelectedBank(primaryBank || bankAccounts[0]);
    }
  };

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

      // Redirect to verification screen
      router.replace({
        pathname: "/payment/verify",
        params: {
          paymentId: payment.id,
          paymentMethod: selectedMethod === "upi" ? "UPI" : "Net Banking",
          bankName: getBankNameFromIFSC(selectedBank.ifscCode),
          buyOrdersAmount: buyOrdersAmount.toString(),
        },
      });
    } catch (error: any) {
      console.error("Failed to create payment", error);

      // Extract error message from server response
      let errorMessage = "Failed to process payment. Please try again.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.status === 400) {
        errorMessage = "Invalid payment details. Please check and try again.";
      } else if (error?.response?.status === 401) {
        errorMessage = "Please log in to continue.";
      } else if (error?.response?.status === 403) {
        errorMessage = "You don't have permission to perform this action.";
      } else if (error?.response?.status === 404) {
        errorMessage = "Payment service not found. Please try again later.";
      } else if (error?.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }

      Alert.alert("Error", errorMessage, [{ text: "OK", style: "cancel" }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const PaymentMethodCard = ({
    method,
    title,
    description,
    icon,
    isSelected,
  }: {
    method: PaymentMethod;
    title: string;
    description: string;
    icon: string;
    isSelected: boolean;
  }) => {
    // Get icon container color based on method and selection state
    const getIconContainerColor = () => {
      if (method === "upi") {
        // UPI: green icon container
        return "#10B981";
      } else {
        // Net Banking: lighter blue when selected, grey when not
        return isSelected ? "#60A5FA" : "#F3F4F6";
      }
    };

    // Get card background color
    const getCardBackgroundColor = () => {
      if (isSelected) {
        return method === "upi" ? "#10B981" : "#2563EB";
      }
      return "#FFFFFF";
    };

    // Get border color
    const getBorderColor = () => {
      if (isSelected) {
        return method === "upi" ? "#10B981" : "#2563EB";
      }
      return "#E5E7EB";
    };

    const iconContainerColor = getIconContainerColor();

    return (
      <TouchableOpacity
        style={[
          styles.paymentMethodCard,
          {
            backgroundColor: getCardBackgroundColor(),
            borderColor: getBorderColor(),
          },
        ]}
        onPress={() => handlePaymentMethodSelect(method)}
        activeOpacity={0.7}
      >
        <View style={styles.paymentMethodContent}>
          {/* Checkmark - always rendered to maintain layout consistency */}
          <View
            style={[
              styles.selectedCheckmark,
              !isSelected && styles.selectedCheckmarkHidden,
            ]}
          >
            {isSelected && (
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            )}
          </View>
          <View
            style={[
              styles.paymentMethodIconContainer,
              { backgroundColor: iconContainerColor },
            ]}
          >
            <Ionicons name={icon as any} size={32} color="#FFFFFF" />
          </View>
          <View style={styles.paymentMethodText}>
            <ThemedText
              type="subtitle"
              style={[
                styles.paymentMethodTitle,
                isSelected && styles.paymentMethodTitleSelected,
              ]}
            >
              {title}
            </ThemedText>
            <ThemedText
              style={[
                styles.paymentMethodDescription,
                isSelected && styles.paymentMethodDescriptionSelected,
              ]}
              numberOfLines={2}
            >
              {description}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const formatAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return `****${accountNumber}`;
    return `****${accountNumber.slice(-4)}`;
  };

  const BankAccountCard = ({
    bankAccount,
    isSelected,
  }: {
    bankAccount: BankAccount;
    isSelected: boolean;
  }) => {
    const bankName = getBankNameFromIFSC(bankAccount.ifscCode);
    const iconColor = getBankIconColor(bankName);

    return (
      <TouchableOpacity
        style={[
          styles.bankAccountCard,
          { backgroundColor: cardBackground },
          isSelected && styles.bankAccountCardSelected,
        ]}
        onPress={() => setSelectedBank(bankAccount)}
        activeOpacity={0.7}
      >
        <View style={styles.bankAccountContent}>
          <View
            style={[styles.bankIconContainer, { backgroundColor: iconColor }]}
          >
            <Ionicons name="business" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.bankAccountInfo}>
            <ThemedText style={styles.bankName}>{bankName}</ThemedText>
            <ThemedText style={styles.bankAccountNumber}>
              A/C {formatAccountNumber(bankAccount.accountNumber)}
            </ThemedText>
          </View>
          {isSelected && (
            <View style={styles.bankSelectedCheckmark}>
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
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
          {/* Main White Card */}
          <View style={styles.mainCard}>
            {/* Payment Methods Section */}
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Select Payment Method
              </ThemedText>
              <View style={styles.paymentMethodsRow}>
                <View style={styles.paymentMethodWrapper}>
                  <PaymentMethodCard
                    key="upi"
                    method="upi"
                    title="UPI"
                    description="Pay instantly via UPI"
                    icon="phone-portrait-outline"
                    isSelected={selectedMethod === "upi"}
                  />
                </View>
                <View style={styles.paymentMethodWrapper}>
                  <PaymentMethodCard
                    key="netbanking"
                    method="netbanking"
                    title="Net Banking"
                    description="Pay via Internet Banking"
                    icon="apps-outline"
                    isSelected={selectedMethod === "netbanking"}
                  />
                </View>
              </View>
            </View>

            {/* Bank Selection Section */}
            {selectedMethod && (
              <View style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Select Bank Account
                </ThemedText>
                {isLoadingBanks ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#2563EB" />
                    <ThemedText style={styles.loadingText}>
                      Loading banks...
                    </ThemedText>
                  </View>
                ) : bankAccounts.length > 0 ? (
                  <ScrollView
                    style={styles.bankAccountsScroll}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                  >
                    {bankAccounts.map((bankAccount, index) => (
                      <BankAccountCard
                        key={bankAccount.id || index}
                        bankAccount={bankAccount}
                        isSelected={selectedBank?.id === bankAccount.id}
                      />
                    ))}
                  </ScrollView>
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
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Payment Steps
                </ThemedText>
                <ThemedText style={styles.stepsDescription}>
                  {buyOrdersAmount > 0 && sipOrdersAmount > 0
                    ? "Complete both steps to finish your investment"
                    : "Complete the step to finish your investment"}
                </ThemedText>
                <View style={styles.paymentSteps}>
                  {/* Complete Purchase Step */}
                  {buyOrdersAmount > 0 && (
                    <>
                      <View style={styles.paymentStep}>
                        <View style={styles.stepIconContainer}>
                          <Ionicons
                            name="cart-outline"
                            size={20}
                            color="#FFFFFF"
                          />
                        </View>
                        <View style={styles.stepContent}>
                          <View style={styles.stepHeader}>
                            <ThemedText style={styles.stepTitle}>
                              {buyOrdersAmount > 0 && sipOrdersAmount > 0
                                ? "Step 1: Complete Purchase"
                                : "Step 1: Complete Purchase"}
                            </ThemedText>
                            <View style={styles.pendingBadge}>
                              <ThemedText style={styles.pendingBadgeText}>
                                Pending
                              </ThemedText>
                            </View>
                          </View>
                          <ThemedText style={styles.stepDescription}>
                            One-time payment for{" "}
                            <ThemedText style={styles.stepAmount}>
                              {formatCurrency(buyOrdersAmount)}
                            </ThemedText>
                          </ThemedText>
                        </View>
                      </View>
                      {/* Connector Line */}
                      {buyOrdersAmount > 0 && sipOrdersAmount > 0 && (
                        <View style={styles.stepConnector} />
                      )}
                    </>
                  )}

                  {/* Setup SIP Auto-Debit Step */}
                  {sipOrdersAmount > 0 && (
                    <View style={styles.paymentStep}>
                      <View style={styles.stepIconContainer}>
                        <Ionicons
                          name="refresh-outline"
                          size={20}
                          color="#FFFFFF"
                        />
                      </View>
                      <View style={styles.stepContent}>
                        <View style={styles.stepHeader}>
                          <ThemedText style={styles.stepTitle}>
                            {buyOrdersAmount > 0 && sipOrdersAmount > 0
                              ? "Step 2: Setup SIP Auto-Debit"
                              : "Step 1: Setup SIP Auto-Debit"}
                          </ThemedText>
                          <View style={styles.pendingBadge}>
                            <ThemedText style={styles.pendingBadgeText}>
                              Pending
                            </ThemedText>
                          </View>
                        </View>
                        <ThemedText style={styles.stepDescription}>
                          Authorize recurring payment
                        </ThemedText>
                      </View>
                    </View>
                  )}
                </View>

                {/* Security Message */}
                <View style={styles.securityBox}>
                  <Ionicons
                    name="shield-checkmark"
                    size={20}
                    color="#1E40AF"
                    style={styles.securityIcon}
                  />
                  <ThemedText style={styles.securityText}>
                    You&apos;ll be redirected to complete payment each step
                    securely
                  </ThemedText>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Proceed to Pay Button */}
        <View style={styles.buttonContainer}>
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
    backgroundColor: "#F9FAFB",
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
    padding: 16,
    paddingBottom: 120,
  },
  mainCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  paymentMethodsRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "stretch",
  },
  paymentMethodWrapper: {
    flex: 1,
    minWidth: 0,
    alignSelf: "stretch",
  },
  paymentMethodCard: {
    borderRadius: 16,
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  paymentMethodContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
  },
  paymentMethodIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  paymentMethodText: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingTop: 0,
  },
  paymentMethodTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
    textAlign: "center",
    height: 24,
    lineHeight: 24,
  },
  paymentMethodTitleSelected: {
    color: "#FFFFFF",
  },
  paymentMethodDescription: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
    minHeight: 36,
  },
  paymentMethodDescriptionSelected: {
    color: "#FFFFFF",
    opacity: 0.9,
  },
  selectedCheckmark: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
    zIndex: 10,
  },
  selectedCheckmarkHidden: {
    opacity: 0,
    pointerEvents: "none",
  },
  bankAccountsScroll: {
    maxHeight: 220,
  },
  bankAccountCard: {
    borderRadius: 14,
    marginBottom: 12,
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  bankAccountCardSelected: {
    borderColor: "#10B981",
    borderWidth: 2.5,
    backgroundColor: "#F0FDF4",
  },
  bankAccountContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  bankIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  bankAccountInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 5,
    letterSpacing: -0.2,
  },
  bankAccountNumber: {
    fontSize: 14,
    color: "#6B7280",
    letterSpacing: 0.2,
  },
  stepsDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 18,
    lineHeight: 20,
  },
  paymentSteps: {
    marginBottom: 18,
  },
  paymentStep: {
    flexDirection: "row",
    marginBottom: 18,
  },
  stepIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  stepConnector: {
    width: 2.5,
    height: 24,
    backgroundColor: "#10B981",
    marginLeft: 22,
    marginBottom: 4,
    borderRadius: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginRight: 10,
    letterSpacing: -0.2,
  },
  pendingBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  pendingBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#D97706",
    letterSpacing: 0.2,
  },
  stepDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  stepAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  securityBox: {
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  securityIcon: {
    marginRight: 12,
  },
  securityText: {
    fontSize: 14,
    color: "#1E40AF",
    lineHeight: 20,
    flex: 1,
    fontWeight: "500",
  },
  bankSelectedCheckmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
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
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingBottom: 34,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  proceedButton: {
    borderRadius: 14,
    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  orderSummary: {
    borderRadius: 12,
    padding: 16,
  },
  orderSummaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  orderSummaryLabel: {
    fontSize: 16,
  },
  orderSummaryAmount: {
    fontSize: 16,
    fontWeight: "500",
  },
  totalLabel: {
    fontWeight: "600",
    fontSize: 18,
  },
  buyOrdersAmount: {
    fontWeight: "700",
    fontSize: 18,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 8,
  },
});
