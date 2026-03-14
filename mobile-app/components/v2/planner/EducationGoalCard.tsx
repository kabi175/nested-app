import React from "react";
import { StyleSheet, Text, View } from "react-native";
import GraduationCap from "@/assets/images/v2/planner/graduation-cap.svg";

interface EducationGoalCardProps {
  year?: number; // default: 2037
  amount?: string; // default: "₹48.6L"
  collegeType?: string; // default: "Top College (IIT/NIT/Private)"
  yearsFromNow?: number; // default: 12
}

/**
 * Reusable BulletSeparator sub-component
 */
const BulletSeparator = () => (
  <Text style={styles.bulletSeparator}>•</Text>
);

/**
 * EducationGoalCard component
 * Matches the design specs exactly:
 * - Rounded card with vivid blue/indigo background (#3D3DE8)
 * - Row layout with two sections (Left: text info, Right: graduation cap)
 */
export const EducationGoalCard: React.FC<EducationGoalCardProps> = ({
  year = 2037,
  amount = "₹48.6L",
  collegeType = "Top College (IIT/NIT/Private)",
  yearsFromNow = 12,
}) => {
  return (
    <View style={styles.card}>
      {/* Left Section: Information */}
      <View style={styles.leftView}>
        {/* Top row: Label and Year */}
        <View style={styles.topRow}>
          <Text style={styles.smallText}>INFLATION ADJUSTED GOAL</Text>
          <BulletSeparator />
          <Text style={styles.smallText}>{year}</Text>
        </View>

        {/* Amount row: Large Goal Amount */}
        <View style={styles.amountRow}>
          <Text style={styles.amountText}>{amount}</Text>
        </View>

        {/* Bottom row: College Type and Timeframe */}
        <View style={styles.bottomRow}>
          <Text style={styles.detailText}>{collegeType}</Text>
          <BulletSeparator />
          <Text style={styles.detailText}>{yearsFromNow} years from now</Text>
        </View>
      </View>

      {/* Right Section: Visual Asset */}
      <View style={styles.rightView}>
        <GraduationCap width={90} height={90} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 340,
    height: 110,
    backgroundColor: "#3D3DE8",
    borderRadius: 16,
    flexDirection: "row",
    padding: 16,
    // iOS Shadow for card lift
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    // Android Shadow for card lift
    elevation: 6,
  },
  leftView: {
    flex: 1,
    justifyContent: "space-between",
  },
  rightView: {
    width: 100,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  amountRow: {
    // Row exists for layout structure
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  smallText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.2,
    opacity: 0.75,
    textTransform: "uppercase",
  },
  amountText: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "800",
    lineHeight: 48, // Added to prevent clipping of large font
  },
  detailText: {
    color: "#FFFFFF",
    fontSize: 12,
    opacity: 0.85,
  },
  bulletSeparator: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
    opacity: 0.75,
    marginHorizontal: 6,
  },
});
