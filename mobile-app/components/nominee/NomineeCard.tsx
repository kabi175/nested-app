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

export function NomineeCard({ nominee, onEdit, onDelete }: NomineeCardProps) {
  const isMinor = calculateIsMinor(nominee.dob);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card style={styles.card} disabled>
      {/* Top row: avatar + name/relationship + menu */}
      <View style={styles.topRow}>
        <View style={styles.iconContainer}>
          <User size={22} color="#7C3AED" />
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{nominee.name}</Text>
            {isMinor && (
              <View style={styles.minorBadge}>
                <Text style={styles.minorBadgeText}>Minor</Text>
              </View>
            )}
          </View>
          <Text style={styles.relationship}>
            {getRelationshipLabel(nominee.relationship)}
          </Text>
        </View>

        {(onEdit || onDelete) && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowMenu(true)}
            activeOpacity={0.7}
          >
            <MoreVertical size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Allocation progress */}
      <View style={styles.allocationSection}>
        <ProgressBar
          progress={nominee.allocation / 100}
          color="#4F46E5"
          backgroundColor="#E5E7EB"
          height={6}
        />
        <Text style={styles.allocationText}>{nominee.allocation}% allocated</Text>
      </View>

      {/* Context menu modal */}
      {(onEdit || onDelete) && (
        <Modal
          visible={showMenu}
          backdropStyle={styles.backdrop}
          onBackdropPress={() => setShowMenu(false)}
        >
          <Card style={styles.menuCard} disabled>
            {onEdit && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { setShowMenu(false); onEdit(); }}
                activeOpacity={0.7}
              >
                <Edit2 size={20} color="#2563EB" />
                <Text style={styles.menuItemText}>Edit</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemDestructive]}
                onPress={() => { setShowMenu(false); onDelete(); }}
                activeOpacity={0.7}
              >
                <LogOut size={20} color="#EF4444" />
                <Text style={styles.menuItemTextDestructive}>Delete</Text>
              </TouchableOpacity>
            )}
          </Card>
        </Modal>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
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
    fontSize: 13,
    color: "#6B7280",
  },
  menuButton: {
    padding: 4,
    marginLeft: 4,
  },
  allocationSection: {
    gap: 6,
  },
  allocationText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
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
    fontSize: 15,
    color: "#1F2937",
  },
  menuItemTextDestructive: {
    fontSize: 15,
    color: "#EF4444",
  },
});
