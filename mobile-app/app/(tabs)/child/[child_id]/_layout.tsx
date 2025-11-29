import { Stack } from "expo-router";
import React from "react";

export default function ChildLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="goal" />
    </Stack>
  );
}
