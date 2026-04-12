import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
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
import TextInput from "@/components/v2/TextInput";
import { useCreateChild } from "@/hooks/useChildMutations";
import { StatusBar } from "expo-status-bar";

const MIN_YEARS = 25;

// Local form state
interface ChildFormState {
  name: string;
  dob: string; // DD/MM/YYYY
}

const defaultLocalValues: ChildFormState = {
  name: "",
  dob: "",
};

function parseDob(value: string): Date | null {
  if (value.length !== 10) return null;
  const [day, month, year] = value.split("/").map(Number);
  if (!day || !month || !year) return null;
  const date = new Date(year, month - 1, day);
  // Verify no date overflow (e.g. 31/02 rolling over)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) return null;
  return date;
}

function formatDobInput(_prev: string, next: string): string {
  // Strip non-digits
  const digits = next.replace(/\D/g, "");
  // Only allow up to 8 digits (DDMMYYYY)
  const clamped = digits.slice(0, 8);
  // Insert slashes
  if (clamped.length <= 2) return clamped;
  if (clamped.length <= 4) return `${clamped.slice(0, 2)}/${clamped.slice(2)}`;
  return `${clamped.slice(0, 2)}/${clamped.slice(2, 4)}/${clamped.slice(4)}`;
}

export default function CreateChild() {
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState<ChildFormState>(defaultLocalValues);
  const [touched, setTouched] = useState<Record<keyof ChildFormState, boolean>>({
    name: false,
    dob: false,
  });

  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { mutateAsync: createChildMutation } = useCreateChild();

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const handleFieldChange = (field: "name", value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setSubmitError("");
  };

  const handleDobChange = (raw: string) => {
    const formatted = formatDobInput(values.dob, raw);
    setValues((prev) => ({ ...prev, dob: formatted }));
    setSubmitError("");
  };

  const handleBlur = (field: keyof ChildFormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
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
    } else if (values.dob.length < 10) {
      errs.dob = "Enter a complete date (DD/MM/YYYY).";
    } else {
      const parsed = parseDob(values.dob);
      if (!parsed) {
        errs.dob = "Enter a valid date (DD/MM/YYYY).";
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - MIN_YEARS);
        minDate.setHours(0, 0, 0, 0);

        if (parsed > today) {
          errs.dob = "Date of birth cannot be in the future.";
        } else if (parsed < minDate) {
          errs.dob = `Date of birth cannot be more than ${MIN_YEARS} years ago.`;
        }
      }
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
        dateOfBirth: parseDob(values.dob)!,
        investUnderChild: false,
      };

      const createdChild = await createChildMutation(payload);

      router.push(`/child/${createdChild.id}/plan`);
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
          {!keyboardVisible && (
            <View style={styles.imageContainer}>
              <AnimatedNest width={180} height={180} />
            </View>
          )}

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

            <TextInput
              label="Date of birth"
              placeholder="DD/MM/YYYY"
              value={values.dob}
              onChangeText={handleDobChange}
              onBlur={() => handleBlur("dob")}
              error={errors.dob}
              touched={touched.dob}
              keyboardType="number-pad"
              maxLength={10}
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
    backgroundColor: "#E4E6FB",
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
