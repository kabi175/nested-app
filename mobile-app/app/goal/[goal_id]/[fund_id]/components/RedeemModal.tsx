import { Holding } from "@/api/portfolioAPI";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { formatCurrency } from "@/utils/formatters";
import { X } from "lucide-react-native";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";

interface RedeemModalProps {
  visible: boolean;
  holding: Holding;
  units: number;
  step: "initial" | "mode";
  selectedMode: "units" | "amount" | "redeemAll" | null;
  onClose: () => void;
  onSpeakToRM: () => void;
  onProceed: () => void;
  onModeSelect: (mode: "units" | "amount" | "redeemAll") => void;
}

export function RedeemModal({
  visible,
  holding,
  units,
  step,
  selectedMode,
  onClose,
  onSpeakToRM,
  onProceed,
  onModeSelect,
}: RedeemModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.redeemModalOverlay}>
        <ThemedView style={styles.redeemModalContent}>
          {/* Header */}
          <View style={styles.redeemModalHeader}>
            <ThemedText style={styles.redeemModalTitle}>Redeem</ThemedText>
            <TouchableOpacity
              onPress={onClose}
              style={styles.redeemModalCloseButton}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Fund Name */}
          <ThemedText style={styles.redeemModalFundName}>
            {holding.fund}
          </ThemedText>

          {/* Holding Details */}
          <View style={styles.redeemHoldingDetails}>
            <View style={styles.redeemHoldingRow}>
              <ThemedText style={styles.redeemHoldingLabel}>
                Units Held
              </ThemedText>
              <ThemedText style={styles.redeemHoldingValue}>
                {units.toFixed(2)}
              </ThemedText>
            </View>
            <View style={styles.redeemHoldingRow}>
              <ThemedText style={styles.redeemHoldingLabel}>
                Amount Held
              </ThemedText>
              <ThemedText style={styles.redeemHoldingValue}>
                {formatCurrency(holding.current_value)}
              </ThemedText>
            </View>
          </View>

          {step === "initial" ? (
            <>
              {/* Motivational Message */}
              <ThemedText style={styles.redeemMessage}>
                Mutual funds work best long-term. Don&apos;t let short-term
                emotion or volatility disrupt your plan.
              </ThemedText>

              {/* Action Buttons */}
              <View style={styles.redeemActionButtons}>
                <TouchableOpacity
                  style={styles.redeemSpeakToRMButton}
                  onPress={onSpeakToRM}
                >
                  <ThemedText style={styles.redeemSpeakToRMButtonText}>
                    Speak to RM
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.redeemProceedButton}
                  onPress={onProceed}
                >
                  <ThemedText style={styles.redeemProceedButtonText}>
                    Proceed
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Motivational Message */}
              <ThemedText style={styles.redeemMessageItalic}>
                Mutual funds work best long-term. Don&apos;t let short-term
                emotion or volatility disrupt your plan.
              </ThemedText>

              {/* Redemption Mode Selection */}
              <View style={styles.redemptionModeSection}>
                <ThemedText style={styles.redemptionModeTitle}>
                  Redemption Mode
                </ThemedText>
                <View style={styles.radioOptions}>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => onModeSelect("units")}
                  >
                    <View style={styles.radioCircle}>
                      {selectedMode === "units" && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                    <ThemedText style={styles.radioLabel}>Units</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => onModeSelect("amount")}
                  >
                    <View style={styles.radioCircle}>
                      {selectedMode === "amount" && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                    <ThemedText style={styles.radioLabel}>Amount</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => onModeSelect("redeemAll")}
                  >
                    <View style={styles.radioCircle}>
                      {selectedMode === "redeemAll" && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                    <ThemedText style={styles.radioLabel}>
                      Redeem All
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Proceed Button */}
              <TouchableOpacity
                style={[
                  styles.redeemModeProceedButton,
                  !selectedMode && styles.redeemModeProceedButtonDisabled,
                ]}
                onPress={onProceed}
                disabled={!selectedMode}
              >
                <ThemedText style={styles.redeemModeProceedButtonText}>
                  Proceed
                </ThemedText>
              </TouchableOpacity>
            </>
          )}
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  redeemModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  redeemModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  redeemModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  redeemModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  redeemModalCloseButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  redeemModalFundName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 24,
  },
  redeemHoldingDetails: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    gap: 16,
  },
  redeemHoldingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  redeemHoldingLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  redeemHoldingValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  redeemMessage: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 24,
    textAlign: "center",
  },
  redeemMessageItalic: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 24,
    textAlign: "center",
    fontStyle: "italic",
  },
  redeemActionButtons: {
    gap: 12,
  },
  redeemSpeakToRMButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  redeemSpeakToRMButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  redeemProceedButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  redeemProceedButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  redemptionModeSection: {
    marginBottom: 24,
  },
  redemptionModeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  radioOptions: {
    gap: 16,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#6B7280",
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3B82F6",
  },
  radioLabel: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  redeemModeProceedButton: {
    backgroundColor: "#60A5FA",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  redeemModeProceedButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  redeemModeProceedButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

