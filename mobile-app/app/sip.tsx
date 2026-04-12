import { SipOrder } from "@/api/orders";
import { CancelSipModal } from "@/components/sip/CancelSipModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useCancelSipOrder } from "@/hooks/useCancelSipOrder";
import { useSipOrders } from "@/hooks/useSipOrders";
import { formatCurrency } from "@/utils/formatters";
import { router } from "expo-router";
import { ArrowLeft, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatScheduledDate(
  scheduledDate?: string,
  frequency?: string
): string {
  if (frequency) {
    return frequency;
  }
  if (scheduledDate) {
    // Parse date and format as "15th every month"
    const date = new Date(scheduledDate);
    const day = date.getDate();
    const suffix =
      day === 1 || day === 21 || day === 31
        ? "st"
        : day === 2 || day === 22
          ? "nd"
          : day === 3 || day === 23
            ? "rd"
            : "th";
    return `${day}${suffix} every month`;
  }
  return "Not scheduled";
}

function getTagColor(type: "SIP" | "STP" | "SWP"): string {
  switch (type) {
    case "SIP":
      return "#DBEAFE";
    case "STP":
      return "#D1FAE5";
    case "SWP":
      return "#FEE2E2";
    default:
      return "#F3F4F6";
  }
}

function getTagTextColor(type: "SIP" | "STP" | "SWP"): string {
  switch (type) {
    case "SIP":
      return "#1E40AF";
    case "STP":
      return "#065F46";
    case "SWP":
      return "#991B1B";
    default:
      return "#374151";
  }
}

export default function SIPScreen() {
  const { data: orders, isLoading } = useSipOrders(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SipOrder | null>(null);
  const cancelMutation = useCancelSipOrder();

  const displayOrders = orders && Array.isArray(orders) ? orders : [];

  const handleCancelPress = (order: SipOrder) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedOrder) return;
    try {
      await cancelMutation.mutateAsync({
        sipOrderId: selectedOrder.order_id,
        cancellationCode: "investment_returns_not_as_expected",
      });
      setShowCancelModal(false);
      setSelectedOrder(null);
    } catch {
      Alert.alert("Error", "Failed to cancel SIP. Please try again.");
    }
  };

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>
          View and Manage active SIP
        </ThemedText>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Orders Card */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : displayOrders.length === 0 ? (
          <ThemedView style={styles.emptyCard}>
            <ThemedText style={styles.emptyText}>No orders found</ThemedText>
          </ThemedView>
        ) : (
          <ThemedView style={styles.ordersCard}>
            <ThemedText style={styles.ordersCardTitle}>Active Orders</ThemedText>
            {displayOrders.map((order: SipOrder, index: number) => (
              <View
                key={order.id}
                style={[
                  styles.orderItem,
                  index === displayOrders.length - 1 && styles.orderItemLast,
                ]}
              >
                <View style={styles.orderItemHeader}>
                  <ThemedText style={styles.fundName}>
                    {order.fund_name}
                  </ThemedText>
                  <TouchableOpacity
                    onPress={() => handleCancelPress(order)}
                    style={styles.cancelButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                <ThemedText style={styles.scheduledDate}>
                  {formatScheduledDate(order.scheduled_date, order.frequency)}
                </ThemedText>
                <View style={styles.tagsContainer}>
                  <View
                    style={[
                      styles.tag,
                      {
                        backgroundColor: getTagColor(order.type),
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.tagText,
                        { color: getTagTextColor(order.type) },
                      ]}
                    >
                      {order.type}
                    </ThemedText>
                  </View>
                  <View style={[styles.tag, styles.amountTag]}>
                    <ThemedText style={styles.tagText}>
                      {formatCurrency(order.amount)}
                    </ThemedText>
                  </View>
                </View>
              </View>
            ))}
          </ThemedView>
        )}
      </ScrollView>

      <CancelSipModal
        visible={showCancelModal}
        sipOrder={selectedOrder}
        onConfirm={handleCancelConfirm}
        onCancel={() => {
          setShowCancelModal(false);
          setSelectedOrder(null);
        }}
        isSubmitting={cancelMutation.isPending}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
  ordersCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ordersCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  orderItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  orderItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cancelButton: {
    padding: 4,
  },
  orderItemLast: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  fundName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  scheduledDate: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
  },
  amountTag: {
    backgroundColor: "#F3F4F6",
  },
  frequencyTag: {
    backgroundColor: "#F3F4F6",
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
});
