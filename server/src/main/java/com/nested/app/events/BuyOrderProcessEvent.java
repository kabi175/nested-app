package com.nested.app.events;

import java.time.LocalDateTime;

/**
 * Event published when a payment redirect is received from the external payment provider. The event
 * listener will verify the actual payment status via the PaymentsAPIClient and update the payment's
 * buyStatus accordingly.
 */
public record BuyOrderProcessEvent(String paymentRef, LocalDateTime eventTime) {}
