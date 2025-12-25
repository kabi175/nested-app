import { useAtomValue } from "jotai";
import { nomineeListAtom, draftNomineesAtom } from "@/atoms/nominee";

export function useNomineeAllocations() {
  const nomineeList = useAtomValue(nomineeListAtom);
  const draftNominees = useAtomValue(draftNomineesAtom);

  const activeNominees = nomineeList.filter((n) => !n.optedOut);
  
  const existingTotal = activeNominees.reduce((sum, n) => sum + n.allocation, 0);
  const draftTotal = draftNominees.reduce((sum, n) => sum + n.allocation, 0);
  const totalAllocation = existingTotal + draftTotal;
  const remainingAllocation = 100 - existingTotal - draftTotal;

  return {
    totalAllocation,
    remainingAllocation,
    existingTotal,
    draftTotal,
  };
}

