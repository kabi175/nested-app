import { Holding } from "@/api/portfolioAPI";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { formatCurrency } from "@/utils/formatters";
import { TrendingDown, TrendingUp } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

interface FundDetailCardProps {
  holding: Holding;
  units: number;
  currentNav: number;
  averageNav: number;
  returnsPercentage: number;
  navDate: string;
}

export function FundDetailCard({
  holding,
  units,
  currentNav,
  averageNav,
  returnsPercentage,
  navDate,
}: FundDetailCardProps) {
  const isPositive = holding.returns_amount >= 0;

  return (
    <ThemedView style={styles.mainCard}>
      {/* Profit/Loss Section */}
      <View style={styles.profitLossSection}>
        {isPositive ? (
          <TrendingUp size={24} color="#10B981" />
        ) : (
          <TrendingDown size={24} color="#EF4444" />
        )}
        <ThemedText
          style={[
            styles.profitLossAmount,
            !isPositive && styles.profitLossAmountNegative,
          ]}
        >
          {isPositive ? "+" : "-"}
          {formatCurrency(Math.abs(holding.returns_amount))}
        </ThemedText>
        <ThemedText
          style={[
            styles.profitLossPercentage,
            !isPositive && styles.profitLossPercentageNegative,
          ]}
        >
          {isPositive ? "+" : ""}
          {returnsPercentage.toFixed(2)}% P&L
        </ThemedText>
      </View>

      {/* Value and Investment Section */}
      <View style={styles.valueSection}>
        <View style={styles.valueColumn}>
          <ThemedText style={styles.valueLabel}>Current Value</ThemedText>
          <ThemedText style={styles.valueAmount}>
            {formatCurrency(holding.current_value)}
          </ThemedText>
        </View>
        <View style={styles.valueColumn}>
          <ThemedText style={styles.valueLabel}>Investment</ThemedText>
          <ThemedText style={styles.valueAmount}>
            {formatCurrency(holding.invested_amount)}
          </ThemedText>
        </View>
      </View>

      {/* NAV Section */}
      <View style={styles.navSection}>
        <View style={styles.navColumn}>
          <ThemedText style={styles.navLabel}>Curr. NAV</ThemedText>
          <ThemedText style={styles.navAmount}>
            ₹{currentNav.toFixed(2)}
          </ThemedText>
          <ThemedText style={styles.navDate}>as on {navDate}</ThemedText>
        </View>
        <View style={styles.navColumn}>
          <ThemedText style={styles.navLabel}>Avg. NAV</ThemedText>
          <ThemedText style={styles.navAmount}>
            ₹{averageNav.toFixed(2)}
          </ThemedText>
        </View>
      </View>

      {/* Units Section */}
      <View style={styles.unitsSection}>
        <ThemedText style={styles.unitsLabel}>Units</ThemedText>
        <ThemedText style={styles.unitsAmount}>{units.toFixed(2)}</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  mainCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  profitLossSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  profitLossAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#10B981",
    marginTop: 8,
    marginBottom: 4,
  },
  profitLossAmountNegative: {
    color: "#EF4444",
  },
  profitLossPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  profitLossPercentageNegative: {
    color: "#EF4444",
  },
  valueSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  valueColumn: {
    flex: 1,
  },
  valueLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },
  valueAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  navSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  navColumn: {
    flex: 1,
  },
  navLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },
  navAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  navDate: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  unitsSection: {
    alignItems: "center",
  },
  unitsLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },
  unitsAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
});

