export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone_number: string;
  role: "admin" | "investor";
  created_at: Date;
  updated_at: Date | null;
};
