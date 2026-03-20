import { updateUser } from "@/api/userApi";
import Button from "@/components/v2/Button";
import KycHeader from "@/components/v2/kyc/KycHeader";
import KycSecurityNotice from "@/components/v2/kyc/KycSecurityNotice";
import SelectInput, { SelectOption } from "@/components/v2/SelectInput";
import TextInput from "@/components/v2/TextInput";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAuthAxios } from "@/hooks/useAuthAxios";
import { useUser } from "@/hooks/useUser";
import { useKyc } from "@/providers/KycProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

export default function AddressScreen() {
  const api = useAuthAxios();
  const { data, update, validateAddress } = useKyc();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const [hasPrefilled, setHasPrefilled] = useState(false);

  const states = useMemo(
    () => [
      "Andhra Pradesh",
      "Arunachal Pradesh",
      "Assam",
      "Bihar",
      "Chhattisgarh",
      "Delhi",
      "Goa",
      "Gujarat",
      "Haryana",
      "Himachal Pradesh",
      "Jammu & Kashmir",
      "Jharkhand",
      "Karnataka",
      "Kerala",
      "Madhya Pradesh",
      "Maharashtra",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Odisha",
      "Punjab",
      "Rajasthan",
      "Sikkim",
      "Tamil Nadu",
      "Telangana",
      "Tripura",
      "Uttar Pradesh",
      "Uttarakhand",
      "West Bengal",
    ],
    []
  );

  const stateOptions = useMemo<SelectOption[]>(
    () => states.map((s) => ({ label: s, value: s })),
    [states]
  );

  useEffect(() => {
    if (!user?.address || hasPrefilled) {
      return;
    }

    const hasExistingValues = Object.values(data.address).some(
      (value) => value && value.length > 0
    );

    if (hasExistingValues) {
      setHasPrefilled(true);
      return;
    }

    const rawAddressLine = user.address.address_line ?? "";
    const parts = rawAddressLine
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const [line1, ...rest] = parts;

    update("address", {
      addressLine1: line1 || rawAddressLine,
      addressLine2: rest.join(", "),
      city: user.address.city ?? "",
      state: user.address.state ?? "",
      pin_code: user.address.pin_code ?? "",
    });
    setHasPrefilled(true);
  }, [user, hasPrefilled, data.address, update]);

  const { mutateAsync: saveAddress, isPending: isUpdating } = useMutation({
    mutationFn: async (addressValues: typeof data.address) => {
      if (!user?.id) {
        throw new Error("User not available");
      }
      const addressLine = [
        addressValues.addressLine1,
        addressValues.addressLine2,
      ]
        .map((value) => value?.trim())
        .filter((value) => value && value.length > 0)
        .join(", ");

      return updateUser(api, user.id, {
        address: {
          address_line: addressLine,
          city: addressValues.city,
          state: addressValues.state,
          pin_code: addressValues.pin_code,
          country: user.address?.country ?? "IN",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.user] });
    },
  });

  const onContinue = async () => {
    setSubmitted(true);
    const v = validateAddress();
    setErrors(v.errors);
    if (v.isValid) {
      if (!user?.id) {
        Alert.alert(
          "Unable to save address",
          "We could not verify your profile. Please try again."
        );
        return;
      }

      try {
        await saveAddress(data.address);
        router.push("/kyc/photo-signature");
      } catch (error) {
        console.error("Failed to update user address", error);
        Alert.alert(
          "Unable to save address",
          "Something went wrong while saving your address. Please try again."
        );
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={{ flex: 1 }}
    >
      <KycHeader
        title="KYC Basic Details"
        current={2}
        total={5}
        onBack={() => router.back()}
      />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TextInput
          label="Address Line 1"
          placeholder="Address"
          value={data.address.addressLine1}
          onChangeText={(v) => update("address", { addressLine1: v })}
          error={errors.addressLine1}
          touched={submitted}
        />

        <TextInput
          label="City"
          placeholder="Enter city"
          value={data.address.city}
          onChangeText={(v) => update("address", { city: v })}
          error={errors.city}
          touched={submitted}
        />

        <SelectInput
          label="State"
          options={stateOptions}
          value={data.address.state}
          onChange={(v) => update("address", { state: v })}
          placeholder="Select"
          error={errors.state}
          touched={submitted}
        />

        <TextInput
          label="Pincode"
          placeholder="6-digit PIN"
          value={data.address.pin_code}
          onChangeText={(v) =>
            update("address", { pin_code: v.replace(/[^0-9]/g, "") })
          }
          keyboardType="number-pad"
          maxLength={6}
          error={errors.pin_code}
          touched={submitted}
        />

        <KycSecurityNotice />

        <Button
          title="Continue"
          onPress={onContinue}
          loading={isUpdating}
          disabled={isUpdating}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
