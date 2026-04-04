import Button from "@/components/v2/Button";
import CollegeDropdown from "@/components/v2/CollegeDropdown";
import ErrorScreen from "@/components/v2/ErrorScreen";
import LoadingScreen from "@/components/v2/LoadingScreen";
import { useChild } from "@/hooks/useChildren";
import { useEducations } from "@/hooks/useEducations";
import { useGoalCreation } from "@/hooks/useGoalCreation";
import { calculateFutureCost } from "@/utils/goalForm";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChildCollegeSelectionScreen() {
  const { child_id } = useLocalSearchParams<{ child_id: string }>();
  const { data: child, isLoading: isChildLoading } = useChild(child_id);
  const { institutions, isLoading: isEducationLoading } = useEducations();
  const insets = useSafeAreaInsets();
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);
  const createGoalMutation = useGoalCreation();

  if (isChildLoading || isEducationLoading) return <LoadingScreen />;
  if (!child) return <ErrorScreen />;

  async function handleContinue() {
    if (!selectedCollege || !child) return;
    const education = institutions?.find((i) => i.name === selectedCollege);
    if (!education) return;
    const currentYear = new Date().getFullYear();
    const targetYear = Math.max(child.dateOfBirth.getFullYear() + 18, currentYear + 3);

    const targetDate = new Date(child.dateOfBirth);
    targetDate.setFullYear(targetYear);

    const [goal] = await createGoalMutation.mutateAsync([
      {
        childId: child.id,
        educationId: education.id,
        title: `${child.firstName}'s Graduation`,
        targetAmount: calculateFutureCost(education, targetYear),
        targetDate,
      },
    ]);

    router.push({
      pathname: "/education/[gaol_id]",
      params: { gaol_id: goal.id },
    });
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />

      <View style={styles.content}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color="#1A1A1A" />
        </Pressable>

        <Text style={styles.title}>Have a college in mind?</Text>
        <Text style={styles.subtitle}>
          Every plan we build is as unique as they are.
        </Text>

        <View style={styles.dropdownContainer}>
          <CollegeDropdown
            colleges={institutions}
            selectedCollege={selectedCollege}
            onSelectCollege={setSelectedCollege}
          />
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button title="Continue" disabled={!selectedCollege} onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#7A7A7A",
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 32,
  },
  dropdownContainer: {
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: "#FFFFFF",
  },
});
