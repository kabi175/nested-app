import { Child } from "@/types/child";
import {
  Card,
  Datepicker,
  Input,
  Radio,
  RadioGroup,
  Text,
} from "@ui-kitten/components";
import { CalendarDays } from "lucide-react-native";
import React from "react";
import { Animated, StyleSheet, View } from "react-native";

interface ChildFormProps {
  values: Child;
  errors: Record<string, string>;
  animationStyle?: any;
  checkboxRotation?: any;
  onFieldChange: (field: keyof Child, value: any) => void;
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
            label="Name"
            placeholder="Enter your child's first name"
            onChangeText={(nextValue) => onFieldChange("firstName", nextValue)}
            status={errors.firstName ? "danger" : "basic"}
            caption={errors.firstName}
            style={styles.input}
            size="large"
          />

          {/* <Input
            value={values.lastName}
            label="Last Name"
            placeholder="Enter your child's last name"
            onChangeText={(nextValue) => onFieldChange("lastName", nextValue)}
            status={errors.lastName ? "danger" : "basic"}
            caption={errors.lastName}
            style={styles.input}
            size="large"
          /> */}

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

          <View style={styles.genderContainer}>
            <Text category="label" style={styles.genderLabel}>
              Gender
            </Text>
            <RadioGroup
              selectedIndex={
                values.gender === "male"
                  ? 0
                  : values.gender === "female"
                  ? 1
                  : 2
              }
              onChange={(index) => {
                const gender =
                  index === 0 ? "male" : index === 1 ? "female" : "other";
                onFieldChange("gender", gender);
              }}
              style={styles.radioGroup}
            >
              <Radio>Male</Radio>
              <Radio>Female</Radio>
              <Radio>Other</Radio>
            </RadioGroup>
            {errors.gender && (
              <Text category="c1" status="danger" style={styles.errorText}>
                {errors.gender}
              </Text>
            )}
          </View>
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
  genderContainer: {
    marginBottom: 8,
  },
  genderLabel: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  radioGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  errorText: {
    marginTop: 4,
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
