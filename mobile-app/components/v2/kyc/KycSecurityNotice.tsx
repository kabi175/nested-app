import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function KycSecurityNotice() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Your data is end-to-end encrypted and stored securely.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#C5CEE0",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#6F85F50F"
  },
  text: {
    fontSize: 12,
    color: "#8F9BB3",
    textAlign: "center",
  },
});
