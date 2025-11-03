import { formatCurrency } from "@/utils/formatters";
import { isValidUpiId } from "@/utils/validation";
import {
  Button,
  Card,
  Divider,
  Input,
  Layout,
  Text,
} from "@ui-kitten/components";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowRight } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BankAccountsScreen() {
  const [upiId, setUpiId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    if (!isValidUpiId(upiId)) {
      setError("Please enter a valid UPI ID");
    } else {
      setError(null);
    }
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
              Link bank account
            </Text>
            <Text category="s1" appearance="hint" style={styles.subtitle}>
              Bank account in your name from which you will transact funds for
              Investment
            </Text>
          </View>

          {/* UPI Link Section */}
          <Card style={styles.card} status="primary">
            <View style={styles.cardHeader}>
              <Text category="h6" style={styles.cardTitle}>
                Link with UPI
              </Text>
            </View>

            <View style={styles.upiSection}>
              <Input
                style={styles.upiInput}
                placeholder="Enter UPI ID"
                textContentType="none"
                autoCapitalize="none"
                value={upiId}
                onChangeText={setUpiId}
                onBlur={handleContinue}
                status={error ? "danger" : "basic"}
                caption={
                  error
                    ? error
                    : `${formatCurrency(
                        1
                      )} will be debited from your bank account and refunded within 24 hours for verification.`
                }
              />
            </View>
          </Card>

          {/* Manual Link Option */}
          <View style={styles.manualLinkSection}>
            <Link href="/bank-accounts/add-manual" asChild>
              <Button
                appearance="ghost"
                style={styles.manualButton}
                accessoryRight={() => <ArrowRight size={20} color="#2563EB" />}
              >
                Link manually instead
              </Button>
            </Link>
          </View>

          <Divider style={styles.divider} />
        </ScrollView>

        {/* Continue Button - Fixed at Bottom */}
        <SafeAreaView style={styles.buttonContainer} edges={["bottom"]}>
          <Button
            style={styles.continueButton}
            size="large"
            disabled={!upiId || !!error}
          >
            Continue
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
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: "600",
  },
  infoText: {
    marginBottom: 20,
    lineHeight: 20,
  },
  upiSection: {
    gap: 16,
  },
  upiInput: {
    marginTop: 8,
  },
  manualLinkSection: {
    marginBottom: 8,
  },
  manualButton: {
    alignSelf: "flex-start",
  },
  divider: {
    marginVertical: 24,
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
