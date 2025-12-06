import { FundIconType } from "@/components/goal/suggestions/fundIcons";

export interface FundAllocation {
  id: string;
  fundName: string;
  percentage: string;
  cagr: string;
  expenseRatio: string;
  accentColor?: string; // Optional - will be assigned on client side if not provided
}

export interface EnrichedFund extends FundAllocation {
  accentColor: string; // Required after enrichment
  icon: FundIconType;
}
