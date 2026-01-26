import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/utils/formatters";
import { Card, Datepicker, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Transaction = {
  status: "in_progress" | "completed" | "failed" | "refunded";
  type: "SIP" | "BUY" | "SELL";
  amount: number;
  units: number;
  fund: string;
  executed_at: Date;
};

const getTransactionTypeLabel = (type: string): string => {
  switch (type) {
    case "BUY":
      return "Buy";
    case "SELL":
      return "Redeem";
    case "SIP":
      return "SIP";
    case "STP":
      return "STP";
    case "SWP":
      return "SWP";
    default:
      return type;
  }
};

const getTransactionTypeColor = (type: string): string => {
  switch (type) {
    case "BUY":
      return "#D1FAE5"; // Light green
    case "SELL":
      return "#FED7AA"; // Light orange
    case "SIP":
      return "#DBEAFE"; // Light blue
    case "STP":
      return "#CCFBF1"; // Light teal
    case "SWP":
      return "#E9D5FF"; // Light purple
    default:
      return "#E5E7EB"; // Light grey
  }
};

const getTransactionTypeTextColor = (type: string): string => {
  switch (type) {
    case "BUY":
      return "#065F46"; // Dark green
    case "SELL":
      return "#9A3412"; // Dark orange
    case "SIP":
      return "#1E40AF"; // Dark blue
    case "STP":
      return "#134E4A"; // Dark teal
    case "SWP":
      return "#6B21A8"; // Dark purple
    default:
      return "#374151"; // Dark grey
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "Processing";
    case "failed":
    case "refunded":
      return "Rejected";
    default:
      return status;
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case "completed":
      return "#D1FAE5"; // Light green
    case "in_progress":
      return "#FEF3C7"; // Light yellow
    case "failed":
    case "refunded":
      return "#FEE2E2"; // Light red
    default:
      return "#E5E7EB"; // Light grey
  }
};

const getStatusTextColor = (status: string): string => {
  switch (status) {
    case "completed":
      return "#065F46"; // Dark green
    case "in_progress":
      return "#92400E"; // Dark yellow
    case "failed":
    case "refunded":
      return "#991B1B"; // Dark red
    default:
      return "#374151"; // Dark grey
  }
};

const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);
  return `${day}-${month}-${year}`;
};

