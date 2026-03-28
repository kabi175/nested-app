import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface QuickAmountChipProps {
    amount: number;
    selected: boolean;
    onPress: () => void;
}

export function QuickAmountChip({ amount, selected, onPress }: QuickAmountChipProps) {
    return (
        <TouchableOpacity
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[styles.text, selected && styles.textSelected]}>
                ₹{amount.toLocaleString("en-IN")}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    chip: {
        borderWidth: 1.5,
        borderColor: "#E0E0E0",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#F5F5F5",
    },
    chipSelected: {
        borderColor: "#3137D5",
        backgroundColor: "#3137D5",
    },
    text: {
        fontSize: 14,
        fontWeight: "500",
        color: "#444444",
    },
    textSelected: {
        color: "#FFFFFF",
    },
});
