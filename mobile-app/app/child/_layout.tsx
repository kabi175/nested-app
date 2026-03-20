import { Stack } from "expo-router";
import React from "react";

export default function ChildLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
      <Stack.Screen
        name="modal"
        options={{ presentation: "transparentModal" }}
      />
    </Stack>
  );
}
