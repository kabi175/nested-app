import { ThemedText } from "@/components/ThemedText";
import * as Haptics from "expo-haptics";
import { Edit3, Trash2 } from "lucide-react-native";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface GoalFormHeaderProps {
  title: string;
  isEditing: boolean;
  onTitleChange: (title: string) => void;
  onEditToggle: () => void;
  onDelete: () => void;
}

export function GoalFormHeader({
  title,
  isEditing,
  onTitleChange,
  onEditToggle,
  onDelete,
}: GoalFormHeaderProps) {
  return (
    <View style={styles.goalHeader}>
      <View style={styles.goalTitleContainer}>
        {isEditing ? (
          <TextInput
            style={styles.goalTitleInput}
            value={title}
            onChangeText={onTitleChange}
            onBlur={onEditToggle}
            autoFocus
            placeholder="Enter goal title"
            placeholderTextColor="#9CA3AF"
          />
        ) : (
          <ThemedText style={styles.goalTitle}>{title}</ThemedText>
        )}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onEditToggle();
          }}
        >
          <Edit3 size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Trash2 size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  goalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginRight: 8,
    flex: 1,
  },
  goalTitleInput: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginRight: 8,
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#2563EB",
  },
  editButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 8,
  },
});

