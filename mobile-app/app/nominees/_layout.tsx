import { Stack } from "expo-router";
import React from "react";

export default function NomineesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="verify"
        options={{
          headerShown: false,
          title: "Verify Nominees",
        }}
      />
    </Stack>
  );
}

