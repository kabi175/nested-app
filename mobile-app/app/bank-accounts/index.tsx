import { LinkMethodCard } from "@/components/bank-accounts/LinkMethodCard";
import { PendingOverlay } from "@/components/bank-accounts/PendingOverlay";
import { useLinkBankAccount } from "@/hooks/useLinkBankAccount";
import { useUser } from "@/hooks/useUser";
import { Layout } from "@ui-kitten/components";
import { Redirect, router } from "expo-router";
import { Landmark, Smartphone } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type LinkMethod = "upi" | "manual";

export default function BankAccountsScreen() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const { isPending, linkViaUPI } = useLinkBankAccount();
  const [selectedMethod, setSelectedMethod] = useState<LinkMethod>("upi");

  const handleContinue = () => {
    if (selectedMethod === "manual") {
      router.replace("/bank-accounts/add-manual");
      return;
    }
    linkViaUPI();
  };

  if (!isUserLoading && user?.is_ready_to_invest !== true) {
    return <Redirect href="/kyc" />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Layout style={styles.container} level="1">
        {isPending && <PendingOverlay />}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Link Bank Account</Text>
            <Text style={styles.subtitle}>
              Securely connect your bank account to start investing for your
              child&apos;s future
            </Text>
          </View>

          <LinkMethodCard
            icon={Smartphone}
            title="Link through UPI"
            description="Just enter your UPI ID, fastest way to set it up"
            selected={selectedMethod === "upi"}
            onPress={() => setSelectedMethod("upi")}
          />

          <LinkMethodCard
            icon={Landmark}
            title="Add bank account"
            description="Start investing by adding your account number and IFSC"
            selected={selectedMethod === "manual"}
            onPress={() => setSelectedMethod("manual")}
          />
        </ScrollView>

        <SafeAreaView style={styles.footer} edges={["bottom"]}>
          <TouchableOpacity
            style={[styles.continueButton, isPending && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={isPending}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Layout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFDF9",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFDF9",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: "InstrumentSans_500Medium",
    letterSpacing: -0.72,
    color: "#000000",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "InstrumentSans_400Regular",
    color: "rgba(0,0,0,0.6)",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: "#FFFDF9",
  },
  continueButton: {
    backgroundColor: "#2848F1",
    height: 55,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "rgba(0,0,0,0.7)",
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 18,
    fontFamily: "InstrumentSans_500Medium",
    color: "#FFFFFF",
  },
});
