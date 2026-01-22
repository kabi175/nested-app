package com.nested.app.events;

import com.nested.app.entity.User;
import com.nested.app.enums.TransactionType;

/**
 * Event published when a transaction (BUY, SELL, or SIP) is successfully processed. Used to trigger
 * email notifications to users.
 */
public record TransactionSuccessEvent(
    User user, String fundName, Double amount, TransactionType type) {}
