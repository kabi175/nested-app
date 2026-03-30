import { useInitKyc } from "@/hooks/useInitKyc";
import { useUser } from "@/hooks/useUser";
import { logKycInitiation } from "@/services/metaEvents";
import Button from "@/components/v2/Button";
import { useRouter } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
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
        logKycInitiation();
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
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <CheckCircle size={80} color="#10B981" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Verification Successful!</Text>
            <Text style={styles.subtitle}>
              Your details have been successfully verified. You can now proceed
              to complete your KYC application.
            </Text>
          </View>
        </View>
        <View style={styles.footer}>
          <Button
            title={isContinuing ? "Please wait..." : "Continue"}
            loading={isContinuing}
            onPress={handleContinue}
          />
        </View>
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
    paddingHorizontal: 24,
    paddingTop: 24,
    justifyContent: "space-between",
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
    fontSize: 24,
    fontWeight: "700",
    color: "#222B45",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    color: "#8F9BB3",
    paddingHorizontal: 16,
  },
  footer: {
    paddingBottom: 16,
  },
});
