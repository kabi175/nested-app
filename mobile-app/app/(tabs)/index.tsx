import { router, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Button from "@/components/v2/Button";
import ChildPlanCard from "@/components/v2/ChildPlanCard";
import CompleteKycComponent from "@/components/v2/CompleteKycComponent";
import FundValueHeader from "@/components/v2/FundValueHeader";
import WhatActivatesSection from "@/components/v2/WhatActivatesSection";
import { useChild, useChildren } from "@/hooks/useChildren";
import { useEducationGoals } from "@/hooks/useGoals";
import { useUser } from "@/hooks/useUser";
import { Goal } from "@/types/investment";

function getAge(dateOfBirth: Date): number {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  ) {
    age--;
  }
  return age;
}

function formatGoalAmount(amount: number): string {
  if (amount >= 10_00_000) {
    const l = amount / 1_00_000;
    return `₹${Number.isInteger(l) ? l : l.toFixed(1)}L`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: user } = useUser();
  const { data: children, isLoading: isChildrenLoading } = useChildren();
  const { data: goals, isLoading: isGoalsLoading } = useEducationGoals();

  const child = children?.[0];

  const childName = child?.firstName;

  const totalMonthlySip = goals?.map(g => g.monthlySip).filter((v): v is number => !!v).reduce((a, b) => a + b, 0);
  const monthlyAmount = totalMonthlySip
    ? `₹${totalMonthlySip.toLocaleString("en-IN")}/mo`
    : undefined;

  const isKycCompleted = user?.kycStatus === "completed";
  const isGoalsEmpty = goals && goals.length === 0;

  const showKycCard = !isKycCompleted || isGoalsEmpty;

  function handleContinueKyc() {
    if (isKycCompleted) {
      handleStartSaving();
    } else {
      router.push("/kyc");
    }
  }

  function handleStartSaving() {
    if (children?.length === 0) {
      router.push("/child/create")
      return;
    }

    if (goals?.length === 0) {
      router.push("/child/select")
      return;
    }
  }

  const isLoading = isChildrenLoading || isGoalsLoading;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 100, 120) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Blue fund value header ── */}
        <FundValueHeader />

        {/* ── KYC steps ── */}
        {showKycCard && (
          <View style={styles.card}>
            <CompleteKycComponent
              childName={childName}
              monthlyAmount={monthlyAmount}
              onPressContinue={handleContinueKyc}
            />
          </View>
        )}

        {/* ── Child plan cards ── */}
        {goals && goals.length > 0 && (
          <View style={styles.planCardWrapper}>
            {goals.map((g) => (
              <GoalPlanCard key={g.id} goal={g} />
            ))}
          </View>
        )}

        {/* ── What activates after KYC ── */}
        {showKycCard && <WhatActivatesSection />}
      </ScrollView>

      {/* ── Sticky bottom CTA ── */}
      <View style={[styles.stickyBottom, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button title="Start Saving Now →" onPress={handleStartSaving} />
      </View>
    </View>
  );
}

const GoalPlanCard = ({ goal }: { goal: Goal }) => {
  const { data: child } = useChild(goal.childId);

  const childName = child?.firstName ?? "—";
  const childAge = child ? getAge(child.dateOfBirth) : 0;
  const goalAmount = goal ? formatGoalAmount(goal.targetAmount) : "₹50L";
  const goalYear = goal ? new Date(goal.targetDate).getFullYear() : 2037;
  const monthlyAmount = goal?.monthlySip
    ? `₹${goal.monthlySip.toLocaleString("en-IN")}/mo`
    : undefined;

  function handleStartSaving() {
    router.push("/kyc");
  }


  return (
    <ChildPlanCard
      childName={childName}
      childAge={childAge}
      goalYear={goalYear}
      goalAmount={goalAmount}
      onPress={handleStartSaving}
    />
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F5FA",
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: 16,
    paddingTop: 16,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
  },
  planCardWrapper: {
    marginHorizontal: 16,
    gap: 12,
  },
  stickyBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#F5F5FA",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5EA",
  },
});
