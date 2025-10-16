import { ChildFormValues } from "@/utils/validation";
import {
  Card,
  CheckBox,
  Datepicker,
  Input,
  Text,
  TextProps,
} from "@ui-kitten/components";
import { CalendarDays } from "lucide-react-native";
import React from "react";
import { Animated, StyleSheet, View } from "react-native";

interface ChildFormProps {
  values: ChildFormValues;
  errors: Record<string, string>;
  animationStyle?: any;
  checkboxRotation?: any;
  onFieldChange: (field: keyof ChildFormValues, value: any) => void;
  onCheckboxChange: (value: boolean) => void;
}

export const ChildForm: React.FC<ChildFormProps> = ({
  values,
  errors,
  animationStyle,
  checkboxRotation,
  onFieldChange,
  onCheckboxChange,
}) => {
  return (
    <Animated.View style={[styles.cardContainer, animationStyle]}>
      <Card style={styles.card} disabled>
        <View style={styles.formContent}>
          <Input
            value={values.firstName}
            label="First Name"
            placeholder="Enter your child's first name"
            onChangeText={(nextValue) => onFieldChange("firstName", nextValue)}
            status={errors.firstName ? "danger" : "basic"}
            caption={errors.firstName}
            style={styles.input}
            size="large"
          />

          <Input
            value={values.lastName}
            label="Last Name"
            placeholder="Enter your child's last name"
            onChangeText={(nextValue) => onFieldChange("lastName", nextValue)}
            status={errors.lastName ? "danger" : "basic"}
            caption={errors.lastName}
            style={styles.input}
            size="large"
          />

          <Datepicker
            label="Date of Birth"
            placeholder="Pick Date"
            date={values.dateOfBirth}
            min={new Date("2011-01-01")}
            max={new Date()}
            onSelect={(nextDate) => onFieldChange("dateOfBirth", nextDate)}
            accessoryRight={() => <CalendarDays size={20} />}
            status={errors.dateOfBirth ? "danger" : "basic"}
            caption={errors.dateOfBirth}
            style={styles.input}
            size="large"
          />

          <Animated.View style={[styles.checkboxContainer]}>
            <CheckBox
              checked={values.investUnderChildName}
              onChange={onCheckboxChange}
              status={errors.investUnderChildName ? "danger" : "basic"}
              style={styles.checkbox}
            >
              {(
                evaProps: React.JSX.IntrinsicAttributes &
                  React.JSX.IntrinsicClassAttributes<Text> &
                  Readonly<TextProps>
              ) => (
                <Text {...evaProps} style={styles.checkboxText}>
                  Invest under child&apos;s name?
                </Text>
              )}
            </CheckBox>
          </Animated.View>
        </View>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  card: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  formContent: {
    gap: 16,
  },
  input: {
    marginBottom: 8,
  },
  checkboxContainer: {
    marginTop: 8,
  },
  checkbox: {
    marginVertical: 8,
  },
  checkboxText: {
    fontSize: 16,
    marginLeft: 8,
  },
});
