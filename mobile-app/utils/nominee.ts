import type { NomineeDraft, Nominee, RelationshipType } from "@/types/nominee";

/**
 * Calculate if a nominee is a minor based on DOB
 * A minor is someone under 18 years of age
 */
export function calculateIsMinor(dob: string): boolean {
  const birthDate = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 < 18;
  }

  return age < 18;
}

/**
 * Convert API nominee to draft (adds isMinor)
 */
export function nomineeToDraft(nominee: Nominee): NomineeDraft {
  return {
    ...nominee,
    isMinor: calculateIsMinor(nominee.dob),
  };
}

/**
 * Convert draft to API payload (removes isMinor and id)
 */
export function draftToPayload(draft: NomineeDraft): Omit<Nominee, "id" | "optedOut"> {
  const { id, isMinor, ...payload } = draft;
  return payload;
}

/**
 * Format date to yyyy-MM-dd
 */
export function formatDateToYYYYMMDD(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Format date from yyyy-MM-dd to Date object
 */
export function parseDateFromYYYYMMDD(dateString: string): Date {
  return new Date(dateString + "T00:00:00");
}

/**
 * Format relationship value to display label
 */
function formatRelationshipLabel(value: RelationshipType): string {
  const labelMap: Record<RelationshipType, string> = {
    father: "Father",
    mother: "Mother",
    aunt: "Aunt",
    brother: "Brother",
    brother_in_law: "Brother-in-law",
    daughter: "Daughter",
    daughter_in_law: "Daughter-in-law",
    father_in_law: "Father-in-law",
    grand_daughter: "Granddaughter",
    grand_father: "Grandfather",
    grand_mother: "Grandmother",
    grand_son: "Grandson",
    mother_in_law: "Mother-in-law",
    nephew: "Nephew",
    niece: "Niece",
    sister: "Sister",
    sister_in_law: "Sister-in-law",
    son: "Son",
    son_in_law: "Son-in-law",
    spouse: "Spouse",
    uncle: "Uncle",
    other: "Other",
    court_appointed_legal_guardian: "Court Appointed Legal Guardian",
  };
  return labelMap[value] ?? value;
}

/**
 * Get relationship options with user-friendly labels
 */
export const RELATIONSHIP_OPTIONS: { label: string; value: RelationshipType }[] = [
  { label: formatRelationshipLabel("spouse"), value: "spouse" },
  { label: formatRelationshipLabel("father"), value: "father" },
  { label: formatRelationshipLabel("mother"), value: "mother" },
  { label: formatRelationshipLabel("son"), value: "son" },
  { label: formatRelationshipLabel("daughter"), value: "daughter" },
  { label: formatRelationshipLabel("brother"), value: "brother" },
  { label: formatRelationshipLabel("sister"), value: "sister" },
  { label: formatRelationshipLabel("father_in_law"), value: "father_in_law" },
  { label: formatRelationshipLabel("mother_in_law"), value: "mother_in_law" },
  { label: formatRelationshipLabel("son_in_law"), value: "son_in_law" },
  { label: formatRelationshipLabel("daughter_in_law"), value: "daughter_in_law" },
  { label: formatRelationshipLabel("brother_in_law"), value: "brother_in_law" },
  { label: formatRelationshipLabel("sister_in_law"), value: "sister_in_law" },
  { label: formatRelationshipLabel("grand_father"), value: "grand_father" },
  { label: formatRelationshipLabel("grand_mother"), value: "grand_mother" },
  { label: formatRelationshipLabel("grand_son"), value: "grand_son" },
  { label: formatRelationshipLabel("grand_daughter"), value: "grand_daughter" },
  { label: formatRelationshipLabel("uncle"), value: "uncle" },
  { label: formatRelationshipLabel("aunt"), value: "aunt" },
  { label: formatRelationshipLabel("nephew"), value: "nephew" },
  { label: formatRelationshipLabel("niece"), value: "niece" },
  { label: formatRelationshipLabel("court_appointed_legal_guardian"), value: "court_appointed_legal_guardian" },
  { label: formatRelationshipLabel("other"), value: "other" },
];

/**
 * Get relationship display label for a given value
 */
export function getRelationshipLabel(value: RelationshipType): string {
  return formatRelationshipLabel(value);
}

