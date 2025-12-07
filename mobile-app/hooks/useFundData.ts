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
    const navDate = new Date();
    const day = String(navDate.getDate()).padStart(2, "0");
    const month = String(navDate.getMonth() + 1).padStart(2, "0");
    const year = String(navDate.getFullYear()).slice(-2);
    const formattedDate = `${day}-${month}-${year}`;

    return {
      holding,
      units: holding.total_units,
      currentNav: holding.current_nav,
      averageNav: holding.average_nav,
      returnsPercentage:
        (holding.returns_amount / holding.invested_amount) * 100,
      navDate: formattedDate,
    };
  }, [holdings, transactions, fundId]);
}
