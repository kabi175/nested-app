import { useAddBankAccount } from "@/hooks/useBankAccount";
import {
  Button,
  Input,
  Text,
} from "@ui-kitten/components";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddManualScreen() {
  const accountTypes = [
    { label: "Savings", value: "savings" },
    { label: "Current", value: "current" },
  ];

  const [accountNumber, setAccountNumber] = useState("");
  const [reAccountNumber, setReAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountType, setAccountType] = useState<number>(0);

  const { mutate: addBank, isPending } = useAddBankAccount();

  const isFormValid =
    accountNumber.trim() &&
    reAccountNumber.trim() &&
    ifscCode.trim() &&
    accountNumber === reAccountNumber;

  const handleContinue = () => {
    if (!isFormValid) return;

    addBank(
      {
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim(),
        type: accountTypes[accountType].value as "savings" | "current",
        isPrimary: false,
      },
      {
        onSuccess: () => {
          router.replace("/bank-accounts/success");
        },
        onError: (error: any) => {
          Alert.alert(
            "Error",
            error?.response?.data?.message ||
            "Failed to add bank account. Please try again."
          );
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar style="dark" backgroundColor="#F8F9FA" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enter bank account details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Form Fields */}
        <View style={styles.formSection}>
          <Input
            label={(props: any) => <Text {...props} style={styles.inputLabel}>Account Number</Text>}
            placeholder="Enter Account Number"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="numeric"
            style={styles.input}
            textStyle={styles.inputText}
          />

          <Input
            label={(props: any) => <Text {...props} style={styles.inputLabel}>Re-enter Account Number</Text>}
            placeholder="Re-enter Account Number"
            value={reAccountNumber}
            onChangeText={setReAccountNumber}
            keyboardType="numeric"
            status={
              reAccountNumber && accountNumber && reAccountNumber !== accountNumber
                ? "danger"
                : "basic"
            }
            caption={
              reAccountNumber && accountNumber && reAccountNumber !== accountNumber
                ? "Account numbers do not match"
                : ""
            }
            style={styles.input}
            textStyle={styles.inputText}
          />

          <Input
            label={(props: any) => <Text {...props} style={styles.inputLabel}>IFSC Code</Text>}
            placeholder="Enter IFSC code"
            value={ifscCode}
            onChangeText={(text) => setIfscCode(text.toUpperCase())}
            autoCapitalize="characters"
            style={styles.input}
            textStyle={styles.inputText}
          />
        </View>

        {/* Account Type */}
        <View style={styles.accountTypeSection}>
          <Text style={styles.accountTypeLabel}>Account Type</Text>
          <View style={styles.radioGroup}>
            {accountTypes.map((type, index) => (
              <TouchableOpacity
                key={index}
                style={styles.radioRow}
                onPress={() => setAccountType(index)}
                activeOpacity={0.7}
              >
                <View style={styles.radioOuter}>
                  {accountType === index && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <Button
          style={styles.continueButton}
          size="large"
          disabled={!isFormValid || isPending}
          onPress={handleContinue}
        >
          {isPending ? "Adding..." : "Continue"}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F8F9FA",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEEEF0",
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 18,
    color: "#1A1A2E",
    lineHeight: 22,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A2E",
  },
  headerSpacer: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  formSection: {
    gap: 4,
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 8,
  },
  inputText: {
    fontSize: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#1A1A2E",
    marginBottom: 4,
  },
  accountTypeSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
  },
  accountTypeLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A2E",
    marginBottom: 12,
  },
  radioGroup: {
    gap: 12,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#3366FF",
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3366FF",
  },
  radioLabel: {
    fontSize: 15,
    color: "#1A1A2E",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#F8F9FA",
  },
  continueButton: {
    width: "100%",
    borderRadius: 12,
  },
});
