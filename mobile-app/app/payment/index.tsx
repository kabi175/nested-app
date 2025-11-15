import { cartAtom } from "@/atoms/cart";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useBankAccounts } from "@/hooks/useBankAccount";
import { useThemeColor } from "@/hooks/useThemeColor";
import { BankAccount } from "@/types/bank";
import { formatCurrency } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type PaymentMethod = "upi" | "netbanking";

export default function PaymentMethodScreen() {
  const cart = useAtomValue(cartAtom);
  const { data: bankAccounts, isLoading: isLoadingBanks } = useBankAccounts();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  );
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor(
    { light: "#f8f9fa", dark: "#2a2a2a" },
    "background"
  );

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
    if (!isLoadingBanks && bankAccounts && bankAccounts.length === 0) {
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
    if (!selectedBank && bankAccounts && bankAccounts.length > 0) {
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
      bankAccounts &&
      bankAccounts.length > 0
    ) {
      // Prefer primary bank account, otherwise select the first one
      const primaryBank = bankAccounts.find((bank) => bank.isPrimary);
      setSelectedBank(primaryBank || bankAccounts[0]);
    }
  }, [isLoadingBanks, selectedMethod, selectedBank, bankAccounts]);

  const handleConfirmOrder = async () => {
    if (!selectedMethod) {
      Alert.alert("Error", "Please select a payment method");
      return;
    }

    if (!selectedBank) {
      Alert.alert("Error", "Please select a bank account");
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert(
        "Success",
        "Your order has been confirmed! You will receive a payment link shortly.",
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate back or clear cart
            },
          },
        ]
      );
    } catch {
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
  }) => (
    <TouchableOpacity
      style={[
        styles.paymentMethodCard,
        { backgroundColor: cardBackground },
        isSelected && { borderColor: tintColor, borderWidth: 2 },
      ]}
      onPress={() => handlePaymentMethodSelect(method)}
      activeOpacity={0.7}
    >
      <View style={styles.paymentMethodContent}>
        <View
          style={[styles.iconContainer, { backgroundColor: tintColor + "20" }]}
        >
          <Ionicons name={icon as any} size={24} color={tintColor} />
        </View>
        <View style={styles.paymentMethodText}>
          <ThemedText type="subtitle" style={styles.paymentMethodTitle}>
            {title}
          </ThemedText>
          <ThemedText style={styles.paymentMethodDescription}>
            {description}
          </ThemedText>
        </View>
        <View
          style={[
            styles.radioButton,
            isSelected && { backgroundColor: tintColor },
          ]}
        >
          {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
        </View>
      </View>
    </TouchableOpacity>
  );

  const OrderSummaryItem = ({
    label,
    amount,
    isTotal = false,
  }: {
    label: string;
    amount: number;
    isTotal?: boolean;
  }) => (
    <View style={styles.orderSummaryItem}>
      <ThemedText
        style={[styles.orderSummaryLabel, isTotal && styles.totalLabel]}
      >
        {label}
      </ThemedText>
      <ThemedText
        style={[styles.orderSummaryAmount, isTotal && styles.buyOrdersAmount]}
      >
        {formatCurrency(amount)}
      </ThemedText>
    </View>
  );

  const formatAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber;
    return `****${accountNumber.slice(-4)}`;
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const BankAccountCard = ({
    bankAccount,
    isSelected,
  }: {
    bankAccount: BankAccount;
    isSelected: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.bankAccountCard,
        { backgroundColor: cardBackground },
        isSelected && { borderColor: tintColor, borderWidth: 2 },
      ]}
      onPress={() => setSelectedBank(bankAccount)}
      activeOpacity={0.7}
    >
      <View style={styles.bankAccountContent}>
        <View
          style={[styles.iconContainer, { backgroundColor: tintColor + "20" }]}
        >
          <Ionicons name="card" size={24} color={tintColor} />
        </View>
        <View style={styles.bankAccountInfo}>
          <View style={styles.bankAccountHeader}>
            <ThemedText style={styles.bankAccountType}>
              {getTypeLabel(bankAccount.type)} Account
            </ThemedText>
            {bankAccount.isPrimary && (
              <View
                style={[
                  styles.primaryBadge,
                  { backgroundColor: tintColor + "20" },
                ]}
              >
                <ThemedText
                  style={[styles.primaryBadgeText, { color: tintColor }]}
                >
                  Primary
                </ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={styles.bankAccountNumber}>
            {formatAccountNumber(bankAccount.accountNumber)}
          </ThemedText>
          <ThemedText style={styles.bankIfscCode}>
            {bankAccount.ifscCode}
          </ThemedText>
        </View>
        <View
          style={[
            styles.radioButton,
            isSelected && { backgroundColor: tintColor },
          ]}
        >
          {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Payment Method
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Choose how you&apos;d like to pay
          </ThemedText>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Select Payment Method
          </ThemedText>

          <PaymentMethodCard
            key="upi"
            method="upi"
            title="UPI"
            description="Pay using UPI ID or QR code"
            icon="phone-portrait-outline"
            isSelected={selectedMethod === "upi"}
          />

          <PaymentMethodCard
            key="netbanking"
            method="netbanking"
            title="Net Banking"
            description="Pay using your bank account"
            icon="card-outline"
            isSelected={selectedMethod === "netbanking"}
          />
        </View>

        {/* Bank Selection - Show when a payment method is selected */}
        {selectedMethod && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Select Bank Account
            </ThemedText>
            {isLoadingBanks ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={tintColor} />
                <ThemedText style={styles.loadingText}>
                  Loading banks...
                </ThemedText>
              </View>
            ) : bankAccounts && bankAccounts.length > 0 ? (
              bankAccounts.map((bankAccount, index) => (
                <BankAccountCard
                  key={index}
                  bankAccount={bankAccount}
                  isSelected={selectedBank?.id === bankAccount.id}
                />
              ))
            ) : (
              <View
                style={[
                  styles.emptyContainer,
                  { backgroundColor: cardBackground },
                ]}
              >
                <Ionicons
                  name="card-outline"
                  size={48}
                  color={textColor}
                  style={{ opacity: 0.5 }}
                />
                <ThemedText style={styles.emptyText}>
                  No bank accounts available
                </ThemedText>
                <TouchableOpacity
                  style={[styles.addBankButton, { backgroundColor: tintColor }]}
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

        {/* Order Summary */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Order Summary
          </ThemedText>
          <View
            style={[styles.orderSummary, { backgroundColor: cardBackground }]}
          >
            {buyOrdersAmount > 0 && (
              <OrderSummaryItem
                key="lump-sum"
                label="Lump Sum Investment"
                amount={buyOrdersAmount}
              />
            )}
            <View style={styles.divider} />
            {sipOrdersAmount > 0 && (
              <OrderSummaryItem
                key="monthly-sip"
                label="Monthly SIP"
                amount={sipOrdersAmount}
              />
            )}
          </View>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            { backgroundColor: tintColor },
            (!selectedMethod || !selectedBank) && styles.disabledButton,
          ]}
          onPress={handleConfirmOrder}
          disabled={!selectedMethod || !selectedBank || isProcessing}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <ThemedText style={styles.confirmButtonText}>
              Confirm Order
            </ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 20,
    alignItems: "center",
  },
  headerTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    opacity: 0.7,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  paymentMethodCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  paymentMethodContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  paymentMethodText: {
    flex: 1,
  },
  paymentMethodTitle: {
    marginBottom: 4,
  },
  paymentMethodDescription: {
    opacity: 0.7,
    fontSize: 14,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
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
  confirmButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 32,
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  bankAccountCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  bankAccountContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  bankAccountInfo: {
    flex: 1,
    marginLeft: 16,
  },
  bankAccountHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  bankAccountType: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  primaryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  bankAccountNumber: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  bankIfscCode: {
    fontSize: 12,
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginLeft: 12,
    opacity: 0.7,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 24,
    borderRadius: 12,
  },
  emptyText: {
    marginTop: 12,
    marginBottom: 16,
    opacity: 0.7,
    textAlign: "center",
  },
  addBankButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addBankButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
