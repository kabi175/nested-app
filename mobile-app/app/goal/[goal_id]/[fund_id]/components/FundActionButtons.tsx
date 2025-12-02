import { ThemedText } from "@/components/ThemedText";
import { MoreVertical } from "lucide-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface FundActionButtonsProps {
  onInvestPress: () => void;
  onMorePress: () => void;
}

export function FundActionButtons({
  onInvestPress,
  onMorePress,
}: FundActionButtonsProps) {
  return (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity style={styles.investButton} onPress={onInvestPress}>
        <ThemedText style={styles.investButtonText}>Invest</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity style={styles.moreButton} onPress={onMorePress}>
        <MoreVertical size={20} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  investButton: {
    flex: 1,
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  investButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  moreButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
});

