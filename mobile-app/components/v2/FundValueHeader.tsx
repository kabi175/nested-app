import { useChildren } from "@/hooks/useChildren";
import { useEducationGoals } from "@/hooks/useGoals";
import { Child } from "@/types/child";
import { Goal } from "@/types/investment";
import { TrendingDown, TrendingUp } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

// ─── Helpers ────────────────────────────────────────────────────────────────
function getAge(dateOfBirth: Date): number {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  ) {
    age--;
  }
  return age;
}

function formatAmount(amount: number): string {
  if (amount >= 10_00_000) {
    const l = amount / 1_00_000;
    return `₹${Number.isInteger(l) ? l : l.toFixed(1)}L`;
  }
  if (amount >= 1_000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }
  return `₹${amount.toFixed(2)}`;
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// ─── Props ──────────────────────────────────────────────────────────────────
interface FundValueHeaderProps {
  /** Override the displayed current fund value */
  currentFundValue?: number;
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function FundValueHeader({ currentFundValue }: FundValueHeaderProps) {
  const { data: children } = useChildren();
  const { data: goals } = useEducationGoals();

  const child: Child | undefined = children?.[0];
  const goal: Goal | undefined = goals?.[0];

  const childName = child?.firstName ?? "—";
  const childAge = child ? getAge(child.dateOfBirth) : 0;
  const goalAmount = goal ? formatAmount(goal.targetAmount) : "—";
  const goalYear = goal ? new Date(goal.targetDate).getFullYear() : "—";
  const monthlyPromise = goals?.map(g => g.monthlySip ?? 0).reduce((a, b) => a + b, 0) ?? 0;

  const currentValue = currentFundValue ?? (goals?.reduce((sum, g) => sum + g.currentAmount, 0) || 0);
  const invested = goals?.reduce((sum, g) => sum + g.investedAmount, 0) || 0;
  const fundValue = currentValue;

  const returnsPercent = invested > 0 ? ((currentValue - invested) / invested) * 100 : null;
  const isPositive = returnsPercent !== null && returnsPercent >= 0;

  return (
    <View>
      {/* ── Frosted card ── */}
      <View style={styles.card}>
        {/* ── Fund value ── */}
        <Text style={styles.eyebrow}>CURRENT FUND VALUE</Text>
        <View style={styles.amountRow}>
          <View style={styles.lockBadge}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
          <Text style={styles.amount}>
            {fundValue === 0 ? "₹0.00" : formatCurrency(fundValue)}
          </Text>
        </View>

        {/* ── Horizontal separator ── */}
        <View style={styles.separator} />

        {/* ── Monthly promise + Growth ── */}
        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statLabel}>MONTHLY PROMISE</Text>
            <Text style={styles.statValue}>
              {monthlyPromise > 0 ? formatCurrency(monthlyPromise) : "—"}
            </Text>
          </View>
          <View style={styles.growthBlock}>
            <Text style={[styles.statLabel, styles.statLabelRight]}>GROWTH</Text>
            <View style={styles.growthRow}>
              {returnsPercent !== null ? (
                <>
                  {isPositive
                    ? <TrendingUp size={16} color="#4ADE80" strokeWidth={2.5} />
                    : <TrendingDown size={16} color="#F87171" strokeWidth={2.5} />}
                  <Text style={[styles.statValue, { color: isPositive ? "#4ADE80" : "#F87171" }]}>
                    {isPositive ? "+" : ""}{returnsPercent.toFixed(1)}%
                  </Text>
                </>
              ) : (
                <Text style={styles.statValue}>—</Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* ── Info chips — outside the card on the blue bg ── */}
      {child && goal && (
        <View style={styles.chipsRow}>
          <Chip label={`${childName} · Age ${childAge}`} />
          <Chip label={`Goal ${goalAmount}`} />
          <Chip label={`${goalYear}`} />
        </View>
      )}
    </View>
  );
}

// ─── Chip ───────────────────────────────────────────────────────────────────
function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <View style={styles.chipDot} />
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 24,
    padding: 20,
    paddingBottom: 20,
    marginHorizontal: 16,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 1.1,
    marginBottom: 10,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  lockBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  lockIcon: {
    fontSize: 22,
  },
  amount: {
    fontSize: 38,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  growthBlock: {
    alignItems: "flex-end",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  statLabelRight: {
    textAlign: "right",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  growthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});
