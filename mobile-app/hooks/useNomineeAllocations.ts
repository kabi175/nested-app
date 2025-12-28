import { useAtomValue } from "jotai";
import { nomineeListAtom } from "@/atoms/nominee";

export function useNomineeAllocations() {
  const nomineeList = useAtomValue(nomineeListAtom);

  const totalAllocation = nomineeList.reduce((sum, n) => sum + n.allocation, 0);
  const remainingAllocation = 100 - totalAllocation;

  return {
    totalAllocation,
    remainingAllocation,
  };
}

