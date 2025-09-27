import React, { useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onChange?: (otp: string) => void;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  onComplete,
  onChange,
  disabled = false,
}) => {
  const [code, setCode] = useState<string[]>(new Array(length).fill(""));
  const otpRefs = useRef<TextInput[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Call onChange callback
    const otpString = newCode.join("");
    onChange?.(otpString);

    // Check if OTP is complete
    if (otpString.length === length && !otpString.includes("")) {
      onComplete(otpString);
    }

    // Auto-focus next input
    if (value && index < length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {code.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            if (ref) otpRefs.current[index] = ref;
          }}
          style={[
            styles.otpInputBox,
            digit ? styles.otpInputBoxFilled : styles.otpInputBoxEmpty,
            disabled && styles.otpInputBoxDisabled,
          ]}
          value={digit}
          onChangeText={(value) => handleOtpChange(value, index)}
          onKeyPress={({ nativeEvent }) =>
            handleOtpKeyPress(nativeEvent.key, index)
          }
          keyboardType="number-pad"
          maxLength={1}
          textAlign="center"
          selectTextOnFocus
          editable={!disabled}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  otpInputBox: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderRadius: 8,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  otpInputBoxEmpty: {
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    color: "#1a1a1a",
  },
  otpInputBoxFilled: {
    borderColor: "#3b82f6",
    backgroundColor: "#f0f9ff",
    color: "#1a1a1a",
  },
  otpInputBoxDisabled: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    color: "#9ca3af",
  },
});
