import { Ionicons } from "@expo/vector-icons";
import {
  FirebaseAuthTypes,
  getAuth,
  signInWithPhoneNumber,
} from "@react-native-firebase/auth";

import { OtpInput } from "@/components/ui/OtpInput";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignIn() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // If null, no SMS has been sent
  const [confirm, setConfirm] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const countryCodes = [
    { code: "+91", country: "India", flag: "🇮🇳" },
    { code: "+1", country: "USA", flag: "🇺🇸" },
    { code: "+44", country: "UK", flag: "🇬🇧" },
  ];

  async function handlePhoneNumberVerification() {
    try {
      if (confirm) {
        setIsVerifying(true);
        await confirmCode();
        return;
      }
      setIsLoading(true);
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(
        getAuth(),
        fullPhoneNumber
      );
      setConfirm(confirmation);
      setResendTimer(30);
    } catch (error) {
      console.log("Phone number verification error", error);
      Alert.alert("Error", "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
      setIsVerifying(false);
    }
  }

  // Handle confirm code button press
  async function confirmCode() {
    try {
      await confirm?.confirm(otpCode);
      router.replace("/");
    } catch (error: any) {
      if (error.code === "auth/invalid-verification-code") {
        Alert.alert("Error", "Invalid verification code. Please try again.");
      } else {
        Alert.alert("Error", "Failed to verify code. Please try again.");
      }
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
      const confirmation = await signInWithPhoneNumber(
        getAuth(),
        fullPhoneNumber
      );
      setConfirm(confirmation);

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

  const title = confirm ? "Enter OTP" : "Enter Your Mobile Number";
  const subtitle = confirm
    ? `We've sent a 6-digit code to +91 ${phoneNumber}`
    : "We'll send you an OTP to verify your number";

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          "rgb(221, 236, 254)", // Light blue at top
          "rgb(232, 242, 255)", // Slightly lighter blue
          "rgb(240, 246, 255)", // Very light blue
          "rgb(255, 255, 255)", // White
          "rgb(255, 255, 255)", // White at bottom
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
        <View>
          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          {/* Phone Input Row */}
          <View style={styles.inputRow}>
            {/* Country Code Picker */}
            <View style={styles.countryPickerContainer}>
              <TouchableOpacity
                onPress={() => setShowCountryPicker(!showCountryPicker)}
                style={styles.countryPicker}
              >
                <Text style={styles.countryCode}>{countryCode}</Text>
                <Ionicons
                  name={showCountryPicker ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#666"
                />
              </TouchableOpacity>

              {showCountryPicker && (
                <View style={styles.countryDropdown}>
                  {countryCodes.map((country) => (
                    <TouchableOpacity
                      key={country.code}
                      onPress={() => {
                        setCountryCode(country.code);
                        setShowCountryPicker(false);
                      }}
                      style={styles.countryOption}
                    >
                      <Text style={styles.flag}>{country.flag}</Text>
                      <Text style={styles.countryCodeText}>{country.code}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Phone Number Input */}
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter 10-digit mobile number"
              placeholderTextColor="#999"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {/* OTP Input (shown after phone verification) */}
          {confirm && (
            <View style={styles.otpContainer}>
              <OtpInput
                length={6}
                onComplete={handleOtpComplete}
                onChange={handleOtpChange}
                disabled={isVerifying}
              />
            </View>
          )}

          {/* Send OTP Button */}
          {!confirm && (
            <TouchableOpacity
              onPress={handlePhoneNumberVerification}
              disabled={phoneNumber.length !== 10 || isLoading}
              style={[
                styles.sendButton,
                phoneNumber.length === 10 && !isLoading
                  ? styles.sendButtonActive
                  : styles.sendButtonDisabled,
              ]}
            >
              {isLoading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.loaderText}>Sending OTP...</Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.sendButtonText,
                    phoneNumber.length === 10
                      ? styles.sendButtonTextActive
                      : styles.sendButtonTextDisabled,
                  ]}
                >
                  Send OTP
                </Text>
              )}
            </TouchableOpacity>
          )}

          {/* Verify OTP Button */}
          {confirm && (
            <>
              <TouchableOpacity
                onPress={handlePhoneNumberVerification}
                disabled={otpCode.length !== 6 || isVerifying}
                style={[
                  styles.sendButton,
                  otpCode.length === 6 && !isVerifying
                    ? styles.sendButtonActive
                    : styles.sendButtonDisabled,
                ]}
              >
                {isVerifying ? (
                  <View style={styles.loaderContainer}>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={styles.loaderText}>Verifying...</Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.sendButtonText,
                      otpCode.length === 6
                        ? styles.sendButtonTextActive
                        : styles.sendButtonTextDisabled,
                    ]}
                  >
                    Verify & Continue
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={resendTimer > 0 || isLoading}
                style={[
                  styles.resendButton,
                  resendTimer > 0 || isLoading
                    ? styles.resendButtonDisabled
                    : styles.resendButtonActive,
                ]}
              >
                {isLoading ? (
                  <View style={styles.resendLoaderContainer}>
                    <ActivityIndicator size="small" color="#9ca3af" />
                    <Text style={styles.resendLoaderText}>Resending...</Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.resendButtonText,
                      resendTimer > 0
                        ? styles.resendButtonTextDisabled
                        : styles.resendButtonTextActive,
                    ]}
                  >
                    {resendTimer > 0
                      ? `Resend OTP in ${resendTimer}s`
                      : "Resend OTP"}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Security Info */}
          <View style={styles.securityContainer}>
            <View style={styles.securityRow}>
              <Ionicons name="shield-checkmark" size={16} color="#3B82F6" />
              <Text style={styles.securityText}>
                Your information is secure and encrypted
              </Text>
            </View>

            <Text style={styles.disclaimerText}>
              You agree to{" "}
              <Pressable onPress={() => console.log("TnC pressed")}>
                <Text style={styles.linkText}>TnC</Text>
              </Pressable>{" "}
              and{" "}
              <Pressable onPress={() => console.log("Privacy Policy pressed")}>
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Pressable>{" "}
              by proceeding.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgb(255, 255, 255)",
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
  card: {
    padding: 24,
    backgroundColor: "#ffffff",
    borderRadius: 16,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  countryPickerContainer: {
    position: "relative",
  },
  countryPicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    minWidth: 80,
  },
  countryCode: {
    color: "#1a1a1a",
    fontWeight: "500",
  },
  countryDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  countryOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  flag: {
    fontSize: 18,
    marginRight: 8,
  },
  countryCodeText: {
    color: "#1a1a1a",
    fontWeight: "500",
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    color: "#1a1a1a",
  },
  sendButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  sendButtonActive: {
    backgroundColor: "#3b82f6",
  },
  sendButtonDisabled: {
    backgroundColor: "#d1d5db",
  },
  sendButtonText: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  sendButtonTextActive: {
    color: "#ffffff",
  },
  sendButtonTextDisabled: {
    color: "#9ca3af",
  },
  securityContainer: {
    alignItems: "center",
    gap: 12,
  },
  resendButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
  },
  resendButtonActive: {
    backgroundColor: "transparent",
    borderColor: "#d1d5db",
  },
  resendButtonDisabled: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
  },
  resendButtonText: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  resendButtonTextActive: {
    color: "#374151",
  },
  resendButtonTextDisabled: {
    color: "#9ca3af",
  },
  loaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loaderText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  resendLoaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  resendLoaderText: {
    color: "#9ca3af",
    fontSize: 16,
    fontWeight: "600",
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  securityText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 16,
  },
  linkText: {
    color: "#3b82f6",
    fontSize: 12,
  },
  otpContainer: {
    marginBottom: 24,
  },
});
