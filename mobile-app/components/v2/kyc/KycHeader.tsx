import { ChevronLeft } from "lucide-react-native";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface KycHeaderProps {
  title: string;
  current: number;
  total: number;
  onBack: () => void;
}

export default function KycHeader({
  title,
  current,
  total,
  onBack,
}: KycHeaderProps) {
  const pct = Math.round((current / total) * 100);

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={20} color="#222B45" />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>KYC Progress</Text>
          <Text style={styles.progressCount}>
            {current} of {total} done
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F7F9FC",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    color: "#222B45",
  },
  spacer: {
    width: 36,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: "#8F9BB3",
  },
  progressCount: {
    fontSize: 12,
    color: "#3366FF",
  },
  track: {
    height: 6,
    backgroundColor: "#EDF1F7",
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: "#3366FF",
  },
});
