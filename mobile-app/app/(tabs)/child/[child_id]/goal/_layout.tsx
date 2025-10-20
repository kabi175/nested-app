import { Stack } from "expo-router";
import React from "react";

export default function GoalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="create" />
      <Stack.Screen name="customize" />
      <Stack.Screen name="loading" />
      <Stack.Screen name="success" />
    </Stack>
  );
}
