import {
    FirebaseAuthTypes,
    getAuth,
    signInWithPhoneNumber,
} from "@react-native-firebase/auth";
import { router } from "expo-router";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

export default function SignIn() {
  const [phoneNumber, setPhoneNumber] = useState("");

  // If null, no SMS has been sent
  const [confirm, setConfirm] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

  const [code, setCode] = useState("");

  async function handlePhoneNumberVerification() {
    try {
      if (confirm) {
        confirmCode();
        return;
      }
      const confirmation = await signInWithPhoneNumber(getAuth(), phoneNumber);
      setConfirm(confirmation);
    } catch (error) {
      console.log("Phone number verification error", error);
    }
  }

  // Handle confirm code button press
  async function confirmCode() {
    try {
      confirm?.confirm(code);
    } catch (error: any) {
      if (error.code === "auth/invalid-verification-code") {
        console.log("Invalid code.");
      } else {
        console.log("Account linking error");
      }
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text
        onPress={() => {
          // Navigate after signing in. You may want to tweak this to ensure sign-in is
          // successful before navigating.
          router.replace("/");
        }}
      >
        Sign In
      </Text>
      <TextInput
        onChangeText={setPhoneNumber}
        value={phoneNumber}
        placeholder="Enter mobile number"
      />

      {confirm && (
        <TextInput
          onChangeText={setCode}
          value={code}
          placeholder="Enter OTP"
        />
      )}

      <Button
        onPress={handlePhoneNumberVerification}
        title="Continue"
        accessibilityLabel="continue to the next step"
      />
    </View>
  );
}
