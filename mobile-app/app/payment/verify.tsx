import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Animated, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OtpInput } from "@/components/ui/OtpInput";
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
import { Button, Spinner, Text } from "@ui-kitten/components";

export default function PaymentVerificationScreen() {
  const { paymentId, bankName = "Bank" } = useLocalSearchParams<{
    paymentId: string;
    bankName?: string;
  }>();
  const api = useAuthAxios();
  const verifyPaymentMutation = useVerifyPayment();
  const [mfaSessionId, setMfaSessionId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { data: payment } = usePayment(paymentId);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  const paymentMethod = payment?.payment_method;

  // Auto-send OTP when component mounts
  useEffect(() => {
    const initializeSession = async () => {
      console.log("Initializing session", mfaSessionId, isLoading);
      if (!mfaSessionId && !isLoading) {
        // Check if there's a stored session ID first
        const storedSessionId = await getStoredSessionId();
        console.log("Stored session ID:", storedSessionId);
        if (storedSessionId) {
          console.log("Found stored session ID:", storedSessionId);
          setMfaSessionId(storedSessionId);
        } else {
          sendOTP();
        }
      }
    };

    initializeSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendOTP = async () => {
    try {
      setIsLoading(true);
      // Set action for payment verification (using MF_BUY for payment-related actions)
      const action: MfaAction = "MF_BUY";
      await setCurrentAction(action);

      // Start MFA session
      const response = await startMfaSession(action, "SMS", api);
      console.log("MFA session response:", response);

      if (response.mfaSessionId) {
        setMfaSessionId(response.mfaSessionId);
        setResendTimer(30);
      } else {
        // Try to get from SecureStore as fallback
        const storedSessionId = await getStoredSessionId();
        if (storedSessionId) {
          console.log("Using stored session ID:", storedSessionId);
          setMfaSessionId(storedSessionId);
          setResendTimer(30);
        } else {
          throw new Error("Session ID not found in response");
        }
      }
    } catch (error: any) {
      console.error("Error sending OTP", error);
      Alert.alert(
        "Error",
        error.message || "Failed to send OTP. Please try again."
      );
      // Try to get stored session ID as last resort
      try {
        const storedSessionId = await getStoredSessionId();
        if (storedSessionId) {
          console.log("Fallback: Using stored session ID:", storedSessionId);
          setMfaSessionId(storedSessionId);
        }
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (otp: string) => {
    console.log("OTP change", otp, mfaSessionId);
    setOtpCode(otp);
  };

  const handleOtpComplete = (otp: string) => {
    console.log("OTP complete", otp);
    setOtpCode(otp);
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    try {
      setIsLoading(true);
      setOtpCode("");
      await sendOTP();
      Alert.alert("Success", "OTP has been resent successfully!");
    } catch (error) {
      console.log("Resend OTP error", error);
      Alert.alert("Error", "Failed to resend OTP. Please try again.");
      setResendTimer(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndContinue = async () => {
    if (!mfaSessionId || !paymentId) {
      Alert.alert("Error", "Missing verification data. Please try again.");
      return;
    }

    if (otpCode.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setIsVerifying(true);
      // Verify OTP with custom MFA service
      await verifyOtp(mfaSessionId, otpCode, api);

      console.log("MFA verification successful");
      // After MFA verification, verify payment
      setIsProcessingPayment(true);
      await verifyPaymentMutation.mutateAsync(paymentId);

      router.replace({
        pathname: "/payment/processing",
        params: {
          paymentId,
          paymentMethod,
          bankName,
        },
      });
    } catch (error: any) {
      console.error("Verification error", error);
      const errorMessage =
        error.message || "Failed to verify. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsVerifying(false);
      setIsProcessingPayment(false);
    }
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Shield Icon with Gradient */}
            <View style={styles.shieldContainer}>
              <LinearGradient
                colors={["#3B82F6", "#2563EB", "#1D4ED8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.shieldIcon}
              >
                <View style={styles.shieldIconInner}>
                  <Ionicons name="shield-checkmark" size={40} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </View>

            {/* Enter OTP Heading */}
            <Text category="h3" style={styles.otpHeading}>
              Enter OTP
            </Text>

            {/* Subtitle */}
            <Text category="s1" style={styles.subtitle}>
              We&apos;ve sent a 6-digit code to your registered mobile number .
            </Text>

            {/* Loading state while sending OTP */}
            {!mfaSessionId && isLoading && (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingSpinnerWrapper}>
                  <Spinner size="small" status="primary" />
                </View>
                <Text category="s1" style={styles.loadingText}>
                  Sending verification code...
                </Text>
              </View>
            )}

            {/* OTP Input - Always visible, only disabled during verification/processing */}
            <View style={styles.otpContainer}>
              <OtpInput
                length={6}
                onComplete={handleOtpComplete}
                onChange={handleOtpChange}
                disabled={isVerifying || isProcessingPayment}
              />
            </View>

            {/* Button Container - Always visible */}
            <View style={styles.buttonContainer}>
              {/* Submit/Verify Button - Always visible */}
              <Button
                onPress={handleVerifyAndContinue}
                disabled={
                  otpCode.length !== 6 ||
                  isVerifying ||
                  isProcessingPayment ||
                  isLoading
                }
                status="primary"
                size="large"
                style={styles.verifyButton}
                accessoryLeft={() =>
                  !isVerifying && !isProcessingPayment ? (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  ) : (
                    <></>
                  )
                }
                accessoryRight={() =>
                  isVerifying || isProcessingPayment ? (
                    <Spinner size="small" status="control" />
                  ) : (
                    <></>
                  )
                }
              >
                {isProcessingPayment
                  ? "Processing Payment..."
                  : isVerifying
                  ? "Verifying..."
                  : isLoading
                  ? "Sending OTP..."
                  : "Verify & Continue"}
              </Button>

              {/* Resend Button - Always visible */}
              <Button
                onPress={handleResendOtp}
                disabled={resendTimer > 0 || isLoading || !mfaSessionId}
                appearance="ghost"
                status="primary"
                size="medium"
                style={styles.resendButton}
                accessoryLeft={() => (
                  <Ionicons
                    name="refresh"
                    size={16}
                    color={
                      resendTimer > 0 || isLoading || !mfaSessionId
                        ? "#9CA3AF"
                        : "#2563EB"
                    }
                  />
                )}
              >
                Resend OTP{" "}
                {resendTimer > 0 && (
                  <Text style={styles.resendTimerText}>({resendTimer}s)</Text>
                )}
              </Button>
            </View>

            {/* Security Message - Always at bottom */}
            <View style={styles.securityContainer}>
              <View style={styles.securityBox}>
                <View style={styles.securityIconContainer}>
                  <Ionicons name="shield-checkmark" size={18} color="#92400E" />
                </View>
                <View style={styles.securityTextContainer}>
                  <Text category="c2" style={styles.securityTitle}>
                    Secure Payment
                  </Text>
                  <Text category="c2" style={styles.securityMessage}>
                    Never share your OTP with anyone.
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 24,
    paddingBottom: 40,
  },
  contentContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  shieldContainer: {
    alignItems: "center",
    marginBottom: 28,
    marginTop: 4,
  },
  shieldIcon: {
    width: 96,
    height: 96,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  shieldIconInner: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  otpHeading: {
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "700",
    color: "#111827",
    fontSize: 28,
    letterSpacing: -0.5,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 36,
    color: "#6B7280",
    paddingHorizontal: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  otpContainer: {
    marginBottom: 28,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  loadingContainer: {
    alignItems: "center",
    marginBottom: 36,
    marginTop: 12,
    gap: 16,
  },
  loadingSpinnerWrapper: {
    padding: 8,
  },
  loadingText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "500",
  },
  buttonContainer: {
    gap: 20,
    marginTop: 12,
    marginBottom: 28,
  },
  verifyButton: {
    borderRadius: 16,
  },
  resendButton: {},
  resendTimerText: {
    color: "#6B7280",
    fontWeight: "500",
  },
  securityContainer: {
    marginTop: 28,
  },
  securityBox: {
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  securityIconContainer: {
    marginTop: 2,
  },
  securityTextContainer: {
    flex: 1,
  },
  securityTitle: {
    color: "#92400E",
    fontWeight: "700",
    marginBottom: 4,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  securityMessage: {
    color: "#B45309",
    fontSize: 12,
    lineHeight: 18,
  },
});
