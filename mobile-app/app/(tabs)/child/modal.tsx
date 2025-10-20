import { ThemedText } from "@/components/ThemedText";
import { useChildren } from "@/hooks/useChildren";
import { router } from "expo-router";
import { Baby } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChildListModal() {
  const { data: children, isLoading } = useChildren();

  const handleChildPress = (childId: string) => {
    router.push(`/child/${childId}/goal/create`);
  };

  const renderChildItem = ({ item: child }: { item: any }) => (
    <TouchableOpacity
      style={styles.childItem}
      onPress={() => handleChildPress(child.id)}
    >
      <View style={styles.childIcon}>
        <Baby size={20} color="#FFFFFF" />
      </View>
      <View style={styles.childInfo}>
        <ThemedText style={styles.childName}>
          {child.firstName} {child.lastName}
        </ThemedText>
        <ThemedText style={styles.childDetails}>
          {child.gender} • {new Date(child.dateOfBirth).getFullYear()}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  const modalContent = (
    <View style={styles.modalContainer}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Select Child</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Choose a child to create a goal for
        </ThemedText>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <ThemedText style={styles.loadingText}>
            Loading children...
          </ThemedText>
        </View>
      ) : children && children.length > 0 ? (
        <FlatList
          data={children}
          renderItem={renderChildItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>No children found</ThemedText>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.createChildButton}
          onPress={() => router.push("/child/create")}
        >
          <ThemedText style={styles.createChildButtonText}>
            Create New Child
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={() => router.back()}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>{modalContent}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "50%",
    backgroundColor: "#F8F7FF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  childItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  childIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  childDetails: {
    fontSize: 12,
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  footer: {
    padding: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  createChildButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  createChildButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
