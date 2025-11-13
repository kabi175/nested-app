import type { User } from "@/types/auth";

type Option<T extends string> = {
  label: string;
  value: T;
};

type OccupationValue = NonNullable<User["occupation"]>;
type IncomeSourceValue = NonNullable<User["income_source"]>;
type IncomeSlabValue = NonNullable<User["income_slab"]>;

export const occupationOptions: Option<OccupationValue>[] = [
  { label: "Business", value: "business" },
  { label: "Service", value: "service" },
  { label: "Professional", value: "professional" },
  { label: "Agriculture", value: "agriculture" },
  { label: "Retired", value: "retired" },
  { label: "Homemaker", value: "housewife" },
  { label: "Others", value: "others" },
  { label: "Doctor", value: "doctor" },
  { label: "Private Sector Service", value: "private_sector_service" },
  { label: "Public Sector Service", value: "public_sector_service" },
  { label: "Forex Dealer", value: "forex_dealer" },
  { label: "Government Service", value: "government_service" },
];

export const incomeSourceOptions: Option<IncomeSourceValue>[] = [
  { label: "Salary", value: "salary" },
  { label: "Business Income", value: "business_income" },
  { label: "Ancestral Property", value: "ancestral_property" },
  { label: "Rental Income", value: "rental_income" },
  { label: "Prize Money", value: "prize_money" },
  { label: "Royalty", value: "royalty" },
  { label: "Other", value: "other" },
];

export const incomeSlabOptions: Option<IncomeSlabValue>[] = [
  { label: "Up to 1 Lakh", value: "upto_1lakh" },
  { label: "1 - 5 Lakh", value: "above_1lakh_upto_5lakh" },
  { label: "5 - 10 Lakh", value: "above_5lakh_upto_10lakh" },
  { label: "10 - 25 Lakh", value: "above_10lakh_upto_25lakh" },
  { label: "25 Lakh - 1 Cr", value: "above_25lakh_upto_1cr" },
  { label: "Above 1 Cr", value: "above_1cr" },
];

function createLabelLookup<T extends string>(
  options: Option<T>[]
): Record<T, string> {
  return options.reduce(
    (acc, option) => {
      acc[option.value] = option.label;
      return acc;
    },
    {} as Record<T, string>
  );
}

const occupationLabelMap = createLabelLookup(occupationOptions);
const incomeSourceLabelMap = createLabelLookup(incomeSourceOptions);
const incomeSlabLabelMap = createLabelLookup(incomeSlabOptions);

export function getOccupationLabel(
  value: OccupationValue | "" | null | undefined
): string {
  if (!value) return "";
  return occupationLabelMap[value] ?? "";
}

export function getIncomeSourceLabel(
  value: IncomeSourceValue | "" | null | undefined
): string {
  if (!value) return "";
  return incomeSourceLabelMap[value] ?? "";
}

export function getIncomeSlabLabel(
  value: IncomeSlabValue | "" | null | undefined
): string {
  if (!value) return "";
  return incomeSlabLabelMap[value] ?? "";
}

