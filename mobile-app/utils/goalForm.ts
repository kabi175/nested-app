import { Education } from "@/types/education";
import { expectedFee } from "./education";

export const calculateFutureCost = (
  education: Education | undefined,
  targetYear: number
): number => {
  if (!education) return 0;
  const targetDate = new Date(targetYear, 0, 1);
  return Math.round(expectedFee(targetDate, education));
};

