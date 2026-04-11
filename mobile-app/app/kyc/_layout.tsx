import { KycProvider } from "@/providers/KycProvider";
import { Text } from "@ui-kitten/components";
import { Stack } from "expo-router";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import React from "react";
import { Platform, StatusBar as RNStatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});

export default function KYCRootLayout() {
  return (
    <KycProvider>
      <ExpoStatusBar style="dark" />
      {Platform.OS === "android" && (
        <RNStatusBar translucent={false} barStyle="dark-content" />
      )}
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Stack
        screenOptions={{
          headerTitleAlign: "center",
          headerTitle: (props) => <Text category="s1">{props.children}</Text>,
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />

        <Stack.Screen
          name="basic-details"
          options={{ title: "KYC • Basic Details" }}
        />
        <Stack.Screen
          name="basic-confirmation"
          options={{ title: "KYC • Confirm PAN Details" }}
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
      </SafeAreaView>
    </KycProvider>
  );
}
