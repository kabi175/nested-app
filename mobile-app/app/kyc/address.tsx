import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { StepProgress } from "@/components/ui/StepProgress";
import { useKyc } from "@/providers/KycProvider";
import {
  Button,
  IndexPath,
  Input,
  Select,
  SelectItem,
  Text,
} from "@ui-kitten/components";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

export default function AddressScreen() {
  const { data, update, validateAddress } = useKyc();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const useCurrentLocation = () => {
    // Mock filling address using GPS - integrate with expo-location if needed
    update("address", {
      addressLine1: data.address.addressLine1 || "221B Baker Street",
      city: data.address.city || "Mumbai",
      state: data.address.state || "Maharashtra",
      pincode: data.address.pincode || "400001",
    });
  };

  const onContinue = () => {
    const v = validateAddress();
    setErrors(v.errors);
    if (v.isValid) {
      router.push("/kyc/photo-signature");
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
            selectedIndex={
              data.address.state
                ? new IndexPath(states.indexOf(data.address.state))
                : undefined
            }
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
            value={data.address.pincode}
            onChangeText={(v) =>
              update("address", { pincode: v.replace(/[^0-9]/g, "") })
            }
            keyboardType="number-pad"
            maxLength={6}
            status={errors.pincode ? "danger" : "basic"}
            caption={errors.pincode}
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
          <Button style={{ flex: 1 }} onPress={onContinue}>
            Continue
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
