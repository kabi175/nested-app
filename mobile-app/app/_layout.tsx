import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { ForceUpdateScreen } from "@/components/ForceUpdateScreen";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useForceUpdate } from "@/hooks/useForceUpdate";
import { usePersistRoute } from "@/hooks/usePersistRoute";
import { QueryProvider } from "@/providers/QueryProvider";
import * as eva from "@eva-design/eva";
import { ApplicationProvider } from "@ui-kitten/components";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Auth0Provider, useAuth0 } from "react-native-auth0";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  usePersistRoute();

  if (!loaded) {
    // Async font loading only occurs in development.
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <QueryProvider>
        <Auth0Provider
          domain={process.env.EXPO_PUBLIC_AUTH0_DOMAIN}
          clientId={process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID}
        >
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <SafeAreaProvider>
              <VersionCheckGuard>
                <RootNavigator />
              </VersionCheckGuard>
            </SafeAreaProvider>
            <StatusBar style="auto" />
          </ThemeProvider>
        </Auth0Provider>
      </QueryProvider>
    </ApplicationProvider>
  );
}

function VersionCheckGuard({ children }: { children: React.ReactNode }) {
  const { isUpdateRequired, config, isLoading } = useForceUpdate();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (isUpdateRequired) {
    return <ForceUpdateScreen config={config} />;
  }

  return <>{children}</>;
}

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

function RootNavigator() {
  const { user } = useAuth0();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="payment" />
        <Stack.Screen name="bank-accounts" />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="name-input" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!user}>
        <Stack.Screen
          name="sign-in"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="test-sign"
          options={{ headerShown: false, presentation: "card" }}
        />
      </Stack.Protected>
    </Stack>
  );
}
