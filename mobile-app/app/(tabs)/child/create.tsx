import { ChildForm } from "@/components/child/ChildForm";
import { FormHeader } from "@/components/child/FormHeader";
import { useFormAnimation } from "@/hooks/useFormAnimation";
import {
  ChildFormValues,
  childSchema,
  defaultChildFormErrors,
  defaultChildFormValues,
  validateForm,
} from "@/utils/validation";
import {
  Button,
  Layout,
  TopNavigation,
  TopNavigationAction,
} from "@ui-kitten/components";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import { Animated, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateChild() {
  const [values, setValues] = useState<ChildFormValues>(defaultChildFormValues);
  const [errors, setErrors] = useState(defaultChildFormErrors);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    animations,
    animateFieldChange,
    animateCheckbox,
    animateButtonPress,
    animateError,
    animateSuccess,
    animateExit,
  } = useFormAnimation();

  const handleFieldChange = (field: keyof ChildFormValues, value: any) => {
    setValues({ ...values, [field]: value });
    animateFieldChange();

    // Clear error for the field being edited
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleCheckboxChange = (value: boolean) => {
    handleFieldChange("investUnderChildName", value);
    animateCheckbox();
  };

  const handleSubmit = () => {
    animateButtonPress();

    const { isValid, errors: validationErrors } = validateForm(
      childSchema,
      values
    );

    if (!isValid) {
      setErrors({
        ...defaultChildFormErrors,
        ...validationErrors,
      });
      animateError();
    } else {
      setErrors(defaultChildFormErrors);
      setIsSubmitting(true);

      animateSuccess(() => {
        // Navigate to next screen
        // router.push("/next-screen");
        setIsSubmitting(false);
      });
    }
  };

  const handleBack = () => {
    animateExit(() => {
      router.back();
    });
  };

  const BackAction = (): React.ReactElement => (
    <TopNavigationAction
      icon={() => <ArrowLeft strokeWidth={3} />}
      onPress={handleBack}
    />
  );

  return (
    <Layout style={styles.container} level="1">
      <SafeAreaView style={styles.safeArea}>
        <TopNavigation
          accessoryLeft={BackAction}
          title="Invest for Future"
          style={styles.topNav}
        />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <FormHeader
            title="Who is this for?"
            subtitle="Add your child to start planning for their education."
            animationStyle={{
              opacity: animations.fadeAnim,
              transform: [
                { translateY: animations.slideAnim },
                { scale: animations.headerScale },
              ],
            }}
          />

          <ChildForm
            values={values}
            errors={errors}
            onFieldChange={handleFieldChange}
            onCheckboxChange={handleCheckboxChange}
            checkboxRotation={animations.checkboxRotation}
            animationStyle={{
              opacity: animations.fadeAnim,
              transform: [
                { translateY: animations.slideAnim },
                { scale: animations.cardScale },
              ],
            }}
          />

          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: animations.fadeAnim,
                transform: [
                  { translateY: animations.slideAnim },
                  { scale: animations.buttonScale },
                ],
              },
            ]}
          >
            <Button
              onPress={handleSubmit}
              size="large"
              disabled={isSubmitting}
              status={isSubmitting ? "warning" : "primary"}
              style={styles.submitButton}
            >
              {isSubmitting ? "Processing..." : "Next"}
            </Button>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topNav: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  buttonContainer: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
  submitButton: {
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
