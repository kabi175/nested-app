import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import AnimatedNest from "@/components/v2/AnimatedNest";
import Button from "@/components/v2/Button";
import DateInput from "@/components/v2/DateInput";
import TextInput from "@/components/v2/TextInput";
import { useCreateChild } from "@/hooks/useChildMutations";
import { StatusBar } from "expo-status-bar";

const MIN_DOB = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 25);
  return d;
})();

// Local form state
interface ChildFormState {
  name: string;
  dob: Date | null;
}

const defaultLocalValues: ChildFormState = {
  name: "",
  dob: null,
};

export default function CreateChild() {
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState<ChildFormState>(defaultLocalValues);
  // Touched state to only show errors after the user interacts
  const [touched, setTouched] = useState<Record<keyof ChildFormState, boolean>>({
    name: false,
    dob: false,
  });

  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: createChildMutation } = useCreateChild();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/")
    }
  };

  const handleFieldChange = (field: "name", value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setSubmitError("");
  };

  const handleBlur = (field: keyof ChildFormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleDobChange = (date: Date) => {
    setValues((prev) => ({ ...prev, dob: date }));
    setSubmitError("");
    setTouched((prev) => ({ ...prev, dob: true }));
  };

  // Local Validation
  const getErrors = () => {
    const errs: Partial<Record<keyof ChildFormState, string>> = {};

    // Name validation: 3-50 chars
    if (!values.name) {
      errs.name = "Name is required.";
    } else if (values.name.trim().length < 3) {
      errs.name = "Name must be at least 3 characters.";
    } else if (values.name.trim().length > 50) {
      errs.name = "Name must be less than 50 characters.";
    }

    // DOB validation
    if (!values.dob) {
      errs.dob = "Date of birth is required.";
    } else if (values.dob > new Date()) {
      errs.dob = "Date of birth cannot be in the future.";
    }

    return errs;
  };

  const errors = getErrors();
  const isValid = Object.keys(errors).length === 0;

  const handleSubmit = async () => {
    setTouched({ name: true, dob: true });

    if (!isValid) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        firstName: values.name.trim(),
        lastName: " ",
        dateOfBirth: values.dob!,
        investUnderChild: false,
      };

      await createChildMutation(payload);
      router.replace(`/child/select`);
    } catch (error: any) {
      console.error("Error creating child:", error);
      if (error.response?.status === 401) {
        setSubmitError("Please log in to continue");
      } else if (error.response?.status === 409) {
        setSubmitError("A child with this name already exists");
      } else {
        setSubmitError("An error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar style="dark" backgroundColor="#F9FAF9" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header section */}
          <View style={styles.header}>
            <Pressable
              onPress={handleBack}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={24} color="#1F2937" />
            </Pressable>

            <Text style={styles.title}>Tell us about your little one</Text>
            <Text style={styles.subtitle}>
              Every plan we build is as unique as they are.
            </Text>
          </View>

          {/* Illustration */}
          <View style={styles.imageContainer}>
            <AnimatedNest width={180} height={180} />
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <TextInput
              label="Name"
              placeholder="Your child's name"
              value={values.name}
              onChangeText={(val) => handleFieldChange("name", val)}
              onBlur={() => handleBlur("name")}
              error={errors.name}
              touched={touched.name}
              autoCapitalize="words"
            />

            <DateInput
              label="Date of birth"
              value={values.dob}
              onChange={handleDobChange}
              max={new Date()}
              min={MIN_DOB}
              placeholder="DD/MM/YYYY"
              error={errors.dob}
              touched={touched.dob}
            />

            {submitError ? (
              <Text style={styles.globalError}>{submitError}</Text>
            ) : null}
          </View>
        </ScrollView>

        {/* Fixed Button at bottom */}
        <View style={[styles.bottomContainer, { paddingBottom: Platform.OS === "ios" ? insets.bottom || 24 : 24 }]}>
          <Button
            title="Add to nest"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={!isValid && (touched.name || touched.dob)}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAF9",
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E4E6FB", // Adjusted lighter purple from mock for the arrow container
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 48,
  },
  image: {
    width: 180,
    height: 180,
  },
  formContainer: {
    width: "100%",
  },
  globalError: {
    color: "#EF4444",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: "#F9FAF9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
});
