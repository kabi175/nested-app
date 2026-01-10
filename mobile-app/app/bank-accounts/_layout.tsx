import { Stack } from "expo-router";
import React from "react";

export default function BankAccountsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="list" />
      <Stack.Screen name="add-manual" />
      <Stack.Screen name="success" />
      <Stack.Screen name="failure" />
      <Stack.Screen name="cancelled" />
    </Stack>
  );
}
