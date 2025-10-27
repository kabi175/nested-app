package com.nested.app.events;

import com.nested.app.entity.Payment;
import java.time.LocalDateTime;

public record PaymentEvent(String ref, Payment.PaymentStatus status, LocalDateTime time) {}
