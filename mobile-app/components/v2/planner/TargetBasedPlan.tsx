import { LumpSumInput } from "@/components/v2/planner/LumpSumInput";
import NestGrowthCard from "@/components/v2/planner/NestGrowthCard";
import { formatCurrency } from "@/utils/formatters";
import { computeMinimumSIPAmount } from "@/utils/sip";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const EXPECTED_RETURNS = 12;

interface Props {
    defaultTarget: number;
    targetYear: number;
    remainingYears: number;
    onSipChange: (sip: number) => void;
    onTargetChange: (target: number) => void;
    onLumpsumChange: (lumpsum: number) => void;
}

export default function TargetBasedPlan({
    defaultTarget,
    targetYear,
    remainingYears,
    onSipChange,
    onTargetChange,
    onLumpsumChange,
}: Props) {
    const years = remainingYears > 0 ? remainingYears : 1;

    const [targetAmount, setTargetAmount] = useState(defaultTarget);
    const [lumpSumEnabled, setLumpSumEnabled] = useState(false);
    const [lumpSumStr, setLumpSumStr] = useState("");

    const lumpSum = lumpSumEnabled ? (parseInt(lumpSumStr, 10) || 0) : 0;

    const computedSip = useMemo(
        () => computeMinimumSIPAmount(years, 0, lumpSum, EXPECTED_RETURNS, targetAmount),
        [years, lumpSum, targetAmount]
    );

    const totalInvested = computedSip * years * 12 + lumpSum;

    useEffect(() => { onSipChange(computedSip); }, [computedSip]);
    useEffect(() => { onTargetChange(targetAmount); }, [targetAmount]);
    useEffect(() => { onLumpsumChange(lumpSum); }, [lumpSum]);

    const handleLumpSumToggle = (enabled: boolean) => {
        setLumpSumEnabled(enabled);
        if (!enabled) setLumpSumStr("");
    };

    return (
        <>
            <View style={styles.section}>
                <NestGrowthCard
                    targetAmount={targetAmount}
                    editable
                    onAmountChange={setTargetAmount}
                    targetYear={targetYear}
                    remainingYears={remainingYears}
                    totalInvested={totalInvested}
                />
            </View>

            <View style={styles.sipCard}>
                <Text style={styles.sipLabel}>MONTHLY SIP</Text>
                <Text style={styles.sipValue}>{formatCurrency(computedSip)}</Text>
            </View>

            <View style={styles.section}>
                <LumpSumInput
                    enabled={lumpSumEnabled}
                    onToggle={handleLumpSumToggle}
                    amount={lumpSumStr}
                    onAmountChange={setLumpSumStr}
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    section: {
        marginTop: 16,
    },
    sipCard: {
        backgroundColor: "#F4F5F6",
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
    },
    sipLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#6E6F7A",
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    sipValue: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1D1E20",
    },
});
