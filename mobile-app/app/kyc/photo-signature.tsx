import { getUserSignature, uploadUserSignature } from "@/api/userApi";
import Button from "@/components/v2/Button";
import OutlineButton from "@/components/v2/OutlineButton";
import KycHeader from "@/components/v2/kyc/KycHeader";
import KycSecurityNotice from "@/components/v2/kyc/KycSecurityNotice";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAuthAxios } from "@/hooks/useAuthAxios";
import { useUser } from "@/hooks/useUser";
import { useKyc } from "@/providers/KycProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useCameraPermissions } from "expo-image-picker";
import { useRouter } from "expo-router";
import { Upload } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function PhotoSignatureScreen() {
  const { data, update, validatePhotoSignature } = useKyc();
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasSignatureChanged, setHasSignatureChanged] = useState(false);
  const api = useAuthAxios();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const isCameraLaunching = React.useRef(false);

  const normalizeSignatureUri = useCallback(
    (uri: string | null | undefined) => {
      if (!uri) return null;
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
      return `data:image/png;base64,${uri}`;
    },
    [api]
  );

  const { data: existingSignature } = useQuery({
    queryKey: [QUERY_KEYS.userSignature, user?.id],
    queryFn: () => {
      if (!user?.id) return Promise.resolve(null);
      return getUserSignature(api, user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!existingSignature) return;
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
    normalizeSignatureUri,
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
      mediaTypes: ["images"],
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

  const takeSignaturePhoto = async () => {
    if (isCameraLaunching.current) return;
    isCameraLaunching.current = true;
    let timedOut = false;
    try {
      if (!cameraPermission?.granted) {
        const result = await requestCameraPermission();
        if (!result.granted) {
          Alert.alert(
            "Permission required",
            "Camera permission is required. Please enable it in your device settings."
          );
          return;
        }
      }
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => {
          timedOut = true;
          reject(new Error("Camera launch timed out"));
        }, 15000)
      );
      const res = await Promise.race([
        ImagePicker.launchCameraAsync({
          quality: 0.7,
          base64: false,
          mediaTypes: ["images"],
        }).then((r) => {
          if (timedOut) return null;
          return r;
        }),
        timeout,
      ]);
      if (res && !res.canceled && res.assets && res.assets[0]?.uri) {
        update("photoSignature", {
          signatureUri: res.assets[0].uri,
          signatureDrawData: undefined,
        });
        setErrors((prev) => ({ ...prev, signatureUri: "" }));
        setHasSignatureChanged(true);
      }
    } catch (error) {
      Alert.alert("Camera error", "Could not open camera. Please try uploading from gallery instead.");
    } finally {
      isCameraLaunching.current = false;
    }
  };

  const { mutateAsync: submitSignature, isPending: isUploading } = useMutation({
    mutationFn: async (fileUri: string) => {
      if (!user?.id) throw new Error("User unavailable");
      await uploadUserSignature(api, user.id, { uri: fileUri });
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
    if (!validation.isValid) return;

    const signatureUri = data.photoSignature.signatureUri;
    if (!signatureUri) {
      Alert.alert(
        "Signature required",
        "Please upload your signature before continuing."
      );
      return;
    }

    try {
      if (hasSignatureChanged && signatureUri) {
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

  const signatureUri = data.photoSignature.signatureUri;

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.root}
    >
      <KycHeader
        title="KYC Photo & Signature"
        current={3}
        total={5}
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.fieldLabel}>Upload Signature</Text>

        {/* Upload zone */}
        <Pressable onPress={pickSignature} accessibilityRole="button">
          <View
            style={[
              styles.uploadZone,
              !!errors.signatureUri && styles.uploadZoneError,
            ]}
          >
            {signatureUri ? (
              <Image
                source={{ uri: signatureUri }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            ) : (
              <>
                <Upload size={28} color="#9CA3AF" />
                <Text style={styles.addFileText}>Add file</Text>
              </>
            )}
          </View>
        </Pressable>

        {!!errors.signatureUri && (
          <Text style={styles.errorText}>{errors.signatureUri}</Text>
        )}

        <Text style={styles.orSeparator}>OR</Text>

        <OutlineButton title="Take photo" onPress={takeSignaturePhoto} />

        <View style={styles.spacer} />

        <KycSecurityNotice />

        <Button
          title={isUploading ? "Uploading..." : "Continue"}
          loading={isUploading}
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
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    flexGrow: 1,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  uploadZone: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#C5CEE0",
    borderRadius: 12,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  uploadZoneError: {
    borderColor: "#EF4444",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  addFileText: {
    marginTop: 8,
    fontSize: 15,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
    marginBottom: 4,
  },
  orSeparator: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#8F9BB3",
    marginVertical: 16,
  },
  spacer: {
    flex: 1,
    minHeight: 32,
  },
});
