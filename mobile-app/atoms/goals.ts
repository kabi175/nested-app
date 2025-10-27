import { Goal } from "@/types/user";
import { atom } from "jotai";

export type Investment = {
  id: string;
  type: "sip" | "buy";
  amount: number;
};
export type GoalForCustomize = Goal & { investment?: Investment[] };

export const goalsForCustomizeAtom = atom<GoalForCustomize[]>([]);
