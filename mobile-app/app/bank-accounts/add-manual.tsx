import { useAddBankAccount } from "@/hooks/useBankAccount";
import {
  Button,
  Card,
  Input,
  Layout,
  Radio,
  RadioGroup,
  Text,
} from "@ui-kitten/components";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
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
          Alert.alert("Success", "Bank account added successfully", [
            {
              text: "OK",
              onPress: () => router.replace("/bank-accounts/list"),
            },
          ]);
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
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="auto" backgroundColor="#fff" />
      <Layout style={styles.container} level="1">
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text category="h4" style={styles.title}>
              Enter bank account details
            </Text>
            <Text category="s1" appearance="hint" style={styles.subtitle}>
              Enter the details of your bank account to link it to your account.
            </Text>
          </View>

          {/* Bank Details Card */}
          <Card style={styles.card} status="primary">
            <View style={styles.cardHeader}>
              <Text category="h6" style={styles.cardTitle}>
                Bank Details
              </Text>
            </View>

            <View style={styles.formSection}>
              <Input
                label="Account Number"
                placeholder="Enter account number"
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="numeric"
                style={styles.input}
              />

              <Input
                label="Re-enter Account Number"
                placeholder="Re-enter account number"
                value={reAccountNumber}
                onChangeText={setReAccountNumber}
                keyboardType="numeric"
                status={
                  reAccountNumber &&
                  accountNumber &&
                  reAccountNumber !== accountNumber
                    ? "danger"
                    : "basic"
                }
                caption={
                  reAccountNumber &&
                  accountNumber &&
                  reAccountNumber !== accountNumber
                    ? "Account numbers do not match"
                    : ""
                }
                style={styles.input}
              />

              <Input
                label="IFSC Code"
                placeholder="Enter IFSC code"
                value={ifscCode}
                onChangeText={(text) => setIfscCode(text.toUpperCase())}
                autoCapitalize="characters"
                style={styles.input}
              />
            </View>
          </Card>

          {/* Account Type Card */}
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Text category="h6" style={styles.cardTitle}>
                Account Type
              </Text>
            </View>

            <RadioGroup
              selectedIndex={accountType}
              onChange={(index) => setAccountType(index)}
              style={styles.radioGroup}
            >
              {accountTypes.map((type, index) => (
                <Radio key={index} style={styles.radio}>
                  {type.label}
                </Radio>
              ))}
            </RadioGroup>
          </Card>
        </ScrollView>

        {/* Continue Button - Fixed at Bottom */}
        <SafeAreaView style={styles.buttonContainer} edges={["bottom"]}>
          <Button
            style={styles.continueButton}
            size="large"
            disabled={!isFormValid || isPending}
            onPress={handleContinue}
          >
            {isPending ? "Adding..." : "Continue"}
          </Button>
        </SafeAreaView>
      </Layout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100, // Extra padding to prevent content from being hidden behind button
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
    fontWeight: "bold",
  },
  subtitle: {
    lineHeight: 20,
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: "600",
  },
  formSection: {
    gap: 16,
  },
  input: {
    marginBottom: 4,
  },
  radioGroup: {
    gap: 12,
  },
  radio: {
    marginBottom: 4,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  continueButton: {
    width: "100%",
  },
});
