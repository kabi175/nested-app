import Button from "@/components/v2/Button";
import TextInput from "@/components/v2/TextInput";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useUser } from "@/hooks/useUser";
import { useUpdateUser } from "@/hooks/useUserMutations";
import { logSignUp } from "@/services/firebaseAnalytics";
import { logCompleteRegistration } from "@/services/metaEvents";
import { useQueryClient } from "@tanstack/react-query";
import { Redirect, router } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NameInputScreen() {
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();
  const { data: user, isLoading: isUserLoading } = useUser();
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  if (isUserLoading || user?.firstName !== user?.phone_number) {
    return <Redirect href="/" />;
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert("Error", "Name must be at least 2 characters long");
      return;
    }

    try {
      if (!user) return;

      await updateUser({
        id: user.id,
        payload: {
          firstName: name.trim(),
        },
      });

      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.user] });
      logCompleteRegistration({ registration_method: "phone" });
      logSignUp("phone");
      router.replace("/view-story");
    } catch (error) {
      console.log("Error saving name", error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>What is your name?</Text>

        {/* Input */}
        <TextInput
          placeholder="Your name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          editable={!isUpdatingUser}
        />

        {/* Push button to bottom */}
        <View style={styles.spacer} />

        {/* Next button */}
        <Button
          title="Next"
          onPress={handleSubmit}
          disabled={!name.trim()}
          loading={isUpdatingUser}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 24,
  },
  spacer: {
    flex: 1,
  },
});
