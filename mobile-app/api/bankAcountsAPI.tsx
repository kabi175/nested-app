import { BankAccount } from "@/types/bank";
import type { AxiosInstance } from "axios";

export const getBankAccounts = async (
  api: AxiosInstance,
  user_id: string
): Promise<BankAccount[]> => {
  try {
    const { data } = await api.get(`/users/${user_id}/banks`);
    // Handle different possible response structures
    // Try data.data first (standard structure), then data, then check if data itself is an array
    let banksArray: any[] = [];

    if (Array.isArray(data)) {
      // Response is directly an array
      banksArray = data;
    } else if (data && Array.isArray(data.data)) {
      // Response is { data: [...] }
      banksArray = data.data;
    } else {
      console.warn("Unexpected API response structure for banks:", data);
      return [];
    }

    return banksArray.map((bank: any) => ({
      id: bank.id,
      accountNumber: bank.account_number,
      ifscCode: bank.ifsc,
      type: bank.account_type,
      isPrimary: bank.is_primary,
      name: bank.name,
    }));
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    throw error;
  }
};

export const addBankAccount = async (
  api: AxiosInstance,
  user_id: string,
  bank_account: {
    accountNumber: string;
    ifscCode: string;
    type: "savings" | "current";
    isPrimary: boolean;
  }
): Promise<BankAccount> => {
  const { data } = await api.post(`/users/${user_id}/banks`, {
    account_number: bank_account.accountNumber,
    ifsc: bank_account.ifscCode,
    account_type: bank_account.type,
    is_primary: bank_account.isPrimary,
  });

  return {
    id: data.id,
    accountNumber: data.account_number,
    ifscCode: data.ifsc,
    type: data.account_type,
    isPrimary: data.is_primary,
    name: data.name,
  };
};

export const deleteBankAccount = async (
  api: AxiosInstance,
  user_id: string,
  bank_id: string
): Promise<void> => {
  await api.delete(`/users/${user_id}/banks/${bank_id}`);
};

export type LinkBankAccountAction = {
  redirect_url: string;
  id: string;
};

export const linkBankAccount = async (
  api: AxiosInstance,
  userID: string
): Promise<LinkBankAccountAction> => {
  const { data } = await api.post(`users/${userID}/actions/reverse-penny-drop`);
  return data;
};

export const getLinkBankAccountStatus = async (
  api: AxiosInstance,
  userID: string,
  actionID: string
): Promise<"pending" | "completed" | "failed" | "cancelled"> => {
  const { data } = await api.get(
    `users/${userID}/actions/reverse-penny-drop/status/${actionID}`
  );
  return data.status;
};
