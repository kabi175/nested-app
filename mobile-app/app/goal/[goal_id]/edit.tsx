import { GoalFormCard } from "@/components/goal/create/GoalFormCard";
import { ThemedText } from "@/components/ThemedText";
import { useEducation } from "@/hooks/useEducation";
import { useGoal } from "@/hooks/useGoal";
import { useGoalFormAnimations } from "@/hooks/useGoalFormAnimations";
import { useUpdateGoal } from "@/hooks/useUpdateGoal";
import { Education } from "@/types/education";
import { GoalForm } from "@/types/goalForm";
import { calculateFutureCost } from "@/utils/goalForm";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditGoalScreen() {
    const { goal_id } = useLocalSearchParams<{
        goal_id: string;
    }>();

    const { data: goal, isLoading: goalLoading } = useGoal(goal_id);
    const updateGoalMutation = useUpdateGoal();
    const {
        courses,
        institutions,
        isLoading: isLoadingEducation,
    } = useEducation();

    const [goalForm, setGoalForm] = useState<GoalForm | null>(null);
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

    // Convert Goal to GoalForm when goal data and education data are loaded
    useEffect(() => {
        if (goal && courses.length > 0 && institutions.length > 0) {
            const targetYear = goal.targetDate.getFullYear();

            // Find the education from courses or institutions if educationId exists
            let foundEducation: Education | undefined = undefined;
            let selectionMode: "course" | "college" = "course";
            let degree = "Choose a course";
            let college = "Select Dream College";

            if (goal.educationId) {
                // Search in courses first
                foundEducation = courses.find((edu) => edu.id === goal.educationId);
                if (foundEducation) {
                    selectionMode = "course";
                    degree = foundEducation.name;
                } else {
                    // Search in institutions
                    foundEducation = institutions.find((edu) => edu.id === goal.educationId);
                    if (foundEducation) {
                        selectionMode = "college";
                        college = foundEducation.name;
                    }
                }
            }

            setGoalForm({
                id: goal.id,
                type: "undergraduate", // Default, can be inferred from title or other logic
                title: goal.title,
                degree: degree,
                college: college,
                currentCost: foundEducation?.lastYearFee || 0,
                targetYear: targetYear,
                futureCost: foundEducation
                    ? calculateFutureCost(foundEducation, targetYear)
                    : goal.targetAmount,
                selectionMode: selectionMode,
                education: foundEducation,
                childId: goal.childId,
            });
        } else if (goal && !isLoadingEducation) {
            // If goal is loaded but education data is still loading or not available
            const targetYear = goal.targetDate.getFullYear();
            setGoalForm({
                id: goal.id,
                type: "undergraduate",
                title: goal.title,
                degree: "Choose a course",
                college: "Select Dream College",
                currentCost: 0,
                targetYear: targetYear,
                futureCost: goal.targetAmount,
                selectionMode: "course",
                education: undefined,
                childId: goal.childId,
            });
        }
    }, [goal, courses, institutions, isLoadingEducation]);

    const updateGoal = (goalId: string, field: keyof GoalForm, value: any) => {
        setGoalForm((prev) => {
            if (!prev || prev.id !== goalId) return prev;
            const updatedGoal = { ...prev, [field]: value };

            // Recalculate future cost when education or target year changes
            if (field === "education" || field === "targetYear") {
                const education =
                    field === "education" ? value : updatedGoal.education;
                const targetYear =
                    field === "targetYear" ? value : updatedGoal.targetYear;
                if (education) {
                    updatedGoal.currentCost = education.lastYearFee || 0;
                    updatedGoal.futureCost = calculateFutureCost(education, targetYear);
                }
            }

            return updatedGoal;
        });
    };

    const updateSelectionMode = (goalId: string, mode: "course" | "college") => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        animateInputSection(goalId);
        updateGoal(goalId, "selectionMode", mode);
        updateGoal(goalId, "education", undefined); // Reset education when mode changes
    };

    const toggleDropdown = (key: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setExpandedDropdowns((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const toggleTitleEdit = (goalId: string) => {
        setEditingTitle((prev) => ({
            ...prev,
            [goalId]: !prev[goalId],
        }));
    };

    const handleCancel = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    const handleSave = async () => {
        if (!goalForm) return;

        if (!goalForm.education?.id) {
            Alert.alert(
                "Select education",
                "Please select a course or college before saving."
            );
            return;
        }

        try {
            await updateGoalMutation.mutateAsync({
                goalId: goal_id,
                goal: {
                    title: goalForm.title,
                    targetAmount: goalForm.futureCost,
                    targetDate: new Date(goalForm.targetYear, 5, 1),
                    educationId: goalForm.education.id,
                },
            });

            router.back();
        } catch (error) {
            console.error("Error updating goal:", error);
            Alert.alert("Error", "Failed to update goal. Please try again.");
        }
    };

    if (goalLoading || !goalForm) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#2563EB" />
            </SafeAreaView>
        );
    }

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
                <ScrollView
                    style={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <GoalFormCard
                        goal={goalForm}
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
                        onRemoveGoal={() => { }} // Not applicable for edit screen
                    />

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancel}
                        >
                            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                updateGoalMutation.isPending && styles.saveButtonDisabled,
                            ]}
                            onPress={handleSave}
                            disabled={updateGoalMutation.isPending}
                        >
                            {updateGoalMutation.isPending ? (
                                <View style={styles.saveButtonLoading}>
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                    <ThemedText style={[styles.saveButtonText, { marginLeft: 8 }]}>
                                        Saving...
                                    </ThemedText>
                                </View>
                            ) : (
                                <ThemedText style={styles.saveButtonText}>Save</ThemedText>
                            )}
                        </TouchableOpacity>
                    </View>
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
    buttonContainer: {
        flexDirection: "row",
        gap: 12,
        marginTop: 20,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 24,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#E5E7EB",
    },
    cancelButtonText: {
        color: "#374151",
        fontSize: 18,
        fontWeight: "600",
    },
    saveButton: {
        flex: 1,
        backgroundColor: "#2563EB",
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 24,
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
    saveButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
    },
    saveButtonDisabled: {
        backgroundColor: "#9CA3AF",
        opacity: 0.7,
    },
    saveButtonLoading: {
        flexDirection: "row",
        alignItems: "center",
    },
});
