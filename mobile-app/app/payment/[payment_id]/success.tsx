import { ThemedText } from "@/components/ThemedText";
import { usePayment } from "@/hooks/usePayment";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentSuccessScreen() {
  const { payment_id, type } = useLocalSearchParams<{
    payment_id: string;
    type: "buy" | "sip";
  }>();

  const { data: payment, isLoading } = usePayment(payment_id || "");

  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = () => {
    if (type === "buy" && payment?.sip_status === "pending") {
      router.replace({
        pathname: "/payment/processing",
        params: {
          paymentId: payment_id,
        },
      });
      return;
    }

    if (type === "sip" && payment?.buy_status === "pending") {
      router.replace({
        pathname: "/payment/processing",
        params: {
          paymentId: payment_id,
        },
      });
      return;
    }

    router.replace("/(tabs)/child");
  };

  // Determine success message based on type
  // If type is not provided, infer from payment status
  const paymentType = useMemo((): "buy" | "sip" | undefined => {
    if (type) return type;
    if (payment) {
      if (payment.buy_status === "completed") return "buy";
      if (payment.sip_status === "completed") return "sip";
    }
    return undefined;
  }, [type, payment]);

  const { title, subtitle } = useMemo(() => {
    if (paymentType === "buy") {
      return {
        title: "Lumpsum Payment Successful!",
        subtitle:
          "Your one-time investment has been processed successfully. Your portfolio will be updated shortly.",
      };
    } else if (paymentType === "sip") {
      return {
        title: "SIP Mandate Created Successfully!",
        subtitle:
          "Your Systematic Investment Plan has been set up. Your investments will be processed automatically as per the schedule.",
      };
    }
    return {
      title: "Payment Successful!",
      subtitle: "Your payment has been processed successfully.",
    };
  }, [paymentType]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#F0FDF4", "#FFFFFF"]}
        style={styles.gradientBackground}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <CheckCircle size={80} color="#10B981" />
          </View>

          <View style={styles.textContainer}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#10B981", "#059669"]}
              style={styles.buttonGradient}
            >
              <ThemedText style={styles.buttonText}>Continue</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  loadingContainer: {
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
  iconContainer: {
    marginBottom: 40,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  continueButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
