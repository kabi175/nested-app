import { Layout, Text } from "@ui-kitten/components";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrdersScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" backgroundColor="#fff" />

      <Layout level="1" style={styles.container}>
        <Text category="h1">Orders</Text>

        <ScrollView>
          <Text category="s1" appearance="hint">
            {" "}
            No orders found{" "}
          </Text>
        </ScrollView>
      </Layout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
});
