/**
 * Unified analytics — fires events to all providers (Firebase + Meta).
 * Import from here instead of individual provider files.
 */

import * as Firebase from "./firebaseAnalytics";
import * as Meta from "./metaEvents";

export function logSignUp(method: string = "phone") {
  Firebase.logSignUp(method);
  Meta.logCompleteRegistration({ registration_method: method });
}

export function logLogin(method: string = "phone") {
  Firebase.logLogin(method);
}

export function logGoalCreation(params?: {
  num_items?: number;
  content_type?: string;
  items?: { item_id: string; item_name: string; quantity: number }[];
}) {
  Firebase.logAddToCart({
    items: params?.items ?? [
      {
        item_id: "goal",
        item_name: params?.content_type ?? "goal",
        quantity: params?.num_items ?? 1,
      },
    ],
  });
  Meta.logGoalCreation({ num_items: params?.num_items, content_type: params?.content_type });
}

export function logPurchase(params: {
  transaction_id: string;
  value: number;
  currency?: string;
  items?: { item_id: string; item_name: string; quantity: number }[];
}) {
  Firebase.logPurchase(params);
  Meta.logPurchase(params.value, params.currency ?? "INR", {
    transaction_id: params.transaction_id,
  });
}

export function logPurchaseFailed(params: {
  transaction_id: string;
  value: number;
  content_type: string;
  currency?: string;
}) {
  Firebase.logPurchaseFailed(params);
}

export function logAddToNest(params: {
  child_name: string;
  date_of_birth: string;
}) {
  Firebase.logAddToNest(params);
  Meta.logAddToNest(params);
}

export function logKycInitiation() {
  Meta.logKycInitiation();
}

export function logKycCompletion() {
  Meta.logKycCompletion();
}

export function logAddPaymentInfo(params?: {
  payment_info_type?: "upi" | "bank";
}) {
  Meta.logAddPaymentInfo(params);
}

export function logCalculatorViewContent() {
  Meta.logCalculatorViewContent();
}

export function logStartKyc() {
  Firebase.logStartKyc();
  Meta.logStartKyc();
}

export function logBeginKycScreen() {
  Firebase.logBeginKycScreen();
  Meta.logBeginKycScreen();
}

export function logProceedWithCustomPlan(params: { sip_amount: number; lump_sum?: number; step_up?: number }) {
  Firebase.logProceedWithCustomPlan(params);
  Meta.logProceedWithCustomPlan(params);
}

export function logCustomPortfolioScreen() {
  Firebase.logCustomPortfolioScreen();
  Meta.logCustomPortfolioScreen();
}

export function logChooseCollege(params: { college: string }) {
  Firebase.logChooseCollege(params);
  Meta.logChooseCollege(params);
}

export function logChooseField(params: { field: string }) {
  Firebase.logChooseField(params);
  Meta.logChooseField(params);
}

export function logChooseGoalType(params: { goal_type: string }) {
  Firebase.logChooseGoalType(params);
  Meta.logChooseGoalType(params);
}

export function logStartPlanning(params: { child_id: string }) {
  Firebase.logStartPlanning(params);
  Meta.logStartPlanning(params);
}
