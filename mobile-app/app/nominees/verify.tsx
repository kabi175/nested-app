import { Ionicons } from "@expo/vector-icons";
import {
  FirebaseAuthTypes,
  getAuth,
  signInWithPhoneNumber,
} from "@react-native-firebase/auth";
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

import { upsertNominees } from "@/api/nomineeApi";
import { OtpInput } from "@/components/ui/OtpInput";
import { useAuth } from "@/hooks/auth";
import { Spinner, Text } from "@ui-kitten/components";
import {
  nomineeListAtom,
  pendingActionAtom,
  pendingNomineeIdAtom,
} from "@/atoms/nominee";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { draftToPayload } from "@/utils/nominee";
import { useOptOutNominee } from "@/hooks/useOptOutNominee";

export default function NomineeVerificationScreen() {
  const auth = useAuth();
  const [nomineeList, setNomineeList] = useAtom(nomineeListAtom);
  const pendingAction = useAtomValue(pendingActionAtom);
  const [pendingNomineeId, setPendingNomineeId] = useAtom(pendingNomineeIdAtom);
  const setPendingAction = useSetAtom(pendingActionAtom);
  const queryClient = useQueryClient();
  const optOutNomineeMutation = useOptOutNominee();
  const [confirm, setConfirm] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isProcessingNominees, setIsProcessingNominees] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  const isOptOutFlow = pendingAction === "optOut";

  // Get user's phone number from auth
  const userPhoneNumber =
    auth.user?.phoneNumber || getAuth().currentUser?.phoneNumber || "";

  // Redirect if no nominees and not opt-out flow
  useEffect(() => {
    if (!isOptOutFlow && nomineeList.length === 0) {
      router.replace("/nominees");
    }
  }, [nomineeList.length, isOptOutFlow]);

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
    if (!confirm) {
      Alert.alert("Error", "Missing verification data. Please try again.");
      return;
    }

    if (!isOptOutFlow && nomineeList.length === 0) {
      Alert.alert("Error", "Missing verification data. Please try again.");
      return;
    }

    try {
      setIsVerifying(true);
      // Reauthenticate with Firebase SMS MFA
      await confirm.confirm(otpCode);

      if (isOptOutFlow) {
        // Opt-out flow
        setIsProcessingNominees(true);
        await optOutNomineeMutation.mutateAsync();

        // Refresh nominees and user (mutation already invalidates these)
        await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.nominees] });
        await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.user] });

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
        await upsertNominees(payloads);

        // Refresh nominees
        await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.nominees] });

        // Clear nominee list (will be repopulated from server)
        setNomineeList([]);
      }

      // Redirect back to nominees screen
      router.replace("/nominees");
    } catch (error: any) {
      console.error("Verification error", error);
      if (error.code === "auth/invalid-verification-code") {
        Alert.alert("Error", "Invalid verification code. Please try again.");
      } else {
        Alert.alert("Error", "Failed to verify. Please try again.");
      }
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
              We&apos;ve sent a 6-digit code to your registered mobile number.
            </Text>

            {/* Loading state while sending OTP */}
            {!confirm && isLoading && (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingSpinnerWrapper}>
                  <Spinner size="small" status="primary" />
                </View>
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
                    disabled={isVerifying || isProcessingNominees}
                  />
                </View>

                {/* Verify Button */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={handleVerifyAndContinue}
                    disabled={
                      otpCode.length !== 6 || isVerifying || isProcessingNominees
                    }
                    style={[
                      styles.verifyButton,
                      (otpCode.length !== 6 ||
                        isVerifying ||
                        isProcessingNominees) &&
                        styles.verifyButtonDisabled,
                    ]}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
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

