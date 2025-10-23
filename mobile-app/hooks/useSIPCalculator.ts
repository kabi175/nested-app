import { computeMinimumSIPAmount } from "@/utils/sip";
import { useEffect, useState } from "react";

export function useSIPCalculator(targetDate: Date, targetAmount: number) {
  const remainingYears = targetDate.getFullYear() - new Date().getFullYear();

  const initialSIPAmount = computeMinimumSIPAmount(
    remainingYears,
    0,
    0,
    12,
    targetAmount
  );

  const [lumpSumAmount, setLumpSumAmount] = useState(initialSIPAmount * 4);
  const [stepUpAmount, setStepUpAmount] = useState(initialSIPAmount * 0.1);
  const [sipAmount, setSipAmount] = useState(initialSIPAmount);

  const [minimumSIPAmount, setMinimumSIPAmount] = useState(initialSIPAmount);

  useEffect(() => {
    setMinimumSIPAmount(
      computeMinimumSIPAmount(
        remainingYears,
        stepUpAmount,
        lumpSumAmount,
        12,
        targetAmount
      )
    );
  }, [lumpSumAmount, remainingYears, stepUpAmount, targetAmount]);

  return {
    sipRange: [minimumSIPAmount, minimumSIPAmount * 10],
    lumpSumAmount,
    stepUpAmount,
    sipAmount,
    setSipAmount,
    setLumpSumAmount,
    setStepUpAmount,
  };
}
