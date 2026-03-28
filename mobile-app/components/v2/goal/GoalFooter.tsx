import Button from "@/components/v2/Button";
import OutlineButton from "@/components/v2/OutlineButton";
import React from "react";
import { StyleSheet, View } from "react-native";

interface GoalFooterProps {
  onAddLumpsum: () => void;
  onEditSip: () => void;
}

export default function GoalFooter({ onAddLumpsum, onEditSip }: GoalFooterProps) {
  return (
    <View style={styles.footer}>
      <Button title="Add lumpsum" onPress={onAddLumpsum} />
      <OutlineButton title="Edit SIP" onPress={onEditSip} />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    backgroundColor: "#FFFFFF",
    gap: 12,
  },
});
