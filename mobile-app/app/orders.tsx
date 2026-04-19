import { Transaction } from "@/api/orders";
import { useChildren } from "@/hooks/useChildren";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/utils/formatters";
import { Datepicker, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, CalendarDays, CheckCircle, Clock, RotateCcw, XCircle } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  unstable_batchedUpdates,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type StatusConfig = {
  label: string;
  color: string;
  bg: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
};

const getStatusConfig = (status: string): StatusConfig => {
  switch (status) {
    case "completed":
      return { label: "Successful", color: "#16A34A", bg: "#DCFCE7", Icon: CheckCircle };
    case "in_progress":
    case "submitted":
      return { label: "In progress", color: "#6B7280", bg: "#F3F4F6", Icon: Clock };
    case "failed":
      return { label: "Failed", color: "#DC2626", bg: "#FEE2E2", Icon: XCircle };
    case "refunded":
      return { label: "Refunded", color: "#D97706", bg: "#FEF3C7", Icon: RotateCcw };
    default:
      return { label: status, color: "#6B7280", bg: "#F3F4F6", Icon: Clock };
  }
};

const getTypeLabel = (type: string): string => {
  switch (type) {
    case "SIP":
      return "Monthly SIP";
    case "BUY":
      return "Lumpsum";
    case "SELL":
      return "Redeem";
    default:
      return type;
  }
};

