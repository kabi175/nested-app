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
};

export type Address = {
  address_line: string;
  city: string;
  state: string;
  pin_code: string;
  country: string;
};
