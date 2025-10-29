import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import AuthProvider from "@/components/auth";
import { useAuth } from "@/hooks/auth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { QueryProvider } from "@/providers/QueryProvider";
import * as eva from "@eva-design/eva";
import { ApplicationProvider } from "@ui-kitten/components";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <QueryProvider>
        <AuthProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <SafeAreaProvider>
              <RootNavigator />
            </SafeAreaProvider>
            <StatusBar style="auto" />
          </ThemeProvider>
        </AuthProvider>
      </QueryProvider>
    </ApplicationProvider>
  );
}

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

function RootNavigator() {
  const auth = useAuth();
  const hasEnteredName = auth.isSignedIn && auth.user?.displayName !== null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Protected guard={hasEnteredName === true}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="payment" />
        <Stack.Screen name="+not-found" />
      </Stack.Protected>

      <Stack.Protected
        guard={auth.isSignedIn === true && hasEnteredName !== true}
      >
        <Stack.Screen name="name-input" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={auth.isSignedIn === false}>
        <Stack.Screen
          name="sign-in"
          options={{ headerShown: false, presentation: "card" }}
        />
      </Stack.Protected>
    </Stack>
  );
}
