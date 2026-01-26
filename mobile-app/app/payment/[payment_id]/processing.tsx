import { ThemedText } from "@/components/ThemedText";
import { OneTimePurchaseCard } from "@/components/payment/OneTimePurchaseCard";
import { SIPAutoDebitCard } from "@/components/payment/SIPAutoDebitCard";
import { usePayment } from "@/hooks/usePayment";
import {
  useFetchLumpsumPaymentUrl,
  useFetchMandatePaymentUrl
} from "@/hooks/usePaymentMutations";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentProcessingScreen() {
  const { payment_id: paymentId } = useLocalSearchParams<{
    payment_id: string;
  }>();
  const { data: payment, isLoading: isLoadingPayment, refetch } = usePayment(paymentId);
  const fetchLumpsumUrl = useFetchLumpsumPaymentUrl();
  const fetchMandateUrl = useFetchMandatePaymentUrl();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log("payment?.sip_status", payment?.sip_status);
    const isPaymentPending = payment?.buy_status === "pending" || payment?.sip_status === "pending";
    if (!isLoadingPayment && !isPaymentPending) {
      console.log("payment is not pending, redirecting to child");
      // Clear interval if payment is no longer pending
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setTimeout(() => {
        router.replace("/child");
      }, 10000);
      return;
    }

    // Set up interval to refetch payment every 10 seconds when payment is pending
    if (isPaymentPending && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        refetch();
      }, 10000);
    }

    // Cleanup interval when payment is no longer pending
    if (!isPaymentPending && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [payment, isLoadingPayment, refetch]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const handleLumpsumPayment = async () => {
    try {

      const redirectUrl = await fetchLumpsumUrl.mutateAsync(paymentId as string);
      if (redirectUrl) {
        if (redirectUrl.startsWith("redirect:nested://")) {
          router.push(redirectUrl.replace("redirect:nested://", ""));
        } else {
          await Linking.openURL(redirectUrl);
        }
      } else {
        Alert.alert("Error", "Failed to get payment redirect URL.");
      }
    } catch (error) {
      console.error("Error fetching lumsum payment redirect URL", error);
      Alert.alert("Error", "Failed to get payment redirect URL.");
    }
  };

  const handleMandatePayment = async () => {
    try {
      const redirectUrl = await fetchMandateUrl.mutateAsync(paymentId as string);
      console.log("redirectUrl", redirectUrl)
      if (redirectUrl && payment?.mandate_id) {
        await Linking.openURL(redirectUrl);
      } else {
        Alert.alert("Error", "Failed to get payment redirect URL.");
      }
    } catch (error) {
      console.error("Error fetching mandate payment redirect URL", error);
      Alert.alert("Error", "Failed to get payment redirect URL.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
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
