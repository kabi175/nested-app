package com.nested.app.events;

import com.nested.app.entity.Payment;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * Event published when a mandate redirect is received from the external provider. The event
 * listener will verify the actual mandate status via the MandateApiClient and update the payment's
 * sipStatus accordingly.
 */
public record MandateProcessEvent(
    Long mandateId, @NotNull Payment payment, LocalDateTime eventTime) {}
