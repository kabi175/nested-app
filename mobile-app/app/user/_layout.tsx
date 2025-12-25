import { Stack } from "expo-router";
import React from "react";

export default function UserLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="email-update"
        options={{ headerShown: false, presentation: "card" }}
      />
    </Stack>
  );
}
