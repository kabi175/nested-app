import { Payment, PaymentStatus } from "@/api/paymentAPI";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface OneTimePurchaseCardProps {
  onPress: () => Promise<void>;
  payment: Payment | undefined;
}

export function OneTimePurchaseCard({
  onPress,
  payment,
}: OneTimePurchaseCardProps) {
  const buyStatus: PaymentStatus | "loading" = payment?.buy_status ?? "loading";
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const getStatusConfig = () => {
    switch (buyStatus) {
      case "loading":
        return {
          icon: "cart" as const,
          iconColor: "#FFFFFF",
          iconBgColor: "#2563EB",
          borderColor: "#2563EB",
          statusText: "Processing payment...",
          statusTextColor: "#2563EB",
          showSpinner: true,
          disabled: false,
        };
      case "pending":
        return {
          icon: "cart" as const,
          iconColor: "#FFFFFF",
          iconBgColor: "#2563EB",
          borderColor: "#2563EB",
          statusText: "Click here to authorize the payment",
          statusTextColor: "#2563EB",
          showSpinner: false,
          disabled: false,
        };
      case "submitted":
        return {
          icon: "time-outline" as const,
          iconColor: "#FFFFFF",
          iconBgColor: "#F59E0B",
          borderColor: "#F59E0B",
          statusText: "Payment submitted",
          statusTextColor: "#F59E0B",
          showSpinner: false,
          disabled: true,
        };
      case "completed":
        return {
          icon: "checkmark-circle" as const,
          iconColor: "#FFFFFF",
          iconBgColor: "#10B981",
          borderColor: "#10B981",
          statusText: "Payment completed",
          statusTextColor: "#10B981",
          showSpinner: false,
          disabled: true,
        };
      case "failed":
        return {
          icon: "close-circle" as const,
          iconColor: "#FFFFFF",
          iconBgColor: "#EF4444",
          borderColor: "#EF4444",
          statusText: "Payment failed",
          statusTextColor: "#EF4444",
          showSpinner: false,
          disabled: false,
        };
      case "cancelled":
        return {
          icon: "close-circle" as const,
          iconColor: "#FFFFFF",
          iconBgColor: "#6B7280",
          borderColor: "#6B7280",
          statusText: "Payment cancelled",
          statusTextColor: "#6B7280",
          showSpinner: false,
          disabled: false,
        };
      case "not_available":
        return {
          icon: "close-circle" as const,
          iconColor: "#FFFFFF",
          iconBgColor: "#6B7280",
          borderColor: "#6B7280",
          statusText: "Payment not available",
          statusTextColor: "#6B7280",
          showSpinner: false,
          disabled: false,
        };
      default:
        return {
          icon: "cart" as const,
          iconColor: "#FFFFFF",
          iconBgColor: "#2563EB",
          borderColor: "#2563EB",
          statusText: "Processing payment...",
          statusTextColor: "#2563EB",
          showSpinner: true,
          disabled: false,
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <TouchableOpacity
      style={[
        styles.stepCard,
        { borderColor: statusConfig.borderColor },
        statusConfig.disabled && styles.disabledCard,
      ]}
      onPress={async () => {
        setIsAuthorizing(true);
        await onPress();
        setIsAuthorizing(false);
      }}
      activeOpacity={statusConfig.disabled ? 1 : 0.9}
      disabled={statusConfig.disabled}
    >
      <View style={styles.stepContent}>
        <View style={styles.stepLeft}>
          <View
            style={[
              styles.stepIconContainer,
              { backgroundColor: statusConfig.iconBgColor },
            ]}
          >
            <Ionicons
              name={statusConfig.icon}
              size={20}
              color={statusConfig.iconColor}
            />
          </View>
          <View style={styles.stepDetails}>
            <ThemedText style={styles.stepTitle}>One-time Purchase</ThemedText>
            <ThemedText style={styles.stepSubtitle}>
              Payment for mutual fund
            </ThemedText>
            <View style={styles.processingContainer}>
              {(statusConfig.showSpinner || isAuthorizing) && (
                <ActivityIndicator
                  size="small"
                  color={statusConfig.statusTextColor}
                />
              )}
              <ThemedText
                style={[
                  styles.processingText,
                  { color: statusConfig.statusTextColor },
                ]}
              >
                {statusConfig.statusText}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  },
  disabledCard: {
    opacity: 0.7,
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
});
