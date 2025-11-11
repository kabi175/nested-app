import { getUser, updateUser } from "@/api/userApi";
import { GenericSelect } from "@/components/ui/GenericSelect";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { StepProgress } from "@/components/ui/StepProgress";
import { useKyc } from "@/providers/KycProvider";
import { Button, Datepicker, Input, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

export default function BasicDetailsScreen() {
  const { data, update, validateBasic } = useKyc();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const userIdRef = useRef<string | null>(null);
  const totalSteps = 6;
  const currentStep = 1;

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const user = await getUser();
      if (mounted && user) {
        userIdRef.current = user.id;
        // Map API user to form values
        const fullName = [user.firstName, user.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();
        update("basic", {
          fullName: fullName,
          dateOfBirth: user.dob || null,
          gender: user.gender || "",
          email: user.email || "",
          mobile: user.phone_number || "",
        });
      }
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [update]);

  const onContinue = () => {
    const v = validateBasic();
    setErrors(v.errors);
    if (!v.isValid) return;
    (async () => {
      try {
        setLoading(true);
        const id = userIdRef.current;
        // Split full name
        const parts = (data.basic.fullName || "").trim().split(/\s+/);
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ");
        // Map gender to API
        const genderLower = data.basic.gender;
        if (id) {
          await updateUser(id, {
            firstName,
            lastName,
            email: data.basic.email,
            phone_number: data.basic.mobile,
            dob: data.basic.dateOfBirth || null,
            gender: (genderLower as any) || undefined,
          });
        }
        router.push("/kyc/identity");
      } catch {
        // Could add a toast/snackbar; for now, keep inline status via caption
      } finally {
        setLoading(false);
      }
    })();
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
            Your data is end-to-end encrypted and stored securely.
          </Text>
        </View>

        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <Text category="label">Full Name</Text>
            <InfoTooltip content="Your name helps us verify your identity as per your PAN/Aadhaar." />
          </View>
          <Input
            placeholder="As per PAN/Aadhaar"
            value={data.basic.fullName}
            onChangeText={(v) => update("basic", { fullName: v })}
            status={errors.fullName ? "danger" : "basic"}
            caption={errors.fullName}
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
            <Text category="label">Date of Birth</Text>
            <InfoTooltip content="Used to confirm age eligibility and identity verification." />
          </View>
          <Datepicker
            date={data.basic.dateOfBirth || undefined}
            onSelect={(nextDate) =>
              update("basic", { dateOfBirth: nextDate as Date })
            }
            status={errors.dateOfBirth ? "danger" : "basic"}
            caption={errors.dateOfBirth}
            max={new Date()}
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
            <Text category="label">Gender</Text>
            <InfoTooltip content="Required for demographic and identity matching." />
          </View>
          <GenericSelect
            options={genderOptions}
            value={data.basic.gender}
            onChange={(val) => update("basic", { gender: val as any })}
            status={errors.gender ? "danger" : "basic"}
            caption={errors.gender}
            placeholder="Select"
          />
        </View>

        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text category="label">Email</Text>
            <InfoTooltip content="We’ll send verification and KYC status updates to this email." />
          </View>
          <Input
            placeholder="name@example.com"
            value={data.basic.email}
            onChangeText={(v) =>
              update("basic", { email: v, emailOtpVerified: false })
            }
            autoCapitalize="none"
            keyboardType="email-address"
            status={errors.email ? "danger" : "basic"}
            caption={errors.email}
          />
        </View>

        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text category="label">Mobile Number</Text>
            <InfoTooltip content="Used for OTP verification and secure communication." />
          </View>
          <Input
            placeholder="10-digit mobile number"
            value={data.basic.mobile}
            onChangeText={(v) =>
              update("basic", { mobile: v, mobileOtpVerified: false })
            }
            keyboardType="phone-pad"
            status={errors.mobile ? "danger" : "basic"}
            caption={errors.mobile}
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
          <Button style={{ flex: 1 }} disabled={loading} onPress={onContinue}>
            Continue
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
