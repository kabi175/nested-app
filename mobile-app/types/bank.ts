export type BankAccount = {
  id: string;
  accountNumber: string;
  ifscCode: string;
  type: "savings" | "current";
  isPrimary: boolean;
  name: string;
};