const formatShortDate = (date: Date): string => {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const getMonthGroupKey = (date: Date): string => {
  return `${date.getFullYear()}-${date.getMonth()}`;
};

const formatMonthHeader = (date: Date): string => {
  const month = date
    .toLocaleDateString("en-IN", { month: "long" })
    .toUpperCase();
  const year = date.getFullYear();
  return `${month}' ${year}`;
};

type MonthGroup = {
  key: string;
  label: string;
  date: Date;
  transactions: Transaction[];
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = getStatusConfig(status);
  const Icon = cfg.Icon;
  return (
    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
      <Icon size={12} color={cfg.color} />
      <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};

const groupByMonth = (transactions: Transaction[]): MonthGroup[] => {
  const map = new Map<string, MonthGroup>();
  for (const tx of transactions) {
    const key = getMonthGroupKey(tx.executed_at);
    if (!map.has(key)) {
      map.set(key, {
        key,
        label: formatMonthHeader(tx.executed_at),
        date: tx.executed_at,
        transactions: [],
      });
    }
    map.get(key)!.transactions.push(tx);
  }
  return Array.from(map.values()).sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );
};

export default function OrdersScreen() {
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>(
    undefined
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data: children } = useChildren();
  const { data: transactions, isLoading } = useTransactions(
    currentPage,
    fromDate,
    toDate,
    selectedChildId
  );

  // Accumulate transactions across pages
  useEffect(() => {
    if (!transactions) return;
    if (currentPage === 0) {
      setAllTransactions(transactions);
      setHasMore(transactions.length > 0);
    } else if (transactions.length > 0) {
      setAllTransactions((prev) => [...prev, ...transactions]);
      setHasMore(true);
    } else {
      setHasMore(false);
    }
    setIsLoadingMore(false);
  }, [transactions, currentPage]);

  // Reset when filters change
  const resetAndFilter = useCallback(
    (childId: string | undefined, from: Date | undefined, to: Date | undefined) => {
      unstable_batchedUpdates(() => {
        setAllTransactions([]);
        setHasMore(true);
        setCurrentPage(0);
        setSelectedChildId(childId);
        setFromDate(from);
        setToDate(to);
      });
    },
    []
  );

  const handleChildSelect = (childId: string | undefined) => {
    resetAndFilter(childId === selectedChildId ? undefined : childId, fromDate, toDate);
  };

  const handleDateChange = (date: Date | undefined, isFromDate: boolean) => {
    resetAndFilter(
      selectedChildId,
      isFromDate ? date : fromDate,
      isFromDate ? toDate : date
    );
  };

  // Scroll-based infinite load
  const scrollViewRef = useRef<ScrollView>(null);
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!hasMore || isLoadingMore || isLoading) return;
      const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
      const isNearBottom =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
      if (isNearBottom) {
        setIsLoadingMore(true);
        setCurrentPage((prev) => prev + 1);
      }
    },
    [hasMore, isLoadingMore, isLoading]
  );

  const monthGroups = groupByMonth(allTransactions);

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
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Member filter tabs */}
        {children && children.length > 0 && (
          <View style={styles.memberTabsRow}>
            {children.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={[
                  styles.memberTab,
                  selectedChildId === child.id && styles.memberTabActive,
                ]}
                onPress={() => handleChildSelect(child.id)}
              >
                <Text
                  category="s1"
                  style={[
                    styles.memberTabText,
                    selectedChildId === child.id && styles.memberTabTextActive,
                  ]}
                >
                  {child.firstName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Date filter row */}
        <View style={styles.dateFilterRow}>
          <Text category="s1" style={styles.dateFromLabel}>
            From
          </Text>
          <View style={styles.dateInputsRow}>
            <Datepicker
              placeholder="dd-mm-yyyy"
              date={fromDate}
              onSelect={(date) => handleDateChange(date, true)}
              accessoryRight={() => <CalendarDays size={18} color="#6B7280" />}
              style={styles.datePicker}
              size="small"
            />
            <Text category="s1" style={styles.dateToText}>
              to
            </Text>
            <Datepicker
              placeholder="dd-mm-yyyy"
              date={toDate}
              onSelect={(date) => handleDateChange(date, false)}
              accessoryRight={() => <CalendarDays size={18} color="#6B7280" />}
              style={styles.datePicker}
              size="small"
            />
          </View>
        </View>

        {/* Transactions */}
        {isLoading && currentPage === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : allTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text category="s1" appearance="hint" style={styles.emptyText}>
              No orders found
            </Text>
          </View>
        ) : (
          monthGroups.map((group) => (
            <View key={group.key}>
              <Text style={styles.monthHeader}>{group.label}</Text>
              {group.transactions.map((tx, index) => (
                <View key={index} style={styles.txCard}>
                  <View style={styles.txLeft}>
                    <Text style={styles.txType}>{getTypeLabel(tx.type)}</Text>
                    {tx.member_name ? (
                      <Text style={styles.txMember}>{tx.member_name}</Text>
                    ) : null}
                    <StatusBadge status={tx.status} />
                  </View>
                  <View style={styles.txRight}>
                    <Text style={[styles.txAmount, tx.status === "failed" && styles.txAmountFailed]}>
                      {tx.status !== "failed" ? "+" : ""}{formatCurrency(tx.amount)}
                    </Text>
                    <Text style={styles.txDate}>
                      {formatShortDate(tx.executed_at)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}

        {/* Load more indicator */}
        {isLoadingMore && (
          <View style={styles.loadMoreContainer}>
            <ActivityIndicator size="small" color="#2563EB" />
          </View>
        )}
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
    paddingBottom: 48,
  },
  // Member tabs
  memberTabsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  memberTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  memberTabActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#6366F1",
  },
  memberTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  memberTabTextActive: {
    color: "#4F46E5",
    fontWeight: "600",
  },
  // Date filter
  dateFilterRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    marginBottom: 24,
  },
  dateFromLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
  },
  dateInputsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  datePicker: {
    flex: 1,
  },
  dateToText: {
    fontSize: 13,
    color: "#6B7280",
  },
  // Empty / loading
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
  },
  // Month group
  monthHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },
  // Transaction card
  txCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  txLeft: {
    flex: 1,
    gap: 4,
  },
  txType: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  txMember: {
    fontSize: 13,
    color: "#6B7280",
  },
  txRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#16A34A",
  },
  txAmountFailed: {
    color: "#DC2626",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  txDate: {
    fontSize: 13,
    color: "#6B7280",
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
