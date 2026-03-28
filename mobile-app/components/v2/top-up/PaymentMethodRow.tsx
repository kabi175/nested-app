import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PAYMENT_METHODS } from "./types";

interface PaymentMethodRowProps {
    method: (typeof PAYMENT_METHODS)[number];
    selected: boolean;
    onPress: () => void;
}

export function PaymentMethodRow({ method, selected, onPress }: PaymentMethodRowProps) {
    return (
        <TouchableOpacity
            style={[styles.row, selected && styles.rowSelected]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.icon, selected && styles.iconSelected]}>
                <Ionicons name={method.icon as any} size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.label}>{method.label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#E0E0E0",
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        backgroundColor: "#FFFFFF",
    },
    rowSelected: {
        borderColor: "#3137D5",
    },
    icon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#BDBDBD",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    iconSelected: {
        backgroundColor: "#3137D5",
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
        color: "#111111",
    },
});
