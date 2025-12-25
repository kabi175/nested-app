import { SearchableDropdown } from "@/components/ui/SearchableDropdown";
import { RELATIONSHIP_OPTIONS } from "@/utils/nominee";
import { formatDateToYYYYMMDD, parseDateFromYYYYMMDD, getRelationshipLabel } from "@/utils/nominee";
import type { NomineeDraft, RelationshipType } from "@/types/nominee";
import {
  Button,
  Datepicker,
  Input,
  Text,
} from "@ui-kitten/components";
import { CalendarDays, ChevronDown, ChevronUp, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

interface NomineeFormModalProps {
  visible: boolean;
  draft: NomineeDraft | null;
  errors: Record<string, string>;
  remainingAllocation: number;
  isEditMode: boolean;
  isEditingExistingNominee?: boolean; // True when editing an existing nominee from server (only name/relationship editable)
  onFieldChange: (field: keyof NomineeDraft, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/**
 * Add/Edit Nominee Form Modal
 * Supports adding new nominees and editing existing ones (name & relationship only)
 */
export function NomineeFormModal({
  visible,
  draft,
  errors,
  remainingAllocation,
  isEditMode,
  isEditingExistingNominee = false,
  onFieldChange,
  onSave,
  onCancel,
  isSubmitting = false,
}: NomineeFormModalProps) {
  const [selectedRelationship, setSelectedRelationship] = useState<{
    label: string;
    value: RelationshipType;
  } | null>(null);

  useEffect(() => {
    if (draft?.relationship) {
      const relationshipOption = RELATIONSHIP_OPTIONS.find(
        (opt) => opt.value === draft.relationship
      );
      setSelectedRelationship(relationshipOption || null);
    }
  }, [draft?.relationship]);

  const handleRelationshipSelect = (option: { label: string; value: RelationshipType }) => {
    setSelectedRelationship(option);
    onFieldChange("relationship", option.value);
  };

  const handleDateSelect = (date: Date) => {
    onFieldChange("dob", formatDateToYYYYMMDD(date));
  };

  const handleAllocationIncrement = () => {
    if (draft && draft.allocation < 100) {
      const maxAllowed = Math.min(100, remainingAllocation + draft.allocation);
      onFieldChange("allocation", Math.min(draft.allocation + 1, maxAllowed));
    }
  };

  const handleAllocationDecrement = () => {
    if (draft && draft.allocation > 1) {
      onFieldChange("allocation", draft.allocation - 1);
    }
  };

  const getDobDate = (): Date | undefined => {
    if (!draft?.dob) return undefined;
    return parseDateFromYYYYMMDD(draft.dob);
  };

  if (!draft) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text category="h6" style={styles.title}>
                {isEditMode ? "Edit Nominee" : "Add Nominee"}
              </Text>
              <Text category="s2" style={styles.subtitle}>
                {remainingAllocation}% allocation remaining
              </Text>
            </View>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Nominee Details Section */}
            <Text category="s1" style={styles.sectionTitle}>
              Nominee Details
            </Text>

            {/* Full Name */}
            <Input
              label="Full Name *"
              placeholder="Enter full name"
              value={draft.name}
              onChangeText={(value) => onFieldChange("name", value)}
              status={errors.name ? "danger" : "basic"}
              caption={errors.name || "2-100 characters"}
              style={styles.input}
              size="large"
              disabled={isSubmitting}
            />

            {/* Relationship */}
            <View style={styles.inputContainer}>
              <Text category="label" style={styles.label}>
                Relationship *
              </Text>
              <SearchableDropdown
                data={RELATIONSHIP_OPTIONS}
                labelKey="label"
                valueKey="value"
                placeholder="Select relationship"
                onSelect={handleRelationshipSelect}
                selectedValue={selectedRelationship}
                searchPlaceholder="Search relationship..."
              />
              {errors.relationship && (
                <Text category="c2" status="danger" style={styles.errorText}>
                  {errors.relationship}
                </Text>
              )}
            </View>

            {/* Date of Birth */}
            <Datepicker
              label="Date of Birth *"
              placeholder="dd/mm/yyyy"
              date={getDobDate()}
              min={new Date("1900-01-01")}
              max={new Date()}
              onSelect={handleDateSelect}
              accessoryRight={() => <CalendarDays size={20} />}
              status={errors.dob ? "danger" : "basic"}
              caption={errors.dob}
              style={styles.input}
              size="large"
              disabled={isEditMode || isSubmitting}
            />

            {/* Allocation */}
            <View style={styles.inputContainer}>
              <Text category="label" style={styles.label}>
                Allocation (%) *
              </Text>
              <View style={styles.allocationContainer}>
                <Input
                  placeholder="Enter allocation percentage"
                  value={draft.allocation.toString()}
                  onChangeText={(value) => {
                    const num = parseInt(value) || 0;
                    const maxAllowed = Math.min(100, remainingAllocation + draft.allocation);
                    onFieldChange("allocation", Math.min(Math.max(1, num), maxAllowed));
                  }}
                  keyboardType="number-pad"
                  status={errors.allocation ? "danger" : "basic"}
                  style={styles.allocationInput}
                  size="large"
                  disabled={isEditingExistingNominee || isSubmitting}
                />
                <View style={styles.allocationControls}>
                  <TouchableOpacity
                    onPress={handleAllocationIncrement}
                    disabled={isEditingExistingNominee || isSubmitting || draft.allocation >= 100}
                    style={styles.allocationButton}
                  >
                    <ChevronUp size={16} color={draft.allocation >= 100 ? "#CCC" : "#666"} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleAllocationDecrement}
                    disabled={isEditingExistingNominee || isSubmitting || draft.allocation <= 1}
                    style={styles.allocationButton}
                  >
                    <ChevronDown size={16} color={draft.allocation <= 1 ? "#CCC" : "#666"} />
                  </TouchableOpacity>
                </View>
              </View>
              {errors.allocation && (
                <Text category="c2" status="danger" style={styles.errorText}>
                  {errors.allocation}
                </Text>
              )}
              <Text category="c2" style={styles.helperText}>
                Range: 1-100%
              </Text>
            </View>

            {/* Minor Status (read-only, derived from DOB) */}
            <View style={styles.minorStatusContainer}>
              <Text category="label" style={styles.label}>
                Minor Status
              </Text>
              <Text category="s2" style={styles.minorStatusText}>
                18 years or older
              </Text>
              <View style={styles.badge}>
                <Text category="c2" style={styles.badgeText}>
                  {draft.isMinor ? "Minor" : "Adult"}
                </Text>
              </View>
            </View>

            {/* PAN (only for non-minors, or optional for minors) */}
            {!draft.isMinor && (
              <>
                <Input
                  label="PAN *"
                  placeholder="Enter PAN"
                  value={draft.pan || ""}
                  onChangeText={(value) => onFieldChange("pan", value.toUpperCase())}
                  status={errors.pan ? "danger" : "basic"}
                  caption={errors.pan}
                  style={styles.input}
                  size="large"
                  disabled={isEditingExistingNominee || isSubmitting}
                  maxLength={10}
                />
                <Input
                  label="Email"
                  placeholder="Enter email (optional)"
                  value={draft.email || ""}
                  onChangeText={(value) => onFieldChange("email", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  status={errors.email ? "danger" : "basic"}
                  caption={errors.email}
                  style={styles.input}
                  size="large"
                  disabled={isEditingExistingNominee || isSubmitting}
                />
                <Input
                  label="Address"
                  placeholder="Enter address (optional)"
                  value={draft.address || ""}
                  onChangeText={(value) => onFieldChange("address", value)}
                  status={errors.address ? "danger" : "basic"}
                  caption={errors.address}
                  style={styles.input}
                  size="large"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  disabled={isEditingExistingNominee || isSubmitting}
                />
              </>
            )}

            {/* Guardian Details (only for minors) */}
            {draft.isMinor && (
              <>
                <Text category="s1" style={[styles.sectionTitle, styles.guardianSectionTitle]}>
                  Guardian Details
                </Text>

                <Input
                  label="Guardian Name *"
                  placeholder="Enter guardian name"
                  value={draft.guardianName || ""}
                  onChangeText={(value) => onFieldChange("guardianName", value)}
                  status={errors.guardianName ? "danger" : "basic"}
                  caption={errors.guardianName}
                  style={styles.input}
                  size="large"
                  disabled={isEditingExistingNominee || isSubmitting}
                />

                <Input
                  label="Guardian Email *"
                  placeholder="Enter guardian email"
                  value={draft.guardianEmail || ""}
                  onChangeText={(value) => onFieldChange("guardianEmail", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  status={errors.guardianEmail ? "danger" : "basic"}
                  caption={errors.guardianEmail}
                  style={styles.input}
                  size="large"
                  disabled={isEditingExistingNominee || isSubmitting}
                />

                <Input
                  label="Guardian PAN *"
                  placeholder="Enter guardian PAN"
                  value={draft.guardianPan || ""}
                  onChangeText={(value) => onFieldChange("guardianPan", value.toUpperCase())}
                  status={errors.guardianPan ? "danger" : "basic"}
                  caption={errors.guardianPan}
                  style={styles.input}
                  size="large"
                  disabled={isEditingExistingNominee || isSubmitting}
                  maxLength={10}
                />

                <Input
                  label="Guardian Address *"
                  placeholder="Enter guardian address"
                  value={draft.guardianAddress || ""}
                  onChangeText={(value) => onFieldChange("guardianAddress", value)}
                  status={errors.guardianAddress ? "danger" : "basic"}
                  caption={errors.guardianAddress}
                  style={styles.input}
                  size="large"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  disabled={isEditingExistingNominee || isSubmitting}
                />
              </>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              style={[styles.button, styles.cancelButton]}
              appearance="outline"
              status="basic"
              onPress={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              style={styles.button}
              status="primary"
              onPress={onSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Nominee"}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "90%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
    marginTop: 8,
  },
  guardianSectionTitle: {
    marginTop: 24,
  },
  input: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  errorText: {
    marginTop: 4,
  },
  helperText: {
    marginTop: 4,
    color: "#6B7280",
  },
  allocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  allocationInput: {
    flex: 1,
  },
  allocationControls: {
    flexDirection: "column",
    gap: 4,
  },
  allocationButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  minorStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  minorStatusText: {
    flex: 1,
    color: "#6B7280",
  },
  badge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#374151",
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  button: {
    flex: 1,
    borderRadius: 12,
  },
  cancelButton: {
    borderColor: "#E5E7EB",
  },
});

