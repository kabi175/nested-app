import { Redirect, Tabs } from "expo-router";
import React from "react";

import { BottomTabBar } from "@/components/BottomTabBar";
import { useAuth0 } from "react-native-auth0";

export default function TabLayout() {
  const { user } = useAuth0();

  if (!user) {
    console.log("Redirecting to sign-in");
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="super-fd" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}
