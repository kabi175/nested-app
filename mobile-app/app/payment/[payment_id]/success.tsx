import { usePayment } from "@/hooks/usePayment";
import { logPurchase } from "@/services/metaEvents";
import { logPurchase as logFirebasePurchase } from "@/services/firebaseAnalytics";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
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

const AUTO_REDIRECT_SECONDS = 10;

export default function PaymentSuccessScreen() {
  const { payment_id, type } = useLocalSearchParams<{
    payment_id: string;
    type: "buy" | "sip";
  }>();
  const { bottom: bottomInset } = useSafeAreaInsets();

  const { data: payment, isLoading } = usePayment(payment_id || "");
  const purchaseLoggedRef = useRef(false);
  const [countdown, setCountdown] = useState(AUTO_REDIRECT_SECONDS);

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

  // Auto-redirect countdown
  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // Log analytics once
  useEffect(() => {
    if (!payment_id || !payment || isLoading || purchaseLoggedRef.current) return;
    const isBuyCompleted = payment.buy_status === "completed";
    const isSipCompleted = payment.sip_status === "completed";
    if (isBuyCompleted || isSipCompleted) {
      purchaseLoggedRef.current = true;
      const amount = (payment as { amount?: number }).amount ?? 0;
      const contentType =
        isBuyCompleted && isSipCompleted ? "buy_sip" : isBuyCompleted ? "buy" : "sip";
      logPurchase(amount, "INR", { content_type: contentType });
      logFirebasePurchase({
        transaction_id: payment_id,
        value: amount,
        items: [{ item_id: contentType, item_name: contentType, quantity: 1 }],
      });
    }
  }, [payment_id, payment, isLoading]);

  const handleContinue = () => {
    if (type === "buy" && payment?.sip_status === "pending") {
      router.replace({
        pathname: `/payment/${payment_id}/processing`,
        params: { paymentId: payment_id },
      });
      return;
    }
    if (type === "sip" && payment?.buy_status === "pending") {
      router.replace({
        pathname: `/payment/${payment_id}/processing`,
        params: { paymentId: payment_id },
      });
      return;
    }
    router.replace("/(tabs)");
  };

  const paymentType = useMemo((): "buy" | "sip" | undefined => {
    if (type) return type;
    if (payment) {
      if (payment.buy_status === "completed") return "buy";
      if (payment.sip_status === "completed") return "sip";
    }
    return undefined;
  }, [type, payment]);

  const { label, subtitle } = useMemo(() => {
    if (paymentType === "buy") {
      return { label: "Lumpsum invested", subtitle: "Your one-time investment is being processed." };
    } else if (paymentType === "sip") {
      return { label: "SIP activated", subtitle: "Investments will be debited automatically." };
    }
    return { label: "Payment received", subtitle: "Your payment was processed successfully." };
  }, [paymentType]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.loadingScreen}>
          <ActivityIndicator size="large" color="#22C55E" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />

      {/* Centered content */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.animatedContent,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Check icon */}
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={36} color="#FFFFFF" />
          </View>

          {/* Done */}
          <Text style={styles.doneText}>Done.</Text>

          {/* Label + subtitle */}
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.subtitleText}>{subtitle}</Text>
        </Animated.View>
      </View>

      {/* Bottom */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(bottomInset, 32) }]}>
        <Text style={styles.countdownHint}>Redirecting in {countdown}s</Text>
        <TouchableOpacity onPress={handleContinue} activeOpacity={0.6}>
          <Text style={styles.backLink}>Back to home</Text>
        </TouchableOpacity>
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
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
    shadowColor: "#22C55E",
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
