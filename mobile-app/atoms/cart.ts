import { Order } from "@/types";
import { atom } from "jotai";

export const cartAtom = atom<Order[]>([]);
