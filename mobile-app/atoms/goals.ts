import { Goal, Order } from "@/types/investment";
import { atom } from "jotai";

export type GoalForCustomize = Goal & { investment?: Order[] };

export const goalsForCustomizeAtom = atom<GoalForCustomize[]>([]);
