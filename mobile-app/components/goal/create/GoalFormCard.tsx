import { GoalForm } from "@/types/goalForm";
import { Education } from "@/types/education";
import { calculateFutureCost } from "@/utils/goalForm";
import { useGoalFormAnimations } from "@/hooks/useGoalFormAnimations";
import { CostTimelineInputs } from "./CostTimelineInputs";
import { EducationDropdown } from "./EducationDropdown";
import { FutureCostDisplay } from "./FutureCostDisplay";
import { GoalFormHeader } from "./GoalFormHeader";
import { SelectionModeToggle } from "./SelectionModeToggle";
import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import * as Haptics from "expo-haptics";

interface GoalFormCardProps {
  goal: GoalForm;
  courses: Education[];
  institutions: Education[];
  isLoadingEducation: boolean;
  expandedDropdowns: { [key: string]: boolean };
  editingTitle: { [key: string]: boolean };
  inputSectionAnimations: { [key: string]: Animated.Value };
  pulseAnim: Animated.Value;
  onToggleDropdown: (key: string) => void;
  onUpdateGoal: (goalId: string, field: keyof GoalForm, value: any) => void;
  onUpdateSelectionMode: (goalId: string, mode: "course" | "college") => void;
  onToggleTitleEdit: (goalId: string) => void;
  onRemoveGoal: (goalId: string) => void;
}

export function GoalFormCard({
  goal,
  courses,
  institutions,
  isLoadingEducation,
  expandedDropdowns,
  editingTitle,
  inputSectionAnimations,
  pulseAnim,
  onToggleDropdown,
  onUpdateGoal,
  onUpdateSelectionMode,
  onToggleTitleEdit,
  onRemoveGoal,
}: GoalFormCardProps) {
  const handleEducationSelect = (education: Education) => {
    onUpdateGoal(goal.id, "education", education);
    if (goal.selectionMode === "course") {
      onUpdateGoal(goal.id, "degree", education.name);
    } else {
      onUpdateGoal(goal.id, "college", education.name);
    }
  };

  const handleSelectionModeChange = (mode: "course" | "college") => {
    onUpdateSelectionMode(goal.id, mode);
  };

  const handleTargetYearChange = (year: number) => {
    onUpdateGoal(goal.id, "targetYear", year);
    if (goal.education) {
      const futureCost = calculateFutureCost(goal.education, year);
      onUpdateGoal(goal.id, "futureCost", futureCost);
    }
  };

  const handleCurrentCostChange = (cost: number) => {
    onUpdateGoal(goal.id, "currentCost", cost);
  };

  const handleFutureCostChange = (cost: number) => {
    onUpdateGoal(goal.id, "futureCost", cost);
  };

  return (
    <Animated.View style={styles.goalCard}>
      <GoalFormHeader
        title={goal.title}
        isEditing={editingTitle[goal.id] || false}
        onTitleChange={(title) => onUpdateGoal(goal.id, "title", title)}
        onEditToggle={() => onToggleTitleEdit(goal.id)}
        onDelete={() => onRemoveGoal(goal.id)}
      />

      <SelectionModeToggle
        selectionMode={goal.selectionMode}
        onModeChange={handleSelectionModeChange}
      />

      <Animated.View
        style={[
          styles.inputSection,
          {
            opacity: inputSectionAnimations[goal.id] || 1,
            transform: [
              {
                scale: inputSectionAnimations[goal.id] || 1,
              },
            ],
          },
        ]}
      >
        {goal.selectionMode === "course" ? (
          <EducationDropdown
            label="Select Course Type"
            selectedValue={goal.degree}
            options={courses}
            isLoading={isLoadingEducation}
            isExpanded={expandedDropdowns[`${goal.id}-degree`] || false}
            onToggle={() => onToggleDropdown(`${goal.id}-degree`)}
            onSelect={handleEducationSelect}
            goalId={goal.id}
          />
        ) : (
          <EducationDropdown
            label="Select Dream College"
            selectedValue={goal.college}
            options={institutions}
            isLoading={isLoadingEducation}
            isExpanded={expandedDropdowns[`${goal.id}-college`] || false}
            onToggle={() => onToggleDropdown(`${goal.id}-college`)}
            onSelect={handleEducationSelect}
            goalId={goal.id}
          />
        )}
      </Animated.View>

      <CostTimelineInputs
        currentCost={goal.currentCost}
        targetYear={goal.targetYear}
        onCurrentCostChange={handleCurrentCostChange}
        onTargetYearChange={handleTargetYearChange}
      />

      <FutureCostDisplay
        futureCost={goal.futureCost}
        hasEducation={!!goal.education}
        pulseAnim={pulseAnim}
        onFutureCostChange={handleFutureCostChange}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  goalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputSection: {
    marginBottom: 16,
  },
});

