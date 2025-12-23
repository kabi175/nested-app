import { updateUser } from "@/api/userApi";
import { GenericSelect } from "@/components/ui/GenericSelect";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { StepProgress } from "@/components/ui/StepProgress";
import {
  incomeSlabOptions,
  incomeSourceOptions,
  occupationOptions,
} from "@/constants/kycFinancialOptions";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useInitKyc } from "@/hooks/useInitKyc";
import { useUser } from "@/hooks/useUser";
import { useKyc } from "@/providers/KycProvider";
import type { User } from "@/types/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Text, Toggle } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

export default function FinancialScreen() {
  const { data, update, validateFinancial } = useKyc();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading: isLoadingUser } = useUser();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasPrefilledRef = useRef(false);
  const totalSteps = 6;
  const currentStep = 5;

  useEffect(() => {
    if (!user || hasPrefilledRef.current) {
      return;
    }

    const hasExistingValues = Object.values(data.financial).some(
      (value) => value !== "" && value !== false
    );

    if (hasExistingValues) {
      hasPrefilledRef.current = true;
      return;
    }

    update("financial", {
      occupation: (user.occupation as any) || "",
      incomeSource: (user.income_source as any) || "",
      incomeSlab: (user.income_slab as any) || "",
      pep: !!user.pep,
    });
    hasPrefilledRef.current = true;
  }, [user, data.financial, update]);

  const { mutateAsync: initKyc } = useInitKyc();

  const { mutateAsync: updateFinancialData, isPending: isUpdatingFinancial } =
    useMutation({
      mutationFn: async ({
        userId,
        financialData,
      }: {
        userId: string;
        financialData: Partial<
          Pick<User, "occupation" | "income_source" | "income_slab" | "pep">
        >;
      }) => {
        return updateUser(userId, financialData);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.user] });
      },
    });

  const routeToNextStep = (status: string | undefined) => {
    switch (status) {
      case "aadhaar_pending":
        router.push("/kyc/aadhaar-upload");
        break;
      case "esign_pending":
        router.push("/kyc/esign-upload");
        break;
      case "approved":
        router.push("/bank-accounts");
        break;
      case "rejected":
        router.push("/kyc/failure");
        break;
      case "cancelled":
        router.push("/kyc/cancelled");
        break;
      case "submitted":
        router.push("/kyc/waiting-for-approval");
        break;
      default:
        throw new Error(`Invalid KYC status: ${status}`);
    }
  };

  const onContinue = async () => {
    const validation = validateFinancial();
    setErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    if (!user?.id) {
      console.error("User ID not available");
      return;
    }

    try {
      // Update user financial information
      await updateFinancialData({
        userId: user.id,
        financialData: {
          occupation: (data.financial.occupation || null) as User["occupation"],
          income_source: (data.financial.incomeSource ||
            null) as User["income_source"],
          income_slab: (data.financial.incomeSlab ||
            null) as User["income_slab"],
          pep: data.financial.pep,
        },
      });

      // Wait for query to refetch after invalidation
      await queryClient.refetchQueries({ queryKey: [QUERY_KEYS.user] });
      const latestUser = queryClient.getQueryData<typeof user>([
        QUERY_KEYS.user,
      ]);
      let kycStatus = latestUser?.kycStatus ?? user?.kycStatus;

      // Initialize KYC if status is unknown, pending, or undefined
      const needsKycInit =
        kycStatus === "unknown" ||
        kycStatus === "pending" ||
        kycStatus === undefined;

      if (needsKycInit && latestUser) {
        await initKyc(latestUser);
        await queryClient.refetchQueries({ queryKey: [QUERY_KEYS.user] });
        const updatedUser = queryClient.getQueryData<typeof user>([
          QUERY_KEYS.user,
        ]);
        kycStatus = updatedUser?.kycStatus ?? kycStatus;
      }

      // Route to next step based on KYC status
      routeToNextStep(kycStatus);
    } catch (error) {
      // TODO: surface error to user (toast/snackbar) if needed
      console.error("Error saving financial information:", error);
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
          <GenericSelect
            options={occupationOptions}
            value={data.financial.occupation || undefined}
            onChange={(val) => update("financial", { occupation: val as any })}
            status={errors.occupation ? "danger" : "basic"}
            caption={errors.occupation}
            placeholder="Select"
            disabled={isUpdatingFinancial || isLoadingUser}
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
            <Text category="label">Income Source</Text>
            <InfoTooltip content="Required to assess the origin of funds for compliance." />
          </View>
          <GenericSelect
            options={incomeSourceOptions}
            value={data.financial.incomeSource || undefined}
            onChange={(val) =>
              update("financial", { incomeSource: val as any })
            }
            status={errors.incomeSource ? "danger" : "basic"}
            caption={errors.incomeSource}
            placeholder="Select"
            disabled={isUpdatingFinancial || isLoadingUser}
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
            <Text category="label">Income Slab</Text>
            <InfoTooltip content="Helps us evaluate investment suitability." />
          </View>
          <GenericSelect
            options={incomeSlabOptions}
            value={data.financial.incomeSlab || undefined}
            onChange={(val) => update("financial", { incomeSlab: val as any })}
            status={errors.incomeSlab ? "danger" : "basic"}
            caption={errors.incomeSlab}
            placeholder="Select"
            disabled={isUpdatingFinancial || isLoadingUser}
          />
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
          <Button
            style={{ flex: 1 }}
            onPress={onContinue}
            disabled={isUpdatingFinancial || isLoadingUser}
          >
            Continue
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
