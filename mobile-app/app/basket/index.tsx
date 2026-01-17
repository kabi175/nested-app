import { BasketFund } from "@/api/basketAPI";
import { CreateOrderRequest } from "@/api/paymentAPI";
import { cartAtom } from "@/atoms/cart";
import { FAQAccordion } from "@/components/FAQAccordion";
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
  "gold-silver-basket": {
    title: "Gold & Silver Basket",
    basketName: "gold-silver-basket",
    description: "Earn from precious metals",
    targetYears: 1,
  },
  "secure-money": {
    title: "Secure Money",
    basketName: "secure-money",
    description: "Upto 7.50% per year. Ideal for 6+ months holding.",
    targetYears: 3,
  },
  "grow-money": {
    title: "Grow Money",
    basketName: "grow-money",
    description: "Upto 11.00% per year. Ideal for 12+ months holding.",
    targetYears: 5,
  },
};

type IconType =
  | typeof Unlock
  | typeof Shield
  | typeof Star
  | typeof Zap
  | typeof Target;

interface FeatureCardConfig {
  title: string;
  subtitle: string;
  backgroundColor: string;
  iconType: IconType;
  iconColor: string;
  iconSize?: number;
  isFullWidth?: boolean;
}

const basketFeatures: Record<keyof typeof popularBaskets, FeatureCardConfig[]> =
  {
    "gold-silver-basket": [
      {
        title: "No lock-in period",
        subtitle: "Withdraw anytime",
        backgroundColor: "#FCE7F3",
        iconType: Unlock,
        iconColor: "#DC2626",
        iconSize: 20,
      },
      {
        title: "Moderate",
        subtitle: "Risk",
        backgroundColor: "#FEF3C7",
        iconType: Shield,
        iconColor: "#D97706",
        iconSize: 20,
      },
      {
        title: "Top Rated Funds",
        subtitle: "",
        backgroundColor: "#D1FAE5",
        iconType: Star,
        iconColor: "#059669",
        iconSize: 20,
      },
      {
        title: "Instant withdrawal",
        subtitle: "Directly to your bank",
        backgroundColor: "#DBEAFE",
        iconType: Zap,
        iconColor: "#2563EB",
        iconSize: 20,
      },
      {
        title: "No share market risk",
        subtitle: "100% safe investments",
        backgroundColor: "#F3E8FF",
        iconType: Target,
        iconColor: "#7C3AED",
        iconSize: 20,
        isFullWidth: true,
      },
    ],
    "secure-money": [
      {
        title: "No lock-in period",
        subtitle: "Withdraw anytime",
        backgroundColor: "#FCE7F3",
        iconType: Unlock,
        iconColor: "#DC2626",
        iconSize: 20,
      },
      {
        title: "Moderate",
        subtitle: "Risk",
        backgroundColor: "#FEF3C7",
        iconType: Shield,
        iconColor: "#D97706",
        iconSize: 20,
      },
      {
        title: "Top Rated Funds",
        subtitle: "",
        backgroundColor: "#D1FAE5",
        iconType: Star,
        iconColor: "#059669",
        iconSize: 20,
      },
      {
        title: "Instant withdrawal",
        subtitle: "Directly to your bank",
        backgroundColor: "#DBEAFE",
        iconType: Zap,
        iconColor: "#2563EB",
        iconSize: 20,
      },
      {
        title: "No share market risk",
        subtitle: "100% safe investments",
        backgroundColor: "#F3E8FF",
        iconType: Target,
        iconColor: "#7C3AED",
        iconSize: 20,
        isFullWidth: true,
      },
    ],
    "grow-money": [
      {
        title: "No lock-in period",
        subtitle: "Withdraw anytime",
        backgroundColor: "#FCE7F3",
        iconType: Unlock,
        iconColor: "#DC2626",
        iconSize: 20,
      },
      {
        title: "Moderate",
        subtitle: "Risk",
        backgroundColor: "#FEF3C7",
        iconType: Shield,
        iconColor: "#D97706",
        iconSize: 20,
      },
      {
        title: "Top Rated Funds",
        subtitle: "",
        backgroundColor: "#D1FAE5",
        iconType: Star,
        iconColor: "#059669",
        iconSize: 20,
      },
      {
        title: "Instant withdrawal",
        subtitle: "Directly to your bank",
        backgroundColor: "#DBEAFE",
        iconType: Zap,
        iconColor: "#2563EB",
        iconSize: 20,
      },
      {
        title: "Share market investment less than 50%",
        subtitle: "Rest in gold and safer debt",
        backgroundColor: "#F3E8FF",
        iconType: Target,
        iconColor: "#7C3AED",
        iconSize: 20,
        isFullWidth: true,
      },
    ],
  };

