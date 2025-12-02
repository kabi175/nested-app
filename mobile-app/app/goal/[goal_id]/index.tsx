import { Holding, Transaction } from "@/api/portfolioAPI";
import { goalsForCustomizeAtom } from "@/atoms/goals";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useGoal } from "@/hooks/useGoal";
import {
  usePortfolioHoldings,
  usePortfolioTransactions,
} from "@/hooks/usePortfolio";
import { formatCurrency } from "@/utils/formatters";
import { router, useLocalSearchParams } from "expo-router";
import { useSetAtom } from "jotai";
import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react-native";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TabType = "holdings" | "transactions";

export default function GoalDetailScreen() {
  const { goal_id, tab } = useLocalSearchParams<{
    goal_id: string;
    tab?: string;
  }>();
  const { data: goal, isLoading: goalLoading } = useGoal(goal_id);
  const { data: holdings, isLoading: holdingsLoading } =
    usePortfolioHoldings(goal_id);
  const setGoalsForCustomize = useSetAtom(goalsForCustomizeAtom);
  const [activeTab, setActiveTab] = React.useState<TabType>(
    (tab as TabType) || "holdings"
  );
  const transactionsLoadMoreRef = React.useRef<(() => void) | null>(null);

  // Update tab when route parameter changes
  React.useEffect(() => {
    if (tab && (tab === "holdings" || tab === "transactions")) {
      setActiveTab(tab as TabType);
    }
  }, [tab]);

  // Calculate portfolio summary from holdings
  const portfolioSummary = useMemo(() => {
    if (!holdings || holdings.length === 0) {
      return {
        currentValue: 0,
        investedAmount: 0,
        returnsAmount: 0,
        returnsPercentage: 0,
      };
    }

    const currentValue = holdings.reduce((sum, holding) => {
      const value = Number(holding.current_value) || 0;
      return sum + value;
    }, 0);

    const investedAmount = holdings.reduce((sum, holding) => {
      const value = Number(holding.invested_amount) || 0;
      return sum + value;
    }, 0);

    const returnsAmount = holdings.reduce((sum, holding) => {
      const value = Number(holding.returns_amount) || 0;
      return sum + value;
    }, 0);

    const returnsPercentage =
      investedAmount > 0 ? (returnsAmount / investedAmount) * 100 : 0;

    return {
      currentValue: isNaN(currentValue) ? 0 : currentValue,
      investedAmount: isNaN(investedAmount) ? 0 : investedAmount,
      returnsAmount: isNaN(returnsAmount) ? 0 : returnsAmount,
      returnsPercentage: isNaN(returnsPercentage) ? 0 : returnsPercentage,
    };
  }, [holdings]);

  const isLoading = goalLoading || holdingsLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>
            {goal?.title || "Goal"}
          </ThemedText>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>
          {goal?.title || "Goal"}
        </ThemedText>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          if (activeTab === "transactions" && transactionsLoadMoreRef.current) {
            const { layoutMeasurement, contentOffset, contentSize } =
              event.nativeEvent;
            const paddingToBottom = 200; // Trigger 200px before bottom
            const isCloseToBottom =
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - paddingToBottom;

            if (isCloseToBottom) {
              transactionsLoadMoreRef.current();
            }
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Summary Card */}
        <ThemedView style={styles.summaryCard}>
          <ThemedText style={styles.summaryLabel}>Current Value</ThemedText>
          <ThemedText style={styles.summaryValue}>
            {formatCurrency(portfolioSummary.currentValue)}
          </ThemedText>

          <View style={styles.summaryBottom}>
            <View style={styles.summaryItem}>
              <ThemedText style={styles.summaryItemLabel}>Invested</ThemedText>
              <ThemedText style={styles.summaryItemValue}>
                {formatCurrency(portfolioSummary.investedAmount)}
              </ThemedText>
            </View>

            <View
              style={[
                styles.returnsContainer,
                portfolioSummary.returnsAmount < 0 &&
                  styles.returnsContainerNegative,
              ]}
            >
              <ThemedText style={styles.returnsLabel}>Returns</ThemedText>
              <View style={styles.returnsContent}>
                {portfolioSummary.returnsAmount >= 0 ? (
                  <TrendingUp size={16} color="#10B981" />
                ) : (
                  <TrendingDown size={16} color="#EF4444" />
                )}
                <ThemedText
                  style={[
                    styles.returnsAmount,
                    portfolioSummary.returnsAmount < 0 &&
                      styles.returnsAmountNegative,
                  ]}
                >
                  {portfolioSummary.returnsAmount >= 0 ? "+" : "-"}
                  {formatCurrency(
                    Math.abs(
                      isNaN(portfolioSummary.returnsAmount)
                        ? 0
                        : portfolioSummary.returnsAmount
                    )
                  )}
                </ThemedText>
              </View>
              <ThemedText
                style={[
                  styles.returnsPercentage,
                  portfolioSummary.returnsPercentage < 0 &&
                    styles.returnsPercentageNegative,
                ]}
              >
                {portfolioSummary.returnsPercentage >= 0 ? "+" : ""}
                {isNaN(portfolioSummary.returnsPercentage)
                  ? "0.0"
                  : portfolioSummary.returnsPercentage.toFixed(1)}
                %
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "holdings" && styles.tabActive]}
            onPress={() => setActiveTab("holdings")}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === "holdings" && styles.tabTextActive,
              ]}
            >
              Holdings
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "transactions" && styles.tabActive,
            ]}
            onPress={() => setActiveTab("transactions")}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === "transactions" && styles.tabTextActive,
              ]}
            >
              Transactions
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === "holdings" ? (
          <HoldingsContent goalId={goal_id} holdings={holdings || []} />
        ) : (
          <TransactionsContent
            goalId={goal_id}
            onLoadMoreTrigger={(loadMore) => {
              transactionsLoadMoreRef.current = loadMore;
            }}
          />
        )}

        {/* Invest More Button */}
        <TouchableOpacity
          style={styles.investButton}
          onPress={() => {
            if (goal == null) {
              return;
            }
            // Set the goal in the atom for customize screen
            setGoalsForCustomize([goal]);
            // Navigate to customize screen
            router.push(`/child/${goal.childId}/goal/customize`);
          }}
        >
          <ThemedText style={styles.investButtonText}>Invest More</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Holding Card Component
