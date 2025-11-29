import { createPayment } from "@/api/paymentAPI";
import { cartAtom } from "@/atoms/cart";
import { ThemedText } from "@/components/ThemedText";
import { useBankAccounts } from "@/hooks/useBankAccount";
import { BankAccount } from "@/types/bank";
import { formatCurrency } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
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

      const payment = await createPayment(cart, {
        payment_method: paymentMethod,
        bank_id: selectedBank.id,
      });

      // Redirect to verification screen
      router.push({
        pathname: "/payment/verify",
        params: {
          paymentId: payment.id,
          paymentMethod: selectedMethod === "upi" ? "UPI" : "Net Banking",
          bankName: getBankNameFromIFSC(selectedBank.ifscCode),
          buyOrdersAmount: buyOrdersAmount.toString(),
        },
      });
    } catch (error) {
      console.error("Failed to create payment", error);
      Alert.alert("Error", "Failed to process payment. Please try again.");
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
            <View style={styles.selectedCheckmark}>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
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
                  {/* Step 1: Complete Purchase */}
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
                              Step 1: Complete Purchase
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

                  {/* Step 2: Setup SIP Auto-Debit */}
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
                            Step 2: Setup SIP Auto-Debit
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
                  <ThemedText style={styles.securityText}>
                    You&apos;ll be redirected to complete each payment step
                    securely
                  </ThemedText>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Proceed to Pay Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.proceedButton,
              (!selectedMethod || !selectedBank) && styles.disabledButton,
            ]}
            onPress={handleConfirmOrder}
            disabled={!selectedMethod || !selectedBank || isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <ThemedText style={styles.proceedButtonText}>
                  Proceed to Pay
                </ThemedText>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#E5E7EB",
  },
  container: {
    flex: 1,
    backgroundColor: "#E5E7EB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  mainCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  paymentMethodsRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "stretch",
  },
  paymentMethodWrapper: {
    flex: 1,
    minWidth: 0,
    alignSelf: "stretch",
  },
  paymentMethodCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    height: 148,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    position: "relative",
  },
  paymentMethodContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
  },
  paymentMethodIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  paymentMethodText: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingTop: 0,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 4,
    textAlign: "center",
    height: 22,
    lineHeight: 22,
  },
  paymentMethodTitleSelected: {
    color: "#FFFFFF",
  },
  paymentMethodDescription: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 16,
    minHeight: 32,
  },
  paymentMethodDescriptionSelected: {
    color: "#FFFFFF",
    opacity: 0.95,
  },
  selectedCheckmark: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    zIndex: 10,
  },
  selectedCheckmarkHidden: {
    opacity: 0,
    pointerEvents: "none",
  },
  bankAccountsScroll: {
    maxHeight: 200,
  },
  bankAccountCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  bankAccountCardSelected: {
    borderColor: "#10B981",
    borderWidth: 2,
  },
  bankAccountContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  bankIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  bankAccountInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  bankAccountNumber: {
    fontSize: 14,
    color: "#6B7280",
  },
  stepsDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  paymentSteps: {
    marginBottom: 16,
  },
  paymentStep: {
    flexDirection: "row",
    marginBottom: 16,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepConnector: {
    width: 2,
    height: 20,
    backgroundColor: "#10B981",
    marginLeft: 20,
    marginBottom: 4,
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginRight: 8,
  },
  pendingBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pendingBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F59E0B",
  },
  stepDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  stepAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
  },
  securityBox: {
    backgroundColor: "#DBEAFE",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  securityText: {
    fontSize: 14,
    color: "#1E40AF",
    lineHeight: 20,
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
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingBottom: 32,
  },
  proceedButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  proceedButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
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