const basketFaqs = [
  {
    question: "What is this?",
    answer:
      "A safe-plus money plan.\nMostly (more than 80%) in gold and safe debt.\nOnly a small part (less than 20%) in shares.",
  },
  {
    question: "How is it different from FD?",
    answer:
      "FD gives 4–6%.\nThese funds give 10–11%.\nYou can take money out anytime.",
  },
  {
    question: "What is the minimum investment?",
    answer: "Start with ₹1000 or ₹200 monthly.",
  },
  {
    question: "What is the past returns?",
    answer:
      "Returns change every year, but this has given 11–15% in past years:\n~11% in 10 years\n~13% in 5 years\n~15% in 3 years",
  },
  {
    question: "What is expected returns?",
    answer:
      "The funds can deliver 6% to 13% p.a. on holding of at least 12 months.",
  },
  {
    question: "Is it safe?",
    answer:
      "Yes.\nThese plans are checked by SEBI and run by big trusted companies.\nChance of loss for investment over one year is small.",
  },
  {
    question: "Can I withdraw?",
    answer: "Yes.\nNo lock-in.\nMoney comes to your bank in 2–3 working days.",
  },
  {
    question: "Will TDS be deducted?",
    answer:
      "Debt funds: Gains taxed at your income slab on redemption; no TDS.\n\nGold & Silver funds: 12.5% LTCG if held > 24 months.\n\nEquity funds: 12.5% LTCG if held > 12 months \n\nClick [Here](https://nested.money/#/taxation) for fund-wise taxation",
  },
  {
    question: "What is Nested's fee?",
    answer:
      "Nested does not charge you anything. We get about 0.04% p.m. (less than ₹ 50 per month for ₹ 1 lakh investment) from the mutual fund company.",
  },
];

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
          basketId: basketQuery.data?.id ?? "",
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
        </View>

        {/* Feature Cards Grid */}
        <View style={styles.featureCardsContainer}>
          {basket &&
            basketFeatures[type]?.map((feature, index) => {
              const IconComponent = feature.iconType;
              return (
                <FeatureCard
                  key={index}
                  title={feature.title}
                  subtitle={feature.subtitle}
                  backgroundColor={feature.backgroundColor}
                  icon={
                    <IconComponent
                      size={feature.iconSize || 20}
                      color={feature.iconColor}
                    />
                  }
                  isFullWidth={feature.isFullWidth}
                />
              );
            })}
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

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <ThemedText style={styles.sectionTitle}>
            Frequently Asked Questions
          </ThemedText>
          {basketFaqs.map((faq, index) => (
            <FAQAccordion
              key={index}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface FeatureCardProps {
  title: string;
  subtitle: string;
  backgroundColor: string;
  icon: React.ReactNode;
  isFullWidth?: boolean;
}

function FeatureCard({
  title,
  subtitle,
  backgroundColor,
  icon,
  isFullWidth = false,
}: FeatureCardProps) {
  return (
    <View
      style={[
        styles.featureCard,
        isFullWidth && styles.featureCardFullWidth,
        { backgroundColor },
      ]}
    >
      <View
        style={[
          styles.featureCardContent,
          isFullWidth && styles.featureCardContentCentered,
        ]}
      >
        <View
          style={[
            styles.featureCardText,
            isFullWidth && styles.featureCardTextCentered,
          ]}
        >
          <ThemedText
            style={[
              styles.featureCardTitle,
              isFullWidth && styles.featureCardTitleCentered,
            ]}
          >
            {title}
          </ThemedText>
          {subtitle ? (
            <ThemedText
              style={[
                styles.featureCardSubtitle,
                isFullWidth && styles.featureCardSubtitleCentered,
              ]}
            >
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
        <View
          style={[
            styles.featureCardIcon,
            isFullWidth && styles.featureCardIconCentered,
          ]}
        >
          {icon}
        </View>
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
          {/* <View style={styles.fundDetails}>
            <ThemedText style={styles.fundCagr}>
              3Y CAGR: {fund.cagr}
            </ThemedText>
            <View style={styles.fundSeparator} />
            <ThemedText style={styles.fundExpRatio}>
              Exp Ratio Variance: {fund.expRatio}
            </ThemedText>
          </View> */}
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
  featureCardFullWidth: {
    width: "100%",
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
  featureCardContentCentered: {
    justifyContent: "center",
  },
  featureCardTextCentered: {
    alignItems: "center",
    marginRight: 12,
  },
  featureCardTitleCentered: {
    textAlign: "center",
  },
  featureCardSubtitleCentered: {
    textAlign: "center",
  },
  featureCardIconCentered: {
    marginTop: 0,
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
  faqSection: {
    marginTop: 24,
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
    marginBottom: 8,
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
