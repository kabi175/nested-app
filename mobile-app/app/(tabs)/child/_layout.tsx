import { Stack } from "expo-router";
import React from "react";

export default function ChildLayout() {
  return (
    <Stack
      screenOptions={{
        title: "Test3030",
        headerShown: false,
      }}
    >
      <Stack.Screen name="create" />
    </Stack>
  );
}
