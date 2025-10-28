import { createOrders } from "@/api/paymentAPI";
import { goalsForCustomizeAtom } from "@/atoms/goals";
import { ThemedText } from "@/components/ThemedText";
import Slider from "@/components/ui/Slider";
import ToggleCard from "@/components/ui/ToggleCard";
import { useSIPCalculator } from "@/hooks/useSIPCalculator";
import { formatCurrency } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { Datepicker } from "@ui-kitten/components";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useAtom } from "jotai";
import { CalendarSync } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CustomizeInvestmentScreen() {
  const {
    goal_id,
    target_amount,
    target_date,
    redirect_on_success: redirectOnSuccess,
  } = useLocalSearchParams<{
    goal_id: string;
    target_amount: string;
    target_date: string;
    redirect_on_success: "true" | "false";
  }>();
  const targetDate = new Date(target_date);

  const targetAmount = Number(target_amount);
  const {
    sipRange,
    lumpSumAmount,
    stepUpAmount,
    sipAmount,
    setSipAmount,
    setLumpSumAmount,
    setStepUpAmount,
  } = useSIPCalculator(targetDate, targetAmount);

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [sipAmountAnim] = useState(new Animated.Value(1));
  const [goals, setGoals] = useAtom(goalsForCustomizeAtom);

  // SIP Date state
  const [sipDate, setSipDate] = useState(new Date());

  // React Query mutation for creating orders
  const createOrdersMutation = useMutation({
    mutationFn: ({
      goalId,
      orders,
    }: {
      goalId: string;
      orders: {
        type: "sip" | "buy";
        amount: number;
        start_date?: Date;
        yearly_setup?: number;
      }[];
    }) => createOrders(goalId, orders),
    onSuccess: () => {
      if (redirectOnSuccess === "true") {
        router.back();
      } else {
        // Navigate to loading screen
        router.push("/child/1/goal/loading");
      }
    },
    onError: (error) => {
      console.error("Error creating orders:", error);
      // TODO: Show error message to user
    },
  });

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

    // Start pulse animation for expected value
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
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
  }, [fadeAnim, slideAnim, scaleAnim, pulseAnim]);

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Prepare orders array
    const orders = [];

    // Add SIP order
    orders.push({
      type: "sip" as const,
      amount: sipAmount,
      start_date: sipDate,
      yearly_setup: stepUpAmount > 0 ? stepUpAmount : undefined,
    });

    // Add lump sum order if specified
    if (lumpSumAmount > 0) {
      orders.push({
        type: "buy" as const,
        amount: lumpSumAmount,
      });
    }

    // Trigger mutation
    const ordersResponse = await createOrdersMutation.mutateAsync({
      goalId: goal_id!,
      orders,
    });

    const goal = goals.find((goal) => goal.id === goal_id);
    if (goal) {
      setGoals(
        goals.map((g) =>
          g.id === goal_id ? { ...g, investment: ordersResponse } : g
        )
      );
    }

    if (redirectOnSuccess === "true") {
      router.back();
    } else {
      // Navigate to loading screen
      router.push("/child/1/goal/loading");
    }
  };

  const formatDateForSchedule = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
    });
  };

  const handleDateChange = (selectedDate: Date) => {
    setSipDate(selectedDate);
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
        <View style={styles.headerSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#2563EB" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <ThemedText style={styles.headerTitle}>
              Customize Your Investment
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Tailor your plan to reach your goals
            </ThemedText>
          </View>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Monthly SIP Amount Card */}
          <Animated.View style={styles.investmentCard}>
            <ThemedText style={styles.cardTitle}>Monthly SIP Amount</ThemedText>
            <ThemedText style={styles.cardSubtitle}>
              Required to start investing
            </ThemedText>

            <View style={styles.sipAmountContainer}>
              <Animated.Text
                style={[
                  styles.sipAmount,
                  {
                    transform: [{ scale: sipAmountAnim }],
                  },
                ]}
              >
                {formatCurrency(sipAmount)}
              </Animated.Text>
            </View>

            <Slider
              min={sipRange[0]}
              max={sipRange[1]}
              value={sipAmount}
              onValueChange={setSipAmount}
            />
          </Animated.View>

          {/* SIP Schedule Card */}
          <Animated.View style={styles.investmentCard}>
            <View style={styles.sipScheduleHeader}>
              <CalendarSync color="#3B82F6" size={22} strokeWidth={2} />
              <ThemedText style={styles.cardTitle}>SIP Schedule</ThemedText>
            </View>
            <View style={styles.firstInstallmentHeader}>
              <ThemedText style={styles.firstInstallmentLabel}>
                First Installment Today
              </ThemedText>
            </View>
            <ThemedText style={styles.sipScheduleLabel}>
              SIP Schedule Monthly on {formatDateForSchedule(sipDate)}
            </ThemedText>

            <View style={styles.datePickerContainer}>
              <Datepicker
                date={sipDate}
                onSelect={handleDateChange}
                min={new Date()}
                accessoryRight={() => (
                  <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
                )}
                style={styles.datePicker}
                placeholder="Select SIP Date"
              />
            </View>
          </Animated.View>

          {/* Add Lump Sum Card */}
          <ToggleCard
            title="Add Lump Sum"
            subtitle="One-time investment"
            initialValue={lumpSumAmount}
            onValueChange={setLumpSumAmount}
            inputLabel="Lump Sum Amount"
          />

          {/* Add Step-Up Plan Card */}
          <ToggleCard
            title="Add Step-Up Plan"
            subtitle="Increase SIP annually"
            initialValue={stepUpAmount}
            onValueChange={setStepUpAmount}
            inputLabel="Annual Step-Up Amount"
          />

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              createOrdersMutation.isPending && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={createOrdersMutation.isPending}
          >
            <LinearGradient
              colors={
                createOrdersMutation.isPending
                  ? ["#9CA3AF", "#6B7280"]
                  : ["#8B5CF6", "#3B82F6"]
              }
              style={styles.continueButtonGradient}
            >
              {createOrdersMutation.isPending ? (
                <View style={styles.loadingContainer}>
                  <ThemedText style={styles.continueButtonText}>
                    Creating Orders...
                  </ThemedText>
                </View>
              ) : (
                <ThemedText style={styles.continueButtonText}>
                  Continue
                </ThemedText>
              )}
            </LinearGradient>
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
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  investmentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  sipAmountContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  sipAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1F2937",
  },
  firstInstallmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  firstInstallmentAmount: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 16,
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  firstInstallmentValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 4,
  },
  firstInstallmentLabel: {
    fontSize: 14,
    color: "#065F46",
    fontWeight: "500",
  },
  sipScheduleHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
    gap: 8,
  },
  sipScheduleLabel: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
    marginTop: 8,
    marginBottom: 16,
  },
  datePickerContainer: {
    marginTop: 8,
  },
  datePicker: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderColor: "#D1D5DB",
  },
  summaryCard: {
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
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
    letterSpacing: 1,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  summarySeparator: {
    height: 1,
    backgroundColor: "#FFFFFF",
    opacity: 0.3,
    marginVertical: 16,
  },
  expectedValueContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  expectedValueLeft: {
    flex: 1,
  },
  expectedValueLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  expectedValueSubtext: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  expectedValueAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  continueButton: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonDisabled: {
    opacity: 0.7,
    shadowOpacity: 0.05,
  },
  continueButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: "center",
    borderRadius: 16,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
