import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Goal } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GoalScreen() {
  const handleCreateChild = () => {
    router.push("/child/create");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <LinearGradient
          colors={["#F8F7FF", "#E8E3FF"]}
          style={styles.headerSection}
        >
          <View style={styles.headerContent}>
            {/* <Ionicons name="target" size={48} color="#" /> */}
            <Goal size={48} color="#2563EB" />
            <ThemedText style={styles.headerTitle}>
              Educational Goals
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Plan and invest for your child's educational future
            </ThemedText>
          </View>
        </LinearGradient>

        <ThemedView style={styles.mainCard}>
          <View style={styles.cardContent}>
            <ThemedText style={styles.sectionTitle}>Start Planning</ThemedText>

            <ThemedText style={styles.description}>
              Create educational goals for your children and start investing
              towards their future.
            </ThemedText>

            <TouchableOpacity
              style={styles.createChildButton}
              onPress={handleCreateChild}
            >
              <Ionicons name="person-add" size={24} color="#FFFFFF" />
              <ThemedText style={styles.createChildButtonText}>
                Add Child & Create Goals
              </ThemedText>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FF",
  },
  scrollContainer: {
    flex: 1,
  },
  headerSection: {
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    minHeight: 200,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    marginTop: 20,
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#6B7280",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  mainCard: {
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: "#FFFFFF",
  },
  cardContent: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#1F2937",
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
    marginBottom: 32,
  },
  createChildButton: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  createChildButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 12,
  },
});
