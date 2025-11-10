import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { StepProgress } from "@/components/ui/StepProgress";
import { useKyc } from "@/providers/KycProvider";
import { Button, Text } from "@ui-kitten/components";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

export default function PhotoSignatureScreen() {
  const { data, update, validatePhotoSignature } = useKyc();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const totalSteps = 6;
  const currentStep = 4;

  const pickPhoto = async () => {
    const res = await ImagePicker.launchCameraAsync({
      quality: 0.6,
      base64: false,
      allowsEditing: true,
    });
    if (!res.canceled && res.assets && res.assets[0]?.uri) {
      update("photoSignature", { photoUri: res.assets[0].uri });
    }
  };

  const pickSignature = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      base64: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!res.canceled && res.assets && res.assets[0]?.uri) {
      update("photoSignature", {
        signatureUri: res.assets[0].uri,
        signatureDrawData: undefined,
      });
    }
  };

  const onContinue = () => {
    const v = validatePhotoSignature();
    setErrors(v.errors);
    if (v.isValid) {
      router.push("/kyc/financial");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={{ flex: 1 }}
    >
      <StepProgress current={currentStep} total={totalSteps} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text category="label">Capture Photo</Text>
            <InfoTooltip content="Used to verify your face against ID documents." />
          </View>
          <Button
            onPress={pickPhoto}
            appearance={data.photoSignature.photoUri ? "filled" : "outline"}
          >
            {data.photoSignature.photoUri ? "Retake Photo" : "Open Camera"}
          </Button>
          {data.photoSignature.photoUri && (
            <Image
              source={{ uri: data.photoSignature.photoUri }}
              style={{ width: "100%", height: 200, borderRadius: 8 }}
            />
          )}
          {!!errors.photoUri && (
            <Text category="c2" status="danger">
              {errors.photoUri}
            </Text>
          )}
        </View>

        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text category="label">Upload / Draw Signature</Text>
            <InfoTooltip content="Your signature is needed for eSign and document verification." />
          </View>
          <Button
            onPress={pickSignature}
            appearance={data.photoSignature.signatureUri ? "filled" : "outline"}
          >
            {data.photoSignature.signatureUri
              ? "Replace Signature"
              : "Upload Signature"}
          </Button>
          {data.photoSignature.signatureUri && (
            <Image
              source={{ uri: data.photoSignature.signatureUri }}
              style={{
                width: "100%",
                height: 160,
                borderRadius: 8,
                backgroundColor: "#F7F9FC",
              }}
            />
          )}
          {!!errors.signatureUri && (
            <Text category="c2" status="danger">
              {errors.signatureUri}
            </Text>
          )}
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
          <Button style={{ flex: 1 }} onPress={onContinue}>
            Continue
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
