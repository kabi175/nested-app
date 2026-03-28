export type PaymentMethod = "upi" | "net_banking";

/** Returns 4 quick-pick amounts based on the basket's minimum investment. */
export function computeQuickAmounts(minInvestment: number): number[] {
    const base = Math.max(minInvestment, 500);
    const round = (n: number) => Math.ceil(n / 500) * 500;
    return [
        round(base),
        round(base * 2),
        round(base * 3.5),
        round(base * 5),
    ];
}

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
    { id: "upi", label: "UPI", icon: "phone-portrait-outline" },
    { id: "net_banking", label: "Netbanking", icon: "business-outline" },
];
