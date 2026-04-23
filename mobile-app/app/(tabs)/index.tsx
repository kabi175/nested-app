import { LinearGradient } from "expo-linear-gradient";
import { router, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import CompleteKycComponent from "@/components/v2/CompleteKycComponent";
import CostCalculatorCard from "@/components/v2/CostCalculatorCard";
import GoalPlanCard from "@/components/v2/GoalPlanCard";
import HomeHeader from "@/components/v2/HomeHeader";
import HowNestedHelpsSection from "@/components/v2/HowNestedHelpsSection";
import QuickActionsBar from "@/components/v2/QuickActionsBar";
import ReferralCard from "@/components/v2/ReferralCard";
import SuperFdCard from "@/components/v2/SuperFdCard";
import TestimonialsSection from "@/components/v2/TestimonialsSection";
import { useChildren } from "@/hooks/useChildren";
import { useEducationGoals } from "@/hooks/useGoals";
import { useUser } from "@/hooks/useUser";
import { formatIndianCompact } from "@/utils/formatters";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: user } = useUser();
  const { data: children } = useChildren();
  const { data: goals } = useEducationGoals();

  const isKycCompleted = user?.kycStatus === "completed";
  const isInvestedInAnyGoal = goals ? goals.some((g) => g.currentAmount > 0) : false;
  const hasGoals = !!goals && goals.length > 0;
  const showKycCard = !isKycCompleted || !hasGoals;

  const totalCurrentAmount = goals?.reduce((sum, g) => sum + g.currentAmount, 0) ?? 0;
  const totalMonthlySip = goals
    ?.map((g) => g.monthlySip)
    .filter((v): v is number => !!v)
    .reduce((a, b) => a + b, 0);

  const childName = children?.[0]?.firstName;
  const monthlyAmount = totalMonthlySip
    ? `₹${formatIndianCompact(totalMonthlySip)}/mo`
    : undefined;

  function handleContinueKyc() {
    if (isKycCompleted) {
      router.push(children?.length === 0 ? "/child/create" : "/child/select");
    } else {
      router.push("/kyc");
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#2848F1", "#2848F1", "rgba(255,253,249,0)"]}
          locations={[0, 0.2, 1.0]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientSection}
        >
          <HomeHeader
            paddingTop={insets.top + 16}
            userInitial={user?.firstName?.[0]?.toUpperCase() ?? "U"}
            firstName={user?.firstName ?? ""}
            totalCurrentAmount={totalCurrentAmount}
          />

          <QuickActionsBar />

          {showKycCard && (
            <View style={styles.kycCard}>
              <CompleteKycComponent
                childName={childName}
                monthlyAmount={monthlyAmount}
                onPressContinue={handleContinueKyc}
              />
            </View>
          )}

          {isKycCompleted && hasGoals && (
            <View style={styles.planCardWrapper}>
              <GoalPlanCard key={goals![0].id} goal={goals![0]} />
            </View>
          )}
        </LinearGradient>

        {isKycCompleted && hasGoals && goals!.length > 1 && (
          <View style={styles.planCardWrapper}>
            {goals!.slice(1).map((g) => (
              <GoalPlanCard key={g.id} goal={g} />
            ))}
          </View>
        )}

        {isKycCompleted && hasGoals && isInvestedInAnyGoal && (
          <TouchableOpacity
            style={styles.addGoalButton}
            onPress={() => router.push("/child/select")}
            activeOpacity={0.7}
          >
            <Plus size={16} color="#2848F1" strokeWidth={2} />
            <Text style={styles.addGoalText}>Add goal</Text>
          </TouchableOpacity>
        )}

        <SuperFdCard onPress={() => router.push("/(tabs)/super-fd")} />

        <CostCalculatorCard />

        <HowNestedHelpsSection />

        <TestimonialsSection />

        <ReferralCard />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFDF9",
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: 16,
  },
  gradientSection: {
    gap: 16,
    paddingBottom: 24,
  },
  kycCard: {
    marginHorizontal: 16,
    backgroundColor: "#F5F5FA",
    borderRadius: 24,
    overflow: "hidden",
  },
  planCardWrapper: {
    marginHorizontal: 16,
    gap: 12,
  },
  addGoalButton: {
    marginHorizontal: 16,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#C4C4C4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFDF9",
  },
  addGoalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2848F1",
    letterSpacing: 0.2,
  },
});
