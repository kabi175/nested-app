import { Input, Layout } from "@ui-kitten/components";
import React, { useRef, useState } from "react";
import { StyleSheet, TextInput } from "react-native";

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
  const otpRefs = useRef<any[]>([]);

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

  const handleAutoFill = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, length).split("");
    const newCode = new Array(length).fill("").map((_, i) => digits[i] ?? "");
    setCode(newCode);
    const otpString = newCode.join("");
    onChange?.(otpString);
    if (otpString.length === length && !otpString.includes("")) {
      onComplete(otpString);
    }
  };

  return (
    <Layout style={styles.container}>
      <TextInput
        style={styles.hiddenInput}
        value={code.join("")}
        onChangeText={handleAutoFill}
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        keyboardType="number-pad"
        maxLength={length}
        caretHidden
        accessible={false}
        importantForAccessibility="no"
        editable={!disabled}
      />
      {code.map((digit, index) => (
        <Input
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
          disabled={disabled}
          size="large"
        />
      ))}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "transparent",
  },
  otpInputBox: {
    width: 50,
    height: 50,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
  },
  otpInputBoxEmpty: {
    // UI Kitten handles default styling
  },
  otpInputBoxFilled: {
    // UI Kitten handles filled state styling
  },
  otpInputBoxDisabled: {
    // UI Kitten handles disabled state styling
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
    pointerEvents: "none",
  },
});
