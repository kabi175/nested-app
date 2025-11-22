import { Ionicons } from "@expo/vector-icons";
import {
  FirebaseAuthTypes,
  getAuth,
  signInWithPhoneNumber,
} from "@react-native-firebase/auth";
import { router, useLocalSearchParams } from "expo-router";
import { openBrowserAsync } from "expo-web-browser";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ImageProps,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { initiatePayment, verifyPayment } from "@/api/paymentAPI";
import { OtpInput } from "@/components/ui/OtpInput";
import { useAuth } from "@/hooks/auth";
import {
  Button,
  Layout,
  Spinner,
  Text,
} from "@ui-kitten/components";
import { LinearGradient } from "expo-linear-gradient";

const LoadingIndicator = (props: ImageProps) => (
  <View
    style={[props.style, { justifyContent: "center", alignItems: "center" }]}
  >
    <Spinner size="small" />
  </View>
);

export default function PaymentVerificationScreen() {
  const { paymentId } = useLocalSearchParams<{ paymentId: string }>();
  const auth = useAuth();
  const [confirm, setConfirm] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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

      // Then initiate payment and redirect
      const redirectUrl = await initiatePayment(paymentId);
      if (redirectUrl) {
        await openBrowserAsync(redirectUrl);
        // Navigate back or to success screen
        router.back();
      } else {
        Alert.alert("Error", "Failed to get payment redirect URL.");
      }
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

  const maskedPhoneNumber = userPhoneNumber
    ? `${userPhoneNumber.slice(0, -4)}****`
    : "";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Layout style={styles.container}>
        <LinearGradient
          colors={[
            "rgb(221, 236, 254)",
            "rgb(232, 242, 255)",
            "rgb(240, 246, 255)",
            "rgb(255, 255, 255)",
            "rgb(255, 255, 255)",
          ]}
          locations={[0, 0.4, 0.7, 0.8, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradient}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Layout style={styles.contentContainer}>
            {/* Title */}
            <Layout style={styles.logoContainer}>
              <Image
                source={require("@/assets/images/splash-icon.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text category="h6" style={styles.title}>
                Verify Payment
              </Text>
            </Layout>

            <Layout
              style={[
                styles.titleContainer,
                { backgroundColor: "transparent" },
              ]}
            >
              <Text category="h4" style={styles.formTitle}>
                Enter Verification Code
              </Text>
              <Text category="s1" appearance="hint" style={styles.subtitle}>
                {confirm
                  ? `We've sent a 6-digit code to ${maskedPhoneNumber}`
                  : "Sending verification code..."}
              </Text>
            </Layout>

            {/* OTP Input */}
            {confirm && (
              <Layout
                style={[
                  styles.otpContainer,
                  { backgroundColor: "transparent" },
                ]}
              >
                <OtpInput
                  length={6}
                  onComplete={handleOtpComplete}
                  onChange={handleOtpChange}
                  disabled={isVerifying || isProcessingPayment}
                />
              </Layout>
            )}

            {/* Loading state while sending OTP */}
            {!confirm && isLoading && (
              <Layout
                style={[
                  styles.loadingContainer,
                  { backgroundColor: "transparent" },
                ]}
              >
                <Spinner size="small" />
                <Text category="s1" appearance="hint" style={styles.loadingText}>
                  Sending verification code...
                </Text>
              </Layout>
            )}

            {/* Verify Button */}
            {confirm && (
              <Layout
                style={[
                  styles.buttonContainer,
                  { backgroundColor: "transparent" },
                ]}
              >
                <Button
                  onPress={handleVerifyAndContinue}
                  disabled={
                    otpCode.length !== 6 ||
                    isVerifying ||
                    isProcessingPayment
                  }
                  style={styles.sendButton}
                  size="large"
                  accessoryLeft={() =>
                    isVerifying || isProcessingPayment ? (
                      <LoadingIndicator />
                    ) : (
                      <></>
                    )
                  }
                >
                  {isProcessingPayment
                    ? "Processing Payment..."
                    : isVerifying
                    ? "Verifying..."
                    : "Verify & Continue"}
                </Button>

                <Button
                  onPress={handleResendOtp}
                  disabled={resendTimer > 0 || isLoading}
                  appearance="outline"
                  style={styles.resendButton}
                  size="large"
                >
                  {isLoading
                    ? "Resending..."
                    : resendTimer > 0
                    ? `Resend OTP in ${resendTimer}s`
                    : "Resend OTP"}
                </Button>
              </Layout>
            )}

            {/* Security Info */}
            <Layout
              style={[
                styles.securityContainer,
                { backgroundColor: "transparent" },
              ]}
            >
              <Layout
                style={[styles.securityRow, { backgroundColor: "transparent" }]}
              >
                <Ionicons name="shield-checkmark" size={16} color="#3B82F6" />
                <Text
                  category="c1"
                  appearance="hint"
                  style={styles.securityText}
                >
                  Your payment is secure and encrypted
                </Text>
              </Layout>
            </Layout>
          </Layout>
        </ScrollView>
      </Layout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gradient: {
    flex: 1,
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    width: "100%",
    height: "100%",
    maxWidth: 400,
    marginHorizontal: 16,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  contentContainer: {
    padding: 24,
    backgroundColor: "transparent",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
  },
  sendButton: {
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  resendButton: {
    marginBottom: 16,
  },
  securityContainer: {
    alignItems: "center",
    marginTop: 24,
    gap: 12,
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  securityText: {
    marginLeft: 8,
  },
  otpContainer: {
    marginBottom: 24,
  },
  logoImage: {
    width: 150,
    height: 150,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "transparent",
  },
  formTitle: {
    textAlign: "center",
    marginBottom: 8,
  },
  loadingContainer: {
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  loadingText: {
    marginTop: 8,
  },
});

