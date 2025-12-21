import {
  fetchLumpsumPaymentUrl,
  fetchMandatePaymentUrl,
  lumsumPostPayment,
  mandatePostPayment,
} from "@/api/paymentAPI";
import { ThemedText } from "@/components/ThemedText";
import { OneTimePurchaseCard } from "@/components/payment/OneTimePurchaseCard";
import { SIPAutoDebitCard } from "@/components/payment/SIPAutoDebitCard";
import { usePayment } from "@/hooks/usePayment";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import { openAuthSessionAsync } from "expo-web-browser";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentProcessingScreen() {
  const { paymentId } = useLocalSearchParams<{
    paymentId: string;
  }>();
  const { data: payment, refetch } = usePayment(paymentId);

  const handleLumpsumPayment = async () => {
    const redirectUrl = await fetchLumpsumPaymentUrl(paymentId as string);
    if (redirectUrl) {
      const returnUrl = Linking.createURL(
        `/payment/${paymentId}/success?type=buy`
      );
      await openAuthSessionAsync(redirectUrl, returnUrl);
      await lumsumPostPayment(paymentId as string);
      await refetch();
    } else {
      Alert.alert("Error", "Failed to get payment redirect URL.");
    }
  };

  const handleMandatePayment = async () => {
    const redirectUrl = await fetchMandatePaymentUrl(paymentId as string);
    if (redirectUrl) {
      const returnUrl = Linking.createURL(
        `/payment/${paymentId}/success?type=sip`
      );
      await openAuthSessionAsync(redirectUrl, returnUrl);
      console.log("mandate completed");
      await mandatePostPayment(payment?.mandate_id as string);
      await refetch();
    } else {
      Alert.alert("Error", "Failed to get payment redirect URL.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>
            Payment Processing
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {payment?.buy_status !== "not_available" && (
            <OneTimePurchaseCard
              onPress={handleLumpsumPayment}
              payment={payment}
            />
          )}
          {payment?.sip_status !== "not_available" && (
            <SIPAutoDebitCard
              onPress={handleMandatePayment}
              payment={payment}
            />
          )}

          {/* Warning Message */}
          <View style={styles.warningBox}>
            <ThemedText style={styles.warningText}>
              Please do not close this window or press back button
            </ThemedText>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  warningBox: {
    backgroundColor: "#DBEAFE",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  warningText: {
    fontSize: 14,
    color: "#1E40AF",
    textAlign: "center",
    lineHeight: 20,
  },
});
