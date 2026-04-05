/**
 * Firebase Analytics standard events.
 *
 * Mapping:
 * - sign_up  → user completed registration (name input)
 * - login    → user verified OTP and authenticated
 * - add_to_cart → user created a goal
 * - purchase → payment completed
 */

import analytics from "@react-native-firebase/analytics";

export async function logSignUp(method: string = "phone") {
  await analytics().logSignUp({ method });
}

export async function logLogin(method: string = "phone") {
  await analytics().logLogin({ method });
}

export async function logAddToCart(params: {
  items: { item_id: string; item_name: string; quantity: number }[];
  value?: number;
  currency?: string;
}) {
  await analytics().logAddToCart(params);
}

export async function logPurchase(params: {
  transaction_id: string;
  value: number;
  currency?: string;
  items?: { item_id: string; item_name: string; quantity: number }[];
}) {
  await analytics().logPurchase({
    ...params,
    currency: params.currency ?? "INR",
  });
}

export async function logPurchaseFailed(params: {
  transaction_id: string;
  value: number;
  content_type: string;
  currency?: string;
}) {
  await analytics().logEvent("purchase_failed", {
    transaction_id: params.transaction_id,
    value: params.value,
    currency: params.currency ?? "INR",
    content_type: params.content_type,
  });
}
