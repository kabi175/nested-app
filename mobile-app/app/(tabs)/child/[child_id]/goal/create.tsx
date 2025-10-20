import { ThemedText } from "@/components/ThemedText";
import { useGoalCreation } from "@/hooks/useGoalCreation";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, usePathname } from "expo-router";
import {
  ChevronDown,
  ChevronUp,
  Edit3,
  Plus,
  Trash2,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Goal {
  id: string;
  type: "undergraduate" | "postgraduate";
  degree: string;
  college: string;
  currentCost: number;
  targetYear: number;
  futureCost: number;
  selectionMode: "course" | "college";
  education?: Education;
}

export interface Education {
  id: string;
  name: string;
}

const DEGREE_OPTIONS = {
  undergraduate: [
    "Tier 1 B.Tech",
    "Tier 2 B.Tech",
    "B.Com",
    "B.Sc",
    "B.A",
    "BBA",
    "B.Arch",
    "B.Pharm",
  ],
  postgraduate: [
    "Tier 1 MBA",
    "Tier 2 MBA",
    "M.Tech",
    "M.Com",
    "M.Sc",
    "M.A",
    "MS",
    "M.Arch",
  ],
};

const COLLEGE_OPTIONS = [
  "IIT Delhi",
  "IIT Bombay",
  "IIT Madras",
  "IISc Bangalore",
  "IIM Ahmedabad",
  "IIM Bangalore",
  "IIM Calcutta",
  "NIT Trichy",
  "BITS Pilani",
  "Custom College",
];

const COST_ESTIMATES = {
  undergraduate: {
    "Tier 1 B.Tech": 1500000,
    "Tier 2 B.Tech": 800000,
    "B.Com": 500000,
    "B.Sc": 400000,
    "B.A": 300000,
    BBA: 600000,
    "B.Arch": 1200000,
    "B.Pharm": 800000,
  },
  postgraduate: {
    "Tier 1 MBA": 2500000,
    "Tier 2 MBA": 1500000,
    "M.Tech": 1000000,
    "M.Com": 400000,
    "M.Sc": 500000,
    "M.A": 300000,
    MS: 2000000,
    "M.Arch": 1500000,
  },
};

export default function CreateGoalScreen() {
  const childId = usePathname();

  const createGoalMutation = useGoalCreation();
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      type: "undergraduate",
      degree: "Choose a course",
      college: "Select Dream College",
      currentCost: 2500000,
      targetYear: 2030,
      futureCost: 4500000,
      selectionMode: "course",
      education: null,
    },
  ]);

  const [expandedDropdowns, setExpandedDropdowns] = useState<{
    [key: string]: boolean;
  }>({});
  const [inputSectionAnimations, setInputSectionAnimations] = useState<{
    [key: string]: Animated.Value;
  }>({});

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation for future cost
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
  }, []);

  const calculateFutureCost = (currentCost: number, targetYear: number) => {
    const currentYear = new Date().getFullYear();
    const years = targetYear - currentYear;
    const inflationRate = 0.08; // 8% annual inflation
    return Math.round(currentCost * Math.pow(1 + inflationRate, years));
  };

  const updateGoal = (goalId: string, field: keyof Goal, value: any) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === goalId) {
          const updatedGoal = { ...goal, [field]: value };
          if (field === "degree" || field === "currentCost") {
            updatedGoal.futureCost = calculateFutureCost(
              field === "currentCost" ? value : updatedGoal.currentCost,
              updatedGoal.targetYear
            );
          } else if (field === "targetYear") {
            updatedGoal.futureCost = calculateFutureCost(
              updatedGoal.currentCost,
              value
            );
          }
          return updatedGoal;
        }
        return goal;
      })
    );
  };

  const updateSelectionMode = (goalId: string, mode: "course" | "college") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate the input section transition
    const currentAnim = inputSectionAnimations[goalId] || new Animated.Value(1);

    Animated.sequence([
      Animated.timing(currentAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(currentAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setInputSectionAnimations((prev) => ({
      ...prev,
      [goalId]: currentAnim,
    }));

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const newGoal: Goal = {
      id: Date.now().toString(),
      type: "undergraduate",
      degree: "Choose a course",
      college: "Select Dream College",
      currentCost: 2500000,
      targetYear: 2030,
      futureCost: 4500000,
      selectionMode: "course",
    };

    // Add with animation
    setGoals((prev) => [...prev, newGoal]);

    // Animate the add button
    const buttonScale = new Animated.Value(1);
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleDropdown = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate save button
    const saveButtonScale = new Animated.Value(1);
    Animated.sequence([
      Animated.timing(saveButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(saveButtonScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const data = goals.map((goal) => ({
        childId,
        education: { id: "", name: goal.degree },
        title: `${goal.degree} - ${goal.college}`,
        targetAmount: goal.futureCost,
        targetDate: new Date(goal.targetYear, 5, 1),
      }));

      await createGoalMutation.mutateAsync(data);

      //TODO: redirect to
      router.push(`/child/${childId}/goal/customize`);
    } catch (error) {
      console.error("Error saving goals:", error);
      // TODO: Show error message to user
    }
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
        {/* Header */}
        <LinearGradient
          colors={["#F8F7FF", "#E8E3FF"]}
          style={styles.headerSection}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#2563EB" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Create Goals</ThemedText>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {goals.map((goal, index) => (
            <Animated.View
              key={goal.id}
              style={[
                styles.goalCard,
                {
                  transform: [
                    {
                      translateY: new Animated.Value(0),
                    },
                  ],
                },
              ]}
            >
              {/* Goal Header */}
              <View style={styles.goalHeader}>
                <View style={styles.goalTitleContainer}>
                  <ThemedText style={styles.goalTitle}>
                    {goal.type === "undergraduate"
                      ? `Undergraduate`
                      : "Post-Graduate"}
                  </ThemedText>
                  <TouchableOpacity style={styles.editButton}>
                    <Edit3 size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeGoal(goal.id)}
                >
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>

              {/* Selection Mode Toggle */}
              <Animated.View style={styles.selectionModeContainer}>
                <TouchableOpacity
                  style={[
                    styles.selectionModeButton,
                    goal.selectionMode === "course" &&
                      styles.selectionModeButtonActive,
                  ]}
                  onPress={() => updateSelectionMode(goal.id, "course")}
                >
                  <ThemedText
                    style={[
                      styles.selectionModeText,
                      goal.selectionMode === "course" &&
                        styles.selectionModeTextActive,
                    ]}
                  >
                    Course Type
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.selectionModeButton,
                    goal.selectionMode === "college" &&
                      styles.selectionModeButtonActive,
                  ]}
                  onPress={() => updateSelectionMode(goal.id, "college")}
                >
                  <ThemedText
                    style={[
                      styles.selectionModeText,
                      goal.selectionMode === "college" &&
                        styles.selectionModeTextActive,
                    ]}
                  >
                    Dream College
                  </ThemedText>
                </TouchableOpacity>
              </Animated.View>

              {/* Dynamic Input Section */}
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
                  <>
                    <ThemedText style={styles.inputLabel}>
                      Select Course Type
                    </ThemedText>
                    <TouchableOpacity
                      style={styles.dropdown}
                      onPress={() => toggleDropdown(`${goal.id}-degree`)}
                    >
                      <ThemedText style={styles.dropdownText}>
                        {goal.degree}
                      </ThemedText>
                      <ChevronDown size={20} color="#6B7280" />
                    </TouchableOpacity>

                    {expandedDropdowns[`${goal.id}-degree`] && (
                      <Animated.View
                        style={[
                          styles.dropdownOptions,
                          {
                            opacity: expandedDropdowns[`${goal.id}-degree`]
                              ? 1
                              : 0,
                            transform: [
                              {
                                translateY: expandedDropdowns[
                                  `${goal.id}-degree`
                                ]
                                  ? 0
                                  : -10,
                              },
                            ],
                          },
                        ]}
                      >
                        {DEGREE_OPTIONS[goal.type].map((degree, index) => (
                          <Animated.View
                            key={degree}
                            style={{
                              opacity: expandedDropdowns[`${goal.id}-degree`]
                                ? 1
                                : 0,
                              transform: [
                                {
                                  translateX: expandedDropdowns[
                                    `${goal.id}-degree`
                                  ]
                                    ? 0
                                    : -20,
                                },
                              ],
                            }}
                          >
                            <TouchableOpacity
                              style={styles.dropdownOption}
                              onPress={() => {
                                updateGoal(goal.id, "degree", degree);
                                updateGoal(
                                  goal.id,
                                  "currentCost",
                                  COST_ESTIMATES[goal.type][
                                    degree as keyof (typeof COST_ESTIMATES)[typeof goal.type]
                                  ]
                                );
                                toggleDropdown(`${goal.id}-degree`);
                              }}
                            >
                              <ThemedText style={styles.dropdownOptionText}>
                                {degree}
                              </ThemedText>
                            </TouchableOpacity>
                          </Animated.View>
                        ))}
                      </Animated.View>
                    )}
                  </>
                ) : (
                  <>
                    <ThemedText style={styles.inputLabel}>
                      Select Dream College
                    </ThemedText>
                    <TouchableOpacity
                      style={styles.dropdown}
                      onPress={() => toggleDropdown(`${goal.id}-college`)}
                    >
                      <ThemedText style={styles.dropdownText}>
                        {goal.college}
                      </ThemedText>
                      <ChevronDown size={20} color="#6B7280" />
                    </TouchableOpacity>

                    {expandedDropdowns[`${goal.id}-college`] && (
                      <Animated.View style={styles.dropdownOptions}>
                        {COLLEGE_OPTIONS.map((college) => (
                          <TouchableOpacity
                            key={college}
                            style={styles.dropdownOption}
                            onPress={() => {
                              updateGoal(goal.id, "college", college);
                              toggleDropdown(`${goal.id}-college`);
                            }}
                          >
                            <ThemedText style={styles.dropdownOptionText}>
                              {college}
                            </ThemedText>
                          </TouchableOpacity>
                        ))}
                      </Animated.View>
                    )}
                  </>
                )}
              </Animated.View>

              {/* Cost and Timeline */}
              <View style={styles.costTimelineContainer}>
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>
                    Today's Approx Cost
                  </ThemedText>
                  <View style={styles.costInputContainer}>
                    <ThemedText style={styles.currencySymbol}>₹</ThemedText>
                    <TextInput
                      style={styles.costInput}
                      value={goal.currentCost.toLocaleString("en-IN")}
                      onChangeText={(text) => {
                        const value = parseInt(text.replace(/,/g, "")) || 0;
                        updateGoal(goal.id, "currentCost", value);
                      }}
                      keyboardType="numeric"
                      placeholder="0"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Target Year</ThemedText>
                  <View style={styles.yearInputContainer}>
                    <TextInput
                      style={styles.yearInput}
                      value={goal.targetYear.toString()}
                      onChangeText={(text) => {
                        const value =
                          parseInt(text) || new Date().getFullYear();
                        updateGoal(goal.id, "targetYear", value);
                      }}
                      keyboardType="numeric"
                    />
                    <View style={styles.yearControls}>
                      <TouchableOpacity
                        style={styles.yearButton}
                        onPress={() =>
                          updateGoal(goal.id, "targetYear", goal.targetYear + 1)
                        }
                      >
                        <ChevronUp size={16} color="#6B7280" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.yearButton}
                        onPress={() =>
                          updateGoal(goal.id, "targetYear", goal.targetYear - 1)
                        }
                      >
                        <ChevronDown size={16} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

              {/* Future Cost Display */}
              <Animated.View
                style={[
                  styles.futureCostContainer,
                  {
                    transform: [
                      {
                        scale: pulseAnim,
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.futureCostHeader}>
                  <ThemedText style={styles.futureCostLabel}>
                    Expected Future Cost
                  </ThemedText>
                  <TouchableOpacity style={styles.editButton}>
                    <Edit3 size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                <View style={styles.futureCostInputContainer}>
                  <ThemedText style={styles.currencySymbol}>₹</ThemedText>
                  <TextInput
                    style={styles.futureCostInput}
                    value={goal.futureCost.toLocaleString("en-IN")}
                    onChangeText={(text) => {
                      const value = parseInt(text.replace(/,/g, "")) || 0;
                      updateGoal(goal.id, "futureCost", value);
                    }}
                    keyboardType="numeric"
                  />
                </View>
                <ThemedText style={styles.futureCostDescription}>
                  Calculated based on 7% annual inflation
                </ThemedText>
              </Animated.View>
            </Animated.View>
          ))}

          {/* Add Goal Button */}
          <TouchableOpacity style={styles.addGoalButton} onPress={addGoal}>
            <Plus size={24} color="#2563EB" />
            <ThemedText style={styles.addGoalText}>Add another goal</ThemedText>
          </TouchableOpacity>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              createGoalMutation.isPending && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={createGoalMutation.isPending}
          >
            {createGoalMutation.isPending ? (
              <View style={styles.saveButtonLoading}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <ThemedText style={[styles.saveButtonText, { marginLeft: 8 }]}>
                  Saving...
                </ThemedText>
              </View>
            ) : (
              <ThemedText style={styles.saveButtonText}>Next</ThemedText>
            )}
          </TouchableOpacity>
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
  headerSection: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
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
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  goalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginRight: 8,
  },
  editButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 8,
  },
  selectionModeContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  selectionModeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  selectionModeButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectionModeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  selectionModeTextActive: {
    color: "#1F2937",
    fontWeight: "600",
  },
  inputSection: {
    marginBottom: 16,
  },
  dropdown: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 16,
    color: "#1F2937",
  },
  dropdownOptions: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownOptionText: {
    fontSize: 16,
    color: "#1F2937",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#6B7280",
  },
  costTimelineContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  costInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    marginRight: 8,
  },
  costInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  yearInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  yearInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  yearControls: {
    flexDirection: "column",
    marginLeft: 8,
  },
  yearButton: {
    padding: 4,
  },
  futureCostContainer: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  futureCostHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  futureCostLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  futureCostInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  futureCostInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  futureCostDescription: {
    fontSize: 12,
    color: "#6B7280",
  },
  addGoalButton: {
    borderWidth: 2,
    borderColor: "#2563EB",
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  addGoalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
    marginTop: 8,
  },
  saveButton: {
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
