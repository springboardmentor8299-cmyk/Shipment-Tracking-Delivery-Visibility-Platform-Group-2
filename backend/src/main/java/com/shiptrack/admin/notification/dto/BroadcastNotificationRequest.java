package com.shiptrack.admin.notification.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BroadcastNotificationRequest {

    // Target audience by whole role, e.g. ["CUSTOMER", "BUSINESS_CLIENT"].
    // Validated against ALLOWED_TARGET_ROLES in the service. Every user in
    // a listed role gets notified.
    private List<String> roles;

    // Specific recipients picked individually from the recipient picker
    // once a role checkbox is ticked (e.g. one customer's tracking ID
    // resolves to that customer's user id, or two named support agents).
    // Combines with `roles` — a user only needs to match one or the other,
    // and is only ever notified once either way.
    private List<Long> userIds;

    private String title;

    private String message;

    // One of NotificationType — optional, defaults to SYSTEM (the only
    // category that's never suppressed by a recipient's preferences, so
    // it's the safest default for an ad-hoc admin message).
    private String type;

    // Optional — lets the notification carry a tracking ID chip, same as
    // any other notification, if this broadcast relates to a shipment.
    private String trackingId;

}
