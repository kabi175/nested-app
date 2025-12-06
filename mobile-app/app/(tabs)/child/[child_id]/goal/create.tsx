import { goalsForCustomizeAtom } from "@/atoms/goals";
import { AddGoalButton } from "@/components/goal/create/AddGoalButton";
import { ChildSelector } from "@/components/goal/create/ChildSelector";
import { CreateGoalHeader } from "@/components/goal/create/CreateGoalHeader";
import { GoalFormCard } from "@/components/goal/create/GoalFormCard";
import { SaveGoalButton } from "@/components/goal/create/SaveGoalButton";
import { useChildren } from "@/hooks/useChildren";
import { useEducation } from "@/hooks/useEducation";
import { useGoalCreation } from "@/hooks/useGoalCreation";
import { useGoalFormAnimations } from "@/hooks/useGoalFormAnimations";
import { GoalForm } from "@/types/goalForm";
import { calculateFutureCost } from "@/utils/goalForm";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateGoalScreen() {
  const { child_id } = useLocalSearchParams<{ child_id?: string | string[] }>();
  const routeChildId = Array.isArray(child_id) ? child_id[0] : child_id;
  const { data: children, isLoading: isLoadingChildren } = useChildren();
  const setGoalsForCustomize = useSetAtom(goalsForCustomizeAtom);
  const createGoalMutation = useGoalCreation();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const {
    courses,
    institutions,
    isLoading: isLoadingEducation,
  } = useEducation();

  const [goals, setGoals] = useState<GoalForm[]>([]);

  useEffect(() => {
    const selectedChild = children?.find(
      (child) => child.id === selectedChildId
    );

    if (
      selectedChild &&
      !goals.find((goal) => goal.childId === selectedChildId)
    ) {
      console.log("goal added for child", selectedChild.firstName);
      setGoals((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "undergraduate",
          title: `${selectedChild?.firstName}'s Graduation`,
          degree: "Choose a course",
          college: "Select Dream College",
          currentCost: 2500000,
          targetYear: 2030,
          futureCost: 4500000,
          selectionMode: "course",
          childId: selectedChildId,
        },
      ]);
    }
  }, [children, selectedChildId]);

  const [expandedDropdowns, setExpandedDropdowns] = useState<{
    [key: string]: boolean;
  }>({});
  const [editingTitle, setEditingTitle] = useState<{
    [key: string]: boolean;
  }>({});

  const {
    fadeAnim,
    slideAnim,
    scaleAnim,
    pulseAnim,
    inputSectionAnimations,
    animateInputSection,
  } = useGoalFormAnimations();

  useEffect(() => {
    if (!children || children.length === 0) {
      return;
    }

    const preferredChildId: string | null = (() => {
      if (routeChildId && children.some((child) => child.id === routeChildId)) {
        return routeChildId;
      }
      return children[0]?.id ?? null;
    })();

    setSelectedChildId((prev) => prev ?? preferredChildId);

    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.childId) {
          return goal;
        }
        return {
          ...goal,
          childId: preferredChildId,
        };
      })
    );
  }, [children, routeChildId]);

  const updateGoal = (goalId: string, field: keyof GoalForm, value: any) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === goalId) {
          const updatedGoal = { ...goal, [field]: value };

          // Recalculate future cost when education or target year changes
          if (field === "education" || field === "targetYear") {
            const education =
              field === "education" ? value : updatedGoal.education;
            const targetYear =
              field === "targetYear" ? value : updatedGoal.targetYear;
            updatedGoal.currentCost = education?.lastYearFee || 0;
            updatedGoal.futureCost = calculateFutureCost(education, targetYear);
          }

          return updatedGoal;
        }
        return goal;
      })
    );
  };

  const updateSelectionMode = (goalId: string, mode: "course" | "college") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateInputSection(goalId);
    updateGoal(goalId, "selectionMode", mode);
  };

  const removeGoal = (goalId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const goalIndex = goals.findIndex((goal) => goal.id === goalId);
    if (goalIndex === -1) return;

    // Create a scale animation for the specific goal card
    const scaleAnim = new Animated.Value(1);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
    });
  };

  const addGoal = () => {
    const selectedChild = children?.find(
      (child) => child.id === selectedChildId
    );
    const newGoal: GoalForm = {
      id: Date.now().toString(),
      type: "postgraduate",
      title: `${selectedChild?.firstName}'s Postgraduation`,
      degree: "Choose a course",
      college: "Select Dream College",
      currentCost: 2500000,
      targetYear: 2030,
      futureCost: 4500000,
      selectionMode: "course",
      childId:
        selectedChildId ||
        ((routeChildId &&
          children?.some((child) => child.id === routeChildId) &&
          routeChildId) as string) ||
        children?.[0]?.id ||
        null,
    };

    setGoals((prev) => [...prev, newGoal]);
  };

  const toggleDropdown = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    try {
      // Get all goals that have a childId assigned (not just visible ones)
      const allGoalsWithChild = goals.filter((goal) => goal.childId);
      const goalsMissingChild = goals.filter((goal) => !goal.childId);

      if (goalsMissingChild.length > 0) {
        Alert.alert(
          "Select a child",
          "Please choose a child for each goal before proceeding."
        );
        return;
      }

      const goalsMissingEducation = allGoalsWithChild.filter(
        (goal) => !goal.education?.id
      );

      if (goalsMissingEducation.length > 0) {
        Alert.alert(
          "Select education",
          "Please select a course or college for each goal before proceeding."
        );
        return;
      }

      if (allGoalsWithChild.length === 0) {
        Alert.alert(
          "No goals to save",
          "Please create at least one goal with a child selected."
        );
        return;
      }

      const data = allGoalsWithChild.map((goal) => ({
        childId: goal.childId!,
        educationId: goal.education!.id,
        title:
          goal.title ||
          (goal.type === "undergraduate" ? "Undergraduate" : "Postgraduate"),
        targetAmount: goal.futureCost,
        targetDate: new Date(goal.targetYear, 5, 1),
      }));

      const createdGoals = await createGoalMutation.mutateAsync(data);

      setGoalsForCustomize(createdGoals);
      //TODO: redirect to
      const nextChildId = selectedChildId || data[0]?.childId;
      if (nextChildId) {
        router.push(`/child/${nextChildId}/goal/customize`);
      }
    } catch (error) {
      console.error("Error saving goals:", error);
      // TODO: Show error message to user
    }
  };

  if (isLoadingChildren) {
    return <ActivityIndicator size="large" color="#2563EB" />;
  }

  const toggleTitleEdit = (goalId: string) => {
    setEditingTitle((prev) => ({
      ...prev,
      [goalId]: !prev[goalId],
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <CreateGoalHeader />

        {children && (
          <ChildSelector
            childList={children}
            selectedChildId={selectedChildId}
            onSelectChild={setSelectedChildId}
          />
        )}

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {goals
            .filter((goal) => goal.childId === selectedChildId)
            .map((goal) => (
              <GoalFormCard
                key={goal.id}
                goal={goal}
                courses={courses}
                institutions={institutions}
                isLoadingEducation={isLoadingEducation}
                expandedDropdowns={expandedDropdowns}
                editingTitle={editingTitle}
                inputSectionAnimations={inputSectionAnimations}
                pulseAnim={pulseAnim}
                onToggleDropdown={toggleDropdown}
                onUpdateGoal={updateGoal}
                onUpdateSelectionMode={updateSelectionMode}
                onToggleTitleEdit={toggleTitleEdit}
                onRemoveGoal={removeGoal}
              />
            ))}

          <AddGoalButton onPress={addGoal} />

          <SaveGoalButton
            onPress={handleSave}
            isLoading={createGoalMutation.isPending}
          />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FF",
  },
  animatedContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
});
