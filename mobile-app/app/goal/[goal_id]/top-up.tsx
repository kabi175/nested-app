import { BankLogo } from "@/components/v2/BankLogo";
import Button from "@/components/v2/Button";
import ErrorScreen from "@/components/v2/ErrorScreen";
import GoalHeader from "@/components/v2/goal/GoalHeader";
import { useBankAccounts } from "@/hooks/useBankAccount";
import { useCreateOrders } from "@/hooks/useCreateOrders";
import { useGoal } from "@/hooks/useGoal";
import { useCreatePayment } from "@/hooks/usePaymentMutations";
import { BankAccount } from "@/types/bank";
import { formatCurrency } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Constants ────────────────────────────────────────────────────────────────

const QUICK_AMOUNTS = [2000, 3500, 5000, 7000];

type PaymentMethod = "upi" | "net_banking";

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
    { id: "upi", label: "UPI", icon: "phone-portrait-outline" },
    { id: "net_banking", label: "Netbanking", icon: "business-outline" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSipDate(date: Date): string {
    const d = new Date(date);
    return `${d.getDate()} ${d.toLocaleString("en", { month: "short" })}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AmountInput({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <View style={styles.amountInputRow}>
            <Text style={styles.rupeeSymbol}>₹</Text>
            <TextInput
                style={styles.amountInput}
                value={value}
                onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ""))}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#BDBDBD"
                returnKeyType="done"
            />
        </View>
    );
}

function QuickAmountChip({
    amount,
    selected,
    onPress,
}: {
    amount: number;
    selected: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={[styles.quickChip, selected && styles.quickChipSelected]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[styles.quickChipText, selected && styles.quickChipTextSelected]}>
                ₹{amount.toLocaleString("en-IN")}
            </Text>
        </TouchableOpacity>
    );
}

function PaymentMethodRow({
    method,
    selected,
    onPress,
}: {
    method: (typeof PAYMENT_METHODS)[number];
    selected: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={[styles.paymentRow, selected && styles.paymentRowSelected]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.paymentIcon, selected && styles.paymentIconSelected]}>
                <Ionicons name={method.icon as any} size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.paymentLabel}>{method.label}</Text>
        </TouchableOpacity>
    );
}

function BankAccountChip({
    bank,
    selected,
    onPress,
}: {
    bank: BankAccount;
    selected: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={[styles.bankChip, selected && styles.bankChipSelected]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <BankLogo name={bank.name} style={styles.bankLogo} />
            <Text style={styles.bankChipLabel} numberOfLines={1}>
                {bank.name}
            </Text>
        </TouchableOpacity>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function TopUpScreen() {
    const { goal_id } = useLocalSearchParams<{ goal_id: string }>();

    const { data: goal, isLoading: goalLoading } = useGoal(goal_id);
    const { data: bankAccountsData, isLoading: banksLoading } = useBankAccounts();

    const bankAccounts: BankAccount[] = useMemo(
        () => (Array.isArray(bankAccountsData) ? bankAccountsData : []),
        [bankAccountsData]
    );

    const createOrdersMutation = useCreateOrders();
    const createPaymentMutation = useCreatePayment();
    const [amount, setAmount] = useState("");
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("upi");
    const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Auto-select primary bank once accounts are loaded
    useEffect(() => {
        if (!banksLoading && bankAccounts.length > 0 && !selectedBank) {
            setSelectedBank(bankAccounts.find((b) => b.isPrimary) ?? bankAccounts[0]);
        }
    }, [banksLoading, bankAccounts, selectedBank]);

    const minInvestment = goal?.basket?.min_investment ?? 1;
    const numericAmount = Number(amount);
    const isValid = numericAmount >= minInvestment && selectedBank !== null;
    console.log("numericAmount >= minInvestment:", numericAmount >= minInvestment, numericAmount, minInvestment);

    const sipInfoText = useMemo(() => {
        if (goal?.nextSipAmount && goal?.nextSipDate) {
            return `This is a one-time addition. Your SIP of ${formatCurrency(goal.nextSipAmount)} on ${formatSipDate(goal.nextSipDate)} continues as planned.`;
        }
        return "This is a one-time addition. Your SIP continues as planned.";
    }, [goal?.nextSipAmount, goal?.nextSipDate]);

    const handleAddToFund = async () => {
        setError(null);

        if (amount.trim() === "" || isNaN(numericAmount) || numericAmount <= 0) {
            setError("Please enter a valid amount.");
            return;
        }

        if (selectedBank == null) {
            setError("Please select a bank account.");
            return;
        }

        try {
            const orders = [{ type: "buy" as const, amount: numericAmount, goalId: goal_id }];
            const orderResponse = await createOrdersMutation.mutateAsync({ orders });
            const payment = await createPaymentMutation.mutateAsync({
                orders: orderResponse,
                paymentOption: {
                    payment_method: selectedMethod,
                    bank_id: selectedBank.id,
                },
            });
            router.push({
                pathname: "/payment/[payment_id]/verify",
                params: { payment_id: payment.id },
            });
        } catch (e: any) {
            const message =
                e?.response?.data?.message ??
                e?.response?.data?.error ??
                e?.message ??
                "Something went wrong. Please try again.";
            setError(message);
        }
    };

    if (goalLoading) {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <GoalHeader title="Add money" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3137D5" />
                </View>
            </SafeAreaView>
        );
    }

    if (!goal) {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <GoalHeader title="Add money" />
                <ErrorScreen errorMessage="Goal not found. Please go back and try again." />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <GoalHeader title="Add money" />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Amount section */}
                <Text style={styles.sectionLabel}>ENTER AMOUNT</Text>
                <View style={styles.amountBox}>
                    <AmountInput value={amount} onChange={setAmount} />
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.quickAmountsRow}
                >
                    {QUICK_AMOUNTS.map((q) => (
                        <QuickAmountChip
                            key={q}
                            amount={q}
                            selected={numericAmount === q}
                            onPress={() => setAmount(String(q))}
                        />
                    ))}
                </ScrollView>

                {/* Payment method section */}
                <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
                    CHOOSE A PAYMENT METHOD
                </Text>
                {PAYMENT_METHODS.map((m) => (
                    <PaymentMethodRow
                        key={m.id}
                        method={m}
                        selected={selectedMethod === m.id}
                        onPress={() => setSelectedMethod(m.id)}
                    />
                ))}

                {/* Bank account section */}
                <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
                    SELECT BANK ACCOUNT
                </Text>

                {banksLoading ? (
                    <ActivityIndicator size="small" color="#3137D5" style={styles.banksLoader} />
                ) : (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.bankChipsRow}
                    >
                        {bankAccounts.map((bank) => (
                            <BankAccountChip
                                key={bank.id}
                                bank={bank}
                                selected={selectedBank?.id === bank.id}
                                onPress={() => setSelectedBank(bank)}
                            />
                        ))}
                    </ScrollView>
                )}

                {/* SIP info box */}
                {goal?.monthlySip ? (
                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>{sipInfoText}</Text>
                    </View>
                ) : null}
            </ScrollView>

            {/* Footer CTA */}
            <View style={styles.footer}>
                <Button
                    title={`Add to ${goal?.child?.name ?? "fund"}'s fund`}
                    disabled={!isValid}
                    onPress={handleAddToFund}
                />
            </View>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 120,
    },

    // Section labels
    sectionLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#8A8A9A",
        letterSpacing: 0.8,
        marginBottom: 10,
    },
    sectionLabelSpaced: {
        marginTop: 24,
    },

    // Amount input
    amountBox: {
        borderWidth: 1.5,
        borderColor: "#3137D5",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 14,
    },
    amountInputRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    rupeeSymbol: {
        fontSize: 22,
        fontWeight: "500",
        color: "#111111",
        marginRight: 6,
    },
    amountInput: {
        flex: 1,
        fontSize: 22,
        fontWeight: "400",
        color: "#111111",
        padding: 0,
    },

    // Quick amount chips
    quickAmountsRow: {
        gap: 10,
        paddingBottom: 2,
    },
    quickChip: {
        borderWidth: 1.5,
        borderColor: "#E0E0E0",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#F5F5F5",
    },
    quickChipSelected: {
        borderColor: "#3137D5",
        backgroundColor: "#3137D5",
    },
    quickChipText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#444444",
    },
    quickChipTextSelected: {
        color: "#FFFFFF",
    },

    // Payment method rows
    paymentRow: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#E0E0E0",
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        backgroundColor: "#FFFFFF",
    },
    paymentRowSelected: {
        borderColor: "#3137D5",
    },
    paymentIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#BDBDBD",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    paymentIconSelected: {
        backgroundColor: "#3137D5",
    },
    paymentLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "#111111",
    },

    // Bank account chips
    bankChipsRow: {
        gap: 10,
        paddingBottom: 2,
    },
    bankChip: {
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#E0E0E0",
        borderRadius: 12,
        padding: 12,
        width: 90,
        backgroundColor: "#FAFAFA",
    },
    bankChipSelected: {
        borderColor: "#3137D5",
        backgroundColor: "#F0F1FD",
    },
    bankLogo: {
        width: 40,
        height: 40,
        marginBottom: 6,
    },
    bankChipLabel: {
        fontSize: 12,
        color: "#444444",
        textAlign: "center",
    },
    banksLoader: {
        marginVertical: 16,
    },

    // SIP info box
    infoBox: {
        marginTop: 24,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "#BDBDBD",
        borderRadius: 10,
        padding: 14,
    },
    infoText: {
        fontSize: 13,
        color: "#555555",
        textAlign: "center",
        lineHeight: 20,
    },

    // Footer
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 34,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
    },
});
