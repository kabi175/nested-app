import { ThemedText } from "@/components/ThemedText";
import { Education } from "@/types/education";
import { ChevronDown, Search, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  TextInput,
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
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<TextInput>(null);

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return options;
    }
    const query = searchQuery.toLowerCase().trim();
    return options.filter((option) =>
      option.name.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  // Clear search when dropdown is closed
  useEffect(() => {
    if (!isExpanded) {
      setSearchQuery("");
    }
  }, [isExpanded]);

  // Focus search input when dropdown expands
  useEffect(() => {
    if (isExpanded && !isLoading && searchInputRef.current) {
      // Small delay to ensure the input is rendered
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isExpanded, isLoading]);

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
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2563EB" />
              <ThemedText style={styles.loadingText}>
                Loading options...
              </ThemedText>
            </View>
          ) : (
            <>
              {/* Search Input */}
              <View style={styles.searchContainer}>
                <Search size={18} color="#9CA3AF" />
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Search options..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <X size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Options List */}
              {filteredOptions.length > 0 ? (
                <ScrollView
                  nestedScrollEnabled
                  style={styles.optionsList}
                  contentContainerStyle={styles.optionsListContent}
                  keyboardShouldPersistTaps="handled"
                >
                  {filteredOptions.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.dropdownOption}
                      onPress={() => {
                        onSelect(item);
                        onToggle();
                        setSearchQuery("");
                      }}
                      activeOpacity={0.7}
                    >
                      <ThemedText style={styles.dropdownOptionText}>
                        {item.name}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyContainer}>
                  <ThemedText style={styles.emptyText}>
                    No options found
                  </ThemedText>
                </View>
              )}
            </>
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
    maxHeight: 300,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 0,
  },
  optionsList: {
    maxHeight: 240,
  },
  optionsListContent: {
    paddingBottom: 0,
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
  loadingContainer: {
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
});
