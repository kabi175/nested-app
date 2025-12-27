import { useUser } from "@/hooks/useUser";
import { Ionicons } from "@expo/vector-icons";
import { Button, Text, useTheme } from "@ui-kitten/components";
import { LinearGradient } from "expo-linear-gradient";
import { Heart } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

interface NomineeEmptyStateProps {
  onAddPress: () => void;
  onOptOut?: () => void;
}

export function NomineeEmptyState({
  onAddPress,
  onOptOut,
}: NomineeEmptyStateProps) {
  const { data: user } = useUser();
  const theme = useTheme();
  const hasOptedOut = user?.nominee_status === "opt_out";

  // Primary button text color (white for primary buttons)
  const primaryButtonTextColor = theme["text-control-color"] || "#FFFFFF";
  // Primary color for icons (purple theme)
  const primaryColor = theme["color-primary-500"] || "#7C3AED";

  if (hasOptedOut) {
    return (
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={48} color={primaryColor} />
          </View>
        </View>
        <Text category="h6" style={styles.title}>
          You have opted out of nominee nomination
        </Text>
        <Text category="p1" style={styles.description}>
          You can always add it later.
        </Text>
        <Button
          style={styles.addButton}
          status="primary"
          onPress={onAddPress}
          size="large"
          accessoryLeft={() => (
            <Ionicons name="add" size={20} color={primaryButtonTextColor} />
          )}
        >
          Add Nominee
        </Button>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Shield Icon with Gradient Background */}
      <View style={styles.shieldContainer}>
        <LinearGradient
          colors={["#7C3AED", "#A855F7", "#C084FC"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.shieldGradient}
        >
          <View style={styles.shieldIconInner}>
            <Ionicons name="shield-outline" size={72} color="#FFFFFF" />
          </View>
        </LinearGradient>
        {/* Small Heart Icon Overlapping */}
        <View style={styles.heartContainer}>
          <View style={styles.heartCircle}>
            <Heart size={24} color="#10B981" strokeWidth={2.5} />
          </View>
        </View>
      </View>

      {/* Heading */}
      <Text category="h4" style={styles.heading}>
        Protect Your Legacy
      </Text>

      {/* Descriptive Text */}
      <Text category="p1" style={styles.description}>
        Add nominees to ensure your investments{"\n"}reach your loved ones
      </Text>

      {/* Secondary Text */}
      <Text category="s1" style={styles.secondaryText}>
        You can always skip this step and add nominees later.
      </Text>

      {/* Add Button */}
      <Button
        style={styles.addButton}
        status="primary"
        onPress={onAddPress}
        size="large"
        accessoryLeft={() => (
          <Ionicons name="add" size={20} color={primaryButtonTextColor} />
        )}
      >
        Add Your First Nominee
      </Button>

      {/* Opt Out Link */}
      {onOptOut && (
        <TouchableOpacity
          style={styles.optOutButton}
          onPress={onOptOut}
          activeOpacity={0.7}
        >
          <Text style={styles.optOutText}>Opt out</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: "#FFFFFF",
  },
  shieldContainer: {
    marginBottom: 32,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  shieldGradient: {
    width: 140,
    height: 140,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  shieldIconInner: {
    justifyContent: "center",
    alignItems: "center",
  },
  heartContainer: {
    position: "absolute",
    bottom: -8,
    right: -8,
  },
  heartCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#D1FAE5",
    shadowColor: "#10B981",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#000000",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 24,
  },
  secondaryText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  addButton: {
    width: "100%",
    borderRadius: 12,
    marginBottom: 16,
  },
  optOutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  optOutText: {
    color: "#000000",
    fontSize: 16,
    textAlign: "center",
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
    textAlign: "center",
  },
});
