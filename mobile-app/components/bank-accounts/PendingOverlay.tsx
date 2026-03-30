import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export function PendingOverlay() {
  return (
    <View style={styles.overlay} pointerEvents="auto">
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#2848F1" />
        <Text style={styles.title}>Waiting for bank verification…</Text>
        <Text style={styles.subtitle}>
          This can take a few seconds. Please keep this screen open.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.25)",
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  title: {
    marginTop: 12,
    fontSize: 15,
    fontFamily: "InstrumentSans_500Medium",
    color: "#0F172A",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: "InstrumentSans_400Regular",
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
  },
});
