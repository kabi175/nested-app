import { userAtom } from "@/atoms/user";
import {
  Text,
  TopNavigation,
  TopNavigationAction,
} from "@ui-kitten/components";
import { Redirect, router, Stack } from "expo-router";
import { useAtomValue } from "jotai";
import { ArrowLeft } from "lucide-react-native";

export default function Layout() {
  const user = useAtomValue(userAtom);

  if (user && user.status !== "completed") {
    return <Redirect href="/kyc" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ header: () => <TopNavigationSimpleUsageShowcase /> }}
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
    title={() => <Text category="h6">Payment Method</Text>}
  />
);
