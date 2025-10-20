import { ThemedText } from "@/components/ThemedText";
import { useAuth, useSignOut } from "@/hooks/auth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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
  gradientColors: string[];
  onPress: () => void;
  isDestructive?: boolean;
}

export default function AccountScreen() {
  const auth = useAuth();
  const { signOut } = useSignOut();

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
            await signOut();
            router.replace("/sign-in");
          },
        },
      ],
      { cancelable: true }
    );
  };

  const menuItems: MenuItem[] = [
    {
      id: "modify-goals",
      title: "Modify Goals",
      icon: "star-outline",
      iconColor: "#3B82F6",
      gradientColors: ["#EC4899", "#F3E8FF"],
      onPress: () => console.log("Modify Goals pressed"),
    },
    {
      id: "orders",
      title: "Orders",
      icon: "document-text-outline",
      iconColor: "#10B981",
      gradientColors: ["#FDE047", "#D1FAE5"],
      onPress: () => console.log("Orders pressed"),
    },
    {
      id: "manage-sips",
      title: "Manage SIPs/SWPs/STPs",
      icon: "refresh-outline",
      iconColor: "#8B5CF6",
      gradientColors: ["#06B6D4", "#D1FAE5"],
      onPress: () => console.log("Manage SIPs pressed"),
    },
    {
      id: "manage-mandates",
      title: "Manage Mandates",
      icon: "card-outline",
      iconColor: "#F59E0B",
      gradientColors: ["#F59E0B", "#FCE7F3"],
      onPress: () => console.log("Manage Mandates pressed"),
    },
    {
      id: "refer-friend",
      title: "Refer a Friend",
      icon: "people-outline",
      iconColor: "#EC4899",
      gradientColors: ["#8B5CF6", "#FCE7F3"],
      onPress: () => console.log("Refer a Friend pressed"),
    },
    {
      id: "share-feedback",
      title: "Share Feedback",
      icon: "chatbubble-outline",
      iconColor: "#3B82F6",
      gradientColors: ["#3B82F6", "#F3E8FF"],
      onPress: () => console.log("Share Feedback pressed"),
    },
    {
      id: "support",
      title: "Support",
      icon: "help-circle-outline",
      iconColor: "#10B981",
      gradientColors: ["#10B981", "#DBEAFE"],
      onPress: () => console.log("Support pressed"),
    },
    {
      id: "logout",
      title: "Logout",
      icon: "log-out-outline",
      iconColor: "#EF4444",
      gradientColors: ["#EF4444", "#F59E0B"],
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
                  {getInitials(auth.user?.displayName || "User")}
                </Text>
              </View>
            </View>

            {/* User Details */}
            <View style={styles.userDetails}>
              <ThemedText style={styles.userName}>
                {auth.user?.displayName || "User"}
              </ThemedText>
              {auth.user?.email && (
                <ThemedText style={styles.userEmail}>
                  {auth.user?.email}
                </ThemedText>
              )}
              {auth.user?.phoneNumber && (
                <ThemedText style={styles.userPhone}>
                  {auth.user?.phoneNumber}
                </ThemedText>
              )}
            </View>

            {/* Edit Icon */}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push("/name-input")}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={item.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBorder}
              >
                <View style={styles.menuItemContent}>
                  {/* Icon */}
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name={item.icon}
                      size={24}
                      color={item.iconColor}
                    />
                  </View>

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
              </LinearGradient>
            </TouchableOpacity>
          ))}
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
    gap: 12,
  },
  menuItem: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gradientBorder: {
    padding: 3,
    borderRadius: 12,
  },
  menuItemContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 9,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
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
  bottomSpacing: {
    height: 20,
  },
});
