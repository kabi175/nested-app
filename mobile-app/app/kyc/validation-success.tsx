import { useInitKyc } from "@/hooks/useInitKyc";
import { useUser } from "@/hooks/useUser";
import { Button, Layout, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ValidationSuccessScreen() {
  const router = useRouter();
  const { mutateAsync: initKyc } = useInitKyc();
  const [isContinuing, setIsContinuing] = useState(false);
  const { data: user, refetch: refetchUser } = useUser();

  const routeToNextStep = (kycStatus: string | undefined) => {
    switch (kycStatus) {
      case "aadhaar_pending":
        router.push("/kyc/aadhaar-upload");
        break;
      case "esign_pending":
        router.push("/kyc/esign-upload");
        break;
      case "approved":
        router.push("/bank-accounts");
        break;
      case "rejected":
        router.push("/kyc/failure");
        break;
      case "cancelled":
        router.push("/kyc/cancelled");
        break;
      case "submitted":
        router.push("/kyc/waiting-for-approval");
        break;
      default:
        // Default fallback if status is not recognized
        router.push("/kyc/waiting-for-approval");
        break;
    }
  };

  const handleContinue = async () => {
    if (!user) return;
    setIsContinuing(true);
    try {
      await refetchUser();
      let kycStatus = user.kycStatus;

      const needsKycInit =
        kycStatus === "unknown" ||
        kycStatus === "pending" ||
        kycStatus === "failed" ||
        kycStatus === undefined;

      if (needsKycInit) {
        await initKyc(user);
        const refreshedUser = await refetchUser();
        kycStatus = refreshedUser.data?.kycStatus || "aadhaar_pending";
      }

      routeToNextStep(kycStatus);
    } catch (error) {
      console.error("Error initiating KYC:", error);
    } finally {
      setIsContinuing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <Layout level="1" style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <CheckCircle size={80} color="#10B981" />
          </View>
          <View style={styles.textContainer}>
            <Text category="h4" style={styles.title}>
              Verification Successful!
            </Text>
            <Text appearance="hint" category="s1" style={styles.subtitle}>
              Your details have been successfully verified. You can now proceed to
              complete your KYC application.
            </Text>
          </View>
        </View>
        <Button
          size="large"
          onPress={handleContinue}
          style={styles.button}
          disabled={isContinuing}
        >
          {isContinuing ? "Please wait..." : "Continue"}
        </Button>
      </Layout>
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
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: "space-between",
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
  },
  iconContainer: {
    marginBottom: 8,
  },
  textContainer: {
    gap: 12,
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    fontWeight: "700",
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  button: {
    width: "100%",
  },
});
