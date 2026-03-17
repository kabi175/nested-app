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
    <View style={styles.card}>
      {/* ── Fund value ── */}
      <Text style={styles.eyebrow}>CURRENT FUND VALUE</Text>
      <View style={styles.amountRow}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.amount}>
          {fundValue === 0 ? "₹0.00" : formatCurrency(fundValue)}
        </Text>
      </View>

      {/* ── Monthly promise + Growth ── */}
      <View style={styles.statsRow}>
        <View>
          <Text style={styles.statLabel}>MONTHLY PROMISE</Text>
          <Text style={styles.statValue}>
            {monthlyPromise > 0 ? formatCurrency(monthlyPromise) : "—"}
          </Text>
        </View>
        <View style={styles.divider} />
        <View>
          <Text style={styles.statLabel}>GROWTH</Text>
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

      {/* ── Info chips ── */}
      <View style={styles.chipsRow}>
        <Chip dot="#FF8B8B" label={`${childName} · Age ${childAge}`} />
        <Chip dot="#A78BFA" label={`Goal ${goalAmount}`} />
        <Chip dot="#A78BFA" label={`${goalYear}`} />
      </View>
    </View>
  );
}

// ─── Chip ───────────────────────────────────────────────────────────────────
function Chip({ dot, label }: { dot: string; label: string }) {
  return (
    <View style={styles.chip}>
      <View style={[styles.chipDot, { backgroundColor: dot }]} />
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#5a7df6",
    borderRadius: 24,
    padding: 20,
    paddingBottom: 18,
    marginHorizontal: 16,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  lockIcon: {
    fontSize: 22,
  },
  amount: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 18,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  growthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  chipsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});
