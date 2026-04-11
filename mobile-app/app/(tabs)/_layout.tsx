import { Redirect, Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Database, House, User } from "lucide-react-native";
import { useAuth0 } from "react-native-auth0";

export default function TabLayout() {
  const { user } = useAuth0();

  if (!user) {
    console.log("Redirecting to sign-in");
    return <Redirect href="/sign-in" />;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#141B34",
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: "absolute",
              backgroundColor: "#F4F4F4",
              height: 80,
              paddingTop: 12,
              paddingBottom: 20,
            },
            default: {
              backgroundColor: "#F4F4F4",
              height: 70,
              paddingTop: 10,
              paddingBottom: 10,
            },
          }),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <House size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="super-fd"
          options={{
            title: "Super FD",
            tabBarIcon: ({ color }) => <Database size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: "Account",
            tabBarIcon: ({ color }) => <User size={24} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}
