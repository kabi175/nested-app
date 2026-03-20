import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
} from "react-native";

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  touched?: boolean;
}

export default function TextInput({
  label,
  error,
  touched,
  style,
  onFocus,
  onBlur,
  ...props
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const showError = touched && !!error;
  const showActiveBorder = isFocused && !showError;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        style={[
          styles.input,
          showActiveBorder && styles.inputFocused,
          showError && styles.inputError,
          style,
        ]}
        placeholderTextColor="#9CA3AF"
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {showError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB", // Light gray
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
  },
  inputFocused: {
    borderColor: "#3137D5",
    borderWidth: 1,
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
