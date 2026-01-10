import { userAtom } from "@/atoms/user";
import { NetworkErrorScreen } from "@/components/NetworkErrorScreen";
import { useUser } from "@/hooks/useUser";
import { AxiosError } from "axios";
import { Redirect } from "expo-router";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { useAuth0 } from "react-native-auth0";

export default function Home() {
  const { isLoading: isAuthLoading, user: authUser } = useAuth0();
  const { data: user, isLoading, isError, error, refetch } = useUser();
  const setUser = useSetAtom(userAtom);

  const isSignedIn = !!authUser;

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  if (isAuthLoading || isLoading) {
    // show logo
    return (
      <View style={styles.container}>
        <Image
          source={require("@/assets/images/icon.png")} // 👈 put your logo image here
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    );
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
      return <Redirect href="/sign-in" />;
    }
  }

  if (!isLoading && user?.firstName === user?.phone_number) {
    return <Redirect href="/name-input" />;
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/sign-in" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // ✅ white background
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    color: "#333", // dark gray text
    fontSize: 20,
    fontWeight: "600",
  },
});
