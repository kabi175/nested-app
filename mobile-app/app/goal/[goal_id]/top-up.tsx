import Button from "@/components/v2/Button";
import ErrorScreen from "@/components/v2/ErrorScreen";
import GoalHeader from "@/components/v2/goal/GoalHeader";
import { AmountInput } from "@/components/v2/top-up/AmountInput";
import { BankAccountChip } from "@/components/v2/top-up/BankAccountChip";
import { PaymentMethodRow } from "@/components/v2/top-up/PaymentMethodRow";
import { QuickAmountChip } from "@/components/v2/top-up/QuickAmountChip";
import { PAYMENT_METHODS, PaymentMethod, computeQuickAmounts } from "@/components/v2/top-up/types";
import { useBankAccounts } from "@/hooks/useBankAccount";
import { useCreateOrders } from "@/hooks/useCreateOrders";
import { useGoal } from "@/hooks/useGoal";
import { useCreatePayment } from "@/hooks/usePaymentMutations";
import { BankAccount } from "@/types/bank";
import { formatCurrency } from "@/utils/formatters";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatSipDate(date: Date): string {
    const d = new Date(date);
    return `${d.getDate()} ${d.toLocaleString("en", { month: "short" })}`;
}

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

    useEffect(() => {
        if (!banksLoading && bankAccounts.length > 0 && !selectedBank) {
            setSelectedBank(bankAccounts.find((b) => b.isPrimary) ?? bankAccounts[0]);
        }
    }, [banksLoading, bankAccounts, selectedBank]);

    const minInvestment = goal?.basket?.min_investment ?? 1;
    const numericAmount = Number(amount);
    const isBelowMin = numericAmount > 0 && numericAmount < minInvestment;
    const isValid = numericAmount >= minInvestment && selectedBank !== null;
    const quickAmounts = useMemo(() => computeQuickAmounts(minInvestment), [minInvestment]);

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
                <Text style={styles.sectionLabel}>ENTER AMOUNT</Text>
                <View style={[styles.amountBox, isBelowMin && styles.amountBoxError]}>
                    <AmountInput value={amount} onChange={setAmount} />
                </View>
                {isBelowMin && (
                    <Text style={styles.amountErrorText}>
                        Minimum investment is {formatCurrency(minInvestment)}
                    </Text>
                )}

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.quickAmountsRow}
                >
                    {quickAmounts.map((q) => (
                        <QuickAmountChip
                            key={q}
                            amount={q}
                            selected={numericAmount === q}
                            onPress={() => setAmount(String(q))}
                        />
                    ))}
                </ScrollView>

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

                {goal?.monthlySip ? (
                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>{sipInfoText}</Text>
                    </View>
                ) : null}

                {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </ScrollView>

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
    amountBox: {
        borderWidth: 1.5,
        borderColor: "#3137D5",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 6,
    },
    amountBoxError: {
        borderColor: "#D32F2F",
    },
    amountErrorText: {
        fontSize: 12,
        color: "#D32F2F",
        marginBottom: 10,
    },
    quickAmountsRow: {
        gap: 10,
        paddingBottom: 2,
    },
    bankChipsRow: {
        gap: 10,
        paddingBottom: 2,
    },
    banksLoader: {
        marginVertical: 16,
    },
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
    errorText: {
        marginTop: 12,
        fontSize: 13,
        color: "#D32F2F",
        textAlign: "center",
    },
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
