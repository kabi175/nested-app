import { updateUser } from "@/api/userApi";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { StepProgress } from "@/components/ui/StepProgress";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useKyc } from "@/providers/KycProvider";
import { useUser } from "@/hooks/useUser";
import { Button, Input, Text } from "@ui-kitten/components";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

export default function IdentityScreen() {
  const { data, update, validateIdentity } = useKyc();
  const { data: user, isLoading: isUserLoading } = useUser();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 6;
  const currentStep = 2;

  const onContinue = async () => {
    const validation = validateIdentity();
    setErrors(validation.errors);
    if (!validation.isValid) {
      return;
    }

    if (!user?.id) {
      Alert.alert(
        "User unavailable",
        "We couldn't find your user profile. Please try signing in again."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await updateUser(user.id, {
        panNumber: data.identity.pan,
        aadhaar: data.identity.aadhaarLast4,
      });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.user] });
      router.push("/kyc/address");
    } catch (error) {
      console.error("Failed to update user identity", error);
      Alert.alert(
        "Save failed",
        "We couldn't save your identity details. Please try again."
      );
    } finally {
      setIsSubmitting(false);
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
          <Button
            style={{ flex: 1 }}
            onPress={onContinue}
            disabled={isSubmitting || isUserLoading}
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
