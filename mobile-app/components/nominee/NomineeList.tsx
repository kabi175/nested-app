import { DraftNomineeCard } from "@/components/nominee/DraftNomineeCard";
import { NomineeCard } from "@/components/nominee/NomineeCard";
import type { Nominee, NomineeDraft } from "@/types/nominee";
import React from "react";
import { FlatList, StyleSheet } from "react-native";

interface NomineeListProps {
  nominees: (Nominee | NomineeDraft)[];
  onEditNominee: (index: number) => void;
  onDeleteNominee: (index: number) => void;
}

export function NomineeList({
  nominees,
  onEditNominee,
  onDeleteNominee,
}: NomineeListProps) {
  return (
    <FlatList
      data={nominees}
      keyExtractor={(item, index) =>
        item.id ? item.id.toString() : `draft-${index}`
      }
      renderItem={({ item, index }) => {
        if (item.id) {
          // Existing nominee (has id)
          return (
            <NomineeCard
              nominee={item as Nominee}
              onEdit={() => onEditNominee(index)}
            />
          );
        } else {
          // New nominee (no id - draft)
          return (
            <DraftNomineeCard
              draft={item as NomineeDraft}
              index={index}
              onEdit={() => onEditNominee(index)}
              onDelete={() => onDeleteNominee(index)}
            />
          );
        }
      }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 180, // Space for footer
  },
});
