import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Nominee } from "@/types/nominee";
import { calculateIsMinor, getRelationshipLabel } from "@/utils/nominee";
import { Card, Modal, Text } from "@ui-kitten/components";
import { Edit2, LogOut, MoreVertical, User } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface NomineeCardProps {
  nominee: Nominee;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * Nominee Card Component
 * Displays nominee information with allocation progress bar
 */
export function NomineeCard({ nominee, onEdit, onDelete }: NomineeCardProps) {
  const isMinor = calculateIsMinor(nominee.dob);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card style={styles.card} disabled>
      <View style={styles.cardContent}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <User size={24} color="#7C3AED" />
        </View>

        {/* Nominee Info */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text category="s1" style={styles.name}>
              {nominee.name}
            </Text>
            {isMinor && (
              <View style={styles.minorBadge}>
                <Text category="c2" style={styles.minorBadgeText}>
                  Minor
                </Text>
              </View>
            )}
          </View>
          <Text category="p2" style={styles.relationship}>
            {getRelationshipLabel(nominee.relationship)}
          </Text>

          {/* Allocation */}
          <View style={styles.allocationContainer}>
            <Text category="c1" style={styles.allocationLabel}>
              Allocation
            </Text>
            <View style={styles.allocationBarContainer}>
              <View style={styles.progressBarWrapper}>
                <ProgressBar
                  progress={nominee.allocation / 100}
                  color="#7C3AED"
                  backgroundColor="#E5E7EB"
                  height={8}
                />
              </View>
              <Text category="s2" style={styles.allocationPercentage}>
                {nominee.allocation}%
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowMenu(true)}
              activeOpacity={0.7}
            >
              <MoreVertical size={20} color="#6B7280" />
            </TouchableOpacity>

            {/* Action Menu Modal */}
            <Modal
              visible={showMenu}
              backdropStyle={styles.backdrop}
              onBackdropPress={() => setShowMenu(false)}
            >
              <Card style={styles.menuCard} disabled>
                {onEdit && (
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setShowMenu(false);
                      onEdit();
                    }}
                    activeOpacity={0.7}
                  >
                    <Edit2 size={20} color="#2563EB" />
                    <Text category="s1" style={styles.menuItemText}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                )}
                {onDelete && (
                  <TouchableOpacity
                    style={[styles.menuItem, styles.menuItemDestructive]}
                    onPress={() => {
                      setShowMenu(false);
                      onDelete();
                    }}
                    activeOpacity={0.7}
                  >
                    <LogOut size={20} color="#EF4444" />
                    <Text category="s1" style={styles.menuItemTextDestructive}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                )}
              </Card>
            </Modal>
          </>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  minorBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  minorBadgeText: {
    color: "#92400E",
    fontWeight: "600",
    fontSize: 10,
  },
  relationship: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  allocationContainer: {
    marginTop: 4,
  },
  allocationLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },
  allocationBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBarWrapper: {
    flex: 1,
  },
  allocationPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7C3AED",
    minWidth: 40,
    textAlign: "right",
  },
  menuButton: {
    padding: 8,
    marginLeft: 8,
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menuCard: {
    minWidth: 200,
    borderRadius: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  menuItemDestructive: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 4,
    paddingTop: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: "#1F2937",
  },
  menuItemTextDestructive: {
    fontSize: 16,
    color: "#EF4444",
  },
});
