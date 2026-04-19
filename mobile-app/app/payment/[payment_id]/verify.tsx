import { OtpInput } from "@/components/ui/OtpInput";
import Button from "@/components/v2/Button";
import { useAuthAxios } from "@/hooks/useAuthAxios";
import { usePayment } from "@/hooks/usePayment";
import { useVerifyPayment } from "@/hooks/usePaymentMutations";
import {
  getStoredSessionId,
  setCurrentAction,
  startMfaSession,
  verifyOtp,
  type MfaAction,
} from "@/services/mfaService";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function PaymentVerificationScreen() {
  const { payment_id } = useLocalSearchParams<{ payment_id: string }>();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const api = useAuthAxios();
  const verifyPaymentMutation = useVerifyPayment();
  const [mfaSessionId, setMfaSessionId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { data: payment, isLoading: isLoadingPayment } = usePayment(payment_id);

  useEffect(() => {
    const initializeSession = async () => {
      if (!mfaSessionId && !isLoading) {
        const storedSessionId = await getStoredSessionId();
        if (storedSessionId) {
          setMfaSessionId(storedSessionId);
        } else {
          sendOTP();
        }
      }
    };
    initializeSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendOTP = async () => {
    try {
      setIsLoading(true);
      const action: MfaAction = "MF_BUY";
      await setCurrentAction(action);
      const response = await startMfaSession(action, "SMS", api);

      if (response.mfaSessionId) {
        setMfaSessionId(response.mfaSessionId);
        setResendTimer(15);
      } else {
        const storedSessionId = await getStoredSessionId();
        if (storedSessionId) {
          setMfaSessionId(storedSessionId);
          setResendTimer(15);
        } else {
          throw new Error("Session ID not found in response");
        }
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send OTP. Please try again.");
      try {
        const storedSessionId = await getStoredSessionId();
        if (storedSessionId) setMfaSessionId(storedSessionId);
      } catch { }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      setIsLoading(true);
      setOtpCode("");
      await sendOTP();
      Alert.alert("Success", "OTP has been resent successfully!");
    } catch {
      Alert.alert("Error", "Failed to resend OTP. Please try again.");
      setResendTimer(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndContinue = async () => {
    if (!mfaSessionId || !payment_id) {
      Alert.alert("Error", "Missing verification data. Please try again.");
      return;
    }
    if (otpCode.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP.");
      return;
    }
    try {
      setIsVerifying(true);
      await verifyOtp(mfaSessionId, otpCode, api);
      setIsProcessingPayment(true);
      await verifyPaymentMutation.mutateAsync(payment_id);
      router.replace({ pathname: `/payment/${payment_id}/processing` });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to verify. Please try again.");
    } finally {
      setIsVerifying(false);
      setIsProcessingPayment(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (isLoadingPayment) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#3137D5" />
      </View>
    );
  }

  if (payment == null || payment.verification_status !== "pending") {
    return <Redirect href="/(tabs)" />;
  }

  const isBusy = isVerifying || isProcessingPayment;
  const buttonTitle = isProcessingPayment
    ? "Processing Payment..."
    : isVerifying
      ? "Verifying..."
      : isLoading
        ? "Sending OTP..."
        : "Verify & Continue";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Payment</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Shield Icon */}
        <View style={styles.iconWrapper}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={36} color="#FFFFFF" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          We&apos;ve sent a 6-digit code to your registered mobile number.
        </Text>

        {/* Sending indicator */}
        {!mfaSessionId && isLoading && (
          <View style={styles.sendingRow}>
            <ActivityIndicator size="small" color="#3137D5" />
            <Text style={styles.sendingText}>Sending verification code...</Text>
          </View>
        )}

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          <OtpInput
            length={6}
            onComplete={(otp) => setOtpCode(otp)}
            onChange={(otp) => setOtpCode(otp)}
            disabled={isBusy}
          />
        </View>

        {/* Resend */}
        {resendTimer > 0 ? (
          <View style={styles.timerRow}>
            <View style={styles.timerBadge}>
              <Text style={styles.timerCount}>{resendTimer}</Text>
            </View>
            <Text style={styles.timerLabel}>Resend available in {resendTimer}s</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.resendRow}
            onPress={handleResendOtp}
            disabled={isLoading || !mfaSessionId}
            activeOpacity={0.6}
          >
            <Ionicons
              name="refresh"
              size={15}
              color={isLoading || !mfaSessionId ? "#9CA3AF" : "#3137D5"}
            />
            <Text
              style={[
                styles.resendText,
                (isLoading || !mfaSessionId) && styles.resendTextDisabled,
              ]}
            >
              Resend OTP
            </Text>
          </TouchableOpacity>
        )}

        {/* Security notice */}
        <View style={styles.securityBox}>
          <Ionicons name="shield-checkmark" size={18} color="#92400E" />
          <View style={styles.securityTextWrap}>
            <Text style={styles.securityTitle}>Secure Payment</Text>
            <Text style={styles.securityMessage}>Never share your OTP with anyone.</Text>
          </View>
        </View>
      </ScrollView>

      {/* Button */}
      <View style={[styles.buttonContainer, { paddingBottom: Math.max(bottomInset, 20) }]}>
        <Button
          title={buttonTitle}
          disabled={otpCode.length !== 6 || isBusy || isLoading}
          loading={isBusy}
          onPress={handleVerifyAndContinue}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
    alignItems: "center",
  },
  iconWrapper: {
    marginBottom: 28,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: "#3137D5",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3137D5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 36,
    paddingHorizontal: 8,
  },
  sendingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  sendingText: {
    fontSize: 14,
    color: "#6B7280",
  },
  otpContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 28,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 48,
  },
  timerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EEF0FB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#C7CAF0",
  },
  timerCount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3137D5",
  },
  timerLabel: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 48,
  },
  resendText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3137D5",
  },
  resendTextDisabled: {
    color: "#9CA3AF",
  },
  securityBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#FFFBEB",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
    width: "100%",
  },
  securityTextWrap: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 3,
  },
  securityMessage: {
    fontSize: 12,
    color: "#B45309",
    lineHeight: 18,
  },
  buttonContainer: {
    paddingTop: 16,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
});
