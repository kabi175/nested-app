package com.nested.app.events;

import com.nested.app.entity.User;
import java.util.List;

/**
 * Event published when a SIP is successfully activated. Used to trigger the SIP activation
 * confirmation email to the user.
 */
public record SipActivatedEvent(
    User user,
    Double totalSipAmount,
    String goalOrChildName,
    List<String> fundNames) {}
