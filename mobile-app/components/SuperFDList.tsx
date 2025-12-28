import { Coins, PiggyBank, Shield } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import BasketCard, { BasketCardData } from "./BasketCard";

interface SuperFDListProps {
  onCardPress?: (basketId: string) => void;
  onInvestNowPress?: (basketId: string) => void;
  onLearnMorePress?: (basketId: string) => void;
}

const superFDBaskets: BasketCardData[] = [
  {
    id: "gold-silver-basket",
    title: "Gold & Silver Basket",
    subtitle: "Earn from precious metals",
    icon: <Coins size={28} color="#F97316" strokeWidth={2} />,
    iconBgColor: "#FEF3C7",
    returns: "11%",
    risk: "Medium",
    lockIn: "None",
    features: [
      "Diversified portfolio of Gold and Silver",
      "No lock-in period — withdraw anytime",
      "Flexible investments — add any amount",
    ],
    minInvestment: "₹500",
    buttonGradient: ["#F97316", "#EA580C"],
    cardBgColor: "#F9FAFB",
    minInvestmentBgColor: "#FEF3C7",
    subtitleColor: "#F97316",
    minInvestmentTextColor: "#1F2937",
    isRecommended: false,
  },
  {
    id: "secure-money",
    title: "Secure Money",
    subtitle: "Stable returns guaranteed",
    icon: <Shield size={28} color="#3B82F6" strokeWidth={2} />,
    iconBgColor: "#DBEAFE",
    returns: "7.50%",
    risk: "Low",
    lockIn: "None",
    features: [
      "Consistent returns up to 7.50% per annum",
      "No lock-in period — full liquidity",
      "Auto-invest with flexible SIP options",
    ],
    minInvestment: "₹500",
    buttonGradient: ["#3B82F6", "#2563EB"],
    cardBgColor: "#FFFFFF",
    minInvestmentBgColor: "#DBEAFE",
    subtitleColor: "#3B82F6",
    minInvestmentTextColor: "#1F2937",
    isRecommended: false,
  },
  {
    id: "grow-money",
    title: "Grow Money",
    subtitle: "Maximum growth potential",
    icon: <PiggyBank size={28} color="#9333EA" strokeWidth={2} />,
    iconBgColor: "#F3E8FF",
    returns: "11%",
    risk: "Medium",
    lockIn: "None",
    features: [
      "High returns up to 11% per year",
      "No lock-in — exit anytime without penalty",
      "Flexible top-ups and SIP options available",
    ],
    minInvestment: "₹1000",
    buttonGradient: ["#9333EA", "#7C3AED"],
    cardBgColor: "#FFFFFF",
    minInvestmentBgColor: "#F3E8FF",
    subtitleColor: "#9333EA",
    minInvestmentTextColor: "#9333EA",
    isRecommended: false,
  },
];

export default function SuperFDList({
  onCardPress,
  onInvestNowPress,
  onLearnMorePress,
}: SuperFDListProps) {
  const { width } = useWindowDimensions();
  const cardWidth = width - 40; // Account for left padding (20) + right padding (20)
  const cardSpacing = 16;

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Super FD</Text>
        <Text style={styles.headerSubtitle}>
          Better than bank FD, safer than share market.
        </Text>
      </View>

      <View style={styles.listContent}>
        {superFDBaskets.map((item, index) => (
          <View
            key={item.id}
            style={[
              { width: cardWidth },
              {
                marginBottom:
                  index < superFDBaskets.length - 1 ? cardSpacing : 0,
              },
            ]}
          >
            <BasketCard
              data={item}
              cardWidth={cardWidth}
              onPress={() => onCardPress?.(item.id)}
              onInvestNowPress={() => onInvestNowPress?.(item.id)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 24,
  },
  headerSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
});
