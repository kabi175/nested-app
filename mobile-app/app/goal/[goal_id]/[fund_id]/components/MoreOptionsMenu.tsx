import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";

interface MoreOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onInvest: () => void;
  onRedeem: () => void;
  onSTP: () => void;
  onSWP: () => void;
  onPauseSIP: () => void;
  onCancelSIP: () => void;
}

export function MoreOptionsMenu({
  visible,
  onClose,
  onInvest,
  onRedeem,
  onSTP,
  onSWP,
  onPauseSIP,
  onCancelSIP,
}: MoreOptionsMenuProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuInvestButton} onPress={onInvest}>
            <ThemedText style={styles.menuInvestButtonText}>Invest</ThemedText>
          </TouchableOpacity>

          <ThemedView style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem} onPress={onRedeem}>
              <ThemedText style={styles.menuItemText}>Redeem</ThemedText>
            </TouchableOpacity>

            {/* <TouchableOpacity style={styles.menuItem} onPress={onSTP}>
              <ThemedText style={styles.menuItemText}>STP (Transfer)</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={onSWP}>
              <ThemedText style={styles.menuItemText}>SWP (Withdraw)</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={onPauseSIP}>
              <ThemedText style={styles.menuItemText}>Pause SIP</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemHighlighted]}
              onPress={onCancelSIP}
            >
              <ThemedText style={styles.menuItemText}>Cancel SIP</ThemedText>
            </TouchableOpacity> */}
          </ThemedView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  menuInvestButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  menuInvestButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemHighlighted: {
    backgroundColor: "#F3F4F6",
  },
  menuItemText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
});
