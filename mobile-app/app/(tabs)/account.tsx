import { userAtom } from "@/atoms/user";
import { ThemedText } from "@/components/ThemedText";
import { useSignOut } from "@/hooks/auth";
import { useUser } from "@/hooks/useUser";
import { clearNomineeAtoms } from "@/utils/nominee";
import { openWhatsApp } from "@/utils/whtsapp";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useSetAtom } from "jotai";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  borderColor: string;
  onPress: () => void;
  isDestructive?: boolean;
}

export default function AccountScreen() {
  const { data: user } = useUser();
  const { signOut } = useSignOut();
  const queryClient = useQueryClient();
  const setUser = useSetAtom(userAtom);
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              console.log("Signed out successfully");
              queryClient.clear();
              setUser(null);
              clearNomineeAtoms();
              router.replace("/sign-in");
            } catch (error) {
              console.log("Error", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const menuItems: MenuItem[] = [
    // {
    //   id: "modify-goals",
    //   title: "Modify Goals",
    //   icon: "star-outline",
    //   iconColor: "#EC4899",
    //   borderColor: "#EC4899",
    //   onPress: () => console.log("Modify Goals pressed"),
    // },
    {
      id: "orders",
      title: "Orders",
      icon: "document-text-outline",
      iconColor: "#F59E0B",
      borderColor: "#F59E0B",
      onPress: () => router.push("/orders"),
    },
    {
      id: "manage-sips",
      title: "Manage SIPs",
      icon: "refresh-outline",
      iconColor: "#06B6D4",
      borderColor: "#06B6D4",
      onPress: () => router.push("/sip"),
    },
    {
      id: "manage-bank-accounts",
      title: "Manage Bank Accounts",
      icon: "card-outline",
      iconColor: "#F59E0B",
      borderColor: "#F59E0B",
      onPress: () => router.push("/bank-accounts/list"),
    },
    {
      id: "manage-nominee",
      title: "Manage Nominee",
      icon: "person-outline",
      iconColor: "#8B5CF6",
      borderColor: "#8B5CF6",
      onPress: () => router.push("/nominees"),
    },
    // {
    //   id: "refer-friend",
    //   title: "Refer a Friend",
    //   icon: "people-outline",
    //   iconColor: "#8B5CF6",
    //   borderColor: "#8B5CF6",
    //   onPress: () => console.log("Refer a Friend pressed"),
    // },
    {
      id: "share-feedback",
      title: "Share Feedback",
      icon: "chatbubble-outline",
      iconColor: "#3B82F6",
      borderColor: "#3B82F6",
      onPress: () => openWhatsApp("916305209273", "Hello 👋"),
    },
    {
      id: "support",
      title: "Support",
      icon: "help-circle-outline",
      iconColor: "#10B981",
      borderColor: "#10B981",
      onPress: () => openWhatsApp("916305209273", "Hello 👋"),
    },
    {
      id: "logout",
      title: "Logout",
      icon: "log-out-outline",
      iconColor: "#EF4444",
      borderColor: "#EF4444",
      onPress: handleLogout,
      isDestructive: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Account</ThemedText>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileContent}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(user?.firstName || "User")}
                </Text>
              </View>
            </View>

            {/* User Details */}
            <View style={styles.userDetails}>
              <ThemedText style={styles.userName}>
                {user?.firstName || "User"}
              </ThemedText>
              {user?.email && (
                <ThemedText style={styles.userEmail}>{user?.email}</ThemedText>
              )}
              {user?.phone_number && (
                <ThemedText style={styles.userPhone}>
                  {user?.phone_number}
                </ThemedText>
              )}
            </View>

            {/** TODO: add edit profile */}
            {/* Edit Icon */}
            {/* <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push("/user")}
              activeOpacity={0.7}
            >
              <SquarePen size={20} color="#6B7280" />
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, { borderLeftColor: item.borderColor }]}
              onPress={item.onPress}
              activeOpacity={0.8}
            >
              <View style={styles.menuItemContent}>
                {/* Icon */}
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={item.iconColor}
                  style={styles.icon}
                />

                {/* Title */}
                <Text
                  style={[
                    styles.menuItemTitle,
                    item.isDestructive && styles.destructiveText,
                  ]}
                >
                  {item.title}
                </Text>

                {/* Chevron */}
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={item.isDestructive ? "#EF4444" : "#9CA3AF"}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Version Number */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>
            Version {Constants.expoConfig?.version || "1.0.0"}
          </Text>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: "#6B7280",
  },
  editButton: {
    padding: 8,
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderLeftWidth: 4,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  icon: {
    marginRight: 16,
  },
  menuItemTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  destructiveText: {
    color: "#EF4444",
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  versionText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  bottomSpacing: {
    height: 20,
  },
});
