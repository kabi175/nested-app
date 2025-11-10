import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { StepProgress } from "@/components/ui/StepProgress";
import { useKyc } from "@/providers/KycProvider";
import { Button, Input, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

export default function IdentityScreen() {
  const { data, update, validateIdentity } = useKyc();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const totalSteps = 6;
  const currentStep = 2;

  const onContinue = () => {
    const v = validateIdentity();
    setErrors(v.errors);
    if (v.isValid) {
      router.push("/kyc/address");
    }
  };

  const openAadhaarRedirect = () => {
    // In real flow, open WebView or external browser with the redirect URL from backend
    update("identity", { aadhaarUploaded: true });
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
            <Text category="label">PAN Number</Text>
            <InfoTooltip content="Your PAN is required to verify your tax identity with government databases." />
          </View>
          <Input
            autoCapitalize="characters"
            placeholder="ABCDE1234F"
            value={data.identity.pan}
            onChangeText={(v) => update("identity", { pan: v.toUpperCase() })}
            status={errors.pan ? "danger" : "basic"}
            caption={errors.pan}
          />
        </View>

        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <Text category="label">Aadhaar (last 4 digits)</Text>
            <InfoTooltip content="Your Aadhaar last 4 digit helps verify your address and identity." />
          </View>
          <Input
            placeholder="1234"
            value={data.identity.aadhaarLast4}
            onChangeText={(v) =>
              update("identity", { aadhaarLast4: v.replace(/[^0-9]/g, "") })
            }
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            status={errors.aadhaarLast4 ? "danger" : "basic"}
            caption={errors.aadhaarLast4}
          />
        </View>

        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text category="label">Upload Aadhaar</Text>
            <InfoTooltip content="Used as both ID and address proof." />
          </View>
          <Button
            appearance={data.identity.aadhaarUploaded ? "filled" : "outline"}
            onPress={openAadhaarRedirect}
          >
            {data.identity.aadhaarUploaded
              ? "Aadhaar Uploaded"
              : "Open Aadhaar Upload"}
          </Button>
          {!!errors.aadhaarUploaded && (
            <Text category="c2" status="danger">
              {errors.aadhaarUploaded}
            </Text>
          )}
        </View>

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
