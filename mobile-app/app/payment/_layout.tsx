import { createInvestor } from "@/api/userApi";
import { userAtom } from "@/atoms/user";
import {
  Text,
  TopNavigation,
  TopNavigationAction,
} from "@ui-kitten/components";
import { Redirect, router, Stack } from "expo-router";
import { useAtomValue } from "jotai";
import { ArrowLeft } from "lucide-react-native";
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
          presentation: "card",
        }}
      />
    </Stack>
  );
}

const BackAction = (): React.ReactElement => (
  <TopNavigationAction
    icon={() => <ArrowLeft strokeWidth={3} />}
    onPress={() => router.push("/child")}
  />
);

export const TopNavigationSimpleUsageShowcase = (): React.ReactElement => (
  <TopNavigation
    accessoryLeft={BackAction}
    title={() => <Text category="h6">Complete Your Payment</Text>}
  />
);
