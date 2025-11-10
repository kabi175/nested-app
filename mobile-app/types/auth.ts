export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone_number: string;
  role: "admin" | "investor";
  panNumber: string | null;
  dob: Date | null;
  gender: "male" | "female" | "other";
  created_at: Date;
  updated_at: Date | null;
  status: "completed" | "pending" | "rejected";
};
