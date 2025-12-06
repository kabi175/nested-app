import { getIconForIndex } from "@/components/goal/suggestions/fundIcons";
import { EnrichedFund, FundAllocation } from "@/types/fund";

// Predefined accent colors that cycle if there are more funds
const ACCENT_COLORS = [
  "#60A5FA", // light blue
  "#FB923C", // orange
  "#A78BFA", // purple
  "#34D399", // green
  "#F472B6", // pink
  "#FBBF24", // yellow
  "#818CF8", // indigo
  "#FB7185", // rose
  "#4ADE80", // emerald
  "#F59E0B", // amber
  "#06B6D4", // cyan
  "#EC4899", // fuchsia
];

export const getAccentColorForIndex = (index: number): string => {
  return ACCENT_COLORS[index % ACCENT_COLORS.length];
};

// Mock fund data - Replace this with API call later
// Note: accentColor is optional here since API won't provide it
export const mockFunds: FundAllocation[] = [
  {
    id: "1",
    fundName: "Nippon India Growth Fund",
    percentage: "30%",
    cagr: "3Y CAGR: 8-10%",
    expenseRatio: "Exp Ratio Variance: 0.25%",
    // accentColor will be assigned automatically
  },
  {
    id: "2",
    fundName: "HDFC Midcap Fund",
    percentage: "50%",
    cagr: "3Y CAGR: 10-12%",
    expenseRatio: "Exp Ratio Variance: 0.30%",
  },
  {
    id: "3",
    fundName: "Invesco India Growth Fund",
    percentage: "20%",
    cagr: "3Y CAGR: 12-15%",
    expenseRatio: "Exp Ratio Variance: 0.35%",
  },
];

// Helper function to enrich a single fund with icon and accentColor
export const enrichFund = (
  fund: FundAllocation,
  index: number
): EnrichedFund => {
  return {
    ...fund,
    icon: getIconForIndex(index),
    accentColor: fund.accentColor || getAccentColorForIndex(index),
  };
};

// Helper function to enrich multiple funds from API
// Use this when you fetch funds from API - it automatically assigns colors
export const enrichFunds = (funds: FundAllocation[]): EnrichedFund[] => {
  return funds.map((fund, index) => enrichFund(fund, index));
};
