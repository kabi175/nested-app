import { Payment, PaymentStatus } from "@/api/paymentAPI";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface SIPAutoDebitCardProps {
  payment: Payment | undefined;
}

type DisplayPhase = PaymentStatus | "loading";

const phaseConfig: Record<DisplayPhase, {
  icon: string;
  iconBg: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  badgeColor: string;
  showSpinner: boolean;
}> = {
  loading: {
    icon: "refresh-outline",
    iconBg: "#3137D5",
    badgeBg: "#EEF0FB", badgeBorder: "#C7CAF0",
    badgeText: "Loading…", badgeColor: "#3137D5",
    showSpinner: true,
  },
  pending: {
    icon: "refresh-outline",
    iconBg: "#3137D5",
    badgeBg: "#EEF0FB", badgeBorder: "#C7CAF0",
    badgeText: "Pending", badgeColor: "#3137D5",
    showSpinner: false,
  },
  submitted: {
    icon: "refresh-outline",
    iconBg: "#3137D5",
    badgeBg: "#EEF0FB", badgeBorder: "#C7CAF0",
    badgeText: "Processing…", badgeColor: "#3137D5",
    showSpinner: true,
  },
  active: {
    icon: "checkmark-circle",
    iconBg: "#22C55E",
    badgeBg: "#DCFCE7", badgeBorder: "#86EFAC",
    badgeText: "Activated ✓", badgeColor: "#16A34A",
    showSpinner: false,
  },
  completed: {
    icon: "checkmark-circle",
    iconBg: "#22C55E",
    badgeBg: "#DCFCE7", badgeBorder: "#86EFAC",
    badgeText: "Activated ✓", badgeColor: "#16A34A",
    showSpinner: false,
  },
  failed: {
    icon: "close-circle",
    iconBg: "#EF4444",
    badgeBg: "#FEF2F2", badgeBorder: "#FECACA",
    badgeText: "Failed", badgeColor: "#DC2626",
    showSpinner: false,
  },
  cancelled: {
    icon: "close-circle",
    iconBg: "#6B7280",
    badgeBg: "#F3F4F6", badgeBorder: "#D1D5DB",
    badgeText: "Cancelled", badgeColor: "#6B7280",
    showSpinner: false,
  },
  not_available: {
    icon: "refresh-outline",
    iconBg: "#D1D5DB",
    badgeBg: "#F3F4F6", badgeBorder: "#E5E7EB",
    badgeText: "N/A", badgeColor: "#9CA3AF",
    showSpinner: false,
  },
  expired: {
    icon: "time-outline",
    iconBg: "#9CA3AF",
    badgeBg: "#F3F4F6", badgeBorder: "#D1D5DB",
    badgeText: "Expired", badgeColor: "#6B7280",
    showSpinner: false,
  },
};

export function SIPAutoDebitCard({ payment }: SIPAutoDebitCardProps) {
  const status: DisplayPhase = payment?.sip_status ?? "loading";
  const cfg = phaseConfig[status] ?? phaseConfig.loading;

  return (
    <View style={[styles.card, status === "not_available" && styles.dimmed]}>
      <View style={styles.row}>
        <View style={[styles.iconContainer, { backgroundColor: cfg.iconBg }]}>
          <Ionicons name={cfg.icon as any} size={20} color="#FFFFFF" />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>Activate SIP</Text>
          <Text style={styles.subtitle}>Allow auto-debit for monthly investments</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: cfg.badgeBg, borderColor: cfg.badgeBorder }]}>
          {cfg.showSpinner && <ActivityIndicator size="small" color={cfg.badgeColor} style={{ marginRight: 4 }} />}
          <Text style={[styles.badgeText, { color: cfg.badgeColor }]}>{cfg.badgeText}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  dimmed: {
    opacity: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
