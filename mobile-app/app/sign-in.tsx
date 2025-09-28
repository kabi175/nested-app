import { Ionicons } from "@expo/vector-icons";
import {
  FirebaseAuthTypes,
  getAuth,
  signInWithPhoneNumber,
} from "@react-native-firebase/auth";
import { Link, router } from "expo-router";

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
import { LinearGradient } from "expo-linear-gradient";
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
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Layout style={styles.container}>
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
          <Layout style={styles.contentContainer}>
            {/* Title */}
            <Layout
              style={[
                styles.titleContainer,
                { backgroundColor: "transparent" },
              ]}
            >
              <Text category="h4" style={styles.title}>
                {title}
              </Text>
              <Text category="s1" appearance="hint" style={styles.subtitle}>
                {subtitle}
              </Text>
            </Layout>

            {/* Phone Input Row */}
            <Layout
              style={[styles.inputRow, { backgroundColor: "transparent" }]}
            >
              {/* Country Code Select */}
              <Select
                style={styles.countrySelect}
                placeholder="Country"
                value={countryCode}
                selectedIndex={
                  new IndexPath(
                    countryCodes.findIndex((item) => item.value === countryCode)
                  )
                }
                onSelect={(index) => {
                  const selectedIndex = Array.isArray(index) ? index[0] : index;
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

            {/* OTP Input (shown after phone verification) */}
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
                accessoryLeft={() => (isLoading ? <LoadingIndicator /> : <></>)}
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </Button>
            )}

            {/* Verify OTP Button */}
            {confirm && (
              <Layout
                style={[
                  styles.buttonContainer,
                  { backgroundColor: "transparent" },
                ]}
              >
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
                  TnC
                </Link>{" "}
                and{" "}
                <Link href="https://expo.dev" style={styles.linkText}>
                  Privacy Policy
                </Link>{" "}
                by proceeding.
              </Text>
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
  inputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  countrySelect: {
    minWidth: 100,
  },
  phoneInput: {
    flex: 1,
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
  disclaimerText: {
    textAlign: "center",
  },
  linkText: {
    color: "#3B82F6",
    textDecorationLine: "underline",
    fontSize: 12,
  },
  otpContainer: {
    marginBottom: 24,
  },
});
