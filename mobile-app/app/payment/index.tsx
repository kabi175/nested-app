import { cartAtom } from "@/atoms/cart";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { formatCurrency } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { useAtomValue } from "jotai";
import { useState } from "react";
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
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");
  const cardBackground = useThemeColor(
    { light: "#f8f9fa", dark: "#2a2a2a" },
    "background"
  );

  const buyOrdersAmount = cart
    .filter((item) => item.type === "buy")
    .reduce((acc, item) => acc + item.amount, 0);

  const sipOrdersAmount = cart
    .filter((item) => item.type === "sip")
    .reduce((acc, item) => acc + item.amount, 0);

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  const handleConfirmOrder = async () => {
    if (!selectedMethod) {
      Alert.alert("Error", "Please select a payment method");
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
            method="upi"
            title="UPI"
            description="Pay using UPI ID or QR code"
            icon="phone-portrait-outline"
            isSelected={selectedMethod === "upi"}
          />

          <PaymentMethodCard
            method="netbanking"
            title="Net Banking"
            description="Pay using your bank account"
            icon="card-outline"
            isSelected={selectedMethod === "netbanking"}
          />
        </View>

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
                label="Lump Sum Investment"
                amount={buyOrdersAmount}
              />
            )}
            {sipOrdersAmount > 0 && (
              <OrderSummaryItem label="Monthly SIP" amount={sipOrdersAmount} />
            )}
            <View style={styles.divider} />
            <OrderSummaryItem
              label="Total Amount"
              amount={buyOrdersAmount}
              isTotal={true}
            />
          </View>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            { backgroundColor: tintColor },
            !selectedMethod && styles.disabledButton,
          ]}
          onPress={handleConfirmOrder}
          disabled={!selectedMethod || isProcessing}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <ThemedText style={styles.confirmButtonText}>
              Confirm Order - {formatCurrency(buyOrdersAmount)}
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
});
