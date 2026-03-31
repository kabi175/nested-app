import { Button } from "@ui-kitten/components";
import React from "react";
import { StyleSheet, View } from "react-native";

interface NomineeFooterProps {
  totalAllocation: number;
  draftNomineesCount: number;
  canAddMore: boolean;
  onSave: () => void;
  onAdd: () => void;
}

export function NomineeFooter({
  totalAllocation,
  draftNomineesCount,
  canAddMore,
  onSave,
  onAdd,
}: NomineeFooterProps) {
  const isComplete = totalAllocation === 100;

  return (
    <View style={styles.container}>
      <Button
        style={styles.button}
        status="primary"
        onPress={onSave}
        disabled={!isComplete}
        size="large"
      >
        {`Save ${draftNomineesCount} Nominee${draftNomineesCount > 1 ? "s" : ""}`}
      </Button>

      {canAddMore && (
        <Button
          style={styles.button}
          appearance="ghost"
          status="primary"
          onPress={onAdd}
          size="large"
        >
          Add another Nominee
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  button: {
    borderRadius: 12,
    width: "100%",
  },
});
