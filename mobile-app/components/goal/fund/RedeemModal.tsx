import { Holding } from "@/api/portfolioAPI";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { formatCurrency } from "@/utils/formatters";
import { ChevronDown, ChevronUp, X } from "lucide-react-native";
import {
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface RedeemModalProps {
  visible: boolean;
  holding: Holding;
  units: number;
  step: "initial" | "mode";
  selectedMode: "units" | "amount" | "redeemAll" | null;
  unitsValue: string;
  amountValue: string;
  onClose: () => void;
  onSpeakToRM: () => void;
  onProceed: () => void;
  onModeSelect: (mode: "units" | "amount" | "redeemAll") => void;
  onUnitsValueChange: (value: string) => void;
  onAmountValueChange: (value: string) => void;
}

export function RedeemModal({
  visible,
  holding,
  units,
  step,
  selectedMode,
  unitsValue,
  amountValue,
  onClose,
  onSpeakToRM,
  onProceed,
  onModeSelect,
  onUnitsValueChange,
  onAmountValueChange,
}: RedeemModalProps) {
  const maxUnits = units;
  const maxAmount = holding.current_value;
  const minUnits = 0.01;
  const minAmount = 100;

  const parseNumericValue = (value: string): number => {
    const cleaned = value.replace(/,/g, "").replace(/₹/g, "").trim();
    return parseFloat(cleaned) || 0;
  };

  const handleUnitsIncrement = () => {
    const current = parseNumericValue(unitsValue);
    const newValue = Math.min(current + 0.01, maxUnits);
    onUnitsValueChange(newValue.toFixed(2));
  };

  const handleUnitsDecrement = () => {
    const current = parseNumericValue(unitsValue);
    const newValue = Math.max(current - 0.01, minUnits);
    onUnitsValueChange(newValue.toFixed(2));
  };

  const handleAmountIncrement = () => {
    const current = parseNumericValue(amountValue);
    const newValue = Math.min(current + 100, maxAmount);
    onAmountValueChange(Math.floor(newValue).toString());
  };

  const handleAmountDecrement = () => {
    const current = parseNumericValue(amountValue);
    const newValue = Math.max(current - 100, minAmount);
    onAmountValueChange(Math.floor(newValue).toString());
  };

  const isUnitsValid = () => {
    if (selectedMode !== "units") return true;
    const value = parseNumericValue(unitsValue);
    return value >= minUnits && value <= maxUnits;
  };

  const isAmountValid = () => {
    if (selectedMode !== "amount") return true;
    const value = parseNumericValue(amountValue);
    return value >= minAmount && value <= maxAmount;
  };

  const canProceed = () => {
    if (!selectedMode) return false;
    if (selectedMode === "redeemAll") return true;
    if (selectedMode === "units") return isUnitsValid();
    if (selectedMode === "amount") return isAmountValid();
    return false;
  };
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

              {/* Enter Units Section */}
              {selectedMode === "units" && (
                <View style={styles.inputSection}>
                  <ThemedText style={styles.inputSectionTitle}>
                    Enter Units
                  </ThemedText>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={unitsValue}
                      onChangeText={(text) => {
                        const cleaned = text.replace(/[^0-9.]/g, "");
                        const parts = cleaned.split(".");
                        if (parts.length > 2) return;
                        if (parts[1] && parts[1].length > 2) return;
                        onUnitsValueChange(cleaned);
                      }}
                      keyboardType="decimal-pad"
                      placeholder={`Max: ${maxUnits.toFixed(2)}`}
                      placeholderTextColor="#9CA3AF"
                    />
                    <View style={styles.inputControls}>
                      <TouchableOpacity
                        style={styles.inputControlButton}
                        onPress={handleUnitsIncrement}
                        disabled={parseNumericValue(unitsValue) >= maxUnits}
                      >
                        <ChevronUp
                          size={16}
                          color={
                            parseNumericValue(unitsValue) >= maxUnits
                              ? "#D1D5DB"
                              : "#6B7280"
                          }
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.inputControlButton}
                        onPress={handleUnitsDecrement}
                        disabled={parseNumericValue(unitsValue) <= minUnits}
                      >
                        <ChevronDown
                          size={16}
                          color={
                            parseNumericValue(unitsValue) <= minUnits
                              ? "#D1D5DB"
                              : "#6B7280"
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <ThemedText style={styles.inputHelperText}>
                    Maximum: {maxUnits.toFixed(2)}
                  </ThemedText>
                  {!isUnitsValid() && parseNumericValue(unitsValue) > 0 && (
                    <ThemedText style={styles.inputErrorText}>
                      Minimum: {minUnits.toFixed(2)} units required
                    </ThemedText>
                  )}
                </View>
              )}

              {/* Enter Amount Section */}
              {selectedMode === "amount" && (
                <View style={styles.inputSection}>
                  <ThemedText style={styles.inputSectionTitle}>
                    Enter Amount (₹)
                  </ThemedText>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={amountValue}
                      onChangeText={(text) => {
                        const cleaned = text.replace(/[^0-9]/g, "");
                        onAmountValueChange(cleaned);
                      }}
                      keyboardType="numeric"
                      placeholder={`Max: ${formatCurrency(maxAmount)}`}
                      placeholderTextColor="#9CA3AF"
                    />
                    <View style={styles.inputControls}>
                      <TouchableOpacity
                        style={styles.inputControlButton}
                        onPress={handleAmountIncrement}
                        disabled={parseNumericValue(amountValue) >= maxAmount}
                      >
                        <ChevronUp
                          size={16}
                          color={
                            parseNumericValue(amountValue) >= maxAmount
                              ? "#D1D5DB"
                              : "#6B7280"
                          }
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.inputControlButton}
                        onPress={handleAmountDecrement}
                        disabled={parseNumericValue(amountValue) <= minAmount}
                      >
                        <ChevronDown
                          size={16}
                          color={
                            parseNumericValue(amountValue) <= minAmount
                              ? "#D1D5DB"
                              : "#6B7280"
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <ThemedText style={styles.inputHelperText}>
                    Maximum: {formatCurrency(maxAmount)}
                  </ThemedText>
                  {!isAmountValid() && parseNumericValue(amountValue) > 0 && (
                    <ThemedText style={styles.inputErrorText}>
                      Minimum: ₹100 required
                    </ThemedText>
                  )}
                </View>
              )}

              {/* Proceed Button */}
              <TouchableOpacity
                style={[
                  styles.redeemModeProceedButton,
                  !canProceed() && styles.redeemModeProceedButtonDisabled,
                ]}
                onPress={onProceed}
                disabled={!canProceed()}
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
  inputSection: {
    marginBottom: 24,
  },
  inputSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  inputControls: {
    flexDirection: "column",
    marginLeft: 8,
    gap: 4,
  },
  inputControlButton: {
    padding: 4,
  },
  inputHelperText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  inputErrorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
});
