import { createInvestor } from "@/api/userApi";
import { userAtom } from "@/atoms/user";
import { Redirect, Stack } from "expo-router";
import { useAtomValue } from "jotai";
import { useEffect } from "react";

export default function Layout() {
  const user = useAtomValue(userAtom);

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
          headerShown: true,
          title: "Complete Your Payment",
          headerStyle: {
            backgroundColor: "#FFFFFF",
          },
          headerTintColor: "#000000",
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 20,
          },
        }}
      />
      <Stack.Screen
        name="verify"
        options={{
          headerShown: true,
          title: "Verify Payment",
          headerStyle: {
            backgroundColor: "#FFFFFF",
          },
          headerTintColor: "#000000",
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 20,
          },
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
