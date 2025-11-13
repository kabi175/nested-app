import { getUser, updateUser } from "@/api/userApi";
import { userAtom } from "@/atoms/user";
import { GenericSelect } from "@/components/ui/GenericSelect";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { StepProgress } from "@/components/ui/StepProgress";
import {
  incomeSlabOptions,
  incomeSourceOptions,
  occupationOptions,
} from "@/constants/kycFinancialOptions";
import { useInitKyc } from "@/hooks/useInitKyc";
import { useKyc } from "@/providers/KycProvider";
import { Button, Text, Toggle } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

export default function FinancialScreen() {
  const { data, update, validateFinancial } = useKyc();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const userIdRef = useRef<string | null>(null);
  const hasPrefilledRef = useRef(false);
  const totalSteps = 6;
  const currentStep = 5;

  const user = useAtomValue(userAtom);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const user = await getUser();
        if (mounted && user) {
          userIdRef.current = user.id;
          if (!hasPrefilledRef.current) {
            update("financial", {
              occupation: (user.occupation as any) || "",
              incomeSource: (user.income_source as any) || "",
              incomeSlab: (user.income_slab as any) || "",
              pep: !!user.pep,
            });
            hasPrefilledRef.current = true;
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [update]);

  const { mutateAsync: initKyc } = useInitKyc();
  const onContinue = () => {
    const v = validateFinancial();
    setErrors(v.errors);
    if (v.isValid) {
      (async () => {
        try {
          setLoading(true);
          const id = userIdRef.current;
          if (id) {
            await updateUser(id, {
              occupation: data.financial.occupation || null,
              income_source: data.financial.incomeSource || null,
              income_slab: data.financial.incomeSlab || null,
              pep: data.financial.pep,
            });
          }

          if (user?.kycStatus === "unknown" || user?.kycStatus === "pending") {
            await initKyc(user);
          }

          router.push("/kyc/review");
        } catch {
          // TODO: surface error to user (toast/snackbar) if needed
        } finally {
          setLoading(false);
        }
      })();
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
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
          <Button style={{ flex: 1 }} onPress={onContinue} disabled={loading}>
            Continue
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
