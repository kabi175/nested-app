import { KycProvider } from "@/providers/KycProvider";
import { Text } from "@ui-kitten/components";
import { Stack } from "expo-router";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import React from "react";
import { Platform, StatusBar as RNStatusBar } from "react-native";

export default function KYCRootLayout() {
  return (
    <KycProvider>
      <ExpoStatusBar style="dark" />
      {Platform.OS === "android" && (
        <RNStatusBar translucent={false} barStyle="dark-content" />
      )}
      <Stack
        screenOptions={{
          headerTitleAlign: "center",
          headerTitle: (props) => <Text category="s1">{props.children}</Text>,
          headerShown: true,
        }}
      >
        <Stack.Screen name="index" options={{ title: "KYC • Get Started" }} />
        <Stack.Screen
          name="basic-details"
          options={{ title: "KYC • Basic Details" }}
        />
        <Stack.Screen name="address" options={{ title: "KYC • Address" }} />
        <Stack.Screen
          name="photo-signature"
          options={{ title: "KYC • Photo & Signature" }}
        />
        <Stack.Screen
          name="fatca-decleration"
          options={{ title: "KYC • FATCA Declaration" }}
        />
        <Stack.Screen
          name="financial"
          options={{ title: "KYC • Financial & Residency" }}
        />
        <Stack.Screen
          name="review"
          options={{ title: "KYC • Review & eSign" }}
        />
        <Stack.Screen
          name="aadhaar-upload"
          options={{ title: "KYC • Aadhaar Upload" }}
        />
        <Stack.Screen
          name="esign-upload"
          options={{ title: "KYC • eSign Upload" }}
        />
        <Stack.Screen
          name="waiting-for-approval"
          options={{ title: "KYC • Waiting for Approval" }}
        />
        <Stack.Screen
          name="validation-in-progress"
          options={{ title: "KYC • Verification" }}
        />
        <Stack.Screen
          name="validation-success"
          options={{ title: "KYC • Success" }}
        />
        <Stack.Screen
          name="validation-failure"
          options={{ title: "KYC • Failure" }}
        />
        <Stack.Screen name="kyc-success" options={{ title: "KYC • Success" }} />
      </Stack>
    </KycProvider>
  );
}
