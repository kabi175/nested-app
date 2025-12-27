import { NomineeCard } from "@/components/nominee/NomineeCard";
import type { NomineeDraft } from "@/types/nominee";
import { Card, Text } from "@ui-kitten/components";
import React from "react";
import { StyleSheet, View } from "react-native";

interface DraftNomineeCardProps {
  draft: NomineeDraft;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function DraftNomineeCard({
  draft,
  index,
  onEdit,
  onDelete,
}: DraftNomineeCardProps) {
  return (
    <View style={styles.wrapper}>
      <NomineeCard
        nominee={{
          id: index,
          name: draft.name,
          relationship: draft.relationship,
          dob: draft.dob,
          pan: draft.pan,
          email: draft.email,
          address: draft.address,
          allocation: draft.allocation,
          guardianName: draft.guardianName,
          guardianEmail: draft.guardianEmail,
          guardianPan: draft.guardianPan,
          guardianAddress: draft.guardianAddress,
        }}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <View style={styles.badge}>
        <Text category="c2" style={styles.badgeText}>
          Draft
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    marginBottom: 12,
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  badgeText: {
    color: "#92400E",
    fontWeight: "600",
    fontSize: 10,
  },
});

