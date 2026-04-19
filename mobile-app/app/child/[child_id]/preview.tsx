import { cartAtom } from "@/atoms/cart";
import BackButton from "@/components/v2/BackButton";
import Button from "@/components/v2/Button";
import { EducationGoalCard } from "@/components/v2/planner/EducationGoalCard";
import PlanProjection from "@/components/v2/planner/PlanProjection";
import { useBasketById } from "@/hooks/useBasket";
import { useChild } from "@/hooks/useChildren";
import { useGoal } from "@/hooks/useGoal";
import { formatCompactCurrency, formatCurrency } from "@/utils/formatters";
import { router, useLocalSearchParams } from "expo-router";
import { useAtomValue } from "jotai";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

function computeFDAmount(sipAmount: number, lumpSum: number, years: number): number {
    const r = 0.07 / 12;
    const n = years * 12;
    return sipAmount * ((Math.pow(1 + r, n) - 1) / r) + lumpSum * Math.pow(1 + r, n);
}

export default function Preview() {
    const { child_id } = useLocalSearchParams<{ child_id: string }>();
    const insets = useSafeAreaInsets();

    const cart = useAtomValue(cartAtom);
    const { data: child } = useChild(child_id);

    const goalId = cart[0]?.goal?.id ?? "";
    const { data: goal } = useGoal(goalId);
    const { data: basket } = useBasketById(goal?.basket?.id ?? '');

    const sipAmount = cart.find((o) => o.type === "sip")?.amount ?? 0;
    const lumpSum = cart.find((o) => o.type === "buy")?.amount ?? 0;

    const targetYear = goal?.targetDate ? goal.targetDate.getFullYear() : new Date().getFullYear() + 18;
    const remainingYears = Math.max(targetYear - new Date().getFullYear(), 1);
    const totalInvested = sipAmount * remainingYears * 12 + lumpSum;

    const nestedL = goal ? Math.round(goal.targetAmount / 1_00_000) : 0;
    const fdL = Math.round(computeFDAmount(sipAmount, lumpSum, remainingYears) / 1_00_000);
    const maxL = Math.ceil(nestedL * 1.1 / 5) * 5 || 55;

    const childName = child?.firstName ?? "your child";

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <BackButton onPress={() => router.back()} />
                    <Text style={styles.title}>
                        Here&apos;s what we&apos;re planning{"\n"}for <Text style={styles.titleBold}>{childName}</Text>
                    </Text>
                </View>

                {/* Goal card */}
                <EducationGoalCard
                    year={targetYear}
                    amount={goal?.targetAmount ?? 0}
                    yearsFromNow={remainingYears}
                    collegeType=""
                />

                {/* Stats row */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>MONTHLY SIP</Text>
                        <Text style={styles.statValue}>{formatCurrency(sipAmount)}</Text>
                        <Text style={styles.statSub}>Ideal plan</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>TOTAL INVESTED</Text>
                        <Text style={styles.statValue}>{formatCompactCurrency(totalInvested)}</Text>
                        <Text style={styles.statSub}>over {remainingYears} years</Text>
                    </View>
                </View>

                {/* Projection */}
                <View style={styles.section}>
                    <PlanProjection
                        year={targetYear}
                        plans={[
                            { label: "NESTED", amount: nestedL },
                            { label: "FD / RD", amount: fdL },
                            { label: "No plan", amount: 0 },
                        ]}
                        maxAmount={maxL}
                    />
                </View>

                {/* Fund Portfolio */}
                {(basket?.funds ?? []).length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.fundSectionLabel}>FUND PORTFOLIO</Text>
                        {basket!.funds.map((fund) => (
                            <View key={fund.id} style={styles.fundCard}>
                                <View style={styles.fundCardLeft}>
                                    <Text style={styles.fundName}>{fund.name}</Text>
                                    <Text style={styles.fundCardSub}>{fund.allocationPercentage}% of portfolio</Text>
                                </View>
                                <View style={styles.fundCardRight}>
                                    {fund.cagr != null && (
                                        <Text style={styles.fundCagr}>+{fund.cagr.toFixed(1)}%</Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Push footer to bottom */}
                <View style={{ flex: 1 }} />

                {/* Notice */}
                <View style={styles.section}>
                    <View style={styles.noticeCard}>
                        <Text style={styles.noticeText}>
                            We adjust the nest automatically as {childName} grows, shifting from high growth to stability closer to college.
                        </Text>
                    </View>
                </View>

                {/* CTA */}
                <View style={[styles.section, { paddingBottom: insets.bottom + 16 }]}>
                    <Button
                        title="Let's begin  →"
                        onPress={() => router.replace({
                            pathname: "/child/[child_id]/testimonials",
                            params: { child_id }
                        })}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    header: {
        gap: 20,
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: "400",
        color: "#1D1E20",
        lineHeight: 32,
        textAlign: "center",
    },
    titleBold: {
        fontWeight: "700",
    },
    statsRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        gap: 4,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#6E6F7A",
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    statValue: {
        fontSize: 22,
        fontWeight: "700",
        color: "#1D1E20",
    },
    statSub: {
        fontSize: 12,
        color: "#8A8A9A",
    },
    section: {
        marginTop: 16,
    },
    noticeCard: {
        borderWidth: 1,
        borderColor: "#C5CEE0",
        borderStyle: "dashed",
        borderRadius: 8,
        padding: 12,
        alignItems: "center",
        backgroundColor: "#6F85F50F",
    },
    noticeText: {
        fontSize: 13,
        color: "#6E6F7A",
        textAlign: "center",
        lineHeight: 20,
    },
    fundSectionLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#8A8A8E",
        letterSpacing: 1,
        textTransform: "uppercase",
        marginBottom: 12,
    },
    fundCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#ECECEC",
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    fundCardLeft: { flex: 1, gap: 3 },
    fundCardRight: { flexDirection: "row", alignItems: "center", gap: 10 },
    fundName: { fontSize: 16, fontWeight: "400", color: "#1D1E20" },
    fundCardSub: { fontSize: 13, color: "#8A8A8E" },
    fundCagr: { fontSize: 14, fontWeight: "600", color: "#16A34A" },
});
