import { atom } from "jotai";
import type {
  Nominee,
  NomineeDraft,
  NomineePayload,
  MfaState,
  PendingAction,
  NomineeValidationErrors,
} from "@/types/nominee";

// Server-synced nominee list
export const nomineeListAtom = atom<Nominee[]>([]);

// Draft nominees list (stored in memory, up to 3 nominees)
export const draftNomineesAtom = atom<NomineeDraft[]>([]);

// Draft nominee being edited/added
export const nomineeDraftAtom = atom<NomineeDraft | null>(null);

// Pending action (add, edit, optOut, or null)
export const pendingActionAtom = atom<PendingAction>(null);

// Pending payload to be sent to API after MFA
export const pendingPayloadAtom = atom<NomineePayload | null>(null);

// Pending nominee ID for edit/opt-out operations
export const pendingNomineeIdAtom = atom<number | null>(null);

// Validation errors
export const validationErrorsAtom = atom<NomineeValidationErrors>({});

// MFA state
export const mfaStateAtom = atom<MfaState>("idle");

// Computed: Total allocation
export const allocationTotalAtom = atom<number>((get) => {
  const nominees = get(nomineeListAtom);
  return nominees
    .filter((n) => !n.optedOut)
    .reduce((sum, n) => sum + n.allocation, 0);
});

// Helper: Calculate remaining allocation
export const remainingAllocationAtom = atom<number>((get) => {
  const total = get(allocationTotalAtom);
  const draft = get(nomineeDraftAtom);
  const pendingId = get(pendingNomineeIdAtom);
  const nominees = get(nomineeListAtom);

  // If editing, subtract the current allocation of the nominee being edited
  let currentAllocation = 0;
  if (pendingId && draft) {
    const existingNominee = nominees.find((n) => n.id === pendingId);
    if (existingNominee) {
      currentAllocation = existingNominee.allocation;
    }
  }

  return 100 - total + currentAllocation;
});

