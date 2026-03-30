import { SearchableDropdown } from "@/components/ui/SearchableDropdown";
import type {
  NomineeDraft,
  NomineeValidationErrors,
  RelationshipType,
} from "@/types/nominee";
import {
  RELATIONSHIP_OPTIONS,
  formatDateToYYYYMMDD,
  parseDateFromYYYYMMDD,
} from "@/utils/nominee";
import {
  Button,
  Datepicker,
  IndexPath,
  Input,
  Select,
  SelectItem,
  Text,
} from "@ui-kitten/components";
import { ArrowLeft, CalendarDays, ChevronDown, ChevronUp } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface NomineeFormProps {
  draft: NomineeDraft;
  errors: NomineeValidationErrors;
  remainingAllocation: number;
  isEditMode: boolean;
  isEditingExistingNominee?: boolean;
  onFieldChange: (field: keyof NomineeDraft, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/**
 * Add/Edit Nominee Form
 * Supports adding new nominees and editing existing ones (only allocation editable for existing nominees)
 */
export function NomineeForm({
  draft,
  errors,
  remainingAllocation,
  isEditMode,
  isEditingExistingNominee = false,
  onFieldChange,
  onSave,
  onCancel,
  isSubmitting = false,
}: NomineeFormProps) {
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

  const handleRelationshipSelect = (option: {
    label: string;
    value: RelationshipType;
  }) => {
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

  const handleAddressChange = (
    field: keyof NonNullable<NomineeDraft["address"]>,
    value: string
  ) => {
    const currentAddress = draft?.address || {};
    onFieldChange("address", {
      ...currentAddress,
      [field]: value,
      country: "in",
    });
  };

  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu & Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  const stateIndex = draft?.address?.state
    ? states.indexOf(draft.address.state)
    : -1;
  const selectedStateIndex =
    stateIndex >= 0 ? new IndexPath(stateIndex) : undefined;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.backButton} disabled={isSubmitting}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditMode ? "Edit Nominee" : "Add Nominee"}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Full Name */}
        <Text style={styles.label}>Full Name*</Text>
        <Input
          placeholder="Enter Full Name"
          value={draft.name}
          onChangeText={(value) => onFieldChange("name", value)}
          status={errors.name ? "danger" : "basic"}
          caption={errors.name}
          style={styles.input}
          size="large"
          disabled={isEditingExistingNominee || isSubmitting}
        />

        {/* Relationship */}
        <Text style={styles.label}>Relationship*</Text>
        <View style={styles.inputContainer}>
          <SearchableDropdown
            data={RELATIONSHIP_OPTIONS}
            labelKey="label"
            valueKey="value"
            placeholder="Select relationship"
            onSelect={handleRelationshipSelect}
            selectedValue={selectedRelationship}
            searchPlaceholder="Search relationship..."
            disabled={isEditingExistingNominee || isSubmitting}
          />
          {errors.relationship && (
            <Text category="c2" status="danger" style={styles.errorText}>
              {errors.relationship}
            </Text>
          )}
        </View>

        {/* Date of Birth */}
        <Text style={styles.label}>Date of Birth*</Text>
        <Datepicker
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

        {/* PAN Number */}
        <Text style={styles.label}>PAN Number*</Text>
        <Input
          placeholder="Enter PAN number"
          value={draft.pan || ""}
          onChangeText={(value) =>
            onFieldChange("pan", value.toUpperCase())
          }
          status={errors.pan ? "danger" : "basic"}
          caption={errors.pan}
          style={styles.input}
          size="large"
          disabled={isEditingExistingNominee || isSubmitting}
          maxLength={10}
        />

        {/* Email */}
        <Text style={styles.label}>Email*</Text>
        <Input
          placeholder="example@gmail.com"
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

        {/* Mobile Number */}
        <Text style={styles.label}>Mobile Number*</Text>
        <Input
          placeholder="99999 99999"
          value={draft.mobileNumber || ""}
          onChangeText={(value) => onFieldChange("mobileNumber", value)}
          keyboardType="phone-pad"
          status={errors.mobileNumber ? "danger" : "basic"}
          caption={errors.mobileNumber}
          style={styles.input}
          size="large"
          disabled={isEditingExistingNominee || isSubmitting}
        />

        {/* Address Line */}
        <Text style={styles.label}>Address Line*</Text>
        <Input
          placeholder="Address"
          value={draft.address?.address_line || ""}
          onChangeText={(value) =>
            handleAddressChange("address_line", value)
          }
          status={
            typeof errors.address === "object" &&
              errors.address?.address_line
              ? "danger"
              : "basic"
          }
          caption={
            typeof errors.address === "object"
              ? errors.address?.address_line
              : undefined
          }
          style={styles.input}
          size="large"
          disabled={isEditingExistingNominee || isSubmitting}
        />

        {/* City */}
        <Text style={styles.label}>City*</Text>
        <Input
          placeholder="Enter city"
          value={draft.address?.city || ""}
          onChangeText={(value) => handleAddressChange("city", value)}
          status={
            typeof errors.address === "object" && errors.address?.city
              ? "danger"
              : "basic"
          }
          caption={
            typeof errors.address === "object"
              ? errors.address?.city
              : undefined
          }
          style={styles.input}
          size="large"
          disabled={isEditingExistingNominee || isSubmitting}
        />

        {/* State */}
        <Text style={styles.label}>State*</Text>
        <View style={styles.inputContainer}>
          <Select
            selectedIndex={selectedStateIndex}
            value={draft.address?.state || undefined}
            onSelect={(index) => {
              const row = Array.isArray(index) ? index[0].row : index.row;
              handleAddressChange("state", states[row]);
            }}
            status={
              typeof errors.address === "object" && errors.address?.state
                ? "danger"
                : "basic"
            }
            caption={
              typeof errors.address === "object"
                ? errors.address?.state
                : undefined
            }
            placeholder="Select"
            disabled={isEditingExistingNominee || isSubmitting}
          >
            {states.map((s) => (
              <SelectItem key={s} title={s} />
            ))}
          </Select>
        </View>

        {/* Pincode */}
        <Text style={styles.label}>Pincode*</Text>
        <Input
          placeholder="6-digit PIN"
          value={draft.address?.pin_code || ""}
          onChangeText={(value) =>
            handleAddressChange("pin_code", value.replace(/[^0-9]/g, ""))
          }
          keyboardType="number-pad"
          maxLength={6}
          status={
            typeof errors.address === "object" && errors.address?.pin_code
              ? "danger"
              : "basic"
          }
          caption={
            typeof errors.address === "object"
              ? errors.address?.pin_code
              : undefined
          }
          style={styles.input}
          size="large"
          disabled={isEditingExistingNominee || isSubmitting}
        />

        {/* Allocation — inline row */}
        <View style={styles.allocationRow}>
          <Text style={styles.allocationLabel}>Allocation (%)*</Text>
          <View style={styles.allocationStepper}>
            <TextInput
              style={styles.allocationValue}
              value={draft.allocation.toString()}
              onChangeText={(value) => {
                const num = parseInt(value.replace(/[^0-9]/g, ""), 10);
                if (isNaN(num)) {
                  onFieldChange("allocation", 0);
                  return;
                }
                const maxAllowed = Math.min(100, remainingAllocation + draft.allocation);
                onFieldChange("allocation", Math.min(Math.max(0, num), maxAllowed));
              }}
              onBlur={() => {
                if (draft.allocation < 1) onFieldChange("allocation", 1);
              }}
              keyboardType="number-pad"
              editable={!isSubmitting}
              selectTextOnFocus
            />
            <View style={styles.allocationControls}>
              <TouchableOpacity
                onPress={handleAllocationIncrement}
                disabled={isSubmitting || draft.allocation >= 100}
                style={styles.allocationButton}
              >
                <ChevronUp
                  size={14}
                  color={draft.allocation >= 100 ? "#CCC" : "#374151"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAllocationDecrement}
                disabled={isSubmitting || draft.allocation <= 1}
                style={styles.allocationButton}
              >
                <ChevronDown
                  size={14}
                  color={draft.allocation <= 1 ? "#CCC" : "#374151"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {errors.allocation && (
          <Text category="c2" status="danger" style={styles.errorText}>
            {errors.allocation}
          </Text>
        )}

        {/* Guardian Details (only for minors) */}
        {draft.isMinor && (
          <>
            <Text style={styles.sectionTitle}>Guardian Details</Text>

            <Text style={styles.label}>Guardian Name*</Text>
            <Input
              placeholder="Enter guardian name"
              value={draft.guardianName || ""}
              onChangeText={(value) => onFieldChange("guardianName", value)}
              status={errors.guardianName ? "danger" : "basic"}
              caption={errors.guardianName}
              style={styles.input}
              size="large"
              disabled={isEditingExistingNominee || isSubmitting}
            />
          </>
        )}
      </ScrollView>

      {/* Done Button */}
      <View style={styles.footer}>
        <Button
          style={styles.doneButton}
          status="primary"
          onPress={onSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Done"}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
  },
  input: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  errorText: {
    marginTop: 4,
    marginBottom: 8,
  },
  allocationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  allocationLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  allocationStepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  allocationValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    minWidth: 44,
    textAlign: "center",
    padding: 0,
  },
  allocationControls: {
    flexDirection: "column",
    gap: 2,
  },
  allocationButton: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
    marginTop: 8,
  },
  footer: {
    padding: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  doneButton: {
    borderRadius: 12,
  },
});
