import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface AmountInputProps {
    value: string;
    onChange: (v: string) => void;
}

export function AmountInput({ value, onChange }: AmountInputProps) {
    return (
        <View style={styles.row}>
            <Text style={styles.rupee}>₹</Text>
            <TextInput
                style={styles.input}
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

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    rupee: {
        fontSize: 22,
        fontWeight: "500",
        color: "#111111",
        marginRight: 6,
    },
    input: {
        flex: 1,
        fontSize: 22,
        fontWeight: "400",
        color: "#111111",
        padding: 0,
    },
});
