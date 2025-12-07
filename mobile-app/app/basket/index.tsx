import { BasketFund } from "@/api/basketAPI";
import { CreateOrderRequest } from "@/api/paymentAPI";
import { cartAtom } from "@/atoms/cart";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useBasket } from "@/hooks/useBasket";
import { useCreateOrders } from "@/hooks/useCreateOrders";
import { useGoalCreation } from "@/hooks/useGoalCreation";
import { router, useLocalSearchParams } from "expo-router";
import { useSetAtom } from "jotai";
import {
  ArrowLeft,
  Clock,
  FileText,
  Shield,
  Star,
  Target,
  Unlock,
  Zap,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface RecommendedFund {
  id: string;
  name: string;
  cagr: string;
  allocation: string;
  expRatio: string;
  accentColor: string;
  icon: "clock" | "file" | "shield";
}

// Predefined accent colors to cycle through
const ACCENT_COLORS = [
  "#A78BFA",
  "#EF4444",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EC4899",
];

// Icon types to cycle through
const ICON_TYPES: ("clock" | "file" | "shield")[] = ["clock", "file", "shield"];

// Transform BasketFund to RecommendedFund
const transformBasketFundToRecommendedFund = (
  fund: BasketFund,
  index: number
): RecommendedFund => {
  return {
    id: fund.id,
    name: fund.name,
    cagr:
      typeof fund.cagr === "number" && !isNaN(fund.cagr)
        ? `${fund.cagr.toFixed(1)}%`
        : "N/A",
    allocation:
      typeof fund.allocationPercentage === "number" &&
      !isNaN(fund.allocationPercentage)
        ? `${fund.allocationPercentage}%`
        : "N/A",
    expRatio:
      typeof fund.expRatio === "number" && !isNaN(fund.expRatio)
        ? `${fund.expRatio.toFixed(2)}%`
        : "N/A",
    accentColor: ACCENT_COLORS[index % ACCENT_COLORS.length],
    icon: ICON_TYPES[index % ICON_TYPES.length],
  };
};

const popularBaskets = {
  "choti-sip": {
    title: "Choti SIP",
    basketName: "choti-sip",
    description: "SIP in safe funds with low risk, no lock-in, no TDS",
    description2: null,
    targetYears: 1,
  },
  "all-weather": {
    title: "All-weather funds",
    basketName: "all-weather",
    description: "Start your first steps for equity investing.",
    description2: "Ideal for 3+ years investment timeline.",
    targetYears: 5,
  },
  "better-than-fd": {
    title: "Better than FD",
    basketName: "better-than-fd",
    description: "Monthly income of upto ₹775 per ₹ 1 lakh invested.",
    description2: "TDS of 10% above Rs 5000 payout in a financial year",
    targetYears: 3,
  },
};

export default function BasketInvestingScreen() {
  const { type } = useLocalSearchParams<{
    type: keyof typeof popularBaskets;
  }>();

  const basket = popularBaskets[type];

  const [initialInvestment, setInitialInvestment] = useState<string>("");
  const [yearlyStepUp, setYearlyStepUp] = useState<string>("");
  const [monthlySip, setMonthlySip] = useState<string>("");
  const [isInvesting, setIsInvesting] = useState(false);

  const createGoalMutation = useGoalCreation();
  const createOrdersMutation = useCreateOrders();
  const setCart = useSetAtom(cartAtom);

  // Fetch basket data using the hook
  const basketQuery = useBasket(basket?.basketName || "");

  // Transform basket funds to recommended funds format
  const recommendedFunds = useMemo(() => {
    if (!basketQuery.data?.funds || !Array.isArray(basketQuery.data.funds)) {
      return [];
    }
    return basketQuery.data.funds
      .filter((fund) => fund && fund.id && fund.name)
      .map((fund, index) => transformBasketFundToRecommendedFund(fund, index));
  }, [basketQuery.data?.funds]);

  const handleInvest = async () => {
    // Validate inputs
    const initialAmount = parseFloat(initialInvestment.replace(/,/g, "")) || 0;
    const stepUpAmount = parseFloat(yearlyStepUp.replace(/,/g, "")) || 0;
    const sipAmount = parseFloat(monthlySip.replace(/,/g, "")) || 0;

    if (initialAmount === 0 && sipAmount === 0) {
      Alert.alert(
        "Error",
        "Please enter at least Initial Investment or Monthly SIP amount"
      );
      return;
    }

    setIsInvesting(true);

    try {
      // Create goal
      const targetDate = new Date();
      targetDate.setFullYear(targetDate.getFullYear() + basket.targetYears);

      const goalResponse = await createGoalMutation.mutateAsync([
        {
          title: basket.title,
          childId: undefined,
          educationId: "",
          targetAmount:
            initialAmount > 0 ? initialAmount * 12 : sipAmount * 12 * 10, // Estimate based on investment
          targetDate: targetDate,
        },
      ]);

      if (!goalResponse || goalResponse.length === 0) {
        throw new Error("Failed to create goal");
      }

      const goalId = goalResponse[0].id;

      // Create orders
      const orders: CreateOrderRequest[] = [];

      // Add buy order if initial investment is provided
      if (initialAmount > 0) {
        orders.push({
          type: "buy",
          amount: initialAmount,
          goalId: goalId,
        });
      }

      // Add SIP order if monthly SIP is provided
      if (sipAmount > 0) {
        orders.push({
          type: "sip",
          amount: sipAmount,
          start_date: new Date(),
          yearly_setup: stepUpAmount > 0 ? stepUpAmount : undefined,
          goalId: goalId,
        });
      }

      if (orders.length > 0) {
        const orderResponse = await createOrdersMutation.mutateAsync({
          orders,
        });
        setCart(orderResponse);

        router.push("/child/1/goal/loading");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Investment error:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to create investment. Please try again."
      );
    } finally {
      setIsInvesting(false);
    }
  };

  const formatAmountInput = (value: string): string => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, "");
    // Add commas for thousands
    if (numbers === "") return "";
    const num = parseInt(numbers, 10);
    return num.toLocaleString("en-IN");
  };

  const handleAmountChange = (
    value: string,
    setter: (value: string) => void
  ) => {
    const formatted = formatAmountInput(value);
    setter(formatted);
  };

  const getIconComponent = (icon: RecommendedFund["icon"]) => {
    switch (icon) {
      case "clock":
        return Clock;
      case "file":
        return FileText;
      case "shield":
        return Shield;
      default:
        return Clock;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{basket.title}</ThemedText>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <View style={styles.descriptionContainer}>
          <ThemedText style={styles.descriptionText}>
            {basket.description}
          </ThemedText>
          <ThemedText style={styles.descriptionText}>
            {basket.description2 ?? ""}
          </ThemedText>
        </View>

        {/* Feature Cards Grid */}
        <View style={styles.featureCardsContainer}>
          <FeatureCard
            title="No lock-in period"
            subtitle="Withdraw anytime"
            backgroundColor="#FCE7F3"
            icon={<Unlock size={20} color="#DC2626" />}
          />
          <FeatureCard
            title="Moderate"
            subtitle="Risk"
            backgroundColor="#FEF3C7"
            icon={<Shield size={20} color="#D97706" />}
          />
          <FeatureCard
            title="Top Rated Funds"
            subtitle=""
            backgroundColor="#D1FAE5"
            icon={<Star size={20} color="#059669" />}
          />
          <FeatureCard
            title="Instant withdrawal"
            subtitle="Directly to your bank"
            backgroundColor="#DBEAFE"
            icon={<Zap size={20} color="#2563EB" />}
          />
          <FeatureCard
            title="Monthly payout"
            subtitle="Regular income to your account"
            backgroundColor="#F3E8FF"
            icon={<Target size={20} color="#7C3AED" />}
          />
        </View>

        {/* Investment Inputs Section */}
        <ThemedView style={styles.investmentSection}>
          <ThemedText style={styles.sectionTitle}>Lump sum + SIP</ThemedText>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>
              Initial Investment
            </ThemedText>
            <View style={styles.currencyInputContainer}>
              <ThemedText style={styles.currencySymbol}>₹</ThemedText>
              <TextInput
                style={styles.currencyInput}
                value={initialInvestment}
                onChangeText={(value) =>
                  handleAmountChange(value, setInitialInvestment)
                }
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>
              Increase SIP Every Year (₹)
            </ThemedText>
            <View style={styles.currencyInputContainer}>
              <ThemedText style={styles.currencySymbol}>₹</ThemedText>
              <TextInput
                style={styles.currencyInput}
                value={yearlyStepUp}
                onChangeText={(value) =>
                  handleAmountChange(value, setYearlyStepUp)
                }
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.inputLabel}>Monthly SIP</ThemedText>
            <View style={styles.currencyInputContainer}>
              <ThemedText style={styles.currencySymbol}>₹</ThemedText>
              <TextInput
                style={styles.currencyInput}
                value={monthlySip}
                onChangeText={(value) =>
                  handleAmountChange(value, setMonthlySip)
                }
                keyboardType="numeric"
                placeholder="Enter monthly amount"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </ThemedView>

        {/* Recommended Funds Section */}
        <View style={styles.fundsSection}>
          <ThemedText style={styles.sectionTitle}>Recommended Funds</ThemedText>
          {basketQuery.isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <ThemedText style={styles.loadingText}>
                Loading funds...
              </ThemedText>
            </View>
          ) : basketQuery.isError ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>
                Failed to load funds. Please try again.
              </ThemedText>
            </View>
          ) : recommendedFunds.length === 0 ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>
                No funds available for this basket.
              </ThemedText>
            </View>
          ) : (
            recommendedFunds.map((fund, index) => {
              const IconComponent = getIconComponent(fund.icon);
              return (
                <FundCard
                  key={fund.id}
                  fund={fund}
                  index={index}
                  IconComponent={IconComponent}
                />
              );
            })
          )}
        </View>

        {/* Invest Button */}
        <TouchableOpacity
          style={[
            styles.investButton,
            (isInvesting ||
              createGoalMutation.isPending ||
              createOrdersMutation.isPending) &&
              styles.investButtonDisabled,
          ]}
          onPress={handleInvest}
          disabled={
            isInvesting ||
            createGoalMutation.isPending ||
            createOrdersMutation.isPending
          }
        >
          {isInvesting ||
          createGoalMutation.isPending ||
          createOrdersMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.investButtonText}>Invest</ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

