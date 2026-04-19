import { IconWrapper } from "@/components/v2/profile/IconWrapper";
import { MenuRow } from "@/components/v2/profile/MenuRow";
import { ProfileAvatar } from "@/components/v2/profile/ProfileAvatar";
import { SectionHeader } from "@/components/v2/profile/SectionHeader";
import { useUser } from "@/hooks/useUser";
import { clearNomineeAtoms } from "@/utils/nominee";
import { openWhatsApp } from "@/utils/whtsapp";
import { useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { router } from "expo-router";
import {
  BarChart2,
  Headphones,
  Landmark,
  LogOut,
  Package,
  ShieldCheck,
  Users,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useAuth0 } from "react-native-auth0";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
  const { data: user } = useUser();
  const { clearCredentials } = useAuth0();
  const queryClient = useQueryClient();

  const [sipReminders, setSipReminders] = useState(false);
  const [milestoneAlerts, setMilestoneAlerts] = useState(false);
  const [marketUpdates, setMarketUpdates] = useState(false);

  const getKycSubtitle = () => {
    switch (user?.kycStatus) {
      case "completed":
        return "Verified";
      case "submitted":
        return "Pending";
      default:
        return "Incomplete";
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await clearCredentials();
              console.log("Signed out successfully");
              queryClient.clear();
              clearNomineeAtoms();
              router.replace("/sign-in");
            } catch (error) {
              console.log("Error during logout", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.headerTitle}>Profile</Text>

        {/* ACCOUNT */}
        <View style={styles.section}>
          <SectionHeader label="ACCOUNT" />
          <View style={styles.card}>
            <MenuRow
              left={<ProfileAvatar name={user?.firstName || "User"} />}
              title={user?.firstName || "User"}
            />
            <View style={styles.divider} />
            <MenuRow
              onPress={() => { }}
              left={
                <IconWrapper>
                  <ShieldCheck size={20} color="#6366F1" />
                </IconWrapper>
              }
              title="KYC Status"
              subtitle={getKycSubtitle()}
            />
            <View style={styles.divider} />
            <MenuRow
              onPress={() => router.push("/bank-accounts/list")}
              left={
                <IconWrapper>
                  <Landmark size={20} color="#6366F1" />
                </IconWrapper>
              }
              title="Bank accounts"
            />
          </View>
        </View>

        {/* FUNDS */}
        <View style={styles.section}>
          <SectionHeader label="FUNDS" />
          <View style={styles.card}>
            <MenuRow
              onPress={() => router.push("/nominees")}
              left={
                <IconWrapper>
                  <Users size={20} color="#6366F1" />
                </IconWrapper>
              }
              title="Manage Nominees"
            />
            <View style={styles.divider} />
            <MenuRow
              onPress={() => router.push("/sip")}
              left={
                <IconWrapper>
                  <BarChart2 size={20} color="#6366F1" />
                </IconWrapper>
              }
              title="Manage SIPs"
            />
          </View>
        </View>

        {/* NOTIFICATIONS */}
        <View style={styles.section}>
          <SectionHeader label="NOTIFICATIONS" />
          <View style={styles.card}>
            <MenuRow
              title="SIP reminders"
              right={
                <Switch
                  value={sipReminders}
                  onValueChange={setSipReminders}
                  trackColor={{ false: "#D1D5DB", true: "#6366F1" }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <View style={styles.fullDivider} />
            <MenuRow
              title="Milestones alerts"
              right={
                <Switch
                  value={milestoneAlerts}
                  onValueChange={setMilestoneAlerts}
                  trackColor={{ false: "#D1D5DB", true: "#6366F1" }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <View style={styles.fullDivider} />
            <MenuRow
              title="Market updates"
              right={
                <Switch
                  value={marketUpdates}
                  onValueChange={setMarketUpdates}
                  trackColor={{ false: "#D1D5DB", true: "#6366F1" }}
                  thumbColor="#FFFFFF"
                />
              }
            />
          </View>
        </View>

        {/* ORDERS */}
        <View style={styles.section}>
          <View style={styles.card}>
            <MenuRow
              onPress={() => router.push("/orders")}
              left={
                <IconWrapper>
                  <Package size={20} color="#6366F1" />
                </IconWrapper>
              }
              title="Orders"
              subtitle="View all your transactions"
            />
          </View>
        </View>

        {/* HELP & LOGOUT */}
        <View style={styles.section}>
          <View style={styles.card}>
            <MenuRow
              onPress={() => openWhatsApp("916305209273", "Hello 👋")}
              left={
                <IconWrapper>
                  <Headphones size={20} color="#6366F1" />
                </IconWrapper>
              }
              title="Help & support"
            />
          </View>
          <View style={[styles.card, { marginTop: 8 }]}>
            <MenuRow
              onPress={handleLogout}
              left={
                <IconWrapper bg="#FEF2F2">
                  <LogOut size={20} color="#EF4444" />
                </IconWrapper>
              }
              title="Log out"
              titleColor="#EF4444"
            />
          </View>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>
            Version {Constants.expoConfig?.version || "1.0.0"}
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    paddingVertical: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 68,
  },
  fullDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  versionText: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  bottomSpacing: {
    height: 20,
  },
});
