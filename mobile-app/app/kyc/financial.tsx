import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { StepProgress } from "@/components/ui/StepProgress";
import { useKyc } from "@/providers/KycProvider";
import {
  Button,
  IndexPath,
  Select,
  SelectItem,
  Text,
  Toggle,
} from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

export default function FinancialScreen() {
  const { data, update, validateFinancial } = useKyc();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const totalSteps = 6;
  const currentStep = 5;

  const occupations = useMemo(
    () => [
      "Salaried",
      "Self-Employed",
      "Business Owner",
      "Student",
      "Retired",
      "Homemaker",
    ],
    []
  );
  const incomeRanges = useMemo(
    () => ["< 2.5L", "2.5L - 5L", "5L - 10L", "10L - 25L", "> 25L"],
    []
  );
  const residencies = useMemo(() => ["Resident", "NRI"], []);

  const onContinue = () => {
    const v = validateFinancial();
    setErrors(v.errors);
    if (v.isValid) {
      router.push("/kyc/review");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={{ flex: 1 }}
    >
      <StepProgress current={currentStep} total={totalSteps} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <Text category="label">Occupation Type</Text>
            <InfoTooltip content="Regulators require us to classify your occupation type." />
          </View>
          <Select
            selectedIndex={
              data.financial.occupationType
                ? new IndexPath(
                    occupations.indexOf(data.financial.occupationType)
                  )
                : undefined
            }
            onSelect={(index) => {
              const row = Array.isArray(index) ? index[0].row : index.row;
              update("financial", { occupationType: occupations[row] as any });
            }}
            status={errors.occupationType ? "danger" : "basic"}
            caption={errors.occupationType}
            placeholder="Select"
          >
            {occupations.map((o) => (
              <SelectItem key={o} title={o} />
            ))}
          </Select>
        </View>

        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <Text category="label">Annual Income Range</Text>
            <InfoTooltip content="Used for risk assessment as per KYC norms." />
          </View>
          <Select
            selectedIndex={
              data.financial.annualIncomeRange
                ? new IndexPath(
                    incomeRanges.indexOf(data.financial.annualIncomeRange)
                  )
                : undefined
            }
            onSelect={(index) => {
              const row = Array.isArray(index) ? index[0].row : index.row;
              update("financial", {
                annualIncomeRange: incomeRanges[row] as any,
              });
            }}
            status={errors.annualIncomeRange ? "danger" : "basic"}
            caption={errors.annualIncomeRange}
            placeholder="Select"
          >
            {incomeRanges.map((o) => (
              <SelectItem key={o} title={o} />
            ))}
          </Select>
        </View>

        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <Text category="label">Residential Status</Text>
            <InfoTooltip content="Defines your tax residency category." />
          </View>
          <Select
            selectedIndex={
              data.financial.residentialStatus
                ? new IndexPath(
                    residencies.indexOf(data.financial.residentialStatus)
                  )
                : undefined
            }
            onSelect={(index) => {
              const row = Array.isArray(index) ? index[0].row : index.row;
              update("financial", {
                residentialStatus: residencies[row] as any,
              });
            }}
            status={errors.residentialStatus ? "danger" : "basic"}
            caption={errors.residentialStatus}
            placeholder="Select"
          >
            {residencies.map((o) => (
              <SelectItem key={o} title={o} />
            ))}
          </Select>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text category="label" style={{ marginRight: 8 }}>
              PEP Status
            </Text>
            <InfoTooltip content="Required to determine if you are a Politically Exposed Person." />
          </View>
          <Toggle
            checked={data.financial.pep}
            onChange={(c) => update("financial", { pep: c })}
          >
            {data.financial.pep ? "Yes" : "No"}
          </Toggle>
        </View>
        {!!errors.pep && (
          <Text category="c2" status="danger">
            {errors.pep}
          </Text>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 12,
            marginTop: 12,
          }}
        >
          <Button
            style={{ flex: 1 }}
            appearance="ghost"
            onPress={() => router.back()}
          >
            Back
          </Button>
          <Button style={{ flex: 1 }} onPress={onContinue}>
            Continue
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
