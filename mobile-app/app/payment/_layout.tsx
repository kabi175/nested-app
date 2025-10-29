import {
  Text,
  TopNavigation,
  TopNavigationAction,
} from "@ui-kitten/components";
import { router, Stack } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

export default function Layout() {
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
