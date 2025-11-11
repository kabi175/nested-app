import { updateUser } from "@/api/userApi";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { StepProgress } from "@/components/ui/StepProgress";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useUser } from "@/hooks/useUser";
import { useKyc } from "@/providers/KycProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  IndexPath,
  Input,
  Select,
  SelectItem,
  Text,
} from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

export default function AddressScreen() {
  const { data, update, validateAddress } = useKyc();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const [hasPrefilled, setHasPrefilled] = useState(false);
  const totalSteps = 6;
  const currentStep = 3;

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

  const selectedStateIndex = useMemo(() => {
    if (!data.address.state) {
      return undefined;
    }
    const index = states.indexOf(data.address.state);
    return index >= 0 ? new IndexPath(index) : undefined;
  }, [data.address.state, states]);

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

      return updateUser(user.id, {
        address: {
          address_line: addressLine,
          city: addressValues.city,
          state: addressValues.state,
          pin_code: addressValues.pin_code,
          country: user.address?.country ?? "India",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.user] });
    },
  });

  const useCurrentLocation = () => {
    // Mock filling address using GPS - integrate with expo-location if needed
    update("address", {
      addressLine1: data.address.addressLine1 || "221B Baker Street",
      city: data.address.city || "Mumbai",
      state: data.address.state || "Maharashtra",
      pin_code: data.address.pin_code || "400001",
    });
  };

  const onContinue = async () => {
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
            <Text category="label">Address Line 1</Text>
            <InfoTooltip content="We need your address for regulatory communication." />
          </View>
          <Input
            placeholder="House / Flat / Street"
            value={data.address.addressLine1}
            onChangeText={(v) => update("address", { addressLine1: v })}
            status={errors.addressLine1 ? "danger" : "basic"}
            caption={errors.addressLine1}
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
            <Text category="label">Address Line 2 (optional)</Text>
          </View>
          <Input
            placeholder="Area / Landmark"
            value={data.address.addressLine2 || ""}
            onChangeText={(v) => update("address", { addressLine2: v })}
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
            <Text category="label">City</Text>
            <InfoTooltip content="Used for jurisdiction-based compliance." />
          </View>
          <Input
            placeholder="City"
            value={data.address.city}
            onChangeText={(v) => update("address", { city: v })}
            status={errors.city ? "danger" : "basic"}
            caption={errors.city}
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
            <Text category="label">State</Text>
            <InfoTooltip content="Required for legal identification." />
          </View>
          <Select
            selectedIndex={selectedStateIndex}
            onSelect={(index) => {
              const row = Array.isArray(index) ? index[0].row : index.row;
              update("address", { state: states[row] });
            }}
            status={errors.state ? "danger" : "basic"}
            caption={errors.state}
            placeholder="Select"
          >
            {states.map((s) => (
              <SelectItem key={s} title={s} />
            ))}
          </Select>
        </View>

        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <Text category="label">Pincode</Text>
            <InfoTooltip content="Ensures correct address verification." />
          </View>
          <Input
            placeholder="6-digit PIN"
            value={data.address.pin_code}
            onChangeText={(v) =>
              update("address", { pin_code: v.replace(/[^0-9]/g, "") })
            }
            keyboardType="number-pad"
            maxLength={6}
            status={errors.pin_code ? "danger" : "basic"}
            caption={errors.pin_code}
          />
        </View>

        <Button appearance="outline" onPress={useCurrentLocation}>
          Use Current Location
        </Button>

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
            disabled={isUpdating}
            appearance={isUpdating ? "outline" : "filled"}
          >
            Continue
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
