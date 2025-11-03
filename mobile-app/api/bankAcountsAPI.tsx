import { BankAccount } from "@/types/bank";
import { api } from "./client";

export const getBankAccounts = async (
  user_id: string
): Promise<BankAccount[]> => {
  const { data } = await api.get(`/users/${user_id}/banks`);
  return data.data.map((bank: any) => ({
    id: bank.id,
    accountNumber: bank.account_number,
    ifscCode: bank.ifsc,
    type: bank.account_type,
    isPrimary: bank.is_primary,
  }));
};

export const deleteBankAccount = async (
  user_id: string,
  bank_id: string
): Promise<void> => {
  await api.delete(`/users/${user_id}/banks/${bank_id}`);
};
