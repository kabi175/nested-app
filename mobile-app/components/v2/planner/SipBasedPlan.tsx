import Slider from "@/components/v2/Slider";
import { LumpSumInput } from "@/components/v2/planner/LumpSumInput";
import NestGrowthCard from "@/components/v2/planner/NestGrowthCard";
import { formatCurrency } from "@/utils/formatters";
import { computeMinimumSIPAmount } from "@/utils/sip";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const EXPECTED_RETURNS = 12;
const SLIDER_MAX = 1_00_000;

function computeTargetFromSIP(sip: number, years: number, lumpsum: number): number {
    const r_m = EXPECTED_RETURNS / 12 / 100;
    const n = years * 12;
    const fvSip = sip * ((Math.pow(1 + r_m, n) - 1) / r_m);
    const fvLump = lumpsum * Math.pow(1 + r_m, n);
    return Math.round(fvSip + fvLump);
}

function computeQuickSelectOptions(sipMin: number): number[] {
    const step = Math.max(500, Math.round((sipMin * 0.5) / 500) * 500);
    return Array.from({ length: 4 }, (_, i) =>
        Math.round((sipMin + i * step) / 500) * 500
    );
}

interface Props {
    defaultTarget: number;
    targetYear: number;
    remainingYears: number;
    sipMin: number;
    onSipChange: (sip: number) => void;
    onTargetChange: (target: number) => void;
    onLumpsumChange: (lumpsum: number) => void;
}

export default function SipBasedPlan({
    defaultTarget,
    targetYear,
    remainingYears,
    sipMin,
    onSipChange,
    onTargetChange,
    onLumpsumChange,
}: Props) {
    const years = remainingYears > 0 ? remainingYears : 1;

    const [sipAmount, setSipAmount] = useState(() => {
        const seed = computeMinimumSIPAmount(years, 0, 0, EXPECTED_RETURNS, defaultTarget);
        return Math.min(Math.max(seed, sipMin), SLIDER_MAX);
    });
    const [lumpSumEnabled, setLumpSumEnabled] = useState(false);
    const [lumpSumStr, setLumpSumStr] = useState("");

    const lumpSum = lumpSumEnabled ? (parseInt(lumpSumStr, 10) || 0) : 0;

    const computedTarget = useMemo(
        () => computeTargetFromSIP(sipAmount, years, lumpSum),
        [sipAmount, years, lumpSum]
    );

    const totalInvested = sipAmount * years * 12 + lumpSum;
    const quickSelectOptions = computeQuickSelectOptions(sipMin);

    useEffect(() => { onSipChange(sipAmount); }, [sipAmount]);
    useEffect(() => { onTargetChange(computedTarget); }, [computedTarget]);
    useEffect(() => { onLumpsumChange(lumpSum); }, [lumpSum]);

    const handleLumpSumToggle = (enabled: boolean) => {
        setLumpSumEnabled(enabled);
        if (!enabled) setLumpSumStr("");
    };

    return (
        <>
            <View style={styles.section}>
                <NestGrowthCard
                    targetAmount={computedTarget}
                    editable={false}
                    targetYear={targetYear}
                    remainingYears={remainingYears}
                    totalInvested={totalInvested}
                />
            </View>

            <View style={styles.section}>
                <Slider
                    variant="default"
                    label="MONTHLY SIP"
                    min={sipMin}
                    max={SLIDER_MAX}
                    step={100}
                    value={sipAmount}
                    onValueChange={setSipAmount}
                />
                <View style={styles.quickSelectHeader}>
                    <Text style={styles.quickSelectLabel}>QUICK SELECT</Text>
                </View>
                <View style={styles.quickSelectRow}>
                    {quickSelectOptions.map((opt) => (
                        <Pressable
                            key={opt}
                            style={[
                                styles.quickChip,
                                sipAmount === opt && styles.quickChipActive,
                            ]}
                            onPress={() => setSipAmount(opt)}
                        >
                            <Text
                                style={[
                                    styles.quickChipText,
                                    sipAmount === opt && styles.quickChipTextActive,
                                ]}
                            >
                                {formatCurrency(opt)}{"\n"}/mo
                            </Text>
                        </Pressable>
                    ))}
                </View>
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
    quickSelectHeader: {
        marginTop: 20,
        marginBottom: 10,
    },
    quickSelectLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#6E6F7A",
        letterSpacing: 0.5,
    },
    quickSelectRow: {
        flexDirection: "row",
        gap: 10,
    },
    quickChip: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: "#E0E0E0",
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 6,
        alignItems: "center",
        backgroundColor: "#FFFFFF",
    },
    quickChipActive: {
        backgroundColor: "#3137D5",
        borderColor: "#3137D5",
    },
    quickChipText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#1D1E20",
        textAlign: "center",
        lineHeight: 18,
    },
    quickChipTextActive: {
        color: "#FFFFFF",
    },
});
