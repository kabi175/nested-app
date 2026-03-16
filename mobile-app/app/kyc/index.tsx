import PendingActionScreen from "@/components/v2/PendingActionScreen";
import { useCreateInvestor } from "@/hooks/useCreateInvestor";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Alert } from "react-native";

export default function KycIntroScreen() {
  const router = useRouter();
  const { data: user, isLoading: isUserLoading } = useUser();
  const createInvestorMutation = useCreateInvestor();

  useEffect(() => {
    if (user && user.kycStatus === "completed" && !user.is_ready_to_invest) {
      createInvestorMutation.mutate(user, {
        onError: (error) => {
          console.error("Failed to create investor:", error);
        },
        onSuccess: () => {
          router.replace("/nominees");
        },
      });
    }
  }, [user, createInvestorMutation, router]);

  const handleContinue = async () => {
    if (!user?.email) {
      router.replace("/user/email-update?redirectUrl=/kyc");
      return;
    }

    if (!user) {
      Alert.alert(
        "Profile unavailable",
        "We couldn't load your profile. Please try again."
      );
      return;
    }

    switch (user.kycStatus) {
      case "aadhaar_pending":
        router.push("/kyc/aadhaar-upload");
        break;
      case "esign_pending":
        router.push("/kyc/esign-upload");
        break;
      case "submitted":
        router.push("/kyc/waiting-for-approval");
        break;
      case "completed":
        router.push("/kyc/kyc-success");
        break;
      default:
        router.push("/kyc/basic-details");
        break;
    }
  };

  return (
    <PendingActionScreen onContinue={handleContinue} />
  );
}

