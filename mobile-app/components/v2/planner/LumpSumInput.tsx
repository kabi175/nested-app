import React, { useState } from "react";
import {
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

interface LumpSumInputProps {
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  amount?: string;
  onAmountChange?: (amount: string) => void;
  error?: string;
  touched?: boolean;
}

export const LumpSumInput: React.FC<LumpSumInputProps> = ({
  enabled: controlledEnabled,
  onToggle,
  amount: controlledAmount,
  onAmountChange,
  error,
  touched: controlledTouched,
}) => {
  const [internalEnabled, setInternalEnabled] = useState(false);
  const [internalAmount, setInternalAmount] = useState("");
  const [internalTouched, setTouched] = useState(false);

  const touched = controlledTouched ?? internalTouched;

  const isControlled = controlledEnabled !== undefined;
  const enabled = isControlled ? controlledEnabled : internalEnabled;
  const amount = controlledAmount !== undefined ? controlledAmount : internalAmount;

  const handleToggle = (value: boolean) => {
    if (!isControlled) setInternalEnabled(value);
    onToggle?.(value);
  };

  const handleAmountChange = (value: string) => {
    if (controlledAmount === undefined) setInternalAmount(value);
    onAmountChange?.(value);
  };

  const showError = touched && !!error;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <Text style={styles.title}>ADD LUMP SUM</Text>
          <Text style={styles.subtitle}>One-time investment</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={handleToggle}
          trackColor={{ false: "#C7C7CC", true: "#3137D5" }}
          thumbColor="#FFFFFF"
        />
      </View>

      {enabled && (
        <>
          <TextInput
            style={[styles.input, showError && styles.inputError]}
            placeholder="Enter Amount"
            placeholderTextColor="#9CA3AF"
            value={amount}
            onChangeText={handleAmountChange}
            onBlur={() => setTouched(true)}
            keyboardType="numeric"
          />
          {showError && <Text style={styles.errorText}>{error}</Text>}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F4F5F6",
    borderRadius: 16,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  labelContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6E6F7A",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "400",
    color: "#9CA3AF",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D4D4D4",
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
    marginTop: 12,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
});
