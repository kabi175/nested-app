import OnboardingScreen from "@/components/v2/OnboardingScreen";
import { useOnboardingSeen } from "@/hooks/useOnboardingSeen";
import { router } from "expo-router";

export default function OnboardingRoute() {
  const { markSeen } = useOnboardingSeen();

  const handleDone = async () => {
    await markSeen();
    router.replace("/sign-in");
  };

  return (
    <OnboardingScreen
      onSkip={handleDone}
      onFinish={handleDone}
    />
  );
}
