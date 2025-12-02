import { Holding, Transaction } from "@/api/portfolioAPI";
import { useMemo } from "react";

interface FundData {
  holding: Holding;
  units: number;
  currentNav: number;
  averageNav: number;
  returnsPercentage: number;
  navDate: string;
}

export function useFundData(
  holdings: Holding[] | undefined,
  transactions: Transaction[] | undefined,
  fundId: string | undefined
): FundData | null {
  return useMemo(() => {
    if (!holdings || !fundId) return null;

    // Find the specific fund holding
    const holding = holdings.find((h: Holding) => h.fund === fundId);
    if (!holding) return null;

    // Calculate units from transactions
    let totalUnits = 0;
    let totalInvestedForNav = 0;
    let totalUnitsForNav = 0;

    if (transactions) {
      const fundTransactions = transactions.filter(
        (t: Transaction) => t.fund === fundId && t.status === "completed"
      );

      fundTransactions.forEach((t: Transaction) => {
        if (t.type === "BUY") {
          totalUnits += t.units;
          totalInvestedForNav += t.amount;
          totalUnitsForNav += t.units;
        } else if (t.type === "SELL") {
          totalUnits -= t.units;
        }
      });
    }

    // Calculate NAV values
    const currentNav = totalUnits > 0 ? holding.current_value / totalUnits : 0;
    const averageNav =
      totalUnitsForNav > 0 ? totalInvestedForNav / totalUnitsForNav : 0;

    // If we couldn't calculate units from transactions, estimate from holding data
    const finalUnits =
      totalUnits > 0
        ? totalUnits
        : averageNav > 0
        ? holding.invested_amount / averageNav
        : holding.current_value / currentNav || 0;

    // Recalculate NAV with final units if needed
    const finalCurrentNav =
      finalUnits > 0 ? holding.current_value / finalUnits : currentNav;
    const finalAverageNav =
      finalUnits > 0 ? holding.invested_amount / finalUnits : averageNav;

    // Calculate returns percentage
    const returnsPercentage =
      holding.invested_amount > 0
        ? (holding.returns_amount / holding.invested_amount) * 100
        : 0;

    // Get current date for NAV date (format: DD-MM-YY)
    const navDate = new Date();
    const day = String(navDate.getDate()).padStart(2, "0");
    const month = String(navDate.getMonth() + 1).padStart(2, "0");
    const year = String(navDate.getFullYear()).slice(-2);
    const formattedDate = `${day}-${month}-${year}`;

    return {
      holding,
      units: finalUnits,
      currentNav: finalCurrentNav,
      averageNav: finalAverageNav,
      returnsPercentage,
      navDate: formattedDate,
    };
  }, [holdings, transactions, fundId]);
}

