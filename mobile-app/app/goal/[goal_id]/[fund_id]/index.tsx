import { goalsForCustomizeAtom } from "@/atoms/goals";
import { ThemedText } from "@/components/ThemedText";
import { useGoal } from "@/hooks/useGoal";
import {
  usePortfolioHoldings,
  usePortfolioTransactions,
} from "@/hooks/usePortfolio";
import { router, useLocalSearchParams } from "expo-router";
import { useSetAtom } from "jotai";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FundActionButtons } from "./components/FundActionButtons";
import { FundDetailCard } from "./components/FundDetailCard";
import { FundDetailHeader } from "./components/FundDetailHeader";
import { MoreOptionsMenu } from "./components/MoreOptionsMenu";
import { RedeemModal } from "./components/RedeemModal";
import { useFundData } from "./hooks/useFundData";

export default function FundDetailScreen() {
  const { goal_id, fund_id } = useLocalSearchParams<{
    goal_id: string;
    fund_id: string;
  }>();

  const { data: goal } = useGoal(goal_id);
  const { data: holdings, isLoading: holdingsLoading } =
    usePortfolioHoldings(goal_id);
  const { data: transactions, isLoading: transactionsLoading } =
    usePortfolioTransactions(goal_id, 0);
  const setGoalsForCustomize = useSetAtom(goalsForCustomizeAtom);

  const fundData = useFundData(holdings, transactions, fund_id);

  const [showMenu, setShowMenu] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemStep, setRedeemStep] = useState<"initial" | "mode">("initial");
  const [selectedRedemptionMode, setSelectedRedemptionMode] = useState<
    "units" | "amount" | "redeemAll" | null
  >(null);

  const isLoading = holdingsLoading || transactionsLoading;

  const handleInvest = () => {
    if (goal == null) {
      return;
    }
    setGoalsForCustomize([goal]);
    router.push(`/child/${goal.childId}/goal/customize`);
  };

  const handleRedeemOpen = () => {
    setShowMenu(false);
    setRedeemStep("initial");
    setSelectedRedemptionMode(null);
    setShowRedeemModal(true);
  };

  const handleRedeemClose = () => {
    setShowRedeemModal(false);
    setRedeemStep("initial");
    setSelectedRedemptionMode(null);
  };

  const handleRedeemProceed = () => {
    if (redeemStep === "initial") {
      setRedeemStep("mode");
    } else if (selectedRedemptionMode) {
      // Handle proceed with selected mode
      handleRedeemClose();
    }
  };

  const handleSpeakToRM = () => {
    handleRedeemClose();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <FundDetailHeader title={fund_id || "Fund"} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!fundData) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <FundDetailHeader title={fund_id || "Fund"} />
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>Fund not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const { holding, units, currentNav, averageNav, returnsPercentage, navDate } =
    fundData;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FundDetailHeader title={holding.fund} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FundDetailCard
          holding={holding}
          units={units}
          currentNav={currentNav}
          averageNav={averageNav}
          returnsPercentage={returnsPercentage}
          navDate={navDate}
        />

        <FundActionButtons
          onInvestPress={handleInvest}
          onMorePress={() => setShowMenu(true)}
        />

        <TouchableOpacity
          style={styles.continueLaterContainer}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.continueLaterText}>
            Continue later
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>

      <MoreOptionsMenu
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onInvest={handleInvest}
        onRedeem={handleRedeemOpen}
        onSTP={() => setShowMenu(false)}
        onSWP={() => setShowMenu(false)}
        onPauseSIP={() => setShowMenu(false)}
        onCancelSIP={() => setShowMenu(false)}
      />

      <RedeemModal
        visible={showRedeemModal}
        holding={holding}
        units={units}
        step={redeemStep}
        selectedMode={selectedRedemptionMode}
        onClose={handleRedeemClose}
        onSpeakToRM={handleSpeakToRM}
        onProceed={handleRedeemProceed}
        onModeSelect={setSelectedRedemptionMode}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  continueLaterContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  continueLaterText: {
    fontSize: 14,
    color: "#6B7280",
    textDecorationLine: "underline",
    textDecorationStyle: "dotted",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
  },
});
