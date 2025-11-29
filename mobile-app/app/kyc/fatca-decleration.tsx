import { StepProgress } from "@/components/ui/StepProgress";
import { Button, CheckBox, Layout, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

export default function FatcaDeclarationScreen() {
  const router = useRouter();
  const [isUSPerson, setIsUSPerson] = useState(false);
  const [isTaxResident, setIsTaxResident] = useState(false);
  const [error, setError] = useState<string>("");
  const totalSteps = 6;
  const currentStep = 4;

  const handleNext = () => {
    // FATCA declaration validation - at least one option should be selected
    // In practice, you might want to store this data separately or in user profile
    setError("");
    router.push("/kyc/financial");
  };

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
            FATCA (Foreign Account Tax Compliance Act) declaration is required
            for tax compliance purposes.
          </Text>
        </View>

        <Layout level="1" style={{ padding: 16, borderRadius: 12 }}>
          <Text category="s1" style={{ marginBottom: 16 }}>
            FATCA Declaration
          </Text>

          <CheckBox
            checked={isUSPerson}
            onChange={(nextChecked) => {
              setIsUSPerson(nextChecked);
              setError("");
            }}
            style={{ marginBottom: 12 }}
          >
            I am a US Person for tax purposes
          </CheckBox>

          <CheckBox
            checked={isTaxResident}
            onChange={(nextChecked) => {
              setIsTaxResident(nextChecked);
              setError("");
            }}
          >
            I am a tax resident of a country other than India
          </CheckBox>

          {error ? (
            <Text category="c1" status="danger" style={{ marginTop: 8 }}>
              {error}
            </Text>
          ) : null}
        </Layout>

        <Button onPress={handleNext} style={{ marginTop: 8 }}>
          Continue
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
