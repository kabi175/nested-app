import { api } from "@/api/client";
import { getUserSignature, uploadUserSignature } from "@/api/userApi";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { StepProgress } from "@/components/ui/StepProgress";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useUser } from "@/hooks/useUser";
import { useKyc } from "@/providers/KycProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Text } from "@ui-kitten/components";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

export default function PhotoSignatureScreen() {
  const { data, update, validatePhotoSignature } = useKyc();
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasSignatureChanged, setHasSignatureChanged] = useState(false);
  const totalSteps = 6;
  const currentStep = 4;

  const normalizeSignatureUri = (uri: string | null | undefined) => {
    if (!uri) {
      return null;
    }
    if (
      uri.startsWith("data:") ||
      uri.startsWith("http://") ||
      uri.startsWith("https://") ||
      uri.startsWith("file://") ||
      uri.startsWith("content://")
    ) {
      return uri;
    }

    if (uri.startsWith("/")) {
      const baseUrl = api.defaults.baseURL ?? "";
      const trimmedBase = baseUrl.endsWith("/")
        ? baseUrl.slice(0, -1)
        : baseUrl;
      return `${trimmedBase}${uri}`;
    }

    const defaultMime = "image/png";
    return `data:${defaultMime};base64,${uri}`;
  };

  const { data: existingSignature } = useQuery({
    queryKey: [QUERY_KEYS.userSignature, user?.id],
    queryFn: () => {
      if (!user?.id) {
        return Promise.resolve(null);
      }
      return getUserSignature(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!existingSignature) {
      return;
    }
    if (
      data.photoSignature.signatureUri ||
      data.photoSignature.signatureDrawData
    ) {
      return;
    }
    const normalized = normalizeSignatureUri(existingSignature);
    if (normalized) {
      update("photoSignature", { signatureUri: normalized });
      setHasSignatureChanged(false);
    }
  }, [
    existingSignature,
    data.photoSignature.signatureUri,
    data.photoSignature.signatureDrawData,
    update,
  ]);

  useEffect(() => {
    if (data.photoSignature.signatureDrawData) {
      setHasSignatureChanged(true);
    }
  }, [data.photoSignature.signatureDrawData]);

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
      setErrors((prev) => ({ ...prev, signatureUri: "" }));
      setHasSignatureChanged(true);
    }
  };

  const { mutateAsync: submitSignature, isPending: isUploading } = useMutation({
    mutationFn: async (fileUri: string) => {
      if (!user?.id) {
        throw new Error("User unavailable");
      }
      await uploadUserSignature(user.id, { uri: fileUri });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.user] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.userSignature, user?.id],
      });
    },
  });

  const onContinue = async () => {
    const validation = validatePhotoSignature();
    const normalizedErrors = { ...validation.errors };
    if (normalizedErrors.undefined) {
      normalizedErrors.signatureUri = normalizedErrors.undefined;
      delete normalizedErrors.undefined;
    }
    setErrors(normalizedErrors);
    if (!validation.isValid) {
      return;
    }

    const signatureUri = data.photoSignature.signatureUri;

    if (!signatureUri) {
      Alert.alert(
        "Signature required",
        "Please upload your signature before continuing."
      );
      return;
    }

    const shouldUpload = hasSignatureChanged && !!signatureUri;

    try {
      if (shouldUpload) {
        await submitSignature(signatureUri);
        setHasSignatureChanged(false);
      }
      router.push("/kyc/financial");
    } catch (error) {
      console.error("Failed to upload signature", error);
      Alert.alert(
        "Upload failed",
        "We couldn't upload your signature. Please try again."
      );
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
          <Button
            style={{ flex: 1 }}
            onPress={onContinue}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Continue"}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
