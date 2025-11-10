import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { StepProgress } from "@/components/ui/StepProgress";
import { useKyc } from "@/providers/KycProvider";
import { Button, CheckBox, Layout, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

export default function ReviewScreen() {
  const { data, setConfirmed } = useKyc();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState<string>("");
  const totalSteps = 6;
  const currentStep = 6;

  const summary = useMemo(
    () => ({
      ...data,
    }),
    [data]
  );

  const onSubmit = () => {
    if (!checked) {
      setError("Please confirm the above details are correct.");
      return;
    }
    setError("");
    setConfirmed(true);
    // Navigate or call API here. For now, go back or to a success screen if exists.
    router.push("/app"); // adjust to your success screen if available
  };

  const Row = ({ label, value }: { label: string; value: string }) => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
      }}
    >
      <Text appearance="hint" category="c1">
        {label}
      </Text>
      <Text category="c1">{value}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={{ flex: 1 }}
    >
      <StepProgress current={currentStep} total={totalSteps} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View
          style={{ padding: 12, backgroundColor: "#F7F9FC", borderRadius: 8 }}
        >
          <Text category="c2" appearance="hint">
            Review your information carefully. Your data is encrypted and
            secure.
          </Text>
        </View>

        <Layout level="1" style={{ padding: 16, borderRadius: 12 }}>
          <Text category="s1" style={{ marginBottom: 8 }}>
            Basic Details
          </Text>
          <Row label="Full Name" value={summary.basic.fullName} />
          <Row
            label="Date of Birth"
            value={summary.basic.dateOfBirth?.toDateString() || ""}
          />
          <Row label="Gender" value={summary.basic.gender} />
          <Row label="Marital Status" value={summary.basic.maritalStatus} />
          <Row label="Email" value={summary.basic.email} />
          <Row label="Mobile" value={summary.basic.mobile} />
        </Layout>

        <Layout level="1" style={{ padding: 16, borderRadius: 12 }}>
          <Text category="s1" style={{ marginBottom: 8 }}>
            Identity
          </Text>
          <Row label="PAN" value={summary.identity.pan} />
          <Row label="Aadhaar Last 4" value={summary.identity.aadhaarLast4} />
          <Row
            label="Aadhaar Uploaded"
            value={summary.identity.aadhaarUploaded ? "Yes" : "No"}
          />
        </Layout>

        <Layout level="1" style={{ padding: 16, borderRadius: 12 }}>
          <Text category="s1" style={{ marginBottom: 8 }}>
            Address
          </Text>
          <Row label="Line 1" value={summary.address.addressLine1} />
          {!!summary.address.addressLine2 && (
            <Row label="Line 2" value={summary.address.addressLine2} />
          )}
          <Row label="City" value={summary.address.city} />
          <Row label="State" value={summary.address.state} />
          <Row label="Pincode" value={summary.address.pincode} />
        </Layout>

        <Layout level="1" style={{ padding: 16, borderRadius: 12 }}>
          <Text category="s1" style={{ marginBottom: 8 }}>
            Financial & Residency
          </Text>
          <Row label="Occupation" value={summary.financial.occupationType} />
          <Row
            label="Annual Income"
            value={summary.financial.annualIncomeRange}
          />
          <Row label="Residency" value={summary.financial.residentialStatus} />
          <Row label="PEP" value={summary.financial.pep ? "Yes" : "No"} />
        </Layout>

        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <CheckBox checked={checked} onChange={(c) => setChecked(c)}>
              I confirm the above details are correct.
            </CheckBox>
            <InfoTooltip content="Legal confirmation required before eSign." />
          </View>
          {!!error && (
            <Text category="c2" status="danger">
              {error}
            </Text>
          )}
        </View>

        <Button onPress={onSubmit}>eSign / Submit</Button>
        <Button appearance="ghost" onPress={() => router.back()}>
          Back
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
