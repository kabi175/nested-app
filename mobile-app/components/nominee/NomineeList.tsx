import { DraftNomineeCard } from "@/components/nominee/DraftNomineeCard";
import { NomineeCard } from "@/components/nominee/NomineeCard";
import type { Nominee, NomineeDraft } from "@/types/nominee";
import React from "react";
import { FlatList, StyleSheet } from "react-native";

type NomineeListItem =
  | { type: "existing"; nominee: Nominee; id: string }
  | { type: "draft"; nominee: NomineeDraft; id: string; index: number };

interface NomineeListProps {
  existingNominees: Nominee[];
  draftNominees: NomineeDraft[];
  onEditNominee: (id: number) => void;
  onEditDraft: (index: number) => void;
  onDeleteDraft: (index: number) => void;
  onOptOut: (id: number) => void;
}

export function NomineeList({
  existingNominees,
  draftNominees,
  onEditNominee,
  onEditDraft,
  onDeleteDraft,
  onOptOut,
}: NomineeListProps) {
  const items: NomineeListItem[] = [
    ...existingNominees.map((n) => ({
      type: "existing" as const,
      nominee: n,
      id: n.id.toString(),
    })),
    ...draftNominees.map((n, idx) => ({
      type: "draft" as const,
      nominee: n,
      id: `draft-${idx}`,
      index: idx,
    })),
  ];

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        if (item.type === "draft") {
          return (
            <DraftNomineeCard
              draft={item.nominee}
              index={item.index}
              onEdit={() => onEditDraft(item.index)}
              onDelete={() => onDeleteDraft(item.index)}
            />
          );
        } else {
          return (
            <NomineeCard
              nominee={item.nominee}
              onEdit={() => onEditNominee(item.nominee.id)}
              onOptOut={() => onOptOut(item.nominee.id)}
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

