import { Ionicons } from "@expo/vector-icons";
import {
  FirebaseAuthTypes,
  getAuth,
  signInWithPhoneNumber,
} from "@react-native-firebase/auth";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { verifyPayment } from "@/api/paymentAPI";
import { OtpInput } from "@/components/ui/OtpInput";
import { useAuth } from "@/hooks/auth";
import { usePayment } from "@/hooks/usePayment";
import { Spinner, Text } from "@ui-kitten/components";

export default function PaymentVerificationScreen() {
  const { paymentId, bankName = "Bank" } = useLocalSearchParams<{
    paymentId: string;
    bankName?: string;
  }>();
  const auth = useAuth();
  const [confirm, setConfirm] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { data: payment } = usePayment(paymentId);

  const paymentMethod = payment?.payment_method;

  // Get user's phone number from auth
  const userPhoneNumber =
    auth.user?.phoneNumber || getAuth().currentUser?.phoneNumber || "";

  // Auto-send OTP when component mounts
  useEffect(() => {
    if (userPhoneNumber && !confirm && !isLoading) {
      sendOTP();
    } else if (!userPhoneNumber && auth.isLoaded) {
      Alert.alert(
        "Error",
        "Phone number not found. Please ensure you're signed in with a phone number.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPhoneNumber, auth.isLoaded]);

  const sendOTP = async () => {
    if (!userPhoneNumber) {
      Alert.alert("Error", "Phone number not found. Please sign in again.");
      router.back();
      return;
    }

    try {
      setIsLoading(true);
      const confirmation = await signInWithPhoneNumber(
        getAuth(),
        userPhoneNumber
      );
      setConfirm(confirmation);
      setResendTimer(30);
    } catch (error) {
      console.log("Error sending OTP", error);
      Alert.alert("Error", "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (otp: string) => {
    setOtpCode(otp);
  };

  const handleOtpComplete = (otp: string) => {
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
    if (!confirm || !paymentId) {
      Alert.alert("Error", "Missing verification data. Please try again.");
      return;
    }

    try {
      setIsVerifying(true);
      // Reauthenticate with Firebase SMS MFA
      await confirm.confirm(otpCode);

      // After Firebase reauth, verify payment
      setIsProcessingPayment(true);
      await verifyPayment(paymentId);

      router.replace({
        pathname: "/payment/processing",
        params: {
          paymentId,
          paymentMethod,
          bankName,
        },
      });

      // Then initiate payment and redirect
    } catch (error: any) {
      console.error("Verification error", error);
      if (error.code === "auth/invalid-verification-code") {
        Alert.alert("Error", "Invalid verification code. Please try again.");
      } else {
        Alert.alert("Error", "Failed to verify. Please try again.");
      }
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
          <View style={styles.contentContainer}>
            {/* Shield Icon */}
            <View style={styles.shieldContainer}>
              <View style={styles.shieldIcon}>
                <Ionicons name="shield" size={48} color="#FFFFFF" />
              </View>
            </View>

            {/* Enter OTP Heading */}
            <Text category="h3" style={styles.otpHeading}>
              Enter OTP
            </Text>

            {/* Subtitle */}
            <Text category="s1" style={styles.subtitle}>
              We&apos;ve sent a 6-digit code to your registered mobile number
              and email.
            </Text>

            {/* Loading state while sending OTP */}
            {!confirm && isLoading && (
              <View style={styles.loadingContainer}>
                <Spinner size="small" status="primary" />
                <Text category="s1" style={styles.loadingText}>
                  Sending verification code...
                </Text>
              </View>
            )}

            {/* OTP Input - shown when confirmed */}
            {confirm && !isLoading && (
              <>
                <View style={styles.otpContainer}>
                  <OtpInput
                    length={6}
                    onComplete={handleOtpComplete}
                    onChange={handleOtpChange}
                    disabled={isVerifying || isProcessingPayment}
                  />
                </View>

                {/* Verify Button */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={handleVerifyAndContinue}
                    disabled={
                      otpCode.length !== 6 || isVerifying || isProcessingPayment
                    }
                    style={[
                      styles.verifyButton,
                      (otpCode.length !== 6 ||
                        isVerifying ||
                        isProcessingPayment) &&
                        styles.verifyButtonDisabled,
                    ]}
                    activeOpacity={0.8}
                  >
                    {!isVerifying && !isProcessingPayment && (
                      <View style={styles.checkmarkCircle}>
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </View>
                    )}
                    {(isVerifying || isProcessingPayment) && (
                      <Spinner size="small" status="control" />
                    )}
                    <Text style={styles.verifyButtonText}>
                      {isProcessingPayment
                        ? "Processing Payment..."
                        : isVerifying
                        ? "Verifying..."
                        : "Verify & Continue"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={resendTimer > 0 || isLoading}
                    style={styles.resendButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.resendButtonText}>
                      Resend OTP{" "}
                      {resendTimer > 0 && (
                        <Text style={styles.resendTimerText}>
                          in {resendTimer}s
                        </Text>
                      )}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Payment Details Section */}
                <View style={styles.paymentDetailsContainer}>
                  <View style={styles.paymentDetailsRow}>
                    <View style={styles.paymentDetailsLeft}>
                      <Text category="s2" style={styles.paymentDetailsLabel}>
                        Payment Method
                      </Text>
                      <Text category="s2" style={styles.paymentDetailsLabel}>
                        Bank
                      </Text>
                    </View>
                    <View style={styles.paymentDetailsRight}>
                      <Text category="s1" style={styles.paymentDetailsValue}>
                        {paymentMethod}
                      </Text>
                      <Text category="s1" style={styles.paymentDetailsValue}>
                        {bankName}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* Security Message - Always at bottom */}
            <View style={styles.securityContainer}>
              <View style={styles.securityBox}>
                <Ionicons name="lock-closed" size={16} color="#854D0E" />
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
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#2D2D2D",
  },
  container: {
    flex: 1,
    backgroundColor: "#2D2D2D",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
    paddingBottom: 32,
  },
  contentContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 24,
  },
  shieldContainer: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  shieldIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  otpHeading: {
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "bold",
    color: "#000000",
    fontSize: 24,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    color: "#6B7280",
    paddingHorizontal: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  otpContainer: {
    marginBottom: 24,
  },
  loadingContainer: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 8,
    gap: 12,
  },
  loadingText: {
    color: "#6B7280",
    fontSize: 14,
  },
  buttonContainer: {
    gap: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  verifyButton: {
    borderRadius: 12,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
    backgroundColor: "#D1D5DB",
  },
  checkmarkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  resendButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  resendButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "500",
  },
  resendTimerText: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  paymentDetailsContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  paymentDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  paymentDetailsLeft: {
    flex: 1,
  },
  paymentDetailsRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  paymentDetailsLabel: {
    color: "#6B7280",
    marginBottom: 4,
    fontSize: 12,
  },
  paymentDetailsValue: {
    color: "#000000",
    fontWeight: "500",
    fontSize: 14,
  },
  securityContainer: {
    marginTop: 32,
  },
  securityBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  securityTextContainer: {
    flex: 1,
  },
  securityTitle: {
    color: "#854D0E",
    fontWeight: "600",
    marginBottom: 2,
    fontSize: 12,
  },
  securityMessage: {
    color: "#92400E",
    fontSize: 11,
  },
});
