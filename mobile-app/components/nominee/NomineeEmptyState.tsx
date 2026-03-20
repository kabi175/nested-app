import NomineeSvg from "@/assets/images/v2/nominee.svg";
import Button from "@/components/v2/Button";
import OutlineButton from "@/components/v2/OutlineButton";
import { useUser } from "@/hooks/useUser";
import { Ionicons } from "@expo/vector-icons";
import { Text, useTheme } from "@ui-kitten/components";
import React from "react";
import { StyleSheet, View } from "react-native";

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

  const primaryColor = theme["color-primary-500"] || "#7C3AED";

  if (hasOptedOut) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.centerArea}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={48} color={primaryColor} />
          </View>
          <Text category="h6" style={styles.title}>
            You have opted out of nominee nomination
          </Text>
          <Text category="p1" style={styles.description}>
            You can always add it later.
          </Text>
        </View>
        <View style={styles.bottomArea}>
          <Button title="Add Nominee" onPress={onAddPress} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.centerArea}>
        <NomineeSvg width={130} height={130} />
        <Text category="p1" style={styles.description}>
          Add nominees to ensure your investments reach your loved ones
        </Text>
      </View>

      <View style={styles.bottomArea}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>You're free to add any nominees later.</Text>
        </View>
        <Button title="Add your First Nominee" onPress={onAddPress} />
        {onOptOut && (
          <View style={styles.outlineButtonWrapper}>
            <OutlineButton title="Not sure yet" onPress={onOptOut} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 20,
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 0,
  },
  description: {
    fontSize: 16,
    color: "#1A1A1A",
    textAlign: "center",
    lineHeight: 24,
  },
  infoBox: {
    width: "100%",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: "center",
    backgroundColor: "#6F85F50F",
  },
  infoText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
  outlineButtonWrapper: {
    marginTop: 12,
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
    textAlign: "center",
  },
});
