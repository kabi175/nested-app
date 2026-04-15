/**
 * Meta (Facebook) Standard Events for app analytics.
 * Maps in-app actions to Meta Standard Events for ads optimization and reporting.
 *
 * Mapping:
 * - Sign-up → CompleteRegistration
 * - Calculator → ViewContent
 * - Goal creation → AddToCart
 * - KYC initiation → SubmitApplication
 * - KYC completion → InitiateCheckout
 * - Linking UPI ID / bank details → AddPaymentInfo
 * - Payment completion → Purchase
 * - Installs → tracked by default by Meta SDK
 */

import { AppEventsLogger } from "react-native-fbsdk-next";

// Fallback event names when native constants are not available (e.g. tests)
const FALLBACK_EVENTS = {
  CompleteRegistration: "fb_mobile_complete_registration",
  ViewContent: "fb_mobile_content_view",
  AddToCart: "fb_mobile_add_to_cart",
  SubmitApplication: "fb_mobile_submit_application",
  InitiateCheckout: "fb_mobile_initiated_checkout",
  AddPaymentInfo: "fb_mobile_add_payment_info",
  Purchase: "fb_mobile_purchase",
} as const;

function getEventName(
  key: keyof typeof FALLBACK_EVENTS
): string {
  const fromNative = (AppEventsLogger as any).AppEvents?.[key];
  return fromNative ?? FALLBACK_EVENTS[key];
}

/**
 * Sign-up completed (e.g. user finished registration / name input).
 */
export function logCompleteRegistration(params?: { registration_method?: string }) {
  AppEventsLogger.logEvent(getEventName("CompleteRegistration"), params as any);
}

/**
 * User viewed the Calculator (education cost estimator) content.
 */
export function logCalculatorViewContent() {
  AppEventsLogger.logEvent(getEventName("ViewContent"), {
    content_type: "calculator",
    content_name: "Education Cost Estimator",
  });
}

/**
 * User created a goal (AddToCart standard event).
 */
export function logGoalCreation(params?: { num_items?: number; content_type?: string }) {
  AppEventsLogger.logEvent(getEventName("AddToCart"), params as any);
}

/**
 * KYC application initiated (user started KYC flow).
 */
export function logKycInitiation() {
  AppEventsLogger.logEvent(getEventName("SubmitApplication"), {
    content_name: "KYC",
  });
}

/**
 * KYC completed successfully.
 */
export function logKycCompletion() {
  AppEventsLogger.logEvent(getEventName("InitiateCheckout"), {
    content_name: "KYC Completion",
  });
}

/**
 * User linked UPI ID or bank details (payment info added).
 */
export function logAddPaymentInfo(params?: { payment_info_type?: "upi" | "bank" }) {
  AppEventsLogger.logEvent(getEventName("AddPaymentInfo"), params as any);
}

/**
 * User added a child to the nest.
 */
export function logStartKyc() {
  AppEventsLogger.logEvent("start_kyc");
}

export function logBeginKycScreen() {
  AppEventsLogger.logEvent("begin_kyc_screen");
}

export function logProceedWithCustomPlan(params?: { sip_amount?: number; lump_sum?: number; step_up?: number }) {
  AppEventsLogger.logEvent("proceed_withCustomPlan", params as any);
}

export function logCustomPortfolioScreen() {
  AppEventsLogger.logEvent("custom_portfolio_screen");
}

export function logChooseCollege(params?: { college?: string }) {
  AppEventsLogger.logEvent("choose_college", params as any);
}

export function logChooseField(params?: { field?: string }) {
  AppEventsLogger.logEvent("choose_field", params as any);
}

export function logChooseGoalType(params?: { goal_type?: string }) {
  AppEventsLogger.logEvent("choose_goal_type", params as any);
}

export function logStartPlanning(params?: { child_id?: string }) {
  AppEventsLogger.logEvent("start_planning", params as any);
}

export function logAddToNest(params?: { child_name?: string; date_of_birth?: string }) {
  AppEventsLogger.logEvent("add_to_nest", params as any);
}

/**
 * Payment completed (purchase).
 */
export function logPurchase(
  purchaseAmount: number,
  currencyCode: string = "INR",
  params?: Record<string, string | number>
) {
  AppEventsLogger.logPurchase(purchaseAmount, currencyCode, params as any);
}
