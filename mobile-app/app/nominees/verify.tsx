import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  nomineeListAtom,
  pendingActionAtom,
  pendingNomineeIdAtom,
} from "@/atoms/nominee";
import { OtpInput } from "@/components/ui/OtpInput";
import { useAuthAxios } from "@/hooks/useAuthAxios";
import { useOptOutNominee } from "@/hooks/useOptOutNominee";
import { useUpsertNominees } from "@/hooks/useUpsertNominees";
import {
  setCurrentAction,
  startMfaSession,
  verifyOtp,
  type MfaAction,
} from "@/services/mfaService";
import { draftToPayload } from "@/utils/nominee";
import { Spinner, Text } from "@ui-kitten/components";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

export default function NomineeVerificationScreen() {
  const api = useAuthAxios();
  const [nomineeList, setNomineeList] = useAtom(nomineeListAtom);
  const pendingAction = useAtomValue(pendingActionAtom);
  const setPendingNomineeId = useSetAtom(pendingNomineeIdAtom);
  const setPendingAction = useSetAtom(pendingActionAtom);
  const optOutNomineeMutation = useOptOutNominee();
  const upsertNomineesMutation = useUpsertNominees();
  const [mfaSessionId, setMfaSessionId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isProcessingNominees, setIsProcessingNominees] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  const isOptOutFlow = pendingAction === "optOut";

  // Auto-send OTP when component mounts
  useEffect(() => {
    if (!mfaSessionId && !isLoading) {
      sendOTP();
    }
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
      // Set action for nominee verification
      const action: MfaAction = "NOMINEE_UPDATE";
      await setCurrentAction(action);

      // Start MFA session
      const response = await startMfaSession(action, "SMS", api);
      setMfaSessionId(response.mfaSessionId);
      setResendTimer(30);
    } catch (error: any) {
      console.log("Error sending OTP", error);
      Alert.alert(
        "Error",
        error.message || "Failed to send OTP. Please try again."
      );
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
    if (!mfaSessionId) {
      Alert.alert("Error", "Missing verification data. Please try again.");
      return;
    }

    if (!isOptOutFlow && nomineeList.length === 0) {
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

      if (isOptOutFlow) {
        // Opt-out flow
        setIsProcessingNominees(true);
        await optOutNomineeMutation.mutateAsync();

        // Clear pending action and nominee ID
        setPendingNomineeId(null);
        setPendingAction(null);
      } else {
        // Save nominees flow - upsert all nominees
        setIsProcessingNominees(true);
        const payloads = nomineeList.map((nominee) => {
          const payload = draftToPayload(nominee as any);
          // Include id if present for updates
          if (nominee.id) {
            return { ...payload, id: nominee.id };
          }
          return payload;
        });
        await upsertNomineesMutation.mutateAsync(payloads);

        // Clear nominee list (will be repopulated from server)
        setNomineeList([]);
      }

      // Redirect to success screen
      router.replace("/nominees/success");
    } catch (error: any) {
      console.error("Verification error", error);
      const errorMessage =
        error.message || "Failed to verify. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsVerifying(false);
      setIsProcessingNominees(false);
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
    <SafeAreaView style={styles.safeArea} edges={[]}>
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
              We&apos;ve sent a 6-digit code to your registered mobile number.
            </Text>

            {/* Loading state while sending OTP */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingSpinnerWrapper}>
                  <Spinner size="small" status="primary" />
                </View>
                <Text category="s1" style={styles.loadingText}>
                  Sending verification code...
                </Text>
              </View>
            )}

            {/* OTP Input - shown after loading completes */}
            {!isLoading && (
              <>
                <View style={styles.otpContainer}>
                  <OtpInput
                    length={6}
                    onComplete={handleOtpComplete}
                    onChange={handleOtpChange}
                    disabled={
                      !mfaSessionId || isVerifying || isProcessingNominees
                    }
                  />
                </View>

                {/* Verify Button */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={handleVerifyAndContinue}
                    disabled={
                      !mfaSessionId ||
                      otpCode.length !== 6 ||
                      isVerifying ||
                      isProcessingNominees
                    }
                    style={[
                      styles.verifyButton,
                      (!mfaSessionId ||
                        otpCode.length !== 6 ||
                        isVerifying ||
                        isProcessingNominees) &&
                      styles.verifyButtonDisabled,
                    ]}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        mfaSessionId &&
                          otpCode.length === 6 &&
                          !isVerifying &&
                          !isProcessingNominees
                          ? ["#2563EB", "#1D4ED8"]
                          : ["#D1D5DB", "#9CA3AF"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.verifyButtonGradient}
                    >
                      {!isVerifying && !isProcessingNominees && (
                        <View style={styles.checkmarkCircle}>
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#FFFFFF"
                          />
                        </View>
                      )}
                      {(isVerifying || isProcessingNominees) && (
                        <Spinner size="small" status="control" />
                      )}
                      <Text style={styles.verifyButtonText}>
                        {isProcessingNominees
                          ? isOptOutFlow
                            ? "Opting Out..."
                            : "Saving Nominees..."
                          : isVerifying
                            ? "Verifying..."
                            : isOptOutFlow
                              ? "Verify & Opt Out"
                              : "Verify & Save"}
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
                        resendTimer > 0 || isLoading ? "#9CA3AF" : "#2563EB"
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

            {/* Security Message - Always at bottom */}
            <View style={styles.securityContainer}>
              <View style={styles.securityBox}>
                <View style={styles.securityIconContainer}>
                  <Ionicons name="shield-checkmark" size={18} color="#92400E" />
                </View>
                <View style={styles.securityTextContainer}>
                  <Text category="c2" style={styles.securityTitle}>
                    Secure Transaction
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
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    marginHorizontal: 0,
    borderRadius: 0,
    padding: 28,
    alignItems: "center",
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
    alignItems: "center",
    width: "100%",
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
    width: "100%",
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
  securityContainer: {
    marginTop: 28,
    width: "100%",
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
