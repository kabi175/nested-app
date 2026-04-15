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

export async function logStartKyc() {
  await analytics().logEvent("start_kyc");
}

export async function logBeginKycScreen() {
  await analytics().logEvent("begin_kyc_screen");
}

export async function logProceedWithCustomPlan(params: { sip_amount: number; lump_sum?: number; step_up?: number }) {
  await analytics().logEvent("proceed_withCustomPlan", params);
}

export async function logCustomPortfolioScreen() {
  await analytics().logEvent("custom_portfolio_screen");
}

export async function logChooseCollege(params: { college: string }) {
  await analytics().logEvent("choose_college", params);
}

export async function logChooseField(params: { field: string }) {
  await analytics().logEvent("choose_field", params);
}

export async function logChooseGoalType(params: { goal_type: string }) {
  await analytics().logEvent("choose_goal_type", params);
}

export async function logStartPlanning(params: { child_id: string }) {
  await analytics().logEvent("start_planning", params);
}

export async function logAddToNest(params: {
  child_name: string;
  date_of_birth: string;
}) {
  await analytics().logEvent("add_to_nest", params);
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
