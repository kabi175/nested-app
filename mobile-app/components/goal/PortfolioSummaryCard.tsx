import React from "react";
import { PortfolioOverview } from "../PortfolioOverview";

interface PortfolioSummaryCardProps {
  currentValue: number;
  investedAmount: number;
  returnsAmount: number;
}

export function PortfolioSummaryCard({
  currentValue,
  investedAmount,
  returnsAmount,
}: PortfolioSummaryCardProps) {
  const returnsPercentage =
    investedAmount > 0 ? (returnsAmount / investedAmount) * 100 : 0;

  return (
    <PortfolioOverview
      currentValue={currentValue}
      invested={investedAmount}
      returns={returnsAmount}
      returnsPercentage={returnsPercentage}
    />
  );
}
