import { useCreateInvestor } from "@/hooks/useCreateInvestor";
import { useUser } from "@/hooks/useUser";
import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";

export default function Layout() {
  const { data: user } = useUser();
  const createInvestorMutation = useCreateInvestor();

  useEffect(() => {
    if (user && user.kycStatus === "completed" && !user.is_ready_to_invest) {
      createInvestorMutation.mutate(user, {
        onError: (error) => {
          console.error("Failed to create investor:", error);
        },
      });
    }
  }, [user, createInvestorMutation]);

  if (user && user.kycStatus !== "completed") {
    return <Redirect href="/kyc" />;
  }

  if (
    user &&
    user.kycStatus === "completed" &&
    user.is_ready_to_invest &&
    user.nominee_status === "unknown"
  ) {
    return <Redirect href="/nominees" />;
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
