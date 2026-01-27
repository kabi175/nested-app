import { ThemedText } from "@/components/ThemedText";
import { Child } from "@/types/child";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

interface ChildSelectorProps {
  childList: Child[];
  selectedChildId: string | null;
  onSelectChild: (childId: string) => void;
}

export function ChildSelector({
  childList,
  selectedChildId,
  onSelectChild,
}: ChildSelectorProps) {
  const selectedChild = childList.find((child) => child.id === selectedChildId);

  if (childList.length === 0) {
    return (
      <View style={styles.emptyChildrenContainer}>
        <ThemedText style={styles.emptyChildrenText}>
          Add a child profile to start creating goals.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.childSelectorHeader}>
      <ThemedText style={styles.childGreeting}>
        {`Hi, let's set up education goals for ${selectedChild?.firstName || "Child"}`}
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.childPillsHeaderWrapper}
      >
        {childList.map((child) => {
          const isSelected = selectedChildId === child.id;
          const displayName = child.firstName || "Child";
          return (
            <TouchableOpacity
              key={child.id}
              style={[
                styles.childPill,
                isSelected && styles.childPillSelected,
              ]}
              onPress={() => onSelectChild(child.id)}
            >
              <ThemedText
                style={[
                  styles.childPillText,
                  isSelected && styles.childPillTextSelected,
                ]}
              >
                {displayName}
              </ThemedText>
            </TouchableOpacity>
          );
        })}

        {childList.length < 3 && (
          <TouchableOpacity
            style={[styles.childPill, styles.addChildPill]}
            onPress={() => router.push("/(tabs)/child/create")}
          >
            <ThemedText
              style={[styles.childPillText, { color: "#2563EB" }]}
            >
              + Add Child
            </ThemedText>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  childSelectorHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  childGreeting: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    lineHeight: 22,
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  childPillsHeaderWrapper: {
    paddingVertical: 8,
  },
  emptyChildrenContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyChildrenText: {
    fontSize: 16,
    color: "#6B7280",
  },
  addChildPill: {
    backgroundColor: "#FFFFFF",
    borderColor: "#BFDBFE",
  },
  childPill: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 9999,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "transparent",
    marginRight: 12,
    marginBottom: 12,
  },
  childPillSelected: {
    backgroundColor: "#DBEAFE",
    borderColor: "#2563EB",
    shadowColor: "#60A5FA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  childPillText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1D4ED8",
  },
  childPillTextSelected: {
    color: "#1E3A8A",
  },
});

