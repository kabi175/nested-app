import { usePayment } from "@/hooks/usePayment";
import { logPurchaseFailed } from "@/services/analytics";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const AUTO_REDIRECT_SECONDS = 5;

export default function PaymentFailureScreen() {
  const { payment_id, type } = useLocalSearchParams<{
    payment_id: string;
    type: "buy" | "sip";
  }>();
  const { bottom: bottomInset } = useSafeAreaInsets();

  const { data: payment, isLoading } = usePayment(payment_id || "");
  const failureLoggedRef = useRef(false);
  const setupDoneRef = useRef(false);
  const navigateFnRef = useRef<(() => void) | null>(null);
  const countdownDurationRef = useRef(AUTO_REDIRECT_SECONDS);

  const [countdown, setCountdown] = useState(AUTO_REDIRECT_SECONDS);
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const [countdownReady, setCountdownReady] = useState(false);

  const [scaleAnim] = useState(new Animated.Value(0.6));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Log analytics once
  useEffect(() => {
    if (!payment_id || !payment || isLoading || failureLoggedRef.current) return;
    const isBuyFailed = payment.buy_status === "failed" || payment.buy_status === "cancelled";
    const isSipFailed = payment.sip_status === "failed" || payment.sip_status === "cancelled";
    if (isBuyFailed || isSipFailed) {
      failureLoggedRef.current = true;
      const amount = (payment as { amount?: number }).amount ?? 0;
      const contentType = isBuyFailed && isSipFailed ? "buy_sip" : isBuyFailed ? "buy" : "sip";
      logPurchaseFailed({ transaction_id: payment_id!, value: amount, content_type: contentType });
    }
  }, [payment_id, payment, isLoading]);

  // Setup — runs once when payment is ready. Captures nav target + duration.
  useEffect(() => {
    if (isLoading || !payment || setupDoneRef.current) return;
    setupDoneRef.current = true;

    // If SIP failed but buy is still actionable → go back to processing
    const hasNextStep =
      (type === "sip" && payment.buy_status === "pending") ||
      (type === "sip" && payment.buy_status === "submitted");

    navigateFnRef.current = () => {
      if (hasNextStep) {
        router.replace(`/payment/${payment_id}/processing` as any);
      } else {
        router.replace("/(tabs)");
      }
    };

    const duration = hasNextStep ? AUTO_REDIRECT_SECONDS : 0; // 0 = no auto-redirect for final failures
    countdownDurationRef.current = duration;
    if (duration > 0) {
      setCountdown(duration);
      setCountdownReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, payment]);

  // Interval — starts exactly once, not tied to payment so refetches can't kill it
  useEffect(() => {
    if (!countdownReady) return;
    const countRef = { current: countdownDurationRef.current };
    const interval = setInterval(() => {
      countRef.current -= 1;
      setCountdown(countRef.current);
      if (countRef.current <= 0) {
        clearInterval(interval);
        setShouldNavigate(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [countdownReady]);

  // Trigger navigation
  useEffect(() => {
    if (shouldNavigate && navigateFnRef.current) {
      navigateFnRef.current();
    }
  }, [shouldNavigate]);

  const hasNextStep =
    (type === "sip" && payment?.buy_status === "pending") ||
    (type === "sip" && payment?.buy_status === "submitted");

  const paymentType = useMemo((): "buy" | "sip" | undefined => {
    if (type) return type;
    if (payment) {
      if (payment.buy_status === "failed" || payment.buy_status === "cancelled") return "buy";
      if (payment.sip_status === "failed" || payment.sip_status === "cancelled") return "sip";
    }
    return undefined;
  }, [type, payment]);

  const { title, subtitle } = useMemo(() => {
    if (paymentType === "sip") {
      return {
        title: "SIP setup failed",
        subtitle: "Your SIP mandate could not be set up.",
      };
    }
    if (paymentType === "buy") {
      return {
        title: "Payment failed",
        subtitle: "Your one-time investment could not be processed.",
      };
    }
    return {
      title: "Payment failed",
      subtitle: "Your payment could not be processed.",
    };
  }, [paymentType]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingScreen}>
          <ActivityIndicator size="large" color="#EF4444" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>

      {/* Centered content */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.animatedContent,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* X icon */}
          <View style={styles.errorCircle}>
            <Ionicons name="close" size={36} color="#FFFFFF" />
          </View>

          <Text style={styles.doneText}>Oops.</Text>
          <Text style={styles.label}>{title}</Text>
          <Text style={styles.subtitleText}>{subtitle}</Text>

          {/* Refund note */}
          <View style={styles.refundNote}>
            <Ionicons name="information-circle-outline" size={15} color="#92400E" />
            <Text style={styles.refundNoteText}>
              If any amount was debited, it will be refunded in 2–3 business days.
            </Text>
          </View>

          {/* Next step hint */}
          {hasNextStep && (
            <View style={styles.nextStepBanner}>
              <Ionicons name="arrow-forward-circle-outline" size={15} color="#3137D5" />
              <Text style={styles.nextStepText}>
                Your lumpsum payment step is still pending.
              </Text>
            </View>
          )}
        </Animated.View>
      </View>

      {/* Bottom */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(bottomInset, 32) }]}>
        {hasNextStep ? (
          <Text style={styles.countdownHint}>Continuing to next step in {countdown}s…</Text>
        ) : (
          <TouchableOpacity onPress={() => router.replace("/(tabs)")} activeOpacity={0.6}>
            <Text style={styles.backLink}>Back to home</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFAF8",
  },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  animatedContent: {
    alignItems: "center",
    width: "100%",
  },
  errorCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  doneText: {
    fontSize: 32,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 18,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  refundNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
    width: "100%",
    marginBottom: 12,
  },
  refundNoteText: {
    flex: 1,
    fontSize: 13,
    color: "#92400E",
    lineHeight: 18,
  },
  nextStepBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#EEF0FB",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#C7CAF0",
    width: "100%",
  },
  nextStepText: {
    flex: 1,
    fontSize: 13,
    color: "#3137D5",
    lineHeight: 18,
    fontWeight: "500",
  },
  bottomContainer: {
    alignItems: "center",
    paddingTop: 16,
    gap: 10,
  },
  countdownHint: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  backLink: {
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
    textDecorationLine: "underline",
  },
});
