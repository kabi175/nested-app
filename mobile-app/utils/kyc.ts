import { PreVerificationData } from "@/api/userApi";

export type ValidationStatus = "success" | "failed" | "in_progress";

const SUCCESS_ERROR_CODES = ["kyc_unavailable", "kyc_incomplete", "unknown"];

export const getValidationStatus = (
  data: PreVerificationData[] | undefined
): ValidationStatus => {
  console.log("getValidationStatus", data);
  if (!data || data.length === 0) return "in_progress";

  const isPending = data.some((item) => item.is_pending);
  if (isPending) return "in_progress";

  const hasFailure = data.some(
    (item) => !item.is_valid && !SUCCESS_ERROR_CODES.includes(item.error_code)
  );

  if (hasFailure) return "failed";

  return "success";
};

export const getErrorMessage = (errorCode: PreVerificationData["error_code"]): string => {
  switch (errorCode) {
    case "mismatch":
      return "The name provided does not match the name on your PAN card. Please check and try again.";
    case "invalid":
      return "The PAN number provided is invalid. Please enter a valid PAN.";
    case "aadhaar_not_linked":
      return "Your Aadhaar is not linked to your PAN. Please link them and try again.";
    case "upstream_error":
      return "Our verification partner is currently experiencing issues. Please try again after some time.";
    case "unknown":
      return "Verification failed. Our team will manually contact you to assist with the process.";
    default:
      return "An unexpected error occurred during verification. Please try again.";
  }
};
