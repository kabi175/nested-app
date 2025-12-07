import { createInvestor } from "@/api/userApi";
import { userAtom } from "@/atoms/user";
import { Redirect, Stack } from "expo-router";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Layout() {
  const user = useAtomValue(userAtom);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (user && !user.is_ready_to_invest) {
      createInvestor(user).catch((error) => {
        console.error("Failed to create investor:", error);
      });
    }
  }, [user]);

  if (user && user.kycStatus !== "completed") {
    return <Redirect href="/kyc" />;
  }

  return (
    <Stack>
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
          title: "Verify Payment",
        }}
      />
      <Stack.Screen
        name="processing"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[payment_id]/success"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[payment_id]/failure"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
