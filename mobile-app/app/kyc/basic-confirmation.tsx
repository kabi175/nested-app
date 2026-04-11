import Button from "@/components/v2/Button";
import OutlineButton from "@/components/v2/OutlineButton";
import KycHeader from "@/components/v2/kyc/KycHeader";
import { useKyc } from "@/providers/KycProvider";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || "—"}</Text>
    </View>
  );
}

export default function BasicConfirmationScreen() {
  const { data } = useKyc();
  const router = useRouter();

  return (
    <View style={styles.root}>
      <KycHeader
        title="Confirm PAN Details"
        current={1}
        total={5}
        onBack={() => router.back()}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.instruction}>
          Please verify that the details below match exactly with your PAN card.
        </Text>

        <View style={styles.card}>
          <DetailRow label="Full Name" value={data.basic.fullName} />
          <View style={styles.divider} />
          <DetailRow
            label="Date of Birth"
            value={formatDate(data.basic.dateOfBirth)}
          />
          <View style={styles.divider} />
          <DetailRow label="PAN Number" value={data.identity.pan} />
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            These details will be used for your KYC verification and cannot be
            changed later without re-verification.
          </Text>
        </View>

        <Button
          title="Yes, details are correct"
          onPress={() => router.push("/kyc/address")}
        />

        <View style={styles.editButton}>
          <OutlineButton
            title="Edit Details"
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  instruction: {
    fontSize: 14,
    color: "#8F9BB3",
    marginBottom: 20,
    lineHeight: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "#E4E9F2",
    borderRadius: 12,
    backgroundColor: "#F7F9FC",
    marginBottom: 20,
    overflow: "hidden",
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: {
    fontSize: 12,
    color: "#8F9BB3",
    marginBottom: 4,
    fontWeight: "500",
  },
  rowValue: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E4E9F2",
  },
  notice: {
    borderWidth: 1,
    borderColor: "#C5CEE0",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  noticeText: {
    fontSize: 12,
    color: "#8F9BB3",
    textAlign: "center",
    lineHeight: 18,
  },
  editButton: {
    marginTop: 12,
  },
});
