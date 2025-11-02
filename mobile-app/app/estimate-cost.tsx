import EducationCostEstimator from "@/components/EducationCostEstimator";
import { Layout } from "@ui-kitten/components";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet } from "react-native";

export default function EstimateCost() {
  return (
    <SafeAreaView style={styles.rootContainer}>
      <StatusBar style="auto" backgroundColor="#F8F7FF" />
      <Layout style={styles.container}>
        <EducationCostEstimator />
      </Layout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    height: "100%",
    width: "100%",
    flex: 1,
  },
  container: {
    height: "100%",
    width: "100%",
    flex: 1,
    paddingTop: 24,
  },
  content: {
    flex: 1,
    gap: 16,
  },
});
