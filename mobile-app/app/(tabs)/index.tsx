import { router, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import CompleteKycComponent from "@/components/v2/CompleteKycComponent";
import GoalPlanCard from "@/components/v2/GoalPlanCard";
import HomeHeader from "@/components/v2/HomeHeader";
import HowNestedHelpsSection from "@/components/v2/HowNestedHelpsSection";
import OutlineButton from "@/components/v2/OutlineButton";
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
        <HomeHeader
          paddingTop={insets.top + 16}
          userInitial={user?.firstName?.[0]?.toUpperCase() ?? "U"}
          firstName={user?.firstName ?? ""}
          totalCurrentAmount={totalCurrentAmount}
          totalMonthlySip={totalMonthlySip}
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
            {goals!.map((g) => (
              <GoalPlanCard key={g.id} goal={g} />
            ))}
            {isInvestedInAnyGoal && (
              <OutlineButton
                title="+ Add goal"
                onPress={() => router.push("/child/select")}
              />
            )}
          </View>
        )}

        <SuperFdCard onPress={() => router.push("/(tabs)/super-fd")} />

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
});
