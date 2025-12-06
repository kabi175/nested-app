import { ThemedText } from "@/components/ThemedText";
import { Education } from "@/types/education";
import { ChevronDown } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface EducationDropdownProps {
  label: string;
  selectedValue: string;
  options: Education[];
  isLoading: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: (education: Education) => void;
  goalId: string;
}

export function EducationDropdown({
  label,
  selectedValue,
  options,
  isLoading,
  isExpanded,
  onToggle,
  onSelect,
  goalId,
}: EducationDropdownProps) {
  return (
    <>
      <ThemedText style={styles.inputLabel}>{label}</ThemedText>
      <TouchableOpacity style={styles.dropdown} onPress={onToggle}>
        <ThemedText style={styles.dropdownText}>{selectedValue}</ThemedText>
        <ChevronDown size={20} color="#6B7280" />
      </TouchableOpacity>

      {isExpanded && (
        <Animated.View
          style={[
            styles.dropdownOptions,
            {
              opacity: isExpanded ? 1 : 0,
              transform: [
                {
                  translateY: isExpanded ? 0 : -10,
                },
              ],
            },
          ]}
        >
          {isLoading ? (
            <View style={styles.dropdownOption}>
              <ActivityIndicator size="small" color="#2563EB" />
            </View>
          ) : (
            options.map((option) => (
              <Animated.View
                key={option.id}
                style={{
                  opacity: isExpanded ? 1 : 0,
                  transform: [
                    {
                      translateX: isExpanded ? 0 : -20,
                    },
                  ],
                }}
              >
                <TouchableOpacity
                  style={styles.dropdownOption}
                  onPress={() => {
                    onSelect(option);
                    onToggle();
                  }}
                >
                  <ThemedText style={styles.dropdownOptionText}>
                    {option.name}
                  </ThemedText>
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  dropdown: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 16,
    color: "#1F2937",
  },
  dropdownOptions: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownOptionText: {
    fontSize: 16,
    color: "#1F2937",
  },
});

