import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { CrashlyticsErrorBoundary } from "@/components/CrashlyticsErrorBoundary";
import { ForceUpdateScreen } from "@/components/ForceUpdateScreen";
import SplashScreenComponent from "@/components/v2/SplashScreen";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useForceUpdate } from "@/hooks/useForceUpdate";
import { useOnboardingSeen } from "@/hooks/useOnboardingSeen";
import { usePersistRoute } from "@/hooks/usePersistRoute";
import { QueryProvider } from "@/providers/QueryProvider";
import { RouteRestoredProvider, useRouteRestored } from "@/providers/RouteRestoredProvider";
import * as eva from "@eva-design/eva";
import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
} from "@expo-google-fonts/instrument-sans";
import { getAnalytics, logScreenView } from "@react-native-firebase/analytics";
import { getPerformance } from "@react-native-firebase/perf";
import { ApplicationProvider } from "@ui-kitten/components";
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import React, { useEffect, useState } from "react";
import { Text, TextInput } from "react-native";
import { Auth0Provider, useAuth0 } from "react-native-auth0";
import { Settings } from 'react-native-fbsdk-next';
import { SafeAreaProvider } from "react-native-safe-area-context";

interface TextWithDefaultProps extends React.FunctionComponent<any> {
  defaultProps?: any;
}

((Text as unknown) as TextWithDefaultProps).defaultProps =
  ((Text as unknown) as TextWithDefaultProps).defaultProps || {};
((Text as unknown) as TextWithDefaultProps).defaultProps.style = {
  fontFamily: "InstrumentSans_400Regular",
};

((TextInput as unknown) as TextWithDefaultProps).defaultProps =
  ((TextInput as unknown) as TextWithDefaultProps).defaultProps || {};
((TextInput as unknown) as TextWithDefaultProps).defaultProps.style = {
  fontFamily: "InstrumentSans_400Regular",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
    InstrumentSans_700Bold,
  });
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    getPerformance().dataCollectionEnabled = !__DEV__;
    requestTrackingPermissionsAsync().then(({ status }) => {
      Settings.setAdvertiserTrackingEnabled(status === 'granted');
      Settings.initializeSDK();
    });
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (!loaded) {
    // Async font loading only occurs in development.
    return <SplashScreenComponent />;
  }

  const customMapping = {
    strict: {
      "text-font-family": "InstrumentSans_400Regular",
    },
    components: {},
  };

  return (
    <CrashlyticsErrorBoundary>
      <ApplicationProvider {...eva} theme={eva.light} customMapping={customMapping}>
        <QueryProvider>
          <RouteRestoredProvider>
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
                <StatusBar style="auto" backgroundColor="transparent" translucent />
              </ThemeProvider>
            </Auth0Provider>
          </RouteRestoredProvider>
        </QueryProvider>
        {showSplash && (
          <SplashScreenComponent onFinish={handleSplashFinish} />
        )}
      </ApplicationProvider>
    </CrashlyticsErrorBoundary>
  );
}

function VersionCheckGuard({ children }: { children: React.ReactNode }) {
  const { isUpdateRequired, config, isLoading } = useForceUpdate();

  if (isLoading) {
    return <SplashScreenComponent />;
  }

  if (isUpdateRequired) {
    return <ForceUpdateScreen config={config} />;
  }

  return <>{children}</>;
}

const StorybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === "true";
export const unstable_settings = {
  initialRouteName: StorybookEnabled ? "(storybook)/index" : "(tabs)",
};

function RootNavigator() {
  const { user } = useAuth0();
  const { seen } = useOnboardingSeen();
  const pathname = usePathname();
  const { isRestored, markRestored } = useRouteRestored();
  usePersistRoute();

  // When the app opens via deep link (e.g. browser returning after payment
  // authorization), app/index.tsx is bypassed and RestoreLastRoute never runs.
  // markRestored() would never be called, leaving isRestored=false and
  // usePersistRoute saving nothing. Fix: mark restored as soon as we're at any
  // non-index route so persistence kicks in regardless of entry point.
  useEffect(() => {
    if (!isRestored && pathname !== "/") {
      markRestored();
    }
  }, [isRestored, pathname, markRestored]);

  useEffect(() => {
    if (!__DEV__) {
      logScreenView(getAnalytics(), { screen_name: pathname, screen_class: pathname });
    }
  }, [pathname]);

  // Still reading AsyncStorage — show branded splash
  if (seen === null) {
    return <SplashScreenComponent />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Protected guard={StorybookEnabled}>
        <Stack.Screen name="(storybook)/index" />
      </Stack.Protected>

      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="payment" />
        <Stack.Screen name="bank-accounts" />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="name-input" options={{ headerShown: false }} />
        <Stack.Screen name="view-story" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!user}>
        {/* First-time visitors see onboarding; returning visitors go to sign-in */}
        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false, presentation: "card" }}
          redirect={seen}
        />
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
