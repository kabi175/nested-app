import { Transaction } from "@/api/portfolioAPI";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { usePortfolioTransactions } from "@/hooks/usePortfolio";
import { formatCurrency } from "@/utils/formatters";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

const BORDER_COLORS = ["#FBCFE8", "#FFE4B5", "#E6E6FA", "#D1FAE5", "#DBEAFE"];

function getStatusConfig(status: Transaction["status"]) {
  switch (status) {
    case "completed": return { text: "Completed", backgroundColor: "#10B981", textColor: "#FFFFFF" };
    case "in_progress":
    case "submitted":
      return { text: "In Progress", backgroundColor: "#F59E0B", textColor: "#FFFFFF" };
    case "failed": return { text: "Failed", backgroundColor: "#EF4444", textColor: "#FFFFFF" };
    case "refunded": return { text: "Refunded", backgroundColor: "#6B7280", textColor: "#FFFFFF" };
    default: return { text: "Unknown", backgroundColor: "#6B7280", textColor: "#FFFFFF" };
  }
}

interface GoalTransactionsListProps {
  goalId: string;
  onLoadMoreTrigger?: (loadMore: () => void) => void;
}

export default function GoalTransactionsList({ goalId, onLoadMoreTrigger }: GoalTransactionsListProps) {
  const [currentPage, setCurrentPage] = React.useState(0);
  const [allTransactions, setAllTransactions] = React.useState<Transaction[]>([]);
  const [hasMore, setHasMore] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);

  const { data: transactions, isLoading } = usePortfolioTransactions(goalId, currentPage);

  React.useEffect(() => {
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

  const handleLoadMore = React.useCallback(() => {
    if (!isLoading && !isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  }, [isLoading, isLoadingMore, hasMore]);

  React.useEffect(() => {
    if (onLoadMoreTrigger) onLoadMoreTrigger(handleLoadMore);
  }, [onLoadMoreTrigger, handleLoadMore]);

  if (isLoading && currentPage === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2848F1" />
      </View>
    );
  }

  if (allTransactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>No transactions found</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {allTransactions.map((transaction, index) => {
        const borderColor = BORDER_COLORS[index % BORDER_COLORS.length];
        const formattedDate = new Date(transaction.executed_at).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        const statusConfig = getStatusConfig(transaction.status || "completed");

        return (
          <ThemedView
            key={`${transaction.fund}-${transaction.executed_at}-${index}`}
            style={[styles.transactionCard, { borderLeftColor: borderColor, borderLeftWidth: 4 }]}
          >
            <View style={styles.transactionHeader}>
              <View style={styles.transactionLeft}>
                <View style={styles.transactionTypeContainer}>
                  <ThemedText style={styles.transactionType}>{transaction.type}</ThemedText>
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.backgroundColor }]}>
                    <ThemedText style={[styles.statusText, { color: statusConfig.textColor }]}>
                      {statusConfig.text}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.transactionFund}>{transaction.fund}</ThemedText>
                <ThemedText style={styles.transactionDate}>{formattedDate}</ThemedText>
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
          <ActivityIndicator size="small" color="#2848F1" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
  },
  list: {
    gap: 12,
  },
  transactionCard: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
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
  loadMoreContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
