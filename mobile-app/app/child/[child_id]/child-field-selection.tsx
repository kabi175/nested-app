import Button from "@/components/v2/Button";
import ErrorScreen from "@/components/v2/ErrorScreen";
import LoadingScreen from "@/components/v2/LoadingScreen";
import PathCard from "@/components/v2/PathCard";
import { useChild } from "@/hooks/useChildren";
import { useEducations } from "@/hooks/useEducations";
import { useGoalCreation } from "@/hooks/useGoalCreation";
import { calculateFutureCost } from "@/utils/goalForm";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import ArtsIcon from "@/assets/images/v2/education-plan/art-design.svg";
import IitsIcon from "@/assets/images/v2/education-plan/iit-nit.svg";
import MbaIcon from "@/assets/images/v2/education-plan/mba.svg";
import MedicalIcon from "@/assets/images/v2/education-plan/medical.svg";
import StudyAbroadIcon from "@/assets/images/v2/education-plan/study-abroad.svg";
import TopCollegesIcon from "@/assets/images/v2/education-plan/top-colleges.svg";

const ICON_SIZE = 120;

const PATHS = [
  {
    id: "top-colleges",
    title: "Top colleges India",
    icon: <TopCollegesIcon width={ICON_SIZE} height={ICON_SIZE} style={{ bottom: -15 }} />,
  },
  {
    id: "study-abroad",
    title: "Study Abroad",
    icon: <StudyAbroadIcon width={ICON_SIZE} height={ICON_SIZE} style={{ bottom: -15 }} />,
  },
  {
    id: "medical",
    title: "Medical/MBBS",
    icon: <MedicalIcon width={ICON_SIZE} height={ICON_SIZE} style={{ bottom: -15 }} />,
  },
  {
    id: "mba",
    title: "MBA/IIM",
    icon: <MbaIcon width={ICON_SIZE} height={ICON_SIZE} style={{ bottom: -18 }} />,
  },
  {
    id: "arts",
    title: "Arts & Design",
    icon: <ArtsIcon width={ICON_SIZE} height={ICON_SIZE} style={{ bottom: -15 }} />,
  },
  {
    id: "iits",
    title: "IITs/NITs",
    icon: <IitsIcon width={ICON_SIZE} height={ICON_SIZE} style={{ bottom: -30 }} />,
  },
];

export default function ChildFieldSelectionScreen() {
  const { child_id } = useLocalSearchParams<{ child_id: string }>();
  const { data: child, isLoading: isChildLoading } = useChild(child_id);
  const { courses, isLoading: isEducationLoading } = useEducations();
  const insets = useSafeAreaInsets();
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const createGoalMutation = useGoalCreation();

  if (isChildLoading || isEducationLoading) return <LoadingScreen />;
  if (!child) return <ErrorScreen />;

  async function handleContinue() {
    if (!selectedPath || !child) return;
    const pathTitle = PATHS.find((p) => p.id === selectedPath)?.id;
    const education = courses?.find((c) => c.name === pathTitle);
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color="#1A1A1A" />
        </Pressable>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Choose a field</Text>
        </View>
        <Text style={styles.subtitle}>
          Every plan we build is as unique as they are.
        </Text>

        <View style={styles.grid}>
          {PATHS.map((path, index) => {
            const isLeft = index % 2 === 0;
            return (
              <View
                key={path.id}
                style={[styles.gridItem, isLeft ? styles.gridItemLeft : styles.gridItemRight]}
              >
                <PathCard
                  title={path.title}
                  icon={path.icon}
                  selected={selectedPath === path.id}
                  onPress={() =>
                    setSelectedPath((prev) => (prev === path.id ? null : path.id))
                  }
                />
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button title="Continue" disabled={!selectedPath} loading={createGoalMutation.isPending} onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
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
  titleContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  subtitle: {
    fontSize: 14,
    color: "#7A7A7A",
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  gridItem: {
    width: "50%",
    paddingVertical: 6,
  },
  gridItemLeft: {
    paddingLeft: 6,
    paddingRight: 6,
  },
  gridItemRight: {
    paddingLeft: 6,
    paddingRight: 6,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: "#FFFFFF",
  },
});
