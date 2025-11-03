import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface SearchableDropdownProps<T> {
  data: T[];
  labelKey: keyof T;
  valueKey: keyof T;
  placeholder?: string;
  onSelect: (item: T) => void;
  selectedValue?: T | null;
  searchPlaceholder?: string;
}

export function SearchableDropdown<T extends Record<string, any>>({
  data,
  labelKey,
  valueKey,
  placeholder = "Select an option",
  onSelect,
  selectedValue,
  searchPlaceholder = "Search...",
}: SearchableDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const filteredData = data.filter((item) =>
    String(item[labelKey]).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (item: T) => {
    onSelect(item);
    setIsOpen(false);
    setSearchQuery("");
  };

  const getDisplayValue = () => {
    if (!selectedValue) return placeholder;
    return String(selectedValue[labelKey]);
  };

  return (
    <>
      {/* Dropdown Button */}
      <TouchableOpacity
        style={styles.dropdownField}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dropdownText,
            !selectedValue && styles.dropdownPlaceholder,
          ]}
          numberOfLines={1}
        >
          {getDisplayValue()}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      {/* Modal with Search */}
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{placeholder}</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsOpen(false);
                  setSearchQuery("");
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                ref={inputRef}
                style={styles.searchInput}
                placeholder={searchPlaceholder}
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {/* Results List */}
            <FlatList
              data={filteredData}
              keyExtractor={(item) => String(item[valueKey])}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.listItemText}>
                    {String(item[labelKey])}
                  </Text>
                  {selectedValue &&
                    selectedValue[valueKey] === item[valueKey] && (
                      <Ionicons name="checkmark" size={20} color="#2563EB" />
                    )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No results found</Text>
                </View>
              }
              style={styles.list}
              contentContainerStyle={styles.listContent}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dropdownField: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 52,
  },
  dropdownText: {
    fontSize: 16,
    color: "#1F2937",
    flex: 1,
    marginRight: 8,
  },
  dropdownPlaceholder: {
    color: "#6B7280",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingTop: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    marginLeft: 8,
    padding: 0,
  },
  list: {
    marginTop: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  listItemText: {
    fontSize: 16,
    color: "#1F2937",
    flex: 1,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
});
