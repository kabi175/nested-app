import { Coins, PiggyBank, Shield } from "lucide-react-native";
import React, { useMemo } from "react";
import { useSuperFDGoals } from "./useGoals";

export interface BasketCardData {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBgColor: string;
  returns: string;
  risk: string;
  lockIn: string;
  features: string[];
  minInvestment: string;
  buttonGradient: readonly [string, string, ...string[]];
  cardBgColor: string;
  minInvestmentBgColor: string;
  subtitleColor: string;
  minInvestmentTextColor: string;
  isRecommended?: boolean;
  currentValue?: number;
  goalId?: string;
}


type SuperFDBasketsHook = {
  isLoading?: boolean;
  data: BasketCardData[];
}

export function useSuperFDBaskets(): SuperFDBasketsHook {
  const { data: goals, isLoading } = useSuperFDGoals();

  const superFDBaskets = useMemo(
    (): BasketCardData[] => {
      // Calculate current values for each basket from goals
      const basketVsCurrentValue = new Map<string, number>();
      goals?.forEach((goal) => {
        const basketId = goal.basket.title;
        const currentValue = basketVsCurrentValue.get(basketId) || 0;
        basketVsCurrentValue.set(basketId, currentValue + goal.currentAmount);
      });

      const basketVsGoalId = new Map<string, string>();
      goals?.forEach((goal) => {
        const basketId = goal.basket.title;
        const goalId = goal.id;
        basketVsGoalId.set(basketId, goalId);
      });

      return [
        {
          id: "gold-silver-basket",
          title: "Gold & Silver Basket",
          subtitle: "Earn from precious metals",
          icon: <Coins size={28} color="#F97316" strokeWidth={2} />,
          iconBgColor: "#FEF3C7",
          returns: "α",
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
          currentValue: basketVsCurrentValue.get("gold-silver-basket"),
          goalId: basketVsGoalId.get("gold-silver-basket"),
        },
        {
          id: "secure-money",
          title: "Secure Money",
          subtitle: "Designed for stable returns",
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
          currentValue: basketVsCurrentValue.get("secure-money"),
          goalId: basketVsGoalId.get("secure-money"),
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
          currentValue: basketVsCurrentValue.get("grow-money"),
          goalId: basketVsGoalId.get("grow-money"),
        },
      ];
    },
    [goals]
  );

  return {
    data: superFDBaskets,
    isLoading,
  };
}
