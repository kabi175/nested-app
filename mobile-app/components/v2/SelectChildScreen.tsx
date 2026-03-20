import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useChildren } from "@/hooks/useChildren";
import type { Child } from "@/types/child";
import { StatusBar } from "expo-status-bar";
import Button from "./Button";
import ChildChip from "./ChildChip";
import NestEggs from "./NestEggs";

// ─── Colour palette ──────────────────────────────────────────────────────────
const EGG_COLORS = ["#ffd98f", "#6eafee", "#E27BA6"] as const;
const MAX_CHILDREN = 3;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getAge(dob: Date): number {
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface SelectChildScreenProps {
  /** Called when the user taps "Add child". */
  onAddChild?: () => void;
  /** Called when continuing with the selected child. */
  onContinue?: (childId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SelectChildScreen({
  onAddChild,
  onContinue,
}: SelectChildScreenProps) {
  const { data: children = [], isLoading } = useChildren();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  if (isLoading && children.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#4F8BD6" />
      </SafeAreaView>
    );
  }

  const hideAddChild = children.length === 1 || children.length >= MAX_CHILDREN;

  // Map children to nest-egg data with assigned colours
  const nestChildren = useMemo(
    () =>
      children.slice(0, MAX_CHILDREN).map((c: Child, i: number) => ({
        id: c.id,
        color: EGG_COLORS[i % EGG_COLORS.length],
      })),
    [children]
  );

  React.useEffect(() => {
    if (children.length === 1 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const canAddChild = children.length < MAX_CHILDREN;
  const canContinue = selectedChildId !== null;

  const selectedChild = children.find((c) => c.id === selectedChildId) ?? children[0];
  const displayName = selectedChild?.firstName ?? "";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <View style={styles.root}>
        {/* ── Header ────────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={22} color="#1A1A1A" />
          </Pressable>

          <Text style={styles.title}>
            {displayName}’s future starts today
          </Text>
          <Text style={styles.subtitle}>Let's figure out what it needs</Text>
        </View>

        {/* ── Nest illustration area ────────────────────────── */}
        <View style={styles.nestArea}>
          {children.length > 0 ? (
            <NestEggs
              children={nestChildren}
              selectedChildId={selectedChildId}
              onSelectChild={setSelectedChildId}
            />
          ) : (
            <Text style={styles.emptyText}>No children added yet.</Text>
          )}

          {/* ── Child chips ───────────────────────────────────── */}
          {children.length > 0 && (
            <View style={styles.chipsContainer}>
              {children.slice(0, MAX_CHILDREN).map((child: Child) => (
                <ChildChip
                  key={child.id}
                  name={child.firstName}
                  age={getAge(child.dateOfBirth)}
                  selected={selectedChildId === child.id}
                  onPress={() => setSelectedChildId(child.id)}
                />
              ))}
            </View>
          )}
        </View>

        {/* ── Buttons ───────────────────────────────────────── */}
        <View style={styles.buttonsContainer}>
          {/* Add child — outlined */}
          {hideAddChild ? (
            <View style={styles.dashedBox}>
              <Text style={styles.dashedBoxText}>
                Got another little one? You can add them after {displayName}’s nest is ready
              </Text>
            </View>
          ) : (
            <Pressable
              onPress={canAddChild ? onAddChild : undefined}
              style={[
                styles.addChildButton,
                !canAddChild && styles.addChildButtonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canAddChild }}
            >
              <Text
                style={[
                  styles.addChildLabel,
                  !canAddChild && styles.addChildLabelDisabled,
                ]}
              >
                Add child
              </Text>
            </Pressable>
          )}

          {/* Continue — primary */}
          <Button
            title="Continue"
            disabled={!canContinue}
            onPress={() => {
              if (selectedChildId) onContinue?.(selectedChildId);
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  root: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },

  // Header
  header: {
    marginBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#7A7A7A",
    lineHeight: 20,
  },

  // Chips
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    marginBottom: 8,
    width: "100%",
    paddingHorizontal: 16,
  },

  // Nest area
  nestArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#999",
  },

  // Buttons
  buttonsContainer: {
    gap: 12,
    paddingTop: 8,
  },
  addChildButton: {
    width: "100%",
    height: 55,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#D4D4D4",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  addChildButtonDisabled: {
    borderColor: "#E8E8E8",
    backgroundColor: "#F8F8F8",
  },
  addChildLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  addChildLabelDisabled: {
    color: "#C0C0C0",
  },
  dashedBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D4D4D4",
    backgroundColor: "#F8F8F8",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  dashedBoxText: {
    fontSize: 13,
    color: "#1A1A1A",
    textAlign: "center",
    lineHeight: 18,
  },
});