function HoldingCard({
  holding,
  borderColor,
  index,
  goalId,
}: {
  holding: Holding;
  borderColor: string;
  index: number;
  goalId: string;
}) {
  const returnsPercentage =
    holding.invested_amount > 0
      ? (holding.returns_amount / holding.invested_amount) * 100
      : 0;
  const isNegative = returnsPercentage < 0;

  return (
    <TouchableOpacity
      onPress={() => {
        router.push(`/goal/${goalId}/${holding.fund}`);
      }}
      activeOpacity={0.7}
    >
      <ThemedView
        style={[
          styles.holdingCard,
          { borderLeftColor: borderColor, borderLeftWidth: 4 },
        ]}
      >
        <View style={styles.holdingHeader}>
          <View style={styles.holdingInfo}>
            <ThemedText style={styles.holdingFundName}>
              {holding.fund}
            </ThemedText>
            <ThemedText style={styles.holdingAllocation}>
              {holding.allocation_percentage}% allocation
            </ThemedText>
            <ThemedText style={styles.holdingInvested}>
              Invested: {formatCurrency(holding.invested_amount)}
            </ThemedText>
          </View>
          <View style={styles.holdingValue}>
            <ThemedText style={styles.holdingCurrentValue}>
              {formatCurrency(holding.current_value)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.holdingReturns}>
          <View style={styles.returnsRow}>
            {holding.returns_amount >= 0 ? (
              <TrendingUp size={14} color="#10B981" />
            ) : (
              <TrendingDown size={14} color="#EF4444" />
            )}
            <ThemedText
              style={[
                styles.returnsText,
                isNegative && styles.returnsTextNegative,
              ]}
            >
              {isNegative ? "-" : "+"}
              {Math.abs(returnsPercentage).toFixed(2)}%
            </ThemedText>
          </View>
          <ThemedText
            style={[
              styles.returnsAmountText,
              holding.returns_amount < 0 && styles.returnsAmountTextNegative,
            ]}
          >
            {holding.returns_amount >= 0 ? "+" : "-"}
            {formatCurrency(Math.abs(holding.returns_amount))}
          </ThemedText>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

// Holdings Content Component
function HoldingsContent({
  goalId,
  holdings,
}: {
  goalId: string;
  holdings: Holding[];
}) {
  if (holdings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>No holdings found</ThemedText>
      </View>
    );
  }

  // Generate colors for holdings
  const colors = ["#FBCFE8", "#FEF3C7", "#D1FAE5", "#DBEAFE", "#FCE7F3"];

  return (
    <View style={styles.contentContainer}>
      {holdings.map((holding, index) => {
        const borderColor = colors[index % colors.length];
        return (
          <HoldingCard
            key={holding.fund}
            holding={holding}
            borderColor={borderColor}
            index={index}
            goalId={goalId}
          />
        );
      })}
    </View>
  );
}

// Transactions Content Component
function TransactionsContent({
  goalId,
  onLoadMoreTrigger,
}: {
  goalId: string;
  onLoadMoreTrigger?: (loadMore: () => void) => void;
}) {
  const [currentPage, setCurrentPage] = React.useState(0);
  const [allTransactions, setAllTransactions] = React.useState<Transaction[]>(
    []
  );
  const [hasMore, setHasMore] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);

  const { data: transactions, isLoading } = usePortfolioTransactions(
    goalId,
    currentPage
  );

  // Generate colors for transactions - moved before hooks
  const colors = React.useMemo(
    () => ["#FBCFE8", "#FFE4B5", "#E6E6FA", "#D1FAE5", "#DBEAFE"],
    []
  );

  // Accumulate transactions when new page data arrives
  React.useEffect(() => {
    if (transactions) {
      if (currentPage === 0) {
        // First page - replace all transactions
        setAllTransactions(transactions);
        setHasMore(transactions.length > 0);
      } else {
        // Subsequent pages - append if not empty
        if (transactions.length > 0) {
          setAllTransactions((prev) => [...prev, ...transactions]);
          setHasMore(true);
        } else {
          setHasMore(false);
        }
      }
      setIsLoadingMore(false);
    }
  }, [transactions, currentPage]);

  const handleLoadMore = React.useCallback(() => {
    if (!isLoading && !isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  }, [isLoading, isLoadingMore, hasMore]);

  // Expose loadMore function to parent via callback
  React.useEffect(() => {
    if (onLoadMoreTrigger) {
      onLoadMoreTrigger(handleLoadMore);
    }
  }, [onLoadMoreTrigger, handleLoadMore]);

  const getStatusConfig = React.useCallback((status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return {
          text: "Completed",
          backgroundColor: "#10B981",
          textColor: "#FFFFFF",
        };
      case "in_progress":
        return {
          text: "In Progress",
          backgroundColor: "#F59E0B",
          textColor: "#FFFFFF",
        };
      case "failed":
        return {
          text: "Failed",
          backgroundColor: "#EF4444",
          textColor: "#FFFFFF",
        };
      case "refunded":
        return {
          text: "Refunded",
          backgroundColor: "#6B7280",
          textColor: "#FFFFFF",
        };
      default:
        return {
          text: "Unknown",
          backgroundColor: "#6B7280",
          textColor: "#FFFFFF",
        };
    }
  }, []);

  if (isLoading && currentPage === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!allTransactions || allTransactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>No transactions found</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.contentContainer}>
      {allTransactions.map((transaction, index) => {
        const borderColor = colors[index % colors.length];
        const date = new Date(transaction.executed_at);
        const formattedDate = date.toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        const statusConfig = getStatusConfig(transaction.status || "completed");

        return (
          <ThemedView
            key={`${transaction.fund}-${transaction.executed_at}-${index}`}
            style={[
              styles.transactionCard,
              { borderLeftColor: borderColor, borderLeftWidth: 4 },
            ]}
          >
            <View style={styles.transactionHeader}>
              <View style={styles.transactionLeft}>
                <View style={styles.transactionTypeContainer}>
                  <ThemedText style={styles.transactionType}>
                    {transaction.type}
                  </ThemedText>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusConfig.backgroundColor },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.statusText,
                        { color: statusConfig.textColor },
                      ]}
                    >
                      {statusConfig.text}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.transactionFund}>
                  {transaction.fund}
                </ThemedText>
                <ThemedText style={styles.transactionDate}>
                  {formattedDate}
                </ThemedText>
              </View>
              <View style={styles.transactionRight}>
                <ThemedText style={styles.transactionAmount}>
                  {formatCurrency(transaction.amount)}
                </ThemedText>
              </View>
            </View>
          </ThemedView>
        );
      })}
      {isLoadingMore && (
        <View style={styles.loadMoreContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EDE9FE",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 24,
  },
  summaryBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    minWidth: 0,
  },
  summaryItemLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },
  summaryItemValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  returnsContainer: {
    backgroundColor: "#EDE9FE",
    borderRadius: 8,
    padding: 12,
    alignItems: "flex-end",
    minWidth: 130,
    flexShrink: 0,
  },
  returnsLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },
  returnsContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  returnsAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
    marginLeft: 4,
  },
  returnsPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  returnsContainerNegative: {
    backgroundColor: "#FEE2E2",
  },
  returnsAmountNegative: {
    color: "#EF4444",
  },
  returnsPercentageNegative: {
    color: "#EF4444",
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#1F2937",
  },
  contentContainer: {
    marginBottom: 20,
  },
  holdingCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  holdingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  holdingInfo: {
    flex: 1,
  },
  holdingFundName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  holdingAllocation: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  holdingInvested: {
    fontSize: 12,
    color: "#6B7280",
  },
  holdingValue: {
    alignItems: "flex-end",
  },
  holdingCurrentValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  holdingReturns: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  returnsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  returnsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
    marginLeft: 4,
  },
  returnsAmountText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  returnsTextNegative: {
    color: "#EF4444",
  },
  returnsAmountTextNegative: {
    color: "#EF4444",
  },
  transactionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionLeft: {
    flex: 1,
    marginRight: 16,
  },
  transactionRight: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  transactionTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    textTransform: "uppercase",
  },
  statusBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  transactionFund: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
  },
  loadMoreContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  investButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  investButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
