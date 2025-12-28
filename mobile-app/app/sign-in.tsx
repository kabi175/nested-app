import { Ionicons } from "@expo/vector-icons";
import {
  FirebaseAuthTypes,
  getAuth,
  signInWithPhoneNumber,
} from "@react-native-firebase/auth";
import { Link, router } from "expo-router";

import LoginCarousel from "@/components/auth/LoginCarousel";
import { OtpInput } from "@/components/ui/OtpInput";
import {
  Button,
  IndexPath,
  Input,
  Layout,
  Select,
  SelectItem,
  Spinner,
  Text,
} from "@ui-kitten/components";
import { useEffect, useState } from "react";
import { Alert, ImageProps, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LoadingIndicator = (props: ImageProps) => (
  <View
    style={[props.style, { justifyContent: "center", alignItems: "center" }]}
  >
    <Spinner size="small" />
  </View>
);

export default function SignIn() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");

  // If null, no SMS has been sent
  const [confirm, setConfirm] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const countryCodes = [
    { title: "🇮🇳 +91", value: "+91" },
    { title: "🇺🇸 +1", value: "+1" },
    { title: "🇬🇧 +44", value: "+44" },
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
      await confirm?.confirm(otpCode);
      router.replace("/name-input");
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

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Layout style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Login Carousel */}
          <LoginCarousel />

          {/* Main Content Card */}
          <Layout style={styles.contentCard}>
            {/* Main Title */}
            <Layout style={styles.headerContainer}>
              <Text category="h4" style={styles.mainTitle}>
                Secure your child&apos;s future
              </Text>
              <Text category="s1" appearance="hint" style={styles.mainSubtitle}>
                Start your investment journey today
              </Text>
            </Layout>

            {/* Form Section */}
            <Layout style={styles.formContainer}>
              {/* Field Label */}
              <Text category="s2" style={styles.fieldLabel}>
                {confirm ? "Enter OTP" : "Enter Your Mobile Number"}
              </Text>
              <Text category="c1" appearance="hint" style={styles.fieldHint}>
                {confirm
                  ? `We've sent a 6-digit code to ${countryCode} ${phoneNumber}`
                  : "We'll send you an OTP to verify your number"}
              </Text>

              {/* Phone Input Row */}
              {!confirm && (
                <Layout style={styles.inputRow}>
                  {/* Country Code Select */}
                  <Select
                    style={styles.countrySelect}
                    placeholder="Country"
                    value={countryCode}
                    selectedIndex={
                      new IndexPath(
                        countryCodes.findIndex(
                          (item) => item.value === countryCode
                        )
                      )
                    }
                    onSelect={(index) => {
                      const selectedIndex = Array.isArray(index)
                        ? index[0]
                        : index;
                      const selectedCountry = countryCodes[selectedIndex.row];
                      setCountryCode(selectedCountry.value);
                    }}
                  >
                    {countryCodes.map((country) => (
                      <SelectItem key={country.value} title={country.title} />
                    ))}
                  </Select>

                  {/* Phone Number Input */}
                  <Input
                    style={styles.phoneInput}
                    placeholder="Enter 10-digit mobile number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </Layout>
              )}

              {/* OTP Input (shown after phone verification) */}
              {confirm && (
                <Layout style={styles.otpContainer}>
                  <OtpInput
                    length={6}
                    onComplete={handleOtpComplete}
                    onChange={handleOtpChange}
                    disabled={isVerifying}
                  />
                </Layout>
              )}

              {/* Send OTP Button */}
              {!confirm && (
                <Button
                  onPress={handlePhoneNumberVerification}
                  disabled={phoneNumber.length !== 10 || isLoading}
                  style={styles.sendButton}
                  size="large"
                  accessoryLeft={() =>
                    isLoading ? <LoadingIndicator /> : <></>
                  }
                >
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </Button>
              )}

              {/* Verify OTP Button */}
              {confirm && (
                <Layout style={styles.buttonContainer}>
                  <Button
                    onPress={handlePhoneNumberVerification}
                    disabled={otpCode.length !== 6 || isVerifying}
                    style={styles.sendButton}
                    size="large"
                    accessoryLeft={() =>
                      isVerifying ? <LoadingIndicator /> : <></>
                    }
                  >
                    {isVerifying ? "Verifying..." : "Verify & Continue"}
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
              <Layout style={styles.securityContainer}>
                <Layout style={styles.securityRow}>
                  <Ionicons name="shield-checkmark" size={16} color="#3B82F6" />
                  <Text
                    category="c1"
                    appearance="hint"
                    style={styles.securityText}
                  >
                    Your information is secure and encrypted
                  </Text>
                </Layout>

                <Text
                  category="c1"
                  appearance="hint"
                  style={styles.disclaimerText}
                >
                  You agree to{" "}
                  <Link href="https://expo.dev" style={styles.linkText}>
                    TnC and Privacy Policy
                  </Link>{" "}
                  by proceeding.
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
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  contentCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    minHeight: "60%",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 32,
    backgroundColor: "transparent",
  },
  mainTitle: {
    textAlign: "center",
    fontWeight: "700",
    fontSize: 24,
    marginBottom: 8,
    color: "#1A1A1A",
  },
  mainSubtitle: {
    textAlign: "center",
    fontSize: 16,
    color: "#666666",
  },
  formContainer: {
    backgroundColor: "transparent",
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#1A1A1A",
  },
  fieldHint: {
    fontSize: 14,
    marginBottom: 16,
    color: "#666666",
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
    backgroundColor: "transparent",
  },
  countrySelect: {
    minWidth: 100,
    backgroundColor: "#F8F8F8",
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  sendButton: {
    marginBottom: 16,
    borderRadius: 12,
    height: 52,
  },
  buttonContainer: {
    gap: 12,
    backgroundColor: "transparent",
  },
  resendButton: {
    marginBottom: 16,
    borderRadius: 12,
    height: 52,
  },
  securityContainer: {
    alignItems: "center",
    marginTop: 16,
    gap: 12,
    backgroundColor: "transparent",
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  securityText: {
    marginLeft: 8,
    fontSize: 13,
  },
  disclaimerText: {
    textAlign: "center",
    fontSize: 13,
    color: "#666666",
  },
  linkText: {
    color: "#3B82F6",
    textDecorationLine: "underline",
    fontSize: 13,
  },
  otpContainer: {
    marginBottom: 24,
    backgroundColor: "transparent",
  },
});
