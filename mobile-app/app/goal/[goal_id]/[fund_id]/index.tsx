import { redeemFund } from "@/api/redeemAPI";
import { goalsForCustomizeAtom } from "@/atoms/goals";
import { FundActionButtons } from "@/components/goal/fund/FundActionButtons";
import { FundDetailCard } from "@/components/goal/fund/FundDetailCard";
import { FundDetailHeader } from "@/components/goal/fund/FundDetailHeader";
import { MoreOptionsMenu } from "@/components/goal/fund/MoreOptionsMenu";
import { RedeemModal } from "@/components/goal/fund/RedeemModal";
import { ThemedText } from "@/components/ThemedText";
import { useAuthAxios } from "@/hooks/useAuthAxios";
import { useFundData } from "@/hooks/useFundData";
import { useGoal } from "@/hooks/useGoal";
import {
  usePortfolioHoldings,
  usePortfolioTransactions,
} from "@/hooks/usePortfolio";
import { Button } from "@ui-kitten/components";
import { router, useLocalSearchParams } from "expo-router";
import { useSetAtom } from "jotai";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const api = useAuthAxios();
  const fundData = useFundData(holdings, transactions, fund_id);

  const [showMenu, setShowMenu] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemStep, setRedeemStep] = useState<"initial" | "mode">("initial");
  const [selectedRedemptionMode, setSelectedRedemptionMode] = useState<
    "units" | "amount" | "redeemAll" | null
  >(null);
  const [unitsValue, setUnitsValue] = useState("");
  const [amountValue, setAmountValue] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);

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
    setUnitsValue("");
    setAmountValue("");
  };

  const handleRedeemProceed = async () => {
    if (redeemStep === "initial") {
      setRedeemStep("mode");
      return;
    }

    if (!selectedRedemptionMode || !goal_id || !fund_id || !fundData) {
      return;
    }

    const { holding, units: maxUnits } = fundData;

    try {
      setIsRedeeming(true);

      let amount: number | null = null;
      let units: number | null = null;

      if (selectedRedemptionMode === "units") {
        const parsedUnits = parseFloat(unitsValue) || 0;
        if (parsedUnits < 0.01 || parsedUnits > maxUnits) {
          Alert.alert("Error", "Invalid units. Minimum 0.01 units required.");
          setIsRedeeming(false);
          return;
        }
        units = parsedUnits;
      } else if (selectedRedemptionMode === "amount") {
        const parsedAmount = parseFloat(amountValue.replace(/,/g, "")) || 0;
        if (parsedAmount < 100 || parsedAmount > holding.current_value) {
          Alert.alert("Error", "Invalid amount. Minimum ₹100 required.");
          setIsRedeeming(false);
          return;
        }
        amount = parsedAmount;
      } else if (selectedRedemptionMode === "redeemAll") {
        units = maxUnits;
      }

      const orders = await redeemFund(api, goal_id, fund_id, amount, units);

      if (orders && orders.length > 0) {
        const orderIds = orders.map((order) => order.id);
        handleRedeemClose();
        router.push({
          pathname: `/goal/${goal_id}/redeem/verify`,
          params: {
            orderIds: JSON.stringify(orderIds),
            fundName: holding.fund,
            fundId: fund_id,
            goalId: goal_id,
          },
        });
      } else {
        Alert.alert(
          "Error",
          "Failed to create redeem order. Please try again."
        );
      }
    } catch (error: any) {
      console.error("Redeem error:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          "Failed to process redemption. Please try again."
      );
    } finally {
      setIsRedeeming(false);
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

        <Button
          style={styles.continueLaterContainer}
          onPress={() => router.back()}
          appearance="ghost"
          status="basic"
        >
          Continue later
        </Button>
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
        unitsValue={unitsValue}
        amountValue={amountValue}
        onClose={handleRedeemClose}
        onSpeakToRM={handleSpeakToRM}
        onProceed={handleRedeemProceed}
        onModeSelect={setSelectedRedemptionMode}
        onUnitsValueChange={setUnitsValue}
        onAmountValueChange={setAmountValue}
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
