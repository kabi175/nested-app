import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";

import Logo from "@/assets/images/v2/logo-varient.svg";
import Button from "@/components/v2/Button";
import { OtpInput } from "@/components/ui/OtpInput";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth0 } from "react-native-auth0";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignIn() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const countryCode = "+91"; // Fixed country code for India
  const { sendSMSCode, authorizeWithSMS } = useAuth0();

  // If null, no SMS has been sent
  const [confirm, setConfirm] = useState<boolean>(false);

  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  async function handlePhoneNumberVerification() {
    try {
      if (confirm) {
        setIsVerifying(true);
        await confirmCode();
        return;
      }

      // Check if phoneNumber is "testuser01" and redirect to test-sign screen
      if (phoneNumber.toLowerCase() === "testuser01") {
        router.push("/test-sign");
        return;
      }

      setIsLoading(true);
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;
      await sendSMSCode({
        phoneNumber: fullPhoneNumber,
      });
      setConfirm(true);
      setResendTimer(30);
    } catch (error) {
      console.log("Error", error);
      Alert.alert("Error", "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
      setIsVerifying(false);
    }
  }

  // Handle confirm code button press
  async function confirmCode() {
    try {
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;
      await authorizeWithSMS({
        phoneNumber: fullPhoneNumber,
        code: otpCode,
        scope: "openid profile email phone offline_access",
        audience: `https://${process.env.EXPO_PUBLIC_AUTH0_DOMAIN}/api/v2/`,
      });
      console.log("Authorization successful");
      router.replace("/name-input");
    } catch (error: any) {
      if (error.code === "auth/invalid-verification-code") {
        Alert.alert("Error", "Invalid verification code. Please try again.");
      } else {
        Alert.alert("Error", "Failed to verify code. Please try again.");
      }
      console.log("Error", error);
    }
  }

  // Handle OTP change
  const handleOtpChange = (otp: string) => {
    setOtpCode(otp);
  };

  // Handle OTP complete
  const handleOtpComplete = (otp: string) => {
    setOtpCode(otp);
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return; // Prevent spam clicking

    try {
      setIsLoading(true);
      // Reset OTP input
      setOtpCode("");

      // Resend OTP
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;
      await sendSMSCode({
        phoneNumber: fullPhoneNumber,
      });
      setConfirm(true);

      // Start timer for resend button (30 seconds)
      setResendTimer(30);

      Alert.alert("Success", "OTP has been resent successfully!");
    } catch (error) {
      console.log("Resend OTP error", error);
      Alert.alert("Error", "Failed to resend OTP. Please try again.");
      setResendTimer(0); // Reset timer on error
    } finally {
      setIsLoading(false);
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
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Top Section */}
          {!confirm && (
            <View style={styles.topSection}>
              <View style={styles.logoWrapper}>
                <Logo width={65} height={65} />
              </View>

              <Text style={styles.mainTitle}>
                Building your child's future{"\n"}starts here
              </Text>

              <Text style={styles.mainSubtitle}>
                Join 40,000+ Indian parents who plan{"\n"}with purpose
              </Text>

              <View style={styles.badgesRow}>
                <View style={styles.badge}>
                  <View style={styles.greenCheckSquare}>
                    <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                  </View>
                  <Text style={styles.badgeText}>SEBI registered</Text>
                </View>
                <View style={styles.badge}>
                  <Ionicons name="lock-closed" size={12} color="#C2A475" />
                  <Text style={styles.badgeText}>256 bit encrypted</Text>
                </View>
              </View>
            </View>
          )}

          {/* Bottom Card */}
          <View style={styles.bottomCard}>
            <View style={styles.formContainer}>
              {!confirm ? (
                <>
                  <Text style={styles.inputLabel}>Mobile</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter Mobile number"
                    placeholderTextColor="#A1A1AA"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="number-pad"
                    maxLength={10}
                  />

                  <Button
                    title="Send OTP"
                    disabled={phoneNumber.length !== 10}
                    loading={isLoading}
                    onPress={handlePhoneNumberVerification}
                  />

                  <Text style={styles.disclaimerText}>
                    By proceeding, you accept T&C, privacy policy &{"\n"}
                    authorize a penny drop for bank verification
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.inputLabel}>Enter OTP</Text>
                  <Text style={styles.fieldHint}>
                    We've sent a 6-digit code to {countryCode} {phoneNumber}
                  </Text>

                  <View style={styles.otpWrapper}>
                    <OtpInput
                      length={6}
                      onComplete={handleOtpComplete}
                      onChange={handleOtpChange}
                      disabled={isVerifying}
                    />
                  </View>

                  <View style={styles.otpButtonWrapper}>
                    <Button
                      title="Verify & Continue"
                      disabled={otpCode.length !== 6}
                      loading={isVerifying}
                      onPress={handlePhoneNumberVerification}
                    />

                    <Button
                      title={
                        isLoading
                          ? "Resending..."
                          : resendTimer > 0
                          ? `Resend OTP in ${resendTimer}s`
                          : "Resend OTP"
                      }
                      disabled={resendTimer > 0 || isLoading}
                      onPress={handleResendOtp}
                    />

                    <View style={styles.editPhoneWrapper}>
                      <Text
                        style={styles.editPhoneText}
                        onPress={() => {
                          setConfirm(false);
                          setOtpCode("");
                          setResendTimer(0);
                        }}
                      >
                        Edit Phone Number
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F4F4",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topSection: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  logoWrapper: {
    marginBottom: 40,
    borderRadius: 16,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  mainSubtitle: {
    fontSize: 15,
    color: "#737373",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FCF4E3",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  greenCheckSquare: {
    backgroundColor: "#22C55E",
    width: 14,
    height: 14,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 12,
    color: "#525252",
    fontWeight: "500",
  },
  bottomCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderBottomWidth: 0,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  formContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#171717",
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 16,
    color: "#171717",
    marginBottom: 32,
  },
  disclaimerText: {
    textAlign: "center",
    fontSize: 12,
    color: "#737373",
    lineHeight: 18,
    marginTop: 24,
  },
  fieldHint: {
    fontSize: 14,
    color: "#737373",
    marginBottom: 24,
  },
  otpWrapper: {
    marginBottom: 32,
  },
  otpButtonWrapper: {
    gap: 16,
  },
  editPhoneWrapper: {
    alignItems: "center",
    marginTop: 8,
  },
  editPhoneText: {
    color: "#3137D5",
    fontWeight: "600",
    fontSize: 14,
  },
});
