import { ThemedText } from "@/components/ThemedText";
import { ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface FundDetailHeaderProps {
  title: string;
}

export function FundDetailHeader({ title }: FundDetailHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <ArrowLeft size={24} color="#1F2937" />
      </TouchableOpacity>
      <ThemedText style={styles.headerTitle}>{title}</ThemedText>
      <View style={styles.backButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
    textAlign: "center",
  },
});

