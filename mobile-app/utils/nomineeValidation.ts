import Joi from "joi";
import type { NomineeDraft, Nominee, NomineeValidationErrors } from "@/types/nominee";
import { calculateIsMinor } from "./nominee";

// PAN validation regex (10 alphanumeric characters)
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// Email validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mobile number validation (10 digits, optionally with country code)
const MOBILE_REGEX = /^(\+91|0)?[6-9]\d{9}$/;

/**
 * Validate PAN format
 */
export function isValidPAN(pan: string): boolean {
  return PAN_REGEX.test(pan.toUpperCase());
}

/**
 * Validate individual nominee draft
 */
export function validateNomineeDraft(
  draft: NomineeDraft,
  existingNominees: Nominee[] = [],
  draftNominees: NomineeDraft[] = [],
  editingIndex?: number,
  editingNomineeId?: number
): NomineeValidationErrors {
  const errors: NomineeValidationErrors = {};
  const isMinor = draft.isMinor;

  // Name validation
  if (!draft.name || draft.name.trim().length < 2) {
    errors.name = "Name is required (2-100 characters)";
  } else if (draft.name.trim().length > 100) {
    errors.name = "Name must be 2-100 characters";
  }

  // Relationship validation
  if (!draft.relationship) {
    errors.relationship = "Relationship is required";
  }

  // DOB validation
  if (!draft.dob) {
    errors.dob = "Date of birth is required";
  } else {
    const dobDate = new Date(draft.dob);
    const today = new Date();
    if (isNaN(dobDate.getTime())) {
      errors.dob = "Invalid date";
    } else if (dobDate > today) {
      errors.dob = "Date of birth cannot be in the future";
    }
  }

  // PAN validation (required for all)
  if (!draft.pan || draft.pan.trim().length === 0) {
    errors.pan = "PAN is required";
  } else if (!isValidPAN(draft.pan)) {
    errors.pan = "Invalid PAN format (e.g., ABCDE1234F)";
  }

  // Email validation (required)
  if (!draft.email || draft.email.trim().length === 0) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(draft.email)) {
    errors.email = "Invalid email format";
  }

  // Mobile number validation (required)
  if (!draft.mobileNumber || draft.mobileNumber.trim().length === 0) {
    errors.mobileNumber = "Mobile number is required";
  } else {
    // Remove spaces and dashes for validation
    const cleanedMobile = draft.mobileNumber.replace(/[\s-]/g, "");
    if (!MOBILE_REGEX.test(cleanedMobile)) {
      errors.mobileNumber = "Invalid mobile number format (10 digits required)";
    }
  }

  // Address validation (required)
  if (!draft.address) {
    errors.address = {
      address_line: "Address is required",
    };
  } else {
    const addressErrors: {
      address_line?: string;
      city?: string;
      state?: string;
      pin_code?: string;
      country?: string;
    } = {};

    if (!draft.address.address_line || draft.address.address_line.trim().length === 0) {
      addressErrors.address_line = "Address line is required";
    }

    if (!draft.address.city || draft.address.city.trim().length === 0) {
      addressErrors.city = "City is required";
    }

    if (!draft.address.state || draft.address.state.trim().length === 0) {
      addressErrors.state = "State is required";
    }

    if (!draft.address.pin_code || draft.address.pin_code.trim().length === 0) {
      addressErrors.pin_code = "PIN code is required";
    } else if (!/^\d{6}$/.test(draft.address.pin_code)) {
      addressErrors.pin_code = "PIN code must be 6 digits";
    }

    if (!draft.address.country || draft.address.country.trim().length === 0) {
      addressErrors.country = "Country is required";
    } else if (draft.address.country.toLowerCase() !== "in") {
      addressErrors.country = "Country must be India (IN)";
    }

    if (Object.keys(addressErrors).length > 0) {
      errors.address = addressErrors;
    }
  }

  // Guardian validation (required only for minors)
  if (isMinor) {
    if (!draft.guardianName || draft.guardianName.trim().length === 0) {
      errors.guardianName = "Guardian name is required for minors";
    }
  } else {
    // Guardian name should not be provided for adults
    if (draft.guardianName && draft.guardianName.trim().length > 0) {
      errors.guardianName = "Guardian name should not be provided for adults";
    }
  }

  // Allocation validation
  if (draft.allocation === undefined || draft.allocation === null) {
    errors.allocation = "Allocation is required";
  } else if (!Number.isInteger(draft.allocation)) {
    errors.allocation = "Allocation must be an integer";
  } else if (draft.allocation < 1 || draft.allocation > 100) {
    errors.allocation = "Allocation must be between 1 and 100";
  }

  // Cross-nominee validation: Combine existing and draft nominees (excluding current draft)
  const otherDrafts = draftNominees.filter((_, index) => editingIndex === undefined || index !== editingIndex);
  // Exclude the current nominee being edited from existing nominees
  const otherExistingNominees = editingNomineeId
    ? existingNominees.filter((n) => n.id !== editingNomineeId)
    : existingNominees;
  const allOtherNominees = [
    ...otherExistingNominees,
    ...otherDrafts,
  ];

  // PAN uniqueness
  if (draft.pan && draft.pan.trim().length > 0) {
    const duplicatePan = allOtherNominees.find((n) => {
      const pan = "pan" in n ? n.pan : undefined;
      return pan && pan.toUpperCase() === draft.pan.toUpperCase();
    });
    if (duplicatePan) {
      errors.pan = "PAN already used by another nominee";
    }
  }

  // Email uniqueness
  if (draft.email && draft.email.trim().length > 0) {
    const duplicateEmail = allOtherNominees.find((n) => {
      const email = "email" in n ? n.email : undefined;
      return email && email.toLowerCase() === draft.email.toLowerCase();
    });
    if (duplicateEmail) {
      errors.email = "Email already used by another nominee";
    }
  }

  // Mobile number uniqueness
  if (draft.mobileNumber && draft.mobileNumber.trim().length > 0) {
    const cleanedMobile = draft.mobileNumber.replace(/[\s-]/g, "");
    const duplicateMobile = allOtherNominees.find((n) => {
      const mobileNumber = "mobileNumber" in n ? n.mobileNumber : undefined;
      if (!mobileNumber) return false;
      const cleanedOtherMobile = mobileNumber.replace(/[\s-]/g, "");
      return cleanedOtherMobile === cleanedMobile;
    });
    if (duplicateMobile) {
      errors.mobileNumber = "Mobile number already used by another nominee";
    }
  }

  return errors;
}

/**
 * Validate allocation total across all nominees (existing + drafts)
 */
export function validateAllocationTotalForDrafts(
  existingNominees: Nominee[],
  draftNominees: NomineeDraft[]
): NomineeValidationErrors {
  const errors: NomineeValidationErrors = {};

  // Calculate total allocation
  let total = existingNominees.reduce((sum, n) => sum + n.allocation, 0);
  total += draftNominees.reduce((sum, n) => sum + n.allocation, 0);

  if (total !== 100) {
    errors._global = `Total allocation must be exactly 100%. Current: ${total}%`;
  }

  return errors;
}

/**
 * Validate complete nominee draft with cross-nominee checks (for draft list)
 * Note: Does NOT validate allocation total - that should be done separately when saving all nominees
 */
export function validateNomineeDraftComplete(
  draft: NomineeDraft,
  existingNominees: Nominee[],
  draftNominees: NomineeDraft[] = [],
  editingIndex?: number,
  editingNomineeId?: number
): NomineeValidationErrors {
  // Only validate individual fields (no allocation total validation here)
  return validateNomineeDraft(draft, existingNominees, draftNominees, editingIndex, editingNomineeId);
}
