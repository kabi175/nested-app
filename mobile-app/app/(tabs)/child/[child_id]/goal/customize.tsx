import { CreateOrderRequest } from "@/api/paymentAPI";
import { cartAtom } from "@/atoms/cart";
import { goalsForCustomizeAtom } from "@/atoms/goals";
import { ThemedText } from "@/components/ThemedText";
import Slider from "@/components/ui/Slider";
import ToggleCard from "@/components/ui/ToggleCard";
import { useCreateOrders } from "@/hooks/useCreateOrders";
import { useSIPCalculator } from "@/hooks/useSIPCalculator";
import { formatCurrency } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { Button, Datepicker } from "@ui-kitten/components";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
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

const MAX_SIP_AMOUNT = 1_00_000; // 1 lakh
const MAX_LUMPSUM_AMOUNT = 5_00_000; // 5 lakh
const MAX_STEPUP_AMOUNT = 10_000; // 10 thousand

const getSipStartDate = (today = new Date()): Date => {
  const d = new Date(today);

  if (d.getDate() > 28) {
    // Move to 1st of next month
    d.setDate(1);
    d.setMonth(d.getMonth() + 1);
  }

  return d;
};

export default function CustomizeInvestmentScreen() {
  const goalsForCustomize = useAtomValue(goalsForCustomizeAtom);
  const minInvestment = goalsForCustomize
    .map((goal) => goal.basket.min_investment)
    .reduce((a, b) => a + b, 0);

  const targetDate = goalsForCustomize
    .map((goal) => goal.targetDate)
    .sort((a, b) => a.getTime() - b.getTime())[0];

  const targetAmount = goalsForCustomize
    .map((goal) => goal.targetAmount)
    .reduce((a, b) => a + b, 0);

  const {
    lumpSumAmount,
    stepUpAmount,
    sipAmount,
    setSipAmount,
    setLumpSumAmount,
    setStepUpAmount,
  } = useSIPCalculator(targetDate, targetAmount);

  // Calculate step size: 100 * number of goals
  const sipStep =
    goalsForCustomize.length > 0 ? 100 * goalsForCustomize.length : 100;

  // Normalize SIP amount to be a multiple of the step
  const normalizedSipAmount = Math.max(minInvestment, Math.round(sipAmount / sipStep) * sipStep);

  // Handler for SIP amount changes that enforces step increments
  const handleSipAmountChange = (value: number) => {
    const normalized = Math.round(value / sipStep) * sipStep;
    setSipAmount(normalized);
  };

  // Handler for lump sum amount changes that enforces multiples of 100
  const handleLumpSumAmountChange = (value: number) => {
    const normalized = Math.round(value / 100) * 100;
    setLumpSumAmount(normalized);
  };

  // Handler for step-up amount changes that enforces multiples of 100
  const handleStepUpAmountChange = (value: number) => {
    const normalized = Math.round(value / 100) * 100;
    setStepUpAmount(normalized);
  };

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [sipAmountAnim] = useState(new Animated.Value(1));
  const setCart = useSetAtom(cartAtom);

  const minDate = React.useMemo(() => getSipStartDate(), []);
  const maxDate = React.useMemo(
    () => new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
    []
  );
  // SIP Date state
  const [sipDate, setSipDate] = useState(() => getSipStartDate());

  // React Query mutation for creating orders
  const createOrdersMutation = useCreateOrders();

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

    // Prepare orders array for all goals
    const orders: CreateOrderRequest[] = [];

    // Calculate total target amount for proportional distribution
    const totalTargetAmount = goalsForCustomize.reduce(
      (sum, goal) => sum + goal.targetAmount,
      0
    );

    // Guard against empty goals or zero total
    if (goalsForCustomize.length === 0 || totalTargetAmount === 0) {
      return;
    }

    // Create orders for each goal with proportional distribution
    goalsForCustomize.forEach((goal) => {
      // Calculate proportional amounts based on target amount
      const proportion = goal.targetAmount / totalTargetAmount;
      // Round to nearest 100 for each goal's amount
      const goalSipAmount =
        Math.round((normalizedSipAmount * proportion) / 100) * 100;
      const goalLumpSumAmount =
        lumpSumAmount > 0
          ? Math.round((lumpSumAmount * proportion) / 100) * 100
          : 0;
      const goalStepUpAmount =
        stepUpAmount > 0
          ? Math.round((stepUpAmount * proportion) / 100) * 100
          : 0;

      // Add SIP order for this goal
      if (goalSipAmount > 0) {
        orders.push({
          type: "sip" as const,
          amount: goalSipAmount,
          start_date: sipDate,
          yearly_setup: goalStepUpAmount > 0 ? goalStepUpAmount : undefined,
          goalId: goal.id,
        });
      }

      // Add lump sum order for this goal if specified
      if (goalLumpSumAmount > 0) {
        orders.push({
          type: "buy" as const,
          amount: goalLumpSumAmount,
          goalId: goal.id,
        });
      }
    });

    // Trigger mutation
    const orderResponse = await createOrdersMutation.mutateAsync({
      orders,
    });

    setCart(orderResponse);

    router.replace("/child/1/goal/loading");
  };

  const formatDateForSchedule = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
    });
  };

  const handleDateChange = (selectedDate: Date) => {
    const d = new Date(selectedDate);

    // If user selects 29, 30, or 31
    if (d.getDate() > 28) {
      d.setDate(1);
      d.setMonth(d.getMonth() + 1);
    }

    setSipDate(d);
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
            onPress={() => router.replace("/child")}
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
                {formatCurrency(normalizedSipAmount)}
              </Animated.Text>
            </View>

            <Slider
              min={minInvestment}
              max={MAX_SIP_AMOUNT}
              value={normalizedSipAmount}
              onValueChange={handleSipAmountChange}
              step={sipStep}
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
                min={minDate}
                max={maxDate}
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
            onValueChange={handleLumpSumAmountChange}
            inputLabel="Lump Sum Amount"
            max={MAX_LUMPSUM_AMOUNT}
          />

          {/* Add Step-Up Plan Card */}
          <ToggleCard
            title="Add Step-Up Plan"
            subtitle="Increase SIP annually"
            initialValue={stepUpAmount}
            onValueChange={handleStepUpAmountChange}
            inputLabel="Annual Step-Up Amount"
            max={MAX_STEPUP_AMOUNT}
          />

          {/* Continue Button */}
          <Button
            style={[
              styles.continueButton,
              createOrdersMutation.isPending && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={createOrdersMutation.isPending}
            size="large"
            status="primary"
          >
            {createOrdersMutation.isPending ? "Creating Orders..." : "Continue"}
          </Button>
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
