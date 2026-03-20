import { NetworkErrorScreen } from "@/components/NetworkErrorScreen";
import RestoreLastRoute from "@/components/RestoreLastRoute";
import SplashScreenComponent from "@/components/v2/SplashScreen";
import { useOnboardingSeen } from "@/hooks/useOnboardingSeen";
import { useUser } from "@/hooks/useUser";
import { AxiosError } from "axios";
import { Redirect } from "expo-router";
import { useAuth0 } from "react-native-auth0";

export default function Home() {
  const { isLoading: isAuthLoading, user: authUser } = useAuth0();
  const { data: user, isLoading, isError, error, refetch } = useUser();
  const { seen: onboardingSeen } = useOnboardingSeen();

  const isSignedIn = !!authUser;

  if (isAuthLoading || isLoading) {
    return <SplashScreenComponent />;
  }

  // Check if it's a network error (not authentication errors)
  if (isError && error instanceof AxiosError) {
    // Show network error screen for network issues, not for auth errors
    // Auth errors (401, 403) should redirect to sign-in
    const isNetworkError =
      !error.response || // No response = network issue
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT" ||
      error.code === "ECONNREFUSED" ||
      (error.response?.status && error.response.status >= 500); // Server errors

    if (isNetworkError) {
      return (
        <NetworkErrorScreen
          error={error}
          onRetry={() => {
            refetch();
          }}
        />
      );
    }

    // For authentication errors, redirect to sign-in
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log("redirecting to sign-in due to authentication errors");
      return <Redirect href="/sign-in" />;
    }
  }

  if (!isLoading && user?.firstName === user?.phone_number) {
    console.log("redirecting to name-input");
    return <Redirect href="/name-input" />;
  }

  if (isSignedIn) {
    return <RestoreLastRoute />;
  }

  // Not signed in — first-time users see onboarding, returning users see sign-in
  console.log("redirecting to", onboardingSeen === false ? "onboarding" : "sign-in");
  return <Redirect href={onboardingSeen === false ? "/onboarding" : "/sign-in"} />;
}
