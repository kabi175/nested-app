import Button from "@/components/v2/Button";
import DateInput from "@/components/v2/DateInput";
import KycHeader from "@/components/v2/kyc/KycHeader";
import KycSecurityNotice from "@/components/v2/kyc/KycSecurityNotice";
import SelectInput from "@/components/v2/SelectInput";
import TextInput from "@/components/v2/TextInput";
import { useUser } from "@/hooks/useUser";
import { useUpdateUser } from "@/hooks/useUserMutations";
import { useKyc } from "@/providers/KycProvider";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
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
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (mounted && apiUser) {
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

    console.log("Validation Errors:", combinedErrors);
    if (!vBasic.isValid || !vIdentity.isValid) return;

    try {
      const parts = (data.basic.fullName || "").trim().split(/\s+/);
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ");
      const genderLower = data.basic.gender;
      if (!apiUser) return;

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
      style={styles.root}
    >
      <KycHeader
        title="KYC Basic Details"
        current={1}
        total={5}
        onBack={() => router.back()}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          label="Full Name (As per PAN)"
          placeholder="As per PAN"
          value={data.basic.fullName}
          onChangeText={(v) => update("basic", { fullName: v })}
          error={errors.fullName}
          touched={!!errors.fullName}
        />

        <DateInput
          label="Date of Birth (As per PAN)"
          value={data.basic.dateOfBirth ?? null}
          onChange={(date) => update("basic", { dateOfBirth: date })}
          min={new Date("1920-01-01")}
          max={maxDate}
          placeholder="DD/MM/YYYY"
          error={errors.dateOfBirth}
          touched={!!errors.dateOfBirth}
        />

        <SelectInput
          label="Gender"
          options={genderOptions}
          value={data.basic.gender}
          onChange={(val) => update("basic", { gender: val as any })}
          placeholder="Select"
          error={errors.gender}
          touched={!!errors.gender}
        />

        <TextInput
          label="Father's Name/Spouse's Name"
          placeholder="Enter father's Name/Spouse's Name"
          value={data.basic.father_name}
          onChangeText={(v) => update("basic", { father_name: v })}
          error={errors.father_name}
          touched={!!errors.father_name}
        />

        <SelectInput
          label="Marital Status"
          options={maritalStatusOptions}
          value={data.basic.marital_status}
          onChange={(val) => update("basic", { marital_status: val as any })}
          placeholder="Select"
          error={errors.marital_status}
          touched={!!errors.marital_status}
        />

        <TextInput
          label="PAN Number"
          placeholder="ABCDE1234F"
          value={data.identity.pan}
          onChangeText={(v) => update("identity", { pan: v.toUpperCase() })}
          autoCapitalize="characters"
          error={errors.pan}
          touched={!!errors.pan}
        />

        <TextInput
          label="Aadhaar (last 4 digits)"
          placeholder="1234"
          value={data.identity.aadhaarLast4}
          onChangeText={(v) =>
            update("identity", { aadhaarLast4: v.replace(/[^0-9]/g, "") })
          }
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
          error={errors.aadhaarLast4}
          touched={!!errors.aadhaarLast4}
        />

        <TextInput
          label="Email ID"
          value={apiUser?.email || ""}
          onChangeText={(v) =>
            update("basic", { email: v, emailOtpVerified: false })
          }
          autoCapitalize="none"
          keyboardType="email-address"
          editable={false}
          error={errors.email}
          touched={!!errors.email}
        />

        <TextInput
          label="Mobile Number"
          placeholder="10-digit mobile number"
          value={data.basic.mobile}
          onChangeText={(v) =>
            update("basic", { mobile: v, mobileOtpVerified: false })
          }
          keyboardType="phone-pad"
          editable={false}
          error={errors.mobile}
          touched={!!errors.mobile}
        />

        <KycSecurityNotice />

        <Button
          title="Continue"
          loading={isUpdatePending}
          onPress={onContinue}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F7F9FC",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  headerSpacer: {
    width: 36,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: "#8F9BB3",
  },
  progressDone: {
    fontSize: 12,
    color: "#3366FF",
    fontWeight: "500",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#EDF1F7",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    width: "20%",
    height: "100%",
    backgroundColor: "#3366FF",
    borderRadius: 999,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  securityNote: {
    borderWidth: 1,
    borderColor: "#C5CEE0",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  securityText: {
    fontSize: 12,
    color: "#8F9BB3",
    textAlign: "center",
  },
});
