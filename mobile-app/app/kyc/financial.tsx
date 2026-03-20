import { updateUser } from "@/api/userApi";
import Button from "@/components/v2/Button";
import SelectInput from "@/components/v2/SelectInput";
import KycHeader from "@/components/v2/kyc/KycHeader";
import KycSecurityNotice from "@/components/v2/kyc/KycSecurityNotice";
import {
  incomeSlabOptions,
  incomeSourceOptions,
  occupationOptions,
} from "@/constants/kycFinancialOptions";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAuthAxios } from "@/hooks/useAuthAxios";
import { useUser } from "@/hooks/useUser";
import { useKyc } from "@/providers/KycProvider";
import type { User } from "@/types/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

export default function FinancialScreen() {
  const { data, update, validateFinancial } = useKyc();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading: isLoadingUser } = useUser();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasPrefilledRef = useRef(false);
  const api = useAuthAxios();

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
        return updateUser(api, userId, financialData);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.user] });
      },
    });

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

      router.push("/kyc/validation-in-progress");
    } catch (error) {
      console.error("Error saving financial information:", error);
    }
  };

  const isLoading = isUpdatingFinancial || isLoadingUser;

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.root}
    >
      <KycHeader
        title="KYC Basic Details"
        current={4}
        total={5}
        onBack={() => router.back()}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        <SelectInput
          label="Occupation Type"
          options={occupationOptions}
          value={data.financial.occupation || ""}
          onChange={(val) => update("financial", { occupation: val as any })}
          placeholder="Select"
          error={errors.occupation}
          touched={!!errors.occupation}
          disabled={isLoading}
        />

        <SelectInput
          label="Income Source"
          options={incomeSourceOptions}
          value={data.financial.incomeSource || ""}
          onChange={(val) =>
            update("financial", { incomeSource: val as any })
          }
          placeholder="Select"
          error={errors.incomeSource}
          touched={!!errors.incomeSource}
          disabled={isLoading}
        />

        <SelectInput
          label="Income Slab"
          options={incomeSlabOptions}
          value={data.financial.incomeSlab || ""}
          onChange={(val) => update("financial", { incomeSlab: val as any })}
          placeholder="Select"
          error={errors.incomeSlab}
          touched={!!errors.incomeSlab}
          disabled={isLoading}
        />

        <View style={styles.pepRow}>
          <Text style={styles.pepLabel}>PEP Status</Text>
          <Switch
            value={data.financial.pep}
            onValueChange={(v) => update("financial", { pep: v })}
            trackColor={{ false: "#D1D5DB", true: "#3137D5" }}
            thumbColor="#FFFFFF"
          />
        </View>
        {!!errors.pep && <Text style={styles.errorText}>{errors.pep}</Text>}
      </ScrollView>

      <View style={styles.footer}>
        <KycSecurityNotice />
        <Button
          title="Continue"
          loading={isLoading}
          onPress={onContinue}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  pepRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  pepLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginTop: -10,
    marginBottom: 12,
    marginLeft: 4,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 8,
    backgroundColor: "#FFFFFF",
  },
});
