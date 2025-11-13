export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone_number: string;
  role: "admin" | "investor";
  panNumber: string | null;
  aadhaar: string | null;
  dob: Date | null;
  gender: "male" | "female" | "other";
  created_at: Date;
  updated_at: Date | null;
  status: "completed" | "pending" | "rejected";
  address: Address | null;
  father_name: string | null;
  kycStatus:
    | "unknown"
    | "pending"
    | "aadhaar_pending"
    | "esign_pending"
    | "submitted"
    | "completed"
    | "failed";

  income_source:
    | "salary"
    | "business_income"
    | "ancestral_property"
    | "rental_income"
    | "prize_money"
    | "royalty"
    | "other"
    | null;

  income_slab:
    | "upto_1lakh"
    | "above_1lakh_upto_5lakh"
    | "above_5lakh_upto_10lakh"
    | "above_10lakh_upto_25lakh"
    | "above_25lakh_upto_1cr"
    | "above_1cr"
    | null;

  occupation:
    | "business"
    | "service"
    | "professional"
    | "agriculture"
    | "retired"
    | "housewife"
    | "others"
    | "doctor"
    | "private_sector_service"
    | "public_sector_service"
    | "forex_dealer"
    | "government_service"
    | null;
  pep: boolean | null;
};

export type Address = {
  address_line: string;
  city: string;
  state: string;
  pin_code: string;
  country: string;
};