interface FeatureCardProps {
  title: string;
  subtitle: string;
  backgroundColor: string;
  icon: React.ReactNode;
}

function FeatureCard({
  title,
  subtitle,
  backgroundColor,
  icon,
}: FeatureCardProps) {
  return (
    <View style={[styles.featureCard, { backgroundColor }]}>
      <View style={styles.featureCardContent}>
        <View style={styles.featureCardText}>
          <ThemedText style={styles.featureCardTitle}>{title}</ThemedText>
          {subtitle ? (
            <ThemedText style={styles.featureCardSubtitle}>
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
        <View style={styles.featureCardIcon}>{icon}</View>
      </View>
    </View>
  );
}

interface FundCardProps {
  fund: RecommendedFund;
  index: number;
  IconComponent: React.ComponentType<{ size?: number; color?: string }>;
}

function FundCard({ fund, index, IconComponent }: FundCardProps) {
  return (
    <ThemedView
      style={[
        styles.fundCard,
        { borderLeftColor: fund.accentColor, borderLeftWidth: 4 },
      ]}
    >
      <View style={styles.fundCardContent}>
        <View
          style={[
            styles.fundIconContainer,
            { backgroundColor: `${fund.accentColor}20` },
          ]}
        >
          <IconComponent size={24} color={fund.accentColor} />
        </View>
        <View style={styles.fundInfo}>
          <ThemedText style={styles.fundName}>{fund.name}</ThemedText>
          <View style={styles.fundDetails}>
            <ThemedText style={styles.fundCagr}>
              3Y CAGR: {fund.cagr}
            </ThemedText>
            <View style={styles.fundSeparator} />
            <ThemedText style={styles.fundExpRatio}>
              Exp Ratio Variance: {fund.expRatio}
            </ThemedText>
          </View>
        </View>
        <View style={styles.fundAllocation}>
          <ThemedText
            style={[styles.fundAllocationValue, { color: fund.accentColor }]}
          >
            {fund.allocation}
          </ThemedText>
          <ThemedText style={styles.fundAllocationLabel}>
            of portfolio
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 4,
  },
  featureCardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    borderRadius: 12,
    padding: 12,
    width: "47%",
    minHeight: 80,
  },
  featureCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  featureCardText: {
    flex: 1,
    marginRight: 8,
  },
  featureCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  featureCardSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  featureCardIcon: {
    marginTop: 2,
  },
  investmentSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  currencyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginRight: 8,
  },
  currencyInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 12,
  },
  fundsSection: {
    marginBottom: 24,
  },
  fundCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  fundCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  fundIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  fundInfo: {
    flex: 1,
    marginRight: 12,
  },
  fundName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  fundDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  fundCagr: {
    fontSize: 12,
    color: "#6B7280",
  },
  fundSeparator: {
    width: 1,
    height: 12,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 8,
  },
  fundExpRatio: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  fundAllocation: {
    alignItems: "flex-end",
  },
  fundAllocationValue: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  fundAllocationLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  investButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  investButtonDisabled: {
    opacity: 0.6,
  },
  investButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  errorContainer: {
    paddingVertical: 40,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
  },
});
