import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Child } from "@/types/child";
import Button from "./Button";

// ─── Tokens ───────────────────────────────────────────────────────────────────
const T = {
  bg: "#FAFAFA",
  backButtonBg: "#E4E6FB",
  backButtonIcon: "#3137D5",
  textPrimary: "#111111",
  textMuted: "#6B7280",
  dropdownBorder: "#D4D4D4",
  dropdownBg: "#FFFFFF",
  selectedOptionBg: "#F5F5FA",
  infoBorder: "#D4D4D4",
  infoBg: "#FFFFFF",
  divider: "#E5E7EB",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getAge(dateOfBirth: Date): number {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  ) {
    age--;
  }
  return age;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  child: Child;
  loading?: boolean;
  onBack: () => void;
  onStartPlanning: (selectedAge: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function WhenNeededScreen({ child, loading = false, onBack, onStartPlanning }: Props) {
  const insets = useSafeAreaInsets();
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const currentAge = getAge(child.dateOfBirth);
  const minAge = Math.max(currentAge + 1, 15);
  const ageOptions: number[] = Array.from(
    { length: 25 - minAge + 1 },
    (_, i) => minAge + i,
  );
  const yearsFromNow = selectedAge !== null ? selectedAge - currentAge : null;

  const handleSelectAge = (age: number) => {
    setSelectedAge(age);
    setIsOpen(false);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Header label ── */}
      <Text style={styles.headerLabel}>Child's info</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Back button ── */}
        <Pressable
          onPress={onBack}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={20} color={T.backButtonIcon} />
        </Pressable>

        {/* ── Heading ── */}
        <Text style={styles.heading}>
          When will {child.firstName} need this?
        </Text>
        <Text style={styles.subtitle}>
          Every plan we build is as unique as they are.
        </Text>

        {/* ── Dropdown ── */}
        <View style={styles.dropdownContainer}>
          {/* Trigger */}
          <Pressable
            onPress={() => setIsOpen((v) => !v)}
            style={[
              styles.dropdownTrigger,
              isOpen && styles.dropdownTriggerOpen,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Select age"
          >
            <Text
              style={[
                styles.dropdownTriggerText,
                selectedAge !== null && styles.dropdownTriggerTextSelected,
              ]}
            >
              {selectedAge !== null ? `${selectedAge} y/o` : "select"}
            </Text>
            <Ionicons
              name={isOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color={T.textMuted}
            />
          </Pressable>

          {/* Options list */}
          {isOpen && (
            <View style={styles.optionsList}>
              {ageOptions.map((age, index) => (
                <Pressable
                  key={age}
                  onPress={() => handleSelectAge(age)}
                  style={[
                    styles.optionItem,
                    age === selectedAge && styles.optionItemSelected,
                    index < ageOptions.length - 1 && styles.optionItemDivider,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${age} years old`}
                >
                  <Text
                    style={[
                      styles.optionText,
                      age === selectedAge && styles.optionTextSelected,
                    ]}
                  >
                    {age} y/o
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* ── Info box ── */}
        {yearsFromNow !== null && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              That's {yearsFromNow} years from now — plenty of time to build.
            </Text>
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      {/* ── CTA ── */}
      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom > 0 ? insets.bottom : 24 },
        ]}
      >
        <Button
          title={`Start planning for ${child.firstName}`}
          disabled={selectedAge === null}
          loading={loading}
          onPress={() => {
            if (selectedAge !== null) onStartPlanning(selectedAge);
          }}
        />
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.bg,
  } as ViewStyle,

  headerLabel: {
    fontSize: 13,
    color: T.textMuted,
    fontWeight: "500",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  } as TextStyle,

  scroll: {
    flex: 1,
  } as ViewStyle,

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  } as ViewStyle,

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.backButtonBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  } as ViewStyle,

  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: T.textPrimary,
    marginBottom: 8,
    lineHeight: 34,
  } as TextStyle,

  subtitle: {
    fontSize: 14,
    color: T.textMuted,
    fontWeight: "400",
    marginBottom: 28,
    lineHeight: 20,
  } as TextStyle,

  dropdownContainer: {
    marginBottom: 16,
  } as ViewStyle,

  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: T.dropdownBorder,
    borderRadius: 12,
    backgroundColor: T.dropdownBg,
    paddingHorizontal: 16,
    paddingVertical: 16,
  } as ViewStyle,

  dropdownTriggerOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: "transparent",
  } as ViewStyle,

  dropdownTriggerText: {
    fontSize: 16,
    color: T.textMuted,
    fontWeight: "400",
  } as TextStyle,

  dropdownTriggerTextSelected: {
    color: T.textPrimary,
    fontWeight: "500",
  } as TextStyle,

  optionsList: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: T.dropdownBorder,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: T.dropdownBg,
    overflow: "hidden",
  } as ViewStyle,

  optionItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: T.dropdownBg,
  } as ViewStyle,

  optionItemSelected: {
    backgroundColor: T.selectedOptionBg,
  } as ViewStyle,

  optionItemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: T.divider,
  } as ViewStyle,

  optionText: {
    fontSize: 16,
    color: T.textPrimary,
    fontWeight: "400",
  } as TextStyle,

  optionTextSelected: {
    fontWeight: "500",
  } as TextStyle,

  infoBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: T.infoBorder,
    borderRadius: 12,
    backgroundColor: T.infoBg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
  } as ViewStyle,

  infoText: {
    fontSize: 14,
    color: T.textMuted,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 20,
  } as TextStyle,

  spacer: {
    flex: 1,
    minHeight: 32,
  } as ViewStyle,

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: T.bg,
  } as ViewStyle,
});
