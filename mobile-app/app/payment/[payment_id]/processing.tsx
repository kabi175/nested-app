import Button from "@/components/v2/Button";
import { usePayment } from "@/hooks/usePayment";
import {
  useFetchLumpsumPaymentUrl,
  useFetchMandatePaymentUrl,
} from "@/hooks/usePaymentMutations";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────
type StepPhase =
  | "idle"
  | "opening"
  | "authorizing"
  | "success"
  | "failed"
  | "expired"
  | "not_available";

const TIMER_SECONDS = 600; // 10 minutes

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatTime = (secs: number) =>
  `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;

const timerColor = (secs: number) =>
  secs > 180 ? "#22C55E" : secs > 60 ? "#F59E0B" : "#EF4444";

// ─── Component ────────────────────────────────────────────────────────────────
export default function PaymentProcessingScreen() {
  const { payment_id: paymentId } = useLocalSearchParams<{ payment_id: string }>();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const { data: payment, isLoading, refetch } = usePayment(paymentId);

  const fetchLumpsumUrl = useFetchLumpsumPaymentUrl();
  const fetchMandateUrl = useFetchMandatePaymentUrl();

  // ── Step state ──────────────────────────────────────────────────────────────
  const [sipPhase, setSipPhaseState] = useState<StepPhase>("idle");
  const [buyPhase, setBuyPhaseState] = useState<StepPhase>("idle");
  const [activeStep, setActiveStepState] = useState<"sip" | "buy" | "done">("sip");
  const [timeRemaining, setTimeRemaining] = useState(TIMER_SECONDS);

  // Refs mirror state so callbacks always have fresh values
  const sipPhaseRef = useRef<StepPhase>("idle");
  const buyPhaseRef = useRef<StepPhase>("idle");
  const activeStepRef = useRef<"sip" | "buy" | "done">("sip");
  const paymentRef = useRef(payment);
  const hasStartedRef = useRef(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep paymentRef up to date
  useEffect(() => { paymentRef.current = payment; }, [payment]);

  // Setters that keep refs + state in sync
  const setSipPhase = (p: StepPhase) => { sipPhaseRef.current = p; setSipPhaseState(p); };
  const setBuyPhase = (p: StepPhase) => { buyPhaseRef.current = p; setBuyPhaseState(p); };
  const setActiveStep = (s: "sip" | "buy" | "done") => { activeStepRef.current = s; setActiveStepState(s); };

  // ── Timer helpers ───────────────────────────────────────────────────────────
  const clearTimers = useCallback(() => {
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const startPoll = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => refetch(), 5000);
  }, [refetch]);

  const startCountdown = useCallback((initialSeconds: number, onExpire: () => void) => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    // If already expired, fire immediately
    if (initialSeconds <= 0) {
      setTimeRemaining(0);
      onExpire();
      return;
    }
    setTimeRemaining(initialSeconds);
    countdownRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          countdownRef.current = null;
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  /** Calculates remaining seconds for a step given its submitted_at timestamp. */
  const remainingSeconds = (submittedAt: Date | null): number => {
    if (!submittedAt) return TIMER_SECONDS;
    const elapsed = Math.floor((Date.now() - submittedAt.getTime()) / 1000);
    return Math.max(0, TIMER_SECONDS - elapsed);
  };

  // ── Step launchers ──────────────────────────────────────────────────────────
  const startBuyStep = useCallback(async () => {
    setActiveStep("buy");
    clearTimers();

    const p = paymentRef.current;
    const buyStatus = p?.buy_status;

    console.log("[Processing] startBuyStep", { buyStatus, buy_submitted_at: p?.buy_submitted_at });

    const onExpire = () => {
      setBuyPhase("expired");
      setActiveStep("done");
    };

    if (buyStatus === "pending") {
      // Open URL only when status is pending
      setBuyPhase("opening");
      try {
        const url = await fetchLumpsumUrl.mutateAsync(paymentId!);
        if (url) {
          if (url.startsWith("redirect:nested://")) {
            router.push(url.replace("redirect:nested://", "") as any);
          } else {
            await Linking.openURL(url);
          }
        }
      } catch (e) {
        console.error("Error opening lumpsum URL", e);
      }
      setBuyPhase("authorizing");
      startCountdown(TIMER_SECONDS, onExpire);
    } else if (buyStatus === "submitted") {
      // URL already opened — resume countdown from submitted_at
      setBuyPhase("authorizing");
      const secs = remainingSeconds(p?.buy_submitted_at ?? null);
      startCountdown(secs, onExpire);
    } else if (buyStatus === "expired") {
      setBuyPhase("expired");
      setActiveStep("done");
      return;
    }

    startPoll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId, clearTimers, startCountdown, startPoll]);

  const startSipStep = useCallback(async () => {
    setActiveStep("sip");
    clearTimers();

    const p = paymentRef.current;
    const sipStatus = p?.sip_status;

    console.log("[Processing] startSipStep", { sipStatus, sip_submitted_at: p?.sip_submitted_at });

    const onExpire = () => {
      setSipPhase("expired");
      clearTimers();
      const current = paymentRef.current;
      const buyOk =
        current?.buy_status &&
        current.buy_status !== "not_available" &&
        current.buy_status !== "completed" &&
        current.buy_status !== "active";
      if (buyOk) {
        startBuyStep();
      } else {
        setActiveStep("done");
      }
    };

    if (sipStatus === "pending") {
      // Open URL only when status is pending
      setSipPhase("opening");
      try {
        const url = await fetchMandateUrl.mutateAsync(paymentId!);
        if (url) await Linking.openURL(url);
      } catch (e) {
        console.error("Error opening mandate URL", e);
      }
      setSipPhase("authorizing");
      startCountdown(TIMER_SECONDS, onExpire);
    } else if (sipStatus === "submitted") {
      // URL already opened — resume countdown from submitted_at
      setSipPhase("authorizing");
      const secs = remainingSeconds(p?.sip_submitted_at ?? null);
      startCountdown(secs, onExpire);
    } else if (sipStatus === "expired") {
      setSipPhase("expired");
      clearTimers();
      const current = paymentRef.current;
      const buyOk = current?.buy_status && current.buy_status !== "not_available" && current.buy_status !== "completed" && current.buy_status !== "active";
      if (buyOk) startBuyStep(); else setActiveStep("done");
      return;
    }

    startPoll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId, clearTimers, startCountdown, startPoll, startBuyStep]);

  // ── Initial flow trigger (runs once when payment loads) ─────────────────────
  useEffect(() => {
    if (!payment || hasStartedRef.current) return;
    hasStartedRef.current = true;

    const sipNA = payment.sip_status === "not_available";
    const sipDone = payment.sip_status === "completed" || payment.sip_status === "active";
    const buyNA = payment.buy_status === "not_available";
    const buyDone = payment.buy_status === "completed" || payment.buy_status === "active";

    console.log("[Processing] initial flow", {
      sip_status: payment.sip_status,
      buy_status: payment.buy_status,
      sip_submitted_at: payment.sip_submitted_at,
      buy_submitted_at: payment.buy_submitted_at,
      sipNA, sipDone, buyNA, buyDone,
    });

    if (sipNA || sipDone) {
      setSipPhase(sipNA ? "not_available" : "success");
      if (buyNA || buyDone) {
        console.log("[Processing] → setActiveStep(done)");
        setActiveStep("done");
      } else {
        console.log("[Processing] → startBuyStep()");
        startBuyStep();
      }
    } else {
      console.log("[Processing] → startSipStep()");
      startSipStep();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment]);

  // ── Status watcher (poll / AppState updates) ────────────────────────────────
  useEffect(() => {
    if (!payment) return;
    const step = activeStepRef.current;
    const sp = sipPhaseRef.current;
    const bp = buyPhaseRef.current;

    // SIP step — watch for completion / failure
    if (step === "sip" && sp === "authorizing") {
      if (payment.sip_status === "completed" || payment.sip_status === "active") {
        setSipPhase("success");
        clearTimers();
        setTimeout(() => {
          const p = paymentRef.current;
          if (p?.buy_status && p.buy_status !== "not_available") {
            startBuyStep();
          } else {
            setActiveStep("done");
            router.replace({
              pathname: `/payment/${paymentId}/success` as any,
              params: { type: "sip" },
            });
          }
        }, 1500);
      } else if (
        payment.sip_status === "failed" ||
        payment.sip_status === "cancelled"
      ) {
        setSipPhase("failed");
        clearTimers();
      } else if (payment.sip_status === "expired") {
        setSipPhase("expired");
        clearTimers();
        const current = paymentRef.current;
        const buyOk = current?.buy_status && current.buy_status !== "not_available" && current.buy_status !== "completed" && current.buy_status !== "active";
        if (buyOk) startBuyStep(); else setActiveStep("done");
      }
    }

    // Buy step — watch for completion / failure
    if (step === "buy" && bp === "authorizing") {
      if (payment.buy_status === "completed" || payment.buy_status === "active") {
        setBuyPhase("success");
        clearTimers();
        router.replace({
          pathname: `/payment/${paymentId}/success` as any,
          params: { type: "buy" },
        });
      } else if (
        payment.buy_status === "failed" ||
        payment.buy_status === "cancelled"
      ) {
        setBuyPhase("failed");
        clearTimers();
      } else if (payment.buy_status === "expired") {
        setBuyPhase("expired");
        clearTimers();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment?.sip_status, payment?.buy_status]);

  // ── AppState — immediate refresh when user returns from browser ─────────────
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refetch();
    });
    return () => sub.remove();
  }, [refetch]);

  // ── Cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => () => clearTimers(), [clearTimers]);

  // ─────────────────────────────────────────────────────────────────────────────
  // UI helpers
  // ─────────────────────────────────────────────────────────────────────────────

  const SipStatusPill = () => {
    if (sipPhase === "idle" || sipPhase === "not_available") return null;
    const config: Record<string, { bg: string; border: string; text: string; color: string; icon: string }> = {
      authorizing: { bg: "#EFF6FF", border: "#BFDBFE", text: "SIP in progress", color: "#3137D5", icon: "refresh-outline" },
      success: { bg: "#DCFCE7", border: "#86EFAC", text: "SIP ✓ Activated", color: "#16A34A", icon: "checkmark-circle" },
      failed: { bg: "#FEF2F2", border: "#FECACA", text: "SIP — Failed", color: "#DC2626", icon: "close-circle" },
      expired: { bg: "#F3F4F6", border: "#D1D5DB", text: "SIP — Expired", color: "#6B7280", icon: "time-outline" },
      opening: { bg: "#EFF6FF", border: "#BFDBFE", text: "Opening SIP...", color: "#3137D5", icon: "refresh-outline" },
    };
    const c = config[sipPhase];
    if (!c) return null;
    return (
      <View style={[styles.statusPill, { backgroundColor: c.bg, borderColor: c.border }]}>
        <Ionicons name={c.icon as any} size={14} color={c.color} />
        <Text style={[styles.statusPillText, { color: c.color }]}>{c.text}</Text>
      </View>
    );
  };

  // ─── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingScreen}>
          <ActivityIndicator size="large" color="#3137D5" />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Determine current step display ──────────────────────────────────────────
  const isSipStep = activeStep === "sip";
  const phase = isSipStep ? sipPhase : buyPhase;
  const color = timerColor(timeRemaining);

  console.log("[Processing] render", { activeStep, sipPhase, buyPhase, phase, timeRemaining, isLoading });

  const stepConfig = isSipStep
    ? { icon: "refresh-outline", title: "Activating your SIP", subtitle: "We've opened the authorization page in your browser." }
    : { icon: "cart-outline", title: "Processing your payment", subtitle: "We've opened the payment page in your browser." };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>

      {/* Header — no back button to prevent accidental exit */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Authorize Payments</Text>
      </View>

      <View style={styles.content}>

        {/* SIP status pill — only shown during Buy step */}
        {activeStep === "buy" && (
          <View style={styles.pillRow}>
            <SipStatusPill />
          </View>
        )}

        {/* ── Opening: fetching URL ── */}
        {phase === "opening" && (
          <View style={styles.centerBlock}>
            <ActivityIndicator size="large" color="#3137D5" />
            <Text style={styles.openingText}>Opening payment page…</Text>
          </View>
        )}

        {/* ── Authorizing: countdown ── */}
        {phase === "authorizing" && (
          <View style={styles.centerBlock}>
            <View style={[styles.stepIcon, { backgroundColor: isSipStep ? "#3137D5" : "#3137D5" }]}>
              <Ionicons name={stepConfig.icon as any} size={34} color="#FFFFFF" />
            </View>
            <Text style={styles.stepTitle}>{stepConfig.title}</Text>
            <Text style={styles.stepSubtitle}>{stepConfig.subtitle}</Text>

            {/* Countdown badge */}
            <View style={[styles.timerBadge, { borderColor: color }]}>
              <Ionicons name="time-outline" size={16} color={color} />
              <Text style={[styles.timerText, { color }]}>{formatTime(timeRemaining)}</Text>
              <Text style={[styles.timerLabel, { color }]}>remaining</Text>
            </View>

            {/* Info banner */}
            <View style={styles.infoBanner}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#3137D5" />
              <Text style={styles.infoBannerText}>
                Complete the authorization in your browser, then return here
              </Text>
            </View>
          </View>
        )}

        {/* ── Brief success flash (1.5s, then auto-transitions) ── */}
        {(phase === "success" && activeStep !== "done") && (
          <View style={styles.centerBlock}>
            <View style={[styles.stepIcon, { backgroundColor: "#22C55E" }]}>
              <Ionicons name="checkmark" size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.stepTitle}>
              {isSipStep ? "SIP Activated!" : "Payment Done!"}
            </Text>
            <Text style={styles.stepSubtitle}>Moving to next step…</Text>
          </View>
        )}

        {/* ── Expired ── */}
        {phase === "expired" && activeStep !== "done" && (
          <View style={styles.centerBlock}>
            <View style={[styles.stepIcon, { backgroundColor: "#9CA3AF" }]}>
              <Ionicons name="time-outline" size={34} color="#FFFFFF" />
            </View>
            <Text style={styles.stepTitle}>Time&apos;s up</Text>
            <Text style={styles.stepSubtitle}>
              The 10-minute window expired. Moving to the next step…
            </Text>
            <ActivityIndicator size="small" color="#9CA3AF" style={{ marginTop: 16 }} />
          </View>
        )}

        {/* ── Failed ── */}
        {phase === "failed" && (
          <View style={styles.centerBlock}>
            <View style={[styles.stepIcon, { backgroundColor: "#EF4444" }]}>
              <Ionicons name="close" size={34} color="#FFFFFF" />
            </View>
            <Text style={styles.stepTitle}>
              {isSipStep ? "SIP setup failed" : "Payment failed"}
            </Text>
            <Text style={styles.stepSubtitle}>
              {isSipStep
                ? "Your SIP mandate could not be set up."
                : "Your payment could not be processed."}
            </Text>
            <View style={styles.refundNote}>
              <Text style={styles.refundNoteText}>
                If any amount was debited, it will be refunded in 2–3 business days.
              </Text>
            </View>
          </View>
        )}

        {/* ── All done ── */}
        {activeStep === "done" && phase !== "expired" && (
          <View style={styles.centerBlock}>
            <View style={[styles.stepIcon, { backgroundColor: "#22C55E" }]}>
              <Ionicons name="checkmark" size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.stepTitle}>All done!</Text>
            <Text style={styles.stepSubtitle}>Your investments are being processed.</Text>
          </View>
        )}

        {/* ── All done after expiry ── */}
        {activeStep === "done" && (buyPhase === "expired" || (sipPhase === "expired" && buyPhase === "idle")) && (
          <View style={styles.centerBlock}>
            <View style={[styles.stepIcon, { backgroundColor: "#9CA3AF" }]}>
              <Ionicons name="time-outline" size={34} color="#FFFFFF" />
            </View>
            <Text style={styles.stepTitle}>Session expired</Text>
            <Text style={styles.stepSubtitle}>
              The authorization window closed. You can restart from the portfolio.
            </Text>
          </View>
        )}

      </View>

      {/* Bottom CTA — shown when fully done */}
      {activeStep === "done" && (
        <View style={[styles.footer, { paddingBottom: Math.max(bottomInset, 20) }]}>
          <Button
            title="View Portfolio"
            onPress={() => router.replace("/(tabs)")}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  pillRow: {
    alignItems: "center",
    marginBottom: 28,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: "600",
  },
  centerBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },
  stepIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#3137D5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  stepSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: "#FAFAFA",
    marginBottom: 24,
  },
  timerText: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 1,
    fontVariant: ["tabular-nums"],
  },
  timerLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    width: "100%",
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: "#3137D5",
    lineHeight: 18,
    fontWeight: "500",
  },
  openingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#6B7280",
  },
  refundNote: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
    width: "100%",
    marginTop: 8,
  },
  refundNoteText: {
    fontSize: 13,
    color: "#92400E",
    textAlign: "center",
    lineHeight: 18,
  },
  footer: {
    paddingTop: 16,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
});
