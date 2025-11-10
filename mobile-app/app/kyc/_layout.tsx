import { KycProvider } from "@/providers/KycProvider";
import { Text } from "@ui-kitten/components";
import { Stack } from "expo-router";
import React from "react";

export default function KYCRootLayout() {
  return (
    <KycProvider>
      <Stack
        screenOptions={{
          headerTitleAlign: "center",
          headerTitle: (props) => <Text category="s1">{props.children}</Text>,
        }}
      >
        <Stack.Screen
          name="basic-details"
          options={{ title: "KYC • Basic Details" }}
        />
        <Stack.Screen
          name="identity"
          options={{ title: "KYC • Identity Proof" }}
        />
        <Stack.Screen name="address" options={{ title: "KYC • Address" }} />
        <Stack.Screen
          name="photo-signature"
          options={{ title: "KYC • Photo & Signature" }}
        />
        <Stack.Screen
          name="financial"
          options={{ title: "KYC • Financial & Residency" }}
        />
        <Stack.Screen
          name="review"
          options={{ title: "KYC • Review & eSign" }}
        />
      </Stack>
    </KycProvider>
  );
}