export default function OrdersScreen() {
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(0);

  const { data: transactions, isLoading } = useTransactions(
    currentPage,
    fromDate,
    toDate
  );

  // Reset to page 0 when date filters change
  const handleDateChange = (date: Date | undefined, isFromDate: boolean) => {
    setCurrentPage(0);
    if (isFromDate) {
      setFromDate(date);
    } else {
      setToDate(date);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    // If current page has data, assume there might be a next page
    if (transactions && transactions.length > 0) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const hasNextPage = transactions && transactions.length > 0;
  const hasPreviousPage = currentPage > 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="auto" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#111827" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text category="h5" style={styles.headerTitle}>
          Orders
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Filters */}
        <Card style={styles.dateFilterCard} disabled>
          <View style={styles.dateFilterContainer}>
            <View style={styles.dateFilterItem}>
              <Text category="s1" style={styles.dateLabel}>
                From:
              </Text>
              <Datepicker
                placeholder="dd-mm-yy"
                date={fromDate}
                onSelect={(date) => handleDateChange(date, true)}
                accessoryRight={() => (
                  <CalendarDays size={20} color="#6B7280" />
                )}
                style={styles.datePicker}
                size="medium"
              />
            </View>
            <View style={styles.dateFilterItem}>
              <Text category="s1" style={styles.dateLabel}>
                To:
              </Text>
              <Datepicker
                placeholder="dd-mm-yy"
                date={toDate}
                onSelect={(date) => handleDateChange(date, false)}
                accessoryRight={() => (
                  <CalendarDays size={20} color="#6B7280" />
                )}
                style={styles.datePicker}
                size="medium"
              />
            </View>
          </View>
        </Card>

        {/* Order History */}
        <Card style={styles.orderHistoryCard} disabled>
          <Text category="h6" style={styles.orderHistoryTitle}>
            Order History
          </Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
            </View>
          ) : !transactions || transactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text category="s1" appearance="hint" style={styles.emptyText}>
                No orders found
              </Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {transactions.map((transaction: Transaction, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.transactionItem,
                    index < transactions.length - 1 &&
                    styles.transactionItemBorder,
                  ]}
                >
                  <View style={styles.transactionHeader}>
                    <Text category="s1" style={styles.fundName}>
                      {transaction.fund}
                    </Text>
                  </View>
                  <View style={styles.transactionDetails}>
                    <View style={styles.transactionInfo}>
                      <Text category="c1" appearance="hint" style={styles.date}>
                        {formatDate(transaction.executed_at)}
                      </Text>
                      <Text category="s1" style={styles.amount}>
                        {formatCurrency(transaction.amount)}
                      </Text>
                    </View>
                    <View style={styles.badgesContainer}>
                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor: getTransactionTypeColor(
                              transaction.type
                            ),
                          },
                        ]}
                      >
                        <Text
                          category="c1"
                          style={[
                            styles.badgeText,
                            {
                              color: getTransactionTypeTextColor(
                                transaction.type
                              ),
                            },
                          ]}
                        >
                          {getTransactionTypeLabel(transaction.type)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor: getStatusColor(transaction.status),
                          },
                        ]}
                      >
                        <Text
                          category="c1"
                          style={[
                            styles.badgeText,
                            {
                              color: getStatusTextColor(transaction.status),
                            },
                          ]}
                        >
                          {getStatusLabel(transaction.status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Pagination Controls */}
          {!isLoading && (transactions?.length > 0 || currentPage > 0) && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  !hasPreviousPage && styles.paginationButtonDisabled,
                ]}
                onPress={handlePreviousPage}
                disabled={!hasPreviousPage}
              >
                <ChevronLeft
                  size={20}
                  color={hasPreviousPage ? "#2563EB" : "#9CA3AF"}
                />
                <Text
                  category="s1"
                  style={[
                    styles.paginationButtonText,
                    !hasPreviousPage && styles.paginationButtonTextDisabled,
                  ]}
                >
                  Previous
                </Text>
              </TouchableOpacity>

              <View style={styles.pageIndicator}>
                <Text category="s1" style={styles.pageIndicatorText}>
                  Page {currentPage + 1}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  !hasNextPage && styles.paginationButtonDisabled,
                ]}
                onPress={handleNextPage}
                disabled={!hasNextPage}
              >
                <Text
                  category="s1"
                  style={[
                    styles.paginationButtonText,
                    !hasNextPage && styles.paginationButtonTextDisabled,
                  ]}
                >
                  Next
                </Text>
                <ChevronRight
                  size={20}
                  color={hasNextPage ? "#2563EB" : "#9CA3AF"}
                />
              </TouchableOpacity>
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
    width: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  dateFilterCard: {
    marginBottom: 20,
    borderRadius: 12,
  },
  dateFilterContainer: {
    flexDirection: "row",
    gap: 16,
  },
  dateFilterItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  datePicker: {
    flex: 1,
  },
  orderHistoryCard: {
    borderRadius: 12,
  },
  orderHistoryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
  },
  transactionsList: {
    gap: 0,
  },
  transactionItem: {
    paddingBottom: 16,
    marginBottom: 16,
  },
  transactionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  transactionHeader: {
    marginBottom: 8,
  },
  fundName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  transactionDetails: {
    gap: 8,
  },
  transactionInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 12,
    color: "#6B7280",
  },
  amount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  badgesContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  paginationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    minWidth: 100,
    justifyContent: "center",
  },
  paginationButtonDisabled: {
    backgroundColor: "#F9FAFB",
    opacity: 0.6,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },
  paginationButtonTextDisabled: {
    color: "#9CA3AF",
  },
  pageIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pageIndicatorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
});
