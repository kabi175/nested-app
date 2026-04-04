import { Education } from "@/types/education";
import { ChevronDown, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";


// ─── Props ────────────────────────────────────────────────────────────────────
export interface CollegeDropdownProps {
  colleges?: Education[];
  selectedCollege: string | null;
  onSelectCollege: (college: string | null) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CollegeDropdown({
  colleges,
  selectedCollege,
  onSelectCollege,
}: CollegeDropdownProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const closeModal = () => {
    setModalVisible(false);
    setSearchQuery("");
  };

  const handleSelect = (college: string) => {
    onSelectCollege(college);
    closeModal();
  };

  return (
    <View style={styles.wrapper}>
      {/* Trigger */}
      <Pressable
        style={styles.trigger}
        onPress={() => setModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Pick a college"
      >
        <Text
          style={[
            styles.triggerText,
            !selectedCollege && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {selectedCollege ?? "pick a college"}
        </Text>
        <ChevronDown size={20} color="#7A7A7A" />
      </Pressable>

      {/* Modal picker */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a college</Text>
              <Pressable
                onPress={closeModal}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <X size={22} color="#1A1A1A" />
              </Pressable>
            </View>

            {/* Search */}
            <TextInput
              style={styles.searchInput}
              placeholder="Search colleges..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />

            {/* List */}
            <FlatList
              data={(colleges?.map((college) => college.name) || []).filter(
                (name) => name.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              keyExtractor={(_item, index) => index.toString()}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.optionRow,
                    selectedCollege === item && styles.optionRowSelected,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedCollege === item && styles.optionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },

  // Trigger button
  trigger: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  triggerText: {
    fontSize: 15,
    color: "#1A1A1A",
    flex: 1,
  },
  placeholderText: {
    color: "#9CA3AF",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
  },

  // List items
  optionRow: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  optionRowSelected: {
    backgroundColor: "#EEF0FD",
  },
  optionText: {
    fontSize: 15,
    color: "#1A1A1A",
  },
  optionTextSelected: {
    color: "#3137D5",
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginHorizontal: 20,
  },
  searchInput: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
    height: 44,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#1A1A1A",
    backgroundColor: "#FAFAFA",
  },
});
