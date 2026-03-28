import { BankLogo } from "@/components/v2/BankLogo";
import { BankAccount } from "@/types/bank";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface BankAccountChipProps {
    bank: BankAccount;
    selected: boolean;
    onPress: () => void;
}

export function BankAccountChip({ bank, selected, onPress }: BankAccountChipProps) {
    return (
        <TouchableOpacity
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <BankLogo name={bank.name} style={styles.logo} />
            <Text style={styles.label} numberOfLines={1}>
                {bank.name}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    chip: {
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#E0E0E0",
        borderRadius: 12,
        padding: 12,
        width: 90,
        backgroundColor: "#FAFAFA",
    },
    chipSelected: {
        borderColor: "#3137D5",
        backgroundColor: "#F0F1FD",
    },
    logo: {
        width: 40,
        height: 40,
        marginBottom: 6,
    },
    label: {
        fontSize: 12,
        color: "#444444",
        textAlign: "center",
    },
});
