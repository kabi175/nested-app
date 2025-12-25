// Relationship types for nominees (must match backend enum values)
export type RelationshipType =
  | "father"
  | "mother"
  | "aunt"
  | "brother"
  | "brother_in_law"
  | "daughter"
  | "daughter_in_law"
  | "father_in_law"
  | "grand_daughter"
  | "grand_father"
  | "grand_mother"
  | "grand_son"
  | "mother_in_law"
  | "nephew"
  | "niece"
  | "sister"
  | "sister_in_law"
  | "son"
  | "son_in_law"
  | "spouse"
  | "uncle"
  | "other"
  | "court_appointed_legal_guardian";

// Client-side draft model (includes isMinor)
export type NomineeDraft = {
  id?: number;
  name: string;
  relationship: RelationshipType;
  dob: string; // yyyy-MM-dd format
  pan?: string;
  email?: string;
  address?: string;
  allocation: number;
  isMinor: boolean; // CLIENT ONLY - derived from DOB
  guardianName?: string;
  guardianEmail?: string;
  guardianPan?: string;
  guardianAddress?: string;
};

// API response model (doesn't include isMinor)
export type Nominee = {
  id: number;
  name: string;
  relationship: RelationshipType;
  dob: string; // yyyy-MM-dd format
  pan?: string;
  email?: string;
  address?: string;
  allocation: number;
  guardianName?: string;
  guardianEmail?: string;
  guardianPan?: string;
  guardianAddress?: string;
  optedOut?: boolean; // Server-side opt-out status
};

// API payload (for add/edit - excludes isMinor)
export type NomineePayload = Omit<Nominee, "id" | "optedOut">;

// MFA state
export type MfaState = "idle" | "pending" | "verifying" | "success" | "failed";

// Pending action type
export type PendingAction = "add" | "edit" | "optOut" | null;

// Validation errors
export type NomineeValidationErrors = {
  name?: string;
  relationship?: string;
  dob?: string;
  pan?: string;
  email?: string;
  address?: string;
  allocation?: string;
  guardianName?: string;
  guardianEmail?: string;
  guardianPan?: string;
  guardianAddress?: string;
  _global?: string; // For cross-nominee validation errors
};

