import { ThemedText } from "@/components/ThemedText";
import { Button } from "@ui-kitten/components";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface FooterActionsProps {
  onInvestPress?: () => void;
  onReturnLaterPress?: () => void;
  disabled?: boolean;
}

export function FooterActions({
  onInvestPress,
  onReturnLaterPress,
  disabled,
}: FooterActionsProps) {
  const handleInvestPress = () => {
    if (onInvestPress) {
      onInvestPress();
    } else {
      // Default action - can be customized
      router.push("/payment");
    }
  };

  const handleReturnLater = () => {
    if (onReturnLaterPress) {
      onReturnLaterPress();
    } else {
      router.replace("/child");
    }
  };

  return (
    <View style={styles.footer}>
      <Button
        style={styles.investButton}
        onPress={handleInvestPress}
        disabled={disabled}
        size="large"
      >
        Continue
      </Button>
      <TouchableOpacity
        style={styles.returnLaterButton}
        onPress={handleReturnLater}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.returnLaterText}>Return later</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
  },
  investButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  returnLaterButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  returnLaterText: {
    color: "#9CA3AF",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
