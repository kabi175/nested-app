import Joi from "joi";
import type { NomineeDraft, Nominee, NomineeValidationErrors } from "@/types/nominee";
import { calculateIsMinor } from "./nominee";

// PAN validation regex (10 alphanumeric characters)
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// Email validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  editingIndex?: number
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

  // PAN validation (required for non-minors)
  if (!isMinor) {
    if (!draft.pan || draft.pan.trim().length === 0) {
      errors.pan = "PAN is required for adults";
    } else if (!isValidPAN(draft.pan)) {
      errors.pan = "Invalid PAN format (e.g., ABCDE1234F)";
    }
  } else {
    // Optional for minors, but if provided, must be valid
    if (draft.pan && draft.pan.trim().length > 0 && !isValidPAN(draft.pan)) {
      errors.pan = "Invalid PAN format (e.g., ABCDE1234F)";
    }
  }

  // Email validation (optional, but must be valid if provided)
  if (draft.email && draft.email.trim().length > 0) {
    if (!EMAIL_REGEX.test(draft.email)) {
      errors.email = "Invalid email format";
    }
  }

  // Guardian validation (required for minors)
  if (isMinor) {
    if (!draft.guardianName || draft.guardianName.trim().length === 0) {
      errors.guardianName = "Guardian name is required for minors";
    }
    if (!draft.guardianEmail || draft.guardianEmail.trim().length === 0) {
      errors.guardianEmail = "Guardian email is required for minors";
    } else if (!EMAIL_REGEX.test(draft.guardianEmail)) {
      errors.guardianEmail = "Invalid guardian email format";
    }
    if (!draft.guardianPan || draft.guardianPan.trim().length === 0) {
      errors.guardianPan = "Guardian PAN is required for minors";
    } else if (!isValidPAN(draft.guardianPan)) {
      errors.guardianPan = "Invalid guardian PAN format";
    }
    if (!draft.guardianAddress || draft.guardianAddress.trim().length === 0) {
      errors.guardianAddress = "Guardian address is required for minors";
    }
  } else {
    // Guardian fields must be empty for non-minors
    if (draft.guardianName || draft.guardianEmail || draft.guardianPan || draft.guardianAddress) {
      errors.guardianName = "Guardian details should not be provided for adults";
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
  const allOtherNominees = [
    ...existingNominees.filter((n) => !n.optedOut),
    ...otherDrafts,
  ];

  // PAN uniqueness
  if (draft.pan && draft.pan.trim().length > 0) {
    const duplicatePan = allOtherNominees.find((n) => {
      const pan = "pan" in n ? n.pan : undefined;
      return pan && pan.toUpperCase() === draft.pan!.toUpperCase();
    });
    if (duplicatePan) {
      errors.pan = "PAN already used by another nominee";
    }
  }

  // Email uniqueness
  if (draft.email && draft.email.trim().length > 0) {
    const duplicateEmail = allOtherNominees.find((n) => {
      const email = "email" in n ? n.email : undefined;
      return email && email.toLowerCase() === draft.email!.toLowerCase();
    });
    if (duplicateEmail) {
      errors.email = "Email already used by another nominee";
    }
  }

  // Guardian PAN uniqueness
  if (isMinor && draft.guardianPan && draft.guardianPan.trim().length > 0) {
    const duplicateGuardianPan = allOtherNominees.find((n) => {
      const guardianPan = "guardianPan" in n ? n.guardianPan : undefined;
      return guardianPan && guardianPan.toUpperCase() === draft.guardianPan!.toUpperCase();
    });
    if (duplicateGuardianPan) {
      errors.guardianPan = "Guardian PAN already used by another nominee";
    }
  }

  // Guardian Email uniqueness
  if (isMinor && draft.guardianEmail && draft.guardianEmail.trim().length > 0) {
    const duplicateGuardianEmail = allOtherNominees.find((n) => {
      const guardianEmail = "guardianEmail" in n ? n.guardianEmail : undefined;
      return guardianEmail && guardianEmail.toLowerCase() === draft.guardianEmail!.toLowerCase();
    });
    if (duplicateGuardianEmail) {
      errors.guardianEmail = "Guardian email already used by another nominee";
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
  const activeNominees = existingNominees.filter((n) => !n.optedOut);

  // Calculate total allocation
  let total = activeNominees.reduce((sum, n) => sum + n.allocation, 0);
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
  editingIndex?: number
): NomineeValidationErrors {
  // Only validate individual fields (no allocation total validation here)
  return validateNomineeDraft(draft, existingNominees, draftNominees, editingIndex);
}
