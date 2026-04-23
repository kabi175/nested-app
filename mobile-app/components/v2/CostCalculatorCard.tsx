import { router } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SearchableDropdown } from "@/components/ui/SearchableDropdown";
import Button from "@/components/v2/Button";
import { useCreateChild } from "@/hooks/useChildMutations";
import { useChildren } from "@/hooks/useChildren";
import { useEducations } from "@/hooks/useEducations";
import { useGoalCreation } from "@/hooks/useGoalCreation";
import { Education } from "@/types/education";
import { calculateFutureCost } from "@/utils/goalForm";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = Math.max(460, Math.round(SCREEN_HEIGHT * 0.44));

const PATHS = [
  { id: "top-colleges", title: "Top colleges India" },
  { id: "study-abroad", title: "Study Abroad" },
  { id: "medical", title: "Medical/MBBS" },
  { id: "mba", title: "MBA/IIM" },
  { id: "arts", title: "Arts & Design" },
  { id: "iits", title: "IITs/NITs" },
];

function parseDob(value: string): Date | null {
  if (value.length !== 10) return null;
  const [day, month, year] = value.split("/").map(Number);
  if (!day || !month || !year) return null;
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  )
    return null;
  return date;
}

function formatDobInput(prev: string, next: string): string {
  const digits = next.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export default function CostCalculatorCard() {
  const scrollRef = useRef<ScrollView>(null);
  const { courses, institutions } = useEducations();
  const { data: existingChildren } = useChildren();
  const createChildMutation = useCreateChild();
  const createGoalMutation = useGoalCreation();

  const [selectedPath, setSelectedPath] = useState<{ id: string; title: string } | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<Education | null>(null);
  const [childName, setChildName] = useState("");
  const [dob, setDob] = useState("");
  const [submitError, setSubmitError] = useState("");

  const canAdvance = !!(selectedPath || selectedCollege);
  const isSubmitting = createChildMutation.isPending || createGoalMutation.isPending;

  function handlePathSelect(path: { id: string; title: string }) {
    setSelectedPath(path);
    setSelectedCollege(null);
  }

  function handleCollegeSelect(college: Education) {
    setSelectedCollege(college);
    setSelectedPath(null);
  }

  function handleChildNameChange(value: string) {
    setChildName(value);
    setSubmitError("");
    const match = existingChildren?.find(
      (c) => c.firstName.trim().toLowerCase() === value.trim().toLowerCase()
    );
    if (match) {
      const d = match.dateOfBirth;
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = String(d.getFullYear());
      setDob(`${dd}/${mm}/${yyyy}`);
    } else {
      setDob("");
    }
  }

  function handleNext() {
    scrollRef.current?.scrollTo({ x: CARD_WIDTH, animated: true });
  }

  async function handleContinue() {
    setSubmitError("");
    const name = childName.trim();
    if (!name) {
      setSubmitError("Enter a child name.");
      return;
    }

    // Resolve child
    let child = existingChildren?.find(
      (c) => c.firstName.trim().toLowerCase() === name.toLowerCase()
    ) ?? null;

    if (!child) {
      const parsed = parseDob(dob);
      if (!parsed) {
        setSubmitError("Enter a valid date of birth (DD/MM/YYYY).");
        return;
      }
      try {
        child = await createChildMutation.mutateAsync({
          firstName: name,
          lastName: " ",
          dateOfBirth: parsed,
          investUnderChild: false,
        });
      } catch {
        setSubmitError("Could not create child. Please try again.");
        return;
      }
    }

    // Resolve education
    let education: Education | undefined;
    if (selectedPath) {
      education = courses?.find((c) => c.name === selectedPath.id);
    } else if (selectedCollege) {
      education = selectedCollege;
    }
    if (!education) {
      console.error("Selected education not found", { selectedPath, selectedCollege, courses });
      setSubmitError("Could not find the selected education. Please try again.");
      return;
    }

    const currentYear = new Date().getFullYear();
    const targetYear = Math.max(child.dateOfBirth.getFullYear() + 18, currentYear + 3);
    const targetDate = new Date(child.dateOfBirth);
    targetDate.setFullYear(targetYear);

    try {
      const [goal] = await createGoalMutation.mutateAsync([
        {
          childId: child.id,
          educationId: education.id,
          title: `${child.firstName}'s Graduation`,
          targetAmount: calculateFutureCost(education, targetYear),
          targetDate,
        },
      ]);
      router.push({ pathname: "/education/[gaol_id]", params: { gaol_id: goal.id } });
    } catch {
      setSubmitError("Could not create goal. Please try again.");
    }
  }

  const matchedChild = existingChildren?.find(
    (c) => c.firstName.trim().toLowerCase() === childName.trim().toLowerCase()
  );
  const isNewChild = childName.trim().length > 0 && !matchedChild;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        style={styles.scroller}
      >
        {/* Card 1 */}
        <View style={[styles.card, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
          <View style={styles.header}>
            <Text style={styles.tag}>CALCULATE</Text>
            <Text style={styles.step}>1/2</Text>
          </View>
          <View style={styles.divider} />

          <Text style={styles.title}>What will it cost?</Text>
          <Text style={styles.subtitle}>
            See how fees have grown, and where they're headed.
          </Text>

          <SearchableDropdown
            data={PATHS}
            labelKey="title"
            valueKey="id"
            placeholder="choose a field"
            searchPlaceholder="Search fields..."
            onSelect={handlePathSelect}
            selectedValue={selectedPath}
          />

          <Text style={styles.or}>OR</Text>

          <SearchableDropdown
            data={institutions ?? []}
            labelKey="name"
            valueKey="id"
            placeholder="pick a college"
            searchPlaceholder="Search colleges..."
            onSelect={handleCollegeSelect}
            selectedValue={selectedCollege}
          />

          <View style={styles.spacer} />
          <View style={styles.buttonWrapper}>
            <Button
              title="Next"
              icon={(props) => <ArrowRight {...props} strokeWidth={3} />}
              disabled={!canAdvance}
              onPress={handleNext}
            />
          </View>
        </View>

        {/* Card 2 */}
        <View style={[styles.card, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
          <View style={styles.header}>
            <Text style={styles.tag}>CALCULATE</Text>
            <Text style={styles.step}>2/2</Text>
          </View>
          <View style={styles.divider} />

          <Text style={styles.title}>Who are we calculating for?</Text>
          <Text style={styles.subtitle}>
            We'll use their age to show what it'll cost when they're ready.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="child's name"
            placeholderTextColor="#9CA3AF"
            value={childName}
            onChangeText={handleChildNameChange}
            autoCapitalize="words"
          />

          {matchedChild && (
            <Text style={styles.matchHint}>Using {matchedChild.firstName}'s profile</Text>
          )}

          {isNewChild && (
            <TextInput
              style={[styles.input, styles.inputSpaced]}
              placeholder="dd/mm/yyyy"
              placeholderTextColor="#9CA3AF"
              value={dob}
              onChangeText={(raw) => setDob(formatDobInput(dob, raw))}
              keyboardType="numeric"
              maxLength={10}
            />
          )}

          {submitError ? (
            <Text style={styles.errorText}>{submitError}</Text>
          ) : null}

          <View style={styles.spacer} />
          <View style={styles.buttonWrapper}>
            <Button
              title="Calculate"
              loading={isSubmitting}
              onPress={handleContinue}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
  },
  scroller: {
    borderRadius: 20,
    overflow: "hidden",
  },
  card: {
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(40,72,241,0.10)",
    padding: 24,
    flexDirection: "column",
  },
  spacer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  tag: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2848F1",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  step: {
    fontSize: 11,
    fontWeight: "500",
    color: "#9CA3AF",
    letterSpacing: 0.4,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 24,
  },
  or: {
    textAlign: "center",
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
    marginVertical: 10,
  },
  input: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#EBEBEB",
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#111111",
    marginBottom: 12,
  },
  inputSpaced: {
    marginTop: 4,
  },
  matchHint: {
    fontSize: 12,
    color: "#2848F1",
    marginTop: -6,
    marginBottom: 12,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 13,
    color: "#EF4444",
    marginBottom: 8,
    marginLeft: 4,
  },
  buttonWrapper: {
    marginTop: 8,
  },
});
