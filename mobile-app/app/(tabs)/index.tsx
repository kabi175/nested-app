import { router, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ChildPlanCard from "@/components/v2/ChildPlanCard";
import CompleteKycComponent from "@/components/v2/CompleteKycComponent";
import OutlineButton from "@/components/v2/OutlineButton";
import { useChild, useChildren } from "@/hooks/useChildren";
import { useEducationGoals } from "@/hooks/useGoals";
import { useUser } from "@/hooks/useUser";
import { Goal } from "@/types/investment";
import { formatIndianCompact } from "@/utils/formatters";

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


function formatSipDate(date: Date): string {
  const d = new Date(date);
  const month = d.toLocaleString("en-IN", { month: "short" }).toUpperCase();
  return `${d.getDate()} ${month}`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: user } = useUser();
  const { data: children } = useChildren();
  const { data: goals } = useEducationGoals();

  const isKycCompleted = user?.kycStatus === "completed";
  const hasGoals = !!goals && goals.length > 0;
  const showKycCard = !isKycCompleted || !hasGoals;

  const totalCorpus = goals
    ? formatIndianCompact(goals.reduce((sum, g) => sum + g.currentAmount, 0))
    : null;

  const childName = children?.[0]?.firstName;
  const totalMonthlySip = goals
    ?.map((g) => g.monthlySip)
    .filter((v): v is number => !!v)
    .reduce((a, b) => a + b, 0);
  const monthlyAmount = totalMonthlySip
    ? `₹${formatIndianCompact(totalMonthlySip)}/mo`
    : undefined;

  function handleContinueKyc() {
    if (isKycCompleted) {
      if (children?.length === 0) {
        router.push("/child/create");
      } else {
        router.push("/child/select");
      }
    } else {
      router.push("/kyc");
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar backgroundColor="#FFFFFF" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 32) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Greeting ── */}
        <View style={styles.greetingWrapper}>
          <View style={styles.greetingRow}>
            <View>
              <Text style={styles.greeting}>
                {getGreeting()}, {user?.firstName ?? ""}
              </Text>
              {isKycCompleted && hasGoals && (
                <Text style={styles.corpus}>
                  {"Total Corpus: "}
                  <Text style={styles.corpusAmount}>{totalCorpus}</Text>
                </Text>
              )}
            </View>
            {isKycCompleted && hasGoals && (
              <Image
                source={require("@/assets/images/v2/nest-with-egg.png")}
                style={styles.nestImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>

        {/* ── KYC card ── */}
        {showKycCard && (
          <View style={styles.kycCard}>
            <CompleteKycComponent
              childName={childName}
              monthlyAmount={monthlyAmount}
              onPressContinue={handleContinueKyc}
            />
          </View>
        )}

        {/* ── Child plan cards ── */}
        {isKycCompleted && hasGoals && (
          <View style={styles.planCardWrapper}>
            {goals!.map((g) => (
              <GoalPlanCard key={g.id} goal={g} />
            ))}
            <TouchableOpacity
              style={styles.addGoalButton}
              onPress={() => router.push("/child/select")}
            >
              <Text style={styles.addGoalText}>+ Add goal</Text>
            </TouchableOpacity>
            <OutlineButton
              title="Add child"
              onPress={() => router.push("/child/create")}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const GoalPlanCard = ({ goal }: { goal: Goal }) => {
  const { data: child } = useChild(goal.childId);

  const onPressGoalCard = () => {
    const isInvestmentMade = goal.currentAmount > 0 || (goal.nextSipAmount != null && goal.nextSipAmount > 0)

    if (isInvestmentMade) {
      router.push(`/goal/${goal.id}`);
      return;
    }

    if (goal.education) {
      router.push({ pathname: "/education/[goal_id]/planner", params: { goal_id: goal.id } });
      return
    }

    router.push({
      pathname: "/child/[child_id]/[goal_id]/planner",
      params: { child_id: child?.id, goal_id: goal.id }
    });
  }

  return (
    <ChildPlanCard
      childName={child?.firstName ?? "—"}
      childAge={child ? getAge(child.dateOfBirth) : 0}
      educationId={goal.education?.id}
      collegeType={goal.education?.name}
      goalYear={new Date(goal.targetDate).getFullYear()}
      goalAmount={`₹${formatIndianCompact(goal.targetAmount)}`}
      savedAmount={`₹${formatIndianCompact(goal.currentAmount)}`}
      savedFraction={goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0}
      nextSipAmount={goal.nextSipAmount != null ? `₹${formatIndianCompact(goal.nextSipAmount)}` : null}
      nextSipDate={goal.nextSipDate != null ? formatSipDate(goal.nextSipDate) : null}
      onPress={onPressGoalCard}
    />
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: 16,
    paddingTop: 24,
  },
  greetingWrapper: {
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 14,
    fontWeight: "400",
    color: "#666666",
  },
  corpus: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111111",
    marginTop: 2,
  },
  corpusAmount: {
    fontWeight: "700",
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
    borderWidth: 1.5,
    borderColor: "#C8C8D8",
    borderStyle: "dashed",
    borderRadius: 16,
    backgroundColor: "#6F85F50F",
    paddingVertical: 18,
    alignItems: "center",
  },
  addGoalText: {
    fontSize: 16,
    color: "#444444",
  },
  greetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nestImage: {
    width: 100,
    height: 80,
  },
});
