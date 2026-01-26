import { GenericSelect } from "@/components/ui/GenericSelect";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { StepProgress } from "@/components/ui/StepProgress";
import { useUser } from "@/hooks/useUser";
import { useUpdateUser } from "@/hooks/useUserMutations";
import { useKyc } from "@/providers/KycProvider";
import { Button, Datepicker, Input, Text } from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const maritalStatusOptions = [
  { label: "Married", value: "married" },
  { label: "Unmarried", value: "unmarried" },
  { label: "Others", value: "others" },
];

export default function BasicDetailsScreen() {
  const { data, update, validateBasic, validateIdentity } = useKyc();
  const { data: apiUser } = useUser();
  const { mutateAsync: updateUser, isPending: isUpdatePending } =
    useUpdateUser();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const totalSteps = 5;
  const currentStep = 1;
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (mounted && apiUser) {
        // Map API user to form values
        const fullName = [apiUser.firstName, apiUser.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();
        update("basic", {
          fullName: fullName,
          dateOfBirth: apiUser.dob || null,
          gender: apiUser.gender || "",
          email: apiUser.email || "",
          mobile: apiUser.phone_number || "",
          father_name: apiUser.father_name || "",
          marital_status: apiUser.marital_status || "",
        });

        // Map identity data
        const hasExistingIdentityValues = Boolean(
          data.identity.pan || data.identity.aadhaarLast4
        );

        if (!hasExistingIdentityValues) {
          const panNumber = apiUser.panNumber?.trim();
          const aadhaarLast4 = apiUser.aadhaar?.trim();

          if (panNumber || aadhaarLast4) {
            update("identity", {
              pan: panNumber ? panNumber.toUpperCase() : data.identity.pan,
              aadhaarLast4: aadhaarLast4 ?? data.identity.aadhaarLast4,
            });
          }
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [update, apiUser]);

  const onContinue = async () => {
    const vBasic = validateBasic();
    const vIdentity = validateIdentity();
    const combinedErrors = { ...vBasic.errors, ...vIdentity.errors };
    setErrors(combinedErrors);

    if (!vBasic.isValid || !vIdentity.isValid) return;

    try {
      // Split full name
      const parts = (data.basic.fullName || "").trim().split(/\s+/);
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ");
      // Map gender to API
      const genderLower = data.basic.gender;
      if (!apiUser) {
        return;
      }
      await updateUser({
        id: apiUser.id,
        payload: {
          firstName,
          lastName,
          email: data.basic.email,
          phone_number: data.basic.mobile,
          dob: data.basic.dateOfBirth || null,
          gender: (genderLower as any) || undefined,
          father_name: data.basic.father_name || undefined,
          marital_status: (data.basic.marital_status as any) || undefined,
          panNumber: data.identity.pan,
          aadhaar: data.identity.aadhaarLast4,
        },
      });

      router.push("/kyc/address");
    } catch (error) {
      Alert.alert("Error", "Failed to update user. Please try again.");
    }
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
            <Text category="label">Full Name (As per PAN)</Text>
            <InfoTooltip content="Your name helps us verify your identity as per your PAN." />
          </View>
          <Input
            placeholder="As per PAN"
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
            <Text category="label">Date of Birth (As per PAN)</Text>
            <InfoTooltip content="Used to confirm age eligibility and identity verification." />
          </View>
          <Datepicker
            placeholder="Pick Date"
            date={data.basic.dateOfBirth || undefined}
            min={new Date("1920-01-01")}
            max={maxDate}
            onSelect={(nextDate) => update("basic", { dateOfBirth: nextDate })}
            status={errors.dateOfBirth ? "danger" : "basic"}
            caption={errors.dateOfBirth}
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

        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <Text category="label">Father&apos;s Name</Text>
            <InfoTooltip content="Required as per KYC regulations for identity verification." />
          </View>
          <Input
            placeholder="Enter father's name"
            value={data.basic.father_name}
            onChangeText={(v) => update("basic", { father_name: v })}
            status={errors.father_name ? "danger" : "basic"}
            caption={errors.father_name}
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
            <Text category="label">Marital Status</Text>
            <InfoTooltip content="Required for KYC compliance and demographic information." />
          </View>
          <GenericSelect
            options={maritalStatusOptions}
            value={data.basic.marital_status}
            onChange={(val) => update("basic", { marital_status: val as any })}
            status={errors.marital_status ? "danger" : "basic"}
            caption={errors.marital_status}
            placeholder="Select"
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
            <Text category="label">Email</Text>
            <InfoTooltip content="We'll send verification and KYC status updates to this email." />
          </View>
          <Input
            value={apiUser?.email || ""}
            onChangeText={(v) =>
              update("basic", { email: v, emailOtpVerified: false })
            }
            autoCapitalize="none"
            keyboardType="email-address"
            status={errors.email ? "danger" : "basic"}
            caption={errors.email}
            disabled={true}
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
            disabled={true}
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
            disabled={isUpdatePending}
            onPress={onContinue}
          >
            Continue
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
