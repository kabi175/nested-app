import { ThemedText } from "@/components/ThemedText";
import { StyleSheet, View } from "react-native";
import { getIconComponent, type FundIconType } from "./fundIcons";

interface FundCardProps {
  fundName: string;
  percentage: string;
  cagr: string;
  expenseRatio: string;
  accentColor: string;
  icon: FundIconType;
}

export function FundCard({
  fundName,
  percentage,
  cagr,
  expenseRatio,
  accentColor,
  icon,
}: FundCardProps) {
  const renderIcon = () => {
    const IconComponent = getIconComponent(icon);
    const iconSize = 24;
    return <IconComponent size={iconSize} color={accentColor} />;
  };

  return (
    <View style={styles.card}>
      <View style={styles.leftBarContainer}>
        <View style={styles.leftBarGray} />
        <View
          style={[styles.leftBarAccent, { backgroundColor: accentColor }]}
        />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.leftSection}>
          <View style={[styles.iconContainer, { borderColor: accentColor }]}>
            {renderIcon()}
          </View>
          <View style={styles.fundInfo}>
            <ThemedText style={styles.fundName}>{fundName}</ThemedText>
            <ThemedText style={styles.cagr}>{cagr}</ThemedText>
            <View style={styles.divider} />
            <ThemedText style={styles.expenseRatio}>{expenseRatio}</ThemedText>
          </View>
        </View>
        <View style={styles.rightSection}>
          <ThemedText style={[styles.percentage, { color: accentColor }]}>
            {percentage}
          </ThemedText>
          <ThemedText style={styles.portfolioLabel}>of portfolio</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    flexDirection: "row",
    minHeight: 130,
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  leftBarContainer: {
    width: 4,
    position: "relative",
  },
  leftBarGray: {
    width: 4,
    flex: 1,
    backgroundColor: "#E5E7EB",
  },
  leftBarAccent: {
    width: 4,
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    padding: 16,
    paddingLeft: 20,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  leftSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingRight: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    backgroundColor: "transparent",
    flexShrink: 0,
  },
  fundInfo: {
    flex: 1,
  },
  fundName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    lineHeight: 22,
  },
  cagr: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
    width: "100%",
  },
  expenseRatio: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  rightSection: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingTop: 0,
    flexShrink: 0,
    marginLeft: 12,
  },
  percentage: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
    lineHeight: 28,
  },
  portfolioLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    lineHeight: 16,
  },
});
