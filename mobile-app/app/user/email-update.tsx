import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OtpInput } from "@/components/ui/OtpInput";
import { useAuth } from "@/hooks/auth";
import { useAuthAxios } from "@/hooks/useAuthAxios";
import { useUser } from "@/hooks/useUser";
import { useUpdateEmail } from "@/hooks/useUserMutations";
import {
  setCurrentAction,
  startMfaSession,
  verifyOtp,
  type MfaAction,
} from "@/services/mfaService";
import { Input, Spinner, Text } from "@ui-kitten/components";

type Step = "email" | "mfa" | "success";

export default function EmailUpdateScreen() {
  const { redirectUrl } = useLocalSearchParams<{
    redirectUrl?: string;
  }>();

  const { isSignedIn } = useAuth();
  const { data: user } = useUser();
  const api = useAuthAxios();
  const updateEmailMutation = useUpdateEmail();
  const [step, setStep] = useState<Step>("email");
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [mfaSessionId, setMfaSessionId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = () => {
    const trimmedEmail = newEmail.trim().toLowerCase();

    if (!trimmedEmail) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (user?.email && trimmedEmail === user.email.toLowerCase()) {
      setEmailError("This is already your current email address");
      return;
    }

    setEmailError(null);
    // Move to MFA step
    setStep("mfa");
    // Auto-send OTP
    sendOTP();
  };

  const sendOTP = async () => {
    if (!isSignedIn) {
      Alert.alert("Error", "Please sign in to continue.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
      return;
    }

    const trimmedEmail = newEmail.trim().toLowerCase();

    try {
      setIsLoading(true);
      // Set action for email update
      const action: MfaAction = "EMAIL_UPDATE";
      await setCurrentAction(action);

      // Start MFA session with EMAIL channel and new email
      const response = await startMfaSession(
        action,
        "EMAIL",
        api,
        trimmedEmail
      );
      setMfaSessionId(response.mfaSessionId);
      setResendTimer(30);
    } catch (error: any) {
      console.log("Error sending OTP", error);
      Alert.alert(
        "Error",
        error.message || "Failed to send OTP. Please try again."
      );
      setStep("email");
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

  const handleVerifyAndUpdateEmail = async () => {
    if (!mfaSessionId || !newEmail.trim()) {
      Alert.alert("Error", "Missing verification data. Please try again.");
      return;
    }

    if (!user?.id) {
      Alert.alert(
        "Error",
        "User information not available. Please sign in again."
      );
      return;
    }

    if (otpCode.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setIsVerifying(true);

      // Verify OTP to get MFA token
      await verifyOtp(mfaSessionId, otpCode, api);

      // Update email with MFA token (automatically included via interceptor)
      const trimmedEmail = newEmail.trim().toLowerCase();
      await updateEmailMutation.mutateAsync({
        userId: user.id,
        email: trimmedEmail,
      });

      setStep("success");
      if (redirectUrl) {
        router.replace(redirectUrl);
      } else {
        router.replace("/(tabs)/child");
      }
    } catch (error: any) {
      console.error("Verification error", error);
      setStep("mfa");

      const errorMessage =
        error.message || "Failed to update email. Please try again.";

      if (error.response?.status === 400) {
        Alert.alert("Error", error.response.data?.message || errorMessage);
      } else if (error.response?.status === 409) {
        Alert.alert(
          "Error",
          "This email is already in use by another account."
        );
      } else {
        Alert.alert("Error", errorMessage);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBack = () => {
    if (step === "mfa") {
      setStep("email");
      setMfaSessionId(null);
      setOtpCode("");
      setResendTimer(0);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.keyboardView}
      >
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
              {/* Header with back button */}
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={handleBack}
                  style={styles.backButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text category="h5" style={styles.headerTitle}>
                  Update Email
                </Text>
                <View style={styles.backButtonPlaceholder} />
              </View>

              {/* Shield Icon with Gradient */}
              <View style={styles.shieldContainer}>
                <LinearGradient
                  colors={["#3B82F6", "#2563EB", "#1D4ED8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.shieldIcon}
                >
                  <View style={styles.shieldIconInner}>
                    <Ionicons name="mail" size={40} color="#FFFFFF" />
                  </View>
                </LinearGradient>
              </View>

              {/* Email Input Step */}
              {step === "email" && (
                <>
                  <Text category="h6" style={styles.stepTitle}>
                    Enter New Email
                  </Text>
                  <Text category="s1" style={styles.subtitle}>
                    We&apos;ll send a verification code to your new email
                    address to confirm the change.
                  </Text>

                  <View style={styles.inputContainer}>
                    <Input
                      placeholder="name@example.com"
                      value={newEmail}
                      onChangeText={(text) => {
                        setNewEmail(text);
                        setEmailError(null);
                      }}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      status={emailError ? "danger" : "basic"}
                      caption={emailError || undefined}
                      style={styles.emailInput}
                      disabled={isLoading}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={handleEmailSubmit}
                    disabled={!newEmail.trim() || isLoading}
                    style={[
                      styles.continueButton,
                      (!newEmail.trim() || isLoading) &&
                        styles.continueButtonDisabled,
                    ]}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        newEmail.trim() && !isLoading
                          ? ["#2563EB", "#1D4ED8"]
                          : ["#D1D5DB", "#9CA3AF"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.continueButtonGradient}
                    >
                      <Text style={styles.continueButtonText}>Continue</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}

              {/* MFA Verification Step */}
              {step === "mfa" && (
                <>
                  <Text category="h6" style={styles.stepTitle}>
                    Verify Your Email
                  </Text>
                  <Text category="s1" style={styles.subtitle}>
                    We&apos;ve sent a 6-digit verification code to{" "}
                    <Text style={styles.emailHighlight}>{newEmail.trim()}</Text>
                    . Please enter it below.
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

                  {/* OTP Input - shown when session is created and not sending email */}
                  {mfaSessionId && step === "mfa" && !isLoading && (
                    <>
                      <View style={styles.otpContainer}>
                        <OtpInput
                          length={6}
                          onComplete={handleOtpComplete}
                          onChange={handleOtpChange}
                          disabled={isVerifying}
                        />
                      </View>

                      {/* Verify Button */}
                      <View style={styles.buttonContainer}>
                        <TouchableOpacity
                          onPress={handleVerifyAndUpdateEmail}
                          disabled={otpCode.length !== 6 || isVerifying}
                          style={[
                            styles.verifyButton,
                            (otpCode.length !== 6 || isVerifying) &&
                              styles.verifyButtonDisabled,
                          ]}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={
                              otpCode.length === 6 && !isVerifying
                                ? ["#2563EB", "#1D4ED8"]
                                : ["#D1D5DB", "#9CA3AF"]
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.verifyButtonGradient}
                          >
                            {!isVerifying && (
                              <View style={styles.checkmarkCircle}>
                                <Ionicons
                                  name="checkmark"
                                  size={16}
                                  color="#FFFFFF"
                                />
                              </View>
                            )}
                            {isVerifying && (
                              <Spinner size="small" status="control" />
                            )}
                            <Text style={styles.verifyButtonText}>
                              {isVerifying
                                ? "Verifying..."
                                : "Verify & Update Email"}
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={handleResendOtp}
                          disabled={resendTimer > 0 || isLoading}
                          style={[
                            styles.resendButton,
                            (resendTimer > 0 || isLoading) &&
                              styles.resendButtonDisabled,
                          ]}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="refresh"
                            size={16}
                            color={
                              resendTimer > 0 || isLoading
                                ? "#9CA3AF"
                                : "#2563EB"
                            }
                            style={styles.resendIcon}
                          />
                          <Text
                            style={[
                              styles.resendButtonText,
                              (resendTimer > 0 || isLoading) &&
                                styles.resendButtonTextDisabled,
                            ]}
                          >
                            Resend OTP{" "}
                            {resendTimer > 0 && (
                              <Text style={styles.resendTimerText}>
                                ({resendTimer}s)
                              </Text>
                            )}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </>
              )}

              {/* Success Step */}
              {step === "success" && (
                <>
                  <View style={styles.successContainer}>
                    <View style={styles.successIconContainer}>
                      <Ionicons
                        name="checkmark-circle"
                        size={64}
                        color="#00C853"
                      />
                    </View>
                    <Text category="h6" style={styles.successTitle}>
                      Email Updated Successfully
                    </Text>
                    <Text category="s1" style={styles.successMessage}>
                      Your email address has been successfully updated to{" "}
                      <Text style={styles.emailHighlight}>
                        {newEmail.trim()}
                      </Text>
                      .
                    </Text>
                    <Text category="s2" style={styles.successNote}>
                      You can now use your new email address for future logins
                      and account communications.
                    </Text>
                  </View>

                  {/* Back Button */}
                  <View style={styles.successButtonContainer}>
                    <TouchableOpacity
                      onPress={() => router.replace("/(tabs)/child")}
                      style={styles.backToProfileButton}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="arrow-back" size={18} color="#2563EB" />
                      <Text style={styles.backToProfileText}>
                        Back to Profile
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* Security Message */}
              {step !== "success" && (
                <View style={styles.securityContainer}>
                  <View style={styles.securityBox}>
                    <View style={styles.securityIconContainer}>
                      <Ionicons
                        name="shield-checkmark"
                        size={18}
                        color="#92400E"
                      />
                    </View>
                    <View style={styles.securityTextContainer}>
                      <Text category="c2" style={styles.securityTitle}>
                        Secure Update
                      </Text>
                      <Text category="c2" style={styles.securityMessage}>
                        Never share your OTP with anyone.
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </Animated.View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  keyboardView: {
    flex: 1,
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    padding: 4,
  },
  backButtonPlaceholder: {
    width: 32,
  },
  headerTitle: {
    fontWeight: "700",
    color: "#111827",
    fontSize: 20,
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
  stepTitle: {
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "700",
    color: "#111827",
    fontSize: 24,
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
  inputContainer: {
    marginBottom: 24,
  },
  emailInput: {
    backgroundColor: "#F8F8F8",
  },
  continueButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 10,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  otpContainer: {
    marginBottom: 28,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
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
    overflow: "hidden",
    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  verifyButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 10,
  },
  checkmarkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendIcon: {
    marginRight: 2,
  },
  resendButtonText: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "600",
  },
  resendButtonTextDisabled: {
    color: "#9CA3AF",
  },
  resendTimerText: {
    color: "#6B7280",
    fontWeight: "500",
  },
  successContainer: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 28,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "700",
    color: "#111827",
    fontSize: 22,
  },
  successMessage: {
    textAlign: "center",
    marginBottom: 16,
    color: "#6B7280",
    paddingHorizontal: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  emailHighlight: {
    fontWeight: "600",
    color: "#2563EB",
  },
  successNote: {
    textAlign: "center",
    color: "#92400E",
    paddingHorizontal: 12,
    fontSize: 13,
    lineHeight: 18,
    backgroundColor: "#FFFBEB",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  successButtonContainer: {
    marginTop: 8,
    marginBottom: 28,
  },
  backToProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  backToProfileText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
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
